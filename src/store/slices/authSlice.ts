import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  apiKey: string;
  loading: boolean;
  error: string | null;
}

// Initial state reads from localStorage if available
const savedToken = localStorage.getItem('esp_token');

const initialState: AuthState = {
  isAuthenticated: !!savedToken,
  accessToken: savedToken,
  apiKey: 'esp_live_secret_key_8899',
  loading: false,
  error: null
};

// Async thunk for login
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (formData: { secretKey: string }, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret_key: formData.secretKey })
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.access_token) {
        return rejectWithValue(data.message || 'المفتاح السري غير صحيح');
      }
      
      // Store token in localStorage
      localStorage.setItem('esp_token', data.access_token);
      
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'تعذر الاتصال بالخادم');
    }
  }
);

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.isAuthenticated = false;
      state.accessToken = null;
      localStorage.removeItem('esp_token');
    },
    setAuthError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.accessToken = action.payload.access_token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { logout, setAuthError } = authSlice.actions;
export default authSlice.reducer;
