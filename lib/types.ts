// ─────────────────────────────────────────────────────────────
// Modelos centrales de Academia Aventura
// ─────────────────────────────────────────────────────────────

export type Rarity = "comun" | "raro" | "epico" | "legendario";

// ── Dificultad por edades ────────────────────────────────────

export type Difficulty = "facil" | "normal" | "dificil" | "experto";

export const DIFFICULTY_META: Record<
  Difficulty,
  { label: string; ages: string; emoji: string; desc: string; coinMult: number; timeBonus: number }
> = {
  facil: {
    label: "Pequeños",
    ages: "Menores de 5",
    emoji: "🐥",
    desc: "Todo con imágenes y colores, y lo lee en voz alta: ¡ideal para quienes aún no leen!",
    coinMult: 1,
    timeBonus: 20,
  },
  normal: {
    label: "Aventureros",
    ages: "Menores de 10",
    emoji: "🚀",
    desc: "El desafío clásico de la academia, con lectura y escritura.",
    coinMult: 1.2,
    timeBonus: 0,
  },
  dificil: {
    label: "Genios",
    ages: "Menores de 15",
    emoji: "🎓",
    desc: "Retos avanzados, números grandes y menos tiempo. ¡Más monedas!",
    coinMult: 1.5,
    timeBonus: -7,
  },
  experto: {
    label: "Maestros",
    ages: "Sin límite de edad",
    emoji: "👑",
    desc: "El nivel más alto de la academia: cada materia sube de menos a más hasta contenido real de adultos. Para cualquier edad que quiera aprender de verdad.",
    coinMult: 2,
    timeBonus: -12,
  },
};

export const RARITY_META: Record<
  Rarity,
  { label: string; color: string; glow: string; order: number }
> = {
  comun: { label: "Común", color: "#9aa6c4", glow: "rgba(154,166,196,0.45)", order: 0 },
  raro: { label: "Raro", color: "#41b6ff", glow: "rgba(65,182,255,0.55)", order: 1 },
  epico: { label: "Épico", color: "#c061ff", glow: "rgba(192,97,255,0.6)", order: 2 },
  legendario: { label: "Legendario", color: "#ffb020", glow: "rgba(255,176,32,0.65)", order: 3 },
};

// ── Personaje ────────────────────────────────────────────────

export type HairStyle =
  | "spiky" | "bob" | "long" | "ponytail" | "buns" | "curly" | "mohawk"
  | "twintails" | "braid" | "afro" | "hime" | "wavy" | "topknot" | "messy"
  | "hero" | "emo" | "wolf" | "lowtail" | "sidetail" | "drills";

export type EyeStyle =
  | "normal" | "happy" | "determined" | "star" | "sleepy"
  | "wink" | "crying" | "angry" | "dizzy" | "heart";
export type MouthStyle =
  | "smile" | "grin" | "cat" | "neutral" | "smirk"
  | "laugh" | "surprised" | "smug" | "tongue" | "pout";
export type FaceMark = "none" | "freckles" | "blush" | "scar" | "star" | "heart";
export type BodyType = "slim" | "regular" | "athletic" | "sturdy";

export interface Character {
  skin: string; // color hex
  hairStyle: HairStyle;
  hairColor: string;
  eyeColor: string;
  eyeStyle: EyeStyle;
  mouth: MouthStyle;
  faceMark: FaceMark;
  bodyType: BodyType;
  outfit: string; // item id
  weapon: string | null; // item id (mano principal)
  weapon2: string | null; // item id (mano secundaria, para combate a dos armas)
  accessory: string | null; // item id
  back: string | null; // item id (capas, alas)
  necklace: string | null; // item id
  ring: string | null; // item id
  boots: string | null; // item id (calzado, independiente del traje)
  pet: string | null; // item id
  aura: string | null; // item id
  background: string | null; // item id
}

// ── Ítems ────────────────────────────────────────────────────

export type ItemType = "outfit" | "weapon" | "accessory" | "back" | "necklace" | "ring" | "boots" | "pet" | "aura" | "background";

