import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    admin: false,
};

const authSlice = createSlice({
    name: "admin",
    initialState,
    reducers: {
        setAdmin: (state, action) => {
            state.admin = action.payload;
        },
    }
});

export const { setAdmin } = authSlice.actions;
export default authSlice.reducer;