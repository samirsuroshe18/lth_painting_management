import axiosInstance from './config.js';
// Add all necessary methods to interact with the location API here
const getAllLocations = async () => {
  try {
    const response = await axiosInstance.get('/api/v1/locationmaster/get-locations');
    return response.data;
  } catch (error) {
    console.error('Error fetching locations:', error);
    throw error;
  }
};

const addLocation = async (locationData) => {
  try {
    const response = await axiosInstance.post('/api/v1/locationmaster/add-location', locationData);
    return response.data;
  } catch (error) {
    console.error('Error adding location:', error);
    throw error;
  }
};

const updateLocation = async (locationId, updatedData) => {
  try {
    const response = await axiosInstance.put(`/api/v1/locationmaster/update-location/${locationId}`, updatedData);
    return response.data;
  } catch (error) {
    console.error('Error updating location:', error);
    throw error;
  }
};

export { getAllLocations, addLocation, updateLocation };
