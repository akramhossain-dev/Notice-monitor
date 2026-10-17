/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response, NextFunction } from 'express';
import { db } from './db.js';
import { scraper } from './scraper.js';
import { scheduler } from './scheduler.js';
import { notifier } from './notifier.js';
import { WebsiteCategory } from './types.js';

export const apiRouter = express.Router();
apiRouter.use(express.json());

// Password middleware for admin routes
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : (req.headers['x-admin-password'] as string);

  if (token && token === ADMIN_PASSWORD) {
    return next();
  }
  return res.status(401).json({ error: 'Unauthorized. Invalid admin password.' });
}

// Rate limiter store: Map<ip, timestamp[]>
const ipTestRateLimitMap = new Map<string, number[]>();

function checkIpTestRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour
  const limit = 10; // max 10 requests per hour

  let timestamps = ipTestRateLimitMap.get(ip) || [];
  timestamps = timestamps.filter(t => now - t < windowMs);

  if (timestamps.length >= limit) {
    ipTestRateLimitMap.set(ip, timestamps);
    return false;
  }

  timestamps.push(now);
  ipTestRateLimitMap.set(ip, timestamps);
  return true;
}

// SSRF URL validator
function validateSafeUrl(rawUrl: string): { valid: boolean; error?: string; url?: string } {
  try {
    const parsed = new URL(rawUrl.trim());
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { valid: false, error: 'শুধুমাত্র http এবং https প্রোটোকল অনুমোদিত (Only http and https are allowed)' };
    }

    const host = parsed.hostname.toLowerCase();

    // Block localhost, local domains, metadata endpoints
    if (
      host === 'localhost' ||
      host.endsWith('.localhost') ||
      host.endsWith('.local') ||
      host.endsWith('.internal') ||
      host === 'metadata.google.internal' ||
      host === '0.0.0.0'
    ) {
      return { valid: false, error: 'লোকালহোস্ট বা প্রাইভেট ডোমেইন অনুমোদিত নয় (Private/local domains blocked for SSRF protection)' };
    }

    // Check IPv4 private ranges
    const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const match = host.match(ipv4Regex);
    if (match) {
      const b0 = parseInt(match[1], 10);
      const b1 = parseInt(match[2], 10);

      // 127.0.0.0/8
      if (b0 === 127) return { valid: false, error: 'Loopback IP block (127.x.x.x) is not allowed' };
      // 10.0.0.0/8
      if (b0 === 10) return { valid: false, error: 'Private IP block (10.x.x.x) is not allowed' };
      // 172.16.0.0/12 (172.16 - 172.31)
      if (b0 === 172 && b1 >= 16 && b1 <= 31) return { valid: false, error: 'Private IP block (172.16-31.x.x) is not allowed' };
      // 192.168.0.0/16
      if (b0 === 192 && b1 === 168) return { valid: false, error: 'Private IP block (192.168.x.x) is not allowed' };
      // 169.254.0.0/16 (Link-local/Cloud Metadata)
      if (b0 === 169 && b1 === 254) return { valid: false, error: 'Link-local/Metadata IP is not allowed' };
      // 0.0.0.0/8
      if (b0 === 0) return { valid: false, error: 'Invalid IP address' };
    }

    // Check IPv6 loopback and unique local
    if (host.includes(':') || host.startsWith('[')) {
      const cleanIpv6 = host.replace(/^\[|\]$/g, '');
      if (cleanIpv6 === '::1' || cleanIpv6 === '::' || cleanIpv6.startsWith('fc') || cleanIpv6.startsWith('fd') || cleanIpv6.startsWith('fe80')) {
        return { valid: false, error: 'Private or loopback IPv6 addresses are not permitted' };
      }
    }

    return { valid: true, url: parsed.href };
  } catch {
    return { valid: false, error: 'সঠিক URL ফরম্যাট প্রদান করুন (Invalid URL format)' };
  }
}

