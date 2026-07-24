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
    if (d === "dificil" || d === "experto") {
      const extra = shuffle(allAnswers.filter((a) => !options.includes(a))).slice(0, d === "experto" ? 3 : 2);
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
  const howMany = d === "experto" ? 8 : d === "dificil" ? 6 : 4;
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
  if (d === "experto") return buildMC(FLAG_MC_EXPERTO, d, 10);
  return buildMC(FLAG_MC, d, 10);
}

function genAnimals(d: D): Question[] {
  if (d === "facil") {
    return session(Array.from({ length: 10 }, () => pickEmojiMC(ANIMAL_REGION, (name) => `¿Cuál es ${name}?`)));
  }
  if (d === "experto") return buildMC(ANIMAL_BIOGEO_EXPERTO_MC, d);
  return buildMC(ANIMAL_REGION_MC, d);
}

function genFood(d: D): Question[] {
  if (d === "facil") {
    const bank: [string, string][] = FOOD_COUNTRY.map(([, emoji, name]) => [name, emoji]);
    return session(Array.from({ length: 10 }, () => pickEmojiMC(bank, (name) => `¿Cuál es ${name}?`)));
  }
  if (d === "experto") return buildMC(FOOD_HISTORY_EXPERTO_MC, d, FOOD_HISTORY_EXPERTO_MC.length);
  return buildMC(FOOD_MC, d, FOOD_MC.length);
}

function genLandmarks(d: D): Question[] {
  if (d === "facil") {
    return session(Array.from({ length: 10 }, () => pickEmojiMC(LANDMARKS, (name) => `¿Cuál es ${name}?`)));
  }
  if (d === "experto") return buildMC(LANDMARK_HISTORY_EXPERTO_MC, d, LANDMARK_HISTORY_EXPERTO_MC.length);
  return buildMC(LANDMARK_MC, d, LANDMARK_MC.length);
}

function genHabitats(d: D): Question[] {
  if (d === "facil") {
    return session(Array.from({ length: 10 }, () => pickEmojiMC(HABITAT_VISUAL, (name) => `¿Cuál es ${name}?`)));
  }
  if (d === "experto") return buildMC(BIOME_EXPERTO_MC, d);
  return buildMC(GEO_FACTS_MC, d);
}

function genContinents(d: D): Question[] {
  if (d === "facil") {
    return session(Array.from({ length: 10 }, () => pickEmojiMC(HABITAT_VISUAL, (name) => `¿Cuál es ${name}?`)));
  }
  if (d === "experto") return buildMC(CONTINENT_STATS_EXPERTO_MC, d);
  return buildMC(GEO_FACTS_MC, d);
}

// ═════════════════════════════════════════════════════════════
// CONTENIDO DE "MAESTROS" (experto) — geografía real de adultos:
// capitales, geopolítica, biomas y estadísticas del planeta.
// ═════════════════════════════════════════════════════════════

const FLAGS_EXPERTO_EXTRA: [string, string][] = [
  ["Nigeria", "🇳🇬"], ["Kenia", "🇰🇪"], ["Turquía", "🇹🇷"], ["Tailandia", "🇹🇭"],
  ["Vietnam", "🇻🇳"], ["Polonia", "🇵🇱"], ["Suecia", "🇸🇪"], ["Países Bajos", "🇳🇱"],
  ["Suiza", "🇨🇭"], ["Grecia", "🇬🇷"], ["Portugal", "🇵🇹"], ["Arabia Saudita", "🇸🇦"],
  ["Indonesia", "🇮🇩"], ["Filipinas", "🇵🇭"], ["Nueva Zelanda", "🇳🇿"], ["Irlanda", "🇮🇪"],
  ["Marruecos", "🇲🇦"], ["Ucrania", "🇺🇦"], ["Noruega", "🇳🇴"], ["Israel", "🇮🇱"],
];
const FLAGS_EXPERTO: [string, string][] = [...FLAGS, ...FLAGS_EXPERTO_EXTRA];
const FLAG_MC_EXPERTO: MC[] = FLAGS_EXPERTO.map(([country, flag]) => [
  `¿Cuál es la bandera de ${country}?`,
  flag,
  sample(
    FLAGS_EXPERTO.filter((f) => f[1] !== flag).map((f) => f[1]),
    3
  ),
]);

