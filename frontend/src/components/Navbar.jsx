import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/slices/authSlice";
import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";

const Navbar = () => {
  const [dark, setDark] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });
  const token = useSelector((state) => state.auth.token);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const toggleDark = () => {
    setDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem("theme", next ? "dark" : "light");
      return next;
    });
  };

  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <nav className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 shadow">
      <Link to="/" className="font-bold text-xl text-blue-600 dark:text-blue-400">DailyFlow</Link>
      <div className="flex items-center gap-4">
        <button
          aria-label="Toggle dark mode"
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          onClick={toggleDark}
        >
          {dark ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
        </button>
        {token ? (
          <button onClick={handleLogout} className="ml-2 px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700">Déconnexion</button>
        ) : (
          <>
            <Link to="/login" className="px-3 py-1 rounded hover:bg-blue-50 dark:hover:bg-gray-700">Connexion</Link>
            <Link to="/register" className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 ml-2">Inscription</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
