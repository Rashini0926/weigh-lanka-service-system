import React from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { Outlet } from "react-router-dom";


function MainLayout() {
  return (
    <div className="layout">
      <Sidebar />
      <div className="content">
        <Topbar />
        <div className="inner-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default MainLayout;
