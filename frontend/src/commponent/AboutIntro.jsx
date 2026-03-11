import factoryimg from '../assets/factory.jpg';
import { useTranslation } from 'react-i18next';

export default function AboutIntro() {
  const { t } = useTranslation();

  return (
    <div className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12 items-center">
      <img
        src={factoryimg}
        alt={t("factoryAlt")}
        className="rounded-xl shadow-lg"
      />

      <div>
        <h2 className="text-3xl font-semibold mb-6 dark:text-[#fff2e1]">
          {t("whoWeAre")}
        </h2>
        <p className="text-gray-600 leading-7 dark:text-gray-400">
          {t("aboutCompany")}
        </p>
      </div>
    </div>
  );
}