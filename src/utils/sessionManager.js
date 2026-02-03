export const checkSessionActive = () => {
  const sessionActive = sessionStorage.getItem('userLoggedIn') === "true" ||
    localStorage.getItem('userLoggedIn') === "true";

  if (!sessionActive) return false;

  // Check session timeout (2 hour)
  const lastActivity = sessionStorage.getItem('lastActivity') ||
    localStorage.getItem('lastActivity');
    const hours = 2;
    const sessionTimeout = hours * 60 * 60 * 1000;
      if (lastActivity && (Date.now() - parseInt(lastActivity) > sessionTimeout)) {
    clearSession();
    return false;
  }

  // Update last activity timestamp
  updateLastActivity();
  return true;
};

export const updateLastActivity = () => {
  if (sessionStorage.getItem('userLoggedIn')) {
    sessionStorage.setItem('lastActivity', Date.now().toString());
  }
  if (localStorage.getItem('userLoggedIn')) {
    localStorage.setItem('lastActivity', Date.now().toString());
  }
};

export const clearSession = () => {
  sessionStorage.removeItem('userInfo');
  sessionStorage.removeItem('userLoggedIn');
  sessionStorage.removeItem('lastActivity');
  localStorage.removeItem('userInfo');
  localStorage.removeItem('userLoggedIn');
  localStorage.removeItem('lastActivity');
};