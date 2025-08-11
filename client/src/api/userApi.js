import axiosInstance from './config.js';

const getAllUsers = async () => {
  try {
    const response = await axiosInstance.get('/api/v1/usermaster/get-all-users');
    return response.data;
  } catch (error) {
    if (import.meta.env.VITE_DEVELOPMENT === 'development') {
      console.error('Error fetching all users:', error);
    }
    throw error;
  }
};

const createUser = async (userData) => {
  try {
    const response = await axiosInstance.post('/api/v1/usermaster/create-user', userData);
    return response.data;
  } catch (error) {
    if (import.meta.env.VITE_DEVELOPMENT === 'development') {
      console.error('Error creating user:', error);
    }
    throw error;
  }
};

const updateUser = async (userId, updatedData) => {
  try {
    const response = await axiosInstance.put(`/api/v1/usermaster/update-user/${userId}`, updatedData);
    return response.data;
  } catch (error) {
    if (import.meta.env.VITE_DEVELOPMENT === 'development') {
      console.error('Error updating user:', error);
    }
    throw error;
  }
};

const fetchUser = async (userId) => {
  try {
    const response = await axiosInstance.get(`/api/v1/usermaster/fetch-user/${userId}`);
    return response.data.data;
  } catch (error) {
    if (import.meta.env.VITE_DEVELOPMENT === 'development') {
      console.error('Error fetching user:', error);
    }
    throw error;
  }
};

const updatePermissions = async (userId, permissions) => {
  try {
    const response = await axiosInstance.put(`/api/v1/usermaster/update-user-permissions/${userId}`, { permissions });
    return response.data;
  } catch (error) {
    if (import.meta.env.VITE_DEVELOPMENT === 'development') {
      console.error('Error updating user permissions:', error);
    }
    throw error;
  }
};

export {
  getAllUsers,
  createUser,
  updateUser,
  fetchUser,
  updatePermissions
};