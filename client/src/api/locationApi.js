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

export { getAllLocations };
