import type { LevelDef, Question } from "../types";
import { sample, session, shuffle, textMC, tf } from "./utils";

// ─────────────────────────────────────────────────────────────
// LENGUA — 8 niveles: sílabas, ortografía, vocabulario,
// gramática y comprensión lectora
// ─────────────────────────────────────────────────────────────

// [palabra, sílabas]
const SYLLABLES: [string, number][] = [
  ["sol", 1], ["pan", 1], ["flor", 1], ["tren", 1], ["luz", 1],
  ["gato", 2], ["mesa", 2], ["libro", 2], ["nube", 2], ["playa", 2],
  ["pelota", 3], ["ventana", 3], ["camisa", 3], ["zapato", 3], ["montaña", 3],
  ["mariposa", 4], ["chocolate", 4], ["elefante", 4], ["bicicleta", 4], ["caramelo", 4],
  ["computadora", 5], ["refrigerador", 5], ["hipopótamo", 5],
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

// ── generadores ──────────────────────────────────────────────

function genSyllables(): Question[] {
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

function genSpelling(bank: [string, string][]): () => Question[] {
  return () =>
    session(
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
}

function genPairs(bank: [string, string, string[]][], label: string): (d: import("../types").Difficulty) => Question[] {
  const allWrong = bank.flatMap((b) => b[2]);
  return (d) =>
    session(
      sample(bank, 10).map(([word, right, wrong]) => {
        let options = [right, ...wrong];
        // en difícil se agregan distractores de otras palabras
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
}

function genWordClass(): Question[] {
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

function genReading(): Question[] {
  return sample(READING, 6).map(([text, q, right, wrong]) => ({
    kind: "mc" as const,
    prompt: `📖 ${text}\n\n${q}`,
    options: shuffle([right, ...wrong]),
    answer: right,
  }));
}

function genSayings(): Question[] {
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
  { name: "Sílabas Saltarinas", emoji: "👏", desc: "Cuenta las sílabas de cada palabra", tier: 1, gen: genSyllables },
  { name: "B o V", emoji: "✏️", desc: "Ortografía: palabras con B y V", tier: 1, gen: genSpelling(SPELL_BV) },
  { name: "Cazafaltas", emoji: "🔍", desc: "Ortografía: H, G/J, C/S/Z", tier: 2, gen: genSpelling(SPELL_MIX) },
  { name: "Palabras Gemelas", emoji: "👯", desc: "Sinónimos: palabras que significan lo mismo", tier: 2, gen: genPairs(SYNONYMS, "Elige el sinónimo") },
  { name: "Mundos Opuestos", emoji: "🔄", desc: "Antónimos: palabras contrarias", tier: 2, gen: genPairs(ANTONYMS, "Elige el antónimo") },
  { name: "Detective Gramatical", emoji: "🕵️", desc: "Sustantivos, verbos y adjetivos", tier: 2, gen: genWordClass },
  { name: "Historias Secretas", emoji: "📖", desc: "Lee y comprende pequeñas historias", tier: 3, gen: genReading },
  { name: "Sabiduría Popular", emoji: "🦉", desc: "Refranes y frases hechas", tier: 3, gen: genSayings },
];
