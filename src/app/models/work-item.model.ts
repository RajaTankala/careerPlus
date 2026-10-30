export type WorkStatus = 'completed' | 'in-progress' | 'blocked' | 'planned';

export type WorkCategory =
  | 'feature'
  | 'bugfix'
  | 'architecture'
  | 'code-review'
  | 'meeting'
  | 'devops'
  | 'research'
  | 'documentation';

export type ImpactLevel = 'brag-worthy' | 'high' | 'medium' | 'routine';

export interface WorkItem {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  project: string;
  description: string;
  highlights: string[]; // Key achievements or bullets
  blockers?: string;
  status: WorkStatus;
  category: WorkCategory;
  impact: ImpactLevel;
  hoursSpent?: number;
  skills: string[]; // e.g. ['Angular', 'TypeScript', 'Docker']
  createdAt: number;
  updatedAt?: number;
}

export interface WorkItemFilter {
  dateRange: 'all' | 'today' | 'this-week' | 'this-month' | 'custom';
  customStartDate?: string;
  customEndDate?: string;
  status?: WorkStatus | 'all';
  category?: WorkCategory | 'all';
  impact?: ImpactLevel | 'all';
  searchQuery?: string;
}
