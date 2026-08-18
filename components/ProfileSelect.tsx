"use client";

import { useRef, useState } from "react";
import type { Profile, RootSave } from "@/lib/types";
import { MAX_PROFILES, downloadProfileBackup, parseProfileBackup } from "@/lib/storage";
import { levelFromXp } from "@/lib/progression";
import Avatar from "./Avatar";

interface Props {
  root: RootSave;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
  onReset: (id: string) => void;
  onImport: (profile: Profile) => void;
}

type Confirm = { id: string; action: "delete" | "reset" } | null;

export default function ProfileSelect({ root, onSelect, onCreate, onDelete, onReset, onImport }: Props) {
  const [confirm, setConfirm] = useState<Confirm>(null);
  const [importError, setImportError] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const profiles = root.order.map((id) => root.profiles[id]).filter(Boolean);

  const handleImportFile = (file: File) => {
    setImportError(false);
    const reader = new FileReader();
    reader.onload = () => {
      const profile = parseProfileBackup(String(reader.result ?? ""));
      if (!profile) {
        setImportError(true);
        return;
      }
      onImport(profile);
    };
    reader.readAsText(file);
  };

  return (
    <div className="profiles-screen">
      <div className="hero">
        <div className="hero-badge">🏰</div>
        <h1 className="display hero-title">Academia Aventura</h1>
        <p className="hero-sub">
          Aprende matemáticas, inglés, ciencias, finanzas y programación…
          <br />
          ¡y convierte a tu héroe en leyenda! ⚔️✨
        </p>
      </div>

      <h2 className="display section-title">¿Quién juega hoy?</h2>

      <div className="profile-grid">
        {profiles.map((p) => (
          <div key={p.id} className="profile-card">
            <button className="profile-main" onClick={() => onSelect(p.id)}>
              <div className="profile-avatar">
                <Avatar character={p.character} size={110} idle />
              </div>
              <b className="display profile-name">{p.name}</b>
              <span className="profile-meta">
                Nv {levelFromXp(p.xp)} · 🪙 {p.coins} · 💎 {p.gems}
              </span>
            </button>

            {confirm?.id === p.id ? (
              <div className="confirm-row">
                <span>{confirm.action === "delete" ? "¿Borrar?" : "¿Reiniciar nivel y logros?"}</span>
                <button
                  className="mini-btn danger"
                  onClick={() => {
                    if (confirm.action === "delete") onDelete(p.id);
                    else onReset(p.id);
                    setConfirm(null);
                  }}
                >
                  Sí
                </button>
                <button className="mini-btn" onClick={() => setConfirm(null)}>
                  No
                </button>
              </div>
            ) : (
              <div className="profile-actions">
                <button
                  className="profile-icon-btn"
                  title="Descargar backup de este héroe"
                  onClick={() => downloadProfileBackup(p)}
                >
                  💾
                </button>
                <button
                  className="profile-icon-btn"
                  title="Reiniciar nivel, lecciones y logros (conserva monedas, gemas, ítems y apariencia)"
                  onClick={() => setConfirm({ id: p.id, action: "reset" })}
                >
                  🔄
                </button>
                <button
                  className="profile-icon-btn"
                  title="Borrar perfil"
                  onClick={() => setConfirm({ id: p.id, action: "delete" })}
                >
                  🗑️
                </button>
              </div>
            )}
          </div>
        ))}

        {profiles.length < MAX_PROFILES && (
          <>
            <button className="profile-card profile-new" onClick={onCreate}>
              <span className="new-plus">＋</span>
              <b className="display">Nuevo héroe</b>
              <span className="profile-meta">Crea tu personaje</span>
            </button>

            <button className="profile-card profile-new" onClick={() => fileInput.current?.click()}>
              <span className="new-plus">📥</span>
              <b className="display">Importar héroe</b>
              <span className="profile-meta">Desde un backup .json</span>
            </button>
            <input
              ref={fileInput}
              type="file"
              accept="application/json"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImportFile(file);
                e.target.value = "";
              }}
            />
          </>
        )}
      </div>

      {importError && (
        <p className="empty-hint">⚠️ Ese archivo no es un backup válido de Academia Aventura.</p>
      )}

      {profiles.length === 0 && (
        <p className="empty-hint">Crea tu primer héroe para empezar la aventura 🚀</p>
      )}

      <p className="backup-hint">
        💾 Descargá un backup de cada héroe para hacer una copia de seguridad o llevarlo a otro navegador/dispositivo — luego usá &quot;Importar héroe&quot; ahí para restaurarlo.
      </p>

      <footer className="donate-footer">
        <p className="donate-text">
          💛 Si Academia Aventura te sirvió en la educación de tu familia, podés colaborar con una donación.
        </p>
        <a
          className="btn ghost small donate-btn"
          href="https://link.mercadopago.com.ar/donaciondz"
          target="_blank"
          rel="noopener noreferrer"
        >
          💛 Donar con Mercado Pago
        </a>
        <span className="donate-alias">o alias: <b>gino73mp</b> (Gino Pietrobon)</span>
        <a
          className="donate-line"
          href={`https://wa.me/5492612473147?text=${encodeURIComponent("Hola! Tengo una sugerencia para Academia Aventura: ")}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          💬 Enviar una sugerencia al desarrollador
        </a>
      </footer>
    </div>
  );
}
