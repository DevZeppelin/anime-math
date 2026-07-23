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
  const set = new Set<number>([answer]);
  let guard = 0;
  while (set.size < 4 && guard++ < 60) {
    const off = ri(1, spread) * (Math.random() < 0.5 ? -1 : 1);
    const v = answer + off;
    if (v >= 0) set.add(v);
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

export function checkTyped(q: Extract<Question, { kind: "type" }>, input: string): boolean {
  const norm = normalize(input);
  if (q.numeric) return norm !== "" && Number(norm.replace(",", ".")) === Number(q.answer);
  if (norm === normalize(q.answer)) return true;
  return (q.accept ?? []).some((a) => normalize(a) === norm);
}

export const SESSION_SIZE = 8;

/** Mezcla y recorta a tamaño de sesión. */
export function session(qs: Question[]): Question[] {
  return shuffle(qs).slice(0, SESSION_SIZE);
}

/** Ajusta una pregunta al modo de dificultad:
 *  fácil → máximo 3 opciones; difícil → hasta 6 opciones numéricas. */
export function adaptQuestion(q: Question, d: Difficulty): Question {
  if (q.kind !== "mc") return q;
  if (d === "facil" && q.options.length > 3) {
    const wrong = shuffle(q.options.filter((o) => o !== q.answer)).slice(0, 2);
    return { ...q, options: shuffle([q.answer, ...wrong]) };
  }
  if (d === "dificil" && q.options.length < 6 && q.options.every((o) => /^-?\d+$/.test(o))) {
    const set = new Set(q.options.map(Number));
    const ans = Number(q.answer);
    const spread = Math.max(4, Math.round(Math.abs(ans) * 0.3));
    let guard = 0;
    while (set.size < 6 && guard++ < 80) {
      const v = ans + ri(1, spread) * (Math.random() < 0.5 ? -1 : 1);
      if (v >= 0) set.add(v);
    }
    return { ...q, options: shuffle([...set]).map(String) };
  }
  return q;
}
