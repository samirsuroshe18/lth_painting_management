import { useEffect, useRef, useState } from "react";
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
  Container,
  Grid,
  Card,
  CardContent,
  Chip,
  Fab,
  TextField,
  InputAdornment,
  Alert,
  useMediaQuery,
  useTheme,
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
import { getAssets, removeAsset } from "../../api/assetMasterApi";
import { showNotificationWithTimeout } from "../../redux/slices/notificationSlice";
import { handleAxiosError } from "../../utils/handleAxiosError";
import { useNavigate } from "react-router-dom";

export default function AssetMaster() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // ---------------------------
  // Local UI state
  // ---------------------------
  const [assets, setAssets] = useState([]); // local copy of current page assets (convenience)
  const [rows, setRows] = useState([]); // DataGrid rows (server-paginated)
  const [rowCount, setRowCount] = useState(0); // total items available on server
  const [loading, setLoading] = useState(true); // loading flag for grid + UI
  const [deleteLoading, setDeleteLoading] = useState(false); // loading flag for delete button
  const [searchTerm, setSearchTerm] = useState(""); // search input value

  // Dialog & selection state
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [selectedQr, setSelectedQr] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState(null);

  // ---------------------------
  // Server-side pagination model
  // page is 0-based; we pass +1 to the API
  // ---------------------------
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 5,
  });

  // ---------------------------
  // Data fetching
  // ---------------------------

  // Initial load
  useEffect(() => {
    fetchAssets();
  }, []);

  // Re-fetch when user changes page or pageSize
  useEffect(() => {
    fetchAssets();
  }, [paginationModel]);

  // When search changes:
  // - If already on page 0, fetch with new filter
  // - Else, reset to page 0 (which triggers fetch via the effect above)
  useEffect(() => {
    if (paginationModel.page === 0) {
      fetchAssets();
    } else {
      setPaginationModel((prev) => ({ ...prev, page: 0 }));
    }
  }, [searchTerm]);

  // Fetch assets for current page/pageSize/search
  const fetchAssets = async () => {
    try {
      setLoading(true);

      const response = await getAssets({
        page: paginationModel.page + 1, // API expects 1-based page
        limit: paginationModel.pageSize,
        search: searchTerm,
      });

      // Api response
      const apiAssets = response?.data?.assets ?? [];

      // Normalize rows for DataGrid:
      // - Ensure each row has an 'id'
      // - Add a serial number based on current page
      const assetsWithIds = apiAssets.map((asset, index) => ({
        ...asset,
        id: asset._id,
        srNo: paginationModel.page * paginationModel.pageSize + index + 1,
      }));

      // Provide rows to the grid
      setRows(assetsWithIds);

      // Provide total count to the grid's pager
      setRowCount(response?.data?.pagination?.totalEntries ?? 0);

      // Keep a local copy (handy for optimistic updates)
      setAssets(assetsWithIds);
    } catch (error) {
      // Centralized error toast
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

  // ---------------------------
  // Action handlers
  // ---------------------------

  // Navigate to create screen
  const handleCreateClick = () => navigate("new");

  // Stubbed approve action
  const handleApprove = (assetId) => {
    dispatch(
      showNotificationWithTimeout({
        show: true,
        type: "success",
        message: "Asset approved successfully",
      })
    );
  };

  // Stubbed reject action
  const handleReject = (assetId) => {
    dispatch(
      showNotificationWithTimeout({
        show: true,
        type: "info",
        message: "Asset rejected",
      })
    );
  };

  // Navigate to edit screen
  const handleEdit = (row) => navigate("edit-asset", { state: { asset: row } });

  // Navigate to read-only edit screen (view details)
  const handleView = (row) =>
    navigate("edit-asset", { state: { asset: row, read: true } });

  // Delete handler:
  // - Optimistically update
  // - If page becomes empty and not first page, go to previous page
  // - Else, refetch current page
  const handleDelete = async () => {
    if (!assetToDelete) return;

    try {
      setDeleteLoading(true);
      const response = await removeAsset(assetToDelete.id);

      if (response.success) {
        // Optimistic removal from local copy
        setAssets((prev) => prev.filter((a) => a.id !== assetToDelete.id));

        // If we removed the last item on this page (and not on page 0) → step back a page
        const isLastItemOnPage = rows.length <= 1 && paginationModel.page > 0;
        if (isLastItemOnPage) {
          setPaginationModel((prev) => ({ ...prev, page: prev.page - 1 }));
        } else {
          // Otherwise just refetch the current page
          await fetchAssets();
        }

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

  // Navigate to audit log screen
  const handleHistory = (assetId) =>
    navigate("log-history", { state: { assetId } });

  // Manual refresh (refetch current page)
  const handleRefresh = () => fetchAssets();

  // ---------------------------
  // DataGrid columns (sorting/filtering disabled per column)
  // ---------------------------
  const columns = [
    {
      field: "srNo",
      headerName: "Sr. No",
      width: 80,
      sortable: false,
      filterable: false,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "name",
      headerName: "Asset Name",
      width: 230,
      sortable: false,
      filterable: false,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "locationId",
      headerName: "Location",
      width: 150,
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
      field: "place",
      headerName: "Place",
      width: 140,
      sortable: false,
      filterable: false,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
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
      width: 150,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => {
        const status = params.value;
        const map = {
          pending: { color: "warning", label: "Pending" },
          approved: { color: "success", label: "Approved" },
          rejected: { color: "error", label: "Rejected" },
        };
        const cfg = map[status] || { color: "default", label: status };
        return (
          <Chip
            label={cfg.label}
            size="small"
            color={cfg.color}
            variant="outlined"
          />
        );
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 280,
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
          {params.row.reviewStatus === "pending" && (
            <>
              <Tooltip title="Approve">
                <IconButton
                  size="small"
                  color="success"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleApprove(params.row.id);
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
                    handleReject(params.row.id);
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
      {/* Header card with title + actions */}
      <Card elevation={2}>
        <CardContent>
          <Grid
            container
            alignItems="center"
            justifyContent="space-between"
            spacing={2}
          >
            <Grid item>
              <Typography variant="h4" fontWeight={700} color="primary">
                Asset Management
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage and monitor all painting assets in the system
              </Typography>
            </Grid>

            <Grid item>
              <Box display="flex" gap={1} flexWrap="wrap">
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
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Search & total chips */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search assets by name, artist, place, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                variant="outlined"
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setSearchTerm("")}
                        edge="end"
                      >
                        <Cancel fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Box display="flex" gap={1} justifyContent="flex-end">
                <Chip
                  label={`${rowCount} assets`}
                  color="primary"
                  variant="outlined"
                />
                {loading && (
                  <Chip
                    icon={<CircularProgress size={14} color="inherit" />}
                    label="Loading..."
                    color="info"
                    variant="outlined"
                    sx={{
                      px: 1.5,
                      fontWeight: 500,
                      backgroundColor: "rgba(0, 123, 255, 0.08)", // light info color background
                      borderRadius: "16px",
                      ".MuiChip-icon": { marginLeft: "4px" },
                    }}
                  />
                )}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Server-side paginated DataGrid */}
      <Card sx={{ mt: 3 }}>
        <Box sx={{ height: 380, width: "100%" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[5, 10, 25, 50]}
            pagination
            paginationMode="server"
            rowCount={rowCount}
            loading={loading}
            disableRowSelectionOnClick
            rowHeight={60}
            headerHeight={50}
            componentsProps={{
              toolbar: {
                showQuickFilter: false,
                printOptions: { disableToolbarButton: true },
                csvOptions: { disableToolbarButton: true },
              },
            }}
          />
        </Box>
      </Card>

      {/* Mobile FAB for quick add */}
      {isMobile && (
        <Fab
          color="primary"
          aria-label="add"
          onClick={handleCreateClick}
          sx={{ position: "fixed", bottom: 46, right: 36 }}
        >
          <AddIcon />
        </Fab>
      )}

      {/* QR Code dialog */}
      <Dialog
        open={qrDialogOpen}
        onClose={() => setQrDialogOpen(false)}
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
        onClose={() => setDeleteDialogOpen(false)}
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
    </Container>
  );
}
