function Navbar({ user, setSidebarOpen }) {

  return (
    <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8">

      <div className="flex items-center gap-3">

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 text-2xl"
          aria-label="Open menu"
        >
          ☰
        </button>

        <h2 className="text-xl font-semibold">
          Task Manager
        </h2>

      </div>

      <div className="flex items-center gap-4">

        <button className="text-xl">
          🔔
        </button>

        <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-semibold">
          {user?.name
            ? user.name.charAt(0).toUpperCase()
            : "K"}
        </div>

      </div>

    </header>
  );
}

export default Navbar;