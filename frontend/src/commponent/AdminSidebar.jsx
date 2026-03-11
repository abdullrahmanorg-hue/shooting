import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function AdminSidebar() {
  const { t, i18n } = useTranslation();

  return (
    <aside className="w-64 min-h-screen bg-white dark:bg-gray-900 shadow-lg p-5">
      <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-white">
        Admin
      </h2>

      <nav className="space-y-3 flex flex-col items-center pt-14">
        <NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          {t("dashboard")} 
        </NavLink>

        <NavLink to="/admin/products" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          {t("products")}
        </NavLink>

        <NavLink to="/admin/categories" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          {t("categories")}
        </NavLink>

        <NavLink to="/admin/hero" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          {t("hero")}
        </NavLink>

        <NavLink  to="/admin/customers" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          {t("customers")}
        </NavLink >
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