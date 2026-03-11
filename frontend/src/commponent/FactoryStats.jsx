import { useTranslation } from 'react-i18next';

export default function FactoryStats() {
  const { t } = useTranslation();

  const stats = [
    { number: "25+", label: t("yearsExperience") },
    { number: "500+", label: t("employees") },
    { number: "120+", label: t("globalClients") },
    { number: "98%", label: t("clientSatisfaction") },
  ];

  return (
    <div className="py-16 text-center dark:text-[#fff2e1]">
      <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8 px-6">
        {stats.map((stat, index) => (
          <div key={index}>
            <h3 className="text-4xl font-bold mb-2">{stat.number}</h3>
            <p className="text-gray-500 dark:text-[#fff2e1]">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}