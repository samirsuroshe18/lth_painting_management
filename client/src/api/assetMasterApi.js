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

    if (assetData.name) form.append("name", assetData.name);
    if (assetData.description) form.append("description", assetData.description);
    if (assetData.currentValue) form.append("purchaseValue", assetData.currentValue);
    if (assetData.location) form.append("locationId", assetData.location);
    if (assetData.department) form.append("department", assetData.department);
    if (assetData.building) form.append("building", assetData.building);
    if (assetData.floor) form.append("floor", assetData.floor);
    if (assetData.artist) form.append("artist", assetData.artist);
    if (assetData.size) form.append("size", assetData.size);
    if (assetData.year && assetData.year.isValid && assetData.year.isValid()) {
        form.append("year", assetData.year.year());
    }
    if (assetData.image) {
        form.append("file", assetData.image);
    }
    form.append("status", assetData.status === "active");

    const response = await axiosInstance.post(
      "/api/v1/assetmaster/add-asset",
      form,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    return response.data;
  } catch (error) {
    if (import.meta.env.VITE_DEVELOPMENT === "development") {
      console.error("Error creating new asset:", error);
    }
    throw error;
  }
};

const updateAsset = async (assetData) => {
    try {
        const form = new FormData();

        if (assetData.name) form.append("name", assetData.name);
        if (assetData.description) form.append("description", assetData.description);
        if (assetData.currentValue) form.append("purchaseValue", assetData.currentValue);
        if (assetData.location) form.append("locationId", assetData.location);
        if (assetData.department) form.append("department", assetData.department);
        if (assetData.building) form.append("building", assetData.building);
        if (assetData.floor) form.append("floor", assetData.floor);
        if (assetData.artist) form.append("artist", assetData.artist);
        if (assetData.size) form.append("size", assetData.size);
        if (assetData.year && assetData.year.isValid && assetData.year.isValid()) {
            form.append("year", assetData.year.year());
        }
        form.append("status", assetData.status === "active");
        if (assetData.image) {
            form.append("file", assetData.image);
        }

        const response = await axiosInstance.put(
            `/api/v1/assetmaster/update-asset/${assetData.id}`,
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