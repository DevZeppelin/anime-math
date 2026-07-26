import type { Difficulty, LevelDef, Question } from "../types";
import { ri, pick, sample, numMC, typed, tf, session, repeatEmoji, SHAPES } from "./utils";

// ─────────────────────────────────────────────────────────────
// MATEMÁTICAS — 16 niveles, adaptados de verdad a 3 edades:
//   facil (Menores de 5)  → SOLO imágenes/emoji + números chicos.
//                           Sin frases largas: el texto que hay
//                           se lee en voz alta (ver LessonPlayer).
//   normal (Menores de 10) → el clásico de la academia.
//   dificil (Menores de 15) → números grandes, más escritura,
//                           y conceptos de secundaria temprana.
// ─────────────────────────────────────────────────────────────

type D = Difficulty;

/** Elige un valor según la dificultad. "experto" (Maestros, sin
 *  límite de edad) usa `experto` si se da, si no cae en `dificil`. */
function byD<T>(d: D, facil: T, normal: T, dificil: T, experto?: T): T {
  if (d === "facil") return facil;
  if (d === "dificil") return dificil;
  if (d === "experto") return experto ?? dificil;
  return normal;
}

/** Probabilidad de pregunta escrita (vs opción múltiple). */
function typedChance(d: D): number {
  return byD(d, 0, 0.5, 0.65, 0.75);
}

const OBJS = ["🍎", "🍌", "🐟", "🐝", "🚗", "⭐", "🎈", "🍪", "🧸", "🐬"];

// ── generadores 100% visuales para "Pequeños" (menores de 5) ──

/** Cuenta cuántos objetos hay: pregunta corta (se lee en voz alta) + imagen grande. */
function qCountVisual(): Question {
  const emoji = pick(OBJS);
  const n = ri(1, 5);
  return numMC(`¿Cuántos ${emoji} hay?`, n, { visual: repeatEmoji(emoji, n), spread: 2 });
}

/** Suma visual: dos grupitos del mismo objeto que se juntan. */
function qSumVisual(): Question {
  const emoji = pick(OBJS);
  const a = ri(1, 4);
  const b = ri(1, 4);
  return numMC(`Cuenta todos los ${emoji}`, a + b, {
    visual: `${repeatEmoji(emoji, a)}   ➕   ${repeatEmoji(emoji, b)}`,
    spread: 2,
  });
}

/** Resta visual: un grupo donde algunos ya no están (tachados con ❌). */
function qSubVisual(): Question {
  const emoji = pick(OBJS);
  const a = ri(2, 6);
  const b = ri(1, a - 1);
  const visual = `${repeatEmoji(emoji, a - b)}   ${repeatEmoji("❌" + emoji, 0)}${repeatEmoji(emoji + "❌", b)}`;
  return numMC(`¿Cuántos ${emoji} quedan?`, a - b, { visual, spread: 2 });
}

/** Compara dos grupos de objetos: ¿cuál tiene más? (responde con el número). */
function qCompareVisual(): Question {
  const emoji = pick(OBJS);
  let a = ri(1, 6);
  let b = ri(1, 6);
  if (a === b) b = a === 6 ? a - 2 : a + 2;
  const mayor = Math.max(a, b);
  return {
    kind: "mc",
    prompt: "¿Cuál grupo tiene MÁS?",
    visual: `${repeatEmoji(emoji, a)}\n${repeatEmoji(emoji, b)}`,
    options: [String(a), String(b)].sort(() => Math.random() - 0.5),
    answer: String(mayor),
    explain: "El grupo con más dibujitos es el que tiene el número más grande.",
  };
}

/** Grupos iguales (pre-multiplicación): "2 grupos de 3" mostrados como imágenes. */
function qGroupsVisual(): Question {
  const emoji = pick(OBJS);
  const groups = ri(2, 3);
  const per = ri(2, 3);
  const visual = Array.from({ length: groups }, () => repeatEmoji(emoji, per)).join("   |   ");
  return numMC(`Cuenta todos los ${emoji}`, groups * per, { visual, spread: 2, explain: `${groups} grupos de ${per}.` });
}

