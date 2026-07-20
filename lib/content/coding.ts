import type { LevelDef, Question } from "../types";
import { ri, pick, sample, session, shuffle, typed, order, numMC } from "./utils";

// ─────────────────────────────────────────────────────────────
// PROGRAMACIÓN Y LÓGICA — 8 niveles de pensamiento
// computacional (como en Estonia y Finlandia): secuencias,
// patrones, bucles, condicionales, bugs, algoritmos y binario
// ─────────────────────────────────────────────────────────────

// Secuencias de la vida real para ordenar
const SEQUENCES: [string, string[]][] = [
  ["Ordena los pasos para lavarte los dientes", ["Poner pasta en el cepillo", "Cepillar los dientes", "Enjuagar la boca", "Guardar el cepillo"]],
  ["Ordena los pasos para hacer un sándwich", ["Sacar el pan", "Poner el queso", "Tapar con la otra rebanada", "Comer el sándwich"]],
  ["Ordena los pasos para plantar una semilla", ["Hacer un hoyo en la tierra", "Poner la semilla", "Tapar con tierra", "Regar con agua"]],
  ["Ordena los pasos para salir a la escuela", ["Despertarse", "Vestirse", "Desayunar", "Tomar la mochila"]],
  ["Ordena los pasos para dibujar y pintar", ["Tomar el lápiz", "Dibujar el contorno", "Pintar con colores", "Colgar el dibujo"]],
  ["Ordena los pasos de un videojuego", ["Encender la consola", "Elegir el juego", "Jugar la partida", "Guardar y apagar"]],
  ["Ordena los pasos para hacer una limonada", ["Exprimir los limones", "Agregar agua", "Agregar azúcar", "Servir en el vaso"]],
  ["Ordena los pasos para enviar una carta", ["Escribir la carta", "Meterla en el sobre", "Pegar la estampilla", "Ponerla en el buzón"]],
];

const ALGORITHMS: [string, string[]][] = [
  ["Algoritmo para cruzar la calle con seguridad", ["Parar en la esquina", "Mirar a ambos lados", "Esperar que no vengan autos", "Cruzar caminando"]],
  ["Algoritmo para buscar una palabra en el diccionario", ["Pensar la primera letra", "Abrir en esa sección", "Buscar la palabra en la página", "Leer su significado"]],
  ["Algoritmo para resolver un problema difícil", ["Leer con atención", "Dividirlo en partes pequeñas", "Resolver una parte por vez", "Revisar la respuesta"]],
  ["Algoritmo de un robot que hace jugo", ["Tomar la fruta", "Pelar la fruta", "Ponerla en la licuadora", "Encender la licuadora"]],
  ["Algoritmo para armar un rompecabezas", ["Volcar las piezas", "Buscar los bordes", "Armar el marco", "Rellenar el centro"]],
  ["Algoritmo para preparar la mochila", ["Mirar el horario de mañana", "Elegir los libros necesarios", "Guardarlos en la mochila", "Cerrar la mochila"]],
];

// Patrones con emojis y números
const EMOJI_PATTERNS: [string, string, string[]][] = [
  ["🔴 🔵 🔴 🔵 🔴 …", "🔵", ["🔴", "🟢", "🟡"]],
  ["⭐ ⭐ 🌙 ⭐ ⭐ 🌙 ⭐ ⭐ …", "🌙", ["⭐", "☀️", "☁️"]],
  ["🍎 🍌 🍌 🍎 🍌 🍌 🍎 …", "🍌", ["🍎", "🍇", "🍓"]],
  ["🐸 🐸 🐢 🐢 🐸 🐸 🐢 …", "🐢", ["🐸", "🐟", "🐍"]],
  ["🔺 🔺 🔻 🔺 🔺 🔻 🔺 🔺 …", "🔻", ["🔺", "🔷", "⚫"]],
  ["🌸 🌼 🌸 🌼 🌸 …", "🌼", ["🌸", "🌷", "🍀"]],
  ["🚗 🚗 🚌 🚗 🚗 🚌 🚗 🚗 …", "🚌", ["🚗", "🚲", "✈️"]],
  ["😀 😎 😎 😀 😎 😎 😀 …", "😎", ["😀", "😴", "🤖"]],
];

function qEmojiPattern(): Question {
  const [seq, answer, wrong] = pick(EMOJI_PATTERNS);
  return {
    kind: "mc",
    prompt: `¿Qué sigue en el patrón?\n${seq}`,
    options: shuffle([answer, ...wrong]),
    answer,
  };
}

function qNumberPattern(): Question {
  const kind = ri(1, 3);
  if (kind === 1) {
    const step = pick([2, 3, 5, 10]);
    const start = ri(1, 10);
    const seq = [0, 1, 2, 3].map((i) => start + step * i);
    return numMC(`¿Qué número sigue? ${seq.join(", ")}, …`, start + step * 4, {
      spread: step + 2,
      explain: `El patrón suma ${step} cada vez.`,
    });
  }
  if (kind === 2) {
    const start = pick([1, 2, 3]);
    const seq = [start, start * 2, start * 4, start * 8];
    return numMC(`¿Qué número sigue? ${seq.join(", ")}, …`, start * 16, {
      spread: start * 6,
      explain: "Cada número es el doble del anterior.",
    });
  }
  const step = pick([2, 3, 5]);
  const start = 30 + ri(0, 20);
  const seq = [0, 1, 2, 3].map((i) => start - step * i);
  return numMC(`¿Qué número sigue? ${seq.join(", ")}, …`, start - step * 4, {
    spread: step + 2,
    explain: `El patrón resta ${step} cada vez.`,
  });
}

