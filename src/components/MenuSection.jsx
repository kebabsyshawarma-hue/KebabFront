import styles from '../styles/menu.module.css'; // Adjusted path
// import { MenuData, Product } from '../types'; // Adjusted path - types.js is now empty

export default function MenuSection({ menu, categoryRefs, addToCart }) {
  return (
    <main className={styles.menuContainer}>
      {menu.categories.map((category) => (
        <section
          key={category.slug}
          id={category.slug}
          ref={(el) => (categoryRefs.current[category.slug] = el)}
          className={styles.categorySection}
        >
          <h2 className={styles.categoryTitle}>{category.name}</h2>
          <div className={styles.itemsGrid}>
            {category.items.map((item) => (
              <div key={item.id} className={styles.menuItem} onClick={() => addToCart({ ...item, category: category.name, id: item.id.toString() })}>
                <div className={styles.itemImageContainer}>
                  {/* Replaced next/image with standard img tag */}
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