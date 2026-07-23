"use client";

import React, { useId } from "react";
import type { Character } from "@/lib/types";
import { getItem, HAIR_PNG } from "@/lib/items";

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

// escala horizontal del torso/brazos y de las piernas según el tipo de cuerpo
const BODY_SCALE: Record<import("@/lib/types").BodyType, { torso: number; legs: number }> = {
  slim: { torso: 0.91, legs: 0.95 },
  regular: { torso: 1, legs: 1 },
  athletic: { torso: 1.08, legs: 1.02 },
  sturdy: { torso: 1.17, legs: 1.08 },
};

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
  const isKimono = variant === "kimono";
  const isSkirt = variant === "dress" || variant === "robe" || isKimono;
  const bs = BODY_SCALE[c.bodyType ?? "regular"];

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

  // trazo de contorno del pelo: da el acabado "figura de anime"
  const hs = {
    stroke: hairD,
    strokeWidth: 1.4,
    strokeLinejoin: "round" as const,
    strokeLinecap: "round" as const,
  };

  /** Mechón afilado estilo anime: base ancha en (x0,y0), punta en (x1,y1).
   *  `curve` arquea el mechón hacia un lado (perpendicular a su dirección). */
  const lockPath = (x0: number, y0: number, x1: number, y1: number, w: number, curve = 0): string => {
    const dx = x1 - x0;
    const dy = y1 - y0;
    const len = Math.hypot(dx, dy) || 1;
    const px = -dy / len;
    const py = dx / len;
    const hw = w / 2;
    const mx = x0 + dx * 0.5;
    const my = y0 + dy * 0.5;
    const f = (n: number) => Math.round(n * 10) / 10;
    return (
      `M${f(x0 + px * hw)},${f(y0 + py * hw)} ` +
      `Q${f(mx + px * (hw * 0.9 + curve))},${f(my + py * (hw * 0.9 + curve))} ${f(x1)},${f(y1)} ` +
      `Q${f(mx + px * (curve - hw * 0.9))},${f(my + py * (curve - hw * 0.9))} ${f(x0 - px * hw)},${f(y0 - py * hw)} Z`
    );
  };
  /** [x0, y0, x1(punta), y1(punta), ancho, curva] */
  type LockSpec = [number, number, number, number, number, number?];
  const locks = (specs: LockSpec[], fill: string = hairG, outlined = true) => (
    <g fill={fill} {...(outlined ? hs : {})}>
      {specs.map((s, i) => (
        <path key={i} d={lockPath(s[0], s[1], s[2], s[3], s[4], s[5] ?? 0)} />
      ))}
    </g>
  );
  // líneas internas de flujo (detalle de dibujo a mano)
  const flow = (ds: string[], opacity = 0.45) => (
    <g stroke={hairD} strokeWidth={1.1} fill="none" strokeLinecap="round" opacity={opacity}>
      {ds.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </g>
  );

  // arte PNG importado para este peinado (si está registrado, reemplaza al SVG)
  const hairPng = HAIR_PNG[c.hairStyle];

  // ── pelo trasero (masas que van DETRÁS del cuerpo) ─────────
  let hairBack: React.ReactNode = null;
  if (hairPng?.back) {
    hairBack = <image href={hairPng.back} x={0} y={0} width={W} height={H} />;
  } else switch (c.hairStyle) {
    case "long":
      // melena suelta hasta la cintura que termina en puntas
      hairBack = (
        <g>
          <path
            d="M54,58 Q38,120 48,168 Q52,180 62,172 L60,148 Q68,166 78,158 L74,94 L126,94 L122,158 Q132,166 140,148 L138,172 Q148,180 152,168 Q162,120 146,58 Z"
            fill={hairD}
            {...hs}
          />
          {flow(["M56,92 Q50,130 56,160", "M144,92 Q150,130 144,160"], 0.6)}
        </g>
      );
      break;
    case "wavy":
      // cascada ondulada en S a ambos lados
      hairBack = (
        <g fill={hairD} {...hs}>
          <path d="M56,56 Q34,92 52,118 Q36,144 56,166 Q50,180 68,176 Q78,166 68,152 Q80,132 66,114 Q78,94 68,78 Z" />
          <path d="M144,56 Q166,92 148,118 Q164,144 144,166 Q150,180 132,176 Q122,166 132,152 Q120,132 134,114 Q122,94 132,78 Z" />
        </g>
      );
      break;
    case "hime":
      // panel largo y recto con corte horizontal
      hairBack = (
        <g>
          <path d="M56,56 Q46,130 52,178 L74,178 L76,92 L124,92 L126,178 L148,178 Q154,130 144,56 Z" fill={hairD} {...hs} />
          {flow(["M60,100 L58,168", "M140,100 L142,168"], 0.55)}
        </g>
      );
      break;
    case "twintails":
      // dos coletas enormes con curva y volumen
      hairBack = (
        <g>
          <g fill={hairD} {...hs}>
            <path d="M60,58 Q18,84 26,148 Q30,172 50,168 Q44,120 70,82 Z" />
            <path d="M140,58 Q182,84 174,148 Q170,172 150,168 Q156,120 130,82 Z" />
          </g>
          {flow(["M40,96 Q32,128 40,156", "M160,96 Q168,128 160,156"], 0.6)}
        </g>
      );
      break;
    case "ponytail":
      // cola alta que fluye hacia atrás
      hairBack = (
        <g>
          <path d="M134,42 Q176,40 176,94 Q176,142 150,162 Q162,120 150,84 Q144,58 130,52 Z" fill={hairG} {...hs} />
          <path d="M160,70 Q168,100 158,136 Q166,104 156,76 Z" fill={hairL} opacity={0.5} />
          {flow(["M148,64 Q162,96 154,140"], 0.5)}
        </g>
      );
      break;
    case "lowtail":
      // coleta baja al estilo samurái errante
      hairBack = (
        <g>
          <path d="M64,60 Q56,96 62,112 L138,112 Q144,96 136,60 Q100,82 64,60 Z" fill={hairD} />
          <path d="M116,102 Q152,128 146,168 Q142,184 128,178 Q136,142 108,118 Z" fill={hairG} {...hs} />
          <path d="M128,172 Q130,184 124,192 Q118,182 122,172 Z" fill={hairG} {...hs} />
          <rect x={110} y={108} width={14} height={8} rx={4} fill={o3} stroke={darken(o3, 0.7)} strokeWidth={1.2} />
          {flow(["M124,124 Q142,146 136,168"], 0.5)}
        </g>
      );
      break;
    case "sidetail":
      // coleta alta a un costado, con caída dinámica
      hairBack = (
        <g>
          <path d="M138,40 Q186,52 180,120 Q176,152 156,158 Q170,110 150,70 Q146,52 132,48 Z" fill={hairG} {...hs} />
          <path d="M158,148 Q162,164 152,174 Q146,160 152,148 Z" fill={hairG} {...hs} />
          <path d="M166,72 Q176,104 166,138 Q172,104 162,78 Z" fill={hairL} opacity={0.5} />
          {flow(["M150,64 Q168,100 160,144"], 0.5)}
        </g>
      );
      break;
    case "wolf":
      // corte lobo: mechones desmechados en la nuca
      hairBack = (
        <g>
          {locks(
            [
              [66, 78, 42, 122, 15, -6],
              [72, 92, 54, 136, 13, -5],
              [82, 100, 74, 142, 12, -2],
              [128, 92, 146, 136, 13, 5],
              [134, 78, 158, 122, 15, 6],
              [118, 100, 126, 142, 12, 2],
            ],
            hairD
          )}
        </g>
      );
      break;
    case "emo":
      // melenita corta que cae sobre la nuca
      hairBack = (
        <path d="M58,60 Q52,100 64,118 L136,118 Q148,100 142,60 Q100,84 58,60 Z" fill={hairD} {...hs} />
      );
      break;
  }

  // ── zapatos: silueta con cuña, suela y detalle, en vez de un óvalo plano ──
  const shoeKind: "sandal" | "boot" | "flat" | "sneaker" = isKimono
    ? "sandal"
    : variant === "armor"
      ? "boot"
      : isSkirt
        ? "flat"
        : "sneaker";
  function shoe(cx: number, mirror: boolean) {
    const s = mirror ? 1 : -1; // la puntera mira hacia afuera del cuerpo
    const base = darken(o3, 0.82);
    const baseD = darken(base, 0.6);
    if (shoeKind === "sandal") {
      // geta/zori: suela plana de madera + tira en V
      return (
        <g key={cx}>
          <ellipse cx={cx} cy={239} rx={14.5} ry={4.6} fill="#dcc088" stroke="#a8874f" strokeWidth={1.2} />
          <ellipse cx={cx} cy={237.5} rx={12.5} ry={3} fill="#eaceA0" opacity={0.6} />
          <path
            d={`M${cx},227 L${cx - 5 * s},235 M${cx},227 L${cx + 6 * s},235`}
            stroke="#3a2a1a"
            strokeWidth={1.7}
            strokeLinecap="round"
            fill="none"
          />
          <circle cx={cx} cy={227} r={1.8} fill="#3a2a1a" />
        </g>
      );
    }
    const tall = shoeKind === "boot";
    const yTop = tall ? 220 : 231;
    const yBot = yTop + 17;
    // cuerpo del zapato: talón redondeado detrás, puntera con leve voladizo adelante
    const body = `
      M${cx - 8 * s},${yTop}
      Q${cx - 15 * s},${yTop + 6} ${cx - 14 * s},${yTop + 12}
      Q${cx - 13 * s},${yBot - 2} ${cx - 8 * s},${yBot}
      L${cx + 9 * s},${yBot}
      Q${cx + 17 * s},${yBot - 1} ${cx + 16 * s},${yTop + 10}
      Q${cx + 15 * s},${yTop + 2} ${cx + 5 * s},${yTop - 2}
      L${cx - 2 * s},${yTop - 3}
      Q${cx - 6 * s},${yTop - 2} ${cx - 8 * s},${yTop} Z`;
    const sole = `
      M${cx - 13 * s},${yBot - 3}
      Q${cx - 14 * s},${yBot + 2.5} ${cx - 8 * s},${yBot + 3.5}
      L${cx + 10 * s},${yBot + 3.5}
      Q${cx + 18 * s},${yBot + 2.5} ${cx + 17 * s},${yBot - 2.5}
      L${cx - 13 * s},${yBot - 3} Z`;
    return (
      <g key={cx}>
        <path d={body} fill={tall ? "#5a5f6e" : base} stroke={tall ? darken("#5a5f6e", 0.6) : baseD} strokeWidth={1.3} />
        {tall && (
          <>
            {/* caña de la bota, sube hasta cubrir el tobillo */}
            <path
              d={`M${cx - 8 * s},${yTop} L${cx - 7 * s},${yTop - 12} L${cx + 6 * s},${yTop - 12} L${cx + 5 * s},${yTop - 2} Z`}
              fill="#6b7280"
              stroke={darken("#6b7280", 0.6)}
              strokeWidth={1.2}
            />
            <rect x={cx - 6 * s - (s < 0 ? 5 : 0)} y={yTop - 9} width={5} height={3} rx={1.3} fill={o3} />
          </>
        )}
        <path d={sole} fill="#f2f2f2" stroke="#c9c9c9" strokeWidth={0.8} />
        {shoeKind !== "flat" && (
          <path
            d={`M${cx - 4 * s},${yTop + 1} L${cx + 2 * s},${yTop + 4} M${cx - 2 * s},${yTop + 4} L${cx + 4 * s},${yTop + 7}`}
            stroke={lighten(tall ? "#5a5f6e" : base, 0.45)}
            strokeWidth={1.1}
            strokeLinecap="round"
            opacity={0.85}
          />
        )}
        {shoeKind === "flat" && <ellipse cx={cx + 1 * s} cy={yTop + 5} rx={2} ry={2} fill={o3} opacity={0.9} />}
        <ellipse cx={cx - 5 * s} cy={yTop + 3} rx={3.4} ry={2} fill="#fff" opacity={0.22} />
      </g>
    );
  }

  // ── piernas ─────────────────────────────────────────────────
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
      {shoe(88, false)}
      {shoe(112, true)}
    </g>
  );

  // ── torso / traje ──────────────────────────────────────────
  let torso: React.ReactNode;
  if (isKimono) {
    // motivo decorativo bordado en la falda del kimono
    const motifArt: React.ReactNode[] = [];
    const motif = outfit?.motif;
    if (motif === "sakura") {
      const flower = (fx: number, fy: number, fs: number) => (
        <g key={`fl${fx}-${fy}`}>
          {[0, 72, 144, 216, 288].map((a) => (
            <circle
              key={a}
              cx={fx + Math.cos((a * Math.PI) / 180) * 3.2 * fs}
              cy={fy + Math.sin((a * Math.PI) / 180) * 3.2 * fs}
              r={2.4 * fs}
              fill="#fff"
              opacity={0.9}
            />
          ))}
          <circle cx={fx} cy={fy} r={1.7 * fs} fill={o3} />
        </g>
      );
      motifArt.push(flower(82, 180, 1), flower(114, 197, 0.85), flower(99, 168, 0.65), flower(126, 178, 0.55));
    } else if (motif === "olas") {
      for (let r = 0; r < 2; r++)
        for (let i = 0; i < 5; i++)
          motifArt.push(
            <path
              key={`w${r}-${i}`}
              d={`M${60 + i * 16 + (r % 2) * 8},${200 - r * 13} a8,8 0 0 1 16,0`}
              fill="none"
              stroke={o3}
              strokeWidth={1.7}
              opacity={0.75}
            />
          );
    } else if (motif === "dragon") {
      motifArt.push(
        <g key="drg" stroke={o3} fill="none" strokeWidth={2.3} strokeLinecap="round" opacity={0.92}>
          <path d="M74,201 Q86,183 100,193 Q114,203 123,185" />
          <path d="M120,183 L127,180 M121,184 L125,190" strokeWidth={1.7} />
        </g>,
        <circle key="drge" cx={124.5} cy={184} r={1.5} fill={o3} />
      );
    } else if (motif === "luna") {
      motifArt.push(
        <path key="mn" d="M92,170 A10.5,10.5 0 1 0 92,191 A8,8 0 1 1 92,170 Z" fill={o3} opacity={0.95} />,
        <g key="st" fill={o3}>
          <path d="M116,178 l2,3.2 -2,3.2 -2,-3.2 Z" />
          <path d="M108,196 l1.6,2.6 -1.6,2.6 -1.6,-2.6 Z" opacity={0.8} />
          <path d="M122,198 l1.3,2 -1.3,2 -1.3,-2 Z" opacity={0.6} />
        </g>
      );
    }
    torso = (
      <g>
        {/* mangas anchas colgantes */}
        <path d="M50,122 L74,119 L79,172 L42,166 Z" fill={o1} stroke={darken(o1, 0.7)} strokeWidth={1.2} />
        <path d="M150,122 L126,119 L121,172 L158,166 Z" fill={o1} stroke={darken(o1, 0.7)} strokeWidth={1.2} />
        <path d="M42,166 L79,172 L78,163 L44,158 Z" fill={darken(o1, 0.8)} />
        <path d="M158,166 L121,172 L122,163 L156,158 Z" fill={darken(o1, 0.8)} />
        {/* cuerpo del kimono */}
        <path d="M74,118 L126,118 L138,212 Q100,224 62,212 Z" fill={o1} stroke={darken(o1, 0.65)} strokeWidth={1.5} />
        <path d="M74,118 L84,118 L70,205 Q65,209 62,212 Z" fill="#fff" opacity={0.08} />
        {/* cuello cruzado con juban blanco asomando */}
        <path d="M84,118 L100,143 L116,118" stroke="#fff8f0" strokeWidth={6} fill="none" />
        <path d="M79,118 L100,150 L121,118" stroke={o2} strokeWidth={7} fill="none" />
        {motifArt}
        {/* obi */}
        <rect x={69} y={150} width={62} height={16} fill={o3} />
        <rect x={69} y={155} width={62} height={2.5} fill={darken(o3, 0.7)} opacity={0.7} />
        <rect x={92} y={147} width={16} height={21} rx={3} fill={darken(o3, 0.85)} />
        <rect x={95} y={150} width={10} height={15} rx={2} fill={o3} />
      </g>
    );
  } else if (variant === "seifuku") {
    torso = (
      <g>
        {/* camisa blanca */}
        <rect x={74} y={118} width={52} height={54} rx={12} fill="#f6f8ff" stroke="#b8c2dd" strokeWidth={1.4} />
        <rect x={78} y={122} width={8} height={44} rx={4} fill="#fff" opacity={0.65} />
        {/* falda tableada */}
        <path d="M72,166 L128,166 L133,186 L67,186 Z" fill={o1} stroke={darken(o1, 0.65)} strokeWidth={1.4} />
        {[79, 89, 99, 109, 119].map((x) => (
          <line key={x} x1={x} y1={168} x2={x - 1.5} y2={185} stroke={darken(o1, 0.75)} strokeWidth={1.4} />
        ))}
        {/* cuello marinero */}
        <path d="M74,118 L100,146 L126,118 L126,133 L100,153 L74,133 Z" fill={o1} />
        <path d="M78,121 L100,143 L122,121" stroke="#fff" strokeWidth={1.6} fill="none" opacity={0.85} />
        <path d="M78,126 L100,148 L122,126" stroke="#fff" strokeWidth={1.2} fill="none" opacity={0.5} />
        {/* pañoleta anudada */}
        <path d="M94,141 L100,135 L106,141 L100,151 Z" fill={o3} />
        <path d="M100,149 L95,160 L100,156 L105,160 Z" fill={darken(o3, 0.85)} />
      </g>
    );
  } else if (variant === "shinobi") {
    torso = (
      <g>
        <rect x={74} y={118} width={52} height={66} rx={13} fill={o1} stroke={darken(o1, 0.6)} strokeWidth={1.4} />
        {/* chaleco cruzado */}
        <path d="M74,120 L100,150 L74,150 Z" fill={darken(o1, 0.8)} />
        <path d="M126,120 L100,150 L126,150 Z" fill={darken(o1, 0.7)} />
        <path d="M74,119 L100,149 M126,119 L100,149" stroke={o3} strokeWidth={2.4} opacity={0.95} />
        {/* faja */}
        <rect x={72} y={157} width={56} height={11} rx={4} fill={o3} />
        <rect x={72} y={160} width={56} height={2} fill={darken(o3, 0.65)} opacity={0.8} />
        {/* bufanda shinobi */}
        <path d="M80,113 Q100,126 120,113 L120,124 Q100,135 80,124 Z" fill={darken(o1, 0.6)} />
        <path d="M116,122 Q126,136 120,152 L112,150 Q118,136 110,126 Z" fill={darken(o1, 0.6)} opacity={0.9} />
        <rect x={78} y={124} width={7} height={46} rx={3.5} fill="#fff" opacity={0.06} />
      </g>
    );
  } else if (isSkirt) {
    torso = (
      <g>
        <path d={`M76,122 L124,122 L140,214 Q100,226 60,214 Z`} fill={o1} stroke={darken(o1, 0.65)} strokeWidth={1.5} />
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
        <rect x={72} y={118} width={56} height={66} rx={14} fill={o1} stroke={darken(o1, 0.6)} strokeWidth={1.5} />
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
        <rect x={74} y={118} width={52} height={66} rx={13} fill={o1} stroke={darken(o1, 0.65)} strokeWidth={1.5} />
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
  const sleeve = variant === "sport" ? skin : variant === "seifuku" ? "#f6f8ff" : o1;
  const arms = (
    <g>
      <rect x={56} y={122} width={16} height={52} rx={8} fill={sleeve} stroke={darken(sleeve, 0.7)} strokeWidth={1.2} />
      <rect x={128} y={122} width={16} height={52} rx={8} fill={sleeve} stroke={darken(sleeve, 0.7)} strokeWidth={1.2} />
      {variant !== "sport" && (
        <>
          <rect x={56} y={158} width={16} height={10} fill={darken(sleeve, 0.85)} />
          <rect x={128} y={158} width={16} height={10} fill={darken(sleeve, 0.85)} />
        </>
      )}
      <circle cx={64} cy={180} r={9} fill={skin} stroke={skinD} strokeWidth={1.2} />
      <circle cx={136} cy={180} r={9} fill={skin} stroke={skinD} strokeWidth={1.2} />
      <circle cx={62} cy={178} r={3.5} fill={skinL} opacity={0.7} />
      <circle cx={134} cy={178} r={3.5} fill={skinL} opacity={0.7} />
    </g>
  );

  // ── ojos: grandes, estilo manga, iris con degradado y varios brillos ──
  function drawEye(cx: number, mirror: boolean): React.ReactNode {
    const s = mirror ? -1 : 1;
    // párpado superior grueso con pestañas hacia afuera
    const topLash = (yTop: number) => (
      <g stroke={lineC} strokeLinecap="round" fill="none">
        <path d={`M${cx - 10 * s},${yTop + 4.5} Q${cx},${yTop - 2} ${cx + 10 * s},${yTop + 4.5}`} strokeWidth={3.4} />
        <path d={`M${cx + 9 * s},${yTop + 3.5} L${cx + 13.5 * s},${yTop - 0.5}`} strokeWidth={2.6} />
        <path d={`M${cx + 5.5 * s},${yTop + 1} L${cx + 8 * s},${yTop - 3}`} strokeWidth={2} />
        <path d={`M${cx - 8.5 * s},${yTop + 3.5} L${cx - 11.5 * s},${yTop + 0.5}`} strokeWidth={1.8} opacity={0.85} />
      </g>
    );
    // brillos característicos del manga: uno grande arriba, uno chico abajo
    const sparkle = (
      <g fill="#fff">
        <circle cx={cx - 3 * s} cy={77.5} r={3.1} />
        <circle cx={cx + 3.5 * s} cy={88} r={1.7} opacity={0.9} />
        <ellipse cx={cx - 4.8 * s} cy={84} rx={1} ry={2.4} opacity={0.5} />
      </g>
    );
    // ojo abierto estándar (reutilizado por "wink" en el lado que no guiña)
    const defaultEye = () => (
      <g>
        {/* globo ocular alto */}
        <path d={`M${cx - 10},71.5 Q${cx},65.5 ${cx + 10},71.5 L${cx + 10},88.5 Q${cx},96.5 ${cx - 10},88.5 Z`} fill="#fff" />
        <ellipse cx={cx} cy={82} rx={7.4} ry={10.6} fill={irisG} />
        {/* reflejo inferior claro del iris */}
        <path d={`M${cx - 4.5},89 Q${cx},92.5 ${cx + 4.5},89 Q${cx},94.5 ${cx - 4.5},89 Z`} fill={lighten(eye, 0.55)} opacity={0.8} />
        <ellipse cx={cx} cy={83.5} rx={3.4} ry={5.6} fill="#1c1626" />
        {sparkle}
        {topLash(68)}
        {/* línea inferior suave */}
        <path d={`M${cx - 8},92 Q${cx},95.5 ${cx + 8},92`} stroke={lineC} strokeWidth={1.5} strokeLinecap="round" fill="none" opacity={0.3} />
        {/* pliegue del párpado */}
        <path d={`M${cx - 7 * s},66 Q${cx},62.5 ${cx + 7 * s},66`} stroke={lineC} strokeWidth={1.2} fill="none" opacity={0.22} />
      </g>
    );
    switch (c.eyeStyle) {
      case "happy":
        return (
          <g stroke={lineC} strokeWidth={3.6} strokeLinecap="round" fill="none">
            <path d={`M${cx - 9 * s},85 Q${cx},73 ${cx + 9 * s},85`} />
            <path d={`M${cx + 8 * s},81 L${cx + 12 * s},77.5`} strokeWidth={2.4} />
            <path d={`M${cx - 7 * s},90 Q${cx},93.5 ${cx + 7 * s},90`} strokeWidth={1.5} opacity={0.3} />
          </g>
        );
      case "sleepy":
        return (
          <g>
            <path d={`M${cx - 9.5},82 Q${cx},77 ${cx + 9.5},82 L${cx + 9},90 Q${cx},96.5 ${cx - 9},90 Z`} fill="#fff" />
            <ellipse cx={cx} cy={86} rx={6.2} ry={7} fill={irisG} />
            <ellipse cx={cx} cy={87} rx={2.8} ry={3.6} fill="#1c1626" />
            <circle cx={cx - 2.2} cy={83.5} r={1.9} fill="#fff" />
            <path d={`M${cx - 10},81 Q${cx},74.5 ${cx + 10},81`} stroke={lineC} strokeWidth={3.2} strokeLinecap="round" fill="none" />
            <path d={`M${cx - 8},92.5 Q${cx},96 ${cx + 8},92.5`} stroke={lineC} strokeWidth={1.4} strokeLinecap="round" fill="none" opacity={0.3} />
          </g>
        );
      case "determined":
        return (
          <g>
            <path d={`M${cx - 10 * s},72 L${cx + 10 * s},78 L${cx + 10 * s},89 Q${cx},96 ${cx - 10 * s},89 Z`} fill="#fff" />
            <ellipse cx={cx + 1 * s} cy={84} rx={6.6} ry={8.4} fill={irisG} />
            <ellipse cx={cx + 1 * s} cy={85} rx={3} ry={4.4} fill="#1c1626" />
            <circle cx={cx - 1.5 * s} cy={80} r={2.6} fill="#fff" />
            <circle cx={cx + 3.5 * s} cy={89} r={1.3} fill="#fff" opacity={0.9} />
            <path d={`M${cx - 10 * s},72 L${cx + 11 * s},77.8`} stroke={lineC} strokeWidth={3.4} strokeLinecap="round" />
            <path d={`M${cx - 8 * s},93 Q${cx},96 ${cx + 8 * s},92`} stroke={lineC} strokeWidth={1.4} strokeLinecap="round" fill="none" opacity={0.3} />
          </g>
        );
      case "star":
        return (
          <g>
            <path d={`M${cx - 10},71.5 Q${cx},65.5 ${cx + 10},71.5 L${cx + 10},89 Q${cx},96.5 ${cx - 10},89 Z`} fill="#fff" />
            <ellipse cx={cx} cy={82.5} rx={8} ry={10.5} fill={irisG} />
            <path
              d={`M${cx},74.5 L${cx + 2.2},80 L${cx + 8},80.5 L${cx + 3.6},84.2 L${cx + 5},90 L${cx},86.4 L${cx - 5},90 L${cx - 3.6},84.2 L${cx - 8},80.5 L${cx - 2.2},80 Z`}
              fill="#fff"
              opacity={0.95}
            />
            <circle cx={cx + 4 * s} cy={76.5} r={1.6} fill="#fff" />
            {topLash(68)}
          </g>
        );
      case "wink":
        // el ojo izquierdo (mirror=false) guiña cerrado; el derecho queda abierto
        return mirror ? (
          defaultEye()
        ) : (
          <g stroke={lineC} strokeWidth={3.4} strokeLinecap="round" fill="none">
            <path d={`M${cx - 9},83.5 Q${cx},76.5 ${cx + 9},83.5`} />
            <path d={`M${cx + 7.5},80.5 L${cx + 11},77`} strokeWidth={2.3} />
            <path d={`M${cx + 3},82.5 L${cx + 5.5},78.5`} strokeWidth={1.8} />
          </g>
        );
      case "crying":
        return (
          <g>
            {defaultEye()}
            {/* cejas caídas de pena */}
            <path
              d={`M${cx - 8 * s},64 Q${cx},70 ${cx + 8 * s},68`}
              stroke={lineC}
              strokeWidth={1.3}
              fill="none"
              strokeLinecap="round"
              opacity={0.35}
            />
            {/* lágrima brillante */}
            <path
              d={`M${cx - 3},95 Q${cx - 6},101.5 ${cx - 2.5},105 Q${cx + 0.5},101.5 ${cx - 3},95 Z`}
              fill="#8fd8ff"
              stroke="#5fb8ea"
              strokeWidth={0.6}
              opacity={0.9}
            />
            <ellipse cx={cx - 3.6} cy={99} rx={0.8} ry={1.3} fill="#fff" opacity={0.7} />
          </g>
        );
      case "angry":
        return (
          <g>
            {/* párpado inclinado hacia adentro: ceño fruncido */}
            <path d={`M${cx - 10 * s},87 L${cx + 10 * s},76 L${cx + 10 * s},91.5 Q${cx},96.5 ${cx - 10 * s},91.5 Z`} fill="#fff" />
            <ellipse cx={cx + 1 * s} cy={85.5} rx={6} ry={7.2} fill={irisG} />
            <ellipse cx={cx + 1 * s} cy={86.5} rx={2.7} ry={3.6} fill="#1c1626" />
            <circle cx={cx - 1.2 * s} cy={82.5} r={1.8} fill="#fff" />
            <path d={`M${cx - 10 * s},87 L${cx + 11 * s},75.5`} stroke={lineC} strokeWidth={3.4} strokeLinecap="round" />
            <path
              d={`M${cx - 8 * s},93.5 Q${cx},96.5 ${cx + 8 * s},93`}
              stroke={lineC}
              strokeWidth={1.4}
              strokeLinecap="round"
              fill="none"
              opacity={0.3}
            />
          </g>
        );
      case "dizzy": {
        // espiral cómica calculada punto a punto: el ojo se vuelve un remolino (mareado)
        const turns = 1.6;
        const steps = 32;
        const pts = Array.from({ length: steps }, (_, i) => {
          const t = (i / (steps - 1)) * turns * 2 * Math.PI;
          const r = 0.8 + t * 0.62;
          return [cx + Math.cos(t) * r, 82 + Math.sin(t) * r] as const;
        });
        const d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)} ${pts
          .slice(1)
          .map(([x, y]) => `L${x.toFixed(1)},${y.toFixed(1)}`)
          .join(" ")}`;
        return (
          <g stroke={lineC} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d={d} />
          </g>
        );
      }
      case "heart":
        return (
          <g>
            <path d={`M${cx - 10},71.5 Q${cx},65.5 ${cx + 10},71.5 L${cx + 10},88.5 Q${cx},96.5 ${cx - 10},88.5 Z`} fill="#fff" />
            <ellipse cx={cx} cy={82} rx={7.4} ry={10.6} fill={irisG} />
            {/* pupila con forma de corazón: ojos enamorados (cabe dentro del iris) */}
            <path
              d={`M${cx},90
                  C${cx - 3},87 ${cx - 7},84 ${cx - 7},80.5
                  C${cx - 7},77.5 ${cx - 3.5},76 ${cx},79.5
                  C${cx + 3.5},76 ${cx + 7},77.5 ${cx + 7},80.5
                  C${cx + 7},84 ${cx + 3},87 ${cx},90 Z`}
              fill="#ff5f8f"
              stroke="#c93a6e"
              strokeWidth={0.5}
            />
            {topLash(68)}
          </g>
        );
      default:
        return defaultEye();
    }
  }

  // ── cejas ──────────────────────────────────────────────────
  const brows =
    c.eyeStyle === "determined" ? (
      <g stroke={hairD} strokeWidth={3} fill="none" strokeLinecap="round">
        <path d="M72,58 L93,64" />
        <path d="M128,58 L107,64" />
      </g>
    ) : c.eyeStyle === "angry" ? (
      <g stroke={hairD} strokeWidth={3} fill="none" strokeLinecap="round">
        <path d="M74,61 L93,55" />
        <path d="M126,61 L107,55" />
      </g>
    ) : c.eyeStyle === "crying" ? (
      <g stroke={hairD} strokeWidth={2.4} fill="none" strokeLinecap="round" opacity={0.85}>
        <path d="M74,58 Q83,62 92,60" />
        <path d="M108,60 Q117,62 126,58" />
      </g>
    ) : (
      <g stroke={hairD} strokeWidth={2.6} fill="none" strokeLinecap="round">
        <path d="M74,61 Q83,56.5 92,60" />
        <path d="M108,60 Q117,56.5 126,61" />
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
    case "laugh":
      // carcajada: boca bien abierta con dientes superiores
      mouthArt = (
        <g>
          <path d="M87,98 Q100,117 113,98 Z" fill="#7a3141" stroke={mC} strokeWidth={1.6} strokeLinejoin="round" />
          <path d="M89.5,98.5 Q100,103 110.5,98.5 L109,101.5 Q100,105.5 91,101.5 Z" fill="#fff" />
        </g>
      );
      break;
    case "surprised":
      // sorpresa: boca pequeña y redonda en "o"
      mouthArt = <ellipse cx={100} cy={103} rx={4.4} ry={6} fill="#7a3141" stroke={mC} strokeWidth={1.3} />;
      break;
    case "smug":
      // orgulloso: sonrisa asimétrica de satisfacción
      mouthArt = (
        <path d="M91,100.5 Q100,104.5 103,99 Q106.5,102.5 111,98.5" stroke={mC} strokeWidth={2.4} fill="none" strokeLinecap="round" />
      );
      break;
    case "tongue":
      // traviesa: sonrisa con la lengua afuera
      mouthArt = (
        <g>
          <path d="M89,99 Q100,109 111,99 Z" fill="#8a3b4a" stroke={mC} strokeWidth={1.5} strokeLinejoin="round" />
          <path d="M95,102 Q100,111 105,102 Q100,106.5 95,102 Z" fill="#ff7d9c" stroke="#c93a5c" strokeWidth={0.7} />
        </g>
      );
      break;
    case "pout":
      // puchero: labios pequeños y fruncidos
      mouthArt = <ellipse cx={100} cy={101.5} rx={3.4} ry={2.6} fill={mC} opacity={0.75} />;
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
      {/* cara: cráneo redondo con mejillas y mentón afilado estilo anime */}
      <path
        d="M55,64 Q55,26 100,26 Q145,26 145,64 Q145,91 127,106 Q113,117 100,118 Q87,117 73,106 Q55,91 55,64 Z"
        fill={skin}
      />
      <path
        d="M55,64 Q55,26 100,26 Q145,26 145,64 Q145,91 127,106 Q113,117 100,118 Q87,117 73,106 Q55,91 55,64 Z"
        fill="none"
        stroke={lineC}
        strokeWidth={1.6}
        opacity={0.25}
      />
      <path d="M64,88 Q100,120 136,88 Q132,107 100,115 Q68,107 64,88 Z" fill={skinD} opacity={0.15} />
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
  // base oscura que asoma ENTRE los mechones del flequillo (profundidad)
  const capShadow = (
    <path d="M55,72 Q49,22 100,17 Q151,22 145,72 Q120,52 100,54 Q80,52 55,72 Z" fill={hairD} />
  );
  // domo de volumen sobre el cráneo (el pelo anime nunca va pegado)
  const crown = <path d="M57,56 Q52,14 100,10 Q148,14 143,56 Q100,34 57,56 Z" fill={hairG} {...hs} />;
  // flequillo completo: abanico de mechones curvos que caen sobre los ojos
  const bangsFan = locks([
    [80, 34, 61, 70, 17, -3],
    [92, 30, 79, 74, 16, -2],
    [103, 29, 99, 76, 16, 1],
    [114, 31, 119, 73, 16, 3],
    [124, 35, 137, 68, 16, 4],
    [86, 32, 71, 56, 9, -2],
    [108, 30, 110, 58, 9, 1],
    [120, 34, 129, 56, 9, 3],
  ]);
  // flequillo barrido hacia un lado
  const bangsSide = locks([
    [92, 30, 60, 66, 18, -8],
    [100, 29, 78, 74, 16, -6],
    [108, 29, 98, 78, 15, -3],
    [116, 30, 118, 72, 15, 2],
    [124, 33, 136, 64, 15, 6],
    [128, 36, 143, 56, 10, 5],
  ]);
  // flequillo cortina con raya al medio
  const bangsCurtain = locks([
    [93, 30, 65, 72, 19, -7],
    [97, 31, 80, 64, 12, -4],
    [107, 30, 135, 72, 19, 7],
    [103, 31, 120, 64, 12, 4],
  ]);
  // antenita rebelde (ahoge)
  const ahoge = <path d="M95,19 Q86,8 96,-6 Q93,8 101,14 Z" fill={hairG} {...hs} />;

  if (hairPng) {
    hairArt = <image href={hairPng.front} x={0} y={0} width={W} height={H} />;
  } else switch (c.hairStyle) {
    case "spiky":
      // saiyan: dos capas de picos curvos que irradian + flequillo en abanico
      hairArt = (
        <g>
          {capShadow}
          {locks(
            [
              [80, 40, 42, 8, 20, -7],
              [120, 40, 158, 8, 20, 7],
              [92, 36, 70, -8, 20, -5],
              [108, 36, 130, -8, 20, 5],
              [100, 34, 100, -16, 18, 0],
            ],
            hairD,
            false
          )}
          {locks([
            [78, 46, 38, 24, 22, -8],
            [122, 46, 162, 24, 22, 8],
            [86, 40, 58, -2, 22, -7],
            [114, 40, 142, -2, 22, 7],
            [98, 36, 90, -14, 20, -3],
            [104, 36, 114, -10, 17, 4],
          ])}
          {bangsFan}
          {shine("M76,34 Q92,20 106,20 Q88,28 82,44 Z")}
        </g>
      );
      break;
    case "hero":
      // protagonista shonen: mechones barridos hacia arriba y atrás
      hairArt = (
        <g>
          {crown}
          {locks(
            [
              [70, 44, 44, 14, 18, 9],
              [84, 36, 66, -6, 20, 8],
              [102, 32, 98, -16, 20, 2],
              [118, 36, 132, -8, 18, -6],
              [132, 44, 156, 12, 16, -8],
            ],
            hairD,
            false
          )}
          {locks([
            [74, 46, 52, 20, 18, 8],
            [88, 38, 74, -8, 20, 7],
            [104, 34, 106, -14, 20, -2],
            [120, 40, 140, -2, 18, -7],
            [134, 48, 158, 22, 15, -8],
          ])}
          {locks([
            [78, 42, 62, 64, 12, -5],
            [90, 38, 82, 60, 11, -3],
            [102, 36, 104, 58, 11, 1],
            [114, 38, 122, 60, 11, 3],
            [124, 42, 138, 64, 12, 5],
          ])}
          {shine("M88,26 Q100,16 112,22 Q100,26 94,36 Z")}
        </g>
      );
      break;
    case "messy":
      // despeinado: mechones medianos hacia todos lados + ahoge
      hairArt = (
        <g>
          {capShadow}
          {locks([
            [70, 48, 40, 40, 16, -6],
            [130, 48, 160, 40, 16, 6],
            [80, 36, 58, 10, 17, -6],
            [120, 36, 142, 10, 17, 6],
            [96, 32, 88, 2, 16, -3],
            [106, 32, 118, 4, 14, 4],
          ])}
          {bangsFan}
          {ahoge}
          {shine("M74,34 Q92,22 110,24 Q90,30 80,44 Z")}
        </g>
      );
      break;
    case "emo":
      // gran mechón lateral que tapa un ojo
      hairArt = (
        <g>
          {crown}
          {capShadow}
          {locks([
            [104, 28, 56, 86, 26, -12],
            [112, 28, 78, 94, 18, -8],
            [118, 30, 102, 72, 14, -4],
            [124, 32, 128, 66, 13, 3],
            [130, 36, 142, 58, 11, 5],
          ])}
          {flow(["M96,36 Q76,58 66,80"], 0.5)}
          {shine("M90,26 Q106,20 118,24 Q104,28 96,34 Z")}
        </g>
      );
      break;
    case "wolf":
      // corte lobo: capas desmechadas arriba y a los costados
      hairArt = (
        <g>
          {capShadow}
          {locks([
            [62, 58, 44, 92, 14, -6],
            [66, 70, 52, 108, 12, -5],
            [138, 58, 156, 92, 14, 6],
            [134, 70, 148, 108, 12, 5],
          ])}
          {bangsFan}
          {ahoge}
          {shine("M74,32 Q92,20 112,22 Q90,28 80,42 Z")}
        </g>
      );
      break;
    case "bob":
      // bob con cortinas que enmarcan la cara + flequillo en abanico
      hairArt = (
        <g>
          <path
            d="M52,86 Q44,26 100,20 L100,32 Q66,36 64,70 Q62,96 76,110 Q63,112 57,102 Q50,96 52,86 Z"
            fill={hairG}
            {...hs}
          />
          <path
            d="M148,86 Q156,26 100,20 L100,32 Q134,36 136,70 Q138,96 124,110 Q137,112 143,102 Q150,96 148,86 Z"
            fill={hairG}
            {...hs}
          />
          {capShadow}
          {bangsFan}
          {flow(["M66,60 Q64,88 72,104", "M134,60 Q136,88 128,104"])}
          {shine("M66,42 Q88,26 112,28 Q88,34 74,50 Z")}
        </g>
      );
      break;
    case "long":
      // melena larga: mechones laterales con punta + flequillo en abanico
      hairArt = (
        <g>
          {locks([
            [60, 62, 50, 150, 17, -5],
            [66, 74, 64, 156, 12, -3],
            [140, 62, 150, 150, 17, 5],
            [134, 74, 136, 156, 12, 3],
          ])}
          {capShadow}
          {bangsFan}
          {ahoge}
          {shine("M66,40 Q88,24 112,26 Q88,32 74,48 Z")}
        </g>
      );
      break;
    case "wavy":
      // ondulado: cortinas en S + flequillo cortina
      hairArt = (
        <g>
          <path d="M54,60 Q42,88 54,106 Q44,126 58,142 Q66,134 60,118 Q70,102 58,84 Z" fill={hairG} {...hs} />
          <path d="M146,60 Q158,88 146,106 Q156,126 142,142 Q134,134 140,118 Q130,102 142,84 Z" fill={hairG} {...hs} />
          {capShadow}
          {bangsCurtain}
          {shine("M64,42 Q90,26 118,30 Q90,36 72,52 Z")}
        </g>
      );
      break;
    case "hime":
      // corte hime: flequillo recto, mechones a la mejilla, líneas internas
      hairArt = (
        <g>
          <path d="M48,54 L68,56 Q70,96 66,122 L58,134 L50,122 Q44,96 48,54 Z" fill={hairG} {...hs} />
          <path d="M152,54 L132,56 Q130,96 134,122 L142,134 L150,122 Q156,96 152,54 Z" fill={hairG} {...hs} />
          {crown}
          <path
            d="M56,70 Q52,24 100,20 Q148,24 144,70 L136,62 L128,67 L120,62 L112,67 L104,62 L96,67 L88,62 L80,67 L72,62 L64,67 Z"
            fill={hairG}
            {...hs}
          />
          {flow(["M80,34 L80,60", "M100,30 L100,62", "M120,34 L120,60"], 0.35)}
          {shine("M66,40 Q94,30 124,34 Q96,36 74,46 Z")}
        </g>
      );
      break;
    case "ponytail":
      // coleta alta: flequillo barrido + coletero
      hairArt = (
        <g>
          {crown}
          {capShadow}
          {bangsSide}
          <circle cx={138} cy={44} r={7} fill={o3} stroke={darken(o3, 0.7)} strokeWidth={1.5} />
          {shine("M80,26 Q98,18 116,22 Q96,26 86,34 Z")}
        </g>
      );
      break;
    case "lowtail":
      // coleta baja: cortina al medio + mechones sueltos a los lados
      hairArt = (
        <g>
          {crown}
          {capShadow}
          {bangsCurtain}
          {locks([
            [62, 56, 54, 96, 12, -4],
            [138, 56, 146, 96, 12, 4],
          ])}
          {shine("M74,30 Q94,20 116,24 Q94,28 82,38 Z")}
        </g>
      );
      break;
    case "sidetail":
      // coleta lateral alta con mechón suelto
      hairArt = (
        <g>
          {crown}
          {capShadow}
          {bangsSide}
          {locks([[58, 58, 50, 92, 11, -4]])}
          <circle cx={142} cy={42} r={7.5} fill={o3} stroke={darken(o3, 0.7)} strokeWidth={1.5} />
          {shine("M78,26 Q96,18 114,22 Q94,26 84,34 Z")}
        </g>
      );
      break;
    case "twintails":
      // dos coletas: flequillo en abanico + mechones al frente + coleteros
      hairArt = (
        <g>
          {capShadow}
          {bangsFan}
          {locks([
            [58, 64, 50, 112, 13, -5],
            [142, 64, 150, 112, 13, 5],
          ])}
          <circle cx={58} cy={58} r={6.5} fill={o3} stroke={darken(o3, 0.7)} strokeWidth={1.4} />
          <circle cx={142} cy={58} r={6.5} fill={o3} stroke={darken(o3, 0.7)} strokeWidth={1.4} />
          {shine("M70,32 Q92,22 116,26 Q92,30 78,40 Z")}
        </g>
      );
      break;
    case "drills":
      // bucles taladro de señorita elegante
      hairArt = (
        <g>
          {crown}
          {capShadow}
          {bangsCurtain}
          <g fill={hairG} {...hs}>
            <path d="M40,58 Q34,72 46,76 Q58,80 62,70 L60,56 Z" />
            <path d="M42,76 Q38,88 48,92 Q60,94 62,84 L60,74 Z" />
            <path d="M44,92 Q42,102 50,106 Q60,108 60,98 L58,90 Z" />
            <path d="M48,106 Q48,118 54,122 L58,104 Z" />
            <path d="M160,58 Q166,72 154,76 Q142,80 138,70 L140,56 Z" />
            <path d="M158,76 Q162,88 152,92 Q140,94 138,84 L140,74 Z" />
            <path d="M156,92 Q158,102 150,106 Q140,108 140,98 L142,90 Z" />
            <path d="M152,106 Q152,118 146,122 L142,104 Z" />
          </g>
          {flow(["M44,70 Q52,74 60,68", "M46,86 Q54,90 60,84", "M156,70 Q148,74 140,68", "M154,86 Q146,90 140,84"], 0.5)}
          {shine("M76,30 Q96,20 118,24 Q94,28 84,38 Z")}
        </g>
      );
      break;
    case "braid":
      // trenza lateral sobre el hombro, eslabones decrecientes
      hairArt = (
        <g>
          {capShadow}
          {bangsCurtain}
          <g fill={hairG} {...hs}>
            <ellipse cx={139} cy={68} rx={9} ry={7} transform="rotate(28 139 68)" />
            <ellipse cx={146} cy={82} rx={8.5} ry={6.5} transform="rotate(12 146 82)" />
            <ellipse cx={149} cy={96} rx={8} ry={6} transform="rotate(-4 149 96)" />
            <ellipse cx={148} cy={110} rx={7.5} ry={5.5} transform="rotate(-14 148 110)" />
            <ellipse cx={144} cy={123} rx={7} ry={5} transform="rotate(-24 144 123)" />
          </g>
          <g fill={hairD} opacity={0.5}>
            <ellipse cx={143} cy={75} rx={4} ry={3} />
            <ellipse cx={148} cy={89} rx={4} ry={3} />
            <ellipse cx={148.5} cy={103} rx={3.8} ry={2.8} />
            <ellipse cx={146} cy={117} rx={3.5} ry={2.6} />
          </g>
          <rect x={137} y={126} width={10} height={5.5} rx={2.7} fill={o3} transform="rotate(-24 142 129)" />
          <path d="M137,131 Q134,146 141,153 Q146,144 145,133 Z" fill={hairD} {...hs} />
          {shine("M70,30 Q92,20 116,24 Q92,28 78,38 Z")}
        </g>
      );
      break;
    case "buns":
      // rodetes espaciales con espiral + flequillo en abanico
      hairArt = (
        <g>
          <circle cx={60} cy={30} r={15} fill={hairG} {...hs} />
          <circle cx={140} cy={30} r={15} fill={hairG} {...hs} />
          <path d="M52,30 Q58,20 68,24 M54,36 Q62,40 68,34" stroke={hairD} strokeWidth={1.6} fill="none" strokeLinecap="round" />
          <path d="M148,30 Q142,20 132,24 M146,36 Q138,40 132,34" stroke={hairD} strokeWidth={1.6} fill="none" strokeLinecap="round" />
          {capShadow}
          {bangsFan}
          {shine("M70,32 Q92,22 116,26 Q92,30 78,40 Z")}
        </g>
      );
      break;
    case "topknot":
      // samurái: frente despejada, pico de viuda, patillas afiladas y moño
      hairArt = (
        <g>
          <ellipse cx={100} cy={12} rx={12} ry={10} fill={hairG} {...hs} />
          <rect x={92} y={20} width={16} height={7} rx={3} fill={o3} stroke={darken(o3, 0.7)} strokeWidth={1.2} />
          <path d="M55,70 Q50,24 100,20 Q150,24 145,70 Q142,44 104,42 L100,52 L96,42 Q58,44 55,70 Z" fill={hairG} {...hs} />
          <path d="M56,62 Q58,84 64,94 L68,64 Z" fill={hairG} {...hs} />
          <path d="M144,62 Q142,84 136,94 L132,64 Z" fill={hairG} {...hs} />
          {flow(["M70,32 Q86,26 100,26", "M130,32 Q114,26 100,26"], 0.4)}
          {shine("M66,40 Q90,26 118,30 Q92,34 74,46 Z")}
        </g>
      );
      break;
    case "curly":
      // nube de rulos con bucles marcados y mechones que escapan
      hairArt = (
        <g>
          <g fill={hairG} {...hs}>
            <circle cx={64} cy={54} r={15} />
            <circle cx={78} cy={38} r={16} />
            <circle cx={100} cy={30} r={18} />
            <circle cx={122} cy={38} r={16} />
            <circle cx={136} cy={54} r={15} />
            <circle cx={56} cy={72} r={12} />
            <circle cx={144} cy={72} r={12} />
          </g>
          {locks([
            [62, 64, 46, 76, 9, -4],
            [138, 64, 154, 76, 9, 4],
            [72, 28, 60, 14, 9, -4],
            [128, 28, 140, 14, 9, 4],
          ])}
          <g fill={hairG} {...hs}>
            <circle cx={74} cy={58} r={10} />
            <circle cx={92} cy={52} r={11} />
            <circle cx={110} cy={52} r={11} />
            <circle cx={127} cy={58} r={10} />
          </g>
          <g stroke={hairD} strokeWidth={1.5} fill="none" strokeLinecap="round">
            <path d="M70,36 Q76,30 82,34" />
            <path d="M96,26 Q102,20 108,26" />
            <path d="M124,36 Q130,32 134,38" />
          </g>
          <circle cx={84} cy={32} r={4.5} fill={hairL} opacity={0.6} />
          <circle cx={112} cy={28} r={4} fill={hairL} opacity={0.6} />
        </g>
      );
      break;
    case "afro":
      // afro grande y redondo con brillos
      hairArt = (
        <g>
          <g fill={hairG} {...hs}>
            <circle cx={100} cy={28} r={27} />
            <circle cx={68} cy={38} r={21} />
            <circle cx={132} cy={38} r={21} />
            <circle cx={52} cy={62} r={16} />
            <circle cx={148} cy={62} r={16} />
            <circle cx={58} cy={84} r={12} />
            <circle cx={142} cy={84} r={12} />
          </g>
          <path d="M55,80 Q52,36 100,34 Q148,36 145,80 Q140,56 100,50 Q60,56 55,80 Z" fill={hairG} />
          <circle cx={76} cy={26} r={5} fill={hairL} opacity={0.55} />
          <circle cx={118} cy={22} r={4.5} fill={hairL} opacity={0.55} />
          <circle cx={56} cy={54} r={4} fill={hairL} opacity={0.45} />
        </g>
      );
      break;
    case "mohawk":
      // cresta de llamas con laterales rapados
      hairArt = (
        <g>
          <path d="M58,66 Q56,40 80,32 L82,52 Q66,54 60,68 Z" fill={hairD} opacity={0.5} />
          <path d="M142,66 Q144,40 120,32 L118,52 Q134,54 140,68 Z" fill={hairD} opacity={0.5} />
          <path
            d="M86,52 Q80,30 90,10 Q92,-2 100,-14 Q100,0 106,4 Q112,-6 116,6 Q122,0 120,20 Q128,28 116,48 Q108,58 100,56 Q92,58 86,52 Z"
            fill={hairG}
            {...hs}
          />
          <path d="M94,46 Q90,26 98,8 Q98,24 104,28 Q108,20 108,34 Q112,40 104,48 Z" fill={hairD} opacity={0.7} />
          {shine("M97,0 Q100,10 104,12 Q101,4 102,-6 Z")}
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
      case "kitsune":
        // máscara de zorro ladeada sobre un costado de la cabeza
        frontAcc = (
          <g transform="translate(138,34) rotate(20)">
            <polygon points="-14,-15 -9,-28 -3,-17" fill={a1} stroke={a2} strokeWidth={1.3} />
            <polygon points="14,-15 9,-28 3,-17" fill={a1} stroke={a2} strokeWidth={1.3} />
            <path d="M-15,-16 Q0,-24 15,-16 Q17,2 0,13 Q-17,2 -15,-16 Z" fill={a1} stroke={a2} strokeWidth={1.6} />
            <path d="M-9,-8 L-3,-5 M9,-8 L3,-5" stroke={a2} strokeWidth={2.4} strokeLinecap="round" />
            <path d="M0,2 L-2.4,6.5 L2.4,6.5 Z" fill={a2} />
            <path d="M-13,-1 Q-7,2 -3,1 M13,-1 Q7,2 3,1" stroke={a2} strokeWidth={1} opacity={0.7} fill="none" />
          </g>
        );
        break;
      case "kanzashi":
        // horquilla floral con pétalos colgantes
        frontAcc = (
          <g transform="translate(64,42)">
            {[0, 72, 144, 216, 288].map((deg) => (
              <circle
                key={deg}
                cx={Math.cos((deg * Math.PI) / 180) * 4.6}
                cy={Math.sin((deg * Math.PI) / 180) * 4.6}
                r={3.4}
                fill={a1}
              />
            ))}
            <circle cx={0} cy={0} r={2.6} fill={a2} />
            <path d="M2,6 Q4.5,15 2.5,24" stroke={a2} strokeWidth={1.4} fill="none" />
            {[11, 18, 25].map((y, i) => (
              <ellipse key={y} cx={3.4 - i * 0.5} cy={y} rx={2.3} ry={1.6} fill={lighten(a1 ?? "#ff8fc4", 0.35)} />
            ))}
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
            {/* hoja curvada */}
            <path d="M-2,-84 Q10,-46 5,-9 L-4,-9 Q-9,-46 -2,-84 Z" fill={w1} stroke={darken(w1, 0.72)} strokeWidth={1.2} />
            {/* hamon: línea del temple */}
            <path d="M-1.5,-78 Q7,-45 3,-12" stroke="#fff" strokeWidth={1.3} fill="none" opacity={0.85} />
            {/* brillo de la punta */}
            <path d="M-2,-84 L1.5,-72 L-3.5,-70 Z" fill="#fff" opacity={0.55} />
            {/* habaki dorado */}
            <rect x={-5} y={-12} width={10} height={5} rx={1} fill="#d8b84a" />
            {/* tsuba */}
            <ellipse cx={0} cy={-5} rx={11} ry={4.2} fill={w2} stroke={darken(w2, 0.7)} strokeWidth={1} />
            {/* tsuka con trenzado de rombos */}
            <rect x={-4.2} y={-2} width={8.4} height={26} rx={3.6} fill={darken(w2, 0.78)} />
            <path d="M-4,2 L4,7.5 M4,2 L-4,7.5 M-4,10 L4,15.5 M4,10 L-4,15.5 M-4,18 L4,23" stroke={w1} strokeWidth={1.3} opacity={0.9} />
            <rect x={-4.6} y={21.5} width={9.2} height={4.5} rx={2} fill={w2} />
            {weapon.motif === "petalos" && (
              <g fill="#ff9ec4" opacity={0.95}>
                <ellipse cx={10} cy={-64} rx={3} ry={2} transform="rotate(-30 10 -64)" />
                <ellipse cx={-9} cy={-46} rx={2.6} ry={1.7} transform="rotate(24 -9 -46)" />
                <ellipse cx={12} cy={-30} rx={2.4} ry={1.6} transform="rotate(-18 12 -30)" />
                <ellipse cx={-7} cy={-68} rx={2.2} ry={1.5} transform="rotate(40 -7 -68)" />
              </g>
            )}
            {weapon.motif === "llama" && (
              <path
                d="M4,-72 Q10,-63 5,-55 Q12,-48 6,-38 Q11,-31 5,-23"
                stroke="#ff7a3c"
                strokeWidth={2.2}
                fill="none"
                strokeLinecap="round"
                opacity={0.85}
              />
            )}
            {weapon.motif === "luna" && (
              <path d="M10,-74 A6,6 0 1 0 10,-62 A4.6,4.6 0 1 1 10,-74 Z" fill="#fff6c9" opacity={0.95} />
            )}
            {weapon.motif === "sombra" && (
              <g stroke="#8b5cff" strokeWidth={2} fill="none" strokeLinecap="round" opacity={0.8}>
                <path d="M-8,-66 Q-13,-58 -8,-50" />
                <path d="M9,-52 Q14,-44 9,-36" />
                <path d="M-7,-34 Q-11,-28 -7,-22" opacity={0.6} />
              </g>
            )}
          </g>
        );
        break;
      case "kunai":
        shape = (
          <g>
            <path d="M0,-52 L9,-28 L3.5,-12 L-3.5,-12 L-9,-28 Z" fill={w1} stroke={darken(w1, 0.7)} strokeWidth={1.2} />
            <line x1={0} y1={-49} x2={0} y2={-14} stroke="#fff" strokeWidth={1.2} opacity={0.6} />
            <rect x={-3.2} y={-12} width={6.4} height={18} rx={3} fill={w2} />
            <path d="M-3,-8 L3,-4 M3,-8 L-3,-4 M-3,-1 L3,3" stroke={w1} strokeWidth={1.1} opacity={0.8} />
            <circle cx={0} cy={11} r={4.5} fill="none" stroke={w2} strokeWidth={2.4} />
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
    // el arma va EN la mano derecha, con la mano empuñándola encima
    weaponArt = (
      <g transform="translate(136,180) rotate(8)" style={{ filter: "drop-shadow(0 3px 3px rgba(0,0,0,0.35))" }}>
        {shape}
        <circle cx={0} cy={5} r={8.5} fill={skin} stroke={skinD} strokeWidth={1.2} />
        <path d="M-6,1.5 L6,1.5 M-6.5,5 L6.5,5 M-6,8.5 L6,8.5" stroke={skinD} strokeWidth={1} opacity={0.5} fill="none" />
      </g>
    );
  }

  // ── mascota ────────────────────────────────────────────────
  const petArt = pet ? (
    <g className={idle ? "pet-bob" : undefined} style={{ filter: "drop-shadow(0 3px 4px rgba(0,0,0,0.4))" }}>
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
        <ellipse cx={100} cy={246} rx={46 * bs.legs} ry={9} fill="#000" opacity={0.22} />
        {backAcc}
        {hairBack}
        {/* el tipo de cuerpo ensancha/afina piernas y torso+brazos por separado */}
        <g transform={`translate(100,205) scale(${bs.legs},1) translate(-100,-205)`}>{legs}</g>
        <g transform={`translate(100,152) scale(${bs.torso},1) translate(-100,-152)`}>
          {arms}
          {torso}
        </g>
        {head}
        {hairArt}
        {/* "angel ring": banda de brillo anime sobre el pelo */}
        {hairArt && !["afro", "curly", "mohawk", "topknot"].includes(c.hairStyle) && (
          <path d="M70,47 Q100,33 130,47" stroke="#fff" strokeWidth={5} fill="none" opacity={0.22} strokeLinecap="round" />
        )}
        {frontAcc && (
          <g style={{ filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.35))" }}>{frontAcc}</g>
        )}
        {/* misma transformación que torso/brazos para que el arma siga a la mano */}
        <g transform={`translate(100,152) scale(${bs.torso},1) translate(-100,-152)`}>{weaponArt}</g>
      </g>
      {petArt}
    </svg>
  );
}
