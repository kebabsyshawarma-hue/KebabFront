import styles from './HeroSection.module.css';

export default function HeroSection({ heroSlides, isMobile, isScrolled }) {
  const filteredHeroSlides = heroSlides.filter(slide => 
    isMobile ? slide.type === 'vertical' : slide.type === 'horizontal'
  );

  return (
    <header id="heroCarousel" className={`carousel slide ${styles.heroSection} ${isScrolled ? styles.scrolledPast : ''}`} data-bs-ride="carousel" data-bs-interval="5000">
      <div className="carousel-indicators">
        {filteredHeroSlides.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            data-bs-target="#heroCarousel"
            data-bs-slide-to={index}
            className={index === 0 ? 'active' : ''}
            aria-current={index === 0 ? 'true' : 'false'}
            aria-label={`Slide ${index + 1}`}
          ></button>
        ))}
      </div>
      <div className="carousel-inner">
        {filteredHeroSlides.map((slide, index) => (
          <div key={slide.id} className={`carousel-item ${index === 0 ? 'active' : ''}`}>
            <div className={styles.heroSlideContent} style={{
              backgroundImage: `url(${slide.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              color: 'var(--foreground)',
              textShadow: '0px 2px 8px rgba(0,0,0,1), 0px 2px 8px rgba(0,0,0,1)',
              backgroundColor: 'rgba(0,0,0,0.6)',
            }}>
              <div className="container text-center" style={{ marginBottom: '20px' }}>
                <h1 className={`display-4 fw-bold mb-3 ${styles.display4}`} style={{ fontFamily: 'var(--font-playfair-display)' }}>{slide.title}</h1>
                <p className={`lead mb-4 ${styles.lead}`}>{slide.subtitle}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button className="carousel-control-prev" type="button" data-bs-target="#heroCarousel" data-bs-slide="prev">
        <span className="carousel-control-prev-icon" aria-hidden="true"></span>
        <span className="visually-hidden">Previous</span>
      </button>
      <button className="carousel-control-next" type="button" data-bs-target="#heroCarousel" data-bs-slide="next">
        <span className="carousel-control-next-icon" aria-hidden="true"></span>
        <span className="visually-hidden">Next</span>
      </button>
    </header>
  );
}