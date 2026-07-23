import type { AbilityDef, ItemDef } from "./types";

// ─────────────────────────────────────────────────────────────
// Catálogo de ítems: todo lo que el personaje puede equipar.
// variant + c1/c2/c3 los interpreta Avatar.tsx para dibujar.
// ─────────────────────────────────────────────────────────────

export const OUTFITS: ItemDef[] = [
  { id: "out_school", type: "outfit", name: "Uniforme de la Academia", emoji: "🎒", rarity: "comun", price: 0, desc: "El seifuku clásico de todo protagonista.", variant: "seifuku", c1: "#3d5a99", c2: "#2b3f6b", c3: "#ffd24d" },
  { id: "out_explorer", type: "outfit", name: "Traje de Explorador", emoji: "🧭", rarity: "comun", price: 150, desc: "Para descubrir mundos nuevos.", variant: "suit", c1: "#8a6d3b", c2: "#5d4a28", c3: "#e8d9a0" },
  { id: "out_chef", type: "outfit", name: "Chef Estrella", emoji: "🍳", rarity: "comun", price: 150, desc: "¡La receta del éxito!", variant: "suit", c1: "#f5f5f5", c2: "#d8d8d8", c3: "#ff5a5a" },
  { id: "out_sport", type: "outfit", name: "Equipo Deportivo", emoji: "⚽", rarity: "comun", price: 150, desc: "Velocidad y energía.", variant: "sport", c1: "#2fd97a", c2: "#1da75c", c3: "#ffffff" },
  { id: "out_doctor", type: "outfit", name: "Bata de Doctor", emoji: "🩺", rarity: "raro", price: 320, desc: "Cura con conocimiento.", variant: "suit", c1: "#eaf6ff", c2: "#bcd9ee", c3: "#41b6ff" },
  { id: "out_pirate", type: "outfit", name: "Traje Pirata", emoji: "🏴‍☠️", rarity: "raro", price: 380, desc: "En busca del tesoro del saber.", variant: "suit", c1: "#7a2f2f", c2: "#4d1d1d", c3: "#ffd24d" },
  { id: "out_kimono_sakura", type: "outfit", name: "Kimono Sakura", emoji: "🌸", rarity: "raro", price: 420, desc: "Pétalos de cerezo bailan en la seda.", variant: "kimono", c1: "#ffb3cf", c2: "#e0679a", c3: "#8a3b5c", motif: "sakura" },
  { id: "out_kimono_wave", type: "outfit", name: "Kimono Olas del Mar", emoji: "🌊", rarity: "raro", price: 420, desc: "Olas seigaiha del Japón antiguo.", variant: "kimono", c1: "#3d6fb8", c2: "#274a85", c3: "#e8d9a0", motif: "olas" },
  { id: "out_ninja", type: "outfit", name: "Shinobi Nocturno", emoji: "🥷", rarity: "raro", price: 450, desc: "Silencioso como una sombra.", variant: "shinobi", c1: "#33334d", c2: "#1f1f33", c3: "#8b5cff" },
  { id: "out_mage", type: "outfit", name: "Túnica de Mago", emoji: "🔮", rarity: "raro", price: 450, desc: "Tejida con hilos de estrellas.", variant: "robe", c1: "#5d3fd3", c2: "#3d2a8f", c3: "#ffd24d" },
  { id: "out_princess", type: "outfit", name: "Vestido Real", emoji: "👗", rarity: "epico", price: 700, desc: "Elegancia de la realeza.", variant: "dress", c1: "#ff8fc4", c2: "#e0559a", c3: "#fff0b3" },
  { id: "out_astronaut", type: "outfit", name: "Traje Espacial", emoji: "🚀", rarity: "epico", price: 780, desc: "Listo para tocar las estrellas.", variant: "suit", c1: "#e8ecf5", c2: "#b8c2d8", c3: "#ff7a3c" },
  { id: "out_kimono_dragon", type: "outfit", name: "Kimono del Dragón Dorado", emoji: "🐲", rarity: "epico", price: 850, desc: "Un dragón de oro serpentea en tinta negra.", variant: "kimono", c1: "#2b2b3d", c2: "#1a1a29", c3: "#ffd24d", motif: "dragon" },
  { id: "out_knight", type: "outfit", name: "Armadura de Caballero", emoji: "🛡️", rarity: "epico", price: 850, desc: "Forjada en las montañas de acero.", variant: "armor", c1: "#aeb8cc", c2: "#7c88a0", c3: "#ffd24d" },
  { id: "out_robot", type: "outfit", name: "Exotraje Robot", emoji: "🤖", rarity: "epico", price: 850, desc: "Tecnología del futuro.", variant: "armor", c1: "#4dd7e8", c2: "#2a9cb0", c3: "#f5f5f5" },
  { id: "out_dragon", type: "outfit", name: "Armadura de Dragón", emoji: "🐉", rarity: "legendario", price: 1500, desc: "Escamas de dragón carmesí.", variant: "armor", c1: "#ff3b3b", c2: "#a11414", c3: "#ffd24d" },
  { id: "out_kimono_moon", type: "outfit", name: "Kimono Luna de Medianoche", emoji: "🌙", rarity: "legendario", price: 1600, desc: "La luna y las estrellas cosidas en índigo.", variant: "kimono", c1: "#2d2d5e", c2: "#1c1c40", c3: "#f5e6b8", motif: "luna" },
  { id: "out_celestial", type: "outfit", name: "Túnica Celestial", emoji: "✨", rarity: "legendario", price: 0, gems: 25, desc: "Solo para leyendas de la academia.", variant: "robe", c1: "#bcd4ff", c2: "#7d9bf0", c3: "#fff6c9" },
];

