import { useEffect, useRef } from 'react';
import MenuCardPrototype from './MenuCardPrototype';

export default function MenuSection({ menu, categoryRefs, onSelectItem }) {
  const sectionRefs = useRef([]);

  // Intersection Observer para animaciones de entrada (fade-up)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove('opacity-0', 'translate-y-12');
            entry.target.classList.add('opacity-100', 'translate-y-0');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    sectionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      sectionRefs.current.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, [menu]);

  const handleItemClick = (item, categoryName) => {
    onSelectItem({ ...item, category: categoryName, id: item.id.toString() });
  };

  return (
    <main className="w-full max-w-[1400px] mx-auto pb-20 px-0 md:px-8 pt-0 md:pt-10">
      {menu.categories.map((category, index) => (
        <section
          key={category.slug}
          id={category.slug}
          ref={(el) => {
            categoryRefs.current[category.slug] = el;
            sectionRefs.current[index] = el;
          }}
          className={`scroll-mt-40 md:scroll-mt-52 mb-16 transition-all duration-700 ease-out opacity-0 translate-y-12 ${index === 0 ? 'pt-4 md:pt-0' : ''}`}
        >
          {/* Category Title */}
          <div className="flex items-center gap-4 mb-8 px-4 md:px-0">
            <h2 
              className="text-3xl md:text-5xl font-black text-[#FFD700] uppercase tracking-wide drop-shadow-md"
              style={{ fontFamily: "'Lalezar', cursive" }}
            >
              {category.name}
            </h2>
            <div className="h-[2px] flex-grow bg-gradient-to-r from-[#FFD700]/50 to-transparent rounded-full"></div>
          </div>

          {/* 
              HYBRID LAYOUT:
              - Mobile: Horizontal Scroll (Snap Carousel)
              - Desktop: Responsive Grid
          */}
          <div className="
            flex overflow-x-auto snap-x snap-mandatory gap-4 px-4 pb-8 -mx-4 md:mx-0
            md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-8 md:overflow-visible md:pb-0
            scrollbar-hide
          ">
            {category.items.map((item) => (
              <div key={item.id} className="snap-center flex-shrink-0">
                <MenuCardPrototype 
                  item={item} 
                  onAdd={() => handleItemClick(item, category.name)} 
                />
              </div>
            ))}
          </div>
        </section>
      ))}
      
      {/* Utility style to hide scrollbar but keep functionality */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}</style>
    </main>
  );
}
