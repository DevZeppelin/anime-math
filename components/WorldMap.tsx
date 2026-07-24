"use client";

import React from "react";
import type { MapPoint } from "@/lib/types";

// ─────────────────────────────────────────────────────────────
// Mapamundi estilizado (NO son fronteras políticas reales, es un
// "atlas de cuentos" con la forma y posición aproximada de cada
// continente) para que el niño toque un lugar y aprenda dónde
// está y qué tan grande es comparado con el resto del planeta.
// viewBox equirectangular: x 0..1000 = longitud -180..180,
//                          y 0..500  = latitud   90..-90.
// ─────────────────────────────────────────────────────────────

interface Props {
  points: MapPoint[];
  answer: string;
  picked: string | null;
  reveal: boolean; // true en fase "feedback": muestra el nombre y el color correcto/incorrecto
  big?: boolean; // pines grandes y fáciles de tocar (continentes, modo Pequeños)
  onPick: (id: string) => void;
}

const CONTINENTS: { id: string; d: string; fill: string }[] = [
  { id: "namerica", d: "M118,68 Q95,50 155,44 Q222,38 262,58 Q294,80 272,112 Q302,138 268,172 Q248,204 216,212 Q192,232 176,218 Q158,198 148,170 Q118,150 108,118 Q98,90 118,68 Z", fill: "#7fd8a0" },
  { id: "samerica", d: "M268,232 Q300,220 332,242 Q362,272 350,322 Q346,372 320,412 Q298,432 280,410 Q268,380 264,340 Q252,300 258,260 Q258,242 268,232 Z", fill: "#9fe0b0" },
  { id: "europe", d: "M458,88 Q502,68 552,80 Q582,92 570,122 Q560,142 528,152 Q498,158 472,142 Q452,120 458,88 Z", fill: "#7cc4ff" },
  { id: "africa", d: "M478,160 Q542,148 592,170 Q622,202 610,252 Q600,302 580,332 Q554,352 528,330 Q508,300 498,260 Q484,220 478,190 Z", fill: "#ffcf6b" },
  { id: "asia", d: "M598,78 Q702,58 802,68 Q902,88 912,140 Q900,182 858,192 Q818,202 778,182 Q738,192 698,172 Q648,160 618,140 Q592,110 598,78 Z", fill: "#ff9d8a" },
  { id: "oceania", d: "M828,290 Q880,278 910,300 Q926,322 910,346 Q884,362 848,352 Q822,336 828,290 Z", fill: "#c9a0ff" },
];

export default function WorldMap({ points, answer, picked, reveal, big = false, onPick }: Props) {
  const r = big ? 34 : 15;
  return (
    <svg viewBox="0 0 1000 500" className="world-map-svg" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="oceanGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1c3f66" />
          <stop offset="100%" stopColor="#0f2743" />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={1000} height={500} rx={20} fill="url(#oceanGrad)" />
      {/* graticula: ecuador y meridiano de referencia, dan noción de escala del planeta */}
      <line x1={0} y1={250} x2={1000} y2={250} stroke="#ffffff" strokeOpacity={0.18} strokeDasharray="6 8" strokeWidth={2} />
      <line x1={500} y1={0} x2={500} y2={500} stroke="#ffffff" strokeOpacity={0.12} strokeDasharray="6 8" strokeWidth={2} />
      <text x={984} y={244} textAnchor="end" fontSize={13} fill="#ffffff" opacity={0.4}>ECUADOR</text>
      {CONTINENTS.map((c) => (
        <path key={c.id} d={c.d} fill={c.fill} opacity={0.88} stroke="#132a45" strokeWidth={2} />
      ))}
      {points.map((p) => {
        const isAnswer = p.id === answer;
        const isPicked = p.id === picked;
        let fill = big ? "#ffffff" : "#ff5a6e";
        let opacity = big ? 0.3 : 0.96;
        if (reveal) {
          fill = isAnswer ? "#3df09a" : isPicked ? "#ff5a6e" : "#9aa6c4";
          opacity = isAnswer || isPicked ? 0.9 : 0.22;
        }
        return (
          <g
            key={p.id}
            className="map-pin"
            style={{ cursor: reveal ? "default" : "pointer" }}
            onClick={() => !reveal && onPick(p.id)}
          >
            <circle cx={p.x} cy={p.y} r={r} fill={fill} stroke="#132a45" strokeWidth={3} opacity={opacity} />
            {isPicked && !reveal && <circle cx={p.x} cy={p.y} r={r + 6} fill="none" stroke="#fff" strokeWidth={2} opacity={0.7} />}
            {reveal && (isAnswer || isPicked) && (
              <text x={p.x} y={p.y - r - 8} textAnchor="middle" fontSize={big ? 22 : 17} fontWeight={800} fill="#fff" stroke="#132a45" strokeWidth={3} paintOrder="stroke">
                {p.label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
