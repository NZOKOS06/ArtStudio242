"use client";

import { useState, useRef, useEffect } from 'react';

// Intersection Observer global pour lazy loading
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
    rootMargin: '50px' // Charger 50px avant que l'image soit visible
  });
}

export default function OptimizedImage({ 
  src, 
  alt, 
  className = '', 
  loading = 'lazy',
  quality = 85,
  sizes = "100vw",
  priority = false,
  onLoad,
  onError,
  ...props 
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState('');
  const imgRef = useRef(null);
  const [shouldLoad, setShouldLoad] = useState(priority);

  // Déterminer si l'image est hébergée sur Cloudinary
  const isCloudinaryImage = (url) => {
    return url && (url.includes('cloudinary.com') || url.includes('res.cloudinary.com'));
  };

  // Optimiser URL Cloudinary de manière sûre
  const optimizeCloudinaryUrl = (url) => {
    if (!isCloudinaryImage(url)) return url;
    
    try {
      // Ajouter seulement f_auto,q_auto pour optimisation automatique
      // Cloudinary choisira le meilleur format (WebP, AVIF, etc.) automatiquement
      if (url.includes('/upload/') && !url.includes('f_auto')) {
        return url.replace('/upload/', '/upload/f_auto,q_auto/');
      }
      return url;
    } catch (error) {
      console.warn('Erreur optimisation Cloudinary:', error);
      return url;
    }
  };

  // Générer srcset pour images responsives
  const generateSrcSet = (baseSrc) => {
    if (!baseSrc) return '';
    
    if (isCloudinaryImage(baseSrc)) {
      // Pour Cloudinary, générer différentes tailles
      const sizes = [400, 800, 1200, 1600];
      return sizes.map(size => {
        try {
          const optimizedUrl = baseSrc.replace('/upload/', `/upload/f_auto,q_auto,w_${size}/`);
          return `${optimizedUrl} ${size}w`;
        } catch (error) {
          return `${baseSrc} ${size}w`;
        }
      }).join(', ');
    }
    
    // Pour les images locales, pas de srcset pour éviter les erreurs
    return '';
  };

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

  // Charger l'image quand shouldLoad change
  useEffect(() => {
    if (!shouldLoad || !src) return;

    // Précharger l'image
    const img = new Image();
    
    const optimizedSrc = optimizeCloudinaryUrl(src);
    
    img.onload = () => {
      setCurrentSrc(optimizedSrc);
      setIsLoaded(true);
      setIsError(false);
      onLoad?.();
    };
    
    img.onerror = () => {
      // En cas d'erreur avec l'URL optimisée, essayer l'URL originale
      if (optimizedSrc !== src) {
        console.warn('Erreur avec URL optimisée, fallback vers originale');
        const fallbackImg = new Image();
        fallbackImg.onload = () => {
          setCurrentSrc(src);
          setIsLoaded(true);
          setIsError(false);
          onLoad?.();
        };
        fallbackImg.onerror = () => {
          setIsError(true);
          setIsLoaded(false);
          onError?.();
        };
        fallbackImg.src = src;
      } else {
        setIsError(true);
        setIsLoaded(false);
        onError?.();
      }
    };

    img.src = optimizedSrc;
  }, [shouldLoad, src, onLoad, onError]);

  // Placeholder pendant le chargement
  const PlaceholderDiv = () => (
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

  // Afficher le placeholder si pas encore chargé
  if (!shouldLoad || !isLoaded || !currentSrc) {
    return <PlaceholderDiv />;
  }

  // Image chargée de manière robuste
  return (
    <img
      ref={imgRef}
      src={currentSrc}
      srcSet={generateSrcSet(src)}
      sizes={isCloudinaryImage(src) ? sizes : undefined}
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