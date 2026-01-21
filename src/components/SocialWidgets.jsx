import React from 'react';

const SocialWidgets = ({
  facebook = 'https://www.facebook.com/kebabcarta',
  instagram = 'https://www.instagram.com/kebabcarta',
  whatsapp = 'https://wa.me/573017186724',
}) => {
  
  // Estilo base unificado
  const linkClass = `
    flex items-center justify-center
    w-12 h-12
    bg-black/80
    !text-[#FFD700] 
    transition-all duration-300 ease-out
    hover:w-16 hover:!bg-[#FFD700] hover:!text-black hover:!bg-opacity-100
    cursor-pointer
    group
    relative
    !no-underline
    border-0
    overflow-hidden
  `;

  return (
    <div className="fixed left-0 top-1/2 -translate-y-1/2 z-40 flex flex-col rounded-r-2xl overflow-hidden">
      
      {/* Facebook */}
      {facebook && (
        <a 
          href={facebook} 
          target="_blank" 
          rel="noopener noreferrer"
          className={linkClass}
          aria-label="Facebook"
        >
          <i className="fab fa-facebook-f text-xl group-hover:scale-125 transition-transform duration-300"></i>
        </a>
      )}

      {/* Instagram */}
      {instagram && (
        <a 
          href={instagram} 
          target="_blank" 
          rel="noopener noreferrer"
          // Líneas divisorias sutiles internas (blancas muy transparentes, no amarillas)
          className={`${linkClass} border-t border-b border-white/10`} 
          aria-label="Instagram"
        >
          <i className="fab fa-instagram text-2xl group-hover:scale-125 transition-transform duration-300"></i>
        </a>
      )}

      {/* WhatsApp */}
      {whatsapp && (
        <a 
          href={whatsapp} 
          target="_blank" 
          rel="noopener noreferrer"
          className={linkClass}
          aria-label="WhatsApp"
        >
          <i className="fab fa-whatsapp text-2xl group-hover:scale-125 transition-transform duration-300"></i>
        </a>
      )}
    </div>
  );
};

export default SocialWidgets;
