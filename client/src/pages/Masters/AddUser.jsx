import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createUser } from "../../api/userApi";
import { getAllLocations } from "../../api/locationApi";
import {
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  OutlinedInput,
} from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { showNotificationWithTimeout } from "../../redux/slices/notificationSlice";
import { handleAxiosError } from "../../utils/handleAxiosError";

const AddUser = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    mobileNo: "",
    password: "",
    confirmPassword: "",
    role: "user",
    status: "active",
    location: [], // array of location _id strings
  });

  const userData = useSelector((state) => state.auth.userData?.user);
  const [locations, setLocations] = useState(userData.location);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "location") {
      // Special handling for "Select all" pseudo-option
      const ALL_VALUE = "__all__";
      const optionValues = locations.map((l) => l._id);

      if (value.includes(ALL_VALUE)) {
        const isAllSelected = formData.location.length === optionValues.length;
        const next = isAllSelected ? [] : optionValues;
        setFormData((prev) => ({ ...prev, location: next }));
      } else {
        setFormData((prev) => ({ ...prev, location: value }));
      }
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createUser(formData);
      alert("User created successfully");
      navigate("/masters/user-master");
    } catch (error) {
      dispatch(
        showNotificationWithTimeout({
          show: true,
          type: "error",
          message: handleAxiosError(error),
        })
      );
    }
  };

  const handleCancel = () => {
    navigate("/masters/user-master");
  };

  // Helpers for rendering selected values nicely
  const getLocationName = (id) =>
    locations.find((l) => l._id === id)?.name || id;
  const renderSelectedLocations = (selectedIds) => {
    if (!selectedIds?.length) return "";
    // If many, show a compact count
    if (selectedIds.length > 3) return `${selectedIds.length} selected`;
    return selectedIds.map(getLocationName).join(", ");
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Header Card */}
      <Card elevation={2} sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2}>
            <IconButton onClick={handleCancel} color="primary" sx={{ p: 1 }}>
              <ArrowBackIcon />
            </IconButton>
            <Box>
              <Typography variant="h4" fontWeight={700} color="primary">
                Add New User
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create a new user account with access permissions
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Form Card */}
      <Card elevation={2}>
        <CardContent sx={{ p: 4 }}>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                  Username
                </label>
                <input
                  type="text"
                  name="userName"
                  value={formData.userName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded shadow-sm focus:ring focus:ring-blue-500 dark:bg-gray dark:border-gray-400 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded shadow-sm focus:ring focus:ring-blue-500 dark:bg-gray dark:border-gray-400 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                  Mobile No
                </label>
                <input
                  type="text"
                  name="mobileNo"
                  value={formData.mobileNo}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded shadow-sm focus:ring focus:ring-blue-500 dark:bg-gray dark:border-gray-400 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                  Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-400 rounded shadow-sm focus:ring focus:ring-blue-500 dark:bg-gray dark:border-gray-500 dark:text-white [&>option]:dark:bg-gray-700 [&>option]:dark:text-white"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="auditor">Auditor</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-500 dark:bg-gray dark:border-gray-400 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-500 dark:bg-gray dark:border-gray-400 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-400 rounded shadow-sm focus:ring focus:ring-blue-500 dark:bg-gray dark:border-gray-500 dark:text-white [&>option]:dark:bg-gray-700 [&>option]:dark:text-white"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
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
                    value={formData.location}
                    onChange={handleChange}
                    input={<OutlinedInput label="Location" />}
                    renderValue={(selected) =>
                      renderSelectedLocations(selected)
                    }
                    MenuProps={{
                      PaperProps: { style: { maxHeight: 360, width: 320 } },
                    }}
                  >
                    {/* Select all toggle */}
                    <MenuItem value="__all__">
                      <Checkbox
                        checked={
                          locations.length > 0 &&
                          formData.location.length === locations.length
                        }
                        indeterminate={
                          formData.location.length > 0 &&
                          formData.location.length < locations.length
                        }
                      />
                      <ListItemText
                        primary={
                          formData.location.length === locations.length
                            ? "Clear all"
                            : "Select all"
                        }
                      />
                    </MenuItem>

                    {Array.isArray(locations) && locations.length > 0 ? (
                      locations.map((loc) => (
                        <MenuItem key={loc._id} value={loc._id}>
                          <Checkbox
                            checked={formData.location.indexOf(loc._id) > -1}
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
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                size="large"
                sx={{ minWidth: 120 }}
              >
                Create User
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
};

export default AddUser;
