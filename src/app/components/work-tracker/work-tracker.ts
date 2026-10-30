import { Component, inject, signal, computed, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StorageService } from '../../services/storage.service';
import { ExcelExportService } from '../../services/excel-export.service';
import { WorkItem, WorkStatus, WorkCategory, ImpactLevel } from '../../models/work-item.model';

@Component({
  selector: 'app-work-tracker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="work-tracker-page">
      <!-- Page Header -->
      <div class="tracker-header">
        <div>
          <h1 class="page-title">Work Status & Achievement Tracker</h1>
          <p class="page-subtitle">
            Log daily engineering tasks, capture high-impact accomplishments, and turn raw updates into executive documents.
          </p>
        </div>
        <div class="header-actions">
          <button class="btn btn-excel btn-sm" (click)="exportFilteredExcel()">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="8" y1="13" x2="16" y2="13" />
              <line x1="8" y1="17" x2="16" y2="17" />
            </svg>
            <span>Export Excel</span>
          </button>

          <button class="btn btn-outline btn-sm" (click)="openDocGenerator.emit()">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            <span>Generate Doc</span>
          </button>

          <button class="btn btn-primary btn-sm" (click)="openCreateModal()">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>+ Log Item</span>
          </button>
        </div>
      </div>

      <!-- Filters & Search Toolbar -->
      <div class="filter-card glass-panel">
        <div class="filter-row">
          <!-- Search input -->
          <div class="search-box">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              class="search-input"
              placeholder="Search by project, title, skill, or keyword..."
              [ngModel]="searchQuery()"
              (ngModelChange)="searchQuery.set($event)"
            />
            @if (searchQuery()) {
              <button class="clear-btn" (click)="searchQuery.set('')">×</button>
            }
          </div>

          <!-- Date Preset Tabs -->
          <div class="date-tabs">
            <button
              class="date-tab-btn"
              [class.active]="dateFilter() === 'all'"
              (click)="dateFilter.set('all')"
            >
              All Time
            </button>
            <button
              class="date-tab-btn"
              [class.active]="dateFilter() === 'today'"
              (click)="dateFilter.set('today')"
            >
              Today
            </button>
            <button
              class="date-tab-btn"
              [class.active]="dateFilter() === 'this-week'"
              (click)="dateFilter.set('this-week')"
            >
              This Week
            </button>
            <button
              class="date-tab-btn"
              [class.active]="dateFilter() === 'this-month'"
              (click)="dateFilter.set('this-month')"
            >
              This Month
            </button>
          </div>
        </div>

        <div class="filter-subrow">
          <!-- Status Filter -->
          <div class="dropdown-filter">
            <label>Status:</label>
            <select [ngModel]="statusFilter()" (ngModelChange)="statusFilter.set($event)">
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="in-progress">In Progress</option>
              <option value="blocked">Blocked</option>
              <option value="planned">Planned</option>
            </select>
          </div>

          <!-- Category Filter -->
          <div class="dropdown-filter">
            <label>Category:</label>
            <select [ngModel]="categoryFilter()" (ngModelChange)="categoryFilter.set($event)">
              <option value="all">All Categories</option>
              <option value="architecture">Architecture</option>
              <option value="feature">Feature</option>
              <option value="bugfix">Bugfix</option>
              <option value="code-review">Code Review</option>
              <option value="devops">DevOps</option>
              <option value="research">Research</option>
              <option value="documentation">Documentation</option>
              <option value="meeting">Meeting</option>
            </select>
          </div>

          <!-- Impact Filter -->
          <div class="dropdown-filter">
            <label>Impact:</label>
            <select [ngModel]="impactFilter()" (ngModelChange)="impactFilter.set($event)">
              <option value="all">All Impact Levels</option>
              <option value="brag-worthy">🌟 Brag Worthy</option>
              <option value="high">⚡ High Impact</option>
              <option value="medium">Medium</option>
              <option value="routine">Routine</option>
            </select>
          </div>

          <div class="filter-stats-pill">
            Showing <strong>{{ filteredWorkItems().length }}</strong> items • 
            <strong>{{ totalFilteredHours() }}</strong> focus hours
          </div>
        </div>
      </div>

      <!-- Work Items List -->
      <div class="items-container">
        @if (filteredWorkItems().length === 0) {
          <div class="card empty-container">
            <div class="empty-icon">📂</div>
            <h3>No work items found</h3>
            <p>Try adjusting your search query or filters, or log a new work item.</p>
            <button class="btn btn-primary btn-sm" (click)="openCreateModal()">
              + Log New Work Item
            </button>
          </div>
        } @else {
          @for (item of filteredWorkItems(); track item.id) {
            <div class="card work-card" [class.is-completed]="item.status === 'completed'">
              <div class="card-top-row">
                <div class="card-project-group">
                  <span class="project-tag">{{ item.project }}</span>
                  <span class="date-tag">{{ item.date }}</span>
                  <span class="badge" [ngClass]="getCategoryBadgeClass(item.category)">
                    {{ item.category }}
                  </span>
                  @if (item.impact === 'brag-worthy') {
                    <span class="badge badge-amber">★ Brag Worthy</span>
                  } @else if (item.impact === 'high') {
                    <span class="badge badge-indigo">⚡ High Impact</span>
                  }
                </div>

                <div class="card-actions">
                  <span class="status-badge" [ngClass]="getStatusBadgeClass(item.status)">
                    {{ item.status }}
                  </span>

                  <button
                    class="btn-icon btn-secondary btn-sm"
                    (click)="openEditModal(item)"
                    title="Edit Item"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>

                  <button
                    class="btn-icon btn-secondary btn-sm text-danger"
                    (click)="deleteItem(item)"
                    title="Delete Item"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Title & Description -->
              <h3 class="card-item-title">{{ item.title }}</h3>
              <p class="card-item-desc">{{ item.description }}</p>

              <!-- Highlights / Accomplishments -->
              @if (item.highlights && item.highlights.length > 0) {
                <div class="highlights-box">
                  <div class="highlights-title">Key Accomplishments / Deliverables:</div>
                  <ul>
                    @for (h of item.highlights; track h) {
                      <li>{{ h }}</li>
                    }
                  </ul>
                </div>
              }

              <!-- Blocker (if any) -->
              @if (item.blockers) {
                <div class="blocker-box">
                  <span class="blocker-icon">⚠️</span>
                  <div>
                    <strong>Blocker / Dependency:</strong>
                    <span>{{ item.blockers }}</span>
                  </div>
                </div>
              }

              <!-- Skills & Hours -->
              <div class="card-footer-row">
                <div class="skills-wrap">
                  @for (s of item.skills; track s) {
                    <span class="skill-pill">{{ s }}</span>
                  }
                </div>

                <div class="hours-wrap">
                  @if (item.hoursSpent) {
                    <span class="hours-badge">⏱️ {{ item.hoursSpent }} hours focused</span>
                  }
                  <button
                    class="toggle-status-btn"
                    [class.is-done]="item.status === 'completed'"
                    (click)="toggleQuickStatus(item)"
                  >
                    {{ item.status === 'completed' ? '✓ Completed' : 'Mark Complete' }}
                  </button>
                </div>
              </div>
            </div>
          }
        }
      </div>

      <!-- Add / Edit Modal -->
      @if (showModal()) {
        <div class="modal-backdrop" (click)="closeModal()">
          <div class="modal-dialog" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3 class="modal-title">
                {{ isEditing() ? '✏️ Edit Work Item' : '📝 Log Work Status Item' }}
              </h3>
              <button class="btn-icon btn-secondary btn-sm" (click)="closeModal()">✕</button>
            </div>

            <div class="modal-body">
              <div class="form-row">
                <div class="form-group flex-1">
                  <label class="form-label">Date</label>
                  <input type="date" class="form-control" [(ngModel)]="formDate" />
                </div>
                <div class="form-group flex-1">
                  <label class="form-label">Project / Initiative</label>
                  <input
                    type="text"
                    class="form-control"
                    placeholder="e.g. NextGen Portal, SRE Platform"
                    [(ngModel)]="formProject"
                  />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Task Title</label>
                <input
                  type="text"
                  class="form-control"
                  placeholder="e.g. Migrated state flow to Angular 20 Signals"
                  [(ngModel)]="formTitle"
                />
              </div>

              <div class="form-row">
                <div class="form-group flex-1">
                  <label class="form-label">Category</label>
                  <select class="form-control" [(ngModel)]="formCategory">
                    <option value="architecture">Architecture</option>
                    <option value="feature">Feature</option>
                    <option value="bugfix">Bug Fix</option>
                    <option value="code-review">Code Review</option>
                    <option value="devops">DevOps / CI-CD</option>
                    <option value="research">Research / Spike</option>
                    <option value="documentation">Documentation</option>
                    <option value="meeting">Meeting / 1:1</option>
                  </select>
                </div>

                <div class="form-group flex-1">
                  <label class="form-label">Impact Level</label>
                  <select class="form-control" [(ngModel)]="formImpact">
                    <option value="brag-worthy">🌟 Brag Worthy (Promotion Packet)</option>
                    <option value="high">⚡ High Impact</option>
                    <option value="medium">Medium</option>
                    <option value="routine">Routine</option>
                  </select>
                </div>

                <div class="form-group flex-1">
                  <label class="form-label">Status</label>
                  <select class="form-control" [(ngModel)]="formStatus">
                    <option value="completed">Completed</option>
                    <option value="in-progress">In Progress</option>
                    <option value="blocked">Blocked</option>
                    <option value="planned">Planned</option>
                  </select>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group flex-1">
                  <label class="form-label">Hours Spent</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="24"
                    class="form-control"
                    placeholder="e.g. 4.5"
                    [(ngModel)]="formHours"
                  />
                </div>
                <div class="form-group flex-2">
                  <label class="form-label">Skills / Tech Stack (comma separated)</label>
                  <input
                    type="text"
                    class="form-control"
                    placeholder="e.g. Angular, TypeScript, Docker"
                    [(ngModel)]="formSkillsRaw"
                  />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Summary / Description</label>
                <textarea
                  class="form-control"
                  rows="3"
                  placeholder="Summarize the core technical problem and solution..."
                  [(ngModel)]="formDescription"
                ></textarea>
              </div>

              <div class="form-group">
                <label class="form-label">
                  Highlights & Key Deliverables (One per line)
                </label>
                <textarea
                  class="form-control"
                  rows="3"
                  placeholder="• Reduced render time by 42%&#10;• Wrote unit tests achieving 94% coverage&#10;• Created RFC document for security review"
                  [(ngModel)]="formHighlightsRaw"
                ></textarea>
              </div>

              <div class="form-group">
                <label class="form-label">Blockers or External Dependencies (Optional)</label>
                <input
                  type="text"
                  class="form-control"
                  placeholder="e.g. Awaiting IAM security approval for staging cluster"
                  [(ngModel)]="formBlockers"
                />
              </div>
            </div>

            <div class="modal-footer">
              <button class="btn btn-secondary" (click)="closeModal()">Cancel</button>
              <button class="btn btn-primary" (click)="saveItem()">
                {{ isEditing() ? 'Save Changes' : 'Add to Work Log' }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .work-tracker-page {
        max-width: 1380px;
        margin: 0 auto;
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .tracker-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 1.5rem;
      }

      .page-title {
        font-size: 1.85rem;
        font-weight: 800;
        color: var(--text-primary);
        letter-spacing: -0.02em;
        margin-bottom: 0.35rem;
      }

      .page-subtitle {
        color: var(--text-secondary);
        font-size: 0.925rem;
        max-width: 750px;
      }

      .header-actions {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      /* Filter Toolbar */
      .filter-card {
        padding: 1.25rem 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .filter-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        flex-wrap: wrap;
      }

      .search-box {
        flex: 1;
        min-width: 280px;
        display: flex;
        align-items: center;
        gap: 0.6rem;
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        padding: 0.55rem 0.9rem;
        border-radius: 10px;
        color: var(--text-muted);
      }
      .search-input {
        flex: 1;
        border: none;
        background: transparent;
        outline: none;
        color: var(--text-primary);
        font-size: 0.875rem;
      }
      .clear-btn {
        background: transparent;
        border: none;
        font-size: 1rem;
        cursor: pointer;
        color: var(--text-muted);
      }

      .date-tabs {
        display: flex;
        gap: 0.35rem;
        background: var(--bg-card-subtle);
        padding: 0.3rem;
        border-radius: 10px;
        border: 1px solid var(--border-color);
      }

      .date-tab-btn {
        padding: 0.4rem 0.8rem;
        border-radius: 7px;
        border: none;
        background: transparent;
        color: var(--text-secondary);
        font-size: 0.8rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.15s ease;
      }
      .date-tab-btn.active {
        background: var(--bg-card);
        color: var(--primary-500);
        box-shadow: var(--shadow-sm);
      }

      .filter-subrow {
        display: flex;
        align-items: center;
        gap: 1.25rem;
        flex-wrap: wrap;
        font-size: 0.825rem;
        padding-top: 0.5rem;
        border-top: 1px solid var(--border-color);
      }

      .dropdown-filter {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        color: var(--text-secondary);
      }
      .dropdown-filter select {
        padding: 0.35rem 0.65rem;
        border-radius: 8px;
        border: 1px solid var(--border-color);
        background: var(--bg-card);
        color: var(--text-primary);
        font-size: 0.825rem;
        outline: none;
      }

      .filter-stats-pill {
        margin-left: auto;
        color: var(--text-muted);
        font-size: 0.8rem;
      }

      /* Items Container */
      .items-container {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .work-card {
        padding: 1.4rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }
      .work-card.is-completed {
        border-left: 4px solid var(--accent-emerald);
      }

      .card-top-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
      }

      .card-project-group {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        flex-wrap: wrap;
      }

      .project-tag {
        font-size: 0.8rem;
        font-weight: 800;
        color: var(--primary-500);
      }

      .date-tag {
        font-size: 0.75rem;
        font-family: var(--font-mono);
        color: var(--text-muted);
      }

      .card-actions {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .status-badge {
        padding: 0.2rem 0.6rem;
        border-radius: 6px;
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
      }
      .status-badge.status-completed {
        background: rgba(16, 185, 129, 0.15);
        color: #10b981;
      }
      .status-badge.status-in-progress {
        background: rgba(99, 102, 241, 0.15);
        color: #818cf8;
      }
      .status-badge.status-blocked {
        background: rgba(244, 63, 94, 0.15);
        color: #f43f5e;
      }
      .status-badge.status-planned {
        background: rgba(148, 163, 184, 0.15);
        color: #94a3b8;
      }

      .card-item-title {
        font-size: 1.15rem;
        font-weight: 800;
        color: var(--text-primary);
      }

      .card-item-desc {
        font-size: 0.9rem;
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .highlights-box {
        background: var(--bg-card-subtle);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 0.75rem 1.1rem;
      }
      .highlights-title {
        font-size: 0.75rem;
        font-weight: 700;
        color: var(--text-muted);
        text-transform: uppercase;
        margin-bottom: 0.35rem;
      }
      .highlights-box ul {
        margin: 0 0 0 1.25rem;
        font-size: 0.85rem;
        color: var(--text-secondary);
      }
      .highlights-box li {
        margin-bottom: 0.25rem;
      }

      .blocker-box {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        background: rgba(244, 63, 94, 0.1);
        border: 1px solid rgba(244, 63, 94, 0.25);
        border-radius: 8px;
        padding: 0.6rem 0.9rem;
        font-size: 0.85rem;
        color: var(--accent-rose);
      }

      .card-footer-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        padding-top: 0.5rem;
        border-top: 1px solid var(--border-color);
        flex-wrap: wrap;
      }

      .skills-wrap {
        display: flex;
        flex-wrap: wrap;
        gap: 0.4rem;
      }

      .skill-pill {
        font-size: 0.725rem;
        font-family: var(--font-mono);
        padding: 0.15rem 0.5rem;
        border-radius: 6px;
        background: rgba(99, 102, 241, 0.1);
        color: var(--primary-500);
        border: 1px solid rgba(99, 102, 241, 0.2);
      }

      .hours-wrap {
        display: flex;
        align-items: center;
        gap: 0.85rem;
      }

      .hours-badge {
        font-size: 0.8rem;
        color: var(--text-muted);
      }

      .toggle-status-btn {
        background: var(--bg-card-subtle);
        border: 1px solid var(--border-color);
        padding: 0.35rem 0.75rem;
        border-radius: 6px;
        font-size: 0.775rem;
        font-weight: 600;
        cursor: pointer;
        color: var(--text-primary);
        transition: all 0.15s ease;
      }
      .toggle-status-btn:hover {
        background: var(--bg-card-hover);
      }
      .toggle-status-btn.is-done {
        background: rgba(16, 185, 129, 0.15);
        border-color: rgba(16, 185, 129, 0.3);
        color: #10b981;
      }

      /* Empty Container */
      .empty-container {
        text-align: center;
        padding: 3.5rem 1.5rem;
        color: var(--text-muted);
      }
      .empty-container h3 {
        color: var(--text-primary);
        margin: 0.5rem 0 0.35rem 0;
      }
      .empty-container p {
        margin-bottom: 1.25rem;
        font-size: 0.9rem;
      }

      /* Modal Specifics */
      .form-row {
        display: flex;
        gap: 1rem;
      }
      .flex-1 { flex: 1; }
      .flex-2 { flex: 2; }

      @media (max-width: 768px) {
        .tracker-header {
          flex-direction: column;
          align-items: flex-start;
        }
        .form-row {
          flex-direction: column;
        }
        .card-top-row {
          flex-direction: column;
          align-items: flex-start;
        }
      }
    `,
  ],
})
export class WorkTrackerComponent {
  public readonly storage = inject(StorageService);
  public readonly excelService = inject(ExcelExportService);

  public readonly openDocGenerator = output<void>();

  // Filter signals
  public readonly searchQuery = signal('');
  public readonly dateFilter = signal<'all' | 'today' | 'this-week' | 'this-month'>('all');
  public readonly statusFilter = signal<string>('all');
  public readonly categoryFilter = signal<string>('all');
  public readonly impactFilter = signal<string>('all');

  // Modal State
  public readonly showModal = signal(false);
  public readonly isEditing = signal(false);
  public readonly editingId = signal<string | null>(null);

  // Form Fields
  public formDate = '';
  public formProject = '';
  public formTitle = '';
  public formCategory: WorkCategory = 'feature';
  public formImpact: ImpactLevel = 'high';
  public formStatus: WorkStatus = 'completed';
  public formHours: number = 2.0;
  public formSkillsRaw = '';
  public formDescription = '';
  public formHighlightsRaw = '';
  public formBlockers = '';

  public readonly filteredWorkItems = computed(() => {
    let items = this.storage.sortedWorkItems();
    const query = this.searchQuery().toLowerCase().trim();
    const dateF = this.dateFilter();
    const statF = this.statusFilter();
    const catF = this.categoryFilter();
    const impF = this.impactFilter();

    // Date range filtering
    const today = this.storage.todayDateString();
    if (dateF === 'today') {
      items = items.filter((i) => i.date === today);
    } else if (dateF === 'this-week') {
      const now = new Date();
      const firstDay = new Date(now.setDate(now.getDate() - now.getDay()));
      const firstDayStr = firstDay.toISOString().split('T')[0];
      items = items.filter((i) => i.date >= firstDayStr);
    } else if (dateF === 'this-month') {
      const prefix = today.substring(0, 7); // YYYY-MM
      items = items.filter((i) => i.date.startsWith(prefix));
    }

    // Status filter
    if (statF !== 'all') {
      items = items.filter((i) => i.status === statF);
    }

    // Category filter
    if (catF !== 'all') {
      items = items.filter((i) => i.category === catF);
    }

    // Impact filter
    if (impF !== 'all') {
      items = items.filter((i) => i.impact === impF);
    }

    // Search query
    if (query) {
      items = items.filter((i) => {
        return (
          i.title.toLowerCase().includes(query) ||
          i.project.toLowerCase().includes(query) ||
          i.description.toLowerCase().includes(query) ||
          (i.skills && i.skills.some((s) => s.toLowerCase().includes(query))) ||
          (i.highlights && i.highlights.some((h) => h.toLowerCase().includes(query)))
        );
      });
    }

    return items;
  });

  public readonly totalFilteredHours = computed(() => {
    return this.filteredWorkItems().reduce((acc, curr) => acc + (curr.hoursSpent || 0), 0);
  });

  public openCreateModal(): void {
    this.isEditing.set(false);
    this.editingId.set(null);
    this.formDate = this.storage.todayDateString();
    this.formProject = 'Core Platform';
    this.formTitle = '';
    this.formCategory = 'feature';
    this.formImpact = 'high';
    this.formStatus = 'completed';
    this.formHours = 3.0;
    this.formSkillsRaw = 'Angular, TypeScript';
    this.formDescription = '';
    this.formHighlightsRaw = '';
    this.formBlockers = '';
    this.showModal.set(true);
  }

  public openEditModal(item: WorkItem): void {
    this.isEditing.set(true);
    this.editingId.set(item.id);
    this.formDate = item.date;
    this.formProject = item.project;
    this.formTitle = item.title;
    this.formCategory = item.category;
    this.formImpact = item.impact;
    this.formStatus = item.status;
    this.formHours = item.hoursSpent || 0;
    this.formSkillsRaw = (item.skills || []).join(', ');
    this.formDescription = item.description || '';
    this.formHighlightsRaw = (item.highlights || []).join('\n');
    this.formBlockers = item.blockers || '';
    this.showModal.set(true);
  }

  public closeModal(): void {
    this.showModal.set(false);
  }

  public saveItem(): void {
    if (!this.formTitle.trim()) {
      alert('Please enter a task title');
      return;
    }

    const skills = this.formSkillsRaw
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const highlights = this.formHighlightsRaw
      .split('\n')
      .map((h) => h.replace(/^[\s•*-]+/, '').trim())
      .filter((h) => h.length > 0);

    const payload = {
      date: this.formDate || this.storage.todayDateString(),
      project: this.formProject.trim() || 'General',
      title: this.formTitle.trim(),
      category: this.formCategory,
      impact: this.formImpact,
      status: this.formStatus,
      hoursSpent: Number(this.formHours) || 0,
      skills,
      description: this.formDescription.trim(),
      highlights,
      blockers: this.formBlockers.trim() || undefined,
    };

    if (this.isEditing() && this.editingId()) {
      this.storage.updateWorkItem(this.editingId()!, payload);
    } else {
      this.storage.addWorkItem(payload);
    }

    this.closeModal();
  }

  public deleteItem(item: WorkItem): void {
    if (confirm(`Are you sure you want to delete "${item.title}"?`)) {
      this.storage.deleteWorkItem(item.id);
    }
  }

  public toggleQuickStatus(item: WorkItem): void {
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

  public getStatusBadgeClass(status: string): string {
    return `status-${status}`;
  }

  public exportFilteredExcel(): void {
    this.excelService.exportWorkItemsOnly(this.filteredWorkItems(), 'Work_Status_Deliverables');
  }
}
