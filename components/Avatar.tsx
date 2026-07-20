"use client";

import React, { useId } from "react";
import type { Character } from "@/lib/types";
import { getItem } from "@/lib/items";

// ─────────────────────────────────────────────────────────────
// Avatar RPG de cuerpo completo, dibujado por capas SVG:
// fondo → aura → alas/capa → cuerpo → traje → cara → pelo →
// accesorio → arma → mascota
// ─────────────────────────────────────────────────────────────

interface Props {
  character: Character;
  size?: number; // ancho en px (alto = size * 1.3)
  showBackground?: boolean;
  idle?: boolean; // animación de flotado suave
}

const W = 200;
const H = 260;

function darken(hex: string, f = 0.75): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  const r = Math.round(((n >> 16) & 255) * f);
  const g = Math.round(((n >> 8) & 255) * f);
  const b = Math.round((n & 255) * f);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

function lighten(hex: string, f = 0.35): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  const r = Math.round(((n >> 16) & 255) + (255 - ((n >> 16) & 255)) * f);
  const g = Math.round(((n >> 8) & 255) + (255 - ((n >> 8) & 255)) * f);
  const b = Math.round((n & 255) + (255 - (n & 255)) * f);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

export default function Avatar({ character, size = 160, showBackground = false, idle = false }: Props) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const c = character;
  const outfit = getItem(c.outfit);
  const weapon = getItem(c.weapon);
  const accessory = getItem(c.accessory);
  const pet = getItem(c.pet);
  const aura = getItem(c.aura);
  const bg = showBackground ? getItem(c.background) : undefined;

  const skin = c.skin;
  const skinD = darken(skin, 0.82);
  const skinL = lighten(skin, 0.25);
  const hair = c.hairColor;
  const hairD = darken(hair, 0.7);
  const hairL = lighten(hair, 0.3);
  const eye = c.eyeColor;
  const lineC = "#2a2038"; // color de contorno general

  const hairG = `url(#hairG${uid})`;
  const irisG = `url(#irisG${uid})`;

  const o1 = outfit?.c1 ?? "#3d5a99";
  const o2 = outfit?.c2 ?? "#2b3f6b";
  const o3 = outfit?.c3 ?? "#ffd24d";
  const variant = outfit?.variant ?? "suit";
  const isSkirt = variant === "dress" || variant === "robe";

  // ── fondo ──────────────────────────────────────────────────
  let bgArt: React.ReactNode = null;
  if (bg) {
    const b1 = bg.c1 ?? "#223";
    const b2 = bg.c2 ?? "#446";
    const deco: React.ReactNode[] = [];
    if (bg.id === "bg_space" || bg.id === "bg_aurora" || bg.id === "bg_city") {
      for (let i = 0; i < 14; i++) {
        deco.push(
          <circle key={`s${i}`} cx={(i * 53 + 20) % W} cy={(i * 37 + 12) % 150} r={i % 3 === 0 ? 2 : 1.2} fill="#fff" opacity={0.8} />
        );
      }
    }
    if (bg.id === "bg_meadow" || bg.id === "bg_beach") {
      deco.push(<circle key="sun" cx={160} cy={40} r={20} fill="#ffdf6b" opacity={0.9} />);
    }
    if (bg.id === "bg_forest") {
      deco.push(
        <g key="trees" opacity={0.75}>
          <polygon points="30,190 55,110 80,190" fill={darken(b2, 0.7)} />
          <polygon points="130,195 158,100 186,195" fill={darken(b2, 0.6)} />
        </g>
      );
    }
    if (bg.id === "bg_city") {
      deco.push(
        <g key="city" opacity={0.7}>
          <rect x={10} y={120} width={30} height={90} fill="#1a1a33" />
          <rect x={48} y={90} width={26} height={120} fill="#222244" />
          <rect x={150} y={105} width={34} height={105} fill="#1a1a33" />
          {Array.from({ length: 9 }, (_, i) => (
            <rect key={i} x={16 + (i % 3) * 9} y={130 + Math.floor(i / 3) * 18} width={5} height={7} fill="#ffd24d" opacity={0.85} />
          ))}
        </g>
      );
    }
    if (bg.id === "bg_volcano") {
      deco.push(
        <g key="vol">
          <polygon points="20,210 100,70 180,210" fill={darken(b1, 0.8)} />
          <polygon points="86,95 100,70 114,95" fill="#ff7a3c" />
        </g>
      );
    }
    if (bg.id === "bg_castle") {
      deco.push(
        <g key="cas" opacity={0.8}>
          <rect x={60} y={90} width={80} height={110} fill="#6b7fc4" />
          <rect x={48} y={70} width={22} height={130} fill="#7d92da" />
          <rect x={130} y={70} width={22} height={130} fill="#7d92da" />
          <polygon points="48,70 59,46 70,70" fill="#4d5fa3" />
          <polygon points="130,70 141,46 152,70" fill="#4d5fa3" />
        </g>
      );
    }
    if (bg.id === "bg_aurora") {
      deco.push(
        <g key="au" opacity={0.5}>
          <path d="M0,80 Q60,30 110,70 T200,50 L200,0 L0,0 Z" fill="#3df09a" />
          <path d="M0,110 Q80,60 140,95 T200,85 L200,55 Q120,35 60,80 T0,80 Z" fill="#41b6ff" opacity={0.6} />
        </g>
      );
    }
    bgArt = (
      <g>
        <rect x={0} y={0} width={W} height={H} rx={18} fill={`url(#bgGrad${uid})`} />
        {deco}
        <rect x={0} y={200} width={W} height={60} rx={18} fill={darken(b1, 0.7)} opacity={0.5} />
      </g>
    );
  }

  // ── aura ───────────────────────────────────────────────────
  let auraArt: React.ReactNode = null;
  if (aura) {
    const a1 = aura.c1 ?? "#ffd24d";
    auraArt = (
      <g>
        <ellipse cx={100} cy={140} rx={78} ry={105} fill={a1} opacity={0.16} />
        <ellipse cx={100} cy={140} rx={60} ry={88} fill={a1} opacity={0.14} />
        {[
          [34, 70], [166, 90], [40, 190], [162, 180], [100, 18], [58, 34], [148, 30],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={i % 2 === 0 ? 3 : 2} fill={a1} opacity={0.85} className="aura-spark" />
        ))}
      </g>
    );
  }

  // ── accesorios traseros (capa, alas) ───────────────────────
  let backAcc: React.ReactNode = null;
  if (accessory?.variant === "cape") {
    backAcc = (
      <path
        d={`M72,120 Q100,110 128,120 L142,215 Q100,232 58,215 Z`}
        fill={accessory.c1}
        stroke={darken(accessory.c1 ?? "#c00", 0.7)}
        strokeWidth={2}
      />
    );
  } else if (accessory?.variant === "wings") {
    const w1 = accessory.c1 ?? "#bfe9ff";
    backAcc = (
      <g opacity={0.92}>
        <path d="M70,130 Q20,90 12,140 Q38,150 62,158 Z" fill={w1} />
        <path d="M70,145 Q26,130 24,172 Q48,172 66,168 Z" fill={accessory.c2 ?? w1} />
        <path d="M130,130 Q180,90 188,140 Q162,150 138,158 Z" fill={w1} />
        <path d="M130,145 Q174,130 176,172 Q152,172 134,168 Z" fill={accessory.c2 ?? w1} />
      </g>
    );
  }

  // ── pelo trasero (masas que van DETRÁS del cuerpo) ─────────
  let hairBack: React.ReactNode = null;
  switch (c.hairStyle) {
    case "long":
      hairBack = (
        <path d="M56,60 Q44,120 52,158 Q60,170 70,160 L72,90 L128,90 L130,160 Q140,170 148,158 Q156,120 144,60 Z" fill={hairD} />
      );
      break;
    case "wavy":
      hairBack = (
        <path
          d="M56,60 Q40,95 52,115 Q42,135 54,152 Q46,168 62,172 Q74,166 72,150 L74,90 L126,90 L128,150 Q126,166 138,172 Q154,168 146,152 Q158,135 148,115 Q160,95 144,60 Z"
          fill={hairD}
        />
      );
      break;
    case "hime":
      hairBack = (
        <path d="M58,60 Q48,120 54,166 Q70,174 78,164 L78,88 L122,88 L122,164 Q130,174 146,166 Q152,120 142,60 Z" fill={hairD} />
      );
      break;
    case "twintails":
      hairBack = (
        <g>
          <path d="M60,62 Q26,84 32,146 Q36,166 50,160 Q44,108 68,78 Z" fill={hairD} />
          <path d="M140,62 Q174,84 168,146 Q164,166 150,160 Q156,108 132,78 Z" fill={hairD} />
        </g>
      );
      break;
    case "braid":
      hairBack = (
        <g>
          {[70, 88, 106, 124, 140].map((y, i) => (
            <circle key={i} cx={146 + (i % 2 === 0 ? 2 : -2)} cy={y} r={10 - i * 0.8} fill={i % 2 === 0 ? hairD : darken(hair, 0.58)} />
          ))}
          <polygon points="140,150 148,166 154,148" fill={darken(hair, 0.58)} />
        </g>
      );
      break;
  }

  // ── piernas y zapatos ──────────────────────────────────────
  const legs = (
    <g>
      {variant === "sport" ? (
        <>
          <rect x={78} y={178} width={20} height={26} rx={7} fill={o2} />
          <rect x={102} y={178} width={20} height={26} rx={7} fill={o2} />
          <rect x={82} y={200} width={13} height={34} rx={6} fill={skin} />
          <rect x={105} y={200} width={13} height={34} rx={6} fill={skin} />
        </>
      ) : isSkirt ? (
        <>
          <rect x={82} y={195} width={13} height={40} rx={6} fill={skin} />
          <rect x={105} y={195} width={13} height={40} rx={6} fill={skin} />
        </>
      ) : (
        <>
          <rect x={79} y={178} width={19} height={58} rx={8} fill={o2} />
          <rect x={102} y={178} width={19} height={58} rx={8} fill={o2} />
          <rect x={79} y={218} width={19} height={8} rx={4} fill={darken(o2, 0.85)} />
          <rect x={102} y={218} width={19} height={8} rx={4} fill={darken(o2, 0.85)} />
        </>
      )}
      {/* zapatos */}
      <ellipse cx={88} cy={240} rx={15} ry={9} fill={darken(o3, 0.85)} />
      <ellipse cx={112} cy={240} rx={15} ry={9} fill={darken(o3, 0.85)} />
      <ellipse cx={86} cy={237} rx={7} ry={4} fill={lighten(darken(o3, 0.85), 0.25)} />
      <ellipse cx={110} cy={237} rx={7} ry={4} fill={lighten(darken(o3, 0.85), 0.25)} />
    </g>
  );

  // ── torso / traje ──────────────────────────────────────────
  let torso: React.ReactNode;
  if (isSkirt) {
    torso = (
      <g>
        <path d={`M76,122 L124,122 L140,214 Q100,226 60,214 Z`} fill={o1} />
        <path d={`M76,122 L124,122 L128,150 L72,150 Z`} fill={darken(o1, 0.9)} />
        {variant === "robe" && <path d="M96,122 L104,122 L106,210 L94,210 Z" fill={o3} opacity={0.9} />}
        {variant === "dress" && (
          <>
            <circle cx={100} cy={140} r={4} fill={o3} />
            <circle cx={100} cy={156} r={4} fill={o3} />
            <path d="M60,214 Q100,226 140,214 L138,206 Q100,218 62,206 Z" fill={o3} opacity={0.85} />
          </>
        )}
        <path d="M76,122 L84,122 L70,205 Q64,208 62,212 Z" fill="#fff" opacity={0.1} />
      </g>
    );
  } else if (variant === "armor") {
    torso = (
      <g>
        <rect x={72} y={118} width={56} height={66} rx={14} fill={o1} />
        <rect x={72} y={118} width={56} height={20} rx={10} fill={darken(o1, 0.85)} />
        <circle cx={100} cy={152} r={11} fill={o3} />
        <circle cx={100} cy={152} r={6} fill={darken(o3, 0.8)} />
        <rect x={72} y={172} width={56} height={10} rx={5} fill={darken(o1, 0.7)} />
        <ellipse cx={70} cy={126} rx={13} ry={10} fill={darken(o1, 0.8)} />
        <ellipse cx={130} cy={126} rx={13} ry={10} fill={darken(o1, 0.8)} />
        <rect x={76} y={124} width={9} height={50} rx={4} fill="#fff" opacity={0.14} />
      </g>
    );
  } else {
    torso = (
      <g>
        <rect x={74} y={118} width={52} height={66} rx={13} fill={o1} />
        {variant === "sport" ? (
          <>
            <rect x={74} y={118} width={52} height={12} rx={6} fill={o3} />
            <text x={100} y={160} textAnchor="middle" fontSize={22} fontWeight={800} fill={o3} fontFamily="sans-serif">7</text>
          </>
        ) : (
          <>
            <path d="M100,118 L112,118 L100,140 L88,118 Z" fill={darken(o1, 0.85)} />
            <rect x={74} y={170} width={52} height={8} rx={4} fill={o3} opacity={0.9} />
            <circle cx={100} cy={150} r={3} fill={o3} />
            <circle cx={100} cy={162} r={3} fill={o3} />
          </>
        )}
        <rect x={78} y={122} width={8} height={56} rx={4} fill="#fff" opacity={0.1} />
      </g>
    );
  }

  // ── brazos ─────────────────────────────────────────────────
  const sleeve = variant === "sport" ? skin : o1;
  const arms = (
    <g>
      <rect x={56} y={122} width={16} height={52} rx={8} fill={sleeve} />
      <rect x={128} y={122} width={16} height={52} rx={8} fill={sleeve} />
      {variant !== "sport" && (
        <>
          <rect x={56} y={158} width={16} height={10} fill={darken(sleeve, 0.85)} />
          <rect x={128} y={158} width={16} height={10} fill={darken(sleeve, 0.85)} />
        </>
      )}
      <circle cx={64} cy={180} r={9} fill={skin} />
      <circle cx={136} cy={180} r={9} fill={skin} />
      <circle cx={62} cy={178} r={3.5} fill={skinL} opacity={0.7} />
      <circle cx={134} cy={178} r={3.5} fill={skinL} opacity={0.7} />
    </g>
  );

  // ── ojos ───────────────────────────────────────────────────
  function drawEye(cx: number, mirror: boolean): React.ReactNode {
    const s = mirror ? -1 : 1;
    const lash = (
      <g stroke={lineC} strokeWidth={2.2} strokeLinecap="round" fill="none">
        <path d={`M${cx - 9 * s},76 Q${cx},68 ${cx + 9 * s},76`} strokeWidth={2.6} />
        <line x1={cx + 8.5 * s} y1={74.5} x2={cx + 12 * s} y2={71.5} />
        <line x1={cx + 6 * s} y1={71.8} x2={cx + 8.5 * s} y2={68.5} />
      </g>
    );
    switch (c.eyeStyle) {
      case "happy":
        return (
          <g stroke={lineC} strokeWidth={3.2} strokeLinecap="round" fill="none">
            <path d={`M${cx - 8 * s},84 Q${cx},74 ${cx + 8 * s},84`} />
            <line x1={cx + 7.5 * s} y1={80} x2={cx + 11 * s} y2={77} strokeWidth={2.2} />
          </g>
        );
      case "sleepy":
        return (
          <g>
            <path d={`M${cx - 9},84 Q${cx},78 ${cx + 9},84 L${cx + 9},88 Q${cx},96 ${cx - 9},88 Z`} fill="#fff" />
            <ellipse cx={cx} cy={86} rx={5.5} ry={6} fill={irisG} />
            <ellipse cx={cx} cy={86.5} rx={2.4} ry={3} fill="#1c1626" />
            <circle cx={cx - 1.8} cy={84.5} r={1.4} fill="#fff" />
            <path d={`M${cx - 9.5},83 Q${cx},76 ${cx + 9.5},83`} stroke={lineC} strokeWidth={2.8} strokeLinecap="round" fill="none" />
          </g>
        );
      case "determined":
        return (
          <g>
            <path d={`M${cx - 9 * s},73 L${cx + 9 * s},78.5 L${cx + 9 * s},88 Q${cx},95 ${cx - 9 * s},88 Z`} fill="#fff" />
            <ellipse cx={cx + 1 * s} cy={83.5} rx={6} ry={7.5} fill={irisG} />
            <ellipse cx={cx + 1 * s} cy={84.5} rx={2.8} ry={4} fill="#1c1626" />
            <circle cx={cx - 1.5 * s} cy={80} r={2.2} fill="#fff" />
            <path d={`M${cx - 9 * s},73 L${cx + 9.5 * s},78.4`} stroke={lineC} strokeWidth={3} strokeLinecap="round" />
          </g>
        );
      case "star":
        return (
          <g>
            <ellipse cx={cx} cy={81} rx={9} ry={11.5} fill="#fff" />
            <ellipse cx={cx} cy={82} rx={7} ry={9.5} fill={irisG} />
            <path
              d={`M${cx},75.5 L${cx + 1.8},80 L${cx + 6.4},80.4 L${cx + 2.9},83.4 L${cx + 4},88 L${cx},85.2 L${cx - 4},88 L${cx - 2.9},83.4 L${cx - 6.4},80.4 L${cx - 1.8},80 Z`}
              fill="#fff"
              opacity={0.95}
            />
            {lash}
          </g>
        );
      default:
        return (
          <g>
            <ellipse cx={cx} cy={81} rx={9} ry={12} fill="#fff" />
            <ellipse cx={cx} cy={82.5} rx={6.5} ry={9.5} fill={irisG} />
            <ellipse cx={cx} cy={84} rx={3} ry={5} fill="#1c1626" />
            <circle cx={cx - 2.5} cy={78.5} r={2.8} fill="#fff" />
            <circle cx={cx + 2.5} cy={87} r={1.4} fill="#fff" opacity={0.85} />
            {lash}
          </g>
        );
    }
  }

  // ── cejas ──────────────────────────────────────────────────
  const brows =
    c.eyeStyle === "determined" ? (
      <g stroke={hairD} strokeWidth={3} fill="none" strokeLinecap="round">
        <path d="M73,62 L93,68" />
        <path d="M127,62 L107,68" />
      </g>
    ) : (
      <g stroke={hairD} strokeWidth={2.6} fill="none" strokeLinecap="round">
        <path d="M74,66 Q83,61.5 92,65" />
        <path d="M108,65 Q117,61.5 126,66" />
      </g>
    );

  // ── boca ───────────────────────────────────────────────────
  let mouthArt: React.ReactNode;
  const mC = darken(skin, 0.55);
  switch (c.mouth) {
    case "grin":
      mouthArt = (
        <g>
          <path d="M89,99 Q100,113 111,99 Z" fill="#8a3b4a" stroke={mC} strokeWidth={1.6} strokeLinejoin="round" />
          <path d="M91,99.5 Q100,103 109,99.5 L108,101.5 Q100,105 92,101.5 Z" fill="#fff" />
          <path d="M94,107 Q100,110 106,107 Q100,112 94,107 Z" fill="#e0607a" />
        </g>
      );
      break;
    case "cat":
      mouthArt = (
        <path d="M91,100 Q95.5,105.5 100,100.5 Q104.5,105.5 109,100" stroke={mC} strokeWidth={2.4} fill="none" strokeLinecap="round" />
      );
      break;
    case "neutral":
      mouthArt = <path d="M93,102 L107,102" stroke={mC} strokeWidth={2.4} strokeLinecap="round" />;
      break;
    case "smirk":
      mouthArt = <path d="M92,102 Q102,107 109,98.5" stroke={mC} strokeWidth={2.5} fill="none" strokeLinecap="round" />;
      break;
    default:
      mouthArt = <path d="M92,100 Q100,107.5 108,100" stroke={mC} strokeWidth={2.6} fill="none" strokeLinecap="round" />;
  }

  // ── marcas faciales ────────────────────────────────────────
  let markArt: React.ReactNode = null;
  switch (c.faceMark) {
    case "freckles":
      markArt = (
        <g fill={darken(skin, 0.68)} opacity={0.8}>
          {[
            [88, 93], [94, 95.5], [100, 94], [106, 95.5], [112, 93], [83, 95], [117, 95],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={1.3} />
          ))}
        </g>
      );
      break;
    case "blush":
      markArt = (
        <g fill="#ff7d9c" opacity={0.55}>
          <ellipse cx={72} cy={93} rx={7} ry={4.5} />
          <ellipse cx={128} cy={93} rx={7} ry={4.5} />
        </g>
      );
      break;
    case "scar":
      markArt = (
        <g stroke={darken(skin, 0.6)} strokeWidth={1.8} strokeLinecap="round">
          <line x1={122} y1={88} x2={130} y2={98} />
          <line x1={123} y1={95} x2={129} y2={91} />
        </g>
      );
      break;
    case "star":
      markArt = (
        <path
          d="M126,90 L127.6,94 L131.8,94.3 L128.6,97 L129.6,101 L126,98.7 L122.4,101 L123.4,97 L120.2,94.3 L124.4,94 Z"
          fill="#ffd24d"
          stroke="#e0a800"
          strokeWidth={0.8}
        />
      );
      break;
    case "heart":
      markArt = (
        <path
          d="M126,92.5 C124.5,89.5 120,90.5 120,93.6 C120,96 123,98.2 126,100.4 C129,98.2 132,96 132,93.6 C132,90.5 127.5,89.5 126,92.5 Z"
          fill="#ff5f8f"
          opacity={0.9}
        />
      );
      break;
  }

  // ── cabeza y cara ──────────────────────────────────────────
  const head = (
    <g>
      <rect x={92} y={104} width={16} height={16} fill={skin} />
      <path d="M92,104 L108,104 L108,112 Q100,115 92,112 Z" fill={skinD} opacity={0.5} />
      {/* orejas */}
      <circle cx={56} cy={78} r={9} fill={skin} stroke={skinD} strokeWidth={1.2} />
      <circle cx={144} cy={78} r={9} fill={skin} stroke={skinD} strokeWidth={1.2} />
      <circle cx={57.5} cy={78} r={4} fill={skinD} opacity={0.5} />
      <circle cx={142.5} cy={78} r={4} fill={skinD} opacity={0.5} />
      {/* cara */}
      <circle cx={100} cy={72} r={45} fill={skin} />
      <path d="M60,85 Q100,124 140,85 Q136,110 100,117 Q64,110 60,85 Z" fill={skinD} opacity={0.18} />
      <ellipse cx={82} cy={52} rx={18} ry={10} fill={skinL} opacity={0.5} />
      {/* mejillas suaves siempre presentes */}
      <ellipse cx={74} cy={92} rx={5} ry={3} fill="#ff8fa8" opacity={0.35} />
      <ellipse cx={126} cy={92} rx={5} ry={3} fill="#ff8fa8" opacity={0.35} />
      {drawEye(83, false)}
      {drawEye(117, true)}
      {brows}
      {/* nariz */}
      <path d="M99,90 Q101.5,92.5 99,94.5" stroke={skinD} strokeWidth={1.6} fill="none" strokeLinecap="round" />
      {mouthArt}
      {markArt}
    </g>
  );

  // ── pelo delantero ─────────────────────────────────────────
  let hairArt: React.ReactNode = null;
  const shine = (d: string) => <path d={d} fill="#fff" opacity={0.22} />;
  switch (c.hairStyle) {
    case "spiky":
      hairArt = (
        <g>
          <path
            d="M55,72 Q52,30 100,26 Q148,30 145,72 Q140,50 128,52 Q132,40 118,44 Q118,32 104,40 Q98,28 88,42 Q76,36 78,50 Q64,46 70,60 Q58,58 55,72 Z"
            fill={hairG}
          />
          <polygon points="62,58 48,30 76,44" fill={hairG} />
          <polygon points="90,38 100,10 110,38" fill={hairG} />
          <polygon points="124,44 152,30 138,58" fill={hairG} />
          <polygon points="76,42 68,22 92,36" fill={hairD} />
          <polygon points="108,36 132,22 124,42" fill={hairD} />
          {/* flequillo en picos sobre la frente */}
          <path d="M60,64 Q100,44 140,64 L132,60 L124,66 L114,58 L104,66 L96,58 L86,66 L76,58 L68,66 Z" fill={hairG} />
          {shine("M70,44 Q88,30 108,32 Q90,38 78,50 Z")}
        </g>
      );
      break;
    case "messy":
      hairArt = (
        <g>
          <path
            d="M55,76 Q50,26 100,25 Q150,26 145,76 L138,62 L132,72 L124,56 L114,68 L106,52 L96,66 L88,52 L80,66 L72,54 L66,70 L60,60 Z"
            fill={hairG}
          />
          <path d="M74,52 L80,64 L86,50 Z" fill={hairD} opacity={0.7} />
          <path d="M112,52 L118,64 L124,50 Z" fill={hairD} opacity={0.7} />
          {shine("M68,44 Q90,28 116,32 Q92,36 74,52 Z")}
        </g>
      );
      break;
    case "bob":
      hairArt = (
        <g>
          <path d="M54,80 Q50,24 100,24 Q150,24 146,80 Q146,60 138,54 Q140,44 100,42 Q60,44 62,54 Q54,60 54,80 Z" fill={hairG} />
          <path d="M54,80 Q56,94 66,96 Q58,76 62,60 Z" fill={hairG} />
          <path d="M146,80 Q144,94 134,96 Q142,76 138,60 Z" fill={hairG} />
          {/* flequillo bajo con puntas */}
          <path d="M62,54 Q100,40 138,54 L136,62 L126,56 L116,63 L106,56 L96,63 L86,56 L76,63 L66,58 Z" fill={hairG} />
          <path d="M70,46 Q100,36 130,46 Q100,30 70,46 Z" fill={hairD} />
          {shine("M66,48 Q92,32 122,38 Q94,40 74,56 Z")}
        </g>
      );
      break;
    case "long":
      hairArt = (
        <g>
          <path d="M56,70 Q52,24 100,24 Q148,24 144,70 Q142,52 130,48 Q134,56 122,54 Q124,44 108,46 Q98,36 88,48 Q74,44 76,56 Q62,54 56,70 Z" fill={hairG} />
          <path d="M56,66 Q50,110 58,150 Q66,160 72,150 L70,92 Q64,76 56,66 Z" fill={hairG} />
          <path d="M144,66 Q150,110 142,150 Q134,160 128,150 L130,92 Q136,76 144,66 Z" fill={hairG} />
          {shine("M66,46 Q90,30 118,36 Q92,40 74,54 Z")}
          <path d="M62,120 Q64,140 60,148 Q58,132 62,120 Z" fill={hairL} opacity={0.5} />
        </g>
      );
      break;
    case "wavy":
      hairArt = (
        <g>
          <path d="M56,70 Q52,24 100,24 Q148,24 144,70 Q140,50 126,50 Q128,42 112,46 Q100,36 90,48 Q76,42 78,54 Q64,52 56,70 Z" fill={hairG} />
          <path d="M56,66 Q44,96 56,116 Q46,136 58,154 Q50,168 64,170 Q74,162 68,150 Q76,136 66,120 Q76,102 66,88 Z" fill={hairG} />
          <path d="M144,66 Q156,96 144,116 Q154,136 142,154 Q150,168 136,170 Q126,162 132,150 Q124,136 134,120 Q124,102 134,88 Z" fill={hairG} />
          {shine("M64,46 Q90,30 118,36 Q92,42 72,56 Z")}
        </g>
      );
      break;
    case "hime":
      hairArt = (
        <g>
          <path d="M56,74 Q50,22 100,22 Q150,22 144,74 L138,74 Q142,40 100,38 Q58,40 62,74 Z" fill={hairG} />
          <path d="M62,60 Q100,48 138,60 L138,66 Q100,56 62,66 Z" fill={hairD} opacity={0.6} />
          {/* flequillo recto */}
          <path d="M64,44 Q100,36 136,44 L136,62 L128,58 L120,63 L112,58 L104,63 L96,58 L88,63 L80,58 L72,63 L64,58 Z" fill={hairG} />
          {/* mechones laterales rectos */}
          <rect x={50} y={58} width={15} height={62} rx={7} fill={hairG} />
          <rect x={135} y={58} width={15} height={62} rx={7} fill={hairG} />
          {shine("M68,42 Q96,34 126,40 Q98,40 74,48 Z")}
        </g>
      );
      break;
    case "ponytail":
      hairArt = (
        <g>
          <path d="M138,52 Q170,60 162,124 Q156,152 146,148 Q156,108 142,72 Z" fill={hairG} />
          <path d="M148,80 Q154,104 150,128 Q146,110 148,80 Z" fill={hairL} opacity={0.5} />
          <circle cx={141} cy={57} r={6.5} fill={hairD} />
          <path d="M55,76 Q50,24 100,24 Q150,24 145,76 Q142,52 128,50 Q130,42 112,44 Q100,34 88,46 Q70,42 72,54 Q58,56 55,76 Z" fill={hairG} />
          <path d="M74,48 Q100,36 126,48 Q100,28 74,48 Z" fill={hairD} />
          {shine("M66,48 Q90,32 118,38 Q92,42 74,56 Z")}
        </g>
      );
      break;
    case "twintails":
      hairArt = (
        <g>
          <path d="M55,76 Q50,24 100,24 Q150,24 145,76 Q140,50 100,44 Q60,50 55,76 Z" fill={hairG} />
          <path d="M58,62 Q30,86 36,148 Q42,164 54,156 Q48,106 70,78 Z" fill={hairG} />
          <path d="M142,62 Q170,86 164,148 Q158,164 146,156 Q152,106 130,78 Z" fill={hairG} />
          <circle cx={62} cy={64} r={6} fill={o3} />
          <circle cx={138} cy={64} r={6} fill={o3} />
          <path d="M84,46 Q100,38 116,46 L112,54 L88,54 Z" fill={hairD} />
          {shine("M68,46 Q92,32 120,38 Q94,42 76,54 Z")}
          <path d="M44,100 Q42,126 48,144 Q42,124 44,100 Z" fill={hairL} opacity={0.55} />
          <path d="M156,100 Q158,126 152,144 Q158,124 156,100 Z" fill={hairL} opacity={0.55} />
        </g>
      );
      break;
    case "braid":
      hairArt = (
        <g>
          <path d="M55,78 Q50,24 100,24 Q150,24 145,78 Q140,52 100,44 Q60,52 55,78 Z" fill={hairG} />
          <path d="M80,46 Q100,38 120,48 L114,56 L86,56 Z" fill={hairD} />
          {[64, 82, 100, 118, 136].map((y, i) => (
            <circle key={i} cx={140 + (i % 2 === 0 ? 3 : -1)} cy={y} r={10.5 - i} fill={i % 2 === 0 ? hairG : hairD} />
          ))}
          <polygon points="134,146 141,162 148,144" fill={hairD} />
          <circle cx={139} cy={148} r={4} fill={o3} />
          {shine("M66,48 Q92,32 122,40 Q94,44 74,56 Z")}
        </g>
      );
      break;
    case "buns":
      hairArt = (
        <g>
          <circle cx={62} cy={36} r={15} fill={hairG} />
          <circle cx={138} cy={36} r={15} fill={hairG} />
          <circle cx={62} cy={36} r={7} fill={hairD} />
          <circle cx={138} cy={36} r={7} fill={hairD} />
          <path d="M55,78 Q50,26 100,26 Q150,26 145,78 Q140,52 100,46 Q60,52 55,78 Z" fill={hairG} />
          <path d="M84,46 Q100,38 116,46 L112,54 L88,54 Z" fill={hairD} />
          {shine("M66,48 Q92,34 120,40 Q94,44 74,56 Z")}
        </g>
      );
      break;
    case "topknot":
      hairArt = (
        <g>
          <circle cx={100} cy={14} r={13} fill={hairG} />
          <path d="M92,24 L108,24 L106,32 L94,32 Z" fill={hairD} />
          <rect x={93} y={28} width={14} height={6} rx={3} fill={o3} />
          <path d="M56,76 Q52,28 100,28 Q148,28 144,76 Q140,52 100,46 Q60,52 56,76 Z" fill={hairG} />
          <path d="M82,48 Q100,40 118,48 L114,56 L86,56 Z" fill={hairD} />
          {shine("M68,48 Q92,36 120,42 Q94,46 76,56 Z")}
        </g>
      );
      break;
    case "curly":
      hairArt = (
        <g>
          {[
            [64, 52, 14], [82, 38, 15], [100, 32, 16], [118, 38, 15], [136, 52, 14],
            [56, 70, 11], [144, 70, 11], [72, 42, 12], [128, 42, 12],
          ].map(([x, y, r], i) => (
            <circle key={i} cx={x} cy={y} r={r} fill={i % 3 === 2 ? hairD : hairG} />
          ))}
          <path d="M56,70 Q60,46 100,42 Q140,46 144,70 Q100,52 56,70 Z" fill={hairG} />
          <circle cx={88} cy={36} r={5} fill={hairL} opacity={0.6} />
          <circle cx={112} cy={34} r={4} fill={hairL} opacity={0.6} />
        </g>
      );
      break;
    case "afro":
      hairArt = (
        <g>
          {[
            [100, 26, 26], [70, 36, 20], [130, 36, 20], [54, 58, 17], [146, 58, 17],
            [58, 80, 13], [142, 80, 13], [84, 20, 18], [116, 20, 18],
          ].map(([x, y, r], i) => (
            <circle key={i} cx={x} cy={y} r={r} fill={i % 3 === 2 ? hairD : hairG} />
          ))}
          <path d="M55,80 Q52,36 100,34 Q148,36 145,80 Q140,56 100,50 Q60,56 55,80 Z" fill={hairG} />
          <circle cx={78} cy={28} r={5} fill={hairL} opacity={0.55} />
          <circle cx={118} cy={24} r={4.5} fill={hairL} opacity={0.55} />
          <circle cx={60} cy={52} r={4} fill={hairL} opacity={0.45} />
        </g>
      );
      break;
    case "mohawk":
      hairArt = (
        <g>
          <path d="M58,70 Q54,40 84,32 L84,54 Q66,56 58,70 Z" fill={hairD} opacity={0.6} />
          <path d="M142,70 Q146,40 116,32 L116,54 Q134,56 142,70 Z" fill={hairD} opacity={0.6} />
          <path d="M88,50 L88,8 Q100,0 100,12 Q102,2 112,10 L112,50 Q100,42 88,50 Z" fill={hairG} />
          <polygon points="88,28 78,14 90,20" fill={hairG} />
          <polygon points="112,28 122,14 110,20" fill={hairG} />
          <path d="M92,46 L92,16 L98,24 L98,46 Z" fill={hairD} />
          {shine("M99,10 L104,8 L104,40 L99,42 Z")}
        </g>
      );
      break;
  }

  // ── accesorios frontales ───────────────────────────────────
  let frontAcc: React.ReactNode = null;
  if (accessory) {
    const a1 = accessory.c1 ?? "#333";
    const a2 = accessory.c2 ?? darken(a1, 0.8);
    switch (accessory.variant) {
      case "glasses":
        frontAcc = (
          <g stroke={a1} strokeWidth={3} fill="rgba(255,255,255,0.14)">
            <circle cx={83} cy={81} r={12} />
            <circle cx={117} cy={81} r={12} />
            <line x1={95} y1={81} x2={105} y2={81} />
            <line x1={71} y1={79} x2={58} y2={74} />
            <line x1={129} y1={79} x2={142} y2={74} />
          </g>
        );
        break;
      case "scarf":
        frontAcc = (
          <g>
            <rect x={78} y={106} width={44} height={14} rx={7} fill={a1} />
            <rect x={92} y={112} width={13} height={30} rx={6} fill={a2} />
          </g>
        );
        break;
      case "headband":
        frontAcc = (
          <g>
            <rect x={57} y={52} width={86} height={11} rx={5} fill={a1} />
            <rect x={90} y={54} width={20} height={7} rx={3} fill={a2} />
            <path d="M140,58 L158,50 L154,64 Z" fill={a1} />
          </g>
        );
        break;
      case "cap":
        frontAcc = (
          <g>
            <path d="M56,52 Q56,18 100,18 Q144,18 144,52 Z" fill={a1} />
            <path d="M52,52 L148,52 Q150,58 144,58 L56,58 Q50,58 52,52 Z" fill={a2} />
            <path d="M118,50 Q160,44 162,58 L120,58 Z" fill={a1} />
            <circle cx={100} cy={20} r={4} fill={a2} />
          </g>
        );
        break;
      case "catears":
        frontAcc = (
          <g>
            <polygon points="58,44 66,10 88,34" fill={a1} />
            <polygon points="64,38 69,19 82,33" fill={a2} />
            <polygon points="142,44 134,10 112,34" fill={a1} />
            <polygon points="136,38 131,19 118,33" fill={a2} />
          </g>
        );
        break;
      case "wizardhat":
        frontAcc = (
          <g>
            <ellipse cx={100} cy={42} rx={52} ry={12} fill={a1} />
            <path d="M66,42 Q96,-24 112,-8 Q104,10 134,42 Z" fill={a1} />
            <path d="M66,42 Q100,32 134,42 Q100,54 66,42 Z" fill={darken(a1, 0.8)} />
            <circle cx={104} cy={6} r={5} fill={a2} />
            <polygon points="84,26 90,16 96,26 90,34" fill={a2} />
          </g>
        );
        break;
      case "helmet":
        frontAcc = (
          <g>
            <path d="M55,64 Q52,20 100,18 Q148,20 145,64 L145,54 Q100,40 55,54 Z" fill={a1} />
            <path d="M55,64 L145,64 L145,54 Q100,44 55,54 Z" fill={darken(a1, 0.75)} />
            <path d="M58,44 Q34,26 40,6 Q52,18 62,30 Z" fill={a2} />
            <path d="M142,44 Q166,26 160,6 Q148,18 138,30 Z" fill={a2} />
          </g>
        );
        break;
      case "halo":
        frontAcc = (
          <ellipse cx={100} cy={10} rx={26} ry={7} fill="none" stroke={a1} strokeWidth={5} opacity={0.95} />
        );
        break;
      case "crown":
        frontAcc = (
          <g>
            <path d="M66,44 L66,20 L80,32 L100,10 L120,32 L134,20 L134,44 Z" fill={a1} />
            <rect x={66} y={40} width={68} height={8} rx={3} fill={darken(a1, 0.85)} />
            <circle cx={100} cy={30} r={4.5} fill={a2 ?? "#ff5a5a"} />
            <circle cx={78} cy={34} r={3} fill="#41b6ff" />
            <circle cx={122} cy={34} r={3} fill="#3df09a" />
          </g>
        );
        break;
      case "dragonhorns":
        frontAcc = (
          <g>
            <path d="M70,40 Q52,26 56,2 Q68,16 78,30 Z" fill={a1} stroke={a2} strokeWidth={2} />
            <path d="M130,40 Q148,26 144,2 Q132,16 122,30 Z" fill={a1} stroke={a2} strokeWidth={2} />
          </g>
        );
        break;
    }
  }

  // ── arma ───────────────────────────────────────────────────
  let weaponArt: React.ReactNode = null;
  if (weapon) {
    const w1 = weapon.c1 ?? "#ccc";
    const w2 = weapon.c2 ?? "#888";
    let shape: React.ReactNode = null;
    switch (weapon.variant) {
      case "stick":
        shape = <rect x={-4} y={-58} width={8} height={78} rx={4} fill={w1} stroke={w2} strokeWidth={1.5} />;
        break;
      case "sword":
        shape = (
          <g>
            <path d="M0,-70 L7,-56 L7,-6 L-7,-6 L-7,-56 Z" fill={w1} stroke={darken(w1, 0.7)} strokeWidth={1} />
            <path d="M0,-70 L2,-56 L2,-6 L0,-6 Z" fill="#fff" opacity={0.5} />
            <rect x={-15} y={-8} width={30} height={7} rx={3} fill={w2} />
            <rect x={-4} y={-1} width={8} height={20} rx={3} fill={darken(w2, 0.75)} />
          </g>
        );
        break;
      case "katana":
        shape = (
          <g transform="rotate(-6)">
            <path d="M-2,-78 Q8,-40 4,-6 L-4,-6 Q-8,-42 -2,-78 Z" fill={w1} stroke={darken(w1, 0.75)} strokeWidth={1} />
            <ellipse cx={0} cy={-4} rx={10} ry={4} fill={w2} />
            <rect x={-3.5} y={-2} width={7} height={20} rx={3} fill={darken(w2, 0.7)} />
          </g>
        );
        break;
      case "wand":
        shape = (
          <g>
            <rect x={-3} y={-46} width={6} height={62} rx={3} fill={w1} />
            <path d="M0,-66 L5,-54 L18,-52 L8,-44 L11,-31 L0,-38 L-11,-31 L-8,-44 L-18,-52 L-5,-54 Z" fill={w2} />
          </g>
        );
        break;
      case "staff":
        shape = (
          <g>
            <rect x={-4} y={-62} width={8} height={86} rx={4} fill={w1} />
            <circle cx={0} cy={-68} r={12} fill={w2} opacity={0.95} />
            <circle cx={0} cy={-68} r={6} fill="#fff" opacity={0.6} />
          </g>
        );
        break;
      case "bow":
        shape = (
          <g>
            <path d="M0,-58 Q34,-16 0,26" fill="none" stroke={w1} strokeWidth={6} strokeLinecap="round" />
            <line x1={0} y1={-58} x2={0} y2={26} stroke={w2} strokeWidth={2} />
          </g>
        );
        break;
      case "hammer":
        shape = (
          <g>
            <rect x={-4} y={-48} width={8} height={70} rx={4} fill={w2} />
            <rect x={-22} y={-64} width={44} height={22} rx={7} fill={w1} />
            <rect x={-22} y={-64} width={44} height={8} rx={4} fill={darken(w1, 0.8)} />
          </g>
        );
        break;
      case "book":
        shape = (
          <g transform="rotate(12)">
            <rect x={-20} y={-30} width={40} height={30} rx={4} fill={w1} />
            <rect x={-16} y={-26} width={32} height={22} rx={2} fill="#fff" opacity={0.9} />
            <line x1={0} y1={-26} x2={0} y2={-4} stroke={w1} strokeWidth={2} />
            <polygon points="-6,-38 0,-30 6,-38" fill={w2} />
          </g>
        );
        break;
      case "slingshot":
        shape = (
          <g>
            <rect x={-3.5} y={-16} width={7} height={36} rx={3} fill={w1} />
            <path d="M0,-14 Q-16,-30 -14,-44 M0,-14 Q16,-30 14,-44" fill="none" stroke={w1} strokeWidth={6} strokeLinecap="round" />
            <path d="M-14,-44 Q0,-34 14,-44" fill="none" stroke={w2} strokeWidth={2.5} />
          </g>
        );
        break;
      case "guitar":
        shape = (
          <g transform="rotate(18)">
            <ellipse cx={0} cy={4} rx={20} ry={16} fill={w1} />
            <circle cx={0} cy={4} r={6} fill={darken(w1, 0.6)} />
            <rect x={-3.5} y={-58} width={7} height={62} rx={3} fill={w2} />
            <rect x={-7} y={-62} width={14} height={9} rx={3} fill={darken(w2, 0.8)} />
            {[-1.6, 0, 1.6].map((dx, i) => (
              <line key={i} x1={dx} y1={-54} x2={dx} y2={16} stroke="#fff" strokeWidth={0.7} opacity={0.8} />
            ))}
          </g>
        );
        break;
      case "trident":
        shape = (
          <g>
            <rect x={-3.5} y={-52} width={7} height={78} rx={3} fill={w2} />
            <path d="M-16,-52 Q-16,-72 -12,-76 L-9,-56 L-3,-56 L-3,-80 Q0,-86 3,-80 L3,-56 L9,-56 L12,-76 Q16,-72 16,-52 L8,-48 L-8,-48 Z" fill={w1} />
          </g>
        );
        break;
    }
    weaponArt = <g transform="translate(146,176) rotate(-14)">{shape}</g>;
  }

  // ── mascota ────────────────────────────────────────────────
  const petArt = pet ? (
    <g className={idle ? "pet-bob" : undefined}>
      <ellipse cx={38} cy={238} rx={16} ry={5} fill="#000" opacity={0.18} />
      <text x={38} y={230} textAnchor="middle" fontSize={34}>
        {pet.emoji}
      </text>
    </g>
  ) : null;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width={size}
      height={(size * H) / W}
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block", overflow: "visible" }}
    >
      <defs>
        <linearGradient id={`hairG${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={hairL} />
          <stop offset="55%" stopColor={hair} />
          <stop offset="100%" stopColor={darken(hair, 0.85)} />
        </linearGradient>
        <radialGradient id={`irisG${uid}`} cx="50%" cy="35%" r="75%">
          <stop offset="0%" stopColor={lighten(eye, 0.45)} />
          <stop offset="55%" stopColor={eye} />
          <stop offset="100%" stopColor={darken(eye, 0.6)} />
        </radialGradient>
        {bg && (
          <linearGradient id={`bgGrad${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={bg.c2 ?? "#446"} />
            <stop offset="100%" stopColor={bg.c1 ?? "#223"} />
          </linearGradient>
        )}
      </defs>
      {bgArt}
      {auraArt}
      <g className={idle ? "avatar-idle" : undefined}>
        <ellipse cx={100} cy={246} rx={46} ry={9} fill="#000" opacity={0.22} />
        {backAcc}
        {hairBack}
        {legs}
        {arms}
        {torso}
        {head}
        {hairArt}
        {frontAcc}
        {weaponArt}
      </g>
      {petArt}
    </svg>
  );
}
