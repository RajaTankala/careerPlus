import { Injectable } from '@angular/core';
import { WorkItem } from '../models/work-item.model';
import { ReadingTopic } from '../models/reading-topic.model';
import { DocumentGenerationOptions, DocumentReportType } from '../models/document-template.model';

@Injectable({
  providedIn: 'root',
})
export class DocumentGeneratorService {
  /**
   * Generates a clean, copyable Markdown string representation of the report
   */
  public generateMarkdown(
    options: DocumentGenerationOptions,
    workItems: WorkItem[],
    readingTopics: ReadingTopic[]
  ): string {
    const lines: string[] = [];

    // Header
    lines.push(`# ${options.title || 'Work Status & Career Impact Report'}`);
    lines.push(`**Author:** ${options.authorName} (${options.authorRole})`);
    lines.push(`**Date Range:** ${options.startDate} to ${options.endDate}`);
    lines.push(`**Generated On:** ${new Date().toLocaleDateString('en-US', { dateStyle: 'full' })}`);
    lines.push('');

    // Executive Summary
    if (options.customExecutiveSummary) {
      lines.push('## Executive Summary');
      lines.push(options.customExecutiveSummary);
      lines.push('');
    }

    // High Level Metrics
    if (options.includeMetrics) {
      const totalTasks = workItems.length;
      const completedTasks = workItems.filter((w) => w.status === 'completed').length;
      const bragTasks = workItems.filter((w) => w.impact === 'brag-worthy').length;
      const totalHours = workItems.reduce((acc, w) => acc + (w.hoursSpent || 0), 0);

      lines.push('## 📊 Key Highlights & Metrics');
      lines.push(`- **Total Work Items Logged:** ${totalTasks}`);
      lines.push(`- **Completed Deliverables:** ${completedTasks}`);
      lines.push(`- **High-Impact / Brag Milestones:** ${bragTasks}`);
      lines.push(`- **Total Focus Hours:** ${totalHours} hrs`);
      lines.push('');
    }

    // Report Type Specific Sections
    if (options.reportType === 'daily-standup') {
      const completed = workItems.filter((w) => w.status === 'completed');
      const inProgress = workItems.filter((w) => w.status === 'in-progress' || w.status === 'planned');
      const blockers = workItems.filter((w) => w.status === 'blocked' || !!w.blockers);

      lines.push('## ✅ What Was Completed (Yesterday / Today)');
      if (completed.length === 0) {
        lines.push('- No tasks marked completed in this period.');
      } else {
        completed.forEach((w) => {
          lines.push(`- **[${w.project}]** ${w.title}`);
          w.highlights.forEach((h) => lines.push(`  - ${h}`));
        });
      }
      lines.push('');

      lines.push('## 🚀 Today\'s Priorities & In-Progress');
      if (inProgress.length === 0) {
        lines.push('- Continuing backlog tasks.');
      } else {
        inProgress.forEach((w) => {
          lines.push(`- **[${w.project}]** ${w.title}`);
          if (w.description) lines.push(`  - ${w.description}`);
        });
      }
      lines.push('');

      if (options.includeBlockers) {
        lines.push('## ⚠️ Blockers & Dependencies');
        if (blockers.length === 0) {
          lines.push('- None! Smooth sailing.');
        } else {
          blockers.forEach((w) => {
            lines.push(`- **[${w.project}]** ${w.blockers || w.description}`);
          });
        }
        lines.push('');
      }
    } else {
      // Weekly, Monthly, or Performance Appraisal
      // Group by Project
      const projects = Array.from(new Set(workItems.map((w) => w.project)));

      lines.push('## 🎯 Deliverables & Impact by Initiative');
      if (projects.length === 0) {
        lines.push('_No work items logged within this date range._');
      } else {
        projects.forEach((proj) => {
          const items = workItems.filter((w) => w.project === proj);
          lines.push(`### Initiative: ${proj}`);
          items.forEach((item) => {
            const badge =
              item.impact === 'brag-worthy'
                ? ' ⭐ [BRAG]'
                : item.impact === 'high'
                ? ' ⚡ [HIGH IMPACT]'
                : '';
            lines.push(`#### ${item.title}${badge}`);
            lines.push(`- **Status:** ${item.status.toUpperCase()} | **Category:** ${item.category}`);
            if (item.description) lines.push(`- **Description:** ${item.description}`);
            if (item.highlights && item.highlights.length > 0) {
              lines.push('- **Key Results:**');
              item.highlights.forEach((h) => lines.push(`  - ${h}`));
            }
            if (item.blockers && options.includeBlockers) {
              lines.push(`- **Blocker / Note:** ${item.blockers}`);
            }
            lines.push('');
          });
        });
      }
    }

    // Reading & Skill Growth Section
    if (options.includeReadingProgress && readingTopics.length > 0) {
      lines.push('## 📚 Technical Reading & Learning Topics');
      readingTopics.forEach((topic) => {
        lines.push(`- **${topic.title}** (${topic.category}) — ${topic.progressPercent}% completed`);
        if (topic.takeaways) {
          lines.push(`  - *Takeaway:* ${topic.takeaways}`);
        }
      });
      lines.push('');
    }

    // Skills Sharpened Section
    if (options.includeSkills) {
      const allSkills = Array.from(new Set(workItems.flatMap((w) => w.skills || [])));
      if (allSkills.length > 0) {
        lines.push('## 🛠️ Technologies & Competencies Applied');
        lines.push(allSkills.map((s) => `\`${s}\``).join(' • '));
        lines.push('');
      }
    }

    lines.push('---');
    lines.push(`*Generated via CareerPlus — Personal Career & Work Hub*`);
    return lines.join('\n');
  }

