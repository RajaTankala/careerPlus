export interface CareerGoal {
  id: string;
  title: string;
  targetTimeline: string; // e.g. "Q4 2026", "2027 H1"
  category: 'Promotion' | 'Certification' | 'Technical Mastery' | 'Leadership' | 'Networking';
  description: string;
  progressPercent: number;
  status: 'active' | 'achieved' | 'paused';
  metrics?: string; // e.g. "Complete 5 mock interviews, publish 2 blog posts"
  createdAt: number;
}
