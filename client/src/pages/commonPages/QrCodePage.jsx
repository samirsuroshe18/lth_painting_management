import React from "react";
import { useParams } from "react-router-dom";

const QrCodePage = () => {
  const { id } = useParams();
  return (
    <div>
      <div>Asset ID: {id}</div>
    </div>
  );
};

export default QrCodePage;
