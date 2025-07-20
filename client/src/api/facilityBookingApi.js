import axiosInstance from './config.js';
import { showNotificationWithTimeout } from '../redux/slices/notificationSlice.js';

const createBooking = async (formData, setLoading, dispatch) => {
    setLoading(true);
    try {
        const response = await axiosInstance.post(
            `/api/v1/booking/create-booking`, // Adjust the endpoint as needed
            formData,
            { withCredentials: true }
        );
        setLoading(false);
        dispatch(showNotificationWithTimeout({show:true, type:"success", message:response.data.message}));
        return response.data;
    } catch (error) {
        throw error
    }
};

const getBookings = async (setLoading, dispatch) => {
    setLoading(true);
    try {
        const response = await axiosInstance.get(
            `/api/v1/booking/get-bookings`, // Adjust the endpoint as needed
            { withCredentials: true }
        );
        setLoading(false);
        dispatch(showNotificationWithTimeout({show:true, type:"success", message:response.data.message}));
        return response.data;
    } catch (error) {
        throw error
    }
};

const updateBooking = async (id, setLoading, dispatch) => {
    setLoading(true);
    try {
        const response = await axiosInstance.put(
            `/api/v1/booking/update/${id}`, 
            { withCredentials: true }
        );
        setLoading(false);
        dispatch(showNotificationWithTimeout({show:true, type:"success", message:response.data.message}));
        return response.data;
    } catch (error) {
        throw error
    }
};

const createFacilities = async (formData, setLoading, dispatch) => {
    setLoading(true);
    try {
        const response = await axiosInstance.post(
            `/api/v1/facility/create-facilities`, // Adjust the endpoint as needed
            formData,
            { withCredentials: true }
        );
        setLoading(false);
        dispatch(showNotificationWithTimeout({show:true, type:"success", message:response.data.message}));
        return response.data;
    } catch (error) {
        throw error
    }
}; 

const getFacilities = async (setLoading, dispatch) => {
    setLoading(true);
    try {
        const response = await axiosInstance.get(
            `/api/v1/facility/get-facilities`,
            { withCredentials: true }
        );
        setLoading(false);
        dispatch(showNotificationWithTimeout({show:true, type:"success", message:response.data.message}));
        return response.data;
    } catch (error) {
        throw error
    }
};

export { createBooking, getBookings, updateBooking, createFacilities, getFacilities }


