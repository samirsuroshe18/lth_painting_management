import React, { useEffect, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import {
  IconButton,
  Tooltip,
  Box,
  CircularProgress,
  LinearProgress,
} from "@mui/material";
import { CheckCircle, Cancel, QrCode, MoreVert } from "@mui/icons-material";
import { Delete, Edit2 } from "lucide-react";
import { Crud } from "@toolpad/core/Crud";
import { assetsData } from "../../redux/slices/assetMasterSlice";
import { getAssets } from "../../api/assetMasterApi";
import { showNotificationWithTimeout } from "../../redux/slices/notificationSlice";
import { handleAxiosError } from "../../utils/handleAxiosError";

const AssetMaster = () => {
  const dispatch = useDispatch();
  const [assetsStore, setAssetStore] = useState([]);
  const [queryParams] = useState({ page: "1", limit: "5" });
  const [loading, setLoading] = useState(true);

  // Action handlers
  const handleApprove = (assetId) => {
    dispatch(
      showNotificationWithTimeout({
        show: true,
        type: "success",
        message: "Asset approved successfully",
      })
    );
  };

  const handleReject = (assetId) => {
    dispatch(
      showNotificationWithTimeout({
        show: true,
        type: "info",
        message: "Asset rejected",
      })
    );
  };

  const handleQRCode = (assetId) => {
    dispatch(
      showNotificationWithTimeout({
        show: true,
        type: "info",
        message: "QR Code generated",
      })
    );
  };

  const handleMenu = (assetId) => {
    // Implement your menu logic here
  };

  // Custom actions column
  const CustomActions = ({ row }) => (
    <Box sx={{ display: "flex", gap: 0.5 }}>
      <Tooltip title="Approve">
        <IconButton
          size="small"
          onClick={() => handleApprove(row._id)}
          sx={{ color: "success.main" }}
        >
          <CheckCircle fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Reject">
        <IconButton
          size="small"
          onClick={() => handleReject(row._id)}
          sx={{ color: "error.main" }}
        >
          <Cancel fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="QR Code">
        <IconButton
          size="small"
          onClick={() => handleQRCode(row._id)}
          sx={{ color: "primary.main" }}
        >
          <QrCode fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Edit">
        <IconButton
          size="small"
          onClick={() => handleQRCode(row._id)}
          sx={{ color: "primary.main" }}
        >
          <Edit2 fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete">
        <IconButton
          size="small"
          onClick={() => handleQRCode(row._id)}
          sx={{ color: "primary.main" }}
        >
          <Delete fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Menu">
        <IconButton
          size="small"
          onClick={() => handleMenu(row._id)}
          sx={{ color: "text.secondary" }}
        >
          <MoreVert fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );

  // DataSource for Crud
  const assetsDataSource = {
    fields: [
      { field: "srNo", headerName: "Sr. No", width: 80 },
      { field: "name", headerName: "Name", flex: 1 },
      {
        field: "location",
        headerName: "Location",
        flex: 1,
        renderCell: (params) => (
          <span>{params.row.locationId?.name || "-"}</span>
        ),
      },
      { field: "place", headerName: "Place", flex: 1 },
      {
        field: "status",
        headerName: "Status",
        flex: 1,
        renderCell: (params) => (
          <span>{params.row.status === true ? "Active" : "Inactive"}</span>
        ),
      },
      { field: "reviewStatus", headerName: "Review Status", flex: 1 },
      {
        field: "customActions",
        headerName: "Actions",
        width: 200,
        sortable: false,
        filterable: false,
        renderCell: (params) => (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              width: "100%",
            }}
          >
            <CustomActions row={params.row} />
          </Box>
        ),
      },
    ],

    getMany: async ({ paginationModel, filterModel, sortModel }) => {
      await new Promise((resolve) => setTimeout(resolve, 750));
      let processedAssets = [...assetsStore];

      // Filtering
      if (filterModel?.items?.length) {
        filterModel.items.forEach(({ field, value, operator }) => {
          if (!field || value == null) return;
          processedAssets = processedAssets.filter((asset) => {
            const rawValue = field.includes(".")
              ? field.split(".").reduce((o, key) => o?.[key], asset)
              : asset[field];
            switch (operator) {
              case "contains":
                return String(rawValue)
                  .toLowerCase()
                  .includes(String(value).toLowerCase());
              case "equals":
                return rawValue === value;
              case "startsWith":
                return String(rawValue)
                  .toLowerCase()
                  .startsWith(String(value).toLowerCase());
              case "endsWith":
                return String(rawValue)
                  .toLowerCase()
                  .endsWith(String(value).toLowerCase());
              case ">":
                return rawValue > value;
              case "<":
                return rawValue < value;
              default:
                return true;
            }
          });
        });
      }

      // Sorting
      if (sortModel?.length) {
        processedAssets.sort((a, b) => {
          for (const { field, sort } of sortModel) {
            const aValue = field.includes(".")
              ? field.split(".").reduce((o, key) => o?.[key], a)
              : a[field];
            const bValue = field.includes(".")
              ? field.split(".").reduce((o, key) => o?.[key], b)
              : b[field];
            if (aValue < bValue) return sort === "asc" ? -1 : 1;
            if (aValue > bValue) return sort === "asc" ? 1 : -1;
          }
          return 0;
        });
      }

      // Pagination
      const start = paginationModel.page * paginationModel.pageSize;
      const end = start + paginationModel.pageSize;
      const paginated = processedAssets
        .slice(start, end)
        .map((item, index) => ({
          ...item,
          srNo: start + index + 1,
        }));

      return { items: paginated, itemCount: processedAssets.length };
    },

    getOne: async (id) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const asset = assetsStore.find((a) => a._id === id);
      if (!asset) throw new Error("Asset not found");
      return asset;
    },

    createOne: async (data) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const newAsset = { _id: Date.now().toString(), ...data };
      setAssetStore([...assetsStore, newAsset]);
      return newAsset;
    },

    updateOne: async (id, data) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      let updatedAsset = null;
      const updatedAssets = assetsStore.map((a) => {
        if (a._id === id) {
          updatedAsset = { ...a, ...data };
          return updatedAsset;
        }
        return a;
      });
      setAssetStore(updatedAssets);
      if (!updatedAsset) throw new Error("Asset not found");
      return updatedAsset;
    },

    deleteOne: async (id) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setAssetStore(assetsStore.filter((a) => a._id !== id));
    },

    validate: (formValues) => {
      const issues = [];
      if (!formValues.name)
        issues.push({ message: "Name is required", path: ["name"] });
      if (!formValues.place)
        issues.push({ message: "Place is required", path: ["place"] });
      return { issues };
    },
  };

  // Fetch assets
  const fetchData = useCallback(async () => {
    setLoading(true); // <-- ADD THIS
    try {
      const res = await getAssets(queryParams);
      const response = res.data.assets.map((asset, index) => ({
        ...asset,
        srNo: index + 1,
        id: asset._id,
      }));
      setAssetStore(response);
      dispatch(assetsData(res.data));
    } catch (error) {
      dispatch(
        showNotificationWithTimeout({
          show: true,
          type: "error",
          message: handleAxiosError(error),
        })
      );
    } finally {
      setLoading(false); // <-- ADD THIS
    }
  }, [dispatch, queryParams]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Crud
      dataSource={assetsDataSource}
      rootPath="/masters/asset-master"
      initialPageSize={10}
      defaultValues={{ place: "", status: true, reviewStatus: "Pending" }}
      pageTitles={{
        create: "New Entry",
        edit: "Edit Entry",
        show: "View Entry",
      }}
      slotProps={{
        list: {
          dataGrid: {
            initialState: {
              columns: {
                columnVisibilityModel: {
                  actions: false,
                },
              },
            },
          },
        },
        onReload: fetchData,
      }}
    />
  );
};

export default AssetMaster;
