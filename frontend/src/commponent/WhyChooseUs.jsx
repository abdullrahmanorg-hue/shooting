import { useTranslation } from 'react-i18next';

export default function WhyChooseUs() {
  const { t } = useTranslation();

  const features = [
    t("feature1"),
    t("feature2"),
    t("feature3"),
    t("feature4"),
  ];

  return (
    <div className="bg-gray-100 py-16 dark:bg-black dark:text-[#fff2e1]">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-semibold mb-10 text-center">
          {t("whyChooseUsTitle")}
        </h2>

        <div className="grid md:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow text-center dark:bg-[#102c26]"
            >
              {feature}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}