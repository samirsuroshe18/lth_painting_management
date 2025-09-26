import { useCallback, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createUser, updateUser } from "../../api/userApi";
import {
  Container,
  Typography,
  Button,
  Box,
  FormControl,
  Select,
  MenuItem,
  Grid,
  TextField,
  Stack,
  Autocomplete,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { showNotificationWithTimeout } from "../../redux/slices/notificationSlice";
import { handleAxiosError } from "../../utils/handleAxiosError";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import LabelWithRedAsterisk from "../../components/LabelWithRedAsterisk";

export default function AddUser() {
  const { state } = useLocation();
  const user = state?.user;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const userData = useSelector((s) => s.auth?.userData?.user);
  const locations = useMemo(
    () => (Array.isArray(userData?.location) ? userData.location : []),
    [userData?.location]
  );
  const initialForm = useMemo(
    () => ({
      userName: user?.userName ?? "",
      email: user?.email ?? "",
      mobileNo: user?.mobileNo ?? "",
      password: "",
      confirmPassword: "",
      role: user?.role ?? "supervisor",
      status: !user ? "active" : user?.isActive ? "active" :  "inactive",
      location: Array.isArray(user?.location) ? user.location : [],
    }),
    [user]
  );
  const [formData, setFormData] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) =>
      prev[name] === value ? prev : { ...prev, [name]: value }
    );
  }, []);

  const handleRoleChange = useCallback((e) => {
    const value = e.target.value;
    setFormData((prev) =>
      prev.role === value ? prev : { ...prev, role: value }
    );
  }, []);

  const handleStatusChange = useCallback((e) => {
    const value = e.target.value;
    setFormData((prev) =>
      prev.status === value ? prev : { ...prev, status: value }
    );
  }, []);

  const handleLocationChange = useCallback((_, val) => {
    setFormData((prev) => {
      const prevIds = (prev.location || []).map((x) => x._id).join(",");
      const newIds = (val || []).map((x) => x._id).join(",");
      return prevIds === newIds ? prev : { ...prev, location: val || [] };
    });
  }, []);

  const toggleShowPassword = useCallback(() => {
    setShowPassword((p) => !p);
  }, []);

  const toggleShowConfirmPassword = useCallback(() => {
    setShowConfirmPassword((p) => !p);
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (!user && formData.password !== formData.confirmPassword) {
        dispatch(
          showNotificationWithTimeout({
            show: true,
            type: "error",
            message: "Passwords do not match",
          })
        );
        return;
      }

      try {
        setLoading(true);

        const payload = {
          ...formData,
          location: (formData.location || []).map((l) => l._id),
        };

        if (user?._id) {
          await updateUser(user._id, payload);
        } else {
          await createUser(payload);
        }

        dispatch(
          showNotificationWithTimeout({
            show: true,
            type: "success",
            message: user
              ? "User updated successfully"
              : "User created successfully",
          })
        );
        navigate(-1);
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
    },
    [dispatch, formData, navigate, user]
  );

  // stable helper for Autocomplete equality
  const isOptionEqualToValue = useCallback(
    (opt, val) => opt._id === val._id,
    []
  );
  const getOptionLabel = useCallback((opt) => opt?.name ?? "", []);

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Header */}
      <Grid container spacing={2} alignItems="center">
        <Grid size={{ xs: 12, md: "auto" }}>
          <Typography variant="h4" fontWeight={700} color="primary">
            {user ? "Edit User" : "Add New User"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user
              ? "Edit user account with access permissions"
              : "Create a new user account with access permissions"}
          </Typography>
        </Grid>
      </Grid>

      {/* Form */}
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
        <Grid container spacing={3}>
          {/* Name */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack spacing={1}>
              <LabelWithRedAsterisk required>Name</LabelWithRedAsterisk>
              <TextField
                name="userName"
                value={formData.userName}
                onChange={handleChange}
                fullWidth
                size="small"
                placeholder="Enter name"
                required
                autoComplete="name"
                type="text"
                sx={{
                  "& .MuiOutlinedInput-root": { backgroundColor: "inherit" },
                }}
              />
            </Stack>
          </Grid>

          {/* Email */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack spacing={1}>
              <LabelWithRedAsterisk required>Email</LabelWithRedAsterisk>
              <TextField
                name="email"
                value={formData.email}
                onChange={handleChange}
                fullWidth
                size="small"
                placeholder="Enter email"
                required
                type="email"
                autoComplete="email"
              />
            </Stack>
          </Grid>

          {/* Passwords: only on create */}
          {!user && (
            <>
              <Grid size={{ xs: 12, md: 6 }}>
                <Stack spacing={1}>
                  <LabelWithRedAsterisk required>Password</LabelWithRedAsterisk>
                  <TextField
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    fullWidth
                    size="small"
                    placeholder="Enter password"
                    required
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={toggleShowPassword}
                              edge="end"
                              aria-label="toggle password visibility"
                            >
                              {showPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </Stack>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Stack spacing={1}>
                  <LabelWithRedAsterisk required>
                    Confirm Password
                  </LabelWithRedAsterisk>
                  <TextField
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    fullWidth
                    size="small"
                    placeholder="Enter confirm password"
                    required
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={toggleShowConfirmPassword}
                              edge="end"
                              aria-label="toggle confirm password visibility"
                            >
                              {showConfirmPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </Stack>
              </Grid>
            </>
          )}

          {/* Mobile */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack spacing={1}>
              <LabelWithRedAsterisk required>Mobile No</LabelWithRedAsterisk>
              <TextField
                name="mobileNo"
                value={formData.mobileNo}
                onChange={handleChange}
                fullWidth
                size="small"
                placeholder="Enter mobile number"
                required
                type="tel"
                autoComplete="tel"
                inputProps={{
                  maxLength: 10,
                  inputMode: "numeric",
                  pattern: "[0-9]*",
                }}
              />
            </Stack>
          </Grid>

          {/* Role */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack spacing={1}>
              <LabelWithRedAsterisk required>Role</LabelWithRedAsterisk>
              <FormControl fullWidth size="small">
                <Select
                  value={formData.role}
                  onChange={handleRoleChange}
                  required
                  displayEmpty
                  size="small"
                  renderValue={(selected) => {
                    if (selected === "") {
                      return <span style={{ color: "#999" }}>Select Role</span>;
                    }
                    return selected == "supervisor"
                      ? "Supervisor"
                      : selected === "admin"
                        ? "Admin"
                        : "Auditor";
                  }}
                >
                  <MenuItem value="supervisor">Supervisor</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="auditor">Auditor</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Grid>

          {/* Status */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack spacing={1}>
              <LabelWithRedAsterisk required>Status</LabelWithRedAsterisk>
              <FormControl fullWidth size="small">
                <Select
                  value={formData.status ?? ""}
                  onChange={handleStatusChange}
                  required
                  displayEmpty
                  size="small"
                  renderValue={(selected) => {
                    if (selected === "") {
                      return (
                        <span style={{ color: "#999" }}>Select status</span>
                      );
                    }
                    return selected == "active" ? "Active" : "Inactive";
                  }}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Grid>

          {/* Location */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack spacing={1}>
              <LabelWithRedAsterisk required>Location</LabelWithRedAsterisk>
              <Autocomplete
                multiple
                disableCloseOnSelect
                limitTags={1}
                value={formData.location}
                options={locations}
                getOptionLabel={(option) => option?.name || ""}
                onChange={handleLocationChange}
                noOptionsText="No locations available"
                sx={{ mt: 1 }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Search location..."
                    size="small"
                  />
                )}
              />
            </Stack>
          </Grid>

          {/* Submit */}
          <Grid size={{ xs: "auto", md: "auto" }}>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{ minWidth: 150 }}
            >
              {loading
                ? user
                  ? "Updating..."
                  : "Creating..."
                : user
                  ? "Update User"
                  : "Create User"}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}