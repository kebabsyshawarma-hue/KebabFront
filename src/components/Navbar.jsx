import { forwardRef } from 'react';

const Navbar = forwardRef(({ totalItems, navbarBackground, onMenuClick }, ref) => {
  return (
    <nav ref={ref} className="navbar navbar-dark py-3" style={{ position: 'fixed', width: '100%', zIndex: 1000, backgroundColor: navbarBackground, transition: 'background-color 0.3s ease-in-out' }}>
      <div className="container d-flex justify-content-between align-items-center">
        <a className="navbar-brand fw-bold" href="#">
          {/* Replaced next/image with standard img tag */}
          <img src="/images/kebablogo.png" alt="Kebab Cartagena Logo" width={200} height={50} style={{ objectFit: 'contain' }} />
        </a>
        <div className="d-flex justify-content-end align-items-center">
          <ul className="navbar-nav d-flex flex-row ms-auto align-items-center p-0 m-0">
            <li className="nav-item ms-3">
              <button onClick={onMenuClick} className="btn btn-md rounded-pill" style={{ backgroundColor: '#A52A2A', borderColor: '#A52A2A', color: 'var(--foreground)' }}>Menú</button>
            </li>
            <li className="nav-item ms-3">
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