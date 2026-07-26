import type { Difficulty, LevelDef, Question } from "../types";
import { pick, sample, session, shuffle, tf } from "./utils";

// ─────────────────────────────────────────────────────────────
// LENGUA — 8 niveles, adaptados a 3 edades:
//   facil (Menores de 5)  → habilidades de PRE-lectura: contar
//                           sílabas por oído, reconocer letras,
//                           rimas, opuestos, sonidos de animales,
//                           cuentitos cortos y adivinanzas — todo
//                           narrado en voz alta, cero lectura.
//   normal / dificil       → ortografía, gramática y comprensión.
// ─────────────────────────────────────────────────────────────

type D = Difficulty;
type MC = [prompt: string, answer: string, wrong: string[], visual?: string, explain?: string];
function mcQuestion([prompt, answer, wrong, visual, explain]: MC): Question {
  return { kind: "mc", prompt, visual, options: shuffle([answer, ...wrong]), answer, explain };
}

// [palabra, sílabas]
const SYLLABLES: [string, number][] = [
  ["sol", 1], ["pan", 1], ["flor", 1], ["tren", 1], ["luz", 1],
  ["gato", 2], ["mesa", 2], ["libro", 2], ["nube", 2], ["playa", 2],
  ["pelota", 3], ["ventana", 3], ["camisa", 3], ["zapato", 3], ["montaña", 3],
  ["mariposa", 4], ["chocolate", 4], ["elefante", 4], ["bicicleta", 4], ["caramelo", 4],
  ["computadora", 5], ["refrigerador", 5], ["hipopótamo", 5],
];

// palabras cortas con emoji, para contar sílabas escuchando (menores de 5)
const SYLLABLES_FACIL: [word: string, n: number, emoji: string][] = [
  ["sol", 1, "☀️"], ["pan", 1, "🍞"], ["luz", 1, "💡"], ["flor", 1, "🌸"], ["pez", 1, "🐟"],
  ["gato", 2, "🐱"], ["oso", 2, "🐻"], ["mano", 2, "✋"], ["ojo", 2, "👁️"], ["casa", 2, "🏠"],
  ["pelota", 3, "⚽"], ["zapato", 3, "👟"], ["tortuga", 3, "🐢"],
  ["mariposa", 4, "🦋"], ["elefante", 4, "🐘"],
];

// [correcta, incorrecta]
const SPELL_BV: [string, string][] = [
  ["vaca", "baca"], ["boca", "voca"], ["viento", "biento"], ["barco", "varco"],
  ["ventana", "bentana"], ["bueno", "vueno"], ["invierno", "inbierno"], ["árbol", "árvol"],
  ["viaje", "biaje"], ["botella", "votella"], ["nieve", "niebe"], ["caballo", "cavallo"],
  ["libro", "livro"], ["favor", "fabor"],
];

const SPELL_MIX: [string, string][] = [
  ["hola", "ola (saludo)"], ["huevo", "uevo"], ["hormiga", "ormiga"], ["ahora", "aora"],
  ["girasol", "jirasol"], ["jirafa", "girafa"], ["gente", "jente"], ["dibujo", "dibugo"],
  ["zapato", "sapato"], ["cielo", "sielo"], ["cocina", "cosina"], ["cabeza", "cabesa"],
  ["hacer", "aser"], ["felicidad", "felisidad"], ["corazón", "corasón"], ["queso", "keso"],
];

// nombres de las letras en español, para leerlas en voz alta
const LETTER_NAME: Record<string, string> = {
  A: "a", E: "e", I: "i", O: "o", U: "u",
  B: "be", V: "uve", D: "de", P: "pe", Q: "cu",
  H: "hache", G: "ge", J: "jota", C: "ce", S: "ese", Z: "zeta",
  M: "eme", N: "ene", L: "ele", R: "erre", T: "te", F: "efe",
};
const CONFUSABLE_POOL = ["A", "E", "I", "O", "U", "D", "P", "Q", "M", "N", "L", "R", "T", "F"];

/** Reconoce una letra por su nombre (dictado por voz): base de la pre-lectura. */
function qLetter(targetLetters: string[]): Question {
  const letter = pick(targetLetters);
  const others = sample(
    CONFUSABLE_POOL.filter((l) => l !== letter && !targetLetters.includes(l)),
    2
  );
  const extra = targetLetters.filter((l) => l !== letter);
  const wrong = [...others, ...extra].slice(0, 2);
  return {
    kind: "mc",
    prompt: `¿Cuál es la letra ${LETTER_NAME[letter] ?? letter}?`,
    options: shuffle([letter, ...wrong]),
    answer: letter,
  };
}

