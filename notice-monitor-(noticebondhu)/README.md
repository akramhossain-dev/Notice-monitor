# Notice Monitor (NoticeBondhu - নোটিশবন্ধু) 🇧🇩

> **Automated Notice Scraper & Multi-Channel Alert Sentinel for Bangladeshi Students**  
> Automatically detects new notices on college, education board, and government websites, and pushes instant notifications to subscribers via **Telegram** and **Email**.

---

## 🌟 Features

- **Robotic Web Scraper**: Built with `cheerio` & `axios` with polite User-Agents, custom CSS selectors, automatic relative-to-absolute URL conversion, and rate limiting.
- **Diff & New Notice Isolation**: Detects genuine new circulars and avoids sending duplicate alerts or spamming baseline existing notices on initial runs.
- **Telegram Bot API**: Push notifications directly to students' Telegram mobile/desktop app with formatted HTML messages and direct PDF links.
- **Nodemailer SMTP**: Responsive HTML emails in Bangla and English containing official notice details and a secure 1-click unsubscribe link.
- **Admin Control Suite**:
  - Add / edit / delete monitored websites (name, URL, selector, 15m/1h/6h intervals, toggle).
  - Live scraper test trigger and immediate manual check.
  - "Simulate Notice" button to test Telegram and Email delivery pipeline end-to-end.
  - Comprehensive audit logs (scrape checks, duration, alert delivery logs, subscribers).
- **Bangla + English Support**: Default Bangla with instant toggle switch and Hind Siliguri typography.
- **Dark & Light Mode**: Auto-persisted theme.

---

## 📁 Project Architecture

```
├── /data                    # Persistent JSON store for websites, notices, and logs
├── /src
│   ├── /backend             # Backend services & scraper engine
│   │   ├── types.ts         # Data models (Website, Notice, Subscriber, Logs)
│   │   ├── db.ts            # Persistent database layer (Firestore compatible)
│   │   ├── seed.ts          # Seed data with Bangladeshi educational boards & universities
│   │   ├── scraper.ts       # Cheerio scraper with fallback & error handling
│   │   ├── scheduler.ts     # node-cron scheduler for periodic checks
│   │   ├── notifier.ts      # Telegram Bot API & Nodemailer email dispatcher
│   │   └── routes.ts        # Express REST API routes (/api/*)
│   ├── /frontend            # React frontend UI
│   │   ├── types.ts         # Frontend interfaces
│   │   ├── translations.ts  # Bangla (default) & English i18n
│   │   └── /components
│   │       ├── Navbar.tsx   # Header, branding, language & theme switches
│   │       ├── Hero.tsx     # Hero banner, stats pills, CTA
│   │       ├── HowItWorks.tsx # 4-step illustrated guide
│   │       ├── WebsiteDirectory.tsx # Supported websites catalog & category filter
│   │       ├── SubscribeView.tsx # Student subscription form & Telegram guide
│   │       ├── NoticesView.tsx # Searchable, paginated live notices feed
│   │       ├── AdminDashboard.tsx # Password-protected admin suite & test tools
│   │       ├── UnsubscribeView.tsx # 1-click unsubscribe handler
│   │       └── Footer.tsx   # Bangladeshi student sentinel credits & links
├── firebase-blueprint.json  # Firebase Firestore entity schema blueprint
├── firestore.rules          # Hardened Firestore security rules
├── server.ts                # Full-stack Express server (Vite middleware in dev)
├── package.json
└── README.md
```

---

## 🚀 Step-by-Step Setup Guide

### 1. How to Run Locally

1. **Clone the repository and install dependencies:**
   ```bash
   npm install
   ```

2. **Create your `.env` configuration file:**
   ```bash
   cp .env.example .env
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:3000`.

---

### 2. How to Create a Telegram Bot with @BotFather

To send instant Telegram notifications to students:

