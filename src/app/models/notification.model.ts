export type NotificationType =
  | 'birthday'
  | 'reading-due'
  | 'reading-reminder'
  | 'work-streak'
  | 'goal-milestone'
  | 'system';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  date: string; // ISO string
  read: boolean;
  actionTab?: 'dashboard' | 'work-log' | 'reading-roadmap' | 'circle-birthdays' | 'goals';
  priority?: 'high' | 'normal';
}
