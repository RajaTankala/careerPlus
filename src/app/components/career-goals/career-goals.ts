import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StorageService } from '../../services/storage.service';
import { CareerGoal } from '../../models/career-goal.model';

@Component({
  selector: 'app-career-goals',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="goals-page">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Career Milestones & Skills Competencies</h1>
          <p class="page-subtitle">
            Structure your promotion objectives, track certifications, and visualize technical competencies gained through your daily logs and reading roadmap.
          </p>
        </div>
        <button class="btn btn-primary" (click)="openCreateModal()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>+ Add Career Goal</span>
        </button>
      </div>

      <!-- OKR Goals Grid -->
      <div class="goals-grid">
        @for (goal of storage.careerGoals(); track goal.id) {
          <div class="card goal-card" [class.achieved]="goal.status === 'achieved'">
            <div class="goal-header">
              <span class="badge" [ngClass]="getCategoryBadgeClass(goal.category)">
                {{ goal.category }}
              </span>
              <span class="timeline-tag">{{ goal.targetTimeline }}</span>

              <div class="goal-actions">
                <button
                  class="btn-icon btn-secondary btn-sm"
                  (click)="openEditModal(goal)"
                  title="Edit Goal"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
                <button
                  class="btn-icon btn-secondary btn-sm text-danger"
                  (click)="deleteGoal(goal)"
                  title="Delete Goal"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </div>
            </div>

            <h3 class="goal-title">{{ goal.title }}</h3>
            <p class="goal-desc">{{ goal.description }}</p>

            @if (goal.metrics) {
              <div class="metrics-box">
                <span class="metrics-label">🎯 Key Results:</span>
                <p class="metrics-val">{{ goal.metrics }}</p>
              </div>
            }

            <div class="goal-progress-wrap">
              <div class="progress-info">
                <span class="status-lbl">{{ goal.status | uppercase }}</span>
                <span class="progress-val">{{ goal.progressPercent }}%</span>
              </div>
              <div class="progress-track">
                <div
                  class="progress-fill"
                  [style.width.%]="goal.progressPercent"
                  [class.achieved]="goal.progressPercent === 100"
                ></div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                class="progress-slider"
                [ngModel]="goal.progressPercent"
                (ngModelChange)="updateGoalProgress(goal, $event)"
              />
            </div>
          </div>
        }
      </div>

      <!-- Skills Matrix & Career Strategy Section -->
      <div class="skills-strategy-grid">
        <!-- Live Skills Competencies Matrix -->
        <div class="card section-card">
          <div class="card-header">
            <div>
              <h2 class="section-title">🛠️ Active Competencies Matrix</h2>
              <p class="section-subtitle">Skills aggregated in real-time from your logged tasks and reading topics</p>
            </div>
          </div>

          <div class="skills-list">
            @for (item of topSkills(); track item.name) {
              <div class="skill-row">
                <div class="skill-name-col">
                  <span class="skill-label">{{ item.name }}</span>
                  <span class="skill-count">{{ item.count }} logs / topics</span>
                </div>
                <div class="skill-bar-col">
                  <div class="mini-bar-track">
                    <div class="mini-bar-fill" [style.width.%]="item.percentage"></div>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Career Builder Best Practices -->
        <div class="card section-card">
          <div class="card-header">
            <div>
              <h2 class="section-title">💡 The Career Progression Framework</h2>
              <p class="section-subtitle">How to leverage CareerPulse for rapid promotion</p>
            </div>
          </div>

          <div class="framework-steps">
            <div class="step-card">
              <div class="step-num">1</div>
              <div class="step-body">
                <strong>Log High-Impact Wins Daily</strong>
                <p>Never rely on memory during performance appraisal season. Tag your best architectural work as "Brag Worthy".</p>
              </div>
            </div>

            <div class="step-card">
              <div class="step-num">2</div>
              <div class="step-body">
                <strong>Consistent Monthly Reading</strong>
                <p>Senior and Staff engineers read 1-2 system design books or RFC papers every month to broaden their technical horizon.</p>
              </div>
            </div>

            <div class="step-card">
              <div class="step-num">3</div>
              <div class="step-body">
                <strong>Nurture Circle Relationships</strong>
                <p>Remember birthdays and career achievements of peers and mentors. A strong network unlocks senior opportunities.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Add/Edit Modal -->
      @if (showModal()) {
        <div class="modal-backdrop" (click)="closeModal()">
          <div class="modal-dialog" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3 class="modal-title">
                {{ isEditing() ? '✏️ Edit Career Goal' : '🎯 Add Career Goal / OKR' }}
              </h3>
              <button class="btn-icon btn-secondary btn-sm" (click)="closeModal()">✕</button>
            </div>

            <div class="modal-body">
              <div class="form-row">
                <div class="form-group flex-2">
                  <label class="form-label">Goal Title</label>
                  <input
                    type="text"
                    class="form-control"
                    placeholder="e.g. Staff Software Engineer Promotion"
                    [(ngModel)]="formTitle"
                  />
                </div>

                <div class="form-group flex-1">
                  <label class="form-label">Target Timeline</label>
                  <input
                    type="text"
                    class="form-control"
                    placeholder="e.g. Q4 2026"
                    [(ngModel)]="formTimeline"
                  />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group flex-1">
                  <label class="form-label">Category</label>
                  <select class="form-control" [(ngModel)]="formCategory">
                    <option value="Promotion">Promotion</option>
                    <option value="Certification">Certification</option>
                    <option value="Technical Mastery">Technical Mastery</option>
                    <option value="Leadership">Leadership</option>
                    <option value="Networking">Networking</option>
                  </select>
                </div>

                <div class="form-group flex-1">
                  <label class="form-label">Status</label>
                  <select class="form-control" [(ngModel)]="formStatus">
                    <option value="active">Active</option>
                    <option value="achieved">Achieved 🎉</option>
                    <option value="paused">Paused</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Objective Description</label>
                <textarea
                  class="form-control"
                  rows="3"
                  placeholder="Detail the scope and criteria needed to achieve this milestone..."
                  [(ngModel)]="formDescription"
                ></textarea>
              </div>

              <div class="form-group">
                <label class="form-label">Key Results / Deliverables Checklist</label>
                <textarea
                  class="form-control"
                  rows="2"
                  placeholder="e.g. 3 RFCs approved, 2 junior engineers mentored, multi-region failover tested"
                  [(ngModel)]="formMetrics"
                ></textarea>
              </div>
            </div>

            <div class="modal-footer">
              <button class="btn btn-secondary" (click)="closeModal()">Cancel</button>
              <button class="btn btn-primary" (click)="saveGoal()">
                {{ isEditing() ? 'Save Changes' : 'Create Goal' }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .goals-page {
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

      /* Goals Grid */
      .goals-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1.25rem;
      }

      .goal-card {
        padding: 1.4rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        transition: all 0.2s ease;
      }
      .goal-card.achieved {
        border-left: 4px solid var(--accent-emerald);
      }

      .goal-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .timeline-tag {
        font-size: 0.75rem;
        font-family: var(--font-mono);
        color: var(--text-muted);
      }

      .goal-actions {
        margin-left: auto;
        display: flex;
        gap: 0.35rem;
      }

      .goal-title {
        font-size: 1.15rem;
        font-weight: 800;
        color: var(--text-primary);
        line-height: 1.35;
      }

      .goal-desc {
        font-size: 0.85rem;
        color: var(--text-secondary);
        line-height: 1.45;
      }

      .metrics-box {
        background: var(--bg-card-subtle);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 0.65rem 0.85rem;
      }
      .metrics-label {
        font-size: 0.725rem;
        font-weight: 700;
        color: var(--primary-500);
        text-transform: uppercase;
      }
      .metrics-val {
        font-size: 0.825rem;
        color: var(--text-primary);
        margin-top: 0.15rem;
      }

      .goal-progress-wrap {
        margin-top: auto;
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
      }

      .progress-info {
        display: flex;
        justify-content: space-between;
        font-size: 0.75rem;
        font-weight: 700;
      }
      .status-lbl { color: var(--text-muted); }
      .progress-val { color: var(--accent-emerald); }

      .progress-track {
        height: 7px;
        background: var(--border-color);
        border-radius: 9999px;
        overflow: hidden;
      }
      .progress-fill {
        height: 100%;
        background: var(--primary-gradient);
        border-radius: 9999px;
      }
      .progress-fill.achieved {
        background: var(--accent-emerald);
      }

      .progress-slider {
        cursor: pointer;
      }

      /* Skills & Strategy */
      .skills-strategy-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.5rem;
      }

      .section-card {
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .section-title {
        font-size: 1.15rem;
        font-weight: 800;
        color: var(--text-primary);
      }

      .section-subtitle {
        font-size: 0.8rem;
        color: var(--text-muted);
        margin-top: 0.15rem;
      }

      .skills-list {
        display: flex;
        flex-direction: column;
        gap: 0.85rem;
      }

      .skill-row {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .skill-name-col {
        width: 160px;
        display: flex;
        flex-direction: column;
      }
      .skill-label {
        font-size: 0.85rem;
        font-weight: 700;
        color: var(--text-primary);
      }
      .skill-count {
        font-size: 0.7rem;
        color: var(--text-muted);
      }

      .skill-bar-col {
        flex: 1;
      }
      .mini-bar-track {
        height: 8px;
        background: var(--bg-card-subtle);
        border-radius: 9999px;
        overflow: hidden;
      }
      .mini-bar-fill {
        height: 100%;
        background: var(--primary-gradient);
        border-radius: 9999px;
      }

      /* Framework Steps */
      .framework-steps {
        display: flex;
        flex-direction: column;
        gap: 0.85rem;
      }

      .step-card {
        display: flex;
        align-items: flex-start;
        gap: 0.85rem;
        padding: 0.85rem;
        background: var(--bg-card-subtle);
        border-radius: 10px;
        border: 1px solid var(--border-color);
      }

      .step-num {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: var(--primary-gradient);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 800;
        font-size: 0.85rem;
      }

      .step-body strong {
        font-size: 0.85rem;
        color: var(--text-primary);
      }
      .step-body p {
        font-size: 0.8rem;
        color: var(--text-secondary);
        margin-top: 0.2rem;
      }

      /* Modal specifics */
      .form-row {
        display: flex;
        gap: 1rem;
      }
      .flex-1 { flex: 1; }
      .flex-2 { flex: 2; }

      @media (max-width: 1024px) {
        .goals-grid {
          grid-template-columns: 1fr;
        }
        .skills-strategy-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class CareerGoalsComponent {
  public readonly storage = inject(StorageService);

  // Modal State
  public readonly showModal = signal(false);
  public readonly isEditing = signal(false);
  public readonly editingId = signal<string | null>(null);

  // Form Fields
  public formTitle = '';
  public formTimeline = 'Q4 2026';
  public formCategory: 'Promotion' | 'Certification' | 'Technical Mastery' | 'Leadership' | 'Networking' = 'Promotion';
  public formDescription = '';
  public formMetrics = '';
  public formStatus: 'active' | 'achieved' | 'paused' = 'active';

  public readonly topSkills = computed(() => {
    const skillCountMap = new Map<string, number>();

    // From work items
    for (const w of this.storage.workItems()) {
      for (const s of w.skills || []) {
        skillCountMap.set(s, (skillCountMap.get(s) || 0) + 1);
      }
    }

    // From reading topics
    for (const r of this.storage.readingTopics()) {
      skillCountMap.set(r.category, (skillCountMap.get(r.category) || 0) + 1);
    }

    const items = Array.from(skillCountMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 7);

    const maxCount = items.length > 0 ? items[0].count : 1;
    return items.map((item) => ({
      ...item,
      percentage: Math.min(100, Math.round((item.count / maxCount) * 100)),
    }));
  });

  public openCreateModal(): void {
    this.isEditing.set(false);
    this.editingId.set(null);
    this.formTitle = '';
    this.formTimeline = 'Q4 2026';
    this.formCategory = 'Promotion';
    this.formDescription = '';
    this.formMetrics = '';
    this.formStatus = 'active';
    this.showModal.set(true);
  }

  public openEditModal(goal: CareerGoal): void {
    this.isEditing.set(true);
    this.editingId.set(goal.id);
    this.formTitle = goal.title;
    this.formTimeline = goal.targetTimeline;
    this.formCategory = goal.category;
    this.formDescription = goal.description;
    this.formMetrics = goal.metrics || '';
    this.formStatus = goal.status;
    this.showModal.set(true);
  }

  public closeModal(): void {
    this.showModal.set(false);
  }

  public saveGoal(): void {
    if (!this.formTitle.trim()) {
      alert('Please enter a goal title');
      return;
    }

    const payload = {
      title: this.formTitle.trim(),
      targetTimeline: this.formTimeline.trim() || '2026',
      category: this.formCategory,
      description: this.formDescription.trim(),
      metrics: this.formMetrics.trim() || undefined,
      status: this.formStatus,
      progressPercent: this.formStatus === 'achieved' ? 100 : 50,
    };

    if (this.isEditing() && this.editingId()) {
      this.storage.updateCareerGoal(this.editingId()!, payload);
    } else {
      this.storage.addCareerGoal(payload);
    }

    this.closeModal();
  }

  public updateGoalProgress(goal: CareerGoal, progress: number): void {
    const val = Number(progress);
    const status = val === 100 ? 'achieved' : goal.status === 'achieved' ? 'active' : goal.status;
    this.storage.updateCareerGoal(goal.id, { progressPercent: val, status });
  }

  public deleteGoal(goal: CareerGoal): void {
    if (confirm(`Delete goal "${goal.title}"?`)) {
      this.storage.deleteCareerGoal(goal.id);
    }
  }

  public getCategoryBadgeClass(category: string): string {
    switch (category) {
      case 'Promotion':
        return 'badge-purple';
      case 'Certification':
        return 'badge-cyan';
      case 'Technical Mastery':
        return 'badge-emerald';
      case 'Leadership':
        return 'badge-amber';
      default:
        return 'badge-indigo';
    }
  }
}
