/**
 * Interface definition for Email Platform Analytics and Reporting Service
 * Handles real-time metric tracking, engagement analysis, report generation, and data export.
 */

export interface EmailMetricStats {
  total: number;
  queued: number;
  scheduled: number;
  processing: number;
  sent: number;
  failed: number;
  retrying: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  complaint: number;
  unsubscribe: number;
}

export interface EngagementRates {
  deliveryRate: number;
  openRate: number;
  clickThroughRate: number;
  clickToOpenRate: number;
  bounceRate: number;
  complaintRate: number;
}

export interface TimelineDataPoint {
  time: string;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  failed: number;
  latency: number;
}

export interface AnalyticsReport {
  id: string;
  name: string;
  range: 'daily' | 'weekly' | 'monthly';
  generatedAt: string;
  metrics: EmailMetricStats;
  rates: EngagementRates;
  summary: string;
}

export interface IAnalyticsService {
  /**
   * Retrieves real-time statistics from active job store and events
   */
  getRealTimeStats(dateRange?: string): Promise<{
    emails: EmailMetricStats;
    rates: EngagementRates;
    providers: Array<{ id: string; name: string; value: number; color: string }>;
    hourlyTimeline: TimelineDataPoint[];
  }>;

  /**
   * Tracks an engagement event (open, click, bounce, unsubscribe, etc.)
   */
  trackEvent(jobId: string, eventType: 'opened' | 'clicked' | 'bounced' | 'complaint' | 'unsubscribe', details?: Record<string, any>): Promise<void>;

  /**
   * Generates a structured operational report (daily, weekly, monthly)
   */
  generateReport(range: 'daily' | 'weekly' | 'monthly'): Promise<AnalyticsReport>;

  /**
   * Exports analytical data into standard business formats
   */
  exportData(range: string, format: 'csv' | 'excel' | 'pdf'): Promise<{ content: string | Buffer; mimeType: string; filename: string }>;
}
