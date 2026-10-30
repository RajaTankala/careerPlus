import { Component, inject, signal, output } from '@angular/core';
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
      <div class="hero-card glass-panel">
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
            <button class="btn btn-primary" (click)="openAddWorkModal.emit()">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Log Today's Work</span>
            </button>

            <button class="btn btn-secondary" (click)="openDocGenerator.emit()">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              <span>Generate Status Report</span>
            </button>

            <button class="btn btn-outline" (click)="storage.setActiveTab('reading-roadmap')">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              <span>View Reading Roadmap</span>
            </button>
          </div>
        </div>

        <div class="hero-stats-badge">
          <div class="streak-icon">🔥</div>
          <div class="streak-val">{{ storage.userProfile().readingStreakDays }} Days</div>
          <div class="streak-lbl">Consistency Streak</div>
        </div>
      </div>

      <!-- Live Birthday & Reminder Alert Banners (if any today/urgent) -->
      @if (storage.todayBirthdays().length > 0) {
        <div class="alert-banner celebration">
          <div class="alert-left">
            <span class="alert-emoji">🎉</span>
            <div>
              <strong>Celebration Alert!</strong>
              Today is 
              @for (b of storage.todayBirthdays(); track b.contact.id; let last = $last) {
                <span><strong>{{ b.contact.name }}</strong> ({{ b.contact.relationship }}){{ last ? '' : ', ' }}</span>
              }
              's birthday!
            </div>
          </div>
          <button class="btn btn-sm btn-primary" (click)="storage.setActiveTab('circle-birthdays')">
            Send Wishes Now
          </button>
        </div>
      }

      @if (storage.overdueReadingTopics().length > 0) {
        <div class="alert-banner warning">
          <div class="alert-left">
            <span class="alert-emoji">⚠️</span>
            <div>
              <strong>Reading Schedule Reminder:</strong>
              You have {{ storage.overdueReadingTopics().length }} topic(s) past target date.
            </div>
          </div>
          <button class="btn btn-sm btn-secondary" (click)="storage.setActiveTab('reading-roadmap')">
            Review Schedule
          </button>
        </div>
      }

      <!-- Metric KPI Grid -->
      <div class="kpi-grid">
        <div class="kpi-card card" (click)="storage.setActiveTab('work-log')">
          <div class="kpi-header">
            <span class="kpi-title">Today's Work Log</span>
            <div class="kpi-icon indigo">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
          </div>
          <div class="kpi-value">{{ storage.todayWorkItems().length }} <span class="kpi-unit">tasks</span></div>
          <div class="kpi-sub">
            <span class="text-emerald">● {{ getTodayCompletedCount() }} completed</span>
            <span>• {{ getTodayHours() }} hrs</span>
          </div>
        </div>

        <div class="kpi-card card" (click)="openDocGenerator.emit()">
          <div class="kpi-header">
            <span class="kpi-title">High-Impact / Brag Wins</span>
            <div class="kpi-icon amber">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
          </div>
          <div class="kpi-value">{{ storage.highImpactWinsCount() }} <span class="kpi-unit">wins</span></div>
          <div class="kpi-sub">Ready for appraisal & doc generation</div>
        </div>

        <div class="kpi-card card" (click)="storage.setActiveTab('reading-roadmap')">
          <div class="kpi-header">
            <span class="kpi-title">Reading & Knowledge</span>
            <div class="kpi-icon cyan">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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

        <div class="kpi-card card" (click)="storage.setActiveTab('circle-birthdays')">
          <div class="kpi-header">
            <span class="kpi-title">Circle Network</span>
            <div class="kpi-icon pink">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
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
        <!-- Left Column: Today's Log & High Impact Wins -->
        <div class="col-main">
          <!-- Today's Work Status Section -->
          <div class="section-card card">
            <div class="section-header">
              <div>
                <h2 class="section-title">Today's Work Status Log</h2>
                <p class="section-desc">Keep your progress structured for effortless standups & sprint reviews</p>
              </div>
              <div class="section-actions">
                <button class="btn btn-sm btn-outline" (click)="openAddWorkModal.emit()">
                  + Add Item
                </button>
                <button class="btn btn-sm btn-primary" (click)="openDocGenerator.emit()">
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
                  <button class="btn btn-sm btn-primary" (click)="openAddWorkModal.emit()">
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
                        <span class="work-project">{{ item.project }}</span>
                        <span class="badge" [ngClass]="getCategoryBadgeClass(item.category)">
                          {{ item.category }}
                        </span>
                        @if (item.impact === 'brag-worthy') {
                          <span class="badge badge-amber">★ Brag Worthy</span>
                        }
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

          <!-- Recent Career Highlights / Brag Reel -->
          <div class="section-card card">
            <div class="section-header">
              <div>
                <h2 class="section-title">🌟 Career Brag Reel (High Impact)</h2>
                <p class="section-desc">Major technical milestones that demonstrate senior leadership</p>
              </div>
              <button class="btn btn-sm btn-secondary" (click)="storage.setActiveTab('work-log')">
                View All ({{ storage.workItems().length }})
              </button>
            </div>

            <div class="brag-grid">
              @for (item of getTopBragItems(); track item.id) {
                <div class="brag-card">
                  <div class="brag-badge">★ {{ item.impact | uppercase }}</div>
                  <div class="brag-title">{{ item.title }}</div>
                  <div class="brag-meta">
                    <span>{{ item.project }}</span>
                    <span>•</span>
                    <span>{{ item.date }}</span>
                  </div>
                  <div class="brag-skills">
                    @for (s of item.skills; track s) {
                      <span class="mini-skill">{{ s }}</span>
                    }
                  </div>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Right Column: Birthday Celebrations, Reading Roadmap & Career Goals -->
        <div class="col-side">
          <!-- Circle Celebrations Card -->
          <div class="section-card card">
            <div class="section-header">
              <div>
                <h3 class="section-title">🎂 Circle Birthdays</h3>
                <p class="section-desc">Upcoming celebrations in your network</p>
              </div>
              <button class="btn btn-sm btn-outline" (click)="storage.setActiveTab('circle-birthdays')">
                Manage
              </button>
            </div>

            <div class="birthday-mini-list">
              @for (b of getUpcomingBirthdaysList(); track b.contact.id) {
                <div class="bday-mini-item" [class.highlight]="b.isToday">
                  <div class="bday-avatar" [style.background-color]="b.contact.avatarColor || '#6366f1'">
                    {{ b.contact.name.charAt(0) }}
                  </div>
                  <div class="bday-details">
                    <div class="bday-name">
                      {{ b.contact.name }}
                      @if (b.isToday) {
                        <span class="badge badge-rose">TODAY 🎉</span>
                      }
                    </div>
                    <div class="bday-meta">
                      {{ b.contact.relationship }} • {{ b.formattedDate }}
                      @if (b.turningAge) {
                        <span>(Turns {{ b.turningAge }})</span>
                      }
                    </div>
                  </div>
                  <div class="bday-action">
                    @if (b.isToday) {
                      <button class="btn btn-sm btn-primary" (click)="storage.setActiveTab('circle-birthdays')">
                        Wish
                      </button>
                    } @else {
                      <span class="days-pill">in {{ b.daysRemaining }}d</span>
                    }
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Reading Schedule Card -->
          <div class="section-card card">
            <div class="section-header">
              <div>
                <h3 class="section-title">📚 Active Reading Schedule</h3>
                <p class="section-desc">Targeted topics for career advancement</p>
              </div>
              <button class="btn btn-sm btn-outline" (click)="storage.setActiveTab('reading-roadmap')">
                Roadmap
              </button>
            </div>

            <div class="reading-mini-list">
              @for (topic of getActiveReadingTopics(); track topic.id) {
                <div class="reading-mini-item">
                  <div class="reading-top">
                    <span class="reading-cat badge badge-indigo">{{ topic.category }}</span>
                    <span class="reading-due">Due {{ topic.targetDate }}</span>
                  </div>
                  <div class="reading-title">{{ topic.title }}</div>

                  <div class="reading-progress-wrap">
                    <div class="progress-bar-mini">
                      <div class="progress-fill" [style.width.%]="topic.progressPercent"></div>
                    </div>
                    <span class="progress-txt">{{ topic.progressPercent }}%</span>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Career Goals Progress -->
          <div class="section-card card">
            <div class="section-header">
              <div>
                <h3 class="section-title">🎯 Career Milestones</h3>
                <p class="section-desc">Key promotion & mastery targets</p>
              </div>
              <button class="btn btn-sm btn-outline" (click)="storage.setActiveTab('goals')">
                All Goals
              </button>
            </div>

            <div class="goals-mini-list">
              @for (g of storage.careerGoals(); track g.id) {
                <div class="goal-mini-item">
                  <div class="goal-meta">
                    <span class="goal-time">{{ g.targetTimeline }}</span>
                    <span class="goal-percent">{{ g.progressPercent }}%</span>
                  </div>
                  <div class="goal-title">{{ g.title }}</div>
                  <div class="progress-bar-mini">
                    <div class="progress-fill emerald" [style.width.%]="g.progressPercent"></div>
                  </div>
                </div>
              }
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
        padding: 2rem 2.5rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 2rem;
        position: relative;
        overflow: hidden;
      }
      .hero-card::before {
        content: '';
        position: absolute;
        top: -60px;
        right: -60px;
        width: 260px;
        height: 260px;
        background: radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, transparent 70%);
        pointer-events: none;
      }

      .hero-content {
        flex: 1;
      }

      .hero-tag {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.8rem;
        font-weight: 700;
        color: var(--primary-500);
        margin-bottom: 0.6rem;
        background: rgba(99, 102, 241, 0.1);
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
        color: var(--text-primary);
      }

      .gradient-text {
        background: var(--primary-gradient);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .hero-subtitle {
        color: var(--text-secondary);
        font-size: 0.95rem;
        max-width: 720px;
        line-height: 1.5;
        margin-bottom: 1.4rem;
      }

      .hero-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
      }

      .hero-stats-badge {
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: 16px;
        padding: 1.25rem 1.75rem;
        text-align: center;
        box-shadow: var(--shadow-md);
        display: flex;
        flex-direction: column;
        align-items: center;
        min-width: 150px;
      }

      .streak-icon {
        font-size: 1.8rem;
        margin-bottom: 0.25rem;
      }

      .streak-val {
        font-size: 1.5rem;
        font-weight: 800;
        color: var(--text-primary);
      }

      .streak-lbl {
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      /* Alert Banners */
      .alert-banner {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        padding: 0.9rem 1.25rem;
        border-radius: 12px;
        animation: fadeIn 0.25s ease-out;
      }
      .alert-banner.celebration {
        background: linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%);
        border: 1px solid rgba(236, 72, 153, 0.3);
      }
      .alert-banner.warning {
        background: rgba(245, 158, 11, 0.12);
        border: 1px solid rgba(245, 158, 11, 0.3);
      }

      .alert-left {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-size: 0.9rem;
      }

      .alert-emoji {
        font-size: 1.3rem;
      }

      /* KPI Grid */
      .kpi-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 1.25rem;
      }

      .kpi-card {
        cursor: pointer;
        padding: 1.3rem;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }
      .kpi-card:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
      }

      .kpi-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 0.5rem;
      }

      .kpi-title {
        font-size: 0.85rem;
        font-weight: 700;
        color: var(--text-secondary);
      }

      .kpi-icon {
        width: 36px;
        height: 36px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .kpi-icon.indigo { background: rgba(99, 102, 241, 0.15); color: #818cf8; }
      .kpi-icon.amber { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
      .kpi-icon.cyan { background: rgba(6, 182, 212, 0.15); color: #22d3ee; }
      .kpi-icon.pink { background: rgba(236, 72, 153, 0.15); color: #ec4899; }

      .kpi-value {
        font-size: 1.85rem;
        font-weight: 800;
        color: var(--text-primary);
        letter-spacing: -0.02em;
        margin-bottom: 0.35rem;
      }

      .kpi-unit {
        font-size: 0.9rem;
        font-weight: 600;
        color: var(--text-muted);
      }

      .kpi-sub {
        font-size: 0.775rem;
        color: var(--text-muted);
        display: flex;
        align-items: center;
        gap: 0.4rem;
      }

      .progress-bar-mini {
        height: 6px;
        flex: 1;
        background: var(--bg-card-subtle);
        border-radius: 9999px;
        overflow: hidden;
      }
      .progress-fill {
        height: 100%;
        background: var(--primary-gradient);
        border-radius: 9999px;
      }
      .progress-fill.emerald {
        background: var(--accent-emerald);
      }

      /* Dashboard Two Columns */
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
        padding: 1.5rem;
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
        color: var(--text-primary);
      }

      .section-desc {
        font-size: 0.8rem;
        color: var(--text-muted);
        margin-top: 0.15rem;
      }

      .section-actions {
        display: flex;
        gap: 0.5rem;
      }

      /* Work list */
      .work-list {
        display: flex;
        flex-direction: column;
        gap: 0.85rem;
      }

      .work-item-row {
        display: flex;
        align-items: flex-start;
        gap: 0.85rem;
        padding: 0.9rem 1rem;
        border-radius: 10px;
        background: var(--bg-card-subtle);
        border: 1px solid var(--border-color);
        transition: all 0.2s ease;
      }
      .work-item-row.completed {
        opacity: 0.8;
      }

      .check-btn {
        width: 22px;
        height: 22px;
        border-radius: 6px;
        border: 2px solid var(--text-muted);
        background: transparent;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        margin-top: 2px;
        transition: all 0.15s ease;
      }
      .check-btn.checked {
        background: var(--accent-emerald);
        border-color: var(--accent-emerald);
        color: white;
      }

      .work-content {
        flex: 1;
      }

      .work-top {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.35rem;
      }

      .work-project {
        font-size: 0.75rem;
        font-weight: 700;
        color: var(--primary-500);
      }

      .work-hours {
        font-size: 0.75rem;
        color: var(--text-muted);
        margin-left: auto;
      }

      .work-item-title {
        font-weight: 700;
        font-size: 0.95rem;
        color: var(--text-primary);
        margin-bottom: 0.25rem;
      }

      .work-item-desc {
        font-size: 0.825rem;
        color: var(--text-secondary);
        margin-bottom: 0.4rem;
        line-height: 1.4;
      }

      .work-bullets {
        margin: 0.25rem 0 0.4rem 1.25rem;
        font-size: 0.8rem;
        color: var(--text-secondary);
      }
      .work-bullets li {
        margin-bottom: 0.15rem;
      }

      .blocker-pill {
        background: rgba(244, 63, 94, 0.12);
        color: var(--accent-rose);
        border: 1px solid rgba(244, 63, 94, 0.25);
        padding: 0.35rem 0.65rem;
        border-radius: 6px;
        font-size: 0.775rem;
      }

      /* Empty State */
      .empty-state {
        text-align: center;
        padding: 2.5rem 1.5rem;
        color: var(--text-muted);
      }
      .empty-icon {
        font-size: 2.2rem;
        margin-bottom: 0.5rem;
      }
      .empty-state h4 {
        color: var(--text-primary);
        font-size: 1rem;
        margin-bottom: 0.35rem;
      }
      .empty-state p {
        font-size: 0.825rem;
        margin-bottom: 1rem;
      }

      /* Brag Grid */
      .brag-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
      }

      .brag-card {
        background: var(--bg-card-subtle);
        border: 1px solid var(--border-color);
        border-radius: 10px;
        padding: 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
      }

      .brag-badge {
        font-size: 0.65rem;
        font-weight: 800;
        color: #f59e0b;
        letter-spacing: 0.05em;
      }

      .brag-title {
        font-weight: 700;
        font-size: 0.875rem;
        color: var(--text-primary);
      }

      .brag-meta {
        font-size: 0.75rem;
        color: var(--text-muted);
        display: flex;
        gap: 0.4rem;
      }

      .brag-skills {
        display: flex;
        flex-wrap: wrap;
        gap: 0.3rem;
        margin-top: 0.35rem;
      }

      .mini-skill {
        background: rgba(99, 102, 241, 0.12);
        color: var(--primary-500);
        font-size: 0.7rem;
        padding: 0.15rem 0.4rem;
        border-radius: 4px;
        font-weight: 600;
      }

      /* Side Column Items */
      .birthday-mini-list, .reading-mini-list, .goals-mini-list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .bday-mini-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.7rem 0.85rem;
        border-radius: 10px;
        background: var(--bg-card-subtle);
        border: 1px solid var(--border-color);
      }
      .bday-mini-item.highlight {
        background: rgba(236, 72, 153, 0.08);
        border-color: rgba(236, 72, 153, 0.3);
      }

      .bday-avatar {
        width: 34px;
        height: 34px;
        border-radius: 50%;
        color: white;
        font-weight: 800;
        font-size: 0.85rem;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .bday-details {
        flex: 1;
      }

      .bday-name {
        font-weight: 700;
        font-size: 0.85rem;
        color: var(--text-primary);
        display: flex;
        align-items: center;
        gap: 0.4rem;
      }

      .bday-meta {
        font-size: 0.75rem;
        color: var(--text-muted);
      }

      .days-pill {
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--text-muted);
        background: var(--bg-card);
        padding: 0.2rem 0.5rem;
        border-radius: 6px;
      }

      /* Reading mini item */
      .reading-mini-item {
        padding: 0.75rem 0.9rem;
        border-radius: 10px;
        background: var(--bg-card-subtle);
        border: 1px solid var(--border-color);
      }

      .reading-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.35rem;
      }

      .reading-due {
        font-size: 0.7rem;
        color: var(--text-muted);
      }

      .reading-title {
        font-size: 0.85rem;
        font-weight: 700;
        color: var(--text-primary);
        margin-bottom: 0.5rem;
      }

      .reading-progress-wrap {
        display: flex;
        align-items: center;
        gap: 0.65rem;
      }

      .progress-txt {
        font-size: 0.75rem;
        font-weight: 700;
        color: var(--primary-500);
      }

      /* Goal mini item */
      .goal-mini-item {
        padding: 0.75rem 0.9rem;
        border-radius: 10px;
        background: var(--bg-card-subtle);
        border: 1px solid var(--border-color);
      }

      .goal-meta {
        display: flex;
        justify-content: space-between;
        font-size: 0.75rem;
        margin-bottom: 0.25rem;
      }
      .goal-time {
        font-weight: 700;
        color: var(--text-muted);
      }
      .goal-percent {
        font-weight: 700;
        color: var(--accent-emerald);
      }

      .goal-title {
        font-size: 0.85rem;
        font-weight: 700;
        color: var(--text-primary);
        margin-bottom: 0.4rem;
      }

      @media (max-width: 1024px) {
        .kpi-grid {
          grid-template-columns: repeat(2, 1fr);
        }
        .dashboard-columns {
          grid-template-columns: 1fr;
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
        .brag-grid {
          grid-template-columns: 1fr;
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
