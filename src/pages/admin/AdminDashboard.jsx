import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';

const STATUS_OPTIONS = ['Pending', 'Paid', 'Preparation', 'Ready', 'Delivered', 'Cancelled'];

const STATUS_COLORS = {
  Pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  Paid: 'bg-green-500/10 text-green-500 border-green-500/20',
  Preparation: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  Ready: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  Delivered: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  Cancelled: 'bg-red-500/10 text-red-500 border-red-500/20',
};

const STATUS_LABELS = {
  Pending: 'Pendiente',
  Paid: 'Pagado',
  Preparation: 'En Cocina',
  Ready: 'Listo',
  Delivered: 'Entregado',
  Cancelled: 'Cancelado',
};

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(ordersData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { 
        status: newStatus,
        fulfillmentStatus: STATUS_LABELS[newStatus] || newStatus 
      });
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Error al actualizar estado");
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full text-[#FFD700]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FFD700]"></div>
    </div>
  );

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Dashboard</h1>
          <p className="text-gray-400 text-sm">Resumen de pedidos en tiempo real</p>
        </div>
        <div className="bg-white/5 px-4 py-2 rounded-lg border border-white/10">
          <span className="text-xs text-gray-500 uppercase tracking-wider block">Total Pedidos</span>
          <span className="text-xl font-bold text-white">{orders.length}</span>
        </div>
      </div>

      {/* Tabla de Pedidos */}
      <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-white/5 text-gray-200 uppercase font-bold text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 font-mono text-[#FFD700]">#{order.shortOrderId}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-white font-medium">{order.customerDetails?.name}</span>
                      <span className="text-xs text-gray-500">{order.customerDetails?.phone}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-white font-bold">
                    ${order.total?.toLocaleString('es-CO')}
                  </td>
                  <td className="px-6 py-4 text-xs">
                    {order.createdAt?.toDate().toLocaleString('es-CO', { 
                      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wide ${STATUS_COLORS[order.status] || 'bg-gray-700 text-white'}`}>
                      {STATUS_LABELS[order.status] || order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <select
                      className="bg-black border border-white/20 text-white text-xs rounded-lg px-2 py-1 outline-none focus:border-[#FFD700]"
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    >
                      {STATUS_OPTIONS.map(status => (
                        <option key={status} value={status}>{STATUS_LABELS[status]}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {orders.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            <i className="bi bi-inbox text-4xl mb-2 block opacity-50"></i>
            No hay pedidos recientes.
          </div>
        )}
      </div>
    </div>
  );
}