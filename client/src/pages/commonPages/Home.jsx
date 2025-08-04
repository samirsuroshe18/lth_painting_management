import { useSelector } from "react-redux";
import SuperAdminDashboard from "../Dashboards/SuperAdminDashboard";
import AuditorDashboard from "../Dashboards/AuditorDashboard";
import UserDashboard from "../Dashboards/UserDashboard";

const Home = () => {
  const userData = useSelector((state) => state.auth.userData?.user);
  const userRole = userData?.role;

  const dashboardComponents = {
    superadmin: SuperAdminDashboard,
    admin: SuperAdminDashboard,
    auditor: AuditorDashboard,
    user: UserDashboard,
  };

  const DashboardComponent = dashboardComponents[userRole];

  return (
    <>
      {DashboardComponent ? (
        <DashboardComponent />
      ) : (
        <div>Access denied or invalid role</div>
      )}
    </>
  );
};

export default Home;