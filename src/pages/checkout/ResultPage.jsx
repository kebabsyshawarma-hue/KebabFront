import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { useCart } from '../../context/CartContext';

export default function ResultPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [status, setStatus] = useState('processing');
  const [error, setError] = useState(null);

  useEffect(() => {
    const transactionId = searchParams.get('id');

    if (!transactionId) {
      setError('No se encontró un ID de transacción.');
      setStatus('error');
      return;
    }

    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, where('wompiTransactionId', '==', transactionId));

    const checkStatus = async () => {
      try {
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          return false; // Order not found yet, webhook might be delayed
        }

        const orderDoc = querySnapshot.docs[0];
        const orderData = orderDoc.data();

        if (orderData.status === 'Approved' || orderData.status === 'APPROVED') {
          clearCart();
          navigate('/checkout/success');
          return true;
        } else if (orderData.status === 'Declined' || orderData.status === 'DECLINED' || orderData.status === 'ERROR') {
          navigate('/checkout/rejected');
          return true;
        }
        return false; // Status is still pending
      } catch (err) {
        setError('Error al verificar el estado del pedido: ' + err.message);
        setStatus('error');
        return true; // Stop polling on error
      }
    };

    const pollForStatus = async () => {
      for (let i = 0; i < 10; i++) { // Poll for 10 seconds (10 attempts, 1 second apart)
        const found = await checkStatus();
        if (found) {
          return;
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      setError('No se pudo confirmar el estado del pago. Por favor, contacta a soporte.');
      setStatus('error');
    };

    pollForStatus();

  }, [searchParams, navigate, clearCart]);

  return (
    <div className="container py-5 text-center">
      {status === 'processing' && (
        <div>
          <h1>Procesando tu pago...</h1>
          <p>Por favor, espera un momento mientras confirmamos la transacción.</p>
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}
      {status === 'error' && (
        <div>
          <h1>Error</h1>
          <p className="text-danger">{error}</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>Volver al inicio</button>
        </div>
      )}
    </div>
  );
}
