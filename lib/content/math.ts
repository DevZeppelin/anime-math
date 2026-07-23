import type { Difficulty, LevelDef, Question } from "../types";
import { ri, pick, numMC, typed, tf, session } from "./utils";

// ─────────────────────────────────────────────────────────────
// MATEMÁTICAS — 12 niveles, todo generado proceduralmente y
// adaptado a la dificultad elegida (edad del jugador):
//   facil   → números chicos + palitos para contar + más opción múltiple
//   normal  → el clásico
//   dificil → números más grandes + más respuesta escrita
// ─────────────────────────────────────────────────────────────

type D = Difficulty;

/** Elige un valor según la dificultad. */
function byD<T>(d: D, facil: T, normal: T, dificil: T): T {
  return d === "facil" ? facil : d === "dificil" ? dificil : normal;
}

/** Probabilidad de pregunta escrita (vs opción múltiple). */
function typedChance(d: D): number {
  return byD(d, 0.25, 0.5, 0.65);
}

/** Palitos para contar (solo modo fácil, números chicos). */
function sticks(a: number, b: number, op: "+" | "−"): string | undefined {
  if (a + b > 12) return undefined;
  return `${"🪵".repeat(a)} ${op === "+" ? "➕" : "➖"} ${"🪵".repeat(b)}`;
}

function qSumSmall(d: D): Question {
  const a = ri(1, byD(d, 5, 9, 9));
  const b = ri(1, Math.max(1, byD(d, 5, 10, 10) - a));
  const visual = d === "facil" ? sticks(a, b, "+") : undefined;
  return Math.random() < typedChance(d)
    ? typed(`${a} + ${b} = ?`, a + b, { visual })
    : numMC(`${a} + ${b} = ?`, a + b, { spread: 3, visual });
}

function qSubSmall(d: D): Question {
  const a = ri(2, byD(d, 6, 10, 10));
  const b = ri(1, a - 1);
  const visual = d === "facil" ? sticks(a, b, "−") : undefined;
  return Math.random() < typedChance(d)
    ? typed(`${a} − ${b} = ?`, a - b, { visual })
    : numMC(`${a} − ${b} = ?`, a - b, { spread: 3, visual });
}

function qSum20(d: D): Question {
  const max = byD(d, 14, 20, 20);
  const a = ri(5, max - 4);
  const b = ri(3, Math.max(4, max - a));
  const sub = Math.random() < 0.5;
  if (sub) {
    const t = a + b;
    return Math.random() < typedChance(d)
      ? typed(`${t} − ${a} = ?`, b)
      : numMC(`${t} − ${a} = ?`, b, { spread: 4 });
  }
  return Math.random() < typedChance(d)
    ? typed(`${a} + ${b} = ?`, a + b)
    : numMC(`${a} + ${b} = ?`, a + b, { spread: 4 });
}

function qSum2d(d: D): Question {
  const a = ri(byD(d, 11, 15, 25), byD(d, 40, 78, 88));
  const b = ri(byD(d, 11, 13, 25), Math.max(14, byD(d, 89, 99, 199) - a));
  return Math.random() < typedChance(d)
    ? typed(`${a} + ${b} = ?`, a + b)
    : numMC(`${a} + ${b} = ?`, a + b, { spread: 8 });
}

function qSub2d(d: D): Question {
  const a = ri(byD(d, 20, 30, 50), byD(d, 60, 99, 199));
  const b = ri(11, a - 10);
  return Math.random() < typedChance(d)
    ? typed(`${a} − ${b} = ?`, a - b)
    : numMC(`${a} − ${b} = ?`, a - b, { spread: 8 });
}

function qMulEasy(d: D): Question {
  const a = pick([2, 3, 4, 5, 10]);
  const b = ri(1, byD(d, 5, 10, 12));
  const visual = d === "facil" && a * b <= 12 && a <= 4 ? `${("🪵".repeat(b) + "  ").repeat(a)}` : undefined;
  return Math.random() < typedChance(d)
    ? typed(`${a} × ${b} = ?`, a * b, { visual, explain: `Son ${a} grupos de ${b}.` })
    : numMC(`${a} × ${b} = ?`, a * b, { spread: Math.max(3, a), visual, explain: `Son ${a} grupos de ${b}.` });
}

