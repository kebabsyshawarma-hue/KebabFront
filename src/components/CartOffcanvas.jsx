import { useCart } from '../context/CartContext.jsx'; // Adjusted path

export default function CartOffcanvas({ handleProceedToCheckout }) {
  const { cart, increaseQuantity, decreaseQuantity, removeFromCart, total } = useCart();

  return (
    <div className="offcanvas offcanvas-end" tabIndex={-1} id="cartOffcanvas" aria-labelledby="cartOffcanvasLabel">
      <div className="offcanvas-header">
        <h5 className="offcanvas-title fw-bold" id="cartOffcanvasLabel">Tu Carrito</h5>
        <button type="button" className="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
      </div>
      <div className="offcanvas-body d-flex flex-column">
        {cart.length === 0 ? (
          <p>El carrito está vacío.</p>
        ) : (
          <ul className="list-group flex-grow-1 overflow-auto mb-3">
            {cart.map((item) => (
              <li key={item.id} className="list-group-item d-flex justify-content-between lh-sm align-items-center py-3">
                <div>
                  <h6 className="my-0 fw-bold">{item.name}</h6>
                  <small className="text-muted">{item.description}</small>
                  <div className="d-flex align-items-center mt-1">
                    <button className="btn btn-sm btn-outline-secondary me-1 rounded-pill" onClick={() => decreaseQuantity(item.id)}>-</button>
                    <small className="text-muted">{item.quantity}</small>
                    <button className="btn btn-sm btn-outline-secondary ms-1 rounded-pill" onClick={() => increaseQuantity(item.id)}>+</button>
                    <button className="btn btn-sm btn-danger ms-2 rounded-pill" onClick={() => removeFromCart(item.id)}>X</button>
                  </div>
                </div>
                <span className="fw-bold">${(item.price * item.quantity).toLocaleString('es-CO')}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-auto">
          <div className="d-flex justify-content-between fw-bold pt-3 border-top">
            <span>Total (COP)</span>
            <strong> ${total.toLocaleString('es-CO')}</strong>
          </div>
          <button type="button" className="btn rounded-pill w-100 mt-3" style={{ backgroundColor: '#A52A2A', borderColor: '#A52A2A', color: 'var(--foreground)' }} onClick={handleProceedToCheckout}>Proceder al Pago</button>
        </div>
      </div>
    </div>
  );
}