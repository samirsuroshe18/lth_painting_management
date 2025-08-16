import { useState } from "react";
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

const AddUser = () => {
  const { state } = useLocation();
  const user = state?.user;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    userName: user?.userName ?? "",
    email: user?.email ?? "",
    mobileNo: user?.mobileNo ?? "",
    password: "",
    confirmPassword: "",
    role: user?.role ?? "user",
    status: user?.isActive ? "active" : "inactive",
    location: user?.location ?? [],
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const userData = useSelector((state) => state.auth.userData?.user);
  const [locations, setLocations] = useState(userData.location);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = formData;
      payload.location = formData.location.map((item) => item._id);
      user ? await updateUser(user._id, payload) : await createUser(payload);
      navigate(-1);
      dispatch(
        showNotificationWithTimeout({
          show: true,
          type: "success",
          message: user
            ? "User updated successfully"
            : "User created successfully",
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
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Header card */}
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

      {/* Form Card */}
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
        <Grid container spacing={3}>
          {/* Name */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack spacing={1}>
              <Typography variant="subtitle2">Name *</Typography>
              <TextField
                name="userName"
                value={formData.userName}
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

          {/* Email */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack spacing={1}>
              <Typography variant="subtitle2">Email</Typography>
              <TextField
                name="email"
                value={formData.email}
                onChange={handleChange}
                fullWidth
                size="small"
                placeholder="Enter email"
                required
                type="email"
              />
            </Stack>
          </Grid>

          {/* Password */}
          {!user && (
            <Grid size={{ xs: 12, md: 6 }}>
              <Stack spacing={1}>
                <Typography variant="subtitle2">Password *</Typography>
                <TextField
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                  placeholder="Enter password"
                  required
                  type={showPassword ? "text" : "password"} // toggle
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword((prev) => !prev)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Stack>
            </Grid>
          )}

          {/* Confirm Password */}
          {!user && (
            <Grid size={{ xs: 12, md: 6 }}>
              <Stack spacing={1}>
                <Typography variant="subtitle2">Confirm Password *</Typography>
                <TextField
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                  placeholder="Enter confirm password"
                  required
                  type={showConfirmPassword ? "text" : "password"} // toggle
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() =>
                              setShowConfirmPassword((prev) => !prev)
                            }
                            edge="end"
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
          )}

          {/* Mobile No */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack spacing={1}>
              <Typography variant="subtitle2">Mobile No *</Typography>
              <TextField
                name="mobileNo"
                value={formData.mobileNo}
                onChange={handleChange}
                fullWidth
                size="small"
                placeholder="Enter mobile number"
                required
                type="tel"
                slotProps={{
                  input: {
                    maxLength: 10,
                    inputMode: "numeric",
                  },
                }}
              />
            </Stack>
          </Grid>

          {/* Role */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack spacing={1}>
              <Typography variant="subtitle2">Role *</Typography>
              <FormControl fullWidth required disabled={loading}>
                <Select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      role: e.target.value,
                    }))
                  }
                  required
                  displayEmpty
                  inputProps={{ "aria-label": "Without label" }}
                  size="small"
                >
                  <MenuItem value="">Select Role</MenuItem>
                  <MenuItem value="user">User</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="auditor">Auditor</MenuItem>
                </Select>
              </FormControl>
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
                  inputProps={{ "aria-label": "Without label" }}
                >
                  <MenuItem value="">Select Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Grid>

          {/* Location */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack spacing={1}>
              <Typography variant="subtitle2">Location *</Typography>
              <Autocomplete
                disableCloseOnSelect
                multiple
                limitTags={1}
                value={formData.location}
                isOptionEqualToValue={(option, value) =>
                  option._id === value._id
                }
                getOptionKey={(option) => option._id}
                getOptionLabel={(option) => option.name}
                onChange={(_, val) =>
                  setFormData((prev) => ({ ...prev, location: val }))
                } // Ensure val is never null
                options={locations}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="search location.."
                    slotProps={{
                      input: {
                        ...params.InputProps,
                      },
                    }}
                    size="small"
                  />
                )}
              />
            </Stack>
          </Grid>

          {/* Submit Button */}
          <Grid size={{ xs: "auto", md: "auto" }}>
            <Button
              type="submit"
              variant="contained"
              loading={loading}
              fullWidth
            >
              {user ? "Edit user" : "Create User"}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default AddUser;