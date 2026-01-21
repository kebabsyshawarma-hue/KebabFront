import { useState, useEffect, useRef } from 'react';
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
  
  // Pagination & Filters State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Sound State
  const [soundEnabled, setSoundEnabled] = useState(true);
  const prevOrdersLength = useRef(0);
  const audioUnlocked = useRef(false);

  // Function to unlock audio on first interaction
  const unlockAudio = () => {
    if (audioUnlocked.current) return;
    const audio = new Audio('https://cdn.freesound.org/previews/536/536108_1415754-lq.mp3');
    audio.volume = 0.01; // Almost silent
    audio.play()
      .then(() => {
        audioUnlocked.current = true;
        console.log("Audio unlocked successfully");
        window.removeEventListener('click', unlockAudio);
      })
      .catch(e => console.log("Audio still locked:", e));
  };

  useEffect(() => {
    window.addEventListener('click', unlockAudio);
    return () => window.removeEventListener('click', unlockAudio);
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Play sound if new order arrived
      if (ordersData.length > prevOrdersLength.current && !loading) {
        if (soundEnabled) {
          const audio = new Audio('https://cdn.freesound.org/previews/536/536108_1415754-lq.mp3'); // Reliable "Ding" sound
          audio.play().catch(e => console.error("Error playing sound:", e));
        }
      }
      prevOrdersLength.current = ordersData.length;

      setOrders(ordersData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [soundEnabled, loading]); // Added soundEnabled dependency to capture latest state but careful with re-subs. Actually soundEnabled in effect might be stale if not in dep array, but re-subscribing is costly. Better to use ref for soundEnabled or just live with re-sub. Re-sub is fine here.

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

  // Filter Logic
  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'All' || order.status === filterStatus;
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      order.shortOrderId?.toLowerCase().includes(searchLower) ||
      order.customerDetails?.name?.toLowerCase().includes(searchLower) ||
      order.customerDetails?.phone?.includes(searchLower);
    
    return matchesStatus && matchesSearch;
  });

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Calculate stats for today
  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    const d = date.toDate();
    return d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear();
  };

  const ordersToday = orders.filter(o => isToday(o.createdAt));

  const toggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    if (newState) {
      // Play a silent sound or the notification sound immediately to unlock audio context
      const audio = new Audio('https://cdn.freesound.org/previews/536/536108_1415754-lq.mp3');
      audio.volume = 0.1; // Low volume for test
      audio.play().catch(e => console.error("Error unlocking audio:", e));
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full text-[#FFD700]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FFD700]"></div>
    </div>
  );

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-2 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Dashboard</h1>
            <p className="text-gray-400 text-sm">Resumen de pedidos en tiempo real</p>
          </div>
          <button 
            onClick={toggleSound}
            className={`p-2 rounded-full border transition-all ${soundEnabled ? 'bg-[#FFD700]/20 border-[#FFD700] text-[#FFD700]' : 'bg-white/5 border-white/10 text-gray-500'}`}
            title={soundEnabled ? "Silenciar Alarma" : "Activar Alarma"}
          >
            <i className={`bi ${soundEnabled ? 'bi-volume-up-fill' : 'bi-volume-mute-fill'} text-xl`}></i>
          </button>
        </div>
        
        {/* Quick Stats Cards */}
        <div className="bg-[#111] border border-white/10 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 uppercase tracking-wider block">Pedidos Hoy</span>
            <span className="text-2xl font-bold text-white">{ordersToday.length}</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#FFD700]/10 flex items-center justify-center text-[#FFD700]">
            <i className="bi bi-bag-check-fill"></i>
          </div>
        </div>
         <div className="bg-[#111] border border-white/10 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 uppercase tracking-wider block">Pendientes</span>
            <span className="text-2xl font-bold text-yellow-500">{orders.filter(o => o.status === 'Pending').length}</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500">
             <i className="bi bi-clock-history"></i>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between bg-[#111] p-4 rounded-2xl border border-white/5">
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          {/* Search */}
          <div className="relative group w-full md:w-64">
            <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#FFD700] transition-colors"></i>
            <input 
              type="text" 
              placeholder="Buscar pedido, nombre..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white text-sm focus:border-[#FFD700] outline-none transition-all"
            />
          </div>
          
          {/* Status Filter */}
          <div className="flex overflow-x-auto pb-2 md:pb-0 gap-2 scrollbar-hide">
            <button 
              onClick={() => setFilterStatus('All')}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${filterStatus === 'All' ? 'bg-[#FFD700] text-black border-[#FFD700]' : 'bg-black text-gray-400 border-white/10 hover:border-white/30'}`}
            >
              Todos
            </button>
            {STATUS_OPTIONS.map(status => (
              <button 
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${filterStatus === status ? 'bg-white text-black border-white' : 'bg-black text-gray-400 border-white/10 hover:border-white/30'}`}
              >
                {STATUS_LABELS[status]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden shadow-xl min-h-[400px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-white/5 text-gray-200 uppercase font-bold text-xs tracking-wider border-b border-white/5">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Detalles</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {currentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4 font-mono text-[#FFD700] font-bold">#{order.shortOrderId}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-white font-bold">{order.customerDetails?.name}</span>
                      <span className="text-xs text-gray-500">{order.customerDetails?.phone}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col text-xs">
                      <span className="text-gray-300 truncate max-w-[150px]" title={order.customerDetails?.address}>{order.customerDetails?.address}</span>
                      <span className="text-gray-500">{order.zoneName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-white font-bold">
                    ${order.total?.toLocaleString('es-CO')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wide inline-flex items-center gap-1 ${STATUS_COLORS[order.status] || 'bg-gray-700 text-white'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${order.status === 'Pending' ? 'animate-pulse bg-yellow-500' : 'bg-current'}`}></span>
                      {STATUS_LABELS[order.status] || order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <select
                      className="bg-black border border-white/10 text-white text-xs rounded-lg px-3 py-2 outline-none focus:border-[#FFD700] cursor-pointer hover:bg-white/5 transition-colors"
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
        
        {currentOrders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500 opacity-50">
            <i className="bi bi-inbox text-5xl mb-4"></i>
            <p className="text-lg">No se encontraron pedidos</p>
          </div>
        )}

        {/* Pagination Footer */}
        {filteredOrders.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-white/5 bg-white/[0.02]">
            <span className="text-xs text-gray-500">
              Mostrando {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredOrders.length)} de {filteredOrders.length}
            </span>
            <div className="flex gap-2">
              <button 
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <i className="bi bi-chevron-left"></i>
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => paginate(i + 1)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${currentPage === i + 1 ? 'bg-[#FFD700] text-black shadow-lg shadow-yellow-500/20' : 'border border-white/10 text-gray-400 hover:bg-white/5'}`}
                >
                  {i + 1}
                </button>
              ))}
              <button 
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <i className="bi bi-chevron-right"></i>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