function qRobotWalk(): Question {
  const start = ri(1, 4);
  const f1 = ri(2, 5);
  const b = ri(1, 3);
  const f2 = ri(1, 4);
  const end = start + f1 - b + f2;
  return typed(
    `🤖 El robot está en la casilla ${start} de un camino numerado.\nEjecuta el programa: avanza ${f1} → retrocede ${b} → avanza ${f2}.\n¿En qué casilla termina?`,
    end,
    { explain: `${start} + ${f1} − ${b} + ${f2} = ${end}.` }
  );
}

function qLoop(): Question {
  const kind = ri(1, 3);
  if (kind === 1) {
    const times = ri(3, 6);
    const actions = ri(2, 4);
    return typed(
      `🔁 Programa: REPETIR ${times} veces → [${["saltar", "aplaudir", "girar", "silbar"].slice(0, actions).join(", ")}].\n¿Cuántas acciones hace en total?`,
      times * actions,
      { explain: `${times} × ${actions} = ${times * actions} acciones.` }
    );
  }
  if (kind === 2) {
    const steps = ri(2, 6);
    const times = ri(3, 8);
    return typed(
      `🤖 Programa: REPETIR ${times} veces → [avanzar ${steps} pasos].\n¿Cuántos pasos avanza el robot?`,
      steps * times
    );
  }
  const total = pick([12, 15, 18, 20, 24]);
  const per = pick([3, 4].filter((p) => total % p === 0));
  return typed(
    `🔁 El robot debe dar ${total} saltos. Si el bucle hace ${per} saltos por vuelta, ¿cuántas vueltas necesita?`,
    total / per,
    { explain: `${total} ÷ ${per} = ${total / per} vueltas.` }
  );
}

type MC = [string, string, string[], string?, string?];

const CONDITIONALS: MC[] = [
  ["SI llueve ENTONCES llevo paraguas. Hoy llueve. ¿Qué hago?", "Llevo paraguas", ["No llevo nada", "Llevo gafas de sol", "Me quedo dormido"], "🌧️"],
  ["SI es de noche ENTONCES enciendo la luz. Es de día. ¿Qué pasa?", "No enciendo la luz", ["Enciendo la luz", "Apago el sol", "Cierro los ojos"], "☀️"],
  ["SI el semáforo está en verde ENTONCES cruzo, SI NO espero. Está en rojo. ¿Qué hago?", "Espero", ["Cruzo corriendo", "Cruzo despacio", "Vuelvo a casa"], "🚦"],
  ["SI tengo hambre ENTONCES como fruta. Tengo hambre. ¿Qué como?", "Fruta", ["Nada", "Piedras", "Lo que sea"], "🍎"],
  ["El robot riega SI la tierra está seca. La tierra está mojada. ¿Qué hace?", "No riega", ["Riega igual", "Quita el agua", "Planta otra semilla"], "🤖"],
  ["SI es sábado O domingo ENTONCES no hay escuela. Hoy es domingo…", "No hay escuela", ["Hay escuela", "Hay medio día de escuela", "Depende"], "📅"],
  ["SI el número es mayor que 10 ENTONCES gana premio. Sale el 7…", "No gana premio", ["Gana premio", "Gana medio premio", "Empata"], "🎰"],
  ["SI hace frío Y llueve ENTONCES me quedo en casa. Hace frío pero está soleado…", "No me quedo en casa", ["Me quedo en casa", "Abro el paraguas", "Enciendo el aire"], "🌤️", "Se necesitan LAS DOS condiciones a la vez."],
];

const BUGS: MC[] = [
  ["Programa para hacer té: 1) hervir agua 2) beber el té 3) poner la bolsita. ¿Cuál es el error?", "Los pasos 2 y 3 están al revés", ["Falta el azúcar", "No hay error", "El agua no se hierve"], "🐛"],
  ["Robot pintor: 1) tomar pincel 2) pintar pared 3) mojar pincel en pintura. ¿Qué está mal?", "Debe mojar el pincel ANTES de pintar", ["No hay error", "Falta secar la pared", "Debe usar dos pinceles"], "🎨"],
  ["Programa: REPETIR 5 veces [avanzar 2] para llegar a la casilla 12 desde la 0. ¿Funciona?", "No: llega a la casilla 10", ["Sí, llega justo", "Llega a la 14", "El robot se rompe"], "🤖", "5 × 2 = 10, no 12."],
  ["Receta: 1) meter pizza al horno 2) encender el horno 3) sacar la pizza. ¿Cuál es el bug?", "Hay que encender el horno primero", ["Falta el queso", "No hay error", "Sobra el paso 3"], "🍕"],
  ["El robot debe girar a la DERECHA pero gira a la IZQUIERDA. El error es un…", "Bug (error de programa)", ["Premio", "Bucle", "Virus del resfriado"], "🐞"],
  ["Para vestirse: 1) ponerse zapatos 2) ponerse calcetines. ¿Qué está mal?", "Los calcetines van antes que los zapatos", ["Faltan los guantes", "No hay error", "Sobran los zapatos"], "🧦"],
  ["Cuando un programa tiene un error, lo mejor es…", "Revisar paso a paso y corregirlo", ["Tirar la computadora", "Rendirse", "Ignorarlo"], "🔧", "A eso se le llama depurar (debugging)."],
  ["Contraseña segura: ¿cuál es mejor?", "Xk7!nube42", ["1234", "abc", "tu nombre"], "🔐", "Larga y con letras, números y símbolos."],
];

