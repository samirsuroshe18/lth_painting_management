import { useEffect, useState } from "react";
import {
  getAllStates,
  addState,
  updateState,
  deleteState,
} from "../../api/stateApi";
import { useDispatch } from "react-redux";
import { showNotificationWithTimeout } from "../../redux/slices/notificationSlice";
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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Stack,
  Alert,
} from "@mui/material";
import {
  DriveFileRenameOutline as EditIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Refresh,
  Cancel,
  Close as CloseIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";

const StateMaster = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editStateId, setEditStateId] = useState(null);
  const [stateName, setStateName] = useState("");
  const [status, setStatus] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [stateToDelete, setStateToDelete] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [filteredRows, setFilteredRows] = useState([]);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 5,
  });

  useEffect(() => {
    fetchStates();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, rows]);

  const fetchStates = async () => {
    try {
      setLoading(true);
      const result = await getAllStates();
      const statesWithIds = result.data.map((state, index) => ({
        ...state,
        id: state._id ?? index,
      }));

      setRows(statesWithIds);
    } catch (error) {
      setRows([]);
      dispatch(
        showNotificationWithTimeout({
          show: true,
          type: "error",
          message: "Failed to fetch states",
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
        const assetName = (asset.name || "").toLowerCase();
        const locationName = (asset.locationId?.name || "").toLowerCase();

        return (
          assetName.includes(searchLower) || locationName.includes(searchLower)
        );
      });
    }

    setFilteredRows(filtered);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stateName || status === null) {
      dispatch(
        showNotificationWithTimeout({
          show: true,
          type: "error",
          message: "Please fill in all fields.",
        })
      );
      return;
    }

    try {
      setSubmitLoading(true);

      if (editMode) {
        const result = await updateState(editStateId, {
          name: stateName,
          status,
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
            message: "State updated successfully",
          })
        );
      } else {
        const result = await addState({
          name: stateName,
          status: status,
        });

        const data = result.data;
        data.id = data._id;
        setFilteredRows([data, ...filteredRows]);

        dispatch(
          showNotificationWithTimeout({
            show: true,
            type: "success",
            message: "State added successfully",
          })
        );
      }

      handleCloseModal();
    } catch (error) {
      dispatch(
        showNotificationWithTimeout({
          show: true,
          type: "error",
          message: editMode ? "Failed to update state" : "Failed to add state",
        })
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEditClick = (state) => {
    setStateName(state?.name ?? "");
    setStatus(!!state.status);
    setEditStateId(state._id);
    setEditMode(true);
    setShowDialog(true);
  };

  const handleDeleteClick = (user) => {
    setStateToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!stateToDelete) return;

    try {
      setDeleteLoading(true);
      const result = await deleteState(stateToDelete.id);

      if (result.success) {
        setRows((prev) => prev.filter((item) => item.id !== stateToDelete.id));

        dispatch(
          showNotificationWithTimeout({
            show: true,
            type: "success",
            message: "State deleted successfully",
          })
        );
      } else {
        dispatch(
          showNotificationWithTimeout({
            show: true,
            type: "error",
            message: "Failed to delete state",
          })
        );
      }
    } catch (error) {
      dispatch(
        showNotificationWithTimeout({
          show: true,
          type: "error",
          message: "Something went wrong while deleting",
        })
      );
    } finally {
      setDeleteLoading(false);
      setDeleteDialogOpen(false);
      setStateToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setStateToDelete(null);
  };

  const handleCloseModal = () => {
    setShowDialog(false);
    setEditMode(false);
    setStateName("");
    setStatus(null);
    setEditStateId(null);
  };

  const handleCreateClick = () => {
    setShowDialog(true);
    setEditMode(false);
    setStateName("");
    setStatus(true);
  };

  const handleRefresh = () => {
    fetchStates();
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const columns = [
    {
      field: "srNo",
      headerName: "Sr. No",
      flex: 1, // equal width
      minWidth: 100,
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
      headerName: "State Name",
      flex: 1, // equal width
      minWidth: 100,
      sortable: false,
      filterable: false,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1, // equal width
      minWidth: 100,
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
      field: "actions",
      headerName: "Actions",
      flex: 1, // equal width
      minWidth: 100,
      sortable: false,
      filterable: false,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <Box
          sx={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
          }}
        >
          <IconButton
            title="Edit State"
            size="small"
            color="warning"
            onClick={(e) => {
              e.stopPropagation();
              handleEditClick(params.row);
            }}
            sx={{ p: 0.5 }}
          >
            <EditIcon fontSize="small" />
          </IconButton>

          <IconButton
            size="small"
            color="error"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(params.row);
            }}
            title="Delete State"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
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
            State Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage and monitor all states in the system
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
              Add State
            </Button>
          </Stack>
        </Grid>
      </Grid>

      {/* DataGrid */}
      <Box sx={{ height: 400, width: "100%", mt: 3 }}>
        <DataGrid
          rows={filteredRows}
          columns={columns}
          disableRowSelectionOnClick
          loading={loading}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[5, 10, 25, 50]}
        />
      </Box>

      {/* Add/Edit Dialog */}
      {showDialog && (
        <Dialog
          open={showDialog}
          onClose={handleCloseModal}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography variant="h6">
                {editMode ? "Edit State" : "Add New State"}
              </Typography>
              <IconButton
                onClick={handleCloseModal}
                size="small"
                disabled={submitLoading}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>

          <form onSubmit={handleSubmit}>
            <DialogContent>
              <Box display="flex" flexDirection="column" gap={3} pt={1}>
                <TextField
                  fullWidth
                  label="State Name"
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  placeholder="Enter state name"
                  variant="outlined"
                  required
                  disabled={submitLoading}
                />

                <FormControl fullWidth required disabled={submitLoading}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={status === null ? "" : String(status)}
                    onChange={(e) => setStatus(e.target.value === "true")}
                    label="Status"
                  >
                    <MenuItem value="">Select status</MenuItem>
                    <MenuItem value="true">Active</MenuItem>
                    <MenuItem value="false">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button
                onClick={handleCloseModal}
                variant="outlined"
                disabled={submitLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={submitLoading}
                startIcon={
                  submitLoading ? <CircularProgress size={16} /> : null
                }
              >
                {submitLoading
                  ? editMode
                    ? "Updating..."
                    : "Adding..."
                  : editMode
                    ? "Update"
                    : "Add State"}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      )}

      {/* Delete confirmation dialog */}
      {deleteDialogOpen && (
        <Dialog
          open={deleteDialogOpen}
          onClose={handleCancelDelete}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle color="error" sx={{ pb: 1 }}>
            <Box display="flex" alignItems="center" gap={1}>
              <DeleteIcon />
              Delete State
            </Box>
          </DialogTitle>
          <DialogContent>
            <Alert severity="warning" sx={{ mb: 2 }}>
              This action cannot be undone. The state will be permanently
              removed from the system.
            </Alert>
            <Typography>
              Are you sure you want to delete state{" "}
              <strong>"{stateToDelete?.name}"</strong>?
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              onClick={handleCancelDelete}
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
      )}
    </Container>
  );
};

export default StateMaster;