/** Repartir en partes iguales (pre-división): reparte objetos entre "amigos" (🧑). */
function qShareVisual(): Question {
  const emoji = pick(OBJS);
  const friends = ri(2, 3);
  const each = ri(1, 3);
  const total = friends * each;
  return numMC(`Reparte los ${emoji} en partes iguales.\n¿Cuántos le tocan a cada ${"🧑"}?`, each, {
    visual: `${repeatEmoji(emoji, total)}\n${repeatEmoji("🧑", friends)}`,
    spread: 2,
  });
}

/** El doble de una cantidad chiquita, mostrado con dibujitos. */
function qDoubleVisual(): Question {
  const emoji = pick(OBJS);
  const n = ri(1, 4);
  return numMC(`¿Cuál es el DOBLE de ${n}?`, n * 2, {
    visual: repeatEmoji(emoji, n),
    spread: 2,
    explain: "El doble es la misma cantidad, dos veces.",
  });
}

/** Reconoce formas básicas. */
function qShapeVisual(): Question {
  const s = pick(SHAPES);
  const wrong = sample(
    SHAPES.filter((x) => x.name !== s.name),
    2
  );
  return {
    kind: "mc",
    prompt: `¿Cuál es el ${s.name}?`,
    options: [s.emoji, ...wrong.map((w) => w.emoji)].sort(() => Math.random() - 0.5),
    answer: s.emoji,
  };
}

/** Grande / pequeño con el mismo emoji en dos tamaños de fuente (vía spans no es posible en texto plano,
 *  así que usamos animales de tamaño naturalmente distinto). */
const BIG_SMALL: [big: string, small: string][] = [
  ["🐘", "🐜"], ["🐋", "🐟"], ["🦒", "🐹"], ["🚂", "🚲"], ["🏰", "🏠"],
];
function qSizeVisual(): Question {
  const [big, small] = pick(BIG_SMALL);
  const askBig = Math.random() < 0.5;
  return {
    kind: "mc",
    prompt: askBig ? "¿Cuál es más GRANDE?" : "¿Cuál es más PEQUEÑO?",
    options: shuffle2(big, small),
    answer: askBig ? big : small,
  };
}
function shuffle2(a: string, b: string): string[] {
  return Math.random() < 0.5 ? [a, b] : [b, a];
}

// ── generadores para "Aventureros" (menores de 10) y "Genios" (menores de 15) ──

/** Palitos para contar (apoyo visual también en modo normal/difícil si el número es chico). */
function sticks(a: number, b: number, op: "+" | "−"): string | undefined {
  if (a + b > 12) return undefined;
  return `${"🪵".repeat(a)} ${op === "+" ? "➕" : "➖"} ${"🪵".repeat(b)}`;
}

function qSumSmall(d: D): Question {
  const a = ri(1, byD(d, 5, 9, 9));
  const b = ri(1, Math.max(1, byD(d, 5, 10, 10) - a));
  const visual = d === "facil" ? undefined : sticks(a, b, "+");
  return Math.random() < typedChance(d)
    ? typed(`${a} + ${b} = ?`, a + b, { visual })
    : numMC(`${a} + ${b} = ?`, a + b, { spread: 3, visual });
}

function qSubSmall(d: D): Question {
  const a = ri(2, byD(d, 6, 10, 10));
  const b = ri(1, a - 1);
  const visual = d === "facil" ? undefined : sticks(a, b, "−");
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
  const a = ri(byD(d, 11, 15, 25, 100), byD(d, 40, 78, 88, 500));
  const b = ri(byD(d, 11, 13, 25, 100), Math.max(14, byD(d, 89, 99, 199, 999) - a));
  return Math.random() < typedChance(d)
    ? typed(`${a} + ${b} = ?`, a + b)
    : numMC(`${a} + ${b} = ?`, a + b, { spread: 8 });
}

function qSub2d(d: D): Question {
  const a = ri(byD(d, 20, 30, 50, 200), byD(d, 60, 99, 199, 999));
  const b = ri(11, a - 10);
  return Math.random() < typedChance(d)
    ? typed(`${a} − ${b} = ?`, a - b)
    : numMC(`${a} − ${b} = ?`, a - b, { spread: 8 });
}

