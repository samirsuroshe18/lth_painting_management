import { Fragment, useState } from "react";
import {
  Button,
  Chip,
  TextField,
  CircularProgress,
  Typography,
  Grid,
  Stack,
  Box,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { DataGrid } from "@mui/x-data-grid";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import DownloadIcon from "@mui/icons-material/Download";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import PendingRoundedIcon from "@mui/icons-material/PendingRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import * as XLSX from "xlsx";
import Autocomplete from "@mui/material/Autocomplete";
import { useDispatch, useSelector } from "react-redux";
import { showNotificationWithTimeout } from "../../redux/slices/notificationSlice";
import { handleAxiosError } from "../../utils/handleAxiosError";
import { getAssetsByLocations } from "../../api/assetMasterApi";
import { fetchAudits } from "../../api/auditLogApi";
import canAccess from "../../utils/canAccess";
import { Cancel } from "@mui/icons-material";

// Helpers
const optionId = (opt) => opt?._id || opt?.id;

export default function AuditReport() {
  const dispatch = useDispatch();

  // Steps
  const userData = useSelector((state) => state.auth.userData?.user);

  // Locations
  const [locations] = useState(userData?.location ?? []);
  const [selectedLocations, setSelectedLocations] = useState([]);

  // Assets
  const [selectedAssets, setSelectedAssets] = useState([]);

  // Dates
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // Audits
  const [audits, setAudits] = useState([]);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [canExport, setCanExport] = useState(false);

  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleClear = () => {
    setSelectedLocations([]);
    setSelectedAssets([]);
    setStartDate(null);
    setEndDate(null);
    setAudits([]);
    setCanExport(false);
    setOptions([]); // Clear the assets options
    setOpen(false); // Close the assets dropdown
  };

  const handleOpen = () => {
    setOpen(true);
    (async () => {
      try {
        setLoading(true);
        const locationIds = selectedLocations.map(optionId);
        const res = await getAssetsByLocations({ locationIds });
        const options = (res?.data?.assets ?? []).map((a, i) => ({
          ...a,
          id: a._id || `row-${i}`,
        }));
        setOptions(options ?? []);
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
        setLoading(false);
      }
    })();
  };

  const handleClose = () => {
    setOpen(false);
    setOptions([]);
  };

  const handleSubmit = async () => {
    try {
      setSubmitLoading(true);
      setCanExport(false);

      const payload = {
        locationIds: selectedLocations.map(optionId),
        assetIds: selectedAssets.map(optionId),
        startDate: startDate ? startDate.startOf("day").toISOString() : null,
        endDate: endDate ? endDate.endOf("day").toISOString() : null,
      };

      const res = await fetchAudits(payload);
      const rows = (res?.data?.audits ?? []).map((a, i) => ({
        ...a,
        id: a._id || `row-${i}`,
        srNo: i + 1,
      }));

      setAudits(rows);
      setCanExport(true);
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

  const handleExport = () => {
    if (!canAccess(userData?.permissions, "auditReport:edit")) {
      dispatch(
        showNotificationWithTimeout({
          show: true,
          type: "error",
          message: "Access Denied",
        })
      );
      return;
    }

    if (!audits?.length) return;

    // Arrange columns explicitly
    const headers = [
      "Sr. No",
      "Asset Name",
      "Location",
      "Status",
      "Auditor",
      "Created At",
    ];

    // Build flat rows; use real Date for Excel-native date cells
    const rows = audits.map((a, idx) => ({
      "Sr. No": idx + 1,
      "Asset Name": a?.assetId?.name ?? "-",
      Location: a?.locationId?.name ?? "-",
      Status: a?.reviewStatus ?? "-",
      Auditor: a?.createdBy?.userName ?? "-",
      "Created At": a?.createdAt ? new Date(a.createdAt) : null, // Date or blank
    }));

    // Create sheet with desired column order
    const ws = XLSX.utils.json_to_sheet(rows, { header: headers });

    // Nicer column widths
    ws["!cols"] = [
      { wch: 6 }, // Sr. No
      { wch: 28 }, // Asset Name
      { wch: 22 }, // Location
      { wch: 16 }, // Status
      { wch: 20 }, // Auditor
      { wch: 22 }, // Created At
    ];

    // Ensure Excel-native date cells with a readable format
    const dateColIdx = headers.indexOf("Created At");
    for (let r = 1; r <= rows.length; r++) {
      const cellRef = XLSX.utils.encode_cell({ r, c: dateColIdx });
      const v = rows[r - 1]["Created At"];
      if (v instanceof Date) {
        // Create or update the cell with date type + format
        ws[cellRef] = { v, t: "d", z: "dd-mmm-yy hh:mm" };
      } else if (!v) {
        // Make sure empty stays empty (no "undefined")
        if (ws[cellRef]) delete ws[cellRef];
      }
    }

    // Build workbook and save
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Audit Report");
    XLSX.writeFile(wb, "audit-report.xlsx");
  };

  const columns = [
    {
      field: "srNo",
      headerName: "Sr. No",
      width: 84,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "assetId",
      headerName: "Asset",
      flex: 1,
      minWidth: 220,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => params.row.assetId?.name || "-",
    },
    {
      field: "locationId",
      headerName: "Location",
      flex: 1,
      minWidth: 160,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <Chip
          label={params.row.locationId?.name || "-"}
          size="small"
          variant="outlined"
          color="primary"
        />
      ),
    },
    {
      field: "reviewStatus",
      headerName: "Status",
      width: 150,
      align: "center",
      headerAlign: "center",
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
      valueGetter: (_value, row) => row?.createdBy?.userName || "-",
    },
    {
      field: "createdAt",
      headerName: "Audit Date & Time",
      flex: 1,
      minWidth: 200,
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
  ];

  return (
    <div className="px-4 py-6">
      {/* Header */}
      <Grid container spacing={2} alignItems="center">
        <Grid size={{ xs: 12, md: "auto" }}>
          <Typography variant="h4" fontWeight={700} color="primary">
            Audit Report
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Filter audits by location, asset, and date range. Export results to
            Excel.
          </Typography>
        </Grid>
      </Grid>

      {/* Content */}
      <Grid container spacing={2} sx={{ mt: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Autocomplete
            multiple
            disableCloseOnSelect
            limitTags={1}
            id="multiple-limit-tags"
            options={locations}
            value={selectedLocations} // CRITICAL: Add this line
            getOptionLabel={(option) => option.name}
            onChange={(_, val) => setSelectedLocations(val || [])} // Ensure val is never null
            renderInput={(params) => (
              <TextField
                {...params}
                label="Locations"
                placeholder="search location.."
                size="small"
              />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Autocomplete
            disableCloseOnSelect
            disabled={selectedLocations.length <= 0}
            multiple
            limitTags={1}
            open={open}
            onOpen={handleOpen}
            onClose={handleClose}
            value={selectedAssets} // CRITICAL: Add this line
            isOptionEqualToValue={(option, value) => option._id === value._id}
            getOptionKey={(option) => option._id}
            getOptionLabel={(option) => option.name}
            onChange={(_, val) => setSelectedAssets(val || [])} // Ensure val is never null
            options={options}
            loading={loading}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Assets"
                placeholder="search assets.."
                slotProps={{
                  input: {
                    ...params.InputProps,
                    endAdornment: (
                      <Fragment>
                        {loading ? (
                          <CircularProgress color="inherit" size={20} />
                        ) : null}
                        {params.InputProps.endAdornment}
                      </Fragment>
                    ),
                  },
                }}
                size="small"
              />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={setStartDate}
              closeOnSelect={true}
              slotProps={{
                textField: { fullWidth: true, size: "small" },
                fullWidth: true,
              }}
              minDate={dayjs("2025-01-01")}
              maxDate={dayjs()}
            />
          </LocalizationProvider>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="End Date"
              value={endDate}
              closeOnSelect={true}
              onChange={setEndDate}
              slotProps={{
                textField: { fullWidth: true, size: "small" },
                fullWidth: true,
              }}
              minDate={startDate || dayjs()}
              maxDate={dayjs()}
            />
          </LocalizationProvider>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Stack direction="row" spacing={1} justifyContent={"flex-end"}>
            <Button
              variant="contained"
              startIcon={<SendIcon />}
              onClick={handleSubmit}
              disabled={selectedAssets.length <= 0 ? true : false}
              loading={submitLoading}
            >
              Submit
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExport}
              disabled={!canExport}
            >
              Export
            </Button>
            <Button
              variant="outlined"
              startIcon={<Cancel />}
              onClick={handleClear}
              disabled={!canExport}
            >
              Clear
            </Button>
          </Stack>
        </Grid>
      </Grid>

      <Box sx={{ height: 400, width: "100%", mt: 3 }}>
        <DataGrid
          rows={audits}
          columns={columns}
          disableRowSelectionOnClick
          loading={submitLoading}
          pageSizeOptions={[5, 10, 25, 50]}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 5,
              },
            },
          }}
        />
      </Box>
    </div>
  );
}
