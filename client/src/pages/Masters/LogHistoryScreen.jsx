import React from "react";
import { useLocation } from "react-router-dom";

const LogHistoryScreen = () => {
  const { state } = useLocation();
  const assetId = state?.assetId || '';
  return (
    <div>
      <h1>LogHistory Screen {assetId}</h1>
    </div>
  );
};

export default LogHistoryScreen;
