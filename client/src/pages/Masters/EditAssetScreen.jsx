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
import { useDispatch } from "react-redux";
import { showNotificationWithTimeout } from "../../redux/slices/notificationSlice";
import { handleAxiosError } from "../../utils/handleAxiosError";
import { updateAsset } from "../../api/assetMasterApi";

const statusOptions = [
  { label: "Active", value: "Active" },
  { label: "Inactive", value: "Inactive" },
];

export default function EditAssetScreen() {
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { state } = useLocation();
  const initialAsset = state?.asset || {};
  const read = state?.read === true;
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

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image" && files && files[0]) {
      setAsset((prev) => ({ ...prev, image: files[0] }));
      setImagePreview(URL.createObjectURL(files[0]));
    } else {
      setAsset((prev) => ({ ...prev, [name]: value }));
    }
  };

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await getAllLocations();
        if (response?.success && Array.isArray(response.data)) {
          setLocations(response.data);
        }
      } catch (error) {
        dispatch(
          showNotificationWithTimeout({
            show: true,
            type: "error",
            message: handleAxiosError(error),
          })
        );
        setLocations([]);
      }
    };

    fetchLocations();
  }, []);

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
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
        Edit Asset Details
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
                      readOnly: read, // new approach
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
                      readOnly: read, // new approach
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
                      readOnly: read, // new approach
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
                      readOnly: read, // new approach
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
                          {imagePreview ? "Change Image" : "Upload Image"}
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
                      readOnly: read, // new approach
                    },
                  }}
                />
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label={"year *"}
                    views={["year"]}
                    value={asset.year}
                    onChange={(value) => setAsset({ ...asset, year: value })}
                    minDate={dayjs("1500-01-01")}
                    maxDate={dayjs()}
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
                      readOnly: read, // new approach
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
                      readOnly: read, // new approach
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
