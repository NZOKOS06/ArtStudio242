"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../../lib/api";
import styles from "../admin.module.css";

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
    <div className={styles.loginWrap}>
      <form className={styles.loginCard} onSubmit={onSubmit}>
        <div className="eyebrow">Administration</div>
        <h1 style={{ margin: "8px 0 20px", fontFamily: "var(--font-anton), Anton, sans-serif" }}>
          Art Studio 242
        </h1>
        <div style={{ display: "grid", gap: 12 }}>
          <label className="label" style={{ display: "grid", gap: 6, fontWeight: 700 }}>
            Email
            <input
              className={styles.input || ""}
              style={{ padding: 12, borderRadius: 12, border: "1px solid rgba(28,24,20,.14)" }}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label style={{ display: "grid", gap: 6, fontWeight: 700 }}>
            Mot de passe
            <input
              style={{ padding: 12, borderRadius: 12, border: "1px solid rgba(28,24,20,.14)" }}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          {error && <div style={{ color: "#8f2a20", fontWeight: 600 }}>{error}</div>}
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </div>
      </form>
    </div>
  );
}
