const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

const getJsonHeaders = (token) => ({
  "Content-Type": "application/json",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

async function safeFetch(url, options) {
  try {
    return await fetch(url, options);
  } catch (error) {
    throw new Error(`Backend server unreachable at ${API_BASE_URL}.`);
  }
}

export const apiBaseUrl = API_BASE_URL;

export const authApi = {
  login: async (payload) =>
    handleResponse(
      await safeFetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: getJsonHeaders(),
        body: JSON.stringify(payload),
      })
    ),
  register: async (payload) =>
    handleResponse(
      await safeFetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: getJsonHeaders(),
        body: JSON.stringify(payload),
      })
    ),
};

export const issueApi = {
  getAll: async ({ token, filters = {} } = {}) => {
    const searchParams = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        searchParams.set(key, value);
      }
    });

    return handleResponse(
      await safeFetch(`${API_BASE_URL}/issues/all?${searchParams.toString()}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        cache: "no-store",
      })
    );
  },
  create: async ({ token, formData }) =>
    handleResponse(
      await safeFetch(`${API_BASE_URL}/issues/create`, {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      })
    ),
  update: async ({ token, issueId, payload }) =>
    handleResponse(
      await safeFetch(`${API_BASE_URL}/issues/update/${issueId}`, {
        method: "PUT",
        headers: getJsonHeaders(token),
        body: JSON.stringify(payload),
      })
    ),
  delete: async ({ token, issueId }) =>
    handleResponse(
      await safeFetch(`${API_BASE_URL}/issues/${issueId}`, {
        method: "DELETE",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
    ),
  getById: async ({ token, issueId }) =>
    handleResponse(
      await safeFetch(`${API_BASE_URL}/issues/${issueId}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        cache: "no-store",
      })
    ),
};

export const adminApi = {
  getStats: async (token) =>
    handleResponse(
      await safeFetch(`${API_BASE_URL}/admin/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      })
    ),
  filter: async ({ token, filters = {} }) => {
    const searchParams = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        searchParams.set(key, value);
      }
    });

    return handleResponse(
      await safeFetch(`${API_BASE_URL}/admin/filter?${searchParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      })
    );
  },
  bulkUpdate: async ({ token, payload }) =>
    handleResponse(
      await safeFetch(`${API_BASE_URL}/admin/bulk-update`, {
        method: "PUT",
        headers: getJsonHeaders(token),
        body: JSON.stringify(payload),
      })
    ),
};

export const notificationApi = {
  getAll: async (token) =>
    handleResponse(
      await safeFetch(`${API_BASE_URL}/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      })
    ),
  markRead: async ({ token, notificationId }) =>
    handleResponse(
      await safeFetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
        method: "PUT",
        headers: getJsonHeaders(token),
      })
    ),
};
