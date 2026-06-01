import React from "react";
import type { CardDef } from "@/lib/data";

interface Props {
  card: CardDef;
  size?: number;
  glow?: boolean;
}

export default function CharacterArt({ card, size = 120, glow = false }: Props) {
  const s = size;
  const cx = s * 0.5;
  const fw = s * 0.5;
  const fh = s * 0.54;
  const fy = s * 0.52;
  const eyeLX = cx - fw * 0.27;
  const eyeRX = cx + fw * 0.27;
  const eyeY = fy - fh * 0.08;
  const erx = s * 0.07;
  const ery = s * 0.092;

  // hair shapes per style
  let hair: React.ReactNode = null;
  const H = card.hair;
  const H2 = card.hair2;

  if (card.hairStyle === "spiky") {
    hair = (
      <>
        <ellipse cx={cx} cy={s * 0.3} rx={s * 0.36} ry={s * 0.18} fill={H} />
        <polygon points={`${cx - s * 0.3},${s * 0.3} ${cx - s * 0.2},${s * 0.04} ${cx - s * 0.08},${s * 0.25}`} fill={H} />
        <polygon points={`${cx - s * 0.1},${s * 0.24} ${cx},${s * 0.02} ${cx + s * 0.1},${s * 0.24}`} fill={H} />
        <polygon points={`${cx + s * 0.08},${s * 0.25} ${cx + s * 0.2},${s * 0.04} ${cx + s * 0.3},${s * 0.3}`} fill={H} />
        <polygon points={`${cx - s * 0.05},${s * 0.2} ${cx + s * 0.02},${s * 0.06} ${cx + s * 0.08},${s * 0.2}`} fill={H2} />
      </>
    );
  } else if (card.hairStyle === "long") {
    hair = (
      <>
        <ellipse cx={cx - s * 0.28} cy={s * 0.56} rx={s * 0.12} ry={s * 0.28} fill={H} />
        <ellipse cx={cx + s * 0.28} cy={s * 0.56} rx={s * 0.12} ry={s * 0.28} fill={H} />
        <ellipse cx={cx} cy={s * 0.3} rx={s * 0.35} ry={s * 0.21} fill={H} />
        <ellipse cx={cx} cy={s * 0.23} rx={s * 0.27} ry={s * 0.1} fill={H2} />
      </>
    );
  } else if (card.hairStyle === "ponytail") {
    hair = (
      <>
        <ellipse cx={cx + s * 0.3} cy={s * 0.46} rx={s * 0.1} ry={s * 0.24} fill={H} transform={`rotate(20 ${cx + s * 0.3} ${s * 0.46})`} />
        <ellipse cx={cx} cy={s * 0.3} rx={s * 0.34} ry={s * 0.19} fill={H} />
        <ellipse cx={cx} cy={s * 0.23} rx={s * 0.26} ry={s * 0.1} fill={H2} />
      </>
    );
  } else if (card.hairStyle === "bun") {
    hair = (
      <>
        <circle cx={cx - s * 0.26} cy={s * 0.24} r={s * 0.1} fill={H} />
        <circle cx={cx + s * 0.26} cy={s * 0.24} r={s * 0.1} fill={H} />
        <ellipse cx={cx} cy={s * 0.31} rx={s * 0.33} ry={s * 0.18} fill={H} />
        <ellipse cx={cx} cy={s * 0.24} rx={s * 0.25} ry={s * 0.1} fill={H2} />
      </>
    );
  } else {
    hair = (
      <>
        <ellipse cx={cx} cy={s * 0.3} rx={s * 0.34} ry={s * 0.18} fill={H} />
        <ellipse cx={cx} cy={s * 0.24} rx={s * 0.26} ry={s * 0.1} fill={H2} />
      </>
    );
  }

  return (
    <svg
      viewBox={`0 0 ${s} ${s * 1.12}`}
      width={s}
      height={s * 1.12}
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: "visible", display: "block" }}
    >
      {glow && (
        <ellipse cx={cx} cy={fy} rx={s * 0.52} ry={s * 0.56} fill={card.aura} opacity={0.18} />
      )}
      {hair}
      {/* face */}
      <ellipse cx={cx} cy={fy} rx={fw * 0.5} ry={fh * 0.5} fill={card.skin} />
      {/* fringe */}
      <path
        d={`M${cx - fw * 0.4},${fy - fh * 0.28} Q${cx},${fy - fh * 0.12} ${cx + fw * 0.4},${fy - fh * 0.28} L${cx + fw * 0.4},${fy - fh * 0.5} L${cx - fw * 0.4},${fy - fh * 0.5} Z`}
        fill={H}
      />
      {/* eyes */}
      <ellipse cx={eyeLX} cy={eyeY} rx={erx} ry={ery} fill="#fff" />
      <ellipse cx={eyeRX} cy={eyeY} rx={erx} ry={ery} fill="#fff" />
      <ellipse cx={eyeLX} cy={eyeY + s * 0.008} rx={s * 0.05} ry={s * 0.062} fill={card.eye} />
      <ellipse cx={eyeRX} cy={eyeY + s * 0.008} rx={s * 0.05} ry={s * 0.062} fill={card.eye} />
      <circle cx={eyeLX} cy={eyeY} r={s * 0.024} fill="#1a1a1a" />
      <circle cx={eyeRX} cy={eyeY} r={s * 0.024} fill="#1a1a1a" />
      <circle cx={eyeLX - s * 0.016} cy={eyeY - s * 0.028} r={s * 0.014} fill="#fff" />
      <circle cx={eyeRX - s * 0.016} cy={eyeY - s * 0.028} r={s * 0.014} fill="#fff" />
      {/* blush */}
      <ellipse cx={cx - fw * 0.32} cy={fy + fh * 0.14} rx={s * 0.04} ry={s * 0.022} fill="rgba(255,130,130,0.35)" />
      <ellipse cx={cx + fw * 0.32} cy={fy + fh * 0.14} rx={s * 0.04} ry={s * 0.022} fill="rgba(255,130,130,0.35)" />
      {/* nose + mouth */}
      <circle cx={cx} cy={fy + fh * 0.1} r={s * 0.012} fill="rgba(170,110,80,0.4)" />
      <path
        d={`M${cx - fw * 0.16},${fy + fh * 0.26} Q${cx},${fy + fh * 0.34} ${cx + fw * 0.16},${fy + fh * 0.26}`}
        stroke="#c08866"
        strokeWidth={s * 0.022}
        fill="none"
        strokeLinecap="round"
      />
      {/* neck + body */}
      <rect x={cx - s * 0.1} y={fy + fh * 0.46} width={s * 0.2} height={s * 0.1} fill={card.skin} />
      <path
        d={`M${cx - s * 0.32},${s * 1.12} L${cx - s * 0.26},${fy + fh * 0.5} Q${cx},${fy + fh * 0.42} ${cx + s * 0.26},${fy + fh * 0.5} L${cx + s * 0.32},${s * 1.12} Z`}
        fill={card.aura}
        opacity={0.85}
      />
      <path
        d={`M${cx - s * 0.12},${fy + fh * 0.5} L${cx},${s * 0.92} L${cx + s * 0.12},${fy + fh * 0.5} Z`}
        fill={card.skin}
        opacity={0.9}
      />
    </svg>
  );
}
