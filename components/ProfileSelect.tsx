"use client";

import React, { useState } from "react";
import type { RootSave } from "@/lib/types";
import { MAX_PROFILES } from "@/lib/storage";
import { levelFromXp } from "@/lib/progression";
import Avatar from "./Avatar";

interface Props {
  root: RootSave;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
}

export default function ProfileSelect({ root, onSelect, onCreate, onDelete }: Props) {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const profiles = root.order.map((id) => root.profiles[id]).filter(Boolean);

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
            {confirmDelete === p.id ? (
              <div className="confirm-row">
                <span>¿Borrar?</span>
                <button className="mini-btn danger" onClick={() => { onDelete(p.id); setConfirmDelete(null); }}>
                  Sí
                </button>
                <button className="mini-btn" onClick={() => setConfirmDelete(null)}>
                  No
                </button>
              </div>
            ) : (
              <button className="profile-delete" title="Borrar perfil" onClick={() => setConfirmDelete(p.id)}>
                🗑️
              </button>
            )}
          </div>
        ))}

        {profiles.length < MAX_PROFILES && (
          <button className="profile-card profile-new" onClick={onCreate}>
            <span className="new-plus">＋</span>
            <b className="display">Nuevo héroe</b>
            <span className="profile-meta">Crea tu personaje</span>
          </button>
        )}
      </div>

      {profiles.length === 0 && (
        <p className="empty-hint">Crea tu primer héroe para empezar la aventura 🚀</p>
      )}
    </div>
  );
}