// -----------------------------------------------------------------------------
// PUBLIC ROUTES
// -----------------------------------------------------------------------------

/**
 * Health check
 */
apiRouter.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.1.0',
    stats: db.getStats()
  });
});

/**
 * Public System Stats
 */
apiRouter.get('/stats', (_req, res) => {
  res.json(db.getStats());
});

/**
 * List supported websites for subscription and directory
 */
apiRouter.get('/websites', (req, res) => {
  const category = req.query.category as string;
  let websites = db.getWebsites(false); // only enabled and approved for public

  if (category && category !== 'all') {
    websites = websites.filter(w => w.category === category);
  }

  // Hide selector from public view
  const sanitized = websites.map(({ selector, ...rest }) => rest);
  res.json(sanitized);
});

/**
 * Auto-detect and test a website before adding (public endpoint with rate limiting)
 */
apiRouter.post('/websites/test', async (req, res) => {
  try {
    const rawIp = req.headers['x-forwarded-for']?.toString().split(',')[0].trim() || req.socket.remoteAddress || 'unknown';
    if (!checkIpTestRateLimit(rawIp)) {
      return res.status(429).json({
        error: 'ঘণ্টায় সর্বোচ্চ ১০ বার টেস্ট রিকোয়েস্ট করা যাবে। কিছুক্ষণ পর আবার চেষ্টা করুন। (Rate limit exceeded: max 10 tests/hr)'
      });
    }

    const { url, selector, isJsHeavy } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'ওয়েবসাইটের URL দিন (URL is required)' });
    }

    const safe = validateSafeUrl(url);
    if (!safe.valid) {
      return res.status(400).json({ error: safe.error });
    }

    const result = await scraper.autoDetectNotices(safe.url!, selector, !!isJsHeavy);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Auto-detection failed' });
  }
});

/**
 * Add a custom website to monitor with auto-subscription and rate limits
 */
