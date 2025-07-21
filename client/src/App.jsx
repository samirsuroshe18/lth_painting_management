import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import AnnouncementIcon from "@mui/icons-material/Campaign";
import HowToVoteIcon from "@mui/icons-material/HowToVote";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import AssignmentIcon from "@mui/icons-material/Assignment";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import { ReactRouterAppProvider } from "@toolpad/core/react-router";
import GavelIcon from "@mui/icons-material/Gavel";
import BarChartIcon from "@mui/icons-material/BarChart";
import LayersIcon from "@mui/icons-material/Layers";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
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

function App() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const userRole = useSelector((state) => state.auth.userData?.role);

  // Call API when the page is loading
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
  }, [dispatch, navigate]);

  const BRANDING = {
    title: "Artifact E-Gallary Portal",
    logo: <img src="/lt-logo.svg" alt="L&T Logo" style={{ height: "24px" }} />,
  };

  const superAdminNavigation = [
    {
      segment: "",
      title: "Dashboard",
      icon: <DashboardIcon />,
    },
    {
      segment: "masters",
      title: "Masters",
      icon: <SettingsIcon />,
      children: [
        {
          segment: "user-master",
          title: "User Master",
          icon: <PeopleIcon />,
        },
        {
          segment: "asset-master",
          title: "Asset Master",
          icon: <DevicesOtherIcon />,
        },
        {
          segment: "location-master",
          title: "Location Master",
          icon: <LocationOnIcon />,
        },
        {
          segment: "state-master",
          title: "State Master",
          icon: <PublicIcon />,
        },
      ],
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

  //   const superAdminNavigation = [
  //   {
  //     segment: "dashboard",
  //     title: "Dashboard",
  //     icon: <DashboardIcon />,
  //   },
  // {
  //   segment: "masters",
  //   title: "Masters",
  //   icon: <SettingsIcon />,
  //   children: [
  //     {
  //       segment: "user-master",
  //       title: "User Master",
  //       icon: <PeopleIcon />,
  //     },
  //     {
  //       segment: "asset-master",
  //       title: "Asset Master",
  //       icon: <DevicesOtherIcon />,
  //     },
  //     {
  //       segment: "location-master",
  //       title: "Location Master",
  //       icon: <LocationOnIcon />,
  //     },
  //     {
  //       segment: "state-master",
  //       title: "State Master",
  //       icon: <PublicIcon />,
  //     },
  //   ],
  // },
    // {
    //   segment: "generate-qr",
    //   title: "Generate QR Code",
    //   icon: <QrCodeIcon />,
    // },
    // {
    //   segment: "audit-report",
    //   title: "Audit Report",
    //   icon: <AssessmentIcon />,
    // },
  // ];

  const studentNavigation = [
    {
      kind: "header",
      title: "Student Section",
    },
    {
      segment: "anouncement", // Fixed: Consider renaming to "announcement"
      title: "Announce",
      icon: <AnnouncementIcon />,
    },
    {
      segment: "election",
      title: "Elections",
      icon: <HowToVoteIcon />,
    },
    {
      segment: "voting",
      title: "Voting Page",
      icon: <HowToVoteIcon />,
    },
    {
      segment: "health-form",
      title: "Health",
      icon: <LayersIcon />,
    },
    {
      segment: "budget-sponsorship-user",
      title: "Budget Sponsorship",
      icon: <ShoppingCartIcon />,
    },
    {
      segment: "application-page",
      title: "Applications Portal",
      icon: <AssignmentIcon />,
    },
    {
      segment: "complaints",
      title: "Complaint Box",
      icon: <ReportProblemIcon />,
    },
    {
      segment: "facility",
      title: "Facility Booking",
      icon: <BusinessCenterIcon />,
    },
  ];

  const getNavigation = () => {
    switch (userRole) {
      case "superadmin":
        return superAdminNavigation;
      case "student":
        return studentNavigation;
      default:
        return [];
    }
  };

  const NAVIGATION = getNavigation();

  // Show loading state
  if (loading) {
    return (
      <ReactRouterAppProvider navigation={NAVIGATION} branding={BRANDING}>
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
    </ReactRouterAppProvider>
  );
}

export default App;