// pares que riman (todos con imagen), para "Palabras Gemelas" en menores de 5
const RHYMES: [word: string, emoji: string][][] = [
  [["gato", "🐱"], ["pato", "🦆"]],
  [["ratón", "🐭"], ["camión", "🚚"]],
  [["pastel", "🍰"], ["papel", "📄"]],
  [["flor", "🌸"], ["amor", "❤️"]],
  [["queso", "🧀"], ["beso", "😘"]],
];
function qRhyme(): Question {
  const pairIdx = ri0(RHYMES.length);
  const pair = RHYMES[pairIdx];
  const [target, correct] = Math.random() < 0.5 ? [pair[0], pair[1]] : [pair[1], pair[0]];
  const otherEmojis = RHYMES.filter((_, i) => i !== pairIdx).flatMap((p) => [p[0][1], p[1][1]]);
  const wrong = sample(otherEmojis, 2);
  return {
    kind: "mc",
    prompt: `¿Qué rima con «${target[0]}»?`,
    visual: target[1],
    options: shuffle([correct[1], ...wrong]),
    answer: correct[1],
  };
}
function ri0(max: number): number {
  return Math.floor(Math.random() * max);
}

// opuestos 100% visuales, para "Mundos Opuestos" en menores de 5
const OPPOSITES_VISUAL: [word: string, emoji: string, oppWord: string, oppEmoji: string][] = [
  ["grande", "🐘", "pequeño", "🐜"],
  ["día", "☀️", "noche", "🌙"],
  ["arriba", "⬆️", "abajo", "⬇️"],
  ["feliz", "😊", "triste", "😢"],
  ["caliente", "🔥", "frío", "❄️"],
  ["rápido", "🐆", "lento", "🐢"],
];
function qOppositeVisual(): Question {
  const idx = ri0(OPPOSITES_VISUAL.length);
  const [word, emoji, , oppEmoji] = OPPOSITES_VISUAL[idx];
  const others = OPPOSITES_VISUAL.filter((_, i) => i !== idx).map((o) => (Math.random() < 0.5 ? o[1] : o[3]));
  const wrong = sample([emoji, ...others], 2);
  return {
    kind: "mc",
    prompt: `¿Cuál es lo CONTRARIO de «${word}»?`,
    options: shuffle([oppEmoji, ...wrong]),
    answer: oppEmoji,
  };
}

// sonidos de animales, para "Detective Gramatical" en menores de 5
const ANIMAL_SOUNDS: [sound: string, emoji: string][] = [
  ["guau guau", "🐶"], ["miau", "🐱"], ["muu", "🐮"], ["oink oink", "🐷"],
  ["quiquiriquí", "🐔"], ["croac croac", "🐸"], ["beeee", "🐑"], ["hiii hiii", "🐴"],
];
function qAnimalSound(): Question {
  const [sound, emoji] = pick(ANIMAL_SOUNDS);
  const wrong = sample(
    ANIMAL_SOUNDS.filter((a) => a[1] !== emoji).map((a) => a[1]),
    2
  );
  return {
    kind: "mc",
    prompt: `¿Quién dice «${sound}»?`,
    options: shuffle([emoji, ...wrong]),
    answer: emoji,
  };
}

// [palabra, sinónimo, distractores]
const SYNONYMS: [string, string, string[]][] = [
  ["contento", "feliz", ["triste", "enojado", "cansado"]],
  ["bonito", "hermoso", ["feo", "grande", "sucio"]],
  ["rápido", "veloz", ["lento", "pesado", "alto"]],
  ["hablar", "conversar", ["callar", "correr", "dormir"]],
  ["casa", "hogar", ["calle", "escuela", "auto"]],
  ["miedo", "temor", ["valor", "alegría", "sueño"]],
  ["comenzar", "empezar", ["terminar", "parar", "seguir"]],
  ["caminar", "andar", ["saltar", "volar", "nadar"]],
  ["enojado", "furioso", ["tranquilo", "contento", "dormido"]],
  ["inteligente", "listo", ["torpe", "lento", "callado"]],
  ["pequeño", "diminuto", ["enorme", "ancho", "largo"]],
  ["brillar", "resplandecer", ["apagar", "oscurecer", "cerrar"]],
];

const ANTONYMS: [string, string, string[]][] = [
  ["día", "noche", ["tarde", "sol", "hora"]],
  ["grande", "pequeño", ["enorme", "gigante", "alto"]],
  ["frío", "caliente", ["helado", "fresco", "tibio"]],
  ["subir", "bajar", ["trepar", "saltar", "escalar"]],
  ["abrir", "cerrar", ["entrar", "salir", "empujar"]],
  ["lleno", "vacío", ["completo", "cargado", "pesado"]],
  ["rápido", "lento", ["veloz", "ligero", "ágil"]],
  ["reír", "llorar", ["sonreír", "cantar", "gritar"]],
  ["fácil", "difícil", ["sencillo", "simple", "claro"]],
  ["limpio", "sucio", ["brillante", "nuevo", "ordenado"]],
  ["fuerte", "débil", ["duro", "firme", "valiente"]],
  ["primero", "último", ["segundo", "siguiente", "próximo"]],
];