apiRouter.post('/websites/custom', async (req, res) => {
  try {
    const { name, nameBn, url, category, intervalMinutes, email, telegramChatId, selector, isJsHeavy } = req.body;

    if (!name || !url || !email) {
      return res.status(400).json({ error: 'নাম, নোটিশ পেজের URL এবং ইমেইল বাধ্যতামূলক (Name, URL, and Email are required)' });
    }

    if (!email.includes('@')) {
      return res.status(400).json({ error: 'সঠিক ইমেইল ঠিকানা দিন (Valid email is required)' });
    }

    const safe = validateSafeUrl(url);
    if (!safe.valid) {
      return res.status(400).json({ error: safe.error });
    }

    // Rate limit: max 5 custom websites per email
    const customCount = db.getCustomWebsitesCountByEmail(email);
    if (customCount >= 5) {
      return res.status(400).json({
        error: 'একটি ইমেইল থেকে সর্বোচ্চ ৫টি কাস্টম ওয়েবসাইট যোগ করা যাবে। (Max 5 custom websites allowed per email)'
      });
    }

    // Duplicate check: normalize URL
    const existingSite = db.getWebsiteByUrl(safe.url!);
    if (existingSite) {
      // Auto-subscribe user to existing website
      db.subscribe({
        name: name || 'শিক্ষার্থী',
        email,
        telegramChatId,
        websiteIds: [existingSite.id]
      });

      return res.json({
        success: true,
        isExisting: true,
        message: 'এই ওয়েবসাইটটি ইতোমধ্যে মনিটর করা হচ্ছে! আপনাকে স্বয়ংক্রিয়ভাবে এতে সাবস্ক্রাইব করা হয়েছে।',
        website: existingSite
      });
    }

    // Determine selector: use provided, or run quick auto-detect
    let finalSelector = selector?.trim();
    if (!finalSelector) {
      const autoRes = await scraper.autoDetectNotices(safe.url!, undefined, !!isJsHeavy);
      finalSelector = autoRes.selector || 'table tr td a, .notices a, a[href*="notice"]';
    }

    const newSite = db.addWebsite({
      name: name.trim(),
      nameBn: nameBn?.trim() || name.trim(),
      url: safe.url!,
      selector: finalSelector,
      category: (category as WebsiteCategory) || 'college',
      intervalMinutes: Number(intervalMinutes) || 60,
      enabled: true,
      isJsHeavy: !!isJsHeavy,
      isCustom: true,
      creatorEmail: email.trim().toLowerCase(),
      creatorTelegramChatId: telegramChatId?.trim() || undefined,
      totalNoticesFound: 0
    });

    // Auto-subscribe the user
    db.subscribe({
      name: name.trim(),
      email: email.trim(),
      telegramChatId: telegramChatId?.trim() || undefined,
      websiteIds: [newSite.id]
    });

    // Trigger initial baseline check without sending alerts
    scraper.scrapeWebsite(newSite).catch(err => {
      console.warn('[Routes] Initial scrape error for custom website:', err);
    });

    const isPending = newSite.approvalStatus === 'pending';
    return res.status(201).json({
      success: true,
      isExisting: false,
      message: isPending
        ? 'আপনার কাস্টম ওয়েবসাইটটি সফলভাবে জমা দেওয়া হয়েছে! এডমিন পর্যালোচনার পর সক্রিয় হবে।'
        : 'আপনার ওয়েবসাইটটি সফলভাবে যোগ করা হয়েছে এবং আপনি এতে সাবস্ক্রাইব হয়েছেন!',
      website: newSite
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to add custom website' });
  }
});

/**
 * List notices with search, website filter, category filter, pagination
 */
apiRouter.get('/notices', (req, res) => {
  const websiteId = req.query.websiteId as string;
  const category = req.query.category as string;
  const search = req.query.search as string;
  const page = Number(req.query.page) || 1;
  const limit = Math.min(Number(req.query.limit) || 10, 50);

  const result = db.getNotices({
    websiteId,
    category,
    search,
    page,
    limit
  });

  res.json(result);
});

/**
 * Subscribe student to notifications
 */
apiRouter.post('/subscribe', async (req, res) => {
  try {
    const { name, email, telegramChatId, websiteIds } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'সঠিক ইমেইল ঠিকানা দিন (Valid email is required)' });
    }

    if (!Array.isArray(websiteIds) || websiteIds.length === 0) {
      return res.status(400).json({ error: 'অন্তত একটি ওয়েবসাইট নির্বাচন করুন (Select at least one website)' });
    }

    const { subscriber, subscribedCount, isNew } = db.subscribe({
      name: name || 'শিক্ষার্থী',
      email,
      telegramChatId,
      websiteIds
    });

    // Send a welcome alert / confirmation if telegram ID is given
    if (telegramChatId) {
      notifier.testTelegram(telegramChatId).catch(err => {
        console.warn('[Routes] Welcome telegram ping notice:', err);
      });
    }

    res.json({
      success: true,
      message: isNew
        ? 'সফলভাবে সাবস্ক্রাইব করা হয়েছে! নতুন নোটিশ প্রকাশিত হলে নোটিফিকেশন পাবেন।'
        : 'আপনার সাবস্ক্রিপশন সফলভাবে আপডেট করা হয়েছে।',
      subscriber: {
        id: subscriber.id,
        name: subscriber.name,
        email: subscriber.email,
        telegramChatId: subscriber.telegramChatId
      },
      subscribedCount
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Subscription failed' });
  }
});

/**
 * Unsubscribe student
 */
apiRouter.post('/unsubscribe', (req, res) => {
  const { email, token, websiteId } = req.body;
  const identifier = token || email;

  if (!identifier) {
    return res.status(400).json({ error: 'Email or token is required to unsubscribe' });
  }

  const result = db.unsubscribe(identifier, websiteId);
  if (!result.success) {
    return res.status(404).json({ error: result.message });
  }

  res.json({ success: true, message: result.message });
});

// -----------------------------------------------------------------------------
// ADMIN ROUTES (Protected)
// -----------------------------------------------------------------------------

/**
 * Admin Login
 */
apiRouter.post('/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    return res.json({ success: true, token: ADMIN_PASSWORD });
  }
  return res.status(401).json({ error: 'ভুল এডমিন পাসওয়ার্ড (Incorrect admin password)' });
});

