import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';

// --- Theme & Styles ---
const theme = {
  bg: '#121212',
  surface: '#1E1E1E',
  border: '#333333',
  primary: '#FFD700', // Gold
  secondary: '#FF4444',
  text: '#E0E0E0',
  textMuted: '#A0A0A0',
  success: '#00C851',
  warning: '#FFBB33',
  info: '#33b5e5',
  danger: '#ff4444',
  accentGradient: 'linear-gradient(45deg, #FFD700, #FFA500)',
};

const styles = {
  container: {
    backgroundColor: theme.bg,
    color: theme.text,
    minHeight: '100vh',
    padding: '2rem',
    fontFamily: "'Inter', sans-serif",
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    background: theme.accentGradient,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '1.5rem',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem',
  },
  statCard: {
    backgroundColor: theme.surface,
    border: `1px solid ${theme.border}`,
    borderRadius: '12px',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: theme.primary,
  },
  statLabel: {
    color: theme.textMuted,
    fontSize: '0.9rem',
    marginTop: '0.2rem',
  },
  filterContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1rem',
    marginBottom: '1.5rem',
    backgroundColor: theme.surface,
    padding: '1rem',
    borderRadius: '12px',
    border: `1px solid ${theme.border}`,
  },
  input: {
    backgroundColor: '#2A2A2A',
    border: `1px solid ${theme.border}`,
    color: theme.text,
    padding: '0.6rem 1rem',
    borderRadius: '8px',
    outline: 'none',
    minWidth: '250px',
  },
  select: {
    backgroundColor: '#2A2A2A',
    border: `1px solid ${theme.border}`,
    color: theme.text,
    padding: '0.6rem 1rem',
    borderRadius: '8px',
    outline: 'none',
    cursor: 'pointer',
  },
  tableContainer: {
    backgroundColor: theme.surface,
    borderRadius: '12px',
    border: `1px solid ${theme.border}`,
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    backgroundColor: '#252525',
    color: theme.textMuted,
    fontWeight: '600',
    padding: '1rem',
    textAlign: 'left',
    fontSize: '0.9rem',
    borderBottom: `1px solid ${theme.border}`,
  },
  td: {
    padding: '1rem',
    borderBottom: `1px solid ${theme.border}`,
    fontSize: '0.95rem',
    verticalAlign: 'middle',
  },
  badge: (color) => ({
    backgroundColor: `${color}20`,
    color: color,
    padding: '0.25rem 0.6rem',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: '600',
    border: `1px solid ${color}40`,
  }),
  modalOverlay: {
    backgroundColor: 'rgba(0,0,0,0.85)',
    backdropFilter: 'blur(5px)',
  },
  modalContent: {
    backgroundColor: '#1E1E1E',
    border: `1px solid ${theme.border}`,
    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
    color: theme.text,
  },
};

const getPaymentColor = (status) => {
  switch (status) {
    case 'Paid': return theme.success;
    case 'Pending': return theme.warning;
    case 'Declined': return theme.danger;
    case 'Voided': return theme.textMuted;
    default: return theme.textMuted;
  }
};

