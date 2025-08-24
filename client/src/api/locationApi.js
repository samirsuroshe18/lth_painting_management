import axiosInstance from './config.js';

const getAllLocations = async () => {
  try {
    const response = await axiosInstance.get('/api/v1/locationmaster/get-locations');
    return response.data;
  } catch (error) {
    if (import.meta.env.VITE_DEVELOPMENT === 'development') {
      console.error('Error fetching locations:', error);
    }
    throw error;
  }
};

const addLocation = async (locationData) => {
  try {
    const response = await axiosInstance.post('/api/v1/locationmaster/add-location', locationData);
    return response.data;
  } catch (error) {
    if (import.meta.env.VITE_DEVELOPMENT === 'development') {
      console.error('Error adding location:', error);
    }
    throw error;
  }
};

const updateLocation = async (locationId, updatedData) => {
  try {
    const response = await axiosInstance.put(`/api/v1/locationmaster/update-location/${locationId}`, updatedData);
    return response.data;
  } catch (error) {
    if (import.meta.env.VITE_DEVELOPMENT === 'development') {
      console.error('Error updating location:', error);
    }
    throw error;
  }
};

const deleteLocation = async (locationId) => {
  try {
    const response = await axiosInstance.delete(`/api/v1/locationmaster/delete-location/${locationId}`);
    return response.data;
  } catch (error) {
    if (import.meta.env.VITE_DEVELOPMENT === 'development') {
      console.error('Error deleting location:', error);
    }
    throw error;
  }
};

const addLocationToSuperAdmin = async (locationId) => {
  try {
    const response = await axiosInstance.put(`/api/v1/locationmaster/add-location-to-superadmin/${locationId}`);
    return response.data;
  } catch (error) {
    if (import.meta.env.VITE_DEVELOPMENT === 'development') {
      console.error('Error deleting location:', error);
    }
    throw error;
  }
};

export { getAllLocations, addLocation, updateLocation, deleteLocation, addLocationToSuperAdmin };