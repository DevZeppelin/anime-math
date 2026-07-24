import type { Difficulty, LevelDef, MapPoint, Question } from "../types";
import { pick, pickEmojiMC, sample, session, shuffle } from "./utils";

// ─────────────────────────────────────────────────────────────
// GEOGRAFÍA Y CULTURAS DEL MUNDO — materia nueva, 8 niveles.
// Banderas, animales, comidas, monumentos y datos del planeta:
// un tema clásico en los currículos de primaria de todo el mundo
// y perfecto para el modo visual de "Pequeños" (¡las banderas
// YA son puras imágenes!).
//   facil (Menores de 5)  → identifica banderas, animales,
//                           comidas y monumentos por su imagen.
//   normal / dificil       → capitales, continentes y datos
//                           curiosos del mundo.
// ─────────────────────────────────────────────────────────────

type D = Difficulty;
type MC = [prompt: string, answer: string, distractors: string[], visual?: string, explain?: string];

function buildMC(bank: MC[], d: D, take = 10): Question[] {
  const allAnswers = bank.map((m) => m[1]);
  const qs: Question[] = bank.map(([prompt, answer, wrong, visual, explain]) => {
    let options = [answer, ...wrong];
    if (d === "dificil") {
      const extra = shuffle(allAnswers.filter((a) => !options.includes(a))).slice(0, 2);
      options = [...options, ...extra];
    }
    return { kind: "mc" as const, prompt, visual, options: shuffle(options), answer, explain };
  });
  return session(sample(qs, Math.min(take + 2, qs.length)));
}

// ── banderas ────────────────────────────────────────────────

const FLAGS: [string, string][] = [
  ["Argentina", "🇦🇷"], ["Brasil", "🇧🇷"], ["México", "🇲🇽"], ["España", "🇪🇸"],
  ["Estados Unidos", "🇺🇸"], ["Francia", "🇫🇷"], ["Italia", "🇮🇹"], ["Japón", "🇯🇵"],
  ["China", "🇨🇳"], ["Canadá", "🇨🇦"], ["Alemania", "🇩🇪"], ["Reino Unido", "🇬🇧"],
  ["Colombia", "🇨🇴"], ["Chile", "🇨🇱"], ["Perú", "🇵🇪"], ["Egipto", "🇪🇬"],
  ["India", "🇮🇳"], ["Australia", "🇦🇺"], ["Corea del Sur", "🇰🇷"], ["Rusia", "🇷🇺"],
];

const FLAG_MC: MC[] = FLAGS.map(([country, flag]) => [
  `¿Cuál es la bandera de ${country}?`,
  flag,
  sample(
    FLAGS.filter((f) => f[1] !== flag).map((f) => f[1]),
    3
  ),
]);

// ── animales del mundo ──────────────────────────────────────

const ANIMAL_REGION: [string, string][] = [
  ["el canguro", "🦘"], ["el panda", "🐼"], ["el pingüino", "🐧"], ["el león", "🦁"],
  ["la llama", "🦙"], ["el oso polar", "🐻‍❄️"], ["el koala", "🐨"], ["el elefante", "🐘"],
  ["el camello", "🐫"], ["el jaguar", "🐆"], ["el tigre", "🐯"], ["el flamenco", "🦩"],
];

const ANIMAL_REGION_MC: MC[] = [
  ["¿Dónde vive el canguro en estado salvaje?", "Oceanía (Australia)", ["América", "Europa", "Antártida"], "🦘"],
  ["¿Dónde vive el panda en estado salvaje?", "Asia (China)", ["África", "Oceanía", "América"], "🐼"],
  ["¿Dónde viven los pingüinos emperador?", "La Antártida", ["El desierto del Sahara", "La selva amazónica", "Los Alpes"], "🐧"],
  ["¿Dónde vive el león en estado salvaje?", "África", ["Europa", "Oceanía", "Antártida"], "🦁"],
  ["¿Dónde vive la llama en estado salvaje?", "Sudamérica (los Andes)", ["África", "Asia", "Europa"], "🦙"],
  ["¿Dónde vive el oso polar?", "El Ártico (Polo Norte)", ["El desierto", "La selva", "La Antártida"], "🐻‍❄️"],
  ["¿Dónde vive el koala en estado salvaje?", "Australia", ["Asia", "África", "América"], "🐨"],
  ["¿Dónde vive el camello del desierto?", "África y Medio Oriente", ["La Antártida", "Europa", "Oceanía"], "🐫"],
  ["¿Cuál es el animal más grande de la sabana africana?", "El elefante", ["El koala", "El pingüino", "La llama"], "🐘"],
  ["¿Qué animal tiene rayas y vive en Asia?", "El tigre", ["El león", "El panda", "El koala"], "🐯"],
];

// ── comidas del mundo ───────────────────────────────────────

