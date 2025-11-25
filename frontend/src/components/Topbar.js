import React from "react";
import "./Topbar.css";

function Topbar({ title }) {
  return (
    <div className="topbar">
      <h3>{title}</h3>
    </div>
  );
}

export default Topbar;
