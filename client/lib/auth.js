export const AUTH_STORAGE_KEY = "civic-issue-session";

export const getStoredSession = () => {
  if (typeof window === "undefined") {
    return null;
  }

  const rawSession = window.localStorage.getItem(AUTH_STORAGE_KEY);

  if (!rawSession) {
    return null;
  }

  try {
    return JSON.parse(rawSession);
  } catch {
    return null;
  }
};

export const storeSession = (session) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
};

export const clearSession = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
};

