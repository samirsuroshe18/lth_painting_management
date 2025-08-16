import axiosInstance from './config.js';

const getAllStates = async () => {
  try {
    const response = await axiosInstance.get('/api/v1/statemaster/get-all-states');
    return response.data;
  } catch (error) {
    if (import.meta.env.VITE_DEVELOPMENT === 'development') {
      console.error('Error fetching states:', error);
    }
    throw error;
  }
};

const addState = async (stateData) => {
  try {
    const response = await axiosInstance.post('/api/v1/statemaster/add-state', stateData);
    return response.data;
  } catch (error) {
    if (import.meta.env.VITE_DEVELOPMENT === 'development') {
      console.error('Error adding state:', error);
    }
    throw error;
  }
};

const updateState = async (stateId, updatedData) => {
  try {
    const response = await axiosInstance.put(`/api/v1/statemaster/update-state/${stateId}`, updatedData);
    return response.data;
  } catch (error) {
    if (import.meta.env.VITE_DEVELOPMENT === 'development') {
      console.error('Error updating state:', error);
    }
    throw error;
  }
};

const deleteState = async (stateId) => {
  try {
    const response = await axiosInstance.delete(`/api/v1/statemaster/delete-state/${stateId}`);
    return response.data;
  } catch (error) {
    if (import.meta.env.VITE_DEVELOPMENT === 'development') {
      console.error('Error deleting state:', error);
    }
    throw error;
  }
};

export { getAllStates, addState, updateState, deleteState };