const getFulfillmentColor = (status) => {
  switch (status) {
    case 'Entregado': return theme.success;
    case 'En reparto': return theme.info;
    case 'En preparación': return theme.warning;
    case 'Pedido recibido': return theme.textMuted;
    default: return theme.textMuted;
  }
};

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('All');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
          fulfillmentStatus: order.fulfillmentStatus || 'Pedido recibido',
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

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, paymentStatusFilter]);

  const handlePaymentStatusChange = async (orderId, newStatus) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status: newStatus });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (e) { alert(e.message); }
  };

  const handleFulfillmentStatusChange = async (orderId, newStatus) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { fulfillmentStatus: newStatus });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, fulfillmentStatus: newStatus } : o));
    } catch (e) { alert(e.message); }
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const filteredOrders = orders.filter((order) => {
    const customerName = order.customerInfo?.name || '';
    const customerPhone = order.customerInfo?.phone || '';
    const shortOrderId = order.shortOrderId || '';
    
    const matchesSearch = 
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerPhone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shortOrderId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || order.fulfillmentStatus === statusFilter;
    const matchesPayment = paymentStatusFilter === 'All' || order.status === paymentStatusFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
  const pendingOrders = orders.filter(o => o.fulfillmentStatus !== 'Entregado' && o.fulfillmentStatus !== 'Cancelado').length;

  if (loading) return <div style={{...styles.container, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>Cargando pedidos...</div>;
  if (error) return <div style={{...styles.container, color: theme.danger}}>Error: {error}</div>;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Dashboard de Pedidos</h1>

      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <span style={styles.statValue}>{totalOrders}</span>
          <span style={styles.statLabel}>Total Pedidos</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statValue}>${totalRevenue.toLocaleString('es-CO')}</span>
          <span style={styles.statLabel}>Ingresos Totales</span>
        </div>
        <div style={styles.statCard}>
          <span style={{...styles.statValue, color: pendingOrders > 0 ? theme.warning : theme.success}}>{pendingOrders}</span>
          <span style={styles.statLabel}>Pedidos Activos</span>
        </div>
      </div>

      <div style={styles.filterContainer}>
        <input
          type="text"
          style={{...styles.input, flexGrow: 1}}
          placeholder="Buscar por cliente, teléfono o ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          style={styles.select}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">Todos los Estados (Pedido)</option>
          <option value="Pedido recibido">Pedido recibido</option>
          <option value="En preparación">En preparación</option>
          <option value="En reparto">En reparto</option>
          <option value="Entregado">Entregado</option>
        </select>
        <select
          style={styles.select}
          value={paymentStatusFilter}
          onChange={(e) => setPaymentStatusFilter(e.target.value)}
        >
          <option value="All">Todos los Estados (Pago)</option>
          <option value="Pending">Pendiente</option>
          <option value="Paid">Pagado</option>
          <option value="Declined">Denegado</option>
          <option value="Voided">Anulado</option>
          <option value="Error">Error</option>
        </select>
      </div>

      <div className="table-responsive" style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Fecha</th>
              <th style={styles.th}>Cliente</th>
              <th style={styles.th}>Total</th>
              <th style={styles.th}>Pago</th>
              <th style={styles.th}>Estado</th>
              <th style={styles.th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length === 0 ? (
               <tr><td colSpan="7" style={{...styles.td, textAlign: 'center', padding: '2rem'}}>No se encontraron pedidos.</td></tr>
            ) : (
              currentItems.map((order) => (
                <tr key={order.id} style={{backgroundColor: 'transparent', borderBottom: `1px solid ${theme.border}`}}>
                  <td style={{...styles.td, color: theme.primary, fontWeight: 'bold'}}>#{order.shortOrderId}</td>
                  <td style={styles.td}>{order.createdAt?.toDate().toLocaleDateString('es-CO')} <small style={{color: theme.textMuted}}>{order.createdAt?.toDate().toLocaleTimeString('es-CO', {hour: '2-digit', minute:'2-digit'})}</small></td>
                  <td style={styles.td}>
                    <div style={{fontWeight: '500'}}>{order.customerInfo?.name}</div>
                    <div style={{fontSize: '0.8rem', color: theme.textMuted}}>{order.customerInfo?.phone}</div>
                  </td>
                  <td style={{...styles.td, fontWeight: 'bold'}}>${order.total.toLocaleString('es-CO')}</td>
                  
                  <td style={styles.td}>
                    <select
                      value={order.status}
                      onChange={(e) => handlePaymentStatusChange(order.id, e.target.value)}
                      style={{
                        backgroundColor: 'transparent',
                        color: getPaymentColor(order.status),
                        border: `1px solid ${getPaymentColor(order.status)}`,
                        borderRadius: '4px',
                        padding: '2px 5px',
                        fontSize: '0.85rem',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="Pending" style={{color: '#000'}}>Pendiente</option>
                      <option value="Paid" style={{color: '#000'}}>Pagado</option>
                      <option value="Declined" style={{color: '#000'}}>Denegado</option>
                      <option value="Voided" style={{color: '#000'}}>Anulado</option>
                      <option value="Error" style={{color: '#000'}}>Error</option>
                    </select>
                  </td>

                  <td style={styles.td}>
                    <select
                      value={order.fulfillmentStatus}
                      onChange={(e) => handleFulfillmentStatusChange(order.id, e.target.value)}
                      style={{
                        backgroundColor: 'transparent',
                        color: getFulfillmentColor(order.fulfillmentStatus),
                        border: 'none',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="Pedido recibido" style={{color: '#000'}}>Pedido recibido</option>
                      <option value="En preparación" style={{color: '#000'}}>En preparación</option>
                      <option value="En reparto" style={{color: '#000'}}>En reparto</option>
                      <option value="Entregado" style={{color: '#000'}}>Entregado</option>
                    </select>
                  </td>

                  <td style={styles.td}>
                    <button
                      className="btn btn-sm"
                      style={{backgroundColor: '#333', color: theme.text, border: `1px solid ${theme.border}`}}
                      onClick={() => handleViewDetails(order)}
                    >
                      Ver
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '1.5rem', gap: '0.5rem'}}>
          <button 
            className="btn btn-sm" 
            style={{backgroundColor: theme.surface, color: theme.text, border: `1px solid ${theme.border}`}}
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Anterior
          </button>
          
          {[...Array(totalPages)].map((_, i) => (
             <button
               key={i}
               className="btn btn-sm"
               style={{
                 backgroundColor: currentPage === i + 1 ? theme.primary : theme.surface,
                 color: currentPage === i + 1 ? '#000' : theme.text,
                 border: `1px solid ${currentPage === i + 1 ? theme.primary : theme.border}`,
                 fontWeight: 'bold'
               }}
               onClick={() => paginate(i + 1)}
             >
               {i + 1}
             </button>
          ))}

          <button 
            className="btn btn-sm" 
            style={{backgroundColor: theme.surface, color: theme.text, border: `1px solid ${theme.border}`}}
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Siguiente
          </button>
        </div>
      )}

      {selectedOrder && (
        <div className={`modal fade ${showModal ? 'show' : ''}`} style={{ display: showModal ? 'block' : 'none', ...styles.modalOverlay }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content" style={styles.modalContent}>
              <div className="modal-header border-secondary">
                <h5 className="modal-title" style={{color: theme.primary}}>Pedido #{selectedOrder.shortOrderId}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row mb-3">
                  <div className="col-md-6">
                    <h6 style={{color: theme.textMuted}}>Cliente</h6>
                    <p style={{marginBottom: '0.2rem'}}>{selectedOrder.customerInfo?.name}</p>
                    <p style={{marginBottom: '0.2rem'}}><small>{selectedOrder.customerInfo?.email}</small></p>
                    <p style={{marginBottom: '0.2rem'}}><small>{selectedOrder.customerInfo?.phone}</small></p>
                    <p style={{color: theme.primary}}>{selectedOrder.customerInfo?.address}</p>
                  </div>
                  <div className="col-md-6 text-md-end">
                    <h6 style={{color: theme.textMuted}}>Info Pago</h6>
                    <p style={{marginBottom: '0.2rem'}}>Método: {selectedOrder.paymentMethod}</p>
                    <p style={{marginBottom: '0.2rem'}}>Estado: <span style={styles.badge(getPaymentColor(selectedOrder.status))}>{selectedOrder.status}</span></p>
                    {selectedOrder.wompiTransactionId && <p><small>Ref: {selectedOrder.wompiTransactionId}</small></p>}
                  </div>
                </div>
                
                <hr style={{borderColor: theme.border}} />
                
                <h6 style={{color: theme.textMuted, marginBottom: '1rem'}}>Productos</h6>
                <ul className="list-group list-group-flush mb-3" style={{backgroundColor: 'transparent'}}>
                  {selectedOrder.orderItems.map((item, index) => (
                    <li key={index} className="list-group-item d-flex justify-content-between align-items-center" style={{backgroundColor: 'transparent', color: theme.text, borderColor: theme.border}}>
                      <div>
                         <span style={{fontWeight: '500'}}>{item.name}</span>
                         <span style={{marginLeft: '0.5rem', fontSize: '0.85rem', color: theme.textMuted}}>x{item.quantity}</span>
                      </div>
                      <span>${item.price.toLocaleString('es-CO')}</span>
                    </li>
                  ))}
                </ul>
                <div className="text-end">
                   <h4 style={{color: theme.primary}}>Total: ${selectedOrder.total.toLocaleString('es-CO')}</h4>
                </div>
              </div>
              <div className="modal-footer border-secondary">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cerrar</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showModal && <div className="modal-backdrop fade show"></div>}
    </div>
  );
}
