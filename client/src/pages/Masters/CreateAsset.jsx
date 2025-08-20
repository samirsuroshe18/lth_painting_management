import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
  Grid,
  Stack,
  CircularProgress,
  useTheme,
  Container,
  Card,
  IconButton,
  FormControl,
} from "@mui/material";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { CloudUpload, DeleteOutline, CheckCircle } from "@mui/icons-material";
import { createNewAsset, updateAsset } from "../../api/assetMasterApi";
import { getAllLocations } from "../../api/locationApi"; // Add this import
import { useDispatch, useSelector } from "react-redux"; // Add useSelector
import { showNotificationWithTimeout } from "../../redux/slices/notificationSlice";
import { handleAxiosError } from "../../utils/handleAxiosError";
import { useLocation, useNavigate } from "react-router-dom";

const CreateNewAsset = () => {
  const { state } = useLocation();
  const asset = state?.asset;
  const [imageUrl, setImageUrl] = useState(asset?.image);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userData = useSelector((state) => state.auth.userData?.user);
  const [locations, setLocations] = useState(userData?.location || []);
  const [loading, setLoading] = useState(false);
  const [fileImage, setFileImage] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [yearError, setYearError] = useState("");
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const theme = useTheme();

  // Fetch locations if not available in Redux store
  useEffect(() => {
    const fetchLocations = async () => {
      if (!locations || locations.length === 0) {
        try {
          const response = await getAllLocations();
          setLocations(response.data || []);
        } catch (error) {
          dispatch(
            showNotificationWithTimeout({
              show: true,
              type: "error",
              message: handleAxiosError(error),
            })
          );
        }
      }
    };

    fetchLocations();
  }, [dispatch]);

  const [formData, setFormData] = useState({
    id: asset?._id ?? undefined,
    image: null,
    name: asset?.name ?? "",
    artist: asset?.artist ?? "",
    place: asset?.place ?? "",
    location: asset?.locationId?._id ?? "",
    currentValue: asset?.purchaseValue ?? "",
    year: asset?.year ? dayjs().year(asset?.year) : null,
    description: asset?.description ?? "",
    size: asset?.size ?? "",
    status: asset?.status === true ? "active" : "inactive",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Handle image upload
    if (name === "image") {
      const file = e.target.files[0];
      if (file) {
        handleImageUpload(file);
      }
      return;
    }

    // Handle other fields
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (file) => {
    if (file && file.type.startsWith("image/")) {
      setFormData((prev) => ({ ...prev, image: file }));
      setFileImage(URL.createObjectURL(file));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleImageUpload(files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, image: null }));
    setFileImage(null);
    setImageUrl(""); // ✅ clear backend image too
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.image && !asset) {
      dispatch(
        showNotificationWithTimeout({
          show: true,
          type: "error",
          message: "Please upload an image.",
        })
      );
      return;
    }

    if (!formData.year) {
      setYearError("Year is required.");
      return;
    }

    try {
      setLoading(true);

      // Add 1 second delay for loading state visibility
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const response = asset
        ? await updateAsset(formData)
        : await createNewAsset(formData);
      dispatch(
        showNotificationWithTimeout({
          show: true,
          type: "success",
          message: response.message,
        })
      );
      asset ? setSuccessDialogOpen(false) : setSuccessDialogOpen(true);
    } catch (error) {
      // Add delay even for errors to maintain consistent UX
      await new Promise((resolve) => setTimeout(resolve, 1000));
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

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Header card */}
      <Grid container spacing={2} alignItems="center">
        <Grid size={{ xs: 12, md: "auto" }}>
          <Typography variant="h4" fontWeight={700} color="primary">
            {asset ? "Edit Asset Details" : "Create New Asset"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {asset
              ? "Edit asset to your collection with complete details"
              : "Add a new asset to your collection with complete details"}
          </Typography>
        </Grid>
      </Grid>

      {/* Form Card */}
      <Box
        component="form"
        onSubmit={loading ? null : handleSubmit}
        sx={{ mt: 3 }}
      >
        <Grid container spacing={3}>
          {/* Image */}
          <Grid size={{ xs: 12, md: 12 }}>
            <Stack spacing={1}>
              <Typography variant="subtitle2">Asset Image *</Typography>
              <Box
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                sx={{
                  border: `2px dashed ${dragOver ? theme.palette.primary.main : theme.palette.grey[300]}`,
                  borderRadius: 2,
                  textAlign: "center",
                  transition: "all 0.3s ease",
                  backgroundColor: dragOver
                    ? theme.palette.primary.light + "10"
                    : "transparent",
                  cursor: "pointer",
                  minHeight: 280,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                }}
                className="focus:ring focus:ring-blue-500"
              >
                {fileImage || imageUrl ? (
                  <Box sx={{ position: "relative", width: "100%" }}>
                    <img
                      src={fileImage || imageUrl} // ✅ use file preview if available, else url
                      alt="Asset preview"
                      style={{
                        width: "100%",
                        height: "200px",
                        objectFit: "cover",
                        borderRadius: theme.spacing(1),
                      }}
                    />
                    <IconButton
                      onClick={removeImage}
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        bgcolor: "rgba(255, 255, 255, 0.9)",
                        "&:hover": { bgcolor: "rgba(255, 255, 255, 1)" },
                      }}
                      disabled={loading}
                    >
                      <DeleteOutline color="error" />
                    </IconButton>
                  </Box>
                ) : (
                  <>
                    <CloudUpload
                      sx={{
                        fontSize: 48,
                        color: dragOver ? "primary.main" : "grey.400",
                        mb: 2,
                      }}
                    />
                    <Typography
                      variant="subtitle1"
                      fontWeight={600}
                      color="text.primary"
                      gutterBottom
                    >
                      {dragOver ? "Drop image here" : "Upload Asset Image"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={2}>
                      Drag & drop or click to select
                    </Typography>
                    <label htmlFor="image-upload">
                      <Button
                        variant="contained"
                        component="span"
                        size="small"
                        disabled={loading}
                        sx={{ textTransform: "none" }}
                      >
                        Choose Image
                      </Button>
                    </label>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  name="image"
                  id="image-upload"
                  hidden
                  onChange={handleChange}
                  disabled={loading}
                />
              </Box>
            </Stack>
          </Grid>

          {/* Name */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack spacing={1}>
              <Typography variant="subtitle2">Name *</Typography>
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

          {/* Name */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack spacing={1}>
              <Typography variant="subtitle2">Artist *</Typography>
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

          {/* Place */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack spacing={1}>
              <Typography variant="subtitle2">Place *</Typography>
              <TextField
                name="place"
                value={formData.place}
                onChange={handleChange}
                fullWidth
                size="small"
                placeholder="Enter place"
                required
                type="text"
              />
            </Stack>
          </Grid>

          {/* Location */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack spacing={1}>
              <Typography variant="subtitle2">Location *</Typography>
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
                  {Array.isArray(locations) && locations.length > 0 ? (
                    locations.map((loc) => (
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

          {/* currentValue */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack spacing={1}>
              <Typography variant="subtitle2">Purchase Value *</Typography>
              <TextField
                name="currentValue"
                value={formData.currentValue}
                onChange={handleChange}
                fullWidth
                size="small"
                placeholder="Enter current value"
                required
                disabled={loading}
                type="number"
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
              <Typography variant="subtitle2">Size *</Typography>
              <TextField
                name="size"
                value={formData.size}
                onChange={handleChange}
                fullWidth
                size="small"
                placeholder="e.g. 10x20"
                required
                disabled={loading}
                type="text"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "inherit",
                  },
                }}
              />
            </Stack>
          </Grid>

          {/* Year */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack spacing={1}>
              <Typography variant="subtitle2">Year *</Typography>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  views={["year"]}
                  value={formData.year}
                  minDate={dayjs("1500-01-01")}
                  maxDate={dayjs()}
                  onChange={(value) => {
                    setFormData({ ...formData, year: value });
                    setYearError("");
                  }}
                  disabled={loading}
                  slotProps={{
                    textField: {
                      error: Boolean(yearError),
                      helperText: yearError,
                      required: true,
                      fullWidth: true,
                      size: "small",
                      placeholder: "Enter date",
                    },
                  }}
                />
              </LocalizationProvider>
            </Stack>
          </Grid>

          {/* status */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack spacing={1}>
              <Typography variant="subtitle2">Status *</Typography>
              <FormControl fullWidth required disabled={loading}>
                <Select
                  value={formData?.status ?? ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: e.target.value,
                    }))
                  }
                  size="small"
                  required
                  displayEmpty
                >
                  <MenuItem value="" disabled>
                    Select status
                  </MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Grid>

          {/* Description */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack spacing={1}>
              <Typography variant="subtitle2">Description *</Typography>
              <TextField
                name="description"
                value={formData.description}
                onChange={handleChange}
                fullWidth
                size="small"
                placeholder="Enter description"
                required
                multiline
                minRows={3}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "inherit",
                  },
                }}
                type="text"
              />
            </Stack>
          </Grid>
        </Grid>

        {/* Submit Button */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4 }}>
          <Stack direction="row" spacing={2}>
            <Button type="submit" variant="contained" disabled={loading}>
              {asset ? "Edit Asset" : "Create Asset"}
            </Button>
            <Button
              variant="outlined"
              onClick={handleCancel}
              size="large"
              sx={{ minWidth: 120 }}
              disabled={loading}
            >
              Cancel
            </Button>
          </Stack>
        </Box>
      </Box>

      {/* Loading Overlay */}
      {loading && (
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
          <Card sx={{ p: 3, minWidth: 200, textAlign: "center" }}>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography variant="h6" fontWeight={500}>
              {asset ? "Updating Asset..." : "Creating Asset..."}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please wait while we process your request
            </Typography>
          </Card>
        </Box>
      )}

      {/* Success Dialog */}
      <Dialog
        open={successDialogOpen}
        onClose={() => setSuccessDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ textAlign: "center", pt: 4 }}>
          <CheckCircle
            sx={{
              fontSize: 60,
              color: "success.main",
              mb: 2,
              display: "block",
              mx: "auto",
            }}
          />
          <Typography variant="h5" fontWeight={700}>
            Asset Created Successfully!
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ textAlign: "center", pb: 2 }}>
          <Typography variant="body1" color="text.secondary">
            Your new asset has been added to the collection and is now available
            in the system.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2, justifyContent: "center" }}>
          <Button
            onClick={() => {
              setSuccessDialogOpen(false);
              navigate(-1);
            }}
            variant="outlined"
            sx={{ minWidth: 120 }}
          >
            Go Back
          </Button>
          <Button
            onClick={() => {
              setFormData({
                name: "",
                image: null,
                location: "", // Fixed: was empty string, now array
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
            variant="contained"
            sx={{ minWidth: 120 }}
          >
            Create Another
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CreateNewAsset;