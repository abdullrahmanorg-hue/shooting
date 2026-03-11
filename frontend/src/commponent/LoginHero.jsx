import ImgHero from '../assets/pexels-pixabay-236705.jpg'
export default function LoginHero() {
  return (
    <div
      className="hidden md:flex items-center justify-center bg-cover bg-center text-white w-full h-dvh dark:text-[#fff2e1]"
  
     style={{ backgroundImage: `url(${ImgHero})` }}
      >
      <div className="bg-black/60 p-10 text-center">
        <h2 className="text-4xl font-bold mb-4">
          Welcome Back
        </h2>
        <p className="text-lg">
          Access your dashboard and manage your account.
        </p>
      </div>
    </div>
  );
}