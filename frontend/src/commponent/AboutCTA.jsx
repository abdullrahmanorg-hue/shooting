import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';

export default function AboutCTA() {
  const { t } = useTranslation();

  return (
    <div className="bg-gray-700 text-white py-16 text-center dark:bg-[#102c26]">
      <h2 className="text-3xl font-semibold mb-4">
        {t("ctaTitle")}
      </h2>
      <p className="mb-6">
        {t("ctaDesc")}
      </p>
      <Link to="../contact">
        <button className="bg-white text-gray-800 px-8 py-3 rounded-lg font-semibold cursor-pointer hover:bg-gray-500 hover:text-white dark:hover:bg-black">
          {t("ctaButton")}
        </button>
      </Link>
    </div>
  );
}