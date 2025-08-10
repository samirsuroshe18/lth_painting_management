import { useEffect, useState } from "react";
import { getAllStates, addState, updateState } from "../../api/stateApi";
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
  Card,
  CardContent,
  Chip,
  Fab,
  TextField,
  InputAdornment,
  useMediaQuery,
  useTheme,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  DriveFileRenameOutline as EditIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Refresh,
  Cancel,
  Close as CloseIcon,
} from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";

const StateMaster = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // UI state
  const [states, setStates] = useState([]);
  const [rows, setRows] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // modal & form state
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editStateId, setEditStateId] = useState(null);
  const [stateName, setStateName] = useState("");
  const [status, setStatus] = useState(null); // boolean now
  const [submitLoading, setSubmitLoading] = useState(false);

  // pagination model for DataGrid (server-side style)
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 5,
  });

  // initial load
  useEffect(() => {
    fetchStates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // re-fetch on pagination change
  useEffect(() => {
    fetchStates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginationModel]);

  // when search changes: if not on page 0 -> reset to page 0; else fetch
  useEffect(() => {
    if (paginationModel.page === 0) {
      fetchStates();
    } else {
      setPaginationModel((prev) => ({ ...prev, page: 0 }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const fetchStates = async () => {
    try {
      setLoading(true);
      const result = await getAllStates({
        page: paginationModel.page + 1, // api expect 1-based
        limit: paginationModel.pageSize,
        search: searchTerm,
      });

      // adjust depending on your API — this assumes result.data is array
      const apiStates = result?.data || [];
      let filteredStates = apiStates;

      if (searchTerm) {
        filteredStates = apiStates.filter((s) =>
          s.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // if API already paginates, remove client-side slice below
      const startIndex = paginationModel.page * paginationModel.pageSize;
      const paginatedStates = filteredStates.slice(
        startIndex,
        startIndex + paginationModel.pageSize
      );

      const statesWithIds = paginatedStates.map((state, index) => ({
        ...state,
        id: state._id ?? index, // DataGrid needs id
        srNo: startIndex + index + 1,
      }));

      setRows(statesWithIds);
      setRowCount(filteredStates.length);
      setStates(statesWithIds);
    } catch (error) {
      console.error("Error fetching states:", error);
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

  // submit add / update
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
        await updateState(editStateId, {
          name: stateName,
          status: status, // boolean
        });
        dispatch(
          showNotificationWithTimeout({
            show: true,
            type: "success",
            message: "State updated successfully",
          })
        );
      } else {
        await addState({
          name: stateName,
          status: status, // boolean
        });
        dispatch(
          showNotificationWithTimeout({
            show: true,
            type: "success",
            message: "State added successfully",
          })
        );
      }

      handleCloseModal();
      fetchStates();
    } catch (error) {
      console.error("Error submit state:", error);
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
    setStateName(state.name ?? "");
    setStatus(!!state.status); // convert to boolean (works if backend returns true/false)
    setEditStateId(state._id);
    setEditMode(true);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditMode(false);
    setStateName("");
    setStatus(null);
    setEditStateId(null);
  };

  const handleCreateClick = () => {
    setShowModal(true);
    setEditMode(false);
    setStateName("");
    setStatus(null);
  };

  const handleRefresh = () => fetchStates();

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
          px: 0.5,
        }}
      >
        <Tooltip title="Edit State">
          <IconButton
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
        </Tooltip>
      </Box>
    ),
  },
];


  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header card */}
      <Card elevation={2}>
        <CardContent>
          <Grid container alignItems="center" justifyContent="space-between" spacing={2}>
            <Grid item>
              <Typography variant="h4" fontWeight={700} color="primary">
                State Management
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage and monitor all states in the system
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

                <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateClick}>
                  Add State
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Search & chips */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search states by name..."
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
                      <IconButton size="small" onClick={() => setSearchTerm("")} edge="end">
                        <Cancel fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Box display="flex" gap={1} justifyContent="flex-end">
                <Chip label={`${rowCount} states`} color="primary" variant="outlined" />
                {loading && (
                  <Chip
                    icon={<CircularProgress size={14} color="inherit" />}
                    label="Loading..."
                    color="info"
                    variant="outlined"
                    sx={{
                      px: 1.5,
                      fontWeight: 500,
                      backgroundColor: "rgba(0, 123, 255, 0.08)",
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

      {/* DataGrid */}
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
            getRowId={(row) => row.id}
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

      {/* Mobile FAB */}
      {isMobile && (
        <Fab color="primary" aria-label="add" onClick={handleCreateClick} sx={{ position: "fixed", bottom: 46, right: 36 }}>
          <AddIcon />
        </Fab>
      )}

      {/* Add/Edit Dialog */}
<Dialog
  open={showModal}
  onClose={handleCloseModal}
  maxWidth="sm"
  fullWidth
  slotProps={{
    backdrop: {
      sx: {
        backdropFilter: 'blur(5px)',
        backgroundColor: 'rgba(0,0,0,0.3)', // optional tint
      }
    }
  }}
>
  <DialogTitle>
    <Box display="flex" alignItems="center" justifyContent="space-between">
      <Typography variant="h6">
        {editMode ? "Edit State" : "Add New State"}
      </Typography>
      <IconButton onClick={handleCloseModal} size="small" disabled={submitLoading}>
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
      <Button onClick={handleCloseModal} variant="outlined" disabled={submitLoading}>
        Cancel
      </Button>
      <Button
        type="submit"
        variant="contained"
        disabled={submitLoading}
        startIcon={submitLoading ? <CircularProgress size={16} /> : null}
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

    </Container>
  );
};

export default StateMaster;