const FOOD_COUNTRY: [string, string, string][] = [
  ["Italia", "🍕", "la pizza"], ["México", "🌮", "el taco"], ["Japón", "🍣", "el sushi"],
  ["Francia", "🥐", "el croissant"], ["Argentina", "🥩", "el asado"], ["India", "🍛", "el curry"],
  ["China", "🥢", "los fideos"], ["Alemania", "🥨", "el pretzel"],
];
const FOOD_MC: MC[] = FOOD_COUNTRY.map(([country, emoji, name]) => [
  `¿De qué país es típico ${name}?`,
  country,
  sample(
    FOOD_COUNTRY.filter((f) => f[0] !== country).map((f) => f[0]),
    3
  ),
  emoji,
]);

// ── monumentos ──────────────────────────────────────────────

const LANDMARKS: [string, string][] = [
  ["la Torre Eiffel", "🗼"], ["la Estatua de la Libertad", "🗽"], ["un templo japonés", "⛩️"],
  ["un castillo", "🏰"], ["una mezquita", "🕌"], ["un volcán", "🌋"], ["una pirámide", "🔺"],
];
const LANDMARK_MC: MC[] = [
  ["¿En qué país está la Torre Eiffel?", "Francia", ["Italia", "España", "Alemania"], "🗼"],
  ["¿En qué país está la Estatua de la Libertad?", "Estados Unidos", ["Canadá", "México", "Brasil"], "🗽"],
  ["¿En qué país están las grandes pirámides?", "Egipto", ["India", "China", "Perú"], "🔺"],
  ["¿En qué país está el Coliseo Romano?", "Italia", ["Grecia", "España", "Francia"], "🏛️"],
  ["¿En qué país está la Gran Muralla?", "China", ["Japón", "Corea del Sur", "India"], "🧱"],
  ["¿En qué país está el Monte Fuji?", "Japón", ["China", "Corea del Sur", "Tailandia"], "🗻"],
  ["¿En qué ciudadela inca está Machu Picchu?", "Perú", ["Chile", "Bolivia", "Ecuador"], "🏔️"],
  ["¿En qué país está el Big Ben?", "Reino Unido", ["Francia", "Alemania", "Irlanda"], "🕰️"],
];

// ── océanos, continentes y biomas ────────────────────────────

const HABITAT_VISUAL: [string, string][] = [
  ["el océano", "🌊"], ["el desierto", "🏜️"], ["la montaña", "⛰️"], ["la selva", "🌴"],
];
const GEO_FACTS_MC: MC[] = [
  ["¿Cuántos continentes hay en el mundo?", "6", ["4", "10", "3"], "🌍", "América, Europa, África, Asia, Oceanía y la Antártida."],
  ["¿Cuál es el océano más grande?", "El Pacífico", ["El Atlántico", "El Índico", "El Ártico"], "🌊"],
  ["¿Cuál es el continente más grande?", "Asia", ["África", "América", "Europa"], "🗺️"],
  ["¿Cuál es el desierto más grande y caliente del mundo?", "El Sahara", ["El desierto de Atacama", "El desierto de Gobi", "El Ártico"], "🏜️"],
  ["¿Cuál es la selva tropical más grande del mundo?", "La Amazonía", ["La Selva Negra", "El Bosque de Sherwood", "La selva de Borneo"], "🌴"],
  ["¿Cuál es el río más largo del mundo?", "El Nilo", ["El Amazonas", "El Misisipi", "El Danubio"], "🏞️", "El Nilo y el Amazonas compiten por este título, según cómo se mida."],
  ["¿Cuál es la montaña más alta del mundo?", "El Monte Everest", ["El Aconcagua", "El Kilimanjaro", "El Fuji"], "🏔️"],
  ["¿En qué continente está el desierto del Sahara?", "África", ["Asia", "Oceanía", "América"], "🏜️"],
  ["¿Cuál es el país más grande del mundo por territorio?", "Rusia", ["China", "Canadá", "Brasil"], "🗺️"],
  ["¿Cuál es el país con más habitantes del mundo?", "India", ["Estados Unidos", "Rusia", "Brasil"], "🌏"],
];

// ── mapa del mundo: tocar el lugar correcto ────────────────────
// Coordenadas equirectangulares aproximadas (viewBox 1000×500 de
// WorldMap.tsx): x = (longitud+180)/360×1000, y = (90−latitud)/180×500.
// Reutiliza los mismos 20 países de FLAGS para que lo aprendido
// ahí (bandera ↔ país) se conecte con "¿y dónde está en el mapa?".

const WORLD_POINTS: MapPoint[] = [
  { id: "Argentina", label: "Argentina", x: 322, y: 344 },
  { id: "Brasil", label: "Brasil", x: 347, y: 278 },
  { id: "México", label: "México", x: 217, y: 186 },
  { id: "España", label: "España", x: 489, y: 139 },
  { id: "Estados Unidos", label: "Estados Unidos", x: 228, y: 142 },
  { id: "Francia", label: "Francia", x: 506, y: 122 },
  { id: "Italia", label: "Italia", x: 533, y: 131 },
  { id: "Japón", label: "Japón", x: 883, y: 150 },
  { id: "China", label: "China", x: 786, y: 153 },
  { id: "Canadá", label: "Canadá", x: 206, y: 94 },
  { id: "Alemania", label: "Alemania", x: 528, y: 108 },
  { id: "Reino Unido", label: "Reino Unido", x: 494, y: 100 },
  { id: "Colombia", label: "Colombia", x: 300, y: 239 },
  { id: "Chile", label: "Chile", x: 303, y: 347 },
  { id: "Perú", label: "Perú", x: 289, y: 278 },
  { id: "Egipto", label: "Egipto", x: 583, y: 175 },
  { id: "India", label: "India", x: 717, y: 192 },
  { id: "Australia", label: "Australia", x: 875, y: 319 },
  { id: "Corea del Sur", label: "Corea del Sur", x: 856, y: 150 },
  { id: "Rusia", label: "Rusia", x: 606, y: 94 },
];

