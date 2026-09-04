import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import emailReducer from './slices/emailSlice';
import templateReducer from './slices/templateSlice';
import settingsReducer from './slices/settingsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    email: emailReducer,
    template: templateReducer,
    settings: settingsReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