function qMulHard(d: D): Question {
  const a = pick([6, 7, 8, 9]);
  const b = ri(2, byD(d, 5, 10, 12));
  return Math.random() < typedChance(d)
    ? typed(`${a} × ${b} = ?`, a * b)
    : numMC(`${a} × ${b} = ?`, a * b, { spread: a });
}

function qDiv(d: D): Question {
  const b = ri(2, byD(d, 5, 9, 9));
  const q = ri(2, byD(d, 5, 10, 12));
  const a = b * q;
  return Math.random() < typedChance(d)
    ? typed(`${a} ÷ ${b} = ?`, q, { explain: `Porque ${b} × ${q} = ${a}.` })
    : numMC(`${a} ÷ ${b} = ?`, q, { spread: 3, explain: `Porque ${b} × ${q} = ${a}.` });
}

function qCompare(d: D): Question {
  const lo = byD(d, 10, 100, 1000);
  const hi = byD(d, 99, 9999, 99999);
  const a = ri(lo, hi);
  let b = ri(lo, hi);
  if (b === a) b += 7;
  const mayor = Math.max(a, b);
  return {
    kind: "mc",
    prompt: `¿Cuál número es MAYOR?`,
    options: [String(a), String(b)].sort(() => Math.random() - 0.5),
    answer: String(mayor),
    explain: "Compara primero cuántas cifras tiene cada número.",
  } as Question;
}

function qRound(d: D): Question {
  if (d === "dificil" && Math.random() < 0.5) {
    const a = ri(1010, 9899);
    const near = Math.round(a / 100) * 100;
    return numMC(`Redondea ${a} a la centena más cercana`, near, {
      spread: 100,
      explain: `Mira las decenas: ${a} está más cerca de ${near}.`,
    });
  }
  const a = ri(byD(d, 11, 101, 101), byD(d, 98, 989, 989));
  const near = Math.round(a / 10) * 10;
  return numMC(`Redondea ${a} a la decena más cercana`, near, {
    spread: 10,
    explain: `Mira las unidades: ${a} está más cerca de ${near}.`,
  });
}

function qFraction(d: D): Question {
  const kind = d === "facil" ? pick([1, 2]) : ri(1, 3);
  if (kind === 1) {
    const den = pick(byD(d, [2, 4], [2, 3, 4, 5, 10], [2, 3, 4, 5, 8, 10]));
    const total = den * ri(2, byD(d, 4, 8, 12));
    return numMC(`¿Cuánto es 1/${den} de ${total}?`, total / den, {
      explain: `Divide ${total} entre ${den}.`,
    });
  }
  if (kind === 2) {
    const den = pick([4, 6, 8]);
    const num = ri(1, den - 1);
    return tf(`La fracción ${num}/${den} es más de la mitad`, num / den > 0.5, {
      explain: `La mitad de ${den} es ${den / 2}, y tienes ${num} partes.`,
    });
  }
  const den = pick([3, 4, 5]);
  const num = ri(1, den - 1);
  const total = den * ri(2, 5);
  return numMC(`¿Cuánto es ${num}/${den} de ${total}?`, (total / den) * num, {
    explain: `${total} ÷ ${den} = ${total / den}, luego × ${num}.`,
  });
}

function qPercent(d: D): Question {
  const kind = d === "facil" ? pick([1, 3]) : ri(1, byD(d, 3, 3, 4));
  if (kind === 1) {
    const base = pick([10, 20, 40, 50, 60, 80, 100, 200]);
    return numMC(`¿Cuánto es el 50% de ${base}?`, base / 2, { explain: "El 50% es la mitad." });
  }
  if (kind === 2) {
    const base = pick([10, 20, 30, 50, 100, 150, 200]);
    return numMC(`¿Cuánto es el 10% de ${base}?`, base / 10, { explain: "El 10% es dividir entre 10." });
  }
  if (kind === 4) {
    const base = pick([20, 40, 60, 80, 200]);
    return numMC(`¿Cuánto es el 25% de ${base}?`, base / 4, { explain: "El 25% es la cuarta parte: divide entre 4." });
  }
  const n = ri(6, byD(d, 20, 60, 90));
  return Math.random() < 0.5
    ? numMC(`¿Cuál es el DOBLE de ${n}?`, n * 2)
    : numMC(`¿Cuál es la MITAD de ${n * 2}?`, n);
}

