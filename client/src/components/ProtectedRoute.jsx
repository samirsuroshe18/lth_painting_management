// components/ProtectedRoute.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { LinearProgress, createTheme } from "@mui/material";
import { getCurrentUser } from "../api/authApi";
import { currentUser } from "../redux/slices/authSlice";
import { ReactRouterAppProvider } from "@toolpad/core/react-router";

const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [mode, setMode] = useState(() => {
    const htmlEl = document.documentElement;
    return htmlEl.getAttribute("data-toolpad-color-scheme") || "light";
  });

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const scheme = document.documentElement.getAttribute(
        "data-toolpad-color-scheme"
      );
      console.log(scheme);
      setMode(scheme || "light");
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-toolpad-color-scheme"],
    });

    return () => observer.disconnect();
  }, []);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === "dark"
            ? {
                background: {
                  default: "#121212",
                  paper: "#1e1e1e",
                },
                text: {
                  primary: "#ffffff",
                  secondary: "#bbbbbb",
                },
              }
            : {
                background: {
                  default: "#f5f5f5",
                  paper: "#ffffff",
                },
                text: {
                  primary: "#000000",
                  secondary: "#333333",
                },
              }),
        },
      }),
    [mode]
  );

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await getCurrentUser();
        dispatch(currentUser(res.data));
        setIsAuthenticated(true);

        setTimeout(() => {
          setLoading(false);
        }, 1500);
      } catch (error) {
        setLoading(false);
        navigate("/login");
      }
    };

    checkAuth();
  }, [dispatch, navigate]);

  if (loading) {
    return (
      <ReactRouterAppProvider>
        <div
          style={{
            width: "100%",
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
            backgroundColor: theme.palette.background?.default || "#f5f5f5",
          }}
        >
          {/* LinearProgress at the top */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
            }}
          >
            <LinearProgress style={{ width: "100%" }} />
          </div>

          {/* Logo centered */}
          <img
            src="/lt-logo.svg"
            alt="L&T Logo"
            style={{
              width: "120px",
              height: "auto",
              animation: "pulse 4s infinite ease-in-out",
            }}
          />
        </div>
      </ReactRouterAppProvider>
    );
  }

  return isAuthenticated ? children : null;
};

export default ProtectedRoute;