export const WEAPONS: ItemDef[] = [
  { id: "wp_stick", type: "weapon", name: "Bokken de Madera", emoji: "🪵", rarity: "comun", price: 80, desc: "Todo samurái empieza entrenando.", variant: "stick", c1: "#a07040", c2: "#7a5028" },
  { id: "wp_book", type: "weapon", name: "Libro de Hechizos", emoji: "📖", rarity: "comun", price: 120, desc: "El conocimiento es poder.", variant: "book", c1: "#8b5cff", c2: "#ffd24d" },
  { id: "wp_kunai", type: "weapon", name: "Kunai Shinobi", emoji: "🗡️", rarity: "comun", price: 120, desc: "La herramienta secreta del ninja.", variant: "kunai", c1: "#9aa6bd", c2: "#33334d" },
  { id: "wp_wand", type: "weapon", name: "Varita Mágica", emoji: "🪄", rarity: "raro", price: 300, desc: "Chispas de pura imaginación.", variant: "wand", c1: "#6b4b8a", c2: "#ffd24d" },
  { id: "wp_bow", type: "weapon", name: "Arco Élfico", emoji: "🏹", rarity: "raro", price: 340, desc: "Ligero como el viento.", variant: "bow", c1: "#4ad17e", c2: "#e8d9a0" },
  { id: "wp_katana_sakura", type: "weapon", name: "Katana Pétalo", emoji: "🌸", rarity: "raro", price: 380, desc: "Cada corte suelta pétalos de cerezo.", variant: "katana", c1: "#ffd9e8", c2: "#c96a92", motif: "petalos" },
  { id: "wp_sword", type: "weapon", name: "Espada Valiente", emoji: "⚔️", rarity: "raro", price: 380, desc: "Brilla ante los desafíos.", variant: "sword", c1: "#c8d2e0", c2: "#ffd24d" },
  { id: "wp_guitar", type: "weapon", name: "Guitarra Rockera", emoji: "🎸", rarity: "epico", price: 650, desc: "El poder de la música.", variant: "guitar", c1: "#ff5a5a", c2: "#33334d" },
  { id: "wp_staff", type: "weapon", name: "Báculo Arcano", emoji: "🔯", rarity: "epico", price: 700, desc: "Late con energía antigua.", variant: "staff", c1: "#5d3fd3", c2: "#4dd7e8" },
  { id: "wp_katana", type: "weapon", name: "Katana de Luna", emoji: "🌙", rarity: "epico", price: 750, desc: "Afilada como un rayo de luna.", variant: "katana", c1: "#e8ecff", c2: "#8f7bff", motif: "luna" },
  { id: "wp_katana_fire", type: "weapon", name: "Katana Llama Carmesí", emoji: "🔥", rarity: "epico", price: 800, desc: "Su filo arde sin quemar a su dueño.", variant: "katana", c1: "#ffd9a8", c2: "#c2372e", motif: "llama" },
  { id: "wp_trident", type: "weapon", name: "Tridente Marino", emoji: "🔱", rarity: "legendario", price: 1400, desc: "El poder de los océanos.", variant: "trident", c1: "#4dd7e8", c2: "#ffd24d" },
  { id: "wp_katana_shadow", type: "weapon", name: "Katana de las Sombras", emoji: "🌑", rarity: "legendario", price: 1500, desc: "Forjada en un eclipse. Susurra secretos.", variant: "katana", c1: "#c3b6ff", c2: "#3d3358", motif: "sombra" },
  { id: "wp_excalibur", type: "weapon", name: "Excálibur Dorada", emoji: "✨", rarity: "legendario", price: 0, gems: 20, desc: "La espada de los grandes sabios.", variant: "sword", c1: "#ffd24d", c2: "#ff9d2e" },
];

