export type ReadingStatus = 'not-started' | 'in-progress' | 'completed';

export type ReadingCategory =
  | 'Architecture'
  | 'Frontend Mastery'
  | 'Backend & APIs'
  | 'Cloud & DevOps'
  | 'System Design'
  | 'Leadership & Strategy'
  | 'Data & AI'
  | 'Career & Habits'
  | 'Data Structures & Algorithms';

export interface ReadingResource {
  id: string;
  name: string;
  type: 'book' | 'article' | 'course' | 'doc' | 'podcast' | 'paper';
  url?: string;
  completed?: boolean;
}

export interface ReadingTopic {
  id: string;
  monthKey: string; // e.g. '2026-10', '2026-11'
  monthLabel: string; // e.g. 'October 2026'
  title: string;
  category: ReadingCategory;
  description: string;
  targetDate: string; // YYYY-MM-DD
  status: ReadingStatus;
  progressPercent: number; // 0 - 100
  resources: ReadingResource[];
  takeaways?: string;
  reminderEnabled: boolean;
  priority: 'high' | 'medium' | 'low';
  createdAt: number;
}
