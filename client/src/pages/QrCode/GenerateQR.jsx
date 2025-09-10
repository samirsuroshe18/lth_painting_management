import { useEffect, useState } from "react";
import {
  Container,
  Grid,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Box,
  Alert,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Stack,
} from "@mui/material";
import {
  Search as SearchIcon,
  Cancel,
  Download as DownloadIcon,
  LocationOn,
  Refresh,
  FilterList,
} from "@mui/icons-material";
import { getQrCodes } from "../../api/assetMasterApi";
import { useSelector } from "react-redux";
import { handleAxiosError } from "../../utils/handleAxiosError";

// 🔹 Import your custom QR component
import QrWithCenterImage from "../../components/QrWithCenterImage";

const GenerateQR = () => {
  const userData = useSelector((state) => state.auth.userData?.user);
  const [locations, setLocations] = useState(userData?.location || []);
  const [assets, setAssets] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchAssets();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, selectedLocation, assets]);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const res = await getQrCodes();
      const allAssets = res?.data || [];
      const assetsWithQR = allAssets.filter((asset) => asset.qrCode);

      // Add a field for merged QR in each asset
      const updated = assetsWithQR.map((a) => ({ ...a, mergedQr: a.qrCode }));
      setAssets(updated);
      setError(null);
    } catch (err) {
      setError(handleAxiosError(err));
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...assets];

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter((asset) => {
        const assetName = (asset.name || "").toLowerCase();
        const locationName = (asset.locationId?.name || "").toLowerCase();

        return (
          assetName.includes(searchLower) ||
          locationName.includes(searchLower)
        );
      });
    }

    if (selectedLocation !== "all") {
      filtered = filtered.filter((asset) => {
        return asset.locationId?.name === selectedLocation;
      });
    }

    setFilteredAssets(filtered);
  };

  const downloadQRCode = (qrCode, assetName) => {
    const link = document.createElement("a");
    link.href = qrCode;
    link.download = `QR_${assetName?.replace(/[^a-zA-Z0-9]/g, "_") || "Asset"}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRefresh = () => {
    fetchAssets();
  };

  const handleClear = () => {
    setSearchTerm("");
    setSelectedLocation("all");
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleLocationChange = (e) => {
    setSelectedLocation(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const hasActiveFilters = searchTerm.trim() !== "" || selectedLocation !== "all";

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="60vh"
        >
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
          <Button
            variant="contained"
            onClick={handleRefresh}
            startIcon={<Refresh />}
          >
            Retry
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid size={{ xs: 12, md: "auto" }}>
          <Typography variant="h4" fontWeight={700} color="primary">
            QR Code Gallery
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View and download QR codes for all assets in the system
          </Typography>
        </Grid>
      </Grid>

      {/* Search & Filter */}
      <Grid container spacing={2} sx={{ mt: 4 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            fullWidth
            placeholder="Search assets by name or location..."
            value={searchTerm}
            onChange={handleSearchChange}
            variant="outlined"
            size="small"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={clearSearch}
                      edge="end"
                      aria-label="clear search"
                    >
                      <Cancel fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Location Filter</InputLabel>
            <Select
              value={selectedLocation}
              onChange={handleLocationChange}
              label="Location Filter"
              startAdornment={
                <InputAdornment position="start">
                  <FilterList fontSize="small" color="action" />
                </InputAdornment>
              }
            >
              <MenuItem value="all">All Locations</MenuItem>
              {locations.map((location) => (
                <MenuItem key={location._id} value={location.name}>
                  {location.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Stack direction="row" spacing={1} justifyContent={"flex-end"}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={handleRefresh}
              disabled={loading}
            >
              Refresh
            </Button>
            <Button
              variant="outlined"
              startIcon={<Cancel />}
              onClick={handleClear}
              disabled={!hasActiveFilters}
            >
              Clear
            </Button>
          </Stack>
        </Grid>
      </Grid>

      {!loading && (
        <Box sx={{ mt: 2, mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {hasActiveFilters ? (
              <>
                Showing {filteredAssets.length} of {assets.length} QR codes
                {searchTerm && ` matching "${searchTerm}"`}
                {selectedLocation !== "all" && ` in ${selectedLocation}`}
              </>
            ) : (
              `Showing all ${assets.length} QR codes`
            )}
          </Typography>
        </Box>
      )}

      {!loading && filteredAssets.length === 0 && assets.length > 0 && (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No QR codes found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Try adjusting your search or filter criteria
          </Typography>
          <Button variant="outlined" startIcon={<Cancel />} onClick={handleClear}>
            Clear all filters
          </Button>
        </Box>
      )}

      <Grid container spacing={2} sx={{ mt: 4 }}>
        {loading
          ? Array.from({ length: 40 }).map((_, index) => (
              <Grid key={`initial-skeleton-${index}`} size={{ xs: 4, md: 1.5 }}>
                {/* skeleton UI */}
                <Box sx={{ height: 180, bgcolor: "grey.200", borderRadius: 1 }} />
              </Grid>
            ))
          : filteredAssets.map((asset) => (
              <Grid key={asset._id} size={{ xs: 4, md: 1.5 }}>
                <Box sx={{ textAlign: "center" }}>
                  <Box
                    sx={{
                      bgcolor: "white",
                      borderRadius: 1,
                      boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                      border: "1px solid rgba(0,0,0,0.06)",
                      mb: 1.5,
                    }}
                  >
                    {/* 🔹 Use merged QR component */}
                    <QrWithCenterImage
                      qrSrc={asset.qrCode}
                      logoSrc={asset.image}
                      size={180}
                      onReady={(mergedUrl) => (asset.mergedQr = mergedUrl)}
                    />
                  </Box>

                  <Typography
                    variant="body2"
                    fontWeight={600}
                    color="text.primary"
                    sx={{
                      mb: 0.25,
                      minHeight: 28,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      lineHeight: 1.2,
                    }}
                    title={asset.name || "Unnamed Asset"}
                  >
                    {asset.name || "Unnamed Asset"}
                  </Typography>

                  {asset.locationId?.name && (
                    <Box display="flex" alignItems="center" justifyContent="center" mt={-1} mb={1}>
                      <LocationOn fontSize="small" sx={{ color: "grey.500", mr: 0.5 }} />
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          maxWidth: 120,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={asset.locationId.name}
                      >
                        {asset.locationId.name}
                      </Typography>
                    </Box>
                  )}

                  <IconButton
                    onClick={() => downloadQRCode(asset.mergedQr || asset.qrCode, asset.name)}
                    sx={{
                      backgroundColor: "#1976d2",
                      color: "white",
                      "&:hover": { backgroundColor: "#1565c0" },
                      width: 36,
                      height: 36,
                      boxShadow: "0 2px 8px rgba(25, 118, 210, 0.3)",
                    }}
                    size="small"
                  >
                    <DownloadIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Grid>
            ))}
      </Grid>
    </Container>
  );
};

export default GenerateQR;
