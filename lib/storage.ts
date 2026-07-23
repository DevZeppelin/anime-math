import type { Character, Difficulty, Profile, RootSave } from "./types";

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
  pet: null,
  aura: null,
  background: null,
};

export function newProfile(name: string, character: Character, difficulty: Difficulty = "normal"): Profile {
  return {
    id: `p${Date.now().toString(36)}${Math.floor(Math.random() * 1e4).toString(36)}`,
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
    // migra perfiles antiguos: rellena campos nuevos del personaje
    const profiles: RootSave["profiles"] = {};
    for (const id of ids) {
      const p = parsed.profiles[id];
      const character: Character = { ...DEFAULT_CHARACTER, ...p.character };
      // las capas y alas vivían antes en el slot "accessory"; ahora tienen su propio slot "back"
      if (!character.back && (character.accessory === "ac_cape" || character.accessory === "ac_wings")) {
        character.back = character.accessory;
        character.accessory = null;
      }
      profiles[id] = {
        ...p,
        character,
        difficulty: p.difficulty ?? "normal",
      };
    }
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
