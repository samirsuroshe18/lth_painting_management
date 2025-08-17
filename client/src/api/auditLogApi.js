import axiosInstance from './config.js';

const getAllAudits = async () => {
    try {
        const response = await axiosInstance.get(
            "/api/v1/assetaudit/get-all-audit-logs"
        );
        return response.data;
    } catch (error) {
        if (import.meta.env.VITE_DEVELOPMENT === 'development') {
            console.error('Error fetching all audits:', error);
        }
        throw error;
    }
};

const getAssetAudits = async (id) => {
    try {
        const response = await axiosInstance.get(
            `/api/v1/assetaudit/get-asset-audit-logs/${id}`
        );
        return response.data;
    } catch (error) {
        if (import.meta.env.VITE_DEVELOPMENT === 'development') {
            console.error('Error fetching all audits:', error);
        }
        throw error;
    }
};

const reviewAuditStatus = async (id, reviewStatus) => {
    try {
        const response = await axiosInstance.put(
            `/api/v1/assetaudit/review-audit-status/${id}`,
            reviewStatus,
        );
        return response.data;
    } catch (error) {
        if (import.meta.env.VITE_DEVELOPMENT === 'development') {
            console.error('Error reviewing audit status:', error);
        }
        throw error;
    }
};

const submitAudit = async (auditData) => {
    try {
        const form = new FormData();

        if (auditData.proposedChanges.year) {
            auditData.proposedChanges.year = new Date(auditData.proposedChanges.year).getFullYear();
        }

        // Remove empty string or null values from proposedChanges
        Object.keys(auditData.proposedChanges).forEach((key) => {
            if (auditData.proposedChanges[key] === "" || auditData.proposedChanges[key] === null) {
                delete auditData.proposedChanges[key];
            }
        });

        form.append("assetId", auditData.assetId || "");
        form.append("auditorRemark", auditData.auditorRemark || "");
        form.append("proposedChanges", JSON.stringify(auditData.proposedChanges) || "");

        if (auditData.assetImage) {
            form.append("assetImage", auditData.assetImage);
        }
        if (auditData.auditImage1) {
            form.append("auditImage1", auditData.auditImage1);
        }
        if (auditData.auditImage2) {
            form.append("auditImage2", auditData.auditImage2);
        }
        if (auditData.auditImage3) {
            form.append("auditImage3", auditData.auditImage3);
        }

        const response = await axiosInstance.post(
            "api/v1/assetaudit/add-asset-audit",
            form,
            {
                headers: { "Content-Type": "multipart/form-data" },
            }
        );
        return response.data;
    } catch (error) {
        if (import.meta.env.VITE_DEVELOPMENT === 'development') {
            console.error('Error submitting audit:', error);
        }
        throw error;
    }
};

const fetchAudits = async ({ locationIds, assetIds, startDate, endDate }) => {
    try {
        const response = await axiosInstance.post(
            "/api/v1/assetaudit/fetch-audits",
            { locationIds, assetIds, startDate, endDate }
        );
        return response.data;
    } catch (error) {
        if (import.meta.env.VITE_DEVELOPMENT === 'development') {
            console.error('Error fetching audits:', error);
        }
        throw error;
    }
};

export {
    submitAudit,
    getAllAudits,
    reviewAuditStatus,
    fetchAudits,
    getAssetAudits
};