export const ACCESSORIES: ItemDef[] = [
  { id: "ac_glasses", type: "accessory", name: "Gafas de Genio", emoji: "👓", rarity: "comun", price: 100, desc: "+100 de estilo intelectual.", variant: "glasses", c1: "#33334d" },
  { id: "ac_scarf", type: "accessory", name: "Bufanda Cálida", emoji: "🧣", rarity: "comun", price: 100, desc: "Suave y acogedora.", variant: "scarf", c1: "#ff5a5a", c2: "#c93a3a" },
  { id: "ac_headband", type: "accessory", name: "Cinta Ninja", emoji: "🎽", rarity: "comun", price: 120, desc: "Determinación pura.", variant: "headband", c1: "#ff5a5a", c2: "#f5f5f5" },
  { id: "ac_cap", type: "accessory", name: "Gorra Deportiva", emoji: "🧢", rarity: "comun", price: 120, desc: "Para días de sol.", variant: "cap", c1: "#4d96ff", c2: "#2b6fd8" },
  { id: "ac_catears", type: "accessory", name: "Orejas de Neko", emoji: "🐱", rarity: "raro", price: 280, desc: "¡Nyan! Se mueven cuando piensas.", variant: "catears", c1: "#ff8fc4", c2: "#ffc7e0" },
  { id: "ac_kanzashi", type: "accessory", name: "Kanzashi de Sakura", emoji: "🌸", rarity: "raro", price: 300, desc: "Horquilla de flores con pétalos colgantes.", variant: "kanzashi", c1: "#ff8fc4", c2: "#ffd24d" },
  { id: "ac_wizardhat", type: "accessory", name: "Sombrero de Mago", emoji: "🎩", rarity: "raro", price: 320, desc: "Con estrellas bordadas.", variant: "wizardhat", c1: "#5d3fd3", c2: "#ffd24d" },
  { id: "ac_cape", type: "accessory", name: "Capa de Héroe", emoji: "🦸", rarity: "raro", price: 350, desc: "Ondea con el viento.", variant: "cape", c1: "#ff5a5a", c2: "#c93a3a" },
  { id: "ac_kitsune", type: "accessory", name: "Máscara Kitsune", emoji: "🦊", rarity: "epico", price: 650, desc: "La máscara del zorro de los festivales.", variant: "kitsune", c1: "#fff4f0", c2: "#e8433c" },
  { id: "ac_helmet", type: "accessory", name: "Casco Vikingo", emoji: "⛑️", rarity: "epico", price: 600, desc: "Con cuernos legendarios.", variant: "helmet", c1: "#aeb8cc", c2: "#e8d9a0" },
  { id: "ac_wings", type: "accessory", name: "Alas de Hada", emoji: "🧚", rarity: "epico", price: 700, desc: "Brillan con polvo mágico.", variant: "wings", c1: "#bfe9ff", c2: "#e0c9ff" },
  { id: "ac_halo", type: "accessory", name: "Halo Dorado", emoji: "😇", rarity: "epico", price: 700, desc: "Un aro de pura luz.", variant: "halo", c1: "#ffd24d" },
  { id: "ac_crown", type: "accessory", name: "Corona Real", emoji: "👑", rarity: "legendario", price: 1300, desc: "Digna de la realeza del saber.", variant: "crown", c1: "#ffd24d", c2: "#ff5a5a" },
  { id: "ac_dragonhorns", type: "accessory", name: "Cuernos de Dragón", emoji: "🐲", rarity: "legendario", price: 0, gems: 18, desc: "Rugen con poder ancestral.", variant: "dragonhorns", c1: "#ff3b3b", c2: "#a11414" },
];

