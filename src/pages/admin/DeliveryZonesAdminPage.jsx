import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { DELIVERY_ZONES as INITIAL_ZONES } from '../../data/deliveryZones';

export default function DeliveryZonesAdminPage() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingZone, setEditingZone] = useState(null); // Zone being edited
  const [isAdding, setIsAdding] = useState(false); // Mode to add new zone

  // Template for new zone
  const emptyZone = {
    id: '',
    name: '',
    fee: 0,
    maxDistanceKm: 0,
    keywords: []
  };

  const [formData, setFormData] = useState(emptyZone);
  const [keywordInput, setKeywordInput] = useState('');

  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'deliveryZones'));
      const zonesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // If no zones exist in Firestore, maybe we want to show the seed button, 
      // but for now just setting state.
      setZones(zonesData);
    } catch (error) {
      console.error("Error fetching zones:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedData = async () => {
    if (!confirm('¿Estás seguro de restablecer las zonas desde el archivo original? Esto borrará las zonas actuales en la base de datos.')) return;
    
    setLoading(true);
    try {
      // Clear existing
      const querySnapshot = await getDocs(collection(db, 'deliveryZones'));
      const deletePromises = querySnapshot.docs.map(d => deleteDoc(d.ref));
      await Promise.all(deletePromises);

      // Add initial
      const addPromises = INITIAL_ZONES.map(z => setDoc(doc(db, 'deliveryZones', z.id), z));
      await Promise.all(addPromises);
      
      await fetchZones();
      alert('Zonas restablecidas correctamente.');
    } catch (error) {
      console.error("Error seeding data:", error);
      alert('Error al restablecer datos.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (zone) => {
    setEditingZone(zone);
    setFormData({ ...zone });
    setIsAdding(false);
    setKeywordInput('');
  };

  const handleAddClick = () => {
    setEditingZone(null);
    setFormData({ ...emptyZone, id: `zone_${Date.now()}` }); // Temporary ID generation
    setIsAdding(true);
    setKeywordInput('');
  };

  const handleCancel = () => {
    setEditingZone(null);
    setIsAdding(false);
    setFormData(emptyZone);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'fee' || name === 'maxDistanceKm' ? parseFloat(value) || 0 : value
    }));
  };

  const handleAddKeyword = (e) => {
    e.preventDefault();
    if (!keywordInput.trim()) return;
    setFormData(prev => ({
      ...prev,
      keywords: [...(prev.keywords || []), keywordInput.trim().toLowerCase()]
    }));
    setKeywordInput('');
  };

  const handleRemoveKeyword = (keywordToRemove) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keywordToRemove)
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const zoneId = isAdding ? (formData.id || `zone_${Date.now()}`) : formData.id;
      // Ensure ID doesn't have spaces or weird chars if manual input allowed (we use generated or existing)
      
      const zoneData = {
        name: formData.name,
        fee: formData.fee,
        maxDistanceKm: formData.maxDistanceKm,
        keywords: formData.keywords || []
      };

      await setDoc(doc(db, 'deliveryZones', zoneId), zoneData); // setDoc works for both create (with specific ID) and overwrite
      
      await fetchZones();
      handleCancel();
    } catch (error) {
      console.error("Error saving zone:", error);
      alert('Error al guardar zona.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (zoneId) => {
    if (!confirm('¿Seguro que quieres eliminar esta zona?')) return;
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'deliveryZones', zoneId));
      await fetchZones();
    } catch (error) {
      console.error("Error deleting zone:", error);
      alert('Error al eliminar zona.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && zones.length === 0 && !isAdding) return (
    <div className="flex items-center justify-center h-full text-[#FFD700]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FFD700]"></div>
    </div>
  );

  return (
    <div className="space-y-8 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Zonas de Domicilio</h1>
          <p className="text-gray-400 text-sm">Gestiona tarifas, cobertura y palabras clave</p>
        </div>
        <div className="flex gap-3">
          {zones.length === 0 && (
            <button 
              onClick={handleSeedData} 
              className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-4 py-2 rounded-xl transition-all text-sm font-bold"
            >
              <i className="bi bi-database-fill-up mr-2"></i> Cargar Defaults
            </button>
          )}
          <button 
            onClick={handleAddClick} 
            className="bg-[#FFD700] hover:bg-yellow-400 text-black px-4 py-2 rounded-xl transition-all shadow-[0_0_20px_rgba(255,215,0,0.3)] font-bold text-sm"
          >
            <i className="bi bi-plus-lg mr-2"></i> Nueva Zona
          </button>
        </div>
      </div>

      {/* Formulario de Edición / Creación */}
      {(isAdding || editingZone) && (
        <div className="bg-[#111] border border-white/10 p-6 rounded-2xl animate-in fade-in slide-in-from-top-4 duration-300">
          <h2 className="text-xl font-bold text-[#FFD700] mb-6">
            {isAdding ? 'Nueva Zona' : 'Editar Zona'}
          </h2>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">ID (Identificador)</label>
                <input 
                  type="text" 
                  name="id" 
                  value={formData.id} 
                  onChange={handleChange} 
                  disabled={!isAdding} // Solo editable al crear
                  placeholder="ej: zona_norte"
                  className="w-full bg-black border border-white/20 rounded-lg px-4 py-3 text-white focus:border-[#FFD700] outline-none disabled:opacity-50"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Nombre Visible</label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  placeholder="ej: Zona Norte (2-5km)"
                  className="w-full bg-black border border-white/20 rounded-lg px-4 py-3 text-white focus:border-[#FFD700] outline-none"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tarifa ($)</label>
                <input 
                  type="number" 
                  name="fee" 
                  value={formData.fee} 
                  onChange={handleChange} 
                  className="w-full bg-black border border-white/20 rounded-lg px-4 py-3 text-white focus:border-[#FFD700] outline-none"
                  min="0"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Distancia Máx (Km)</label>
                <input 
                  type="number" 
                  name="maxDistanceKm" 
                  value={formData.maxDistanceKm} 
                  onChange={handleChange} 
                  className="w-full bg-black border border-white/20 rounded-lg px-4 py-3 text-white focus:border-[#FFD700] outline-none"
                  min="0"
                  step="0.1"
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
               <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Palabras Clave (Barrios)</label>
               <div className="flex gap-2">
                 <input 
                    type="text" 
                    value={keywordInput} 
                    onChange={(e) => setKeywordInput(e.target.value)} 
                    placeholder="Escribe un barrio y presiona Enter..."
                    className="flex-1 bg-black border border-white/20 rounded-lg px-4 py-3 text-white focus:border-[#FFD700] outline-none"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddKeyword(e)}
                 />
                 <button 
                  type="button" 
                  onClick={handleAddKeyword}
                  className="bg-white/10 px-4 rounded-lg text-white hover:bg-white/20"
                 >
                   <i className="bi bi-plus-lg"></i>
                 </button>
               </div>
               <div className="flex flex-wrap gap-2 mt-2">
                 {formData.keywords?.map((k, idx) => (
                   <span key={idx} className="bg-[#FFD700]/10 text-[#FFD700] border border-[#FFD700]/20 px-2 py-1 rounded-md text-xs flex items-center gap-2">
                     {k}
                     <button type="button" onClick={() => handleRemoveKeyword(k)} className="hover:text-white"><i className="bi bi-x"></i></button>
                   </span>
                 ))}
               </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
              <button 
                type="button" 
                onClick={handleCancel}
                className="px-6 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="bg-[#FFD700] text-black px-6 py-2 rounded-lg font-bold hover:bg-yellow-400 shadow-lg shadow-yellow-900/20"
              >
                Guardar Zona
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Zonas */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {zones.map((zone) => (
          <div key={zone.id} className="group bg-[#111] border border-white/5 p-6 rounded-2xl hover:border-white/10 transition-all relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-[#FFD700] transition-colors">{zone.name}</h3>
                <span className="text-xs font-mono text-gray-500 bg-black/50 px-2 py-1 rounded mt-1 inline-block">ID: {zone.id}</span>
              </div>
              <div className="text-right">
                <span className="block text-2xl font-bold text-[#FFD700]">${zone.fee?.toLocaleString()}</span>
                <span className="text-xs text-gray-400">Tarifa</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm text-gray-300 bg-white/5 p-3 rounded-lg">
                <span><i className="bi bi-geo-alt mr-2 text-gray-500"></i> Radio Máximo</span>
                <span className="font-bold">{zone.maxDistanceKm} km</span>
              </div>
              
              <div>
                <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide font-bold">Barrios / Keywords</p>
                <div className="flex flex-wrap gap-1">
                  {zone.keywords?.length > 0 ? zone.keywords.slice(0, 8).map((k, i) => (
                    <span key={i} className="text-[10px] bg-white/5 text-gray-400 px-2 py-1 rounded border border-white/5">
                      {k}
                    </span>
                  )) : <span className="text-[10px] text-gray-600 italic">Sin palabras clave</span>}
                  {zone.keywords?.length > 8 && (
                     <span className="text-[10px] bg-white/5 text-gray-400 px-2 py-1 rounded border border-white/5">
                      +{zone.keywords.length - 8} más...
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3 opacity-50 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => handleEditClick(zone)}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Editar
              </button>
              <button 
                onClick={() => handleDelete(zone.id)}
                className="w-10 bg-red-500/10 hover:bg-red-500/20 text-red-500 hover:text-red-400 py-2 rounded-lg text-sm transition-colors flex items-center justify-center"
              >
                <i className="bi bi-trash"></i>
              </button>
            </div>
          </div>
        ))}
      </div>

      {zones.length === 0 && !loading && (
        <div className="text-center py-20 opacity-50">
          <i className="bi bi-map text-6xl text-gray-600 mb-4 block"></i>
          <p className="text-gray-400">No hay zonas configuradas.</p>
          <button onClick={handleSeedData} className="text-[#FFD700] underline mt-2 hover:text-white">Cargar datos iniciales</button>
        </div>
      )}
    </div>
  );
}
