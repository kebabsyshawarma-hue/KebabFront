import { useState, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { db } from '../../firebase';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';

// --- Modern Dark Theme & Styles ---
const theme = {
  bg: '#121212', // Darker background
  surface: '#1E1E1E', // Card background
  surfaceHover: '#2C2C2C',
  border: '#333333',
  primary: '#FFD700', // Gold
  secondary: '#FF4444', // Red
  text: '#E0E0E0',
  textMuted: '#A0A0A0',
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
  header: {
    marginBottom: '2rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    background: theme.accentGradient,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '0.5rem',
  },
  subtitle: {
    color: theme.textMuted,
    fontSize: '0.9rem',
  },
  // Top Level Tabs (Products vs Categories)
  mainTabsContainer: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '2rem',
    borderBottom: `1px solid ${theme.border}`,
    paddingBottom: '1rem',
  },
  mainTab: (isActive) => ({
    background: 'transparent',
    border: 'none',
    borderBottom: isActive ? `3px solid ${theme.primary}` : '3px solid transparent',
    color: isActive ? theme.primary : theme.textMuted,
    fontSize: '1.1rem',
    fontWeight: '600',
    padding: '0.5rem 1rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  }),
  // Sub Tabs (Category Filter)
  filterContainer: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1.5rem',
    overflowX: 'auto',
    paddingBottom: '0.5rem',
  },
  filterPill: (isActive) => ({
    backgroundColor: isActive ? theme.primary : 'transparent',
    color: isActive ? '#000' : theme.text,
    border: `1px solid ${isActive ? theme.primary : theme.border}`,
    borderRadius: '50px',
    padding: '0.4rem 1rem',
    fontSize: '0.9rem',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s ease',
  }),
  // Modern Card
  card: {
    backgroundColor: theme.surface,
    border: `1px solid ${theme.border}`,
    borderRadius: '12px',
    padding: '1.2rem',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    transition: 'transform 0.2s, box-shadow 0.2s',
    boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
  },
  cardImage: {
    width: '70px',
    height: '70px',
    objectFit: 'cover',
    borderRadius: '8px',
    marginRight: '1.2rem',
    border: `1px solid ${theme.border}`,
  },
  // Inputs & Modals
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
  input: {
    backgroundColor: '#2A2A2A',
    border: `1px solid ${theme.border}`,
    color: theme.text,
    borderRadius: '6px',
    padding: '0.6rem',
  },
  btnPrimary: {
    background: theme.accentGradient,
    border: 'none',
    color: '#000',
    fontWeight: '600',
    padding: '0.6rem 1.2rem',
    borderRadius: '6px',
  },
  btnSecondary: {
    background: 'transparent',
    border: `1px solid ${theme.border}`,
    color: theme.text,
    padding: '0.6rem 1.2rem',
    borderRadius: '6px',
  },
  actionBtn: {
    padding: '0.4rem 0.8rem',
    borderRadius: '6px',
    fontSize: '0.85rem',
    marginLeft: '0.5rem',
    border: 'none',
    cursor: 'pointer',
  }
};

function SortableItem({ item, onEdit, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    ...styles.card,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 999 : 'auto',
    cursor: 'default', // Default cursor for card
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div style={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
        <div 
          {...attributes} 
          {...listeners} 
          style={{ cursor: 'grab', paddingRight: '1rem', color: theme.textMuted, fontSize: '1.2rem', display: 'flex', alignItems: 'center' }}
          title="Arrastrar para reordenar"
        >
          ⠿
        </div>
        <img src={item.image || '/images/kebablogo.png'} alt={item.name} style={styles.cardImage} />
        <div>
          <h5 style={{ margin: '0 0 0.3rem 0', fontWeight: '600', color: theme.text }}>{item.name}</h5>
          <div style={{ fontSize: '0.85rem', color: theme.textMuted }}>
            <span style={{ color: theme.primary, fontWeight: 'bold' }}>${item.price.toLocaleString('es-CO')}</span>
            <span style={{ margin: '0 0.5rem' }}>•</span>
            {item.category}
            {item.kcal > 0 && <><span style={{ margin: '0 0.5rem' }}>•</span>{item.kcal} kcal</>}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button style={{ ...styles.actionBtn, backgroundColor: '#333', color: theme.primary }} onClick={() => onEdit(item)}>
          Editar
        </button>
        <button style={{ ...styles.actionBtn, backgroundColor: 'rgba(255, 68, 68, 0.1)', color: theme.secondary }} onClick={() => onDelete(item.id)}>
          Eliminar
        </button>
      </div>
    </div>
  );
}

function SortableCategoryItem({ category, onEdit, onDelete }) { // Added onEdit/onDelete logic placeholder if needed later, currently just text
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: category.id });
  
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      ...styles.card,
      marginBottom: '0.8rem',
      cursor: 'default',
    };
  
    return (
      <div ref={setNodeRef} style={style}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <div 
            {...attributes} 
            {...listeners} 
            style={{ cursor: 'grab', paddingRight: '1rem', color: theme.textMuted, fontSize: '1.2rem' }}
            >
            ⠿
            </div>
            <span style={{ fontSize: '1.1rem', fontWeight: '500' }}>{category.name}</span>
        </div>
        {/* Placeholder for future category editing */}
        {/* 
        <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button style={{...styles.actionBtn, color: theme.secondary}} onClick={() => onDelete(category.id)}>✕</button>
        </div> 
        */}
      </div>
    );
  }

