import { useRef } from 'react';

export default function CategoryNav({ categories, activeCategory, onCategoryClick, isMenuFixed, navbarHeight, categoryNavStyles }) {
  const categoryNavRef = useRef(null);

  return (
    <nav
      ref={categoryNavRef}
      className={`
        bg-black/80 backdrop-blur-md border-b border-white/10 py-3 overflow-x-auto scrollbar-hide
        flex justify-start md:justify-center items-center gap-2 px-4
      `}
      style={categoryNavStyles}
    >
      {categories.map((category) => (
        <button
          key={category.slug}
          className={`
            whitespace-nowrap px-6 py-2 rounded-full font-bold transition-all duration-300 border-0 cursor-pointer
            ${activeCategory === category.slug 
              ? 'bg-[#FFD700] text-black shadow-[0_0_15px_rgba(255,215,0,0.3)]' 
              : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}
          `}
          onClick={() => onCategoryClick(category.slug)}
        >
          {category.name}
        </button>
      ))}
      
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}</style>
    </nav>
  );
}
