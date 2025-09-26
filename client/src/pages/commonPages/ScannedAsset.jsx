import { useEffect, useState, Fragment } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
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
  Box,
} from "@mui/material";
import { AlertTriangle } from "lucide-react";
import { showNotificationWithTimeout } from "../../redux/slices/notificationSlice";
import { useDispatch, useSelector } from "react-redux";
import { handleAxiosError } from "../../utils/handleAxiosError";
import { viewAssetPublic } from "../../api/assetMasterApi";
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
import LabelWithRedAsterisk from "../../components/LabelWithRedAsterisk";
import { getCurrentUser } from "../../api/authApi";
import Row from "../../components/Row";

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

export default function ScannedAsset() {
  const { id } = useParams();
  const isAdmin = useSelector((state) => state.admin.admin);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [submit, setSubmit] = useState(false);
  const [data, setData] = useState(null);
  const [imageOpen, setImageOpen] = useState({
    image: null,
    open: false,
    name: null,
  });
  const [showEditForm, setShowEditForm] = useState(false);
  const [locations, setLocations] = useState([]);
  const [formData, setFormData] = useState({
    assetId: "",
    auditorRemark: "",
    proposedChanges: {
      name: "",
      description: "",
      purchaseValue: "",
      locationId: "",
      departmentId: "",
      buildingId: "",
      floorId: "",
      year: null,
      artist: "",
      size: "",
    },
    assetImage: null,
    auditImage1: null,
    auditImage2: null,
    auditImage3: null,
  });
  const [sizeWidth, setSizeWidth] = useState("");
  const [sizeHeight, setSizeHeight] = useState("");
  const [departmentOpen, setDepartmentOpen] = useState(false);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [departmentLoading, setDepartmentLoading] = useState(false);
  const [buildingOpen, setBuildingOpen] = useState(false);
  const [buildingOptions, setBuildingOptions] = useState([]);
  const [buildingLoading, setBuildingLoading] = useState(false);
  const [floorOpen, setFloorOpen] = useState(false);
  const [floorOptions, setFloorOptions] = useState([]);
  const [floorLoading, setFloorLoading] = useState(false);

  const handleSizeChange = (width, height) => {
    setSizeWidth(width);
    setSizeHeight(height);
    const sizeString = width && height ? `${width} × ${height} inches` : "";
    setFormData((prev) => ({ ...prev, size: sizeString }));
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files && files.length > 0) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else if (name in formData.proposedChanges) {
      setFormData((prev) => ({
        ...prev,
        proposedChanges: { ...prev.proposedChanges, [name]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await getCurrentUser();
        setLocations(res?.data?.user?.location || []);
      } catch (error) {
        setLocations([]);
        dispatch(
          showNotificationWithTimeout({
            show: true,
            type: "error",
            message: handleAxiosError(error),
          })
        );
      }
    };

    if (isAdmin) {
      checkAuth();
    }
  }, [isAdmin]);

  const handleDepartmentOpen = () => {
    setDepartmentOpen(true);

    if (departmentOptions.length === 0) {
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
    }
  };

  const handleDepartmentClose = () => {
    setDepartmentOpen(false);
  };

  const handleBuildingOpen = () => {
    setBuildingOpen(true);

    if (buildingOptions.length === 0) {
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
    }
  };

  const handleBuildingClose = () => {
    setBuildingOpen(false);
  };

  const handleFloorOpen = () => {
    setFloorOpen(true);

    if (floorOptions) {
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
    }
  };

  const handleFloorClose = () => {
    setFloorOpen(false);
  };

  useEffect(() => {
    const fetchAssetDetails = async () => {
      try {
        setLoading(true);
        const response = await viewAssetPublic(id);
        setData(response.data);
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

  const resetForm = () =>
    setFormData({
      assetId: "",
      auditorRemark: "",
      proposedChanges: {
        name: "",
        description: "",
        purchaseValue: "",
        location: "",
        year: null,
        artist: "",
        place: "",
        size: "",
        department: "",
        building: "",
        floor: "",
      },
      assetImage: null,
      auditImage1: null,
      auditImage2: null,
      auditImage3: null,
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmit(true);
      const payload = { ...formData, assetId: data?.asset?._id };
      const response = await submitAudit(payload);
      setShowEditForm(false);
      resetForm();
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
                    onClick={() => navigate("/create-new-asset")}
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
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Row
                label="Image"
                value={
                  <div
                    className="group cursor-pointer"
                    onClick={() =>
                      setImageOpen({
                        image: data.asset.image,
                        name: data.asset.name,
                        open: true,
                      })
                    }
                  >
                    <img
                      src={data.asset.image}
                      alt={data.asset.name}
                      className="w-full h-40 object-cover rounded-md"
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
                  <Button
                    onClick={() =>
                      setImageOpen((prev) => ({ ...prev, open: false }))
                    }
                    className="absolute top-4 right-4 text-white text-xl"
                  >
                    ✕
                  </Button>
                </div>
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Row label="Asset" value={data?.asset?.name || "-"} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Row label="Description" value={data.asset.description || "-"} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Row
                label="Purchase Value"
                value={data.asset.purchaseValue ?? "-"}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Row label="Artist" value={data.asset.artist || "-"} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Row
                label="Size"
                value={
                  data.asset.size
                    ? `${data.asset.size} ${data.asset.unit || "inches"}`
                    : "-"
                }
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Row label="Year" value={data.asset.year || "-"} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Row
                label="Location"
                value={data.asset.locationId?.name || "-"}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Row
                label="State"
                value={data.asset.locationId?.stateId?.name || "-"}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Row
                label="City"
                value={data.asset.locationId?.cityId?.name || "-"}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Row
                label="Area"
                value={data.asset.locationId?.areaId?.name || "-"}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Row
                label="Department"
                value={data.asset.departmentId?.name || "-"}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Row
                label="Building"
                value={data.asset.buildingId?.name || "-"}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Row label="Floor" value={data.asset.floorId?.name || "-"} />
            </Grid>
          </Grid>
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
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Stack spacing={1}>
                      <LabelWithRedAsterisk>Name</LabelWithRedAsterisk>
                      <TextField
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        fullWidth
                        size="small"
                        placeholder="Enter name"
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
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Stack spacing={1}>
                      <LabelWithRedAsterisk>Artist</LabelWithRedAsterisk>
                      <TextField
                        name="artist"
                        value={formData.artist}
                        onChange={handleChange}
                        fullWidth
                        size="small"
                        placeholder="Enter artist name"
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
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Stack spacing={1}>
                      <LabelWithRedAsterisk>Location</LabelWithRedAsterisk>
                      <Autocomplete
                        value={
                          locations.find(
                            (location) => location._id === formData.locationId
                          ) || null
                        }
                        options={locations}
                        getOptionLabel={(option) => option?.name || ""}
                        onChange={(event, newValue) => {
                          setFormData((prev) => ({
                            ...prev,
                            locationId: newValue?._id || "",
                          }));
                        }}
                        noOptionsText="No locations available"
                        sx={{ mt: 1 }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            placeholder="Search location..."
                            size="small"
                          />
                        )}
                      />
                    </Stack>
                  </Grid>

                  {/* Department */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Stack spacing={1}>
                      <LabelWithRedAsterisk>Department</LabelWithRedAsterisk>
                      <Autocomplete
                        open={departmentOpen}
                        onOpen={handleDepartmentOpen}
                        onClose={handleDepartmentClose}
                        value={
                          departmentOptions.find(
                            (option) => option._id === formData.departmentId
                          ) || null
                        }
                        loading={departmentLoading}
                        options={departmentOptions}
                        getOptionLabel={(option) => option?.name || ""}
                        disabled={loading}
                        noOptionsText="No departments available"
                        ListboxProps={{
                          style: {
                            maxHeight: 200,
                          },
                        }}
                        onChange={(e, newValue) =>
                          setFormData((prev) => ({
                            ...prev,
                            departmentId: newValue?._id || "",
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
                                      <CircularProgress
                                        color="inherit"
                                        size={20}
                                      />
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
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Stack spacing={1}>
                      <LabelWithRedAsterisk>Building Name</LabelWithRedAsterisk>
                      <Autocomplete
                        open={buildingOpen}
                        onOpen={handleBuildingOpen}
                        onClose={handleBuildingClose}
                        value={
                          buildingOptions.find(
                            (option) => option._id === formData.buildingId
                          ) || null
                        }
                        loading={buildingLoading}
                        options={buildingOptions}
                        getOptionLabel={(option) => option?.name || ""}
                        disabled={loading}
                        noOptionsText="No buildings available"
                        ListboxProps={{
                          style: {
                            maxHeight: 200,
                          },
                        }}
                        onChange={(e, newValue) =>
                          setFormData((prev) => ({
                            ...prev,
                            buildingId: newValue?._id || "",
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
                                      <CircularProgress
                                        color="inherit"
                                        size={20}
                                      />
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
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Stack spacing={1}>
                      <LabelWithRedAsterisk>Floor</LabelWithRedAsterisk>
                      <Autocomplete
                        open={floorOpen}
                        onOpen={handleFloorOpen}
                        onClose={handleFloorClose}
                        value={
                          floorOptions.find(
                            (option) => option._id === formData.floorId
                          ) || null
                        }
                        loading={floorLoading}
                        options={floorOptions}
                        getOptionLabel={(option) => option?.name || ""}
                        disabled={loading}
                        noOptionsText="No floors available"
                        ListboxProps={{
                          style: {
                            maxHeight: 200,
                          },
                        }}
                        onChange={(e, newValue) =>
                          setFormData((prev) => ({
                            ...prev,
                            floorId: newValue?._id || "",
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
                                      <CircularProgress
                                        color="inherit"
                                        size={20}
                                      />
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
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Stack spacing={1}>
                      <LabelWithRedAsterisk>
                        Purchase Value
                      </LabelWithRedAsterisk>
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
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Stack spacing={1}>
                      <LabelWithRedAsterisk>Size (inches)</LabelWithRedAsterisk>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <TextField
                          value={sizeWidth}
                          onChange={(e) =>
                            handleSizeChange(e.target.value, sizeHeight)
                          }
                          size="small"
                          placeholder="Width"
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
                        <Typography
                          variant="body1"
                          sx={{ mx: 1, fontWeight: 600 }}
                        >
                          x
                        </Typography>
                        <TextField
                          value={sizeHeight}
                          onChange={(e) =>
                            handleSizeChange(sizeWidth, e.target.value)
                          }
                          size="small"
                          placeholder="Height"
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
                      </Stack>
                    </Stack>
                  </Grid>

                  {/* Year */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Stack spacing={1}>
                      <LabelWithRedAsterisk>Year</LabelWithRedAsterisk>
                      <DatePicker
                        value={formData.year}
                        onChange={(newValue) =>
                          setFormData((prev) => ({ ...prev, year: newValue }))
                        }
                        views={["year"]}
                        disabled={loading}
                        slotProps={{
                          textField: {
                            size: "small",
                            placeholder: "Select year",
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
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Stack spacing={1}>
                      <LabelWithRedAsterisk>Status</LabelWithRedAsterisk>
                      <FormControl fullWidth>
                        <Select
                          name="status"
                          value={formData.status}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              status: e.target.value,
                            }))
                          }
                          displayEmpty
                          size="small"
                          renderValue={(selected) => {
                            if (selected === "") {
                              return (
                                <span style={{ color: "#999" }}>
                                  Select status
                                </span>
                              );
                            }
                            return selected == "active" ? "Active" : "Inactive";
                          }}
                        >
                          <MenuItem value="active">Active</MenuItem>
                          <MenuItem value="inactive">Inactive</MenuItem>
                        </Select>
                      </FormControl>
                    </Stack>
                  </Grid>

                  {/* Description */}
                  <Grid size={{ xs: 12, md: 6 }}>
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
                  <Grid size={{ xs: 12, md: 6 }}>
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
                          justifyContent: "flex-start",
                          textTransform: "none",
                          borderStyle: "dashed",
                          py: 1.5,
                        }}
                      >
                        {formData.image
                          ? formData.image.name
                          : "Choose new image (optional)"}
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
            <Box component="form" onSubmit={loading ? null : handleSubmit}>
              <Grid container spacing={3}>
                {/* Auditor Remarks */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Stack spacing={1}>
                    <LabelWithRedAsterisk required>
                      Auditor Remarks
                    </LabelWithRedAsterisk>
                    <TextField
                      name="auditorRemark"
                      value={formData.auditorRemark}
                      onChange={handleChange}
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
                <Grid size={{ xs: 12, md: 6 }}>
                  <Stack spacing={1}>
                    <LabelWithRedAsterisk required>
                      Audit Image 1
                    </LabelWithRedAsterisk>
                    <Button
                      component="label"
                      role={undefined}
                      variant="outlined"
                      tabIndex={-1}
                      startIcon={<CloudUploadIcon />}
                      disabled={submit}
                      sx={{
                        justifyContent: "flex-start",
                        textTransform: "none",
                        borderStyle: "dashed",
                        py: 1.5,
                      }}
                    >
                      {formData.auditImage1
                        ? formData.auditImage1.name
                        : "Choose image"}
                      <VisuallyHiddenInput
                        type="file"
                        name="auditImage1"
                        accept="image/*"
                        onChange={handleChange}
                        required
                      />
                    </Button>
                  </Stack>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
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
                        justifyContent: "flex-start",
                        textTransform: "none",
                        borderStyle: "dashed",
                        py: 1.5,
                      }}
                    >
                      {formData.auditImage2
                        ? formData.auditImage2.name
                        : "Choose image (optional)"}
                      <VisuallyHiddenInput
                        type="file"
                        name="auditImage2"
                        accept="image/*"
                        onChange={handleChange}
                      />
                    </Button>
                  </Stack>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
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
                        justifyContent: "flex-start",
                        textTransform: "none",
                        borderStyle: "dashed",
                        py: 1.5,
                      }}
                    >
                      {formData.auditImage3
                        ? formData.auditImage3.name
                        : "Choose image (optional)"}
                      <VisuallyHiddenInput
                        type="file"
                        name="auditImage3"
                        accept="image/*"
                        onChange={handleChange}
                      />
                    </Button>
                  </Stack>
                </Grid>

                {/* Audit Form Actions */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Stack direction="row" spacing={2} justifyContent="flex-end">
                    <Button
                      variant="outlined"
                      onClick={resetForm}
                      disabled={submit}
                      sx={{ textTransform: "none" }}
                    >
                      Reset
                    </Button>
                    <Button
                      type="submit"
                      variant="outlined"
                      sx={{ textTransform: "none" }}
                    >
                      {submit ? (
                        <>
                          <CircularProgress size={16} sx={{ mr: 1 }} />
                          Submitting...
                        </>
                      ) : (
                        "Submit Audit"
                      )}
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Loading Overlay */}
      {submit && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: "rgba(0, 0, 0, 0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <Card sx={{ p: 3, textAlign: "center", mx: 2, maxWidth: 400 }}>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography variant="h6" fontWeight={500}>
              Submiting Audit...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please wait while we process your request
            </Typography>
          </Card>
        </Box>
      )}

      {/* Notification Component */}
      <SnackBar />
    </Container>
  );
}
