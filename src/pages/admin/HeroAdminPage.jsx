import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';

// --- Theme & Styles ---
const theme = {
  bg: '#121212',
  surface: '#1E1E1E',
  border: '#333333',
  primary: '#FFD700', // Gold
  secondary: '#FF4444',
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
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    background: theme.accentGradient,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    margin: 0,
  },
  subtitle: {
    color: theme.textMuted,
    marginTop: '0.5rem',
  },
  // Cards Grid
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.5rem',
  },
  card: {
    backgroundColor: theme.surface,
    border: `1px solid ${theme.border}`,
    borderRadius: '12px',
    overflow: 'hidden',
    transition: 'transform 0.2s, box-shadow 0.2s',
    display: 'flex',
    flexDirection: 'column',
  },
  cardImageContainer: {
    position: 'relative',
    height: '200px',
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'opacity 0.3s',
  },
  cardBadge: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    backgroundColor: 'rgba(0,0,0,0.7)',
    color: theme.primary,
    padding: '0.3rem 0.6rem',
    borderRadius: '4px',
    fontSize: '0.75rem',
    fontWeight: '600',
    border: `1px solid ${theme.primary}`,
  },
  cardBody: {
    padding: '1.2rem',
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  cardTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: theme.text,
    marginBottom: '0.5rem',
  },
  cardText: {
    color: theme.textMuted,
    fontSize: '0.9rem',
    marginBottom: '1rem',
    flexGrow: 1,
  },
  cardActions: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: 'auto',
  },
  // Buttons
  btnPrimary: {
    background: theme.accentGradient,
    border: 'none',
    color: '#000',
    fontWeight: '600',
    padding: '0.6rem 1.2rem',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  btnSecondary: {
    background: 'transparent',
    border: `1px solid ${theme.border}`,
    color: theme.text,
    padding: '0.6rem 1.2rem',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  actionBtn: {
    flex: 1,
    padding: '0.5rem',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '0.9rem',
  },
  // Modal
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.85)',
    backdropFilter: 'blur(5px)',
    zIndex: 1050,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1E1E1E',
    border: `1px solid ${theme.border}`,
    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
    color: theme.text,
    width: '90%',
    maxWidth: '500px',
    borderRadius: '12px',
    padding: '0', // Bootstrap modal structure handles padding
    overflow: 'hidden',
  },
  input: {
    backgroundColor: '#2A2A2A',
    border: `1px solid ${theme.border}`,
    color: theme.text,
    borderRadius: '6px',
    padding: '0.7rem',
    width: '100%',
    marginBottom: '1rem',
    outline: 'none',
  },
  label: {
    color: theme.textMuted,
    marginBottom: '0.4rem',
    display: 'block',
    fontSize: '0.9rem',
  }
};

