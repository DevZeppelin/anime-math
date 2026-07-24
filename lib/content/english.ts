import type { Difficulty, LevelDef, Question } from "../types";
import { sample, session, shuffle, textMC, typed } from "./utils";

// ─────────────────────────────────────────────────────────────
// INGLÉS — 11 niveles, adaptados a 3 edades:
//   facil (Menores de 5)  → "Escucha y toca la imagen": la palabra
//                           en inglés se lee en voz alta (con
//                           acento inglés) y el niño toca el
//                           dibujo correcto. Cero lectura.
//   normal / dificil       → el vocabulario y las frases clásicas.
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

const SHAPES_WORDS: V[] = [
  ["círculo", "circle", "🔴"], ["cuadrado", "square", "🟥"], ["triángulo", "triangle", "🔺"],
  ["estrella", "star", "⭐"], ["corazón", "heart", "❤️"], ["diamante", "diamond", "🔷"],
];

const FEELINGS: V[] = [
  ["feliz", "happy", "😊"], ["triste", "sad", "😢"], ["enojado", "angry", "😠"],
  ["cansado", "tired", "😴"], ["asustado", "scared", "😱"], ["sorprendido", "surprised", "😮"],
];

const OPPOSITES_BASIC: V[] = [
  ["arriba", "up", "⬆️"], ["abajo", "down", "⬇️"], ["grande", "big", "🐘"],
  ["pequeño", "small", "🐜"], ["caliente", "hot", "🔥"], ["frío", "cold", "❄️"],
  ["rápido", "fast", "🐆"], ["lento", "slow", "🐢"],
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
  ["«I am happy» significa…", "Estoy feliz", ["Estoy triste", "Estoy cansado", "Soy alto"], "💬"],
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
  ["«up» significa…", "arriba", ["abajo", "lejos", "cerca"], "💬"],
  ["«down» significa…", "abajo", ["arriba", "dentro", "fuera"], "💬"],
  ["«big» significa…", "grande", ["pequeño", "alto", "rápido"], "💬"],
  ["«small» significa…", "pequeño", ["grande", "largo", "lento"], "💬"],
  ["«fast» significa…", "rápido", ["lento", "fuerte", "feliz"], "💬"],
  ["«slow» significa…", "lento", ["rápido", "corto", "frío"], "💬"],
];

const PHRASES: P[] = [
  ["«The cat is black» significa…", "El gato es negro", ["El perro es negro", "El gato es blanco", "El gato está triste"], "💬"],
  ["«I like apples» significa…", "Me gustan las manzanas", ["Como manzanas", "Tengo manzanas", "Veo manzanas"], "🍎"],
  ["«She is my sister» significa…", "Ella es mi hermana", ["Ella es mi madre", "Él es mi hermano", "Ella es mi amiga"], "👧"],
  ["«We play football» significa…", "Jugamos al fútbol", ["Vemos fútbol", "Nos gusta el fútbol", "Juegan al tenis"], "⚽"],
  ["«I have a dog» significa…", "Tengo un perro", ["Quiero un perro", "Veo un perro", "Ese es mi perro"], "🐶"],
  ["«The sun is yellow» significa…", "El sol es amarillo", ["La luna es blanca", "El sol es rojo", "El cielo es azul"], "💬"],
  ["«I can swim» significa…", "Puedo nadar", ["Quiero nadar", "Voy a nadar", "Me gusta el agua"], "💬"],
  ["«It is raining» significa…", "Está lloviendo", ["Hace sol", "Hace frío", "Está nevando"], "💬"],
  ["«I am hungry» significa…", "Tengo hambre", ["Tengo sed", "Tengo sueño", "Tengo frío"], "💬"],
  ["«Where is the school?» significa…", "¿Dónde está la escuela?", ["¿Cómo es la escuela?", "¿Cuándo hay escuela?", "¿Qué es una escuela?"], "🏫"],
  ["«This is my house» significa…", "Esta es mi casa", ["Esa es tu casa", "Mi casa es grande", "Estoy en casa"], "🏠"],
  ["«I read every day» significa…", "Leo todos los días", ["Leo a veces", "Me gusta leer", "Leo por la noche"], "📚"],
];

// ── constructores ────────────────────────────────────────────

/** "Escucha y toca la imagen": el prompt ES la palabra en inglés
 *  (se lee con voz/acento inglés) y las opciones son dibujos. */