export const PETS: ItemDef[] = [
  { id: "pet_chick", type: "pet", name: "Pollito Pío", emoji: "🐤", rarity: "comun", price: 150, desc: "Pequeño pero valiente." },
  { id: "pet_cat", type: "pet", name: "Gato Misu", emoji: "🐱", rarity: "comun", price: 180, desc: "Duerme en tus apuntes." },
  { id: "pet_dog", type: "pet", name: "Perrito Kiba", emoji: "🐶", rarity: "comun", price: 180, desc: "Tu fan número uno." },
  { id: "pet_owl", type: "pet", name: "Búho Sabio", emoji: "🦉", rarity: "raro", price: 400, desc: "Conoce todas las respuestas." },
  { id: "pet_fox", type: "pet", name: "Zorro Kitsune", emoji: "🦊", rarity: "raro", price: 450, desc: "Astuto y leal." },
  { id: "pet_penguin", type: "pet", name: "Pingüino Polar", emoji: "🐧", rarity: "raro", price: 450, desc: "Elegante con su esmoquin." },
  { id: "pet_robot", type: "pet", name: "Robo-Chip", emoji: "🤖", rarity: "epico", price: 800, desc: "Beep boop: calculando amistad." },
  { id: "pet_unicorn", type: "pet", name: "Unicornio Iris", emoji: "🦄", rarity: "epico", price: 900, desc: "Deja arcoíris al caminar." },
  { id: "pet_dragon", type: "pet", name: "Dragón Fuku", emoji: "🐉", rarity: "legendario", price: 1600, desc: "Un dragón bebé de bolsillo." },
  { id: "pet_phoenix", type: "pet", name: "Fénix Estelar", emoji: "🐦‍🔥", rarity: "legendario", price: 0, gems: 22, desc: "Renace con cada desafío." },
];

export const AURAS: ItemDef[] = [
  { id: "au_spark", type: "aura", name: "Chispas", emoji: "✨", rarity: "comun", price: 200, desc: "Pequeños destellos.", c1: "#ffd24d" },
  { id: "au_leaf", type: "aura", name: "Brisa de Hojas", emoji: "🍃", rarity: "raro", price: 420, desc: "Naturaleza en calma.", c1: "#4ad17e" },
  { id: "au_frost", type: "aura", name: "Escarcha", emoji: "❄️", rarity: "raro", price: 420, desc: "Frío brillante.", c1: "#5fd0ff" },
  { id: "au_flame", type: "aura", name: "Llama Interior", emoji: "🔥", rarity: "epico", price: 750, desc: "Arde con pasión.", c1: "#ff7a3c" },
  { id: "au_thunder", type: "aura", name: "Tormenta", emoji: "⚡", rarity: "epico", price: 750, desc: "Energía crepitante.", c1: "#ffe14d" },
  { id: "au_shadow", type: "aura", name: "Sombra Violeta", emoji: "🌑", rarity: "epico", price: 800, desc: "Misterio profundo.", c1: "#8b5cff" },
  { id: "au_galaxy", type: "aura", name: "Galaxia", emoji: "🌌", rarity: "legendario", price: 1500, desc: "Un universo te rodea.", c1: "#7d9bf0" },
  { id: "au_rainbow", type: "aura", name: "Prisma Arcoíris", emoji: "🌈", rarity: "legendario", price: 0, gems: 15, desc: "Todos los colores a la vez.", c1: "#ff8fc4" },
];

