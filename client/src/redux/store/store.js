import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../slices/authSlice'
import notificationReducer from '../slices/notificationSlice'
import assetMasterReducer from '../slices/assetMasterSlice';
import adminReducer from '../slices/isAdminSlice';

const store = configureStore({
    reducer: {
        auth: authReducer,
        notification: notificationReducer,
        assetMaster: assetMasterReducer,
        admin: adminReducer
    }
});


export default store;