// [palabra en contexto, clase]
const WORD_CLASS: [string, "sustantivo" | "verbo" | "adjetivo"][] = [
  ["perro", "sustantivo"], ["correr", "verbo"], ["azul", "adjetivo"],
  ["montaña", "sustantivo"], ["saltar", "verbo"], ["enorme", "adjetivo"],
  ["escuela", "sustantivo"], ["cantar", "verbo"], ["divertido", "adjetivo"],
  ["estrella", "sustantivo"], ["escribir", "verbo"], ["valiente", "adjetivo"],
  ["ciudad", "sustantivo"], ["dormir", "verbo"], ["suave", "adjetivo"],
  ["música", "sustantivo"], ["pintar", "verbo"], ["antiguo", "adjetivo"],
];

// [texto, pregunta, respuesta, distractores]
const READING: [string, string, string, string[]][] = [
  [
    "Nina encontró un mapa en el desván. El mapa mostraba un tesoro escondido bajo el roble más viejo del parque. Esa tarde tomó una pala y fue a buscarlo.",
    "¿Dónde estaba escondido el tesoro?",
    "Bajo el roble más viejo del parque",
    ["En el desván", "En la casa de Nina", "Bajo un pino del bosque"],
  ],
  [
    "Tomás cuida un huerto con su abuela. Cada mañana riegan los tomates y quitan las malas hierbas. En verano recogen la cosecha y preparan una ensalada gigante.",
    "¿Qué hacen cada mañana?",
    "Riegan los tomates y quitan hierbas",
    ["Preparan una ensalada", "Venden tomates", "Plantan árboles"],
  ],
  [
    "El dragón Chispa no sabía volar. Practicaba todos los días desde una roca baja. Un día, una ráfaga de viento lo levantó y descubrió que ya podía planear.",
    "¿Cómo descubrió Chispa que podía planear?",
    "Una ráfaga de viento lo levantó",
    ["Se lo enseñó otro dragón", "Saltó desde una montaña", "Leyó un libro de vuelo"],
  ],
  [
    "Marina colecciona caracolas. Las ordena por tamaño en una repisa. Su favorita es una caracola rosada que suena como el mar cuando la acercas a la oreja.",
    "¿Cómo ordena Marina sus caracolas?",
    "Por tamaño",
    ["Por color", "Por forma", "Por antigüedad"],
  ],
  [
    "El robot Bip trabajaba en una panadería. Amasaba el pan con sus brazos de metal, pero siempre quemaba las galletas. Un día instaló un sensor de calor y sus galletas se volvieron famosas.",
    "¿Qué problema tenía Bip?",
    "Quemaba las galletas",
    ["No sabía amasar", "Llegaba tarde", "Rompía los hornos"],
  ],
  [
    "En invierno, la ardilla Nuez busca los tesoros que enterró en otoño: bellotas y semillas. A veces olvida dónde los escondió, y de esos olvidos nacen árboles nuevos.",
    "¿Qué pasa cuando Nuez olvida sus escondites?",
    "Nacen árboles nuevos",
    ["Pierde su casa", "Pasa hambre todo el año", "Otro animal se los roba"],
  ],
  [
    "Lucas quería ser astronauta. Construyó un cohete de cartón en su patio y cada noche estudiaba las estrellas con un telescopio pequeño. Su constelación favorita era la Osa Mayor.",
    "¿Cuál era la constelación favorita de Lucas?",
    "La Osa Mayor",
    ["Orión", "La Cruz del Sur", "La Osa Menor"],
  ],
  [
    "La bibliotecaria del pueblo viaja en una bicicleta llena de libros. Visita las casas más lejanas para que todos los niños puedan leer, aunque vivan en la montaña.",
    "¿Para qué viaja la bibliotecaria?",
    "Para que todos los niños puedan leer",
    ["Para vender libros", "Para hacer ejercicio", "Para visitar a su familia"],
  ],
];

// cuentitos de UNA frase con respuesta 100% visual, para menores de 5
const SIMPLE_STORIES: [story: string, question: string, answer: string, wrong: string[]][] = [
  ["Ana tiene un perrito café y un gatito blanco.", "¿De qué color es el gatito de Ana?", "⚪", ["🟤", "⚫"]],
  ["Leo tiene tres globos de colores para su fiesta.", "¿Cuántos globos tiene Leo?", "3", ["2", "5"]],
  ["El gato duerme en la cama y el perro juega en el jardín.", "¿Quién juega en el jardín?", "🐶", ["🐱", "🐰"]],
  ["Mamá compró dos manzanas rojas en el mercado.", "¿Cuántas manzanas compró mamá?", "2", ["1", "4"]],
  ["El pájaro azul canta feliz en el árbol.", "¿De qué color es el pájaro?", "🔵", ["🟡", "🟢"]],
  ["Sofía tiene mucho frío y se pone un abrigo calentito.", "¿Sofía tiene frío o calor?", "❄️", ["🔥"]],
];

