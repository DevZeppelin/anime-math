import type { Difficulty, LevelDef, Question } from "../types";
import { pick, pickEmojiMC, repeatEmoji, sample, session, shuffle, COLOR_DOTS, SHAPES } from "./utils";

// ─────────────────────────────────────────────────────────────
// ARTE Y MÚSICA — materia nueva, 8 niveles. Colores, formas,
// instrumentos, ritmo y grandes artistas: desarrolla la
// creatividad y la sensibilidad estética desde pequeños.
//   facil (Menores de 5)  → colores, formas e instrumentos por
//                           imagen; perfecto para no-lectores.
//   normal / dificil       → teoría del color, artistas y obras.
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

// ── bancos visuales para "Pequeños" ────────────────────────────

const INSTRUMENTS: [string, string][] = [
  ["la guitarra", "🎸"], ["el piano", "🎹"], ["el tambor", "🥁"], ["la trompeta", "🎺"],
  ["el violín", "🎻"], ["el saxofón", "🎷"], ["el micrófono", "🎤"], ["el banjo", "🪕"],
];

const ART_TOOLS: [string, string][] = [
  ["el pincel", "🖌️"], ["la paleta de colores", "🎨"], ["el lápiz", "✏️"],
  ["las tijeras", "✂️"], ["el papel", "📄"], ["el marcador", "🖍️"],
];

const ARTWORK_TYPES: [string, string][] = [
  ["un cuadro", "🖼️"], ["una escultura", "🗿"], ["un museo", "🏛️"], ["una fotografía", "📷"],
];

const DANCE_ID: [string, string][] = [
  ["el ballet", "🩰"], ["el tango o la salsa", "💃"], ["el hip hop", "🕺"], ["la danza en grupo", "👯"],
];

function qNotePattern(): Question {
  const notes = ["🎵", "🎶"];
  const times = pick([2, 3]);
  const seq = Array.from({ length: times * 2 }, (_, i) => notes[i % 2]);
  const visual = seq.join(" ");
  const answer = notes[seq.length % 2];
  const wrong = notes.filter((n) => n !== answer);
  return { kind: "mc", prompt: "¿Qué nota sigue?", visual, options: shuffle([answer, ...wrong, "🥁"]), answer };
}

// ── teoría del color ────────────────────────────────────────

const COLOR_MIX_MC: MC[] = [
  ["Si mezclas azul y amarillo, ¿qué color obtienes?", "Verde", ["Morado", "Naranja", "Rosa"], "🔵🟡"],
  ["Si mezclas rojo y amarillo, ¿qué color obtienes?", "Naranja", ["Verde", "Morado", "Negro"], "🔴🟡"],
  ["Si mezclas rojo y azul, ¿qué color obtienes?", "Morado", ["Verde", "Naranja", "Rosa"], "🔴🔵"],
  ["¿Cuáles son los colores PRIMARIOS?", "Rojo, azul y amarillo", ["Verde, morado y naranja", "Blanco y negro", "Rosa y celeste"], "🔴🔵🟡", "Los colores primarios no se forman mezclando otros."],
  ["¿Cuáles son colores CÁLIDOS?", "Rojo, naranja y amarillo", ["Azul, verde y morado", "Blanco y gris", "Negro y plateado"], "🔥"],
  ["¿Cuáles son colores FRÍOS?", "Azul, verde y morado", ["Rojo, naranja y amarillo", "Blanco y negro", "Dorado y plateado"], "❄️"],
  ["Si mezclas blanco con un color, este se vuelve…", "Más claro", ["Más oscuro", "Transparente", "Brillante como el oro"], "⚪"],
  ["Si mezclas negro con un color, este se vuelve…", "Más oscuro", ["Más claro", "Invisible", "Más brillante"], "⚫"],
];

// ── ritmo y sonido ──────────────────────────────────────────

const RHYTHM_MC: MC[] = [
  ["Si una canción es RÁPIDA, decimos que su ritmo es…", "Allegro (veloz)", ["Lento", "Silencioso", "Triste"], "🐆"],
  ["Si una canción es LENTA y tranquila, su ritmo es…", "Lento (calmado)", ["Veloz", "Ruidoso", "Saltarín"], "🐢"],
  ["¿Qué instrumento marca el ritmo golpeando?", "El tambor", ["El violín", "La flauta", "El piano"], "🥁"],
  ["¿Qué instrumento tiene cuerdas y se toca con arco?", "El violín", ["El tambor", "La trompeta", "El piano"], "🎻"],
  ["¿Qué instrumento tiene teclas blancas y negras?", "El piano", ["El violín", "El saxofón", "El tambor"], "🎹"],
  ["¿Qué instrumento soplas para que suene?", "La trompeta", ["El tambor", "El piano", "La guitarra"], "🎺"],
  ["Cuando cantas sin ninguna música de fondo, cantas…", "A capela", ["Con orquesta", "En silencio total", "Dormido"], "🎤"],
];

