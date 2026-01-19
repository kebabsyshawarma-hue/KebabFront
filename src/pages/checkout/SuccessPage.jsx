import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

function SuccessContent() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const transactionId = searchParams.get('id');

  return (
    <div className="row justify-content-center">
      <div className="col-md-8">
        <div className="card text-center shadow-lg border-0 rounded-4">
          <div className="card-body p-5">
            <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" fill="#28a745" className="bi bi-check-circle-fill mb-4" viewBox="0 0 16 16">
              <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
            </svg>
            <h1 className="mb-3 fw-bold" style={{ fontFamily: 'var(--font-playfair-display)', color: '#28a745' }}>¡Gracias por tu pedido!</h1>
            <p className="lead mb-4">Tu pago ha sido procesado con éxito y hemos recibido tu orden.</p>
            
            {transactionId && (
              <div className="alert alert-success small">
                <strong>ID de tu transacción:</strong> {transactionId}
                <p className="mt-2 mb-0">Conserva este ID para cualquier consulta sobre tu pedido.</p>
              </div>
            )}

            <p className="mt-4">Recibirás una confirmación por correo electrónico en breve. Mientras tanto, puedes volver a la página principal.</p>

            <button 
              className="btn btn-lg rounded-pill mt-3" 
              style={{ backgroundColor: '#A52A2A', borderColor: '#A52A2A', color: 'var(--foreground)' }}
              onClick={() => navigate('/')}
            >
              Volver al Inicio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div className="container py-5" style={{ marginTop: '100px' }}>
      <SuccessContent />
    </div>
  );
}
