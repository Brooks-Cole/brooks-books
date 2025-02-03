// frontend/src/components/OptimizedImage.jsx
import React from 'react';

const OptimizedImage = ({ src, alt, sizes }) => {
  const generateSrcSet = () => {
    return sizes.map(size => 
      `${src}?width=${size} ${size}w`
    ).join(', ');
  };

  return (
    <img
      src={src}
      alt={alt}
      srcSet={generateSrcSet()}
      sizes="(max-width: 768px) 100vw, 50vw"
      loading="lazy"
      className="w-full h-auto"
    />
  );
};

export default OptimizedImage;