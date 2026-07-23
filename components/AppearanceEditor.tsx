"use client";

import React from "react";
import type { Character } from "@/lib/types";
import {
  SKIN_TONES,
  HAIR_COLORS,
  EYE_COLORS,
  HAIR_STYLES,
  EYE_STYLES,
  MOUTH_STYLES,
  FACE_MARKS,
  BODY_TYPES,
} from "@/lib/items";
import Avatar from "./Avatar";

interface Props {
  character: Character;
  onChange: (patch: Partial<Character>) => void;
}

/** Grupos de opciones gratuitas del personaje (usado por el creador y el vestuario). */
export default function AppearanceEditor({ character: ch, onChange }: Props) {
  return (
    <>
      <div className="opt-group panel">
        <h3 className="display">Peinado</h3>
        <div className="opt-row hair-row">
          {HAIR_STYLES.map((h) => (
            <button
              key={h.id}
              className={`hair-chip ${ch.hairStyle === h.id ? "sel" : ""}`}
              onClick={() => onChange({ hairStyle: h.id })}
            >
              <span className="hair-thumb">
                <Avatar character={{ ...ch, hairStyle: h.id }} size={76} />
              </span>
              <span className="hair-label">{h.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="opt-group panel">
        <h3 className="display">Cuerpo</h3>
        <div className="opt-row hair-row">
          {BODY_TYPES.map((b) => (
            <button
              key={b.id}
              className={`hair-chip ${ch.bodyType === b.id ? "sel" : ""}`}
              onClick={() => onChange({ bodyType: b.id })}
              title={b.desc}
            >
              <span className="hair-thumb">
                <Avatar character={{ ...ch, bodyType: b.id }} size={76} />
              </span>
              <span className="hair-label">{b.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="opt-group panel">
        <h3 className="display">Color de pelo</h3>
        <div className="opt-row">
          {HAIR_COLORS.map((c) => (
            <button
              key={c}
              className={`swatch ${ch.hairColor === c ? "sel" : ""}`}
              style={{ background: c }}
              onClick={() => onChange({ hairColor: c })}
              aria-label={`Color ${c}`}
            />
          ))}
        </div>
      </div>

      <div className="opt-group panel">
        <h3 className="display">Tono de piel</h3>
        <div className="opt-row">
          {SKIN_TONES.map((c) => (
            <button
              key={c}
              className={`swatch ${ch.skin === c ? "sel" : ""}`}
              style={{ background: c }}
              onClick={() => onChange({ skin: c })}
              aria-label={`Piel ${c}`}
            />
          ))}
        </div>
      </div>

      <div className="opt-group panel">
        <h3 className="display">Ojos</h3>
        <div className="opt-row">
          {EYE_STYLES.map((e) => (
            <button
              key={e.id}
              className={`opt-chip ${ch.eyeStyle === e.id ? "sel" : ""}`}
              onClick={() => onChange({ eyeStyle: e.id })}
            >
              {e.emoji} {e.label}
            </button>
          ))}
        </div>
        <div className="opt-row" style={{ marginTop: 10 }}>
          {EYE_COLORS.map((c) => (
            <button
              key={c}
              className={`swatch ${ch.eyeColor === c ? "sel" : ""}`}
              style={{ background: c }}
              onClick={() => onChange({ eyeColor: c })}
              aria-label={`Ojos ${c}`}
            />
          ))}
        </div>
      </div>

      <div className="opt-group panel">
        <h3 className="display">Expresión</h3>
        <div className="opt-row">
          {MOUTH_STYLES.map((m) => (
            <button
              key={m.id}
              className={`opt-chip ${ch.mouth === m.id ? "sel" : ""}`}
              onClick={() => onChange({ mouth: m.id })}
            >
              {m.emoji} {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="opt-group panel">
        <h3 className="display">Marca especial</h3>
        <div className="opt-row">
          {FACE_MARKS.map((f) => (
            <button
              key={f.id}
              className={`opt-chip ${ch.faceMark === f.id ? "sel" : ""}`}
              onClick={() => onChange({ faceMark: f.id })}
            >
              {f.emoji} {f.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
