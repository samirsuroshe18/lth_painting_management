import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../slices/authSlice'
import notificationReducer from '../slices/notificationSlice'
import assetMasterReducer from '../slices/assetMasterSlice';

const store = configureStore({
    reducer: {
        auth: authReducer,
        notification: notificationReducer,
        assetMaster: assetMasterReducer
    }
});


export default store;