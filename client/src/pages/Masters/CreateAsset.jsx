import { useState, useEffect } from "react";
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
  Container,
  Card,
  CardContent,
  IconButton,
  FormControl,
  Checkbox,
  InputLabel,
  Divider,
} from "@mui/material";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  OutlinedInput,
  ListItemText,
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import {
  CloudUpload,
  DeleteOutline,
  ArrowBack,
  CheckCircle,
  PhotoCamera,
} from "@mui/icons-material";
import { createNewAsset } from "../../api/assetMasterApi";
import { getAllLocations } from "../../api/locationApi"; // Add this import
import { useDispatch, useSelector } from "react-redux"; // Add useSelector
import { showNotificationWithTimeout } from "../../redux/slices/notificationSlice";
import { handleAxiosError } from "../../utils/handleAxiosError";
import { useLocation, useNavigate } from "react-router-dom";

const CreateNewAsset = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Get locations from Redux store like in AddUser component
  const userData = useSelector((state) => state.auth.userData?.user);
  const [locations, setLocations] = useState(userData?.location || []);
  const [loading, setLoading] = useState(false);
  const [fileImage, setFileImage] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [yearError, setYearError] = useState("");
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // Fetch locations if not available in Redux store
  useEffect(() => {
    const fetchLocations = async () => {
      if (!locations || locations.length === 0) {
        try {
          const response = await getAllLocations();
          setLocations(response.data || []);
        } catch (error) {
          console.error('Error fetching locations:', error);
          dispatch(
            showNotificationWithTimeout({
              show: true,
              type: "error",
              message: "Failed to fetch locations",
            })
          );
        }
      }
    };

    fetchLocations();
  }, [dispatch]);

  const [asset, setAsset] = useState({
    name: "",
    image: null,
    location: [], // Changed to array to match the select component
    place: "",
    currentValue: "",
    year: null,
    description: "",
    artist: "",
    size: "",
    status: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "location") {
      // Special handling for "Select all" pseudo-option
      const ALL_VALUE = "__all__";
      const optionValues = locations.map((l) => l._id);

      if (value.includes(ALL_VALUE)) {
        const isAllSelected = asset.location.length === optionValues.length;
        const next = isAllSelected ? [] : optionValues;
        setAsset((prev) => ({ ...prev, location: next }));
      } else {
        setAsset((prev) => ({ ...prev, location: value }));
      }
      return;
    }

    // Handle image upload
    if (name === "image") {
      const file = e.target.files[0];
      if (file) {
        handleImageUpload(file);
      }
      return;
    }

    // Handle other fields
    setAsset((prev) => ({ ...prev, [name]: value }));
  };

  const getLocationName = (id) =>
    locations.find((l) => l._id === id)?.name || id;

  const renderSelectedLocations = (selectedIds) => {
    if (!selectedIds?.length) return "";
    // If many, show a compact count
    if (selectedIds.length > 3) return `${selectedIds.length} selected`;
    return selectedIds.map(getLocationName).join(", ");
  };

  const handleImageUpload = (file) => {
    if (file && file.type.startsWith('image/')) {
      setAsset((prev) => ({ ...prev, image: file }));
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
    setAsset((prev) => ({ ...prev, image: null }));
    setFileImage(null);
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
      
      // Add 1 second delay for loading state visibility
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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
      // Add delay even for errors to maintain consistent UX
      await new Promise(resolve => setTimeout(resolve, 1000));
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
      {/* Header Card */}
      <Card elevation={2} sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2}>
            <IconButton onClick={handleCancel} color="primary" sx={{ p: 1 }}>
              <ArrowBack />
            </IconButton>
            <Box>
              <Typography variant="h4" fontWeight={700} color="primary">
                Create New Asset
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Add a new asset to your collection with complete details
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Form Card */}
      <Card elevation={2}>
        <CardContent sx={{ p: 4 }}>
          <form onSubmit={loading ? null : handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Image Upload Section - Left Column */}
              <div className="lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                  Asset Image *
                </label>
                <Box
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  sx={{
                    border: `2px dashed ${dragOver ? theme.palette.primary.main : theme.palette.grey[300]}`,
                    borderRadius: 2,
                    p: 2,
                    textAlign: "center",
                    transition: "all 0.3s ease",
                    backgroundColor: dragOver ? theme.palette.primary.light + "10" : "transparent",
                    cursor: "pointer",
                    minHeight: 280,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  className="focus:ring focus:ring-blue-500"
                >
                  {fileImage ? (
                    <Box sx={{ position: "relative", width: "100%" }}>
                      <img
                        src={fileImage}
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
                          mb: 2 
                        }} 
                      />
                      <Typography variant="subtitle1" fontWeight={600} color="text.primary" gutterBottom>
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
              </div>

              {/* Form Fields - Right Columns */}
              <div className="lg:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Asset Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                      Asset Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={asset.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded shadow-sm focus:ring focus:ring-blue-500 dark:bg-gray dark:border-gray-400 dark:text-white"
                      required
                      disabled={loading}
                    />
                  </div>

                  {/* Artist */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                      Artist *
                    </label>
                    <input
                      type="text"
                      name="artist"
                      value={asset.artist}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded shadow-sm focus:ring focus:ring-blue-500 dark:bg-gray dark:border-gray-400 dark:text-white"
                      required
                      disabled={loading}
                    />
                  </div>

                  {/* Location: MUI Select with Checkbox dropdown */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                      Location
                    </label>
                    <FormControl fullWidth size="small">
                      <InputLabel id="location-label">Location</InputLabel>
                      <Select
                        labelId="location-label"
                        multiple
                        name="location"
                        value={asset.location} // Fixed: was formData.location
                        onChange={handleChange}
                        input={<OutlinedInput label="Location" />}
                        renderValue={(selected) =>
                          renderSelectedLocations(selected)
                        }
                        MenuProps={{
                          PaperProps: { style: { maxHeight: 360, width: 320 } },
                        }}
                        disabled={loading}
                      >
                        {/* Select all toggle */}
                        <MenuItem value="__all__">
                          <Checkbox
                            checked={
                              locations.length > 0 &&
                              asset.location.length === locations.length // Fixed: was formData.location
                            }
                            indeterminate={
                              asset.location.length > 0 && // Fixed: was formData.location
                              asset.location.length < locations.length // Fixed: was formData.location
                            }
                          />
                          <ListItemText
                            primary={
                              asset.location.length === locations.length // Fixed: was formData.location
                                ? "Clear all"
                                : "Select all"
                            }
                          />
                        </MenuItem>

                        {Array.isArray(locations) && locations.length > 0 ? (
                          locations.map((loc) => (
                            <MenuItem key={loc._id} value={loc._id}>
                              <Checkbox
                                checked={asset.location.indexOf(loc._id) > -1} // Fixed: was formData.location
                              />
                              <ListItemText primary={loc.name} />
                            </MenuItem>
                          ))
                        ) : (
                          <MenuItem disabled>No locations available</MenuItem>
                        )}
                      </Select>
                    </FormControl>
                  </div>
                                 
                  {/* Place */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                      Place *
                    </label>
                    <input
                      type="text"
                      name="place"
                      value={asset.place}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded shadow-sm focus:ring focus:ring-blue-500 dark:bg-gray dark:border-gray-400 dark:text-white"
                      required
                      disabled={loading}
                    />
                  </div>

                  {/* Size */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                      Size *
                    </label>
                    <input
                      type="text"
                      name="size"
                      value={asset.size}
                      onChange={handleChange}
                      placeholder="e.g. 10x20 inches"
                      className="w-full px-4 py-2 border border-gray-300 rounded shadow-sm focus:ring focus:ring-blue-500 dark:bg-gray dark:border-gray-400 dark:text-white"
                      required
                      disabled={loading}
                    />
                  </div>

                  {/* Current Value */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                      Current Value *
                    </label>
                    <input
                      type="number"
                      name="currentValue"
                      value={asset.currentValue}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded shadow-sm focus:ring focus:ring-blue-500 dark:bg-gray dark:border-gray-400 dark:text-white"
                      required
                      disabled={loading}
                    />
                  </div>

                  {/* Year - Full Width */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                      Year Created *
                    </label>
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
                        disabled={loading}
                        slotProps={{
                          textField: {
                            error: Boolean(yearError),
                            helperText: yearError,
                            required: true,
                            fullWidth: true,
                            size: "medium",
                            sx: {
                              "& .MuiOutlinedInput-root": {
                                "& fieldset": {
                                  borderColor: "rgba(0, 0, 0, 0.23)",
                                },
                                "&:hover fieldset": {
                                  borderColor: "rgba(0, 0, 0, 0.23)",
                                },
                                "&.Mui-focused fieldset": {
                                  borderColor: theme.palette.primary.main,
                                },
                              },
                            },
                          },
                        }}
                      />
                    </LocalizationProvider>
                  </div>

                  {/* Description - Full Width */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                      Description *
                    </label>
                    <textarea
                      name="description"
                      value={asset.description}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Describe the asset, its history, significance, or any other relevant details..."
                      className="w-full px-4 py-2 border border-gray-300 rounded shadow-sm focus:ring focus:ring-blue-500 dark:bg-gray dark:border-gray-400 dark:text-white resize-none"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 2,
                mt: 4,
                pt: 3,
                borderTop: "1px solid",
                borderColor: "divider",
              }}
            >
              <Button
                variant="outlined"
                onClick={handleCancel}
                size="large"
                sx={{ minWidth: 120 }}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                size="large"
                sx={{ minWidth: 120 }}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
              >
                {loading ? "Creating..." : "Create Asset"}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>

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
              Creating Asset...
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
              mx: "auto"
            }} 
          />
          <Typography variant="h5" fontWeight={700}>
            Asset Created Successfully!
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ textAlign: "center", pb: 2 }}>
          <Typography variant="body1" color="text.secondary">
            Your new asset has been added to the collection and is now available in the system.
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
              setAsset({
                name: "",
                image: null,
                location: [], // Fixed: was empty string, now array
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