export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
            <svg 
              className="w-12 h-12 text-white/40" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636" 
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Connexion indisponible
          </h1>
          <p className="text-white/60 text-sm">
            Vous êtes actuellement hors ligne. Vérifiez votre connexion internet et réessayez.
          </p>
        </div>
        
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/80 transition-colors"
        >
          Réessayer
        </button>
        
        <div className="mt-8 text-xs text-white/40">
          <p>Art Studio 242 - Mode hors ligne</p>
        </div>
      </div>
    </div>
  );
}