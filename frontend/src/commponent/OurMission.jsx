import { useTranslation } from 'react-i18next';

export default function OurMission() {
  const { t } = useTranslation();

  return (
    <div className="bg-gray-100 py-16 dark:bg-[#102c26]">
      <div className="max-w-5xl mx-auto text-center px-6">
        <h2 className="text-3xl font-semibold mb-6 dark:text-[#fff2e1]">
          {t("ourMission")}
        </h2>
        <p className="text-gray-600 leading-8 dark:text-gray-400">
          {t("ourMissionDesc")}
        </p>
      </div>
    </div>
  );
}