const SAYINGS: [string, string, string[]][] = [
  ["«Más vale tarde que nunca» significa…", "Es mejor hacerlo tarde que no hacerlo", ["Nunca llegues tarde", "Lo tarde no sirve", "Hay que ser puntual"]],
  ["«Al mal tiempo, buena cara» significa…", "Ser positivo ante los problemas", ["Salir cuando llueve", "Sonreír siempre a todos", "El clima cambia rápido"]],
  ["«Quien mucho abarca, poco aprieta» significa…", "Hacer demasiadas cosas a la vez sale mal", ["Hay que abrazar fuerte", "Es bueno hacer de todo", "Apretar cansa mucho"]],
  ["«De tal palo, tal astilla» significa…", "Los hijos se parecen a sus padres", ["Los árboles dan madera", "Todo se rompe igual", "Cada palo es distinto"]],
  ["«El que madruga…» se completa con…", "Dios lo ayuda", ["pierde el sueño", "llega cansado", "ve el amanecer"]],
  ["«Está en las nubes» significa que alguien…", "Está distraído", ["Es piloto", "Está muy alto", "Es soñador de noche"]],
  ["«Ser pan comido» significa que algo es…", "Muy fácil", ["Delicioso", "Muy caro", "Aburrido"]],
  ["«Tener memoria de elefante» significa…", "Recordar todo muy bien", ["Tener la cabeza grande", "Ser muy fuerte", "Caminar lento"]],
  ["«Hablar hasta por los codos» significa…", "Hablar muchísimo", ["Hablar con las manos", "Gritar fuerte", "Hablar en secreto"]],
  ["«Estar como pez en el agua» significa…", "Sentirse muy cómodo", ["Saber nadar", "Tener mucha sed", "Estar mojado"]],
];

// adivinanzas con respuesta en imagen, para "Sabiduría Popular" en menores de 5
const RIDDLES_FACIL: [clue: string, answer: string, wrong: string[]][] = [
  ["Vuelo sin ser pájaro y tengo alas de colores. ¿Quién soy?", "🦋", ["🐝", "🐦"]],
  ["Doy leche y digo muu. ¿Quién soy?", "🐮", ["🐶", "🐱"]],
  ["Brillo de día y caliento el mundo. ¿Quién soy?", "☀️", ["🌙", "⭐"]],
  ["Tengo ocho patas y tejo mi telaraña. ¿Quién soy?", "🕷️", ["🐝", "🐜"]],
  ["Nado en el agua y tengo escamas. ¿Quién soy?", "🐟", ["🐦", "🐰"]],
  ["Salgo de noche y brillo en el cielo oscuro. ¿Quién soy?", "🌙", ["☀️", "⭐"]],
];

// ═════════════════════════════════════════════════════════════
// CONTENIDO DE "MAESTROS" (experto) — español real de adultos:
// acentuación, tildes diacríticas, vocabulario culto y figuras
// retóricas — los errores más comunes que cometen hasta los
// hablantes nativos.
// ═════════════════════════════════════════════════════════════

const STRESS_WORDS: [string, "aguda" | "grave" | "esdrújula"][] = [
  ["camión", "aguda"], ["reloj", "aguda"], ["café", "aguda"], ["jamás", "aguda"],
  ["compró", "aguda"], ["salón", "aguda"], ["papá", "aguda"], ["colibrí", "aguda"],
  ["mesa", "grave"], ["árbol", "grave"], ["fácil", "grave"], ["lápiz", "grave"],
  ["azúcar", "grave"], ["ángel", "grave"], ["cárcel", "grave"], ["túnel", "grave"],
  ["música", "esdrújula"], ["médico", "esdrújula"], ["rápido", "esdrújula"], ["teléfono", "esdrújula"],
  ["cámara", "esdrújula"], ["catástrofe", "esdrújula"], ["árbitro", "esdrújula"], ["sábana", "esdrújula"],
];
const STRESS_EXPLAIN: Record<string, string> = {
  aguda: "Las agudas llevan el acento en la ÚLTIMA sílaba (y se tildan si terminan en n, s o vocal).",
  grave: "Las graves (o llanas) llevan el acento en la PENÚLTIMA sílaba (se tildan si NO terminan en n, s o vocal).",
  esdrújula: "Las esdrújulas llevan el acento en la ANTEPENÚLTIMA sílaba: siempre se tildan.",
};
function qStress(): Question {
  const [word, cls] = pick(STRESS_WORDS);
  return {
    kind: "mc",
    prompt: `¿Cómo se clasifica "${word}" según dónde lleva el acento (la sílaba tónica)?`,
    options: shuffle(["aguda", "grave", "esdrújula"]),
    answer: cls,
    explain: STRESS_EXPLAIN[cls],
  };
}
function genSyllablesExperto(): Question[] {
  return session(Array.from({ length: 10 }, qStress));
}

