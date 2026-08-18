"use client";

import React from "react";
import type { Profile, SubjectDef } from "@/lib/types";
import { DIFFICULTY_META } from "@/lib/types";
import { levelKey } from "@/lib/progression";

interface Props {
  subject: SubjectDef;
  profile: Profile;
  onBack: () => void;
  onPlay: (idx: number) => void;
}

export default function SubjectMap({ subject, profile, onBack, onPlay }: Props) {
  const diff = profile.difficulty ?? "normal";
  return (
    <div className="subject-map" style={{ ["--sub" as never]: subject.color }}>
      <div className="map-header">
        <button className="btn ghost" onClick={onBack}>
          ← Volver
        </button>
        <h2 className="display map-title">
          {subject.emoji} {subject.name}
        </h2>
        <span className="map-tagline">{subject.tagline}</span>
        <span className="pill small map-diff" title="El progreso se guarda por separado en cada nivel de dificultad">
          {DIFFICULTY_META[diff].emoji} Progreso en {DIFFICULTY_META[diff].label}
        </span>
      </div>

      <div className="level-path">
        {subject.levels.map((lv, i) => {
          const rec = profile.levels[levelKey(subject.id, i, diff)];
          const prevOk = i === 0 || (profile.levels[levelKey(subject.id, i - 1, diff)]?.stars ?? 0) > 0;
          const locked = !prevOk;
          const stars = rec?.stars ?? 0;
          return (
            <div key={i} className={`level-node ${i % 2 === 0 ? "left" : "right"}`}>
              <button
                className={`level-card panel ${locked ? "locked" : ""} ${stars > 0 ? "done" : ""}`}
                disabled={locked}
                onClick={() => onPlay(i)}
              >
                <span className="level-emoji">{locked ? "🔒" : lv.emoji}</span>
                <span className="level-info">
                  <b className="display">
                    {i + 1}. {lv.name}
                  </b>
                  <small>{lv.desc}</small>
                  <span className="level-tier">{"🔥".repeat(lv.tier)} dificultad</span>
                </span>
                <span className="level-stars">
                  {[1, 2, 3].map((s) => (
                    <span key={s} className={s <= stars ? "star on" : "star"}>
                      ★
                    </span>
                  ))}
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