export default function HeroAdminPage() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [slideForm, setSlideForm] = useState({
    title: '',
    subtitle: '',
    image: '',
    type: 'horizontal',
  });

  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const openModal = (slide = null) => {
    if (slide) {
      setEditingId(slide.id);
      setSlideForm({
        title: slide.title,
        subtitle: slide.subtitle,
        image: slide.image,
        type: slide.type,
      });
    } else {
      setEditingId(null);
      setSlideForm({ title: '', subtitle: '', image: '', type: 'horizontal' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSlideForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        // Update
        const slideDoc = doc(db, 'heroSlides', editingId);
        await updateDoc(slideDoc, slideForm);
        setSlides(prev => prev.map(s => s.id === editingId ? { ...s, ...slideForm } : s));
      } else {
        // Create
        const docRef = await addDoc(slidesCollectionRef, slideForm);
        setSlides(prev => [...prev, { ...slideForm, id: docRef.id }]);
      }
      closeModal();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este slide permanentemente?')) return;
    try {
      await deleteDoc(doc(db, 'heroSlides', id));
      setSlides((prev) => prev.filter((slide) => slide.id !== id));
    } catch (error) {
      alert(error.message);
    }
  };

  if (loading) return <div style={{...styles.container, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>Cargando slides...</div>;
  if (error) return <div style={{...styles.container, color: theme.secondary}}>Error: {error}</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
           <h1 style={styles.title}>Hero Slides</h1>
           <p style={styles.subtitle}>Imágenes del carrusel principal</p>
        </div>
        <button style={styles.btnPrimary} onClick={() => openModal()}>
          + Nuevo Slide
        </button>
      </div>

      <div style={styles.grid}>
        {slides.length === 0 ? (
          <div style={{gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: theme.textMuted, border: `2px dashed ${theme.border}`, borderRadius: '12px'}}>
             No hay slides configurados.
          </div>
        ) : (
          slides.map((slide) => (
            <div key={slide.id} style={styles.card}>
              <div style={styles.cardImageContainer}>
                 <img src={slide.image} alt={slide.title} style={styles.cardImage} />
                 <span style={styles.cardBadge}>{slide.type === 'horizontal' ? '🖥️ PC' : '📱 Móvil'}</span>
              </div>
              <div style={styles.cardBody}>
                <h5 style={styles.cardTitle}>{slide.title}</h5>
                <p style={styles.cardText}>{slide.subtitle}</p>
                <div style={styles.cardActions}>
                  <button style={{...styles.actionBtn, backgroundColor: '#333', color: theme.primary}} onClick={() => openModal(slide)}>
                    Editar
                  </button>
                  <button style={{...styles.actionBtn, backgroundColor: 'rgba(255, 68, 68, 0.1)', color: theme.secondary}} onClick={() => handleDelete(slide.id)}>
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Unified Modal */}
      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div className="modal-dialog modal-dialog-centered" style={{width: '100%', maxWidth: '500px', margin: '1rem'}}>
            <div className="modal-content" style={styles.modalContent}>
              <div className="modal-header border-0" style={{padding: '1.5rem 1.5rem 0.5rem 1.5rem'}}>
                <h5 className="modal-title" style={{color: theme.primary}}>{editingId ? 'Editar Slide' : 'Nuevo Slide'}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={closeModal}></button>
              </div>
              <div className="modal-body" style={{padding: '1.5rem'}}>
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label style={styles.label}>Título Principal</label>
                    <input
                      type="text"
                      style={styles.input}
                      name="title"
                      value={slideForm.title}
                      onChange={handleInputChange}
                      required
                      placeholder="Ej: Bienvenidos a Kebabs"
                    />
                  </div>
                  <div className="mb-3">
                    <label style={styles.label}>Subtítulo</label>
                    <input
                      type="text"
                      style={styles.input}
                      name="subtitle"
                      value={slideForm.subtitle}
                      onChange={handleInputChange}
                      required
                      placeholder="Ej: El mejor sabor de la ciudad"
                    />
                  </div>
                  <div className="mb-3">
                    <label style={styles.label}>URL de Imagen</label>
                    <input
                      type="text"
                      style={styles.input}
                      name="image"
                      value={slideForm.image}
                      onChange={handleInputChange}
                      required
                      placeholder="https://..."
                    />
                    {slideForm.image && (
                       <div style={{height: '100px', borderRadius: '6px', overflow: 'hidden', marginTop: '0.5rem', border: `1px solid ${theme.border}`}}>
                          <img src={slideForm.image} alt="Preview" style={{width: '100%', height: '100%', objectFit: 'cover'}} onError={(e) => e.target.style.display='none'}/>
                       </div>
                    )}
                  </div>
                  <div className="mb-4">
                    <label style={styles.label}>Tipo de Dispositivo</label>
                    <select
                      className="form-select"
                      style={styles.input}
                      name="type"
                      value={slideForm.type}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="horizontal">🖥️ Horizontal (PC/Tablet)</option>
                      <option value="vertical">📱 Vertical (Móviles)</option>
                    </select>
                  </div>
                  <div className="text-end">
                    <button type="button" className="btn me-2" style={styles.btnSecondary} onClick={closeModal}>Cancelar</button>
                    <button type="submit" className="btn" style={styles.btnPrimary}>{editingId ? 'Guardar Cambios' : 'Crear Slide'}</button>
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