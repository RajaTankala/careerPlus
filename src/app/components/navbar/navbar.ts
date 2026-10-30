import { Component, inject, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StorageService, AppTab, AppTheme } from '../../services/storage.service';
import { ExcelExportService } from '../../services/excel-export.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="navbar-wrapper no-print">
      <div class="navbar-container">
        <!-- Logo & Branding -->
        <div class="brand-group" (click)="storage.setActiveTab('dashboard')" title="CareerPlus - Professional Growth Hub">
          <div class="brand-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2.5C12 2.5 17.5 6.5 17.5 13C17.5 16.5 15.2 18.5 15.2 18.5L12 17L8.8 18.5C8.8 18.5 6.5 16.5 6.5 13C6.5 6.5 12 2.5 12 2.5Z" fill="#ffffff" />
              <circle cx="12" cy="10" r="2.2" fill="#6366f1" />
              <path d="M10.5 19L12 22L13.5 19" stroke="#fef08a" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M19 3V7M17 5H21" stroke="#fef08a" stroke-width="2" stroke-linecap="round" />
            </svg>
          </div>
          <div class="brand-text">
            <span class="brand-name">Career<span class="brand-highlight">Plus</span></span>
            <span class="brand-tag">PRO</span>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <nav class="nav-links">
          <button
            class="nav-tab"
            [class.active]="storage.activeTab() === 'dashboard'"
            (click)="storage.setActiveTab('dashboard')"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="9" rx="1" />
              <rect x="14" y="3" width="7" height="5" rx="1" />
              <rect x="14" y="12" width="7" height="9" rx="1" />
              <rect x="3" y="16" width="7" height="5" rx="1" />
            </svg>
            <span>Dashboard</span>
          </button>

          <button
            class="nav-tab"
            [class.active]="storage.activeTab() === 'work-log'"
            (click)="storage.setActiveTab('work-log')"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
              <path d="m9 14 2 2 4-4" />
            </svg>
            <span>Work Status</span>
            <span class="tab-pill">{{ storage.workItems().length }}</span>
          </button>

          <button
            class="nav-tab"
            [class.active]="storage.activeTab() === 'reading-roadmap'"
            (click)="storage.setActiveTab('reading-roadmap')"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            <span>Reading Roadmap</span>
            @if (storage.overdueReadingTopics().length > 0) {
              <span class="tab-pill warning">{{ storage.overdueReadingTopics().length }}</span>
            }
          </button>

          <button
            class="nav-tab"
            [class.active]="storage.activeTab() === 'circle-birthdays'"
            (click)="storage.setActiveTab('circle-birthdays')"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span>Circle & Birthdays</span>
            @if (storage.todayBirthdays().length > 0) {
              <span class="tab-pill birthday-pulse">🎂 {{ storage.todayBirthdays().length }}</span>
            }
          </button>

          <button
            class="nav-tab"
            [class.active]="storage.activeTab() === 'goals'"
            (click)="storage.setActiveTab('goals')"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="6" />
              <circle cx="12" cy="12" r="2" />
            </svg>
            <span>Career Goals</span>
          </button>
        </nav>

        <!-- Right Side Utility Actions -->
        <div class="nav-actions">
          <!-- Real-time Storage Confirmation Indicator -->
          <div
            class="save-status-pill"
            [class.highlight]="storage.isJustSaved()"
            (click)="storage.verifyStorageIntegrity()"
            title="Click to verify LocalStorage integrity"
          >
            <span class="save-dot"></span>
            <span class="save-text">Saved: {{ storage.lastSavedTime() }}</span>
          </div>

          <!-- Quick Excel Export Button -->
          <button
            class="btn btn-sm btn-excel"
            (click)="exportAllExcel()"
            title="Export complete 5-sheet Excel workbook (.xlsx)"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="8" y1="13" x2="16" y2="13" />
              <line x1="8" y1="17" x2="16" y2="17" />
            </svg>
            <span>Excel (.xlsx)</span>
          </button>

          <!-- Generate Document CTA -->
          <button class="btn btn-primary btn-sm doc-btn" (click)="openDocGenerator.emit()">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
            </svg>
            <span>Doc</span>
          </button>

          <!-- Theme Toggle Button (Dark & Light Only) -->
          <button
            class="btn-icon btn-secondary theme-toggle-btn"
            (click)="storage.toggleTheme()"
            [title]="storage.currentTheme() === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
          >
            @if (storage.currentTheme() === 'dark') {
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            } @else {
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            }
          </button>

          <!-- Notification Bell -->
          <div class="dropdown-container">
            <button
              class="btn-icon btn-secondary notif-btn"
              (click)="showNotifDropdown.set(!showNotifDropdown())"
              title="Notifications"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              @if (storage.unreadNotificationsCount() > 0) {
                <span class="notif-badge">{{ storage.unreadNotificationsCount() }}</span>
              }
            </button>

            <!-- Notifications Dropdown Popup -->
            @if (showNotifDropdown()) {
              <div class="notif-dropdown glass-panel">
                <div class="notif-header">
                  <span class="notif-title">Notifications & Reminders</span>
                  <div class="notif-actions">
                    <button class="text-btn" (click)="storage.markAllNotificationsAsRead()">Mark all read</button>
                    <button class="text-btn text-danger" (click)="storage.clearAllNotifications()">Clear</button>
                  </div>
                </div>

                <div class="notif-body">
                  @if (storage.notifications().length === 0) {
                    <div class="notif-empty">
                      <p>All caught up! No active reminders.</p>
                    </div>
                  } @else {
                    @for (n of storage.notifications(); track n.id) {
                      <div
                        class="notif-item"
                        [class.unread]="!n.read"
                        (click)="handleNotifClick(n)"
                      >
                        <div class="notif-icon-col">
                          @if (n.type === 'birthday') {
                            <span class="icon-bubble pink">🎂</span>
                          } @else if (n.type === 'reading-due' || n.type === 'reading-reminder') {
                            <span class="icon-bubble amber">📚</span>
                          } @else if (n.type === 'work-streak') {
                            <span class="icon-bubble emerald">🔥</span>
                          } @else {
                            <span class="icon-bubble indigo">✨</span>
                          }
                        </div>
                        <div class="notif-info-col">
                          <div class="notif-item-title">{{ n.title }}</div>
                          <div class="notif-item-msg">{{ n.message }}</div>
                          <div class="notif-item-time">{{ formatTime(n.date) }}</div>
                        </div>
                      </div>
                    }
                  }
                </div>
              </div>
            }
          </div>

          <!-- Backup / Data Settings -->
          <button
            class="btn-icon btn-secondary"
            (click)="openBackupModal.emit()"
            title="Storage Manager & Backup"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  `,
  styles: [
    `
      .navbar-wrapper {
        position: sticky;
        top: 0;
        z-index: 50;
        background: var(--glass-bg);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border-bottom: 1px solid var(--border-color);
        transition: background-color 0.25s ease, border-color 0.25s ease;
      }

      .navbar-container {
        max-width: 1380px;
        margin: 0 auto;
        padding: 0.75rem 1.5rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1.5rem;
      }

      .brand-group {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        cursor: pointer;
        user-select: none;
      }

      .brand-icon {
        width: 38px;
        height: 38px;
        border-radius: 10px;
        background: var(--primary-gradient);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
      }

      .brand-text {
        display: flex;
        align-items: center;
        gap: 0.4rem;
      }

      .brand-name {
        font-size: 1.25rem;
        font-weight: 800;
        letter-spacing: -0.02em;
        color: var(--text-primary);
      }

      .brand-highlight {
        background: var(--primary-gradient);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .brand-tag {
        font-size: 0.65rem;
        font-weight: 800;
        background: rgba(99, 102, 241, 0.15);
        color: var(--primary-500);
        padding: 0.15rem 0.4rem;
        border-radius: 6px;
        letter-spacing: 0.05em;
      }

      .nav-links {
        display: flex;
        align-items: center;
        gap: 0.35rem;
        background: var(--bg-card-subtle);
        padding: 0.3rem 0.4rem;
        border-radius: 12px;
        border: 1px solid var(--border-color);
      }

      .nav-tab {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 0.9rem;
        border-radius: 8px;
        border: none;
        background: transparent;
        color: var(--text-secondary);
        font-size: 0.85rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.18s ease;
      }

      .nav-tab:hover {
        color: var(--text-primary);
        background: var(--bg-card-hover);
      }

      .nav-tab.active {
        background: var(--bg-card);
        color: var(--primary-500);
        box-shadow: var(--shadow-sm);
      }

      .tab-pill {
        font-size: 0.7rem;
        font-weight: 700;
        padding: 0.1rem 0.45rem;
        border-radius: 9999px;
        background: rgba(99, 102, 241, 0.15);
        color: var(--primary-500);
      }
      .tab-pill.warning {
        background: rgba(245, 158, 11, 0.18);
        color: #f59e0b;
      }
      .tab-pill.birthday-pulse {
        background: rgba(236, 72, 153, 0.18);
        color: #ec4899;
        animation: pulseSubtle 2s infinite ease-in-out;
      }

      .nav-actions {
        display: flex;
        align-items: center;
        gap: 0.65rem;
      }

      /* Save status confirmation pill */
      .save-status-pill {
        display: flex;
        align-items: center;
        gap: 0.45rem;
        background: var(--bg-card-subtle);
        border: 1px solid var(--border-color);
        padding: 0.35rem 0.75rem;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--text-muted);
        cursor: pointer;
        transition: all 0.2s ease;
        user-select: none;
      }
      .save-status-pill:hover {
        border-color: var(--accent-emerald);
        color: var(--text-primary);
      }
      .save-status-pill.highlight {
        border-color: var(--accent-emerald);
        background: rgba(16, 185, 129, 0.15);
        color: #10b981;
      }

      .save-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: var(--accent-emerald);
        box-shadow: 0 0 6px var(--accent-emerald);
      }

      .dropdown-container {
        position: relative;
      }

      .notif-badge {
        position: absolute;
        top: -4px;
        right: -4px;
        background: var(--accent-rose);
        color: white;
        font-size: 0.65rem;
        font-weight: 800;
        min-width: 18px;
        height: 18px;
        border-radius: 9999px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid var(--bg-app);
      }

      /* Theme dropdown */
      .theme-dropdown {
        position: absolute;
        top: calc(100% + 10px);
        right: 0;
        width: 240px;
        border-radius: 14px;
        overflow: hidden;
        z-index: 100;
        animation: scaleUp 0.15s ease-out;
      }
      .dropdown-header {
        padding: 0.75rem 1rem;
        border-bottom: 1px solid var(--border-color);
        font-size: 0.8rem;
        font-weight: 700;
        color: var(--text-muted);
        text-transform: uppercase;
      }
      .theme-options-list {
        padding: 0.4rem;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }
      .theme-option-row {
        display: flex;
        align-items: center;
        gap: 0.65rem;
        padding: 0.55rem 0.8rem;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.15s ease;
      }
      .theme-option-row:hover {
        background: var(--bg-card-hover);
      }
      .theme-option-row.active {
        background: rgba(99, 102, 241, 0.12);
      }
      .theme-color-dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        box-shadow: 0 0 6px currentColor;
      }
      .theme-name {
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--text-primary);
        flex: 1;
      }
      .theme-check {
        color: var(--primary-500);
        font-weight: 800;
      }

      /* Notifications Dropdown */
      .notif-dropdown {
        position: absolute;
        top: calc(100% + 10px);
        right: 0;
        width: 360px;
        max-height: 440px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        border-radius: 14px;
        box-shadow: var(--shadow-xl);
        z-index: 100;
      }

      .notif-header {
        padding: 0.9rem 1.1rem;
        border-bottom: 1px solid var(--border-color);
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .notif-title {
        font-weight: 700;
        font-size: 0.9rem;
        color: var(--text-primary);
      }

      .text-btn {
        background: transparent;
        border: none;
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--primary-500);
        cursor: pointer;
        padding: 0.2rem 0.4rem;
        border-radius: 4px;
      }
      .text-btn:hover { background: var(--bg-card-hover); }
      .text-btn.text-danger { color: var(--accent-rose); }

      .notif-body {
        overflow-y: auto;
        max-height: 360px;
      }

      .notif-empty {
        padding: 2.5rem 1.5rem;
        text-align: center;
        color: var(--text-muted);
        font-size: 0.85rem;
      }

      .notif-item {
        display: flex;
        gap: 0.75rem;
        padding: 0.85rem 1.1rem;
        border-bottom: 1px solid var(--border-color);
        cursor: pointer;
        transition: background-color 0.15s ease;
      }
      .notif-item:hover { background: var(--bg-card-hover); }
      .notif-item.unread { background: rgba(99, 102, 241, 0.05); }

      .icon-bubble {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1rem;
      }
      .icon-bubble.pink { background: rgba(236, 72, 153, 0.15); }
      .icon-bubble.amber { background: rgba(245, 158, 11, 0.15); }
      .icon-bubble.emerald { background: rgba(16, 185, 129, 0.15); }
      .icon-bubble.indigo { background: rgba(99, 102, 241, 0.15); }

      .notif-info-col { flex: 1; }
      .notif-item-title {
        font-size: 0.825rem;
        font-weight: 700;
        color: var(--text-primary);
        margin-bottom: 0.15rem;
      }
      .notif-item-msg {
        font-size: 0.775rem;
        color: var(--text-secondary);
        line-height: 1.4;
      }
      .notif-item-time {
        font-size: 0.7rem;
        color: var(--text-muted);
        margin-top: 0.25rem;
      }

      @media (max-width: 900px) {
        .nav-links { display: none; }
      }
    `,
  ],
})
export class NavbarComponent {
  public readonly storage = inject(StorageService);
  public readonly excelService = inject(ExcelExportService);

  public readonly showNotifDropdown = signal(false);

  public readonly openDocGenerator = output<void>();
  public readonly openBackupModal = output<void>();

  public exportAllExcel(): void {
    this.excelService.exportCompleteWorkspace(
      this.storage.workItems(),
      this.storage.readingTopics(),
      this.storage.birthdayCountdowns(),
      this.storage.careerGoals(),
      this.storage.userProfile().name
    );
  }

  public handleNotifClick(notif: any): void {
    this.storage.markNotificationAsRead(notif.id);
    if (notif.actionTab) {
      this.storage.setActiveTab(notif.actionTab);
      this.showNotifDropdown.set(false);
    }
  }

  public formatTime(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }
}
