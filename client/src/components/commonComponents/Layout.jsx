import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router";
import { DashboardLayout } from "@toolpad/core/DashboardLayout";
import { PageContainer } from "@toolpad/core/PageContainer";
import LinearProgress from "@mui/material/LinearProgress";
import { useDispatch } from "react-redux";
import { handleAxiosError } from "../../utils/handleAxiosError";
import { getCurrentUser } from "../../api/authApi";
import { showNotificationWithTimeout } from "../../redux/slices/notificationSlice";
import { currentUser } from "../../redux/slices/authSlice";
import SnackBar from "./SnackBar";

export default function Layout() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Call API when the page is loading
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getCurrentUser(setLoading, dispatch);
        dispatch(currentUser(res.data));
        navigate('/');
      } catch (error) {
        setLoading(false);
        dispatch(
          showNotificationWithTimeout({
            show: true,
            type: "error",
            message: handleAxiosError(error),
          })
        );
        // navigate("/login");
        navigate("/");
      }
    };

    fetchData();
  }, [dispatch, navigate]);

  if (loading) {
    return (
      <div style={{ width: "100%" }}>
        <LinearProgress />
      </div>
    );
  }

  return (
    <div>
      <DashboardLayout>
        <PageContainer>
          <Outlet />
        </PageContainer>
      </DashboardLayout>
      <SnackBar />
    </div>
  );
}
