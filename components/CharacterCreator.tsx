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
  // sin valor por defecto: obliga a elegir a propósito el nivel de edad,
  // así nunca arranca en "Aventureros" sin que nadie lo haya tocado
  const [diff, setDiff] = useState<Difficulty | null>(null);
  const [ch, setCh] = useState<Character>({ ...DEFAULT_CHARACTER });

  const set = (patch: Partial<Character>) => setCh((c) => ({ ...c, ...patch }));
  const canSave = name.trim().length >= 2 && diff !== null;

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
          <div className={`opt-group panel ${diff === null ? "needs-choice" : ""}`}>
            <h3 className="display">
              Nivel de aventura (según tu edad) {diff === null && <span className="req-dot">●</span>}
            </h3>
            <div className="diff-row">
              {DIFFS.map((k) => {
                const m = DIFFICULTY_META[k];
                const sel = diff === k;
                return (
                  <button
                    key={k}
                    type="button"
                    className={`diff-card ${sel ? "sel" : ""}`}
                    aria-pressed={sel}
                    onClick={() => setDiff(k)}
                  >
                    {sel && <span className="diff-check">✓</span>}
                    <span className="diff-emoji">{m.emoji}</span>
                    <b className="display">{m.label}</b>
                    <span className="diff-ages">{m.ages}</span>
                    <small>{m.desc}</small>
                  </button>
                );
              })}
            </div>
            {diff === null && <p className="hint-text">Toca una tarjeta para elegir el nivel 👆</p>}
          </div>

          <AppearanceEditor character={ch} onChange={set} />

          <div className="creator-actions">
            <button className="btn ghost" onClick={onCancel}>
              ← Volver
            </button>
            <button
              className="btn primary big"
              disabled={!canSave}
              onClick={() => diff && canSave && onDone(newProfile(name.trim(), ch, diff))}
            >
              ¡Comenzar aventura! 🚀
            </button>
          </div>
          {!canSave && (
            <p className="hint-text">
              {name.trim().length < 2
                ? "Escribe tu nombre (mínimo 2 letras) "
                : ""}
              {diff === null ? "y elige un nivel de aventura " : ""}
              para continuar.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
