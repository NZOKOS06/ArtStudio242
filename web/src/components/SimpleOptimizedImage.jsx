"use client";

import { useState, useRef, useEffect } from "react";

// Fonction d'optimisation sécurisée pour Cloudinary
function getOptimizedCloudinaryUrl(url) {
  if (!url || typeof url !== "string") return url;
  if (!url.includes("cloudinary.com") && !url.includes("res.cloudinary.com")) {
    return url;
  }
  try {
    // Injecter f_auto,q_auto si non présent pour format WebP/AVIF et compression automatique
    if (url.includes("/upload/") && !url.includes("f_auto") && !url.includes("q_auto")) {
      return url.replace("/upload/", "/upload/f_auto,q_auto/");
    }
  } catch {
    // En cas d'erreur de parsing, retourner l'URL d'origine
  }
  return url;
}

export default function SimpleOptimizedImage({
  src,
  alt = "",
  className = "",
  loading = "lazy",
  priority = false,
  onLoad,
  onError,
  ...props
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const imgRef = useRef(null);

  const optimizedSrc = getOptimizedCloudinaryUrl(src);

  // Si l'image est déjà en cache du navigateur
  useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      if (imgRef.current.naturalWidth > 0) {
        setIsLoaded(true);
      }
    }
  }, [optimizedSrc]);

  if (isError) {
    return (
      <div
        className={`bg-zinc-900 border border-white/10 flex flex-col items-center justify-center p-4 min-h-[160px] ${className}`}
        {...props}
      >
        <svg
          className="w-8 h-8 text-white/30 mb-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <span className="text-white/40 text-xs font-medium">Image non disponible</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-zinc-900 ${className}`}>
      {/* Squelette de chargement avec pulsation */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-white/5 animate-pulse flex items-center justify-center pointer-events-none z-10">
          <svg
            className="w-8 h-8 text-white/20"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}

      {/* Balise image toujours rendue dans le DOM pour permettre au navigateur de charger l'URL Cloudinary */}
      <img
        ref={imgRef}
        src={optimizedSrc}
        alt={alt}
        loading={priority ? "eager" : loading}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        className={`w-full h-auto object-cover transition-opacity duration-500 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
        onLoad={(e) => {
          setIsLoaded(true);
          onLoad?.(e);
        }}
        onError={(e) => {
          // Si l'URL optimisée échoue (par ex transformation Cloudinary spécifique), repli sur l'URL brute
          if (imgRef.current && imgRef.current.src !== src && src) {
            imgRef.current.src = src;
          } else {
            setIsError(true);
            onError?.(e);
          }
        }}
        {...props}
      />
    </div>
  );
}