const DIACRITIC_MC: MC[] = [
  ["No ___ dónde guardé las llaves. (verbo saber)", "sé", ["se"], "🔑"],
  ["Él ___ lava las manos antes de comer. (pronombre reflexivo)", "se", ["sé"], "🧼"],
  ["¿Cuál es ___ mochila? (posesivo, 'de ti')", "tu", ["tú"], "🎒"],
  ["___ eres muy responsable. (pronombre personal, sujeto)", "tú", ["tu"], "🙋"],
  ["Quiero ir, ___ no puedo. (aunque, adversativo)", "mas", ["más"], "🚫"],
  ["Necesito ___ tiempo para terminar. (cantidad)", "más", ["mas"], "⏳"],
  ["___ vienes a la fiesta, avísame. (condicional 'si')", "Si", ["Sí"], "❓"],
  ["___ , quiero ir a la fiesta. (afirmación)", "Sí", ["Si"], "✅"],
  ["Quiero que me ___ tu opinión. (verbo dar)", "dé", ["de"], "🎁"],
  ["Este regalo es ___ mi hermana. (preposición)", "de", ["dé"], "👧"],
];

const PORQUE_MC: MC[] = [
  ["No entendí ___ llegaste tarde. (pregunta indirecta: '¿por cuál razón?')", "por qué", ["porque", "porqué", "por que"], "❓"],
  ["Llegué tarde ___ había mucho tráfico. (da la razón, equivale a 'ya que')", "porque", ["por qué", "porqué", "por que"], "🚗"],
  ["No entiendo el ___ de tu decisión. (sustantivo: 'el motivo')", "porqué", ["por qué", "porque", "por que"], "🤔"],
  ["Ese es el motivo ___ me preocupo. ('por' + 'que' relativo, equivale a 'por el cual')", "por que", ["porque", "por qué", "porqué"], "📋"],
];

const OTHER_HOMOPHONES_MC: MC[] = [
  ["No quiero ir al cine, ___ prefiero quedarme en casa. (contraste fuerte tras negación)", "sino", ["si no"], "🎬"],
  ["___ terminas la tarea, no podrás salir a jugar. (condicional)", "Si no", ["Sino"], "📚"],
  ["Puedes ir a ___ quieras de vacaciones. (lugar, 'a qué lugar')", "adonde", ["a donde"], "✈️"],
  ["Fuimos a ver la casa ___ vivías de niño. (relativo, 'lugar en el que')", "a donde", ["adonde"], "🏠"],
];

function genSpellingExperto(): Question[] {
  const bank: MC[] = [...DIACRITIC_MC, ...PORQUE_MC, ...OTHER_HOMOPHONES_MC];
  return session(
    sample(bank, 10).map(([prompt, answer, wrong, visual, explain]) => ({
      kind: "mc" as const,
      prompt,
      visual,
      options: shuffle([answer, ...wrong]),
      answer,
      explain,
    }))
  );
}

const SYNONYMS_EXPERTO: [string, string, string[]][] = [
  ["efímero", "pasajero", ["eterno", "sólido", "ruidoso"]],
  ["ubicuo", "omnipresente", ["ausente", "escaso", "único"]],
  ["parco", "escueto", ["extenso", "ruidoso", "lujoso"]],
  ["diáfano", "claro", ["opaco", "oscuro", "confuso"]],
  ["sagaz", "astuto", ["torpe", "ingenuo", "lento"]],
  ["yerto", "rígido", ["flexible", "blando", "cálido"]],
  ["prístino", "puro", ["contaminado", "usado", "viejo"]],
  ["lánguido", "débil", ["vigoroso", "fuerte", "veloz"]],
  ["locuaz", "hablador", ["callado", "tímido", "sordo"]],
  ["perspicaz", "agudo", ["torpe", "distraído", "lento"]],
  ["pródigo", "generoso", ["tacaño", "avaro", "mezquino"]],
  ["magnánimo", "noble", ["mezquino", "cruel", "egoísta"]],
];

const ANTONYMS_EXPERTO: [string, string, string[]][] = [
  ["efímero", "perpetuo", ["breve", "corto", "veloz"]],
  ["magnánimo", "mezquino", ["generoso", "amable", "noble"]],
  ["locuaz", "taciturno", ["hablador", "ruidoso", "gritón"]],
  ["pródigo", "tacaño", ["generoso", "amable", "gentil"]],
  ["sagaz", "ingenuo", ["astuto", "listo", "agudo"]],
  ["diáfano", "opaco", ["claro", "transparente", "nítido"]],
  ["lánguido", "vigoroso", ["débil", "cansado", "flojo"]],
  ["prístino", "corrompido", ["puro", "limpio", "nuevo"]],
  ["parco", "extravagante", ["escueto", "sobrio", "simple"]],
  ["perspicaz", "obtuso", ["agudo", "listo", "hábil"]],
];

