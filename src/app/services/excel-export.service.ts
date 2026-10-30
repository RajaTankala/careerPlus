import { Injectable, inject } from '@angular/core';
import * as XLSX from 'xlsx';
import { WorkItem } from '../models/work-item.model';
import { ReadingTopic } from '../models/reading-topic.model';
import { CircleBirthday, BirthdayCountdown } from '../models/circle-birthday.model';
import { CareerGoal } from '../models/career-goal.model';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root',
})
export class ExcelExportService {
  private readonly toast = inject(ToastService);

  /**
   * Exports full workspace data into a multi-tab Excel Workbook (.xlsx)
   */
  public exportCompleteWorkspace(
    workItems: WorkItem[],
    readingTopics: ReadingTopic[],
    birthdayCountdowns: BirthdayCountdown[],
    careerGoals: CareerGoal[],
    userName: string = 'User'
  ): void {
    const wb = XLSX.utils.book_new();

    // -------------------------------------------------------------
    // Sheet 1: Executive Summary
    // -------------------------------------------------------------
    const totalHours = workItems.reduce((acc, curr) => acc + (curr.hoursSpent || 0), 0);
    const completedTasks = workItems.filter((w) => w.status === 'completed').length;
    const bragWins = workItems.filter((w) => w.impact === 'brag-worthy' || w.impact === 'high').length;
    const completedReading = readingTopics.filter((r) => r.status === 'completed').length;

    const summaryData = [
      { Metric: 'Workspace Owner', Value: userName },
      { Metric: 'Export Timestamp', Value: new Date().toLocaleString() },
      { Metric: 'Total Work Items Logged', Value: workItems.length },
      { Metric: 'Completed Deliverables', Value: completedTasks },
      { Metric: 'High-Impact & Brag Wins', Value: bragWins },
      { Metric: 'Total Engineering Hours', Value: totalHours },
      { Metric: 'Total Reading Topics', Value: readingTopics.length },
      { Metric: 'Reading Topics Completed', Value: completedReading },
      { Metric: 'Circle Network Contacts', Value: birthdayCountdowns.length },
      { Metric: 'Active Career Goals / OKRs', Value: careerGoals.length },
    ];
    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Executive Summary');

    // -------------------------------------------------------------
    // Sheet 2: Work Status Logs
    // -------------------------------------------------------------
    const workData = workItems.map((item) => ({
      'Date (YYYY-MM-DD)': item.date,
      Project: item.project,
      'Task Title': item.title,
      Status: item.status.toUpperCase(),
      Category: item.category.toUpperCase(),
      'Impact Level': item.impact.toUpperCase(),
      'Hours Focused': item.hoursSpent || 0,
      'Skills / Stack': (item.skills || []).join(', '),
      'Summary Description': item.description,
      'Key Highlights / Deliverables': (item.highlights || []).join(' | '),
      'Blockers / Dependencies': item.blockers || 'None',
    }));
    const wsWork = XLSX.utils.json_to_sheet(workData);
    XLSX.utils.book_append_sheet(wb, wsWork, 'Work Status Log');

    // -------------------------------------------------------------
    // Sheet 3: Reading Roadmap
    // -------------------------------------------------------------
    const readingData = readingTopics.map((topic) => ({
      'Scheduled Month': topic.monthLabel,
      'Topic Title': topic.title,
      Category: topic.category,
      Priority: topic.priority.toUpperCase(),
      'Target Date': topic.targetDate,
      Status: topic.status.toUpperCase(),
      'Progress %': `${topic.progressPercent}%`,
      'Materials / Resources': (topic.resources || []).map((r) => `${r.name} (${r.type})`).join('; '),
      'Key Architectural Takeaways': topic.takeaways || '',
      'Reminders Enabled': topic.reminderEnabled ? 'YES' : 'NO',
    }));
    const wsReading = XLSX.utils.json_to_sheet(readingData);
    XLSX.utils.book_append_sheet(wb, wsReading, 'Reading Roadmap');

    // -------------------------------------------------------------
    // Sheet 4: Circle Birthdays & Network
    // -------------------------------------------------------------
    const birthdayData = birthdayCountdowns.map((b) => ({
      Name: b.contact.name,
      Relationship: b.contact.relationship.toUpperCase(),
      'Birthday Date': b.formattedDate,
      'Days Remaining': b.isToday ? 'TODAY 🎉' : b.daysRemaining,
      'Turning Age': b.turningAge || 'N/A',
      'Role & Company': b.contact.roleCompany || '',
      Email: b.contact.email || '',
      Phone: b.contact.phone || '',
      'Wished This Year': b.wishedThisYear ? 'YES' : 'PENDING',
      'Personal Notes & Interests': b.contact.notes || '',
    }));
    const wsBirthdays = XLSX.utils.json_to_sheet(birthdayData);
    XLSX.utils.book_append_sheet(wb, wsBirthdays, 'Circle Birthdays');

    // -------------------------------------------------------------
    // Sheet 5: Career Goals & OKRs
    // -------------------------------------------------------------
    const goalsData = careerGoals.map((goal) => ({
      'Goal Title': goal.title,
      'Target Timeline': goal.targetTimeline,
      Category: goal.category,
      Status: goal.status.toUpperCase(),
      'Progress %': `${goal.progressPercent}%`,
      'Key Results / Deliverables': goal.metrics || '',
      'Objective Description': goal.description,
    }));
    const wsGoals = XLSX.utils.json_to_sheet(goalsData);
    XLSX.utils.book_append_sheet(wb, wsGoals, 'Career Goals & OKRs');

    // Write file
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `CareerPlus_Comprehensive_Report_${dateStr}.xlsx`;
    XLSX.writeFile(wb, filename);

    this.toast.show(
      'success',
      '📊 Excel Workbook Generated!',
      `Exported 5 sheets to "${filename}" with full formatting.`
    );
  }

  /**
   * Exports only the filtered Work Status items to Excel (.xlsx)
   */
  public exportWorkItemsOnly(workItems: WorkItem[], fileNamePrefix: string = 'Work_Status'): void {
    const wb = XLSX.utils.book_new();

    const data = workItems.map((item) => ({
      Date: item.date,
      Project: item.project,
      'Task Title': item.title,
      Status: item.status.toUpperCase(),
      Category: item.category.toUpperCase(),
      Impact: item.impact.toUpperCase(),
      Hours: item.hoursSpent || 0,
      Skills: (item.skills || []).join(', '),
      Description: item.description,
      Highlights: (item.highlights || []).join(' | '),
      Blockers: item.blockers || '',
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'Work Deliverables');

    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `${fileNamePrefix}_${dateStr}.xlsx`;
    XLSX.writeFile(wb, filename);

    this.toast.show(
      'success',
      '📊 Excel Sheet Exported!',
      `Exported ${workItems.length} work items to "${filename}".`
    );
  }
}
