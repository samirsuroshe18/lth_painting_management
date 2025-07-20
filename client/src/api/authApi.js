import { showNotificationWithTimeout } from '../redux/slices/notificationSlice.js';
import axiosInstance from './config.js';

const loginUser = async (formData) => {
    try {
        console.log("Logging in with data:", formData);
        const response = await axiosInstance.post(
            `/api/v1/user/login`,
            formData,
            { withCredentials: true }
        );
        console.log("Login response:", response.data);
        return response.data;
    } catch (error) {
        throw error
    }
};

const logoutUser = async (setLoading, dispatch) => {
    setLoading(true);
    try {
        const response = await axiosInstance.get(
            `/api/v1/tenant/logout`,
            { withCredentials: true }
        );
        setLoading(false);
        dispatch(showNotificationWithTimeout({ show: true, type: "success", message: response.data.message }));
        return response.data;
    } catch (error) {
        throw error;
    }
};

const getCurrentUser = async (setLoading, dispatch) => {
    setLoading(true);
    try {
        const response = await axiosInstance.get(
            `/api/v1/user/current-user`,
            { withCredentials: true }
        );
        setLoading(false);
        dispatch(showNotificationWithTimeout({ show: true, type: "success", message: response.data.message }));
        return response.data;
    } catch (error) {
        throw error
    }
};

export {
    loginUser,
    logoutUser,
    getCurrentUser,
}