function vocabFacil(bank: V[]): Question[] {
  const emojiPool = bank.map((v) => v[2]);
  return session(
    sample(bank, 10).map(([, en, emoji]) => {
      const wrong = sample(
        emojiPool.filter((e) => e !== emoji),
        2
      );
      return {
        kind: "mc" as const,
        prompt: en,
        options: shuffle([emoji, ...wrong]),
        answer: emoji,
      };
    })
  );
}

function vocabQuestions(bank: V[], d: Difficulty, typedCount = 2): Question[] {
  if (d === "facil") return vocabFacil(bank);
  const englishPool = bank.map((v) => v[1]);
  const spanishPool = bank.map((v) => v[0]);
  // en difícil (y aún más en experto) hay más opciones y más escritura
  const count = d === "dificil" || d === "experto" ? 6 : 4;
  const writeChance = d === "experto" ? 0.4 : d === "dificil" ? 0.25 : 0.1;
  const qs: Question[] = [];
  for (const [es, en, emoji] of sample(bank, 10)) {
    const mode = Math.random();
    if (mode < 0.45) {
      // es → en: el emoji ilustra la palabra ya dicha en español (no revela)
      qs.push(textMC(`¿Cómo se dice «${es}» en inglés?`, en, englishPool, { visual: emoji, count }));
    } else if (mode < 1 - writeChance) {
      // en → es: SIN emoji, porque revelaría el significado
      qs.push(textMC(`«${en}» significa…`, es, spanishPool, { count }));
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

function phraseQuestions(bank: P[], d: Difficulty, facilBank: V[], expertoBank?: P[]): Question[] {
  if (d === "facil") return vocabFacil(facilBank);
  if (d === "experto" && expertoBank) {
    return session(
      sample(expertoBank, 10).map(([prompt, answer, distractors, visual]) => ({
        kind: "mc" as const,
        prompt,
        visual,
        options: shuffle([answer, ...distractors]),
        answer,
      }))
    );
  }
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

// ═════════════════════════════════════════════════════════════
// CONTENIDO DE "MAESTROS" (experto) — inglés real de adultos:
// saludos de negocios, phrasal verbs, modismos y falsos amigos.
// ═════════════════════════════════════════════════════════════

const BUSINESS_GREETINGS_EXPERTO: P[] = [
  ["«Nice to meet you» significa…", "Mucho gusto en conocerte", ["Buenas noches", "Hasta luego", "¿Qué tal el clima?"], "🤝"],
  ["«Long time no see» significa…", "Cuánto tiempo sin verte", ["Buenos días", "Lo siento mucho", "Encantado, es la primera vez"], "👋"],
  ["«How's it going?» es una forma informal de preguntar…", "¿Cómo te va?", ["¿Adónde vas?", "¿Qué hora es?", "¿Cuál es tu nombre?"], "💬"],
  ["«Take care» se usa para…", "Despedirte deseando que alguien esté bien", ["Pedir ayuda urgente", "Presentarte formalmente", "Pedir disculpas"], "👋"],
  ["«What's up?» es una forma informal de decir…", "¿Qué tal? / ¿Qué onda?", ["¿Dónde está?", "¿Cuánto cuesta?", "¿A qué hora es?"], "🙋"],
  ["En un correo formal en inglés, ¿cómo se empieza en vez de «Hi»?", "«Dear Mr./Ms. [Apellido]»", ["«Yo!»", "«Hey dude»", "«What's up»"], "✉️"],
  ["«I look forward to hearing from you» se usa típicamente para…", "Cerrar un correo formal, esperando una respuesta", ["Pedir perdón", "Saludar por primera vez", "Cancelar una reunión"], "📧"],
  ["«Let's touch base next week» significa…", "Volver a comunicarnos / hablar brevemente la próxima semana", ["Tocar algo físicamente", "Terminar el proyecto", "Cancelar la reunión"], "📅"],
];

const PHRASAL_VERBS_EXPERTO: P[] = [
  ["«Look after» significa…", "Cuidar de alguien o algo", ["Buscar algo", "Mirar hacia arriba", "Odiar algo"], "👀"],
  ["«Look for» significa…", "Buscar algo", ["Cuidar de algo", "Admirar algo", "Ignorar algo"], "🔍"],
  ["«Give up» significa…", "Rendirse, dejar de intentar", ["Regalar algo", "Levantarse", "Empezar algo nuevo"], "🏳️"],
  ["«Get up» significa…", "Levantarse", ["Sentarse", "Acostarse", "Vestirse"], "🛏️"],
  ["«Turn off» significa…", "Apagar algo", ["Encender algo", "Girar hacia otro lado", "Abrir algo"], "🔌"],
  ["«Find out» significa…", "Descubrir o averiguar algo", ["Perder algo", "Encontrar un objeto físico", "Salir de un lugar"], "🕵️"],
  ["«Put off» significa…", "Posponer, dejar para después", ["Apagar la luz", "Vestirse rápido", "Terminar de inmediato"], "⏰"],
  ["«Run into» significa…", "Encontrarse con alguien por casualidad", ["Correr hacia adentro", "Chocar a propósito", "Salir corriendo"], "🏃"],
];

const REAL_IDIOMS_EXPERTO: P[] = [
  ["«It's raining cats and dogs» significa…", "Está lloviendo muchísimo", ["Hay animales en la calle", "Es un día soleado", "Va a nevar pronto"], "🌧️"],
  ["«Break the ice» significa…", "Iniciar una conversación para reducir la tensión inicial", ["Romper hielo literalmente", "Enojarse mucho", "Terminar una relación"], "🧊"],
  ["«Cost an arm and a leg» significa…", "Ser muy caro", ["Ser gratis", "Doler físicamente", "Ser fácil de conseguir"], "💰"],
  ["«Under the weather» significa…", "Sentirse un poco enfermo", ["Estar afuera con lluvia", "Estar muy feliz", "Tener mucho calor"], "🤒"],
  ["FALSO AMIGO: en inglés «actually» significa 'en realidad'. ¿A qué palabra española NO equivale, aunque se parezca?", "«Actualmente»", ["«En verdad»", "«De hecho»", "«Realmente»"], "⚠️"],
  ["FALSO AMIGO: en inglés «embarrassed» significa 'avergonzado'. ¿A qué palabra española NO equivale, aunque se parezca?", "«Embarazada»", ["«Apenado»", "«Incómodo»", "«Apenada»"], "⚠️"],
  ["«Once in a blue moon» significa…", "Muy de vez en cuando, casi nunca", ["Todas las noches", "Una vez al mes exacto", "Siempre que hay luna llena"], "🌙"],
  ["«Piece of cake» significa…", "Algo muy fácil de hacer", ["Un postre delicioso", "Algo muy difícil", "Una mala noticia"], "🍰"],
];

export const ENGLISH_LEVELS: LevelDef[] = [
  { name: "Colors & Numbers", emoji: "🌈", desc: "Colores y números del 1 al 10", tier: 1, gen: (d) => vocabQuestions(COLORS_NUMBERS, d) },
  { name: "Animals", emoji: "🦁", desc: "Los animales en inglés", tier: 1, gen: (d) => vocabQuestions(ANIMALS, d) },
  { name: "Shapes & Feelings", emoji: "⭐", desc: "Formas y emociones básicas", tier: 1, gen: (d) => vocabQuestions(d === "facil" ? SHAPES_WORDS : [...SHAPES_WORDS, ...FEELINGS], d) },
  { name: "My Family", emoji: "👨‍👩‍👧‍👦", desc: "La familia y los amigos", tier: 1, gen: (d) => vocabQuestions(FAMILY, d) },
  { name: "Food", emoji: "🍎", desc: "Comidas y bebidas", tier: 1, gen: (d) => vocabQuestions(FOOD, d) },
  { name: "My Body", emoji: "🙌", desc: "Las partes del cuerpo", tier: 2, gen: (d) => vocabQuestions(BODY, d) },
  { name: "School & Home", emoji: "🏫", desc: "Objetos de la escuela y la casa", tier: 2, gen: (d) => vocabQuestions(SCHOOL_HOME, d) },
  { name: "Action Words", emoji: "🏃", desc: "Verbos de acción", tier: 2, gen: (d) => vocabQuestions(VERBS, d) },
  { name: "Hello!", emoji: "👋", desc: "Saludos y presentaciones", tier: 2, gen: (d) => phraseQuestions(GREETINGS, d, FEELINGS, BUSINESS_GREETINGS_EXPERTO) },
  { name: "Where Is It?", emoji: "🧭", desc: "Posiciones y opuestos", tier: 3, gen: (d) => phraseQuestions(PREPOSITIONS, d, OPPOSITES_BASIC, PHRASAL_VERBS_EXPERTO) },
  { name: "Real Phrases", emoji: "💬", desc: "Frases completas de la vida real", tier: 3, gen: (d) => phraseQuestions(PHRASES, d, ANIMALS, REAL_IDIOMS_EXPERTO) },
];
