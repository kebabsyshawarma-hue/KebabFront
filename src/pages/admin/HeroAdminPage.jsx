import { useState, useEffect } from 'react';
// import { HeroSlide } from '../../../types'; // types.js is now empty

export default function HeroAdminPage() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [newSlide, setNewSlide] = useState({
    title: '',
    subtitle: '',
    image: '',
    type: 'horizontal', // Default to horizontal
  });

  const [editingSlide, setEditingSlide] = useState(null);

  useEffect(() => {
    async function fetchSlides() {
      try {
        // TODO: Replace with Firebase Function URL
        const response = await fetch('http://127.0.0.1:5001/demo-no-project/us-central1/getHeroSlides');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setSlides(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }

    fetchSlides();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSlide((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditingSlide((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleAddSlide = async (e) => {
    e.preventDefault();
    try {
      // TODO: Replace with Firebase Function URL
      const response = await fetch('http://127.0.0.1:5001/demo-no-project/us-central1/addHeroSlide', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSlide),
      });

      if (!response.ok) {
        throw new Error('Error al agregar el slide');
      }

      const addedSlide = await response.json();
      setSlides((prev) => [...prev, addedSlide.slide]);
      setNewSlide({ title: '', subtitle: '', image: '', type: 'horizontal' });
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDeleteSlide = async (id) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) return;
    try {
      // TODO: Replace with Firebase Function URL
      const response = await fetch(`http://127.0.0.1:5001/demo-no-project/us-central1/manageHeroSlide/${id}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        throw new Error('Error al eliminar el slide');
      }

      setSlides((prev) => prev.filter((slide) => slide.id !== id));
    } catch (error) {
      setError(error.message);
    }
  };

  const handleUpdateSlide = async (e) => {
    e.preventDefault();
    if (!editingSlide) return;

    try {
      // TODO: Replace with Firebase Function URL
      const response = await fetch(`http://127.0.0.1:5001/demo-no-project/us-central1/manageHeroSlide/${editingSlide.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(editingSlide),
        }
      );

      if (!response.ok) {
        throw new Error('Error al actualizar el slide');
      }

      const updatedSlide = await response.json();
      setSlides((prev) =>
        prev.map((slide) => (slide.id === updatedSlide.slide.id ? updatedSlide.slide : slide))
      );
      setEditingSlide(null);
    } catch (error) {
      setError(error.message);
    }
  };

  if (loading) {
    return <div className="container py-5 text-center">Cargando slides...</div>;
  }

  if (error) {
    return <div className="container py-5 text-center text-danger">Error al cargar slides: {error}</div>;
  }

  return (
    <div className="container py-5">
      <h1 className="mb-4">Gestionar Hero Slides</h1>

      <div className="card mb-4">
        <div className="card-header">Agregar Nuevo Slide</div>
        <div className="card-body">
          <form onSubmit={handleAddSlide}>
            <div className="mb-3">
              <label htmlFor="title" className="form-label">Título</label>
              <input
                type="text"
                className="form-control"
                id="title"
                name="title"
                value={newSlide.title}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="subtitle" className="form-label">Subtítulo</label>
              <input
                type="text"
                className="form-control"
                id="subtitle"
                name="subtitle"
                value={newSlide.subtitle}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="image" className="form-label">URL de la Imagen</label>
              <input
                type="text"
                className="form-control"
                id="image"
                name="image"
                value={newSlide.image}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="type" className="form-label">Tipo</label>
              <select
                className="form-select"
                id="type"
                name="type"
                value={newSlide.type}
                onChange={handleInputChange}
                required
              >
                <option value="horizontal">Horizontal</option>
                <option value="vertical">Vertical</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary">Agregar Slide</button>
          </form>
        </div>
      </div>

      {editingSlide && (
        <div className="card mb-4">
          <div className="card-header">Editando Slide {editingSlide.id}</div>
          <div className="card-body">
            <form onSubmit={handleUpdateSlide}>
              <div className="mb-3">
                <label htmlFor="edit-title" className="form-label">Título</label>
                <input
                  type="text"
                  className="form-control"
                  id="edit-title"
                  name="title"
                  value={editingSlide.title}
                  onChange={handleEditInputChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="edit-subtitle" className="form-label">Subtítulo</label>
                <input
                  type="text"
                  className="form-control"
                  id="edit-subtitle"
                  name="subtitle"
                  value={editingSlide.subtitle}
                  onChange={handleEditInputChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="edit-image" className="form-label">URL de la Imagen</label>
                <input
                  type="text"
                  className="form-control"
                  id="edit-image"
                  name="image"
                  value={editingSlide.image}
                  onChange={handleEditInputChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="edit-type" className="form-label">Tipo</label>
                <select
                  className="form-select"
                  id="edit-type"
                  name="type"
                  value={editingSlide.type}
                  onChange={handleEditInputChange}
                  required
                >
                  <option value="horizontal">Horizontal</option>
                  <option value="vertical">Vertical</option>
                </select>
              </div>
              <button type="submit" className="btn btn-success me-2">Guardar Cambios</button>
              <button type="button" className="btn btn-secondary" onClick={() => setEditingSlide(null)}>Cancelar</button>
            </form>
          </div>
        </div>
      )}

      <h2>Slides Actuales</h2>
      <div className="row">
        {slides.length === 0 ? (
          <p>No hay slides para mostrar.</p>
        ) : (
          slides.map((slide) => (
            <div key={slide.id} className="col-md-4 mb-4">
              <div className="card">
                <img src={slide.image} className="card-img-top" alt={slide.title} />
                <div className="card-body">
                  <h5 className="card-title">{slide.title}</h5>
                  <p className="card-text">{slide.subtitle}</p>
                  {console.log('Slide Image:', slide.image, 'Slide Subtitle:', slide.subtitle)}
                  <p className="card-text"><small className="text-muted">Tipo: {slide.type}</small></p>
                  <button className="btn btn-primary me-2" onClick={() => setEditingSlide(slide)}>Editar</button>
                  <button className="btn btn-danger" onClick={() => handleDeleteSlide(slide.id)}>Eliminar</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}