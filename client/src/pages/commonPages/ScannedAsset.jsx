import { useEffect, useState } from "react";
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
} from "@mui/material";
import { AlertTriangle } from "lucide-react";
import { showNotificationWithTimeout } from "../../redux/slices/notificationSlice";
import { useDispatch, useSelector } from "react-redux";
import { handleAxiosError } from "../../utils/handleAxiosError";
import { viewAssetPublic } from "../../api/assetMasterApi";
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

export default function ScannedAsset() {
  const { id } = useParams();
  const isAdmin = useSelector((state) => state.admin.admin);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [submit, setSubmit] = useState(false);
  const [imageOpen, setImageOpen] = useState({
    image:null,
    open: false,
    name: null,
  });
  const [data, setData] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [formData, setFormData] = useState({
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
    },
    assetImage: null,
    auditImage1: null,
    auditImage2: null,
    auditImage3: null,
  });

  const handleChange = (e) => {
    console.log({ e });
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
      },
      assetImage: null,
      auditImage1: null,
      auditImage2: null,
      auditImage3: null,
    });

  const handleSubmit = async () => {
    if (!formData.auditorRemark.trim()) return alert("Remarks are required");
    if (!formData.auditImage1) return alert("Image 1 is required");

    const payload = { ...formData, assetId: data?.asset?._id };
    try {
      setSubmit(true);
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
            We couldn’t locate the asset you’re looking for. It may have been
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

            {/* <Row
              label="Image"
              value={
                <a
                  href={data.asset.image}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group"
                >
                  <img
                    src={data.asset.image}
                    alt={data.asset.name}
                    className="w-40 h-28 object-cover rounded-lg border border-slate-200 shadow-sm transition group-hover:shadow-md"
                  />
                  <div className="mt-1 text-[11px] text-slate-500">
                    Open in new tab
                  </div>
                </a>
              }
            /> */}

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

            <Row label="Location" value={data.asset.locationId?.name || "-"} />
            <Row label="Area" value={data.asset.locationId?.area || "-"} />
            <Row label="Size" value={data.asset.size || "-"} />
            <Row label="Place" value={data.asset.place || "-"} />
            <Row
              label="Purchase Value"
              value={data.asset.purchaseValue ?? "-"}
            />
            <Row label="Artist" value={data.asset.artist || "-"} />
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
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
                <TextField
                  fullWidth
                  size="small"
                  label="Name"
                  name="name"
                  value={formData.proposedChanges.name}
                  onChange={handleChange}
                />
                <TextField
                  fullWidth
                  size="small"
                  label="Place"
                  name="place"
                  value={formData.proposedChanges.place}
                  onChange={handleChange}
                />

                <div className="sm:col-span-2">
                  <TextField
                    fullWidth
                    size="small"
                    label="Description"
                    multiline
                    minRows={3}
                    name="description"
                    value={formData.proposedChanges.description}
                    onChange={handleChange}
                  />
                </div>

                <div className="sm:col-span-2">
                  <div className="space-y-2">
                    <Button
                      variant="outlined"
                      component="label"
                      className="w-full sm:w-auto !rounded-xl"
                    >
                      Choose Image
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        name="assetImage"
                        onChange={handleChange}
                      />
                    </Button>
                    {formData.assetImage && (
                      <img
                        src={URL.createObjectURL(formData.assetImage)}
                        alt="Preview"
                        className="w-full sm:w-72 h-auto sm:h-44 object-cover rounded-xl border border-slate-200"
                      />
                    )}
                    <div className="text-[11px] text-slate-500">
                      PNG, JPG or JPEG
                    </div>
                  </div>
                </div>

                <TextField
                  name="location"
                  label="Location"
                  select
                  value={formData.proposedChanges.location || ""}
                  onChange={handleChange}
                  required
                  fullWidth
                  size="small"
                >
                  {data.locations.map((loc) => (
                    <MenuItem value={loc._id} key={loc._id}>
                      {loc.name}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  fullWidth
                  size="small"
                  label="Size"
                  name="size"
                  value={formData.proposedChanges.size}
                  onChange={handleChange}
                />
                <TextField
                  fullWidth
                  size="small"
                  label="Purchase Value"
                  name="purchaseValue"
                  value={formData.proposedChanges.purchaseValue}
                  onChange={handleChange}
                />
                <TextField
                  fullWidth
                  size="small"
                  label="Artist"
                  name="artist"
                  value={formData.proposedChanges.artist}
                  onChange={handleChange}
                />

                <div>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Year"
                      views={["year"]}
                      value={formData.proposedChanges.year || null}
                      minDate={dayjs("1500-01-01")}
                      maxDate={dayjs()}
                      onChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          proposedChanges: {
                            ...prev.proposedChanges,
                            year: value,
                          },
                        }))
                      }
                      slotProps={{
                        textField: { className: "w-full", size: "small" },
                      }}
                    />
                  </LocalizationProvider>
                </div>
              </div>
            </CardContent>

            {/* Sticky action bar on mobile for better UX */}
            <div className="sticky bottom-3 z-10 px-4">
              <div className="rounded-xl border border-slate-200 bg-white/90 p-2 shadow-lg backdrop-blur">
                <Button
                  variant="contained"
                  className="w-full !rounded-xl !py-2.5 !text-[15px] !shadow-md hover:!shadow-lg transition"
                  onClick={handleSubmit}
                  disabled={submit}
                >
                  <Box className="inline-flex items-center justify-center min-w-24 h-6">
                    {submit ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      "Save Changes"
                    )}
                  </Box>
                </Button>
              </div>
            </div>
          </Card>
        </Collapse>
      )}

      {/* Audit panel */}
      {isAdmin && (
        <Card className="rounded-2xl border border-slate-200 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.15)]">
          <CardHeader
            title={
              <Typography className="text-lg font-semibold">
                Audit Update
              </Typography>
            }
            subheader={
              <span className="text-sm text-slate-500">
                Attach remarks and photos
              </span>
            }
          />
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:gap-5">
              <TextField
                fullWidth
                required
                multiline
                minRows={3}
                size="small"
                label="Remarks"
                placeholder="Type your description..."
                name="auditorRemark"
                value={formData.auditorRemark}
                onChange={handleChange}
              />

              {[
                { key: "auditImage1", label: "Image 1 *" },
                { key: "auditImage2", label: "Image 2" },
                { key: "auditImage3", label: "Image 3" },
              ].map(({ key, label }) => (
                <div key={key}>
                  <div className="mb-1 text-sm text-slate-700">{label}</div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button
                      component="label"
                      role={undefined}
                      variant="contained"
                      tabIndex={-1}
                      startIcon={<CloudUploadIcon />}
                    >
                      Upload files
                      <VisuallyHiddenInput
                        type="file"
                        accept="image/*"
                        name={key}
                        onChange={handleChange}
                      />
                    </Button>
                    {formData[key] && (
                      <div className="relative inline-block">
                        <p className="text-sm text-gray-500 mb-1">Preview:</p>

                        <div className="relative w-40 h-28">
                          <img
                            
                            src={URL.createObjectURL(formData[key])}
                            onClick={() => setImageOpen({image: URL.createObjectURL(formData[key]), name: key, open: true})}
                            alt="Selected"
                            className="w-full h-full object-cover rounded-lg border border-slate-200 shadow-sm cursor-pointer"
                          />

                          {/* Remove Button - always visible for mobile */}
                          <button
                            type="button"
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                [key]: null,
                              }))
                            }
                            className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white text-xs px-1.5 py-0.5 rounded shadow"
                          >
                            ✕
                          </button>
                        </div>

                        <div className="mt-1 text-[11px] text-slate-500">
                          Tap image to enlarge
                        </div>
                      </div>
                    )}
                  </div>
                  {!formData[key] && (
                    <div className="mt-1 text-[11px] text-slate-500">
                      PNG, JPG or JPEG
                    </div>
                  )}
                </div>
              ))}

              <div>
                <Button
                  variant="contained"
                  color="primary"
                  className="w-full sm:w-auto !rounded-xl !shadow-md hover:!shadow-lg transition"
                  disabled={submit}
                  onClick={handleSubmit}
                >
                  <Box className="inline-flex items-center justify-center min-w-24 h-6">
                    {submit ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      "Edit & Save"
                    )}
                  </Box>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      <SnackBar />
    </Container>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
      <div className="text-[13px] font-semibold text-slate-600 sm:min-w-[160px]">
        {label}
      </div>
      <div className="relative bg-white">
        {typeof value === "string" || typeof value === "number" ? (
          <span className="text-slate-700">{value}</span>
        ) : (
          value
        )}
      </div>
    </div>
  );
}
