import {
  NavLink,
  useNavigate,
} from "react-router-dom";


function Sidebar({ setToken, setUser }) {

  const navigate =
    useNavigate();


  // =========================
  // SIDEBAR LINK STYLE
  // =========================

  const linkStyle = ({ isActive }) =>

    `block px-4 py-3 rounded-xl transition ${
      isActive

        ? "bg-yellow-400 text-black font-semibold"

        : "text-gray-300 hover:bg-gray-800 hover:text-white"

    }`;


  // =========================
  // LOGOUT
  // =========================

  function logout() {

    // Remove JWT
    localStorage.removeItem(
      "token"
    );


    // Remove saved user information
    localStorage.removeItem(
      "user"
    );


    // Change React login state
    setToken(null);


    // Go back to Auth page
    navigate(
      "/auth",
      {
        replace: true,
      }
    );

  }


  return (

    <aside
      className="
        hidden
        md:block
        fixed
        top-0
        left-0
        w-64
        h-screen
        bg-black
        p-6
      "
    >


      {/* ===================== */}
      {/* LOGO */}
      {/* ===================== */}

      <h1
        className="
          text-2xl
          font-bold
          text-white
          mb-10
        "
      >

        Task

        <span className="text-yellow-400">
          Flow
        </span>

      </h1>


      {/* ===================== */}
      {/* NAVIGATION */}
      {/* ===================== */}

      <nav className="space-y-3">


        <NavLink
          to="/"
          end
          className={linkStyle}
        >
          Dashboard
        </NavLink>


        <NavLink
          to="/tasks"
          className={linkStyle}
        >
          My Tasks
        </NavLink>


        <NavLink
          to="/add-task"
          className={linkStyle}
        >
          Add Task
        </NavLink>


        <NavLink
          to="/calendar"
          className={linkStyle}
        >
          Calendar
        </NavLink>


        <NavLink
          to="/analytics"
          className={linkStyle}
        >
          Analytics
        </NavLink>


        <NavLink
          to="/profile"
          className={linkStyle}
        >
          Profile
        </NavLink>


        {/* ===================== */}
        {/* LOGOUT */}
        {/* ===================== */}

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

  );

}


export default Sidebar;