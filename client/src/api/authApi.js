import axiosInstance from './config.js';

const loginUser = async (formData) => {
    const response = await axiosInstance.post(
        `/api/v1/user/login`,
        formData,
        { withCredentials: true }
    );
    return response.data;
};

const logoutUser = async () => {
    const response = await axiosInstance.get(
        `/api/v1/user/logout`,
        { withCredentials: true }
    );
    return response.data;
};

const getCurrentUser = async () => {
    const response = await axiosInstance.get(
        `/api/v1/user/current-user`,
        { withCredentials: true }
    );
    return response.data;
};

export {
    loginUser,
    logoutUser,
    getCurrentUser,
}