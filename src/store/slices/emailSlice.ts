import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface EmailJob {
  jobId: string;
  to: string[];
  subject: string;
  status: 'queued' | 'processing' | 'sent' | 'failed';
  priority: string;
  sentAt: string;
}

export interface EmailState {
  recentJobs: EmailJob[];
  currentJobStatus: any | null;
  bulkBatch: { batchId: string; count: number } | null;
  loading: boolean;
  error: string | null;
}

const initialState: EmailState = {
  recentJobs: [
    { jobId: 'job_101', to: ['user1@company.com'], subject: 'ترحيب بالمستخدم', status: 'sent', priority: 'high', sentAt: '2026-09-04 14:00' },
    { jobId: 'job_102', to: ['client@corp.io'], subject: 'فاتورة الاشتراك', status: 'processing', priority: 'normal', sentAt: '2026-09-04 14:05' },
    { jobId: 'job_103', to: ['support@domain.org'], subject: 'تأكيد الحساب', status: 'queued', priority: 'urgent', sentAt: '2026-09-04 14:08' }
  ],
  currentJobStatus: null,
  bulkBatch: null,
  loading: false,
  error: null
};

export const emailSlice = createSlice({
  name: 'email',
  initialState,
  reducers: {
    addJob: (state, action: PayloadAction<EmailJob>) => {
      state.recentJobs.unshift(action.payload);
    },
    setCurrentJobStatus: (state, action: PayloadAction<any>) => {
      state.currentJobStatus = action.payload;
    },
    setBulkBatch: (state, action: PayloadAction<{ batchId: string; count: number }>) => {
      state.bulkBatch = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    }
  }
});

export const { addJob, setCurrentJobStatus, setBulkBatch, setLoading } = emailSlice.actions;
export default emailSlice.reducer;
