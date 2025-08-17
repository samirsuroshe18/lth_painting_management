import axiosInstance from './config.js';

const getAssets = async (queryParams) => {
    try {
        const response = await axiosInstance.get(
            "/api/v1/assetmaster/get-assets",
            { params: queryParams }
        );
        return response.data;
    } catch (error) {
        if (import.meta.env.VITE_DEVELOPMENT === 'development') {
            console.error('Error fetching assets:', error);
        }
        throw error;
    }
};

const getAllAssets = async () => {
    try {
        const response = await axiosInstance.get("/api/v1/assetmaster/get-all-assets");
        return response.data;
    } catch (error) {
        if (import.meta.env.VITE_DEVELOPMENT === 'development') {
            console.error('Error fetching assets:', error);
        }
        throw error;
    }
};

const getQrCodes = async () => {
    try {
        const response = await axiosInstance.get(
            "/api/v1/assetmaster/get-qr-codes"
        );
        return response.data;
    } catch (error) {
        if (import.meta.env.VITE_DEVELOPMENT === 'development') {
            console.error('Error fetching assets:', error);
        }
        throw error;
    }
};

const reviewAssetStatus = async (id, formData) => {
    try {
        const response = await axiosInstance.put(
            `/api/v1/assetmaster/review-asset-status/${id}`,
            formData,
        );
        return response.data;
    } catch (error) {
        if (import.meta.env.VITE_DEVELOPMENT === 'development') {
            console.error('Error reviewing asset status:', error);
        }
        throw error;
    }
};

const viewAssetPublic = async (id) => {
    try {
        const response = await axiosInstance.get(
            `/api/v1/assetmaster/view-asset/public/${id}`,
        );
        return response.data;
    } catch (error) {
        if (import.meta.env.VITE_DEVELOPMENT === 'development') {
            console.error('Error viewing public asset:', error);
        }
        throw error;
    }
};

const createNewAsset = async (assetData) => {
    try {
        const form = new FormData();

        form.append("name", assetData.name || "");
        form.append("description", assetData.description || "");
        form.append("purchaseValue", assetData.currentValue || "");
        form.append("locationId", assetData.location || "");
        form.append("year", new Date(assetData.year).getFullYear());
        form.append("artist", assetData.artist || "");
        form.append("place", assetData.place || "");
        form.append("size", assetData.size || "");
        form.append("status", assetData.status == 'Active' ? true : false);

        if (assetData.image) {
            form.append("file", assetData.image);
        }

        const response = await axiosInstance.post(
            "api/v1/assetmaster/add-asset",
            form,
            {
                headers: { "Content-Type": "multipart/form-data" },
            }
        );
        return response.data;
    } catch (error) {
        if (import.meta.env.VITE_DEVELOPMENT === 'development') {
            console.error('Error creating new asset:', error);
        }
        throw error;
    }
};

const updateAsset = async (assetData) => {
    try {
        const form = new FormData();

        form.append("name", assetData.name || "");
        form.append("description", assetData.description || "");
        form.append("purchaseValue", assetData.currentValue || "");
        form.append("locationId", assetData.location || "");
        form.append("year", new Date(assetData.year).getFullYear());
        form.append("artist", assetData.artist || "");
        form.append("place", assetData.place || "");
        form.append("size", assetData.size || "");
        form.append("status", assetData.status == 'active' ? true : false);

        if (assetData.image) {
            form.append("file", assetData.image);
        }

        const response = await axiosInstance.put(
            `api/v1/assetmaster/update-asset/${assetData.id}`,
            form,
            {
                headers: { "Content-Type": "multipart/form-data" },
            }
        );
        return response.data;
    } catch (error) {
        if (import.meta.env.VITE_DEVELOPMENT === 'development') {
            console.error('Error updating asset:', error);
        }
        throw error;
    }
};

const removeAsset = async (id) => {
    try {
        const response = await axiosInstance.delete(
            `/api/v1/assetmaster/remove-asset/${id}`,
        );
        return response.data;
    } catch (error) {
        if (import.meta.env.VITE_DEVELOPMENT === 'development') {
            console.error('Error removing asset:', error);
        }
        throw error;
    }
};

const getAssetsByLocations = async (locationIds) => {
    try {
        const response = await axiosInstance.post(
            "/api/v1/assetmaster/get-assets-by-loc",
            locationIds,
        );
        return response.data;
    } catch (error) {
        if (import.meta.env.VITE_DEVELOPMENT === 'development') {
            console.error('Error fetching assets by locations:', error);
        }
        throw error;
    }
};

export {
    getAssets,
    viewAssetPublic,
    createNewAsset,
    updateAsset,
    removeAsset,
    reviewAssetStatus,
    getAssetsByLocations,
    getQrCodes,
    getAllAssets
};