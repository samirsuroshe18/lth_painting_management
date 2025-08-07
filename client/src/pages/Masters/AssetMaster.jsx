import { useState } from "react";
import { useDispatch } from "react-redux";
import {
  IconButton,
  Tooltip,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
} from "@mui/material";
import { CheckCircle, Cancel, QrCode } from "@mui/icons-material";
import { Crud } from "@toolpad/core/Crud";
import { getAssets, removeAsset } from "../../api/assetMasterApi";
import { showNotificationWithTimeout } from "../../redux/slices/notificationSlice";
import { handleAxiosError } from "../../utils/handleAxiosError";
import { Delete as DeleteIcon, Edit as EditIcon } from "@mui/icons-material";
import { History } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const AssetMaster = () => {
  const dispatch = useDispatch();
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [selectedQr, setSelectedQr] = useState(null);
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState(null);
  const [loading, setLoading] = useState(false);

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

  const handleEdit = (row) => {
    navigate("edit-asset", { state: { asset: row } });
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      const response = await removeAsset(assetToDelete._id);
      dispatch(
        showNotificationWithTimeout({
          show: true,
          type: "success",
          message: response.message,
        })
      );
    } catch (error) {
      dispatch(
        showNotificationWithTimeout({
          show: true,
          type: "error",
          message: handleAxiosError(error),
        })
      );
    } finally {
      setDeleteDialogOpen(false)
      setLoading(false);
    }
  };

  const handleHistory = (assetId) => {
    navigate("log-history", { state: { assetId } });
  };

  const CustomActions = ({ row }) => (
    <Box sx={{ display: "flex", gap: 0.5 }}>
      {/* Approve and Reject Button */}
      {row.reviewStatus === "pending" && (
        <>
          <Tooltip title="Approve">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleApprove(row._id);
              }}
              sx={{ color: "success.main" }}
            >
              <CheckCircle fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Reject">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleReject(row._id);
              }}
              sx={{ color: "error.main" }}
            >
              <Cancel fontSize="small" />
            </IconButton>
          </Tooltip>
        </>
      )}

      {/* QR Code */}
      <Tooltip title="QR Code">
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            const src = row.qrCode?.startsWith("data:image")
              ? row.qrCode
              : "data:image/png;base64," + row.qrCode;
            setSelectedQr(src);
            setQrDialogOpen(true);
          }}
          sx={{ color: "primary.main" }}
        >
          <QrCode fontSize="small" />
        </IconButton>
      </Tooltip>

      {/* Edit Asset */}
      <Tooltip title="Edit Asset">
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            handleEdit(row);
          }}
          sx={{ color: "warning.main" }}
        >
          <EditIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      {/* Delete Asset */}
      <Tooltip title="Delete">
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            setAssetToDelete(row);
            setDeleteDialogOpen(true);
          }}
          sx={{ color: "error.main" }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      {/* Audit Log */}
      <Tooltip title="Audit Logs">
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            handleHistory(row._id);
          }}
          sx={{ color: "secondary.main" }}
        >
          <History fontSize="small" />
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
        width: 240,
        minWidth: 230,
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
      try {
        const page = (paginationModel?.page || 0) + 1;
        const limit = paginationModel?.pageSize || 3;
        const params = { page, limit };

        // --- Filtering ---
        if (filterModel?.items?.length) {
          filterModel.items.forEach(({ field, value, operator }) => {
            if (!field || value == null || value === "") return;

            // Name/keyword search
            if (field === "name" && operator === "contains") {
              params.search = value;
            }

            // Status/reviewStatus
            if (field === "reviewStatus" && operator === "equals") {
              params.status = value;
            }

            // Date range (assume your filter fields are startDate/endDate)
            if (field === "startDate") {
              params.startDate = value;
            }
            if (field === "endDate") {
              params.endDate = value;
            }
          });
        }

        // --- Sorting (optional, if your backend supports it) ---
        if (sortModel?.length) {
          const sortField = sortModel[0]?.field;
          const sortOrder = sortModel[0]?.sort === "asc" ? 1 : -1;
          params.sortField = sortField;
          params.sortOrder = sortOrder;
        }

        // --- API Call ---
        const res = await getAssets(params);

        // --- Map and add id/srNo ---
        const response = (res.data.assets || []).map((asset, index) => ({
          ...asset,
          id: asset._id,
          srNo: (page - 1) * limit + index + 1,
        }));

        return {
          items: response,
          itemCount: res.data.pagination.totalEntries,
        };
      } catch (error) {
        dispatch(
          showNotificationWithTimeout({
            show: true,
            type: "error",
            message: handleAxiosError(error),
          })
        );
        return { items: [], itemCount: 0 };
      }
    },
  };

  return (
    <>
      <Crud
        dataSource={assetsDataSource}
        rootPath="/masters/asset-master"
        initialPageSize={10}
        defaultValues={{ place: "", status: true, reviewStatus: "pending" }}
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
              onRowClick: (params) => {
                navigate("edit-asset", {
                  state: { asset: params.row, read: true },
                });
              },
            },
          },
        }}
      />

      <Dialog open={qrDialogOpen} onClose={() => setQrDialogOpen(false)}>
        <DialogTitle>QR Code</DialogTitle>
        <DialogContent>
          {selectedQr && (
            <img
              src={selectedQr}
              alt="QR Code"
              style={{
                width: 256,
                height: 256,
                margin: "auto",
                display: "block",
              }}
            />
          )}
        </DialogContent>
        <DialogActions>
          {selectedQr && (
            <Button
              component="a"
              href={selectedQr}
              download="qrcode.png"
              color="primary"
              variant="contained"
            >
              Download QR
            </Button>
          )}
          <Button onClick={() => setQrDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Asset</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete{" "}
            <strong>{assetToDelete?.name}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            fullWidth={window.innerWidth < 600}
            disabled={loading}
            onClick={handleDelete}
          >
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minWidth: "72px",
                height: "24px",
              }}
            >
              {loading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                "Delete"
              )}
            </Box>
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AssetMaster;
