import { useSelector } from 'react-redux';
import AnnouncementIcon from '@mui/icons-material/Campaign';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import { ReactRouterAppProvider } from '@toolpad/core/react-router';
import { Outlet } from 'react-router';
import { extendTheme } from '@mui/material/styles';
import GavelIcon from "@mui/icons-material/Gavel";
import BarChartIcon from '@mui/icons-material/BarChart';
import LayersIcon from '@mui/icons-material/Layers';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

const BRANDING = {
  title: 'CollegeConnect',
};

const demoTheme = extendTheme({
  colorSchemes: { light: true, dark: true },
  colorSchemeSelector: 'class',
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 600,
      lg: 1200,
      xl: 1536,
    },
  },
});

function App() {
  // Add null checking and default value
  const userRole = useSelector(state => state.auth.userData || { role: 'guest' });

  const superAdminNavigation = [
    {
      kind: 'header',
      title: 'Admin Section',
    },
    {
      segment: 'pending-request',
      title: 'Pending Requests',
      icon: <ShoppingCartIcon />,
    },
    {
      segment: 'doctor-dash',
      title: 'Doctor Dashboard',
      icon: <BarChartIcon />,
    },
    {
      segment: 'admin-wallofshame',
      title: 'Wall of Shame',
      icon: <GavelIcon />,
    },
    {
      segment: 'admin-complaints',
      title: 'Complaint Admin',
      icon: <ReportProblemIcon />,
    },
    {
      segment: 'admin-application',
      title: 'Applications Portal',
      icon: <AssignmentIcon />,
    },
    {
      segment: 'budget-sponsorship-admin',
      title: 'Budget Sponsorship',
      icon: <ShoppingCartIcon />,
    }
  ];

  const studentNavigation = [
    {
      kind: 'header',
      title: 'Student Section',
    },
    {
      segment: 'anouncement',
      title: 'Announce',
      icon: <AnnouncementIcon />,
    },
    {
      segment: 'election',
      title: 'Elections',
      icon: <HowToVoteIcon />,
    },
    {
      segment: 'voting',
      title: 'Voting Page', // Fixed typo: 'tile' -> 'title'
      icon: <HowToVoteIcon />
    },
    {
      segment: 'health-form',
      title: 'Health',
      icon: <LayersIcon />,
    },
    {
      segment: 'budget-sponsorship-user',
      title: 'Budget Sponsorship',
      icon: <ShoppingCartIcon />,
    },
    {
      segment: 'application-page',
      title: 'Applications Portal',
      icon: <AssignmentIcon />,
    },
    {
      segment: 'complaints',
      title: 'Complaint Box',
      icon: <ReportProblemIcon />,
    },
    {
      segment: 'facility',
      title: 'Facility Booking', // Removed duplicate segment
      icon: <BusinessCenterIcon />,
    },
  ];
  
  let nav;
  switch (userRole.role) {
    case 'admin':
      nav = superAdminNavigation;
      break;
    case 'student':
      nav = studentNavigation;
      break;  
    default:
      nav = []; // Empty navigation for guests or unknown roles
  }
   
  const NAVIGATION = [...nav];

  return (
    <ReactRouterAppProvider navigation={NAVIGATION} branding={BRANDING}>
      <Outlet />
    </ReactRouterAppProvider>
  );
}

export default App;