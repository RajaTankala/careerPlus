export type DocumentReportType =
  | 'daily-standup'
  | 'weekly-sprint'
  | 'monthly-career-brag'
  | 'performance-appraisal';

export interface DocumentGenerationOptions {
  reportType: DocumentReportType;
  title: string;
  authorName: string;
  authorRole: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  includeMetrics: boolean;
  includeBlockers: boolean;
  includeReadingProgress: boolean;
  includeSkills: boolean;
  selectedWorkItemIds?: string[];
  customExecutiveSummary?: string;
}