// ── artistas y obras famosas ────────────────────────────────

const ARTIST_MC: MC[] = [
  ["¿Quién pintó «La noche estrellada»?", "Vincent van Gogh", ["Pablo Picasso", "Leonardo da Vinci", "Frida Kahlo"], "🌌"],
  ["¿Quién pintó la «Mona Lisa»?", "Leonardo da Vinci", ["Vincent van Gogh", "Pablo Picasso", "Diego Rivera"], "🖼️"],
  ["Frida Kahlo fue una famosa pintora de…", "México", ["España", "Italia", "Francia"], "🎨"],
  ["Pablo Picasso fue un famoso pintor de…", "España", ["México", "Alemania", "Rusia"], "🎨"],
  ["¿Qué instrumento tocaba Beethoven, el gran compositor?", "El piano", ["La guitarra", "El saxofón", "La batería"], "🎹"],
  ["¿Qué es un MURAL?", "Una pintura hecha en una pared grande", ["Una escultura pequeña", "Una canción", "Un instrumento"], "🧱"],
  ["¿Qué herramienta usa un escultor para tallar piedra?", "El cincel", ["El pincel", "La flauta", "Las tijeras"], "🗿"],
  ["¿Cómo se llama un lugar donde se exponen obras de arte?", "Museo", ["Estadio", "Biblioteca", "Farmacia"], "🏛️"],
];

const DANCE_MUSIC_MC: MC[] = [
  ["¿De qué país es típico el tango?", "Argentina", ["España", "Brasil", "México"], "💃"],
  ["¿De qué país es típico el flamenco?", "España", ["Francia", "Italia", "Portugal"], "💃"],
  ["¿De qué país es típica la samba?", "Brasil", ["Argentina", "Chile", "Perú"], "🕺"],
  ["¿De qué país es tradicional el ballet ruso más famoso?", "Rusia", ["Alemania", "Suecia", "Polonia"], "🩰"],
  ["¿Qué instrumento es típico de los mariachis mexicanos?", "La guitarra y la trompeta", ["El didgeridoo", "La gaita escocesa", "El sitar"], "🎺"],
  ["¿Qué instrumento de viento es típico de Escocia?", "La gaita", ["El violín", "El tambor", "El arpa"], "🎶"],
];

const ARTWORK_MC: MC[] = [
  ["«La Mona Lisa» está expuesta en un famoso museo de…", "París, Francia", ["Roma, Italia", "Madrid, España", "Londres, Reino Unido"], "🖼️"],
  ["Miguel Ángel pintó el techo de…", "La Capilla Sixtina", ["La Torre Eiffel", "El Coliseo", "El Big Ben"], "🎨"],
  ["¿Qué forma tienen la mayoría de las notas musicales escritas?", "Ovalada, con una línea", ["Cuadrada", "Triangular", "Como una estrella"], "🎵"],
  ["Un cuadro con solo formas y colores, sin figuras reales, es…", "Arte abstracto", ["Un retrato", "Un paisaje realista", "Una fotografía"], "🎭"],
  ["¿Cómo se llama un cuadro de una persona?", "Un retrato", ["Un paisaje", "Una naturaleza muerta", "Un mural"], "🖼️"],
  ["¿Cómo se llama un cuadro de frutas o flores quietas?", "Una naturaleza muerta", ["Un retrato", "Un autorretrato", "Un boceto"], "🍎"],
];

// ═════════════════════════════════════════════════════════════
// CONTENIDO DE "MAESTROS" (experto) — arte y música reales de
// adultos: teoría del color, composición, familias orquestales,
// teoría musical, movimientos artísticos y técnicas de pintura.
// ═════════════════════════════════════════════════════════════

