import axios from 'axios';
import { navigate } from '../utils/navigationHelper';
import { logoutUser } from './authApi';

// ==================== Create Axios Instance ====================
// This is the base Axios instance for all API calls.
// 'withCredentials: true' ensures that HttpOnly cookies are sent automatically.
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_DOMAIN, // Base URL from environment variables
  timeout: 60000, // 60-second timeout for requests
  headers: {
    'Content-Type': 'application/json', // JSON request body
  },
  withCredentials: true // Important for sending HttpOnly cookies
});

// ==================== Request Interceptor ====================
// Runs before each request is sent.
// Used here to disable cookies for certain endpoints (e.g., forgot-password).
axiosInstance.interceptors.request.use(
  (config) => {
    const noCredentialsEndpoints = [
      "/api/v1/user/forgot-password"
    ];

    // Disable 'withCredentials' if the request URL matches any endpoint in the list
    if (noCredentialsEndpoints.some(endpoint => config.url?.endsWith(endpoint))) {
      config.withCredentials = false;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ==================== Token Refresh Control Variables ====================
// Prevents multiple refresh calls at the same time.
let isRefreshing = false;

// Stores requests that failed due to expired access token while a refresh is ongoing.
let failedQueue = [];

// Processes the queued requests once a token refresh attempt finishes.
const processQueue = (error) => {
  failedQueue.forEach(p => (error ? p.reject(error) : p.resolve()));
  failedQueue = [];
};

// ==================== Response Interceptor ====================
// Handles API responses and errors.
// Specifically checks for expired access tokens and automatically tries to refresh them.
axiosInstance.interceptors.response.use(
  response => response, // Simply return the response if no errors
  async error => {
    const originalRequest = error.config;

    // === Case: Access token has expired ===
    if (
      error.response?.status === 401 && 
      error.response?.data?.message === "Access token expired" && 
      !originalRequest._retry // Prevent infinite retry loop
    ) {
      originalRequest._retry = true; // Mark request as retried

      // If a refresh is already in progress, queue this request to retry later.
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          return axiosInstance(originalRequest); // Retry once refresh completes
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      // Mark that we are refreshing the token
      isRefreshing = true;

      try {
        // Call refresh token endpoint (server will set a new access token cookie)
        await axiosInstance.get('/api/v1/user/refresh-token');

        // Process queued requests now that refresh is done
        processQueue(null);

        // Retry the original request with the new token (cookie is already updated by server)
        return axiosInstance(originalRequest);
      } catch (err) {
        // If refresh fails:
        processQueue(err); // Fail all queued requests
        await logoutUser(); // Clear any local session/user data
        navigate("/login", { state: { message: "Session expired. Please login again." } });
        return Promise.reject(err);
      } finally {
        // Reset the refreshing flag no matter what
        isRefreshing = false;
      }
    }

    // === Case: Other errors ===
    return Promise.reject(error);
  }
);

export default axiosInstance;