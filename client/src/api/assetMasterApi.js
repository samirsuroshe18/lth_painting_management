import axiosInstance from './config.js';

const getAssets = async (queryParams) => {
    const response = await axiosInstance.get(
        `/api/v1/assetmaster/get-assets?${queryParams}`,
        { withCredentials: true }
    );
    return response.data;
};

const viewAsset = async (queryParams) => {
    const response = await axiosInstance.get(
        `/api/v1/assetmaster/view-asset/${queryParams}`,
        { withCredentials: true }
    );
    return response.data;
};
export {
    getAssets,
    viewAsset,
}