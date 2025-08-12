// AuditReport.jsx
import { useState } from "react";
import {
  Button,
  Checkbox,
  Chip,
  TextField,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import { DataGrid, GridToolbarQuickFilter } from "@mui/x-data-grid";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import SearchIcon from "@mui/icons-material/Search";
import DownloadIcon from "@mui/icons-material/Download";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import RefreshIcon from "@mui/icons-material/Refresh";
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

// Helpers
const optionId = (opt) => opt?._id || opt?.id;
const optionLabel = (opt) => opt?.name || "";

export default function AuditReport() {
  const dispatch = useDispatch();

  // Steps
  const [step, setStep] = useState(0);
  const userData = useSelector((state) => state.auth.userData?.user);

  // Locations
  const [locations] = useState(userData?.location ?? []);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [locationsLoading] = useState(false);

  // Assets
  const [assets, setAssets] = useState([]);
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [assetsLoading, setAssetsLoading] = useState(false);

  // Dates
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // Audits
  const [audits, setAudits] = useState([]);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [canExport, setCanExport] = useState(false);

  // DataGrid pagination
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

  const handleNextFromLocations = async () => {
    if (!selectedLocations.length) {
      dispatch(
        showNotificationWithTimeout({
          show: true,
          type: "warning",
          message: "Please choose at least one location.",
        })
      );
      return;
    }
    try {
      setAssetsLoading(true);
      const locationIds = selectedLocations.map(optionId);
      const res = await getAssetsByLocations({ locationIds });
      setAssets(res?.data?.assets ?? []);
      setSelectedAssets([]);
      setStep(1);
    } catch (error) {
      dispatch(
        showNotificationWithTimeout({
          show: true,
          type: "error",
          message: handleAxiosError(error),
        })
      );
    } finally {
      setAssetsLoading(false);
    }
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
      setPaginationModel({ page: 0, pageSize: 10 });
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
    if(!canAccess(userData?.permissions, 'auditReport:edit')){
      dispatch(
        showNotificationWithTimeout({
          show: true,
          type: "error",
          message: 'Access Denied',
        })
      );
      return;
    }

    if (!audits?.length) return;
    const flat = audits.map((a, idx) => ({
      "Sr. No": idx + 1,
      "Asset Name": a?.assetId?.name ?? "-",
      Location: a?.locationId?.name ?? "-",
      Status: a?.reviewStatus ?? "-",
      Auditor: a?.createdBy?.userName ?? "-",
      "Created At": a?.createdAt
        ? new Date(a.createdAt).toLocaleString("en-IN")
        : "-",
    }));

    const ws = XLSX.utils.json_to_sheet(flat);
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

  const SelectedSummary = ({ label, items }) =>
    items?.length ? (
      <div className="flex items-center gap-2 text-sm">
        <span className="text-slate-500">{label}:</span>
        <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-slate-700">
          {items.length}
        </span>
      </div>
    ) : null;

  return (
    <div className="mx-auto max-w-[1200px] w-full px-4 py-6">
      {/* Header */}
      <div className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-sky-500 p-[1px] shadow-lg">
        <div className="w-full rounded-2xl bg-white p-5 dark:bg-[#1E1E1E]">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Audit Report
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Filter audits by location, asset, and date range. Export results to
            Excel.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mt-5 w-full space-y-4">
        {/* Step 1 */}
        {step === 0 && (
          <div className="w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#1E1E1E]">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
              Select Locations
            </h2>
            <div className="mt-3 w-full">
              <SearchableMultiSelect
                label="Locations"
                loading={locationsLoading}
                options={locations}
                selected={selectedLocations}
                onChange={setSelectedLocations}
                placeholder="Search locations..."
              />
            </div>
            <div className="mt-4 flex w-full justify-end">
              <Button
                className="w-full sm:w-auto"
                variant="contained"
                endIcon={<NavigateNextIcon />}
                disabled={!selectedLocations.length || assetsLoading}
                onClick={handleNextFromLocations}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 1 && (
          <>
            <div className="w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#1E1E1E]">
              <div className="flex w-full items-center justify-between gap-2">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                  Filters
                </h2>
                <div className="flex gap-2">
                  <Button
                    variant="outlined"
                    startIcon={<NavigateBeforeIcon />}
                    onClick={() => setStep(0)}
                  >
                    Back
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={() => {
                      setSelectedAssets([]);
                      setStartDate(null);
                      setEndDate(null);
                      setAudits([]);
                      setCanExport(false);
                    }}
                  >
                    Reset
                  </Button>
                </div>
              </div>

              <div className="mt-4 grid w-full gap-4 md:grid-cols-2">
                <div className="w-full">
                  <SearchableMultiSelect
                    label="Assets"
                    loading={assetsLoading}
                    options={assets}
                    selected={selectedAssets}
                    onChange={setSelectedAssets}
                    placeholder="Search assets..."
                    disabled={!assets.length}
                  />
                </div>

                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
                    <DatePicker
                      label="Start Date"
                      value={startDate}
                      onChange={setStartDate}
                      slotProps={{
                        textField: { fullWidth: true, size: "small" },
                      }}
                    />
                    <DatePicker
                      label="End Date"
                      value={endDate}
                      onChange={setEndDate}
                      slotProps={{
                        textField: { fullWidth: true, size: "small" },
                      }}
                      minDate={startDate || undefined}
                    />
                  </div>
                </LocalizationProvider>
              </div>

              <div className="mt-4 flex w-full flex-wrap justify-end gap-2">
                <Button
                  className="w-full sm:w-auto"
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={
                    submitLoading ||
                    !selectedLocations.length ||
                    !selectedAssets.length
                  }
                >
                  {submitLoading ? "Loading..." : "Submit"}
                </Button>
                <Button
                  className="w-full sm:w-auto"
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={handleExport}
                  disabled={!canExport || !audits.length}
                >
                  Export
                </Button>
              </div>
            </div>

            {/* Results */}
            <div className="w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#1E1E1E]">
              <div className="mb-3 flex w-full items-center justify-between">
                <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">
                  Results
                </h3>
                <Chip
                  label={`${audits.length} audits`}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              </div>

              <div className="h-[560px] w-full">
                <DataGrid
                  rows={audits}
                  columns={columns}
                  pagination
                  paginationModel={paginationModel}
                  onPaginationModelChange={setPaginationModel}
                  pageSizeOptions={[10, 25, 50]}
                  disableRowSelectionOnClick
                  loading={submitLoading}
                  density="compact"
                  slots={{ toolbar: GridToolbarQuickFilter }}
                  slotProps={{
                    toolbar: {
                      quickFilterProps: { debounceMs: 300 },
                      showQuickFilter: true,
                    },
                  }}
                  sx={{
                    width: "100%",
                    borderRadius: "1rem",
                    border: "1px solid",
                    borderColor: "divider",
                    "& .MuiDataGrid-columnHeaders": {
                      backgroundColor: "rgba(99,102,241,0.06)",
                    },
                  }}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SearchableMultiSelect({
  label,
  options,
  selected,
  onChange,
  loading = false,
  placeholder = "Search...",
  disabled = false,
}) {
  return (
    <div className="w-full">
      <Autocomplete
        fullWidth
        multiple
        disableCloseOnSelect
        options={options}
        value={selected}
        getOptionLabel={optionLabel}
        isOptionEqualToValue={(o, v) => optionId(o) === optionId(v)}
        onChange={(_, val) => onChange(val)}
        disabled={disabled}
        renderOption={(props, option, { selected }) => (
          <li {...props} key={optionId(option)} className="flex items-center">
            <Checkbox checked={selected} sx={{ mr: 1 }} />
            {optionLabel(option)}
          </li>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            fullWidth
            label={label}
            placeholder={placeholder}
            size="small"
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <>
                  <InputAdornment position="start">
                    <SearchIcon color="action" fontSize="small" />
                  </InputAdornment>
                  {params.InputProps.startAdornment}
                </>
              ),
              endAdornment: (
                <>
                  {loading ? <CircularProgress size={18} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
      />
    </div>
  );
}
