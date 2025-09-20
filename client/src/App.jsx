import { Outlet } from "react-router";
import { useSelector } from "react-redux";
import { ReactRouterAppProvider } from "@toolpad/core/react-router";
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
import "../src/components/Preloader.css"

function App() {
  const userData = useSelector((state) => state.auth.userData?.user);

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

  return (
    <ReactRouterAppProvider navigation={NAVIGATION} branding={BRANDING}>
      <Outlet />
      <SnackBar />
    </ReactRouterAppProvider>
  );
}

export default App;