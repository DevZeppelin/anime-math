"use client";

import React from "react";
import type { Profile } from "@/lib/types";
import { ACHIEVEMENTS, levelFromXp } from "@/lib/progression";

interface Props {
  profile: Profile;
  onBack: () => void;
}

export default function Achievements({ profile, onBack }: Props) {
  const unlocked = ACHIEVEMENTS.filter((a) => profile.achievements.includes(a.id));

  return (
    <div className="achievements-screen">
      <div className="map-header">
        <button className="btn ghost" onClick={onBack}>← Volver</button>
        <h2 className="display map-title">🏆 Salón de Logros</h2>
        <span className="map-tagline">
          {unlocked.length}/{ACHIEVEMENTS.length} conseguidos
        </span>
      </div>

      <div className="stats-strip panel">
        <span>📊 Nivel <b>{levelFromXp(profile.xp)}</b></span>
        <span>✅ <b>{profile.stats.correct}</b> aciertos</span>
        <span>📚 <b>{profile.stats.lessons}</b> lecciones</span>
        <span>🌟 <b>{profile.stats.perfects}</b> perfectas</span>
        <span>🔥 mejor racha <b>{profile.stats.bestStreak}</b></span>
        <span>🎮 <b>{profile.stats.minigames}</b> minijuegos</span>
      </div>

      <div className="achieve-grid">
        {ACHIEVEMENTS.map((a) => {
          const has = profile.achievements.includes(a.id);
          return (
            <div key={a.id} className={`achieve-card panel ${has ? "unlocked" : "locked"}`}>
              <span className="achieve-emoji">{has ? a.emoji : "🔒"}</span>
              <b className="display">{a.name}</b>
              <small>{a.desc}</small>
              <span className="achieve-reward">{has ? "✅ Conseguido" : `Premio: ${a.gems} 💎`}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
