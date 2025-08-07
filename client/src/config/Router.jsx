import { createBrowserRouter } from "react-router-dom";
import App from "../App.jsx";
import Layout from "../components/commonComponents/Layout.jsx";
import HomePage from "../pages/commonPages/Home.jsx";
import LoginPage from "../pages/commonPages/Login.jsx";
import NotFound from "../pages/commonPages/NotFound.jsx";
import QrCodePage from "../pages/commonPages/QrCodePage.jsx";

import GenerateQR from "../pages/QrCode/GenerateQR.jsx";
import AuditReport from "../pages/Report/AuditReport.jsx";

import UserMaster from "../pages/Masters/UserMaster.jsx";
import AddUser from "../pages/Masters/AddUser.jsx";

import AssetMaster from "../pages/Masters/AssetMaster.jsx";
import AssetDetailsPage from "../pages/Masters/AssetDetailsPage.jsx"; // Add this import
import LocationMaster from "../pages/Masters/LocationMaster.jsx";
import StateMaster from "../pages/Masters/StateMaster.jsx";

import ChangePassword from "../pages/commonPages/ChangePassword.jsx";
import ForgotPassword from "../pages/commonPages/ForgotPassword.jsx";
import EditUser from "../pages/Masters/EditUser.jsx";
import EditRights from "../pages/commonPages/EditRights.jsx";
import EditAssetScreen from "../pages/Masters/EditAssetScreen.jsx";
import LogHistoryScreen from "../pages/Masters/LogHistoryScreen.jsx";
import CreateAsset from "../pages/Masters/CreateAsset.jsx";

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
            element: <HomePage />,
          },
          { path: "edit-rights/:id", element: <EditRights />},
          {
            path: "masters",
            children: [
              { path: "", element: <UserMaster /> },
              { path: "user-master", element: <UserMaster /> },
              { path: "add-user", element: <AddUser /> },
              { path: "edit-user/:id", element: <EditUser /> },
              { path: "asset/:id", element: <AssetDetailsPage />}, // Now this will work
              { path: "asset-master", 
                children: [
                  { path: "", element: <AssetMaster /> },
                  { path: "edit-asset", element: <EditAssetScreen /> },
                  { path: "log-history", element: <LogHistoryScreen /> },
                  { path: "new", element: <CreateAsset /> },
                ]
               },
              { path: "location-master", element: <LocationMaster /> },
              { path: "state-master", element: <StateMaster /> },
            ],
          },
          { path: "generate-qr", element: <GenerateQR /> },
          { path: "audit-report", element: <AuditReport /> },
        ],
      },
      { path: "login", element: <LoginPage /> },
      { path: "qr-code/:id", element: <QrCodePage /> },
      { path: "change-password", element: <ChangePassword /> },
      { path: "forgot-password", element: <ForgotPassword /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

export default router;