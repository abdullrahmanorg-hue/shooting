import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  FaFacebookF,
  FaInstagram,
  FaTiktok,
  FaMoon,
  FaSun,
  FaTelegramPlane,
} from "react-icons/fa";
import { Link } from "react-router-dom";

export default function Footer() {
  const { t, i18n } = useTranslation();
  const [darkMode, setDarkMode] = useState(false);

  // تغيير اللغة
  const handleTranslate = () => {
    const newLang = i18n.language === "en" ? "ar" : "en";
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
  };

  // حفظ وضع الدارك مود
  useEffect(() => {
    const savedMode = localStorage.getItem("theme");
    if (savedMode === "dark") {
      document.documentElement.classList.add("dark");
      setDarkMode(true);
    }
  }, []);

  const toggleTheme = () => {
    if (darkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
    setDarkMode(!darkMode);
  };

  return (
    <footer className="bg-gray-100 dark:bg-black text-gray-800 dark:text-[#fff2e1] transition-all duration-500">
      <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-4 gap-10">

        {/* Brand */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold tracking-wide dark:hover:text-green-800 dark:hover:scale-95 cursor-pointer ">
            {t("brand")}
          </h2>

          <p className="text-sm leading-6">
            {t("brandDesc")}
          </p>

          {/* Dark Mode */}
          <button
            onClick={toggleTheme}
            className="mt-4 flex items-center gap-2 px-4 py-2 bg-black dark:bg-[#fff2e1] dark:text-black text-white rounded-full transition hover:scale-105"
          >
            {darkMode ? <FaSun /> : <FaMoon />}
            {darkMode ? t("lightMode") : t("darkMode")}
          </button>

          {/* Language Switch */}
     
        </div>

        {/* Links */}
        <div>
          <h3 className="font-semibold mb-4">{t("quickLinks")}</h3>
          <ul className="space-y-2 text-sm flex flex-col ">
            <Link className="dark:hover:text-green-800" to="/">{t("home")}</Link>
            <Link className="dark:hover:text-green-800" to="/shop">{t("shop")}</Link>
            <Link className="dark:hover:text-green-800" to="/shop">{t("newArrivals")}</Link>
            <Link className="dark:hover:text-green-800" to="/contact">{t("contact")}</Link>
          </ul>
        </div>

        {/* Categories */}
        <div>
          <h3 className="font-semibold mb-4">{t("categories")}</h3>
          <ul className="space-y-2 text-sm">
            <li>{t("suit")}</li>
            <li>{t("jeans")}</li>
            <li>{t("pants")}</li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h3 className="font-semibold mb-4">{t("subscribe")}</h3>
          <p className="text-sm mb-4">{t("subscribeDesc")}</p>

          <div className="flex">
            <input
              type="email"
              placeholder={t("emailPlaceholder")}
              className="flex-1 px-3 py-2 rounded-l-md border dark:border-gray-700 bg-white dark:bg-[#fff2e1] dark:text-black focus:outline-none w-full"
            />
            <button className="px-4 py-2 bg-gray-500 text-white rounded-r-md hover:bg-green-400 transition dark:bg-black">
              {t("subscribe")}
            </button>
          </div>

          <div className="flex gap-4 mt-6 text-lg">
            <a href="https://www.facebook.com/profile.php?id=100083360465874" target="_blank" rel="noopener noreferrer">
              <FaFacebookF className="hover:text-blue-700 transition hover:scale-125" />
            </a>
            <a href="https://www.instagram.com/shotingstar743/" target="_blank" rel="noopener noreferrer">
              <FaInstagram className="hover:text-orange-500 transition hover:scale-125" />
            </a>
            <a href="https://t.me/ShootingStarForyou" target="_blank" rel="noopener noreferrer">
              <FaTelegramPlane className="hover:text-blue-700 transition hover:scale-125" />
            </a>
            <a href="https://www.tiktok.com/@shootingstar743_?is_from_webapp=1&sender_device=pc" target="_blank" rel="noopener noreferrer">
              <FaTiktok className="hover:text-gray-900 transition hover:scale-125" />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-gray-300 dark:border-gray-800 text-center py-6 text-sm">
        © 2026 {t("brand")}. {t("rights")}
      </div>
    </footer>
  );
}