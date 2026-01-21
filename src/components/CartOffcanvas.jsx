import { useEffect } from 'react';
import { useCart } from '../context/CartContext.jsx';
import { useNavigate } from 'react-router-dom';

export default function CartOffcanvas({ handleProceedToCheckout }) {
  const { cart, increaseQuantity, decreaseQuantity, removeFromCart, total, isCartOpen, closeCart } = useCart();
  const navigate = useNavigate();

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') closeCart();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [closeCart]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isCartOpen]);

  const onCheckout = () => {
      closeCart();
      if (handleProceedToCheckout) {
          handleProceedToCheckout();
      } else {
          navigate('/checkout');
      }
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] transition-opacity duration-300 ${isCartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={closeCart}
      />

      {/* Sidebar */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-[#111] border-l border-white/10 z-[70] transform transition-transform duration-300 shadow-2xl flex flex-col ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <i className="bi bi-cart-fill text-[#FFD700]"></i> Tu Carrito
          </h2>
          <button 
            onClick={closeCart}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4 opacity-60">
              <i className="bi bi-cart-x text-6xl"></i>
              <p className="text-lg font-medium">El carrito está vacío</p>
              <button onClick={closeCart} className="text-[#FFD700] hover:underline text-sm">
                Volver al menú
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="bg-white/5 border border-white/5 p-4 rounded-xl flex gap-4 group hover:border-white/10 transition-colors">
                {/* Image Placeholder or Item Icon */}
                <div className="w-16 h-16 rounded-lg bg-black/50 flex-shrink-0 overflow-hidden">
                   {item.image ? (
                     <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center text-gray-600">
                       <i className="bi bi-image"></i>
                     </div>
                   )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-white font-bold text-sm truncate pr-2">{item.name}</h3>
                    <span className="text-[#FFD700] font-mono text-sm">${(item.price * item.quantity).toLocaleString('es-CO')}</span>
                  </div>
                  
                  <p className="text-gray-500 text-xs mb-3 line-clamp-1">{item.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center bg-black rounded-lg border border-white/10 h-8">
                      <button 
                        onClick={() => decreaseQuantity(item.id)} 
                        className="w-8 h-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 rounded-l-lg transition-colors"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-white">{item.quantity}</span>
                      <button 
                        onClick={() => increaseQuantity(item.id)} 
                        className="w-8 h-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 rounded-r-lg transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500/60 hover:text-red-500 transition-colors p-1"
                      title="Eliminar"
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-6 border-t border-white/10 bg-[#0a0a0a]">
            <div className="flex justify-between items-center mb-6">
              <span className="text-gray-400 text-sm">Total a pagar</span>
              <span className="text-2xl font-black text-white">${total.toLocaleString('es-CO')}</span>
            </div>
            
            <button 
              onClick={onCheckout}
              className="w-full py-4 bg-[#FFD700] hover:bg-yellow-400 text-black font-black text-lg rounded-xl transition-all shadow-lg shadow-yellow-900/20 flex items-center justify-center gap-2"
            >
              <span>Ir a Pagar</span>
              <i className="bi bi-arrow-right"></i>
            </button>
          </div>
        )}
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </>
  );
}
