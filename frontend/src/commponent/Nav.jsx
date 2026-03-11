import { Link, NavLink } from 'react-router-dom';
import { AiOutlineMenuFold, AiOutlineClose } from 'react-icons/ai';
import { FaCartArrowDown } from 'react-icons/fa';
import { MdDarkMode, MdGTranslate } from 'react-icons/md';
import { IoLogIn } from 'react-icons/io5';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import logo from '../assets/LOGO.png';

export default function Nav() {
  const { t, i18n } = useTranslation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  // Toggle language + RTL
  const handleTranslate = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
  };

  return (
    <>
      <nav className="fixed w-full top-0 z-50 bg-gray-200 dark:bg-black  text-gray-900 dark:text-[#fff2e1] px-6 py-4 flex justify-between items-center font-arabic shadow">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link to="/" className="cursor-pointer font-bold">
            {t('shooting-star')}
          </Link>
          <img className="h-7 dark:text-white LOGO" src={logo} alt="logo" />
        </div>

        {/* Desktop Menu */}
        <div className="hidden lg:flex gap-6 items-center font-english  ">
          <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            {t('home')}
          </NavLink>
          <NavLink to="/shop" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            {t('products')}
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            {t('about')}
          </NavLink>
          <NavLink to="/contact" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            {t('contact')}
          </NavLink>
        </div>

        {/* Icons */}
        <div className="flex gap-4 items-center">
          <MdDarkMode
            className="hidden lg:flex text-xl cursor-pointer hover:text-yellow-400 transition"
            onClick={() => setDarkMode(!darkMode)}
          />
          <MdGTranslate
            className="hidden lg:flex text-xl cursor-pointer hover:text-blue-400 transition"
            onClick={handleTranslate}
          />
        
          <Link to="/login">
            <IoLogIn className="hidden lg:flex text-xl cursor-pointer hover:text-green-500 transition" />
          </Link>
          <AiOutlineMenuFold
            className="text-2xl cursor-pointer lg:hidden"
            onClick={() => setSidebarOpen(true)}
          />
        </div>
      </nav>

      {/* Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-64 bg-gray-200 dark:bg-black text-gray-900 dark:text-[#fff2e1] transform transition-transform duration-300 z-50
          ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'} lg:hidden font-arabic`}>
        <div className="p-6 flex flex-col gap-6">
          <AiOutlineClose
            className="text-2xl self-end cursor-pointer"
            onClick={() => setSidebarOpen(false)}
          />

          <div className="flex flex-col gap-4">
            <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={() => setSidebarOpen(false)}>
              {t('home')}
            </NavLink>
            <NavLink to="/shop" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={() => setSidebarOpen(false)}>
              {t('products')}
            </NavLink>
            <NavLink to="/about" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={() => setSidebarOpen(false)}>
              {t('about')}
            </NavLink>
            <NavLink to="/contact" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={() => setSidebarOpen(false)}>
              {t('contact')}
            </NavLink>
          </div>

          {/* Sidebar Icons */}
          <div className="flex justify-around mt-6">
            <MdDarkMode className="text-xl cursor-pointer hover:text-yellow-400 transition" onClick={() => setDarkMode(!darkMode)} />
            <MdGTranslate className="text-xl cursor-pointer hover:text-blue-400 transition" onClick={handleTranslate} />
            <Link to="./login">
              <IoLogIn className="text-xl cursor-pointer hover:text-green-500 transition" />
            </Link> 
          </div>
        </div>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)}></div>
      )}
    </>
  );
}