import type { LevelDef, Question } from "../types";
import { pick, sample, session, shuffle, textMC, typed } from "./utils";

// ─────────────────────────────────────────────────────────────
// INGLÉS — 10 niveles. Vocabulario esencial + frases,
// siguiendo la progresión típica de primaria (CEFR pre-A1 → A1)
// ─────────────────────────────────────────────────────────────

type V = [es: string, en: string, emoji: string];

const COLORS_NUMBERS: V[] = [
  ["rojo", "red", "🔴"], ["azul", "blue", "🔵"], ["verde", "green", "🟢"],
  ["amarillo", "yellow", "🟡"], ["negro", "black", "⚫"], ["blanco", "white", "⚪"],
  ["rosa", "pink", "🌸"], ["naranja", "orange", "🟠"], ["morado", "purple", "🟣"],
  ["uno", "one", "1️⃣"], ["dos", "two", "2️⃣"], ["tres", "three", "3️⃣"],
  ["cuatro", "four", "4️⃣"], ["cinco", "five", "5️⃣"], ["seis", "six", "6️⃣"],
  ["siete", "seven", "7️⃣"], ["ocho", "eight", "8️⃣"], ["nueve", "nine", "9️⃣"], ["diez", "ten", "🔟"],
];

const ANIMALS: V[] = [
  ["perro", "dog", "🐶"], ["gato", "cat", "🐱"], ["pájaro", "bird", "🐦"],
  ["pez", "fish", "🐟"], ["caballo", "horse", "🐴"], ["vaca", "cow", "🐮"],
  ["cerdo", "pig", "🐷"], ["oveja", "sheep", "🐑"], ["león", "lion", "🦁"],
  ["mono", "monkey", "🐵"], ["oso", "bear", "🐻"], ["elefante", "elephant", "🐘"],
  ["conejo", "rabbit", "🐰"], ["ratón", "mouse", "🐭"], ["tortuga", "turtle", "🐢"],
  ["mariposa", "butterfly", "🦋"],
];

const FAMILY: V[] = [
  ["madre", "mother", "👩"], ["padre", "father", "👨"], ["hermana", "sister", "👧"],
  ["hermano", "brother", "👦"], ["abuela", "grandmother", "👵"], ["abuelo", "grandfather", "👴"],
  ["bebé", "baby", "👶"], ["familia", "family", "👨‍👩‍👧‍👦"], ["amigo", "friend", "🤝"],
  ["tía", "aunt", "👩‍🦰"], ["tío", "uncle", "🧔"], ["prima", "cousin", "🙋"],
];

const FOOD: V[] = [
  ["manzana", "apple", "🍎"], ["plátano", "banana", "🍌"], ["pan", "bread", "🍞"],
  ["leche", "milk", "🥛"], ["agua", "water", "💧"], ["huevo", "egg", "🥚"],
  ["queso", "cheese", "🧀"], ["arroz", "rice", "🍚"], ["pollo", "chicken", "🍗"],
  ["pescado", "fish", "🐟"], ["naranja", "orange", "🍊"], ["fresa", "strawberry", "🍓"],
  ["helado", "ice cream", "🍦"], ["pastel", "cake", "🍰"], ["jugo", "juice", "🧃"],
  ["ensalada", "salad", "🥗"],
];

const BODY: V[] = [
  ["cabeza", "head", "🙂"], ["ojo", "eye", "👁️"], ["oreja", "ear", "👂"],
  ["nariz", "nose", "👃"], ["boca", "mouth", "👄"], ["mano", "hand", "✋"],
  ["pie", "foot", "🦶"], ["pierna", "leg", "🦵"], ["brazo", "arm", "💪"],
  ["dedo", "finger", "☝️"], ["pelo", "hair", "💇"], ["diente", "tooth", "🦷"],
  ["corazón", "heart", "❤️"], ["espalda", "back", "🔙"],
];

const SCHOOL_HOME: V[] = [
  ["escuela", "school", "🏫"], ["libro", "book", "📖"], ["lápiz", "pencil", "✏️"],
  ["mesa", "table", "🪑"], ["silla", "chair", "💺"], ["puerta", "door", "🚪"],
  ["ventana", "window", "🪟"], ["casa", "house", "🏠"], ["cama", "bed", "🛏️"],
  ["mochila", "backpack", "🎒"], ["papel", "paper", "📄"], ["tijeras", "scissors", "✂️"],
  ["maestro", "teacher", "🧑‍🏫"], ["cocina", "kitchen", "🍳"], ["baño", "bathroom", "🛁"],
  ["jardín", "garden", "🌷"],
];

