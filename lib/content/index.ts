import type { SubjectDef } from "../types";
import { MATH_LEVELS } from "./math";
import { ENGLISH_LEVELS } from "./english";
import { LANGUAGE_LEVELS } from "./language";
import { SCIENCE_LEVELS } from "./science";
import { FINANCE_LEVELS } from "./finance";
import { CODING_LEVELS } from "./coding";
import { GEOGRAPHY_LEVELS } from "./geography";
import { ART_LEVELS } from "./art";
import { EMOTIONS_LEVELS } from "./emotions";
import { AI_LEVELS } from "./ai";

// Las 10 materias esenciales, inspiradas en los currículos de
// primaria de Finlandia, Singapur, Estonia y Canadá — y
// adaptadas a 4 niveles de dificultad, desde Menores de 5 hasta
// Maestros (sin límite de edad).
export const SUBJECTS: SubjectDef[] = [
  {
    id: "math",
    name: "Matemáticas",
    emoji: "🔢",
    color: "#4d96ff",
    tagline: "El lenguaje del universo",
    levels: MATH_LEVELS,
  },
  {
    id: "english",
    name: "Inglés",
    emoji: "🇬🇧",
    color: "#ff5a6e",
    tagline: "Habla con todo el mundo",
    levels: ENGLISH_LEVELS,
    lang: "en", // en modo "Pequeños" las palabras se leen con acento inglés
  },
  {
    id: "language",
    name: "Lengua",
    emoji: "📚",
    color: "#ff9d2e",
    tagline: "El poder de las palabras",
    levels: LANGUAGE_LEVELS,
  },
  {
    id: "science",
    name: "Ciencias",
    emoji: "🔬",
    color: "#3df09a",
    tagline: "Descubre cómo funciona todo",
    levels: SCIENCE_LEVELS,
  },
  {
    id: "finance",
    name: "Finanzas",
    emoji: "💰",
    color: "#ffd24d",
    tagline: "Domina el dinero desde pequeño",
    levels: FINANCE_LEVELS,
  },
  {
    id: "coding",
    name: "Programación",
    emoji: "💻",
    color: "#c061ff",
    tagline: "Piensa como un creador",
    levels: CODING_LEVELS,
  },
  {
    id: "geography",
    name: "Geografía",
    emoji: "🌍",
    color: "#2fb8c4",
    tagline: "Banderas, países y culturas del mundo",
    levels: GEOGRAPHY_LEVELS,
  },
  {
    id: "art",
    name: "Arte y Música",
    emoji: "🎨",
    color: "#ff7ad9",
    tagline: "Colores, ritmo y grandes artistas",
    levels: ART_LEVELS,
  },
  {
    id: "emotions",
    name: "Emociones y Valores",
    emoji: "💛",
    color: "#ffb454",
    tagline: "Conócete y cuida a los demás",
    levels: EMOTIONS_LEVELS,
  },
  {
    id: "ai",
    name: "Inteligencia Artificial",
    emoji: "🤖",
    color: "#00e5c8",
    tagline: "Los fundamentos para entender el nuevo mundo",
    levels: AI_LEVELS,
  },
];

export function getSubject(id: string): SubjectDef | undefined {
  return SUBJECTS.find((s) => s.id === id);
}