const COLOR_THEORY_EXPERTO: MC[] = [
  ["¿Qué son los colores COMPLEMENTARIOS?", "Los que están opuestos en el círculo cromático y contrastan mucho, como rojo y verde", ["Los que están uno al lado del otro", "Los que se ven iguales", "Solo el blanco y el negro"], "🎨"],
  ["¿Cuál es el color complementario del azul?", "El naranja", ["El verde", "El morado", "El rojo"], "🔵"],
  ["¿Cuál es el color complementario del amarillo?", "El morado (violeta)", ["El naranja", "El verde", "El rojo"], "🟡"],
  ["¿Qué mide la SATURACIÓN de un color?", "Qué tan intenso o puro es ese color", ["Qué tan claro u oscuro es", "Su nombre en inglés", "Su temperatura física"], "🌈"],
  ["¿Qué mide el VALOR (o luminosidad) de un color?", "Qué tan claro u oscuro es", ["Qué tan intenso es", "Su posición en el círculo cromático", "Su precio en pintura"], "⚪"],
  ["Una paleta de colores ANÁLOGOS usa colores que están…", "Uno al lado del otro en el círculo cromático", ["Opuestos entre sí", "Solo tonos de gris", "Elegidos al azar"], "🎨"],
];

const COMPOSITION_EXPERTO: MC[] = [
  ["¿Qué es la 'regla de los tercios' en composición artística?", "Dividir la imagen en 9 partes iguales para ubicar los elementos importantes", ["Usar siempre 3 colores", "Pintar en 3 capas", "Hacer 3 bocetos antes de empezar"], "📐"],
  ["¿Qué es la PROPORCIÓN ÁUREA?", "Una proporción matemática (aprox. 1.618) considerada estéticamente armoniosa", ["Un tipo de pincel especial", "El precio justo de una obra", "Una técnica de secado rápido"], "🌀"],
  ["¿Qué es el PUNTO DE FUGA en un dibujo con perspectiva?", "El punto donde las líneas paralelas parecen converger a la distancia", ["El centro exacto del papel", "Donde se firma la obra", "El color más oscuro del cuadro"], "🛣️"],
  ["¿Qué es la SIMETRÍA en una composición?", "Cuando ambos lados de una imagen son iguales o muy parecidos", ["Cuando todo es de un solo color", "Cuando la imagen está incompleta", "Un tipo de marco para cuadros"], "🦋"],
  ["¿Qué es un patrón GEOMÉTRICO ABSTRACTO?", "Un diseño hecho con formas geométricas sin representar objetos reales", ["Un retrato muy detallado", "Una fotografía sin editar", "Un mapa de un país"], "🔷"],
];

const ORCHESTRA_EXPERTO: MC[] = [
  ["¿A qué familia de instrumentos pertenece el violín?", "Cuerdas", ["Metales", "Percusión", "Viento-madera"], "🎻"],
  ["¿A qué familia pertenece la trompeta?", "Metales (viento-metal)", ["Cuerdas", "Percusión", "Viento-madera"], "🎺"],
  ["¿A qué familia pertenece la flauta?", "Viento-madera", ["Cuerdas", "Metales", "Percusión"], "🎶"],
  ["¿Quién dirige normalmente a una orquesta sinfónica, sin tocar ningún instrumento?", "El director, con la batuta", ["El primer violinista únicamente", "El público", "El compositor siempre en vivo"], "🎼"],
  ["¿Cuál es el instrumento de cuerda más grande y grave de una orquesta?", "El contrabajo", ["El violín", "La viola", "El violonchelo"], "🎻"],
  ["¿Qué familia de instrumentos incluye al tambor y los platillos?", "Percusión", ["Cuerdas", "Metales", "Viento-madera"], "🥁"],
];

const MUSIC_THEORY_EXPERTO: MC[] = [
  ["¿Qué significa 'ALLEGRO' como indicación de tempo en música?", "Rápido y alegre", ["Lento y tranquilo", "Muy suave", "Silencioso"], "⚡"],
  ["¿Qué significa 'ADAGIO' como indicación de tempo?", "Lento y tranquilo", ["Rápido y enérgico", "A todo volumen", "Sin ritmo fijo"], "🐢"],
  ["¿Qué es el TEMPO en música?", "La velocidad a la que se toca una pieza", ["El volumen de la música", "El instrumento principal", "El nombre de la canción"], "⏱️"],
  ["¿Cuántas notas tiene una escala musical básica (do, re, mi…) antes de repetirse?", "7", ["5", "10", "3"], "🎵"],
  ["¿Qué es una OCTAVA en música?", "La distancia entre una nota y la siguiente con el mismo nombre, el doble de frecuencia", ["Un grupo de 8 músicos", "Un tipo de instrumento antiguo", "Una canción de 8 minutos"], "🎹"],
  ["¿Qué indica el COMPÁS de una canción, como 4/4?", "Cuántos tiempos hay en cada compás", ["El nombre de la tonalidad", "Cuántos instrumentos hay", "La duración total de la canción"], "🥁"],
];

