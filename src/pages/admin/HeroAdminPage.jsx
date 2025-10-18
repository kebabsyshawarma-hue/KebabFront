import { useState, useEffect, useRef } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Modal } from 'bootstrap';

export default function HeroAdminPage() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [newSlide, setNewSlide] = useState({
    title: '',
    subtitle: '',
    image: '',
    type: 'horizontal',
  });

  const [editingSlide, setEditingSlide] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const addModalRef = useRef(null);
  const editModalRef = useRef(null);

  const slidesCollectionRef = collection(db, 'heroSlides');

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const data = await getDocs(slidesCollectionRef);
        const slidesData = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        setSlides(slidesData);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSlides();
  }, []);

  useEffect(() => {
    let modalInstance = null;
    if (isAddModalOpen && addModalRef.current) {
      modalInstance = new Modal(addModalRef.current);
      modalInstance.show();
    }
    return () => {
      modalInstance?.hide();
    };
  }, [isAddModalOpen]);

  useEffect(() => {
    let modalInstance = null;
    if (editingSlide && editModalRef.current) {
      modalInstance = new Modal(editModalRef.current);
      modalInstance.show();
    }
    return () => {
      modalInstance?.hide();
    };
  }, [editingSlide]);

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
      const docRef = await addDoc(slidesCollectionRef, newSlide);
      setSlides((prev) => [...prev, { ...newSlide, id: docRef.id }]);
      setNewSlide({ title: '', subtitle: '', image: '', type: 'horizontal' });
      setIsAddModalOpen(false);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDeleteSlide = async (id) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) return;
    try {
      const slideDoc = doc(db, 'heroSlides', id);
      await deleteDoc(slideDoc);
      setSlides((prev) => prev.filter((slide) => slide.id !== id));
    } catch (error) {
      setError(error.message);
    }
  };

  const handleUpdateSlide = async (e) => {
    e.preventDefault();
    if (!editingSlide) return;

    try {
      const slideDoc = doc(db, 'heroSlides', editingSlide.id);
      const { id, ...slideData } = editingSlide;
      await updateDoc(slideDoc, slideData);

      setSlides((prev) =>
        prev.map((slide) => (slide.id === editingSlide.id ? editingSlide : slide))
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Gestionar Hero Slides</h1>
        <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
          Agregar Nuevo Slide
        </button>
      </div>

      {/* Add Slide Modal */}
      {isAddModalOpen && (
        <div className="modal fade show d-block" tabIndex="-1" ref={addModalRef}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Agregar Nuevo Slide</h5>
                <button type="button" className="btn-close" onClick={() => setIsAddModalOpen(false)}></button>
              </div>
              <div className="modal-body">
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
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>Cancelar</button>
                    <button type="submit" className="btn btn-primary">Agregar Slide</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Slide Modal */}
      {editingSlide && (
        <div className="modal fade show d-block" tabIndex="-1" ref={editModalRef}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Editando Slide {editingSlide.id}</h5>
                <button type="button" className="btn-close" onClick={() => setEditingSlide(null)}></button>
              </div>
              <div className="modal-body">
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
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setEditingSlide(null)}>Cancelar</button>
                    <button type="submit" className="btn btn-success">Guardar Cambios</button>
                  </div>
                </form>
              </div>
            </div>
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