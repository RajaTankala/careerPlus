# 🚀 CareerPulse Pro — Personal Career Growth, Work Status & Reading Hub

A modern, high-performance web application built with **Angular 20 (Standalone Architecture & Reactive Signals)** designed to accelerate your engineering career. 

Track your daily work deliverables, generate executive status reports and promotion appraisals, schedule monthly technical reading topics with automated deadline reminders, and nurture your professional network with circle birthday notifications.

**All your data is saved directly in your browser's LocalStorage** — zero backend required, private, offline-capable, with instant JSON backup/restore.

---

## ✨ Core Features

### 1. 💼 Daily Work Status & Achievement Tracker
- **Log Daily Deliverables:** Project name, title, category (`Architecture`, `Feature`, `Bugfix`, `DevOps`, `Code Review`, `Research`, `Documentation`), status (`Completed`, `In Progress`, `Blocked`, `Planned`), and focus hours.
- **Brag-Worthy Impact Tagging:** Tag standout engineering contributions as `★ Brag Worthy` or `⚡ High Impact` so you never forget your wins during annual performance appraisal season.
- **Deliverables & Blockers:** Add structured highlight bullets and track external blockers or cross-team dependencies.
- **Rich Filters & Search:** Filter by date preset (Today, This Week, This Month, All Time), status, impact, and instant keyword search.

### 2. 📄 Executive Status Document Generator
- **Multiple Executive Report Templates:**
  - ⚡ **Daily Standup Report:** What was completed, today's priorities, and active blockers (optimized for Slack/Teams/Email).
  - 📊 **Weekly Sprint Report:** Executive summary, deliverable metrics, hours, and next week's roadmap.
  - 🌟 **Monthly Career & Brag Document:** Impact wins, project highlights, technical leadership, and literature synthesized.
  - 🎯 **Performance Appraisal & Promotion Review:** Formal self-appraisal document detailing business value, KPIs, and competencies.
- **Export Formats:**
  - 🖨️ **Print / Save as PDF:** Custom `@media print` layout without navigation clutter.
  - 📄 **Download as Word Document (`.doc`):** Corporate-styled document compatible with Microsoft Word and Google Docs.
  - 📥 **Download as Markdown (`.md`):** Formatted GitHub-flavored markdown.
  - 📋 **Copy to Clipboard:** 1-click formatted text ready to paste.

### 3. 📚 Monthly Reading & Learning Roadmap
- **Monthly Scheduling:** Organize reading targets by month (e.g., October 2026: *Distributed Consensus & Raft*, November 2026: *Distributed Caching & Redis*, December 2026: *Kubernetes Operators*).
- **Interactive Checklist:** Attach books, whitepapers, RFCs, and articles. Checking off resources automatically recalculates the topic's completion percentage in real time.
- **Automated Deadline Reminders:** Banner and notification center alerts when topics are due or overdue.
- **Architecture Notes & Takeaways:** Capture key design principles and takeaways directly on each topic card.

### 4. 🎂 Circle Birthdays & Relationship Network
- **Professional Network Hub:** Track birthdays for colleagues, managers, mentors, and close friends.
- **Automated Countdowns:** Real-time countdowns (`Today! 🎉`, `Tomorrow! 🎂`, `In 4 days`, `Next month`) with notification badges.
- **Personalized Wish Generator:** 1-click generation of customized birthday greetings tailored for *Professional & Warm*, *Mentorship Appreciation*, or *Casual & Celebratory*, with quick WhatsApp/Email links and clipboard copy.
- **Annual Wish Tracking:** Check off whether you have already wished someone this year.

### 5. 🎯 Career Milestones & Dynamic Skills Competency Matrix
- **Career OKRs:** Track target milestones (e.g. *Staff Software Engineer Promotion*, *AWS Solutions Architect Certification*).
- **Live Competency Matrix:** Automatically aggregates technical skills from all your daily work logs and reading topics to showcase your most practiced technologies.

### 6. 📊 Excel (.xlsx) Workbooks & Reports
- **Multi-Sheet Master Export:** Export 5 dedicated worksheets in a single `.xlsx` file:
  - 1. Work Tracker (Projects, Categories, Status, Hours, Brag Tags)
  - 2. Reading Roadmap (Topics, Deadlines, Resource checklists)
  - 3. Circle Birthdays (Contacts, Roles, Countdown days, Wished status)
  - 4. Career Milestones (OKRs, Progress)
  - 5. System Analytics (Summary stats & metadata)
- **Filtered Work Log Export:** Export customized work logs directly from the Work Tracker.

### 7. ☁️ Multi-Device Cloud Sync & Local Persistence
- **Browser LocalStorage Persistence:** Automatically saves every change instantly with live visual confirmation.
- **GitHub Gist Cloud Sync:** Access your real data from any device, laptop, or phone when hosted on GitHub Pages by linking a private GitHub Gist with a Personal Access Token (`gist` scope).
- **One-Click JSON Backup & Restore:** Download or restore a full `.json` backup file anytime.

---

## 🛠️ Technology Stack
- **Framework:** Angular 20 (Standalone Components, Signals, Reactive Computations)
- **Styling:** Modern Vanilla CSS Design System with Glassmorphism, CSS Custom Properties, and responsive cards
- **Theme:** Pure Dark & Light theme toggle with instant persistence
- **Export Engines:** `xlsx` (Excel), HTML Word Export (`.doc`), Markdown (`.md`), Native Print/PDF
- **Storage & Sync:** HTML5 LocalStorage + GitHub Gists REST API sync
- **Fonts:** Google Fonts (`Plus Jakarta Sans`, `JetBrains Mono`)

---

## 🚀 Running the Application Locally

### Development Server
The application is pre-configured to run on port `4250`:

```bash
npm start
```
Navigate to: `http://localhost:4250/`

### Production Build
```bash
npm run build
```

---

## 🌐 Deploy to GitHub Pages

This repository includes an automated GitHub Actions workflow at `.github/workflows/deploy.yml`.

To deploy:
1. Push code to the `main` branch.
2. In your GitHub repository:
   - Navigate to **Settings** > **Pages**.
   - Under **Build and deployment** > **Source**, select **GitHub Actions**.
3. The workflow will automatically compile Angular, generate SPA fallbacks (`404.html`), and publish your live CareerPlus hub!

