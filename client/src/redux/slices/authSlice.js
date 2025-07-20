import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    status: false,
    userData: null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        login: (state, action) => {
            state.status = true;
            state.userData = action.payload || {}; // Ensure fallback object
        },
        currentUser: (state, action) => {
            state.status = true;
            state.userData = action.payload || {};
        },
    }
});

export const { login, currentUser } = authSlice.actions;
export default authSlice.reducer;
