/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import nodemailer, { Transporter } from 'nodemailer';
import axios from 'axios';
import { Notice, Subscriber } from './types.js';
import { db } from './db.js';

export class NotifierService {
  private transporter: Transporter | null = null;
  private botToken: string;
  private appUrl: string;

  constructor() {
    this.botToken = process.env.TELEGRAM_BOT_TOKEN || '';
    this.appUrl = process.env.APP_URL || 'http://localhost:3000';
    this.initTransporter();
  }

  private initTransporter() {
    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const port = Number(process.env.SMTP_PORT) || 587;
    const secure = process.env.SMTP_SECURE === 'true';

    if (host && user && pass) {
      try {
        this.transporter = nodemailer.createTransport({
          host,
          port,
          secure,
          auth: { user, pass },
          tls: {
            rejectUnauthorized: false
          }
        });
        console.log('[Notifier] SMTP Transporter configured for', user);
      } catch (err) {
        console.error('[Notifier] Failed to create SMTP transporter:', err);
        this.transporter = null;
      }
    } else {
      console.log('[Notifier] SMTP credentials not fully provided; emails will run in simulation/log mode.');
    }
  }

  /**
   * Dispatch notice alerts to all subscribed users via Telegram and Email
   */
  public async dispatchAlerts(notice: Notice, subscribers: Subscriber[]) {
    for (const sub of subscribers) {
      if (!sub.isActive) continue;

      // 1. Telegram Alert
      if (sub.telegramChatId) {
        await this.sendTelegramAlert(sub, notice);
      }

      // 2. Email Alert
      if (sub.email) {
        await this.sendEmailAlert(sub, notice);
      }

      // Subtle pause between dispatches to avoid Telegram/SMTP rate limits
      await new Promise(r => setTimeout(r, 200));
    }
  }

  /**
   * Send Telegram notification using Telegram Bot API
   */
  public async sendTelegramAlert(
    subscriber: Subscriber,
    notice: Notice
  ): Promise<{ success: boolean; simulated?: boolean; error?: string }> {
    const botToken = process.env.TELEGRAM_BOT_TOKEN || this.botToken;
    const chatId = subscriber.telegramChatId;

    if (!chatId) {
      return { success: false, error: 'No Telegram Chat ID' };
    }

    const messageHtml = [
      `🔔 <b>নতুন নোটিশ প্রকাশিত হয়েছে!</b>`,
      ``,
      `🏛 <b>প্রতিষ্ঠান:</b> ${notice.websiteNameBn || notice.websiteName}`,
      `📌 <b>শিরোনাম:</b> ${notice.title}`,
      notice.publishDate ? `📅 <b>তারিখ:</b> ${notice.publishDate}` : '',
      ``,
      `🔗 <a href="${notice.link}">👉 মূল নোটিশ / PDF দেখতে এখানে ক্লিক করুন</a>`,
      ``,
      `━━━━━━━━━━━━━━━━━━`,
      `🤖 <i>নোটিশবন্ধু (NoticeBondhu) - স্বয়ংক্রিয় শিক্ষা ও চাকরি নোটিশ অ্যালার্ট</i>`,
      `🌐 ${this.appUrl}`
    ]
      .filter(line => line !== '')
      .join('\n');

    if (!botToken || botToken.trim() === '' || botToken.includes('YOUR_')) {
      // Simulation mode
      console.log(`[Notifier:Telegram:Simulated] To: ${chatId} | Notice: ${notice.title}`);
      db.addAlertLog({
        subscriberId: subscriber.id,
        subscriberEmail: subscriber.email,
        telegramChatId: chatId,
        noticeId: notice.id,
        noticeTitle: notice.title,
        websiteName: notice.websiteName,
        channel: 'telegram',
        status: 'simulated'
      });
      return { success: true, simulated: true };
    }

    try {
      const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
      const response = await axios.post(
        url,
        {
          chat_id: chatId,
          text: messageHtml,
          parse_mode: 'HTML',
          disable_web_page_preview: false
        },
        { timeout: 8000 }
      );

      if (response.data && response.data.ok) {
        db.addAlertLog({
          subscriberId: subscriber.id,
          subscriberEmail: subscriber.email,
          telegramChatId: chatId,
          noticeId: notice.id,
          noticeTitle: notice.title,
          websiteName: notice.websiteName,
          channel: 'telegram',
          status: 'sent'
        });
        return { success: true };
      } else {
        throw new Error(response.data?.description || 'Telegram API returned non-ok status');
      }
    } catch (err: any) {
      const errMsg = err?.response?.data?.description || err?.message || 'Telegram dispatch failed';
      console.error(`[Notifier:Telegram:Error] ${errMsg}`);
      db.addAlertLog({
        subscriberId: subscriber.id,
        subscriberEmail: subscriber.email,
        telegramChatId: chatId,
        noticeId: notice.id,
        noticeTitle: notice.title,
        websiteName: notice.websiteName,
        channel: 'telegram',
        status: 'failed',
        error: errMsg
      });
      return { success: false, error: errMsg };
    }
  }

