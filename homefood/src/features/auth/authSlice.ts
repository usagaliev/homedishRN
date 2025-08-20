import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role?: string;
  isApprovedChef?: boolean;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state, action: PayloadAction<User>) {
      state.user = action.payload;
      state.loading = false;
      state.error = null;
    },
    logout(state) {
      state.user = null;
      state.loading = false;
      state.error = null;
    },
    setUser(state, action: PayloadAction<User | null>) {
      state.user = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
});

export const { login, logout, setUser, setLoading, setError } = authSlice.actions;
export default authSlice.reducer;
