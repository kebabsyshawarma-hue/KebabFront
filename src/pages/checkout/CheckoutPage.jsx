import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext.jsx';
import styles from '../../styles/checkout.module.css';
import { db } from '../../firebase.js';
import { runTransaction, collection, doc, serverTimestamp } from 'firebase/firestore';

export default function CheckoutPage() {
  const { cart, total, clearCart, decreaseQuantity, increaseQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();

  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    email: '',
    address: '',
    phone: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const backdrops = document.querySelectorAll('.modal-backdrop, .offcanvas-backdrop');
    backdrops.forEach(backdrop => backdrop.remove());

    const script = document.createElement('script');
    script.src = 'https://checkout.wompi.co/widget.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
      document.body.style.overflow = 'auto';
    };
  }, []);

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

    if (!customerDetails.name || !customerDetails.address || !customerDetails.phone || !customerDetails.email) {
      setError('Por favor, completa todos los campos de contacto.');
      setIsSubmitting(false);
      return;
    }

    try {
      // Run a transaction to get the next order ID and create the order
      const newOrderRef = await runTransaction(db, async (transaction) => {
        const counterRef = doc(db, 'counters', 'orders');
        const counterDoc = await transaction.get(counterRef);

        if (!counterDoc.exists()) {
          throw new Error("Counter document does not exist!");
        }

        const newId = counterDoc.data().lastId + 1;
        transaction.update(counterRef, { lastId: newId });

        const orderPayload = {
          shortOrderId: newId.toString(),
          customerDetails,
          items: cart,
          total,
          paymentMethod,
          status: 'Pending',
          fulfillmentStatus: 'Pedido recibido',
          createdAt: serverTimestamp(),
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
              <div className="form-floating mb-2">
                <textarea
                  className={`form-control ${styles.formControl}`}
                  id="address"
                  name="address"
                  placeholder="Dirección de Envío"
                  value={customerDetails.address}
                  onChange={handleChange}
                  rows={2}
                  required
                  style={{ height: 'auto' }}
                ></textarea>
                <label htmlFor="address">Dirección de Envío</label>
              </div>

              <h2 className={`mb-2 mt-3 ${styles.checkoutH2}`} style={{ fontFamily: 'var(--font-playfair-display)' }}>Método de Pago</h2>
              <div className="mb-3">
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="paymentMethod"
                    id="paymentCash"
                    value="cash"
                    checked={paymentMethod === 'cash'}
                    onChange={handlePaymentChange}
                  />
                  <label className="form-check-label" htmlFor="paymentCash">
                    Efectivo
                  </label>
                </div>
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
                    Pagar con Tarjeta o PSE
                  </label>
                </div>
              </div>

              <button type="submit" className="btn btn-lg rounded-pill w-100 mt-2" style={{ backgroundColor: '#A52A2A', borderColor: '#A52A2A', color: 'var(--foreground)' }} disabled={isSubmitting}>
                {isSubmitting ? 'Procesando...' : 'Realizar Pedido'}
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
                <li className="list-group-item d-flex justify-content-between fw-bold">
                  <span>Total (COP)</span>
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