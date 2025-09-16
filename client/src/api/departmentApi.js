import axiosInstance from './config.js';

const getAllDepartment = async () => {
  try {
    const response = await axiosInstance.get('/api/v1/departmentmaster/get-all-departments');
    return response.data;
  } catch (error) {
    if (import.meta.env.VITE_DEVELOPMENT === 'development') {
      console.error('Error fetching department:', error);
    }
    throw error;
  }
};

const addDepartment = async (stateData) => {
  try {
    const response = await axiosInstance.post('/api/v1/departmentmaster/add-department', stateData);
    return response.data;
  } catch (error) {
    if (import.meta.env.VITE_DEVELOPMENT === 'development') {
      console.error('Error adding department:', error);
    }
    throw error;
  }
};

const updateDepartment = async (stateId, updatedData) => {
  try {
    const response = await axiosInstance.put(`/api/v1/departmentmaster/update-department/${stateId}`, updatedData);
    return response.data;
  } catch (error) {
    if (import.meta.env.VITE_DEVELOPMENT === 'development') {
      console.error('Error updating department:', error);
    }
    throw error;
  }
};

const deleteDepartment = async (stateId) => {
  try {
    const response = await axiosInstance.delete(`/api/v1/departmentmaster/delete-department/${stateId}`);
    return response.data;
  } catch (error) {
    if (import.meta.env.VITE_DEVELOPMENT === 'development') {
      console.error('Error deleting department:', error);
    }
    throw error;
  }
};

export { getAllDepartment, addDepartment, updateDepartment, deleteDepartment };