const NAMES = ["Luna", "Mateo", "Sofía", "Leo", "Emma", "Nico", "Valentina", "Hugo"];
const THINGS = ["manzanas 🍎", "caramelos 🍬", "figuritas ✨", "canicas 🔵", "galletas 🍪", "libros 📚"];

function qWordProblem(d: D): Question {
  const name = pick(NAMES);
  const thing = pick(THINGS);
  const kind = ri(1, 4);
  if (kind === 1) {
    const a = ri(byD(d, 5, 12, 25), byD(d, 15, 40, 90));
    const b = ri(byD(d, 2, 5, 15), byD(d, 9, 25, 60));
    return typed(`${name} tiene ${a} ${thing} y consigue ${b} más. ¿Cuántas tiene ahora?`, a + b, {
      explain: `"Consigue más" significa SUMAR: ${a} + ${b} = ${a + b}.`,
    });
  }
  if (kind === 2) {
    const a = ri(byD(d, 8, 20, 40), byD(d, 20, 60, 120));
    const b = ri(4, Math.min(a - 1, byD(d, 7, 18, 60)));
    return typed(`${name} tiene ${a} ${thing} y regala ${b}. ¿Cuántas le quedan?`, a - b, {
      explain: `"Regalar" significa RESTAR: ${a} − ${b} = ${a - b}.`,
    });
  }
  if (kind === 3) {
    const per = ri(2, byD(d, 5, 9, 12));
    const groups = ri(2, byD(d, 5, 7, 9));
    return typed(
      `${name} arma ${groups} bolsas con ${per} ${thing} cada una. ¿Cuántas hay en total?`,
      per * groups,
      { explain: `Grupos iguales = MULTIPLICAR: ${groups} × ${per} = ${groups * per}.` }
    );
  }
  const per = ri(2, byD(d, 4, 6, 9));
  const total = per * ri(2, byD(d, 5, 8, 12));
  return typed(
    `${name} reparte ${total} ${thing} entre ${per} amigos en partes iguales. ¿Cuántas recibe cada uno?`,
    total / per,
    { explain: `Repartir en partes iguales = DIVIDIR: ${total} ÷ ${per} = ${total / per}.` }
  );
}

function gen(f: (d: D) => Question): (d: D) => Question[] {
  return (d) => session(Array.from({ length: 12 }, () => f(d)));
}

function genMix(fs: ((d: D) => Question)[]): (d: D) => Question[] {
  return (d) => session(Array.from({ length: 12 }, () => pick(fs)(d)));
}

export const MATH_LEVELS: LevelDef[] = [
  { name: "Sumas Pequeñas", emoji: "🐣", desc: "Sumas hasta 10", tier: 1, gen: gen(qSumSmall) },
  { name: "Restas Pequeñas", emoji: "🐥", desc: "Restas hasta 10", tier: 1, gen: gen(qSubSmall) },
  { name: "Hasta Veinte", emoji: "🔢", desc: "Sumas y restas hasta 20", tier: 1, gen: gen(qSum20) },
  { name: "Grandes Sumas", emoji: "➕", desc: "Sumas de dos cifras", tier: 1, gen: gen(qSum2d) },
  { name: "Grandes Restas", emoji: "➖", desc: "Restas de dos cifras", tier: 2, gen: gen(qSub2d) },
  { name: "Tablas Amigas", emoji: "✖️", desc: "Tablas del 2, 3, 4, 5 y 10", tier: 2, gen: gen(qMulEasy) },
  { name: "Tablas Valientes", emoji: "🔥", desc: "Tablas del 6, 7, 8 y 9", tier: 2, gen: gen(qMulHard) },
  { name: "División Exacta", emoji: "➗", desc: "Repartir en partes iguales", tier: 2, gen: gen(qDiv) },
  { name: "Números Gigantes", emoji: "🐘", desc: "Comparar y redondear", tier: 2, gen: genMix([qCompare, qRound]) },
  { name: "Fracciones", emoji: "🍕", desc: "Mitades, tercios y cuartos", tier: 3, gen: gen(qFraction) },
  { name: "Porcentajes", emoji: "💹", desc: "50%, 10%, 25%, dobles y mitades", tier: 3, gen: gen(qPercent) },
  { name: "Misiones Mentales", emoji: "🧩", desc: "Problemas de la vida real", tier: 3, gen: genMix([qWordProblem, qWordProblem, qFraction, qPercent]) },
];
