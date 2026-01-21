import React, { useEffect } from 'react';
import { useCart } from '../context/CartContext';

export default function MenuModal({ item, onClose }) {
  const { addToCart } = useCart();

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  if (!item) return null;

  const handleAddToCart = () => {
    addToCart(item);
    onClose();
  };

  const formattedPrice = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(item.price || 0);

  return (
    <div 
      className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div 
        className="
          bg-[#1a1a1a] w-full max-w-4xl rounded-[32px] overflow-hidden 
          flex flex-col md:flex-row shadow-2xl border border-white/10
          animate-in zoom-in-95 duration-300
        " 
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Left Side: Image */}
        <div className="w-full md:w-1/2 h-64 md:h-auto relative overflow-hidden">
          <img 
            src={item.image} 
            alt={item.name} 
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" 
          />
          {/* Mobile Close Button */}
          <button 
            className="md:hidden absolute top-4 right-4 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center text-2xl border-0 cursor-pointer"
            onClick={onClose}
          >
            &times;
          </button>
        </div>

        {/* Right Side: Content */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center relative">
          
          {/* Desktop Close Button */}
          <button 
            className="hidden md:flex absolute top-6 right-6 w-10 h-10 text-gray-500 hover:text-white transition-colors items-center justify-center text-3xl bg-transparent border-0 cursor-pointer" 
            onClick={onClose}
          >
            &times;
          </button>
          
          <div className="mb-6">
            <h2 className="text-4xl font-black text-white mb-2 leading-none" style={{ fontFamily: "'Lalezar', cursive" }}>{item.name}</h2>
            <span className="text-2xl font-bold text-[#FFD700]">{formattedPrice}</span>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {item.kcal && (
              <span className="bg-orange-500/10 text-orange-400 border border-orange-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                🔥 {item.kcal} kcal
              </span>
            )}
            {item.tags && item.tags.map(tag => (
               <span key={tag} className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                 {tag}
               </span>
            ))}
          </div>

          <p className="text-gray-400 text-lg leading-relaxed mb-10">
            {item.description || "Disfruta de este delicioso plato preparado con los mejores ingredientes y el auténtico toque Kebab."}
          </p>

          <button 
            className="
              w-full py-5 bg-[#FFD700] hover:bg-yellow-500 text-black font-black text-xl rounded-2xl 
              transition-all transform active:scale-95 shadow-xl shadow-[#FFD700]/20 uppercase tracking-widest
              border-0 cursor-pointer
            "
            onClick={handleAddToCart}
          >
            Agregar al Carrito
          </button>
        </div>

      </div>
    </div>
  );
}
