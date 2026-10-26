import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";


function Profile({
  setUser,
  setToken,
}) {

  const navigate =
    useNavigate();


  // =========================
  // USER STATES
  // =========================

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [role, setRole] =
    useState("");

  const [location, setLocation] =
    useState("");

  const [createdAt, setCreatedAt] =
    useState("");


  // =========================
  // EDIT STATES
  // =========================

  const [isEditing, setIsEditing] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");


  // =========================
  // PREFERENCES
  // =========================

  const [
    emailNotifications,
    setEmailNotifications,
  ] = useState(true);

  const [
    taskReminders,
    setTaskReminders,
  ] = useState(true);

  const [
    weeklyReport,
    setWeeklyReport,
  ] = useState(false);


  // =========================
  // PASSWORD STATES
  // =========================

  const [
    showPasswordForm,
    setShowPasswordForm,
  ] = useState(false);

  const [
    currentPassword,
    setCurrentPassword,
  ] = useState("");

  const [
    newPassword,
    setNewPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    changingPassword,
    setChangingPassword,
  ] = useState(false);


  // =========================
  // TOKEN
  // =========================

  const token =
    localStorage.getItem(
      "token"
    );


  // =========================
  // GET PROFILE
  // =========================

  async function getProfile() {

    try {

      const response = await fetch(
        `${API_URL}/api/auth/profile`,
        {
          headers: {

            Authorization:
              `Bearer ${token}`,

          },
        }
      );


      const data =
        await response.json();


      if (!response.ok) {

        setMessage(
          data.message ||
          "Could not load profile"
        );

        return;
      }


      // User information

      setName(
        data.name || ""
      );

      setEmail(
        data.email || ""
      );

      setRole(
        data.role || "Student"
      );

      setLocation(
        data.location || ""
      );

      setCreatedAt(
        data.createdAt || ""
      );


      // Preferences

      setEmailNotifications(
        data.preferences
          ?.emailNotifications ?? true
      );

      setTaskReminders(
        data.preferences
          ?.taskReminders ?? true
      );

      setWeeklyReport(
        data.preferences
          ?.weeklyReport ?? false
      );


      // Update App.jsx user

      setUser(data);


      // Update localStorage

      localStorage.setItem(
        "user",
        JSON.stringify(data)
      );


      setMessage("");


    } catch (error) {

      console.log(
        "PROFILE ERROR:",
        error
      );


      setMessage(
        "Could not load profile"
      );


    } finally {

      setLoading(false);

    }

  }


  // =========================
  // LOAD PROFILE
  // =========================

  useEffect(() => {

    getProfile();

  }, []);


  // =========================
  // UPDATE PROFILE
  // =========================

  async function updateProfile() {

    if (
      name.trim() === ""
    ) {

      setMessage(
        "Name cannot be empty"
      );

      return;
    }


    try {

      setSaving(true);

      setMessage("");


      const response = await fetch(
        `${API_URL}/api/auth/profile`,
        {
          method: "PUT",

          headers: {

            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,

          },

          body: JSON.stringify({
            name,
            role,
            location,
          }),
        }
      );


      const data =
        await response.json();


      if (!response.ok) {

        setMessage(
          data.message ||
          "Could not update profile"
        );

        return;
      }


      setName(
        data.name || ""
      );

      setEmail(
        data.email || ""
      );

      setRole(
        data.role || ""
      );

      setLocation(
        data.location || ""
      );

      setCreatedAt(
        data.createdAt || ""
      );


      // Update Navbar

      setUser(data);


      // Update localStorage

      localStorage.setItem(
        "user",
        JSON.stringify(data)
      );


      setIsEditing(false);


      setMessage(
        "Profile updated successfully"
      );


    } catch (error) {

      console.log(
        "UPDATE PROFILE ERROR:",
        error
      );


      setMessage(
        "Could not update profile"
      );


    } finally {

      setSaving(false);

    }

  }


  // =========================
  // CANCEL EDIT
  // =========================

  function cancelEdit() {

    setIsEditing(false);

    setMessage("");

    getProfile();

  }


  // =========================
  // UPDATE PREFERENCES
  // =========================

  async function updatePreferences(
    newPreferences
  ) {

    try {

      setMessage("");


      const response = await fetch(
       `${API_URL}/api/auth/preferences`,
        {
          method: "PUT",

          headers: {

            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,

          },

          body: JSON.stringify(
            newPreferences
          ),
        }
      );


      const data =
        await response.json();


      if (!response.ok) {

        setMessage(
          data.message ||
          "Could not update preferences"
        );

        return;
      }


      // Update states using
      // returned MongoDB values

      setEmailNotifications(
        data.preferences
          ?.emailNotifications ?? true
      );

      setTaskReminders(
        data.preferences
          ?.taskReminders ?? true
      );

      setWeeklyReport(
        data.preferences
          ?.weeklyReport ?? false
      );


      // Update App user

      setUser(data);


      // Update localStorage

      localStorage.setItem(
        "user",
        JSON.stringify(data)
      );


      setMessage(
        "Preferences updated successfully"
      );


    } catch (error) {

      console.log(
        "PREFERENCES ERROR:",
        error
      );


      setMessage(
        "Could not update preferences"
      );

    }

  }


  // =========================
  // CHANGE PASSWORD
  // =========================

  async function changePassword() {

    setMessage("");


    // Check empty fields

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {

      setMessage(
        "Please fill all password fields"
      );

      return;
    }


    // Check password length

    if (
      newPassword.length < 6
    ) {

      setMessage(
        "New password must be at least 6 characters"
      );

      return;
    }


    // Check passwords match

    if (
      newPassword !==
      confirmPassword
    ) {

      setMessage(
        "New passwords do not match"
      );

      return;
    }


    try {

      setChangingPassword(true);


      const response = await fetch(
        `${API_URL}/api/auth/change-password`,
        {
          method: "PUT",

          headers: {

            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,

          },

          body: JSON.stringify({

            currentPassword:
              currentPassword,

            newPassword:
              newPassword,

          }),
        }
      );


      const data =
        await response.json();


      if (!response.ok) {

        setMessage(
          data.message ||
          "Could not change password"
        );

        return;
      }


      // Clear password fields

      setCurrentPassword("");

      setNewPassword("");

      setConfirmPassword("");


      // Hide form

      setShowPasswordForm(false);


      setMessage(
        "Password changed successfully"
      );


    } catch (error) {

      console.log(
        "PASSWORD ERROR:",
        error
      );


      setMessage(
        "Could not change password"
      );


    } finally {

      setChangingPassword(false);

    }

  }


  // =========================
  // DELETE ACCOUNT
  // =========================

  async function deleteAccount() {

    const confirmed =
      window.confirm(
        "Are you sure you want to delete your account? All your tasks will also be permanently deleted."
      );


    if (!confirmed) {

      return;

    }


    try {

      setMessage("");


      const response = await fetch(
        `${API_URL}/api/auth/account`,
        {
          method: "DELETE",

          headers: {

            Authorization:
              `Bearer ${token}`,

          },
        }
      );


      const data =
        await response.json();


      if (!response.ok) {

        setMessage(
          data.message ||
          "Could not delete account"
        );

        return;
      }


      // Remove saved login

      localStorage.removeItem(
        "token"
      );

      localStorage.removeItem(
        "user"
      );


      // Clear React states

      setUser(null);

      setToken(null);


      // Go to login

      navigate(
        "/auth",
        {
          replace: true,
        }
      );


    } catch (error) {

      console.log(
        "DELETE ACCOUNT ERROR:",
        error
      );


      setMessage(
        "Could not delete account"
      );

    }

  }


  // =========================
  // MEMBER SINCE
  // =========================

  function getMemberSince() {

    if (!createdAt) {

      return "October 2026";

    }


    const date =
      new Date(createdAt);


    return date.toLocaleDateString(
      "en-US",
      {
        month: "long",
        year: "numeric",
      }
    );

  }


  // =========================
  // LOADING
  // =========================

  if (loading) {

    return (

      <div className="bg-white rounded-2xl p-8">

        <p className="text-gray-500">

          Loading profile...

        </p>

      </div>

    );

  }


  return (

    <div className="space-y-6">


      {/* ========================= */}
      {/* PROFILE HEADER */}
      {/* ========================= */}

      <div className="bg-black text-white rounded-2xl p-6 md:p-8">


        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">


          {/* USER DETAILS */}

          <div className="flex items-center gap-5">


            {/* AVATAR */}

            <div className="w-20 h-20 bg-yellow-400 text-black rounded-full flex items-center justify-center text-3xl font-bold">

              {
                name
                  ? name[0].toUpperCase()
                  : "U"
              }

            </div>


            <div>

              <h1 className="text-2xl font-bold">

                {name}

              </h1>


              <p className="text-gray-300 mt-1">

                {
                  role ||
                  "Student"
                }

              </p>


              <p className="text-gray-500 mt-2">

                {email}

              </p>

            </div>


          </div>


          {/* EDIT BUTTON */}

          {!isEditing ? (

            <button
              type="button"
              onClick={() =>
                setIsEditing(true)
              }
              className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-3 rounded-xl font-semibold"
            >

              Edit Profile

            </button>

          ) : (

            <div className="flex gap-3">


              <button
                type="button"
                onClick={cancelEdit}
                className="bg-gray-700 hover:bg-gray-600 text-white px-5 py-3 rounded-xl"
              >

                Cancel

              </button>


              <button
                type="button"
                onClick={updateProfile}
                disabled={saving}
                className="bg-yellow-400 hover:bg-yellow-500 text-black px-5 py-3 rounded-xl font-semibold disabled:opacity-50"
              >

                {
                  saving
                    ? "Saving..."
                    : "Save Changes"
                }

              </button>


            </div>

          )}


        </div>


      </div>


      {/* ========================= */}
      {/* MESSAGE */}
      {/* ========================= */}

      {message && (

        <div className="bg-white border border-gray-200 rounded-xl px-5 py-3">

          <p
            className={
              message.includes(
                "successfully"
              )
                ? "text-green-600"
                : "text-red-500"
            }
          >

            {message}

          </p>

        </div>

      )}


      {/* ========================= */}
      {/* MAIN GRID */}
      {/* ========================= */}

      <div className="grid lg:grid-cols-3 gap-6">


        {/* ========================= */}
        {/* LEFT SIDE */}
        {/* ========================= */}

        <div className="lg:col-span-2 space-y-6">


          {/* ========================= */}
          {/* PERSONAL INFORMATION */}
          {/* ========================= */}

          <div className="bg-white border border-gray-200 rounded-2xl p-6">


            <h2 className="text-xl font-bold">

              Personal Information

            </h2>


            <p className="text-gray-500 mt-1 mb-6">

              Update your personal details.

            </p>


            <div className="grid md:grid-cols-2 gap-5">


              {/* NAME */}

              <div>

                <label className="block font-semibold mb-2">

                  Full Name

                </label>


                <input
                  type="text"
                  value={name}
                  disabled={!isEditing}
                  onChange={(e) =>
                    setName(
                      e.target.value
                    )
                  }
                  className={`w-full border rounded-lg px-4 py-3 outline-none ${
                    isEditing
                      ? "bg-white border-gray-300 focus:border-yellow-400"
                      : "bg-gray-50 border-gray-200 text-gray-500"
                  }`}
                />

              </div>


              {/* EMAIL */}

              <div>

                <label className="block font-semibold mb-2">

                  Email Address

                </label>


                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full bg-gray-50 border border-gray-200 text-gray-500 rounded-lg px-4 py-3"
                />

              </div>


              {/* ROLE */}

              <div>

                <label className="block font-semibold mb-2">

                  Role

                </label>


                <input
                  type="text"
                  value={role}
                  disabled={!isEditing}
                  onChange={(e) =>
                    setRole(
                      e.target.value
                    )
                  }
                  placeholder="Student"
                  className={`w-full border rounded-lg px-4 py-3 outline-none ${
                    isEditing
                      ? "bg-white border-gray-300 focus:border-yellow-400"
                      : "bg-gray-50 border-gray-200 text-gray-500"
                  }`}
                />

              </div>


              {/* LOCATION */}

              <div>

                <label className="block font-semibold mb-2">

                  Location

                </label>


                <input
                  type="text"
                  value={location}
                  disabled={!isEditing}
                  onChange={(e) =>
                    setLocation(
                      e.target.value
                    )
                  }
                  placeholder="Enter location"
                  className={`w-full border rounded-lg px-4 py-3 outline-none ${
                    isEditing
                      ? "bg-white border-gray-300 focus:border-yellow-400"
                      : "bg-gray-50 border-gray-200 text-gray-500"
                  }`}
                />

              </div>


            </div>


          </div>


          {/* ========================= */}
          {/* PREFERENCES */}
          {/* ========================= */}

          <div className="bg-white border border-gray-200 rounded-2xl p-6">


            <h2 className="text-xl font-bold">

              Preferences

            </h2>


            <p className="text-gray-500 mt-1 mb-4">

              Customize your TaskFlow experience.

            </p>


            {/* EMAIL NOTIFICATIONS */}

            <div className="flex items-center justify-between py-5 border-b border-gray-100">

              <div>

                <p className="font-semibold">

                  Email Notifications

                </p>

                <p className="text-gray-500 text-sm mt-1">

                  Receive updates about your tasks.

                </p>

              </div>


              <input
                type="checkbox"
                checked={
                  emailNotifications
                }
                onChange={(e) => {

                  const value =
                    e.target.checked;


                  setEmailNotifications(
                    value
                  );


                  updatePreferences({

                    emailNotifications:
                      value,

                    taskReminders:
                      taskReminders,

                    weeklyReport:
                      weeklyReport,

                  });

                }}
                className="w-5 h-5 accent-yellow-400"
              />

            </div>


            {/* TASK REMINDERS */}

            <div className="flex items-center justify-between py-5 border-b border-gray-100">

              <div>

                <p className="font-semibold">

                  Task Reminders

                </p>

                <p className="text-gray-500 text-sm mt-1">

                  Receive reminders before deadlines.

                </p>

              </div>


              <input
                type="checkbox"
                checked={
                  taskReminders
                }
                onChange={(e) => {

                  const value =
                    e.target.checked;


                  setTaskReminders(
                    value
                  );


                  updatePreferences({

                    emailNotifications:
                      emailNotifications,

                    taskReminders:
                      value,

                    weeklyReport:
                      weeklyReport,

                  });

                }}
                className="w-5 h-5 accent-yellow-400"
              />

            </div>


            {/* WEEKLY REPORT */}

            <div className="flex items-center justify-between py-5">

              <div>

                <p className="font-semibold">

                  Weekly Report

                </p>

                <p className="text-gray-500 text-sm mt-1">

                  Get a weekly productivity summary.

                </p>

              </div>


              <input
                type="checkbox"
                checked={
                  weeklyReport
                }
                onChange={(e) => {

                  const value =
                    e.target.checked;


                  setWeeklyReport(
                    value
                  );


                  updatePreferences({

                    emailNotifications:
                      emailNotifications,

                    taskReminders:
                      taskReminders,

                    weeklyReport:
                      value,

                  });

                }}
                className="w-5 h-5 accent-yellow-400"
              />

            </div>


          </div>


        </div>


        {/* ========================= */}
        {/* RIGHT SIDE */}
        {/* ========================= */}

        <div className="space-y-6">


          {/* ========================= */}
          {/* ACCOUNT */}
          {/* ========================= */}

          <div className="bg-white border border-gray-200 rounded-2xl p-6">


            <h2 className="text-xl font-bold mb-6">

              Account

            </h2>


            <div className="mb-6">

              <p className="text-gray-500 text-sm">

                Account Type

              </p>

              <p className="font-semibold mt-1">

                Personal

              </p>

            </div>


            <div className="mb-6">

              <p className="text-gray-500 text-sm">

                Member Since

              </p>

              <p className="font-semibold mt-1">

                {getMemberSince()}

              </p>

            </div>


            <div>

              <p className="text-gray-500 text-sm">

                Status

              </p>


              <span className="inline-block mt-2 bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm">

                Active

              </span>

            </div>


          </div>


          {/* ========================= */}
          {/* SECURITY */}
          {/* ========================= */}

          <div className="bg-white border border-gray-200 rounded-2xl p-6">


            <h2 className="text-xl font-bold">

              Security

            </h2>


            <p className="text-gray-500 mt-1 mb-6">

              Manage your account security.

            </p>


            {/* CHANGE PASSWORD BUTTON */}

            <button
              type="button"
              onClick={() => {

                setShowPasswordForm(
                  !showPasswordForm
                );

                setMessage("");

              }}
              className="w-full border border-gray-300 hover:bg-gray-50 rounded-xl py-3 mb-3"
            >

              {
                showPasswordForm
                  ? "Cancel Password Change"
                  : "Change Password"
              }

            </button>


            {/* PASSWORD FORM */}

            {showPasswordForm && (

              <div className="space-y-3 mb-5">


                <input
                  type="password"
                  value={
                    currentPassword
                  }
                  onChange={(e) =>
                    setCurrentPassword(
                      e.target.value
                    )
                  }
                  placeholder="Current password"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-yellow-400"
                />


                <input
                  type="password"
                  value={
                    newPassword
                  }
                  onChange={(e) =>
                    setNewPassword(
                      e.target.value
                    )
                  }
                  placeholder="New password"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-yellow-400"
                />


                <input
                  type="password"
                  value={
                    confirmPassword
                  }
                  onChange={(e) =>
                    setConfirmPassword(
                      e.target.value
                    )
                  }
                  placeholder="Confirm new password"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-yellow-400"
                />


                <button
                  type="button"
                  onClick={
                    changePassword
                  }
                  disabled={
                    changingPassword
                  }
                  className="w-full bg-black hover:bg-gray-800 text-white rounded-lg py-3 font-semibold disabled:opacity-50"
                >

                  {
                    changingPassword
                      ? "Updating..."
                      : "Update Password"
                  }

                </button>


              </div>

            )}


            {/* DELETE ACCOUNT */}

            <button
              type="button"
              onClick={
                deleteAccount
              }
              className="w-full border border-red-200 text-red-500 hover:bg-red-50 rounded-xl py-3"
            >

              Delete Account

            </button>


          </div>


        </div>


      </div>


    </div>

  );

}


export default Profile;