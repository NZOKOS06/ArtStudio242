"use client";

import { useState, useRef, useEffect } from 'react';

// Intersection Observer global pour lazy loading uniquement
let imageObserver;
const imageLoadQueue = new Map();

if (typeof window !== 'undefined') {
  imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const callback = imageLoadQueue.get(entry.target);
        if (callback) {
          callback();
          imageObserver.unobserve(entry.target);
          imageLoadQueue.delete(entry.target);
        }
      }
    });
  }, {
    rootMargin: '50px'
  });
}

export default function SimpleOptimizedImage({ 
  src, 
  alt, 
  className = '', 
  loading = 'lazy',
  priority = false,
  onLoad,
  onError,
  ...props 
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(priority);
  const imgRef = useRef(null);

  // Intersection Observer pour lazy loading
  useEffect(() => {
    if (!imgRef.current || priority || shouldLoad) return;

    const currentRef = imgRef.current;
    
    const loadCallback = () => {
      setShouldLoad(true);
    };

    if (imageObserver) {
      imageLoadQueue.set(currentRef, loadCallback);
      imageObserver.observe(currentRef);
    }

    return () => {
      if (imageObserver && currentRef) {
        imageObserver.unobserve(currentRef);
        imageLoadQueue.delete(currentRef);
      }
    };
  }, [priority, shouldLoad]);

  // Placeholder pendant le chargement
  if (!shouldLoad || (!isLoaded && !isError)) {
    return (
      <div 
        ref={imgRef}
        className={`bg-white/3 animate-pulse flex items-center justify-center ${className}`}
        {...props}
      >
        <svg 
          className="w-8 h-8 text-white/20" 
          fill="currentColor" 
          viewBox="0 0 20 20"
        >
          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
        </svg>
      </div>
    );
  }

  // Image d'erreur
  if (isError) {
    return (
      <div 
        className={`bg-red-900/20 border border-red-500/20 flex items-center justify-center ${className}`}
        {...props}
      >
        <span className="text-red-400 text-xs">Erreur de chargement</span>
      </div>
    );
  }

  // Image simple sans transformation
  return (
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
      loading={loading}
      decoding="async"
      onLoad={() => {
        setIsLoaded(true);
        onLoad?.();
      }}
      onError={() => {
        setIsError(true);
        onError?.();
      }}
      {...props}
    />
  );
}