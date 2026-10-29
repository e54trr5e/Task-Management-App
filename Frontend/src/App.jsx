import { API_URL } from "./api";
import { useEffect, useState } from "react";

import { Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";

import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import AddTask from "./pages/AddTask";
import Calendar from "./pages/Calendar";
import Analytics from "./pages/Analytics";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import AIPlanner from "./pages/AIPlanner";

function App() {
  // =========================
  // LOGIN TOKEN
  // =========================

  const [token, setToken] = useState(localStorage.getItem("token"));

  // =========================
  // USER
  // =========================

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");

    return savedUser ? JSON.parse(savedUser) : null;
  });

  // =========================
  // TASKS
  // =========================

  const [tasks, setTasks] = useState([]);

  // =========================
  // GET TASKS FROM MONGODB
  // =========================

  async function getTasks() {
    // If user is logged out
    if (!token) {
      setTasks([]);

      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/tasks`, {
        method: "GET",

        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        console.log(data.message || "Could not get tasks");

        return;
      }

      // Store MongoDB tasks
      setTasks(data);
    } catch (error) {
      console.log("Error getting tasks:", error);
    }
  }

  // =========================
  // LOAD TASKS AFTER LOGIN
  // =========================

  useEffect(() => {
    getTasks();
  }, [token]);

  return (
    <Routes>
      {/* ===================== */}
      {/* AUTH */}
      {/* ===================== */}

      <Route
        path="/auth"
        element={
          token ? (
            <Navigate to="/" replace />
          ) : (
            <Auth setToken={setToken} setUser={setUser} />
          )
        }
      />

      {/* ===================== */}
      {/* PROTECTED PAGES */}
      {/* ===================== */}

      <Route
        path="/"
        element={
          token ? (
            <MainLayout setToken={setToken} user={user} setUser={setUser} />
          ) : (
            <Navigate to="/auth" replace />
          )
        }
      >
        {/* ===================== */}
        {/* DASHBOARD */}
        {/* ===================== */}

        <Route index element={<Dashboard tasks={tasks} />} />

        {/* ===================== */}
        {/* MY TASKS */}
        {/* ===================== */}

        <Route
          path="tasks"
          element={<Tasks tasks={tasks} setTasks={setTasks} />}
        />
        <Route
          path="ai-planner"
          element={<AIPlanner setGlobalTasks={setTasks} />}
        />

        {/* ===================== */}
        {/* ADD TASK */}
        {/* ===================== */}

        <Route
          path="add-task"
          element={<AddTask tasks={tasks} setTasks={setTasks} />}
        />

        {/* ===================== */}
        {/* CALENDAR */}
        {/* ===================== */}

        <Route path="calendar" element={<Calendar tasks={tasks} />} />

        {/* ===================== */}
        {/* ANALYTICS */}
        {/* ===================== */}

        <Route path="analytics" element={<Analytics tasks={tasks} />} />

        {/* ===================== */}
        {/* PROFILE */}
        {/* ===================== */}

        <Route
          path="profile"
          element={<Profile setUser={setUser} setToken={setToken} />}
        />
      </Route>

      {/* ===================== */}
      {/* INVALID URL */}
      {/* ===================== */}

      <Route
        path="*"
        element={<Navigate to={token ? "/" : "/auth"} replace />}
      />
    </Routes>
  );
}

export default App;
