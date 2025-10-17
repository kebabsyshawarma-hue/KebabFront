import { useRef } from 'react';
import styles from '../styles/menu.module.css'; // Adjusted path
// import { Category } from '../types'; // Adjusted path - types.js is now empty

export default function CategoryNav({ categories, activeCategory, onCategoryClick, isMenuFixed, navbarHeight, categoryNavStyles }) {
  const categoryNavRef = useRef(null);

  return (
    <nav
      ref={categoryNavRef}
      className={styles.categoryNav}
      style={categoryNavStyles}
    >
      {categories.map((category) => (
        <button
          key={category.slug}
          className={`${styles.categoryButton} ${activeCategory === category.slug ? styles.active : ''}`}
          onClick={() => onCategoryClick(category.slug)}
        >
          {category.name}
        </button>
      ))}
    </nav>
  );
}