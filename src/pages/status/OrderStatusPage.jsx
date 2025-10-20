import { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './OrderStatusPage.module.css';

export default function OrderStatusPage() {
  const [orderId, setOrderId] = useState('');
  const [orderStatus, setOrderStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!orderId.trim()) {
      setError('Por favor, ingresa un ID de orden.');
      return;
    }

    setLoading(true);
    setError(null);
    setOrderStatus(null);

    try {
      const response = await fetch(`/api/getOrderStatus?id=${orderId.trim()}`);
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
    <div className={styles.orderStatusContainer}>
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="text-center mb-4">
              <h1 className="fw-bold" style={{ fontFamily: 'var(--font-playfair-display)', color: '#ffcc00' }}>Consulta tu Orden</h1>
              <p className="text-muted">Ingresa el ID de tu orden para ver el estado actual.</p>
            </div>

            <form onSubmit={handleSearch} className="mb-4">
              <div className="input-group">
                <input
                  type="text"
                  className={`form-control form-control-lg ${styles.formControl}`}
                  placeholder="Ej: 500001"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  disabled={loading}
                />
                <button className={`btn ${styles.btnPrimary}`} type="submit" disabled={loading}>
                  {loading ? 'Buscando...' : 'Buscar'}
                </button>
              </div>
            </form>

            {error && <div className={`alert ${styles.alertDanger}`}>{error}</div>}

            {orderStatus && (
              <div className={`card ${styles.card}`}>
                <div className={`card-header ${styles.cardHeader}`}>
                  <h5 className="mb-0">Resumen del Pedido #{orderStatus.shortOrderId}</h5>
                </div>
                <div className="card-body">
                  <p><strong>Estado del Pago:</strong> <span className={`fw-bold ${orderStatus.status === 'Paid' ? 'text-success' : 'text-warning'}`}>{orderStatus.status}</span></p>
                  <p><strong>Estado del Pedido:</strong> <span className="fw-bold">{orderStatus.fulfillmentStatus}</span></p>
                  <p><strong>Fecha:</strong> {new Date(orderStatus.createdAt).toLocaleString('es-CO')}</p>
                  <p><strong>Total:</strong> ${orderStatus.total.toLocaleString('es-CO')}</p>
                  <h6 className="mt-4">Items:</h6>
                  <ul className="list-group">
                    {orderStatus.items.map((item, index) => (
                      <li key={index} className={`list-group-item d-flex justify-content-between align-items-center ${styles.listGroupItem}`}>
                        {item.name} (x{item.quantity})
                        <span>${(item.price * item.quantity).toLocaleString('es-CO')}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <div className="text-center mt-4">
              <Link to="/" className={styles.link}>Volver al inicio</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
