// /src/api/stateApi.js

import axiosInstance from './config.js';

const getAllStates = async () => {
    const response = await axiosInstance.get('/api/v1/statemaster/get-all-states');
    return response.data;
};

const addState = async (stateData) => {
    const response = await axiosInstance.post('/api/v1/statemaster/add-state', stateData);
    return response.data;
};

// const updateState = async (id, updatedData) => {
//     const response = await axiosInstance.put(`/api/v1/statemaster/update-state/${id}`, updatedData);
//     return response.data;
// };
const updateState = async (stateId, updatedData) => {
  const response = await axiosInstance.put(`/api/v1/statemaster/update-state/${stateId}`, updatedData);
  return response.data;
};

export { getAllStates, addState, updateState };
