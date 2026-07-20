"use client";

import React from "react";
import type { Profile } from "@/lib/types";
import { SUBJECTS } from "@/lib/content";
import Avatar from "./Avatar";

interface Props {
  profile: Profile;
  onOpenSubject: (id: string) => void;
  onNav: (t: "shop" | "wardrobe" | "achievements" | "games") => void;
}

export default function Dashboard({ profile, onOpenSubject, onNav }: Props) {
  return (
    <div className="dashboard">
      <div className="dash-grid">
        {/* panel del personaje */}
        <aside className="panel char-panel">
          <div className="char-stage">
            <Avatar character={profile.character} size={190} idle showBackground />
          </div>
          <b className="display char-name">{profile.name}</b>
          <div className="quick-nav">
            <button className="btn nav-btn" onClick={() => onNav("wardrobe")}>
              👕 Vestuario
            </button>
            <button className="btn nav-btn" onClick={() => onNav("shop")}>
              🛒 Tienda
            </button>
            <button className="btn nav-btn" onClick={() => onNav("games")}>
              🎮 Arena
            </button>
            <button className="btn nav-btn" onClick={() => onNav("achievements")}>
              🏆 Logros
            </button>
          </div>
        </aside>

        {/* materias */}
        <section className="subjects-area">
          <h2 className="display section-title">Elige tu misión de hoy</h2>
          <div className="subject-grid">
            {SUBJECTS.map((s) => {
              const total = s.levels.length;
              let stars = 0;
              let done = 0;
              for (let i = 0; i < total; i++) {
                const rec = profile.levels[`${s.id}:${i}`];
                if (rec) {
                  stars += rec.stars;
                  if (rec.stars > 0) done++;
                }
              }
              const pct = Math.round((done / total) * 100);
              return (
                <button
                  key={s.id}
                  className="subject-card panel"
                  style={{ ["--sub" as never]: s.color }}
                  onClick={() => onOpenSubject(s.id)}
                >
                  <span className="subject-emoji">{s.emoji}</span>
                  <b className="display subject-name">{s.name}</b>
                  <span className="subject-tag">{s.tagline}</span>
                  <span className="subject-progress">
                    <span className="subject-bar">
                      <span className="subject-fill" style={{ width: `${pct}%` }} />
                    </span>
                    <span className="subject-stars">
                      ⭐ {stars}/{total * 3}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
