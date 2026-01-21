import { Link } from 'react-router-dom';

export default function ContactAndFooter() {
  return (
    <>
      <section id="contact" className="py-20 bg-black text-white relative overflow-hidden">
        {/* Decoración de fondo sutil */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-black via-[#FFD700] to-black opacity-50"></div>

        <div className="container mx-auto px-6 max-w-7xl">
          
          {/* Título Estilo Urbano */}
          <div className="text-center mb-12">
            <h2 
              className="text-5xl md:text-6xl text-[#FFD700] uppercase tracking-wide drop-shadow-[0_4px_0px_rgba(255,255,255,0.1)]"
              style={{ fontFamily: "'Lalezar', cursive" }}
            >
              Visítanos
            </h2>
            <div className="h-1 w-24 bg-[#FFD700] mx-auto mt-2 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Mapa con estilo Premium */}
            <div className="w-full h-[350px] md:h-[450px] rounded-3xl overflow-hidden border-2 border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)] relative group">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7848.209822191761!2d-75.54225763448196!3d10.413241896246179!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8ef62f706f79aabd%3A0xb8b79d80dd00aa4d!2sKebab%20y%20Shawarma!5e0!3m2!1sen!2sco!4v1760994571888!5m2!1sen!2sco"
                title="Ubicación de Kebab y Shawarma"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full grayscale-[50%] group-hover:grayscale-0 transition-all duration-700"
                style={{ border: 0 }}
              ></iframe>
              {/* Overlay dorado al hover */}
              <div className="absolute inset-0 border-4 border-[#FFD700] rounded-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none"></div>
            </div>

            {/* Información de Contacto */}
            <div className="flex flex-col justify-center space-y-8 p-6 md:p-10 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm">
              <div>
                <h4 
                  className="text-3xl text-white mb-6 uppercase"
                  style={{ fontFamily: "'Lalezar', cursive" }}
                >
                  Horario de <span className="text-[#FFD700]">Atención</span>
                </h4>
                
                <ul className="space-y-4 text-lg">
                  <li className="flex items-start justify-between border-b border-white/10 pb-2">
                    <span className="font-bold text-gray-300 flex items-center gap-2">
                      <i className="fas fa-clock text-[#FFD700]"></i> Lunes - Jueves
                    </span>
                    <span className="text-[#FFD700] font-mono">12:00 PM - 10:00 PM</span>
                  </li>
                  <li className="flex items-start justify-between border-b border-white/10 pb-2">
                    <span className="font-bold text-gray-300 flex items-center gap-2">
                      <i className="fas fa-fire text-[#FFD700]"></i> Viernes - Sábado
                    </span>
                    <span className="text-[#FFD700] font-mono">12:00 PM - 12:00 AM</span>
                  </li>
                  <li className="flex items-start justify-between border-b border-white/10 pb-2">
                    <span className="font-bold text-gray-300 flex items-center gap-2">
                      <i className="fas fa-sun text-[#FFD700]"></i> Domingo
                    </span>
                    <span className="text-[#FFD700] font-mono">12:00 PM - 9:00 PM</span>
                  </li>
                </ul>
              </div>

              <div className="mt-4 p-4 bg-[#FFD700]/10 rounded-xl border border-[#FFD700]/30 text-center">
                <p className="text-gray-300 italic text-sm md:text-base">
                  "¡Te esperamos para que disfrutes del mejor kebab de la ciudad! Ingredientes frescos y la mejor salsa de la casa."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Minimalista & Branding */}
      <footer className="py-10 bg-[#050505] text-white border-t border-white/5">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            
            {/* IZQUIERDA: Kebab Cartagena */}
            <p className="text-gray-600 text-sm m-0">
              &copy; 2025 <span className="text-[#FFD700] font-bold">Kebab Cartagena</span>. Todos los derechos reservados.
            </p>
            
            {/* DERECHA: Limitless Solutions */}
            <div>
              <a 
                href="https://limitlesscol.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex flex-col items-center md:items-end !no-underline group grayscale hover:grayscale-0 transition-all duration-500"
              >
                <span className="text-[9px] !text-gray-500 mb-1 font-bold uppercase tracking-[0.2em] transition-colors group-hover:!text-gray-400">
                  Diseñado y Desarrollado por
                </span>
                <div className="flex flex-col items-center md:items-end leading-tight">
                  <span className="!text-white font-black tracking-tighter text-lg group-hover:drop-shadow-[0_0_10px_rgba(0,112,243,0.5)] transition-all">
                    LIMITLESS
                  </span>
                  <span className="!text-[#0070f3] text-[10px] font-bold tracking-[0.3em] uppercase group-hover:drop-shadow-[0_0_8px_rgba(0,112,243,0.3)]">
                    SOLUTIONS
                  </span>
                </div>
              </a>
            </div>

          </div>
        </div>
      </footer>
    </>
  );
}