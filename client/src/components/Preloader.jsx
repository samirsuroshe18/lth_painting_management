import React from "react";
import "./Preloader.css"; // we'll add styles here

const Preloader = () => {
  return (
    <div className="preloader">
      <img src="/lt-logo.svg" alt="L&T Logo" className="preloader-logo" />
    </div>
  );
};

export default Preloader;
