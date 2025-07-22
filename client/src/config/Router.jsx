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
import AssetMaster from "../pages/Masters/AssetMaster.jsx";
import LocationMaster from "../pages/Masters/LocationMaster.jsx";
import StateMaster from "../pages/Masters/StateMaster.jsx";
import ChangePassword from "../pages/commonPages/ChangePassword.jsx";
import ForgotPassword from "../pages/commonPages/ForgotPassword.jsx";

const router = createBrowserRouter([
  {
    Component: App,
    children: [
      {
        path: "/",
        Component: Layout,
        children: [
          {
            path: "",
            Component: HomePage,
          },
          {
            path: "masters",
            children: [
              { path: "user-master", Component: UserMaster },
              { path: "asset-master", Component: AssetMaster },
              { path: "location-master", Component: LocationMaster },
              { path: "state-master", Component: StateMaster },
            ],
          },
          { path: "generate-qr", Component: GenerateQR },
          { path: "audit-report", Component: AuditReport },
        ],
      },
      { path: "/login", Component: LoginPage },
      { path: "/qr-code/:id", Component: QrCodePage },
      {path: "/change-password", Component: ChangePassword},
      {path: "/forgot-password", Component: ForgotPassword},
      { path: "*", Component: NotFound },
    ],
  },
]);

export default router;