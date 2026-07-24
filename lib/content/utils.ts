import type { Difficulty, Question } from "../types";

export function ri(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function sample<T>(arr: readonly T[], n: number): T[] {
  return shuffle(arr).slice(0, n);
}

/** Opción múltiple numérica: genera 3 distractores cercanos y plausibles. */
export function numMC(prompt: string, answer: number, opts?: { visual?: string; spread?: number; explain?: string }): Question {
  const spread = opts?.spread ?? Math.max(3, Math.round(Math.abs(answer) * 0.25));
  // si la respuesta ya es negativa, los distractores también pueden serlo
  // (si no, un negativo delataría la respuesta correcta a simple vista)
  const allowNegative = answer < 0;
  const set = new Set<number>([answer]);
  let guard = 0;
  while (set.size < 4 && guard++ < 60) {
    const off = ri(1, spread) * (Math.random() < 0.5 ? -1 : 1);
    const v = answer + off;
    if (v >= 0 || allowNegative) set.add(v);
  }
  // relleno de emergencia si el answer es muy chico
  let extra = answer + spread + 1;
  while (set.size < 4) set.add(extra++);
  return {
    kind: "mc",
    prompt,
    visual: opts?.visual,
    options: shuffle([...set]).map(String),
    answer: String(answer),
    explain: opts?.explain,
  };
}

/** Opción múltiple de texto: respuesta + distractores del banco dado. */
export function textMC(
  prompt: string,
  answer: string,
  distractorPool: readonly string[],
  opts?: { visual?: string; explain?: string; count?: number }
): Question {
  const n = opts?.count ?? 4;
  const pool = shuffle(distractorPool.filter((d) => d !== answer)).slice(0, n - 1);
  return {
    kind: "mc",
    prompt,
    visual: opts?.visual,
    options: shuffle([answer, ...pool]),
    answer,
    explain: opts?.explain,
  };
}

export function typed(prompt: string, answer: string | number, opts?: { visual?: string; accept?: string[]; explain?: string }): Question {
  return {
    kind: "type",
    prompt,
    visual: opts?.visual,
    answer: String(answer),
    accept: opts?.accept,
    numeric: typeof answer === "number",
    explain: opts?.explain,
  };
}

export function tf(prompt: string, answer: boolean, opts?: { visual?: string; explain?: string }): Question {
  return { kind: "tf", prompt, visual: opts?.visual, answer, explain: opts?.explain };
}

export function order(prompt: string, items: string[], opts?: { visual?: string; explain?: string }): Question {
  return { kind: "order", prompt, items, visual: opts?.visual, explain: opts?.explain };
}

/** Normaliza texto para comparar respuestas escritas. */
export function normalize(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

/** Detecta opciones de multiple choice que son solo un emoji/símbolo (sin letras
 *  ni números), para que la UI las muestre con letra bien grande y legible.
 *  Evita \p{...} de regex unicode por compatibilidad con navegadores móviles viejos. */
export function isSymbolOption(opt: string): boolean {
  const trimmed = opt.trim();
  if (!trimmed || trimmed.length > 8) return false;
  return !/[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ]/.test(trimmed);
}

export function checkTyped(q: Extract<Question, { kind: "type" }>, input: string): boolean {
  const norm = normalize(input);
  if (q.numeric) return norm !== "" && Number(norm.replace(",", ".")) === Number(q.answer);
  if (norm === normalize(q.answer)) return true;
  return (q.accept ?? []).some((a) => normalize(a) === norm);
}

export const SESSION_SIZE = 8;

/** Identidad de una pregunta para detectar repetidos: mismo enunciado,
 *  imagen y respuesta (sin importar el orden de las opciones barajadas). */
function questionSignature(q: Question): string {
  const base = `${q.prompt}|${q.visual ?? ""}`;
  if (q.kind === "order") return `${base}|${[...q.items].sort().join(",")}`;
  return `${base}|${String(q.answer)}`;
}

/** Mezcla y arma una sesión de tamaño fijo, eligiendo en cada paso
 *  cualquier candidato restante del pool que NO repita el enunciado
 *  de la pregunta anterior — así se aprovecha toda la variedad
 *  disponible (no solo un recorte fijo) y ninguna lección se siente
 *  repetitiva. Si el pool es muy chico, puede que al final no quede
 *  más remedio que repetir, pero nunca antes de agotar alternativas. */
export function session(qs: Question[]): Question[] {
  const remaining = shuffle(qs);
  const result: Question[] = [];
  while (result.length < SESSION_SIZE && remaining.length > 0) {
    const lastSig = result.length > 0 ? questionSignature(result[result.length - 1]) : null;
    let idx = remaining.findIndex((q) => questionSignature(q) !== lastSig);
    if (idx === -1) idx = 0;
    result.push(remaining[idx]);
    remaining.splice(idx, 1);
  }
  return result;
}

/** Combina varios generadores de preguntas evitando usar el mismo
 *  generador (el mismo "tipo" de ejercicio) dos veces seguidas, para que
 *  una sesión nunca repita el mismo ejercicio en fila. */
export function varied(fns: readonly (() => Question)[], count: number = SESSION_SIZE): Question[] {
  const out: Question[] = [];
  let prevIdx = -1;
  for (let i = 0; i < count; i++) {
    let idx = ri(0, fns.length - 1);
    if (fns.length > 1) {
      let guard = 0;
      while (idx === prevIdx && guard++ < 20) idx = ri(0, fns.length - 1);
    }
    out.push(fns[idx]());
    prevIdx = idx;
  }
  return out;
}

/** Repite un emoji n veces (separado por espacios) para mostrar una
 *  cantidad de forma 100% visual — clave para el modo "Pequeños". */
export function repeatEmoji(emoji: string, n: number): string {
  return Array.from({ length: n }, () => emoji).join(" ");
}

/** Formas básicas en emoji: sirven como "imagen" universal sin texto. */
export const SHAPES: { name: string; emoji: string }[] = [
  { name: "círculo", emoji: "🔴" },
  { name: "cuadrado", emoji: "🟥" },
  { name: "triángulo", emoji: "🔺" },
  { name: "estrella", emoji: "⭐" },
  { name: "corazón", emoji: "❤️" },
  { name: "diamante", emoji: "🔷" },
];

/** Colores básicos como emoji de color: la propia imagen ES el color. */
export const COLOR_DOTS: { name: string; emoji: string }[] = [
  { name: "rojo", emoji: "🔴" },
  { name: "azul", emoji: "🔵" },
  { name: "verde", emoji: "🟢" },
  { name: "amarillo", emoji: "🟡" },
  { name: "morado", emoji: "🟣" },
  { name: "naranja", emoji: "🟠" },
  { name: "negro", emoji: "⚫" },
  { name: "blanco", emoji: "⚪" },
  { name: "marrón", emoji: "🟤" },
];

/** Pregunta "¿Cuál es...?" con opciones 100% en emoji: la base de
 *  todo el contenido visual para "Pequeños" (menores de 5). */
export function pickEmojiMC(bank: readonly [string, string][], promptFn: (name: string) => string): Question {
  const [name, emoji] = pick(bank);
  const wrong = sample(
    bank.filter((b) => b[1] !== emoji).map((b) => b[1]),
    2
  );
  return { kind: "mc", prompt: promptFn(name), options: shuffle([emoji, ...wrong]), answer: emoji };
}

/** Ajusta una pregunta al modo de dificultad:
 *  fácil → máximo 3 opciones; difícil → hasta 6 opciones numéricas;
 *  experto (Maestros, sin límite de edad) → hasta 8, el reto máximo. */
export function adaptQuestion(q: Question, d: Difficulty): Question {
  if (q.kind !== "mc") return q;
  if (d === "facil" && q.options.length > 3) {
    const wrong = shuffle(q.options.filter((o) => o !== q.answer)).slice(0, 2);
    return { ...q, options: shuffle([q.answer, ...wrong]) };
  }
  if ((d === "dificil" || d === "experto") && !q.notDecimal && q.options.every((o) => /^-?\d+$/.test(o))) {
    const target = d === "experto" ? 8 : 6;
    if (q.options.length >= target) return q;
    const set = new Set(q.options.map(Number));
    const ans = Number(q.answer);
    const allowNegative = ans < 0 || [...set].some((v) => v < 0);
    const spread = Math.max(4, Math.round(Math.abs(ans) * 0.3));
    let guard = 0;
    while (set.size < target && guard++ < 100) {
      const v = ans + ri(1, spread) * (Math.random() < 0.5 ? -1 : 1);
      if (v >= 0 || allowNegative) set.add(v);
    }
    return { ...q, options: shuffle([...set]).map(String) };
  }
  return q;
}
