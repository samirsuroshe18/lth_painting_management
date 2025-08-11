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
import { useDispatch } from "react-redux";
import { showNotificationWithTimeout } from "../../redux/slices/notificationSlice";
import { handleAxiosError } from "../../utils/handleAxiosError";

const UserMaster = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Full dataset (unfiltered)
  const [allUsers, setAllUsers] = useState([]);
  // Paged rows displayed
  const [rows, setRows] = useState([]);
  // Total rows after filtering (for chip + DataGrid pagination)
  const [rowCount, setRowCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Client-side pagination model
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 5,
  });

  // Initial load (once)
  useEffect(() => {
    fetchAllUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAllUsers = async () => {
    try {
      setLoading(true);
      const response = await getAllUsers();
      const apiUsers = response?.data || [];
      setAllUsers(apiUsers);
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

  // Apply client-side search filter
    useEffect(() => {
      const term = (searchTerm || "").toLowerCase();
  
      const filtered = allUsers.filter((user) => {
      const u = user?.userName?.toLowerCase() || "";
      const e = user?.email?.toLowerCase() || "";
      const r = user?.role?.toLowerCase() || "";
      return u.includes(term) || e.includes(term) || r.includes(term);
    }).map((user, index) => ({
          id: user._id,
      srNo: index + 1,
      userName: user.userName,
      email: user.email,
      role: user.role,
      lastLogin: user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "Never",
        }));
  
      // Reset to first page whenever search/filter changes
      setPaginationModel((prev) => ({ ...prev, page: 0 }));
      setRows(filtered);
    }, [allUsers, searchTerm]);

  // Recompute filtered + paged rows whenever source, search, or pagination changes
  // useEffect(() => {
  //   const term = (searchTerm || "").toLowerCase();

  //   const filtered = allUsers.filter((user) => {
  //     const u = user?.userName?.toLowerCase() || "";
  //     const e = user?.email?.toLowerCase() || "";
  //     const r = user?.role?.toLowerCase() || "";
  //     return u.includes(term) || e.includes(term) || r.includes(term);
  //   });

  //   const total = filtered.length;
  //   setRowCount(total);

  //   // Ensure current page is valid after filtering
  //   const maxPage = Math.max(0, Math.ceil(total / paginationModel.pageSize) - 1);
  //   const safePage = Math.min(paginationModel.page, maxPage);

  //   if (safePage !== paginationModel.page) {
  //     // fix invalid page silently
  //     setPaginationModel((prev) => ({ ...prev, page: safePage }));
  //     return; // will rerun effect with updated page
  //   }

  //   const startIndex = safePage * paginationModel.pageSize;
  //   const slice = filtered.slice(startIndex, startIndex + paginationModel.pageSize);

  //   const rowsMapped = slice.map((user, idx) => ({
  //     id: user._id,
  //     srNo: startIndex + idx + 1,
  //     userName: user.userName,
  //     email: user.email,
  //     role: user.role,
  //     lastLogin: user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "Never",
  //   }));

  //   setRows(rowsMapped);
  // }, [allUsers, searchTerm, paginationModel]);

  // Reset to page 0 on search change (nice UX)
  // useEffect(() => {
  //   setPaginationModel((prev) => ({ ...prev, page: 0 }));
  // }, [searchTerm]);

  const handleAddUser = () => navigate("add-user");
  const handleEditUser = (userId) => navigate(`edit-user/${userId}`);
  const handleEditRights = (userId) => navigate(`edit-rights/${userId}`);
  const handleRefresh = () => fetchAllUsers();

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
                <Chip label={`${rowCount} users`} color="primary" variant="outlined" />
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

      {/* CLIENT-SIDE DataGrid */}
      <Card sx={{ mt: 3 }}>
        <Box sx={{ height: 420, width: "100%" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            pagination
            paginationMode="client"
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[5, 10, 25, 50]}
            loading={loading}
            disableRowSelectionOnClick
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
      </Card>

      {/* Mobile FAB */}
      {isMobile && (
        <Fab color="primary" aria-label="add" onClick={handleAddUser} sx={{ position: "fixed", bottom: 46, right: 36 }}>
          <AddIcon />
        </Fab>
      )}
    </Container>
  );
};

export default UserMaster;