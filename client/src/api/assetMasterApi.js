import axiosInstance from './config.js';

const getAssets = async (queryParams) => {
    const response = await axiosInstance.get(
        `/api/v1/assetmaster/get-assets`,
        { params: queryParams, withCredentials: true }
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

const createNewAsset = async (assetData) => {
    const form = new FormData();

    // Main asset fields (text)
    form.append("name", assetData.name || "");
    form.append("description", assetData.description || "");
    form.append("purchaseValue", assetData.currentValue || "");
    form.append("locationId", assetData.location || "");
    form.append("year", new Date(assetData.year).getFullYear());
    form.append("artist", assetData.artist || "");
    form.append("place", assetData.place || "");
    form.append("size", assetData.size || "");
    form.append("status", assetData.status == 'Active' ? true : false);

    // File upload (image/file)
    if (assetData.image) {
        form.append("file", assetData.image);
    }

    // API call
    const response = await axiosInstance.post(
        'api/v1/assetmaster/add-asset',
        form,
        {
            headers: { "Content-Type": "multipart/form-data" },
            withCredentials: true,
        }
    );
    return response.data;
};

const updateAsset = async (assetData) => {
    const form = new FormData();

    // Main asset fields (text)
    form.append("name", assetData.name || "");
    form.append("description", assetData.description || "");
    form.append("purchaseValue", assetData.currentValue || "");
    form.append("locationId", assetData.location || "");
    form.append("year", new Date(assetData.year).getFullYear());
    form.append("artist", assetData.artist || "");
    form.append("place", assetData.place || "");
    form.append("size", assetData.size || "");
    form.append("status", assetData.status == 'Active' ? true : false);

    // File upload (image/file)
    if (assetData.image) {
        form.append("file", assetData.image);
    }

    // API call
    const response = await axiosInstance.put(
        `api/v1/assetmaster/update-asset/${assetData.id}`,
        form,
        {
            headers: { "Content-Type": "multipart/form-data" },
            withCredentials: true,
        }
    );
    return response.data;
};

const removeAsset = async (id) => {
    const response = await axiosInstance.delete(
        `/api/v1/assetmaster/remove-asset/${id}`,
        { withCredentials: true }
    );
    return response.data;
};

export {
    getAssets,
    viewAsset,
    createNewAsset,
    updateAsset,
    removeAsset
}