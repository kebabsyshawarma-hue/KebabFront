import { forwardRef, useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar = forwardRef(({ totalItems, navbarBackground, onMenuClick, onContactClick }, ref) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  const handleMenuClick = () => {
    onMenuClick();
    handleLinkClick();
  }

  const handleContactClick = () => {
    onContactClick();
    handleLinkClick();
  }

  const navItemClass = "d-flex align-items-center justify-content-center px-3 py-2 fw-medium text-decoration-none bg-transparent border-0 cursor-pointer transition-all";
  const textStyle = { color: '#FFD700', fontSize: '0.95rem' };

  return (
    <nav 
      ref={ref} 
      className="fixed top-0 left-0 w-full z-50 transition-colors duration-300"
      style={{ 
        backgroundColor: navbarBackground || 'transparent', 
      }}
    >
      <div className="w-full max-w-7xl mx-auto px-4 py-2 flex flex-nowrap justify-between items-center">
        
        {/* Logo */}
        <Link to="/" onClick={handleLinkClick} className="flex-shrink-0 flex items-center bg-transparent border-0 no-underline">
          <img 
            src="/images/kebablogo.png" 
            alt="Kebab Cartagena Logo" 
            style={{ height: '45px', objectFit: 'contain' }}
            className="block"
          />
        </Link>

        {/* Links & Cart */}
        <div className="flex items-center gap-3">
          
          {/* Menú de Enlaces (Desktop) */}
          <div className={`${isMenuOpen ? 'absolute top-full right-0 bg-[#1a1a1a] p-4 rounded-bl-xl shadow-xl w-48 flex flex-col items-end' : 'hidden'} lg:flex lg:static lg:bg-transparent lg:p-0 lg:shadow-none lg:w-auto lg:flex-row lg:items-center gap-1`}>
            
            {/* Toggler dentro del menú móvil para cerrar (opcional) */}
            
            <Link className={navItemClass} style={textStyle} to="/" onClick={handleLinkClick}>Inicio</Link>
            <button onClick={handleMenuClick} className={navItemClass} style={textStyle}>Menú</button>
            <button onClick={handleContactClick} className={navItemClass} style={textStyle}>Contacto</button>
            <Link className={navItemClass} style={textStyle} to="/status" onClick={handleLinkClick}>Rastrear pedido</Link>
          </div>
            
          {/* Botón de Carrito */}
          <div className="relative flex-shrink-0">
            <button
              type="button"
              data-bs-toggle="offcanvas"
              data-bs-target="#cartOffcanvas"
              aria-controls="cartOffcanvas"
              onClick={handleLinkClick}
              style={{
                backgroundColor: 'transparent',
                border: '1px solid rgba(255, 215, 0, 0.4)',
                borderRadius: '50%',
                width: '42px',
                height: '42px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFD700',
                position: 'relative',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#FFD700';
                e.currentTarget.style.color = 'black';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#FFD700';
              }}
            >
              <i className="fas fa-shopping-cart" style={{ fontSize: '1rem' }}></i>
              {totalItems > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-3px',
                  right: '-3px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  fontSize: '0.65rem',
                  fontWeight: 'bold',
                  padding: '1px 5px',
                  borderRadius: '10px',
                  border: '1px solid black'
                }}>
                  {totalItems}
                </span>
              )}
            </button>
          </div>

          {/* Mobile Toggler (Solo visible en LG hidden) */}
          <button
            className="lg:hidden bg-transparent border-0 p-2 ml-2 text-[#FFD700] text-xl"
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
          </button>

        </div>
      </div>
    </nav>
  );
});

Navbar.displayName = 'Navbar'; 
export default Navbar;