import { useEffect, useState } from "react";
import {
  getAllArea,
  addArea,
  updateArea,
  deleteArea,
} from "../../api/areaApi";
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
import { handleAxiosError } from "../../utils/handleAxiosError";

const AreaMaster = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editAreaId, setEditAreaId] = useState(null);
  const [areaName, setAreaName] = useState("");
  const [status, setStatus] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [areaToDelete, setAreaToDelete] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [filteredRows, setFilteredRows] = useState([]);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 5,
  });

  useEffect(() => {
    fetchAreas();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, rows]);

  const fetchAreas = async () => {
    try {
      setLoading(true);
      const result = await getAllArea();
      const areaWithIds = result.data.map((area, index) => ({
        ...area,
        id: area._id ?? index,
      }));

      setRows(areaWithIds);
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

    if (!areaName || status === null) {
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
        const result = await updateArea(editAreaId, {
          name: areaName,
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
            message: "Area updated successfully",
          })
        );
      } else {
        const result = await addArea({
          name: areaName,
          status: status,
        });

        const data = result.data;
        data.id = data._id;
        setFilteredRows([data, ...filteredRows]);

        dispatch(
          showNotificationWithTimeout({
            show: true,
            type: "success",
            message: "Area added successfully",
          })
        );
      }

      handleCloseModal();
    } catch (error) {
      dispatch(
        showNotificationWithTimeout({
          show: true,
          type: "error",
          message: handleAxiosError(error),
        })
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEditClick = (area) => {
    setAreaName(area?.name ?? "");
    setStatus(!!area.status);
    setEditAreaId(area._id);
    setEditMode(true);
    setShowDialog(true);
  };

  const handleDeleteClick = (user) => {
    setAreaToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!areaToDelete) return;

    try {
      setDeleteLoading(true);
      const result = await deleteArea(areaToDelete.id);

      if (result.success) {
        setRows((prev) => prev.filter((item) => item.id !== areaToDelete.id));

        dispatch(
          showNotificationWithTimeout({
            show: true,
            type: "success",
            message: "Area deleted successfully",
          })
        );
      } else {
        dispatch(
          showNotificationWithTimeout({
            show: true,
            type: "error",
            message: "Failed to delete city",
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
      setAreaToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setAreaToDelete(null);
  };

  const handleCloseModal = () => {
    setShowDialog(false);
    setEditMode(false);
    setAreaName("");
    setStatus(null);
    setEditAreaId(null);
  };

  const handleCreateClick = () => {
    setShowDialog(true);
    setEditMode(false);
    setAreaName("");
    setStatus(true);
  };

  const handleRefresh = () => {
    fetchAreas();
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
      width: 110,
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
      headerName: "Area Name",
      flex: 3,
      minWidth: 150,
      sortable: false,
      filterable: false,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1, // equal width
      minWidth: 130,
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
      flex: 2, // equal width
      minWidth: 140,
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
            gap: 3,
          }}
        >
          <IconButton
            title="Edit Area"
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
            title="Delete Area"
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
            Area Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage and monitor all area in the system
          </Typography>
        </Grid>
      </Grid>

      {/* Search & Filter Card */}
      <Grid container spacing={2} sx={{ mt: 4 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            fullWidth
            placeholder="Search area by name..."
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
              Add Area
            </Button>
          </Stack>
        </Grid>
      </Grid>

      {/* DataGrid */}
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
                {editMode ? "Edit Area" : "Add New Area"}
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
                  label="Area Name"
                  value={areaName}
                  onChange={(e) => setAreaName(e.target.value)}
                  placeholder="Enter area name"
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
                    : "Add Area"}
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
              Delete Area
            </Box>
          </DialogTitle>
          <DialogContent>
            <Alert severity="warning" sx={{ mb: 2 }}>
              This action cannot be undone. The area will be permanently
              removed from the system.
            </Alert>
            <Typography>
              Are you sure you want to delete area{" "}
              <strong>"{areaToDelete?.name}"</strong>?
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

export default AreaMaster;