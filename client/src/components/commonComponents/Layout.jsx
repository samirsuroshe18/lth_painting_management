import { Outlet } from "react-router";
import { DashboardLayout } from "@toolpad/core/DashboardLayout";
import { PageContainer } from "@toolpad/core/PageContainer";
import ProfileComponent from "../ProfileComponent";
import { Box } from "@mui/material";

export default function Layout() {
  return (
    <div>
      <DashboardLayout
        slots={{
          sidebarFooter: () => (
            <Box sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
              <ProfileComponent />
            </Box>
          ),
        }}
      >
        <Outlet />
      </DashboardLayout>
    </div>
  );
}
