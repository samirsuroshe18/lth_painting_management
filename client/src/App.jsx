import { useEffect, useMemo, useState } from "react";
import Preloader from "./components/Preloader";
import { Outlet, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { ReactRouterAppProvider } from "@toolpad/core/react-router";
import { getCurrentUser } from "./api/authApi";
import { currentUser } from "./redux/slices/authSlice";
import {
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
import PublicIcon from "@mui/icons-material/Public";
import QrCodeIcon from "@mui/icons-material/QrCode";
import AssessmentIcon from "@mui/icons-material/Assessment";
import SnackBar from "./components/commonComponents/SnackBar";
import canAccess from "./utils/canAccess";
import { setNavigate } from "./utils/navigationHelper";

function App() {
  const userData = useSelector((state) => state.auth.userData?.user);

  const [mode, setMode] = useState(() => {
    const htmlEl = document.documentElement;
    return htmlEl.getAttribute("data-toolpad-color-scheme") || "light";
  });

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const scheme = document.documentElement.getAttribute("data-toolpad-color-scheme");
      setMode(scheme || "light");
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-toolpad-color-scheme"],
    });

    return () => observer.disconnect();
  }, []);

  // ✅ Define theme with background + paper + text colors
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === "dark"
            ? {
                background: {
                  default: "#121212", // page bg
                  paper: "#1e1e1e",   // cards, dialogs
                },
                text: {
                  primary: "#ffffff",
                  secondary: "#bbbbbb",
                },
              }
            : {
                background: {
                  default: "#f5f5f5",
                  paper: "#ffffff",
                },
                text: {
                  primary: "#000000",
                  secondary: "#333333",
                },
              }),
        },
      }),
    [mode]
  );

  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    setNavigate(navigate);
  }, [navigate]);

  // Fetch current user on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getCurrentUser();
        dispatch(currentUser(res.data));

        setTimeout(() => {
          setLoading(false);
        }, 1500);
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
          icon: <LocationOnIcon />,
          permission: "locationMaster:view",
        },
        {
          segment: "state-master",
          title: "State Master",
          icon: <PublicIcon />,
          permission: "stateMaster:view",
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

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Preloader />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles
        styles={{
          body: {
            backgroundColor: theme.palette.background.default,
            color: theme.palette.text.primary,
            transition: "background-color 0.35s ease, color 0.35s ease",
          },
          "#root": {
            backgroundColor: theme.palette.background.default,
            color: theme.palette.text.primary,
            minHeight: "100vh",
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