  /**
   * Send email alert using Nodemailer with responsive HTML template and unsubscribe link
   */
  public async sendEmailAlert(
    subscriber: Subscriber,
    notice: Notice
  ): Promise<{ success: boolean; simulated?: boolean; error?: string }> {
    const fromAddress = process.env.SMTP_FROM || 'NoticeBondhu Alerts <alerts@noticebondhu.edu.bd>';
    const unsubUrl = `${this.appUrl}?view=unsubscribe&token=${subscriber.unsubToken}&email=${encodeURIComponent(
      subscriber.email
    )}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f9; margin: 0; padding: 20px; color: #1e293b; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
          .header { background: linear-gradient(135deg, #0f766e, #0369a1); color: #ffffff; padding: 24px; text-align: center; }
          .header h1 { margin: 0; font-size: 22px; font-weight: 700; }
          .badge { display: inline-block; background: #fef08a; color: #854d0e; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-top: 8px; }
          .content { padding: 28px; }
          .notice-box { background: #f8fafc; border-left: 4px solid #0f766e; padding: 18px; border-radius: 6px; margin: 20px 0; }
          .notice-title { font-size: 17px; font-weight: 600; color: #0f172a; line-height: 1.5; margin-bottom: 8px; }
          .notice-meta { font-size: 13px; color: #64748b; }
          .btn { display: inline-block; background: #0f766e; color: #ffffff !important; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; margin-top: 15px; }
          .footer { background: #f1f5f9; padding: 18px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
          .footer a { color: #0284c7; text-decoration: underline; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📢 নতুন নোটিশ প্রকাশ</h1>
            <div class="badge">নোটিশবন্ধু (NoticeBondhu) সতর্কবার্তা</div>
          </div>
          <div class="content">
            <p>প্রিয় <strong>${subscriber.name || 'শিক্ষার্থী'}</strong>,</p>
            <p>আপনার সাবস্ক্রাইব করা প্রতিষ্ঠান থেকে একটি নতুন নোটিশ প্রকাশিত হয়েছে:</p>
            
            <div class="notice-box">
              <div class="notice-meta">🏛 <strong>${notice.websiteNameBn || notice.websiteName}</strong></div>
              <div class="notice-title">${notice.title}</div>
              ${notice.publishDate ? `<div class="notice-meta">📅 প্রকাশের তারিখ: ${notice.publishDate}</div>` : ''}
              
              <div style="margin-top: 14px;">
                <a href="${notice.link}" class="btn" target="_blank">মূল নোটিশ / PDF দেখুন ➔</a>
              </div>
            </div>
            
            <p style="font-size: 13px; color: #475569; margin-top: 20px;">
              জরুরি প্রয়োজনে বন্ধুদের সাথে নোটিশটি শেয়ার করতে পারেন।
            </p>
          </div>
          <div class="footer">
            <p>আপনি NoticeBondhu এ নোটিশ অ্যালার্টের জন্য সাবস্ক্রাইব করেছিলেন।</p>
            <p><a href="${unsubUrl}">আনসাবস্ক্রাইব করতে এখানে ক্লিক করুন (Unsubscribe)</a></p>
            <p>© ${new Date().getFullYear()} NoticeBondhu - Bangladesh Academic Notice Monitor</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Check if transporter is available
    if (!this.transporter) {
      console.log(`[Notifier:Email:Simulated] To: ${subscriber.email} | Notice: ${notice.title}`);
      db.addAlertLog({
        subscriberId: subscriber.id,
        subscriberEmail: subscriber.email,
        noticeId: notice.id,
        noticeTitle: notice.title,
        websiteName: notice.websiteName,
        channel: 'email',
        status: 'simulated'
      });
      return { success: true, simulated: true };
    }

    try {
      await this.transporter.sendMail({
        from: fromAddress,
        to: subscriber.email,
        subject: `[নতুন নোটিশ] ${notice.websiteNameBn || notice.websiteName}: ${notice.title.substring(0, 60)}...`,
        html: htmlContent
      });

      db.addAlertLog({
        subscriberId: subscriber.id,
        subscriberEmail: subscriber.email,
        noticeId: notice.id,
        noticeTitle: notice.title,
        websiteName: notice.websiteName,
        channel: 'email',
        status: 'sent'
      });
      return { success: true };
    } catch (err: any) {
      const errMsg = err?.message || 'SMTP dispatch error';
      console.error(`[Notifier:Email:Error] ${errMsg}`);
      db.addAlertLog({
        subscriberId: subscriber.id,
        subscriberEmail: subscriber.email,
        noticeId: notice.id,
        noticeTitle: notice.title,
        websiteName: notice.websiteName,
        channel: 'email',
        status: 'failed',
        error: errMsg
      });
      return { success: false, error: errMsg };
    }
  }

  /**
   * Helper for testing Telegram bot setup directly from the Admin panel
   */
  public async testTelegram(chatId: string): Promise<{ success: boolean; message: string }> {
    const testSub: Subscriber = {
      id: 'test-user',
      name: 'এডমিন পরীক্ষক (Admin Tester)',
      email: 'admin@test.com',
      telegramChatId: chatId,
      isActive: true,
      createdAt: new Date().toISOString(),
      unsubToken: 'test'
    };

    const testNotice: Notice = {
      id: 'test-notice-001',
      websiteId: 'test-site',
      websiteName: 'NoticeBondhu Test Gateway',
      websiteNameBn: 'নোটিশবন্ধু টেস্ট গেটওয়ে',
      title: 'টেলিগ্রাম নোটিফিকেশন সিস্টেম সফলভাবে সংযুক্ত হয়েছে! (Test Alert)',
      link: this.appUrl,
      detectedAt: new Date().toISOString(),
      publishDate: new Date().toLocaleDateString('bn-BD'),
      category: 'board'
    };

    const res = await this.sendTelegramAlert(testSub, testNotice);
    if (res.success && !res.simulated) {
      return { success: true, message: 'Telegram alert delivered successfully to Chat ID ' + chatId };
    } else if (res.simulated) {
      return {
        success: true,
        message: 'Bot token not set in .env; test logged in simulation mode successfully.'
      };
    } else {
      return { success: false, message: res.error || 'Failed to send Telegram message' };
    }
  }
}

export const notifier = new NotifierService();
