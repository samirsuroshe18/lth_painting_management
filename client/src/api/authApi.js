import axiosInstance from './config.js';

const loginUser = async (formData) => {
    try {
        const response = await axiosInstance.post(
            "/api/v1/user/login",
            formData,
        );
        return response.data;
    } catch (error) {
        if (import.meta.env.VITE_DEVELOPMENT === 'development') {
            console.error('Error during login:', error);
        }
        throw error;
    }
};

const logoutUser = async () => {
    try {
        const response = await axiosInstance.get(
            "/api/v1/user/logout",
        );
        return response.data;
    } catch (error) {
        if (import.meta.env.VITE_DEVELOPMENT === 'development') {
            console.error('Error during logout:', error);
        }
        throw error;
    }
};

const getCurrentUser = async () => {
    try {
        const response = await axiosInstance.get(
            "/api/v1/user/current-user",
        );
        return response.data;
    } catch (error) {
        if (import.meta.env.VITE_DEVELOPMENT === 'development') {
            console.error('Error fetching current user:', error);
        }
        throw error;
    }
};

const forgotPassword = async (email) => {
    try {
        const response = await axiosInstance.post(
            "api/v1/user/forgot-password",
            { email }
        );
        return response.data;
    } catch (error) {
        if (import.meta.env.VITE_DEVELOPMENT === 'development') {
            console.error('Error requesting forgot password:', error);
        }
        throw error;
    }
};

const changePassword = async (formData) => {
    try {
        const response = await axiosInstance.post(
            "api/v1/user/change-password",
            formData
        );
        return response.data;
    } catch (error) {
        if (import.meta.env.VITE_DEVELOPMENT === 'development') {
            console.error('Error changing password:', error);
        }
        throw error;
    }
};

export {
    loginUser,
    logoutUser,
    getCurrentUser,
    forgotPassword,
    changePassword
};