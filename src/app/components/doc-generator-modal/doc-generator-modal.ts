import { Component, inject, signal, computed, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StorageService } from '../../services/storage.service';
import { DocumentGeneratorService } from '../../services/document-generator.service';
import { ExcelExportService } from '../../services/excel-export.service';
import { DocumentGenerationOptions, DocumentReportType } from '../../models/document-template.model';

@Component({
  selector: 'app-doc-generator-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-backdrop" (click)="close.emit()">
      <div class="modal-dialog doc-dialog" (click)="$event.stopPropagation()">
        <!-- Header -->
        <div class="modal-header">
          <div class="header-left">
            <span class="doc-icon">📄</span>
            <div>
              <h2 class="modal-title">Executive Status & Career Document Generator</h2>
              <p class="header-desc">Generate professional reports from your work logs, reading milestones, and accomplishments.</p>
            </div>
          </div>
          <button class="btn-icon btn-secondary btn-sm" (click)="close.emit()">✕</button>
        </div>

        <div class="modal-body doc-body">
          <!-- Left Control Panel -->
          <div class="config-panel">
            <div class="form-group">
              <label class="form-label">Select Report Template</label>
              <div class="template-selector">
                <button
                  class="template-card"
                  [class.active]="selectedType() === 'daily-standup'"
                  (click)="setReportType('daily-standup')"
                >
                  <div class="template-name">⚡ Daily Standup</div>
                  <div class="template-sub">Completed, Today's focus & blockers</div>
                </button>

                <button
                  class="template-card"
                  [class.active]="selectedType() === 'weekly-sprint'"
                  (click)="setReportType('weekly-sprint')"
                >
                  <div class="template-name">📊 Weekly Sprint Report</div>
                  <div class="template-sub">Summary, deliverable metrics & roadmap</div>
                </button>

                <button
                  class="template-card"
                  [class.active]="selectedType() === 'monthly-career-brag'"
                  (click)="setReportType('monthly-career-brag')"
                >
                  <div class="template-name">🌟 Monthly Brag Document</div>
                  <div class="template-sub">Impact wins, reading progress & leadership</div>
                </button>

                <button
                  class="template-card"
                  [class.active]="selectedType() === 'performance-appraisal'"
                  (click)="setReportType('performance-appraisal')"
                >
                  <div class="template-name">🎯 Performance Appraisal</div>
                  <div class="template-sub">Comprehensive promotion & self-review</div>
                </button>
              </div>
            </div>

            <!-- Parameters -->
            <div class="form-group">
              <label class="form-label">Document Title</label>
              <input type="text" class="form-control" [(ngModel)]="docTitle" />
            </div>

            <div class="form-row">
              <div class="form-group flex-1">
                <label class="form-label">Author Name</label>
                <input type="text" class="form-control" [(ngModel)]="authorName" />
              </div>
              <div class="form-group flex-1">
                <label class="form-label">Role / Title</label>
                <input type="text" class="form-control" [(ngModel)]="authorRole" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group flex-1">
                <label class="form-label">Start Date</label>
                <input type="date" class="form-control" [(ngModel)]="startDate" />
              </div>
              <div class="form-group flex-1">
                <label class="form-label">End Date</label>
                <input type="date" class="form-control" [(ngModel)]="endDate" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Executive Summary / Opening Note (Optional)</label>
              <textarea
                class="form-control"
                rows="2"
                placeholder="High level overview of what was achieved in this period..."
                [(ngModel)]="customSummary"
              ></textarea>
            </div>

            <div class="form-group">
              <label class="form-label">Include Sections</label>
              <div class="checkbox-group">
                <label class="checkbox-label">
                  <input type="checkbox" [(ngModel)]="includeMetrics" />
                  <span>Key KPI Metrics & Hours</span>
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" [(ngModel)]="includeBlockers" />
                  <span>Blockers & Dependencies</span>
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" [(ngModel)]="includeReadingProgress" />
                  <span>Technical Reading & Study Progress</span>
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" [(ngModel)]="includeSkills" />
                  <span>Skills & Competencies Matrix</span>
                </label>
              </div>
            </div>

            <div class="matched-items-pill">
              Found <strong>{{ matchingWorkItems().length }}</strong> work items & 
              <strong>{{ matchingReadingTopics().length }}</strong> reading topics in date range
            </div>
          </div>

          <!-- Right Document Live Preview -->
          <div class="preview-panel">
            <div class="preview-top-bar">
              <div class="preview-title">Live Document Preview</div>
              <div class="format-toggle">
                <button
                  class="format-btn"
                  [class.active]="previewMode() === 'formatted'"
                  (click)="previewMode.set('formatted')"
                >
                  Formatted HTML
                </button>
                <button
                  class="format-btn"
                  [class.active]="previewMode() === 'markdown'"
                  (click)="previewMode.set('markdown')"
                >
                  Raw Markdown
                </button>
              </div>
            </div>

            <div class="preview-scroll-wrapper">
              @if (previewMode() === 'formatted') {
                <div class="html-document-preview" [innerHTML]="renderedHtmlPreview()"></div>
              } @else {
                <pre class="markdown-preview">{{ renderedMarkdownPreview() }}</pre>
              }
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="modal-footer doc-footer">
          @if (copySuccess()) {
            <span class="copy-toast">✓ Copied formatted markdown to clipboard!</span>
          }

          <button class="btn btn-outline" (click)="copyMarkdown()">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            <span>Copy Markdown</span>
          </button>

          <button class="btn btn-secondary" (click)="downloadMarkdown()">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Download .MD</span>
          </button>

          <button class="btn btn-secondary" (click)="downloadWordDoc()">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            <span>Word (.doc)</span>
          </button>

          <button class="btn btn-excel" (click)="downloadExcel()">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="8" y1="13" x2="16" y2="13" />
              <line x1="8" y1="17" x2="16" y2="17" />
            </svg>
            <span>Excel (.xlsx)</span>
          </button>

          <button class="btn btn-primary" (click)="triggerPrint()">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .doc-dialog {
        max-width: 1200px;
        width: 95vw;
        height: 90vh;
      }

      .header-left {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }
      .doc-icon {
        font-size: 1.8rem;
      }
      .header-desc {
        font-size: 0.8rem;
        color: var(--text-muted);
        margin-top: 0.15rem;
      }

      .doc-body {
        display: grid;
        grid-template-columns: 420px 1fr;
        padding: 0;
        overflow: hidden;
      }

      /* Config Panel */
      .config-panel {
        padding: 1.5rem;
        background: var(--bg-card-subtle);
        border-right: 1px solid var(--border-color);
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 0.85rem;
      }

      .template-selector {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 0.5rem;
      }

      .template-card {
        padding: 0.65rem 0.8rem;
        border-radius: 8px;
        border: 1px solid var(--border-color);
        background: var(--bg-card);
        text-align: left;
        cursor: pointer;
        transition: all 0.15s ease;
      }
      .template-card:hover {
        border-color: var(--primary-500);
      }
      .template-card.active {
        border-color: var(--primary-500);
        background: rgba(99, 102, 241, 0.1);
      }

      .template-name {
        font-size: 0.825rem;
        font-weight: 700;
        color: var(--text-primary);
      }
      .template-sub {
        font-size: 0.7rem;
        color: var(--text-muted);
        margin-top: 0.15rem;
      }

      .form-row {
        display: flex;
        gap: 0.75rem;
      }
      .flex-1 { flex: 1; }

      .checkbox-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        background: var(--bg-card);
        padding: 0.75rem 1rem;
        border-radius: 8px;
        border: 1px solid var(--border-color);
      }

      .checkbox-label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.825rem;
        color: var(--text-secondary);
        cursor: pointer;
      }

      .matched-items-pill {
        font-size: 0.775rem;
        color: var(--primary-500);
        background: rgba(99, 102, 241, 0.1);
        border: 1px solid rgba(99, 102, 241, 0.2);
        padding: 0.45rem 0.75rem;
        border-radius: 6px;
        text-align: center;
      }

      /* Preview Panel */
      .preview-panel {
        display: flex;
        flex-direction: column;
        background: var(--bg-card);
        overflow: hidden;
      }

      .preview-top-bar {
        padding: 0.75rem 1.25rem;
        border-bottom: 1px solid var(--border-color);
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .preview-title {
        font-size: 0.85rem;
        font-weight: 700;
        color: var(--text-secondary);
      }

      .format-toggle {
        display: flex;
        background: var(--bg-card-subtle);
        border: 1px solid var(--border-color);
        padding: 0.2rem;
        border-radius: 6px;
      }

      .format-btn {
        padding: 0.25rem 0.65rem;
        border-radius: 4px;
        border: none;
        background: transparent;
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--text-muted);
        cursor: pointer;
      }
      .format-btn.active {
        background: var(--bg-card);
        color: var(--primary-500);
        box-shadow: var(--shadow-sm);
      }

      .preview-scroll-wrapper {
        flex: 1;
        overflow-y: auto;
        padding: 1.5rem;
        background: #f8fafc;
        color: #0f172a;
      }

      .html-document-preview {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 2rem;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        color: #1e293b;
      }

      .markdown-preview {
        background: #0f172a;
        color: #f8fafc;
        padding: 1.5rem;
        border-radius: 8px;
        font-family: var(--font-mono);
        font-size: 0.825rem;
        line-height: 1.5;
        white-space: pre-wrap;
      }

      /* Footer */
      .doc-footer {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 0.75rem;
      }

      .copy-toast {
        color: #10b981;
        font-size: 0.825rem;
        font-weight: 600;
        margin-right: auto;
      }

      @media (max-width: 900px) {
        .doc-body {
          grid-template-columns: 1fr;
        }
        .config-panel {
          border-right: none;
          border-bottom: 1px solid var(--border-color);
        }
      }
    `,
  ],
})
export class DocGeneratorModalComponent {
  public readonly storage = inject(StorageService);
  public readonly docService = inject(DocumentGeneratorService);
  public readonly excelService = inject(ExcelExportService);

  public readonly close = output<void>();

  // State
  public readonly selectedType = signal<DocumentReportType>('weekly-sprint');
  public readonly previewMode = signal<'formatted' | 'markdown'>('formatted');
  public readonly copySuccess = signal(false);

  // Form parameters
  public docTitle = 'Weekly Sprint Engineering Status & Highlights';
  public authorName = this.storage.userProfile().name;
  public authorRole = this.storage.userProfile().role;
  public startDate = '';
  public endDate = this.storage.todayDateString();
  public customSummary = 'Focused on high-performance reactive signal architecture, CI/CD pipeline reliability, and technical mentorship.';
  public includeMetrics = true;
  public includeBlockers = true;
  public includeReadingProgress = true;
  public includeSkills = true;

  constructor() {
    // Default start date to 7 days ago
    const past = new Date();
    past.setDate(past.getDate() - 7);
    this.startDate = past.toISOString().split('T')[0];
  }

  public setReportType(type: DocumentReportType): void {
    this.selectedType.set(type);
    const today = this.storage.todayDateString();

    switch (type) {
      case 'daily-standup':
        this.docTitle = `Daily Engineering Standup (${today})`;
        this.startDate = today;
        this.endDate = today;
        this.customSummary = '';
        break;
      case 'weekly-sprint':
        this.docTitle = `Weekly Engineering Status & Accomplishments`;
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        this.startDate = weekAgo.toISOString().split('T')[0];
        this.endDate = today;
        break;
      case 'monthly-career-brag':
        this.docTitle = `Monthly Career Impact & Brag Document (${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })})`;
        const monthAgo = new Date();
        monthAgo.setDate(monthAgo.getDate() - 30);
        this.startDate = monthAgo.toISOString().split('T')[0];
        this.endDate = today;
        this.customSummary = 'Major contributions to platform stability, architecture modernization, and knowledge distribution.';
        break;
      case 'performance-appraisal':
        this.docTitle = `Engineering Self-Appraisal & Career Progression Review`;
        const quarterAgo = new Date();
        quarterAgo.setDate(quarterAgo.getDate() - 90);
        this.startDate = quarterAgo.toISOString().split('T')[0];
        this.endDate = today;
        this.customSummary = 'Demonstrated Staff-level technical leadership, improved developer velocity across teams, and synthesized key distributed systems literature.';
        break;
    }
  }

  public readonly matchingWorkItems = computed(() => {
    const s = this.startDate;
    const e = this.endDate;
    return this.storage.sortedWorkItems().filter((item) => {
      if (s && item.date < s) return false;
      if (e && item.date > e) return false;
      return true;
    });
  });

  public readonly matchingReadingTopics = computed(() => {
    return this.storage.readingTopics();
  });

  public readonly currentOptions = computed<DocumentGenerationOptions>(() => {
    return {
      reportType: this.selectedType(),
      title: this.docTitle,
      authorName: this.authorName,
      authorRole: this.authorRole,
      startDate: this.startDate,
      endDate: this.endDate,
      includeMetrics: this.includeMetrics,
      includeBlockers: this.includeBlockers,
      includeReadingProgress: this.includeReadingProgress,
      includeSkills: this.includeSkills,
      customExecutiveSummary: this.customSummary,
    };
  });

  public readonly renderedHtmlPreview = computed(() => {
    return this.docService.generateHtmlDocument(
      this.currentOptions(),
      this.matchingWorkItems(),
      this.matchingReadingTopics()
    );
  });

  public readonly renderedMarkdownPreview = computed(() => {
    return this.docService.generateMarkdown(
      this.currentOptions(),
      this.matchingWorkItems(),
      this.matchingReadingTopics()
    );
  });

  public async copyMarkdown(): Promise<void> {
    const text = this.renderedMarkdownPreview();
    const success = await this.docService.copyToClipboard(text);
    if (success) {
      this.copySuccess.set(true);
      setTimeout(() => this.copySuccess.set(false), 3000);
    }
  }

  public downloadMarkdown(): void {
    this.docService.downloadAsMarkdown(
      this.currentOptions(),
      this.matchingWorkItems(),
      this.matchingReadingTopics()
    );
  }

  public downloadWordDoc(): void {
    this.docService.downloadAsWord(
      this.currentOptions(),
      this.matchingWorkItems(),
      this.matchingReadingTopics()
    );
  }

  public triggerPrint(): void {
    this.docService.printDocument(
      this.currentOptions(),
      this.matchingWorkItems(),
      this.matchingReadingTopics()
    );
  }

  public downloadExcel(): void {
    this.excelService.exportWorkItemsOnly(
      this.matchingWorkItems(),
      this.docTitle.replace(/[^a-zA-Z0-9]/g, '_')
    );
  }
}
