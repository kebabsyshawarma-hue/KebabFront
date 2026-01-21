import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const STEPS = ['Pedido recibido', 'En preparación', 'En reparto', 'Entregado'];

const currencyFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});

const normalize = (value = '') =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const paymentLabels = {
  Paid: 'Pago aprobado',
  Pending: 'Pago pendiente',
  Declined: 'Pago rechazado',
};

const paymentColors = {
  Paid: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  Pending: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  Declined: 'bg-red-500/10 text-red-400 border-red-500/30',
};

export default function OrderStatusPage() {
  const [orderId, setOrderId] = useState('');
  const [orderStatus, setOrderStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSearch = async (event) => {
    event.preventDefault();

    if (!orderId.trim()) {
      setError('Por favor, ingresa un ID de orden.');
      return;
    }

    setLoading(true);
    setError(null);
    setOrderStatus(null);

    try {
      const response = await fetch(`/api/getOrderStatus?id=${encodeURIComponent(orderId.trim())}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Ocurrió un error al buscar la orden.');
      }

      setOrderStatus(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white py-12 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Estilo Kebab (Graffiti/Sticker) */}
        <header className="text-center mb-12">
          <div className="inline-block transform -rotate-1">
            <div className="bg-black border-4 border-[#FFD700] px-6 py-2 shadow-[6px_6px_0px_rgba(255,215,0,0.5)] mb-4">
              <h1 
                className="text-4xl md:text-5xl !text-[#FFD700] font-black uppercase tracking-widest leading-none m-0"
                style={{ fontFamily: "'Lalezar', cursive" }}
              >
                Rastrea tu orden
              </h1>
            </div>
            <p className="text-gray-400 text-sm md:text-base font-medium tracking-wide">
              Seguimiento en vivo para que sepas cuándo llega el sabor
            </p>
          </div>
        </header>

        {/* Buscador Premium */}
        <div className="bg-white/5 border border-white/10 p-8 rounded-3xl shadow-2xl backdrop-blur-sm mb-12">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow relative">
              <i className="bi bi-hash absolute left-4 top-1/2 -translate-y-1/2 text-[#FFD700] text-xl"></i>
              <input
                type="text"
                className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-[#FFD700]/50 outline-none transition-all placeholder:text-gray-600 text-lg"
                placeholder="Ingresa el ID (Ej. 500001)"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                disabled={loading}
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="bg-[#FFD700] hover:bg-yellow-500 text-black font-black px-10 py-4 rounded-2xl transition-all active:scale-95 disabled:opacity-50 uppercase tracking-widest"
            >
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
          </form>
          {error && (
            <div className="mt-4 text-red-400 text-sm flex items-center gap-2 animate-pulse">
              <i className="bi bi-exclamation-circle-fill"></i> {error}
            </div>
          )}
        </div>

        {/* Resultados de la Orden */}
        {orderStatus && (() => {
          const normalizedSteps = STEPS.map(normalize);
          const activeStepIndex = Math.max(
            normalizedSteps.indexOf(normalize(orderStatus.fulfillmentStatus || '')),
            0,
          );

          const paymentLabel = paymentLabels[orderStatus.status] || orderStatus.status || 'Estado desconocido';
          const paymentClass = paymentColors[orderStatus.status] || 'bg-white/10 text-white border-white/20';

          const createdAtDate = orderStatus.createdAt ? new Date(orderStatus.createdAt) : null;
          const createdAtLabel = createdAtDate
            ? createdAtDate.toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })
            : 'Fecha no disponible';

          return (
            <article className="animate-in fade-in slide-in-from-bottom-10 duration-700">
              <div className="bg-white/5 border border-white/10 p-6 md:p-10 rounded-3xl shadow-2xl backdrop-blur-sm relative overflow-hidden">
                
                {/* ID Badge Flotante */}
                <div className="absolute top-0 right-0 bg-[#FFD700] text-black px-6 py-2 rounded-bl-3xl font-black text-sm uppercase tracking-widest">
                  #{orderStatus.shortOrderId || orderId.trim()}
                </div>

                <div className="mb-10">
                  <h2 className="text-3xl font-bold text-white mb-2">Así va tu entrega</h2>
                  <div className="flex flex-wrap gap-3 mt-4">
                    <span className={`px-4 py-1 rounded-full text-xs font-bold border ${paymentClass}`}>
                      {paymentLabel}
                    </span>
                    <span className="px-4 py-1 rounded-full text-xs font-bold bg-white/10 text-white border border-white/20">
                      Total: {currencyFormatter.format(orderStatus.total || 0)}
                    </span>
                  </div>
                </div>

                {/* Timeline Premium */}
                <div className="mb-12">
                  <h3 className="text-xs uppercase tracking-[0.3em] text-gray-500 font-bold mb-8">Progreso del Pedido</h3>
                  <div className="relative">
                    {/* Línea de fondo */}
                    <div className="absolute top-5 left-5 right-5 h-0.5 bg-white/10 hidden md:block"></div>
                    
                    <div className="flex flex-col md:flex-row justify-between gap-8 relative">
                      {STEPS.map((step, index) => {
                        const isActive = index <= activeStepIndex;
                        const isCurrent = index === activeStepIndex;
                        
                        return (
                          <div key={step} className="flex md:flex-col items-center gap-4 md:gap-4 md:text-center flex-1">
                            {/* Punto de la línea */}
                            <div className={`
                              w-10 h-10 rounded-full flex items-center justify-center font-bold z-10 transition-all duration-500
                              ${isActive 
                                ? 'bg-[#FFD700] text-black shadow-[0_0_15px_rgba(255,215,0,0.5)]' 
                                : 'bg-neutral-800 text-gray-500 border border-white/10'}
                              ${isCurrent ? 'animate-pulse scale-110' : ''}
                            `}>
                              {index + 1}
                            </div>
                            {/* Etiqueta */}
                            <span className={`text-sm md:text-xs uppercase font-bold tracking-wider ${isActive ? 'text-white' : 'text-gray-600'}`}>
                              {step}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Detalles de la Orden */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-white/10 mb-10">
                  <div>
                    <span className="text-[10px] uppercase text-gray-500 font-bold block mb-1">Estado Actual</span>
                    <p className="text-[#FFD700] font-bold">{orderStatus.fulfillmentStatus || 'No disponible'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-gray-500 font-bold block mb-1">Fecha de Pedido</span>
                    <p className="text-white font-medium">{createdAtLabel}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-gray-500 font-bold block mb-1">Pago</span>
                    <p className="text-white font-medium uppercase text-xs">{orderStatus.paymentMethod || 'N/A'}</p>
                  </div>
                </div>

                {/* Resumen de Productos (Estilo Ticket) */}
                <div className="bg-black/40 rounded-2xl p-6 border border-white/5">
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <i className="bi bi-receipt text-[#FFD700]"></i> Resumen de productos
                  </h3>
                  <div className="space-y-4">
                    {Array.isArray(orderStatus.items) && orderStatus.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-start gap-4 pb-4 border-b border-white/5 last:border-0">
                        <div className="flex-1">
                          <p className="font-bold text-sm text-white">
                            <span className="text-[#FFD700]">x{item.quantity}</span> {item.name}
                          </p>
                          <p className="text-[10px] text-gray-500 italic mt-1">{item.description}</p>
                        </div>
                        <span className="font-bold text-sm text-gray-400">
                          {currencyFormatter.format((item.price || 0) * (item.quantity || 0))}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </article>
          );
        })()}

        {/* Footer de la página */}
        <div className="mt-12 flex flex-col items-center gap-8 pb-10">
          <Link 
            to="/" 
            className="group flex items-center gap-2 !text-gray-500 hover:!text-[#FFD700] transition-all !no-underline"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span> Volver al inicio
          </Link>
          
          <div className="opacity-40 hover:opacity-100 transition-opacity">
            <a href="https://limitlesscol.com" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center !no-underline grayscale hover:grayscale-0 transition-all group">
                <span className="text-[10px] !text-gray-500 mb-1 font-bold uppercase tracking-widest">Diseñado y Desarrollado por</span>
                <span className="!text-white font-black tracking-tighter text-xl leading-none group-hover:drop-shadow-[0_0_10px_rgba(0,112,243,0.5)]">LIMITLESS</span>
                <span className="!text-[#0070f3] text-[10px] font-bold tracking-[0.3em] uppercase group-hover:drop-shadow-[0_0_8px_rgba(0,112,243,0.3)]">SOLUTIONS</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}