const ART_MOVEMENTS_EXPERTO: MC[] = [
  ["¿A qué movimiento artístico pertenece Pablo Picasso, con formas geométricas y perspectivas múltiples?", "Cubismo", ["Impresionismo", "Renacimiento", "Barroco"], "🎨"],
  ["¿A qué movimiento pertenece Salvador Dalí, con imágenes de sueños y lo irracional?", "Surrealismo", ["Cubismo", "Realismo", "Neoclasicismo"], "🌀"],
  ["¿A qué movimiento pertenece Claude Monet, célebre por capturar la luz y el instante?", "Impresionismo", ["Cubismo", "Surrealismo", "Gótico"], "🌅"],
  ["¿En qué época y lugar surgió el Renacimiento artístico?", "En Italia, entre los siglos XIV y XVI", ["En Francia, en el siglo XIX", "En Egipto, hace 5000 años", "En Japón, en el siglo XX"], "🏛️"],
  ["¿Qué artista mexicana es célebre por sus autorretratos de fuerte carga simbólica?", "Frida Kahlo", ["Georgia O'Keeffe", "Tarsila do Amaral", "Remedios Varo"], "🎨"],
  ["¿Qué movimiento del siglo XX se caracteriza por expresar emociones con colores intensos y pinceladas libres?", "Expresionismo", ["Realismo", "Neoclasicismo", "Barroco"], "🖌️"],
];

const COLOR_MIXING_EXPERTO: MC[] = [
  ["Las pantallas mezclan luz sumando colores hasta llegar al blanco. ¿Cómo se llama ese tipo de mezcla?", "Mezcla aditiva (RGB)", ["Mezcla sustractiva", "Mezcla neutra", "Mezcla acrílica"], "📺"],
  ["Las pinturas mezclan pigmentos, y mezclar todos suele dar un tono oscuro. ¿Cómo se llama esa mezcla?", "Mezcla sustractiva (de pigmentos)", ["Mezcla aditiva", "Mezcla digital", "Mezcla neutra"], "🎨"],
  ["Al mezclar luz roja y luz verde en una pantalla, ¿qué color se obtiene?", "Amarillo", ["Morado", "Negro", "Blanco"], "📺"],
  ["¿Qué colores forman la base del sistema RGB usado en pantallas?", "Rojo, verde y azul", ["Cian, magenta y amarillo", "Rojo, amarillo y azul", "Blanco y negro"], "🔴"],
  ["¿Qué colores forman la base del sistema CMYK usado en impresión?", "Cian, magenta, amarillo y negro", ["Rojo, verde y azul", "Blanco, gris y negro", "Rojo, amarillo y azul"], "🖨️"],
];

const DANCE_HISTORY_EXPERTO: MC[] = [
  ["¿Qué caracteriza al ballet clásico frente a otras danzas?", "Movimientos codificados y técnica muy formal, a menudo en puntas", ["Improvisación total sin reglas", "Se baila siempre en grupos grandes", "No requiere ningún entrenamiento"], "🩰"],
  ["¿De qué cultura urbana de los años 70 en Nueva York surgió el hip hop?", "La comunidad afroamericana y latina del Bronx", ["La aristocracia europea", "El campo japonés", "Los pueblos originarios de Oceanía"], "🕺"],
  ["¿Qué danza española usa castañuelas y taconeo marcado con fuerza?", "El flamenco", ["El tango", "El vals", "La samba"], "💃"],
  ["¿Qué danza de salón de origen cubano se baila en pareja con pasos laterales?", "La salsa", ["El flamenco", "El ballet", "El vals vienés"], "💃"],
  ["¿Qué es la COREOGRAFÍA?", "La secuencia planeada de movimientos de una danza", ["El vestuario de los bailarines", "La música de fondo únicamente", "El escenario donde se baila"], "📝"],
];

const ART_TECHNIQUE_EXPERTO: MC[] = [
  ["¿Qué técnica pictórica usa pigmentos aplicados sobre yeso húmedo, típica del Renacimiento?", "El fresco", ["La acuarela", "El óleo", "El grabado"], "🖌️"],
  ["¿Qué es el CLAROSCURO en pintura?", "El uso fuerte de contraste entre luces y sombras", ["Una técnica de solo blanco y negro", "Un tipo de marco dorado", "Pintar solo de noche"], "🕯️"],
  ["¿En qué museo de París se exhibe la Mona Lisa?", "El Louvre", ["El Museo de Orsay", "El Prado", "El Vaticano"], "🏛️"],
  ["¿Qué es una ACUARELA?", "Una técnica de pintura con pigmentos diluidos en agua sobre papel", ["Una escultura de piedra", "Una técnica con pigmentos y aceite", "Un tipo de mural gigante"], "💧"],
  ["¿Qué es el ÓLEO en pintura?", "Una técnica con pigmentos mezclados en aceite, de secado lento", ["Pintura diluida en agua", "Un tipo de lápiz de color", "Una técnica digital"], "🖼️"],
  ["¿Qué museo de Madrid alberga «Las Meninas» de Velázquez?", "El Museo del Prado", ["El Louvre", "El Museo Reina Sofía", "El Guggenheim Bilbao"], "🏛️"],
];

