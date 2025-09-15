import React, { useState } from 'react';
import '../styles/ImageCarousel.css';

function ImageCarousel({ images, altPrefix }) {
  const [index, setIndex] = useState(0);

  if (!images || images.length === 0) {
    return null;
  }

  const prev = () => {
    setIndex((index - 1 + images.length) % images.length);
  };

  const next = () => {
    setIndex((index + 1) % images.length);
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  };

  return (
    <div className="image-carousel" tabIndex={0} aria-roledescription="carousel" onKeyDown={onKeyDown}>
      {images.length > 1 && (
        <button type="button" className="prev" onClick={prev} aria-label="Previous image">
          ‹
        </button>
      )}
      <img loading="lazy" src={images[index]} alt={`${altPrefix} ${index + 1}`} />
      {images.length > 1 && (
        <button type="button" className="next" onClick={next} aria-label="Next image">
          ›
        </button>
      )}
    </div>
  );
}

export default ImageCarousel;
