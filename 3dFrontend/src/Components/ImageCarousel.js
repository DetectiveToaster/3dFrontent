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

  return (
    <div className="image-carousel">
      {images.length > 1 && (
        <button className="prev" onClick={prev} aria-label="Previous image">
          ‹
        </button>
      )}
      <img src={images[index]} alt={`${altPrefix} ${index + 1}`} />
      {images.length > 1 && (
        <button className="next" onClick={next} aria-label="Next image">
          ›
        </button>
      )}
    </div>
  );
}

export default ImageCarousel;
