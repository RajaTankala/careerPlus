# 📘 CareerPlus — Architecture, Storage & GitHub Deployment Guide

This document provides a comprehensive technical overview of the **CareerPlus** application, detailing its data storage configuration, multi-device cloud synchronization architecture, GitHub Pages deployment pipeline, and git commit history.

---

## 📑 Table of Contents
1. [System Architecture Overview](#1-system-architecture-overview)
2. [Data Storage Configuration](#2-data-storage-configuration)
   - [Local Storage Engine & Reactive Signals](#local-storage-engine--reactive-signals)
   - [Real-Time Save Confirmation & Integrity Probe](#real-time-save-confirmation--integrity-probe)
3. [Multi-Device Cloud Sync via GitHub Gists](#3-multi-device-cloud-sync-via-github-gists)
   - [Why Gists over Traditional Backend](#why-gists-over-traditional-backend)
   - [Sync Workflow (Push & Pull)](#sync-workflow-push--pull)
4. [Document Generation & Excel Export Architecture](#4-document-generation--excel-export-architecture)
5. [GitHub Actions CI/CD Deployment Pipeline](#5-github-actions-cicd-deployment-pipeline)
   - [Workflow Configuration (`deploy.yml`)](#workflow-configuration-deployyml)
   - [SPA Routing & 404 Fallback](#spa-routing--404-fallback)
   - [Step-by-Step GitHub Pages Setup](#step-by-step-github-pages-setup)
6. [Git Commit History & Repository Configuration](#6-git-commit-history--repository-configuration)

---

## 1. System Architecture Overview

CareerPlus is engineered with **Angular 20 Standalone Architecture** without cumbersome legacy modules. It leverages fine-grained reactivity using **Angular Signals** (`signal`, `computed`, `effect`).

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CareerPlus UI Layer                             │
│  Navbar │ Dashboard │ Work Tracker │ Reading Roadmap │ Circle Birthdays│
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
                 ┌───────────────────┴───────────────────┐
                 ▼                                       ▼
  ┌───────────────────────────────┐     ┌────────────────────────────────┐
  │ StorageService (Signals Store)│     │     Document & Excel Engines   │
  │  - workItems()                │     │  - DocumentGeneratorService    │
  │  - readingTopics()            │     │    (Word, Markdown, PDF)       │
  │  - birthdays()                │     │  - ExcelExportService          │
  │  - goals()                    │     │    (5-Sheet .xlsx Workbooks)   │
  │  - theme() [Dark / Light]     │     └────────────────────────────────┘
  └──────────────┬────────────────┘
                 │
         ┌───────┴───────────────────────────────┐
         ▼                                       ▼
┌───────────────────────────────┐     ┌──────────────────────────────────┐
│  Browser HTML5 LocalStorage   │     │  Multi-Device Cloud Sync Service │
│  - Instant offline saves      │     │  - GitHub Gist REST API          │
│  - Live Save Pill & Toasts    │     │  - Cross-device JSON sync        │
└───────────────────────────────┘     └──────────────────────────────────┘
```

---

## 2. Data Storage Configuration

### Local Storage Engine & Reactive Signals
The primary storage engine is implemented in [src/app/services/storage.service.ts](file:///d:/MyProjects/src/app/services/storage.service.ts).

#### Storage Keys:
| Key | Type | Description |
|---|---|---|
| `cp_work_items` | `WorkItem[]` | Daily logs, focus hours, deliverables, blockers, brag tags |
| `cp_reading_topics` | `ReadingTopic[]` | Monthly reading roadmap, resource checklists, status |
| `cp_circle_birthdays` | `CircleBirthday[]` | Contact list, birthdays, countdown days, notes |
| `cp_career_goals` | `CareerGoal[]` | Career OKRs, milestones, progress percentages |
| `cp_notifications` | `NotificationItem[]` | System notifications and deadline reminders |
| `cp_theme_mode` | `'dark' \| 'light'` | Selected theme |
| `cp_last_saved_time` | `string (ISO)` | Timestamp of most recent state modification |
| `cp_cloud_gist_token` | `string` | User's GitHub Personal Access Token (`gist` scope) |
| `cp_cloud_gist_id` | `string` | Unique Gist ID used for cloud backups |

### Real-Time Save Confirmation & Integrity Probe
- **Automatic Persistence:** Whenever an item is added, updated, or removed, `StorageService` immediately serializes the reactive signal array into `localStorage`.
- **Live Status Pill:** Located in the navbar ([src/app/components/navbar/navbar.ts](file:///d:/MyProjects/src/app/components/navbar/navbar.ts)), displays `✓ Saved (LocalStorage)` with the timestamp.
- **Floating Toasts:** [src/app/services/toast.service.ts](file:///d:/MyProjects/src/app/services/toast.service.ts) triggers animated notification toasts confirming successful writes.
- **Integrity Probe:** On application initialization, `storageService.testStorageIntegrity()` executes a canary write/read/delete cycle to ensure `localStorage` is accessible and within quota.

---

## 3. Multi-Device Cloud Sync via GitHub Gists

### Why Gists over Traditional Backend?
1. **Zero Maintenance & Free:** Eliminates the need for paid hosting (Firebase, Supabase, MongoDB Atlas, or Express/Node servers).
2. **Private & Secure:** Data is stored in a private Gist attached directly to the user's GitHub account.
3. **No Lock-In:** Data is standard JSON (`career_pulse_backup.json`) that can be exported or edited anywhere.

### Sync Workflow (Push & Pull)
Implemented in [src/app/services/cloud-sync.service.ts](file:///d:/MyProjects/src/app/services/cloud-sync.service.ts):

```
[Device A (e.g., Laptop)]
  │
  ├─> 1. StorageService exports complete state as JSON
  │
  ├─> 2. CloudSyncService sends POST/PATCH to:
  │      https://api.github.com/gists/<GIST_ID>
  │      Headers: Authorization: Bearer <GITHUB_PAT>
  │
  ▼
[GitHub Cloud: Private Gist]
  │
  ├─> Stores `career_pulse_backup.json`
  │
  ▼
[Device B (e.g., Office PC or Mobile Phone)]
  │
  ├─> 1. User enters GitHub PAT in "Storage & Sync" modal
  │
  ├─> 2. CloudSyncService fetches GET https://api.github.com/gists/<GIST_ID>
  │
  └─> 3. Deserializes JSON and updates LocalStorage + Signals
```

---

## 4. Document Generation & Excel Export Architecture

### Executive Document Generator
Located in [src/app/services/document-generator.service.ts](file:///d:/MyProjects/src/app/services/document-generator.service.ts):
- **Templates:**
  - `daily-standup`: Formats completed tasks, in-progress items, and blockers.
  - `weekly-sprint`: Sprint metrics, completed deliverables, next priorities.
  - `monthly-brag`: High-impact contributions tagged with `★ Brag Worthy` for performance reviews.
  - `performance-appraisal`: Executive summary, leadership impact, technical competencies.
- **Export Targets:**
  - **Microsoft Word (`.doc`):** Generates styled HTML with Office XML headers for native Word opening.
  - **Markdown (`.md`):** Formatted GitHub-flavored markdown.
  - **Print / PDF:** Uses CSS `@media print` rules to strip navigation bars and present print-perfect documents.

### Excel (.xlsx) Engine
Located in [src/app/services/excel-export.service.ts](file:///d:/MyProjects/src/app/services/excel-export.service.ts):
- Powered by `xlsx` (SheetJS).
- Generates a **5-sheet Master Workbook**:
  1. `Work Tracker`
  2. `Reading Roadmap`
  3. `Circle Birthdays`
  4. `Career Milestones`
  5. `System Analytics`

---

## 5. GitHub Actions CI/CD Deployment Pipeline

The automated deployment pipeline is configured in [.github/workflows/deploy.yml](file:///d:/MyProjects/.github/workflows/deploy.yml).

### Pipeline Flow:
```
  [Git Push to 'main']
          │
          ▼
  1. Checkout repository (actions/checkout@v4)
          │
          ▼
  2. Setup Node.js 20 with npm caching (actions/setup-node@v4)
          │
          ▼
  3. Install dependencies: `npm ci`
          │
          ▼
  4. Build Angular App:
     `npx ng build --configuration production --base-href="./"`
          │
          ▼
  5. SPA Routing Fix:
     `cp dist/career-pulse/browser/index.html dist/career-pulse/browser/404.html`
          │
          ▼
  6. Upload artifact (actions/upload-pages-artifact@v3)
     Path: `dist/career-pulse/browser`
          │
          ▼
  7. Deploy to GitHub Pages (actions/deploy-pages@v4)
     Environment: `github-pages`
```

### SPA Routing & 404 Fallback
Because Angular is a Single Page Application (SPA) using HTML5 client-side routing, direct access or page refresh on a route like `/work-tracker` would otherwise cause GitHub Pages (a static server) to return HTTP 404.
The workflow automatically copies `index.html` to `404.html` so that GitHub Pages serves the Angular application on any path, allowing Angular's client-side router to handle the route smoothly.

### Step-by-Step GitHub Pages Setup
1. In your GitHub repository, open **Settings** > **Pages**.
2. Under **Build and deployment > Source**, select **GitHub Actions**.
3. Push to `main` branch.
4. The site is published at: **`https://rajatankala.github.io/careerPlus/`**

---

## 6. Git Commit History & Repository Configuration

### Remote Repository:
- **URL:** `https://github.com/RajaTankala/careerPlus.git`
- **Default Branch:** `main`

### Commit Log:
```text
ac6d74f - Raja, 2026-10-30 18:55:23 +0530 : ci: configure github-pages environment in deployment workflow
4a0ce8a - Raja, 2026-10-30 18:47:04 +0530 : feat: complete CareerPlus career hub with work tracking, document generator, reading roadmap, circle birthdays, dark/light themes, Excel export, cloud sync, and GitHub Pages CI/CD
414c142 - Raja, 2026-10-30 17:49:32 +0530 : initial commit
```

### Commit Details:
1. **Commit `414c142` (Initial commit)**
   - Base Angular CLI workspace generation with TypeScript and build configuration.

2. **Commit `4a0ce8a` (Full Feature Set)**
   - Implemented `WorkTracker`, `DocGeneratorModal`, `ReadingScheduler`, `BirthdayCircle`, `CareerGoals`, `Navbar`, and `Dashboard`.
   - Built `StorageService` with reactive signals and HTML5 `localStorage`.
   - Built `ExcelExportService` for multi-sheet `.xlsx` master export.
   - Built `DocumentGeneratorService` for Word `.doc`, Markdown `.md`, and Print/PDF reports.
   - Built `CloudSyncService` using GitHub Gists API.
   - Designed pure Dark & Light mode theme system in `src/styles.css`.
   - Added initial `.github/workflows/deploy.yml`.

3. **Commit `ac6d74f` (CI/CD Environment Configuration)**
   - Added `environment: name: github-pages` to `deploy.yml`.
   - Verified automated build and deployment to GitHub Pages (`StatusCode: 200 OK`).
