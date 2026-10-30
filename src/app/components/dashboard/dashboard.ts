import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StorageService } from '../../services/storage.service';
import { WorkItem } from '../../models/work-item.model';
import { BirthdayCountdown } from '../../models/circle-birthday.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-page">
      <!-- Hero Banner -->
      <div class="hero-card">
        <div class="hero-content">
          <div class="hero-tag">
            <span class="live-dot"></span>
            <span>Career Command Hub</span>
            <span class="divider">•</span>
            <span>{{ todayFormatted }}</span>
          </div>
          <h1 class="hero-title">
            Welcome back, <span class="gradient-text">{{ storage.userProfile().name }}</span>!
          </h1>
          <p class="hero-subtitle">
            {{ storage.userProfile().role }} • {{ storage.userProfile().organization }}.
            Track your daily engineering wins, stay ahead of your learning roadmap, and nurture your professional network.
          </p>

          <div class="hero-actions">
            <button class="btn-hero-primary" (click)="openAddWorkModal.emit()">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Log Today's Work</span>
            </button>

            <button class="btn-hero-secondary" (click)="openDocGenerator.emit()">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              <span>Generate Status Report</span>
            </button>

            <button class="btn-hero-secondary" (click)="storage.setActiveTab('reading-roadmap')">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              <span>View Reading Roadmap</span>
            </button>
          </div>
        </div>

        <!-- Developer at Laptop Illustration -->
        <div class="hero-illustration">
          <svg width="220" height="150" viewBox="0 0 220 150" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Desk Plant -->
            <rect x="180" y="112" width="16" height="18" rx="3" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5" />
            <path d="M188 112C188 95 198 90 200 95C202 100 195 110 188 112Z" fill="#10b981" />
            <path d="M188 112C188 92 178 88 176 93C174 98 181 110 188 112Z" fill="#059669" />
            <path d="M188 112C188 88 188 82 192 84C196 86 191 106 188 112Z" fill="#34d399" />

            <!-- Coffee Mug -->
            <rect x="75" y="118" width="12" height="12" rx="2" fill="#2563eb" />
            <path d="M75 120H72C70.5 120 70.5 126 72 126H75" stroke="#2563eb" stroke-width="1.5" stroke-linecap="round" />

            <!-- Developer Body (Blue Shirt) -->
            <path d="M96 132C96 110 108 98 125 98C142 98 154 110 154 132H96Z" fill="#2563eb" />
            <!-- Arms typing on laptop -->
            <path d="M106 114L126 124H146" stroke="#1d4ed8" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" />
            <!-- Neck & Face -->
            <path d="M120 90H130V98H120V90Z" fill="#fcd34d" />
            <circle cx="125" cy="76" r="14" fill="#fcd34d" />
            <!-- Hair -->
            <path d="M111 72C111 62 118 56 128 56C137 56 142 61 142 68L136 70C132 65 124 63 118 65C114 67 112 70 111 72Z" fill="#0f172a" />

            <!-- Laptop -->
            <path d="M126 127L148 127" stroke="#94a3b8" stroke-width="3" stroke-linecap="round" />
            <path d="M138 102L150 126" stroke="#334155" stroke-width="3.5" stroke-linecap="round" />
            <polygon points="137,102 139,102 151,126 149,126" fill="#38bdf8" opacity="0.35" />

            <!-- Floating Badge 1: Blue Calendar -->
            <rect x="80" y="38" width="22" height="22" rx="6" fill="#3b82f6" />
            <rect x="84" y="44" width="14" height="12" rx="2" fill="white" />
            <rect x="84" y="44" width="14" height="4" fill="#1d4ed8" />
            <circle cx="88" cy="51" r="1" fill="#3b82f6" />
            <circle cx="91" cy="51" r="1" fill="#3b82f6" />
            <circle cx="94" cy="51" r="1" fill="#3b82f6" />

            <!-- Floating Badge 2: Green Analytics Bar Chart -->
            <rect x="145" y="32" width="22" height="22" rx="6" fill="#10b981" />
            <line x1="150" y1="48" x2="150" y2="44" stroke="white" stroke-width="2" stroke-linecap="round" />
            <line x1="156" y1="48" x2="156" y2="39" stroke="white" stroke-width="2" stroke-linecap="round" />
            <line x1="162" y1="48" x2="162" y2="41" stroke="white" stroke-width="2" stroke-linecap="round" />

            <!-- Floating Badge 3: Purple Target -->
            <rect x="60" y="60" width="22" height="22" rx="6" fill="#8b5cf6" />
            <circle cx="71" cy="71" r="6" stroke="white" stroke-width="1.8" />
            <circle cx="71" cy="71" r="2.5" fill="white" />
          </svg>
        </div>

        <div class="hero-stats-badge">
          <div class="streak-icon">🔥</div>
          <div class="streak-val">{{ storage.userProfile().readingStreakDays }} Days</div>
          <div class="streak-lbl">CONSISTENCY STREAK</div>
        </div>
      </div>

      <!-- Metric KPI Grid -->
      <div class="kpi-grid">
        <div class="kpi-card" (click)="storage.setActiveTab('work-log')">
          <div class="kpi-header">
            <span class="kpi-title">Today's Work Log <span class="kpi-arrow">&gt;</span></span>
            <div class="kpi-icon-circle blue">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
          </div>
          <div class="kpi-value">{{ storage.todayWorkItems().length }} <span class="kpi-unit">tasks</span></div>
          <div class="kpi-sub">
            <span class="text-emerald">● {{ getTodayCompletedCount() }} Completed</span>
            <span>• {{ getTodayHours() }} hrs</span>
          </div>
        </div>

        <div class="kpi-card" (click)="openDocGenerator.emit()">
          <div class="kpi-header">
            <span class="kpi-title">High-Impact / Brag Wins <span class="kpi-arrow">&gt;</span></span>
            <div class="kpi-icon-circle green">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
          </div>
          <div class="kpi-value">{{ storage.highImpactWinsCount() }} <span class="kpi-unit">wins</span></div>
          <div class="kpi-sub">Ready for appraisal & doc generation</div>
        </div>

        <div class="kpi-card" (click)="storage.setActiveTab('reading-roadmap')">
          <div class="kpi-header">
            <span class="kpi-title">Reading & Knowledge <span class="kpi-arrow">&gt;</span></span>
            <div class="kpi-icon-circle purple">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
            </div>
          </div>
          <div class="kpi-value">{{ storage.completedReadingCount() }} <span class="kpi-unit">/ {{ storage.totalReadingCount() }}</span></div>
          <div class="kpi-sub">
            <span class="progress-bar-mini">
              <span class="progress-fill" [style.width.%]="storage.averageReadingProgress()"></span>
            </span>
            <span>{{ storage.averageReadingProgress() }}% complete</span>
          </div>
        </div>

        <div class="kpi-card" (click)="storage.setActiveTab('circle-birthdays')">
          <div class="kpi-header">
            <span class="kpi-title">Work Network <span class="kpi-arrow">&gt;</span></span>
            <div class="kpi-icon-circle pink">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
                <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
                <path d="M9 12H4s.55-3.03 2-4.5c1.62-1.63 5-2 5-2" />
                <path d="M12 15v5s3.03-.55 4.5-2c1.63-1.62 2-5 2-5" />
              </svg>
            </div>
          </div>
          <div class="kpi-value">{{ storage.circleBirthdays().length }} <span class="kpi-unit">contacts</span></div>
          <div class="kpi-sub">
            @if (storage.todayBirthdays().length > 0) {
              <span class="text-rose font-bold">🎂 {{ storage.todayBirthdays().length }} today</span>
            } @else {
              <span>{{ storage.upcomingBirthdaysNext7Days().length }} birthdays this week</span>
            }
          </div>
        </div>
      </div>

      <!-- Main Two-Column Layout -->
      <div class="dashboard-columns">
        <!-- Left Column: Today's Work Status Log -->
        <div class="col-main">
          <div class="section-card">
            <div class="section-header">
              <div>
                <h2 class="section-title">Today's Work Status Log</h2>
                <p class="section-desc">Keep your progress structured for effortless standups & sprint reviews</p>
              </div>
              <div class="section-actions">
                <button class="btn-add-item" (click)="openAddWorkModal.emit()">
                  + Add Item
                </button>
                <button class="btn-gen-doc" (click)="openDocGenerator.emit()">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:inline; margin-right:4px;">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  Generate Doc
                </button>
              </div>
            </div>

            <div class="work-list">
              @if (storage.todayWorkItems().length === 0) {
                <div class="empty-state">
                  <div class="empty-icon">📝</div>
                  <h4>No work logged for today yet</h4>
                  <p>Capture what you are working on today, your milestones, or any blockers.</p>
                  <button class="btn-gen-doc" (click)="openAddWorkModal.emit()">
                    Log Your First Task
                  </button>
                </div>
              } @else {
                @for (item of storage.todayWorkItems(); track item.id) {
                  <div class="work-item-row" [class.completed]="item.status === 'completed'">
                    <button
                      class="check-btn"
                      [class.checked]="item.status === 'completed'"
                      (click)="toggleTaskStatus(item)"
                      title="Toggle completion status"
                    >
                      @if (item.status === 'completed') {
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      }
                    </button>

                    <div class="work-content">
                      <div class="work-top">
                        <span class="badge-project">{{ item.project }}</span>
                        <span class="badge-cat-feature">{{ item.category }}</span>
                        @if (item.hoursSpent) {
                          <span class="work-hours">{{ item.hoursSpent }}h</span>
                        }
                      </div>

                      <div class="work-item-title">{{ item.title }}</div>
                      <p class="work-item-desc">{{ item.description }}</p>

                      @if (item.highlights && item.highlights.length > 0) {
                        <ul class="work-bullets">
                          @for (h of item.highlights; track h) {
                            <li>{{ h }}</li>
                          }
                        </ul>
                      }

                      @if (item.blockers) {
                        <div class="blocker-pill">
                          ⚠️ <strong>Blocker:</strong> {{ item.blockers }}
                        </div>
                      }
                    </div>
                  </div>
                }
              }
            </div>
          </div>
        </div>

        <!-- Right Column: Reading & Knowledge + Active Reading Schedule -->
        <div class="col-side">
          <!-- Reading & Knowledge Card -->
          <div class="section-card">
            <div class="section-header">
              <div>
                <h3 class="section-title">Reading & Knowledge</h3>
                <p class="section-desc">Keep building your skills and knowledge</p>
              </div>
              <button class="btn-add-item" (click)="storage.setActiveTab('reading-roadmap')">
                View All
              </button>
            </div>

            <div class="learning-journey-item" (click)="storage.setActiveTab('reading-roadmap')">
              <div class="journey-icon-wrap">
                <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
                  <path d="M8 12L20 6L32 12V28L20 34L8 28V12Z" fill="#3b82f6" />
                  <path d="M20 6V34L32 28V12L20 6Z" fill="#1d4ed8" />
                  <path d="M8 12L20 18L32 12L20 6L8 12Z" fill="#60a5fa" />
                </svg>
              </div>
              <div class="journey-content">
                <div class="journey-title">Java & Angular Best Practices</div>
                <div class="journey-sub">Continue your learning journey <span class="kpi-arrow">&gt;</span></div>
              </div>
            </div>
          </div>

          <!-- Active Reading Schedule Card -->
          <div class="section-card">
            <div class="section-header">
              <div>
                <h3 class="section-title">Active Reading Schedule</h3>
                <p class="section-desc">Targeted topics for career advancement</p>
              </div>
              <button class="btn-add-item" (click)="storage.setActiveTab('reading-roadmap')">
                Roadmap
              </button>
            </div>

            <div class="target-topic-item" (click)="storage.setActiveTab('reading-roadmap')">
              <div class="target-icon-wrap">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="6" />
                  <circle cx="12" cy="12" r="2" fill="#10b981" />
                </svg>
              </div>
              <div class="target-topic-content">
                <div class="target-topic-title">Spring Boot Advanced Topics</div>
                <div class="topic-progress-row">
                  <div class="progress-bar-mini">
                    <div class="progress-fill" style="width: 30%;"></div>
                  </div>
                  <span class="topic-progress-num">3/10</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .dashboard-page {
        max-width: 1380px;
        margin: 0 auto;
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      /* Hero */
      .hero-card {
        background: linear-gradient(135deg, #f0f7ff 0%, #e0effe 60%, #e8f4ff 100%);
        border: 1px solid #bfdbfe;
        border-radius: 20px;
        padding: 2.2rem 2.5rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1.5rem;
        position: relative;
        overflow: hidden;
        box-shadow: 0 4px 20px rgba(30, 96, 240, 0.04);
      }
      body.theme-dark .hero-card {
        background: linear-gradient(135deg, rgba(30, 41, 59, 0.85) 0%, rgba(15, 23, 42, 0.95) 100%);
        border-color: rgba(255, 255, 255, 0.08);
      }

      .hero-content {
        flex: 1.3;
      }

      .hero-tag {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.8rem;
        font-weight: 700;
        color: #1e60f0;
        margin-bottom: 0.75rem;
        background: rgba(30, 96, 240, 0.08);
        padding: 0.25rem 0.75rem;
        border-radius: 9999px;
      }

      .live-dot {
        width: 8px;
        height: 8px;
        border-radius: 9999px;
        background: #10b981;
        box-shadow: 0 0 8px #10b981;
      }

      .divider {
        opacity: 0.4;
      }

      .hero-title {
        font-size: 2.2rem;
        font-weight: 800;
        letter-spacing: -0.03em;
        margin-bottom: 0.5rem;
        color: #0f172a;
      }
      body.theme-dark .hero-title {
        color: #f8fafc;
      }

      .gradient-text {
        color: #1e60f0;
      }
      body.theme-dark .gradient-text {
        color: #60a5fa;
      }

      .hero-subtitle {
        color: #475569;
        font-size: 0.95rem;
        max-width: 680px;
        line-height: 1.5;
        margin-bottom: 1.5rem;
      }
      body.theme-dark .hero-subtitle {
        color: #94a3b8;
      }

      .hero-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
      }

      .btn-hero-primary {
        background: #1e60f0;
        color: #ffffff;
        font-weight: 600;
        padding: 0.65rem 1.25rem;
        border-radius: 10px;
        border: none;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      .btn-hero-primary:hover {
        background: #1a56db;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(30, 96, 240, 0.35);
      }

      .btn-hero-secondary {
        background: #ffffff;
        color: #0f172a;
        font-weight: 600;
        padding: 0.65rem 1.25rem;
        border-radius: 10px;
        border: 1px solid #cbd5e1;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      .btn-hero-secondary:hover {
        background: #f8fafc;
        border-color: #94a3b8;
      }
      body.theme-dark .btn-hero-secondary {
        background: #1e293b;
        color: #f8fafc;
        border-color: rgba(255, 255, 255, 0.15);
      }

      .hero-illustration {
        flex: 1;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .hero-stats-badge {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 18px;
        padding: 1.4rem 1.6rem;
        text-align: center;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);
        display: flex;
        flex-direction: column;
        align-items: center;
        min-width: 160px;
      }
      body.theme-dark .hero-stats-badge {
        background: #1e293b;
        border-color: rgba(255, 255, 255, 0.1);
      }

      .streak-icon {
        font-size: 2rem;
        margin-bottom: 0.2rem;
      }

      .streak-val {
        font-size: 1.85rem;
        font-weight: 800;
        color: #0f172a;
        margin: 0.2rem 0 0.1rem;
      }
      body.theme-dark .streak-val {
        color: #f8fafc;
      }

      .streak-lbl {
        font-size: 0.7rem;
        font-weight: 800;
        color: #64748b;
        letter-spacing: 0.06em;
      }

      /* KPI Grid */
      .kpi-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 1.25rem;
      }

      .kpi-card {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 16px;
        padding: 1.3rem;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        cursor: pointer;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }
      body.theme-dark .kpi-card {
        background: #111827;
        border-color: rgba(255, 255, 255, 0.08);
      }
      .kpi-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 16px rgba(15, 23, 42, 0.06);
      }

      .kpi-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 0.65rem;
      }

      .kpi-title {
        font-size: 0.85rem;
        font-weight: 700;
        color: #0f172a;
        display: flex;
        align-items: center;
        gap: 0.35rem;
      }
      body.theme-dark .kpi-title {
        color: #f8fafc;
      }
      .kpi-arrow {
        color: #94a3b8;
        font-size: 0.85rem;
      }

      .kpi-icon-circle {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .kpi-icon-circle.blue { background: #eff6ff; color: #2563eb; }
      .kpi-icon-circle.green { background: #ecfdf5; color: #059669; }
      .kpi-icon-circle.purple { background: #f5f3ff; color: #7c3aed; }
      .kpi-icon-circle.pink { background: #fdf2f8; color: #db2777; }

      .kpi-value {
        font-size: 1.85rem;
        font-weight: 800;
        color: #0f172a;
        letter-spacing: -0.02em;
        margin-bottom: 0.35rem;
      }
      body.theme-dark .kpi-value {
        color: #f8fafc;
      }

      .kpi-unit {
        font-size: 0.95rem;
        font-weight: 600;
        color: #64748b;
      }

      .kpi-sub {
        font-size: 0.775rem;
        color: #64748b;
        display: flex;
        align-items: center;
        gap: 0.4rem;
      }

      .text-emerald {
        color: #10b981;
      }

      .progress-bar-mini {
        height: 6px;
        flex: 1;
        background: #e2e8f0;
        border-radius: 9999px;
        overflow: hidden;
      }
      body.theme-dark .progress-bar-mini {
        background: #334155;
      }

      .progress-fill {
        height: 100%;
        background: #1e60f0;
        border-radius: 9999px;
      }

      /* Columns */
      .dashboard-columns {
        display: grid;
        grid-template-columns: 2fr 1.1fr;
        gap: 1.5rem;
      }

      .col-main, .col-side {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .section-card {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 16px;
        padding: 1.5rem;
      }
      body.theme-dark .section-card {
        background: #111827;
        border-color: rgba(255, 255, 255, 0.08);
      }

      .section-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        margin-bottom: 1.25rem;
      }

      .section-title {
        font-size: 1.15rem;
        font-weight: 800;
        color: #0f172a;
      }
      body.theme-dark .section-title {
        color: #f8fafc;
      }

      .section-desc {
        font-size: 0.825rem;
        color: #64748b;
        margin-top: 0.15rem;
      }

      .section-actions {
        display: flex;
        gap: 0.5rem;
      }

      .btn-add-item {
        background: #ffffff;
        color: #0f172a;
        border: 1px solid #cbd5e1;
        font-size: 0.825rem;
        font-weight: 600;
        padding: 0.4rem 0.85rem;
        border-radius: 8px;
        cursor: pointer;
      }
      .btn-add-item:hover {
        background: #f8fafc;
      }
      body.theme-dark .btn-add-item {
        background: #1e293b;
        color: #f8fafc;
        border-color: rgba(255, 255, 255, 0.15);
      }

      .btn-gen-doc {
        background: #1e60f0;
        color: #ffffff;
        border: none;
        font-size: 0.825rem;
        font-weight: 600;
        padding: 0.4rem 0.85rem;
        border-radius: 8px;
        cursor: pointer;
      }
      .btn-gen-doc:hover {
        background: #1a56db;
      }

      .work-list {
        display: flex;
        flex-direction: column;
        gap: 0.85rem;
      }

      .work-item-row {
        display: flex;
        align-items: flex-start;
        gap: 0.85rem;
        padding: 1rem 1.1rem;
        border-radius: 12px;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
      }
      body.theme-dark .work-item-row {
        background: #1e293b;
        border-color: rgba(255, 255, 255, 0.08);
      }

      .check-btn {
        width: 22px;
        height: 22px;
        border-radius: 6px;
        border: 2px solid #cbd5e1;
        background: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        margin-top: 2px;
      }
      .check-btn.checked {
        background: #10b981;
        border-color: #10b981;
        color: white;
      }

      .work-top {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.4rem;
      }

      .badge-project {
        background: #dbeafe;
        color: #1e60f0;
        padding: 0.2rem 0.65rem;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 600;
      }

      .badge-cat-feature {
        background: #dcfce7;
        color: #16a34a;
        padding: 0.2rem 0.65rem;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 600;
      }

      .work-hours {
        font-size: 0.85rem;
        color: #94a3b8;
        margin-left: auto;
        font-weight: 600;
      }

      .work-item-title {
        font-weight: 700;
        font-size: 0.95rem;
        color: #0f172a;
        margin-bottom: 0.25rem;
      }
      body.theme-dark .work-item-title {
        color: #f8fafc;
      }

      .work-item-desc {
        font-size: 0.85rem;
        color: #475569;
        margin-bottom: 0.4rem;
        line-height: 1.45;
      }
      body.theme-dark .work-item-desc {
        color: #94a3b8;
      }

      .work-bullets {
        margin: 0.25rem 0 0.4rem 1.25rem;
        font-size: 0.825rem;
        color: #64748b;
      }
      .work-bullets li {
        margin-bottom: 0.15rem;
      }

      .blocker-pill {
        background: rgba(244, 63, 94, 0.12);
        color: #f43f5e;
        border: 1px solid rgba(244, 63, 94, 0.25);
        padding: 0.35rem 0.65rem;
        border-radius: 6px;
        font-size: 0.775rem;
      }

      /* Empty State */
      .empty-state {
        text-align: center;
        padding: 2.5rem 1.5rem;
        color: #64748b;
      }
      .empty-icon {
        font-size: 2.2rem;
        margin-bottom: 0.5rem;
      }
      .empty-state h4 {
        color: #0f172a;
        font-size: 1rem;
        margin-bottom: 0.35rem;
      }
      body.theme-dark .empty-state h4 {
        color: #f8fafc;
      }
      .empty-state p {
        font-size: 0.825rem;
        margin-bottom: 1rem;
      }

      /* Right Column Card Items */
      .learning-journey-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        border-radius: 12px;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      body.theme-dark .learning-journey-item {
        background: #1e293b;
        border-color: rgba(255, 255, 255, 0.08);
      }
      .learning-journey-item:hover {
        border-color: #1e60f0;
      }

      .journey-icon-wrap {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .journey-title {
        font-weight: 700;
        font-size: 0.925rem;
        color: #0f172a;
        margin-bottom: 0.2rem;
      }
      body.theme-dark .journey-title {
        color: #f8fafc;
      }

      .journey-sub {
        font-size: 0.8rem;
        color: #64748b;
      }

      .target-topic-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        border-radius: 12px;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      body.theme-dark .target-topic-item {
        background: #1e293b;
        border-color: rgba(255, 255, 255, 0.08);
      }
      .target-topic-item:hover {
        border-color: #10b981;
      }

      .target-icon-wrap {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .target-topic-content {
        flex: 1;
      }

      .target-topic-title {
        font-weight: 700;
        font-size: 0.9rem;
        color: #0f172a;
        margin-bottom: 0.4rem;
      }
      body.theme-dark .target-topic-title {
        color: #f8fafc;
      }

      .topic-progress-row {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .topic-progress-num {
        font-size: 0.8rem;
        font-weight: 700;
        color: #64748b;
      }

      @media (max-width: 1024px) {
        .kpi-grid {
          grid-template-columns: repeat(2, 1fr);
        }
        .dashboard-columns {
          grid-template-columns: 1fr;
        }
        .hero-illustration {
          display: none;
        }
      }

      @media (max-width: 640px) {
        .kpi-grid {
          grid-template-columns: 1fr;
        }
        .hero-card {
          flex-direction: column;
          align-items: flex-start;
        }
      }
    `,
  ],
})
export class DashboardComponent {
  public readonly storage = inject(StorageService);

  public readonly openAddWorkModal = output<void>();
  public readonly openDocGenerator = output<void>();

  public readonly todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  public getTodayCompletedCount(): number {
    return this.storage.todayWorkItems().filter((w) => w.status === 'completed').length;
  }

  public getTodayHours(): number {
    return this.storage.todayWorkItems().reduce((acc, curr) => acc + (curr.hoursSpent || 0), 0);
  }

  public getTopBragItems(): WorkItem[] {
    return this.storage
      .workItems()
      .filter((w) => w.impact === 'brag-worthy' || w.impact === 'high')
      .slice(0, 4);
  }

  public getUpcomingBirthdaysList(): BirthdayCountdown[] {
    return this.storage.birthdayCountdowns().slice(0, 4);
  }

  public getActiveReadingTopics() {
    return this.storage
      .readingTopics()
      .filter((t) => t.status !== 'completed')
      .slice(0, 3);
  }

  public toggleTaskStatus(item: WorkItem): void {
    const nextStatus = item.status === 'completed' ? 'in-progress' : 'completed';
    this.storage.updateWorkItem(item.id, { status: nextStatus });
  }

  public getCategoryBadgeClass(category: string): string {
    switch (category) {
      case 'architecture':
        return 'badge-purple';
      case 'feature':
        return 'badge-emerald';
      case 'bugfix':
        return 'badge-rose';
      case 'devops':
        return 'badge-cyan';
      default:
        return 'badge-indigo';
    }
  }
}
