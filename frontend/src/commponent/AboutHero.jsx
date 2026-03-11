import ImgHero from '../assets/pexels-pixabay-236705.jpg';
import { useTranslation } from 'react-i18next';

export default function AboutHero() {
  const { t } = useTranslation();

  return (
    <div
      className="h-[60vh] bg-cover bg-center flex items-center justify-center text-white dark:text-[#fff2e1]"
      style={{
        backgroundImage: `url(${ImgHero})`
      }}
    >
      <div className="bg-black/60 p-10 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          {t("aboutFactory")}
        </h1>
        <p className="text-lg">
          {t("precisionSince")}
        </p>
      </div>
    </div>
  );
}