import { Fragment, useEffect, useState } from "react";
import {
  IconButton,
  Box,
  Button,
  Typography,
  CircularProgress,
  Container,
  Grid,
  Chip,
  TextField,
  InputAdornment,
  Autocomplete,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  DialogActions,
  Alert,
} from "@mui/material";
import {
  Cancel,
  Add as AddIcon,
  Search as SearchIcon,
  Refresh,
  Edit as EditIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  AddLocationAlt,
} from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllLocations,
  addLocation,
  updateLocation,
  deleteLocation,
  addLocationToSuperAdmin,
} from "../../api/locationApi";
import { getAllStates } from "../../api/stateApi";
import { showNotificationWithTimeout } from "../../redux/slices/notificationSlice";
import { handleAxiosError } from "../../utils/handleAxiosError";

const LocationMaster = () => {
  const userData = useSelector((state) => state.auth.userData?.user);
  const usersLocation = userData?.location || [];
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editLocationId, setEditLocationId] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [filteredRows, setFilteredRows] = useState([]);
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const [stateLoading, setStateLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    area: "",
    stateId: {},
    status: "",
  });
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 5,
  });

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, rows]);

  const fetchLocations = async () => {
    try {
      setLoading(true);

      const result = await getAllLocations();
      const locationssWithIds = result.data.map((location, index) => ({
        ...location,
        hasAccess: usersLocation.some(userLoc => userLoc._id === location._id),
        id: location?._id ?? index,
      }));

      setRows(locationssWithIds);
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

      filtered = filtered.filter((location) => {
        const locationName = (location.name || "").toLowerCase();

        return locationName.includes(searchLower);
      });
    }

    setFilteredRows(filtered);
  };

  const handleOpen = () => {
    setOpen(true);
    (async () => {
      try {
        setStateLoading(true);
        const res = await getAllStates();
        const activeStates = (res?.data ?? []).filter(
          (state) => state.status === true
        );
        setOptions(activeStates);
      } catch (error) {
        setOptions([]);
        dispatch(
          showNotificationWithTimeout({
            show: true,
            type: "error",
            message: handleAxiosError(error),
          })
        );
      } finally {
        setStateLoading(false);
      }
    })();
  };

  const handleClose = () => {
    setOpen(false);
    setOptions([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitLoading(true);

      if (editMode) {
        let payload = { ...formData, state: formData.stateId?._id };
        const result = await updateLocation(editLocationId, payload);

        const data = result.data;
        data.id = data._id;
        setFilteredRows((prev) =>
          prev.map((item) => (item.id === data.id ? data : item))
        );

        dispatch(
          showNotificationWithTimeout({
            show: true,
            type: "success",
            message: "Location updated successfully",
          })
        );
      } else {
        let payload = { ...formData, state: formData.stateId?._id };
        const result = await addLocation(payload);

        const data = result.data;
        data.id = data._id;
        setFilteredRows([data, ...filteredRows]);

        dispatch(
          showNotificationWithTimeout({
            show: true,
            type: "success",
            message: "Location added successfully",
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

  const handleCreateClick = () => {
    setShowDialog(true);
    setEditMode(false);
    setFormData((prev) => ({ ...prev, status: true }));
  };

  const handleEditClick = (location) => {
    setEditMode(true);
    setFormData(location);
    setEditLocationId(location._id);
    setShowDialog(true);
  };
  
  const handleRequestAccess = async (location) => {
    try {
      const result = await addLocationToSuperAdmin(location._id);
      if (result.success) {
        setRows((prev) =>
          prev.map((item) =>
            item.id === location.id ? { ...item, hasAccess: true } : item
          )
        );

        dispatch(
          showNotificationWithTimeout({
            show: true,
            type: "success",
            message: "Access to location granted successfully",
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
    }
  };

  const handleDeleteClick = (location) => {
    setLocationToDelete(location);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!locationToDelete) return;

    try {
      setDeleteLoading(true);
      const result = await deleteLocation(locationToDelete.id);

      if (result.success) {
        setRows((prev) =>
          prev.filter((item) => item.id !== locationToDelete.id)
        );

        dispatch(
          showNotificationWithTimeout({
            show: true,
            type: "success",
            message: "Location deleted successfully",
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
      setLocationToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setLocationToDelete(null);
  };

  const handleCloseModal = () => {
    setShowDialog(false);
    setEditMode(false);
    setEditLocationId(null);
    setFormData({
      name: "",
      area: "",
      stateId: null,
      status: null,
    });
  };

  const handleRefresh = () => {
    fetchLocations();
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const handleSearchChange = (e) => {
    setSearchTerm("");
    setSearchTerm(e.target.value);
  };

  // Columns (no change)
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
      headerName: "Location Name",
      flex: 1,
      minWidth: 220,
      align: "center",
      headerAlign: "center",
      sortable: false,
      filterable: false,
    },
    {
      field: "state",
      headerName: "State",
      flex: 1,
      minWidth: 140,
      align: "center",
      headerAlign: "center",
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Chip
          label={params.row.stateId?.name || "-"}
          size="small"
          variant="outlined"
          color="primary"
        />
      ),
    },
    {
      field: "area",
      headerName: "Area",
      flex: 1,
      minWidth: 220,
      align: "center",
      headerAlign: "center",
      sortable: false,
      filterable: false,
    },
    {
      field: "status",
      headerName: "Status",
      width: 140,
      align: "center",
      headerAlign: "center",
      sortable: false,
      filterable: false,
      renderCell: (params) => (
          <Chip
            label={
              !params.row?.hasAccess && userData?.role == "superadmin"
                ? "Not Added"
                : params.value
                  ? "Active"
                  : "Inactive"
            }
            size="small"
            color={
              !params.row?.hasAccess && userData?.role == "superadmin"
                ? "warning"
                : params.value
                  ? "success"
                  : "default"
            }
            variant={params.value ? "filled" : "outlined"}
          />
        ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      align: "center",
      headerAlign: "center",
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box
          sx={{
            display: "flex",
            gap: 0.5,
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          {!params.row?.hasAccess && userData?.role == "superadmin" ? (
            <IconButton
              size="small"
              color="warning"
              onClick={(e) => {
                e.stopPropagation();
                handleRequestAccess(params.row);
              }}
              title="You don’t have access. Click to request."
            >
              <AddLocationAlt fontSize="small" />
            </IconButton>
          ) : (
            <>
              <IconButton
                size="small"
                color="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditClick(params.row);
                }}
                title="Edit Location"
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
                title="Delete Location"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </>
          )}
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
            Location Master
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage and monitor all locations in the system
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
              Add Location
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
                {editMode ? "Edit Location" : "Add New Location"}
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
                  label="Location Name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Enter location name"
                  variant="outlined"
                  required
                  disabled={submitLoading}
                />

                <TextField
                  fullWidth
                  label="Area"
                  value={formData.area}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, area: e.target.value }))
                  }
                  placeholder="Enter area name"
                  variant="outlined"
                  required
                  disabled={submitLoading}
                />

                <Autocomplete
                  open={open}
                  onOpen={handleOpen}
                  onClose={handleClose}
                  value={formData?.stateId}
                  loading={stateLoading}
                  options={options}
                  getOptionLabel={(option) => option?.name || ""}
                  onChange={(e, newValue) =>
                    setFormData((prev) => ({
                      ...prev,
                      stateId: newValue || {}, // keep only _id in state
                    }))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="State"
                      placeholder="search state.."
                      required
                      slotProps={{
                        input: {
                          ...params.InputProps,
                          endAdornment: (
                            <Fragment>
                              {stateLoading ? (
                                <CircularProgress color="inherit" size={20} />
                              ) : null}
                              {params.InputProps.endAdornment}
                            </Fragment>
                          ),
                        },
                      }}
                    />
                  )}
                />

                <FormControl fullWidth required disabled={submitLoading}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        status: e.target.value,
                      }))
                    }
                    label="Status"
                  >
                    <MenuItem value="">Select status</MenuItem>
                    <MenuItem value={true}>Active</MenuItem>
                    <MenuItem value={false}>Inactive</MenuItem>
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
                    : "Add Location"}
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
              Delete Location
            </Box>
          </DialogTitle>
          <DialogContent>
            <Alert severity="warning" sx={{ mb: 2 }}>
              This action cannot be undone. The location will be permanently
              removed from the system.
            </Alert>
            <Typography>
              Are you sure you want to delete location{" "}
              <strong>"{locationToDelete?.name}"</strong>?
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

export default LocationMaster;