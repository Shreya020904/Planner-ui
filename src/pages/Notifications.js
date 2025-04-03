import React, { useState } from "react";
import "./Notifications.css";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

const Notifications = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  return (
    <div className="dashboard-container">
      <Header toggleSidebar={toggleSidebar} />
      <div className="content">
        <Sidebar isOpen={sidebarOpen} />
        <main className="main-content">Dashboard Content</main>
      </div>
    </div>
  );
};

export default Notifications;
