export type Rarity = "comun" | "raro" | "epico" | "legendario";

export interface CardDef {
  id: string;
  name: string;
  title: string;
  element: string;
  rarity: Rarity;
  cost: number;
  basePower: number;
  // visual descriptors for the SVG portrait
  hair: string;
  hair2: string;
  skin: string;
  eye: string;
  aura: string;
  hairStyle: "spiky" | "long" | "short" | "ponytail" | "bun";
  emblem: string; // emoji shown as element badge
}

export const RARITY_META: Record<
  Rarity,
  { label: string; color: string; glow: string; stars: number; order: number }
> = {
  comun: { label: "Común", color: "#9aa6c4", glow: "rgba(154,166,196,0.45)", stars: 1, order: 0 },
  raro: { label: "Raro", color: "#41b6ff", glow: "rgba(65,182,255,0.55)", stars: 2, order: 1 },
  epico: { label: "Épico", color: "#c061ff", glow: "rgba(192,97,255,0.6)", stars: 3, order: 2 },
  legendario: { label: "Legendario", color: "#ffb020", glow: "rgba(255,176,32,0.65)", stars: 4, order: 3 },
};

export const MAX_LEVEL = 10;

// power gained per level = basePower * 0.35, rounded
export function cardPower(card: CardDef, level: number): number {
  return Math.round(card.basePower + card.basePower * 0.35 * (level - 1));
}

// cost to go from current level -> next level
export function levelUpCost(card: CardDef, level: number): number {
  return Math.round(card.cost * 0.35 * level);
}

export const CARDS: CardDef[] = [
  {
    id: "kael", name: "Kael", title: "Ninja de Sombras", element: "Sombra", rarity: "comun",
    cost: 80, basePower: 12, hair: "#3a3a55", hair2: "#26263d", skin: "#f3cba8",
    eye: "#8a6bff", aura: "#7b6bff", hairStyle: "spiky", emblem: "🌑",
  },
  {
    id: "rin", name: "Rin", title: "Aprendiz de Fuego", element: "Fuego", rarity: "comun",
    cost: 80, basePower: 12, hair: "#ff7a3c", hair2: "#e0531c", skin: "#ffd9b0",
    eye: "#ff5a2c", aura: "#ff7a3c", hairStyle: "short", emblem: "🔥",
  },
  {
    id: "goro", name: "Goro", title: "Guardián de Acero", element: "Tierra", rarity: "comun",
    cost: 80, basePower: 12, hair: "#5a5a6a", hair2: "#3f3f4d", skin: "#e8b98c",
    eye: "#888", aura: "#9aa6c4", hairStyle: "short", emblem: "🛡️",
  },
  {
    id: "yuki", name: "Yuki", title: "Maga de Hielo", element: "Hielo", rarity: "raro",
    cost: 220, basePower: 28, hair: "#bfe9ff", hair2: "#8fcdf0", skin: "#fceee4",
    eye: "#3fb6ff", aura: "#5fd0ff", hairStyle: "long", emblem: "❄️",
  },
  {
    id: "taro", name: "Taro", title: "Espada del Viento", element: "Viento", rarity: "raro",
    cost: 220, basePower: 28, hair: "#4ad17e", hair2: "#2fa85f", skin: "#f3cba8",
    eye: "#2fd97a", aura: "#4ad17e", hairStyle: "ponytail", emblem: "🍃",
  },
  {
    id: "hana", name: "Hana", title: "Sacerdotisa Floral", element: "Flor", rarity: "raro",
    cost: 220, basePower: 28, hair: "#ff8fc4", hair2: "#f06aa6", skin: "#fde6dc",
    eye: "#ff5fa8", aura: "#ff8fc4", hairStyle: "bun", emblem: "🌸",
  },
  {
    id: "akira", name: "Akira", title: "Caballero del Trueno", element: "Rayo", rarity: "epico",
    cost: 480, basePower: 55, hair: "#ffe14d", hair2: "#ffc01f", skin: "#f7cda3",
    eye: "#ffd000", aura: "#ffe14d", hairStyle: "spiky", emblem: "⚡",
  },
  {
    id: "sora", name: "Sora", title: "Guardiana Celestial", element: "Luz", rarity: "epico",
    cost: 480, basePower: 55, hair: "#bcd4ff", hair2: "#8fb0f5", skin: "#fdeee6",
    eye: "#6aa8ff", aura: "#9ec5ff", hairStyle: "long", emblem: "✨",
  },
  {
    id: "zen", name: "Zen", title: "Monje del Vacío", element: "Vacío", rarity: "epico",
    cost: 480, basePower: 55, hair: "#b07bff", hair2: "#8a4dff", skin: "#ecc8a8",
    eye: "#c061ff", aura: "#b07bff", hairStyle: "short", emblem: "🔮",
  },
  {
    id: "ryu", name: "Ryu", title: "Dragón Carmesí", element: "Dragón", rarity: "legendario",
    cost: 950, basePower: 110, hair: "#ff3b3b", hair2: "#c41818", skin: "#f5c69a",
    eye: "#ffd000", aura: "#ff3b3b", hairStyle: "spiky", emblem: "🐉",
  },
  {
    id: "mei", name: "Mei", title: "Espíritu Lunar", element: "Luna", rarity: "legendario",
    cost: 950, basePower: 110, hair: "#d6dcff", hair2: "#9aa6e8", skin: "#fdeee6",
    eye: "#8f7bff", aura: "#c0c8ff", hairStyle: "ponytail", emblem: "🌙",
  },
  {
    id: "aiko", name: "Aiko", title: "Emperatriz Estelar", element: "Estrella", rarity: "legendario",
    cost: 950, basePower: 110, hair: "#ffd24d", hair2: "#e6a800", skin: "#fde2cf",
    eye: "#c061ff", aura: "#ffd24d", hairStyle: "bun", emblem: "👑",
  },
];

export function getCard(id: string): CardDef | undefined {
  return CARDS.find((c) => c.id === id);
}