const ANIMAL_BIOGEO_EXPERTO_MC: MC[] = [
  ["¿Qué significa que una especie sea ENDÉMICA de un lugar?", "Que solo se encuentra naturalmente ahí y en ningún otro lugar", ["Que está extinta", "Que vive en cautiverio únicamente", "Que migra todo el año"], "🦎"],
  ["¿Qué ave realiza la migración más larga conocida, del Ártico a la Antártida?", "El charrán ártico", ["El águila calva", "El pingüino emperador", "El cóndor andino"], "🐦"],
  ["¿Qué país tiene la mayor población de tigres salvajes del mundo?", "India", ["China", "Rusia", "Indonesia"], "🐯"],
  ["¿Qué animal protagoniza la gran migración terrestre del Serengueti en África?", "El ñu (wildebeest)", ["El elefante", "La cebra, siempre sola", "El león"], "🦬"],
  ["¿Qué evalúa la Lista Roja de la UICN?", "El riesgo de extinción de las especies del mundo", ["El precio de los animales exóticos", "La cantidad de zoológicos por país", "El peso promedio de cada especie"], "📋"],
  ["¿En qué isla africana vive el 90% de las especies de lémures del mundo?", "Madagascar", ["Islandia", "Sri Lanka", "Cuba"], "🐒"],
];

const FOOD_HISTORY_EXPERTO_MC: MC[] = [
  ["¿De qué continente es originaria la papa, antes de llegar a Europa?", "Sudamérica", ["Asia", "África", "Oceanía"], "🥔"],
  ["Las especias como la pimienta impulsaron gran parte de la exploración europea. ¿De dónde venían principalmente?", "Asia", ["América", "Oceanía", "La Antártida"], "🌶️"],
  ["¿De qué país es originario el kimchi?", "Corea del Sur", ["Japón", "China", "Vietnam"], "🥬"],
  ["¿En qué región se originó el café, antes de expandirse por el mundo?", "Etiopía (África)", ["Colombia", "Italia", "Brasil"], "☕"],
  ["¿De qué país es el plato 'pad thai'?", "Tailandia", ["Vietnam", "India", "Malasia"], "🍜"],
  ["¿De qué región de América es originario el cacao, ingrediente clave del chocolate?", "Mesoamérica", ["Los Andes", "El Caribe", "La Patagonia"], "🍫"],
];

const LANDMARK_HISTORY_EXPERTO_MC: MC[] = [
  ["¿Qué imperio construyó Machu Picchu?", "El Imperio Inca", ["El Imperio Azteca", "El Imperio Maya", "El Imperio Español"], "🏔️"],
  ["¿En qué país está Petra, la ciudad tallada en roca?", "Jordania", ["Egipto", "Israel", "Líbano"], "🏛️"],
  ["¿Qué organización reconoce sitios de gran valor como 'Patrimonio de la Humanidad'?", "La UNESCO", ["La ONU", "La OMS", "La OTAN"], "🏆"],
  ["¿En qué país está Stonehenge?", "Reino Unido", ["Irlanda", "Francia", "Alemania"], "🗿"],
  ["¿Qué faraón mandó construir la Gran Pirámide de Guiza?", "Keops", ["Tutankamón", "Ramsés II", "Cleopatra"], "🔺"],
  ["¿En qué país está el Taj Mahal?", "India", ["Pakistán", "Irán", "Emiratos Árabes Unidos"], "🕌"],
];

const BIOME_EXPERTO_MC: MC[] = [
  ["¿Qué bioma tiene el suelo permanentemente congelado (permafrost)?", "La tundra", ["La sabana", "La selva tropical", "El desierto"], "❄️"],
  ["¿Qué bioma tiene pastizales extensos con árboles dispersos, típico de África?", "La sabana", ["La taiga", "La tundra", "El manglar"], "🌾"],
  ["¿Cómo se llama el bosque de coníferas más grande del mundo, en Rusia y Canadá?", "La taiga", ["La sabana", "El chaparral", "La estepa"], "🌲"],
  ["¿Qué ecosistema marino, formado por organismos vivos, alberga gran biodiversidad?", "Los arrecifes de coral", ["Las fosas abisales", "Los icebergs", "Las mareas rojas"], "🪸"],
  ["¿Existen desiertos FRÍOS, y no solo cálidos?", "Sí: la Antártida es, técnicamente, el desierto más grande del mundo", ["No, todos los desiertos son cálidos", "Solo en la Luna", "Solo si tienen arena"], "🥶"],
  ["¿Qué corriente oceánica cálida influye en el clima templado de Europa occidental?", "La Corriente del Golfo", ["La Corriente de Humboldt", "La Corriente del Niño", "La Corriente Ártica"], "🌊"],
];

