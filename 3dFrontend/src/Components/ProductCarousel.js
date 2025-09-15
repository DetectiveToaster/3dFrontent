import React, { useEffect, useRef } from 'react';
import ProductCard from './ProductCard';
import '../styles/ProductCarousel.css';

function ProductCarousel({ products, title = 'Highlighted' }) {
  const scrollerRef = useRef(null);

  const scrollByAmount = (dir) => {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = Math.round(el.clientWidth * 0.9);
    el.scrollBy({ left: dir * amount, behavior: 'smooth' });
  };

  // Enable arrow key navigation when the scroller is focused
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); scrollByAmount(-1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); scrollByAmount(1); }
    };
    el.addEventListener('keydown', onKey);
    return () => el.removeEventListener('keydown', onKey);
  }, []);

  if (!products || products.length === 0) return null;

  return (
    <div className="product-carousel" aria-label={title} role="region">
      <button type="button" className="pc-arrow left" aria-label="Scroll left" onClick={() => scrollByAmount(-1)}>
        <span aria-hidden="true">‹</span>
      </button>
      <div
        ref={scrollerRef}
        className="pc-scroller"
        tabIndex={0}
        aria-roledescription="carousel"
      >
        {products.map((p) => (
          <div key={p.id} className="pc-slide" aria-label={p.name}>
            <ProductCard product={p} />
          </div>
        ))}
      </div>
      <button type="button" className="pc-arrow right" aria-label="Scroll right" onClick={() => scrollByAmount(1)}>
        <span aria-hidden="true">›</span>
      </button>
    </div>
  );
}

export default ProductCarousel;

