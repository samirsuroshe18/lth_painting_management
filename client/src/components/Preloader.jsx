// import React, { useEffect, useState } from "react";
// import "./Preloader.css";

// const Preloader = () => {
//   const [fadeOut, setFadeOut] = useState(false);
//   const [isDarkMode, setIsDarkMode] = useState(() => {
//     // Initialize with proper detection, including MUI theme
//     if (typeof window !== 'undefined') {
//       const savedMode = localStorage.getItem("mui-mode");
//       if (savedMode) {
//         return savedMode === "dark";
//       }
//       return window.matchMedia("(prefers-color-scheme: dark)").matches;
//     }
//     return false;
//   });

//   useEffect(() => {
//     // Function to check all possible dark mode sources
//     const checkDarkMode = () => {
//       const savedMode = localStorage.getItem("mui-mode");
//       if (savedMode) {
//         return savedMode === "dark";
//       }
//       return window.matchMedia("(prefers-color-scheme: dark)").matches;
//     };

//     // Set initial dark mode state
//     setIsDarkMode(checkDarkMode());

//     // Listen for changes in localStorage (MUI theme changes)
//     const handleStorageChange = () => {
//       setIsDarkMode(checkDarkMode());
//     };

//     // Listen for system color scheme changes
//     const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
//     const handleMediaChange = () => {
//       // Only update if no saved mode in localStorage
//       if (!localStorage.getItem("mui-mode")) {
//         setIsDarkMode(mediaQuery.matches);
//       }
//     };

//     // Add listeners
//     window.addEventListener("storage", handleStorageChange);
//     if (mediaQuery.addEventListener) {
//       mediaQuery.addEventListener("change", handleMediaChange);
//     } else {
//       mediaQuery.addListener(handleMediaChange);
//     }

//     // Trigger fade-out after a short delay
//     const timer = setTimeout(() => {
//       setFadeOut(true);
//       setTimeout(() => {
//         const preloaderEl = document.getElementById("preloader");
//         if (preloaderEl) preloaderEl.remove();
//       }, 800); // matches CSS transition duration
//     }, 1500);

//     // Cleanup
//     return () => {
//       clearTimeout(timer);
//       window.removeEventListener("storage", handleStorageChange);
//       if (mediaQuery.removeEventListener) {
//         mediaQuery.removeEventListener("change", handleMediaChange);
//       } else {
//         mediaQuery.removeListener(handleMediaChange);
//       }
//     };
//   }, []);

//   return (
//     <div
//       id="preloader"
//       className={`preloader ${fadeOut ? "fade-out" : ""}`}
//       style={{
//         backgroundColor: isDarkMode ? "#1a1a1a" : "#ffffff",
//         transition: fadeOut ? "opacity 0.8s ease" : "background-color 0.3s ease",
//       }}
//     >
//       <img src="/lt-logo.svg" alt="L&T Logo" className="preloader-logo" />
//     </div>
//   );
// };

// export default Preloader;
// Preloader.jsx
import { useEffect, useState } from "react";
import { useTheme } from "@mui/material/styles";
import "./Preloader.css";

function Preloader() {
  const theme = useTheme();
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setFadeOut(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`preloader ${fadeOut ? "fade-out" : ""}`}
      style={{
        backgroundColor: theme.palette.background.default, 
      }}
    >
      <img src="/lt-logo.svg" alt="L&T Logo" className="preloader-logo" />
      <div className="loading-bar"></div>
    </div>
  );
}

export default Preloader;
