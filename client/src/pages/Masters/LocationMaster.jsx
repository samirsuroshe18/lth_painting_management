import React, { useEffect, useState } from "react";
import {
  getAllLocations,
  addLocation,
  updateLocation,
} from "../../api/locationApi";
import { getAllStates } from "../../api/stateApi";
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
import { useDispatch } from "react-redux";
import { showNotificationWithTimeout } from "../../redux/slices/notificationSlice";
import { handleAxiosError } from "../../utils/handleAxiosError";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronLeft } from "react-icons/fa";

const LocationMaster = () => {
  const [states, setStates] = useState([]);
  const [locationName, setLocationName] = useState("");
  const [selectedStates, setSelectedStates] = useState("");
  const [area, setArea] = useState("");
  const [status, setStatus] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editStateId, setEditStateId] = useState(null);
  const dispatch = useDispatch();
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 5,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true); // loading flag for grid + UI
  const [rows, setRows] = useState([]); // DataGrid rows (server-paginated)
  const [rowCount, setRowCount] = useState(0); // total items available on server

  const fetchData = async () => {
    try {
      setLoading(true);

      const [locResult] = await Promise.all([getAllLocations()]);

      const apiLocations = locResult?.data ?? [];

      // Apply search filter here (case-insensitive)
      const filteredLocations = apiLocations.filter((loc) => {
        const term = searchTerm.toLowerCase();
        return (
          loc.name?.toLowerCase().includes(term) ||
          loc.stateId?.name?.toLowerCase().includes(term) ||
          loc.area?.toLowerCase().includes(term)
        );
      });

      // Map filtered data
      const locationRows = filteredLocations.map((location, index) => ({
        srNo: index + 1,
        id: location._id || index,
        name: location.name,
        area: location.area,
        stateId: location.stateId?._id,
        stateName: location.stateId?.name,
        status: location.status,
      }));

      setRows(locationRows);
      setRowCount(locationRows.length);
    } catch (error) {
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

  // Re-fetch when user changes page or pageSize
  useEffect(() => {
    if (paginationModel.page !== 0) {
      setPaginationModel((prev) => ({ ...prev, page: 0 }));
    } else {
      fetchData();
    }
  }, [paginationModel, searchTerm]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!locationName || !status) {
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
      console.log("Submitting location:", {
        name: locationName,
        state: selectedStates,
        area: area,
        status: status,
      });
      if (editMode) {
        await updateLocation(editStateId, {
          name: locationName,
          state: selectedStates,
          area: area,
          status: status,
        });

        dispatch(
          showNotificationWithTimeout({
            show: true,
            type: "success",
            message: "State updated successfully",
          })
        );
      } else {
        await addLocation({
          name: locationName,
          state: selectedStates,
          area: area,
          status: status,
        });

        dispatch(
          showNotificationWithTimeout({
            show: true,
            type: "success",
            message: "State added successfully",
          })
        );
      }

      setLocationName("");
      setSelectedStates("");
      setArea("");
      setStatus("");
      setEditStateId(null);
      setEditMode(false);
      setShowModal(false);
      fetchData();
    } catch (error) {
      dispatch(
        showNotificationWithTimeout({
          show: true,
          type: "error",
          message: editMode ? "Failed to update state" : "Failed to add state",
        })
      );
    }
  };

  const handleEdit = async (row) => {
  try {
    // Fetch states only when editing
    const stateResult = await getAllStates();
    setStates(stateResult?.data ?? []);

    setLocationName(row.name);
    setSelectedStates(row.stateId); // <-- Preselect by _id
    setArea(row.area);
    setStatus(row.status ? "active" : "inactive");
    setEditStateId(row.id);
    setEditMode(true);
    setShowModal(true);
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


  const handleCloseModal = () => {
    setShowModal(false);
    setEditMode(false);
    setLocationName("");
    setSelectedStates("");
    setArea("");
    setStatus("");
    setEditStateId(null);
  };

  // Manual refresh (refetch current page)
  const handleRefresh = () => {
    fetchData();
  };

  // Modal to create a new location
  const handleCreateClick = async () => {
    try {
      const stateResult = await getAllStates();
      setStates(stateResult?.data ?? []);

      setShowModal(true);
      setEditMode(false);
      setLocationName("");
      setSelectedStates("");
      setArea("");
      setStatus("");
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
      headerName: "Location Name",
      width: 230,
      sortable: false,
      filterable: false,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "stateName",
      headerName: "State",
      width: 230,
      sortable: false,
      filterable: false,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "area",
      headerName: "Area",
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
        </Box>
      ),
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Modal with Animation */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-white/30 dark:bg-black/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative bg-white dark:bg-[#1e1e1e] p-6 w-full max-w-2xl shadow-xl border border-gray-200 dark:border-gray-700 transition-colors duration-300"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <button
                onClick={handleCloseModal}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white text-xl font-bold"
                aria-label="Close"
              >
                ×
              </button>

              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
                {editMode ? "Edit Location" : "Add New Location"}
              </h2>

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={locationName}
                      onChange={(e) => setLocationName(e.target.value)}
                      placeholder="Enter Location name"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Select State */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Select State
                    </label>
                    <select
                      value={selectedStates}
                      onChange={(e) => setSelectedStates(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Choose state</option>
                      {states.map((state) => (
                        <option key={state._id} value={state._id}>
                          {state.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Area */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Area
                    </label>
                    <input
                      type="text"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      placeholder="Enter area"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                {/* Buttons - centered below the grid */}
                <div className="flex justify-center gap-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-gray-700 dark:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                  >
                    {editMode ? "Update" : "Save"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
                Location Master
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage and monitor all Locations in the system
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
                  Add New Location
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
                placeholder="Search Location by name, state or area"
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
                  label={`${rowCount} locations found`}
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
    </Container>
  );
};

export default LocationMaster;
