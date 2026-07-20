import type { Profile } from "./types";
import { ALL_ITEMS, ABILITIES } from "./items";
import { SUBJECTS } from "./content";

// ─────────────────────────────────────────────────────────────
// Nivel de jugador: XP acumulada → nivel
// El costo de cada nivel crece de forma suave: 120·n
// ─────────────────────────────────────────────────────────────

export function xpForLevel(level: number): number {
  // XP total necesaria para ALCANZAR `level` (nivel 1 = 0 XP)
  let total = 0;
  for (let n = 1; n < level; n++) total += 120 * n;
  return total;
}

export function levelFromXp(xp: number): number {
  let level = 1;
  while (xp >= xpForLevel(level + 1)) level++;
  return level;
}

export function levelProgress(xp: number): { level: number; into: number; needed: number } {
  const level = levelFromXp(xp);
  const base = xpForLevel(level);
  const next = xpForLevel(level + 1);
  return { level, into: xp - base, needed: next - base };
}

/** Recompensa por subir a `level`: gemas + monedas. */
export function levelUpReward(level: number): { gems: number; coins: number } {
  return { gems: 1 + Math.floor(level / 5), coins: 40 + level * 10 };
}

// ── Recompensas por respuesta / lección ──────────────────────

export const TIER_COINS: Record<1 | 2 | 3, number> = { 1: 4, 2: 6, 3: 9 };
export const TIER_XP: Record<1 | 2 | 3, number> = { 1: 8, 2: 12, 3: 17 };
export const LESSON_BONUS: Record<1 | 2 | 3, number> = { 1: 20, 2: 35, 3: 55 };
export const QUESTION_SECONDS = 25;

export function starsForErrors(errors: number): 1 | 2 | 3 {
  if (errors === 0) return 3;
  if (errors === 1) return 2;
  return 1;
}

// ── Logros ───────────────────────────────────────────────────

export interface AchievementDef {
  id: string;
  name: string;
  emoji: string;
  desc: string;
  gems: number; // recompensa
  check: (p: Profile) => boolean;
}

function starsTotal(p: Profile): number {
  return Object.values(p.levels).reduce((s, r) => s + r.stars, 0);
}

