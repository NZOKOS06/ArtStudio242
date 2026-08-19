"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../../lib/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@artstudio242.com");
  const [password, setPassword] = useState("");
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
      setError(err.message);
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
        className="relative w-full max-w-sm bg-white/3 border border-white/10 rounded-3xl p-10 flex flex-col gap-6"
      >
        {/* Header */}
        <div className="text-center">
          <p className="text-primary text-xs font-bold tracking-[0.25em] uppercase mb-3">Administration</p>
          <h1 className="font-display font-black text-3xl text-white">
            ART STUDIO <span className="text-primary">242</span>
          </h1>
          <p className="text-white/40 text-sm mt-2">Connectez-vous à votre espace</p>
        </div>

        {/* Fields */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-white/40 uppercase tracking-wider">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-black/50 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/60 transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-white/40 uppercase tracking-wider">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-black/50 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/60 transition-colors"
            />
          </div>
        </div>

        {error && (
          <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-black text-sm py-4 rounded-full transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-primary/30 tracking-wide"
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>
      </form>
    </div>
  );
}
