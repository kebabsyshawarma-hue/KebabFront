import { forwardRef, useRef, useState } from 'react';
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

  return (
    <nav ref={ref} className="navbar navbar-expand-lg navbar-dark py-3" style={{ position: 'fixed', width: '100%', zIndex: 1000, backgroundColor: navbarBackground, transition: 'background-color 0.3s ease-in-out' }}>
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/" onClick={handleLinkClick}>
          <img src="/images/kebablogo.png" alt="Kebab Cartagena Logo" width={200} height={50} style={{ objectFit: 'contain' }} />
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          aria-controls="navbarNav"
          aria-expanded={isMenuOpen}
          aria-label="Toggle navigation"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${isMenuOpen ? 'show' : ''}`} id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center">
            <li className="nav-item">
              <Link className="nav-link mx-1 nav-link-gold" to="/" onClick={handleLinkClick}>Inicio</Link>
            </li>
            <li className="nav-item">
              <button onClick={handleMenuClick} className="nav-link mx-1 nav-link-gold">Menú</button>
            </li>
            <li className="nav-item">
              <button onClick={handleContactClick} className="nav-link mx-1 nav-link-gold">Contacto</button>
            </li>
            <li className="nav-item">
              <Link className="nav-link mx-1 nav-link-gold" to="/status" onClick={handleLinkClick}>Rastrear mi pedido</Link>
            </li>
            <li className="nav-item ms-lg-3">
              <button
                className="btn btn-outline-light border-2 px-3 py-2 rounded-pill position-relative"
                type="button"
                data-bs-toggle="offcanvas"
                data-bs-target="#cartOffcanvas"
                aria-controls="cartOffcanvas"
                onClick={handleLinkClick}
              >
                <i className="fas fa-shopping-cart"></i>
                {totalItems > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning text-dark">
                    {totalItems}
                    <span className="visually-hidden">items in cart</span>
                  </span>
                )}
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
});

export default Navbar;