const LITERARY_DEVICES_MC: MC[] = [
  ["«Sus ojos son dos luceros» es un ejemplo de…", "Metáfora", ["Símil", "Hipérbole", "Onomatopeya"], "✨", "La metáfora compara sin usar 'como': identifica una cosa con otra directamente."],
  ["«El viento susurraba secretos entre los árboles» es un ejemplo de…", "Personificación", ["Símil", "Hipérbole", "Metáfora"], "🌬️", "La personificación da cualidades humanas a algo que no lo es."],
  ["«Tan veloz como un rayo» es un ejemplo de…", "Símil (comparación)", ["Metáfora", "Hipérbole", "Personificación"], "⚡", "El símil compara usando 'como', 'cual' o 'tal cual'."],
  ["«Te lo he dicho un millón de veces» es un ejemplo de…", "Hipérbole (exageración)", ["Símil", "Metáfora", "Personificación"], "📢", "La hipérbole exagera intencionalmente para dar énfasis."],
  ["«El tictac del reloj» usa una palabra que…", "Imita un sonido: es una onomatopeya", ["Compara dos cosas", "Exagera la realidad", "Le da vida a un objeto"], "⏰"],
  ["«Ni contigo ni sin ti tienen mis males remedio» es un ejemplo de…", "Paradoja (una contradicción con sentido)", ["Rima simple", "Onomatopeya", "Aliteración"], "🔄", "La paradoja une ideas opuestas para expresar una verdad profunda."],
];

const READING_EXPERTO: [string, string, string, string[]][] = [
  [
    "La empresa anunció resultados mejores de lo esperado, pero las acciones cayeron un 5% ese mismo día. Los analistas explicaron que, si bien las ganancias fueron buenas, el crecimiento fue menor al que los inversores habían proyectado para el próximo trimestre.",
    "¿Por qué cayeron las acciones a pesar de las buenas ganancias?",
    "Porque el crecimiento proyectado fue menor al esperado",
    ["Porque la empresa tuvo pérdidas", "Porque los analistas se equivocaron en su reporte", "Porque los inversores vendieron por otro motivo no explicado"],
  ],
  [
    "Aunque el estudio mostró una correlación entre el consumo de cierto alimento y una mejor salud cardíaca, los investigadores fueron cautelosos: aclararon que se necesitan más estudios para determinar si existe una relación de causa y efecto.",
    "¿Qué advirtieron los investigadores sobre su hallazgo?",
    "Que una correlación no prueba necesariamente que una cosa cause la otra",
    ["Que el estudio fue un fracaso total", "Que el alimento es peligroso para el corazón", "Que ya está comprobado que el alimento mejora la salud"],
  ],
  [
    "El candidato prometió bajar impuestos y, al mismo tiempo, aumentar el gasto público en salud y educación sin explicar de dónde saldría el dinero adicional. Varios economistas cuestionaron la viabilidad matemática de ambas promesas juntas.",
    "¿Qué cuestionaron los economistas?",
    "Que las dos promesas fueran posibles de cumplir al mismo tiempo",
    ["Que bajar impuestos fuera legal", "Que el candidato no tuviera experiencia política", "Que el gasto en salud fuera innecesario"],
  ],
  [
    "El manual de la nueva herramienta indicaba que debía usarse únicamente con guantes de protección, pero el trabajador, apurado por terminar el turno, decidió omitir ese paso. Minutos después sufrió un corte que pudo haberse evitado.",
    "¿Cuál fue la causa principal del accidente, según el texto?",
    "No seguir la indicación de seguridad del manual por apuro",
    ["Un defecto de fábrica en la herramienta", "La falta de experiencia del trabajador", "Un error del supervisor"],
  ],
];

