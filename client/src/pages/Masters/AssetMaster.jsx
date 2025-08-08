import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {
  IconButton,
  Tooltip,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
  Paper,
  Container,
  Grid,
  Card,
  CardContent,
  Chip,
  Avatar,
  Fab,
  TextField,
  InputAdornment,
  Alert,
  Skeleton,
  Divider,
  useTheme,
  useMediaQuery
} from "@mui/material";
import {
  CheckCircle,
  Cancel,
  QrCode,
  Delete as DeleteIcon,
  Edit as EditIcon,
  History,
  Add as AddIcon,
  Search as SearchIcon,
  FilterList,
  Refresh,
  Visibility
} from "@mui/icons-material";
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { getAssets, removeAsset } from "../../api/assetMasterApi";
import { showNotificationWithTimeout } from "../../redux/slices/notificationSlice";
import { handleAxiosError } from "../../utils/handleAxiosError";
import { useNavigate } from "react-router-dom";

export default function AssetMaster() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // State management
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredAssets, setFilteredAssets] = useState([]);
  
  // Dialog states
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [selectedQr, setSelectedQr] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);

  // Pagination state
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

  // Fetch assets on component mount
  useEffect(() => {
    fetchAssets();
  }, []);

  // Filter assets based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredAssets(assets);
    } else {
      const filtered = assets.filter(asset =>
        asset.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.artist?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.place?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.locationId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredAssets(filtered);
    }
  }, [searchTerm, assets]);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const response = await getAssets({
        page: paginationModel.page + 1,
        limit: paginationModel.pageSize,
        search: searchTerm
      });
      
      const assetsWithIds = (response.data?.assets || []).map((asset, index) => ({
        ...asset,
        id: asset._id,
        srNo: (paginationModel.page * paginationModel.pageSize) + index + 1,
      }));
      
      setAssets(assetsWithIds);
      setFilteredAssets(assetsWithIds);
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

  const handleCreateClick = () => {
    navigate("new");
  };

  const handleApprove = (assetId) => {
    dispatch(
      showNotificationWithTimeout({
        show: true,
        type: "success",
        message: "Asset approved successfully",
      })
    );
  };

  const handleReject = (assetId) => {
    dispatch(
      showNotificationWithTimeout({
        show: true,
        type: "info",
        message: "Asset rejected",
      })
    );
  };

  const handleEdit = (row) => {
    navigate("edit-asset", { state: { asset: row } });
  };

  const handleView = (row) => {
    setSelectedAsset(row);
    setViewDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!assetToDelete) return;

    try {
      setDeleteLoading(true);
      const response = await removeAsset(assetToDelete.id);
      
      if (response.success) {
        // Remove the asset from local state immediately
        setAssets(prevAssets => prevAssets.filter(asset => asset.id !== assetToDelete.id));
        setFilteredAssets(prevAssets => prevAssets.filter(asset => asset.id !== assetToDelete.id));
        
        dispatch(
          showNotificationWithTimeout({
            show: true,
            type: "success",
            message: "Asset deleted successfully",
          })
        );
      }
    } catch (error) {
      dispatch(
        showNotificationWithTimeout({
          show: true,
          type: "error",
          message: handleAxiosError(error),
        })
      );
    } finally {
      setDeleteLoading(false);
      setDeleteDialogOpen(false);
      setAssetToDelete(null);
    }
  };

  const handleHistory = (assetId) => {
    navigate("log-history", { state: { assetId } });
  };

  const handleRefresh = () => {
    fetchAssets();
  };

  // DataGrid columns configuration
  const columns = [
    {
      field: 'srNo',
      headerName: 'Sr. No',
      width: 70,
      sortable: false,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontSize: '0.875rem', color: theme.palette.text.primary }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'name',
      headerName: 'Asset Name',
      width: 220,
      minWidth: 180,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
          <Avatar
            src={params.row.image}
            sx={{ width: 28, height: 28, bgcolor: 'primary.main', fontSize: '0.75rem' }}
          >
            {params.value?.charAt(0)?.toUpperCase()}
          </Avatar>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
            <Typography variant="body2" fontWeight="medium" sx={{ fontSize: '0.875rem', lineHeight: 1.2, color: theme.palette.text.primary }}>
              {params.value}
            </Typography>
            <Typography variant="caption" sx={{ fontSize: '0.75rem', lineHeight: 1.2, color: theme.palette.text.secondary }}>
              {params.row.artist || '-'}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: 'locationId',
      headerName: 'Location',
      width: 130,
      minWidth: 100,
      renderCell: (params) => (
        <Chip
          label={params.row.locationId?.name || '-'}
          size="small"
          variant="outlined"
          color="primary"
          sx={{ fontSize: '0.75rem', height: 24 }}
        />
      ),
    },
    {
      field: 'place',
      headerName: 'Place',
      width: 100,
      minWidth: 80,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontSize: '0.875rem', color: theme.palette.text.primary }}>
          {params.value || '-'}
        </Typography>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Active' : 'Inactive'}
          size="small"
          color={params.value ? 'success' : 'default'}
          variant={params.value ? 'filled' : 'outlined'}
          sx={{ fontSize: '0.75rem', height: 24 }}
        />
      ),
    },
    {
      field: 'reviewStatus',
      headerName: 'Review Status',
      width: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const status = params.value;
        const statusConfig = {
          pending: { color: 'warning', label: 'Pending' },
          approved: { color: 'success', label: 'Approved' },
          rejected: { color: 'error', label: 'Rejected' }
        };
        const config = statusConfig[status] || { color: 'default', label: status };
        
        return (
          <Chip
            label={config.label}
            size="small"
            color={config.color}
            variant="outlined"
            sx={{ fontSize: '0.75rem', height: 24 }}
          />
        );
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 240,
      minWidth: 200,
      sortable: false,
      filterable: false,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Box sx={{ 
          display: 'flex', 
          gap: 0.25, 
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: 'nowrap'
        }}>
          {params.row.reviewStatus === "pending" && (
            <>
                             <Tooltip title="Approve">
                 <IconButton
                   size="small"
                   onClick={(e) => {
                     e.stopPropagation();
                     handleApprove(params.row.id);
                   }}
                   sx={{ 
                     color: theme.palette.success.main,
                     width: 28,
                     height: 28,
                     '&:hover': { backgroundColor: theme.palette.success.light, color: theme.palette.success.contrastText }
                   }}
                 >
                   <CheckCircle sx={{ fontSize: 16 }} />
                 </IconButton>
               </Tooltip>
               <Tooltip title="Reject">
                 <IconButton
                   size="small"
                   onClick={(e) => {
                     e.stopPropagation();
                     handleReject(params.row.id);
                   }}
                   sx={{ 
                     color: theme.palette.error.main,
                     width: 28,
                     height: 28,
                     '&:hover': { backgroundColor: theme.palette.error.light, color: theme.palette.error.contrastText }
                   }}
                 >
                   <Cancel sx={{ fontSize: 16 }} />
                 </IconButton>
               </Tooltip>
            </>
          )}

                     <Tooltip title="View Details">
             <IconButton
               size="small"
               onClick={(e) => {
                 e.stopPropagation();
                 handleView(params.row);
               }}
               sx={{ 
                 color: theme.palette.info.main,
                 width: 28,
                 height: 28,
                 '&:hover': { backgroundColor: theme.palette.info.light, color: theme.palette.info.contrastText }
               }}
             >
               <Visibility sx={{ fontSize: 16 }} />
             </IconButton>
           </Tooltip>

           <Tooltip title="QR Code">
             <IconButton
               size="small"
               onClick={(e) => {
                 e.stopPropagation();
                 const src = params.row.qrCode?.startsWith("data:image")
                   ? params.row.qrCode
                   : "data:image/png;base64," + params.row.qrCode;
                 setSelectedQr(src);
                 setQrDialogOpen(true);
               }}
               sx={{ 
                 color: theme.palette.primary.main,
                 width: 28,
                 height: 28,
                 '&:hover': { backgroundColor: theme.palette.primary.light, color: theme.palette.primary.contrastText }
               }}
             >
               <QrCode sx={{ fontSize: 16 }} />
             </IconButton>
           </Tooltip>

           <Tooltip title="Edit Asset">
             <IconButton
               size="small"
               onClick={(e) => {
                 e.stopPropagation();
                 handleEdit(params.row);
               }}
               sx={{ 
                 color: theme.palette.warning.main,
                 width: 28,
                 height: 28,
                 '&:hover': { backgroundColor: theme.palette.warning.light, color: theme.palette.warning.contrastText }
               }}
             >
               <EditIcon sx={{ fontSize: 16 }} />
             </IconButton>
           </Tooltip>

           <Tooltip title="Delete">
             <IconButton
               size="small"
               onClick={(e) => {
                 e.stopPropagation();
                 setAssetToDelete(params.row);
                 setDeleteDialogOpen(true);
               }}
               sx={{ 
                 color: theme.palette.error.main,
                 width: 28,
                 height: 28,
                 '&:hover': { backgroundColor: theme.palette.error.light, color: theme.palette.error.contrastText }
               }}
             >
               <DeleteIcon sx={{ fontSize: 16 }} />
             </IconButton>
           </Tooltip>

           <Tooltip title="Audit Logs">
             <IconButton
               size="small"
               onClick={(e) => {
                 e.stopPropagation();
                 handleHistory(params.row.id);
               }}
               sx={{ 
                 color: theme.palette.secondary.main,
                 width: 28,
                 height: 28,
                 '&:hover': { backgroundColor: theme.palette.secondary.light, color: theme.palette.secondary.contrastText }
               }}
             >
               <History sx={{ fontSize: 16 }} />
             </IconButton>
           </Tooltip>
        </Box>
      ),
    },
  ];

  return (
         <Container maxWidth="xl" sx={{ 
       py: 3, 
       backgroundColor: theme.palette.mode === 'dark' ? '#000000' : theme.palette.background.default,
       minHeight: '100vh',
       color: theme.palette.text.primary
     }}>
      {/* Header Section */}
      <Card elevation={2} sx={{ mb: 3, borderRadius: 2, backgroundColor: theme.palette.mode === 'dark' ? '#121212' : theme.palette.background.paper }}>
        <CardContent>
          <Grid container alignItems="center" justifyContent="space-between" spacing={2}>
            <Grid item>
              <Typography variant="h4" fontWeight="bold" sx={{ color: theme.palette.primary.main }}>
                Asset Management
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5, color: theme.palette.text.secondary }}>
                Manage and monitor all painting assets in the system
              </Typography>
            </Grid>
            <Grid item>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={handleRefresh}
                  disabled={loading}
                >
                  Refresh
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleCreateClick}
                  sx={{
                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                    boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                  }}
                >
                  Add Asset
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Search and Filter Section */}
      <Card elevation={1} sx={{ mb: 3, borderRadius: 2, backgroundColor: theme.palette.mode === 'dark' ? '#121212' : theme.palette.background.paper }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search assets by name, artist, place, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
                size="small"
                                 sx={{
                   '& .MuiOutlinedInput-root': {
                     backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : theme.palette.background.paper,
                   },
                 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <Chip
                  label={`${filteredAssets.length} assets`}
                  color="primary"
                  variant="outlined"
                />
                {loading && (
                  <Chip
                    icon={<CircularProgress size={16} />}
                    label="Loading..."
                    color="info"
                  />
                )}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* DataGrid Section */}
      <Card elevation={1} sx={{ borderRadius: 2, overflow: 'hidden', backgroundColor: theme.palette.mode === 'dark' ? '#121212' : theme.palette.background.paper }}>
        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={filteredAssets}
            columns={columns}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[5, 10, 25, 50]}
            pagination
            loading={loading}
            disableRowSelectionOnClick
            rowHeight={60}
            headerHeight={50}
                         sx={{
               border: 'none',
               color: theme.palette.text.primary,
               backgroundColor: theme.palette.mode === 'dark' ? '#121212' : theme.palette.background.paper,
               '& .MuiDataGrid-cell': {
                 borderBottom: `1px solid ${theme.palette.divider}`,
                 padding: '8px 12px',
                 display: 'flex',
                 alignItems: 'center',
                 color: theme.palette.text.primary,
                 backgroundColor: 'transparent',
               },
               '& .MuiDataGrid-columnHeaders': {
                 backgroundColor: theme.palette.primary.main,
                 color: theme.palette.primary.contrastText,
                 fontWeight: 'bold',
                 fontSize: '0.875rem',
               },
               '& .MuiDataGrid-columnHeader': {
                 padding: '8px 12px',
                 color: theme.palette.primary.contrastText,
               },
               '& .MuiDataGrid-row': {
                 minHeight: '60px !important',
                 backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : theme.palette.background.paper,
                 color: theme.palette.text.primary,
                 '&:hover': {
                   backgroundColor: theme.palette.action.hover,
                 },
                 '&:nth-of-type(even)': {
                   backgroundColor: theme.palette.mode === 'dark' ? '#2d2d2d' : theme.palette.grey[50],
                 },
               },
               '& .MuiDataGrid-footerContainer': {
                 backgroundColor: theme.palette.mode === 'dark' ? '#121212' : theme.palette.background.paper,
                 borderTop: `1px solid ${theme.palette.divider}`,
                 color: theme.palette.text.primary,
               },
               '& .MuiDataGrid-virtualScroller': {
                 backgroundColor: theme.palette.mode === 'dark' ? '#121212' : theme.palette.background.paper,
               },
               '& .MuiDataGrid-main': {
                 backgroundColor: theme.palette.mode === 'dark' ? '#121212' : theme.palette.background.paper,
               },
               '& .MuiDataGrid-toolbarContainer': {
                 backgroundColor: theme.palette.mode === 'dark' ? '#121212' : theme.palette.background.paper,
                 color: theme.palette.text.primary,
                 borderBottom: `1px solid ${theme.palette.divider}`,
               },
               '& .MuiDataGrid-toolbar': {
                 color: theme.palette.text.primary,
               },
               '& .MuiDataGrid-panel': {
                 backgroundColor: theme.palette.mode === 'dark' ? '#121212' : theme.palette.background.paper,
                 color: theme.palette.text.primary,
               },
               '& .MuiDataGrid-panelContent': {
                 backgroundColor: theme.palette.mode === 'dark' ? '#121212' : theme.palette.background.paper,
                 color: theme.palette.text.primary,
               },
               '& .MuiDataGrid-pagination': {
                 color: theme.palette.text.primary,
               },
               '& .MuiTablePagination-root': {
                 color: theme.palette.text.primary,
               },
               '& .MuiTablePagination-select': {
                 color: theme.palette.text.primary,
               },
               '& .MuiTablePagination-selectIcon': {
                 color: theme.palette.text.primary,
               },
               '& .MuiTablePagination-actions': {
                 color: theme.palette.text.primary,
               },
               '& .MuiIconButton-root': {
                 color: theme.palette.text.primary,
               },
               '& .MuiDataGrid-cell:focus': {
                 outline: 'none',
               },
               '& .MuiDataGrid-cell:focus-within': {
                 outline: 'none',
               },
             }}
            components={{
              Toolbar: GridToolbar,
            }}
            componentsProps={{
              toolbar: {
                showQuickFilter: false,
                printOptions: { disableToolbarButton: true },
                csvOptions: { disableToolbarButton: true },
              },
            }}
          />
        </Box>
      </Card>

      {/* Floating Action Button for Mobile */}
      {isMobile && (
        <Fab
          color="primary"
          aria-label="add"
          onClick={handleCreateClick}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
          }}
        >
          <AddIcon />
        </Fab>
      )}

      {/* QR Code Dialog */}
      <Dialog 
        open={qrDialogOpen} 
        onClose={() => setQrDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" fontWeight="bold">
            QR Code
          </Typography>
        </DialogTitle>
        <DialogContent>
          {selectedQr && (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <img
                src={selectedQr}
                alt="QR Code"
                style={{
                  width: 256,
                  height: 256,
                  margin: 'auto',
                  display: 'block',
                  borderRadius: 8,
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          {selectedQr && (
            <Button
              component="a"
              href={selectedQr}
              download="qrcode.png"
              variant="contained"
              startIcon={<QrCode />}
            >
              Download QR
            </Button>
          )}
          <Button 
            onClick={() => setQrDialogOpen(false)}
            variant="outlined"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" fontWeight="bold" color="error">
            Delete Asset
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action cannot be undone.
          </Alert>
          <Typography>
            Are you sure you want to delete{" "}
            <strong>{assetToDelete?.name}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            variant="outlined"
            disabled={deleteLoading}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            disabled={deleteLoading}
            onClick={handleDelete}
            startIcon={deleteLoading ? <CircularProgress size={16} /> : <DeleteIcon />}
          >
            {deleteLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Asset Details Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" fontWeight="bold">
            Asset Details
          </Typography>
        </DialogTitle>
        <DialogContent>
          {selectedAsset && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <img
                    src={selectedAsset.image}
                    alt={selectedAsset.name}
                    style={{
                      width: '100%',
                      maxWidth: 300,
                      height: 'auto',
                      borderRadius: 8,
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                    }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={8}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                      {selectedAsset.name}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Artist
                    </Typography>
                    <Typography variant="body1">
                      {selectedAsset.artist || '-'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Year
                    </Typography>
                    <Typography variant="body1">
                      {selectedAsset.year || '-'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Location
                    </Typography>
                    <Typography variant="body1">
                      {selectedAsset.locationId?.name || '-'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Place
                    </Typography>
                    <Typography variant="body1">
                      {selectedAsset.place || '-'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Size
                    </Typography>
                    <Typography variant="body1">
                      {selectedAsset.size || '-'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Status
                    </Typography>
                    <Chip
                      label={selectedAsset.status ? 'Active' : 'Inactive'}
                      color={selectedAsset.status ? 'success' : 'default'}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Description
                    </Typography>
                    <Typography variant="body1">
                      {selectedAsset.description || 'No description available'}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => setViewDialogOpen(false)}
            variant="outlined"
          >
            Close
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setViewDialogOpen(false);
              handleEdit(selectedAsset);
            }}
            startIcon={<EditIcon />}
          >
            Edit Asset
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
