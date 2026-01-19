import { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './OrderStatusPage.module.css';

const STEPS = ['Pedido recibido', 'En preparación', 'En reparto', 'Entregado'];

const currencyFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});

const normalize = (value = '') =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const paymentLabels = {
  Paid: 'Pago aprobado',
  Pending: 'Pago pendiente',
  Declined: 'Pago rechazado',
};

const paymentChipClassMap = {
  Paid: 'chipSuccess',
  Pending: 'chipWarning',
  Declined: 'chipDanger',
};

export default function OrderStatusPage() {
  const [orderId, setOrderId] = useState('');
  const [orderStatus, setOrderStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (event) => {
    event.preventDefault();

    if (!orderId.trim()) {
      setError('Por favor, ingresa un ID de orden.');
      return;
    }

    setLoading(true);
    setError(null);
    setOrderStatus(null);

    try {
      const response = await fetch(`/api/getOrderStatus?id=${encodeURIComponent(orderId.trim())}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Ocurrió un error al buscar la orden.');
      }

      setOrderStatus(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={styles.orderStatusContainer}>
      <div className={styles.inner}>
        <header className={styles.hero}>
          <span className={styles.heroKicker}>Seguimiento en vivo</span>
          <h1 className={styles.heroTitle}>Rastrea tu orden</h1>
          <p className={styles.heroSubtitle}>
            Ingresa el ID que recibiste al confirmar tu pedido para conocer en qué etapa se encuentra y cuándo llegará.
          </p>
        </header>

        <form onSubmit={handleSearch} className={styles.searchForm}>
          <label htmlFor="orderIdInput" className={styles.visuallyHidden}>
            Ingresa el ID de la orden
          </label>
          <input
            id="orderIdInput"
            type="text"
            className={styles.searchInput}
            placeholder="Ej. 500001"
            value={orderId}
            onChange={(event) => setOrderId(event.target.value)}
            disabled={loading}
            autoComplete="off"
          />
          <button className={styles.searchButton} type="submit" disabled={loading}>
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </form>

        {error && (
          <div className={styles.errorMessage} role="alert">
            {error}
          </div>
        )}

        {orderStatus && (() => {
          const normalizedSteps = STEPS.map(normalize);
          const activeStepIndex = Math.max(
            normalizedSteps.indexOf(normalize(orderStatus.fulfillmentStatus || '')),
            0,
          );

          const paymentLabel = paymentLabels[orderStatus.status] || orderStatus.status || 'Estado desconocido';
          const chipModifier = paymentChipClassMap[orderStatus.status] || 'chipNeutral';
          const chipClassName = `${styles.chip} ${styles[chipModifier]}`;

          const createdAtDate = orderStatus.createdAt ? new Date(orderStatus.createdAt) : null;
          const createdAtLabel = createdAtDate
            ? createdAtDate.toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })
            : 'Fecha no disponible';

          const items = Array.isArray(orderStatus.items) ? orderStatus.items : [];
          const paymentMethod = orderStatus.paymentMethod || 'No disponible';
          const shortOrderId = orderStatus.shortOrderId || orderId.trim() || 'Sin ID';
          const fulfillmentStatus = orderStatus.fulfillmentStatus || 'No disponible';

          return (
            <article className={styles.statusCard}>
              <header className={styles.statusHeader}>
                <div>
                  <span className={styles.orderIdBadge}>Pedido #{shortOrderId}</span>
                  <h2 className={styles.statusTitle}>Así va tu entrega</h2>
                  <p className={styles.statusDescription}>
                    Actualizamos el estado en cada etapa para que sepas exactamente cuándo disfrutarás tu pedido.
                  </p>
                </div>
                <div className={styles.chipGroup}>
                  <span className={chipClassName}>{paymentLabel}</span>
                  <span className={`${styles.chip} ${styles.chipNeutral}`}>
                    {currencyFormatter.format(orderStatus.total || 0)}
                  </span>
                </div>
              </header>

              <section className={styles.timelineSection} aria-label="Progreso del pedido">
                <h3 className={styles.timelineTitle}>Estado del pedido</h3>
                <ul className={styles.timelineSteps}>
                  {STEPS.map((step, index) => {
                    const isActive = index <= activeStepIndex;
                    return (
                      <li
                        key={step}
                        className={`${styles.timelineStep} ${isActive ? styles.timelineStepActive : ''}`}
                        aria-current={index === activeStepIndex ? 'step' : undefined}
                      >
                        <span className={styles.timelineBullet}>{index + 1}</span>
                        <span className={styles.timelineLabel}>{step}</span>
                      </li>
                    );
                  })}
                </ul>
              </section>

              <section className={styles.statusMeta}>
                <div>
                  <span className={styles.metaLabel}>Estado del pedido</span>
                  <p className={styles.metaValue}>{fulfillmentStatus}</p>
                </div>
                <div>
                  <span className={styles.metaLabel}>Fecha de creación</span>
                  <p className={styles.metaValue}>{createdAtLabel}</p>
                </div>
                <div>
                  <span className={styles.metaLabel}>Método de pago</span>
                  <p className={styles.metaValue}>{paymentMethod}</p>
                </div>
              </section>

              <section className={styles.itemsSection}>
                <h3 className={styles.itemsTitle}>Resumen de productos</h3>
                {items.length > 0 ? (
                  <ul className={styles.itemsList}>
                    {items.map((item, index) => (
                      <li key={`${item.name}-${index}`} className={styles.itemRow}>
                        <div className={styles.itemDetails}>
                          <p className={styles.itemName}>{item.name}</p>
                          {item.description && (
                            <span className={styles.itemDescription}>{item.description}</span>
                          )}
                          <span className={styles.itemQuantity}>Cantidad: x{item.quantity}</span>
                        </div>
                        <span className={styles.itemPrice}>
                          {currencyFormatter.format((item.price || 0) * (item.quantity || 0))}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className={styles.emptyItems}>No hay productos asociados a esta orden.</p>
                )}
              </section>
            </article>
          );
        })()}

        <div className={styles.backLinkWrapper}>
          <Link to="/" className={styles.backLink}>
            Volver al inicio
          </Link>
        </div>
      </div>
    </section>
  );
}

