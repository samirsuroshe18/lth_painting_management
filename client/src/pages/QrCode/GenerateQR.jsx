import React, { useEffect, useState } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Box,
  Chip,
  CircularProgress,
  Alert,
  useMediaQuery,
  useTheme,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Fab,
} from '@mui/material';
import {
  Search as SearchIcon,
  Cancel,
  QrCode,
  Download as DownloadIcon,
  LocationOn,
  Refresh,
  FilterList,
} from '@mui/icons-material';
import { getAssets } from '../../api/assetMasterApi';

const GenerateQR = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [assets, setAssets] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const startTime = Date.now();
      
      const res = await getAssets('');
      const allAssets = res?.data?.assets || [];
      const assetsWithQR = allAssets.filter(asset => asset.qrCode);

      setAssets(assetsWithQR);
      setFilteredAssets(assetsWithQR);

      const uniqueLocations = [...new Set(
        assetsWithQR
          .map(asset => asset.locationId?.name)
          .filter(location => location)
      )];
      setLocations(uniqueLocations);
      setError(null);

      // Ensure minimum loading time of 1.5 seconds for skeleton visibility
      const elapsedTime = Date.now() - startTime;
      const minLoadingTime = 600; // 1.5 seconds
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
      
      setTimeout(() => {
        setLoading(false);
      }, remainingTime);
    } catch (err) {
      console.error('Failed to fetch assets:', err);
      setError('Failed to load QR codes. Please try again.');
      setLoading(false); // No delay for errors
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  useEffect(() => {
    let filtered = assets;
    if (selectedLocation !== 'all') {
      filtered = filtered.filter(asset =>
        asset.locationId?.name === selectedLocation
      );
    }
    if (searchTerm) {
      filtered = filtered.filter(asset =>
        asset.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredAssets(filtered);
  }, [selectedLocation, searchTerm, assets]);

  const downloadQRCode = (qrCode, assetName) => {
    const link = document.createElement('a');
    link.href = qrCode;
    link.download = `QR_${assetName?.replace(/[^a-zA-Z0-9]/g, '_') || 'Asset'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRefresh = () => {
    fetchAssets();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedLocation('all');
  };



  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="60vh">
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
      {/* Header card with title + actions */}
      <Card elevation={2}>
        <CardContent>
          <Grid
            container
            alignItems="center"
            justifyContent="space-between"
            spacing={2}
          >
            <Grid item>
              <Typography variant="h4" fontWeight={700} color="primary">
                QR Code Gallery
              </Typography>
              <Typography variant="body2" color="text.secondary">
                View and download QR codes for all assets in the system
              </Typography>
            </Grid>

            <Grid item>
              <Box display="flex" gap={1} flexWrap="wrap">
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
                  onClick={clearFilters}
                  disabled={!searchTerm && selectedLocation === 'all'}
                >
                  Clear Filters
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Search & Filter Card */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search assets by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                variant="outlined"
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setSearchTerm("")}
                        edge="end"
                      >
                        <Cancel fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Location Filter</InputLabel>
                <Select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  label="Location Filter"
                  startAdornment={
                    <InputAdornment position="start">
                      <FilterList fontSize="small" color="action" />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="all">All Locations</MenuItem>
                  {locations.map(location => (
                    <MenuItem key={location} value={location}>
                      {location}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <Box display="flex" gap={1} justifyContent="flex-end">
                <Chip
                  label={`${filteredAssets.length} of ${assets.length} QR codes`}
                  color="primary"
                  variant="outlined"
                />
                {loading && (
                  <Chip
                    icon={<CircularProgress size={14} color="inherit" />}
                    label="Loading..."
                    color="info"
                    variant="outlined"
                    sx={{
                      px: 1.5,
                      fontWeight: 500,
                      backgroundColor: "rgba(0, 123, 255, 0.08)",
                      borderRadius: "16px",
                      ".MuiChip-icon": { marginLeft: "4px" },
                    }}
                  />
                )}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* QR Code Grid - Direct on background */}
      <Box sx={{ mt: 3 }}>
        {loading && assets.length === 0 ? (
          // Initial loading state - show skeleton
          <Grid container spacing={6}>
            {Array.from({ length: 8 }).map((_, index) => (
              <Grid item xs={6} sm={4} md={3} lg={2.4} xl={2} key={`initial-skeleton-${index}`}>
                <Box
                  sx={{
                    textAlign: 'center',
                  }}
                >
                  {/* QR Code Skeleton */}
                  <Box 
                    sx={{ 
                      display: 'inline-block',
                      p: 1.5,
                      bgcolor: 'white',
                      borderRadius: 2,
                      boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                      border: '1px solid rgba(0,0,0,0.06)',
                      mb: 1.5
                    }}
                  >
                    <Box
                      sx={{ 
                        width: 110, 
                        height: 110,
                        bgcolor: 'grey.200',
                        borderRadius: 1,
                        animation: 'pulse 1.5s ease-in-out infinite',
                        '@keyframes pulse': {
                          '0%': {
                            opacity: 1,
                          },
                          '50%': {
                            opacity: 0.4,
                          },
                          '100%': {
                            opacity: 1,
                          },
                        },
                      }}
                    />
                  </Box>

                  {/* Asset Name Skeleton */}
                  <Box
                    sx={{ 
                      height: 16,
                      bgcolor: 'grey.200',
                      borderRadius: 0.5,
                      mb: 0.5,
                      mx: 1,
                      animation: 'pulse 1.5s ease-in-out infinite',
                      animationDelay: '0.1s',
                    }}
                  />

                  {/* Location Skeleton */}
                  <Box
                    sx={{ 
                      height: 12,
                      bgcolor: 'grey.200',
                      borderRadius: 0.5,
                      mb: 1.5,
                      mx: 2,
                      animation: 'pulse 1.5s ease-in-out infinite',
                      animationDelay: '0.2s',
                    }}
                  />

                  {/* Download Button Skeleton */}
                  <Box
                    sx={{ 
                      width: 36,
                      height: 36,
                      bgcolor: 'grey.200',
                      borderRadius: '50%',
                      mx: 'auto',
                      animation: 'pulse 1.5s ease-in-out infinite',
                      animationDelay: '0.3s',
                    }}
                  />
                </Box>
              </Grid>
            ))}
          </Grid>
        ) : filteredAssets.length === 0 ? (
          <Card>
            <CardContent>
              <Box textAlign="center" py={8}>
                <QrCode sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No QR codes found
                </Typography>
                <Typography variant="body2" color="text.disabled">
                  {searchTerm || selectedLocation !== 'all'
                    ? 'Try adjusting your filters'
                    : 'No assets with QR codes available'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={6}>
            {loading && assets.length > 0 ? (
              // Refreshing existing data - show skeleton
              Array.from({ length: 8 }).map((_, index) => (
                <Grid item xs={6} sm={4} md={3} lg={2.4} xl={2} key={`refresh-skeleton-${index}`}>
                  <Box
                    sx={{
                      textAlign: 'center',
                    }}
                  >
                    {/* QR Code Skeleton */}
                    <Box 
                      sx={{ 
                        display: 'inline-block',
                        p: 1.5,
                        bgcolor: 'white',
                        borderRadius: 2,
                        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                        border: '1px solid rgba(0,0,0,0.06)',
                        mb: 1.5
                      }}
                    >
                      <Box
                        sx={{ 
                          width: 110, 
                          height: 110,
                          bgcolor: 'grey.200',
                          borderRadius: 1,
                          animation: 'pulse 1.5s ease-in-out infinite',
                          '@keyframes pulse': {
                            '0%': {
                              opacity: 1,
                            },
                            '50%': {
                              opacity: 0.4,
                            },
                            '100%': {
                              opacity: 1,
                            },
                          },
                        }}
                      />
                    </Box>

                    {/* Asset Name Skeleton */}
                    <Box
                      sx={{ 
                        height: 16,
                        bgcolor: 'grey.200',
                        borderRadius: 0.5,
                        mb: 0.5,
                        mx: 1,
                        animation: 'pulse 1.5s ease-in-out infinite',
                        animationDelay: '0.1s',
                      }}
                    />

                    {/* Location Skeleton */}
                    <Box
                      sx={{ 
                        height: 12,
                        bgcolor: 'grey.200',
                        borderRadius: 0.5,
                        mb: 1.5,
                        mx: 2,
                        animation: 'pulse 1.5s ease-in-out infinite',
                        animationDelay: '0.2s',
                      }}
                    />

                    {/* Download Button Skeleton */}
                    <Box
                      sx={{ 
                        width: 36,
                        height: 36,
                        bgcolor: 'grey.200',
                        borderRadius: '50%',
                        mx: 'auto',
                        animation: 'pulse 1.5s ease-in-out infinite',
                        animationDelay: '0.3s',
                      }}
                    />
                  </Box>
                </Grid>
              ))
            ) : (
              filteredAssets.map(asset => (
                <Grid item xs={6} sm={4} md={3} lg={2.4} xl={2} key={asset._id}>
                  <Box
                    sx={{
                      textAlign: 'center',
                      transition: 'transform 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                      }
                    }}
                  >
                    {/* QR Code Container */}
                    <Box 
                      sx={{ 
                        display: 'inline-block',
                        p: 1.5,
                        bgcolor: 'white',
                        borderRadius: 2,
                        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                        border: '1px solid rgba(0,0,0,0.06)',
                        mb: 1.5
                      }}
                    >
                      <Box
                        component="img"
                        src={asset.qrCode}
                        alt={`QR Code for ${asset.name}`}
                        sx={{ 
                          width: 110, 
                          height: 110,
                          display: 'block'
                        }}
                      />
                    </Box>

                    {/* Asset Name */}
                    <Typography 
                      variant="body2" 
                      fontWeight={600}
                      color="text.primary"
                      sx={{ 
                        mt: -1,
                        mb: 0.25,
                        minHeight: 28,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        lineHeight: 1.2
                      }}
                      title={asset.name || 'Unnamed Asset'}
                    >
                      {asset.name || 'Unnamed Asset'}
                    </Typography>

                    {/* Location */}
                    {asset.locationId?.name && (
                      <Box display="flex" alignItems="center" justifyContent="center" mt={-1} mb={1}>
                        <LocationOn fontSize="small" sx={{ color: 'grey.500', mr: 0.5 }} />
                        <Typography 
                          variant="caption" 
                          color="text.secondary"
                          sx={{ 
                            maxWidth: 120,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                          title={asset.locationId.name}
                        >
                          {asset.locationId.name}
                        </Typography>
                      </Box>
                    )}

                    {/* Minimal Download Icon Button */}
                    <IconButton
                      onClick={() => downloadQRCode(asset.qrCode, asset.name)}
                      sx={{ 
                        backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#0d47a1' : '#1976d2',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#1565c0' : '#1565c0',
                        },
                        width: 36,
                        height: 36,
                        boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)',
                      }}
                      size="small"
                    >
                      <DownloadIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Grid>
              ))
            )}
          </Grid>
        )}
      </Box>

      {/* Mobile FAB for refresh */}
      {isMobile && (
        <Fab
          color="primary"
          aria-label="refresh"
          onClick={handleRefresh}
          sx={{ position: "fixed", bottom: 46, right: 36 }}
          disabled={loading}
        >
          <Refresh />
        </Fab>
      )}
    </Container>
  );
};

export default GenerateQR;