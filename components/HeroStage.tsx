"use client";

import React from "react";
import type { Character } from "@/lib/types";
import Avatar from "./Avatar";

// ─────────────────────────────────────────────────────────────
// Escenario de previsualización estilo anime: rayos giratorios,
// destellos flotantes, podio con brillo y el héroe en el centro.
// ─────────────────────────────────────────────────────────────

interface Props {
  character: Character;
  size?: number; // ancho del avatar en px
  showBackground?: boolean;
  name?: string;
}

const SPARKS = [
  { left: "12%", top: "18%", delay: "0s", scale: 1 },
  { left: "84%", top: "12%", delay: "0.7s", scale: 0.7 },
  { left: "8%", top: "62%", delay: "1.3s", scale: 0.8 },
  { left: "88%", top: "55%", delay: "0.4s", scale: 1.1 },
  { left: "20%", top: "80%", delay: "1.8s", scale: 0.6 },
  { left: "76%", top: "78%", delay: "1s", scale: 0.9 },
];

export default function HeroStage({ character, size = 180, showBackground = false, name }: Props) {
  return (
    <div className="hero-stage">
      <div className="stage-rays" aria-hidden />
      <div className="stage-glow" aria-hidden />
      {SPARKS.map((s, i) => (
        <span
          key={i}
          className="stage-spark"
          aria-hidden
          style={{ left: s.left, top: s.top, animationDelay: s.delay, transform: `scale(${s.scale})` }}
        >
          ✦
        </span>
      ))}
      <div className="stage-avatar">
        <Avatar character={character} size={size} idle showBackground={showBackground} />
      </div>
      <div className="stage-podium" aria-hidden />
      {name && <b className="display stage-name">{name}</b>}
    </div>
  );
}
