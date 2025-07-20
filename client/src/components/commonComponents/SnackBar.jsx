import { Alert } from "@mui/material";
import { useSelector } from "react-redux";

const SnackBar = () => {
  const notification = useSelector(state => state.notification);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {notification.show && (
        <div className="fixed bottom-4 right-4 z-50">
          <Alert severity={notification.type}>{notification.message}</Alert>
        </div>
      )}
    </div>
  );
};

export default SnackBar;
