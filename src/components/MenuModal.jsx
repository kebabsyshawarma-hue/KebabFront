import React, { useEffect } from 'react';
import { useCart } from '../context/CartContext';
import styles from '../styles/menu-modal.module.css';

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

  const formattedPrice = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(item.price || 0);

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        
        {/* Left Side: Image */}
        <div className={styles.imageContainer}>
          <img src={item.image} alt={item.name} className={styles.image} />
        </div>

        {/* Right Side: Content */}
        <div className={styles.content}>
          <button className={styles.closeButton} onClick={onClose}>&times;</button>
          
          <div className={styles.header}>
            <h2 className={styles.title}>{item.name}</h2>
            <span className={styles.price}>{formattedPrice}</span>
          </div>

          <div className={styles.meta}>
            {item.kcal && (
              <span className={styles.badge}>🔥 {item.kcal} kcal</span>
            )}
            {/* Example static badge, could be dynamic based on item properties */}
            {item.tags && item.tags.map(tag => (
               <span key={tag} className={styles.badge}>{tag}</span>
            ))}
          </div>

          <p className={styles.description}>
            {item.description || "Disfruta de este delicioso plato preparado con los mejores ingredientes."}
          </p>

          <div className={styles.footer}>
            <button className={styles.addButton} onClick={handleAddToCart}>
              Agregar al Carrito
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}