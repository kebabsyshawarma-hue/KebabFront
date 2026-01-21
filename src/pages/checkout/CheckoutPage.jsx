import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext.jsx';
import { db } from '../../firebase.js';
import { runTransaction, collection, doc, serverTimestamp, getDocs } from 'firebase/firestore';
import AddressMap from '../../components/AddressMap.jsx';
import { findZoneByNeighborhood, getZoneByDistance } from '../../utils/deliveryUtils.js';

export default function CheckoutPage() {
  const { cart, total, subtotal, deliveryFee, setDeliveryFee, clearCart, decreaseQuantity, increaseQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();

  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    email: '',
    address: '', 
    addressDetails: '',
    phone: '',
    zone: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('transfer');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [zones, setZones] = useState([]);

  useEffect(() => {
    const fetchZones = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'deliveryZones'));
        const zonesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Sort zones: Pickup usually last or specific order. For now, maybe by fee or name?
        // Let's sort by fee to show cheapest first, or just keep order.
        // If 'pickup' should be last or first, we can handle it.
        // Let's put 'pickup' at the end or begining.
        zonesData.sort((a, b) => a.fee - b.fee);
        setZones(zonesData);
      } catch (err) {
        console.error("Error fetching zones:", err);
      }
    };
    fetchZones();
  }, []);

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);

    // Ensure scrolling is enabled (fix for potential stuck overflow: hidden)
    document.body.style.overflow = 'auto';
    document.body.classList.remove('modal-open', 'offcanvas-open');

    const backdrops = document.querySelectorAll('.modal-backdrop, .offcanvas-backdrop');
    backdrops.forEach(backdrop => backdrop.remove());

    const wompiScript = document.createElement('script');
    wompiScript.src = 'https://checkout.wompi.co/widget.js';
    wompiScript.async = true;
    document.body.appendChild(wompiScript);

    return () => {
      document.body.removeChild(wompiScript);
      document.body.style.overflow = 'auto';
      setDeliveryFee(0);
    };
  }, []);

  const handleLocationSelect = (locationData) => {
    const { lat, lng, address, neighborhood, rawAddress } = locationData;
    setCustomerDetails(prev => ({ ...prev, address }));

    let foundZone = findZoneByNeighborhood(neighborhood, zones);
    if (!foundZone && rawAddress) {
       const searchString = `${rawAddress.suburb || ''} ${rawAddress.neighbourhood || ''} ${rawAddress.village || ''} ${rawAddress.residential || ''} ${rawAddress.city_district || ''}`;
       foundZone = findZoneByNeighborhood(searchString, zones);
    }
    if (!foundZone) {
      foundZone = getZoneByDistance(lat, lng, zones);
    }

    if (foundZone) {
      setCustomerDetails(prev => ({ ...prev, zone: foundZone.id }));
      setDeliveryFee(foundZone.fee);
    }
  };

  const handleZoneChange = (e) => {
    const zoneId = e.target.value;
    const zone = zones.find(z => z.id === zoneId);
    setCustomerDetails(prev => ({ ...prev, zone: zoneId }));
    setDeliveryFee(zone ? zone.fee : 0);
  };

  useEffect(() => {
    if (cart.length === 0 && !isSubmitting) {
      navigate('/');
    }
  }, [cart, isSubmitting, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCustomerDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (cart.length === 0) {
      setError('El carrito está vacío.');
      setIsSubmitting(false);
      return;
    }

    if (!customerDetails.name || !customerDetails.phone || !customerDetails.email || !customerDetails.zone) {
      setError('Por favor, completa todos los campos obligatorios y selecciona una zona.');
      setIsSubmitting(false);
      return;
    }

    const fullAddress = customerDetails.zone === 'pickup' 
      ? 'Recogida en Local' 
      : `${customerDetails.address} ${customerDetails.addressDetails ? `(${customerDetails.addressDetails})` : ''}`;

    try {
      const { newOrderRef, shortOrderId } = await runTransaction(db, async (transaction) => {
        const counterRef = doc(db, 'counters', 'orders');
        const counterDoc = await transaction.get(counterRef);
        let newId = counterDoc.exists() ? counterDoc.data().lastId + 1 : 1;
        transaction.set(counterRef, { lastId: newId }, { merge: true });

        const sId = newId.toString();

        const orderPayload = {
          shortOrderId: sId,
          customerDetails: { ...customerDetails, address: fullAddress },
          items: cart,
          subtotal,
          deliveryFee,
          total,
          paymentMethod,
          status: 'Pending',
          fulfillmentStatus: 'Pedido recibido',
          createdAt: serverTimestamp(),
          zoneName: zones.find(z => z.id === customerDetails.zone)?.name || 'N/A'
        };

        const newOrderDocRef = doc(collection(db, "orders"));
        transaction.set(newOrderDocRef, orderPayload);
        return { newOrderRef: newOrderDocRef, shortOrderId: sId };
      });

      if (paymentMethod === 'wompi') {
        handleWompiPayment(newOrderRef.id, shortOrderId);
        return;
      }

      clearCart();
      navigate('/checkout/success', { state: { paymentMethod, orderId: shortOrderId, total } });
    } catch (err) {
      setError(err.message || 'Error al realizar el pedido.');
      setIsSubmitting(false);
    }
  };

  const handleWompiPayment = async (orderId, shortOrderId) => {
    try {
      const reference = `kebab_${orderId}`;
      const response = await fetch('/api/getWompiSignature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference, amount: total }),
      });
      const { signature } = await response.json();
      const checkout = new window.WidgetCheckout({
        currency: 'COP',
        amountInCents: total * 100,
        reference,
        publicKey: import.meta.env.VITE_WOMPI_PUBLIC_KEY,
        signature: { integrity: signature },
        redirectUrl: `${window.location.origin}/checkout/result`,
        customerData: {
          email: customerDetails.email,
          fullName: customerDetails.name,
          phoneNumber: customerDetails.phone,
          phoneNumberPrefix: '+57',
        },
      });
      checkout.open((result) => {
        if (result.transaction.status === 'APPROVED') {
          clearCart();
          navigate('/checkout/success', { state: { paymentMethod: 'wompi', orderId: shortOrderId, total, transactionId: result.transaction.id } });
        } else {
          navigate('/checkout/rejected');
        }
      });
    } catch (err) {
      setError('Error en el pago.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-10 hide-social-widgets">
      <div className="max-w-7xl mx-auto">
        
        {/* Header con estilo Glassmorphism */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gold to-yellow-200" style={{ fontFamily: 'Playfair Display, serif' }}>
              Finalizar Pedido
            </h1>
            <p className="text-gray-400 mt-2 text-lg">Estás a un paso de disfrutar del mejor Kebab.</p>
          </div>
          <button 
            onClick={() => navigate('/')}
            className="group flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all duration-300 backdrop-blur-md"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span> Volver al Menú
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-5 rounded-2xl mb-8 flex items-center animate-pulse">
             <i className="bi bi-exclamation-octagon-fill text-2xl me-3"></i> 
             <span className="font-semibold">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
          
          {/* Columna Izquierda: Formulario (2/3 en desktop) */}
          <div className="xl:col-span-2 space-y-8">
            
            {/* Sección: Datos Personales */}
            <section className="bg-white/5 border border-white/10 p-8 rounded-3xl shadow-2xl backdrop-blur-sm">
              <h2 className="text-2xl font-bold mb-8 text-gold flex items-center gap-3">
                <span className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center text-gold">1</span>
                Tus Datos de Contacto
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-400 ml-1">Nombre Completo</label>
                  <input type="text" name="name" value={customerDetails.name} onChange={handleChange} required 
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 focus:ring-2 focus:ring-gold/50 outline-none transition-all placeholder:text-gray-600" 
                    placeholder="Ej: Camilo Torres" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-400 ml-1">WhatsApp / Teléfono</label>
                  <input type="tel" name="phone" value={customerDetails.phone} onChange={handleChange} required 
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 focus:ring-2 focus:ring-gold/50 outline-none transition-all placeholder:text-gray-600" 
                    placeholder="300 000 0000" />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-semibold text-gray-400 ml-1">Correo Electrónico (Para tu factura)</label>
                  <input type="email" name="email" value={customerDetails.email} onChange={handleChange} required 
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 focus:ring-2 focus:ring-gold/50 outline-none transition-all placeholder:text-gray-600" 
                    placeholder="tu@correo.com" />
                </div>
              </div>
            </section>

            {/* Sección: Ubicación y Entrega */}
            <section className="bg-white/5 border border-white/10 p-8 rounded-3xl shadow-2xl backdrop-blur-sm">
              <h2 className="text-2xl font-bold mb-8 text-gold flex items-center gap-3">
                <span className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center text-gold">2</span>
                ¿A dónde lo enviamos?
              </h2>

              <div className="mb-8">
                <button 
                  type="button" 
                  onClick={() => setShowMap(!showMap)}
                  className={`w-full py-4 rounded-2xl border transition-all duration-500 flex items-center justify-center gap-3 font-bold text-lg shadow-inner
                    ${showMap ? 'bg-white/10 border-white/20 text-white' : 'bg-gold border-gold text-black hover:bg-yellow-500'}`}
                >
                  <i className={`bi ${showMap ? 'bi-x-circle' : 'bi-geo-alt-fill'} text-xl`}></i> 
                  {showMap ? 'Cerrar Mapa' : 'Pinchar mi ubicación en el mapa'}
                </button>
                
                {showMap && (
                  <div className="mt-6 rounded-2xl overflow-hidden border border-white/10 shadow-2xl animate-in fade-in zoom-in duration-300">
                    <AddressMap onLocationSelect={handleLocationSelect} />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-400 ml-1">Barrio / Sector</label>
                  <div className="relative">
                    <select name="zone" value={customerDetails.zone} onChange={handleZoneChange} required 
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 focus:ring-2 focus:ring-gold/50 outline-none appearance-none cursor-pointer">
                      <option value="">Seleccionar zona...</option>
                      {zones.map(z => (
                        <option key={z.id} value={z.id} className="bg-neutral-900">{z.name}</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gold">
                      <i className="bi bi-chevron-down"></i>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-400 ml-1">Dirección Exacta</label>
                  <input type="text" name="address" value={customerDetails.address} onChange={handleChange} required 
                    disabled={customerDetails.zone === 'pickup'} 
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 focus:ring-2 focus:ring-gold/50 outline-none transition-all disabled:opacity-30 placeholder:text-gray-600" 
                    placeholder="Ej: Calle 31 #15-20" />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-semibold text-gray-400 ml-1">¿Alguna indicación? (Opcional)</label>
                  <input type="text" name="addressDetails" value={customerDetails.addressDetails} onChange={handleChange} 
                    disabled={customerDetails.zone === 'pickup'} 
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 focus:ring-2 focus:ring-gold/50 outline-none transition-all disabled:opacity-30 placeholder:text-gray-600" 
                    placeholder="Casa verde, al lado de la tienda, torre y apto..." />
                </div>
              </div>
            </section>

            {/* Sección: Método de Pago */}
            <section className="bg-white/5 border border-white/10 p-8 rounded-3xl shadow-2xl backdrop-blur-sm">
              <h2 className="text-2xl font-bold mb-8 text-gold flex items-center gap-3">
                <span className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center text-gold">3</span>
                Método de Pago
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <button 
                  type="button" 
                  onClick={() => setPaymentMethod('transfer')}
                  className={`relative p-6 rounded-2xl border transition-all duration-300 group overflow-hidden ${paymentMethod === 'transfer' ? 'border-gold bg-gold/10 ring-1 ring-gold' : 'border-white/10 bg-black/20 hover:border-white/30'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${paymentMethod === 'transfer' ? 'bg-gold text-black' : 'bg-white/5 text-gray-400'}`}>
                      <i className="bi bi-bank"></i>
                    </div>
                    <div className="text-left">
                      <p className={`font-bold ${paymentMethod === 'transfer' ? 'text-gold' : 'text-white'}`}>Transferencia</p>
                      <p className="text-xs text-gray-500">Bancolombia / Nequi</p>
                    </div>
                  </div>
                  {paymentMethod === 'transfer' && <div className="absolute top-2 right-2 text-gold"><i className="bi bi-check-circle-fill"></i></div>}
                </button>

                <button 
                  type="button" 
                  onClick={() => setPaymentMethod('wompi')}
                  className={`relative p-6 rounded-2xl border transition-all duration-300 group overflow-hidden ${paymentMethod === 'wompi' ? 'border-gold bg-gold/10 ring-1 ring-gold' : 'border-white/10 bg-black/20 hover:border-white/30'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${paymentMethod === 'wompi' ? 'bg-gold text-black' : 'bg-white/5 text-gray-400'}`}>
                      <i className="bi bi-credit-card"></i>
                    </div>
                    <div className="text-left">
                      <p className={`font-bold ${paymentMethod === 'wompi' ? 'text-gold' : 'text-white'}`}>Tarjeta / PSE</p>
                      <p className="text-xs text-gray-500">Wompi Seguro</p>
                    </div>
                  </div>
                  {paymentMethod === 'wompi' && <div className="absolute top-2 right-2 text-gold"><i className="bi bi-check-circle-fill"></i></div>}
                </button>
              </div>

              {/* Bank details removed from here, will be shown in SuccessPage */}
            </section>
          </div>

          {/* Columna Derecha: Resumen de Compra (Sticky) */}
          <div className="xl:col-span-1">
            <div className="sticky top-10 space-y-6">
              <div className="bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] border border-white/10 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-3xl -z-10 rounded-full"></div>
                
                <h2 className="text-2xl font-bold mb-8 text-gold flex items-center justify-between">
                  Tu Carrito
                  <span className="bg-gold text-black text-xs px-2 py-1 rounded-full font-black">{cart.length}</span>
                </h2>

                <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                  {cart.map((item) => (
                    <div key={item.id} className="group relative bg-white/5 border border-white/5 p-4 rounded-2xl hover:bg-white/10 transition-all">
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-sm text-white group-hover:text-gold transition-colors">{item.name}</h3>
                          <div className="flex items-center gap-4 mt-3">
                            <div className="flex items-center bg-black/50 rounded-lg border border-white/10 px-1 py-1">
                              <button onClick={() => decreaseQuantity(item.id)} className="w-6 h-6 flex items-center justify-center hover:text-gold transition-colors">-</button>
                              <span className="text-xs font-bold w-6 text-center">{item.quantity}</span>
                              <button onClick={() => increaseQuantity(item.id)} className="w-6 h-6 flex items-center justify-center hover:text-gold transition-colors">+</button>
                            </div>
                            <button onClick={() => removeFromCart(item.id)} className="text-[10px] text-red-500/70 hover:text-red-500 uppercase font-bold tracking-tighter">Quitar</button>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm text-white">${(item.price * item.quantity).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-10 pt-8 border-t border-white/10 space-y-4">
                  <div className="flex justify-between text-gray-400 font-medium">
                    <span>Subtotal</span>
                    <span>${subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-400 font-medium">
                    <span>Domicilio</span>
                    <span className={deliveryFee > 0 ? 'text-white' : 'text-green-500 font-bold bg-green-500/10 px-2 py-1 rounded-lg text-xs uppercase'}>
                      {deliveryFee > 0 ? `+ $${deliveryFee.toLocaleString()}` : '¡Gratis!'}
                    </span>
                  </div>
                  
                  <div className="pt-6 border-t border-white/10">
                    <div className="flex justify-between items-end">
                      <div className="text-left">
                        <p className="text-[10px] text-gold uppercase font-black tracking-widest mb-1">Total a Pagar</p>
                        <p className="text-4xl font-black text-white leading-none">${total.toLocaleString()}</p>
                      </div>
                      <img src="/images/kebablogo.png" alt="Logo" className="h-10 opacity-20" />
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full mt-10 py-5 bg-gradient-to-r from-gold to-yellow-500 text-black font-black text-xl rounded-2xl transition-all duration-300 transform hover:scale-[1.03] active:scale-95 shadow-2xl shadow-gold/20 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
                      Procesando...
                    </span>
                  ) : (
                    'Realizar Pedido'
                  )}
                </button>
                
                <p className="text-center text-[10px] text-gray-500 mt-6 uppercase tracking-widest font-bold flex items-center justify-center gap-2">
                  <i className="bi bi-shield-lock-fill text-gold"></i> Pago 100% Seguro
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
      
      {/* Estilos adicionales para scrollbars y fuentes */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 215, 0, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 215, 0, 0.4);
        }
      `}</style>
    </div>
  );
}