import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function RejectedPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Optional: Clear any lingering cart data if needed, though it should be handled by the checkout page
    // const { clearCart } = useCart();
    // clearCart();
  }, []);

  return (
    <div className="container py-5 text-center">
      <h1 className="mb-4 text-danger">¡Transacción Rechazada!</h1>
      <p className="lead">Lo sentimos, tu pago no pudo ser procesado.</p>
      <p>Por favor, intenta con otro método de pago o verifica los datos de tu tarjeta.</p>
      <button className="btn btn-primary mt-3" onClick={() => navigate('/')}>
        Volver al Inicio
      </button>
      <button className="btn btn-outline-secondary mt-3 ms-2" onClick={() => navigate('/checkout')}>
        Intentar de Nuevo
      </button>
    </div>
  );
}
