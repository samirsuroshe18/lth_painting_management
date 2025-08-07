import { useEffect, useState } from "react";
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
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import { getAllLocations } from "../../api/locationApi";
import { createNewAsset } from "../../api/assetMasterApi";
import { useDispatch } from "react-redux";
import { showNotificationWithTimeout } from "../../redux/slices/notificationSlice";
import { handleAxiosError } from "../../utils/handleAxiosError";
import { useNavigate } from "react-router-dom";

const statusOptions = [
  { label: "Active", value: "Active" },
  { label: "Inactive", value: "Inactive" },
];

function CreateAsset() {
  const [loading, setLoading] = useState(false);
  const [fileImage, setFileImage] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [asset, setAsset] = useState({
    name: "",
    image: null,
    location: "",
    place: "",
    currentValue: null,
    year: null,
    description: "",
    artist: "",
    size: "",
    status: "",
  });

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const data = await getAllLocations();
        if (data?.success && Array.isArray(data.data)) {
          setLocations(data.data);
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

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image" && files && files[0]) {
      setAsset((prev) => ({ ...prev, image: files[0] }));
      const imageUrl = URL.createObjectURL(files[0]); // Create an object URL for the image
      setFileImage(imageUrl);
    } else {
      setAsset((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      setLoading(true);
      const response = await createNewAsset(asset);
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
        Create New Asset
      </Typography>

      <form onSubmit={loading ? null : handleSubmit} autoComplete="off">
        <Grid container spacing={4} sx={{ display: "flex" }}>
          <Grid sx={{ flex: 1 }}>
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
                />
                <TextField
                  name="location"
                  label="Location"
                  select
                  value={asset.location}
                  onChange={handleChange}
                  required
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
                />
                <TextField
                  name="artist"
                  label="Artist"
                  value={asset.artist}
                  required
                  onChange={handleChange}
                  fullWidth
                />
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar
                    src={fileImage}
                    alt={asset.name}
                    sx={{
                      width: 65,
                      height: 65,
                      bgcolor: (theme) => theme.palette.primary, // adjusts with theme
                      color: (theme) => theme.palette.text.primary,
                    }}
                    variant="rounded"
                  >
                    {!fileImage && <AddPhotoAlternateIcon />}
                  </Avatar>
                  <Box>
                    <label htmlFor="image-upload">
                      <Button variant="contained" component="span">
                        {asset.image ? "Change Image" : "Upload Image"}
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
                    {fileImage && (
                      <Typography variant="body2" mt={1}>
                        <a
                          href={fileImage}
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
          <Grid sx={{ flex: 1 }}>
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
                />
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label={"year *"}
                    views={["year"]}
                    value={asset.year}
                    onChange={(value)=>setAsset({...asset, year: value})}  
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
                />
                <TextField
                  name="status"
                  label="Status"
                  select
                  required
                  value={asset.status}
                  onChange={handleChange}
                  fullWidth
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
                "Submit"
              )}
            </Box>
          </Button>
        </Stack>
      </form>
    </Box>
  );
}

export default CreateAsset;
