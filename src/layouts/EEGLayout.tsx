import React from "react";
import { Outlet } from "react-router-dom";

const EEGLayout = () => {
  return (
    <div className="min-h-screen bg-[#0c0f14] text-white">
      <Outlet />
    </div>
  );
};

export default EEGLayout;