export default function AdminMenuPage() {
  const [activeTab, setActiveTab] = useState('products'); // 'products' | 'categories'
  const [menu, setMenu] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');
  
  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Forms state
  const [productForm, setProductForm] = useState({
    name: '', description: '', price: '', category: '', image: '/images/kebablogo.png', kcal: '',
  });
  const [newCategoryName, setNewCategoryName] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const menuCollectionRef = collection(db, 'menu');
  const categoriesCollectionRef = collection(db, 'categories');

  // Fetch Data
  const fetchData = async () => {
    try {
      // Don't set loading true on every refresh to avoid flicker, only initial or big reloads could use it
      const [menuRes, catRes] = await Promise.all([
        getDocs(menuCollectionRef),
        getDocs(categoriesCollectionRef),
      ]);

      setMenu(menuRes.docs.map(d => ({ ...d.data(), id: d.id })).sort((a, b) => a.order - b.order));
      setCategories(catRes.docs.map(d => ({ ...d.data(), id: d.id })).sort((a, b) => a.order - b.order));
      setLoading(false);
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // --- Handlers: Product ---
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    const body = {
      ...productForm,
      price: parseFloat(productForm.price),
      kcal: productForm.kcal ? parseInt(productForm.kcal) : 0,
    };

    try {
      if (editingItem) {
        await updateDoc(doc(db, 'menu', editingItem.id), body);
      } else {
        await addDoc(menuCollectionRef, { ...body, order: menu.length });
      }
      await fetchData();
      setIsProductModalOpen(false);
      setEditingItem(null);
    } catch (e) { alert(e.message); }
  };

  const handleDeleteProduct = async (id) => {
    if (confirm('¿Eliminar producto?')) {
      await deleteDoc(doc(db, 'menu', id));
      fetchData();
    }
  };

  const openProductModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setProductForm({
        name: item.name, description: item.description, price: item.price, category: item.category,
        image: item.image, kcal: item.kcal || ''
      });
    } else {
      setEditingItem(null);
      setProductForm({ name: '', description: '', price: '', category: categories[0]?.name || '', image: '/images/kebablogo.png', kcal: '' });
    }
    setIsProductModalOpen(true);
  };

  // --- Handlers: Category ---
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    if (!newCategoryName) return;
    try {
      await addDoc(categoriesCollectionRef, { name: newCategoryName, order: categories.length });
      setNewCategoryName('');
      await fetchData();
      setIsCategoryModalOpen(false);
    } catch (e) { alert(e.message); }
  };

  // --- Handlers: DND ---
  const handleDragEnd = async (event, list, setList, collectionName) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = list.findIndex(item => item.id === active.id);
      const newIndex = list.findIndex(item => item.id === over.id);
      const newItems = arrayMove(list, oldIndex, newIndex);
      
      setList(newItems); // Optimistic UI update

      // Save to DB
      const batch = writeBatch(db);
      newItems.forEach((item, index) => {
        batch.update(doc(db, collectionName, item.id), { order: index });
      });
      await batch.commit();
    }
  };

  // --- Render Helpers ---
  const filteredMenu = selectedCategoryFilter === 'All' 
    ? menu 
    : menu.filter(item => item.category === selectedCategoryFilter);

  if (loading) return <div style={{...styles.container, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>Cargando...</div>;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Gestión del Menú</h1>
        <p style={styles.subtitle}>Administra tus productos y categorías</p>
      </div>

      {/* Top Level Navigation Tabs */}
      <div style={styles.mainTabsContainer}>
        <button style={styles.mainTab(activeTab === 'products')} onClick={() => setActiveTab('products')}>
          📦 Productos
        </button>
        <button style={styles.mainTab(activeTab === 'categories')} onClick={() => setActiveTab('categories')}>
          📑 Categorías
        </button>
      </div>

      {/* --- View: PRODUCTS --- */}
      {activeTab === 'products' && (
        <div className="animate__animated animate__fadeIn">
          <div className="d-flex justify-content-between align-items-center mb-4">
            {/* Category Filters for Products */}
            <div style={styles.filterContainer}>
              <button style={styles.filterPill(selectedCategoryFilter === 'All')} onClick={() => setSelectedCategoryFilter('All')}>
                Todos
              </button>
              {categories.map(cat => (
                <button key={cat.id} style={styles.filterPill(selectedCategoryFilter === cat.name)} onClick={() => setSelectedCategoryFilter(cat.name)}>
                  {cat.name}
                </button>
              ))}
            </div>
            
            <button className="btn" style={styles.btnPrimary} onClick={() => openProductModal()}>
              + Nuevo Producto
            </button>
          </div>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, menu, setMenu, 'menu')}>
            <SortableContext items={filteredMenu.map(i => i.id)} strategy={verticalListSortingStrategy}>
              {filteredMenu.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: theme.textMuted, border: `2px dashed ${theme.border}`, borderRadius: '12px' }}>
                  No hay productos en esta vista.
                </div>
              ) : (
                filteredMenu.map((item) => (
                  <SortableItem key={item.id} item={item} onEdit={() => openProductModal(item)} onDelete={handleDeleteProduct} />
                ))
              )}
            </SortableContext>
          </DndContext>
        </div>
      )}

      {/* --- View: CATEGORIES --- */}
      {activeTab === 'categories' && (
        <div className="animate__animated animate__fadeIn" style={{ maxWidth: '800px' }}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 style={{ margin: 0 }}>Orden de Categorías</h3>
            <button className="btn" style={styles.btnPrimary} onClick={() => setIsCategoryModalOpen(true)}>
              + Nueva Categoría
            </button>
          </div>
          
          <div style={{ backgroundColor: '#181818', padding: '1rem', borderRadius: '12px', border: `1px solid ${theme.border}` }}>
             <p style={{ fontSize: '0.9rem', color: theme.textMuted, marginBottom: '1rem' }}>
               Arrastra las categorías para cambiar el orden en que aparecen en el menú público.
             </p>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, categories, setCategories, 'categories')}>
              <SortableContext items={categories.map(c => c.id)} strategy={verticalListSortingStrategy}>
                {categories.map(cat => (
                  <SortableCategoryItem key={cat.id} category={cat} />
                ))}
              </SortableContext>
            </DndContext>
          </div>
        </div>
      )}

      {/* --- MODALS --- */}
      
      {/* Product Modal */}
      {isProductModalOpen && (
        <div className="modal fade show d-block" tabIndex={-1} style={styles.modalOverlay}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content" style={styles.modalContent}>
              <div className="modal-header border-0">
                <h5 className="modal-title" style={{color: theme.primary}}>{editingItem ? 'Editar Producto' : 'Crear Producto'}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setIsProductModalOpen(false)}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleProductSubmit}>
                  <div className="row g-3">
                    <div className="col-md-8">
                        <label className="form-label text-white-50">Nombre del Producto</label>
                        <input type="text" className="form-control" style={styles.input} value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} required />
                    </div>
                    <div className="col-md-4">
                        <label className="form-label text-white-50">Categoría</label>
                        <select className="form-select" style={styles.input} value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})} required>
                            <option value="" disabled>Seleccionar...</option>
                            {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="col-12">
                        <label className="form-label text-white-50">Descripción</label>
                        <textarea className="form-control" style={styles.input} rows="3" value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} required></textarea>
                    </div>
                    <div className="col-md-6">
                        <label className="form-label text-white-50">Precio</label>
                        <div className="input-group">
                            <span className="input-group-text" style={{backgroundColor: '#333', borderColor: '#444', color: '#fff'}}>$</span>
                            <input type="number" className="form-control" style={styles.input} value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} required step="0.01" />
                        </div>
                    </div>
                    <div className="col-md-6">
                         <label className="form-label text-white-50">Calorías (Opcional)</label>
                         <input type="number" className="form-control" style={styles.input} value={productForm.kcal} onChange={e => setProductForm({...productForm, kcal: e.target.value})} />
                    </div>
                    <div className="col-12">
                         <label className="form-label text-white-50">URL de Imagen</label>
                         <input type="text" className="form-control" style={styles.input} value={productForm.image} onChange={e => setProductForm({...productForm, image: e.target.value})} />
                         {productForm.image && <img src={productForm.image} alt="Preview" style={{height: '50px', marginTop: '10px', borderRadius: '5px'}} onError={(e) => e.target.style.display='none'} />}
                    </div>
                  </div>
                  <div className="mt-4 text-end">
                    <button type="button" className="btn me-2" style={styles.btnSecondary} onClick={() => setIsProductModalOpen(false)}>Cancelar</button>
                    <button type="submit" className="btn" style={styles.btnPrimary}>{editingItem ? 'Guardar Cambios' : 'Crear Producto'}</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {isCategoryModalOpen && (
        <div className="modal fade show d-block" tabIndex={-1} style={styles.modalOverlay}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content" style={styles.modalContent}>
                    <div className="modal-header border-0">
                        <h5 className="modal-title" style={{color: theme.primary}}>Nueva Categoría</h5>
                        <button type="button" className="btn-close btn-close-white" onClick={() => setIsCategoryModalOpen(false)}></button>
                    </div>
                    <div className="modal-body">
                        <form onSubmit={handleCategorySubmit}>
                            <div className="mb-3">
                                <label className="form-label text-white-50">Nombre</label>
                                <input type="text" className="form-control" style={styles.input} value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} required placeholder="Ej: Bebidas" />
                            </div>
                            <div className="text-end">
                                <button type="button" className="btn me-2" style={styles.btnSecondary} onClick={() => setIsCategoryModalOpen(false)}>Cancelar</button>
                                <button type="submit" className="btn" style={styles.btnPrimary}>Crear</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}