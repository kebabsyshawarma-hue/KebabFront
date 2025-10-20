import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import styles from './AdminDashboard.module.css';

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const ordersCollection = collection(db, 'orders');
        const ordersSnapshot = await getDocs(ordersCollection);
        const data = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const normalizedOrders = data.map((order) => ({
          ...order,
          customerInfo: order.customerInfo || order.customerDetails,
          orderItems: order.orderItems || order.items,
        }));
        setOrders(normalizedOrders.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis()));
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  const handlePaymentStatusChange = async (orderId, newStatus) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status: newStatus });

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (e) {
      console.error('Error updating payment status:', e);
      alert(`Error al actualizar el estado del pago: ${e.message}`);
    }
  };

  const handleFulfillmentStatusChange = async (orderId, newStatus) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { fulfillmentStatus: newStatus });

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, fulfillmentStatus: newStatus } : order
        )
      );
    } catch (e) {
      console.error('Error updating fulfillment status:', e);
      alert(`Error al actualizar el estado del pedido: ${e.message}`);
    }
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  const filteredOrders = orders.filter((order) => {
    const customerName = order.customerInfo?.name || '';
    const customerPhone = order.customerInfo?.phone || '';
    const shortOrderId = order.shortOrderId || '';

    const matchesSearchTerm =
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerPhone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shortOrderId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'All' || order.fulfillmentStatus === statusFilter;

    return matchesSearchTerm && matchesStatus;
  });

  if (loading) {
    return <div className={`container py-5 text-center ${styles.dashboardContainer}`}>Cargando pedidos...</div>;
  }

  if (error) {
    return <div className={`container py-5 text-center text-danger ${styles.dashboardContainer}`}>Error al cargar pedidos: {error}</div>;
  }

  return (
    <div className={styles.dashboardContainer}>
      <h1 className={styles.dashboardTitle}>Panel de Administración - Pedidos</h1>

      <div className="row mb-3">
        <div className="col-md-6">
          <input
            type="text"
            className={`form-control ${styles.formControl}`}
            placeholder="Buscar por cliente, teléfono o ID de pedido..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <select
            className={`form-select ${styles.formSelect}`}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">Todos los Estados (Pedido)</option>
            <option value="Pedido recibido">Pedido recibido</option>
            <option value="En preparación">En preparación</option>
            <option value="En reparto">En reparto</option>
            <option value="Entregado">Entregado</option>
          </select>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <p>No hay pedidos que coincidan con los filtros.</p>
      ) : (
        <div className="table-responsive">
          <table className={`table ${styles.table}`}>
            <thead>
              <tr>
                <th>ID Pedido</th>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Teléfono</th>
                <th>Total</th>
                <th>Estado del Pago</th>
                <th>Estado del Pedido</th>
                <th>Acciones del Pedido</th>
                <th>Detalles</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td>{order.shortOrderId}</td>
                  <td>{order.createdAt?.toDate().toLocaleString('es-CO')}</td>
                  <td>{order.customerInfo?.name}</td>
                  <td>{order.customerInfo?.phone}</td>
                  <td>${order.total.toLocaleString('es-CO')}</td>
                  <td>
                    <select
                      className={`form-select form-select-sm ${styles.formSelect}`}
                      value={order.status}
                      onChange={(e) => handlePaymentStatusChange(order.id, e.target.value)}
                    >
                      <option value="Pending">Pendiente</option>
                      <option value="Paid">Pagado</option>
                      <option value="Declined">Denegado</option>
                    </select>
                  </td>
                  <td>{order.fulfillmentStatus || 'N/A'}</td>
                  <td>
                    <select
                      className={`form-select form-select-sm ${styles.formSelect}`}
                      value={order.fulfillmentStatus}
                      onChange={(e) => handleFulfillmentStatusChange(order.id, e.target.value)}
                    >
                      <option value="Pedido recibido">Pedido recibido</option>
                      <option value="En preparación">En preparación</option>
                      <option value="En reparto">En reparto</option>
                      <option value="Entregado">Entregado</option>
                    </select>
                  </td>
                  <td>
                    <button
                      className={`btn btn-sm ${styles.btnInfo}`}
                      onClick={() => handleViewDetails(order)}
                    >
                      Ver
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedOrder && (
        <div className={`modal fade ${showModal ? 'show' : ''}`} style={{ display: showModal ? 'block' : 'none' }} tabIndex="-1" aria-labelledby="orderDetailsModalLabel" aria-hidden={!showModal}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className={`modal-content ${styles.modalContent}`}>
              <div className={`modal-header ${styles.modalHeader}`}>
                <h5 className={`modal-title ${styles.modalTitle}`} id="orderDetailsModalLabel">Detalles del Pedido #{selectedOrder.shortOrderId}</h5>
                <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={handleCloseModal}></button>
              </div>
              <div className={`modal-body ${styles.modalBody}`}>
                <h6>Cliente: {selectedOrder.customerInfo?.name}</h6>
                <p>Email: {selectedOrder.customerInfo?.email}</p>
                <p>Teléfono: {selectedOrder.customerInfo?.phone}</p>
                <p>Dirección: {selectedOrder.customerInfo?.address}</p>
                <hr />
                <p><strong>Método de Pago:</strong> {selectedOrder.paymentMethod}</p>
                <p><strong>Estado del Pago:</strong> {selectedOrder.status}</p>
                <p><strong>Estado del Pedido:</strong> {selectedOrder.fulfillmentStatus}</p>
                <p><strong>Fecha:</strong> {selectedOrder.createdAt?.toDate().toLocaleString('es-CO')}</p>
                {selectedOrder.wompiTransactionId && <p><strong>Wompi ID:</strong> {selectedOrder.wompiTransactionId}</p>}
                <hr />
                <h6>Items del Pedido:</h6>
                <ul className="list-group mb-3">
                  {selectedOrder.orderItems.map((item, index) => (
                    <li key={index} className={`list-group-item d-flex justify-content-between align-items-center ${styles.listGroupItem}`}>
                      {item.name} (x{item.quantity})
                      <span>${item.price.toLocaleString('es-CO')}</span>
                    </li>
                  ))}
                </ul>
                <h5>Total: ${selectedOrder.total.toLocaleString('es-CO')}</h5>
              </div>
              <div className={`modal-footer ${styles.modalFooter}`}>
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Cerrar</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showModal && <div className="modal-backdrop fade show"></div>}
    </div>
  );
}