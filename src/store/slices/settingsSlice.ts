import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SettingsState {
  platformName: string;
  defaultSender: string;
  maxRetryAttempts: number;
  rateLimitPerMinute: number;
  enableFailover: boolean;
}

const initialState: SettingsState = {
  platformName: 'Email Service Platform',
  defaultSender: 'noreply@platform.com',
  maxRetryAttempts: 3,
  rateLimitPerMinute: 1000,
  enableFailover: true
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updateSettings: (state, action: PayloadAction<Partial<SettingsState>>) => {
      return { ...state, ...action.payload };
    }
  }
});

export const { updateSettings } = settingsSlice.actions;
export default settingsSlice.reducer;
