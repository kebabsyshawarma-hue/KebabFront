import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

export default function MenuAdminPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    kcal: '',
    tags: '',
    order: 0
  });

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [productsSnap, catsSnap] = await Promise.all([
        getDocs(collection(db, 'menu')),
        getDocs(collection(db, 'categories'))
      ]);
      
      const productsData = productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const catsData = catsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      setProducts(productsData);
      setCategories(catsData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleEdit = (product) => {
    setIsEditing(true);
    setCurrentProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      image: product.image,
      kcal: product.kcal || '',
      tags: product.tags ? product.tags.join(', ') : '',
      order: product.order || 0
    });
  };

  const handleAddNew = () => {
    setIsEditing(true);
    setCurrentProduct(null);
    setFormData({ 
      name: '', 
      description: '', 
      price: '', 
      category: categories.length > 0 ? categories[0].name : '', 
      image: '', 
      kcal: '', 
      tags: '',
      order: products.length
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      price: Number(formData.price),
      order: Number(formData.order),
      tags: formData.tags.split(',').map(t => t.trim()).filter(t => t)
    };

    try {
      if (currentProduct) {
        await updateDoc(doc(db, 'menu', currentProduct.id), payload);
      } else {
        await addDoc(collection(db, 'menu'), payload);
      }
      setIsEditing(false);
      fetchInitialData();
    } catch (error) {
      console.error(error);
      alert('Error al guardar');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que quieres eliminar este producto?')) return;
    try {
      await deleteDoc(doc(db, 'menu', id));
      fetchProducts();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Gestión de Menú</h1>
        <button 
          onClick={handleAddNew}
          className="bg-[#FFD700] hover:bg-yellow-500 text-black font-bold px-6 py-2 rounded-xl transition-all shadow-lg shadow-[#FFD700]/20 flex items-center gap-2"
        >
          <i className="bi bi-plus-lg"></i> Nuevo Producto
        </button>
      </div>

      {isEditing && (
        <div className="bg-[#111] border border-white/10 p-6 rounded-2xl mb-8 animate-in fade-in slide-in-from-top-4">
          <h2 className="text-xl text-white mb-6 border-b border-white/5 pb-4">
            {currentProduct ? 'Editar Producto' : 'Nuevo Producto'}
          </h2>
          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input type="text" placeholder="Nombre" className="bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-[#FFD700] outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
            <input type="number" placeholder="Precio" className="bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-[#FFD700] outline-none" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
            <select 
              className="bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-[#FFD700] outline-none" 
              value={formData.category} 
              onChange={e => setFormData({...formData, category: e.target.value})} 
              required
            >
              <option value="">Selecciona una categoría...</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name} className="bg-neutral-900">{cat.name}</option>
              ))}
            </select>
            <input type="number" placeholder="Orden de aparición" className="bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-[#FFD700] outline-none" value={formData.order} onChange={e => setFormData({...formData, order: e.target.value})} required />
            <input type="text" placeholder="URL Imagen" className="bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-[#FFD700] outline-none" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} required />
            <input type="text" placeholder="Kcal" className="bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-[#FFD700] outline-none" value={formData.kcal} onChange={e => setFormData({...formData, kcal: e.target.value})} />
            <input type="text" placeholder="Tags (sep. por comas)" className="bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-[#FFD700] outline-none" value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} />
            <textarea placeholder="Descripción" className="md:col-span-2 bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-[#FFD700] outline-none h-24" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
            
            <div className="md:col-span-2 flex justify-end gap-3 mt-4">
              <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 rounded-lg border border-white/10 text-gray-400 hover:text-white">Cancelar</button>
              <button type="submit" className="px-6 py-2 rounded-lg bg-[#FFD700] text-black font-bold hover:bg-yellow-500">Guardar</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center text-gray-500 py-10">Cargando productos...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map(item => (
            <div key={item.id} className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden group hover:border-[#FFD700]/30 transition-all">
              <div className="h-48 overflow-hidden relative">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-2 right-2 flex gap-1">
                  <button onClick={() => handleEdit(item)} className="w-8 h-8 rounded-full bg-black/50 text-white hover:bg-[#FFD700] hover:text-black flex items-center justify-center backdrop-blur-sm transition-colors"><i className="bi bi-pencil-fill text-xs"></i></button>
                  <button onClick={() => handleDelete(item.id)} className="w-8 h-8 rounded-full bg-black/50 text-white hover:bg-red-500 flex items-center justify-center backdrop-blur-sm transition-colors"><i className="bi bi-trash-fill text-xs"></i></button>
                </div>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-white font-bold text-lg leading-tight">{item.name}</h3>
                  <span className="text-[#FFD700] font-mono font-bold">${item.price}</span>
                </div>
                <p className="text-gray-500 text-xs line-clamp-2 mb-3">{item.description}</p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-[10px] px-2 py-1 rounded bg-white/5 text-gray-400 border border-white/5">{item.category}</span>
                  {item.kcal && <span className="text-[10px] px-2 py-1 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">🔥 {item.kcal}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
