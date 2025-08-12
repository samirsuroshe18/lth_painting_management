import { useState } from "react";
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
  Paper,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import { createNewAsset } from "../../api/assetMasterApi";
import { useDispatch } from "react-redux";
import { showNotificationWithTimeout } from "../../redux/slices/notificationSlice";
import { handleAxiosError } from "../../utils/handleAxiosError";
import { useLocation, useNavigate } from "react-router-dom";

const CreateNewAsset = () => {
  const { state } = useLocation();
  const locations = state?.locations || [];
  const [loading, setLoading] = useState(false);
  const [fileImage, setFileImage] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [yearError, setYearError] = useState("");
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const [asset, setAsset] = useState({
    name: "",
    image: null,
    location: "",
    place: "",
    currentValue: "",
    year: null,
    description: "",
    artist: "",
    size: "",
    status: "",
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image" && files && files[0]) {
      setAsset((prev) => ({ ...prev, image: files[0] }));
      setFileImage(URL.createObjectURL(files[0]));
    } else {
      setAsset((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!asset.image) {
      dispatch(
        showNotificationWithTimeout({
          show: true,
          type: "error",
          message: "Please upload an image.",
        })
      );
      return;
    }

    if (!asset.year) {
      setYearError("Year is required.");
      return;
    }

    try {
      setLoading(true);
      const response = await createNewAsset(asset);
      dispatch(
        showNotificationWithTimeout({
          show: true,
          type: "success",
          message: response.message,
        })
      );
      setSuccessDialogOpen(true);
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

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "background.default", minHeight: "100vh" }}>
      <Paper
        elevation={3}
        sx={{
          maxWidth: "900px",
          mx: "auto",
          p: { xs: 2, sm: 3, md: 4 },
          borderRadius: 3,
        }}
      >
        <Typography 
          variant="h5" 
          fontWeight={700} 
          mb={3}
          sx={{ 
            fontSize: { xs: "1.25rem", sm: "1.5rem" },
            textAlign: { xs: "center", sm: "left" }
          }}
        >
          Create New Asset
        </Typography>

        <form onSubmit={loading ? null : handleSubmit} autoComplete="off">
          <Grid container spacing={3}>
            {/* Left Column */}
            <Grid item xs={12} md={6}>
              <Stack spacing={3}>
                <TextField
                  name="name"
                  label="Asset Name"
                  value={asset.name}
                  onChange={handleChange}
                  required
                  fullWidth
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
                  onChange={handleChange}
                  required
                  fullWidth
                />

                {/* Image Upload */}
                <Box
                  sx={{
                    border: "2px dashed",
                    borderColor: "grey.400",
                    borderRadius: 2,
                    p: 2,
                    textAlign: "center",
                  }}
                >
                  <Avatar
                    src={fileImage}
                    alt={asset.name}
                    variant="rounded"
                    sx={{
                      width: 80,
                      height: 80,
                      mx: "auto",
                      mb: 1,
                      bgcolor: "grey.100",
                    }}
                  >
                    {!fileImage && <AddPhotoAlternateIcon fontSize="large" />}
                  </Avatar>
                  <label htmlFor="image-upload">
                    <Button variant="contained" component="span">
                      {asset.image ? "Change Image" : "Upload Image *"}
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
                </Box>
              </Stack>
            </Grid>

            {/* Right Column */}
            <Grid item xs={12} md={6}>
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
                    label="Year"
                    views={["year"]}
                    value={asset.year}
                    minDate={dayjs("1500-01-01")}
                    maxDate={dayjs()}
                    onChange={(value) => {
                      setAsset({ ...asset, year: value });
                      setYearError("");
                    }}
                    slotProps={{
                      textField: {
                        error: Boolean(yearError),
                        helperText: yearError,
                        required: true,
                        fullWidth: true,
                      },
                    }}
                  />
                </LocalizationProvider>

                <TextField
                  name="currentValue"
                  label="Current Value"
                  type="number"
                  value={asset.currentValue}
                  onChange={handleChange}
                  required
                  fullWidth
                />

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
            </Grid>
          </Grid>

          {/* Buttons */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            mt={4}
            justifyContent="flex-end"
          >
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => navigate(-1)}
              fullWidth={isMobile}
              sx={{ order: { xs: 2, sm: 1 } }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth={isMobile}
              disabled={loading}
              sx={{ order: { xs: 1, sm: 2 } }}
            >
              {loading ? <CircularProgress size={20} color="inherit" /> : "Submit"}
            </Button>
          </Stack>
        </form>
      </Paper>

      {/* Success Dialog */}
      <Dialog 
        open={successDialogOpen} 
        onClose={() => setSuccessDialogOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            mx: { xs: 2, sm: 0 },
            width: { xs: "calc(100% - 32px)", sm: "auto" }
          }
        }}
      >
        <DialogTitle>Asset Created</DialogTitle>
        <DialogContent>
          <Typography>Your asset has been created successfully.</Typography>
        </DialogContent>
        <DialogActions
          sx={{
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 1, sm: 0 },
            p: { xs: 2, sm: 3 }
          }}
        >
          <Button
            onClick={() => {
              setSuccessDialogOpen(false);
              navigate(-1);
            }}
            color="primary"
            variant="outlined"
            fullWidth={isMobile}
          >
            Go Back
          </Button>
          <Button
            onClick={() => {
              setAsset({
                name: "",
                image: null,
                location: "",
                place: "",
                currentValue: "",
                year: null,
                description: "",
                artist: "",
                size: "",
                status: "",
              });
              setFileImage(null);
              setSuccessDialogOpen(false);
            }}
            color="primary"
            variant="contained"
            fullWidth={isMobile}
          >
            Create Another
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CreateNewAsset;