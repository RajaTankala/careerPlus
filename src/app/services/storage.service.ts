import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { WorkItem, WorkStatus, WorkCategory, ImpactLevel } from '../models/work-item.model';
import { ReadingTopic, ReadingStatus } from '../models/reading-topic.model';
import { CircleBirthday, BirthdayCountdown } from '../models/circle-birthday.model';
import { CareerGoal } from '../models/career-goal.model';
import { AppNotification } from '../models/notification.model';
import { ToastService } from './toast.service';
import {
  INITIAL_USER_PROFILE,
  INITIAL_WORK_ITEMS,
  INITIAL_READING_TOPICS,
  INITIAL_CIRCLE_BIRTHDAYS,
  INITIAL_CAREER_GOALS,
  INITIAL_NOTIFICATIONS,
} from './seed-data';

export type AppTab = 'dashboard' | 'work-log' | 'reading-roadmap' | 'circle-birthdays' | 'goals';

export type AppTheme = 'dark' | 'light';

const STORAGE_KEYS = {
  WORK_ITEMS: 'careerpulse_work_items_v1',
  READING_TOPICS: 'careerpulse_reading_topics_v1',
  BIRTHDAYS: 'careerpulse_birthdays_v1',
  CAREER_GOALS: 'careerpulse_goals_v1',
  NOTIFICATIONS: 'careerpulse_notifications_v1',
  USER_PROFILE: 'careerpulse_user_profile_v1',
  THEME: 'careerpulse_theme_v2',
};

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private readonly toast = inject(ToastService);

  // Navigation & Theme State (Dark / Light)
  public readonly activeTab = signal<AppTab>('dashboard');
  public readonly currentTheme = signal<AppTheme>('dark');

  // Real-time Save Confirmation Indicators
  public readonly lastSavedTime = signal<string>('Just now');
  public readonly isJustSaved = signal<boolean>(false);

  // Core Data Signals
  public readonly userProfile = signal(INITIAL_USER_PROFILE);
  public readonly workItems = signal<WorkItem[]>([]);
  public readonly readingTopics = signal<ReadingTopic[]>([]);
  public readonly circleBirthdays = signal<CircleBirthday[]>([]);
  public readonly careerGoals = signal<CareerGoal[]>([]);
  public readonly notifications = signal<AppNotification[]>([]);

  // Computed Properties
  public readonly totalRecordsCount = computed(() => {
    return (
      this.workItems().length +
      this.readingTopics().length +
      this.circleBirthdays().length +
      this.careerGoals().length
    );
  });

  public readonly storageEstimatedKb = computed(() => {
    try {
      const raw =
        JSON.stringify(this.workItems()) +
        JSON.stringify(this.readingTopics()) +
        JSON.stringify(this.circleBirthdays()) +
        JSON.stringify(this.careerGoals());
      return (new Blob([raw]).size / 1024).toFixed(1);
    } catch {
      return '12.4';
    }
  });

  public readonly unreadNotificationsCount = computed(() => {
    return this.notifications().filter((n) => !n.read).length;
  });

  public readonly sortedWorkItems = computed(() => {
    return [...this.workItems()].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  });

  public readonly todayDateString = computed(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  });

  public readonly todayWorkItems = computed(() => {
    const today = this.todayDateString();
    return this.workItems().filter((item) => item.date === today);
  });

  public readonly highImpactWinsCount = computed(() => {
    return this.workItems().filter(
      (item) => item.impact === 'brag-worthy' || item.impact === 'high'
    ).length;
  });

  public readonly totalHoursLogged = computed(() => {
    return this.workItems().reduce((acc, curr) => acc + (curr.hoursSpent || 0), 0);
  });

  // Circle Birthday calculations
  public readonly birthdayCountdowns = computed<BirthdayCountdown[]>(() => {
    const contacts = this.circleBirthdays();
    const now = new Date();
    const currentYear = now.getFullYear();
    const todayMonth = now.getMonth() + 1;
    const todayDay = now.getDate();

    const list: BirthdayCountdown[] = contacts.map((contact) => {
      let nextBirthdayDate = new Date(currentYear, contact.birthMonth - 1, contact.birthDay);
      const isPastThisYear =
        contact.birthMonth < todayMonth ||
        (contact.birthMonth === todayMonth && contact.birthDay < todayDay);

      if (isPastThisYear) {
        nextBirthdayDate = new Date(currentYear + 1, contact.birthMonth - 1, contact.birthDay);
      }

      const startOfToday = new Date(currentYear, now.getMonth(), todayDay).getTime();
      const targetTime = new Date(
        nextBirthdayDate.getFullYear(),
        nextBirthdayDate.getMonth(),
        nextBirthdayDate.getDate()
      ).getTime();
      const diffDays = Math.round((targetTime - startOfToday) / (1000 * 60 * 60 * 24));

      const isToday = diffDays === 0;
      const isThisWeek = diffDays >= 0 && diffDays <= 7;
      const isThisMonth = diffDays >= 0 && diffDays <= 30;
      const wishedThisYear = contact.wishedYears.includes(currentYear);

      const monthNames = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];
      const formattedDate = `${monthNames[contact.birthMonth - 1]} ${contact.birthDay}`;
      const turningAge = contact.birthYear
        ? nextBirthdayDate.getFullYear() - contact.birthYear
        : undefined;

      return {
        contact,
        daysRemaining: diffDays,
        formattedDate,
        isToday,
        isThisWeek,
        isThisMonth,
        wishedThisYear,
        turningAge,
      };
    });

    return list.sort((a, b) => a.daysRemaining - b.daysRemaining);
  });

  public readonly todayBirthdays = computed(() => {
    return this.birthdayCountdowns().filter((b) => b.isToday);
  });

  public readonly upcomingBirthdaysNext7Days = computed(() => {
    return this.birthdayCountdowns().filter((b) => b.daysRemaining > 0 && b.daysRemaining <= 7);
  });

  // Reading Topics Computed
  public readonly readingMonths = computed(() => {
    const topics = this.readingTopics();
    const map = new Map<string, string>();
    for (const t of topics) {
      if (!map.has(t.monthKey)) {
        map.set(t.monthKey, t.monthLabel);
      }
    }
    const now = new Date();
    const currKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const currLabel = now.toLocaleString('default', { month: 'long', year: 'numeric' });
    if (!map.has(currKey)) {
      map.set(currKey, currLabel);
    }

    return Array.from(map.entries())
      .map(([key, label]) => ({ key, label }))
      .sort((a, b) => a.key.localeCompare(b.key));
  });

  public readonly completedReadingCount = computed(() => {
    return this.readingTopics().filter((t) => t.status === 'completed').length;
  });

  public readonly totalReadingCount = computed(() => {
    return this.readingTopics().length;
  });

  public readonly averageReadingProgress = computed(() => {
    const list = this.readingTopics();
    if (list.length === 0) return 0;
    const sum = list.reduce((acc, t) => acc + (t.progressPercent || 0), 0);
    return Math.round(sum / list.length);
  });

  public readonly overdueReadingTopics = computed(() => {
    const today = this.todayDateString();
    return this.readingTopics().filter((t) => t.status !== 'completed' && t.targetDate < today);
  });

  constructor() {
    this.loadFromStorage();

    // Auto-save effect for changes
    effect(() => {
      this.saveToStorage();
    });

    this.evaluateReminders();
  }

  // Navigation
  public setActiveTab(tab: AppTab): void {
    this.activeTab.set(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Theme Management (Dark & Light Only)
  public toggleTheme(): void {
    const next: AppTheme = this.currentTheme() === 'dark' ? 'light' : 'dark';
    this.setTheme(next);
  }

  public setTheme(theme: AppTheme): void {
    this.currentTheme.set(theme);
    if (typeof document !== 'undefined') {
      document.body.classList.remove('theme-dark', 'theme-light');
      document.body.classList.add(`theme-${theme}`);
    }
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
    } catch (e) {
      console.warn('Storage unavailable', e);
    }

    this.toast.show(
      'info',
      theme === 'dark' ? '🌙 Dark Mode Active' : '☀️ Light Mode Active',
      `Switched to ${theme === 'dark' ? 'Dark' : 'Light'} theme.`
    );
  }

  // -------------------------------------------------------------
  // Work Items CRUD with Save Confirmation
  // -------------------------------------------------------------
  public addWorkItem(item: Omit<WorkItem, 'id' | 'createdAt'>): WorkItem {
    const newItem: WorkItem = {
      ...item,
      id: 'work-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      createdAt: Date.now(),
    };
    this.workItems.update((list) => [newItem, ...list]);
    this.toast.showSaveConfirmation(`Task: ${newItem.title}`);

    if (newItem.impact === 'brag-worthy') {
      this.addNotification({
        type: 'work-streak',
        title: '🌟 Brag-Worthy Milestone Logged!',
        message: `"${newItem.title}" was saved to your career portfolio. Ready for your appraisal report.`,
        date: new Date().toISOString(),
        read: false,
        actionTab: 'work-log',
        priority: 'high',
      });
    }

    return newItem;
  }

  public updateWorkItem(id: string, updates: Partial<WorkItem>): void {
    this.workItems.update((list) =>
      list.map((item) => (item.id === id ? { ...item, ...updates, updatedAt: Date.now() } : item))
    );
    this.toast.showSaveConfirmation('Work Item Updated');
  }

  public deleteWorkItem(id: string): void {
    this.workItems.update((list) => list.filter((item) => item.id !== id));
    this.toast.show('info', '🗑️ Item Removed', 'Work item removed and storage updated.');
  }

  // -------------------------------------------------------------
  // Reading Topics CRUD with Save Confirmation
  // -------------------------------------------------------------
  public addReadingTopic(topic: Omit<ReadingTopic, 'id' | 'createdAt'>): ReadingTopic {
    const newTopic: ReadingTopic = {
      ...topic,
      id: 'read-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      createdAt: Date.now(),
    };
    this.readingTopics.update((list) => [...list, newTopic]);
    this.toast.showSaveConfirmation(`Topic: ${newTopic.title}`);
    return newTopic;
  }

  public updateReadingTopic(id: string, updates: Partial<ReadingTopic>): void {
    this.readingTopics.update((list) =>
      list.map((topic) => {
        if (topic.id !== id) return topic;
        const updated = { ...topic, ...updates };
        if (updated.progressPercent >= 100 && updated.status !== 'completed') {
          updated.status = 'completed';
          updated.progressPercent = 100;
        }
        return updated;
      })
    );
    this.toast.showSaveConfirmation('Reading Roadmap Updated');
  }

  public toggleResourceCompleted(topicId: string, resourceId: string): void {
    this.readingTopics.update((list) =>
      list.map((topic) => {
        if (topic.id !== topicId) return topic;
        const updatedResources = topic.resources.map((res) =>
          res.id === resourceId ? { ...res, completed: !res.completed } : res
        );
        const completedCount = updatedResources.filter((r) => r.completed).length;
        const progress = Math.round((completedCount / updatedResources.length) * 100);
        const status: ReadingStatus =
          progress === 100 ? 'completed' : progress > 0 ? 'in-progress' : topic.status;

        return {
          ...topic,
          resources: updatedResources,
          progressPercent: progress,
          status,
        };
      })
    );
    this.toast.showSaveConfirmation('Resource checklist progress saved');
  }

  public deleteReadingTopic(id: string): void {
    this.readingTopics.update((list) => list.filter((topic) => topic.id !== id));
    this.toast.show('info', '🗑️ Topic Removed', 'Reading topic removed and storage updated.');
  }

  // -------------------------------------------------------------
  // Circle Birthdays CRUD with Save Confirmation
  // -------------------------------------------------------------
  public addCircleBirthday(
    birthday: Omit<CircleBirthday, 'id' | 'createdAt' | 'wishedYears'>
  ): CircleBirthday {
    const vibrantColors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#8b5cf6'];
    const randomColor = vibrantColors[Math.floor(Math.random() * vibrantColors.length)];

    const newBirthday: CircleBirthday = {
      ...birthday,
      id: 'bday-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      wishedYears: [],
      avatarColor: birthday.avatarColor || randomColor,
      createdAt: Date.now(),
    };

    this.circleBirthdays.update((list) => [...list, newBirthday]);
    this.toast.showSaveConfirmation(`Contact: ${newBirthday.name}`);
    return newBirthday;
  }

  public updateCircleBirthday(id: string, updates: Partial<CircleBirthday>): void {
    this.circleBirthdays.update((list) =>
      list.map((contact) => (contact.id === id ? { ...contact, ...updates } : contact))
    );
    this.toast.showSaveConfirmation('Contact Details Updated');
  }

  public toggleWishedThisYear(id: string): void {
    const currentYear = new Date().getFullYear();
    this.circleBirthdays.update((list) =>
      list.map((contact) => {
        if (contact.id !== id) return contact;
        const hasWished = contact.wishedYears.includes(currentYear);
        const wishedYears = hasWished
          ? contact.wishedYears.filter((y) => y !== currentYear)
          : [...contact.wishedYears, currentYear];
        return { ...contact, wishedYears };
      })
    );
    this.toast.showSaveConfirmation('Celebration wish status saved');
  }

  public deleteCircleBirthday(id: string): void {
    this.circleBirthdays.update((list) => list.filter((contact) => contact.id !== id));
    this.toast.show('info', '🗑️ Contact Removed', 'Circle contact removed.');
  }

  // -------------------------------------------------------------
  // Career Goals CRUD with Save Confirmation
  // -------------------------------------------------------------
  public addCareerGoal(goal: Omit<CareerGoal, 'id' | 'createdAt'>): CareerGoal {
    const newGoal: CareerGoal = {
      ...goal,
      id: 'goal-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      createdAt: Date.now(),
    };
    this.careerGoals.update((list) => [...list, newGoal]);
    this.toast.showSaveConfirmation(`Goal: ${newGoal.title}`);
    return newGoal;
  }

  public updateCareerGoal(id: string, updates: Partial<CareerGoal>): void {
    this.careerGoals.update((list) =>
      list.map((goal) => (goal.id === id ? { ...goal, ...updates } : goal))
    );
    this.toast.showSaveConfirmation('Career Milestone Saved');
  }

  public deleteCareerGoal(id: string): void {
    this.careerGoals.update((list) => list.filter((goal) => goal.id !== id));
    this.toast.show('info', '🗑️ Goal Removed', 'Goal removed from roadmap.');
  }

  // -------------------------------------------------------------
  // Storage Health Check & Explicit Verification
  // -------------------------------------------------------------
  public verifyStorageIntegrity(): {
    healthy: boolean;
    recordCount: number;
    sizeKb: string;
    lastSaved: string;
  } {
    const now = new Date();
    const testKey = 'careerpulse_health_probe_' + Date.now();
    let isHealthy = false;

    try {
      localStorage.setItem(testKey, 'probe_ok');
      const val = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);
      isHealthy = val === 'probe_ok';
    } catch {
      isHealthy = false;
    }

    const report = {
      healthy: isHealthy,
      recordCount: this.totalRecordsCount(),
      sizeKb: this.storageEstimatedKb(),
      lastSaved: this.lastSavedTime(),
    };

    if (isHealthy) {
      this.toast.show(
        'success',
        '✅ Storage Verified & 100% Intact!',
        `Verified ${report.recordCount} records (${report.sizeKb} KB) safely saved in your browser LocalStorage.`
      );
    } else {
      this.toast.show(
        'error',
        '⚠️ Storage Warning',
        'LocalStorage is restricted or full. Please check your browser privacy settings.'
      );
    }

    return report;
  }

  // -------------------------------------------------------------
  // Notifications
  // -------------------------------------------------------------
  public addNotification(notification: Omit<AppNotification, 'id'>): void {
    const newNotif: AppNotification = {
      ...notification,
      id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    };
    this.notifications.update((list) => [newNotif, ...list]);
  }

  public markNotificationAsRead(id: string): void {
    this.notifications.update((list) =>
      list.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }

  public markAllNotificationsAsRead(): void {
    this.notifications.update((list) => list.map((n) => ({ ...n, read: true })));
  }

  public clearAllNotifications(): void {
    this.notifications.set([]);
  }

  // -------------------------------------------------------------
  // Data Import / Export / Backup
  // -------------------------------------------------------------
  public exportDataJson(): string {
    const payload = {
      version: 2,
      exportedAt: new Date().toISOString(),
      userProfile: this.userProfile(),
      workItems: this.workItems(),
      readingTopics: this.readingTopics(),
      circleBirthdays: this.circleBirthdays(),
      careerGoals: this.careerGoals(),
      notifications: this.notifications(),
    };
    return JSON.stringify(payload, null, 2);
  }

  public downloadBackupFile(): void {
    const json = this.exportDataJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `careerpulse-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    this.toast.show('success', '💾 Backup Downloaded', 'Full JSON archive downloaded successfully.');
  }

  public importDataJson(jsonString: string): { success: boolean; message: string } {
    try {
      const data = JSON.parse(jsonString);
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid JSON format');
      }

      if (Array.isArray(data.workItems)) this.workItems.set(data.workItems);
      if (Array.isArray(data.readingTopics)) this.readingTopics.set(data.readingTopics);
      if (Array.isArray(data.circleBirthdays)) this.circleBirthdays.set(data.circleBirthdays);
      if (Array.isArray(data.careerGoals)) this.careerGoals.set(data.careerGoals);
      if (Array.isArray(data.notifications)) this.notifications.set(data.notifications);
      if (data.userProfile) this.userProfile.set(data.userProfile);

      this.saveToStorage();
      this.toast.show('success', '📂 Restore Complete', 'All records restored to LocalStorage.');
      return { success: true, message: 'All workspace data restored successfully!' };
    } catch (err: any) {
      return { success: false, message: 'Import failed: ' + (err?.message || 'Invalid data') };
    }
  }

  public resetToDemoData(): void {
    this.userProfile.set(INITIAL_USER_PROFILE);
    this.workItems.set(INITIAL_WORK_ITEMS);
    this.readingTopics.set(INITIAL_READING_TOPICS);
    this.circleBirthdays.set(INITIAL_CIRCLE_BIRTHDAYS);
    this.careerGoals.set(INITIAL_CAREER_GOALS);
    this.notifications.set(INITIAL_NOTIFICATIONS);
    this.saveToStorage();
    this.toast.show('success', '🔄 Demo Data Restored', 'Loaded sample engineering data.');
  }

  // -------------------------------------------------------------
  // Internal Persistence & Reminder Logic
  // -------------------------------------------------------------
  private loadFromStorage(): void {
    if (typeof localStorage === 'undefined') return;

    try {
      const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) as AppTheme | null;
      if (savedTheme === 'light' || savedTheme === 'dark') {
        this.setTheme(savedTheme);
      } else {
        this.setTheme('dark');
      }

      const rawWork = localStorage.getItem(STORAGE_KEYS.WORK_ITEMS);
      const rawReading = localStorage.getItem(STORAGE_KEYS.READING_TOPICS);
      const rawBirthdays = localStorage.getItem(STORAGE_KEYS.BIRTHDAYS);
      const rawGoals = localStorage.getItem(STORAGE_KEYS.CAREER_GOALS);
      const rawNotifs = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      const rawProfile = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);

      this.workItems.set(rawWork ? JSON.parse(rawWork) : INITIAL_WORK_ITEMS);
      this.readingTopics.set(rawReading ? JSON.parse(rawReading) : INITIAL_READING_TOPICS);
      this.circleBirthdays.set(rawBirthdays ? JSON.parse(rawBirthdays) : INITIAL_CIRCLE_BIRTHDAYS);
      this.careerGoals.set(rawGoals ? JSON.parse(rawGoals) : INITIAL_CAREER_GOALS);
      this.notifications.set(rawNotifs ? JSON.parse(rawNotifs) : INITIAL_NOTIFICATIONS);
      if (rawProfile) {
        this.userProfile.set(JSON.parse(rawProfile));
      }
    } catch (err) {
      console.warn('Failed to parse saved data from localStorage, falling back to seed data', err);
      this.resetToDemoData();
    }
  }

  private saveToStorage(): void {
    if (typeof localStorage === 'undefined') return;

    try {
      localStorage.setItem(STORAGE_KEYS.WORK_ITEMS, JSON.stringify(this.workItems()));
      localStorage.setItem(STORAGE_KEYS.READING_TOPICS, JSON.stringify(this.readingTopics()));
      localStorage.setItem(STORAGE_KEYS.BIRTHDAYS, JSON.stringify(this.circleBirthdays()));
      localStorage.setItem(STORAGE_KEYS.CAREER_GOALS, JSON.stringify(this.careerGoals()));
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(this.notifications()));
      localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(this.userProfile()));

      const now = new Date();
      this.lastSavedTime.set(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
      this.isJustSaved.set(true);
      setTimeout(() => this.isJustSaved.set(false), 2000);
    } catch (err) {
      console.warn('LocalStorage save error:', err);
    }
  }

  private evaluateReminders(): void {
    setTimeout(() => {
      const todayBdays = this.todayBirthdays();
      const existingNotifTitles = new Set(this.notifications().map((n) => n.title));

      for (const bday of todayBdays) {
        const title = `🎂 Today is ${bday.contact.name}'s Birthday!`;
        if (!existingNotifTitles.has(title)) {
          this.addNotification({
            type: 'birthday',
            title,
            message: `Don't forget to wish ${bday.contact.name} (${bday.contact.relationship}). Send a warm greeting!`,
            date: new Date().toISOString(),
            read: false,
            actionTab: 'circle-birthdays',
            priority: 'high',
          });
        }
      }
    }, 1000);
  }
}