const CONCEPTS: MC[] = [
  ["¿Qué es un ALGORITMO?", "Una lista de pasos para resolver algo", ["Un tipo de robot", "Un error", "Un videojuego"], "📋"],
  ["¿Qué es un BUCLE?", "Repetir instrucciones varias veces", ["Borrar el programa", "Un dibujo", "Apagar el robot"], "🔁"],
  ["¿Qué entiende de verdad una computadora?", "Instrucciones exactas", ["Adivinanzas", "Emociones", "Lo que sea"], "🖥️", "Las computadoras hacen exactamente lo que se les dice."],
  ["¿Qué guarda la MEMORIA de una computadora?", "Datos e información", ["Comida", "Aire", "Monedas"], "💾"],
  ["Internet sirve para…", "Conectar computadoras del mundo", ["Cocinar", "Volar", "Dormir"], "🌐"],
  ["Si un desconocido te escribe en internet, debes…", "Contárselo a un adulto de confianza", ["Darle tus datos", "Enviarle fotos", "Encontrarte con él"], "🛡️"],
];

function qBinary(): Question {
  const n = ri(1, 15);
  const bin = n.toString(2).padStart(4, "0");
  if (Math.random() < 0.5) {
    return numMC(`🤖 Las computadoras cuentan en binario (unos y ceros).\n¿Qué número es ${bin}?\n(pista: las posiciones valen 8, 4, 2 y 1)`, n, {
      spread: 4,
      explain: `${bin} = ${[8, 4, 2, 1].filter((v, i) => bin[i] === "1").join(" + ") || "0"} = ${n}.`,
    });
  }
  const wrong = new Set<string>();
  while (wrong.size < 3) {
    const w = ri(0, 15).toString(2).padStart(4, "0");
    if (w !== bin) wrong.add(w);
  }
  return {
    kind: "mc",
    prompt: `🤖 ¿Cómo se escribe el número ${n} en binario?\n(pista: las posiciones valen 8, 4, 2 y 1)`,
    options: shuffle([bin, ...wrong]),
    answer: bin,
  };
}

function genOrder(bank: [string, string[]][]): () => Question[] {
  return () => sample(bank, 6).map(([prompt, items]) => order(prompt, items));
}

function buildMC(bank: MC[]): Question[] {
  return session(
    sample(bank, Math.min(10, bank.length)).map(([prompt, answer, wrong, visual, explain]) => ({
      kind: "mc" as const,
      prompt,
      visual,
      options: shuffle([answer, ...wrong]),
      answer,
      explain,
    }))
  );
}

function genProc(f: () => Question): () => Question[] {
  return () => session(Array.from({ length: 10 }, f));
}

export const CODING_LEVELS: LevelDef[] = [
  { name: "Paso a Paso", emoji: "👣", desc: "Ordena instrucciones en secuencia", tier: 1, gen: genOrder(SEQUENCES) },
  { name: "Caza Patrones", emoji: "🔍", desc: "Descubre qué sigue en cada patrón", tier: 1, gen: genProc(() => (Math.random() < 0.5 ? qEmojiPattern() : qNumberPattern())) },
  { name: "Robot Explorador", emoji: "🤖", desc: "Programa los movimientos del robot", tier: 2, gen: genProc(qRobotWalk) },
  { name: "Bucles Mágicos", emoji: "🔁", desc: "Repite instrucciones y calcula el resultado", tier: 2, gen: genProc(qLoop) },
  { name: "Si… Entonces", emoji: "🚦", desc: "Condicionales: decisiones del programa", tier: 2, gen: () => buildMC(CONDITIONALS) },
  { name: "Cazador de Bugs", emoji: "🐞", desc: "Encuentra el error en cada programa", tier: 3, gen: () => buildMC(BUGS) },
  { name: "Gran Arquitecto", emoji: "📐", desc: "Construye algoritmos completos", tier: 3, gen: genOrder(ALGORITHMS) },
  { name: "Código Secreto", emoji: "💾", desc: "Binario y cultura digital", tier: 3, gen: () => session([...Array.from({ length: 6 }, qBinary), ...sample(CONCEPTS, 5).map(([prompt, answer, wrong, visual, explain]) => ({ kind: "mc" as const, prompt, visual, options: shuffle([answer, ...wrong]), answer, explain }))]) },
];