// ── generadores ──────────────────────────────────────────────

function genColors(d: D): Question[] {
  if (d === "facil") return session(Array.from({ length: 10 }, () => pickEmojiMC(COLOR_DOTS.map((c) => [c.name, c.emoji] as [string, string]), (name) => `¿De qué color es esto?`)));
  if (d === "experto") return buildMC(COLOR_THEORY_EXPERTO, d);
  return buildMC(COLOR_MIX_MC, d, COLOR_MIX_MC.length);
}

function genColorMixing(d: D): Question[] {
  if (d === "experto") return buildMC(COLOR_MIXING_EXPERTO, d);
  return genColors(d);
}

function genShapes(d: D): Question[] {
  if (d === "experto") return buildMC(COMPOSITION_EXPERTO, d);
  return session(Array.from({ length: 10 }, () => pickEmojiMC(SHAPES.map((s) => [s.name, s.emoji] as [string, string]), (name) => `¿Cuál es el ${name}?`)));
}

function genInstruments(d: D): Question[] {
  if (d === "facil") return session(Array.from({ length: 10 }, () => pickEmojiMC(INSTRUMENTS, (name) => `¿Cuál es ${name}?`)));
  if (d === "experto") return buildMC(ORCHESTRA_EXPERTO, d);
  return buildMC(RHYTHM_MC, d);
}

function genArtTools(): Question[] {
  return session(Array.from({ length: 10 }, () => pickEmojiMC(ART_TOOLS, (name) => `¿Cuál es ${name}?`)));
}

function genArtists(d: D): Question[] {
  if (d === "facil") return genArtTools();
  if (d === "experto") return buildMC(ART_MOVEMENTS_EXPERTO, d);
  return buildMC(ARTIST_MC, d);
}

function genDance(d: D): Question[] {
  if (d === "facil") return session(Array.from({ length: 10 }, () => pickEmojiMC(DANCE_ID, (name) => `¿Cuál es ${name}?`)));
  if (d === "experto") return buildMC(DANCE_HISTORY_EXPERTO, d);
  return buildMC(DANCE_MUSIC_MC, d, DANCE_MUSIC_MC.length);
}

function genArtworks(d: D): Question[] {
  if (d === "facil") return session(Array.from({ length: 10 }, () => pickEmojiMC(ARTWORK_TYPES, (name) => `¿Cuál es ${name}?`)));
  if (d === "experto") return buildMC(ART_TECHNIQUE_EXPERTO, d);
  return buildMC(ARTWORK_MC, d, ARTWORK_MC.length);
}

export const ART_LEVELS: LevelDef[] = [
  { name: "Colores", emoji: "🎨", desc: "Reconoce y mezcla colores", tier: 1, gen: genColors },
  { name: "Formas", emoji: "🔺", desc: "Círculos, cuadrados, triángulos y más", tier: 1, gen: genShapes },
  { name: "Instrumentos Musicales", emoji: "🎸", desc: "Conoce los instrumentos por su sonido", tier: 1, gen: genInstruments },
  { name: "Ritmo y Sonido", emoji: "🥁", desc: "Rápido, lento y patrones musicales", tier: 2, gen: (d) => (d === "facil" ? session(Array.from({ length: 10 }, qNotePattern)) : d === "experto" ? buildMC(MUSIC_THEORY_EXPERTO, d) : buildMC(RHYTHM_MC, d)) },
  { name: "Artistas Famosos", emoji: "🖼️", desc: "Grandes pintores y escultores de la historia", tier: 2, gen: genArtists },
  { name: "Colores que se Mezclan", emoji: "🌈", desc: "Cálidos, fríos, claros y oscuros", tier: 2, gen: genColorMixing },
  { name: "Danzas del Mundo", emoji: "💃", desc: "Bailes y música típica de cada país", tier: 3, gen: genDance },
  { name: "Grandes Obras", emoji: "🏛️", desc: "Museos, cuadros famosos y estilos de arte", tier: 3, gen: genArtworks },
];
