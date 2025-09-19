import { useEffect, useState, Fragment } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Collapse,
  Container,
  MenuItem,
  Stack,
  TextField,
  Typography,
  FormControl,
  Select,
  Autocomplete,
  Grid,
} from "@mui/material";
import { AlertTriangle } from "lucide-react";
import { showNotificationWithTimeout } from "../../redux/slices/notificationSlice";
import { useDispatch, useSelector } from "react-redux";
import { handleAxiosError } from "../../utils/handleAxiosError";
import { viewAssetPublic, updateAsset } from "../../api/assetMasterApi";
import { getAllDepartment } from "../../api/departmentApi";
import { getAllBuildings } from "../../api/buildingApi";
import { getAllFloors } from "../../api/floorApi";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { submitAudit } from "../../api/auditLogApi";
import SnackBar from "../../components/commonComponents/SnackBar";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { styled } from "@mui/material/styles";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

// Label component with red asterisk for required fields
const LabelWithRedAsterisk = ({ children, required }) => (
  <Typography variant="body2" component="label" sx={{ fontWeight: 600 }}>
    {children}
    {required && <span style={{ color: "red", marginLeft: "2px" }}>*</span>}
  </Typography>
);

// Row component for displaying asset details
const Row = ({ label, value }) => (
  <div className="space-y-1">
    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
      {label}
    </p>
    <p className="text-sm text-slate-900 break-words">{value}</p>
  </div>
);

