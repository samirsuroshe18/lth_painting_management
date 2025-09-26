import { useState, useEffect, Fragment } from "react";
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
  Stack,
  CircularProgress,
  useTheme,
  Container,
  Card,
  IconButton,
  FormControl,
  Autocomplete,
  useMediaQuery,
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
import { createNewAsset } from "../../api/assetMasterApi";
import { getAllDepartment } from "../../api/departmentApi";
import { getAllBuildings } from "../../api/buildingApi";
import { getAllFloors } from "../../api/floorApi";
import { useDispatch, useSelector } from "react-redux";
import { showNotificationWithTimeout } from "../../redux/slices/notificationSlice";
import { handleAxiosError } from "../../utils/handleAxiosError";
import { useNavigate } from "react-router-dom";
import LabelWithRedAsterisk from "../../components/LabelWithRedAsterisk";
import { getCurrentUser } from "../../api/authApi";
import SnackBar from "../../components/commonComponents/SnackBar";

const CreateNewAsset = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userData = useSelector((state) => state.auth.userData?.user);
  const [locations, setLocations] = useState(userData?.location || []);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [fileImage, setFileImage] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [departmentOpen, setDepartmentOpen] = useState(false);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [departmentLoading, setDepartmentLoading] = useState(false);
  const [buildingOpen, setBuildingOpen] = useState(false);
  const [buildingOptions, setBuildingOptions] = useState([]);
  const [buildingLoading, setBuildingLoading] = useState(false);
  const [floorOpen, setFloorOpen] = useState(false);
  const [floorOptions, setFloorOptions] = useState([]);
  const [floorLoading, setFloorLoading] = useState(false);
  const [sizeWidth, setSizeWidth] = useState("");
  const [sizeHeight, setSizeHeight] = useState("");

  const [formData, setFormData] = useState({
    image: null,
    name: "",
    artist: "",
    place: "",
    location: "",
    department: "",
    building: "",
    floor: "",
    currentValue: "",
    year: null,
    description: "",
    size: "",
    status: "",
  });

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

    checkAuth();
  }, []);

  const handleSizeChange = (width, height) => {
    setSizeWidth(width);
    setSizeHeight(height);

    let combinedSize = "";
    if (width && height) {
      combinedSize = `${width}x${height} inches`;
    }

    setFormData((prev) => ({ ...prev, size: combinedSize }));
  };

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

  // Floor handlers
  const handleFloorOpen = () => {
    setFloorOpen(true);

    if (floorOptions.length === 0) {
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

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "image") {
      const file = e.target.files[0];
      if (file) handleImageUpload(file);
      return;
    }

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
    if (files.length > 0) handleImageUpload(files[0]);
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
    setImageUrl("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.image) {
      dispatch(
        showNotificationWithTimeout({
          show: true,
          type: "error",
          message: "Please upload an image.",
        })
      );
      return;
    }

    try {
      setLoading(true);
      const response = await createNewAsset(formData);
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

  const handleCancel = () => navigate(-1);

  return (
    <Container
      maxWidth="md"
      sx={{ py: { xs: 2, sm: 3 }, px: { xs: 2, sm: 3 } }}
    >
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant={isMobile ? "h5" : "h4"}
          fontWeight={700}
          color="primary"
        >
          Create New Asset
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Add a new asset to your collection with complete details
        </Typography>
      </Box>

      {/* Form */}
      <Box component="form" onSubmit={loading ? null : handleSubmit}>
        <Stack spacing={3}>
          {/* Asset Image */}
          <Box>
            <LabelWithRedAsterisk required>Asset Image</LabelWithRedAsterisk>
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
                minHeight: { xs: 200, sm: 250 },
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                p: 3,
                mt: 1,
              }}
            >
              {fileImage || imageUrl ? (
                <Box sx={{ position: "relative", width: "100%" }}>
                  <img
                    src={fileImage || imageUrl}
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
          </Box>

          {/* Name */}
          <Box>
            <LabelWithRedAsterisk required>Name</LabelWithRedAsterisk>
            <TextField
              name="name"
              value={formData.name}
              onChange={handleChange}
              fullWidth
              size="small"
              placeholder="Enter name"
              required
              disabled={loading}
              sx={{ mt: 1 }}
            />
          </Box>

          {/* Artist */}
          <Box>
            <LabelWithRedAsterisk required>Artist</LabelWithRedAsterisk>
            <TextField
              name="artist"
              value={formData.artist}
              onChange={handleChange}
              fullWidth
              size="small"
              placeholder="Enter artist name"
              required
              disabled={loading}
              sx={{ mt: 1 }}
            />
          </Box>

          {/* Location */}
          <Box>
            <LabelWithRedAsterisk required>Location</LabelWithRedAsterisk>
            <Autocomplete
              value={
                locations.find(
                  (location) => location._id === formData.location
                ) || null
              }
              options={locations}
              getOptionLabel={(option) => option?.name || ""}
              onChange={(event, newValue) => {
                setFormData((prev) => ({
                  ...prev,
                  location: newValue?._id || "",
                }));
              }}
              noOptionsText="No locations available"
              sx={{ mt: 1 }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Search location..."
                  size="small"
                  required
                />
              )}
            />
          </Box>

          {/* Department */}
          <Box>
            <LabelWithRedAsterisk>Department</LabelWithRedAsterisk>
            <Autocomplete
              open={departmentOpen}
              onOpen={handleDepartmentOpen}
              onClose={handleDepartmentClose}
              value={
                departmentOptions.find(
                  (option) => option._id === formData.department
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
                  department: newValue?._id || "",
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
          </Box>

          {/* Building */}
          <Box>
            <LabelWithRedAsterisk>Building Name</LabelWithRedAsterisk>
            <Autocomplete
              open={buildingOpen}
              onOpen={handleBuildingOpen}
              onClose={handleBuildingClose}
              value={
                buildingOptions.find(
                  (option) => option._id === formData.building
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
                  building: newValue?._id || "",
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
          </Box>

          {/* Floor */}
          <Box>
            <LabelWithRedAsterisk>Floor</LabelWithRedAsterisk>
            <Autocomplete
              open={floorOpen}
              onOpen={handleFloorOpen}
              onClose={handleFloorClose}
              value={
                floorOptions.find(
                  (option) => option._id === formData.floor
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
                  floor: newValue?._id || "",
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
          </Box>

          {/* Purchase Value */}
          <Box>
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
              slotProps={{ htmlInput: { min: 0 } }}
              sx={{ mt: 1 }}
            />
          </Box>

          {/* Size */}
          <Box>
            <LabelWithRedAsterisk required>Size (inches)</LabelWithRedAsterisk>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mt: 1 }}
            >
              <TextField
                value={sizeWidth}
                onChange={(e) => handleSizeChange(e.target.value, sizeHeight)}
                size="small"
                placeholder="Width"
                required
                disabled={loading}
                type="number"
                slotProps={{ htmlInput: { min: 0, step: "0.1" } }}
                sx={{ flex: 1 }}
              />
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                X
              </Typography>
              <TextField
                value={sizeHeight}
                onChange={(e) => handleSizeChange(sizeWidth, e.target.value)}
                size="small"
                placeholder="Height"
                required
                disabled={loading}
                type="number"
                slotProps={{ htmlInput: { min: 0, step: "0.1" } }}
                sx={{ flex: 1 }}
              />
            </Stack>
          </Box>

          {/* Year */}
          <Box>
            <LabelWithRedAsterisk>Year</LabelWithRedAsterisk>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                views={["year"]}
                value={formData.year}
                minDate={dayjs("1500-01-01")}
                maxDate={dayjs()}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, year: value }))
                }
                disabled={loading}
                sx={{ mt: 1 }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: "small",
                    placeholder: "Enter year",
                  },
                }}
              />
            </LocalizationProvider>
          </Box>

          {/* Status */}
          <Box>
            <LabelWithRedAsterisk required>Status</LabelWithRedAsterisk>
            <FormControl fullWidth>
              <Select
                value={formData.status}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, status: e.target.value }))
                }
                required
                displayEmpty
                size="small"
                renderValue={(selected) => {
                  if (selected === "") {
                    return <span style={{ color: "#999" }}>Select status</span>;
                  }
                  return selected == "active" ? "Active" : "Inactive";
                }}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Description */}
          <Box>
            <LabelWithRedAsterisk>Description</LabelWithRedAsterisk>
            <TextField
              name="description"
              value={formData.description}
              onChange={handleChange}
              fullWidth
              size="small"
              placeholder="Enter description"
              multiline
              rows={3}
              disabled={loading}
              sx={{ mt: 1 }}
            />
          </Box>

          {/* Buttons */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            justifyContent="flex-end"
            sx={{ pt: 2 }}
          >
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{ order: { xs: 1, sm: 0 } }}
            >
              Submit
            </Button>
            <Button
              variant="outlined"
              onClick={handleCancel}
              disabled={loading}
              sx={{ order: { xs: 2, sm: 0 } }}
            >
              Cancel
            </Button>
          </Stack>
        </Stack>
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
          <Card sx={{ p: 3, textAlign: "center", mx: 2, maxWidth: 400 }}>
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
          >
            Go Back
          </Button>
          <Button
            onClick={() => {
              setFormData({
                id: undefined,
                name: "",
                image: null,
                location: "",
                currentValue: "",
                year: null,
                description: "",
                artist: "",
                size: "",
                status: "",
                departmentId: null,
                buildingId: null,
                floorId: null,
              });
              setFileImage(null);
              setSizeWidth("");
              setSizeHeight("");
              setSuccessDialogOpen(false);
            }}
            variant="contained"
          >
            Create Another
          </Button>
        </DialogActions>
      </Dialog>
      <SnackBar />
    </Container>
  );
};

export default CreateNewAsset;
