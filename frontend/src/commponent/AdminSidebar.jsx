import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import axios from "axios";
import { MdDarkMode } from "react-icons/md";

export default function AdminSidebar() {
  const { t, i18n } = useTranslation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('darkMode') === 'true'
  );

  // Dark Mode
  useEffect(() => {
    const html = document.documentElement;
    if (darkMode) {
      html.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      html.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/notifications`,
        {
          withCredentials: true,
        },
      );
      const unread = response.data.filter((notif) => !notif.read).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error("Error fetching unread count:", err);
    }
  };

  return (
   <aside className="w-full sm:w-64 min-h-screen bg-white dark:bg-gray-900 shadow-lg p-4 sm:p-5">
  
  <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-6 text-gray-800 dark:text-white text-center sm:text-left">
    {t("admin")}
  </h2>

  <nav className="space-y-2 sm:space-y-3 flex flex-col items-center sm:items-start">

    <NavLink
      to="/admin/dashboard"
      className={({ isActive }) =>
        `w-full text-center sm:text-left px-3 py-2 rounded transition ${
          isActive
            ? "bg-blue-100 text-blue-600 font-semibold"
            : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
        }`
      }
    >
      {t("dashboard")}
    </NavLink>

    <NavLink
      to="/admin/products"
      className={({ isActive }) =>
        `w-full text-center sm:text-left px-3 py-2 rounded transition ${
          isActive
            ? "bg-blue-100 text-blue-600 font-semibold"
            : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
        }`
      }
    >
      {t("products")}
    </NavLink>

    <NavLink
      to="/admin/hero"
      className={({ isActive }) =>
        `w-full text-center sm:text-left px-3 py-2 rounded transition ${
          isActive
            ? "bg-blue-100 text-blue-600 font-semibold"
            : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
        }`
      }
    >
      {t("heroSection")}
    </NavLink>

    <NavLink
      to="/admin/customers"
      className={({ isActive }) =>
        `w-full text-center sm:text-left px-3 py-2 rounded transition ${
          isActive
            ? "bg-blue-100 text-blue-600 font-semibold"
            : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
        }`
      }
    >
      {t("customers")}
    </NavLink>

    <NavLink
      to="/admin/notifications"
      className={({ isActive }) =>
        `w-full text-center sm:text-left px-3 py-2 rounded transition ${
          isActive
            ? "bg-blue-100 text-blue-600 font-semibold"
            : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
        }`
      }
    >
      <div className="relative inline-block">
        📬 {t("notifications")}
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-4 sm:-right-6 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center">
            {unreadCount > 99 ? t("manyNotifications") : unreadCount}
          </span>
        )}
      </div>
    </NavLink>

  </nav>

  <div className="mt-8 sm:mt-10 flex items-center justify-between sm:justify-around gap-3">

    <button
      onClick={() =>
        i18n.changeLanguage(i18n.language === "ar" ? "en" : "ar")
      }
      className="text-xs sm:text-sm bg-gray-200 dark:bg-gray-700 px-2 sm:px-3 py-1 rounded"
    >
      {i18n.language === "ar" ? t("english") : t("arabic")}
    </button>

    <MdDarkMode
      className="text-lg sm:text-xl cursor-pointer hover:text-yellow-400 transition"
      onClick={() => setDarkMode(!darkMode)}
    />

  </div>
</aside>
  );
}