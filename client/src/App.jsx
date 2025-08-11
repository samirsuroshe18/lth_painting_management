import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { ReactRouterAppProvider } from "@toolpad/core/react-router";
import { getCurrentUser } from "./api/authApi";
import { currentUser } from "./redux/slices/authSlice";
import { LinearProgress } from "@mui/material";
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
  const userRole = useSelector((state) => state.auth.userData?.user?.role);
  const userData = useSelector((state) => state.auth.userData?.user);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    setNavigate(navigate);
  }, [navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await getCurrentUser();
        dispatch(currentUser(res.data));
        setLoading(false);
      } catch (error) {
        navigate("/login");
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const BRANDING = {
    title: "Artifact E-Gallary Portal",
    logo: <img src="/lt-logo.svg" alt="L&T Logo" style={{ height: "24px" }} />,
  };

  const navigationConfig = [
    {
      segment: "",
      title: "Dashboard",
      icon: <DashboardIcon />,
      permission: "dashboard",
    },
    {
      segment: "masters",
      title: "Masters",
      icon: <SettingsIcon />,
      permission: "masters",
      children: [
        {
          segment: "user-master",
          title: "User Master",
          icon: <PeopleIcon />,
          permission: "userMaster",
        },
        {
          segment: "asset-master",
          title: "Asset Master",
          icon: <DevicesOtherIcon />,
          permission: "assetMaster",
        },
        {
          segment: "location-master",
          title: "Location Master",
          icon: <LocationOnIcon />,
          permission: "locationMaster",
        },
        {
          segment: "state-master",
          title: "State Master",
          icon: <PublicIcon />,
          permission: "stateMaster",
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
      permission: "auditReport",
    },
  ];

  const filterNavigationByPermissions = (items) => {
    return items.filter((item) => {
        // Check main item permission
        if (item.permission && !canAccess(userData?.permissions, item.permission)) {
          return false;
        }
        return true;
      }).map((item) => {
        // Filter children if they exist
        if (item.children) {
          const filteredChildren = item.children.filter((child) =>!child.permission || canAccess(userData?.permissions, child.permission));

          // Only include parent if it has accessible children or no permission requirement
          return filteredChildren.length > 0
            ? { ...item, children: filteredChildren }
            : item;
        }
        return item;
      })
      .filter(
        (item) =>
          // Remove parent items that have no accessible children
          !item.children || item.children.length > 0
      );
  };

  const superAdminNavigation = filterNavigationByPermissions(navigationConfig);

  const userNavigation = [
    {
      segment: "",
      title: "Generate QR Code",
      icon: <QrCodeIcon />,
    },
  ];

  const auditorNavigation = [
    {
      segment: "",
      title: "Dashboard",
      icon: <DashboardIcon />,
    },
    {
      segment: "generate-qr",
      title: "Generate QR Code",
      icon: <QrCodeIcon />,
    },
    {
      segment: "audit-report",
      title: "Audit Report",
      icon: <AssessmentIcon />,
    },
  ];

  // const getNavigation = () => {
  //   switch (userRole) {
  //     case "superadmin":
  //       return superAdminNavigation;
  //     case "admin":
  //       return superAdminNavigation;
  //     case "auditor":
  //       return auditorNavigation;
  //     case "user":
  //       return userNavigation;
  //     default:
  //       return [];
  //   }
  // };
  const getNavigation = () => {
  switch (userRole) {
    case "superadmin":
    case "admin":
    case "auditor":
    case "user":
      return filterNavigationByPermissions(navigationConfig);
    default:
      return [];
  }
};

  const NAVIGATION = getNavigation();

  // Show loading state
  if (loading) {
    return (
      <ReactRouterAppProvider>
        <div
          style={{
            width: "100%",
            height: "100vh",
            display: "flex",
            alignItems: "top",
          }}
        >
          <LinearProgress style={{ width: "100%" }} />
        </div>
      </ReactRouterAppProvider>
    );
  }

  return (
    <ReactRouterAppProvider navigation={NAVIGATION} branding={BRANDING}>
      <Outlet />
      <SnackBar />
    </ReactRouterAppProvider>
  );
}

export default App;