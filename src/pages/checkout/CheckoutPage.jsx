import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext.jsx';
import styles from '../../styles/checkout.module.css';
import { db } from '../../firebase.js';
import { runTransaction, collection, doc, serverTimestamp } from 'firebase/firestore';
import AddressMap from '../../components/AddressMap.jsx';
import { DELIVERY_ZONES, findZoneByNeighborhood } from '../../data/deliveryZones.js';

// --- Constants ---
// DELIVERY_ZONES moved to src/data/deliveryZones.js

export default function CheckoutPage() {
  const { cart, total, subtotal, deliveryFee, setDeliveryFee, clearCart, decreaseQuantity, increaseQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();

  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    email: '',
    address: '', 
    addressDetails: '', // Torre, Apto, etc.
    phone: '',
    zone: '' // Store selected zone ID
  });
  const [paymentMethod, setPaymentMethod] = useState('transfer');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showMap, setShowMap] = useState(false); // New state for map visibility

  useEffect(() => {
    // 1. Cleanup backdrops
    const backdrops = document.querySelectorAll('.modal-backdrop, .offcanvas-backdrop');
    backdrops.forEach(backdrop => backdrop.remove());

    // 2. Load Wompi Widget
    const wompiScript = document.createElement('script');
    wompiScript.src = 'https://checkout.wompi.co/widget.js';
    wompiScript.async = true;
    document.body.appendChild(wompiScript);

    return () => {
      document.body.removeChild(wompiScript);
      document.body.style.overflow = 'auto';
      // Reset delivery fee on unmount
      setDeliveryFee(0);
    };
  }, []);

  const handleLocationSelect = (locationData) => {
    const { address, neighborhood, rawAddress } = locationData;
    
    // Update address field with the formatted address from OSM
    // We truncate if it's too long or just use it as is.
    setCustomerDetails(prev => ({
      ...prev,
      address: address
    }));

    // Try to auto-select zone
    let foundZone = findZoneByNeighborhood(neighborhood);
    
    // Fallback: check other address fields
    if (!foundZone && rawAddress) {
       const searchString = `${rawAddress.suburb || ''} ${rawAddress.neighbourhood || ''} ${rawAddress.village || ''} ${rawAddress.residential || ''}`;
       foundZone = findZoneByNeighborhood(searchString);
    }

    if (foundZone) {
      setCustomerDetails(prev => ({
        ...prev,
        zone: foundZone.id
      }));
      setDeliveryFee(foundZone.fee);
    } else {
       // Zone not found automatically
       // We don't reset zone if they already picked one manually to avoid annoyance,
       // unless the new address is definitely different. 
       // For now, let's just alert them visually via the UI state (zone selector value).
    }
  };

  const handleZoneChange = (e) => {
    const zoneId = e.target.value;
    const zone = DELIVERY_ZONES.find(z => z.id === zoneId);
    
    setCustomerDetails(prev => ({
      ...prev,
      zone: zoneId
    }));

    if (zone) {
      setDeliveryFee(zone.fee);
    } else {
      setDeliveryFee(0);
    }
  };

  useEffect(() => {
    if (cart.length === 0 && !isSubmitting) {
      navigate('/');
    }
  }, [cart, isSubmitting, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCustomerDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handlePaymentChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  const handleWompiPayment = async (orderId) => {
    if (typeof window.WidgetCheckout === 'undefined') {
      setError('El widget de Wompi no se ha cargado correctamente. Por favor, recarga la página.');
      setIsSubmitting(false);
      return;
    }

    try {
      const reference = `kebab_${orderId}`;
      const response = await fetch('/api/getWompiSignature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference, amount: total }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Error al generar la firma de pago.');
      }

      const { signature } = responseData;

      const checkout = new window.WidgetCheckout({
        currency: 'COP',
        amountInCents: total * 100,
        reference: reference,
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

      checkout.open(function (result) {
        if (result.transaction.status === 'APPROVED') {
          clearCart();
          navigate('/checkout/success');
        } else {
          navigate('/checkout/rejected');
        }
      });

    } catch (err) {
      console.error('Error in handleWompiPayment:', err);
      setError(err.message || 'Ocurrió un error al procesar el pago con Wompi.');
      setIsSubmitting(false);
    }
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

    if (customerDetails.zone !== 'pickup' && !customerDetails.address) {
      setError('Por favor, ingresa una dirección de entrega.');
      setIsSubmitting(false);
      return;
    }

    // Combine address with details
    const fullAddress = customerDetails.zone === 'pickup' 
      ? 'Recogida en Local' 
      : `${customerDetails.address} ${customerDetails.addressDetails ? `(${customerDetails.addressDetails})` : ''}`;

    try {
      // Run a transaction to get the next order ID and create the order
      const newOrderRef = await runTransaction(db, async (transaction) => {
        const counterRef = doc(db, 'counters', 'orders');
        const counterDoc = await transaction.get(counterRef);

        let newId = 1;
        if (counterDoc.exists()) {
          newId = counterDoc.data().lastId + 1;
          transaction.update(counterRef, { lastId: newId });
        } else {
            transaction.set(counterRef, { lastId: 1 });
        }

        const orderPayload = {
          shortOrderId: newId.toString(),
          customerDetails: { ...customerDetails, address: fullAddress },
          items: cart,
          subtotal,
          deliveryFee,
          total,
          paymentMethod,
          status: 'Pending',
          fulfillmentStatus: 'Pedido recibido',
          createdAt: serverTimestamp(),
          zoneName: DELIVERY_ZONES.find(z => z.id === customerDetails.zone)?.name || 'N/A'
        };

        // Create the new order document with a generated ID
        const newOrderDocRef = doc(collection(db, "orders"));
        transaction.set(newOrderDocRef, orderPayload);
        return newOrderDocRef;
      });

      console.log("Order created successfully with ID: ", newOrderRef.id);

      if (paymentMethod === 'wompi') {
        await handleWompiPayment(newOrderRef.id);
        return;
      }

      clearCart();
      navigate('/checkout/success');

    } catch (err) {
      console.error("Transaction failed: ", err);
      setError(err.message || 'Ocurrió un error al realizar el pedido.');
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className={`py-4 ${styles.checkoutContainer} hide-social-widgets`}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h1 className={`fw-bold ${styles.checkoutH1}`} style={{ fontFamily: 'var(--font-playfair-display)' }}>Finalizar Pedido</h1>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate('/')}>Volver al Menú</button>
        </div>

        {error && <div className="alert alert-danger py-2" role="alert">{error}</div>}
        
        <div className="row g-3">
          <div className="col-md-6">
            <h2 className={`mb-3 ${styles.checkoutH2}`} style={{ fontFamily: 'var(--font-playfair-display)' }}>Tus Datos</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-floating mb-2">
                <input
                  type="text"
                  className={`form-control ${styles.formControl}`}
                  id="name"
                  name="name"
                  placeholder="Nombre Completo"
                  value={customerDetails.name}
                  onChange={handleChange}
                  required
                />
                <label htmlFor="name">Nombre Completo</label>
              </div>
              <div className="form-floating mb-3">
                <input
                  type="tel"
                  className={`form-control ${styles.formControl}`}
                  id="phone"
                  name="phone"
                  placeholder="Teléfono"
                  value={customerDetails.phone}
                  onChange={handleChange}
                  required
                />
                <label htmlFor="phone">Teléfono</label>
              </div>
              <div className="form-floating mb-2">
                <input
                  type="email"
                  className={`form-control ${styles.formControl}`}
                  id="email"
                  name="email"
                  placeholder="Correo Electrónico"
                  value={customerDetails.email}
                  onChange={handleChange}
                  required
                />
                <label htmlFor="email">Correo Electrónico</label>
              </div>
              
              {/* Address Map Toggle */}
              <div className="mb-3">
                <button 
                  type="button" 
                  className="btn btn-outline-warning btn-sm w-100"
                  onClick={() => setShowMap(!showMap)}
                >
                  <i className={`bi ${showMap ? 'bi-map-fill' : 'bi-map'}`}></i> {showMap ? 'Ocultar Mapa' : 'Buscar mi dirección en el mapa'}
                </button>
              </div>

              {showMap && (
                <div className="mb-3">
                  <AddressMap onLocationSelect={handleLocationSelect} />
                </div>
              )}

              {/* Zone Section */}
              <div className="form-floating mb-2">
                <select
                  className={`form-select ${styles.formControl}`}
                  id="zone"
                  name="zone"
                  value={customerDetails.zone}
                  onChange={handleZoneChange}
                  required
                >
                  <option value="">Selecciona tu zona / barrio...</option>
                  {DELIVERY_ZONES.map(zone => (
                    <option key={zone.id} value={zone.id}>
                      {zone.name} (${zone.fee.toLocaleString('es-CO')})
                    </option>
                  ))}
                </select>
                <label htmlFor="zone">Barrio / Sector</label>
              </div>

              <div className="form-floating mb-2">
                <input
                  type="text"
                  className={`form-control ${styles.formControl}`}
                  id="address"
                  name="address"
                  placeholder="Calle, Carrera, etc."
                  value={customerDetails.address}
                  onChange={handleChange}
                  required
                  disabled={customerDetails.zone === 'pickup'}
                />
                <label htmlFor="address">{customerDetails.zone === 'pickup' ? 'No aplica para recogida' : 'Dirección (Calle, Carrera, etc.)'}</label>
              </div>
              <div className="form-floating mb-2">
                <input
                    type="text"
                    className={`form-control ${styles.formControl}`}
                    id="addressDetails"
                    name="addressDetails"
                    placeholder="Torre, Apto, Barrio, etc."
                    value={customerDetails.addressDetails}
                    onChange={handleChange}
                    disabled={customerDetails.zone === 'pickup'}
                />
                <label htmlFor="addressDetails">Detalles (Torre, Apto, Casa, etc.)</label>
              </div>


              <h2 className={`mb-2 mt-3 ${styles.checkoutH2}`} style={{ fontFamily: 'var(--font-playfair-display)' }}>Método de Pago</h2>
              <div className="mb-3">
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="paymentMethod"
                    id="paymentTransfer"
                    value="transfer"
                    checked={paymentMethod === 'transfer'}
                    onChange={handlePaymentChange}
                  />
                  <label className="form-check-label" htmlFor="paymentTransfer">
                    Transferencia
                  </label>
                </div>
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="paymentMethod"
                    id="paymentWompi"
                    value="wompi"
                    checked={paymentMethod === 'wompi'}
                    onChange={handlePaymentChange}
                  />
                  <label className="form-check-label" htmlFor="paymentWompi">
                    Pagar con Tarjeta o PSE (Wompi)
                  </label>
                </div>
              </div>

              {paymentMethod === 'transfer' && (
                <div className="card mb-3 bg-dark border-warning" style={{ border: '1px solid #FFD700' }}>
                  <div className="card-body text-light">
                    <h6 className="card-title text-warning mb-3">Información Bancaria para Transferencia</h6>
                    <div className="mb-2">
                      <small className="text-muted d-block">Banco:</small>
                      <span className="fw-bold">BANCOLOMBIA</span>
                    </div>
                    <div className="mb-2">
                      <small className="text-muted d-block">Nombre / Titular:</small>
                      <span className="fw-bold">KEBABS & SHAWARMA</span>
                    </div>
                    <div className="mb-2">
                      <small className="text-muted d-block">NIT:</small>
                      <span className="fw-bold">123.456.789-0</span>
                    </div>
                    <div className="mb-2">
                      <small className="text-muted d-block">Tipo de Cuenta:</small>
                      <span className="fw-bold">Ahorros</span>
                    </div>
                    <div className="mb-2 d-flex justify-content-between align-items-center">
                      <div>
                        <small className="text-muted d-block">Número de Cuenta:</small>
                        <span className="fw-bold fs-5">000-000000-00</span>
                      </div>
                      <button 
                        type="button" 
                        className="btn btn-sm btn-outline-warning"
                        onClick={() => {
                          navigator.clipboard.writeText('000-000000-00');
                          alert('Número de cuenta copiado');
                        }}
                      >
                        Copiar
                      </button>
                    </div>
                    <div className="mt-3 p-2 bg-warning text-dark rounded" style={{ fontSize: '0.85rem' }}>
                      <i className="bi bi-info-circle-fill me-2"></i>
                      Por favor, envía el comprobante de pago por WhatsApp después de finalizar el pedido.
                    </div>
                  </div>
                </div>
              )}

              <button type="submit" className="btn btn-lg rounded-pill w-100 mt-2" style={{ backgroundColor: '#A52A2A', borderColor: '#A52A2A', color: 'var(--foreground)' }} disabled={isSubmitting}>
                {isSubmitting ? 'Procesando...' : `Pagar $${total.toLocaleString('es-CO')}`}
              </button>
            </form>
          </div>

          <div className={`col-md-6 ${styles.orderSummary}`}>
            <h2 className={`mb-3 ${styles.checkoutH2}`} style={{ fontFamily: 'var(--font-playfair-display)' }}>Tu Pedido</h2>
            {cart.length === 0 ? (
              <p>No hay productos en el carrito.</p>
            ) : (
              <ul className="list-group mb-3">
                {cart.map((item) => (
                  <li key={item.id} className={`list-group-item d-flex justify-content-between lh-sm align-items-center ${styles.checkoutListItem}`}>
                    <div>
                      <h6 className={`my-0 ${styles.itemNameCheckout}`}>{item.name}</h6>
                      <small className={`text-muted ${styles.itemDescriptionCheckout}`}>{item.description}</small>
                      <div className="d-flex align-items-center mt-1">
                        <button className="btn btn-sm btn-outline-secondary me-1 rounded-pill" onClick={() => decreaseQuantity(item.id)}>-</button>
                        <small className="text-muted">{item.quantity}</small>
                        <button className="btn btn-sm btn-outline-secondary ms-1 rounded-pill" onClick={() => increaseQuantity(item.id)}>+</button>
                        <button className="btn btn-sm btn-danger ms-2 rounded-pill" onClick={() => removeFromCart(item.id)}>X</button>
                      </div>
                    </div>
                    <span className="text-muted">${(item.price * item.quantity).toLocaleString('es-CO')}</span>
                  </li>
                ))}
                
                {/* Summary Section */}
                <li className="list-group-item d-flex justify-content-between">
                  <span>Subtotal</span>
                  <strong>${subtotal.toLocaleString('es-CO')}</strong>
                </li>
                <li className="list-group-item d-flex justify-content-between text-success">
                  <span>Domicilio {customerDetails.zone ? `(${DELIVERY_ZONES.find(z => z.id === customerDetails.zone)?.name})` : ''}</span>
                  <strong>${deliveryFee.toLocaleString('es-CO')}</strong>
                </li>
                <li className="list-group-item d-flex justify-content-between fw-bold fs-5">
                  <span>Total</span>
                  <strong>${total.toLocaleString('es-CO')}</strong>
                </li>
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
}