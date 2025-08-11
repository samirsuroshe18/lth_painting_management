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

export default function ScannedAsset() {
  const { id } = useParams();
  const isAdmin = useSelector((state) => state.admin.admin);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);
  const [submit, setSubmit] = useState(false);
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
      <div className="min-h-[50vh] grid place-items-center">
        <div className="flex items-center gap-3 text-slate-500">
          <CircularProgress size={20} />
          <span className="text-sm">Loading asset…</span>
        </div>
      </div>
    );
  }
  if (!data?.asset)
    return (
      <div className="p-6 text-center text-slate-500">Asset not found</div>
    );

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

            <div className="sm:col-span-2">
              <Row
                label="Description"
                value={
                  <TextField
                    fullWidth
                    size="small"
                    multiline
                    minRows={3} // show 3 lines by default
                    maxRows={3} // fix height so it doesn't grow beyond 3 lines
                    value={data.asset.description}
                    variant="outlined"
                    slotProps={{
                      readOnly: true,
                      sx: {
                        border: "none",
                        "& .MuiOutlinedInput-notchedOutline": {
                          border: "none",
                        },
                        overflowY: "auto", // enable vertical scroll
                        resize: "none", // disable resize handle
                        whiteSpace: "pre-wrap", // preserve line breaks and wrap
                      },
                    }}
                  />
                }
              />
            </div>

            <div className="sm:col-span-2">
              <Row
                label="Image"
                value={
                  <div className="group">
                    <img
                      src={data.asset.image}
                      alt={data.asset.name}
                      className="w-full sm:w-72 h-auto sm:h-44 object-cover rounded-xl border border-slate-200 shadow-sm ring-1 ring-transparent group-hover:shadow-md group-hover:ring-slate-200 transition"
                    />
                    <div className="mt-1 text-[11px] text-slate-500">
                      Tap to zoom (long-press)
                    </div>
                  </div>
                }
              />
            </div>

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
                      variant="outlined"
                      component="label"
                      className="w-full sm:w-auto !rounded-xl"
                    >
                      Choose File
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        name={key}
                        onChange={handleChange}
                      />
                    </Button>
                    {formData[key] && (
                      <img
                        src={URL.createObjectURL(formData[key])}
                        alt={label}
                        className="w-full sm:w-72 h-auto sm:h-44 object-cover rounded-xl border border-slate-200"
                      />
                    )}
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500">
                    PNG, JPG or JPEG
                  </div>
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
      <div className="relative rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
        {typeof value === "string" || typeof value === "number" ? (
          <span className="text-slate-700">{value}</span>
        ) : (
          value
        )}
      </div>
    </div>
  );
}