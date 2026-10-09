"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../../lib/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("as242_token");
    if (token) router.replace("/admin");
  }, [router]);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await api.post("/api/auth/login", { email, password });
      localStorage.setItem("as242_token", data.token);
      router.push("/admin");
    } catch (err) {
      if (err instanceof TypeError) {
        setError("Impossible de joindre le serveur. Vérifiez votre connexion puis réessayez.");
      } else if (err.message === "Identifiants invalides") {
        setError("Adresse e-mail ou mot de passe incorrect.");
      } else {
        setError(err.message || "La connexion a échoué. Veuillez réessayer.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/8 blur-3xl" />
      </div>

      <form
        onSubmit={onSubmit}
        aria-labelledby="admin-login-title"
        aria-busy={loading}
        className="relative w-full max-w-sm bg-white/3 border border-white/10 rounded-3xl p-6 sm:p-10 flex flex-col gap-6"
      >
        {/* Header */}
        <div className="text-center">
          <p className="text-primary text-xs font-bold tracking-[0.25em] uppercase mb-3">Administration</p>
          <h1 id="admin-login-title" className="font-display font-black text-3xl text-white">
            ART STUDIO <span className="text-primary">242</span>
          </h1>
          <p className="text-white/40 text-sm mt-2">Connectez-vous à votre espace</p>
        </div>

        {/* Fields */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="admin-email" className="text-xs font-bold text-white/70 uppercase tracking-wider">Email</label>
            <input
              id="admin-email"
              type="email"
              name="email"
              autoComplete="username"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "admin-login-error" : undefined}
              required
              className="w-full bg-black/50 border border-white/20 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="admin-password" className="text-xs font-bold text-white/70 uppercase tracking-wider">Mot de passe</label>
            <div className="relative">
              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "admin-login-error" : undefined}
                required
                className="w-full bg-black/50 border border-white/20 text-white rounded-xl px-4 py-3 pr-20 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                aria-pressed={showPassword}
                className="absolute inset-y-0 right-3 my-auto h-fit rounded px-1 text-xs font-semibold text-white/70 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {showPassword ? "Masquer" : "Afficher"}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div id="admin-login-error" role="alert" className="px-4 py-3 bg-red-500/10 border border-red-500/30 text-red-200 text-sm rounded-xl">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-sm py-4 rounded-full transition-all duration-200 sm:hover:scale-105 hover:shadow-xl hover:shadow-primary/30 tracking-wide focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        >
          {loading ? (
            <span className="inline-flex items-center justify-center gap-2" role="status">
              <span aria-hidden="true" className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
              Connexion...
            </span>
          ) : "Se connecter"}
        </button>
      </form>
    </div>
  );
}