  /**
   * Generates a fully formatted, corporate HTML document suitable for Word export, Print to PDF, and inline preview
   */
  public generateHtmlDocument(
    options: DocumentGenerationOptions,
    workItems: WorkItem[],
    readingTopics: ReadingTopic[]
  ): string {
    const totalHours = workItems.reduce((acc, w) => acc + (w.hoursSpent || 0), 0);
    const completedTasks = workItems.filter((w) => w.status === 'completed').length;
    const bragTasks = workItems.filter((w) => w.impact === 'brag-worthy').length;
    const allSkills = Array.from(new Set(workItems.flatMap((w) => w.skills || [])));

    let itemsHtml = '';
    const projects = Array.from(new Set(workItems.map((w) => w.project)));

    for (const proj of projects) {
      const items = workItems.filter((w) => w.project === proj);
      itemsHtml += `
        <div style="margin-bottom: 24px;">
          <h3 style="color: #4338ca; font-size: 17px; margin-bottom: 12px; border-bottom: 1px solid #e0e7ff; padding-bottom: 4px;">
            Initiative: ${proj}
          </h3>
      `;

      for (const item of items) {
        const isBrag = item.impact === 'brag-worthy';
        const isHigh = item.impact === 'high';
        const impactBadge = isBrag
          ? '<span style="background: #fef3c7; color: #b45309; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 700; margin-left: 8px;">★ BRAG WORTHY</span>'
          : isHigh
          ? '<span style="background: #e0e7ff; color: #4338ca; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 700; margin-left: 8px;">HIGH IMPACT</span>'
          : '';

        const highlightsList = item.highlights?.length
          ? `<ul style="margin: 6px 0 6px 20px; padding: 0; color: #374151;">
              ${item.highlights.map((h) => `<li style="margin-bottom: 4px;">${h}</li>`).join('')}
             </ul>`
          : '';

        const blockerHtml =
          item.blockers && options.includeBlockers
            ? `<div style="background: #fff1f2; border-left: 3px solid #f43f5e; padding: 6px 10px; margin-top: 6px; font-size: 12px; color: #9f1239;">
                <strong>Blocker/Dependency:</strong> ${item.blockers}
               </div>`
            : '';

        itemsHtml += `
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px;">
              <h4 style="margin: 0; font-size: 15px; color: #0f172a;">
                ${item.title} ${impactBadge}
              </h4>
              <span style="font-size: 12px; color: #64748b; font-family: monospace;">${item.date}</span>
            </div>
            <div style="font-size: 13px; color: #4b5563; margin-bottom: 6px;">
              <span style="display: inline-block; padding: 1px 6px; border-radius: 4px; background: #e2e8f0; font-size: 11px; font-weight: 600; text-transform: uppercase;">${item.status}</span>
              <span style="margin: 0 6px; color: #cbd5e1;">•</span>
              <span style="text-transform: capitalize;">${item.category}</span>
              ${item.hoursSpent ? `<span style="margin: 0 6px; color: #cbd5e1;">•</span><span>${item.hoursSpent} hrs</span>` : ''}
            </div>
            <p style="margin: 0 0 6px 0; font-size: 13px; color: #334155;">${item.description}</p>
            ${highlightsList}
            ${blockerHtml}
          </div>
        `;
      }

      itemsHtml += `</div>`;
    }

    let readingHtml = '';
    if (options.includeReadingProgress && readingTopics.length > 0) {
      readingHtml = `
        <div style="margin-top: 24px;">
          <h3 style="color: #0f172a; font-size: 18px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 12px;">
            📚 Technical Reading & Knowledge Milestones
          </h3>
          <div style="display: grid; gap: 10px;">
            ${readingTopics
              .map(
                (t) => `
              <div style="background: #f1f5f9; border-left: 4px solid #6366f1; padding: 10px 14px; border-radius: 0 8px 8px 0;">
                <div style="display: flex; justify-content: space-between; font-weight: 600; font-size: 14px; color: #1e293b;">
                  <span>${t.title}</span>
                  <span style="color: #4f46e5;">${t.progressPercent}%</span>
                </div>
                <div style="font-size: 12px; color: #64748b; margin-top: 2px;">
                  Category: ${t.category} | Target: ${t.targetDate}
                </div>
                ${t.takeaways ? `<div style="font-size: 12px; color: #334155; margin-top: 4px; font-style: italic;">"${t.takeaways}"</div>` : ''}
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      `;
    }

    let skillsHtml = '';
    if (options.includeSkills && allSkills.length > 0) {
      skillsHtml = `
        <div style="margin-top: 24px;">
          <h3 style="color: #0f172a; font-size: 18px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 12px;">
            🛠️ Technologies & Core Competencies
          </h3>
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            ${allSkills
              .map(
                (s) => `
              <span style="background: #eef2ff; color: #4338ca; border: 1px solid #c7d2fe; padding: 4px 10px; border-radius: 16px; font-size: 12px; font-weight: 600;">
                ${s}
              </span>
            `
              )
              .join('')}
          </div>
        </div>
      `;
    }

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${options.title}</title>
  <style>
    body {
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #1e293b;
      background-color: #ffffff;
      margin: 0;
      padding: 32px;
    }
    .report-container {
      max-width: 820px;
      margin: 0 auto;
    }
    @media print {
      body { padding: 0; }
      .report-container { max-width: 100%; }
    }
  </style>
</head>
<body>
  <div class="report-container">
    <!-- Header Banner -->
    <div style="border-bottom: 3px solid #4f46e5; padding-bottom: 16px; margin-bottom: 24px;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
          <h1 style="margin: 0 0 6px 0; font-size: 26px; color: #0f172a; font-weight: 800;">
            ${options.title}
          </h1>
          <p style="margin: 0; font-size: 14px; color: #64748b;">
            Prepared by <strong>${options.authorName}</strong> — ${options.authorRole}
          </p>
        </div>
        <div style="text-align: right; font-size: 12px; color: #64748b; font-family: monospace;">
          <div><strong>Period:</strong> ${options.startDate} to ${options.endDate}</div>
          <div><strong>Generated:</strong> ${new Date().toLocaleDateString('en-US', { dateStyle: 'medium' })}</div>
        </div>
      </div>
    </div>

    <!-- Executive Summary -->
    ${
      options.customExecutiveSummary
        ? `
      <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 14px 18px; border-radius: 0 8px 8px 0; margin-bottom: 24px;">
        <h4 style="margin: 0 0 6px 0; color: #1e40af; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">Executive Summary</h4>
        <p style="margin: 0; font-size: 14px; color: #1e3a8a;">${options.customExecutiveSummary}</p>
      </div>
    `
        : ''
    }

    <!-- Metrics Cards -->
    ${
      options.includeMetrics
        ? `
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; text-align: center;">
          <div style="font-size: 22px; font-weight: 800; color: #4f46e5;">${workItems.length}</div>
          <div style="font-size: 11px; text-transform: uppercase; font-weight: 600; color: #64748b;">Work Items</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; text-align: center;">
          <div style="font-size: 22px; font-weight: 800; color: #10b981;">${completedTasks}</div>
          <div style="font-size: 11px; text-transform: uppercase; font-weight: 600; color: #64748b;">Completed</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; text-align: center;">
          <div style="font-size: 22px; font-weight: 800; color: #f59e0b;">${bragTasks}</div>
          <div style="font-size: 11px; text-transform: uppercase; font-weight: 600; color: #64748b;">Brag Milestones</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; text-align: center;">
          <div style="font-size: 22px; font-weight: 800; color: #06b6d4;">${totalHours}h</div>
          <div style="font-size: 11px; text-transform: uppercase; font-weight: 600; color: #64748b;">Hours Logged</div>
        </div>
      </div>
    `
        : ''
    }

    <!-- Work Items -->
    <div style="margin-top: 16px;">
      <h3 style="color: #0f172a; font-size: 18px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 16px;">
        🎯 Work Deliverables & Accomplishments
      </h3>
      ${itemsHtml || '<p style="color: #64748b; font-style: italic;">No work records match the selected date range.</p>'}
    </div>

    <!-- Reading Topics -->
    ${readingHtml}

    <!-- Skills -->
    ${skillsHtml}

    <!-- Footer -->
    <div style="margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 12px; text-align: center; font-size: 12px; color: #94a3b8;">
      Confidential • CareerPlus Executive Report • Generated on ${new Date().toISOString().split('T')[0]}
    </div>
  </div>
</body>
</html>
    `;
  }

  /**
   * Downloads formatted document as Microsoft Word (.doc)
   */
  public downloadAsWord(
    options: DocumentGenerationOptions,
    workItems: WorkItem[],
    readingTopics: ReadingTopic[]
  ): void {
    const html = this.generateHtmlDocument(options, workItems, readingTopics);
    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const cleanTitle = options.title.toLowerCase().replace(/[^a-z0-9]/g, '-');
    a.download = `${cleanTitle}-${options.endDate}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Downloads formatted document as Markdown (.md)
   */
  public downloadAsMarkdown(
    options: DocumentGenerationOptions,
    workItems: WorkItem[],
    readingTopics: ReadingTopic[]
  ): void {
    const markdown = this.generateMarkdown(options, workItems, readingTopics);
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const cleanTitle = options.title.toLowerCase().replace(/[^a-z0-9]/g, '-');
    a.download = `${cleanTitle}-${options.endDate}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Triggers clean print/save as PDF dialog using a hidden iframe
   */
  public printDocument(
    options: DocumentGenerationOptions,
    workItems: WorkItem[],
    readingTopics: ReadingTopic[]
  ): void {
    const html = this.generateHtmlDocument(options, workItems, readingTopics);
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(html);
      doc.close();

      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 2000);
      }, 500);
    }
  }

  /**
   * Copies formatted text to clipboard
   */
  public async copyToClipboard(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      return success;
    }
  }
}
