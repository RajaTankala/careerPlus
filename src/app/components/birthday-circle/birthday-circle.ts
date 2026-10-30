import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StorageService } from '../../services/storage.service';
import { CircleBirthday, CircleRelationship, BirthdayCountdown } from '../../models/circle-birthday.model';

@Component({
  selector: 'app-birthday-circle',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="circle-page">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Circle Birthdays & Relationship Network</h1>
          <p class="page-subtitle">
            Nurture your engineering circle, mentors, colleagues, and friends. Receive automated countdown reminders and send warm, thoughtful wishes.
          </p>
        </div>
        <button class="btn btn-primary" (click)="openCreateModal()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>+ Add Circle Contact</span>
        </button>
      </div>

      <!-- Celebrations Today Hero Banner (if any) -->
      @if (storage.todayBirthdays().length > 0) {
        <div class="celebration-hero glass-panel">
          <div class="celebration-icon">🎂</div>
          <div class="celebration-info">
            <h2 class="celebration-title">Celebrations Today!</h2>
            <p class="celebration-subtitle">
              Reach out and celebrate with:
              @for (b of storage.todayBirthdays(); track b.contact.id; let last = $last) {
                <strong>{{ b.contact.name }}</strong> ({{ b.contact.relationship }}){{ last ? '' : ', ' }}
              }
            </p>
          </div>
          <button class="btn btn-primary" (click)="openWishGenerator(storage.todayBirthdays()[0].contact)">
            ✨ Generate Birthday Wish
          </button>
        </div>
      }

      <!-- Filter & Search Toolbar -->
      <div class="filter-bar glass-panel">
        <div class="filter-tabs">
          <button
            class="tab-btn"
            [class.active]="relationshipFilter() === 'all'"
            (click)="relationshipFilter.set('all')"
          >
            All Contacts ({{ storage.circleBirthdays().length }})
          </button>

          <button
            class="tab-btn"
            [class.active]="relationshipFilter() === 'colleague'"
            (click)="relationshipFilter.set('colleague')"
          >
            Colleagues
          </button>

          <button
            class="tab-btn"
            [class.active]="relationshipFilter() === 'mentor'"
            (click)="relationshipFilter.set('mentor')"
          >
            Mentors & Leaders
          </button>

          <button
            class="tab-btn"
            [class.active]="relationshipFilter() === 'close-friend'"
            (click)="relationshipFilter.set('close-friend')"
          >
            Friends & Family
          </button>

          <button
            class="tab-btn"
            [class.active]="showUpcomingOnly()"
            (click)="showUpcomingOnly.set(!showUpcomingOnly())"
          >
            🔔 Next 30 Days Only
          </button>
        </div>

        <div class="search-wrap">
          <input
            type="text"
            class="form-control search-input"
            placeholder="Search circle contacts..."
            [ngModel]="searchQuery()"
            (ngModelChange)="searchQuery.set($event)"
          />
        </div>
      </div>

      <!-- Contacts Grid -->
      <div class="contacts-grid">
        @if (filteredContacts().length === 0) {
          <div class="card empty-card">
            <div class="empty-icon">👥</div>
            <h3>No circle contacts found</h3>
            <p>Add your colleagues, managers, and mentors to never miss an important milestone.</p>
            <button class="btn btn-sm btn-primary" (click)="openCreateModal()">
              + Add First Contact
            </button>
          </div>
        } @else {
          @for (item of filteredContacts(); track item.contact.id) {
            <div class="card contact-card" [class.is-today]="item.isToday">
              <!-- Top Row -->
              <div class="contact-header">
                <div class="avatar-circle" [style.background-color]="item.contact.avatarColor || '#6366f1'">
                  {{ item.contact.name.charAt(0) }}
                </div>

                <div class="contact-title-group">
                  <div class="contact-name">
                    {{ item.contact.name }}
                  </div>
                  <div class="contact-role">
                    {{ item.contact.roleCompany || 'Network Contact' }}
                  </div>
                </div>

                <div class="contact-actions">
                  <button
                    class="btn-icon btn-secondary btn-sm"
                    (click)="openEditModal(item.contact)"
                    title="Edit Contact"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>

                  <button
                    class="btn-icon btn-secondary btn-sm text-danger"
                    (click)="deleteContact(item.contact)"
                    title="Delete Contact"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Relationship & Countdown Badge Row -->
              <div class="countdown-row">
                <span class="badge" [ngClass]="getRelationshipBadgeClass(item.contact.relationship)">
                  {{ item.contact.relationship }}
                </span>

                <div class="countdown-tag" [class.today]="item.isToday" [class.urgent]="item.daysRemaining <= 7">
                  @if (item.isToday) {
                    <span>🎉 TODAY!</span>
                  } @else if (item.daysRemaining === 1) {
                    <span>🎂 Tomorrow!</span>
                  } @else {
                    <span>In {{ item.daysRemaining }} days ({{ item.formattedDate }})</span>
                  }
                  @if (item.turningAge) {
                    <span class="turning-age">Turning {{ item.turningAge }}</span>
                  }
                </div>
              </div>

              <!-- Contact Notes -->
              @if (item.contact.notes) {
                <p class="contact-notes">
                  "{{ item.contact.notes }}"
                </p>
              }

              <!-- Wished status & Quick Wish Generator CTA -->
              <div class="contact-footer">
                <label class="wished-checkbox-label">
                  <input
                    type="checkbox"
                    [checked]="item.wishedThisYear"
                    (change)="storage.toggleWishedThisYear(item.contact.id)"
                  />
                  <span [class.text-emerald]="item.wishedThisYear">
                    {{ item.wishedThisYear ? '✓ Wished this year' : 'Mark as wished' }}
                  </span>
                </label>

                <button class="btn btn-sm btn-outline wish-btn" (click)="openWishGenerator(item.contact)">
                  ✨ Wish Generator
                </button>
              </div>
            </div>
          }
        }
      </div>

      <!-- Add/Edit Contact Modal -->
      @if (showModal()) {
        <div class="modal-backdrop" (click)="closeModal()">
          <div class="modal-dialog" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3 class="modal-title">
                {{ isEditing() ? '✏️ Edit Circle Contact' : '🎂 Add Circle Contact & Birthday' }}
              </h3>
              <button class="btn-icon btn-secondary btn-sm" (click)="closeModal()">✕</button>
            </div>

            <div class="modal-body">
              <div class="form-row">
                <div class="form-group flex-2">
                  <label class="form-label">Full Name</label>
                  <input
                    type="text"
                    class="form-control"
                    placeholder="e.g. Sarah Chen"
                    [(ngModel)]="formName"
                  />
                </div>
                <div class="form-group flex-1">
                  <label class="form-label">Relationship</label>
                  <select class="form-control" [(ngModel)]="formRelationship">
                    <option value="colleague">Colleague</option>
                    <option value="manager">Manager / Lead</option>
                    <option value="mentor">Mentor</option>
                    <option value="close-friend">Close Friend</option>
                    <option value="family">Family</option>
                    <option value="network">Network / Peer</option>
                  </select>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group flex-1">
                  <label class="form-label">Birth Month</label>
                  <select class="form-control" [(ngModel)]="formBirthMonth">
                    <option [value]="1">January (01)</option>
                    <option [value]="2">February (02)</option>
                    <option [value]="3">March (03)</option>
                    <option [value]="4">April (04)</option>
                    <option [value]="5">May (05)</option>
                    <option [value]="6">June (06)</option>
                    <option [value]="7">July (07)</option>
                    <option [value]="8">August (08)</option>
                    <option [value]="9">September (09)</option>
                    <option [value]="10">October (10)</option>
                    <option [value]="11">November (11)</option>
                    <option [value]="12">December (12)</option>
                  </select>
                </div>

                <div class="form-group flex-1">
                  <label class="form-label">Birth Day</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    class="form-control"
                    placeholder="e.g. 15"
                    [(ngModel)]="formBirthDay"
                  />
                </div>

                <div class="form-group flex-1">
                  <label class="form-label">Birth Year (Optional)</label>
                  <input
                    type="number"
                    min="1940"
                    max="2030"
                    class="form-control"
                    placeholder="e.g. 1992"
                    [(ngModel)]="formBirthYear"
                  />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Role / Company / Context</label>
                <input
                  type="text"
                  class="form-control"
                  placeholder="e.g. Principal Architect @ TechCorp"
                  [(ngModel)]="formRoleCompany"
                />
              </div>

              <div class="form-row">
                <div class="form-group flex-1">
                  <label class="form-label">Email (Optional)</label>
                  <input
                    type="email"
                    class="form-control"
                    placeholder="sarah@example.com"
                    [(ngModel)]="formEmail"
                  />
                </div>
                <div class="form-group flex-1">
                  <label class="form-label">Phone / WhatsApp (Optional)</label>
                  <input
                    type="text"
                    class="form-control"
                    placeholder="+1 (555) 000-0000"
                    [(ngModel)]="formPhone"
                  />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Personal Notes / Gift Ideas / Shared Interests</label>
                <textarea
                  class="form-control"
                  rows="2"
                  placeholder="Key career collaborator, loves system architecture books and artisan coffee..."
                  [(ngModel)]="formNotes"
                ></textarea>
              </div>
            </div>

            <div class="modal-footer">
              <button class="btn btn-secondary" (click)="closeModal()">Cancel</button>
              <button class="btn btn-primary" (click)="saveContact()">
                {{ isEditing() ? 'Save Changes' : 'Add to Circle' }}
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Wish Generator Modal -->
      @if (showWishModal() && activeWishContact()) {
        <div class="modal-backdrop" (click)="showWishModal.set(false)">
          <div class="modal-dialog" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3 class="modal-title">
                ✨ Birthday Greeting for {{ activeWishContact()?.name }}
              </h3>
              <button class="btn-icon btn-secondary btn-sm" (click)="showWishModal.set(false)">✕</button>
            </div>

            <div class="modal-body">
              <p class="wish-intro">
                Choose a personalized wish style tailored for a 
                <strong>{{ activeWishContact()?.relationship }}</strong>:
              </p>

              <div class="wish-options">
                <div class="wish-card" (click)="selectWish(getWishOption(1))">
                  <div class="wish-style-tag">Option 1: Professional & Warm</div>
                  <p class="wish-text">{{ getWishOption(1) }}</p>
                </div>

                <div class="wish-card" (click)="selectWish(getWishOption(2))">
                  <div class="wish-style-tag">Option 2: Mentorship & Impact</div>
                  <p class="wish-text">{{ getWishOption(2) }}</p>
                </div>

                <div class="wish-card" (click)="selectWish(getWishOption(3))">
                  <div class="wish-style-tag">Option 3: Casual & Celebratory</div>
                  <p class="wish-text">{{ getWishOption(3) }}</p>
                </div>
              </div>

              @if (wishCopied()) {
                <div class="copy-alert">✓ Copied wish to clipboard!</div>
              }
            </div>

            <div class="modal-footer">
              @if (activeWishContact()?.email) {
                <a
                  [href]="'mailto:' + activeWishContact()?.email + '?subject=Happy Birthday!&body=' + encode(selectedWishText())"
                  class="btn btn-secondary btn-sm"
                >
                  ✉️ Open Email
                </a>
              }
              <button class="btn btn-primary" (click)="copyCurrentWish()">
                📋 Copy Selected Wish
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .circle-page {
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

      /* Celebration Hero Banner */
      .celebration-hero {
        padding: 1.5rem 2rem;
        background: linear-gradient(135deg, rgba(236, 72, 153, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%);
        border: 1px solid rgba(236, 72, 153, 0.35);
        border-radius: 16px;
        display: flex;
        align-items: center;
        gap: 1.5rem;
        animation: scaleUp 0.25s ease-out;
      }
      .celebration-icon {
        font-size: 2.8rem;
      }
      .celebration-info {
        flex: 1;
      }
      .celebration-title {
        font-size: 1.35rem;
        font-weight: 800;
        color: var(--text-primary);
        margin-bottom: 0.2rem;
      }
      .celebration-subtitle {
        font-size: 0.9rem;
        color: var(--text-secondary);
      }

      /* Filter Bar */
      .filter-bar {
        padding: 0.85rem 1.25rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        flex-wrap: wrap;
      }

      .filter-tabs {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        flex-wrap: wrap;
      }

      .tab-btn {
        padding: 0.45rem 0.85rem;
        border-radius: 8px;
        border: 1px solid var(--border-color);
        background: var(--bg-card);
        color: var(--text-secondary);
        font-size: 0.825rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.15s ease;
      }
      .tab-btn:hover {
        border-color: var(--primary-500);
        color: var(--text-primary);
      }
      .tab-btn.active {
        background: var(--primary-500);
        color: white;
        border-color: var(--primary-500);
      }

      .search-wrap {
        min-width: 240px;
      }
      .search-input {
        padding: 0.45rem 0.75rem;
        font-size: 0.85rem;
      }

      /* Contacts Grid */
      .contacts-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1.25rem;
      }

      .contact-card {
        padding: 1.4rem;
        display: flex;
        flex-direction: column;
        gap: 0.85rem;
        transition: all 0.2s ease;
      }
      .contact-card.is-today {
        border: 2px solid #ec4899;
        box-shadow: 0 0 20px rgba(236, 72, 153, 0.25);
      }

      .contact-header {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .avatar-circle {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        color: white;
        font-size: 1.1rem;
        font-weight: 800;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: var(--shadow-sm);
      }

      .contact-title-group {
        flex: 1;
        overflow: hidden;
      }

      .contact-name {
        font-size: 1.05rem;
        font-weight: 800;
        color: var(--text-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .contact-role {
        font-size: 0.775rem;
        color: var(--text-muted);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .contact-actions {
        display: flex;
        align-items: center;
        gap: 0.35rem;
      }

      /* Countdown Row */
      .countdown-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
      }

      .countdown-tag {
        font-size: 0.75rem;
        font-weight: 700;
        color: var(--text-muted);
        background: var(--bg-card-subtle);
        padding: 0.25rem 0.6rem;
        border-radius: 6px;
      }
      .countdown-tag.urgent {
        color: #f59e0b;
        background: rgba(245, 158, 11, 0.15);
      }
      .countdown-tag.today {
        color: #ec4899;
        background: rgba(236, 72, 153, 0.18);
        font-weight: 800;
      }
      .turning-age {
        margin-left: 0.35rem;
        opacity: 0.8;
      }

      .contact-notes {
        font-size: 0.825rem;
        color: var(--text-secondary);
        font-style: italic;
        line-height: 1.4;
        background: var(--bg-card-subtle);
        padding: 0.6rem 0.85rem;
        border-radius: 8px;
      }

      /* Footer */
      .contact-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-top: 0.5rem;
        border-top: 1px solid var(--border-color);
      }

      .wished-checkbox-label {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 0.8rem;
        cursor: pointer;
        color: var(--text-muted);
      }

      .wish-btn {
        color: var(--primary-500);
      }

      /* Empty Card */
      .empty-card {
        grid-column: 1 / -1;
        text-align: center;
        padding: 3.5rem 1.5rem;
        color: var(--text-muted);
      }
      .empty-icon {
        font-size: 2.5rem;
        margin-bottom: 0.5rem;
      }

      /* Wish Generator Modal */
      .wish-intro {
        font-size: 0.875rem;
        color: var(--text-secondary);
        margin-bottom: 1rem;
      }

      .wish-options {
        display: flex;
        flex-direction: column;
        gap: 0.85rem;
      }

      .wish-card {
        padding: 1rem;
        border-radius: 10px;
        background: var(--bg-card-subtle);
        border: 1px solid var(--border-color);
        cursor: pointer;
        transition: all 0.15s ease;
      }
      .wish-card:hover {
        border-color: var(--primary-500);
        background: rgba(99, 102, 241, 0.08);
      }

      .wish-style-tag {
        font-size: 0.75rem;
        font-weight: 700;
        color: var(--primary-500);
        margin-bottom: 0.35rem;
      }

      .wish-text {
        font-size: 0.875rem;
        color: var(--text-primary);
        line-height: 1.45;
      }

      .copy-alert {
        margin-top: 1rem;
        background: rgba(16, 185, 129, 0.15);
        color: #10b981;
        padding: 0.5rem 0.8rem;
        border-radius: 6px;
        font-size: 0.85rem;
        font-weight: 700;
        text-align: center;
      }

      /* Modal specifics */
      .form-row {
        display: flex;
        gap: 1rem;
      }
      .flex-1 { flex: 1; }
      .flex-2 { flex: 2; }

      @media (max-width: 1024px) {
        .contacts-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      @media (max-width: 640px) {
        .contacts-grid {
          grid-template-columns: 1fr;
        }
        .form-row {
          flex-direction: column;
        }
      }
    `,
  ],
})
export class BirthdayCircleComponent {
  public readonly storage = inject(StorageService);

  // Filters
  public readonly relationshipFilter = signal<string>('all');
  public readonly showUpcomingOnly = signal(false);
  public readonly searchQuery = signal('');

  // Modal State
  public readonly showModal = signal(false);
  public readonly isEditing = signal(false);
  public readonly editingId = signal<string | null>(null);

  // Wish Generator Modal
  public readonly showWishModal = signal(false);
  public readonly activeWishContact = signal<CircleBirthday | null>(null);
  public readonly selectedWishText = signal('');
  public readonly wishCopied = signal(false);

  // Form Fields
  public formName = '';
  public formRelationship: CircleRelationship = 'colleague';
  public formBirthMonth = 10;
  public formBirthDay = 15;
  public formBirthYear?: number;
  public formRoleCompany = '';
  public formEmail = '';
  public formPhone = '';
  public formNotes = '';

  public readonly filteredContacts = computed(() => {
    let list = this.storage.birthdayCountdowns();
    const rel = this.relationshipFilter();
    const upcomingOnly = this.showUpcomingOnly();
    const query = this.searchQuery().toLowerCase().trim();

    if (rel !== 'all') {
      list = list.filter((b) => b.contact.relationship === rel);
    }

    if (upcomingOnly) {
      list = list.filter((b) => b.daysRemaining <= 30);
    }

    if (query) {
      list = list.filter((b) => {
        return (
          b.contact.name.toLowerCase().includes(query) ||
          (b.contact.roleCompany && b.contact.roleCompany.toLowerCase().includes(query)) ||
          (b.contact.notes && b.contact.notes.toLowerCase().includes(query))
        );
      });
    }

    return list;
  });

  public openCreateModal(): void {
    this.isEditing.set(false);
    this.editingId.set(null);
    this.formName = '';
    this.formRelationship = 'colleague';
    const now = new Date();
    this.formBirthMonth = now.getMonth() + 1;
    this.formBirthDay = now.getDate();
    this.formBirthYear = 1992;
    this.formRoleCompany = '';
    this.formEmail = '';
    this.formPhone = '';
    this.formNotes = '';
    this.showModal.set(true);
  }

  public openEditModal(contact: CircleBirthday): void {
    this.isEditing.set(true);
    this.editingId.set(contact.id);
    this.formName = contact.name;
    this.formRelationship = contact.relationship;
    this.formBirthMonth = contact.birthMonth;
    this.formBirthDay = contact.birthDay;
    this.formBirthYear = contact.birthYear;
    this.formRoleCompany = contact.roleCompany || '';
    this.formEmail = contact.email || '';
    this.formPhone = contact.phone || '';
    this.formNotes = contact.notes || '';
    this.showModal.set(true);
  }

  public closeModal(): void {
    this.showModal.set(false);
  }

  public saveContact(): void {
    if (!this.formName.trim()) {
      alert('Please enter a contact name');
      return;
    }

    const payload = {
      name: this.formName.trim(),
      relationship: this.formRelationship,
      birthMonth: Number(this.formBirthMonth),
      birthDay: Number(this.formBirthDay),
      birthYear: this.formBirthYear ? Number(this.formBirthYear) : undefined,
      roleCompany: this.formRoleCompany.trim() || undefined,
      email: this.formEmail.trim() || undefined,
      phone: this.formPhone.trim() || undefined,
      notes: this.formNotes.trim() || undefined,
    };

    if (this.isEditing() && this.editingId()) {
      this.storage.updateCircleBirthday(this.editingId()!, payload);
    } else {
      this.storage.addCircleBirthday(payload);
    }

    this.closeModal();
  }

  public deleteContact(contact: CircleBirthday): void {
    if (confirm(`Remove "${contact.name}" from your circle?`)) {
      this.storage.deleteCircleBirthday(contact.id);
    }
  }

  // Wish Generator
  public openWishGenerator(contact: CircleBirthday): void {
    this.activeWishContact.set(contact);
    this.selectedWishText.set(this.getWishOption(1, contact));
    this.wishCopied.set(false);
    this.showWishModal.set(true);
  }

  public getWishOption(optionIndex: number, overrideContact?: CircleBirthday): string {
    const contact = overrideContact || this.activeWishContact();
    if (!contact) return '';

    const name = contact.name.split(' ')[0];

    if (optionIndex === 1) {
      // Professional Warm
      return `Hi ${name}! Wishing you a wonderful birthday and an extraordinary year ahead. It's always fantastic collaborating with you—hope you take some well-deserved time to celebrate! 🎉`;
    } else if (optionIndex === 2) {
      // Mentorship / Career Impact
      return `Happy Birthday ${name}! Thank you for your continued guidance, insights, and leadership. Wishing you great health, happiness, and continued impact in everything you do! 🎂✨`;
    } else {
      // Casual & Celebratory
      return `Happy Birthday ${name}! 🥳 Hope you have a great day filled with good food, friends, and celebration! Here's to another amazing trip around the sun! 🚀`;
    }
  }

  public selectWish(text: string): void {
    this.selectedWishText.set(text);
    this.copyCurrentWish();
  }

  public async copyCurrentWish(): Promise<void> {
    const text = this.selectedWishText();
    if (text) {
      await navigator.clipboard.writeText(text);
      this.wishCopied.set(true);
      setTimeout(() => this.wishCopied.set(false), 2500);
    }
  }

  public encode(text: string): string {
    return encodeURIComponent(text);
  }

  public getRelationshipBadgeClass(rel: CircleRelationship): string {
    switch (rel) {
      case 'mentor':
        return 'badge-purple';
      case 'colleague':
        return 'badge-indigo';
      case 'manager':
        return 'badge-cyan';
      case 'close-friend':
        return 'badge-rose';
      case 'family':
        return 'badge-emerald';
      default:
        return 'badge-amber';
    }
  }
}
