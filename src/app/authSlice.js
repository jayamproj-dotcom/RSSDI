// features/auth/authSlice.js
import { createSlice } from '@reduxjs/toolkit';

const userFromSession = sessionStorage.getItem('adminUser')
  ? { type: 'admin', data: JSON.parse(sessionStorage.getItem('adminUser')) }
  : sessionStorage.getItem('googleUser')
  ? { type: 'user', data: JSON.parse(sessionStorage.getItem('googleUser')) }
  : null;

const initialState = {
  user: userFromSession?.data || null,
  token: userFromSession?.data?.token || null,
  role: userFromSession?.type || null,
  isAuthenticated: !!userFromSession,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token, role } = action.payload;
      state.user = user;
      state.token = token;
      state.role = role;
      state.isAuthenticated = true;

      if (role === 'admin') {
        sessionStorage.setItem('adminUser', JSON.stringify({ user, token }));
        sessionStorage.removeItem('googleUser');
      } else if (role === 'user') {
        sessionStorage.setItem('googleUser', JSON.stringify({ ...user, token }));
        sessionStorage.removeItem('adminUser');
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.role = null;
      state.isAuthenticated = false;
      sessionStorage.clear();
    }
  }
});

export const selectCurrentUser = (state) => state.auth.user;
export const selectCurrentRole = (state) => state.auth.role;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
