import { useEffect, useRef } from 'react';
import styles from '../styles/menu.module.css';
import MenuCardPrototype from './MenuCardPrototype';

export default function MenuSection({ menu, categoryRefs, onSelectItem }) {
  const sectionRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.categorySectionVisible);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 } // Trigger when 10% of the element is visible
    );

    sectionRefs.current.forEach((ref) => {
      if (ref) {
        observer.observe(ref);
      }
    });

    return () => {
      sectionRefs.current.forEach((ref) => {
        if (ref) {
          observer.unobserve(ref);
        }
      });
    };
  }, [menu]); // Rerun when menu data changes

  const handleItemClick = (item, categoryName) => {
    onSelectItem({ ...item, category: categoryName, id: item.id.toString() });
  };

  return (
    <main className={styles.menuContainer}>
      {menu.categories.map((category, index) => (
        <section
          key={category.slug}
          id={category.slug}
          ref={(el) => {
            categoryRefs.current[category.slug] = el; // For parent navigation
            sectionRefs.current[index] = el; // For animation observer
          }}
          className={`${styles.categorySection} ${styles.categorySectionAnimated}`}
        >
          <h2 className={styles.categoryTitle}>{category.name}</h2>
          <div className={styles.itemsGrid}>
            {category.items.map((item) => (
              <MenuCardPrototype 
                key={item.id} 
                item={item} 
                onAdd={() => handleItemClick(item, category.name)} 
              />
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}