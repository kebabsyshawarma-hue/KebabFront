import React from 'react';
import styles from '../styles/menu-card-prototype.module.css';

const MenuCardPrototype = ({ 
  item, 
  onAdd 
}) => {
  if (!item) return null;

  // Format price
  const formattedPrice = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(item.price);

  return (
    <div className={styles.cardContainer} onClick={() => onAdd && onAdd(item)}>
      
      {/* Tags Floating Top Right */}
      <div className={styles.tags}>
        {item.tags && item.tags.includes('Nuevo') && (
          <span className={`${styles.tag} ${styles.tagGold}`}>NUEVO</span>
        )}
        {item.kcal && (
          <span className={`${styles.tag}`} style={{ background: 'rgba(255,255,255,0.2)' }}>{item.kcal} kcal</span>
        )}
      </div>

      {/* Background Image */}
      <div className={styles.imageLayer}>
        <img 
          src={item.image} 
          alt={item.name} 
          className={styles.image}
          loading="lazy"
        />
      </div>

      {/* Glassmorphism Overlay */}
      <div className={styles.overlay}>
        <div className={styles.header}>
          <h3 className={styles.title}>{item.name}</h3>
          <span className={styles.price}>{formattedPrice}</span>
        </div>

        <div className={styles.details}>
          <p className={styles.description}>
            {item.description}
          </p>
          <button className={styles.actionButton}>
            Agregar al Carrito
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuCardPrototype;
