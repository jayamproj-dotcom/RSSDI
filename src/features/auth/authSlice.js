import { createSlice } from "@reduxjs/toolkit";

const getInitialAuthState = () => {
  const sessionActive =
    sessionStorage.getItem("userLoggedIn") === "true" ||
    localStorage.getItem("userLoggedIn") === "true";

  if (!sessionActive) {
    return {
      user: null,
      token: null,
      role: null,
      isAuthenticated: false,
      loading: false,
    };
  }

  try {
    const userInfo = JSON.parse(
      sessionStorage.getItem("userInfo") || localStorage.getItem("userInfo")
    );
    const role = userInfo?.role;

    return {
      user: userInfo,
      token: "session-auth", // Placeholder token
      role: role || null,
      isAuthenticated: !!userInfo,
      loading: false,
    };
  } catch (error) {
    console.error("Error parsing auth data:", error);
    return {
      user: null,
      token: null,
      role: null,
      isAuthenticated: false,
      loading: false,
    };
  }
};

const authSlice = createSlice({
  name: "auth",
  initialState: getInitialAuthState(),
  reducers: {
    setCredentials: (state, action) => {
      const { user, token, role, rememberMe } = action.payload;
      state.user = user;
      state.token = token || "session-auth";
      state.role = role;
      state.isAuthenticated = true;
      state.loading = false;

      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem("userInfo", JSON.stringify({ ...user, role }));
      storage.setItem("userLoggedIn", "true");
      storage.setItem("lastActivity", Date.now().toString());

      const otherStorage = rememberMe ? sessionStorage : localStorage;
      otherStorage.removeItem("userInfo");
      otherStorage.removeItem("userLoggedIn");
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.role = null;
      state.isAuthenticated = false;
      state.loading = false;

      localStorage.clear();
      sessionStorage.clear();
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const { setCredentials, logout, setLoading } = authSlice.actions;

export const selectCurrentUser = (state) => state.auth.user;
export const selectCurrentToken = (state) => state.auth.token;
export const selectCurrentRole = (state) => state.auth.role;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;

export default authSlice.reducer;
