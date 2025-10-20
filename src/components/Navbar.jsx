import { forwardRef } from 'react';
import { Link } from 'react-router-dom';

const Navbar = forwardRef(({ totalItems, navbarBackground, onMenuClick, onContactClick }, ref) => {
  return (
    <nav ref={ref} className="navbar navbar-expand-lg navbar-dark py-3" style={{ position: 'fixed', width: '100%', zIndex: 1000, backgroundColor: navbarBackground, transition: 'background-color 0.3s ease-in-out' }}>
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">
          <img src="/images/kebablogo.png" alt="Kebab Cartagena Logo" width={200} height={50} style={{ objectFit: 'contain' }} />
        </Link>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center">
            <li className="nav-item">
              <Link className="nav-link mx-2 nav-link-gold" to="/">Inicio</Link>
            </li>
            <li className="nav-item">
              <button onClick={onMenuClick} className="nav-link btn btn-link mx-2 nav-link-gold">Menú</button>
            </li>
            <li className="nav-item">
              <button onClick={onContactClick} className="nav-link btn btn-link mx-2 nav-link-gold">Contacto</button>
            </li>
            <li className="nav-item">
              <Link className="nav-link mx-2 nav-link-gold" to="/status">Rastrear mi pedido</Link>
            </li>
            <li className="nav-item ms-lg-3">
              <button
                className="btn btn-outline-light border-2 px-3 py-2 rounded-pill position-relative"
                type="button"
                data-bs-toggle="offcanvas"
                data-bs-target="#cartOffcanvas"
                aria-controls="cartOffcanvas"
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