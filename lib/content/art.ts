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
    if (d === "dificil") {
      const extra = shuffle(allAnswers.filter((a) => !options.includes(a))).slice(0, 2);
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

// ── generadores ──────────────────────────────────────────────

function genColors(d: D): Question[] {
  if (d === "facil") return session(Array.from({ length: 10 }, () => pickEmojiMC(COLOR_DOTS.map((c) => [c.name, c.emoji] as [string, string]), (name) => `¿De qué color es esto?`)));
  return buildMC(COLOR_MIX_MC, d, COLOR_MIX_MC.length);
}

function genShapes(): Question[] {
  return session(Array.from({ length: 10 }, () => pickEmojiMC(SHAPES.map((s) => [s.name, s.emoji] as [string, string]), (name) => `¿Cuál es el ${name}?`)));
}

function genInstruments(d: D): Question[] {
  if (d === "facil") return session(Array.from({ length: 10 }, () => pickEmojiMC(INSTRUMENTS, (name) => `¿Cuál es ${name}?`)));
  return buildMC(RHYTHM_MC, d);
}

function genArtTools(): Question[] {
  return session(Array.from({ length: 10 }, () => pickEmojiMC(ART_TOOLS, (name) => `¿Cuál es ${name}?`)));
}

function genArtists(d: D): Question[] {
  if (d === "facil") return genArtTools();
  return buildMC(ARTIST_MC, d);
}

function genDance(d: D): Question[] {
  if (d === "facil") return genInstruments("facil");
  return buildMC(DANCE_MUSIC_MC, d, DANCE_MUSIC_MC.length);
}

function genArtworks(d: D): Question[] {
  if (d === "facil") return genArtTools();
  return buildMC(ARTWORK_MC, d, ARTWORK_MC.length);
}

export const ART_LEVELS: LevelDef[] = [
  { name: "Colores", emoji: "🎨", desc: "Reconoce y mezcla colores", tier: 1, gen: genColors },
  { name: "Formas", emoji: "🔺", desc: "Círculos, cuadrados, triángulos y más", tier: 1, gen: () => genShapes() },
  { name: "Instrumentos Musicales", emoji: "🎸", desc: "Conoce los instrumentos por su sonido", tier: 1, gen: genInstruments },
  { name: "Ritmo y Sonido", emoji: "🥁", desc: "Rápido, lento y patrones musicales", tier: 2, gen: (d) => (d === "facil" ? session(Array.from({ length: 10 }, qNotePattern)) : buildMC(RHYTHM_MC, d)) },
  { name: "Artistas Famosos", emoji: "🖼️", desc: "Grandes pintores y escultores de la historia", tier: 2, gen: genArtists },
  { name: "Colores que se Mezclan", emoji: "🌈", desc: "Cálidos, fríos, claros y oscuros", tier: 2, gen: genColors },
  { name: "Danzas del Mundo", emoji: "💃", desc: "Bailes y música típica de cada país", tier: 3, gen: genDance },
  { name: "Grandes Obras", emoji: "🏛️", desc: "Museos, cuadros famosos y estilos de arte", tier: 3, gen: genArtworks },
];
