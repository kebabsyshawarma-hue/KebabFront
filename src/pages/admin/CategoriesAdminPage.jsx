import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';

export default function CategoriesAdminPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    order: 0
  });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'categories'), orderBy('order', 'asc'));
      const querySnapshot = await getDocs(q);
      const categoriesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleEdit = (category) => {
    setIsEditing(true);
    setCurrentCategory(category);
    setFormData({
      name: category.name,
      order: category.order || 0
    });
  };

  const handleAddNew = () => {
    setIsEditing(true);
    setCurrentCategory(null);
    const maxOrder = categories.length > 0 ? Math.max(...categories.map(c => c.order || 0)) : 0;
    setFormData({ name: '', order: maxOrder + 1 });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setCurrentCategory(null);
    setFormData({ name: '', order: 0 });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = {
      name: formData.name.trim(),
      order: Number(formData.order)
    };

    try {
      if (currentCategory) {
        await updateDoc(doc(db, 'categories', currentCategory.id), payload);
      } else {
        await addDoc(collection(db, 'categories'), payload);
      }
      setIsEditing(false);
      fetchCategories();
    } catch (error) {
      console.error("Error saving category:", error);
      alert('Error al guardar categoría');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que quieres eliminar esta categoría?')) return;
    try {
      await deleteDoc(doc(db, 'categories', id));
      fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      alert('Error al eliminar');
    }
  };

  if (loading && categories.length === 0 && !isEditing) return (
    <div className="flex items-center justify-center h-full text-[#FFD700]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FFD700]"></div>
    </div>
  );

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Gestión de Categorías</h1>
          <p className="text-gray-400 text-sm">Define el orden de las secciones en el menú</p>
        </div>
        <button 
          onClick={handleAddNew} 
          className="bg-[#FFD700] hover:bg-yellow-400 text-black px-4 py-2 rounded-xl transition-all font-bold text-sm flex items-center gap-2"
        >
          <i className="bi bi-plus-lg"></i> Nueva Categoría
        </button>
      </div>

      {isEditing && (
        <div className="bg-[#111] border border-white/10 p-6 rounded-2xl animate-in fade-in slide-in-from-top-4 duration-300">
          <h2 className="text-xl font-bold text-[#FFD700] mb-6">
            {currentCategory ? 'Editar Categoría' : 'Nueva Categoría'}
          </h2>
          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Nombre</label>
              <input 
                type="text" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                placeholder="Ej: Platos Fuertes"
                className="w-full bg-black border border-white/20 rounded-lg px-4 py-3 text-white focus:border-[#FFD700] outline-none"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Orden de Visualización</label>
              <input 
                type="number" 
                value={formData.order} 
                onChange={e => setFormData({...formData, order: e.target.value})} 
                className="w-full bg-black border border-white/20 rounded-lg px-4 py-3 text-white focus:border-[#FFD700] outline-none"
                required
              />
              <p className="text-[10px] text-gray-500">Número bajo = Aparece primero</p>
            </div>
            
            <div className="md:col-span-2 flex justify-end gap-3 pt-4 border-t border-white/10">
              <button type="button" onClick={handleCancel} className="px-6 py-2 rounded-lg text-gray-400 hover:text-white">Cancelar</button>
              <button type="submit" className="bg-[#FFD700] text-black px-6 py-2 rounded-lg font-bold">Guardar</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {categories.map((cat) => (
          <div key={cat.id} className="group bg-[#111] border border-white/5 p-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-[#FFD700] font-black border border-white/5">
                {cat.order}
              </div>
              <h3 className="text-lg font-bold text-white">{cat.name}</h3>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(cat)} className="w-8 h-8 rounded-full bg-white/5 text-white flex items-center justify-center hover:bg-[#FFD700] hover:text-black transition-all"><i className="bi bi-pencil-fill text-xs"></i></button>
              <button onClick={() => handleDelete(cat.id)} className="w-8 h-8 rounded-full bg-white/5 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"><i className="bi bi-trash-fill text-xs"></i></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
