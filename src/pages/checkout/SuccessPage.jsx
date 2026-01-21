import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';

function SuccessContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  // Get data from either Wompi redirect (searchParams) or direct navigation state
  const queryTransactionId = searchParams.get('id');
  const transactionId = queryTransactionId || location.state?.transactionId;
  const paymentMethod = location.state?.paymentMethod || (queryTransactionId ? 'wompi' : 'unknown');
  const orderId = location.state?.orderId;
  const total = location.state?.total;

  const handleWhatsAppClick = () => {
    const message = `Hola, acabo de realizar el pedido #${orderId || 'reciente'}. Adjunto el comprobante de transferencia por valor de $${total?.toLocaleString('es-CO')}.`;
    const url = `https://wa.me/573017186724?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="w-full max-w-2xl bg-[#111] border border-white/10 rounded-3xl p-8 md:p-12 text-center shadow-2xl relative overflow-hidden">
        
        {/* Decorative Background */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-gold to-yellow-600"></div>
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-gold/10 rounded-full blur-3xl"></div>

        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-in zoom-in duration-500">
          <i className="bi bi-check-lg text-4xl text-green-500"></i>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
          ¡Pedido Recibido!
        </h1>
        
        <p className="text-gray-400 text-lg mb-8">
          {paymentMethod === 'transfer' 
            ? 'Tu orden ha sido creada. Por favor completa el pago para procesarla.' 
            : 'Tu pago ha sido procesado con éxito y hemos recibido tu orden.'}
        </p>

        {/* Order ID Card - High Visibility */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
           <p className="text-xs text-gold uppercase tracking-widest mb-2 font-black">Número de tu Pedido</p>
           <p className="text-5xl font-black text-white tracking-tighter" style={{ fontFamily: 'Playfair Display, serif' }}>
             #{orderId || '---'}
           </p>
           <p className="text-xs text-gray-500 mt-3 italic">Usa este número para rastrear tu pedido en la sección "Rastrear mi pedido"</p>
           
           <button 
              onClick={() => navigate('/status')}
              className="mt-4 text-[#FFD700] hover:text-white text-sm font-bold underline flex items-center justify-center gap-2 mx-auto"
           >
             <i className="bi bi-geo-alt"></i> Ir a Rastrear mi Pedido
           </button>
        </div>

        {/* Transfer Instructions */}
        {paymentMethod === 'transfer' && (
          <div className="bg-white/5 border border-gold/30 rounded-2xl p-6 mb-8 text-left animate-in slide-in-from-bottom duration-500">
            <h3 className="text-gold font-bold mb-4 flex items-center gap-2">
              <i className="bi bi-bank"></i> Datos para Transferencia
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-white/5">
                <span className="text-gray-400 text-sm">Banco</span>
                <span className="font-bold text-white">Bancolombia Ahorros</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-white/5">
                <span className="text-gray-400 text-sm">Titular</span>
                <span className="font-bold text-white">Johanna Ordosgoitia</span>
              </div>
              <div>
                 <span className="text-gray-400 text-sm block mb-1">Número de Cuenta</span>
                 <div className="flex items-center gap-3 bg-black/30 p-3 rounded-xl border border-white/5">
                    <span className="text-xl font-mono font-bold text-gold tracking-widest flex-1 text-center">
                      08676692895
                    </span>
                    <button 
                      onClick={() => { navigator.clipboard.writeText('08676692895'); alert('Copiado'); }}
                      className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                      title="Copiar número"
                    >
                      <i className="bi bi-clipboard"></i>
                    </button>
                 </div>
              </div>
            </div>

            <div className="mt-6">
              <button 
                onClick={handleWhatsAppClick}
                className="w-full py-3 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-900/20"
              >
                <i className="bi bi-whatsapp text-xl"></i>
                Enviar Comprobante al WhatsApp
              </button>
              <p className="text-center text-[10px] text-gray-500 mt-2">
                Es necesario enviar el comprobante para confirmar tu pedido.
              </p>
            </div>
          </div>
        )}

        {/* Transaction ID for Wompi */}
        {transactionId && (
          <div className="bg-white/5 p-4 rounded-xl mb-8">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">ID Transacción</p>
            <p className="font-mono text-gold font-bold">{transactionId}</p>
          </div>
        )}

        <button 
          className="px-8 py-3 rounded-full border border-white/10 text-white hover:bg-white/5 transition-all"
          onClick={() => navigate('/')}
        >
          Volver al Inicio
        </button>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-32 pb-20 px-4">
      <SuccessContent />
    </div>
  );
}