import React, { useEffect } from 'react';
import { useCart } from '../context/CartContext';

export default function MenuModal({ item, onClose }) {
  const { addToCart } = useCart();

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  if (!item) return null;

  const handleAddToCart = () => {
    addToCart(item);
    onClose();
  };

  const backdropStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1040,
  };

  const modalStyle = {
    background: '#2c2c2c',
    borderRadius: '8px',
    width: '90%',
    maxWidth: '500px',
    zIndex: 1050,
    color: '#f8f9fa',
    border: '1px solid #444',
  };

  const modalHeaderStyle = {
    display: 'flex',
    alignItems: 'center',
    padding: '1rem 1.5rem',
    borderBottom: '1px solid #444',
  };

  const rectangleStyle = {
    width: '5px',
    height: '2rem',
    backgroundColor: '#A52A2A', // Brand red color
    marginRight: '1rem',
    borderRadius: '2px',
  };

  const modalTitleStyle = {
    margin: 0,
    fontFamily: 'var(--font-playfair-display)',
    color: '#ffcc00',
    fontSize: '1.75rem',
  };

  const modalBodyStyle = {
    padding: '1.5rem',
  };

  const modalFooterStyle = {
    padding: '1rem 1.5rem',
    borderTop: '1px solid #444',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '1rem',
  };

  const imageStyle = {
    width: '100%',
    maxHeight: '40vh',
    objectFit: 'cover',
    borderRadius: '8px',
    marginBottom: '1rem',
  };

  return (
    <div style={backdropStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={modalHeaderStyle}>
          <div style={rectangleStyle}></div>
          <h2 style={modalTitleStyle}>{item.name || 'No Name'}</h2>
        </div>

        <div style={modalBodyStyle}>
          <img src={item.image} alt={item.name || 'Menu item'} style={imageStyle} />
          <p>{item.description || 'No description available.'}</p>
          <p style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
            {typeof item.price === 'number'
              ? `$${item.price.toLocaleString('es-CO')}`
              : 'Price not available'}
          </p>
        </div>

        <div style={modalFooterStyle}>
          <button type="button" className="btn btn-outline-light" onClick={onClose}>Cerrar</button>
          <button type="button" className="btn btn-primary" style={{ backgroundColor: '#ffcc00', borderColor: '#ffcc00', color: '#333' }} onClick={handleAddToCart}>
            Agregar al Carrito
          </button>
        </div>
      </div>
    </div>
  );
}