const CONTINENT_STATS_EXPERTO_MC: MC[] = [
  ["¿Cuál es el océano más PROFUNDO del mundo (Fosa de las Marianas)?", "El Pacífico", ["El Atlántico", "El Índico", "El Ártico"], "🌊"],
  ["¿Cuál es el continente MENOS poblado, sin contar la Antártida?", "Oceanía", ["África", "Europa", "América del Sur"], "🏝️"],
  ["¿Aproximadamente cuántos países independientes hay en el mundo?", "Cerca de 195", ["Cerca de 50", "Cerca de 500", "Cerca de 20"], "🌐"],
  ["¿Cuál es el continente con MÁS países?", "África (54 países)", ["Asia", "Europa", "América"], "🗺️"],
  ["¿Qué línea imaginaria divide la Tierra en hemisferio norte y sur?", "El ecuador", ["El meridiano de Greenwich", "El trópico de Cáncer", "El círculo polar"], "🌍"],
  ["¿Cuál es el mar más salado del mundo, donde es fácil flotar?", "El Mar Muerto", ["El Mar Rojo", "El Mar Negro", "El Mar Caspio"], "🧂"],
];

const GEO_TRIVIA_EXPERTO_MC: MC[] = [
  ["¿Cuál es el idioma con MÁS hablantes nativos en el mundo?", "El chino mandarín", ["El inglés", "El español", "El hindi"], "🗣️"],
  ["¿Qué organización internacional busca mantener la paz mundial, fundada en 1945?", "La ONU (Naciones Unidas)", ["La OTAN", "La Unión Europea", "La OMS"], "🕊️"],
  ["¿Qué moneda comparten muchos países de la Unión Europea?", "El euro", ["El dólar", "La libra", "El franco"], "💶"],
  ["¿Cuál es la capital de Australia? (pista: no es Sídney)", "Canberra", ["Sídney", "Melbourne", "Perth"], "🏙️"],
  ["¿Qué canal artificial conecta el mar Mediterráneo con el mar Rojo?", "El Canal de Suez", ["El Canal de Panamá", "El Estrecho de Gibraltar", "El Canal de la Mancha"], "🚢"],
  ["¿Qué línea imaginaria separa oficialmente un día del siguiente al cruzarla?", "La línea internacional de cambio de fecha", ["El ecuador", "El meridiano de Greenwich", "El trópico de Capricornio"], "🗓️"],
];

export const GEOGRAPHY_LEVELS: LevelDef[] = [
  { name: "Banderas del Mundo", emoji: "🚩", desc: "Reconoce banderas de todo el planeta", tier: 1, gen: genFlags },
  { name: "Animales del Mundo", emoji: "🦘", desc: "¿Dónde vive cada animal salvaje?", tier: 1, gen: genAnimals },
  { name: "Sabores del Mundo", emoji: "🍕", desc: "Comidas típicas de cada país", tier: 1, gen: genFood },
  { name: "Monumentos Famosos", emoji: "🗼", desc: "Los lugares más famosos del planeta", tier: 2, gen: genLandmarks },
  { name: "Mapa del Mundo", emoji: "🗺️", desc: "Toca el país o continente correcto en el mapa", tier: 2, gen: genWorldMap },
  { name: "Tierra, Mar y Selva", emoji: "🌊", desc: "Océanos, desiertos, montañas y selvas", tier: 2, gen: genHabitats },
  { name: "Continentes y Océanos", emoji: "🗺️", desc: "Los datos más grandes del planeta", tier: 3, gen: genContinents },
  {
    name: "Datos Curiosos del Mundo",
    emoji: "🌏",
    desc: "Países, ríos y montañas increíbles",
    tier: 3,
    gen: (d) => (d === "facil" ? genLandmarks(d) : d === "experto" ? buildMC(GEO_TRIVIA_EXPERTO_MC, d) : buildMC(GEO_FACTS_MC, d)),
  },
];
