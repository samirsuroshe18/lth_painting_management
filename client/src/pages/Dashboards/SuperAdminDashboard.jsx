import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Container,
  Grid,
  IconButton,
  Typography,
  Button,
  CircularProgress,
  TextField,
  InputAdornment,
  Stack,
} from "@mui/material";
import {
  CheckCircle,
  Cancel,
  Schedule,
  ListAlt,
  Visibility,
  Search as SearchIcon,
  Refresh,
} from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";
import { getAllAudits } from "../../api/auditLogApi";
import { useDispatch } from "react-redux";
import { showNotificationWithTimeout } from "../../redux/slices/notificationSlice";
import { handleAxiosError } from "../../utils/handleAxiosError";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import PendingRoundedIcon from "@mui/icons-material/PendingRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

const statusFilters = [
  { label: "All Audits", value: "all", icon: <ListAlt /> }, // Changed from "All" to "all"
  { label: "Review Pending", value: "pending", icon: <Schedule /> }, // Changed from "Pending" to "pending"
  { label: "Approved", value: "approved", icon: <CheckCircle /> }, // Changed from "Approved" to "approved"
  { label: "Rejected", value: "rejected", icon: <Cancel /> }, // Changed from "Rejected" to "rejected"
];

const SuperAdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [filteredRows, setFilteredRows] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [counts, setCounts] = useState({
    all: 0,
    pending: 0, // Changed from "Pending" to "pending"
    approved: 0, // Changed from "Approved" to "approved"
    rejected: 0, // Changed from "Rejected" to "rejected"
  });
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 5,
  });

  useEffect(() => {
    fetchAssets();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, rows, activeFilter]);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const result = await getAllAudits();

      const auditsWithIds = result.data.map((audit, index) => ({
        ...audit,
        id: audit?._id ?? index,
      }));

      if (auditsWithIds && auditsWithIds.length > 0) {
        const newCounts = auditsWithIds.reduce(
          (acc, { reviewStatus }) => {
            acc.all++;
            if (reviewStatus === "approved") acc.approved++;
            else if (reviewStatus === "rejected") acc.rejected++;
            else if (reviewStatus === "pending") acc.pending++;
            return acc;
          },
          { all: 0, pending: 0, approved: 0, rejected: 0 }
        );

        setCounts(newCounts);
      }

      setRows(auditsWithIds);
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

      filtered = filtered.filter((audit) => {
        const auditName = (audit.assetId.name || "").toLowerCase();

        return auditName.includes(searchLower);
      });
    }

    if (activeFilter && activeFilter !== "all") {
      filtered = filtered.filter(
        (audit) => audit?.reviewStatus === activeFilter
      );
    }

    setFilteredRows(filtered);
  };

  const handleRefresh = () => {
    setSearchTerm("");
    fetchAssets();
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleViewAsset = (auditLog) => {
    navigate("view-audit", { state: { auditLog } });
  };

  const columns = useMemo(
    () => [
      {
        field: "Sr. No",
        headerName: "Sr. No",
        width: 90,
        align: "center",
        headerAlign: "center",
        sortable: false,
        filterable: false,
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
        field: "assetId",
        headerName: "Asset Name",
        flex: 1,
        minWidth: 220,
        align: "center",
        headerAlign: "center",
        sortable: false,
        filterable: false,
        renderCell: (params) => params.row.assetId?.name || "-",
      },
      {
        field: "reviewStatus",
        headerName: "Status",
        width: 140,
        align: "center",
        headerAlign: "center",
        sortable: false,
        filterable: false,
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
        field: "createdBy.userName",
        headerName: "Auditor",
        flex: 1,
        minWidth: 160,
        align: "center",
        headerAlign: "center",
        sortable: false,
        filterable: false,
        valueGetter: (_value, row) => row?.createdBy?.userName || "-",
      },
      {
        field: "createdAt",
        headerName: "Created At",
        flex: 1,
        minWidth: 190,
        align: "center",
        headerAlign: "center",
        sortable: false,
        filterable: false,
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
        width: 120,
        align: "center",
        headerAlign: "center",
        sortable: false,
        filterable: false,
        renderCell: (params) => (
          <IconButton
            size="small"
            color="primary"
            onClick={(e) => {
              e.stopPropagation();
              handleViewAsset(params.row);
            }}
            title="View Asset"
          >
            <Visibility fontSize="small" />
          </IconButton>
        ),
      },
    ],
    [paginationModel.page, paginationModel.pageSize]
  );

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header card */}
      <Grid container spacing={2} alignItems="center">
        <Grid size={{ xs: 12, md: "auto" }}>
          <Typography variant="h4" fontWeight={700} color="primary">
            Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Audit Overview and Asset Tracking
          </Typography>
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mt: 3 }}>
        {statusFilters.map((filter) => {
          const isActive = activeFilter === filter.value;
          return (
            <Grid key={filter.value} size={{ xs: 6, md: 3 }}>
              <Card
                elevation={isActive ? 4 : 1}
                sx={{
                  borderRadius: 2,
                  transition:
                    "transform 120ms ease, box-shadow 120ms ease, border-color 120ms ease",
                  ...(isActive && { border: 2, borderColor: "primary.main" }),
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: (theme) => theme.shadows[4],
                  },
                }}
              >
                <CardActionArea
                  onClick={() => setActiveFilter(filter.value)}
                  sx={{ height: "100%" }} // ensure full height clickable
                >
                  <CardContent
                    sx={{
                      height: "100%",
                    }}
                  >
                    <Chip
                      icon={filter.icon}
                      label={filter.value}
                      variant="outlined"
                      color={
                        filter.value === "approved"
                          ? "success"
                          : filter.value === "rejected"
                            ? "error"
                            : filter.value === "pending"
                              ? "warning"
                              : "default"
                      }
                      sx={{
                        px: 1,
                        fontWeight: 600,
                        textTransform: "capitalize", // This will capitalize the first letter
                      }}
                    />

                    <Box>
                      <Typography
                        variant="h5"
                        fontWeight={700}
                        lineHeight={1.2}
                        sx={{ my: 3 }}
                      >
                        {loading ? (
                          <CircularProgress size={20} />
                        ) : (
                          (counts[filter.value] ?? 0)
                        )}
                      </Typography>
                      <Typography variant="subtitle2" color="text.secondary">
                        {filter.label}
                      </Typography>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Search & Filter Card */}
      <Grid container spacing={2} sx={{ mt: 4 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            fullWidth
            placeholder="Search assets by name..."
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
    </Container>
  );
};

export default SuperAdminDashboard;
