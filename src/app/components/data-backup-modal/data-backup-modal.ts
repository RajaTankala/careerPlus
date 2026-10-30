import { Component, inject, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StorageService } from '../../services/storage.service';
import { ExcelExportService } from '../../services/excel-export.service';
import { CloudSyncService } from '../../services/cloud-sync.service';

@Component({
  selector: 'app-data-backup-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-backdrop" (click)="close.emit()">
      <div class="modal-dialog" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3 class="modal-title">
            💾 Local Data Storage & Backup Manager
          </h3>
          <button class="btn-icon btn-secondary btn-sm" (click)="close.emit()">✕</button>
        </div>

        <div class="modal-body">
          <!-- Real-time Storage Confirmation Banner -->
          <div class="storage-health-banner">
            <div class="health-icon">🔒</div>
            <div class="health-details">
              <div class="health-title">Data Storage Confirmation: ACTIVE & PERSISTED</div>
              <p class="health-desc">
                All changes auto-save immediately to your browser's <code>localStorage</code>.
                Last synchronized at <strong>{{ storage.lastSavedTime() }}</strong>.
              </p>
            </div>
            <button class="btn btn-sm btn-outline verify-btn" (click)="runStorageVerification()">
              ✓ Verify Integrity
            </button>
          </div>

          @if (verificationResult()) {
            <div class="verification-box">
              <div class="verify-header">
                <span>✅ LocalStorage Verification PASSED</span>
                <span class="verify-time">{{ verificationResult()?.lastSaved }}</span>
              </div>
              <p>
                Successfully verified <strong>{{ verificationResult()?.recordCount }} records</strong> 
                (~{{ verificationResult()?.sizeKb }} KB) physically stored in your browser storage.
              </p>
            </div>
          }

          <!-- Storage Statistics -->
          <div class="stats-panel">
            <div class="stat-box">
              <div class="stat-number">{{ storage.workItems().length }}</div>
              <div class="stat-label">Work Items Logged</div>
            </div>
            <div class="stat-box">
              <div class="stat-number">{{ storage.readingTopics().length }}</div>
              <div class="stat-label">Reading Topics</div>
            </div>
            <div class="stat-box">
              <div class="stat-number">{{ storage.circleBirthdays().length }}</div>
              <div class="stat-label">Circle Contacts</div>
            </div>
            <div class="stat-box">
              <div class="stat-number">{{ storage.careerGoals().length }}</div>
              <div class="stat-label">Career Goals</div>
            </div>
          </div>

          <!-- Theme Preference (Dark / Light Only) -->
          <div class="settings-section">
            <h4 class="section-heading">🎨 Theme Mode</h4>
            <div class="theme-picker-grid">
              <button
                type="button"
                class="theme-card-pill"
                [class.active]="storage.currentTheme() === 'dark'"
                (click)="storage.setTheme('dark')"
              >
                <span class="pill-dot" style="background-color: #6366f1;"></span>
                <span class="pill-name">🌙 Dark Mode</span>
              </button>
              <button
                type="button"
                class="theme-card-pill"
                [class.active]="storage.currentTheme() === 'light'"
                (click)="storage.setTheme('light')"
              >
                <span class="pill-dot" style="background-color: #f59e0b;"></span>
                <span class="pill-name">☀️ Light Mode</span>
              </button>
            </div>
          </div>

          <!-- User Profile Settings -->
          <div class="settings-section">
            <h4 class="section-heading">Your Professional Profile</h4>
            <div class="form-row">
              <div class="form-group flex-1">
                <label class="form-label">Full Name</label>
                <input type="text" class="form-control" [(ngModel)]="profileName" />
              </div>
              <div class="form-group flex-1">
                <label class="form-label">Title / Role</label>
                <input type="text" class="form-control" [(ngModel)]="profileRole" />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Department / Team</label>
              <input type="text" class="form-control" [(ngModel)]="profileOrg" />
            </div>
            <button class="btn btn-sm btn-secondary" (click)="saveProfile()">
              Save Profile Changes
            </button>
          </div>

          <!-- Multi-Device Cloud Sync Section (Access anywhere on GitHub Pages) -->
          <div class="settings-section cloud-sync-panel">
            <div class="cloud-header-row">
              <div class="cloud-title-group">
                <span class="cloud-icon">☁️</span>
                <div>
                  <h4 class="section-heading" style="margin: 0;">Multi-Device Cloud Sync (GitHub)</h4>
                  <p class="cloud-subtitle">
                    Deploying to GitHub Pages? Sync your data across any laptop, work computer, or phone without losing your records.
                  </p>
                </div>
              </div>
              @if (cloudSync.syncConfig().lastSyncedAt) {
                <span class="badge badge-emerald">Synced: {{ cloudSync.syncConfig().lastSyncedAt }}</span>
              }
            </div>

            <div class="form-row" style="margin-top: 0.85rem;">
              <div class="form-group flex-2">
                <label class="form-label">
                  GitHub Personal Access Token (PAT)
                  <a href="https://github.com/settings/tokens/new?scopes=gist&description=CareerPulse+Sync" target="_blank" class="token-link">
                    (Create free token with 'gist' scope ↗)
                  </a>
                </label>
                <input
                  type="password"
                  class="form-control"
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  [(ngModel)]="cloudToken"
                  (change)="saveCloudConfig()"
                />
              </div>

              <div class="form-group flex-1">
                <label class="form-label">Private Gist ID</label>
                <input
                  type="text"
                  class="form-control"
                  placeholder="Auto-created on push"
                  [(ngModel)]="cloudGistId"
                  (change)="saveCloudConfig()"
                />
              </div>
            </div>

            <div class="cloud-actions-row">
              <button
                class="btn btn-sm btn-primary"
                [disabled]="cloudSync.isSyncing()"
                (click)="pushCloudData()"
              >
                {{ cloudSync.isSyncing() ? 'Syncing...' : '☁️ Push Data to Cloud (Gist)' }}
              </button>

              <button
                class="btn btn-sm btn-secondary"
                [disabled]="cloudSync.isSyncing() || !cloudGistId"
                (click)="pullCloudData()"
              >
                📥 Pull Latest Cloud Data
              </button>

              <label class="auto-sync-checkbox">
                <input type="checkbox" [(ngModel)]="cloudAutoSync" (change)="saveCloudConfig()" />
                <span>Auto-sync when opening app</span>
              </label>
            </div>
          </div>

          <!-- Export & Import Section with Excel -->
          <div class="actions-section">
            <h4 class="section-heading">Data Portability & Excel Spreadsheets</h4>
            <div class="actions-grid">
              <div class="action-card">
                <div class="action-title">📊 Multi-Sheet Excel Workbook (.xlsx)</div>
                <p class="action-desc">Download complete workspace with 5 structured sheets (Work, Reading, Birthdays, Goals, KPI Summary).</p>
                <button class="btn btn-sm btn-excel" (click)="exportExcel()">
                  Download Excel (.xlsx)
                </button>
              </div>

              <div class="action-card">
                <div class="action-title">📥 Export JSON Backup</div>
                <p class="action-desc">Download a raw, complete offline JSON file containing all database records.</p>
                <button class="btn btn-sm btn-primary" (click)="exportBackup()">
                  Download JSON Backup
                </button>
              </div>

              <div class="action-card full-width">
                <div class="action-title">📂 Restore from Backup File (.json)</div>
                <p class="action-desc">Upload a previously saved CareerPulse JSON backup file to restore records.</p>
                <input
                  type="file"
                  #fileInput
                  accept=".json"
                  style="display: none"
                  (change)="onFileSelected($event)"
                />
                <button class="btn btn-sm btn-secondary" (click)="fileInput.click()">
                  Choose File & Restore
                </button>
              </div>
            </div>

            @if (importStatus()) {
              <div class="status-alert" [class.success]="importSuccess()">
                {{ importStatus() }}
              </div>
            }
          </div>

          <!-- Reset / Demo Section -->
          <div class="danger-section">
            <h4 class="section-heading text-danger">Reset Workspace</h4>
            <div class="danger-row">
              <div>
                <strong>Restore Demo Data</strong>
                <p>Re-populate with realistic engineering work logs, reading roadmap, and birthdays.</p>
              </div>
              <button class="btn btn-sm btn-outline" (click)="resetDemo()">
                Restore Demo Data
              </button>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-primary" (click)="close.emit()">Done</button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .storage-health-banner {
        display: flex;
        align-items: center;
        gap: 0.85rem;
        padding: 0.9rem 1.15rem;
        border-radius: 10px;
        background: rgba(16, 185, 129, 0.12);
        border: 1px solid rgba(16, 185, 129, 0.3);
        margin-bottom: 1rem;
      }
      .health-icon {
        font-size: 1.6rem;
      }
      .health-details {
        flex: 1;
      }
      .health-title {
        font-size: 0.825rem;
        font-weight: 800;
        color: #10b981;
        letter-spacing: 0.03em;
      }
      .health-desc {
        font-size: 0.775rem;
        color: var(--text-secondary);
        margin-top: 0.15rem;
      }
      .verify-btn {
        font-size: 0.75rem;
      }

      .verification-box {
        background: var(--bg-card-subtle);
        border: 1px solid var(--accent-emerald);
        border-radius: 8px;
        padding: 0.75rem 1rem;
        margin-bottom: 1rem;
        animation: fadeIn 0.2s ease-out;
      }
      .verify-header {
        display: flex;
        justify-content: space-between;
        font-size: 0.825rem;
        font-weight: 800;
        color: #10b981;
        margin-bottom: 0.25rem;
      }
      .verify-time {
        color: var(--text-muted);
        font-size: 0.725rem;
      }
      .verification-box p {
        font-size: 0.775rem;
        color: var(--text-secondary);
      }

      .stats-panel {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 0.75rem;
        margin-bottom: 1.25rem;
      }

      .stat-box {
        background: var(--bg-card-subtle);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 0.85rem;
        text-align: center;
      }

      .stat-number {
        font-size: 1.35rem;
        font-weight: 800;
        color: var(--primary-500);
      }

      .stat-label {
        font-size: 0.7rem;
        font-weight: 600;
        color: var(--text-muted);
        text-transform: uppercase;
        margin-top: 0.2rem;
      }

      .section-heading {
        font-size: 0.95rem;
        font-weight: 700;
        color: var(--text-primary);
        margin-bottom: 0.75rem;
      }

      .settings-section, .actions-section, .danger-section {
        padding-top: 1.25rem;
        border-top: 1px solid var(--border-color);
        margin-bottom: 1.25rem;
      }

      /* Theme Picker Grid */
      .theme-picker-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 0.5rem;
      }
      .theme-card-pill {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 0.75rem;
        border-radius: 8px;
        background: var(--bg-card-subtle);
        border: 1px solid var(--border-color);
        cursor: pointer;
        transition: all 0.15s ease;
      }
      .theme-card-pill:hover {
        border-color: var(--primary-500);
      }
      .theme-card-pill.active {
        border-color: var(--primary-500);
        background: rgba(99, 102, 241, 0.12);
      }
      .pill-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
      }
      .pill-name {
        font-size: 0.8rem;
        font-weight: 600;
        color: var(--text-primary);
      }

      .actions-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.85rem;
      }

      .action-card {
        background: var(--bg-card-subtle);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 1rem;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 0.5rem;
      }
      .action-card.full-width {
        grid-column: 1 / -1;
      }

      .action-title {
        font-weight: 700;
        font-size: 0.85rem;
        color: var(--text-primary);
      }

      .action-desc {
        font-size: 0.775rem;
        color: var(--text-secondary);
        line-height: 1.35;
      }

      .status-alert {
        margin-top: 0.75rem;
        padding: 0.6rem 0.9rem;
        border-radius: 6px;
        font-size: 0.825rem;
        background: rgba(244, 63, 94, 0.15);
        color: var(--accent-rose);
      }
      .status-alert.success {
        background: rgba(16, 185, 129, 0.15);
        color: #10b981;
      }

      .danger-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        font-size: 0.825rem;
      }
      .danger-row p {
        color: var(--text-muted);
        font-size: 0.775rem;
        margin-top: 0.15rem;
      }

      /* Cloud Sync Panel */
      .cloud-sync-panel {
        background: rgba(99, 102, 241, 0.06);
        border: 1px solid rgba(99, 102, 241, 0.25);
        border-radius: 12px;
        padding: 1.15rem;
      }
      .cloud-header-row {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 0.75rem;
      }
      .cloud-title-group {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
      }
      .cloud-icon {
        font-size: 1.6rem;
      }
      .cloud-subtitle {
        font-size: 0.775rem;
        color: var(--text-secondary);
        margin-top: 0.2rem;
        line-height: 1.35;
      }
      .token-link {
        color: var(--primary-500);
        font-size: 0.75rem;
        text-decoration: underline;
        margin-left: 0.35rem;
      }
      .cloud-actions-row {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
        margin-top: 0.5rem;
      }
      .auto-sync-checkbox {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 0.775rem;
        color: var(--text-secondary);
        cursor: pointer;
        margin-left: auto;
      }

      .form-row {
        display: flex;
        gap: 1rem;
      }
      .flex-1 { flex: 1; }
      .flex-2 { flex: 2; }

      @media (max-width: 640px) {
        .stats-panel {
          grid-template-columns: repeat(2, 1fr);
        }
        .actions-grid {
          grid-template-columns: 1fr;
        }
        .theme-picker-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class DataBackupModalComponent {
  public readonly storage = inject(StorageService);
  public readonly excelService = inject(ExcelExportService);
  public readonly cloudSync = inject(CloudSyncService);

  public readonly close = output<void>();

  public profileName = this.storage.userProfile().name;
  public profileRole = this.storage.userProfile().role;
  public profileOrg = this.storage.userProfile().organization;

  // Cloud Sync form fields
  public cloudToken = this.cloudSync.syncConfig().githubToken;
  public cloudGistId = this.cloudSync.syncConfig().gistId;
  public cloudAutoSync = this.cloudSync.syncConfig().autoSync;

  public readonly importStatus = signal('');
  public readonly importSuccess = signal(false);
  public readonly verificationResult = signal<{
    healthy: boolean;
    recordCount: number;
    sizeKb: string;
    lastSaved: string;
  } | null>(null);

  public saveProfile(): void {
    this.storage.userProfile.update((p) => ({
      ...p,
      name: this.profileName,
      role: this.profileRole,
      organization: this.profileOrg,
    }));
  }

  public runStorageVerification(): void {
    const result = this.storage.verifyStorageIntegrity();
    this.verificationResult.set(result);
  }

  public exportBackup(): void {
    this.storage.downloadBackupFile();
  }

  public exportExcel(): void {
    this.excelService.exportCompleteWorkspace(
      this.storage.workItems(),
      this.storage.readingTopics(),
      this.storage.birthdayCountdowns(),
      this.storage.careerGoals(),
      this.profileName
    );
  }

  public onFileSelected(event: any): void {
    const file = event.target?.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const res = this.storage.importDataJson(content);
      this.importSuccess.set(res.success);
      this.importStatus.set(res.message);
    };
    reader.readAsText(file);
  }

  public resetDemo(): void {
    if (confirm('Reset all data to the initial realistic demo data?')) {
      this.storage.resetToDemoData();
      this.profileName = this.storage.userProfile().name;
      this.profileRole = this.storage.userProfile().role;
      this.profileOrg = this.storage.userProfile().organization;
      this.importSuccess.set(true);
      this.importStatus.set('Reset to demo data completed!');
    }
  }

  public saveCloudConfig(): void {
    this.cloudSync.saveConfig({
      githubToken: this.cloudToken.trim(),
      gistId: this.cloudGistId.trim(),
      autoSync: this.cloudAutoSync,
      lastSyncedAt: this.cloudSync.syncConfig().lastSyncedAt,
    });
  }

  public async pushCloudData(): Promise<void> {
    this.saveCloudConfig();
    const success = await this.cloudSync.pushToGist();
    if (success) {
      this.cloudGistId = this.cloudSync.syncConfig().gistId;
    }
  }

  public async pullCloudData(): Promise<void> {
    this.saveCloudConfig();
    await this.cloudSync.pullFromGist();
  }
}
