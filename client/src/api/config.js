import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_DOMAIN,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ========== Response Interceptor for Handling Token Expiry ==========
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach(p => (error ? p.reject(error) : p.resolve()));
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  response => response,

  async error => {
    const originalRequest = error.config;
    // Check if access token has expired
    if (error.response?.status === 401 && error.response?.data?.message === "Access token expired" && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          return axiosInstance(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      isRefreshing = true;

      try {
        // Attempt to refresh access token using refresh token (HttpOnly cookie)
        await axiosInstance.get('/api/v1/user/refresh-token', { withCredentials: true }); // This route should issue a new access token cookie
        processQueue(null);
        return axiosInstance(originalRequest); // Retry the original request
      } catch (err) {
        processQueue(err);
        return Promise.reject(err); // Optional: redirect to login here if needed
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;