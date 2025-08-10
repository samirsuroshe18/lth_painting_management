import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllUsers } from "../../api/userApi";
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
} from "@mui/material";
import {
  DriveFileRenameOutline as EditIcon,
  VpnKey as VpnKeyIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Refresh,
  Cancel,
} from "@mui/icons-material";

const UserMaster = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [users, setUsers] = useState([]);
  const [rows, setRows] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // pagination model for DataGrid
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 5,
  });

  // initial load
  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // re-fetch on pagination change
  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginationModel]);

  // when search changes: if not on page 0 -> reset to page 0; else fetch
  useEffect(() => {
    if (paginationModel.page === 0) {
      fetchUsers();
    } else {
      setPaginationModel((prev) => ({ ...prev, page: 0 }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getAllUsers();
      const apiUsers = response?.data || [];
      
      let filteredUsers = apiUsers;

      if (searchTerm) {
        filteredUsers = apiUsers.filter((user) =>
          user.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.role.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Client-side pagination
      const startIndex = paginationModel.page * paginationModel.pageSize;
      const paginatedUsers = filteredUsers.slice(
        startIndex,
        startIndex + paginationModel.pageSize
      );

      const usersWithIds = paginatedUsers.map((user, index) => ({
        id: user._id,
        srNo: startIndex + index + 1,
        userName: user.userName,
        email: user.email,
        role: user.role,
        lastLogin: user.lastLogin
          ? new Date(user.lastLogin).toLocaleString()
          : "Never",
      }));

      setRows(usersWithIds);
      setRowCount(filteredUsers.length);
      setUsers(usersWithIds);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = () => {
    navigate("/masters/add-user");
  };

  const handleEditUser = (userId) => {
    navigate(`/masters/edit-user/${userId}`);
  };

  const handleEditRights = (userId) => {
    navigate(`/edit-rights/${userId}`);
  };

  const handleRefresh = () => fetchUsers();

  const columns = [
    {
      field: "srNo",
      headerName: "Sr. No",
      flex: 1,
      minWidth: 100,
      sortable: false,
      filterable: false,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "userName",
      headerName: "Username",
      flex: 1,
      minWidth: 100,
      sortable: false,
      filterable: false,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
      minWidth: 100,
      sortable: false,
      filterable: false,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "role",
      headerName: "Role",
      flex: 1,
      minWidth: 100,
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
      minWidth: 100,
      sortable: false,
      filterable: false,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
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
            px: 0.5,
          }}
        >
          <Tooltip title="Edit User">
            <IconButton
              size="small"
              color="warning"
              onClick={(e) => {
                e.stopPropagation();
                handleEditUser(params.row.id);
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
                  handleEditRights(params.row.id);
                }}
                sx={{ p: 0.5 }}
              >
                <VpnKeyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
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
                User Management
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage and monitor all users in the system
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
                  onClick={handleAddUser}
                  sx={{ textTransform: "none" }}
                >
                  Add New User
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
                placeholder="Search users by username, email or role..."
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
                  label={`${rowCount} users`} 
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
            paginationMode="client"
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
        <Fab 
          color="primary" 
          aria-label="add" 
          onClick={handleAddUser}
          sx={{ position: "fixed", bottom: 46, right: 36 }}
        >
          <AddIcon />
        </Fab>
      )}
    </Container>
  );
};

export default UserMaster;