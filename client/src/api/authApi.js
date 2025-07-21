import { showNotificationWithTimeout } from '../redux/slices/notificationSlice.js';
import axiosInstance from './config.js';

const loginUser = async (formData) => {
    const response = await axiosInstance.post(
        `/api/v1/user/login`,
        formData,
        { withCredentials: true }
    );
    return response.data;
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