export default function ScannedAsset() {
  const { id } = useParams();
  const isAdmin = useSelector((state) => state.admin.admin);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [submit, setSubmit] = useState(false);
  const [imageOpen, setImageOpen] = useState({
    image: null,
    open: false,
    name: null,
  });
  const [data, setData] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  
  // Enhanced form data state
  const [formData, setFormData] = useState({
    name: "",
    artist: "",
    location: "",
    departmentId: null,
    buildingId: null,
    floorId: null,
    currentValue: "",
    size: "",
    year: null,
    status: "active",
    description: "",
    image: null,
  });

  // Size state for width x height input
  const [sizeWidth, setSizeWidth] = useState("");
  const [sizeHeight, setSizeHeight] = useState("");

  // Department dropdown states
  const [departmentOpen, setDepartmentOpen] = useState(false);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [departmentLoading, setDepartmentLoading] = useState(false);

  // Building dropdown states
  const [buildingOpen, setBuildingOpen] = useState(false);
  const [buildingOptions, setBuildingOptions] = useState([]);
  const [buildingLoading, setBuildingLoading] = useState(false);

  // Floor dropdown states
  const [floorOpen, setFloorOpen] = useState(false);
  const [floorOptions, setFloorOptions] = useState([]);
  const [floorLoading, setFloorLoading] = useState(false);

  // Audit form data (keeping existing structure)
  const [auditFormData, setAuditFormData] = useState({
    assetId: "",
    auditorRemark: "",
    proposedChanges: {   
    year: null,
    name: "",
    description: "",
    purchaseValue: "",
    location: "",
    artist: "",
    size: "",
    department: "",
    building: "",
    floor: "",
  },
    auditImage1: null,
    auditImage2: null,
    auditImage3: null,
  });

  // Handle size changes
  const handleSizeChange = (width, height) => {
    setSizeWidth(width);
    setSizeHeight(height);
    const sizeString = width && height ? `${width} × ${height}` : "";
    setFormData((prev) => ({ ...prev, size: sizeString }));
  };

  // Handle form changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files && files.length > 0) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle audit form changes
  const handleAuditChange = (e) => {
    const { name, value, files } = e.target;
    if (files && files.length > 0) {
      setAuditFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setAuditFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Department dropdown handlers
  const handleDepartmentOpen = () => {
    setDepartmentOpen(true);
    (async () => {
      try {
        setDepartmentLoading(true);
        const res = await getAllDepartment();
        setDepartmentOptions(res?.data ?? []);
      } catch (error) {
        setDepartmentOptions([]);
        dispatch(
          showNotificationWithTimeout({
            show: true,
            type: "error",
            message: handleAxiosError(error),
          })
        );
      } finally {
        setDepartmentLoading(false);
      }
    })();
  };

  const handleDepartmentClose = () => {
    setDepartmentOpen(false);
    setDepartmentOptions([]);
  };

  // Building dropdown handlers
  const handleBuildingOpen = () => {
    setBuildingOpen(true);
    (async () => {
      try {
        setBuildingLoading(true);
        const res = await getAllBuildings();
        setBuildingOptions(res?.data ?? []);
      } catch (error) {
        setBuildingOptions([]);
        dispatch(
          showNotificationWithTimeout({
            show: true,
            type: "error",
            message: handleAxiosError(error),
          })
        );
      } finally {
        setBuildingLoading(false);
      }
    })();
  };

  const handleBuildingClose = () => {
    setBuildingOpen(false);
    setBuildingOptions([]);
  };

  // Floor dropdown handlers
  const handleFloorOpen = () => {
    setFloorOpen(true);
    (async () => {
      try {
        setFloorLoading(true);
        const res = await getAllFloors();
        setFloorOptions(res?.data ?? []);
      } catch (error) {
        setFloorOptions([]);
        dispatch(
          showNotificationWithTimeout({
            show: true,
            type: "error",
            message: handleAxiosError(error),
          })
        );
      } finally {
        setFloorLoading(false);
      }
    })();
  };

  const handleFloorClose = () => {
    setFloorOpen(false);
    setFloorOptions([]);
  };

  // Fetch asset details
  useEffect(() => {
    const fetchAssetDetails = async () => {
      try {
        setLoading(true);
        const response = await viewAssetPublic(id);
        setData(response.data);
        
        // Populate form data with existing asset data
        const asset = response.data.asset;
        setFormData({
          name: asset.name || "",
          artist: asset.artist || "",
          location: asset.locationId?._id || "",
          departmentId: asset.departmentId || null,
          buildingId: asset.buildingId || null,
          floorId: asset.floorId || null,
          currentValue: asset.purchaseValue || "",
          size: asset.size || "",
          year: asset.year ? dayjs().year(asset.year) : null,
          status: asset.status || "active",
          description: asset.description || "",
          image: null,
        });

        // Parse size if it exists
        if (asset.size && asset.size.includes("×")) {
          const [width, height] = asset.size.split("×").map(s => s.trim());
          setSizeWidth(width);
          setSizeHeight(height);
        } else if (asset.size && asset.size.includes("x")) {
          const [width, height] = asset.size.split("x").map(s => s.trim().replace(/\s*inches?$/i, ''));
          setSizeWidth(width);
          setSizeHeight(height);
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
        setLoading(false);
      }
    };
    fetchAssetDetails();
  }, [id, dispatch]);

  const toggleEdit = () => setShowEditForm((p) => !p);

  const resetForm = () => {
    if (data?.asset) {
      const asset = data.asset;
      setFormData({
        name: asset.name || "",
        artist: asset.artist || "",
        location: asset.locationId?._id || "",
        departmentId: asset.departmentId || null,
        buildingId: asset.buildingId || null,
        floorId: asset.floorId || null,
        currentValue: asset.purchaseValue || "",
        size: asset.size || "",
        year: asset.year ? dayjs().year(asset.year) : null,
        status: asset.status || "active",
        description: asset.description || "",
        image: null,
      });

      // Reset size fields
      if (asset.size && asset.size.includes("×")) {
        const [width, height] = asset.size.split("×").map(s => s.trim());
        setSizeWidth(width);
        setSizeHeight(height);
      } else if (asset.size && asset.size.includes("x")) {
        const [width, height] = asset.size.split("x").map(s => s.trim().replace(/\s*inches?$/i, ''));
        setSizeWidth(width);
        setSizeHeight(height);
      }
    }
  };

  // Handle edit form submission
  const handleEditSubmit = async () => {
    try {
      setSubmit(true);
      
      // Prepare the data to send - handle null/empty year properly
      const dataToSend = {
        id: data.asset._id,
        ...formData,
        year: formData.year && formData.year.isValid && formData.year.isValid() ? formData.year : null,
      };

      // Only include department, building, floor if they have valid _id values
      if (formData.departmentId && formData.departmentId._id) {
        dataToSend.department = formData.departmentId._id;
      }
      
      if (formData.buildingId && formData.buildingId._id) {
        dataToSend.building = formData.buildingId._id;
      }
      
      if (formData.floorId && formData.floorId._id) {
        dataToSend.floor = formData.floorId._id;
      }

      // Map location field to locationId for the API
      if (formData.location) {
        dataToSend.locationId = formData.location;
      }

      console.log('Data being sent to backend:', dataToSend); // Debug log

      const response = await updateAsset(dataToSend);
      
      setShowEditForm(false);
      
      dispatch(
        showNotificationWithTimeout({
          show: true,
          type: "success",
          message: response.message || "Asset updated successfully",
        })
      );

      // Refresh asset data
      const updatedResponse = await viewAssetPublic(id);
      setData(updatedResponse.data);
      
    } catch (error) {
      dispatch(
        showNotificationWithTimeout({
          show: true,
          type: "error",
          message: handleAxiosError(error),
        })
      );
    } finally {
      setSubmit(false);
    }
  };

  // Handle audit submission (keeping existing functionality)
  const handleAuditSubmit = async () => {
  if (!auditFormData.auditorRemark.trim()) return alert("Remarks are required");
  if (!auditFormData.auditImage1) return alert("Image 1 is required");

  const payload = { ...auditFormData, assetId: data?.asset?._id };

  //  Ensure proposedChanges.year is converted properly
  if (payload.proposedChanges?.year) {
    if (payload.proposedChanges.year.$y) {
      // If it's a dayjs object
      payload.proposedChanges.year = payload.proposedChanges.year.year();
    } else {
      payload.proposedChanges.year = new Date(payload.proposedChanges.year).getFullYear();
    }
  }

  try {
    setSubmit(true);
    const response = await submitAudit(payload);
    setAuditFormData({
      assetId: "",
      auditorRemark: "",
      auditImage1: null,
      auditImage2: null,
      auditImage3: null,
    });
    dispatch(
      showNotificationWithTimeout({
        show: true,
        type: "success",
        message: response.message,
      })
    );
  } catch (error) {
    dispatch(
      showNotificationWithTimeout({
        show: true,
        type: "error",
        message: handleAxiosError(error),
      })
    );
  } finally {
    setSubmit(false);
  }
};


  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-slate-600 space-y-4">
        <CircularProgress size={32} thickness={4} sx={{ color: "#009ff6" }} />
        <div className="flex flex-col items-center">
          <span className="text-base font-medium">Loading asset</span>
          <span className="text-sm text-slate-400">Please wait a moment…</span>
        </div>
      </div>
    );
  }

  if (!data?.asset) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4 text-slate-500">
        <div className="bg-red-50 text-red-500 p-4 rounded-full">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold">Asset Not Found</p>
          <p className="text-sm text-slate-400 mt-1">
            We couldn't locate the asset you're looking for. It may have been
            removed or never existed.
          </p>
        </div>
        <button
          onClick={() => window.history.back()}
          className="mt-4 px-5 py-2 rounded-lg bg-[#009ff6] text-white text-sm font-medium hover:bg-[#0085cc] transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <Container
      maxWidth={false}
      className="max-w-screen-md px-4 sm:px-6 py-5 sm:py-8"
    >
      {/* Page header */}
      <div className="mb-4 sm:mb-6">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-xs tracking-wide text-slate-600 shadow-sm backdrop-blur">
          <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
          Artifact E-Gallery Portal
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold leading-tight text-slate-900">
          {data.asset.name}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Curated details & audit log updates
        </p>
      </div>

      {/* Asset details */}
      <Card className="mb-5 sm:mb-6 rounded-2xl border border-slate-200 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.15)]">
        <CardHeader
          title={
            <Typography className="text-lg font-semibold text-slate-900">
              Asset Details
            </Typography>
          }
          action={
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              {!isAdmin ? (
                <Button
                  size="small"
                  variant="contained"
                  className="w-full sm:w-auto !rounded-xl !shadow-md hover:!shadow-lg transition"
                  onClick={() =>
                    navigate("/login", { state: { isAdmin: true } })
                  }
                >
                  Admin Login
                </Button>
              ) : (
                <>
                  <Button
                    size="small"
                    variant="outlined"
                    className="w-full sm:w-auto !rounded-xl !border-slate-300 hover:!border-slate-400 hover:!bg-slate-50 transition"
                    onClick={() =>
                      navigate("/create-new-asset", {
                        state: { locations: data.locations },
                      })
                    }
                  >
                    Add New Asset
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    className="w-full sm:w-auto !rounded-xl !shadow-md hover:!shadow-lg transition"
                    onClick={toggleEdit}
                  >
                    {showEditForm ? "Hide Edit Form" : "Edit Asset Details"}
                  </Button>
                </>
              )}
            </div>
          }
          className="[&_.MuiCardHeader-action]:self-stretch sm:[&_.MuiCardHeader-action]:self-center"
        />

        <CardContent className="pt-0">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
            <Row label="Asset" value={data.asset.name} />
            <Row label="Year" value={data.asset.year || "-"} />
            <Row label="Artist" value={data.asset.artist || "-"} />
            <Row label="Description" value={data.asset.description || "-"} />

            <Row
              label="Image"
              value={
                <div
                  className="group cursor-pointer"
                  onClick={() => setImageOpen({image: data.asset.image, name: data.asset.name, open: true})}
                >
                  <img
                    src={data.asset.image}
                    alt={data.asset.name}
                    className="w-40 h-28 object-cover rounded-lg border border-slate-200 shadow-sm transition group-hover:shadow-md"
                  />
                  <div className="mt-1 text-[11px] text-slate-500">
                    Click to enlarge
                  </div>
                </div>
              }
            />

            {imageOpen.open && (
              <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                <img
                  src={imageOpen.image}
                  alt={imageOpen.name}
                  className="max-w-[90%] max-h-[90%] object-contain rounded-lg"
                />
                <button
                  onClick={() => setImageOpen(prev => ({ ...prev, open: false }))}
                  className="absolute top-4 right-4 text-white text-xl"
                >
                  ✕
                </button>
              </div>
            )}

            <Row label="Size" value={data.asset.size ? `${data.asset.size} ${data.asset.unit || "inches"}` : "-"} />
            
            {/* Location Details */}
            <Row label="Location" value={data.asset.locationId?.name || "-"} />
            <Row label="State" value={data.asset.locationId?.stateId?.name || "-"} />
            <Row label="City" value={data.asset.locationId?.cityId?.name || "-"} />
            <Row label="Area" value={data.asset.locationId?.areaId?.name || "-"} />

            {/* New Fields */}
            <Row label="Department" value={data.asset.departmentId?.name || "-"} />
            <Row label="Building" value={data.asset.buildingId?.name || "-"} />
            <Row label="Floor" value={data.asset.floorId?.name || "-"} />
            <Row label="Purchase Value" value={data.asset.purchaseValue ?? "-"} />
          </div>
        </CardContent>
      </Card>

      {/* Edit form */}
      {isAdmin && (
        <Collapse in={showEditForm} unmountOnExit>
          <Card className="mb-5 sm:mb-6 rounded-2xl border border-slate-200 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.15)]">
            <CardHeader
              title={
                <Typography className="text-lg font-semibold">
                  Edit Asset Details
                </Typography>
              }
            />
            <CardContent>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Grid container spacing={3}>
                  {/* Name */}
                  <Grid item xs={12} md={6}>
                    <Stack spacing={1}>
                      <LabelWithRedAsterisk required>Name</LabelWithRedAsterisk>
                      <TextField
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        fullWidth
                        size="small"
                        placeholder="Enter name"
                        required
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: "inherit",
                          },
                        }}
                        type="text"
                      />
                    </Stack>
                  </Grid>

                  {/* Artist */}
                  <Grid item xs={12} md={6}>
                    <Stack spacing={1}>
                      <LabelWithRedAsterisk required>Artist</LabelWithRedAsterisk>
                      <TextField
                        name="artist"
                        value={formData.artist}
                        onChange={handleChange}
                        fullWidth
                        size="small"
                        placeholder="Enter artist name"
                        required
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: "inherit",
                          },
                        }}
                        type="text"
                      />
                    </Stack>
                  </Grid>

                  {/* Location */}
                  <Grid item xs={12} md={6}>
                    <Stack spacing={1}>
                      <LabelWithRedAsterisk required>Location</LabelWithRedAsterisk>
                      <FormControl fullWidth required disabled={loading}>
                        <Select
                          value={formData.location}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              location: e.target.value,
                            }))
                          }
                          required
                          displayEmpty
                          size="small"
                        >
                          <MenuItem value="" disabled>
                            Select Location
                          </MenuItem>
                          {Array.isArray(data?.locations) && data.locations.length > 0 ? (
                            data.locations.map((loc) => (
                              <MenuItem key={loc._id} value={loc._id}>
                                {loc.name}
                              </MenuItem>
                            ))
                          ) : (
                            <MenuItem disabled>No locations available</MenuItem>
                          )}
                        </Select>
                      </FormControl>
                    </Stack>
                  </Grid>

                  {/* Department */}
                  <Grid item xs={12} md={6}>
                    <Stack spacing={1}>
                      <LabelWithRedAsterisk>Department</LabelWithRedAsterisk>
                      <Autocomplete
                        open={departmentOpen}
                        onOpen={handleDepartmentOpen}
                        onClose={handleDepartmentClose}
                        value={formData.departmentId}
                        loading={departmentLoading}
                        options={departmentOptions}
                        getOptionLabel={(option) => option?.name || ""}
                        disabled={loading}
                        ListboxProps={{
                          style: {
                            maxHeight: 200,
                          },
                        }}
                        onChange={(e, newValue) =>
                          setFormData((prev) => ({
                            ...prev,
                            departmentId: newValue || null,
                          }))
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            placeholder="Search department..."
                            size="small"
                            slotProps={{
                              input: {
                                ...params.InputProps,
                                endAdornment: (
                                  <Fragment>
                                    {departmentLoading ? (
                                      <CircularProgress color="inherit" size={20} />
                                    ) : null}
                                    {params.InputProps.endAdornment}
                                  </Fragment>
                                ),
                              },
                            }}
                          />
                        )}
                      />
                    </Stack>
                  </Grid>

                  {/* Building Name */}
                  <Grid item xs={12} md={6}>
                    <Stack spacing={1}>
                      <LabelWithRedAsterisk>Building Name</LabelWithRedAsterisk>
                      <Autocomplete
                        open={buildingOpen}
                        onOpen={handleBuildingOpen}
                        onClose={handleBuildingClose}
                        value={formData.buildingId}
                        loading={buildingLoading}
                        options={buildingOptions}
                        getOptionLabel={(option) => option?.name || ""}
                        disabled={loading}
                        ListboxProps={{
                          style: {
                            maxHeight: 200,
                          },
                        }}
                        onChange={(e, newValue) =>
                          setFormData((prev) => ({
                            ...prev,
                            buildingId: newValue || null,
                          }))
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            placeholder="Search building..."
                            size="small"
                            slotProps={{
                              input: {
                                ...params.InputProps,
                                endAdornment: (
                                  <Fragment>
                                    {buildingLoading ? (
                                      <CircularProgress color="inherit" size={20} />
                                    ) : null}
                                    {params.InputProps.endAdornment}
                                  </Fragment>
                                ),
                              },
                            }}
                          />
                        )}
                      />
                    </Stack>
                  </Grid>

                  {/* Floor */}
                  <Grid item xs={12} md={6}>
                    <Stack spacing={1}>
                      <LabelWithRedAsterisk>Floor</LabelWithRedAsterisk>
                      <Autocomplete
                        open={floorOpen}
                        onOpen={handleFloorOpen}
                        onClose={handleFloorClose}
                        value={formData.floorId}
                        loading={floorLoading}
                        options={floorOptions}
                        getOptionLabel={(option) => option?.name || ""}
                        disabled={loading}
                        ListboxProps={{
                          style: {
                            maxHeight: 200,
                          },
                        }}
                        onChange={(e, newValue) =>
                          setFormData((prev) => ({
                            ...prev,
                            floorId: newValue || null,
                          }))
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            placeholder="Search floor..."
                            size="small"
                            slotProps={{
                              input: {
                                ...params.InputProps,
                                endAdornment: (
                                  <Fragment>
                                    {floorLoading ? (
                                      <CircularProgress color="inherit" size={20} />
                                    ) : null}
                                    {params.InputProps.endAdornment}
                                  </Fragment>
                                ),
                              },
                            }}
                          />
                        )}
                      />
                    </Stack>
                  </Grid>

                  {/* Purchase Value */}
                  <Grid item xs={12} md={6}>
                    <Stack spacing={1}>
                      <LabelWithRedAsterisk>Purchase Value</LabelWithRedAsterisk>
                      <TextField
                        name="currentValue"
                        value={formData.currentValue}
                        onChange={handleChange}
                        fullWidth
                        size="small"
                        placeholder="Enter purchase value"
                        disabled={loading}
                        type="number"
                        slotProps={{
                          htmlInput: { min: 0 },
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: "inherit",
                          },
                        }}
                      />
                    </Stack>
                  </Grid>

                  {/* Size */}
                  <Grid item xs={12} md={6}>
                    <Stack spacing={1}>
                      <LabelWithRedAsterisk required>Size (inches)</LabelWithRedAsterisk>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <TextField
                          value={sizeWidth}
                          onChange={(e) => handleSizeChange(e.target.value, sizeHeight)}
                          size="small"
                          placeholder="Width"
                          required={!sizeHeight}
                          disabled={loading}
                          type="number"
                          slotProps={{
                            htmlInput: { min: 0, step: "0.1" },
                          }}
                          sx={{
                            flex: 1,
                            "& .MuiOutlinedInput-root": {
                              backgroundColor: "inherit",
                            },
                          }}
                        />
                        <Typography variant="body1" sx={{ mx: 1, fontWeight: 600 }}>
                          ×
                        </Typography>
                        <TextField
                          value={sizeHeight}
                          onChange={(e) => handleSizeChange(sizeWidth, e.target.value)}
                          size="small"
                          placeholder="Height"
                          required={!sizeWidth}
                          disabled={loading}
                          type="number"
                          slotProps={{
                            htmlInput: { min: 0, step: "0.1" },
                          }}
                          sx={{
                            flex: 1,
                            "& .MuiOutlinedInput-root": {
                              backgroundColor: "inherit",
                            },
                          }}
                        />
                        <Typography variant="body2" color="text.secondary" sx={{ minWidth: 40 }}>
                          inches
                        </Typography>
                      </Stack>
                    </Stack>
                  </Grid>

                  {/* Year */}
                  <Grid item xs={12} md={6}>
                    <Stack spacing={1}>
                      <LabelWithRedAsterisk>Year</LabelWithRedAsterisk>
                      <DatePicker
                        value={formData.year}
                        onChange={(newValue) =>
                          setFormData((prev) => ({ ...prev, year: newValue }))
                        }
                        views={['year']}
                        disabled={loading}
                        slotProps={{
                          textField: {
                            size: 'small',
                            placeholder: 'Select year',
                            sx: {
                              "& .MuiOutlinedInput-root": {
                                backgroundColor: "inherit",
                              },
                            },
                          },
                        }}
                      />
                    </Stack>
                  </Grid>

                  {/* Status */}
                  <Grid item xs={12} md={6}>
                    <Stack spacing={1}>
                      <LabelWithRedAsterisk required>Status</LabelWithRedAsterisk>
                      <FormControl fullWidth required disabled={loading}>
                        <Select
                          name="status"
                          value={formData.status}
                          onChange={handleChange}
                          required
                          size="small"
                        >
                          <MenuItem value="active">Active</MenuItem>
                          <MenuItem value="inactive">Inactive</MenuItem>
                          <MenuItem value="maintenance">Maintenance</MenuItem>
                          <MenuItem value="retired">Retired</MenuItem>
                        </Select>
                      </FormControl>
                    </Stack>
                  </Grid>

                  {/* Description */}
                  <Grid item xs={12}>
                    <Stack spacing={1}>
                      <LabelWithRedAsterisk>Description</LabelWithRedAsterisk>
                      <TextField
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        fullWidth
                        multiline
                        rows={3}
                        size="small"
                        placeholder="Enter description"
                        disabled={loading}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: "inherit",
                          },
                        }}
                      />
                    </Stack>
                  </Grid>

                  {/* Image Upload */}
                  <Grid item xs={12}>
                    <Stack spacing={1}>
                      <LabelWithRedAsterisk>Update Image</LabelWithRedAsterisk>
                      <Button
                        component="label"
                        role={undefined}
                        variant="outlined"
                        tabIndex={-1}
                        startIcon={<CloudUploadIcon />}
                        disabled={loading}
                        sx={{
                          justifyContent: 'flex-start',
                          textTransform: 'none',
                          borderStyle: 'dashed',
                          py: 1.5,
                        }}
                      >
                        {formData.image ? formData.image.name : "Choose new image (optional)"}
                        <VisuallyHiddenInput
                          type="file"
                          name="image"
                          accept="image/*"
                          onChange={handleChange}
                        />
                      </Button>
                      {formData.image && (
                        <Typography variant="caption" color="text.secondary">
                          Selected: {formData.image.name}
                        </Typography>
                      )}
                    </Stack>
                  </Grid>

                  {/* Form Actions */}
                  <Grid item xs={12}>
                    <Stack direction="row" spacing={2} justifyContent="flex-end">
                      <Button
                        variant="outlined"
                        onClick={() => {
                          resetForm();
                          setShowEditForm(false);
                        }}
                        disabled={submit}
                        sx={{ textTransform: 'none' }}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={resetForm}
                        disabled={submit}
                        sx={{ textTransform: 'none' }}
                      >
                        Reset
                      </Button>
                      <Button
                        variant="contained"
                        onClick={handleEditSubmit}
                        disabled={submit || !formData.name || !formData.artist}
                        sx={{ textTransform: 'none' }}
                      >
                        {submit ? (
                          <>
                            <CircularProgress size={16} sx={{ mr: 1 }} />
                            Updating...
                          </>
                        ) : (
                          'Update Asset'
                        )}
                      </Button>
                    </Stack>
                  </Grid>
                </Grid>
              </LocalizationProvider>
            </CardContent>
          </Card>
        </Collapse>
      )}

      {/* Audit section */}
      {isAdmin && (
        <Card className="mb-5 sm:mb-6 rounded-2xl border border-slate-200 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.15)]">
          <CardHeader
            title={
              <Typography className="text-lg font-semibold">
                Submit Audit Report
              </Typography>
            }
          />
          <CardContent>
            <Grid container spacing={3}>
              {/* Auditor Remarks */}
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <LabelWithRedAsterisk required>Auditor Remarks</LabelWithRedAsterisk>
                  <TextField
                    name="auditorRemark"
                    value={auditFormData.auditorRemark}
                    onChange={handleAuditChange}
                    fullWidth
                    multiline
                    rows={4}
                    size="small"
                    placeholder="Enter your audit remarks..."
                    required
                    disabled={submit}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "inherit",
                      },
                    }}
                  />
                </Stack>
              </Grid>

              {/* Audit Images */}
              <Grid item xs={12} md={4}>
                <Stack spacing={1}>
                  <LabelWithRedAsterisk required>Audit Image 1</LabelWithRedAsterisk>
                  <Button
                    component="label"
                    role={undefined}
                    variant="outlined"
                    tabIndex={-1}
                    startIcon={<CloudUploadIcon />}
                    disabled={submit}
                    sx={{
                      justifyContent: 'flex-start',
                      textTransform: 'none',
                      borderStyle: 'dashed',
                      py: 1.5,
                    }}
                  >
                    {auditFormData.auditImage1 ? auditFormData.auditImage1.name : "Choose image"}
                    <VisuallyHiddenInput
                      type="file"
                      name="auditImage1"
                      accept="image/*"
                      onChange={handleAuditChange}
                      required
                    />
                  </Button>
                </Stack>
              </Grid>

              <Grid item xs={12} md={4}>
                <Stack spacing={1}>
                  <LabelWithRedAsterisk>Audit Image 2</LabelWithRedAsterisk>
                  <Button
                    component="label"
                    role={undefined}
                    variant="outlined"
                    tabIndex={-1}
                    startIcon={<CloudUploadIcon />}
                    disabled={submit}
                    sx={{
                      justifyContent: 'flex-start',
                      textTransform: 'none',
                      borderStyle: 'dashed',
                      py: 1.5,
                    }}
                  >
                    {auditFormData.auditImage2 ? auditFormData.auditImage2.name : "Choose image (optional)"}
                    <VisuallyHiddenInput
                      type="file"
                      name="auditImage2"
                      accept="image/*"
                      onChange={handleAuditChange}
                    />
                  </Button>
                </Stack>
              </Grid>

              <Grid item xs={12} md={4}>
                <Stack spacing={1}>
                  <LabelWithRedAsterisk>Audit Image 3</LabelWithRedAsterisk>
                  <Button
                    component="label"
                    role={undefined}
                    variant="outlined"
                    tabIndex={-1}
                    startIcon={<CloudUploadIcon />}
                    disabled={submit}
                    sx={{
                      justifyContent: 'flex-start',
                      textTransform: 'none',
                      borderStyle: 'dashed',
                      py: 1.5,
                    }}
                  >
                    {auditFormData.auditImage3 ? auditFormData.auditImage3.name : "Choose image (optional)"}
                    <VisuallyHiddenInput
                      type="file"
                      name="auditImage3"
                      accept="image/*"
                      onChange={handleAuditChange}
                    />
                  </Button>
                </Stack>
              </Grid>

              {/* Audit Form Actions */}
              <Grid item xs={12}>
                <Stack direction="row" spacing={2} justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setAuditFormData({
                        assetId: "",
                        auditorRemark: "",
                        auditImage1: null,
                        auditImage2: null,
                        auditImage3: null,
                      });
                    }}
                    disabled={submit}
                    sx={{ textTransform: 'none' }}
                  >
                    Clear Form
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleAuditSubmit}
                    disabled={submit || !auditFormData.auditorRemark.trim() || !auditFormData.auditImage1}
                    sx={{ textTransform: 'none' }}
                  >
                    {submit ? (
                      <>
                        <CircularProgress size={16} sx={{ mr: 1 }} />
                        Submitting...
                      </>
                    ) : (
                      'Submit Audit'
                    )}
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Audit History */}
      {data?.audits && data.audits.length > 0 && (
        <Card className="mb-5 sm:mb-6 rounded-2xl border border-slate-200 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.15)]">
          <CardHeader
            title={
              <Typography className="text-lg font-semibold">
                Audit History
              </Typography>
            }
          />
          <CardContent>
            <div className="space-y-4">
              {data.audits.map((audit, index) => (
                <div
                  key={audit._id || index}
                  className="p-4 rounded-lg border border-slate-200 bg-slate-50/50"
                >
                  <div className="mb-2">
                    <Typography variant="body2" className="font-medium text-slate-900">
                      Audit #{index + 1}
                    </Typography>
                    <Typography variant="caption" className="text-slate-500">
                      {audit.createdAt ? new Date(audit.createdAt).toLocaleDateString() : 'Date not available'}
                    </Typography>
                  </div>
                  <Typography variant="body2" className="text-slate-700 mb-3">
                    {audit.auditorRemark || 'No remarks provided'}
                  </Typography>
                  
                  {/* Audit Images */}
                  {(audit.auditImage1 || audit.auditImage2 || audit.auditImage3) && (
                    <div className="flex gap-2 flex-wrap">
                      {audit.auditImage1 && (
                        <img
                          src={audit.auditImage1}
                          alt={`Audit ${index + 1} - Image 1`}
                          className="w-20 h-20 object-cover rounded border border-slate-200 cursor-pointer hover:shadow-md transition"
                          onClick={() => setImageOpen({
                            image: audit.auditImage1,
                            name: `Audit ${index + 1} - Image 1`,
                            open: true
                          })}
                        />
                      )}
                      {audit.auditImage2 && (
                        <img
                          src={audit.auditImage2}
                          alt={`Audit ${index + 1} - Image 2`}
                          className="w-20 h-20 object-cover rounded border border-slate-200 cursor-pointer hover:shadow-md transition"
                          onClick={() => setImageOpen({
                            image: audit.auditImage2,
                            name: `Audit ${index + 1} - Image 2`,
                            open: true
                          })}
                        />
                      )}
                      {audit.auditImage3 && (
                        <img
                          src={audit.auditImage3}
                          alt={`Audit ${index + 1} - Image 3`}
                          className="w-20 h-20 object-cover rounded border border-slate-200 cursor-pointer hover:shadow-md transition"
                          onClick={() => setImageOpen({
                            image: audit.auditImage3,
                            name: `Audit ${index + 1} - Image 3`,
                            open: true
                          })}
                        />
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notification Component */}
      <SnackBar />
    </Container>
  );
}