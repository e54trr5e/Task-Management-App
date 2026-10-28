import {
  NavLink,
  useNavigate,
} from "react-router-dom";

function Sidebar({
  setToken,
  setUser,
  sidebarOpen,
  setSidebarOpen,
}) {

  const navigate = useNavigate();

  const linkStyle = ({ isActive }) =>
    `block px-4 py-3 rounded-xl transition ${
      isActive
        ? "bg-yellow-400 text-black font-semibold"
        : "text-gray-300 hover:bg-gray-800 hover:text-white"
    }`;

  function closeSidebar() {
    setSidebarOpen(false);
  }

  function logout() {

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setToken(null);
    setUser(null);

    setSidebarOpen(false);

    navigate("/auth", {
      replace: true,
    });
  }

  return (
    <>
      {/* Mobile Dark Overlay */}
      {sidebarOpen && (
        <div
          onClick={closeSidebar}
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed
          top-0
          left-0
          w-64
          h-screen
          bg-black
          p-6
          z-50
          transition-transform
          duration-300
          ease-in-out

          ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }

          md:translate-x-0
        `}
      >

        {/* Logo + Mobile Close Button */}

        <div className="flex items-center justify-between mb-10">

          <h1 className="text-2xl font-bold text-white">
            Task
            <span className="text-yellow-400">
              Flow
            </span>
          </h1>

          <button
            type="button"
            onClick={closeSidebar}
            className="md:hidden text-white text-2xl hover:text-yellow-400"
            aria-label="Close menu"
          >
            ✕
          </button>

        </div>

        {/* Navigation */}

        <nav className="space-y-3">

          <NavLink
            to="/"
            end
            className={linkStyle}
            onClick={closeSidebar}
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/tasks"
            className={linkStyle}
            onClick={closeSidebar}
          >
            My Tasks
          </NavLink>

          <NavLink
            to="/add-task"
            className={linkStyle}
            onClick={closeSidebar}
          >
            Add Task
          </NavLink>

          <NavLink
            to="/calendar"
            className={linkStyle}
            onClick={closeSidebar}
          >
            Calendar
          </NavLink>

          <NavLink
            to="/analytics"
            className={linkStyle}
            onClick={closeSidebar}
          >
            Analytics
          </NavLink>

          <NavLink
            to="/profile"
            className={linkStyle}
            onClick={closeSidebar}
          >
            Profile
          </NavLink>

          <button
            type="button"
            onClick={logout}
            className="
              w-full
              text-left
              px-4
              py-3
              rounded-xl
              text-red-400
              hover:bg-red-500
              hover:text-white
              transition
              mt-6
            "
          >
            Logout
          </button>

        </nav>

      </aside>
    </>
  );
}

export default Sidebar;