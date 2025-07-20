import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_DOMAIN,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;