function subjectCompleted(p: Profile, subjectId: string, levelCount: number): boolean {
  for (let i = 0; i < levelCount; i++) {
    const rec = p.levels[`${subjectId}:${i}`];
    if (!rec || rec.stars < 1) return false;
  }
  return true;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: "first_lesson", name: "Primer Paso", emoji: "👣", desc: "Completa tu primera lección.", gems: 1, check: (p) => p.stats.lessons >= 1 },
  { id: "lessons_10", name: "Estudiante Aplicado", emoji: "📚", desc: "Completa 10 lecciones.", gems: 2, check: (p) => p.stats.lessons >= 10 },
  { id: "lessons_30", name: "Ratón de Biblioteca", emoji: "🐭", desc: "Completa 30 lecciones.", gems: 3, check: (p) => p.stats.lessons >= 30 },
  { id: "lessons_75", name: "Maestro en Formación", emoji: "🎓", desc: "Completa 75 lecciones.", gems: 5, check: (p) => p.stats.lessons >= 75 },
  { id: "first_perfect", name: "¡Perfecto!", emoji: "🌟", desc: "Termina una lección sin errores.", gems: 1, check: (p) => p.stats.perfects >= 1 },
  { id: "perfect_10", name: "Precisión Total", emoji: "🎯", desc: "Logra 10 lecciones perfectas.", gems: 3, check: (p) => p.stats.perfects >= 10 },
  { id: "correct_100", name: "Cien Aciertos", emoji: "💯", desc: "Responde 100 preguntas bien.", gems: 2, check: (p) => p.stats.correct >= 100 },
  { id: "correct_500", name: "Cerebro de Acero", emoji: "🧠", desc: "Responde 500 preguntas bien.", gems: 4, check: (p) => p.stats.correct >= 500 },
  { id: "correct_1500", name: "Sabio Legendario", emoji: "🦉", desc: "Responde 1500 preguntas bien.", gems: 8, check: (p) => p.stats.correct >= 1500 },
  { id: "streak_10", name: "En Llamas", emoji: "🔥", desc: "Racha de 10 respuestas seguidas.", gems: 2, check: (p) => p.stats.bestStreak >= 10 },
  { id: "streak_25", name: "Imparable", emoji: "☄️", desc: "Racha de 25 respuestas seguidas.", gems: 4, check: (p) => p.stats.bestStreak >= 25 },
  { id: "days_3", name: "Constancia", emoji: "📅", desc: "Juega 3 días seguidos.", gems: 2, check: (p) => p.streakDays >= 3 },
  { id: "days_7", name: "Semana de Héroe", emoji: "🗓️", desc: "Juega 7 días seguidos.", gems: 5, check: (p) => p.streakDays >= 7 },
  { id: "stars_25", name: "Coleccionista Estelar", emoji: "⭐", desc: "Consigue 25 estrellas en total.", gems: 3, check: (p) => starsTotal(p) >= 25 },
  { id: "stars_75", name: "Constelación", emoji: "🌠", desc: "Consigue 75 estrellas en total.", gems: 5, check: (p) => starsTotal(p) >= 75 },
  { id: "rich_1000", name: "Pequeña Fortuna", emoji: "💰", desc: "Ahorra 1000 monedas a la vez.", gems: 2, check: (p) => p.coins >= 1000 },
  { id: "items_5", name: "Primer Armario", emoji: "👕", desc: "Consigue 5 ítems.", gems: 2, check: (p) => p.owned.length >= 5 },
  { id: "items_15", name: "Gran Colección", emoji: "🧳", desc: "Consigue 15 ítems.", gems: 4, check: (p) => p.owned.length >= 15 },
  { id: "items_all", name: "Colección Total", emoji: "🏆", desc: `Consigue los ${ALL_ITEMS.length} ítems del juego.`, gems: 15, check: (p) => p.owned.length >= ALL_ITEMS.length },
  { id: "abilities_all", name: "Poder Absoluto", emoji: "💫", desc: "Aprende todas las habilidades.", gems: 10, check: (p) => p.abilities.length >= ABILITIES.length },
  { id: "minigames_10", name: "Alma de la Arena", emoji: "🎮", desc: "Juega 10 minijuegos.", gems: 2, check: (p) => p.stats.minigames >= 10 },
  { id: "level_10", name: "Nivel 10", emoji: "🔟", desc: "Alcanza el nivel 10 de jugador.", gems: 3, check: (p) => levelFromXp(p.xp) >= 10 },
  { id: "level_20", name: "Leyenda Viviente", emoji: "🏅", desc: "Alcanza el nivel 20 de jugador.", gems: 6, check: (p) => levelFromXp(p.xp) >= 20 },
  ...SUBJECTS.map((s) => ({
    id: `subject_${s.id}`,
    name: `Diploma de ${s.name}`,
    emoji: s.emoji,
    desc: `Supera todos los niveles de ${s.name}.`,
    gems: 6,
    check: (p: Profile) => subjectCompleted(p, s.id, s.levels.length),
  })),
  {
    id: "graduate",
    name: "Graduación Suprema",
    emoji: "🎖️",
    desc: "Supera todos los niveles de todas las materias.",
    gems: 20,
    check: (p) => SUBJECTS.every((s) => subjectCompleted(p, s.id, s.levels.length)),
  },
];

/** Revisa logros nuevos, aplica recompensas y devuelve los recién ganados. */
export function checkAchievements(p: Profile): { profile: Profile; unlocked: AchievementDef[] } {
  const unlocked: AchievementDef[] = [];
  let profile = p;
  for (const a of ACHIEVEMENTS) {
    if (!profile.achievements.includes(a.id) && a.check(profile)) {
      unlocked.push(a);
      profile = {
        ...profile,
        achievements: [...profile.achievements, a.id],
        gems: profile.gems + a.gems,
      };
    }
  }
  return { profile, unlocked };
}