const VERBS: V[] = [
  ["correr", "run", "🏃"], ["saltar", "jump", "🤸"], ["comer", "eat", "🍽️"],
  ["beber", "drink", "🥤"], ["dormir", "sleep", "😴"], ["leer", "read", "📖"],
  ["escribir", "write", "✍️"], ["jugar", "play", "🎮"], ["cantar", "sing", "🎤"],
  ["bailar", "dance", "💃"], ["nadar", "swim", "🏊"], ["caminar", "walk", "🚶"],
  ["hablar", "speak", "🗣️"], ["escuchar", "listen", "👂"], ["mirar", "look", "👀"],
  ["abrir", "open", "🔓"],
];

// [pregunta, respuesta correcta, distractores]
type P = [prompt: string, answer: string, distractors: string[], visual?: string];

const GREETINGS: P[] = [
  ["¿Cómo se dice «hola»?", "hello", ["goodbye", "please", "sorry"], "👋"],
  ["¿Cómo se dice «adiós»?", "goodbye", ["hello", "welcome", "thanks"], "👋"],
  ["¿Cómo se dice «gracias»?", "thank you", ["please", "sorry", "excuse me"], "🙏"],
  ["¿Cómo se dice «por favor»?", "please", ["thanks", "hello", "yes"], "🙏"],
  ["¿Cómo se dice «buenos días»?", "good morning", ["good night", "good afternoon", "goodbye"], "🌅"],
  ["¿Cómo se dice «buenas noches»?", "good night", ["good morning", "good day", "hello"], "🌙"],
  ["¿Cómo se dice «lo siento»?", "sorry", ["please", "thank you", "excuse"], "😔"],
  ["«My name is Ana» significa…", "Me llamo Ana", ["Mi amiga es Ana", "Ana no está", "Yo veo a Ana"], "🙋‍♀️"],
  ["«How are you?» significa…", "¿Cómo estás?", ["¿Dónde estás?", "¿Quién eres?", "¿Cuántos años tienes?"], "🤔"],
  ["«I am happy» significa…", "Estoy feliz", ["Estoy triste", "Estoy cansado", "Soy alto"], "😊"],
  ["«How old are you?» significa…", "¿Cuántos años tienes?", ["¿Cómo te llamas?", "¿Dónde vives?", "¿Qué hora es?"], "🎂"],
  ["Para responder «¿cómo estás?» dices…", "I'm fine, thank you", ["My name is Leo", "It's a dog", "I am ten"], "😊"],
];

const PREPOSITIONS: P[] = [
  ["El gato está DENTRO de la caja. «Dentro» es…", "in", ["on", "under", "next to"], "📦"],
  ["El libro está SOBRE la mesa. «Sobre» es…", "on", ["in", "under", "behind"], "📖"],
  ["El perro está DEBAJO de la cama. «Debajo» es…", "under", ["on", "in", "between"], "🛏️"],
  ["Estoy AL LADO de mi amigo. «Al lado» es…", "next to", ["under", "far", "inside"], "🧍"],
  ["La pelota está DETRÁS de la puerta. «Detrás» es…", "behind", ["in front of", "on", "in"], "🚪"],
  ["Estoy DELANTE del espejo. «Delante» es…", "in front of", ["behind", "under", "next to"], "🪞"],
  ["«up» significa…", "arriba", ["abajo", "lejos", "cerca"], "⬆️"],
  ["«down» significa…", "abajo", ["arriba", "dentro", "fuera"], "⬇️"],
  ["«big» significa…", "grande", ["pequeño", "alto", "rápido"], "🐘"],
  ["«small» significa…", "pequeño", ["grande", "largo", "lento"], "🐜"],
  ["«fast» significa…", "rápido", ["lento", "fuerte", "feliz"], "🏎️"],
  ["«slow» significa…", "lento", ["rápido", "corto", "frío"], "🐢"],
];