1. Open Telegram and search for [@BotFather](https://t.me/BotFather).
2. Send `/newbot` to start creating your bot.
3. Choose a friendly name (e.g. `NoticeBondhu Alerts`).
4. Choose a username ending in `bot` (e.g. `NoticeBondhu_bot`).
5. Copy the generated **HTTP API Token** (e.g., `7123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ`).
6. Paste the token into your `.env` file:
   ```env
   TELEGRAM_BOT_TOKEN="7123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
   ```
7. To find your own Telegram Chat ID for testing:
   - Search for [@userinfobot](https://t.me/userinfobot) on Telegram and send `/start`.
   - Copy the numerical ID (e.g., `123456789`).
   - Use this ID in the Admin Panel's **"Test Telegram Connection"** tool!

---

### 3. How to Set Up Gmail SMTP App Password

To send beautiful HTML email notifications via Gmail:

1. Go to your [Google Account Security Settings](https://myaccount.google.com/security).
2. Enable **2-Step Verification** if not already enabled.
3. Search for **"App passwords"** in the top search bar (or go to `Security` > `2-Step Verification` > `App passwords`).
4. Enter an app name (e.g., `NoticeBondhu`) and click **Create**.
5. Google will display a **16-character code** (e.g., `abcd efgh ijkl mnop`).
6. Add your credentials into `.env`:
   ```env
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT="587"
   SMTP_SECURE="false"
   SMTP_USER="your-email@gmail.com"
   SMTP_PASS="abcdefghijklmnop"
   SMTP_FROM="NoticeBondhu Alerts <your-email@gmail.com>"
   ```

*(Note: If SMTP is not configured, NoticeBondhu runs in simulation/audit mode without crashing, so you can test all features effortlessly).*

---

### 4. How to Connect Firebase Firestore

The project includes `firebase-blueprint.json` and `firestore.rules`.
To connect live Firebase:
1. Create a Firebase project in the [Firebase Console](https://console.firebase.google.com/).
2. Create a Cloud Firestore database in Native mode.
3. Add your Firebase credentials in `.env`:
   ```env
   FIREBASE_PROJECT_ID="your-project-id"
   FIREBASE_CLIENT_EMAIL="firebase-adminsdk@your-project-id.iam.gserviceaccount.com"
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
   ```
4. By default, NoticeBondhu includes a self-healing persistent file store (`data/db.json`), making it work out-of-the-box in any cloud or local environment.

---

### 5. How to Deploy to Render or Railway

#### Option A: Deploy on Render
1. Push your code to GitHub.
2. In [Render Dashboard](https://dashboard.render.com), click **New +** > **Web Service**.
3. Connect your repository.
4. Set the following settings:
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
5. In **Environment Variables**, add:
   - `NODE_ENV=production`
   - `PORT=3000`
   - `ADMIN_PASSWORD=your-secret-password`
   - `TELEGRAM_BOT_TOKEN=...`
   - `SMTP_USER=...`
   - `SMTP_PASS=...`
6. Click **Deploy Web Service**!

#### Option B: Deploy on Railway
1. Go to [Railway.app](https://railway.app) and create a **New Project**.
2. Select **Deploy from GitHub repo**.
3. Under service settings, add your Environment Variables (`ADMIN_PASSWORD`, `TELEGRAM_BOT_TOKEN`, `SMTP_USER`, `SMTP_PASS`).
4. Railway will automatically detect Node.js, run `npm run build`, and execute `npm start`.

---

## 🏫 Custom Website & Auto-Detect Engine

NoticeBondhu empowers any student or institution to add their college, university, or department website to the monitoring sentinel without needing to know HTML or CSS selectors.

### 1. Smart Heuristic Auto-Detection (`POST /api/websites/test`)
- **How it works**: Analyzes the page DOM tree using structural link heuristics (`table tr td a`, `li a`, repeating list containers), scores candidate selectors against notice keywords (`notice`, `circular`, `routine`, `result`, `নোটিশ`, `বিজ্ঞপ্তি`, `.pdf`), and discards navigational links (`header`, `nav`, `footer`).
- **Preview**: Displays the top 5 notices discovered (with titles and links) and reveals the inferred selector before saving.
- **Rate Limit**: Max 10 test requests per IP per hour.
- **SSRF Protection**: Strict host validation; loopback (`127.0.0.1`), link-local/cloud metadata (`169.254.169.254`), and private IPv4/IPv6 CIDR blocks are blocked.

### 2. User Submission & Auto-Subscription (`POST /api/websites/custom`)
- **Auto-Subscription**: The submitting user's email (and optional Telegram Chat ID) is automatically subscribed to their new custom portal.
- **Duplicate Prevention**: If the normalized URL is already monitored, the system avoids creating duplicates and seamlessly subscribes the user to the existing portal.
- **Baseline Run**: On the first check, existing notices are cataloged without sending spam alerts.
- **Quota**: Max 5 custom websites per email.
- **Admin Review Option**: Admin dashboard has a toggle to mandate admin approval for new custom websites before they appear publicly.

---

## 📡 REST API Reference

| Endpoint | Method | Access | Description |
|---|---|---|---|
| `/api/websites` | GET | Public | List all active monitored websites |
| `/api/websites/test` | POST | Public (Rate-limited) | Test & auto-detect notices from a URL |
| `/api/websites/custom` | POST | Public (Rate-limited) | Add a custom website & auto-subscribe |
| `/api/notices` | GET | Public | Search, filter, and paginate detected notices |
| `/api/subscribe` | POST | Public | Subscribe to notice alerts via email & Telegram |
| `/api/unsubscribe` | POST | Public | 1-click unsubscribe from alerts |
| `/api/stats` | GET | Public | Public monitor statistics |
| `/api/admin/login` | POST | Public | Authenticate admin password |
| `/api/admin/websites` | GET, POST | Admin | Manage monitored websites |
| `/api/admin/websites/:id` | PUT, DELETE | Admin | Update or remove website |
| `/api/admin/websites/:id/approve` | PUT | Admin | Approve pending custom website |
| `/api/admin/websites/:id/reject` | PUT | Admin | Disable / reject custom website |
| `/api/admin/settings` | GET, PUT | Admin | Toggle custom website approval mode |
| `/api/admin/scrape-all` | POST | Admin | Trigger immediate crawl across all sites |
| `/api/admin/simulate-notice` | POST | Admin | Trigger simulated notice to test alerts |
| `/api/admin/logs` | GET | Admin | View check logs and alert dispatch logs |
| `/api/admin/subscribers` | GET | Admin | View subscriber list |

---

## 🛡 Default Admin Password
- **Password:** `admin123` (configurable via `ADMIN_PASSWORD` in `.env`)
- Navigate to the **Admin Dashboard** tab to add new websites, test selectors, trigger manual scrape checks, and view live logs.
