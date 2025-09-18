import axiosInstance from './config.js';

const getAllBuildings = async () => {
  try {
    const response = await axiosInstance.get('/api/v1/buildingmaster/get-all-buildings');
    return response.data;
  } catch (error) {
    if (import.meta.env.VITE_DEVELOPMENT === 'development') {
      console.error('Error fetching building:', error);
    }
    throw error;
  }
};

const addBuilding = async (stateData) => {
  try {
    const response = await axiosInstance.post('/api/v1/buildingmaster/add-building', stateData);
    return response.data;
  } catch (error) {
    if (import.meta.env.VITE_DEVELOPMENT === 'development') {
      console.error('Error adding building:', error);
    }
    throw error;
  }
};

const updateBuilding = async (stateId, updatedData) => {
  try {
    const response = await axiosInstance.put(`/api/v1/buildingmaster/update-building/${stateId}`, updatedData);
    return response.data;
  } catch (error) {
    if (import.meta.env.VITE_DEVELOPMENT === 'development') {
      console.error('Error updating building:', error);
    }
    throw error;
  }
};

const deleteBuilding = async (stateId) => {
  try {
    const response = await axiosInstance.delete(`/api/v1/buildingmaster/delete-building/${stateId}`);
    return response.data;
  } catch (error) {
    if (import.meta.env.VITE_DEVELOPMENT === 'development') {
      console.error('Error deleting building:', error);
    }
    throw error;
  }
};

const addBuildingsFromExcel = async (excelFile) => {
  try {
    const formData = new FormData();
    formData.append('file', excelFile);

    const response = await axiosInstance.post('/api/v1/buildingmaster/add-excel-buildings', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    if (import.meta.env.VITE_DEVELOPMENT === 'development') {
      console.error('Error adding buildings from Excel:', error);
    }
    throw error;
  }
};

export { getAllBuildings, addBuilding, updateBuilding, deleteBuilding, addBuildingsFromExcel };