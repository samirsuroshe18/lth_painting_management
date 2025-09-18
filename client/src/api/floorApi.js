import axiosInstance from './config.js';

const getAllFloors = async () => {
  try {
    const response = await axiosInstance.get('/api/v1/floormaster/get-all-floors');
    return response.data;
  } catch (error) {
    if (import.meta.env.VITE_DEVELOPMENT === 'development') {
      console.error('Error fetching floor:', error);
    }
    throw error;
  }
};

const addFloor = async (stateData) => {
  try {
    const response = await axiosInstance.post('/api/v1/floormaster/add-floor', stateData);
    return response.data;
  } catch (error) {
    if (import.meta.env.VITE_DEVELOPMENT === 'development') {
      console.error('Error adding floor:', error);
    }
    throw error;
  }
};

const updateFloor = async (stateId, updatedData) => {
  try {
    const response = await axiosInstance.put(`/api/v1/floormaster/update-floor/${stateId}`, updatedData);
    return response.data;
  } catch (error) {
    if (import.meta.env.VITE_DEVELOPMENT === 'development') {
      console.error('Error updating floor:', error);
    }
    throw error;
  }
};

const deleteFloor = async (stateId) => {
  try {
    const response = await axiosInstance.delete(`/api/v1/floormaster/delete-floor/${stateId}`);
    return response.data;
  } catch (error) {
    if (import.meta.env.VITE_DEVELOPMENT === 'development') {
      console.error('Error deleting floor:', error);
    }
    throw error;
  }
};

const addFloorsFromExcel = async (excelFile) => {
  try {
    const formData = new FormData();
    formData.append('file', excelFile);

    const response = await axiosInstance.post('/api/v1/floormaster/add-excel-floors', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    if (import.meta.env.VITE_DEVELOPMENT === 'development') {
      console.error('Error adding floors from Excel:', error);
    }
    throw error;
  }
};

export { getAllFloors, addFloor, updateFloor, deleteFloor, addFloorsFromExcel };