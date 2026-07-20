import type { SubjectDef } from "../types";
import { MATH_LEVELS } from "./math";
import { ENGLISH_LEVELS } from "./english";
import { LANGUAGE_LEVELS } from "./language";
import { SCIENCE_LEVELS } from "./science";
import { FINANCE_LEVELS } from "./finance";
import { CODING_LEVELS } from "./coding";

// Las 6 materias esenciales, inspiradas en los currículos de
// primaria de Finlandia, Singapur, Estonia y Canadá.
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
];

export function getSubject(id: string): SubjectDef | undefined {
  return SUBJECTS.find((s) => s.id === id);
}
