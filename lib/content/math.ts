import type { LevelDef, Question } from "../types";
import { ri, pick, numMC, typed, tf, session } from "./utils";

// ─────────────────────────────────────────────────────────────
// MATEMÁTICAS — 12 niveles, todo generado proceduralmente
// (inspirado en la progresión de Singapur: números → operaciones
//  → fracciones → porcentajes → resolución de problemas)
// ─────────────────────────────────────────────────────────────

function qSumSmall(): Question {
  const a = ri(1, 9);
  const b = ri(1, 10 - a);
  return Math.random() < 0.5
    ? numMC(`${a} + ${b} = ?`, a + b, { spread: 3 })
    : typed(`${a} + ${b} = ?`, a + b);
}

function qSubSmall(): Question {
  const a = ri(2, 10);
  const b = ri(1, a - 1);
  return Math.random() < 0.5
    ? numMC(`${a} − ${b} = ?`, a - b, { spread: 3 })
    : typed(`${a} − ${b} = ?`, a - b);
}

function qSum20(): Question {
  const a = ri(5, 15);
  const b = ri(3, 20 - a > 3 ? 20 - a : 4);
  const sub = Math.random() < 0.5;
  if (sub) {
    const t = a + b;
    return typed(`${t} − ${a} = ?`, b);
  }
  return numMC(`${a} + ${b} = ?`, a + b, { spread: 4 });
}

function qSum2d(): Question {
  const a = ri(15, 78);
  const b = ri(13, 99 - a > 13 ? 99 - a : 14);
  return Math.random() < 0.5
    ? numMC(`${a} + ${b} = ?`, a + b, { spread: 8 })
    : typed(`${a} + ${b} = ?`, a + b);
}

function qSub2d(): Question {
  const a = ri(30, 99);
  const b = ri(11, a - 10);
  return Math.random() < 0.5
    ? numMC(`${a} − ${b} = ?`, a - b, { spread: 8 })
    : typed(`${a} − ${b} = ?`, a - b);
}

function qMulEasy(): Question {
  const a = pick([2, 3, 4, 5, 10]);
  const b = ri(1, 10);
  return Math.random() < 0.5
    ? numMC(`${a} × ${b} = ?`, a * b, { spread: Math.max(3, a) })
    : typed(`${a} × ${b} = ?`, a * b);
}

function qMulHard(): Question {
  const a = pick([6, 7, 8, 9]);
  const b = ri(2, 10);
  return Math.random() < 0.5
    ? numMC(`${a} × ${b} = ?`, a * b, { spread: a })
    : typed(`${a} × ${b} = ?`, a * b);
}

function qDiv(): Question {
  const b = ri(2, 9);
  const q = ri(2, 10);
  const a = b * q;
  return Math.random() < 0.5
    ? numMC(`${a} ÷ ${b} = ?`, q, { spread: 3, explain: `Porque ${b} × ${q} = ${a}.` })
    : typed(`${a} ÷ ${b} = ?`, q, { explain: `Porque ${b} × ${q} = ${a}.` });
}

function qCompare(): Question {
  const a = ri(100, 9999);
  let b = ri(100, 9999);
  if (b === a) b += 7;
  const mayor = Math.max(a, b);
  return {
    kind: "mc",
    prompt: `¿Cuál número es MAYOR?`,
    options: [String(a), String(b)].sort(() => Math.random() - 0.5),
    answer: String(mayor),
  } as Question;
}

function qRound(): Question {
  const a = ri(101, 989);
  const near = Math.round(a / 10) * 10;
  return numMC(`Redondea ${a} a la decena más cercana`, near, {
    spread: 10,
    explain: `${a} está más cerca de ${near}.`,
  });
}

function qFraction(): Question {
  const kind = ri(1, 3);
  if (kind === 1) {
    const den = pick([2, 3, 4, 5, 10]);
    const total = den * ri(2, 8);
    return numMC(`¿Cuánto es 1/${den} de ${total}?`, total / den, {
      explain: `Divide ${total} entre ${den}.`,
    });
  }
  if (kind === 2) {
    const den = pick([4, 6, 8]);
    const num = ri(1, den - 1);
    return tf(`La fracción ${num}/${den} es más de la mitad`, num / den > 0.5, {
      explain: `La mitad de ${den} es ${den / 2}.`,
    });
  }
  const den = pick([3, 4, 5]);
  const num = ri(1, den - 1);
  const total = den * ri(2, 5);
  return numMC(`¿Cuánto es ${num}/${den} de ${total}?`, (total / den) * num, {
    explain: `${total} ÷ ${den} = ${total / den}, luego × ${num}.`,
  });
}

function qPercent(): Question {
  const kind = ri(1, 3);
  if (kind === 1) {
    const base = pick([10, 20, 40, 50, 60, 80, 100, 200]);
    return numMC(`¿Cuánto es el 50% de ${base}?`, base / 2, { explain: "El 50% es la mitad." });
  }
  if (kind === 2) {
    const base = pick([10, 20, 30, 50, 100, 150, 200]);
    return numMC(`¿Cuánto es el 10% de ${base}?`, base / 10, { explain: "El 10% es dividir entre 10." });
  }
  const n = ri(6, 60);
  return Math.random() < 0.5
    ? numMC(`¿Cuál es el DOBLE de ${n}?`, n * 2)
    : numMC(`¿Cuál es la MITAD de ${n * 2}?`, n);
}

const NAMES = ["Luna", "Mateo", "Sofía", "Leo", "Emma", "Nico", "Valentina", "Hugo"];
const THINGS = ["manzanas 🍎", "caramelos 🍬", "figuritas ✨", "canicas 🔵", "galletas 🍪", "libros 📚"];

function qWordProblem(): Question {
  const name = pick(NAMES);
  const thing = pick(THINGS);
  const kind = ri(1, 4);
  if (kind === 1) {
    const a = ri(12, 40);
    const b = ri(5, 25);
    return typed(`${name} tiene ${a} ${thing} y consigue ${b} más. ¿Cuántas tiene ahora?`, a + b);
  }
  if (kind === 2) {
    const a = ri(20, 60);
    const b = ri(4, 18);
    return typed(`${name} tiene ${a} ${thing} y regala ${b}. ¿Cuántas le quedan?`, a - b);
  }
  if (kind === 3) {
    const per = ri(3, 9);
    const groups = ri(3, 7);
    return typed(
      `${name} arma ${groups} bolsas con ${per} ${thing} cada una. ¿Cuántas hay en total?`,
      per * groups,
      { explain: `${groups} × ${per} = ${groups * per}.` }
    );
  }
  const per = ri(2, 6);
  const total = per * ri(3, 8);
  return typed(
    `${name} reparte ${total} ${thing} entre ${per} amigos en partes iguales. ¿Cuántas recibe cada uno?`,
    total / per,
    { explain: `${total} ÷ ${per} = ${total / per}.` }
  );
}

function gen(f: () => Question): () => Question[] {
  return () => session(Array.from({ length: 12 }, f));
}

function genMix(fs: (() => Question)[]): () => Question[] {
  return () => session(Array.from({ length: 12 }, () => pick(fs)()));
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
  { name: "Porcentajes", emoji: "💹", desc: "50%, 10%, dobles y mitades", tier: 3, gen: gen(qPercent) },
  { name: "Misiones Mentales", emoji: "🧩", desc: "Problemas de la vida real", tier: 3, gen: genMix([qWordProblem, qWordProblem, qFraction, qPercent]) },
];
