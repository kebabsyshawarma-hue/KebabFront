import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext.jsx'; // Adjusted path
import styles from '../../styles/checkout.module.css'; // Adjusted path



export default function CheckoutPage() {
  const { cart, total, clearCart, decreaseQuantity, increaseQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();

  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    email: '',
    address: '',
    phone: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('cash'); // 'cash', 'transfer', or 'wompi'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Remove any lingering Bootstrap modal backdrops
    const backdrops = document.querySelectorAll('.modal-backdrop, .offcanvas-backdrop');
    backdrops.forEach(backdrop => backdrop.remove());

    const script = document.createElement('script');
    script.src = 'https://checkout.wompi.co/widget.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
      document.body.style.overflow = 'auto'; // Ensure body overflow is reset
    };
  }, []);

  useEffect(() => {
    if (cart.length === 0 && !isSubmitting) {
      navigate('/'); // Redirect to home if cart is empty and not submitting
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

  const handleWompiPayment = async (orderId) => { // Changed orderId type to string
    if (typeof window.WidgetCheckout === 'undefined') {
      setError('El widget de Wompi no se ha cargado correctamente. Por favor, recarga la página.');
      setIsSubmitting(false);
      return;
    }

    try {
      const reference = `kebab_${orderId}`;
      // TODO: Replace with Firebase Function URL
      const response = await fetch('http://127.0.0.1:5001/demo-no-project/us-central1/getWompiSignature', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reference, amount: total }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al generar la firma de pago.');
      }

      const { signature } = await response.json();

      const checkout = new window.WidgetCheckout({
        currency: 'COP',
        amountInCents: total * 100,
        reference: reference,
        publicKey: import.meta.env.VITE_WOMPI_PUBLIC_KEY,
        signature: { integrity: signature },
        redirectUrl: `${window.location.origin}/checkout/success`,
        customerData: {
          email: customerDetails.email,
          fullName: customerDetails.name,
          phoneNumber: customerDetails.phone,
          phoneNumberPrefix: '+57',
        },
      });

      checkout.open(async function (result) {
        const transaction = result.transaction;
        const newStatus = transaction.status === 'APPROVED' ? 'APPROVED' : 'DECLINED';

        console.log('Wompi transaction result:', transaction);
        console.log(`Attempting to update order ${orderId} with status: ${newStatus}`);

        // Update order status in the backend
        try {
          // TODO: Replace with Firebase Function URL
          const updateResponse = await fetch('http://127.0.0.1:5001/demo-no-project/us-central1/updateOrderStatus', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: orderId, status: newStatus }),
          });

          if (!updateResponse.ok) {
            const errorData = await updateResponse.json();
            console.error('Error updating order status in backend:', errorData);
            throw new Error(errorData.message || 'Error al actualizar el estado del pedido.');
          }
          console.log('Order status updated successfully in backend.');
        } catch (updateError) {
          console.error('Failed to send order status update PATCH request:', updateError);
          // Decide if you want to show this error to the user or just log it
        }

        if (transaction.status === 'APPROVED') {
          clearCart();
          navigate('/checkout/success');
        } else {
          navigate('/checkout/rejected');
        }
      });

    } catch (err) {
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
      const order = {
        customerDetails,
        items: cart,
        total,
        paymentMethod,
        status: paymentMethod === 'wompi' ? 'Pending' : 'Pending',
        orderDate: new Date().toISOString(),
      };

      // TODO: Replace with Firebase Function URL
      const response = await fetch('http://127.0.0.1:5001/demo-no-project/us-central1/addOrder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(order),
      });

      if (!response.ok) {
        throw new Error(`Error al procesar el pedido: ${response.statusText}`);
      }

      const createdOrder = await response.json();

      if (paymentMethod === 'wompi') {
        await handleWompiPayment(createdOrder.order.id);
        return;
      }

      clearCart(); // Clear cart after successful order
      navigate('/checkout/success'); // Redirect to success page

    } catch (err) {
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
          {/* Columna Izquierda: Formulario de Contacto */}
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
                  rows={2} // Reduced rows
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
                    Wompi
                  </label>
                </div>
              </div>

              <button type="submit" className="btn btn-lg rounded-pill w-100 mt-2" style={{ backgroundColor: '#A52A2A', borderColor: '#A52A2A', color: 'var(--foreground)' }} disabled={isSubmitting}>
                {isSubmitting ? 'Procesando...' : 'Realizar Pedido'}
              </button>
            </form>
          </div>

          {/* Columna Derecha: Resumen del Pedido */}
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