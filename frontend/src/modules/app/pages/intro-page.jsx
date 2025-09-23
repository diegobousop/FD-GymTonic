import React from 'react'
import LoginNavBar from "../components/common/login-navbar";
import { Link } from 'react-router-dom';

const backgroundImage1 = "https://ik.imagekit.io/940wz34p7/prueba4.png?updatedAt=1758557039243"
const backgroundImage2 = "https://ik.imagekit.io/940wz34p7/Project-academy-About-Us-Page-banner-basketbll.png?updatedAt=1758624873099"
const backgroundImage3 = "https://ik.imagekit.io/940wz34p7/prueba5.png?updatedAt=1758557379960"



const IntroPage = () => {
  const [active, setActive] = React.useState(0);
  const backgrounds = [
    { id: 1, url: backgroundImage1 },
    { id: 2, url: backgroundImage2 },
    { id: 3, url: backgroundImage3 }
  ];

  React.useEffect(() => {
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % backgrounds.length);
    }, 10000); // 10000ms = 10s

    return () => clearInterval(interval);
  }, [backgrounds.length]);

 
  React.useEffect(() => {
    const previousTitle = document.title;
    document.title = 'GymTonic — Inicio';
    return () => { document.title = previousTitle; };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <LoginNavBar /> 

      
      <div className="relative flex-1 overflow-hidden">
  {backgrounds.map((bg, idx) => {
          
          let backgroundPosition = 'center center';
          if (idx === 0) backgroundPosition = '';
          if (idx === 1) backgroundPosition = 'center center';
          if (idx === 2) backgroundPosition = 'right center';

          return (
            <div
              key={bg.id}
              className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${active === idx ? 'opacity-100' : 'opacity-0'}`}
              style={{
                backgroundImage: `url(${bg.url})`,
                backgroundSize: 'cover',
                backgroundPosition: backgroundPosition,
                backgroundRepeat: 'no-repeat'
              }}
            />
          )
        })}

       
        <div className="absolute inset-0 bg-black/20 z-10"></div>

      
        <div className="absolute left-0 bottom-0 z-20 flex items-end w-full px-10 py-10">
          <div className="text-left space-y-4 ml-8 mb-8 mr-8 w-full">
            <h1 className="text-white/90 mb-10">Entrenar nunca fue tan fácil:<br />
             prueba nuestras rutinas hechas por<br /> profesionales.</h1>

            <div className="flex flex-row justify-between w-full">
              <Link to="/register" className="no-underline">
                <div>
                  <button className="px-14 py-8 text-white bg-black text-2xl"><h1 className="text-[36px]">Empezar</h1></button>
                  <button className="px-14 py-8 text-white bg-black bg-opacity-50 text-2xl"><h1 className="text-[36px]">Regístrate gratis</h1></button>
                </div>
              </Link>

              <div className="flex justify-end gap-4">
                {backgrounds.map((bg, i) => (
                  <button
                    key={bg.id}
                    onClick={() => setActive(i)}
                    className={`px-10 py-2 text-white bg-black text-2xl ${active === i ? '' : 'opacity-50'}`}
                    aria-pressed={active === i}
                    aria-label={`Ir a fondo ${i + 1}`}
                  >
                    <h1 className="text-[32px]">{i + 1}</h1>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default IntroPage;