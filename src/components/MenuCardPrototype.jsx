import React from 'react';

const MenuCardPrototype = ({ item, onAdd }) => {
  if (!item) return null;

  // Format price
  const formattedPrice = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(item.price);

  return (
    <div 
      onClick={() => onAdd && onAdd(item)}
      className="
        group relative flex-shrink-0
        w-[260px] h-[380px] md:w-[300px] md:h-[420px]
        rounded-[20px] overflow-hidden
        bg-[#1a1a1a]
        shadow-xl shadow-black/50
        cursor-pointer
        transition-all duration-400 ease-out
        hover:-translate-y-2 hover:shadow-2xl hover:shadow-red-900/20
      "
    >
      
      {/* Tags Floating Top Right */}
      <div className="absolute top-4 right-4 z-30 flex gap-2">
        {item.tags && item.tags.includes('Nuevo') && (
          <span className="bg-[#FFD700]/90 text-black px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm shadow-sm">
            NUEVO
          </span>
        )}
        {item.kcal && (
          <span className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm shadow-sm">
            {item.kcal} kcal
          </span>
        )}
      </div>

      {/* Image Layer */}
      <div className="absolute inset-0 z-10 w-full h-full">
        <img 
          src={item.image} 
          alt={item.name} 
          className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-110"
          loading="lazy"
        />
      </div>

      {/* Glassmorphism Overlay */}
      <div className="
        absolute bottom-0 left-0 z-20
        w-full h-full
        bg-gradient-to-t from-black/90 via-black/60 to-black/10
        group-hover:from-black/95 group-hover:via-black/70 group-hover:to-black/20
        group-hover:backdrop-blur-[2px]
        flex flex-col justify-end
        p-6
        transition-all duration-400
      ">
        
        {/* Header (Title & Price) */}
        <div className="transform translate-y-5 transition-transform duration-400 group-hover:translate-y-0">
          <h3 
            className="text-2xl text-white font-bold m-0 drop-shadow-md leading-tight"
            style={{ fontFamily: "'Playfair Display', serif" }} // O la fuente que prefieras
          >
            {item.name}
          </h3>
          <span className="block mt-1 text-xl text-[#FFD700] font-bold">
            {formattedPrice}
          </span>
        </div>

        {/* Hidden Details (Description & Button) */}
        <div className="
          max-h-0 opacity-0 overflow-hidden
          transition-all duration-400 ease-out
          group-hover:max-h-[150px] group-hover:opacity-100 group-hover:mt-4
        ">
          <p className="text-sm text-gray-300 mb-4 leading-relaxed line-clamp-3">
            {item.description}
          </p>
          <button className="
            w-full py-2 px-4
            bg-transparent border border-[#FFD700]
            text-[#FFD700] text-sm font-semibold uppercase tracking-wider
            rounded-full
            transition-all duration-300
            hover:bg-[#FFD700] hover:text-black hover:shadow-[0_0_15px_rgba(255,204,0,0.4)]
          ">
            Agregar al Carrito
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuCardPrototype;