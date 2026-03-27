import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import axios from "axios";
import { MdDarkMode, MdLightMode } from "react-icons/md";
import {
  MdDashboard,
  MdInventory2,
  MdImage,
  MdPeople,
  MdNotifications,
} from "react-icons/md";

const API_BASE = import.meta.env.VITE_API_URL || "https://shootingstar-two.vercel.app";

const navItems = [
  { to: "/admin/dashboard",     labelKey: "dashboard",     Icon: MdDashboard   },
  { to: "/admin/products",      labelKey: "products",      Icon: MdInventory2  },
  { to: "/admin/hero",          labelKey: "heroSection",   Icon: MdImage       },
  { to: "/admin/customers",     labelKey: "customers",     Icon: MdPeople      },
  { to: "/admin/notifications", labelKey: "notifications", Icon: MdNotifications },
];

export default function AdminSidebar() {
  const { t, i18n } = useTranslation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );

  // Dark mode
  useEffect(() => {
    const html = document.documentElement;
    darkMode
      ? html.classList.add("dark")
      : html.classList.remove("dark");
    localStorage.setItem("darkMode", String(darkMode));
  }, [darkMode]);

  // Notifications polling
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/api/notifications`, {
        withCredentials: true,
      });
      setUnreadCount(data.filter((n) => !n.read).length);
    } catch (err) {
      console.error("Error fetching unread count:", err);
    }
  };

  const badge =
    unreadCount > 0 ? (unreadCount > 99 ? "99+" : unreadCount) : null;

  // ── Shared link class builder ──────────────────────────────────────────────
  const desktopLink = ({ isActive }) =>
    `flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
      isActive
        ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
        : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
    }`;

  return (
    <>
      {/* ════════════════════════════════════════════════
          DESKTOP SIDEBAR  (md and up)
      ════════════════════════════════════════════════ */}
      <aside className="hidden md:flex flex-col w-64 min-h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 shadow-sm p-5">

        {/* Logo / Title */}
        <h2 className="text-xl font-bold mb-8 text-gray-800 dark:text-white">
          {t("admin")}
        </h2>

        {/* Nav links */}
        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map(({ to, labelKey, Icon }) => (
            <NavLink key={to} to={to} className={desktopLink}>
              {({ isActive }) => (
                <>
                  <Icon
                    className={`text-lg shrink-0 ${
                      isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-400"
                    }`}
                  />
                  <span className="flex-1">{t(labelKey)}</span>

                  {/* Notification badge */}
                  {labelKey === "notifications" && badge && (
                    <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full min-w-5 h-5 flex items-center justify-center px-1">
                      {badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom controls */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <button
            onClick={() =>
              i18n.changeLanguage(i18n.language === "ar" ? "en" : "ar")
            }
            className="text-xs bg-gray-100 dark:bg-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
          >
            {i18n.language === "ar" ? t("english") : t("arabic")}
          </button>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Toggle dark mode"
          >
            {darkMode
              ? <MdLightMode className="text-xl text-yellow-400" />
              : <MdDarkMode  className="text-xl text-gray-500" />
            }
          </button>
        </div>
      </aside>

      {/* ════════════════════════════════════════════════
          MOBILE BOTTOM NAV  (below md)
      ════════════════════════════════════════════════ */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex items-center justify-around px-1 py-2 safe-area-pb">

        {navItems.map(({ to, labelKey, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors min-w-0 ${
                isActive
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-500 dark:text-gray-400"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className="relative">
                  <Icon className={`text-2xl ${isActive ? "text-blue-600 dark:text-blue-400" : ""}`} />
                  {/* Notification badge on icon */}
                  {labelKey === "notifications" && badge && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-4 h-4 flex items-center justify-center px-0.5">
                      {badge}
                    </span>
                  )}
                </span>
                <span className="text-[10px] font-medium leading-none truncate max-w-13 text-center">
                  {t(labelKey)}
                </span>
                {/* Active indicator dot */}
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-600 dark:bg-blue-400" />
                )}
              </>
            )}
          </NavLink>
        ))}

        {/* Dark mode + Language as extra icons */}
        <div className="flex flex-col items-center gap-1">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-1"
            title="Toggle dark mode"
          >
            {darkMode
              ? <MdLightMode className="text-2xl text-yellow-400" />
              : <MdDarkMode  className="text-2xl text-gray-500 dark:text-gray-400" />
            }
          </button>
          <button
            onClick={() =>
              i18n.changeLanguage(i18n.language === "ar" ? "en" : "ar")
            }
            className="text-[10px] font-medium text-gray-500 dark:text-gray-400 leading-none"
          >
            {i18n.language === "ar" ? "EN" : "AR"}
          </button>
        </div>

      </nav>

      {/* Spacer so mobile content isn't hidden behind the bottom nav */}
      <div className="md:hidden h-16" />
    </>
  );
}