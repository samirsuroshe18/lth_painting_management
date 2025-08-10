import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
  Grid,
  Stack,
  Avatar,
  CircularProgress,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { getAllLocations } from "../../api/locationApi";
import { useDispatch, useSelector } from "react-redux";
import { showNotificationWithTimeout } from "../../redux/slices/notificationSlice";
import { handleAxiosError } from "../../utils/handleAxiosError";
import { updateAsset, viewAsset } from "../../api/assetMasterApi";

const statusOptions = [
  { label: "Active", value: "Active" },
  { label: "Inactive", value: "Inactive" },
];

export default function EditAssetScreen() {
  const userData = useSelector((state) => state.auth.userData?.user);
  const [loading, setLoading] = useState(false);
  const [loadingAsset, setLoadingAsset] = useState(false);
  const [locations, setLocations] = useState(userData.location);
  const [yearError, setYearError] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { state } = useLocation();
  const initialAsset = state?.asset || {};
  const read = state?.read === true;
  const fromQrCode = state?.fromQrCode === true;
  const assetIdFromQrCode = state?.assetId;
  const [asset, setAsset] = useState({
    id: initialAsset._id,
    name: initialAsset.name || "",
    imageUrl: initialAsset.image || "",
    location: initialAsset.locationId?._id || "",
    place: initialAsset.place || "",
    currentValue: initialAsset.purchaseValue || "",
    year: dayjs().year(initialAsset.year),
    description: initialAsset.description || "",
    artist: initialAsset.artist || "",
    size: initialAsset.size || "",
    status: initialAsset.status === true ? "Active" : "Inactive",
  });

  const [imagePreview, setImagePreview] = useState(asset.imageUrl);

  // Fetch asset data when coming from QR code
  useEffect(() => {
    const fetchAssetFromQrCode = async () => {
      if (fromQrCode && assetIdFromQrCode) {
        try {
          setLoadingAsset(true);
          const response = await viewAsset(assetIdFromQrCode);
          const fetchedAsset = response.data;
          
          setAsset({
            id: fetchedAsset._id,
            name: fetchedAsset.name || "",
            imageUrl: fetchedAsset.image || "",
            location: fetchedAsset.locationId?._id || "",
            place: fetchedAsset.place || "",
            currentValue: fetchedAsset.purchaseValue || "",
            year: dayjs().year(fetchedAsset.year),
            description: fetchedAsset.description || "",
            artist: fetchedAsset.artist || "",
            size: fetchedAsset.size || "",
            status: fetchedAsset.status === true ? "Active" : "Inactive",
          });
          
          setImagePreview(fetchedAsset.image || "");
        } catch (error) {
          dispatch(
            showNotificationWithTimeout({
              show: true,
              type: "error",
              message: handleAxiosError(error),
            })
          );
          navigate(-1);
        } finally {
          setLoadingAsset(false);
        }
      }
    };

    fetchAssetFromQrCode();
  }, [fromQrCode, assetIdFromQrCode, dispatch, navigate]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image" && files && files[0]) {
      setAsset((prev) => ({ ...prev, image: files[0] }));
      setImagePreview(URL.createObjectURL(files[0]));
    } else {
      setAsset((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!asset.image && !imagePreview) {
      dispatch(
        showNotificationWithTimeout({
          show: true,
          type: "error",
          message: "Please upload an image.",
        })
      );
      return; // stop submission
    }

    if (!asset.year) {
      setYearError("Year is required.");
      return;
    }

    try {
      setLoading(true);
      const response = await updateAsset(asset);
      dispatch(
        showNotificationWithTimeout({
          show: true,
          type: "success",
          message: response.message,
        })
      );
    } catch (error) {
      setLoading(false);
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

  if (loadingAsset) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          bgcolor: "background.default",
        }}
      >
        <CircularProgress size={50} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        bgcolor: "background.default",
        p: { xs: 2, md: 4 },
        boxSizing: "border-box",
        height: "100vh",
      }}
    >
      <Typography variant="h5" fontWeight={700} mb={3} align="left">
        {fromQrCode ? "Edit Asset Details (from QR Code)" : "Edit Asset Details"}
      </Typography>

      <form onSubmit={handleSubmit} autoComplete="off">
        <Grid container spacing={4} sx={{ display: "flex" }}>
          <Grid item sx={{ flex: 1 }}>
            <Box sx={{ height: "100%" }}>
              <Stack spacing={3}>
                <TextField
                  name="name"
                  label="Asset Name"
                  value={asset.name}
                  onChange={handleChange}
                  required
                  fullWidth
                  autoFocus
                  slotProps={{
                    input: {
                      readOnly: read,
                    },
                  }}
                />

                <TextField
                  name="location"
                  label="Location"
                  select
                  value={asset.location}
                  onChange={handleChange}
                  required
                  slotProps={{
                    input: {
                      readOnly: read,
                    },
                  }}
                  fullWidth
                >
                  {locations.map((data) => (
                    <MenuItem value={data._id} key={data._id}>
                      {data.name}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  name="place"
                  label="Place"
                  value={asset.place}
                  onChange={handleChange}
                  required
                  fullWidth
                  slotProps={{
                    input: {
                      readOnly: read,
                    },
                  }}
                />

                <TextField
                  name="artist"
                  label="Artist"
                  value={asset.artist}
                  onChange={handleChange}
                  required
                  fullWidth
                  slotProps={{
                    input: {
                      readOnly: read,
                    },
                  }}
                />

                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar
                    src={imagePreview}
                    alt={asset.name}
                    sx={{ width: 65, height: 65, bgcolor: "#f2f2f2" }}
                    variant="rounded"
                  >
                    {asset.name?.[0]}
                  </Avatar>
                  <Box>
                    {!read && (
                      <label htmlFor="image-upload">
                        <Button variant="contained" component="span">
                          {imagePreview ? "Change Image" : "Upload Image *"}
                        </Button>
                        <input
                          type="file"
                          accept="image/*"
                          name="image"
                          id="image-upload"
                          hidden
                          onChange={handleChange}
                        />
                      </label>
                    )}
                    {imagePreview && (
                      <Typography variant="body2" mt={1}>
                        <a
                          href={imagePreview}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ textDecoration: "underline" }}
                        >
                          View Image
                        </a>
                      </Typography>
                    )}
                  </Box>
                </Stack>
              </Stack>
            </Box>
          </Grid>
          <Grid item sx={{ flex: 1 }}>
            <Box sx={{ height: "100%" }}>
              <Stack spacing={3}>
                <TextField
                  name="size"
                  label="Size"
                  value={asset.size}
                  onChange={handleChange}
                  required
                  placeholder="e.g. 10x20"
                  fullWidth
                  slotProps={{
                    input: {
                      readOnly: read,
                    },
                  }}
                />

                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label={"year"}
                    views={["year"]}
                    value={asset.year}
                    onChange={(value) => setAsset({ ...asset, year: value })}
                    minDate={dayjs("1500-01-01")}
                    maxDate={dayjs()}
                    disabled={read}
                    slotProps={{
                      textField: {
                        error: Boolean(yearError),
                        helperText: yearError,
                        required: true,
                      },
                    }}
                  />
                </LocalizationProvider>

                <TextField
                  name="currentValue"
                  label="Current Value"
                  type="number"
                  required
                  value={asset.currentValue}
                  onChange={handleChange}
                  fullWidth
                  slotProps={{
                    input: {
                      readOnly: read,
                    },
                  }}
                />

                <TextField
                  name="status"
                  label="Status"
                  select
                  required
                  value={asset.status}
                  onChange={handleChange}
                  fullWidth
                  slotProps={{
                    input: {
                      readOnly: read,
                    },
                  }}
                >
                  {statusOptions.map((option) => (
                    <MenuItem value={option.value} key={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  name="description"
                  label="Description"
                  value={asset.description}
                  onChange={handleChange}
                  required
                  multiline
                  rows={3}
                  fullWidth
                  slotProps={{
                    input: {
                      readOnly: read, // new approach
                    },
                  }}
                />
              </Stack>
            </Box>
          </Grid>
        </Grid>
        {/* Action Buttons */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          mt={4}
          justifyContent="flex-end"
          alignItems={{ xs: "stretch", sm: "center" }}
        >
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => navigate(-1)}
            fullWidth={window.innerWidth < 600}
          >
            Cancel
          </Button>
          {!read && (
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth={window.innerWidth < 600}
              disabled={loading}
            >
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: "72px",
                  height: "24px",
                }}
              >
                {loading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  "Save Changes"
                )}
              </Box>
            </Button>
          )}
        </Stack>
      </form>
    </Box>
  );
}