export const BACKGROUNDS: ItemDef[] = [
  { id: "bg_meadow", type: "background", name: "Pradera", emoji: "🌿", rarity: "comun", price: 150, desc: "Verde y tranquila.", c1: "#8fd694", c2: "#bfe9ff" },
  { id: "bg_beach", type: "background", name: "Playa Soleada", emoji: "🏖️", rarity: "comun", price: 180, desc: "Arena y olas.", c1: "#ffe9b3", c2: "#7fd8f0" },
  { id: "bg_city", type: "background", name: "Ciudad Neón", emoji: "🌃", rarity: "raro", price: 400, desc: "Luces de medianoche.", c1: "#2b2b4d", c2: "#ff5cc8" },
  { id: "bg_forest", type: "background", name: "Bosque Místico", emoji: "🌲", rarity: "raro", price: 400, desc: "Árboles milenarios.", c1: "#1f4d33", c2: "#4ad17e" },
  { id: "bg_volcano", type: "background", name: "Volcán", emoji: "🌋", rarity: "epico", price: 720, desc: "Tierra de fuego.", c1: "#4d1d1d", c2: "#ff7a3c" },
  { id: "bg_castle", type: "background", name: "Castillo Real", emoji: "🏰", rarity: "epico", price: 780, desc: "Torres entre nubes.", c1: "#8fb0f5", c2: "#e0d5f5" },
  { id: "bg_space", type: "background", name: "Espacio Profundo", emoji: "🪐", rarity: "legendario", price: 1400, desc: "Planetas y estrellas.", c1: "#0c0c28", c2: "#8b5cff" },
  { id: "bg_aurora", type: "background", name: "Aurora Boreal", emoji: "🌌", rarity: "legendario", price: 0, gems: 15, desc: "El cielo baila para ti.", c1: "#0f2440", c2: "#3df09a" },
];

export const ALL_ITEMS: ItemDef[] = [
  ...OUTFITS,
  ...WEAPONS,
  ...ACCESSORIES,
  ...PETS,
  ...AURAS,
  ...BACKGROUNDS,
];

const ITEM_MAP = new Map(ALL_ITEMS.map((i) => [i.id, i]));

export function getItem(id: string | null | undefined): ItemDef | undefined {
  return id ? ITEM_MAP.get(id) : undefined;
}

export const ITEM_TYPE_META: Record<ItemDef["type"], { label: string; emoji: string }> = {
  outfit: { label: "Trajes", emoji: "👕" },
  weapon: { label: "Armas y herramientas", emoji: "⚔️" },
  accessory: { label: "Accesorios", emoji: "🎩" },
  pet: { label: "Mascotas", emoji: "🐾" },
  aura: { label: "Auras", emoji: "✨" },
  background: { label: "Fondos", emoji: "🖼️" },
};

// ── Habilidades pasivas (se compran con gemas) ───────────────

