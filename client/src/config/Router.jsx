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
const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<App />}>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />

          {/* Facility Booking Module Routes */}
          {/* <Route path="facility" element={<FacilityDashboard />}>
            <Route path="booking" element={<BookingPage />} />
          </Route> */}
        </Route>
      </Route>
      <Route path="/login" element={<LoginPage />} />

      <Route path="*" element={<NotFound />} />
    </>
  )
);

export default router;
