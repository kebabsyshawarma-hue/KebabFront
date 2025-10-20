import { useCart } from '../context/CartContext.jsx';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import styles from '../styles/menu.module.css';
import menuSectionStyles from '../styles/menu-section.module.css';
import Navbar from '../components/Navbar.jsx';
import HeroSection from '../components/HeroSection.jsx';
import CategoryNav from '../components/CategoryNav.jsx';
import MenuSection from '../components/MenuSection.jsx';
import ContactAndFooter from '../components/ContactAndFooter.jsx';
import CartOffcanvas from '../components/CartOffcanvas.jsx';
import SocialWidgets from '../components/SocialWidgets.jsx';
import MenuModal from '../components/MenuModal.jsx'; // Import the modal
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function HomePage() {
  const [menu, setMenu] = useState({ categories: [] });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [heroSlides, setHeroSlides] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null); // State for the modal

  const { cart, addToCart, increaseQuantity, decreaseQuantity, removeFromCart, total } = useCart();
  const navigate = useNavigate();
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const [navbarBackground, setNavbarBackground] = useState('transparent');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuFixed, setIsMenuFixed] = useState(false);
  const [placeholderHeight, setPlaceholderHeight] = useState(0);

  const navbarRef = useRef(null);
  const categoryNavRef = useRef(null);
  const isAnimatingRef = useRef(false);

  const [activeCategory, setActiveCategory] = useState(null);
  const categoryRefs = useRef({});
  const observer = useRef(null);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);
        const categoriesCollection = collection(db, 'categories');
        const categoriesSnapshot = await getDocs(categoriesCollection);
        const categoriesData = categoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const menuCollection = collection(db, 'menu');
        const menuSnapshot = await getDocs(menuCollection);
        const menuItems = menuSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const categories = {};
        menuItems.forEach(item => {
          if (!categories[item.category]) {
            const categoryData = categoriesData.find(c => c.name === item.category);
            categories[item.category] = {
              name: item.category,
              slug: item.category.toLowerCase().replace(/\s+/g, '-'),
              items: [],
              order: categoryData ? categoryData.order : 0,
            };
          }
          categories[item.category].items.push(item);
        });

        const sortedCategories = Object.values(categories).sort((a, b) => a.order - b.order);

        sortedCategories.forEach((category) => {
          category.items.sort((a, b) => a.order - b.order);
        });

        setMenu({ categories: sortedCategories });
        const allProducts = sortedCategories.flatMap((category) =>
          category.items.map((item) => ({ ...item, category: category.name }))
        );
        setProducts(allProducts);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchHeroSlides = async () => {
      try {
        const slidesCol = collection(db, 'heroSlides');
        const slideSnapshot = await getDocs(slidesCol);
        const slidesList = slideSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setHeroSlides(slidesList);
      } catch (e) {
        console.error('Error fetching hero slides:', e);
        setError(e.message);
      }
    };

    fetchMenu();
    fetchHeroSlides();
  }, []);

  // Effect for IntersectionObserver (category highlighting)
  useEffect(() => {
    if (menu.categories.length > 0) { setActiveCategory(menu.categories[0].slug); }
    observer.current = new IntersectionObserver((entries) => { entries.forEach((entry) => { if (entry.isIntersecting) { setActiveCategory(entry.target.id); } }); }, { rootMargin: '-20% 0px -80% 0px' });
    return () => { observer.current?.disconnect(); };
  }, [menu]);

  useEffect(() => {
    const currentObserver = observer.current;
    for (const slug in categoryRefs.current) { const el = categoryRefs.current[slug]; if (el) { currentObserver?.observe(el); } }
    return () => { for (const slug in categoryRefs.current) { const el = categoryRefs.current[slug]; if (el) { currentObserver?.unobserve(el); } } };
  }, [menu]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;

      if (scrollPosition > 50) {
        setNavbarBackground('#3e3d3f');
        setIsScrolled(true);
      } else {
        setNavbarBackground('transparent');
        setIsScrolled(false);
      }

      if (scrollPosition > 100) {
        if (!isMenuFixed && categoryNavRef.current) {
          setPlaceholderHeight(categoryNavRef.current.offsetHeight);
        }
        setIsMenuFixed(true);
        document.body.classList.add('menu-visible');
      } else {
        setIsMenuFixed(false);
        document.body.classList.remove('menu-visible');
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isMenuFixed]);

  useEffect(() => {
    window.addEventListener('wheel', handleSmartScroll, { passive: false });

    return () => {
      window.removeEventListener('wheel', handleSmartScroll);
    };
  }, []);

  const handleSmartScroll = (e) => {
      const menuElement = document.getElementById('menu');
      const navbarHeight = navbarRef.current?.offsetHeight || 80;
      const categoryNavHeight = categoryNavRef.current?.offsetHeight || 56;

      if (isAnimatingRef.current) {
        e.preventDefault();
        return;
      }
      if (!menuElement) return;

      if (e.deltaY > 0 && window.scrollY < 100) {
        e.preventDefault();
        isAnimatingRef.current = true;
        const menuTop = menuElement.getBoundingClientRect().top + window.scrollY;
        const targetPosition = menuTop - navbarHeight - categoryNavHeight - 60;
        window.scrollTo({ top: targetPosition, behavior: 'smooth' });
        setTimeout(() => { isAnimatingRef.current = false; }, 1000);
      }
      else if (e.deltaY < 0) {
        const menuTop = menuElement.getBoundingClientRect().top;
        if (menuTop >= 0 && menuTop < 150) {
            e.preventDefault();
            isAnimatingRef.current = true;
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setTimeout(() => { isAnimatingRef.current = false; }, 1000);
        }
      }
    };

  const handleScrollTo = (element) => {
    if (element) {
      const elementTop = element.getBoundingClientRect().top + window.scrollY;
      const navbarHeight = navbarRef.current?.offsetHeight || 80;
      const categoryNavHeight = categoryNavRef.current?.offsetHeight || 56;
      const targetPosition = elementTop - navbarHeight - categoryNavHeight - 60; // Using the same offset
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth',
      });
    }
  };

  const handleMenuButtonClick = () => {
    const menuElement = document.getElementById('menu');
    handleScrollTo(menuElement);
  };

  const handleContactClick = () => {
    const contactElement = document.getElementById('contact');
    handleScrollTo(contactElement);
  };

  const handleCategoryClick = (slug) => {
    const element = categoryRefs.current[slug];
    handleScrollTo(element);
  };

  const handleProceedToCheckout = () => {
    navigate('/checkout');
  };

  const categoryNavStyles = isMenuFixed 
    ? {
        position: 'fixed',
        top: navbarRef.current ? `${navbarRef.current.offsetHeight}px` : '80px',
        left: 0,
        width: '100%',
        zIndex: 999,
        transform: 'translateY(0)',
        transition: 'transform 0.3s ease-out',
      }
    : {
        position: 'absolute',
        top: 0,
        zIndex: 999,
        width: '100%',
        transform: 'translateY(-100%)',
        transition: 'transform 0.3s ease-in',
      };

  if (loading) return <div className="container py-5 text-center">Cargando el menú de Kebab...</div>;
  if (error) return <div className="container py-5 text-center text-danger">Error al cargar el menú: {error}</div>;

  return (
    <>
      <div style={{ backgroundColor: '#f8f9fa' }}>
        <Navbar ref={navbarRef} totalItems={totalItems} navbarBackground={navbarBackground} onMenuClick={handleMenuButtonClick} onContactClick={handleContactClick} />
        <HeroSection heroSlides={heroSlides} isMobile={isMobile} isScrolled={isScrolled} />
        <CategoryNav categories={menu.categories} activeCategory={activeCategory} onCategoryClick={handleCategoryClick} isMenuFixed={isMenuFixed} navbarHeight={navbarRef.current?.offsetHeight || 80} categoryNavStyles={categoryNavStyles} />
        <main id="menu" className={`${menuSectionStyles.menuSection} ${isScrolled ? menuSectionStyles.visible : ''}`}>
          <div className={styles.pageContainer}>
            {isMenuFixed && (
              <div style={{ height: `${placeholderHeight}px` }} />
            )}
            <MenuSection menu={menu} categoryRefs={categoryRefs} onSelectItem={setSelectedItem} />
          </div>
        </main>
        <ContactAndFooter />
      </div>
      <CartOffcanvas handleProceedToCheckout={handleProceedToCheckout} />
      <SocialWidgets />

      {/* Render the modal at the top level */}
      {selectedItem && (
        <MenuModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
    </>
  );
}