const CONTINENT_POINTS: MapPoint[] = [
  { id: "namerica", label: "América del Norte", x: 190, y: 130 },
  { id: "samerica", label: "América del Sur", x: 300, y: 320 },
  { id: "europe", label: "Europa", x: 515, y: 115 },
  { id: "africa", label: "África", x: 545, y: 240 },
  { id: "asia", label: "Asia", x: 760, y: 130 },
  { id: "oceania", label: "Oceanía", x: 870, y: 320 },
];

function qContinentMap(): Question {
  const target = pick(CONTINENT_POINTS);
  return {
    kind: "map",
    prompt: `Toca ${target.label} en el mapa`,
    points: CONTINENT_POINTS,
    answer: target.id,
    big: true,
  };
}

function qCountryMap(d: D): Question {
  const target = pick(WORLD_POINTS);
  const howMany = d === "dificil" ? 6 : 4;
  const distractors = sample(
    WORLD_POINTS.filter((p) => p.id !== target.id),
    howMany - 1
  );
  return {
    kind: "map",
    prompt: `Toca ${target.label} en el mapa`,
    points: shuffle([target, ...distractors]),
    answer: target.id,
  };
}

function genWorldMap(d: D): Question[] {
  if (d === "facil") return session(Array.from({ length: 8 }, qContinentMap));
  return session(Array.from({ length: 10 }, () => qCountryMap(d)));
}

// ── generadores ──────────────────────────────────────────────

function genFlags(d: D): Question[] {
  if (d === "facil") {
    return session(Array.from({ length: 10 }, () => pickEmojiMC(FLAGS, (name) => `¿Cuál es la bandera de ${name}?`)));
  }
  return buildMC(FLAG_MC, d, 10);
}

function genAnimals(d: D): Question[] {
  if (d === "facil") {
    return session(Array.from({ length: 10 }, () => pickEmojiMC(ANIMAL_REGION, (name) => `¿Cuál es ${name}?`)));
  }
  return buildMC(ANIMAL_REGION_MC, d);
}

function genFood(d: D): Question[] {
  if (d === "facil") {
    const bank: [string, string][] = FOOD_COUNTRY.map(([, emoji, name]) => [name, emoji]);
    return session(Array.from({ length: 10 }, () => pickEmojiMC(bank, (name) => `¿Cuál es ${name}?`)));
  }
  return buildMC(FOOD_MC, d, FOOD_MC.length);
}

function genLandmarks(d: D): Question[] {
  if (d === "facil") {
    return session(Array.from({ length: 10 }, () => pickEmojiMC(LANDMARKS, (name) => `¿Cuál es ${name}?`)));
  }
  return buildMC(LANDMARK_MC, d, LANDMARK_MC.length);
}

function genHabitats(d: D): Question[] {
  if (d === "facil") {
    return session(Array.from({ length: 10 }, () => pickEmojiMC(HABITAT_VISUAL, (name) => `¿Cuál es ${name}?`)));
  }
  return buildMC(GEO_FACTS_MC, d);
}

export const GEOGRAPHY_LEVELS: LevelDef[] = [
  { name: "Banderas del Mundo", emoji: "🚩", desc: "Reconoce banderas de todo el planeta", tier: 1, gen: genFlags },
  { name: "Animales del Mundo", emoji: "🦘", desc: "¿Dónde vive cada animal salvaje?", tier: 1, gen: genAnimals },
  { name: "Sabores del Mundo", emoji: "🍕", desc: "Comidas típicas de cada país", tier: 1, gen: genFood },
  { name: "Monumentos Famosos", emoji: "🗼", desc: "Los lugares más famosos del planeta", tier: 2, gen: genLandmarks },
  { name: "Mapa del Mundo", emoji: "🗺️", desc: "Toca el país o continente correcto en el mapa", tier: 2, gen: genWorldMap },
  { name: "Tierra, Mar y Selva", emoji: "🌊", desc: "Océanos, desiertos, montañas y selvas", tier: 2, gen: genHabitats },
  { name: "Continentes y Océanos", emoji: "🗺️", desc: "Los datos más grandes del planeta", tier: 3, gen: genHabitats },
  { name: "Datos Curiosos del Mundo", emoji: "🌏", desc: "Países, ríos y montañas increíbles", tier: 3, gen: (d) => (d === "facil" ? genLandmarks(d) : buildMC(GEO_FACTS_MC, d)) },
];
