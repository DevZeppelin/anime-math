import type { Difficulty, LevelDef, Question } from "../types";
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
  { name: "Más Banderas", emoji: "🌐", desc: "Sigue conociendo países y banderas", tier: 2, gen: genFlags },
  { name: "Tierra, Mar y Selva", emoji: "🌊", desc: "Océanos, desiertos, montañas y selvas", tier: 2, gen: genHabitats },
  { name: "Continentes y Océanos", emoji: "🗺️", desc: "Los datos más grandes del planeta", tier: 3, gen: genHabitats },
  { name: "Datos Curiosos del Mundo", emoji: "🌏", desc: "Países, ríos y montañas increíbles", tier: 3, gen: (d) => (d === "facil" ? genLandmarks(d) : buildMC(GEO_FACTS_MC, d)) },
];