/**
 * Get all websites with full details (selectors, error state)
 */
apiRouter.get('/admin/websites', requireAdmin, (_req, res) => {
  res.json(db.getWebsites(true));
});

/**
 * Add a new website to monitor
 */
apiRouter.post('/admin/websites', requireAdmin, async (req, res) => {
  try {
    const { name, nameBn, url, selector, category, intervalMinutes, enabled, isJsHeavy } = req.body;

    if (!name || !url || !selector) {
      return res.status(400).json({ error: 'Name, URL, and CSS Selector are required' });
    }

    const newSite = db.addWebsite({
      name,
      nameBn: nameBn || name,
      url,
      selector,
      category: (category as WebsiteCategory) || 'board',
      intervalMinutes: Number(intervalMinutes) || 60,
      enabled: enabled !== false,
      isJsHeavy: !!isJsHeavy,
      totalNoticesFound: 0
    });

    // Trigger an initial baseline check automatically in background
    scraper.scrapeWebsite(newSite).catch(err => {
      console.warn('[Routes] Initial scrape error for new website:', err);
    });

    res.status(201).json({ success: true, website: newSite });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Update an existing website
 */
apiRouter.put('/admin/websites/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const updated = db.updateWebsite(id, req.body);

  if (!updated) {
    return res.status(404).json({ error: 'Website not found' });
  }

  res.json({ success: true, website: updated });
});

/**
 * Get admin system settings
 */
apiRouter.get('/admin/settings', requireAdmin, (_req, res) => {
  res.json(db.getSettings());
});

/**
 * Update admin system settings
 */
apiRouter.put('/admin/settings', requireAdmin, (req, res) => {
  const updated = db.updateSettings(req.body);
  res.json({ success: true, settings: updated });
});

/**
 * Approve a pending custom website
 */
apiRouter.put('/admin/websites/:id/approve', requireAdmin, (req, res) => {
  const { id } = req.params;
  const updated = db.updateWebsite(id, { approvalStatus: 'approved', enabled: true });
  if (!updated) {
    return res.status(404).json({ error: 'Website not found' });
  }
  res.json({ success: true, website: updated });
});

/**
 * Reject / disable a custom website
 */
apiRouter.put('/admin/websites/:id/reject', requireAdmin, (req, res) => {
  const { id } = req.params;
  const updated = db.updateWebsite(id, { approvalStatus: 'rejected', enabled: false });
  if (!updated) {
    return res.status(404).json({ error: 'Website not found' });
  }
  res.json({ success: true, website: updated });
});

/**
 * Delete a website
 */
apiRouter.delete('/admin/websites/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const deleted = db.deleteWebsite(id);

  if (!deleted) {
    return res.status(404).json({ error: 'Website not found' });
  }

  res.json({ success: true, message: 'Website removed from monitor' });
});

/**
 * Manually trigger scraper for a specific website
 */
apiRouter.post('/admin/websites/:id/check', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await scheduler.triggerManual(id);
    res.json({ success: true, result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Manually trigger scraper for all active websites
 */
apiRouter.post('/admin/scrape-all', requireAdmin, async (_req, res) => {
  try {
    const results = await scheduler.triggerManual();
    res.json({ success: true, results });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Simulate a new notice for quick alert pipeline testing
 */
apiRouter.post('/admin/simulate-notice', requireAdmin, async (req, res) => {
  try {
    const { websiteId, title, link } = req.body;
    const website = db.getWebsiteById(websiteId);

    if (!website) {
      return res.status(404).json({ error: 'Website not found' });
    }

    const sampleTitle = title || `[টেস্ট জরুরি নোটিশ] ${website.nameBn} জরুরি বিজ্ঞপ্তি ${new Date().toLocaleTimeString('bn-BD')}`;
    const sampleLink = link || `${website.url}notice-sample-${Date.now()}.pdf`;

    const notice = db.addNotice({
      websiteId: website.id,
      websiteName: website.name,
      websiteNameBn: website.nameBn,
      title: sampleTitle,
      link: sampleLink,
      publishDate: new Date().toLocaleDateString('bn-BD'),
      isInitialRun: false,
      category: website.category
    });

    // Dispatch alerts to subscribers of this website
    const subscribers = db.getSubscribersForWebsite(website.id);
    await notifier.dispatchAlerts(notice, subscribers);

    res.json({
      success: true,
      message: `Simulated notice created and alerts dispatched to ${subscribers.length} subscriber(s)`,
      notice,
      subscribersCount: subscribers.length
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get check logs & alert logs
 */
apiRouter.get('/admin/logs', requireAdmin, (_req, res) => {
  res.json({
    checkLogs: db.getCheckLogs(50),
    alertLogs: db.getAlertLogs(50)
  });
});

/**
 * Get subscribers list
 */
apiRouter.get('/admin/subscribers', requireAdmin, (_req, res) => {
  res.json(db.getSubscribers());
});

/**
 * Test Telegram bot connection
 */
apiRouter.post('/admin/test-telegram', requireAdmin, async (req, res) => {
  const { chatId } = req.body;
  if (!chatId) {
    return res.status(400).json({ error: 'Telegram Chat ID is required' });
  }

  const result = await notifier.testTelegram(chatId);
  res.json(result);
});

// -----------------------------------------------------------------------------
// TEST FIXTURES / MOCK ENDPOINTS (For reliable offline/geo-blocked testing)
// -----------------------------------------------------------------------------
apiRouter.get('/mock-sites/:siteId', (req, res) => {
  const { siteId } = req.params;
  const timestamp = new Date().toLocaleDateString('bn-BD');

  const html = `
    <!DOCTYPE html>
    <html lang="bn">
    <head><meta charset="utf-8"><title>Mock Education Portal</title></head>
    <body>
      <div class="header"><h1>বাংলাদেশ শিক্ষা ও পরীক্ষা পোর্টাল</h1></div>
      <div id="noticelist" class="notices">
        <h2>সর্বশেষ নোটিশসমূহ</h2>
        <table class="table">
          <thead><tr><th>তারিখ</th><th>শিরোনাম</th><th>ডাউনলোড</th></tr></thead>
          <tbody>
            <tr>
              <td>${timestamp}</td>
              <td><a href="/mock-files/form-fillup-notice-2026.pdf">২০২৬ সালের চূড়ান্ত পরীক্ষার অনলাইন ফরম পূরণ ও ফি জমাদান সংক্রান্ত বিজ্ঞপ্তি</a></td>
              <td>PDF</td>
            </tr>
            <tr>
              <td>১৫ অক্টোবর ২০২৬</td>
              <td><a href="/mock-files/registration-correction-2026.pdf">রেজিস্ট্রেশন কার্ডের ভুল সংশোধন ও শাখা পরিবর্তনের সময়সীমা বৃদ্ধি</a></td>
              <td>PDF</td>
            </tr>
            <tr>
              <td>১৪ অক্টোবর ২০২৬</td>
              <td><a href="/mock-files/scholarship-notice-2026.pdf">মেধাবৃত্তি ও সাধারণ বৃত্তিপ্রাপ্ত শিক্ষার্থীদের তালিকা ও নীতিমালা</a></td>
              <td>PDF</td>
            </tr>
          </tbody>
        </table>
      </div>
    </body>
    </html>
  `;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
});