const PHRASES: P[] = [
  ["«The cat is black» significa…", "El gato es negro", ["El perro es negro", "El gato es blanco", "El gato está triste"], "🐱"],
  ["«I like apples» significa…", "Me gustan las manzanas", ["Como manzanas", "Tengo manzanas", "Veo manzanas"], "🍎"],
  ["«She is my sister» significa…", "Ella es mi hermana", ["Ella es mi madre", "Él es mi hermano", "Ella es mi amiga"], "👧"],
  ["«We play football» significa…", "Jugamos al fútbol", ["Vemos fútbol", "Nos gusta el fútbol", "Juegan al tenis"], "⚽"],
  ["«I have a dog» significa…", "Tengo un perro", ["Quiero un perro", "Veo un perro", "Ese es mi perro"], "🐶"],
  ["«The sun is yellow» significa…", "El sol es amarillo", ["La luna es blanca", "El sol es rojo", "El cielo es azul"], "☀️"],
  ["«I can swim» significa…", "Puedo nadar", ["Quiero nadar", "Voy a nadar", "Me gusta el agua"], "🏊"],
  ["«It is raining» significa…", "Está lloviendo", ["Hace sol", "Hace frío", "Está nevando"], "🌧️"],
  ["«I am hungry» significa…", "Tengo hambre", ["Tengo sed", "Tengo sueño", "Tengo frío"], "😋"],
  ["«Where is the school?» significa…", "¿Dónde está la escuela?", ["¿Cómo es la escuela?", "¿Cuándo hay escuela?", "¿Qué es una escuela?"], "🏫"],
  ["«This is my house» significa…", "Esta es mi casa", ["Esa es tu casa", "Mi casa es grande", "Estoy en casa"], "🏠"],
  ["«I read every day» significa…", "Leo todos los días", ["Leo a veces", "Me gusta leer", "Leo por la noche"], "📚"],
];

// ── constructores ────────────────────────────────────────────

function vocabQuestions(bank: V[], typedCount = 2): Question[] {
  const englishPool = bank.map((v) => v[1]);
  const spanishPool = bank.map((v) => v[0]);
  const qs: Question[] = [];
  for (const [es, en, emoji] of sample(bank, 10)) {
    const mode = Math.random();
    if (mode < 0.45) {
      qs.push(textMC(`¿Cómo se dice «${es}» en inglés?`, en, englishPool, { visual: emoji }));
    } else if (mode < 0.9) {
      qs.push(textMC(`«${en}» significa…`, es, spanishPool, { visual: emoji }));
    } else {
      qs.push(typed(`Escribe en inglés: «${es}»`, en, { visual: emoji }));
    }
  }
  // garantiza algo de escritura
  const easy = bank.filter((v) => v[1].length <= 5);
  for (const [es, en, emoji] of sample(easy.length ? easy : bank, typedCount)) {
    qs.push(typed(`Escribe en inglés: «${es}»`, en, { visual: emoji }));
  }
  return session(qs);
}

function phraseQuestions(bank: P[]): Question[] {
  return session(
    sample(bank, 10).map(([prompt, answer, distractors, visual]) => ({
      kind: "mc" as const,
      prompt,
      visual,
      options: shuffle([answer, ...distractors]),
      answer,
    }))
  );
}

export const ENGLISH_LEVELS: LevelDef[] = [
  { name: "Colors & Numbers", emoji: "🌈", desc: "Colores y números del 1 al 10", tier: 1, gen: () => vocabQuestions(COLORS_NUMBERS) },
  { name: "Animals", emoji: "🦁", desc: "Los animales en inglés", tier: 1, gen: () => vocabQuestions(ANIMALS) },
  { name: "My Family", emoji: "👨‍👩‍👧‍👦", desc: "La familia y los amigos", tier: 1, gen: () => vocabQuestions(FAMILY) },
  { name: "Food", emoji: "🍎", desc: "Comidas y bebidas", tier: 1, gen: () => vocabQuestions(FOOD) },
  { name: "My Body", emoji: "🙌", desc: "Las partes del cuerpo", tier: 2, gen: () => vocabQuestions(BODY) },
  { name: "School & Home", emoji: "🏫", desc: "Objetos de la escuela y la casa", tier: 2, gen: () => vocabQuestions(SCHOOL_HOME) },
  { name: "Action Words", emoji: "🏃", desc: "Verbos de acción", tier: 2, gen: () => vocabQuestions(VERBS) },
  { name: "Hello!", emoji: "👋", desc: "Saludos y presentaciones", tier: 2, gen: () => phraseQuestions(GREETINGS) },
  { name: "Where Is It?", emoji: "🧭", desc: "Posiciones y opuestos", tier: 3, gen: () => phraseQuestions(PREPOSITIONS) },
  { name: "Real Phrases", emoji: "💬", desc: "Frases completas de la vida real", tier: 3, gen: () => phraseQuestions(PHRASES) },
];
