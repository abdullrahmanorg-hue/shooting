import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminSidebar() {
  const { t, i18n } = useTranslation();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUnreadCount();
    // Poll for new unread notifications every 5 seconds
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
    <aside className="w-64 min-h-screen bg-white dark:bg-gray-900 shadow-lg p-5">
      <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-white">
        Admin
      </h2>

      <nav className="space-y-3 flex flex-col items-center pt-14">
        <NavLink
          to="/admin/dashboard"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          {t("dashboard")}
        </NavLink>

        <NavLink
          to="/admin/products"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          {t("products")}
        </NavLink>

        <NavLink
          to="/admin/categories"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          {t("categories")}
        </NavLink>

        <NavLink
          to="/admin/hero"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          {t("hero")}
        </NavLink>

        <NavLink
          to="/admin/customers"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          {t("customers")}
        </NavLink>

        <NavLink
          to="/admin/notifications"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          <div className="relative inline-block">
            📬 Notifications
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-6 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </div>
        </NavLink>
      </nav>

      <div className="mt-10 flex items-center justify-center">
        <button
          onClick={() =>
            i18n.changeLanguage(i18n.language === "ar" ? "en" : "ar")
          }
          className="text-sm bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded cursor-pointer"
        >
          {i18n.language === "ar" ? "English" : "العربية"}
        </button>
      </div>
    </aside>
  );
}
