import { useEffect, useState, useRef } from "react";
import {
  getAllDepartment,
  addDepartment,
  updateDepartment,
  deleteDepartment,
  addDepartmentsFromExcel,
} from "../../api/departmentApi";
import { useDispatch } from "react-redux";
import { showNotificationWithTimeout } from "../../redux/slices/notificationSlice";
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
  Container,
  Grid,
  Chip,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Stack,
  Alert,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import {
  DriveFileRenameOutline as EditIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Refresh,
  Cancel,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Upload as UploadIcon,
  CloudUpload as CloudUploadIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";
import { handleAxiosError } from "../../utils/handleAxiosError";

const DepartmentMaster = () => {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editDepartmentId, setEditDepartmentId] = useState(null);
  const [departmentName, setDepartmentName] = useState("");
  const [status, setStatus] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [filteredRows, setFilteredRows] = useState([]);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 5,
  });

  // Excel upload states
  const [excelUploadLoading, setExcelUploadLoading] = useState(false);
  const [showExcelDialog, setShowExcelDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadResults, setUploadResults] = useState(null);

  useEffect(() => {
    fetchDepartment();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, rows]);

  const fetchDepartment = async () => {
    try {
      setLoading(true);
      const result = await getAllDepartment();
      const departmentWithIds = result.data.map((department, index) => ({
        ...department,
        id: department._id ?? index,
      }));

      setRows(departmentWithIds);
    } catch (error) {
      setRows([]);
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

  const applyFilters = () => {
    let filtered = [...rows];

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();

      filtered = filtered.filter((department) => {
        const departmentName = (department.name || "").toLowerCase();
        return departmentName.includes(searchLower);
      });
    }

    setFilteredRows(filtered);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!departmentName || status === null) {
      dispatch(
        showNotificationWithTimeout({
          show: true,
          type: "error",
          message: "Please fill in all fields.",
        })
      );
      return;
    }

    try {
      setSubmitLoading(true);

      if (editMode) {
        const result = await updateDepartment(editDepartmentId, {
          name: departmentName,
          status,
        });

        const data = result.data;
        data.id = data._id;
        setFilteredRows((prev) =>
          prev.map((item) => (item.id === data.id ? data : item))
        );

        dispatch(
          showNotificationWithTimeout({
            show: true,
            type: "success",
            message: "Department updated successfully",
          })
        );
      } else {
        const result = await addDepartment({
          name: departmentName,
          status: status,
        });

        const data = result.data;
        data.id = data._id;
        setFilteredRows([data, ...filteredRows]);

        dispatch(
          showNotificationWithTimeout({
            show: true,
            type: "success",
            message: "Department added successfully",
          })
        );
      }

      handleCloseModal();
    } catch (error) {
      dispatch(
        showNotificationWithTimeout({
          show: true,
          type: "error",
          message: handleAxiosError(error),
        })
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEditClick = (department) => {
    setDepartmentName(department?.name ?? "");
    setStatus(department?.status);
    setEditDepartmentId(department._id);
    setEditMode(true);
    setShowDialog(true);
  };

  const handleDeleteClick = (user) => {
    setDepartmentToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!departmentToDelete) return;

    try {
      setDeleteLoading(true);
      const result = await deleteDepartment(departmentToDelete.id);

      if (result.success) {
        setRows((prev) =>
          prev.filter((item) => item.id !== departmentToDelete.id)
        );

        dispatch(
          showNotificationWithTimeout({
            show: true,
            type: "success",
            message: "Department deleted successfully",
          })
        );
      } else {
        dispatch(
          showNotificationWithTimeout({
            show: true,
            type: "error",
            message: "Failed to delete department",
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
      setDepartmentToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setDepartmentToDelete(null);
  };

  const handleCloseModal = () => {
    setShowDialog(false);
    setEditMode(false);
    setDepartmentName("");
    setStatus("");
    setEditDepartmentId(null);
  };

  const handleCreateClick = () => {
    setShowDialog(true);
    setEditMode(false);
    setDepartmentName("");
    setStatus("");
  };

  const handleRefresh = () => {
    fetchDepartment();
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Excel functionality
  const handleExcelUploadClick = () => {
    setShowExcelDialog(true);
    setSelectedFile(null);
    setUploadResults(null);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = [
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ];
      if (
        !validTypes.includes(file.type) &&
        !file.name.match(/\.(xlsx|xls)$/)
      ) {
        dispatch(
          showNotificationWithTimeout({
            show: true,
            type: "error",
            message: "Please select a valid Excel file (.xlsx or .xls)",
          })
        );
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleExcelUpload = async () => {
    if (!selectedFile) {
      dispatch(
        showNotificationWithTimeout({
          show: true,
          type: "error",
          message: "Please select a file first",
        })
      );
      return;
    }

    try {
      setExcelUploadLoading(true);
      const result = await addDepartmentsFromExcel(selectedFile);

      setUploadResults(result.data);

      // Refresh the data to show new departments
      await fetchDepartment();

      dispatch(
        showNotificationWithTimeout({
          show: true,
          type: "success",
          message: result.message || "Excel file processed successfully",
        })
      );
    } catch (error) {
      dispatch(
        showNotificationWithTimeout({
          show: true,
          type: "error",
          message: handleAxiosError(error),
        })
      );
    } finally {
      setExcelUploadLoading(false);
    }
  };

  const handleCloseExcelDialog = () => {
    setShowExcelDialog(false);
    setSelectedFile(null);
    setUploadResults(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const downloadTemplate = () => {
    // Create a simple CSV template
    const csvContent =
      "name|status\nIT Department|true\nHR Department|false\nFinance Department|true";
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "department_template.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const columns = [
    {
      field: "srNo",
      headerName: "Sr. No",
      width: 110,
      sortable: false,
      filterable: false,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => {
        const visibleIndex =
          params.api.getRowIndexRelativeToVisibleRows(params.id) ?? 0;
        const serial =
          paginationModel.page * paginationModel.pageSize + visibleIndex + 1;

        return (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
            }}
          >
            <Typography variant="body2">{serial}</Typography>
          </Box>
        );
      },
    },
    {
      field: "name",
      headerName: "Department Name",
      flex: 3,
      minWidth: 150,
      sortable: false,
      filterable: false,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      minWidth: 130,
      align: "center",
      sortable: false,
      filterable: false,
      headerAlign: "center",
      renderCell: (params) => (
        <Chip
          label={params.value ? "Active" : "Inactive"}
          size="small"
          color={params.value ? "success" : "default"}
          variant={params.value ? "filled" : "outlined"}
        />
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 2,
      minWidth: 140,
      sortable: false,
      filterable: false,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <Box
          sx={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 3,
          }}
        >
          <IconButton
            title="Edit Department"
            size="small"
            color="warning"
            onClick={(e) => {
              e.stopPropagation();
              handleEditClick(params.row);
            }}
            sx={{ p: 0.5 }}
          >
            <EditIcon fontSize="small" />
          </IconButton>

          <IconButton
            size="small"
            color="error"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(params.row);
            }}
            title="Delete Department"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header card */}
      <Grid container spacing={2} alignItems="center">
        <Grid size={{ xs: 12, md: "auto" }}>
          <Typography variant="h4" fontWeight={700} color="primary">
            Department Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage and monitor all department in the system
          </Typography>
        </Grid>
      </Grid>

      {/* Search & Filter Card */}
      <Grid container spacing={2} sx={{ mt: 4 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            fullWidth
            placeholder="Search department by name..."
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

        <Grid size={{ xs: 12, md: 8 }}>
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
              startIcon={<UploadIcon />}
              onClick={handleExcelUploadClick}
              disabled={loading}
            >
              Upload Excel
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateClick}
            >
              Add Department
            </Button>
          </Stack>
        </Grid>
      </Grid>

      {/* DataGrid */}
      <Box sx={{ height: 410, width: "100%", mt: 3 }}>
        <DataGrid
          rows={filteredRows}
          columns={columns}
          disableRowSelectionOnClick
          loading={loading}
          paginationModel={paginationModel}
          onPaginationModelChange={(newModel) => {
            if (newModel.pageSize !== paginationModel.pageSize) {
              setPaginationModel({ page: 0, pageSize: newModel.pageSize });
            } else {
              setPaginationModel(newModel);
            }
          }}
          pageSizeOptions={[5, 10, 25, 50]}
          rowHeight={60}
          headerHeight={50}
          sx={{
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "rgba(99,102,241,0.06)",
            },
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
          }}
        />
      </Box>

      {/* Add/Edit Dialog */}
      {showDialog && (
        <Dialog
          open={showDialog}
          onClose={handleCloseModal}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography variant="h6">
                {editMode ? "Edit Department" : "Add New Department"}
              </Typography>
              <IconButton
                onClick={handleCloseModal}
                size="small"
                disabled={submitLoading}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>

          <form onSubmit={handleSubmit}>
            <DialogContent>
              <Box display="flex" flexDirection="column" gap={3} pt={1}>
                <TextField
                  fullWidth
                  label="Department Name"
                  value={departmentName}
                  onChange={(e) => setDepartmentName(e.target.value)}
                  placeholder="Enter Department name"
                  variant="outlined"
                  required
                  disabled={submitLoading}
                />

                <FormControl fullWidth>
                  <Select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    required
                    displayEmpty
                    renderValue={(selected) => {
                      if (selected === "") {
                        return (
                          <span style={{ color: "#999" }}>Select status</span>
                        );
                      }
                      return selected == "active" || selected === true
                        ? "Active"
                        : "Inactive";
                    }}
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button
                onClick={handleCloseModal}
                variant="outlined"
                disabled={submitLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={submitLoading}
                startIcon={
                  submitLoading ? <CircularProgress size={16} /> : null
                }
              >
                {submitLoading
                  ? editMode
                    ? "Updating..."
                    : "Adding..."
                  : editMode
                    ? "Update"
                    : "Add Department"}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      )}

      {/* Excel Upload Dialog */}
      {showExcelDialog && (
        <Dialog
          open={showExcelDialog}
          onClose={handleCloseExcelDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography variant="h6">
                Upload Departments from Excel
              </Typography>
              <IconButton
                onClick={handleCloseExcelDialog}
                size="small"
                disabled={excelUploadLoading}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>

          <DialogContent>
            <Box display="flex" flexDirection="column" gap={3} pt={1}>
              <Alert severity="info">
                <Typography variant="body2">
                  Upload an Excel file with departments. The file should have
                  columns: <strong>name</strong> and <strong>status</strong>{" "}
                  (boolean: true/false).
                </Typography>
              </Alert>

              <Box>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={downloadTemplate}
                  sx={{ mb: 2 }}
                >
                  Download Template
                </Button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileSelect}
                  style={{ display: "none" }}
                />

                <Box
                  sx={{
                    border: "2px dashed",
                    borderColor: selectedFile ? "success.main" : "grey.300",
                    borderRadius: 2,
                    p: 3,
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      borderColor: "primary.main",
                      backgroundColor: (theme) =>
                        theme.palette.mode === "dark"
                          ? "rgba(255, 255, 255, 0.05)"
                          : "rgba(0, 0, 0, 0.04)",
                    },
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <CloudUploadIcon
                    sx={{
                      fontSize: 48,
                      color: selectedFile ? "success.main" : "grey.400",
                      mb: 1,
                    }}
                  />
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    {selectedFile
                      ? selectedFile.name
                      : "Click to select Excel file"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Supported formats: .xlsx, .xls
                  </Typography>
                </Box>
              </Box>

              {uploadResults && (
                <Box>
                  <Typography variant="h6" gutterBottom color="success.main">
                    Upload Results
                  </Typography>
                  <Alert severity="success" sx={{ mb: 2 }}>
                    Successfully processed{" "}
                    {uploadResults.summary?.successfullyCreated || 0}{" "}
                    departments
                  </Alert>

                  {uploadResults.summary?.failed > 0 && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                      {uploadResults.summary.failed} departments failed to
                      create
                    </Alert>
                  )}

                  {uploadResults.summary?.errors && (
                    <Box>
                      <Typography
                        variant="subtitle2"
                        color="error"
                        gutterBottom
                      >
                        Errors:
                      </Typography>
                      <List dense>
                        {uploadResults.summary.errors.map((error, index) => (
                          <ListItem key={index}>
                            <ListItemText
                              primary={error}
                              primaryTypographyProps={{
                                variant: "body2",
                                color: "error",
                              }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button
              onClick={handleCloseExcelDialog}
              variant="outlined"
              disabled={excelUploadLoading}
            >
              {uploadResults ? "Close" : "Cancel"}
            </Button>
            {!uploadResults && (
              <Button
                onClick={handleExcelUpload}
                variant="contained"
                disabled={excelUploadLoading || !selectedFile}
                startIcon={
                  excelUploadLoading ? (
                    <CircularProgress size={16} />
                  ) : (
                    <UploadIcon />
                  )
                }
              >
                {excelUploadLoading ? "Uploading..." : "Upload File"}
              </Button>
            )}
          </DialogActions>
        </Dialog>
      )}

      {/* Delete confirmation dialog */}
      {deleteDialogOpen && (
        <Dialog
          open={deleteDialogOpen}
          onClose={handleCancelDelete}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle color="error" sx={{ pb: 1 }}>
            <Box display="flex" alignItems="center" gap={1}>
              <DeleteIcon />
              Delete Department
            </Box>
          </DialogTitle>
          <DialogContent>
            <Alert severity="warning" sx={{ mb: 2 }}>
              This action cannot be undone. The department will be permanently
              removed from the system.
            </Alert>
            <Typography>
              Are you sure you want to delete department{" "}
              <strong>"{departmentToDelete?.name}"</strong>?
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              onClick={handleCancelDelete}
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
              startIcon={
                deleteLoading ? <CircularProgress size={16} /> : <DeleteIcon />
              }
            >
              {deleteLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Container>
  );
};

export default DepartmentMaster;
