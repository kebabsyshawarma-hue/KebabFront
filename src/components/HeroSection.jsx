import { useState, useEffect } from 'react';

export default function HeroSection({ heroSlides, isMobile, isScrolled }) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Filtrar slides según dispositivo
  const filteredHeroSlides = heroSlides.filter(slide => 
    isMobile ? slide.type === 'vertical' : slide.type === 'horizontal'
  );

  // Auto-play del carrusel (5 segundos)
  useEffect(() => {
    if (filteredHeroSlides.length <= 1) return; // No rotar si solo hay 1

    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % filteredHeroSlides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [filteredHeroSlides.length]);

  // Manejadores manuales
  const nextSlide = () => setActiveIndex((current) => (current + 1) % filteredHeroSlides.length);
  const prevSlide = () => setActiveIndex((current) => (current - 1 + filteredHeroSlides.length) % filteredHeroSlides.length);
  const goToSlide = (index) => setActiveIndex(index);

  if (filteredHeroSlides.length === 0) return null;

  return (
    <header 
      id="heroSection" 
      className={`relative h-screen w-full overflow-hidden bg-black transition-opacity duration-500 ${isScrolled ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
    >
      {/* Importar fuente Lalezar (Estilo Árabe Pop/Graffiti) */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lalezar&display=swap');
      `}</style>

      {/* Slides */}
      {filteredHeroSlides.map((slide, index) => (
        <div 
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === activeIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
        >
          {/* Imagen de fondo */}
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-[10000ms] ease-linear"
            style={{ 
              backgroundImage: `url(${slide.image})`,
              transform: index === activeIndex ? 'scale(1.1)' : 'scale(1.0)' // Efecto Ken Burns sutil
            }}
          />
          
          {/* Overlay oscuro más sutil (Solo lo necesario para legibilidad) */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        </div>
      ))}

      {/* Contenido (Texto) - Centrado y fijo, cambia con el slide activo */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-end pb-36 md:pb-28 text-center px-4">
        {filteredHeroSlides.map((slide, index) => (
           <div 
             key={`content-${slide.id}`}
             className={`transition-all duration-1000 transform absolute bottom-36 w-full max-w-5xl px-4 ${index === activeIndex ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`}
           >
             <div className="relative inline-block transform hover:rotate-0 transition-transform duration-500 cursor-default">
               
               {/* Título: ESTILO STICKER (Fondo Negro, Texto Dorado) */}
               <div className="transform -rotate-2 mx-auto w-fit bg-black border-4 border-[#FFD700] px-5 py-2 shadow-[6px_6px_0px_rgba(255,215,0,0.5)] mb-4 z-20 relative">
                 <h1 
                   className="text-2xl md:text-4xl lg:text-5xl !text-[#FFD700] font-black tracking-widest uppercase m-0 leading-none"
                   style={{ fontFamily: "'Lalezar', cursive" }}
                 >
                   {slide.title}
                 </h1>
               </div>

               {/* Subtítulo: ESTILO GRAFFITI (Texto Blanco, Borde Negro, Sombra Negra) */}
               <div className="transform rotate-1 z-10">
                 <p 
                   className="text-xl md:text-2xl lg:text-3xl !text-[#FFFBEB] leading-none tracking-tight drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]"
                   style={{ 
                     fontFamily: "'Lalezar', cursive",
                     WebkitTextStroke: '2px black' 
                   }}
                 >
                   {slide.subtitle}
                 </p>
               </div>

             </div>
           </div>
        ))}
      </div>

      {/* Indicadores (Puntos) */}
      <div className="absolute bottom-10 left-0 right-0 z-30 flex justify-center gap-3">
        {filteredHeroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 border border-white/50 ${index === activeIndex ? 'bg-[#FFD700] w-8' : 'bg-transparent hover:bg-white/50'}`}
            aria-label={`Ir a slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Flechas de Control (Solo Desktop opcional, o sutil en móvil) */}
      {filteredHeroSlides.length > 1 && (
        <>
          <button 
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full text-white/50 hover:text-[#FFD700] hover:bg-black/20 transition-all hidden md:block"
          >
            <i className="fas fa-chevron-left text-3xl"></i>
          </button>
          <button 
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full text-white/50 hover:text-[#FFD700] hover:bg-black/20 transition-all hidden md:block"
          >
            <i className="fas fa-chevron-right text-3xl"></i>
          </button>
        </>
      )}

      {/* Scroll Down Indicator */}
      {!isScrolled && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 animate-bounce text-white/70">
          <i className="fas fa-chevron-down text-xl"></i>
        </div>
      )}
    </header>
  );
}
