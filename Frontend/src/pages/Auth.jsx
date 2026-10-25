import { useState } from "react";
import { useNavigate } from "react-router-dom";


function Auth({
  setToken,
  setUser,
}) {

  const navigate = useNavigate();


  // =========================
  // STATES
  // =========================

  const [isLogin, setIsLogin] =
    useState(true);

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(false);


  // =========================
  // LOGIN
  // =========================

  async function handleLogin(e) {

    e.preventDefault();

    setMessage("");
    setLoading(true);


    try {

      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            email,
            password,
          }),
        }
      );


      const data =
        await response.json();


      if (!response.ok) {

        setMessage(
          data.message ||
          "Login failed"
        );

        return;
      }


      // Save token
      localStorage.setItem(
        "token",
        data.token
      );


      // Save user
      localStorage.setItem(
        "user",
        JSON.stringify(
          data.user
        )
      );


      // Update App.jsx states
      setToken(
        data.token
      );

      setUser(
        data.user
      );


      // Go to Dashboard
      navigate("/");


    } catch (error) {

      console.log(
        "LOGIN ERROR:",
        error
      );

      setMessage(
        "Unable to connect to server"
      );


    } finally {

      setLoading(false);

    }

  }


  // =========================
  // REGISTER
  // =========================

  async function handleRegister(e) {

    e.preventDefault();

    setMessage("");
    setLoading(true);


    try {

      const response = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            name,
            email,
            password,
          }),
        }
      );


      const data =
        await response.json();


      if (!response.ok) {

        setMessage(
          data.message ||
          "Registration failed"
        );

        return;
      }


      setMessage(
        "Account created successfully. Please login."
      );


      // Switch to Login
      setIsLogin(true);


      // Clear password
      setPassword("");


    } catch (error) {

      console.log(
        "REGISTER ERROR:",
        error
      );

      setMessage(
        "Unable to connect to server"
      );


    } finally {

      setLoading(false);

    }

  }


  // =========================
  // SWITCH FORM
  // =========================

  function switchForm() {

    setIsLogin(
      !isLogin
    );

    setMessage("");

    setName("");

    setEmail("");

    setPassword("");

  }


  return (

    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">


      {/* AUTH CARD */}

      <div className="bg-white w-full max-w-md border border-gray-200 rounded-2xl p-8 shadow-sm">


        {/* LOGO */}

        <div className="text-center mb-8">

          <h1 className="text-3xl font-bold">

            Task

            <span className="text-yellow-400">
              Flow
            </span>

          </h1>


          <p className="text-gray-500 mt-2">

            {
              isLogin
                ? "Welcome back. Login to continue."
                : "Create your TaskFlow account."
            }

          </p>

        </div>


        {/* ========================= */}
        {/* LOGIN / REGISTER TABS */}
        {/* ========================= */}

        <div className="flex bg-gray-100 rounded-xl p-1 mb-7">


          {/* LOGIN TAB */}

          <button
            type="button"
            onClick={() => {

              setIsLogin(true);

              setMessage("");

            }}
            className={`w-1/2 py-2.5 rounded-lg font-medium transition ${
              isLogin
                ? "bg-black text-white"
                : "text-gray-500"
            }`}
          >

            Login

          </button>


          {/* REGISTER TAB */}

          <button
            type="button"
            onClick={() => {

              setIsLogin(false);

              setMessage("");

            }}
            className={`w-1/2 py-2.5 rounded-lg font-medium transition ${
              !isLogin
                ? "bg-yellow-400 text-black"
                : "text-gray-500"
            }`}
          >

            Register

          </button>

        </div>


        {/* ========================= */}
        {/* FORM */}
        {/* ========================= */}

        <form
          onSubmit={
            isLogin
              ? handleLogin
              : handleRegister
          }
        >


          {/* NAME */}

          {!isLogin && (

            <div className="mb-4">

              <label className="block font-medium mb-2">

                Name

              </label>


              <input
                type="text"
                value={name}
                onChange={(e) =>
                  setName(
                    e.target.value
                  )
                }
                placeholder="Enter your name"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-yellow-400"
                required
              />

            </div>

          )}


          {/* EMAIL */}

          <div className="mb-4">

            <label className="block font-medium mb-2">

              Email

            </label>


            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }
              placeholder="Enter your email"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-yellow-400"
              required
            />

          </div>


          {/* PASSWORD */}

          <div className="mb-5">

            <label className="block font-medium mb-2">

              Password

            </label>


            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
              placeholder="Enter your password"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-yellow-400"
              required
            />

          </div>


          {/* MESSAGE */}

          {message && (

            <div
              className={`text-sm p-3 rounded-lg mb-4 ${
                message.includes(
                  "successfully"
                )
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-600"
              }`}
            >

              {message}

            </div>

          )}


          {/* SUBMIT BUTTON */}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold transition disabled:opacity-50 ${
              isLogin
                ? "bg-black hover:bg-gray-800 text-white"
                : "bg-yellow-400 hover:bg-yellow-500 text-black"
            }`}
          >

            {
              loading
                ? "Please wait..."
                : isLogin
                ? "Login"
                : "Create Account"
            }

          </button>

        </form>


        {/* BOTTOM SWITCH */}

        <div className="text-center mt-6">

          <p className="text-sm text-gray-500">

            {
              isLogin
                ? "Don't have an account?"
                : "Already have an account?"
            }

            {" "}

            <button
              type="button"
              onClick={switchForm}
              className="text-black font-semibold hover:underline"
            >

              {
                isLogin
                  ? "Register"
                  : "Login"
              }

            </button>

          </p>

        </div>


      </div>

    </div>

  );

}


export default Auth;