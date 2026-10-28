import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function MainLayout({
  setToken,
  user,
  setUser,
}) {

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  return (
    <div className="min-h-screen bg-slate-100">

      <Sidebar
        setToken={setToken}
        setUser={setUser}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div className="md:ml-64">

        <Navbar
          user={user}
          setSidebarOpen={setSidebarOpen}
        />

        <main className="p-4 md:p-8">
          <Outlet />
        </main>

      </div>

    </div>
  );
}

export default MainLayout;