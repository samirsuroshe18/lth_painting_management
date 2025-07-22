import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_DOMAIN,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // Important for sending cookies in refresh-token call
});

// ========== Request Interceptor to add Authorization Header ==========
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // your access token from login
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

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
        await axiosInstance.get('/api/v1/user/refresh-token', { withCredentials: true });

        processQueue(null);

        // Get the new access token from localStorage (after it was saved)
        const newToken = localStorage.getItem('token');
        if (newToken) {
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        }

        return axiosInstance(originalRequest);
      } catch (err) {
        processQueue(err);
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
