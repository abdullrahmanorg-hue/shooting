import { useTranslation } from 'react-i18next';

export default function ProductionProcess() {
  const { t } = useTranslation();

  const steps = [
    t("processStep1"),
    t("processStep2"),
    t("processStep3"),
    t("processStep4"),
    t("processStep5"),
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-16 dark:bg-black dark:text-[#fff2e1]">
      <h2 className="text-3xl font-semibold mb-10 text-center">
        {t("productionProcessTitle")}
      </h2>

      <div className="grid md:grid-cols-5 gap-6 text-center">
        {steps.map((step, index) => (
          <div
            key={index}
            className="p-6 border rounded-lg hover:shadow-lg transition"
          >
            <div className="text-xl font-bold mb-3">{index + 1}</div>
            <p className="text-gray-600 dark:text-gray-400">{step}</p>
          </div>
        ))}
      </div>
    </div>
  );
}