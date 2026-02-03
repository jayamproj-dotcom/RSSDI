import { API_BASE_URL, API_TIMEOUT } from "../config/api";

// Auth token management
let authToken = null;

export const setAuthToken = (token) => {
  authToken = token;
  localStorage.setItem("authToken", token);
  sessionStorage.setItem("authToken", token);
};

export const getAuthToken = () => {
  return authToken || localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
};

export const clearAuthToken = () => {
  authToken = null;
  localStorage.removeItem("authToken");
  sessionStorage.removeItem("authToken");
};

/**
 * Enhanced API request helper with timeout and retry logic
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Fetch options
 * @param {number} retries - Number of retry attempts
 * @returns {Promise<Object>} - Response data
 */
export const apiRequest = async (endpoint, options = {}, retries = 2, token = null) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

  // Normalize endpoint to remove any leading slashes
  const normalizedEndpoint = endpoint.replace(/^\/+/, "");
  const url = `${API_BASE_URL}/${normalizedEndpoint}`;

  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    Accept: "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (process.env.NODE_ENV === "development") {
    console.groupCollapsed(`API Request: ${options.method || "GET"} ${url}`);
    console.log("Options:", { ...options, headers });
    console.groupEnd();
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
      credentials: "include",
      mode: "cors",
    });

    clearTimeout(timeoutId);

    let data;
    const contentType = response.headers.get("content-type");

    try {
      data = contentType?.includes("application/json")
        ? await response.json()
        : await response.text();
    } catch (error) {
      throw new Error(`Failed to parse response: ${error.message}`);
    }

    if (!response.ok) {
      // ✅ Allow response with success true
      if (data?.success === true) {
        return data;
      }

      const error = new Error(data?.message || `Request failed with status ${response.status}`);
      error.status = response.status;
      error.data = data;

      if (response.status === 422 && data.errors) {
        error.message =
          "Validation failed: " +
          Object.entries(data.errors)
            .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
            .join("; ");
      }

      throw error;
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === "AbortError") {
      throw new Error("Request timeout. Please try again.");
    }

    if (error.message.includes("Failed to fetch")) {
      if (retries > 0) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return apiRequest(endpoint, options, retries - 1, token);
      }
      throw new Error("Network error. Please check your internet connection.");
    }

    if (error.status === 401) {
      const message = error.data?.message?.toLowerCase?.() || "";
      if (
        message.includes("unauthorized") ||
        message.includes("token") ||
        message.includes("expired")
      ) {
        clearAuthToken();
        window.dispatchEvent(new CustomEvent("auth:sessionExpired"));
        throw new Error("Session expired. Please log in again.");
      }
      throw new Error(error.data?.message || "Unauthorized request.");
    }

    if (error.status === 403) {
      throw new Error(error.data?.message || "You do not have permission to perform this action.");
    }

    throw error;
  }
};


// Convenience methods
export const apiGet = (endpoint, options = {}) =>
apiRequest(endpoint, { ...options, method: "GET" });

export const apiPost = (endpoint, body, options = {}) =>
  apiRequest(endpoint, {
    ...options,
    method: "POST",
    body: JSON.stringify(body),
  });


export const apiPut = (endpoint, body, options = {}) =>
  apiRequest(endpoint, {
    ...options,
    method: "PUT",
    body: JSON.stringify(body),
  });

export const apiPatch = (endpoint, body, options = {}) =>
  apiRequest(endpoint, {
    ...options,
    method: "PATCH",
    body: JSON.stringify(body),
  });

export const apiDelete = (endpoint, options = {}) =>
  apiRequest(endpoint, { ...options, method: "DELETE" });