import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    status: false,
    assetData: null,
};

const assetMasterSlice = createSlice({
    name: "assetMaster",
    initialState,
    reducers: {
        assetsData : (state, action) => {
            state.status = true;
            state.assetData = action.payload || {}; // Ensure fallback object
        },
    }
});

export const { assetsData } = assetMasterSlice.actions;
export default assetMasterSlice.reducer;
