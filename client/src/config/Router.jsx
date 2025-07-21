import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
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

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<App />}>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          
          {/* Master Routes */}
          <Route path="masters">
            <Route path="user-master" element={<UserMaster />} />
            <Route path="asset-master" element={<AssetMaster />} />
            <Route path="location-master" element={<LocationMaster />} />
            <Route path="state-master" element={<StateMaster />} />
          </Route>
          
          {/* Generate QR Code Route */}
          <Route path="generate-qr" element={<GenerateQR />} />
          
          {/* Audit Report Route */}
          <Route path="audit-report" element={<AuditReport />} />
          
        </Route>
      </Route>
      
      <Route path="/login" element={<LoginPage />} />
      <Route path="qr-code/:id" element={<QrCodePage />} />
      
      <Route path="*" element={<NotFound />} />
    </>
  )
);

export default router;