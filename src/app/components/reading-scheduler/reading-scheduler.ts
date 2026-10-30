import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StorageService } from '../../services/storage.service';
import { ReadingTopic, ReadingCategory, ReadingStatus, ReadingResource } from '../../models/reading-topic.model';

@Component({
  selector: 'app-reading-scheduler',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="reading-page">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title gradient-title">Monthly Reading & Learning Roadmap</h1>
          <p class="page-subtitle">
            Configure monthly technical topics, curate books, RFCs, and Spring Boot / DSA modules with automated reminders.
          </p>
        </div>
        <button class="btn btn-spring" (click)="openCreateModal()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>+ Add Roadmap Topic</span>
        </button>
      </div>

      <!-- Schedule Reminder Banner -->
      @if (storage.overdueReadingTopics().length > 0) {
        <div class="reminder-banner glass-panel">
          <div class="banner-icon">⏰</div>
          <div class="banner-text">
            <strong>Active Schedule Reminders:</strong>
            You have {{ storage.overdueReadingTopics().length }} reading target(s) past scheduled target date:
            <span class="topic-highlight">
              "{{ storage.overdueReadingTopics()[0].title }}"
            </span>
          </div>
          <button class="btn btn-sm btn-amber" (click)="scrollToTopic(storage.overdueReadingTopics()[0].id)">
            Focus Now
          </button>
        </div>
      }

      <!-- Month Tabs Bar -->
      <div class="month-selector-bar glass-panel">
        <div class="month-tabs">
          <button
            class="month-pill"
            [class.active]="selectedMonth() === 'all'"
            (click)="selectedMonth.set('all')"
          >
            All Scheduled Months
          </button>

          @for (m of storage.readingMonths(); track m.key) {
            <button
              class="month-pill"
              [class.active]="selectedMonth() === m.key"
              (click)="selectedMonth.set(m.key)"
            >
              {{ m.label }}
              <span class="count-tag">{{ getMonthTopicsCount(m.key) }}</span>
            </button>
          }
        </div>

        <div class="month-stats">
          <span class="stat-item">
            <strong>{{ storage.completedReadingCount() }}</strong> / {{ storage.totalReadingCount() }} Topics Mastered
          </span>
          <span class="stat-divider">•</span>
          <span class="stat-item text-emerald">
            <strong>{{ storage.averageReadingProgress() }}%</strong> Average Progress
          </span>
        </div>
      </div>

      <!-- Topics Grid -->
      <div class="topics-grid">
        @if (filteredTopics().length === 0) {
          <div class="card empty-card">
            <div class="empty-icon">📖</div>
            <h3>No topics scheduled for this month</h3>
            <p>Schedule your next technical deep-dive, architecture book, or system design paper.</p>
            <button class="btn btn-sm btn-primary" (click)="openCreateModal()">
              + Schedule Topic
            </button>
          </div>
        } @else {
          @for (topic of filteredTopics(); track topic.id) {
            <div
              class="card topic-card"
              [id]="'topic-' + topic.id"
              [class.completed]="topic.status === 'completed'"
            >
              <!-- Card Top -->
              <div class="topic-header">
                <div class="topic-meta-left">
                  <span class="badge" [ngClass]="getCategoryBadgeClass(topic.category)">
                    {{ getCategoryIcon(topic.category) }} {{ topic.category }}
                  </span>
                  <span class="month-badge">{{ topic.monthLabel }}</span>
                  @if (topic.priority === 'high') {
                    <span class="priority-tag high">High Priority</span>
                  }
                </div>

                <div class="topic-actions">
                  <button
                    class="btn-icon btn-secondary btn-sm"
                    (click)="openEditModal(topic)"
                    title="Edit Topic"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>

                  <button
                    class="btn-icon btn-secondary btn-sm text-danger"
                    (click)="deleteTopic(topic)"
                    title="Delete Topic"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Topic Title & Description -->
              <h2 class="topic-title">{{ topic.title }}</h2>
              <p class="topic-desc">{{ topic.description }}</p>

              <!-- Progress Bar & Slider -->
              <div class="progress-section">
                <div class="progress-labels">
                  <span class="progress-status" [ngClass]="getStatusClass(topic.status)">
                    {{ topic.status === 'completed' ? '✓ Mastered' : (topic.progressPercent > 0 ? '● In Progress' : '○ Planned') }}
                  </span>
                  <span class="progress-due">
                    📅 Target: <strong>{{ topic.targetDate }}</strong>
                    @if (isOverdue(topic)) {
                      <span class="overdue-tag">Overdue</span>
                    }
                  </span>
                  <span class="progress-number">{{ topic.progressPercent }}%</span>
                </div>

                <div class="progress-track">
                  <div
                    class="progress-bar-fill"
                    [style.width.%]="topic.progressPercent"
                    [class.completed]="topic.progressPercent === 100"
                  ></div>
                </div>

                <!-- Quick slider to adjust progress -->
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  class="progress-slider"
                  [ngModel]="topic.progressPercent"
                  (ngModelChange)="updateProgress(topic, $event)"
                  title="Adjust topic progress"
                />
              </div>

              <!-- Resources Checklist -->
              @if (topic.resources && topic.resources.length > 0) {
                <div class="resources-box">
                  <div class="resources-heading">Reading Materials & Resources:</div>
                  <div class="resources-list">
                    @for (res of topic.resources; track res.id) {
                      <label class="resource-row" [class.checked]="res.completed">
                        <input
                          type="checkbox"
                          [checked]="res.completed"
                          (change)="storage.toggleResourceCompleted(topic.id, res.id)"
                        />
                        <span class="resource-type-badge">{{ res.type }}</span>
                        <span class="resource-name">{{ res.name }}</span>
                        @if (res.url) {
                          <a [href]="res.url" target="_blank" class="resource-link" (click)="$event.stopPropagation()">
                            ↗ Open
                          </a>
                        }
                      </label>
                    }
                  </div>
                </div>
              }

              <!-- Takeaways & Notes -->
              @if (topic.takeaways) {
                <div class="takeaways-box">
                  <span class="takeaway-label">💡 Key Takeaway:</span>
                  <p class="takeaway-text">{{ topic.takeaways }}</p>
                </div>
              }

              <!-- Card Footer with Reminder Toggle -->
              <div class="topic-footer">
                <label class="reminder-toggle-label">
                  <input
                    type="checkbox"
                    [checked]="topic.reminderEnabled"
                    (change)="toggleReminder(topic)"
                  />
                  <span>🔔 Schedule Reminders</span>
                </label>

                <button
                  class="btn btn-sm"
                  [ngClass]="topic.status === 'completed' ? 'btn-secondary' : 'btn-success'"
                  (click)="toggleTopicCompleted(topic)"
                >
                  <span>{{ topic.status === 'completed' ? '↺ Re-open Topic' : '✓ Mark Topic Complete' }}</span>
                </button>
              </div>
            </div>
          }
        }
      </div>

      <!-- Add/Edit Topic Modal -->
      @if (showModal()) {
        <div class="modal-backdrop" (click)="closeModal()">
          <div class="modal-dialog" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3 class="modal-title">
                {{ isEditing() ? '✏️ Edit Reading Topic' : '📚 Schedule New Reading Topic' }}
              </h3>
              <button class="btn-icon btn-secondary btn-sm" (click)="closeModal()">✕</button>
            </div>

            <div class="modal-body">
              <div class="form-row">
                <div class="form-group flex-1">
                  <label class="form-label">Month Scheduled</label>
                  <input
                    type="month"
                    class="form-control"
                    [(ngModel)]="formMonthKey"
                  />
                </div>
                <div class="form-group flex-1">
                  <label class="form-label">Target Completion Date</label>
                  <input
                    type="date"
                    class="form-control"
                    [(ngModel)]="formTargetDate"
                  />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Topic Title</label>
                <input
                  type="text"
                  class="form-control"
                  placeholder="e.g. System Design: Large-Scale Distributed Caching"
                  [(ngModel)]="formTitle"
                />
              </div>

              <div class="form-row">
                <div class="form-group flex-1">
                  <label class="form-label">Category</label>
                  <select class="form-control" [(ngModel)]="formCategory">
                    <option value="Architecture">Architecture</option>
                    <option value="Frontend Mastery">Frontend Mastery</option>
                    <option value="Backend & APIs">Backend & APIs</option>
                    <option value="Cloud & DevOps">Cloud & DevOps</option>
                    <option value="System Design">System Design</option>
                    <option value="Leadership & Strategy">Leadership & Strategy</option>
                    <option value="Data & AI">Data & AI</option>
                    <option value="Career & Habits">Career & Habits</option>
                    <option value="Data Structures & Algorithms">Data Structures & Algorithms</option>
                    <option value="Spring Boot Mastery">🍃 Spring Boot Mastery</option>
                  </select>
                </div>

                <div class="form-group flex-1">
                  <label class="form-label">Priority</label>
                  <select class="form-control" [(ngModel)]="formPriority">
                    <option value="high">High Priority</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Detailed Description / Learning Scope</label>
                <textarea
                  class="form-control"
                  rows="2"
                  placeholder="What core architectural concepts or chapters are covered..."
                  [(ngModel)]="formDescription"
                ></textarea>
              </div>

              <div class="form-group">
                <label class="form-label">Reading Resources / Chapters (One per line)</label>
                <textarea
                  class="form-control"
                  rows="3"
                  placeholder="DDIA Book Chapter 8&#10;Raft Consensus Paper (PDF)&#10;Redis Architecture & Eviction Policies"
                  [(ngModel)]="formResourcesRaw"
                ></textarea>
              </div>

              <div class="form-group">
                <label class="form-label">Key Takeaways / Architecture Notes (Optional)</label>
                <textarea
                  class="form-control"
                  rows="2"
                  placeholder="Synthesis notes to remember during system design interviews or design reviews..."
                  [(ngModel)]="formTakeaways"
                ></textarea>
              </div>

              <div class="checkbox-group">
                <label class="checkbox-label">
                  <input type="checkbox" [(ngModel)]="formReminderEnabled" />
                  <span>Enable reminders & due-date notification banner</span>
                </label>
              </div>
            </div>

            <div class="modal-footer">
              <button class="btn btn-secondary" (click)="closeModal()">Cancel</button>
              <button class="btn btn-primary" (click)="saveTopic()">
                {{ isEditing() ? 'Save Changes' : 'Schedule Topic' }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .reading-page {
        max-width: 1380px;
        margin: 0 auto;
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .page-header {
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

      /* Reminder Banner */
      .reminder-banner {
        padding: 1rem 1.4rem;
        border-radius: 12px;
        background: rgba(245, 158, 11, 0.12);
        border: 1px solid rgba(245, 158, 11, 0.3);
        display: flex;
        align-items: center;
        gap: 1rem;
        animation: fadeIn 0.2s ease-out;
      }
      .banner-icon {
        font-size: 1.5rem;
      }
      .banner-text {
        flex: 1;
        font-size: 0.875rem;
        color: var(--text-primary);
      }
      .topic-highlight {
        color: #f59e0b;
        font-weight: 700;
      }

      /* Month Selector Bar */
      .month-selector-bar {
        padding: 0.9rem 1.25rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1.5rem;
        flex-wrap: wrap;
      }

      .month-tabs {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex-wrap: wrap;
      }

      .month-pill {
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        padding: 0.45rem 0.9rem;
        border-radius: 9999px;
        border: 1px solid var(--border-color);
        background: var(--bg-card);
        color: var(--text-secondary);
        font-size: 0.825rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.15s ease;
      }
      .month-pill:hover {
        border-color: var(--primary-500);
        color: var(--text-primary);
      }
      .month-pill.active {
        background: var(--primary-500);
        color: white;
        border-color: var(--primary-500);
        box-shadow: 0 2px 8px rgba(99, 102, 241, 0.35);
      }

      .count-tag {
        font-size: 0.7rem;
        padding: 0.1rem 0.4rem;
        border-radius: 9999px;
        background: rgba(255, 255, 255, 0.25);
      }

      .month-stats {
        font-size: 0.825rem;
        color: var(--text-muted);
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      .stat-divider {
        opacity: 0.4;
      }

      /* Topics Grid */
      .topics-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1.25rem;
      }

      .topic-card {
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 0.85rem;
        transition: all 0.2s ease;
      }
      .topic-card.completed {
        border-left: 4px solid var(--accent-emerald);
      }

      .topic-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .topic-meta-left {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex-wrap: wrap;
      }

      .month-badge {
        font-size: 0.75rem;
        font-family: var(--font-mono);
        color: var(--text-muted);
      }

      .priority-tag.high {
        font-size: 0.7rem;
        font-weight: 700;
        color: #f43f5e;
        background: rgba(244, 63, 94, 0.12);
        padding: 0.15rem 0.45rem;
        border-radius: 4px;
      }

      .topic-actions {
        display: flex;
        align-items: center;
        gap: 0.4rem;
      }

      .topic-title {
        font-size: 1.15rem;
        font-weight: 800;
        color: var(--text-primary);
        line-height: 1.35;
      }

      .topic-desc {
        font-size: 0.875rem;
        color: var(--text-secondary);
        line-height: 1.45;
      }

      /* Progress Section */
      .progress-section {
        background: var(--bg-card-subtle);
        border: 1px solid var(--border-color);
        border-radius: 10px;
        padding: 0.85rem 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
      }

      .progress-labels {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 0.775rem;
      }

      .progress-status {
        font-weight: 700;
      }
      .progress-status.status-completed { color: #10b981; }
      .progress-status.status-in-progress { color: #6366f1; }
      .progress-status.status-not-started { color: #94a3b8; }

      .progress-due {
        color: var(--text-muted);
      }
      .overdue-tag {
        background: #f43f5e;
        color: white;
        font-size: 0.65rem;
        font-weight: 700;
        padding: 0.1rem 0.35rem;
        border-radius: 4px;
        margin-left: 0.35rem;
      }

      .progress-number {
        font-weight: 800;
        color: var(--text-primary);
      }

      .progress-track {
        height: 7px;
        background: var(--border-color);
        border-radius: 9999px;
        overflow: hidden;
      }
      .progress-bar-fill {
        height: 100%;
        background: var(--primary-gradient);
        border-radius: 9999px;
        transition: width 0.3s ease;
      }
      .progress-bar-fill.completed {
        background: var(--accent-emerald);
      }

      .progress-slider {
        width: 100%;
        margin-top: 0.25rem;
        cursor: pointer;
      }

      /* Resources Box */
      .resources-box {
        border-top: 1px solid var(--border-color);
        padding-top: 0.75rem;
      }

      .resources-heading {
        font-size: 0.75rem;
        font-weight: 700;
        color: var(--text-muted);
        text-transform: uppercase;
        margin-bottom: 0.4rem;
      }

      .resources-list {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
      }

      .resource-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.825rem;
        color: var(--text-secondary);
        cursor: pointer;
        padding: 0.25rem 0.35rem;
        border-radius: 6px;
      }
      .resource-row:hover {
        background: var(--bg-card-subtle);
      }
      .resource-row.checked .resource-name {
        text-decoration: line-through;
        color: var(--text-muted);
      }

      .resource-type-badge {
        font-size: 0.65rem;
        text-transform: uppercase;
        font-weight: 700;
        background: var(--bg-card-subtle);
        border: 1px solid var(--border-color);
        padding: 0.1rem 0.35rem;
        border-radius: 4px;
      }

      .resource-link {
        font-size: 0.725rem;
        color: var(--primary-500);
        margin-left: auto;
        text-decoration: none;
      }
      .resource-link:hover {
        text-decoration: underline;
      }

      /* Takeaways */
      .takeaways-box {
        background: rgba(99, 102, 241, 0.08);
        border-left: 3px solid var(--primary-500);
        padding: 0.65rem 0.9rem;
        border-radius: 0 8px 8px 0;
      }
      .takeaway-label {
        font-size: 0.725rem;
        font-weight: 700;
        color: var(--primary-500);
        text-transform: uppercase;
      }
      .takeaway-text {
        font-size: 0.825rem;
        color: var(--text-primary);
        margin-top: 0.2rem;
        line-height: 1.4;
      }

      /* Topic Footer */
      .topic-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-top: 0.6rem;
        border-top: 1px solid var(--border-color);
      }

      .reminder-toggle-label {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 0.8rem;
        color: var(--text-muted);
        cursor: pointer;
      }

      /* Empty Card */
      .empty-card {
        grid-column: 1 / -1;
        text-align: center;
        padding: 3.5rem 1.5rem;
        color: var(--text-muted);
      }
      .empty-icon {
        font-size: 2.2rem;
        margin-bottom: 0.5rem;
      }
      .empty-card h3 {
        color: var(--text-primary);
        margin-bottom: 0.35rem;
      }
      .empty-card p {
        margin-bottom: 1.25rem;
        font-size: 0.875rem;
      }

      /* Modal specifics */
      .form-row {
        display: flex;
        gap: 1rem;
      }
      .flex-1 { flex: 1; }

      .checkbox-group {
        margin-top: 0.5rem;
      }
      .checkbox-label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.85rem;
        cursor: pointer;
      }

      @media (max-width: 900px) {
        .topics-grid {
          grid-template-columns: 1fr;
        }
        .form-row {
          flex-direction: column;
        }
      }
    `,
  ],
})
export class ReadingSchedulerComponent {
  public readonly storage = inject(StorageService);

  public readonly selectedMonth = signal<string>('all');

  // Modal State
  public readonly showModal = signal(false);
  public readonly isEditing = signal(false);
  public readonly editingId = signal<string | null>(null);

  // Form Fields
  public formMonthKey = '';
  public formTitle = '';
  public formCategory: ReadingCategory = 'Architecture';
  public formDescription = '';
  public formTargetDate = '';
  public formPriority: 'high' | 'medium' | 'low' = 'high';
  public formResourcesRaw = '';
  public formTakeaways = '';
  public formReminderEnabled = true;

  public readonly filteredTopics = computed(() => {
    const month = this.selectedMonth();
    const list = this.storage.readingTopics();
    if (month === 'all') return list;
    return list.filter((t) => t.monthKey === month);
  });

  public getMonthTopicsCount(monthKey: string): number {
    return this.storage.readingTopics().filter((t) => t.monthKey === monthKey).length;
  }

  public isOverdue(topic: ReadingTopic): boolean {
    const today = this.storage.todayDateString();
    return topic.status !== 'completed' && topic.targetDate < today;
  }

  public scrollToTopic(id: string): void {
    const el = document.getElementById('topic-' + id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('animate-pulse-subtle');
      setTimeout(() => el.classList.remove('animate-pulse-subtle'), 2000);
    }
  }

  public updateProgress(topic: ReadingTopic, newProgress: number): void {
    this.storage.updateReadingTopic(topic.id, { progressPercent: Number(newProgress) });
  }

  public toggleReminder(topic: ReadingTopic): void {
    this.storage.updateReadingTopic(topic.id, { reminderEnabled: !topic.reminderEnabled });
  }

  public toggleTopicCompleted(topic: ReadingTopic): void {
    const isCompleted = topic.status === 'completed';
    const nextStatus: ReadingStatus = isCompleted ? 'in-progress' : 'completed';
    const nextProgress = isCompleted ? 50 : 100;
    this.storage.updateReadingTopic(topic.id, {
      status: nextStatus,
      progressPercent: nextProgress,
    });
  }

  public openCreateModal(): void {
    this.isEditing.set(false);
    this.editingId.set(null);

    const now = new Date();
    this.formMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    this.formTargetDate = this.storage.todayDateString();
    this.formTitle = '';
    this.formCategory = 'Architecture';
    this.formDescription = '';
    this.formPriority = 'high';
    this.formResourcesRaw = '';
    this.formTakeaways = '';
    this.formReminderEnabled = true;

    this.showModal.set(true);
  }

  public openEditModal(topic: ReadingTopic): void {
    this.isEditing.set(true);
    this.editingId.set(topic.id);

    this.formMonthKey = topic.monthKey;
    this.formTargetDate = topic.targetDate;
    this.formTitle = topic.title;
    this.formCategory = topic.category;
    this.formDescription = topic.description;
    this.formPriority = topic.priority;
    this.formResourcesRaw = topic.resources.map((r) => r.name).join('\n');
    this.formTakeaways = topic.takeaways || '';
    this.formReminderEnabled = topic.reminderEnabled;

    this.showModal.set(true);
  }

  public closeModal(): void {
    this.showModal.set(false);
  }

  public saveTopic(): void {
    if (!this.formTitle.trim()) {
      alert('Please enter a reading topic title');
      return;
    }

    const [year, month] = this.formMonthKey.split('-');
    const dateObj = new Date(Number(year), Number(month) - 1, 1);
    const monthLabel = dateObj.toLocaleString('default', { month: 'long', year: 'numeric' });

    const resources: ReadingResource[] = this.formResourcesRaw
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((name, index) => ({
        id: 'res-' + Date.now() + '-' + index,
        name,
        type: name.toLowerCase().includes('book')
          ? 'book'
          : name.toLowerCase().includes('paper')
          ? 'paper'
          : 'article',
        completed: false,
      }));

    const payload = {
      monthKey: this.formMonthKey,
      monthLabel,
      title: this.formTitle.trim(),
      category: this.formCategory,
      description: this.formDescription.trim(),
      targetDate: this.formTargetDate || this.storage.todayDateString(),
      priority: this.formPriority,
      status: 'not-started' as ReadingStatus,
      progressPercent: 0,
      resources,
      takeaways: this.formTakeaways.trim() || undefined,
      reminderEnabled: this.formReminderEnabled,
    };

    if (this.isEditing() && this.editingId()) {
      this.storage.updateReadingTopic(this.editingId()!, payload);
    } else {
      this.storage.addReadingTopic(payload);
    }

    this.closeModal();
  }

  public deleteTopic(topic: ReadingTopic): void {
    if (confirm(`Delete reading topic "${topic.title}"?`)) {
      this.storage.deleteReadingTopic(topic.id);
    }
  }

  public getCategoryBadgeClass(category: string): string {
    switch (category) {
      case 'Architecture':
        return 'badge-purple';
      case 'Frontend Mastery':
        return 'badge-emerald';
      case 'System Design':
        return 'badge-indigo';
      case 'Leadership & Strategy':
        return 'badge-amber';
      case 'Cloud & DevOps':
        return 'badge-cyan';
      case 'Data Structures & Algorithms':
        return 'badge-purple';
      case 'Spring Boot Mastery':
        return 'badge-spring';
      default:
        return 'badge-indigo';
    }
  }

  public getCategoryIcon(category: string): string {
    switch (category) {
      case 'Spring Boot Mastery':
        return '🍃';
      case 'Data Structures & Algorithms':
        return '🧱';
      case 'Backend & APIs':
        return '☕';
      case 'Architecture':
        return '🏛️';
      case 'System Design':
        return '📐';
      case 'Cloud & DevOps':
        return '☁️';
      case 'Frontend Mastery':
        return '⚡';
      case 'Leadership & Strategy':
        return '🌟';
      case 'Data & AI':
        return '🤖';
      case 'Career & Habits':
        return '🎯';
      default:
        return '📚';
    }
  }

  public getStatusClass(status: string): string {
    return `status-${status}`;
  }
}
