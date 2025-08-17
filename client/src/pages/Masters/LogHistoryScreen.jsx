import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Chip,
  Container,
  Grid,
  IconButton,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Stack,
} from "@mui/material";
import {
  Cancel,
  Visibility,
  Search as SearchIcon,
  Refresh,
} from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";
import { getAssetAudits } from "../../api/auditLogApi";
import { useDispatch } from "react-redux";
import { showNotificationWithTimeout } from "../../redux/slices/notificationSlice";
import { handleAxiosError } from "../../utils/handleAxiosError";

const LogHistoryScreen = () => {
  const { state } = useLocation();
  const assetId = state?.assetId || "";
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredRows, setFilteredRows] = useState([]);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 5,
  });

  useEffect(() => {
    fetchAudits();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, rows]);

  const fetchAudits = async () => {
    try {
      setLoading(true);

      const result = await getAssetAudits(assetId);

      const auditsWithIds = result.data.map((audit, index) => ({
        ...audit,
        id: audit?._id ?? index,
      }));

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

    setFilteredRows(filtered);
  };

  const handleViewAsset = (auditLog) => {
    navigate("/view-audit", { state: { auditLog } });
  };

  const handleRefresh = () => {
    fetchAudits();
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const handleSearchChange = (e) => {
    setSearchTerm("");
    setSearchTerm(e.target.value);
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
      {/* Header card */}
      <Grid container spacing={2} alignItems="center">
        <Grid size={{ xs: 12, md: "auto" }}>
          <Typography variant="h4" fontWeight={700} color="primary">
            Asset Audit History
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Overview of audit statuses and recently reviewed assets
          </Typography>
        </Grid>
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
      <Box sx={{ height: 420, width: "100%", mt: 3 }}>
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

export default LogHistoryScreen;