const SAYINGS_EXPERTO: [string, string, string[]][] = [
  ["«Statu quo» (locución latina usada en español) se refiere a…", "El estado actual de las cosas, sin cambios", ["Un tipo de acuerdo legal escrito", "Una crisis económica", "Un cargo político"]],
  ["«Grosso modo» significa…", "De manera aproximada, a grandes rasgos", ["Con todo detalle y precisión", "De forma oficial y legal", "Al revés de lo esperado"]],
  ["«A grandes males, grandes remedios» significa…", "Los problemas graves requieren soluciones igual de decididas", ["Es mejor no hacer nada ante un problema", "Los remedios caseros son siempre mejores", "Hay que exagerar cualquier problema pequeño"]],
  ["«Quien siembra vientos, recoge tempestades» significa…", "Las malas acciones traen consecuencias graves", ["Es bueno predecir el clima", "Sembrar es un trabajo difícil", "Las tormentas destruyen los cultivos"]],
  ["«No hay mal que por bien no venga» significa…", "Hasta de las situaciones difíciles puede salir algo positivo", ["Todo lo malo siempre empeora", "Nunca pasa nada bueno", "Hay que evitar todos los riesgos"]],
  ["«Ser la gota que colma el vaso» significa…", "El último detalle que hace estallar una situación ya tensa", ["Beber muy poca agua", "Ser muy generoso con los demás", "Llenar un vaso con cuidado"]],
];

// ── generadores ──────────────────────────────────────────────

function qSyllableFacil(): Question {
  const [word, n, emoji] = pick(SYLLABLES_FACIL);
  const others = ["1", "2", "3", "4"].filter((x) => Number(x) !== n);
  return {
    kind: "mc",
    prompt: `¿Cuántas partes tiene la palabra «${word}»? Di ${word} aplaudiendo`,
    visual: emoji,
    options: shuffle([String(n), ...sample(others, 2)]),
    answer: String(n),
    explain: `${word.toUpperCase()} tiene ${n} ${n === 1 ? "parte" : "partes"} al aplaudir.`,
  };
}

function genSyllables(d: D): Question[] {
  if (d === "facil") return session(Array.from({ length: 10 }, qSyllableFacil));
  return session(
    sample(SYLLABLES, 10).map(([word, n]) => {
      const others = ["1", "2", "3", "4", "5"].filter((x) => Number(x) !== n);
      return {
        kind: "mc" as const,
        prompt: `¿Cuántas sílabas tiene «${word}»?`,
        options: shuffle([String(n), ...sample(others, 3)]),
        answer: String(n),
      };
    })
  );
}

function genLetters(letters: string[]): (d: D) => Question[] {
  return () => session(Array.from({ length: 10 }, () => qLetter(letters)));
}

function genSpelling(bank: [string, string][]): (d: D) => Question[] {
  return (d) => {
    if (d === "facil") return genLetters(["B", "V"])(d);
    return session(
      sample(bank, 10).map(([good, bad]) => {
        if (Math.random() < 0.3) {
          const showGood = Math.random() < 0.5;
          return tf(`¿Está bien escrita la palabra «${showGood ? good : bad.replace(/ \(.+\)/, "")}»?`, showGood, {
            explain: `La forma correcta es «${good}».`,
          });
        }
        return {
          kind: "mc" as const,
          prompt: "¿Cuál está bien escrita?",
          options: shuffle([good, bad.replace(/ \(.+\)/, "")]),
          answer: good,
        };
      })
    );
  };
}

function genRhymesOrPairs(
  bank: [string, string, string[]][],
  label: string,
  expertoBank?: [string, string, string[]][]
): (d: D) => Question[] {
  const allWrong = [...new Set(bank.flatMap((b) => b[2]))];
  return (d) => {
    if (d === "facil") return session(Array.from({ length: 10 }, qRhyme));
    if (d === "experto" && expertoBank) {
      const allWrongExperto = [...new Set(expertoBank.flatMap((b) => b[2]))];
      return session(
        sample(expertoBank, 10).map(([word, right, wrong]) => {
          const extra = sample(allWrongExperto.filter((w) => ![right, ...wrong].includes(w) && w !== word), 2);
          return {
            kind: "mc" as const,
            prompt: `${label} de «${word}»`,
            options: shuffle([right, ...wrong, ...extra]),
            answer: right,
          };
        })
      );
    }
    return session(
      sample(bank, 10).map(([word, right, wrong]) => {
        let options = [right, ...wrong];
        if (d === "dificil") {
          const extra = sample(allWrong.filter((w) => !options.includes(w) && w !== word), 2);
          options = [...options, ...extra];
        }
        return {
          kind: "mc" as const,
          prompt: `${label} de «${word}»`,
          options: shuffle(options),
          answer: right,
        };
      })
    );
  };
}

function genOpposites(bank: [string, string, string[]][], expertoBank?: [string, string, string[]][]): (d: D) => Question[] {
  const allWrong = [...new Set(bank.flatMap((b) => b[2]))];
  return (d) => {
    if (d === "facil") return session(Array.from({ length: 10 }, qOppositeVisual));
    if (d === "experto" && expertoBank) {
      const allWrongExperto = [...new Set(expertoBank.flatMap((b) => b[2]))];
      return session(
        sample(expertoBank, 10).map(([word, right, wrong]) => {
          const extra = sample(allWrongExperto.filter((w) => ![right, ...wrong].includes(w) && w !== word), 2);
          return {
            kind: "mc" as const,
            prompt: `Elige el antónimo de «${word}»`,
            options: shuffle([right, ...wrong, ...extra]),
            answer: right,
          };
        })
      );
    }
    return session(
      sample(bank, 10).map(([word, right, wrong]) => {
        let options = [right, ...wrong];
        if (d === "dificil") {
          const extra = sample(allWrong.filter((w) => !options.includes(w) && w !== word), 2);
          options = [...options, ...extra];
        }
        return {
          kind: "mc" as const,
          prompt: `Elige el antónimo de «${word}»`,
          options: shuffle(options),
          answer: right,
        };
      })
    );
  };
}

