import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All', 'Pending', 'Approved', etc.

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
        setOrders(normalizedOrders);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status: newStatus });

      // Update the local state to reflect the change
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (e) {
      console.error('Error updating order status:', e);
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
    const matchesSearchTerm =
      order.customerInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerInfo.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'All' || order.status === statusFilter;

    return matchesSearchTerm && matchesStatus;
  });

  if (loading) {
    return <div className="container py-5 text-center">Cargando pedidos...</div>;
  }

  if (error) {
    return <div className="container py-5 text-center text-danger">Error al cargar pedidos: {error}</div>;
  }

  return (
    <div className="container py-5">
      <h1 className="mb-4">Panel de Administración - Pedidos</h1>
      <div className="mb-4"></div> {/* This div is now empty after removing the button */}

      {/* Filter Controls */}
      <div className="row mb-3">
        <div className="col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="Buscar por cliente, teléfono o ID de pedido..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">Todos los Estados</option>
            <option value="Pending">Pendiente</option>
            <option value="Approved">Aprobado</option>
            <option value="Declined">Denegado</option>
            <option value="Delivered">Entregado</option>
            <option value="Cancelled">Cancelado</option>
          </select>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <p>No hay pedidos que coincidan con los filtros.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Teléfono</th>
                <th>Dirección</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Acciones</th>
                <th>Detalles del Pedido</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td>{order.createdAt?.toDate().toLocaleString()}</td>
                  <td>{order.customerInfo.name}</td>
                  <td>{order.customerInfo.phone}</td>
                  <td>{order.customerInfo.address}</td>
                  <td>${order.total.toLocaleString('es-CO')}</td>
                  <td>{order.status}</td>
                  <td>
                    <select
                      className="form-select form-select-sm"
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    >
                      <option value="Pending">Pendiente</option>
                      <option value="Approved">Aprobado</option>
                      <option value="Declined">Denegado</option>
                      <option value="Delivered">Entregado</option>
                      <option value="Cancelled">Cancelado</option>
                    </select>
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-info"
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

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className={`modal fade ${showModal ? 'show' : ''}`} style={{ display: showModal ? 'block' : 'none' }} tabIndex="-1" aria-labelledby="orderDetailsModalLabel" aria-hidden={!showModal}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="orderDetailsModalLabel">Detalles del Pedido #{selectedOrder.id}</h5>
                <button type="button" className="btn-close" aria-label="Close" onClick={handleCloseModal}></button>
              </div>
              <div className="modal-body">
                <h6>Cliente: {selectedOrder.customerInfo.name}</h6>
                <p>Email: {selectedOrder.customerInfo.email}</p>
                <p>Teléfono: {selectedOrder.customerInfo.phone}</p>
                <p>Dirección: {selectedOrder.customerInfo.address}</p>
                <p>Método de Pago: {selectedOrder.paymentMethod}</p>
                <p>Estado: {selectedOrder.status}</p>
                <p>Fecha: {selectedOrder.createdAt?.toDate().toLocaleString()}</p>
                <hr />
                <h6>Items del Pedido:</h6>
                <ul className="list-group mb-3">
                  {selectedOrder.orderItems.map((item, index) => (
                    <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                      {item.name} (x{item.quantity})
                      <span>${item.price.toLocaleString('es-CO')}</span>
                    </li>
                  ))}
                </ul>
                <h5>Total: ${selectedOrder.total.toLocaleString('es-CO')}</h5>
              </div>
              <div className="modal-footer">
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