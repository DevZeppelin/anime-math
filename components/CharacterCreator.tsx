"use client";

import React, { useState } from "react";
import type { Character, Difficulty, Profile } from "@/lib/types";
import { DIFFICULTY_META } from "@/lib/types";
import { DEFAULT_CHARACTER, newProfile } from "@/lib/storage";
import HeroStage from "./HeroStage";
import AppearanceEditor from "./AppearanceEditor";

interface Props {
  onDone: (p: Profile) => void;
  onCancel: () => void;
}

const DIFFS = Object.keys(DIFFICULTY_META) as Difficulty[];

export default function CharacterCreator({ onDone, onCancel }: Props) {
  const [name, setName] = useState("");
  const [diff, setDiff] = useState<Difficulty>("normal");
  const [ch, setCh] = useState<Character>({ ...DEFAULT_CHARACTER });

  const set = (patch: Partial<Character>) => setCh((c) => ({ ...c, ...patch }));
  const canSave = name.trim().length >= 2;

  return (
    <div className="creator-screen">
      <h1 className="display section-title">Crea tu héroe ✨</h1>

      <div className="creator-grid">
        <div className="creator-preview panel">
          <HeroStage character={ch} size={200} />
          <input
            className="name-input display"
            placeholder="Tu nombre…"
            maxLength={14}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="creator-options">
          <div className="opt-group panel">
            <h3 className="display">Nivel de aventura (según tu edad)</h3>
            <div className="diff-row">
              {DIFFS.map((k) => {
                const m = DIFFICULTY_META[k];
                return (
                  <button key={k} className={`diff-card ${diff === k ? "sel" : ""}`} onClick={() => setDiff(k)}>
                    <span className="diff-emoji">{m.emoji}</span>
                    <b className="display">{m.label}</b>
                    <span className="diff-ages">{m.ages}</span>
                    <small>{m.desc}</small>
                  </button>
                );
              })}
            </div>
          </div>

          <AppearanceEditor character={ch} onChange={set} />

          <div className="creator-actions">
            <button className="btn ghost" onClick={onCancel}>
              ← Volver
            </button>
            <button
              className="btn primary big"
              disabled={!canSave}
              onClick={() => canSave && onDone(newProfile(name.trim(), ch, diff))}
            >
              ¡Comenzar aventura! 🚀
            </button>
          </div>
          {!canSave && <p className="hint-text">Escribe tu nombre (mínimo 2 letras) para continuar.</p>}
        </div>
      </div>
    </div>
  );
}
