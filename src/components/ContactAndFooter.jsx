import styles from './ContactAndFooter.module.css';

export default function ContactAndFooter() {
  return (
    <>
      <section id="contact" className="py-5 bg-black text-white">
        <div className="container">
          <h2 className="text-center mb-5 fw-bold" style={{ fontFamily: 'var(--font-playfair-display)' }}>Contáctanos</h2>
          <div className="row">
            <div className="col-md-6 mb-4 mb-md-0">
              <div className="ratio ratio-16x9">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15677.67165948842!2d-75.553954!3d10.423183!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8ef62f7a3b27a1b7%3A0x1341e4384574388e!2sCentro%2C%2o2C%20Cartagena%2C%20Bol%C3%ADvar!5e0!3m2!1ses!2sco!4v1678886875641!5m2!1ses!2sco"
                  title="Ubicación de Kebab Cartagena"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  style={{ border: 0, borderRadius: '0.5rem' }}
                ></iframe>
              </div>
            </div>
            <div className="col-md-6 d-flex align-items-center">
              <div className="ps-md-4">
                <h4 className="fw-bold mb-3" style={{ color: '#A52A2A' }}>Horario de Atención</h4>
                <ul className="list-unstyled">
                  <li className="mb-2"><strong className="text-white">Lunes a Jueves:</strong> <span className="text-white-50">12:00 PM - 10:00 PM</span></li>
                  <li className="mb-2"><strong className="text-white">Viernes y Sábado:</strong> <span className="text-white-50">12:00 PM - 12:00 AM</span></li>
                  <li className="mb-2"><strong className="text-white">Domingo:</strong> <span className="text-white-50">12:00 PM - 9:00 PM</span></li>
                </ul>
                <p className="mt-3 text-white-50">¡Te esperamos para que disfrutes del mejor kebab de la ciudad!</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <footer className="py-4 bg-black text-white text-center">
        <div className="container">
          <p className={`mb-0 ${styles.footerText}`}>&copy; 2025 Kebab Cartagena. Todos los derechos reservados. <span className={`text-white-50 ${styles.footerMx2}`}>|</span> <span className="text-white-50">Powered by </span><a href="https://limitlesscol.com" target="_blank" rel="noopener noreferrer" className="text-white" style={{ textDecoration: 'none' }}><strong>Limitless Solutions</strong></a></p>
        </div>
      </footer>
    </>
  );
}