function qMulEasy(d: D): Question {
  const a = pick([2, 3, 4, 5, 10]);
  const b = ri(1, byD(d, 5, 10, 12, 20));
  return Math.random() < typedChance(d)
    ? typed(`${a} × ${b} = ?`, a * b, { explain: `Son ${a} grupos de ${b}.` })
    : numMC(`${a} × ${b} = ?`, a * b, { spread: Math.max(3, a), explain: `Son ${a} grupos de ${b}.` });
}

function qMulHard(d: D): Question {
  const a = pick([6, 7, 8, 9]);
  const b = ri(2, byD(d, 5, 10, 12, 20));
  return Math.random() < typedChance(d)
    ? typed(`${a} × ${b} = ?`, a * b)
    : numMC(`${a} × ${b} = ?`, a * b, { spread: a });
}

function qDiv(d: D): Question {
  const b = ri(2, byD(d, 5, 9, 9, 15));
  const q = ri(2, byD(d, 5, 10, 12, 20));
  const a = b * q;
  return Math.random() < typedChance(d)
    ? typed(`${a} ÷ ${b} = ?`, q, { explain: `Porque ${b} × ${q} = ${a}.` })
    : numMC(`${a} ÷ ${b} = ?`, q, { spread: 3, explain: `Porque ${b} × ${q} = ${a}.` });
}

/** Formatea con separador de miles (12345 → "12.345") para que los
 *  números grandes de Genios/Maestros se puedan leer de un vistazo. */
function groupThousands(n: number): string {
  return n.toLocaleString("es-AR");
}

function qCompare(d: D): Question {
  const lo = byD(d, 10, 100, 1000, 10000);
  const hi = byD(d, 99, 9999, 99999, 9999999);
  const a = ri(lo, hi);
  let b = ri(lo, hi);
  if (b === a) b += 7;
  const mayor = Math.max(a, b);
  return {
    kind: "mc",
    prompt: `¿Cuál número es MAYOR?`,
    // notDecimal: true es clave — sin esto, adaptQuestion() "completa" las
    // opciones numéricas hasta 6/8 en Genios/Maestros con valores generados
    // alrededor de `answer`, y esos valores pueden terminar siendo MÁS
    // grandes que el propio "mayor", dejando marcada como correcta una
    // opción que ya no es la más grande de la lista mostrada.
    notDecimal: true,
    options: [a, b].map(groupThousands).sort(() => Math.random() - 0.5),
    answer: groupThousands(mayor),
    explain: "Compara primero cuántas cifras tiene cada número.",
  };
}

function qRound(d: D): Question {
  if ((d === "dificil" || d === "experto") && Math.random() < 0.5) {
    if (d === "experto" && Math.random() < 0.5) {
      const a = ri(10100, 98999);
      const near = Math.round(a / 1000) * 1000;
      return numMC(`Redondea ${a} al millar más cercano`, near, {
        spread: 1000,
        explain: `Mira las centenas: ${a} está más cerca de ${near}.`,
      });
    }
    const a = ri(1010, 9899);
    const near = Math.round(a / 100) * 100;
    return numMC(`Redondea ${a} a la centena más cercana`, near, {
      spread: 100,
      explain: `Mira las decenas: ${a} está más cerca de ${near}.`,
    });
  }
  const a = ri(byD(d, 11, 101, 101, 101), byD(d, 98, 989, 989, 989));
  const near = Math.round(a / 10) * 10;
  return numMC(`Redondea ${a} a la decena más cercana`, near, {
    spread: 10,
    explain: `Mira las unidades: ${a} está más cerca de ${near}.`,
  });
}

