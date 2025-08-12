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
  useMediaQuery,
  useTheme,
  Button,
  CircularProgress,
  TextField,
  InputAdornment,
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

const statusFilters = [
  { label: "All Audits", value: "all", icon: <ListAlt /> },
  { label: "Review Pending", value: "Pending", icon: <Schedule /> },
  { label: "Approved", value: "Approved", icon: <CheckCircle /> },
  { label: "Rejected", value: "Rejected", icon: <Cancel /> },
];

const SuperAdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [audits, setAudits] = useState([]);
  const [rows, setRows] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [countsLoading, setCountsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [counts, setCounts] = useState({
    all: 0,
    Pending: 0,
    Approved: 0,
    Rejected: 0,
  });
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 5,
  });

  const lowerStatusParam = (v) =>
    v && v !== "all" ? v.toLowerCase() : undefined;

  useEffect(() => {
    fetchCounts();
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

  // when filter changes, reset to first page and refetch
  useEffect(() => {
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  }, [activeFilter]);

  const fetchCounts = async () => {
    try {
      setCountsLoading(true);
      const statuses = ["all", "Pending", "Approved", "Rejected"];

      const results = await Promise.allSettled(
        statuses.map(async (s) => {
          try {
            const res = await getAllAudits({
              page: 1,
              limit: 1, // only need total
              status: lowerStatusParam(s),
            });
            return {
              key: s,
              total: res?.data?.pagination?.totalEntries ?? 0,
            };
          } catch (error) {
            dispatch(
              showNotificationWithTimeout({
                show: true,
                type: "error",
                message: handleAxiosError(error),
              })
            );
            return { key: s, total: 0 };
          }
        })
      );

      const next = { all: 0, Pending: 0, Approved: 0, Rejected: 0 };
      results.forEach((result) => {
        if (result.status === "fulfilled" && result.value) {
          next[result.value.key] = result.value.total || 0;
        } else if (result.status === "rejected") {
          // In case the mapping throw directly (rare), still set 0
          const index = results.indexOf(result);
          next[statuses[index]] = 0;
        }
      });

      setCounts(next);
    } finally {
      setCountsLoading(false);
    }
  };

  const fetchAssets = async () => {
    try {
      setLoading(true);

      const res = await getAllAudits({
        page: paginationModel.page + 1,
        limit: paginationModel.pageSize,
        status: lowerStatusParam(activeFilter),
        search: searchTerm,
      });

      const apiItems = res?.data?.auditLogs ?? [];
      const normalized = apiItems.map((asset) => ({
        ...asset,
        id: asset._id,
      }));

      setAudits(normalized);
      setRows(normalized);
      setRowCount(
        res?.data?.pagination?.totalEntries ??
          res?.data?.total ??
          res?.data?.totalCount ??
          res?.data?.count ??
          0
      );
    } catch (error) {
      dispatch(
        showNotificationWithTimeout({
          show: true,
          type: "error",
          message: handleAxiosError(error),
        })
      );
      setRows([]);
      setRowCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleViewAsset = (auditLog) => {
    navigate("view-audit", { state: { auditLog } });
  };

  const columns = useMemo(
    () => [
      {
        field: "srNo",
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
                width: "100%",
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
          const value = params.value || "-";
          const map = {
            pending: { color: "warning", label: "Pending" },
            approved: { color: "success", label: "Approved" },
            rejected: { color: "error", label: "Rejected" },
          };
          const cfg = map[value] || { color: "default", label: value };
          return (
            <Chip
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
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md="auto">
          <Typography variant="h4" fontWeight={700} color="primary">
            Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Audit Overview and Asset Tracking
          </Typography>
        </Grid>
      </Grid>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        {statusFilters.map((filter) => {
          const isActive = activeFilter === filter.value;
          return (
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
                      filter.value === "Approved"
                        ? "success"
                        : filter.value === "Rejected"
                          ? "error"
                          : filter.value === "Pending"
                            ? "warning"
                            : "default"
                    }
                    sx={{
                      px: 1,
                      fontWeight: 600,
                      textTransform: "none",
                    }}
                  />

                  <Box>
                    <Typography
                      variant="h5"
                      fontWeight={700}
                      lineHeight={1.2}
                      sx={{ my: 3 }}
                    >
                      {counts[filter.value] ?? 0}
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary">
                      {filter.label}
                    </Typography>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          );
        })}
      </div>

      {/* Search & total chips */}
      <Grid
        container
        spacing={2}
        alignItems="center"
        justifyContent="space-between"
        sx={{ mt: 4 }}
      >
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            placeholder="Search assets by name, artist, place, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            variant="outlined"
            size="small"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: !!searchTerm && (
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
              },
            }}
          />
        </Grid>

        <Button
          variant="outlined"
          startIcon={loading ? <CircularProgress size={15} /> : <Refresh />}
          onClick={() => {
            fetchCounts();
            fetchAssets();
          }}
          disabled={loading || countsLoading}
        >
          {loading ? "Loading.." : "Refresh"}
        </Button>
      </Grid>

      <Card sx={{ mt: 1 }}>
        <Box sx={{ height: 480, width: "100%" }}>
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

export default SuperAdminDashboard;
