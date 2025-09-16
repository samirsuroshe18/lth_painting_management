import { useEffect, useMemo, useState } from "react";
import Preloader from "./components/Preloader";
import { Outlet, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { ReactRouterAppProvider } from "@toolpad/core/react-router";
import { getCurrentUser } from "./api/authApi";
import { currentUser } from "./redux/slices/authSlice";
import {
  LinearProgress,
  ThemeProvider,
  CssBaseline,
  GlobalStyles,
  createTheme,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import SettingsIcon from "@mui/icons-material/Settings";
import PeopleIcon from "@mui/icons-material/People";
import DevicesOtherIcon from "@mui/icons-material/DevicesOther";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CorporateFareIcon from "@mui/icons-material/CorporateFare";
import FloorIcon from "@mui/icons-material/Layers";
import PublicIcon from "@mui/icons-material/Public";
import BuildingIcon from "@mui/icons-material/Apartment";
import DepartmentIcon from "@mui/icons-material/Domain";
import AreaIcon from "@mui/icons-material/Map";
import CityIcon from "@mui/icons-material/LocationCity";
import QrCodeIcon from "@mui/icons-material/QrCode";
import AssessmentIcon from "@mui/icons-material/Assessment";
import SnackBar from "./components/commonComponents/SnackBar";
import canAccess from "./utils/canAccess";
import { setNavigate } from "./utils/navigationHelper";

function App() {
  const userData = useSelector((state) => state.auth.userData?.user);

  const [mode, setMode] = useState(localStorage.getItem("mui-mode") || "light");
  const [loading, setLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const handleStorage = () => {
      setMode(localStorage.getItem("mui-mode") || "light");
    };
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const theme = useMemo(() => createTheme({ palette: { mode } }), [mode]);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    setNavigate(navigate);
  }, [navigate]);

  // 🔹 Fetch current user on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getCurrentUser();
        dispatch(currentUser(res.data));

        // ⏳ Show preloader for minimum 1.5s even if API is fast
        setTimeout(() => {
          setFadeOut(true); // trigger fade
          setTimeout(() => setLoading(false), 800); // remove after fade
        }, 500);
      } catch (error) {
        navigate("/login");
        setLoading(false);
      }
    };
    fetchData();
  }, [dispatch, navigate]);

  const BRANDING = {
    title: "Artifact E-Gallary Portal",
    logo: <img src="/lt-logo.svg" alt="L&T Logo" style={{ height: "24px" }} />,
  };

  const navigationConfig = [
    {
      segment: "",
      title: "Dashboard",
      icon: <DashboardIcon />,
      permission: "dashboard:view",
    },
    {
      segment: "masters",
      title: "Masters",
      icon: <SettingsIcon />,
      permission: "masters:view",
      children: [
        {
          segment: "user-master",
          title: "User Master",
          icon: <PeopleIcon />,
          permission: "userMaster:view",
        },
        {
          segment: "asset-master",
          title: "Asset Master",
          icon: <DevicesOtherIcon />,
          permission: "assetMaster:view",
        },
        {
          segment: "location-master",
          title: "Location Master",
          icon: <CorporateFareIcon />,
          permission: "locationMaster:view",
          children: [
            {
              segment: "location",
              title: "Location",
              icon: <LocationOnIcon />,
              permission: "locationMaster:view",
            },
            {
              segment: "state",
              title: "State",
              icon: <PublicIcon />,
              permission: "stateMaster:view",
            },
            {
              segment: "city",
              title: "City",
              icon: <CityIcon />,
              permission: "stateMaster:view",
            },
            {
              segment: "area",
              title: "Area",
              icon: <AreaIcon />,
              permission: "stateMaster:view",
            },
            {
              segment: "department",
              title: "Department",
              icon: <DepartmentIcon />,
              permission: "stateMaster:view",
            },
            {
              segment: "building",
              title: "Building Name/Block",
              icon: <BuildingIcon />,
              permission: "stateMaster:view",
            },
            {
              segment: "floor",
              title: "Floor",
              icon: <FloorIcon />,
              permission: "stateMaster:view",
            },
          ],
        },
      ],
    },
    {
      segment: "generate-qr",
      title: "Generate QR Code",
      icon: <QrCodeIcon />,
      permission: "generateQrCode",
    },
    {
      segment: "audit-report",
      title: "Audit Report",
      icon: <AssessmentIcon />,
      permission: "auditReport:view",
    },
  ];

  const filterNavigationByPermissions = (items) =>
    items
      .filter(
        (item) =>
          !item.permission || canAccess(userData?.permissions, item.permission)
      )
      .map((item) => {
        if (item.children) {
          const filteredChildren = item.children.filter(
            (child) =>
              !child.permission ||
              canAccess(userData?.permissions, child.permission)
          );
          return filteredChildren.length > 0
            ? { ...item, children: filteredChildren }
            : item;
        }
        return item;
      })
      .filter((item) => !item.children || item.children.length > 0);

  const NAVIGATION = filterNavigationByPermissions(navigationConfig);

  // 🔹 Preloader with fade-out
  if (loading) {
    return (
      <ReactRouterAppProvider>
        <div
          style={{
            width: "100%",
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "white",
            opacity: fadeOut ? 0 : 1,
            transition: "opacity 1.5s ease",
          }}
        >
          <Preloader />
          <LinearProgress style={{ width: "100%" }} />
        </div>
      </ReactRouterAppProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles
        styles={{
          body: {
            transition: "background-color 0.35s ease, color 0.35s ease",
          },
          "#root": {
            transition: "background-color 0.35s ease, color 0.35s ease",
          },
          ".MuiPaper-root": {
            transition: "background-color 0.35s ease, color 0.35s ease",
          },
          ".MuiAppBar-root": {
            transition: "background-color 0.35s ease, color 0.35s ease",
          },
          ".MuiToolbar-root": {
            transition: "background-color 0.35s ease, color 0.35s ease",
          },
          ".MuiCardHeader-root": {
            transition: "background-color 0.35s ease, color 0.35s ease",
          },
          ".MuiDialogTitle-root": {
            transition: "background-color 0.35s ease, color 0.35s ease",
          },
        }}
      />

      <ReactRouterAppProvider navigation={NAVIGATION} branding={BRANDING}>
        <Outlet />
        <SnackBar />
      </ReactRouterAppProvider>
    </ThemeProvider>
  );
}

export default App;
