import { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getAllUsers, removeUser } from "../../api/userApi";
import { DataGrid } from "@mui/x-data-grid";
import {
  Box,
  Button,
  IconButton,
  Tooltip,
  Chip,
  Typography,
  TextField,
  Container,
  Grid,
  Card,
  CardContent,
  InputAdornment,
  useMediaQuery,
  useTheme,
  Fab,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  Alert,
  DialogActions,
  Stack,
} from "@mui/material";
import {
  DriveFileRenameOutline as EditIcon,
  VpnKey as VpnKeyIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Refresh,
  Cancel,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { useDispatch } from "react-redux";
import { showNotificationWithTimeout } from "../../redux/slices/notificationSlice";
import { handleAxiosError } from "../../utils/handleAxiosError";

const UserMaster = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [filteredRows, setFilteredRows] = useState([]);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 5,
  });

  // Initial load (once)
  useEffect(() => {
    fetchAllUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, rows]);

  const fetchAllUsers = async () => {
    try {
      setLoading(true);

      const response = await getAllUsers();
      const apiUsers = response?.data || [];
      const usersWithIds = apiUsers.map((user, index) => ({
        ...user,
        id: user?._id ?? index,
      }));

      // Provide rows to the grid
      setRows(usersWithIds);
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

      filtered = filtered.filter((user) => {
        const userName = user.userName?.toLowerCase() || "";
        const email = user.email?.toLowerCase() || "";
        const role = user.role?.toLowerCase() || "";

        return (
          userName.includes(searchLower) ||
          email.includes(searchLower) ||
          role.includes(searchLower)
        );
      });
    }

    setFilteredRows(filtered);
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  // Enhanced delete functionality
  const handleDelete = async () => {
    if (!userToDelete) return;

    try {
      setDeleteLoading(true);
      const response = await removeUser(userToDelete.id);

      if (response.success) {
        // Remove user from local state (optimistic update)
        setRows((prevRows) =>
          prevRows.filter((user) => user.id !== userToDelete.id)
        );

        dispatch(
          showNotificationWithTimeout({
            show: true,
            type: "success",
            message: "User deleted successfully",
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
      setUserToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const handleAddUser = () => navigate("add-user");

  const handleEditUser = (user) => {
    navigate("add-user", { state: { user } });
  };

  const handleEditRights = (user) => {
    if (!user || !user._id) {
      dispatch(
        showNotificationWithTimeout({
          show: true,
          type: "error",
          message: "User ID is missing",
        })
      );
      return;
    }
    navigate(`edit-rights/${user._id}`, { state: { user } });
  };

  const handleRefresh = () => {
    setSearchTerm(""); // Clear search on refresh
    fetchAllUsers();
  };

  const columns = [
    {
      headerName: "Sr. No",
      flex: 1,
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
      field: "userName",
      headerName: "Username",
      flex: 1,
      minWidth: 140,
      sortable: false,
      filterable: false,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
      minWidth: 180,
      sortable: false,
      filterable: false,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "role",
      headerName: "Role",
      flex: 1,
      minWidth: 120,
      align: "center",
      sortable: false,
      filterable: false,
      headerAlign: "center",
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={params.value === "admin" ? "primary" : "default"}
          size="small"
          variant={params.value === "admin" ? "filled" : "outlined"}
        />
      ),
    },
    {
      field: "lastLogin",
      headerName: "Last Login",
      flex: 1,
      minWidth: 160,
      sortable: false,
      filterable: false,
      align: "center",
      headerAlign: "center",
      valueGetter: (value) => {
        const dt = value ? new Date(value) : null;
        return dt
          ? dt.toLocaleString("en-IN", {
              day: "2-digit",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })
          : "-";
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      minWidth: 150,
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
            px: 0.5,
          }}
        >
          <Tooltip title="Edit User">
            <IconButton
              size="small"
              color="warning"
              onClick={(e) => {
                e.stopPropagation();
                handleEditUser(params.row);
              }}
              sx={{ p: 0.5 }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          {params.row.role !== "user" && (
            <Tooltip title="Edit Rights">
              <IconButton
                size="small"
                color="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditRights(params.row);
                }}
                sx={{ p: 0.5 }}
              >
                <VpnKeyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title="Delete User">
            <IconButton
              size="small"
              color="error"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteClick(params.row);
              }}
              sx={{ p: 0.5 }}
            >
              <DeleteIcon fontSize="small" />
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
            User Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage and monitor all users in the system
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
              onClick={handleAddUser}
            >
              Add User
            </Button>
          </Stack>
        </Grid>
      </Grid>

      {/* CLIENT-SIDE DataGrid */}
      <Box sx={{ height: 420, width: "100%", mt: 3 }}>
        <DataGrid
          rows={filteredRows}
          columns={columns}
          loading={loading}
          disableRowSelectionOnClick
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
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

      {/* Enhanced Delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle color="error" sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <DeleteIcon />
            Delete User
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action cannot be undone. The user will be permanently removed
            from the system.
          </Alert>
          <Typography>
            Are you sure you want to delete user{" "}
            <strong>"{userToDelete?.userName}"</strong>
            {userToDelete?.email && <> ({userToDelete.email})</>}?
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
    </Container>
  );
};

export default UserMaster;
