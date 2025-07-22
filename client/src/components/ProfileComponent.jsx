import { useState } from "react";
import { Box, Avatar, Typography, Menu, MenuItem, ListItemIcon, ListItemText, Divider, Paper, IconButton } from "@mui/material";
import { Logout, Lock, ExpandMore, ExpandLess, VpnKey } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../api/authApi";
import { useNavigate } from "react-router-dom";
import { showNotificationWithTimeout } from "../redux/slices/notificationSlice";
import { handleAxiosError } from "../utils/handleAxiosError";

const ProfileComponent = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userData = useSelector((state) => state.auth.userData?.user);

  const handleClick = async (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async() => {
    handleClose();
    try {
      await logoutUser();
      navigate("/login");
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

  const handleChangePassword = () => {
    handleClose();
    navigate("/change-password");
  };

  const handleForgotPassword = () => {
    handleClose();
    navigate("/forgot-password");
  };

  return (
    <Box sx={{ width: "100%", mt: "auto" }}>
      <Paper
        elevation={0}
        sx={{
          borderRadius: 2,
          p: 1,
          cursor: "pointer",
          transition: "all 0.2s ease",
          "&:hover": {
            backgroundColor: "action.hover",
          },
        }}
        onClick={handleClick}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            width: "100%",
          }}
        >
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: "primary.main",
              fontSize: "16px",
              fontWeight: "bold",
            }}
          >
            {userData?.profilePic}
          </Avatar>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: "text.primary",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {userData?.userName || "N/A"}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                display: "block",
              }}
            >
              {userData?.email || "N/A"}
            </Typography>
          </Box>

          <IconButton size="small" sx={{ ml: "auto" }}>
            {open ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>
      </Paper>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          elevation: 8,
          sx: {
            overflow: "visible",
            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
            mt: 1.5,
            minWidth: 200,
            "& .MuiAvatar-root": {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
          },
        }}
        transformOrigin={{ horizontal: "left", vertical: "top" }}
        anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
      >
        <Box
          sx={{
            px: 2,
            py: 1,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <ListItemText>
            <Typography variant="body2" fontWeight={600}>
              {userData?.userName || "N/A"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {userData?.role || "N/A"}
            </Typography>
          </ListItemText>
        </Box>

        <MenuItem onClick={handleChangePassword} sx={{ py: 1.5 }}>
          <ListItemIcon>
            <Lock fontSize="small" />
          </ListItemIcon>
          <ListItemText>Change Password</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={handleForgotPassword} sx={{ py: 1.5 }}>
          <ListItemIcon>
            <VpnKey fontSize="small" />
          </ListItemIcon>
          <ListItemText>Forgot Password</ListItemText>
        </MenuItem>

        <Divider />

        <MenuItem
          onClick={handleLogout}
          sx={{
            py: 1.5,
            color: "error.main",
            "&:hover": {
              backgroundColor: "error.light",
              color: "error.contrastText",
            },
          }}
        >
          <ListItemIcon>
            <Logout fontSize="small" sx={{ color: "inherit" }} />
          </ListItemIcon>
          <ListItemText>Logout</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ProfileComponent;
