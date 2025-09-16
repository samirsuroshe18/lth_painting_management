import axiosInstance from './config.js';

const getAllCities = async () => {
  try {
    const response = await axiosInstance.get('/api/v1/citymaster/get-all-cities');
    return response.data;
  } catch (error) {
    if (import.meta.env.VITE_DEVELOPMENT === 'development') {
      console.error('Error fetching cities:', error);
    }
    throw error;
  }
};

const addCity = async (stateData) => {
  try {
    const response = await axiosInstance.post('/api/v1/citymaster/add-city', stateData);
    return response.data;
  } catch (error) {
    if (import.meta.env.VITE_DEVELOPMENT === 'development') {
      console.error('Error adding city:', error);
    }
    throw error;
  }
};

const updateCity = async (stateId, updatedData) => {
  try {
    const response = await axiosInstance.put(`/api/v1/citymaster/update-city/${stateId}`, updatedData);
    return response.data;
  } catch (error) {
    if (import.meta.env.VITE_DEVELOPMENT === 'development') {
      console.error('Error updating city:', error);
    }
    throw error;
  }
};

const deleteCity = async (stateId) => {
  try {
    const response = await axiosInstance.delete(`/api/v1/citymaster/delete-city/${stateId}`);
    return response.data;
  } catch (error) {
    if (import.meta.env.VITE_DEVELOPMENT === 'development') {
      console.error('Error deleting city:', error);
    }
    throw error;
  }
};

export { getAllCities, addCity, updateCity, deleteCity };