export interface ItemDef {
  id: string;
  type: ItemType;
  name: string;
  emoji: string; // icono para listas
  rarity: Rarity;
  price: number; // en monedas
  gems?: number; // si > 0, se paga con gemas
  desc: string;
  // datos visuales usados por Avatar.tsx (colores, variante…)
  c1?: string;
  c2?: string;
  c3?: string;
  variant?: string;
  motif?: string; // patrón decorativo (sakura, olas, dragón, luna, llama…)
}

export interface AbilityDef {
  id: string;
  name: string;
  emoji: string;
  desc: string;
  gems: number;
}

// ── Preguntas ────────────────────────────────────────────────

export type Question =
  | {
      kind: "mc"; // opción múltiple
      prompt: string;
      visual?: string; // emoji grande de apoyo
      code?: string; // bloque de código de referencia (monoespaciado), opcional
      options: string[];
      answer: string; // debe estar en options
      explain?: string;
      // las opciones parecen números (binario, hexadecimal…) pero NO son
      // cantidades decimales: adaptQuestion no debe generar distractores
      // haciendo aritmética decimal sobre ellas (rompería el formato).
      notDecimal?: boolean;
    }
  | {
      kind: "type"; // respuesta escrita
      prompt: string;
      visual?: string;
      code?: string; // bloque de código de referencia (monoespaciado), opcional
      answer: string; // se normaliza al comparar
      accept?: string[]; // respuestas alternativas válidas
      numeric?: boolean;
      explain?: string;
    }
  | {
      kind: "tf"; // verdadero / falso
      prompt: string;
      visual?: string;
      code?: string; // bloque de código de referencia (monoespaciado), opcional
      answer: boolean;
      explain?: string;
    }
  | {
      kind: "order"; // ordenar elementos tocándolos en secuencia
      prompt: string;
      visual?: string;
      code?: string; // bloque de código de referencia (monoespaciado), opcional
      items: string[]; // en el orden CORRECTO; se barajan al mostrar
      explain?: string;
    }
  | {
      kind: "map"; // tocar el lugar correcto en el mapa del mundo
      prompt: string;
      visual?: string;
      points: MapPoint[]; // los pines/regiones que se muestran (solo uno es correcto)
      answer: string; // debe ser el id de uno de los points
      big?: boolean; // pines grandes (continentes) en vez de chicos (países)
      explain?: string;
    }
  | {
      kind: "info"; // tarjeta de enseñanza estilo SoloLearn: código + explicación, sin puntaje ni riesgo
      prompt: string; // título breve de la tarjeta
      code: string; // bloque de código (puede tener varias líneas, separadas por \n)
      explain: string; // qué hace el código, en lenguaje simple
      output?: string; // qué imprime/produce al ejecutarse, si aplica
    };

export interface MapPoint {
  id: string;
  label: string; // nombre real, se revela recién en el feedback (nunca antes)
  x: number; // 0..1000, coordenadas equirectangulares del mapa estilizado
  y: number; // 0..500
}

// ── Currículo ────────────────────────────────────────────────

export interface LevelDef {
  name: string;
  emoji: string;
  desc: string;
  tier: 1 | 2 | 3; // dificultad → recompensas
  gen: (d: Difficulty) => Question[]; // produce las preguntas de una sesión
}

export interface SubjectDef {
  id: string;
  name: string;
  emoji: string;
  color: string; // color de acento de la materia
  tagline: string;
  levels: LevelDef[];
  lang?: "es" | "en"; // idioma para la lectura en voz alta (por defecto "es")
}

// ── Guardado ─────────────────────────────────────────────────

export interface LevelRecord {
  stars: 0 | 1 | 2 | 3;
  plays: number;
}

export interface ProfileStats {
  answered: number;
  correct: number;
  lessons: number;
  perfects: number;
  minigames: number;
  bestStreak: number; // mejor racha de respuestas seguidas
}

export interface Profile {
  id: string;
  name: string;
  created: number;
  character: Character;
  difficulty: Difficulty;
  coins: number;
  gems: number;
  xp: number;
  owned: string[]; // ids de ítems
  abilities: string[]; // ids de habilidades
  levels: Record<string, LevelRecord>; // "materia:índice" → registro
  achievements: string[]; // ids desbloqueados
  stats: ProfileStats;
  streakDays: number;
  lastPlayDate: string; // "YYYY-MM-DD"
}

export interface RootSave {
  v: number;
  profiles: Record<string, Profile>;
  order: string[]; // orden de los perfiles
}
