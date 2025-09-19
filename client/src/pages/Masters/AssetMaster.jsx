import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
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
  Container,
  Grid,
  Chip,
  TextField,
  InputAdornment,
  Alert,
  Stack,
} from "@mui/material";
import {
  CheckCircle,
  Cancel,
  QrCode,
  Delete as DeleteIcon,
  Edit as EditIcon,
  History,
  Add as AddIcon,
  Search as SearchIcon,
  Refresh,
  Visibility,
} from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";
import {
  getAllAssets,
  removeAsset,
  reviewAssetStatus,
} from "../../api/assetMasterApi";
import { showNotificationWithTimeout } from "../../redux/slices/notificationSlice";
import { handleAxiosError } from "../../utils/handleAxiosError";
import { useNavigate } from "react-router-dom";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import PendingRoundedIcon from "@mui/icons-material/PendingRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

export default function AssetMaster() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

   const userRole = useSelector((state) => state.auth?.userData?.user?.role || '');

  const isSupervisor = userRole?.toLowerCase() === 'supervisor';

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredRows, setFilteredRows] = useState([]);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [selectedQr, setSelectedQr] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState(null);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [assetToApprove, setAssetToApprove] = useState(null);
  const [assetToReject, setAssetToReject] = useState(null);
  const [approveLoading, setApproveLoading] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);
  const [rejectRemark, setRejectRemark] = useState("");
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 5,
  });

  useEffect(() => {
    fetchAssets();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, rows]);

  const fetchAssets = async () => {
    try {
      setLoading(true);

      const response = await getAllAssets();

      const assets = response?.data || [];
      const assetWithIds = assets.map((asset, index) => ({
        ...asset,
        id: asset?._id ?? index,
      }));

      setRows(assetWithIds);
    } catch (error) {
      setRows([]);
      dispatch(
        showNotificationWithTimeout({
          show: true,
          type: "error",
          message: handleAxiosError(error),
        })
      );
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...rows];

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();

      filtered = filtered.filter((asset) => {
        const name = asset.name?.toLowerCase() || "";
        const location = asset.locationId.name?.toLowerCase() || "";

        return name.includes(searchLower) || location.includes(searchLower);
      });
    }

    setFilteredRows(filtered);
  };

  const handleApprove = (assetIdOrRow) => {
    if (isSupervisor) return; // Simply do nothing for supervisors
    
    const row =
      typeof assetIdOrRow === "object"
        ? assetIdOrRow
        : rows.find((r) => r.id === assetIdOrRow);
    setAssetToApprove(row);
    setApproveDialogOpen(true);
  };

  const handleReject = (assetIdOrRow) => {
    if (isSupervisor) return; // Simply do nothing for supervisors
    
    const row =
      typeof assetIdOrRow === "object"
        ? assetIdOrRow
        : rows.find((r) => r.id === assetIdOrRow);
    setAssetToReject(row);
    setRejectRemark("");
    setRejectDialogOpen(true);
  };

  const handleConfirmApprove = async () => {
    if (!assetToApprove) return;
    try {
      setApproveLoading(true);
      const result = await reviewAssetStatus(assetToApprove.id, {
        reviewStatus: "approved",
      });

      const data = result.data;
      data.id = data._id;
      setFilteredRows((prev) =>
        prev.map((item) => (item.id === data.id ? data : item))
      );

      dispatch(
        showNotificationWithTimeout({
          show: true,
          type: "success",
          message: "Asset approved successfully",
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
      setApproveLoading(false);
      setApproveDialogOpen(false);
      setAssetToApprove(null);
    }
  };

  const handleConfirmReject = async () => {
    if (!assetToReject || !rejectRemark.trim()) return;
    try {
      setRejectLoading(true);
      const result = await reviewAssetStatus(assetToReject.id, {
        reviewStatus: "rejected",
        rejectRemark,
      });

      const data = result.data;
      data.id = data._id;
      setFilteredRows((prev) =>
        prev.map((item) => (item.id === data.id ? data : item))
      );

      dispatch(
        showNotificationWithTimeout({
          show: true,
          type: "success",
          message: "Asset rejected successfully",
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
      setRejectLoading(false);
      setRejectDialogOpen(false);
      setAssetToReject(null);
      setRejectRemark("");
    }
  };

  // Navigate to edit screen
  const handleEdit = (row) => navigate("new", { state: { asset: row } });

  // Navigate to read-only edit screen (view details)
  const handleView = (row) => navigate("view-asset", { state: { asset: row } });

  // Delete handler
  const handleDelete = async () => {
    if (!assetToDelete) return;

    try {
      setDeleteLoading(true);
      const response = await removeAsset(assetToDelete.id);

      if (response.success) {
        // Optimistic removal from local copy
        setRows((prev) => prev.filter((a) => a.id !== assetToDelete.id));

        dispatch(
          showNotificationWithTimeout({
            show: true,
            type: "success",
            message: "Asset deleted successfully",
          })
        );
      }
    } catch (error) {
      dispatch(
        showNotificationWithTimeout({
          show: true,
          type: "error",
          message: handleAxiosError(error),
        })
      );
    } finally {
      setDeleteLoading(false);
      setDeleteDialogOpen(false);
      setAssetToDelete(null);
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  // Navigate to create screen
  const handleCreateClick = () => navigate("new");

  // Navigate to audit log screen
  const handleHistory = (assetId) =>
    navigate("log-history", { state: { assetId } });

  // Manual refresh (refetch current page)
  const handleRefresh = () => fetchAssets();

  // ---------------------------
  // DataGrid columns
  // ---------------------------
  const columns = [
    {
      field: "srNo",
      headerName: "Sr. No",
      width: 90,
      sortable: false,
      filterable: false,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => {
        const visibleIndex =
          params.api.getRowIndexRelativeToVisibleRows(params.id) ?? 0;
        const serial =
          paginationModel.page * paginationModel.pageSize + visibleIndex + 1;

        return (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
            }}
          >
            <Typography variant="body2">{serial}</Typography>
          </Box>
        );
      },
    },
    {
      field: "name",
      headerName: "Asset Name",
      minWidth: 200,
      flex: 1,
      sortable: false,
      filterable: false,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "locationId",
      headerName: "Location",
      flex: 1,
      minWidth: 150,
      sortable: false,
      filterable: false,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <Chip
          label={params.row.locationId?.name || "-"}
          size="small"
          variant="outlined"
          color="primary"
        />
      ),
    },
    {
      field: "city",
      headerName: "City",
      flex: 1,
      minWidth: 140,
      sortable: false,
      filterable: false,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <Chip
          label={params.row.locationId?.cityId?.name || "-"}
          size="small"
          variant="outlined"
          color="secondary"
        />
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 110,
      align: "center",
      sortable: false,
      filterable: false,
      headerAlign: "center",
      renderCell: (params) => (
        <Chip
          label={params.value ? "Active" : "Inactive"}
          size="small"
          color={params.value ? "success" : "default"}
          variant={params.value ? "filled" : "outlined"}
        />
      ),
    },
    {
      field: "reviewStatus",
      headerName: "Review Status",
      width: 140,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => {
        const map = {
          pending: {
            icon: <PendingRoundedIcon fontSize="small" />,
            color: "warning",
            label: "Pending",
          },
          approved: {
            icon: <CheckCircleRoundedIcon fontSize="small" />,
            color: "success",
            label: "Approved",
          },
          rejected: {
            icon: <CloseRoundedIcon fontSize="small" />,
            color: "error",
            label: "Rejected",
          },
        };
        const cfg = map[params.value] || {
          color: "default",
          label: params.value || "-",
        };
        return (
          <Chip
            icon={cfg.icon}
            label={cfg.label}
            color={cfg.color}
            size="small"
            variant="outlined"
          />
        );
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      minWidth: 240,
      flex: 1,
      sortable: false,
      filterable: false,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          gap={0.5}
          height="100%"
        >
          {/* Only show approve/reject buttons if NOT supervisor and asset is pending */}
          {!isSupervisor && params.row.reviewStatus === "pending" && (
            <>
              <Tooltip title="Approve">
                <IconButton
                  size="small"
                  color="success"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleApprove(params.row);
                  }}
                >
                  <CheckCircle fontSize="small" />
                </IconButton>
              </Tooltip>

              <Tooltip title="Reject">
                <IconButton
                  size="small"
                  color="error"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReject(params.row);
                  }}
                >
                  <Cancel fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}

          <Tooltip title="View Details">
            <IconButton
              size="small"
              color="info"
              onClick={(e) => {
                e.stopPropagation();
                handleView(params.row);
              }}
            >
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="QR Code">
            <IconButton
              size="small"
              color="primary"
              onClick={(e) => {
                e.stopPropagation();
                const src = params.row.qrCode?.startsWith("data:image")
                  ? params.row.qrCode
                  : "data:image/png;base64," + params.row.qrCode;
                setSelectedQr(src);
                setQrDialogOpen(true);
              }}
            >
              <QrCode fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Edit Asset">
            <IconButton
              size="small"
              color="warning"
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(params.row);
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          {/* Only show delete button if NOT supervisor */}
          {!isSupervisor && (
            <Tooltip title="Delete">
              <IconButton
                size="small"
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  setAssetToDelete(params.row);
                  setDeleteDialogOpen(true);
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title="Audit Logs">
            <IconButton
              size="small"
              color="secondary"
              onClick={(e) => {
                e.stopPropagation();
                handleHistory(params.row.id);
              }}
            >
              <History fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header card */}
      <Grid container spacing={2} alignItems="center">
        <Grid size={{ xs: 12, md: "auto" }}>
          <Typography variant="h4" fontWeight={700} color="primary">
            Asset Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage and monitor all painting assets in the system
          </Typography>
        </Grid>
      </Grid>

      {/* Search & Filter Card */}
      <Grid container spacing={2} sx={{ mt: 4 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            fullWidth
            placeholder="Search assets by name or location..."
            value={searchTerm}
            onChange={handleSearchChange}
            variant="outlined"
            size="small"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={clearSearch}
                      edge="end"
                      aria-label="clear search"
                    >
                      <Cancel fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Stack direction="row" spacing={1} justifyContent={"flex-end"}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={handleRefresh}
              disabled={loading}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateClick}
            >
              Add Asset
            </Button>
          </Stack>
        </Grid>
      </Grid>

      {/* CLIENT-SIDE DataGrid */}
      <Box sx={{ height: 410, width: "100%", mt: 3 }}>
        <DataGrid
          rows={filteredRows}
          columns={columns}
          disableRowSelectionOnClick
          loading={loading}
          paginationModel={paginationModel}
          onPaginationModelChange={(newModel) => {
            //added this to reset page to 0 when pageSize changes
            if (newModel.pageSize !== paginationModel.pageSize) {
              setPaginationModel({ page: 0, pageSize: newModel.pageSize });
            } else {
              setPaginationModel(newModel);
            }
          }}
          pageSizeOptions={[5, 10, 25, 50]}
          rowHeight={60}
          headerHeight={50}
          sx={{
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "rgba(99,102,241,0.06)",
            },
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
          }}
        />
      </Box>

      {/* All the dialogs remain the same */}
      
      {/* QR Code dialog */}
      <Dialog
        open={qrDialogOpen}
        onClose={() => {
          setQrDialogOpen(false);
          requestAnimationFrame(() => {
            document.getElementById("assets-toolbar")?.focus();
          });
        }}
        disableRestoreFocus
        slotProps={{ backdrop: { inert: true } }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>QR Code</DialogTitle>
        <DialogContent>
          {selectedQr && (
            <Box display="flex" justifyContent="center" py={2}>
              <Box
                component="img"
                src={selectedQr}
                alt="QR Code"
                sx={{ width: 256, height: 256, borderRadius: 1 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {selectedQr && (
            <Button
              component="a"
              href={selectedQr}
              download="qrcode.png"
              variant="contained"
              startIcon={<QrCode />}
            >
              Download QR
            </Button>
          )}
          <Button onClick={() => setQrDialogOpen(false)} variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          requestAnimationFrame(() => {
            document.getElementById("assets-toolbar")?.focus();
          });
        }}
        disableRestoreFocus
        slotProps={{ backdrop: { inert: true } }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle color="error">Delete Asset</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action cannot be undone.
          </Alert>
          <Typography>
            Are you sure you want to delete{" "}
            <strong>{assetToDelete?.name}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            variant="outlined"
            disabled={deleteLoading}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            disabled={deleteLoading}
            onClick={handleDelete}
            startIcon={
              deleteLoading ? <CircularProgress size={16} /> : <DeleteIcon />
            }
          >
            {deleteLoading ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Approve */}
      <Dialog
        open={approveDialogOpen}
        onClose={() => setApproveDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Approve Asset</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to approve{" "}
            <strong>{assetToApprove?.name}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setApproveDialogOpen(false)}
            variant="outlined"
            disabled={approveLoading}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="success"
            disabled={approveLoading}
            onClick={handleConfirmApprove}
            startIcon={
              approveLoading ? <CircularProgress size={16} /> : <CheckCircle />
            }
          >
            {approveLoading ? "Approving..." : "Approve"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject */}
      <Dialog
        open={rejectDialogOpen}
        onClose={() => setRejectDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Reject Asset</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Please provide a rejection remark before confirming.
          </Alert>
          <TextField
            autoFocus
            fullWidth
            label="Rejection Remark"
            value={rejectRemark}
            onChange={(e) => setRejectRemark(e.target.value)}
            multiline
            minRows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setRejectDialogOpen(false)}
            variant="outlined"
            disabled={rejectLoading}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            disabled={rejectLoading || !rejectRemark.trim()}
            onClick={handleConfirmReject}
            startIcon={
              rejectLoading ? <CircularProgress size={16} /> : <Cancel />
            }
          >
            {rejectLoading ? "Rejecting..." : "Reject"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}