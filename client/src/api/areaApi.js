import axiosInstance from './config.js';

const getAllArea = async () => {
  try {
    const response = await axiosInstance.get('/api/v1/areamaster/get-all-areas');
    return response.data;
  } catch (error) {
    if (import.meta.env.VITE_DEVELOPMENT === 'development') {
      console.error('Error fetching area:', error);
    }
    throw error;
  }
};

const addArea = async (stateData) => {
  try {
    const response = await axiosInstance.post('/api/v1/areamaster/add-area', stateData);
    return response.data;
  } catch (error) {
    if (import.meta.env.VITE_DEVELOPMENT === 'development') {
      console.error('Error adding area:', error);
    }
    throw error;
  }
};

const updateArea = async (stateId, updatedData) => {
  try {
    const response = await axiosInstance.put(`/api/v1/areamaster/update-area/${stateId}`, updatedData);
    return response.data;
  } catch (error) {
    if (import.meta.env.VITE_DEVELOPMENT === 'development') {
      console.error('Error updating area:', error);
    }
    throw error;
  }
};

const deleteArea = async (stateId) => {
  try {
    const response = await axiosInstance.delete(`/api/v1/areamaster/delete-area/${stateId}`);
    return response.data;
  } catch (error) {
    if (import.meta.env.VITE_DEVELOPMENT === 'development') {
      console.error('Error deleting city:', error);
    }
    throw error;
  }
};

export { getAllArea, addArea, updateArea, deleteArea };