import axiosInstance from './config.js';

// Get all users
const getAllUsers = async () => {
  const response = await axiosInstance.get('/api/v1/usermaster/get-all-users');
  return response.data;
};

// Create a new user
const createUser = async (userData) => {
  const response = await axiosInstance.post('/api/v1/usermaster/create-user', userData);
  return response.data;
};

// Update an existing user
const updateUser = async (userId, updatedData) => {
  const response = await axiosInstance.put(`/api/v1/usermaster/update-user/${userId}`, updatedData);
  return response.data;
};

export { getAllUsers, createUser, updateUser };