export const ABILITIES: AbilityDef[] = [
  { id: "ab_coins", name: "Toque de Oro", emoji: "🪙", desc: "+25% de monedas en cada lección.", gems: 6 },
  { id: "ab_xp", name: "Mente Brillante", emoji: "🧠", desc: "+25% de experiencia en cada lección.", gems: 6 },
  { id: "ab_time", name: "Reloj de Arena", emoji: "⏳", desc: "+8 segundos de tiempo por pregunta.", gems: 8 },
  { id: "ab_shield", name: "Escudo Protector", emoji: "🛡️", desc: "Un corazón extra en cada lección.", gems: 10 },
  { id: "ab_hint", name: "Ojo de Águila", emoji: "🦅", desc: "Una pista 50/50 por lección (elimina 2 opciones).", gems: 10 },
  { id: "ab_lucky", name: "Trébol Mágico", emoji: "🍀", desc: "A veces las respuestas correctas dan monedas dobles.", gems: 12 },
];

export function getAbility(id: string): AbilityDef | undefined {
  return ABILITIES.find((a) => a.id === id);
}

// ── Opciones gratuitas del creador de personaje ──────────────

export const SKIN_TONES = [
  "#ffe4cc", "#ffe0c4", "#f3cba8", "#e8b98c", "#d9a06b",
  "#c98d5f", "#b07a4d", "#a06a42", "#8a5a36", "#7a4b2a",
];

export const HAIR_COLORS = [
  "#1e1e2e", "#3a3a55", "#6b4226", "#8b4a2b", "#a07040", "#e8c46b",
  "#fff2cc", "#ff7a3c", "#c93a3a", "#e8556d", "#ff8fc4", "#c9b6ff",
  "#8b5cff", "#4d96ff", "#4ad17e", "#2fd9c8", "#bfe9ff", "#f5f5f5",
];

export const EYE_COLORS = [
  "#4a3728", "#7a5230", "#2b6fd8", "#41b6ff", "#2fa85f", "#8b5cff",
  "#ff5a6e", "#ff9d2e", "#25c9d0", "#666677",
];

export const HAIR_STYLES: { id: import("./types").HairStyle; label: string }[] = [
  { id: "spiky", label: "Puntas" },
  { id: "messy", label: "Despeinado" },
  { id: "bob", label: "Corto" },
  { id: "long", label: "Largo" },
  { id: "wavy", label: "Ondulado" },
  { id: "hime", label: "Princesa" },
  { id: "ponytail", label: "Coleta" },
  { id: "twintails", label: "Dos coletas" },
  { id: "braid", label: "Trenza" },
  { id: "buns", label: "Rodetes" },
  { id: "topknot", label: "Moño alto" },
  { id: "curly", label: "Rizado" },
  { id: "afro", label: "Afro" },
  { id: "mohawk", label: "Cresta" },
];

export const EYE_STYLES: { id: import("./types").EyeStyle; label: string; emoji: string }[] = [
  { id: "normal", label: "Normal", emoji: "👁️" },
  { id: "happy", label: "Feliz", emoji: "😊" },
  { id: "determined", label: "Decidido", emoji: "😤" },
  { id: "star", label: "Estrella", emoji: "🤩" },
  { id: "sleepy", label: "Tranquilo", emoji: "😌" },
];

export const MOUTH_STYLES: { id: import("./types").MouthStyle; label: string; emoji: string }[] = [
  { id: "smile", label: "Sonrisa", emoji: "🙂" },
  { id: "grin", label: "Risa", emoji: "😄" },
  { id: "cat", label: "Gatito", emoji: "😺" },
  { id: "neutral", label: "Serio", emoji: "😐" },
  { id: "smirk", label: "Pícaro", emoji: "😏" },
];

export const FACE_MARKS: { id: import("./types").FaceMark; label: string; emoji: string }[] = [
  { id: "none", label: "Ninguna", emoji: "✖️" },
  { id: "freckles", label: "Pecas", emoji: "🟤" },
  { id: "blush", label: "Chapitas", emoji: "🍑" },
  { id: "scar", label: "Cicatriz", emoji: "⚡" },
  { id: "star", label: "Estrellita", emoji: "⭐" },
  { id: "heart", label: "Corazón", emoji: "💗" },
];
