import { createBrowserRouter } from "react-router-dom";
import App from "../App.jsx";
import Layout from "../components/commonComponents/Layout.jsx";
import LoginPage from "../pages/commonPages/Login.jsx";
import NotFound from "../pages/commonPages/NotFound.jsx";
import ScannedAsset from "../pages/commonPages/ScannedAsset.jsx";

import GenerateQR from "../pages/QrCode/GenerateQR.jsx";
import AuditReport from "../pages/Report/AuditReport.jsx";

import UserMaster from "../pages/Masters/UserMaster.jsx";
import AddUser from "../pages/Masters/AddUser.jsx";

import AssetMaster from "../pages/Masters/AssetMaster.jsx";
import AssetDetailsPage from "../pages/Masters/AssetDetailsPage.jsx";
import LocationMaster from "../pages/Masters/LocationMaster.jsx";
import StateMaster from "../pages/Masters/StateMaster.jsx";
import CityMaster from "../pages/Masters/CityMaster.jsx";
import AreaMaster from "../pages/Masters/AreaMaster.jsx";
import DepartmentMaster from "../pages/Masters/DepartmentMaster.jsx";
import BuildingMaster from "../pages/Masters/BuildingMaster.jsx";
import FloorMaster from "../pages/Masters/FloorMaster.jsx";

import ChangePassword from "../pages/commonPages/ChangePassword.jsx";
import ForgotPassword from "../pages/commonPages/ForgotPassword.jsx";
import EditRights from "../pages/Masters/EditRights.jsx";
import LogHistoryScreen from "../pages/Masters/LogHistoryScreen.jsx";
import CreateAsset from "../pages/Masters/CreateAsset.jsx";
import CreateNewAssset from "../pages/commonPages/CreateNewAssset.jsx";
import SuperAdminDashboard from "../pages/Dashboards/SuperAdminDashboard.jsx";
import ViewAsset from "../pages/Masters/ViewAsset.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "",
        element: <Layout />,
        children: [
          {
            path: "",
            children: [
              { path: "", element: <SuperAdminDashboard /> },
              { path: "view-audit", element: <AssetDetailsPage /> },
            ],
          },
          {
            path: "masters",
            children: [
              { path: "", element: <UserMaster /> },
              {
                path: "user-master",
                children: [
                  { path: "", element: <UserMaster /> },
                  { path: "add-user", element: <AddUser /> },
                  { path: "edit-rights/:id", element: <EditRights /> },
                ],
              },
              {
                path: "asset-master",
                children: [
                  { path: "", element: <AssetMaster /> },
                  { path: "log-history", element: <LogHistoryScreen /> },
                  { path: "view-asset", element: <ViewAsset /> },
                  { path: "new", element: <CreateAsset /> },
                ],
              },
              {
                path: "Location-master",
                children: [
                  { path: "", element: <LocationMaster /> },
                  { path: "location", element: <LocationMaster /> },
                  { path: "state", element: <StateMaster /> },
                  { path: "city", element: <CityMaster /> },
                  { path: "area", element: <AreaMaster /> },
                  { path: "department", element: <DepartmentMaster /> },
                  { path: "building", element: <BuildingMaster /> },
                  { path: "floor", element: <FloorMaster /> },
                ],
              },
            ],
          },
          { path: "generate-qr", element: <GenerateQR /> },
          { path: "audit-report", element: <AuditReport /> },
        ],
      },
    ],
  },
  { path: "login", element: <LoginPage /> },
  { path: "create-new-asset", element: <CreateNewAssset /> },
  { path: "scanned-asset/:id", element: <ScannedAsset /> },
  { path: "change-password", element: <ChangePassword /> },
  { path: "forgot-password", element: <ForgotPassword /> },
  { path: "*", element: <NotFound /> },
]);

export default router;