function qFraction(d: D): Question {
  const kind = ri(1, 3);
  if (kind === 1) {
    const den = pick(byD(d, [2, 4], [2, 3, 4, 5, 10], [2, 3, 4, 5, 8, 10], [2, 3, 4, 5, 6, 8, 9, 10, 12]));
    const total = den * ri(2, byD(d, 4, 8, 12, 20));
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
  const den = pick(byD(d, [3, 4, 5], [3, 4, 5], [3, 4, 5], [3, 4, 5, 6, 7, 8, 9]));
  const num = ri(1, den - 1);
  const total = den * ri(2, byD(d, 5, 5, 5, 9));
  return numMC(`¿Cuánto es ${num}/${den} de ${total}?`, (total / den) * num, {
    explain: `${total} ÷ ${den} = ${total / den}, luego × ${num}.`,
  });
}

function qPercent(d: D): Question {
  const kind = ri(1, byD(d, 3, 3, 4, 5));
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
  if (kind === 5) {
    // real: descuentos y recargos con porcentajes exactos
    const pct = pick([5, 10, 20, 25, 50]);
    const base = pick([20, 40, 60, 80, 100, 120, 140, 160, 180, 200]);
    const isDiscount = Math.random() < 0.6;
    const change = (base * pct) / 100;
    const result = isDiscount ? base - change : base + change;
    return numMC(
      `Un producto cuesta $${base} y tiene un ${isDiscount ? "descuento" : "recargo"} del ${pct}%.\n¿Cuánto cuesta ahora?`,
      result,
      { spread: Math.max(6, Math.round(result * 0.15)), explain: `${pct}% de ${base} es ${change}. ${base} ${isDiscount ? "−" : "+"} ${change} = ${result}.` }
    );
  }
  const n = ri(6, byD(d, 20, 60, 90, 150));
  return Math.random() < 0.5
    ? numMC(`¿Cuál es el DOBLE de ${n}?`, n * 2)
    : numMC(`¿Cuál es la MITAD de ${n * 2}?`, n);
}

const NAMES = ["Luna", "Mateo", "Sofía", "Leo", "Emma", "Nico", "Valentina", "Hugo"];
const THINGS = ["manzanas 🍎", "caramelos 🍬", "figuritas ✨", "canicas 🔵", "galletas 🍪", "libros 📚"];

function qWordProblem(d: D): Question {
  const name = pick(NAMES);
  const thing = pick(THINGS);
  const kind = ri(1, d === "experto" ? 5 : 4);
  if (kind === 1) {
    const a = ri(byD(d, 5, 12, 25, 80), byD(d, 15, 40, 90, 400));
    const b = ri(byD(d, 2, 5, 15, 50), byD(d, 9, 25, 60, 300));
    return typed(`${name} tiene ${a} ${thing} y consigue ${b} más. ¿Cuántas tiene ahora?`, a + b, {
      explain: `"Consigue más" significa SUMAR: ${a} + ${b} = ${a + b}.`,
    });
  }
  if (kind === 2) {
    const a = ri(byD(d, 8, 20, 40, 150), byD(d, 20, 60, 120, 500));
    const b = ri(4, Math.min(a - 1, byD(d, 7, 18, 60, 250)));
    return typed(`${name} tiene ${a} ${thing} y regala ${b}. ¿Cuántas le quedan?`, a - b, {
      explain: `"Regalar" significa RESTAR: ${a} − ${b} = ${a - b}.`,
    });
  }
  if (kind === 3) {
    const per = ri(2, byD(d, 5, 9, 12, 20));
    const groups = ri(2, byD(d, 5, 7, 9, 15));
    return typed(
      `${name} arma ${groups} bolsas con ${per} ${thing} cada una. ¿Cuántas hay en total?`,
      per * groups,
      { explain: `Grupos iguales = MULTIPLICAR: ${groups} × ${per} = ${groups * per}.` }
    );
  }
  if (kind === 4) {
    const per = ri(2, byD(d, 4, 6, 9, 15));
    const total = per * ri(2, byD(d, 5, 8, 12, 20));
    return typed(
      `${name} reparte ${total} ${thing} entre ${per} amigos en partes iguales. ¿Cuántas recibe cada uno?`,
      total / per,
      { explain: `Repartir en partes iguales = DIVIDIR: ${total} ÷ ${per} = ${total / per}.` }
    );
  }
  // kind 5 (solo experto): promedio (media) de una lista de valores reales
  const avg = ri(30, 70);
  const total = avg * 5;
  const weights = Array.from({ length: 5 }, () => ri(1, 3));
  const weightSum = weights.reduce((x, y) => x + y, 0);
  const scores = weights.map((w) => Math.round((w / weightSum) * total));
  scores[0] += total - scores.reduce((x, y) => x + y, 0); // corrige el redondeo: suma exacta
  return typed(`${name} anotó estos puntajes en 5 partidas: ${scores.join(", ")}.\n¿Cuál es el PROMEDIO (media)?`, avg, {
    explain: `Suma total: ${scores.join(" + ")} = ${total}. Promedio = ${total} ÷ 5 = ${avg}.`,
  });
}

// ── geometría y medidas (nivel nuevo) ──────────────────────────

function qGeometryExperto(): Question {
  const kind = ri(1, 4);
  if (kind === 1) {
    const r = ri(2, 15);
    const area = Math.round(Math.PI * r * r);
    return numMC(`Un círculo tiene radio de ${r} cm.\n¿Cuál es su ÁREA aproximada? (usa π ≈ 3.14)`, area, {
      spread: Math.max(6, Math.round(area * 0.2)),
      explain: `Área = π × r² = 3.14 × ${r}² ≈ ${area} cm².`,
    });
  }
  if (kind === 2) {
    const r = ri(2, 15);
    const circ = Math.round(2 * Math.PI * r);
    return numMC(`Un círculo tiene radio de ${r} cm.\n¿Cuál es su CIRCUNFERENCIA aproximada? (usa π ≈ 3.14)`, circ, {
      spread: Math.max(4, Math.round(circ * 0.2)),
      explain: `Circunferencia = 2 × π × r = 2 × 3.14 × ${r} ≈ ${circ} cm.`,
    });
  }
  if (kind === 3) {
    const b = ri(2, 10) * 2; // par, para que el área sea siempre un entero exacto
    const h = ri(3, 16);
    return numMC(`Un triángulo tiene base de ${b} cm y altura de ${h} cm.\n¿Cuál es su ÁREA?`, (b * h) / 2, {
      spread: 6,
      explain: `Área = (base × altura) ÷ 2 = (${b} × ${h}) ÷ 2 = ${(b * h) / 2} cm².`,
    });
  }
  const l = ri(2, 10);
  const w = ri(2, 10);
  const hh = ri(2, 10);
  return numMC(`Una caja rectangular mide ${l} × ${w} × ${hh} cm.\n¿Cuál es su VOLUMEN?`, l * w * hh, {
    spread: Math.max(8, Math.round(l * w * hh * 0.2)),
    explain: `Volumen = largo × ancho × alto = ${l} × ${w} × ${hh} = ${l * w * hh} cm³.`,
  });
}

function qGeometry(d: D): Question {
  if (d === "facil") return qShapeVisual();
  if (d === "experto") return qGeometryExperto();
  const kind = ri(1, 3);
  if (kind === 1) {
    const side = ri(byD(d, 2, 2, 3), byD(d, 8, 12, 20));
    return numMC(`Un cuadrado tiene lados de ${side} cm.\n¿Cuál es su PERÍMETRO?`, side * 4, {
      spread: 6,
      explain: `Perímetro = 4 × lado = 4 × ${side} = ${side * 4}.`,
    });
  }
  if (kind === 2) {
    const w = ri(3, byD(d, 8, 8, 14));
    const h = ri(2, byD(d, 6, 6, 10));
    if (d === "dificil") {
      return numMC(`Un rectángulo mide ${w} cm de ancho y ${h} cm de alto.\n¿Cuál es su ÁREA?`, w * h, {
        spread: 8,
        explain: `Área = ancho × alto = ${w} × ${h} = ${w * h} cm².`,
      });
    }
    return numMC(`Un rectángulo mide ${w} cm de ancho y ${h} cm de alto.\n¿Cuál es su PERÍMETRO?`, 2 * (w + h), {
      spread: 6,
      explain: `Perímetro = 2 × (ancho + alto) = 2 × ${w + h} = ${2 * (w + h)}.`,
    });
  }
  const shapes3: [string, number][] = [["triángulo", 3], ["cuadrado", 4], ["pentágono", 5], ["hexágono", 6]];
  const [name, sides] = pick(shapes3);
  return numMC(`¿Cuántos lados tiene un ${name}?`, sides, { spread: 2 });
}

// caritas de reloj analógico en punto, una por cada hora (1..12)
const CLOCK_FACES = ["🕛", "🕐", "🕑", "🕒", "🕓", "🕔", "🕕", "🕖", "🕗", "🕘", "🕙", "🕚"];

function qTime(d: D): Question {
  if (d === "facil") {
    // "Pequeños": solo lectura simple del reloj en punto (1, 2 o 3),
    // sin problemas de horas transcurridas (demasiado abstracto para <5).
    const h = ri(1, 3);
    return {
      kind: "mc",
      prompt: "¿Qué hora muestra este reloj?",
      visual: CLOCK_FACES[h % 12],
      options: shuffle3(String(h)),
      answer: String(h),
      explain: "Cuando el minutero apunta al 12, es una hora en punto.",
    };
  }
  const kind = ri(1, 2);
  if (kind === 1) {
    const h = ri(1, 12);
    return {
      kind: "mc",
      prompt: "¿Qué hora muestra este reloj?",
      visual: CLOCK_FACES[h % 12],
      options: shuffle3(String(h)),
      answer: String(h),
      explain: "Cuando el minutero apunta al 12, es una hora en punto.",
    };
  }
  const startH = ri(1, 10);
  const elapsed = ri(1, byD(d, 2, 4, 8));
  const endH = ((startH + elapsed - 1) % 12) + 1;
  return numMC(`Empiezas a jugar a las ${startH} y juegas ${elapsed} horas.\n¿A qué hora terminas?`, endH, {
    spread: 3,
    explain: `${startH} + ${elapsed} horas = ${endH} (el reloj vuelve a empezar después del 12).`,
  });
}
function shuffle3(answer: string): string[] {
  const a = Number(answer);
  const set = new Set([a]);
  while (set.size < 3) {
    const v = ((a + ri(1, 4) - 1) % 12) + 1;
    set.add(v);
  }
  return [...set].map(String).sort(() => Math.random() - 0.5);
}

// ── álgebra inicial (nivel nuevo, más presente en "Genios") ────

function qAlgebra(d: D): Question {
  if (d === "facil") return qCompareVisual();
  if (d === "normal") {
    // número que falta en la operación
    const a = ri(3, 20);
    const b = ri(1, 15);
    const sum = a + b;
    const hideFirst = Math.random() < 0.5;
    if (hideFirst) {
      return numMC(`? + ${b} = ${sum}\n¿Qué número falta?`, a, { spread: 5, explain: `${sum} − ${b} = ${a}.` });
    }
    return numMC(`${a} + ? = ${sum}\n¿Qué número falta?`, b, { spread: 5, explain: `${sum} − ${a} = ${b}.` });
  }
  if (d === "experto") {
    const kind = ri(1, 4);
    if (kind === 1) {
      const x = ri(2, 15);
      const a = pick([2, 3, 4, 5]);
      const b = ri(1, 20);
      const total = a * x + b;
      return typed(`${a}x + ${b} = ${total}\n¿Cuánto vale x?`, x, {
        explain: `${a}x = ${total} − ${b} = ${a * x}. x = ${a * x} ÷ ${a} = ${x}.`,
      });
    }
    if (kind === 2) {
      const x = ri(2, 15);
      const a = pick([2, 3, 4, 5]);
      const b = ri(1, 15);
      const total = a * x - b;
      return typed(`${a}x − ${b} = ${total}\n¿Cuánto vale x?`, x, {
        explain: `${a}x = ${total} + ${b} = ${a * x}. x = ${a * x} ÷ ${a} = ${x}.`,
      });
    }
    if (kind === 3) {
      const a = ri(-20, -1);
      const b = ri(-15, -1);
      return numMC(`¿Cuánto es (${a}) + (${b})?`, a + b, {
        spread: 8,
        explain: "Sumar dos negativos: se suman los valores absolutos y el resultado es negativo.",
      });
    }
    const total = ri(20, 80);
    const x = ri(1, total - 1);
    const y = total - x;
    return typed(`x + y = ${total}\nx = ${x}\n¿Cuánto vale y?`, y, { explain: `y = ${total} − ${x} = ${y}.` });
  }
  // dificil: ecuaciones simples con x, y algo de negativos
  const kind = ri(1, 3);
  if (kind === 1) {
    const x = ri(2, 15);
    const b = ri(1, 20);
    const total = x + b;
    return typed(`x + ${b} = ${total}\n¿Cuánto vale x?`, x, { explain: `x = ${total} − ${b} = ${x}.` });
  }
  if (kind === 2) {
    const x = ri(2, 12);
    const m = pick([2, 3, 4, 5]);
    const total = x * m;
    return typed(`${m} × x = ${total}\n¿Cuánto vale x?`, x, { explain: `x = ${total} ÷ ${m} = ${x}.` });
  }
  const a = ri(-10, -1);
  const b = ri(1, 15);
  return numMC(`¿Cuánto es ${a} + ${b}?`, a + b, { spread: 6, explain: "Suma un negativo y un positivo: resta el menor al mayor y usa el signo del más grande." });
}

function gen(f: (d: D) => Question): (d: D) => Question[] {
  return (d) => session(Array.from({ length: 12 }, () => f(d)));
}

/** Como gen(), pero con un generador propio para "Pequeños" (menores de 5). */
function genFacil(facilFn: () => Question, restFn: (d: D) => Question): (d: D) => Question[] {
  return (d) => session(Array.from({ length: 12 }, () => (d === "facil" ? facilFn() : restFn(d))));
}

function genMix(fs: ((d: D) => Question)[]): (d: D) => Question[] {
  return (d) => session(Array.from({ length: 12 }, () => pick(fs)(d)));
}

function genMixFacil(facilFns: (() => Question)[], fs: ((d: D) => Question)[]): (d: D) => Question[] {
  return (d) => session(Array.from({ length: 12 }, () => (d === "facil" ? pick(facilFns)() : pick(fs)(d))));
}

export const MATH_LEVELS: LevelDef[] = [
  { name: "Contar Dibujitos", emoji: "🐣", desc: "Cuenta cuántos hay", tier: 1, gen: genFacil(qCountVisual, qSumSmall) },
  { name: "Sumas Pequeñas", emoji: "➕", desc: "Sumas hasta 10", tier: 1, gen: genFacil(qSumVisual, qSumSmall) },
  { name: "Restas Pequeñas", emoji: "➖", desc: "Restas hasta 10", tier: 1, gen: genFacil(qSubVisual, qSubSmall) },
  { name: "¿Cuál Tiene Más?", emoji: "⚖️", desc: "Compara grupos y cantidades", tier: 1, gen: genMixFacil([qCompareVisual, qSizeVisual], [qSum20, qCompare]) },
  { name: "Formas y Figuras", emoji: "🔺", desc: "Reconoce formas geométricas", tier: 1, gen: genFacil(qShapeVisual, qSum2d) },
  { name: "Grandes Sumas", emoji: "🔢", desc: "Sumas de dos cifras", tier: 2, gen: genFacil(qSumVisual, qSum2d) },
  { name: "Grandes Restas", emoji: "🧮", desc: "Restas de dos cifras", tier: 2, gen: genFacil(qSubVisual, qSub2d) },
  { name: "Tablas Amigas", emoji: "✖️", desc: "Grupos iguales y tablas del 2, 3, 4, 5 y 10", tier: 2, gen: genFacil(qGroupsVisual, qMulEasy) },
  { name: "Tablas Valientes", emoji: "🔥", desc: "Tablas del 6, 7, 8 y 9", tier: 2, gen: genFacil(qGroupsVisual, qMulHard) },
  { name: "División Exacta", emoji: "➗", desc: "Repartir en partes iguales", tier: 2, gen: genFacil(qShareVisual, qDiv) },
  { name: "Números Gigantes", emoji: "🐘", desc: "Comparar y redondear", tier: 2, gen: genMixFacil([qCompareVisual], [qCompare, qRound]) },
  { name: "Geometría y Reloj", emoji: "📐", desc: "Perímetro, área, lados y la hora", tier: 3, gen: genMix([qGeometry, qTime]) },
  { name: "Fracciones y Dobles", emoji: "🍕", desc: "Mitades, tercios, cuartos y el doble", tier: 3, gen: genFacil(qDoubleVisual, qFraction) },
  { name: "Porcentajes", emoji: "💹", desc: "50%, 10%, 25%, dobles y mitades", tier: 3, gen: genFacil(qDoubleVisual, qPercent) },
  { name: "Álgebra Inicial", emoji: "🧩", desc: "El número misterioso y ecuaciones con x", tier: 3, gen: gen(qAlgebra) },
  { name: "Misiones Mentales", emoji: "🎒", desc: "Problemas de la vida real", tier: 3, gen: genMixFacil([qSumVisual, qShareVisual], [qWordProblem, qWordProblem, qFraction, qPercent]) },
];
