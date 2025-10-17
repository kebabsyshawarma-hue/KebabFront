import { useState, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
// import { MenuItem as ProductItem, Category as ProductCategory } from '../../../types'; // types.js is now empty

function SortableItem(props) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: props.item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <tr ref={setNodeRef} style={style}>
      <td {...attributes} {...listeners} style={{ cursor: 'grab' }}>
        &#x2630;
      </td>
      <td>{props.item.order}</td>
      <td>{props.item.name}</td>
      <td>{props.item.category}</td>
      <td>${props.item.price.toLocaleString('es-CO')}</td>
      <td>{props.item.kcal}</td>
      <td>
        <button className="btn btn-sm btn-warning me-2" onClick={() => props.onEdit(props.item)}>Editar</button>
        <button className="btn btn-sm btn-danger" onClick={() => props.onDelete(props.item.id)}>Eliminar</button>
      </td>
    </tr>
  );
}

function SortableCategoryItem(props) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: props.category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    padding: '10px',
    border: '1px solid #ccc',
    marginBottom: '5px',
    backgroundColor: 'white',
    cursor: 'grab',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {props.category.name}
    </div>
  );
}

export default function AdminMenuPage() {
  const [menu, setMenu] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [formState, setFormState] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '/images/kebablogo.png',
    kcal: '',
  });

  const [newCategoryName, setNewCategoryName] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchMenu = async () => {
    try {
      setLoading(true);
      // TODO: Replace with Firebase Function URL
      const response = await fetch('http://127.0.0.1:5001/demo-no-project/us-central1/getMenu');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      const allItems = data.categories.flatMap((category) => 
        category.items.map((item) => ({ ...item, category: category.name }))
      ).sort((a, b) => a.order - b.order);
      setMenu(allItems);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      // TODO: Replace with Firebase Function URL
      const response = await fetch('http://127.0.0.1:5001/demo-no-project/us-central1/getCategories');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setCategories(data.sort((a, b) => a.order - b.order));
    } catch (e) {
      console.error("Failed to fetch categories", e);
    }
  };

  useEffect(() => {
    fetchMenu();
    fetchCategories();
  }, []);

  const openModalForNew = () => {
    setEditingItem(null);
    setFormState({ name: '', description: '', price: '', category: categories[0]?.name || '', image: '/images/kebablogo.png', kcal: '' });
    setIsModalOpen(true);
  };

  const openModalForEdit = (item) => {
    setEditingItem(item);
    setFormState({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      image: item.image,
      kcal: item.kcal?.toString() || '',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleFormChange = (e) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    // TODO: Replace with Firebase Function URL
    const url = editingItem ? `http://127.0.0.1:5001/demo-no-project/us-central1/manageMenuItem/${editingItem.id}` : 'http://127.0.0.1:5001/demo-no-project/us-central1/addMenuItem';
    const method = editingItem ? 'PUT' : 'POST';

    const body = {
      ...formState,
      price: parseFloat(formState.price),
      kcal: formState.kcal ? parseInt(formState.kcal) : undefined,
      order: editingItem ? editingItem.order : menu.length,
    };

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      await fetchMenu();
      closeModal();

    } catch (e) {
      alert(`Error: ${e.message}`);
    }
  };

  const handleDeleteItem = async (id) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) return;
    try {
      // TODO: Replace with Firebase Function URL
      const response = await fetch(`http://127.0.0.1:5001/demo-no-project/us-central1/manageMenuItem/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      await fetchMenu();
    } catch (e) {
      alert(`Error al eliminar producto: ${e.message}`);
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    if (!newCategoryName) return;
    try {
      // TODO: Replace with Firebase Function URL
      const response = await fetch('http://127.0.0.1:5001/demo-no-project/us-central1/addCategory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName, order: categories.length }),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      setNewCategoryName('');
      fetchCategories();
      setIsCategoryModalOpen(false);
    } catch (e) {
      alert(`Error: ${e.message}`);
    }
  };

  async function handleDragEnd(event) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setMenu((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        return newItems.map((item, index) => ({ ...item, order: index }));
      });
    }
  }

  async function handleCategoryDragEnd(event) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setCategories((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        return newItems.map((item, index) => ({ ...item, order: index }));
      });
    }
  }

  const saveOrder = async () => {
    try {
      // TODO: Replace with Firebase Function URL
      const response = await fetch('http://127.0.0.1:5001/demo-no-project/us-central1/updateMenuOrder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(menu),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      alert('Order saved successfully!');
    } catch (e) {
      alert(`Error saving order: ${e.message}`);
    }
  };

  const saveCategoryOrder = async () => {
    try {
      // TODO: Replace with Firebase Function URL
      const response = await fetch('http://127.0.0.1:5001/demo-no-project/us-central1/updateCategoryOrder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categories),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      alert('Category order saved successfully!');
    } catch (e) {
      alert(`Error saving category order: ${e.message}`);
    }
  };

  if (loading) return <div className="container py-5 text-center">Cargando menú...</div>;
  if (error) return <div className="container py-5 text-center text-danger">Error al cargar menú: {error}</div>;

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Panel de Administración - Menú</h1>
        <div>
          <button className="btn btn-secondary me-2" onClick={() => setIsCategoryModalOpen(true)}>
            Crear Categoría
          </button>
          <button className="btn btn-primary me-2" onClick={openModalForNew}>
            Añadir Nuevo Producto
          </button>
          <button className="btn btn-success" onClick={saveOrder}>
            Guardar Orden de Productos
          </button>
        </div>
      </div>

      <div className="row">
        <div className="col-md-8">
          <h2>Productos</h2>
          <div className="table-responsive">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={menu} strategy={verticalListSortingStrategy}>
                <table className="table table-striped table-hover">
                  <thead>
                    <tr>
                      <th></th>
                      <th>Orden</th>
                      <th>Nombre</th>
                      <th>Categoría</th>
                      <th>Precio</th>
                      <th>Kcal</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {menu.map((item) => (
                      <SortableItem key={item.id} item={item} onEdit={openModalForEdit} onDelete={handleDeleteItem} />
                    ))}
                  </tbody>
                </table>
              </SortableContext>
            </DndContext>
          </div>
        </div>
        <div className="col-md-4">
          <h2>Categorías</h2>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleCategoryDragEnd}>
            <SortableContext items={categories} strategy={verticalListSortingStrategy}>
              {categories.map(cat => (
                <SortableCategoryItem key={cat.id} category={cat} />
              ))}
            </SortableContext>
          </DndContext>
          <button className="btn btn-success mt-3" onClick={saveCategoryOrder}>
            Guardar Orden de Categorías
          </button>
        </div>
      </div>

      {isCategoryModalOpen && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <form onSubmit={handleCategorySubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">Crear Nueva Categoría</h5>
                  <button type="button" className="btn-close" onClick={() => setIsCategoryModalOpen(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="newCategoryName" className="form-label">Nombre de la Categoría</label>
                    <input type="text" className="form-control" id="newCategoryName" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} required />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setIsCategoryModalOpen(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary">Crear</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <form onSubmit={handleFormSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">{editingItem ? 'Editar Producto' : 'Añadir Nuevo Producto'}</h5>
                  <button type="button" className="btn-close" onClick={closeModal}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">Nombre</label>
                    <input type="text" className="form-control" id="name" name="name" value={formState.name} onChange={handleFormChange} required />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="description" className="form-label">Descripción</label>
                    <textarea className="form-control" id="description" name="description" value={formState.description} onChange={handleFormChange} required></textarea>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="price" className="form-label">Precio</label>
                    <input type="number" className="form-control" id="price" name="price" value={formState.price} onChange={handleFormChange} required step="0.01" />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="kcal" className="form-label">Kcal</label>
                    <input type="number" className="form-control" id="kcal" name="kcal" value={formState.kcal} onChange={handleFormChange} step="1" />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="category" className="form-label">Categoría</label>
                    <select className="form-control" id="category" name="category" value={formState.category} onChange={handleFormChange} required>
                      <option value="" disabled>Selecciona una categoría</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="image" className="form-label">URL de Imagen</label>
                    <input type="text" className="form-control" id="image" name="image" value={formState.image} onChange={handleFormChange} />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancelar</button>
                  <button type="submit" className="btn btn-primary">
                    {editingItem ? 'Actualizar Producto' : 'Añadir Producto'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}