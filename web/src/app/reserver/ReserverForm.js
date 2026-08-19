"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "../../lib/api";
import { useStudio } from "../../lib/StudioContext";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import styles from "../site.module.css";

export default function ReserverForm() {
  const searchParams = useSearchParams();
  const { settings, packs, categories } = useStudio();
  const [form, setForm] = useState({
    projectName: "",
    packId: "",
    preferredAt: "",
    clientName: "",
    clientPhone: "",
    clientEmail: "",
    clientInstagram: "",
    message: "",
  });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const slug = searchParams.get("pack");
    if (slug && packs.length) {
      const match = packs.find((x) => x.slug === slug);
      if (match) setForm((f) => ({ ...f, packId: match.id }));
    }
  }, [searchParams, packs]);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });
    try {
      await api.post("/api/bookings", {
        ...form,
        clientEmail: form.clientEmail || null,
        clientInstagram: form.clientInstagram || null,
        projectName: form.projectName || null,
        preferredAt: form.preferredAt
          ? new Date(form.preferredAt).toISOString()
          : null,
        packId: form.packId || null,
      });
      setStatus({
        type: "success",
        message: "Demande envoyée ! Nous vous recontactons rapidement.",
      });
      setForm({
        projectName: "",
        packId: "",
        preferredAt: "",
        clientName: "",
        clientPhone: "",
        clientEmail: "",
        clientInstagram: "",
        message: "",
      });
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setLoading(false);
    }
  }

  const selectedPack = packs.find(p => p.id === form.packId);
  const whatsapp = settings.whatsapp || "242069167515";

  return (
    <>
      <SiteHeader settings={settings} />
      
      {/* HEADER SECTION */}
      <section className={styles.hero} style={{ minHeight: '40vh', padding: '60px 0', background: 'var(--paper)', display: 'flex', alignItems: 'center' }}>
        <div className="container" style={{ width: '100%' }}>
           <div className="eyebrow" style={{ color: 'var(--primary)', marginBottom: '10px' }}>Réservation</div>
           <h1 style={{ fontSize: 'clamp(2.5rem, 4vw, 4rem)', lineHeight: 1.1, textTransform: 'none' }}>
             Votre prochaine image<br/>commence ici.
           </h1>
        </div>
      </section>

      <main className="section container" style={{ paddingTop: '20px' }}>
        <form onSubmit={onSubmit}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', alignItems: 'start' }}>
            
            {/* 1. PROJET */}
            <div className={styles.formCard} style={{ background: 'var(--paper-deep)' }}>
               <h3 style={{ marginBottom: '20px', color: '#fff', fontSize: '1.2rem' }}>1. QUEL EST VOTRE PROJET ?</h3>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                 {(categories.length > 0 ? categories : [{id:1, name:'Portrait'}, {id:2, name:'Mode'}, {id:3, name:'Corporate'}, {id:4, name:'Famille'}]).map(c => (
                   <button 
                     key={c.id} 
                     type="button" 
                     onClick={() => setForm({...form, projectName: c.name})}
                     style={{ 
                       padding: '12px', background: form.projectName === c.name ? 'var(--primary)' : 'transparent', 
                       border: `1px solid ${form.projectName === c.name ? 'var(--primary)' : 'var(--line)'}`,
                       color: form.projectName === c.name ? '#fff' : 'var(--ink)',
                       borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s', fontWeight: 600, fontSize: '0.9rem'
                     }}>
                     {c.name}
                   </button>
                 ))}
               </div>
            </div>

            {/* 2. EXPERIENCE */}
            <div className={styles.formCard} style={{ background: 'var(--paper-deep)' }}>
               <h3 style={{ marginBottom: '20px', color: '#fff', fontSize: '1.2rem' }}>2. CHOISISSEZ VOTRE EXPÉRIENCE</h3>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                 {packs.map(p => (
                   <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', border: '1px solid var(--line)', borderRadius: '8px', cursor: 'pointer', background: form.packId === p.id ? 'rgba(192,57,43,0.1)' : 'transparent', borderColor: form.packId === p.id ? 'var(--primary)' : 'var(--line)' }}>
                     <input type="radio" name="packId" value={p.id} checked={form.packId === p.id} onChange={(e) => setForm({...form, packId: e.target.value})} style={{ accentColor: 'var(--primary)', width: 18, height: 18 }} />
                     <div style={{ flex: 1 }}>
                       <div style={{ fontWeight: 700 }}>{p.name}</div>
                     </div>
                     <div style={{ fontWeight: 700, color: 'var(--primary)' }}>{p.price.toLocaleString("fr-FR")} FCFA</div>
                   </label>
                 ))}
               </div>
            </div>

            {/* 3. DATE */}
            <div className={styles.formCard} style={{ background: 'var(--paper-deep)' }}>
               <h3 style={{ marginBottom: '20px', color: '#fff', fontSize: '1.2rem' }}>3. CHOISISSEZ VOTRE DATE</h3>
               <input
                 className={styles.input}
                 type="datetime-local"
                 value={form.preferredAt}
                 onChange={(e) => setForm({ ...form, preferredAt: e.target.value })}
                 style={{ padding: '16px', fontSize: '1rem', background: 'var(--paper)', color: '#fff' }}
                 required
               />
            </div>

          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginTop: '30px' }}>
            
            {/* 4. VOS INFOS */}
            <div className={styles.formCard} style={{ background: 'var(--paper-deep)', gridColumn: '1 / -1' }}>
               <h3 style={{ marginBottom: '20px', color: '#fff', fontSize: '1.2rem' }}>4. PARLEZ-NOUS DE VOUS</h3>
               <div className="grid-2">
                 <input className={styles.input} required placeholder="Nom complet" value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} />
                 <input className={styles.input} required placeholder="Téléphone / WhatsApp" value={form.clientPhone} onChange={(e) => setForm({ ...form, clientPhone: e.target.value })} />
                 <input className={styles.input} placeholder="Instagram (optionnel) @..." value={form.clientInstagram} onChange={(e) => setForm({ ...form, clientInstagram: e.target.value })} />
                 <input className={styles.input} type="email" placeholder="Email (optionnel)" value={form.clientEmail} onChange={(e) => setForm({ ...form, clientEmail: e.target.value })} />
                 <textarea className={styles.textarea} style={{ gridColumn: '1 / -1' }} placeholder="Un message particulier ou une précision sur le projet ?" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
               </div>
            </div>

          </div>

          {/* RÉSUMÉ & SUBMIT */}
          <div style={{ marginTop: '40px', background: 'var(--paper-deep)', border: '1px solid var(--primary)', borderRadius: '16px', padding: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
             <div>
               <div className="eyebrow">RÉSUMÉ DE LA DEMANDE</div>
               <div style={{ fontSize: '1.1rem', marginTop: '10px', color: '#fff' }}>
                 <strong>Projet:</strong> {form.projectName || "Non sélectionné"} <br/>
                 <strong>Pack:</strong> {selectedPack?.name || "Non sélectionné"} {selectedPack && `— ${selectedPack.price.toLocaleString("fr-FR")} FCFA`}
               </div>
             </div>
             
             <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end' }}>
                <button className="btn btn-primary" type="submit" disabled={loading} style={{ padding: '16px 32px', fontSize: '1.1rem', width: '100%', minWidth: '250px' }}>
                  {loading ? "Envoi..." : "ENVOYER LA DEMANDE"}
                </button>
                <a
                  className="btn btn-outline"
                  href={`https://wa.me/${whatsapp}?text=Bonjour Art Studio 242, je souhaite réserver la séance: ${selectedPack?.name||""}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ width: '100%', minWidth: '250px', justifyContent: 'center' }}
                >
                  Continuer sur WhatsApp
                </a>
             </div>
          </div>

          {status.message && (
            <div style={{ marginTop: '20px' }} className={ status.type === "success" ? styles.success : styles.error }>
              {status.message}
            </div>
          )}

        </form>
      </main>

      <SiteFooter settings={settings} />
    </>
  );
}