function genWordClass(d: D): Question[] {
  if (d === "facil") return session(Array.from({ length: 10 }, qAnimalSound));
  if (d === "experto") return session(sample(LITERARY_DEVICES_MC, 6).map(mcQuestion));
  return session(
    sample(WORD_CLASS, 10).map(([word, cls]) => ({
      kind: "mc" as const,
      prompt: `«${word}» es un…`,
      options: shuffle(["sustantivo", "verbo", "adjetivo"]),
      answer: cls,
      explain:
        cls === "sustantivo"
          ? "Los sustantivos nombran cosas, personas o lugares."
          : cls === "verbo"
            ? "Los verbos son acciones."
            : "Los adjetivos dicen cómo es algo.",
    }))
  );
}

function genReading(d: D): Question[] {
  if (d === "facil") {
    return sample(SIMPLE_STORIES, 6).map(([story, question, answer, wrong]) => ({
      kind: "mc" as const,
      prompt: `${story} ${question}`,
      options: shuffle([answer, ...wrong]),
      answer,
    }));
  }
  if (d === "experto") {
    return sample(READING_EXPERTO, 4).map(([text, q, right, wrong]) => ({
      kind: "mc" as const,
      prompt: `📖 ${text}\n\n${q}`,
      options: shuffle([right, ...wrong]),
      answer: right,
    }));
  }
  return sample(READING, 6).map(([text, q, right, wrong]) => ({
    kind: "mc" as const,
    prompt: `📖 ${text}\n\n${q}`,
    options: shuffle([right, ...wrong]),
    answer: right,
  }));
}

function genSayings(d: D): Question[] {
  if (d === "facil") {
    return session(
      sample(RIDDLES_FACIL, 10).map(([clue, answer, wrong]) => ({
        kind: "mc" as const,
        prompt: clue,
        options: shuffle([answer, ...wrong]),
        answer,
      }))
    );
  }
  if (d === "experto") {
    return session(
      sample(SAYINGS_EXPERTO, 6).map(([prompt, right, wrong]) => ({
        kind: "mc" as const,
        prompt,
        options: shuffle([right, ...wrong]),
        answer: right,
      }))
    );
  }
  return session(
    sample(SAYINGS, 10).map(([prompt, right, wrong]) => ({
      kind: "mc" as const,
      prompt,
      options: shuffle([right, ...wrong]),
      answer: right,
    }))
  );
}

export const LANGUAGE_LEVELS: LevelDef[] = [
  { name: "Sílabas Saltarinas", emoji: "👏", desc: "Cuenta las sílabas de cada palabra", tier: 1, gen: (d) => (d === "experto" ? genSyllablesExperto() : genSyllables(d)) },
  { name: "B o V", emoji: "✏️", desc: "Ortografía: palabras con B y V", tier: 1, gen: (d) => (d === "experto" ? genSpellingExperto() : genSpelling(SPELL_BV)(d)) },
  { name: "Cazafaltas", emoji: "🔍", desc: "Ortografía: H, G/J, C/S/Z", tier: 2, gen: (d) => (d === "facil" ? genLetters(["H", "G", "J", "C", "S", "Z"])(d) : d === "experto" ? genSpellingExperto() : genSpelling(SPELL_MIX)(d)) },
  { name: "Palabras Gemelas", emoji: "👯", desc: "Sinónimos y rimas: palabras que suenan o significan parecido", tier: 2, gen: genRhymesOrPairs(SYNONYMS, "Elige el sinónimo", SYNONYMS_EXPERTO) },
  { name: "Mundos Opuestos", emoji: "🔄", desc: "Antónimos: palabras contrarias", tier: 2, gen: genOpposites(ANTONYMS, ANTONYMS_EXPERTO) },
  { name: "Detective Gramatical", emoji: "🕵️", desc: "Sustantivos, verbos, adjetivos y sonidos de animales", tier: 2, gen: genWordClass },
  { name: "Historias Secretas", emoji: "📖", desc: "Escucha y comprende pequeñas historias", tier: 3, gen: genReading },
  { name: "Sabiduría Popular", emoji: "🦉", desc: "Refranes, frases hechas y adivinanzas", tier: 3, gen: genSayings },
];
