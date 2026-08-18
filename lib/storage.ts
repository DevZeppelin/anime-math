import type { Character, Difficulty, Profile, RootSave } from "./types";

const DIFFICULTIES: Difficulty[] = ["facil", "normal", "dificil", "experto"];

const KEY = "academia-aventura-v1";
const LEGACY_KEY = "anime-math-save-v1";
export const MAX_PROFILES = 6;

export const DEFAULT_CHARACTER: Character = {
  skin: "#f3cba8",
  hairStyle: "spiky",
  hairColor: "#3a3a55",
  eyeColor: "#4d96ff",
  eyeStyle: "normal",
  mouth: "smile",
  faceMark: "none",
  bodyType: "regular",
  outfit: "out_school",
  weapon: null,
  weapon2: null,
  accessory: null,
  back: null,
  necklace: null,
  ring: null,
  boots: null,
  pet: null,
  aura: null,
  background: null,
};

function newProfileId(): string {
  return `p${Date.now().toString(36)}${Math.floor(Math.random() * 1e4).toString(36)}`;
}

export function newProfile(name: string, character: Character, difficulty: Difficulty = "normal"): Profile {
  return {
    id: newProfileId(),
    name,
    created: Date.now(),
    character,
    difficulty,
    coins: 120, // regalo de bienvenida para probar la tienda
    gems: 3,
    xp: 0,
    owned: ["out_school"],
    abilities: [],
    levels: {},
    achievements: [],
    stats: { answered: 0, correct: 0, lessons: 0, perfects: 0, minigames: 0, bestStreak: 0 },
    streakDays: 0,
    lastPlayDate: "",
  };
}

const EMPTY: RootSave = { v: 1, profiles: {}, order: [] };

/** Rellena campos nuevos/migrados de un perfil (personaje, dificultad, etc). */
function migrateProfile(p: Profile): Profile {
  const character: Character = { ...DEFAULT_CHARACTER, ...p.character };
  // las capas y alas vivían antes en el slot "accessory"; ahora tienen su propio slot "back"
  if (!character.back && (character.accessory === "ac_cape" || character.accessory === "ac_wings")) {
    character.back = character.accessory;
    character.accessory = null;
  }
  return { ...p, character, difficulty: p.difficulty ?? "normal" };
}

export function loadRoot(): RootSave {
  if (typeof window === "undefined") return { ...EMPTY };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { ...EMPTY };
    const parsed = JSON.parse(raw) as RootSave;
    if (!parsed || typeof parsed !== "object" || !parsed.profiles) return { ...EMPTY };
    // sanea el orden por si quedó desincronizado
    const ids = Object.keys(parsed.profiles);
    const order = (parsed.order || []).filter((id) => ids.includes(id));
    for (const id of ids) if (!order.includes(id)) order.push(id);
    const profiles: RootSave["profiles"] = {};
    for (const id of ids) profiles[id] = migrateProfile(parsed.profiles[id]);
    return { v: 1, profiles, order };
  } catch {
    return { ...EMPTY };
  }
}

export function saveRoot(root: RootSave): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(root));
    window.localStorage.removeItem(LEGACY_KEY);
  } catch {
    /* cuota / modo privado: ignorar */
  }
}

export function upsertProfile(root: RootSave, profile: Profile): RootSave {
  const profiles = { ...root.profiles, [profile.id]: profile };
  const order = root.order.includes(profile.id) ? root.order : [...root.order, profile.id];
  return { ...root, profiles, order };
}

export function deleteProfile(root: RootSave, id: string): RootSave {
  const profiles = { ...root.profiles };
  delete profiles[id];
  return { ...root, profiles, order: root.order.filter((x) => x !== id) };
}

export function todayKey(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

/** Reinicia el avance académico de un héroe (nivel, lecciones, logros, racha) pero conserva monedas, gemas, ítems e apariencia. */
export function resetProfileProgress(p: Profile): Profile {
  return {
    ...p,
    xp: 0,
    levels: {},
    achievements: [],
    stats: { answered: 0, correct: 0, lessons: 0, perfects: 0, minigames: 0, bestStreak: 0 },
    streakDays: 0,
    lastPlayDate: "",
  };
}

function slugify(s: string): string {
  const clean = s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .toLowerCase();
  return clean || "heroe";
}

/** Dispara la descarga de un héroe como archivo .json, para hacer backup o llevarlo a otro navegador. */
export function downloadProfileBackup(p: Profile): void {
  if (typeof window === "undefined") return;
  const raw = JSON.stringify({ app: "academia-aventura", type: "profile", v: 1, profile: p }, null, 2);
  const blob = new Blob([raw], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `academia-aventura-${slugify(p.name)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Parsea un archivo de backup exportado con downloadProfileBackup(); devuelve null si no es válido. */
export function parseProfileBackup(raw: string): Profile | null {
  try {
    const data = JSON.parse(raw);
    const p = data && typeof data === "object" && data.type === "profile" ? data.profile : data;
    if (!p || typeof p !== "object" || typeof p.id !== "string" || typeof p.name !== "string" || !p.character) {
      return null;
    }
    return migrateProfile({
      id: p.id,
      name: p.name,
      created: typeof p.created === "number" ? p.created : Date.now(),
      character: p.character,
      difficulty: DIFFICULTIES.includes(p.difficulty) ? p.difficulty : "normal",
      coins: typeof p.coins === "number" ? p.coins : 0,
      gems: typeof p.gems === "number" ? p.gems : 0,
      xp: typeof p.xp === "number" ? p.xp : 0,
      owned: Array.isArray(p.owned) ? p.owned : ["out_school"],
      abilities: Array.isArray(p.abilities) ? p.abilities : [],
      levels: p.levels && typeof p.levels === "object" ? p.levels : {},
      achievements: Array.isArray(p.achievements) ? p.achievements : [],
      stats:
        p.stats && typeof p.stats === "object"
          ? p.stats
          : { answered: 0, correct: 0, lessons: 0, perfects: 0, minigames: 0, bestStreak: 0 },
      streakDays: typeof p.streakDays === "number" ? p.streakDays : 0,
      lastPlayDate: typeof p.lastPlayDate === "string" ? p.lastPlayDate : "",
    });
  } catch {
    return null;
  }
}

/** Si el id ya existe entre los perfiles actuales, devuelve una copia con id/nombre nuevos para no pisar el existente. */
export function resolveImportCollision(p: Profile, existingIds: string[]): Profile {
  if (!existingIds.includes(p.id)) return p;
  return { ...p, id: newProfileId(), name: `${p.name} (copia)` };
}

/** Actualiza la racha diaria; devuelve el perfil y si hoy es el primer día de juego. */
export function touchDailyStreak(p: Profile): { profile: Profile; firstToday: boolean } {
  const today = todayKey();
  if (p.lastPlayDate === today) return { profile: p, firstToday: false };
  const yesterday = new Date(Date.now() - 86400000);
  const ym = String(yesterday.getMonth() + 1).padStart(2, "0");
  const yd = String(yesterday.getDate()).padStart(2, "0");
  const yKey = `${yesterday.getFullYear()}-${ym}-${yd}`;
  const streakDays = p.lastPlayDate === yKey ? p.streakDays + 1 : 1;
  return { profile: { ...p, lastPlayDate: today, streakDays }, firstToday: true };
}
