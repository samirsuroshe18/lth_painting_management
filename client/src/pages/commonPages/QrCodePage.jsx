import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Stack,
  Avatar,
  CircularProgress,
  Card,
  CardContent,
  Chip,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { viewAsset } from "../../api/assetMasterApi";
import { useDispatch } from "react-redux";
import { showNotificationWithTimeout } from "../../redux/slices/notificationSlice";
import { handleAxiosError } from "../../utils/handleAxiosError";
import LoginIcon from "@mui/icons-material/Login";

const QrCodePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [asset, setAsset] = useState(null);
  const [error, setError] = useState("");

  const fetchAssetDetails = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await viewAsset(id);
      setAsset(response.data);
    } catch (error) {
      setError("Failed to load asset details. Asset may not be found or approved.");
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

  useEffect(() => {
    if (id) {
      fetchAssetDetails();
    }
  }, [id]);

  const handleAdminLogin = () => {
    // Store the current asset ID in localStorage to redirect back after login
    localStorage.setItem("assetIdForEdit", id);
    navigate("/login");
  };

  if (loading) {
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

  if (error || !asset) {
    return (
      <Box
        sx={{
          bgcolor: "background.default",
          p: { xs: 2, md: 4 },
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography variant="h5" color="error" mb={2} align="center">
          {error || "Asset not found"}
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => window.location.reload()}
          sx={{ mb: 2 }}
        >
          Retry
        </Button>
        <Button
          variant="outlined"
          startIcon={<LoginIcon />}
          onClick={handleAdminLogin}
        >
          Admin Login
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        bgcolor: "background.default",
        p: { xs: 2, md: 4 },
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: "center" }}>
        <Typography variant="h4" fontWeight={700} mb={2}>
          Asset Details
        </Typography>
        <Chip 
          label={asset.status ? "Active" : "Inactive"}
          color={asset.status ? "success" : "error"}
          variant="outlined"
        />
      </Box>

      {/* Asset Details Card */}
      <Card sx={{ mb: 4, boxShadow: 3 }}>
        <CardContent>
          <Grid container spacing={4}>
            {/* Left Column */}
            <Grid item xs={12} md={6}>
              <Stack spacing={3}>
                <TextField
                  label="Asset Name"
                  value={asset.name || ""}
                  fullWidth
                  InputProps={{ readOnly: true }}
                />

                <TextField
                  label="Location"
                  value={asset.locationId?.name || ""}
                  fullWidth
                  InputProps={{ readOnly: true }}
                />

                <TextField
                  label="Place"
                  value={asset.place || ""}
                  fullWidth
                  InputProps={{ readOnly: true }}
                />

                <TextField
                  label="Artist"
                  value={asset.artist || ""}
                  fullWidth
                  InputProps={{ readOnly: true }}
                />

                {/* Asset Image */}
                <Box sx={{ textAlign: "center" }}>
                  <Typography variant="h6" mb={2}>
                    Asset Image
                  </Typography>
                  <Avatar
                    src={asset.image}
                    alt={asset.name}
                    sx={{ 
                      width: 200, 
                      height: 200, 
                      bgcolor: "#f2f2f2",
                      margin: "0 auto",
                      borderRadius: 2
                    }}
                    variant="rounded"
                  >
                    {asset.name?.[0]}
                  </Avatar>
                  {asset.image && (
                    <Typography variant="body2" mt={2}>
                      <a
                        href={asset.image}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ textDecoration: "underline" }}
                      >
                        View Full Size
                      </a>
                    </Typography>
                  )}
                </Box>
              </Stack>
            </Grid>

            {/* Right Column */}
            <Grid item xs={12} md={6}>
              <Stack spacing={3}>
                <TextField
                  label="Size"
                  value={asset.size || ""}
                  fullWidth
                  InputProps={{ readOnly: true }}
                />

                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Year"
                    views={["year"]}
                    value={asset.year ? dayjs().year(asset.year) : null}
                    disabled
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        InputProps: { readOnly: true }
                      },
                    }}
                  />
                </LocalizationProvider>

                <TextField
                  label="Purchase Value"
                  value={asset.purchaseValue || ""}
                  fullWidth
                  InputProps={{ readOnly: true }}
                />

                <TextField
                  label="Created By"
                  value={asset.createdBy?.userName || ""}
                  fullWidth
                  InputProps={{ readOnly: true }}
                />

                <TextField
                  label="Created At"
                  value={asset.createdAt ? new Date(asset.createdAt).toLocaleDateString() : ""}
                  fullWidth
                  InputProps={{ readOnly: true }}
                />

                <TextField
                  label="Description"
                  value={asset.description || ""}
                  multiline
                  rows={4}
                  fullWidth
                  InputProps={{ readOnly: true }}
                />
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Admin Login Button */}
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <Button
          variant="contained"
          size="large"
          startIcon={<LoginIcon />}
          onClick={handleAdminLogin}
          sx={{
            px: 4,
            py: 1.5,
            fontSize: "1.1rem",
            fontWeight: 600,
          }}
        >
          Admin Login to Edit
        </Button>
        <Typography variant="body2" color="text.secondary" mt={1}>
          Login as an administrator to edit asset details
        </Typography>
      </Box>
    </Box>
  );
};

export default QrCodePage;
