import { useEffect, useRef } from 'react';
import styles from '../styles/menu.module.css';

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
              <div key={item.id} className={styles.menuItem} onClick={() => handleItemClick(item, category.name)}>
                <div className={styles.itemImageContainer}>
                  <img src={item.image} alt={item.name} width={150} height={100} className={styles.itemImage} />
                </div>
                <div className={styles.itemInfo}>
                  <h3 className={styles.itemName}>{item.name}</h3>
                  <p className={styles.itemDescription}>{item.description}</p>
                  <div className={styles.itemFooter}>
                    <p className={styles.itemPrice}>${item.price.toLocaleString('es-CO')}</p>
                    {item.kcal && <p className={styles.itemKcal}>{item.kcal} kcal</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}