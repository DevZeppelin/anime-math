import type { Difficulty, LevelDef, Question } from "../types";
import { ri, pick, sample, session, shuffle, typed, order, numMC, tf, repeatEmoji, varied } from "./utils";

// ─────────────────────────────────────────────────────────────
// PROGRAMACIÓN Y LÓGICA — 10 niveles, adaptados a 3 edades:
//   facil (Menores de 5)  → secuencias e imágenes puras: ciclos
//                           de vida, patrones de colores, "si
//                           esto... entonces aquello" con dibujos.
//   normal / dificil       → bucles, condicionales, variables,
//                           funciones, bugs y binario: los
//                           fundamentos reales de programar.
// Cada nivel combina varios generadores distintos (ver `varied`
// en utils.ts) o bancos ampliados con `sample`, para que nunca
// se repita el mismo ejercicio dos veces seguidas en una sesión.
// ─────────────────────────────────────────────────────────────

type D = Difficulty;

type MC = [prompt: string, answer: string, wrong: string[], visual?: string, explain?: string];

function mcQuestion([prompt, answer, wrong, visual, explain]: MC): Question {
  return { kind: "mc", prompt, visual, options: shuffle([answer, ...wrong]), answer, explain };
}

function buildMC(bank: MC[]): Question[] {
  return session(sample(bank, Math.min(10, bank.length)).map(mcQuestion));
}

// ── Bancos de secuencias e imágenes (menores de 5) ────────────

const EMOJI_SEQUENCES: [prompt: string, items: string[]][] = [
  ["Ordena el crecimiento de un pollito", ["🥚", "🐣", "🐥", "🐔"]],
  ["Ordena el crecimiento de una planta", ["🌱", "🌿", "🌳"]],
  ["Ordena lo que pasa cuando llueve", ["☁️", "🌧️", "🌈"]],
  ["Ordena las partes del día", ["🌅", "☀️", "🌇", "🌙"]],
  ["Ordena las estaciones del año", ["🌸", "☀️", "🍂", "❄️"]],
  ["Ordena el crecimiento de una mariposa", ["🥚", "🐛", "🦋"]],
  ["Ordena cómo se hace un dibujo con crayones", ["📄", "✏️", "🎨"]],
  ["Ordena el ciclo de dormir y despertar", ["🌙", "😴", "☀️", "😊"]],
  ["Ordena cómo se infla un globo", ["🎈", "💨", "🎉"]],
  ["Ordena cómo se prepara un desayuno con cereal", ["🥣", "🥛", "🥄"]],
];

// bancos exclusivos por nivel para que "Paso a Paso", "Cazador de
// Bugs" y "Gran Arquitecto" (facil) nunca muestren las mismas
// secuencias entre sí.
const EMOJI_SEQUENCES_BUGS: [prompt: string, items: string[]][] = [
  ["Ordena el ciclo del agua", ["🌊", "☁️", "🌧️"]],
  ["Ordena cómo se hace una torta", ["🥚", "🥣", "🎂"]],
  ["Ordena las fases de la luna", ["🌑", "🌓", "🌕"]],
  ["Ordena el crecimiento de un árbol desde la bellota", ["🌰", "🌿", "🌳"]],
  ["Ordena cómo se prepara un té caliente", ["🚰", "🔥", "🍵"]],
  ["Ordena un cumpleaños", ["🎂", "🕯️", "🎁"]],
  ["Ordena el día de una flor", ["🌱", "🌷", "🥀"]],
  ["Ordena cómo se construye una casa", ["🧱", "🏗️", "🏠"]],
];

const EMOJI_SEQUENCES_ALGO: [prompt: string, items: string[]][] = [
  ["Ordena los pasos del robot para regar una planta", ["🤖", "🚰", "🌱"]],
  ["Ordena los pasos para armar un sándwich robot", ["🤖", "🍞", "🥪"]],
  ["Ordena el algoritmo del semáforo", ["🔴", "🟡", "🟢"]],
  ["Ordena los pasos para cargar una batería", ["🔌", "🔋", "✅"]],
  ["Ordena los pasos para tomar una foto", ["📱", "😊", "📸"]],
  ["Ordena los pasos para lavar un plato", ["🍽️", "🧼", "✨"]],
  ["Ordena los pasos de un robot aspiradora", ["🤖", "🧹", "🏠"]],
  ["Ordena los pasos para encender una vela", ["🕯️", "🔥", "✨"]],
];

// secuencias de la vida real para ordenar (con texto, menores de 10 y 15)
const SEQUENCES: [string, string[]][] = [
  ["Ordena los pasos para lavarte los dientes", ["Poner pasta en el cepillo", "Cepillar los dientes", "Enjuagar la boca", "Guardar el cepillo"]],
  ["Ordena los pasos para hacer un sándwich", ["Sacar el pan", "Poner el queso", "Tapar con la otra rebanada", "Comer el sándwich"]],
  ["Ordena los pasos para plantar una semilla", ["Hacer un hoyo en la tierra", "Poner la semilla", "Tapar con tierra", "Regar con agua"]],
  ["Ordena los pasos para salir a la escuela", ["Despertarse", "Vestirse", "Desayunar", "Tomar la mochila"]],
  ["Ordena los pasos para dibujar y pintar", ["Tomar el lápiz", "Dibujar el contorno", "Pintar con colores", "Colgar el dibujo"]],
  ["Ordena los pasos de un videojuego", ["Encender la consola", "Elegir el juego", "Jugar la partida", "Guardar y apagar"]],
  ["Ordena los pasos para hacer una limonada", ["Exprimir los limones", "Agregar agua", "Agregar azúcar", "Servir en el vaso"]],
  ["Ordena los pasos para enviar una carta", ["Escribir la carta", "Meterla en el sobre", "Pegar la estampilla", "Ponerla en el buzón"]],
  ["Ordena los pasos para armar una carpa de camping", ["Elegir el lugar", "Extender la carpa", "Clavar las estacas", "Entrar a dormir"]],
  ["Ordena los pasos para lavar la ropa", ["Separar la ropa por color", "Poner el jabón", "Lavar en la lavadora", "Colgar a secar"]],
  ["Ordena los pasos para hacer una llamada telefónica", ["Buscar el número", "Marcar el número", "Esperar que atiendan", "Hablar con la persona"]],
  ["Ordena los pasos para regar el jardín", ["Conectar la manguera", "Abrir la llave de agua", "Regar las plantas", "Cerrar la llave"]],
];

const ALGORITHMS: [string, string[]][] = [
  ["Algoritmo para cruzar la calle con seguridad", ["Parar en la esquina", "Mirar a ambos lados", "Esperar que no vengan autos", "Cruzar caminando"]],
  ["Algoritmo para buscar una palabra en el diccionario", ["Pensar la primera letra", "Abrir en esa sección", "Buscar la palabra en la página", "Leer su significado"]],
  ["Algoritmo para resolver un problema difícil", ["Leer con atención", "Dividirlo en partes pequeñas", "Resolver una parte por vez", "Revisar la respuesta"]],
  ["Algoritmo de un robot que hace jugo", ["Tomar la fruta", "Pelar la fruta", "Ponerla en la licuadora", "Encender la licuadora"]],
  ["Algoritmo para armar un rompecabezas", ["Volcar las piezas", "Buscar los bordes", "Armar el marco", "Rellenar el centro"]],
  ["Algoritmo para preparar la mochila", ["Mirar el horario de mañana", "Elegir los libros necesarios", "Guardarlos en la mochila", "Cerrar la mochila"]],
  ["Algoritmo para ordenar libros por tamaño", ["Sacar todos los libros", "Comparar dos libros", "Poner el más chico primero", "Repetir hasta terminar"]],
  ["Algoritmo de un cajero automático", ["Insertar la tarjeta", "Escribir la clave", "Elegir el monto", "Retirar el dinero"]],
  ["Algoritmo para hacer una fila de mayor a menor", ["Comparar dos personas", "Ubicar la más alta primero", "Seguir comparando al resto", "Revisar que quede ordenada"]],
  ["Algoritmo de un semáforo inteligente", ["Detectar autos esperando", "Calcular el tiempo necesario", "Cambiar la luz a verde", "Volver a medir"]],
  ["Algoritmo para encontrar un objeto perdido", ["Pensar dónde lo usaste por última vez", "Buscar en ese lugar", "Si no está, buscar en otro", "Repetir hasta encontrarlo"]],
  ["Algoritmo de una receta de cocina", ["Leer todos los ingredientes", "Prepararlos en orden", "Cocinar paso a paso", "Servir el plato"]],
];

// patrones simples de 2 símbolos que se alternan (ideal para menores de 5)
const PATTERNS_SIMPLE: [string, string, string[]][] = [
  ["🔴 🔵 🔴 🔵 🔴 …", "🔵", ["🔴", "🟢"]],
  ["🍎 🍌 🍎 🍌 🍎 …", "🍌", ["🍎", "🍇"]],
  ["🐸 🐢 🐸 🐢 🐸 …", "🐢", ["🐸", "🐟"]],
  ["🌸 🌼 🌸 🌼 🌸 …", "🌼", ["🌸", "🍀"]],
  ["😀 😎 😀 😎 😀 …", "😎", ["😀", "😴"]],
  ["⭐ 🌙 ⭐ 🌙 ⭐ …", "🌙", ["⭐", "☀️"]],
  ["🐶 🐱 🐶 🐱 🐶 …", "🐱", ["🐶", "🐹"]],
  ["🍇 🍓 🍇 🍓 🍇 …", "🍓", ["🍇", "🍑"]],
  ["🚗 🚲 🚗 🚲 🚗 …", "🚲", ["🚗", "✈️"]],
  ["🎵 🎨 🎵 🎨 🎵 …", "🎨", ["🎵", "⚽"]],
];

// patrones con emojis y números (menores de 10 y 15)
const EMOJI_PATTERNS: [string, string, string[]][] = [
  ["🔴 🔵 🔴 🔵 🔴 …", "🔵", ["🔴", "🟢", "🟡"]],
  ["⭐ ⭐ 🌙 ⭐ ⭐ 🌙 ⭐ ⭐ …", "🌙", ["⭐", "☀️", "☁️"]],
  ["🍎 🍌 🍌 🍎 🍌 🍌 🍎 …", "🍌", ["🍎", "🍇", "🍓"]],
  ["🐸 🐸 🐢 🐢 🐸 🐸 🐢 …", "🐢", ["🐸", "🐟", "🐍"]],
  ["🔺 🔺 🔻 🔺 🔺 🔻 🔺 🔺 …", "🔻", ["🔺", "🔷", "⚫"]],
  ["🌸 🌼 🌸 🌼 🌸 …", "🌼", ["🌸", "🌷", "🍀"]],
  ["🚗 🚗 🚌 🚗 🚗 🚌 🚗 🚗 …", "🚌", ["🚗", "🚲", "✈️"]],
  ["😀 😎 😎 😀 😎 😎 😀 …", "😎", ["😀", "😴", "🤖"]],
  ["🎈 🎈 🎁 🎈 🎈 🎁 🎈 🎈 …", "🎁", ["🎈", "🎀", "🎊"]],
  ["🐝 🐝 🌸 🐝 🐝 🌸 🐝 🐝 …", "🌸", ["🐝", "🍯", "🦋"]],
];

function qNumberPatternAscend(): Question {
  const step = pick([2, 3, 5, 10]);
  const start = ri(1, 10);
  const seq = [0, 1, 2, 3].map((i) => start + step * i);
  return numMC(`¿Qué número sigue? ${seq.join(", ")}, …`, start + step * 4, {
    spread: step + 2,
    explain: `El patrón suma ${step} cada vez.`,
  });
}

function qNumberPatternDouble(): Question {
  const start = pick([1, 2, 3]);
  const seq = [start, start * 2, start * 4, start * 8];
  return numMC(`¿Qué número sigue? ${seq.join(", ")}, …`, start * 16, {
    spread: start * 6,
    explain: "Cada número es el doble del anterior.",
  });
}

function qNumberPatternDescend(): Question {
  const step = pick([2, 3, 5]);
  const start = 30 + ri(0, 20);
  const seq = [0, 1, 2, 3].map((i) => start - step * i);
  return numMC(`¿Qué número sigue? ${seq.join(", ")}, …`, start - step * 4, {
    spread: step + 2,
    explain: `El patrón resta ${step} cada vez.`,
  });
}

function genPatternsFacil(): Question[] {
  return sample(PATTERNS_SIMPLE, 8).map(([seq, answer, wrong]) => ({
    kind: "mc" as const,
    prompt: "¿Qué sigue?",
    visual: seq,
    options: shuffle([answer, ...wrong]),
    answer,
  }));
}

function genPatternsRest(): Question[] {
  const emojiQs = sample(EMOJI_PATTERNS, 4).map(([seq, answer, wrong]) => ({
    kind: "mc" as const,
    prompt: `¿Qué sigue en el patrón?\n${seq}`,
    options: shuffle([answer, ...wrong]),
    answer,
  }));
  const numberQs = shuffle([qNumberPatternAscend, qNumberPatternDouble, qNumberPatternDescend, pick([qNumberPatternAscend, qNumberPatternDouble, qNumberPatternDescend])]).map((fn) => fn());
  // alterna emoji/número para que nunca se repita el mismo tipo de patrón dos veces seguidas
  const startWithEmoji = Math.random() < 0.5;
  const out: Question[] = [];
  for (let i = 0; i < 4; i++) {
    out.push(startWithEmoji ? emojiQs[i] : numberQs[i]);
    out.push(startWithEmoji ? numberQs[i] : emojiQs[i]);
  }
  return out;
}

// ── Robot Explorador ───────────────────────────────────────────

function qRobotSimpleAdvance(): Question {
  const start = ri(1, 3);
  const steps = ri(1, 3);
  return numMC(`El robot 🤖 está en el número ${start}.\nAvanza ${steps}. ¿En qué número queda?`, start + steps, { spread: 2 });
}

function qRobotSimpleRetreat(): Question {
  const start = ri(3, 6);
  const steps = ri(1, Math.min(3, start - 1));
  return numMC(`El robot 🤖 está en el número ${start}.\nRetrocede ${steps}. ¿En qué número queda?`, start - steps, { spread: 2 });
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

const GRID_DIRS: [string, "x" | "-x" | "y" | "-y"][] = [
  ["derecha", "x"],
  ["izquierda", "-x"],
  ["arriba", "y"],
  ["abajo", "-y"],
];
function qRobotGrid(): Question {
  let x = 0;
  let y = 0;
  const desc = Array.from({ length: 3 }, () => {
    const [name, axis] = pick(GRID_DIRS);
    const n = ri(1, 4);
    if (axis === "x") x += n;
    if (axis === "-x") x -= n;
    if (axis === "y") y += n;
    if (axis === "-y") y -= n;
    return `${name} ${n}`;
  }).join(" → ");
  const answer = `(${x}, ${y})`;
  const wrong = new Set<string>();
  let guard = 0;
  while (wrong.size < 3 && guard++ < 40) {
    const w = `(${x + ri(-3, 3)}, ${y + ri(-3, 3)})`;
    if (w !== answer) wrong.add(w);
  }
  return {
    kind: "mc",
    prompt: `🤖 El robot arranca en (0, 0) sobre una grilla.\nPrograma: ${desc}.\n¿En qué casilla termina? (x, y)`,
    options: shuffle([answer, ...wrong]),
    answer,
  };
}

function qRobotCollect(): Question {
  const stops = sample([1, 2, 3, 4, 5, 6, 7, 8, 9], 3).sort((a, b) => a - b);
  const amounts = stops.map(() => ri(1, 3));
  const total = amounts.reduce((a, b) => a + b, 0);
  const desc = stops.map((s, i) => `casilla ${s}: ${repeatEmoji("🪙", amounts[i])}`).join(" · ");
  return numMC(`🤖 El robot camina de la casilla 0 a la 10 recogiendo monedas:\n${desc}\n¿Cuántas monedas recogió en total?`, total, { spread: 3 });
}

function genRobot(d: D): Question[] {
  return d === "facil" ? varied([qRobotSimpleAdvance, qRobotSimpleRetreat], 8) : varied([qRobotWalk, qRobotGrid, qRobotCollect], 8);
}

// ── Bucles Mágicos ─────────────────────────────────────────────

function qLoopVisualClap(): Question {
  const times = ri(2, 3);
  const per = ri(2, 3);
  const visual = Array.from({ length: times }, () => repeatEmoji("👏", per)).join("   |   ");
  return numMC(`El robot repite esto ${times} veces.\n¿Cuántos aplausos hace en total?`, times * per, { visual, spread: 2 });
}

function qLoopVisualJump(): Question {
  const times = ri(2, 3);
  const per = ri(2, 3);
  const visual = Array.from({ length: times }, () => repeatEmoji("🤸", per)).join("   |   ");
  return numMC(`El robot repite este salto ${times} veces.\n¿Cuántos saltos hace en total?`, times * per, { visual, spread: 2 });
}

function qLoopActions(): Question {
  const times = ri(3, 6);
  const actions = ri(2, 4);
  return typed(
    `🔁 Programa: REPETIR ${times} veces → [${["saltar", "aplaudir", "girar", "silbar"].slice(0, actions).join(", ")}].\n¿Cuántas acciones hace en total?`,
    times * actions,
    { explain: `${times} × ${actions} = ${times * actions} acciones.` }
  );
}

function qLoopSteps(): Question {
  const steps = ri(2, 6);
  const times = ri(3, 8);
  return typed(`🤖 Programa: REPETIR ${times} veces → [avanzar ${steps} pasos].\n¿Cuántos pasos avanza el robot?`, steps * times, {
    explain: `${steps} × ${times} = ${steps * times} pasos.`,
  });
}

function qLoopVueltas(): Question {
  const total = pick([12, 15, 18, 20, 24]);
  const per = pick([3, 4].filter((p) => total % p === 0));
  return typed(`🔁 El robot debe dar ${total} saltos. Si el bucle hace ${per} saltos por vuelta, ¿cuántas vueltas necesita?`, total / per, {
    explain: `${total} ÷ ${per} = ${total / per} vueltas.`,
  });
}

function qLoopCounter(): Question {
  const step = ri(2, 6);
  const times = ri(3, 6);
  return typed(
    `🔁 Un contador empieza en 0.\nPrograma: REPETIR ${times} veces → sumar ${step} al contador.\n¿En qué número termina el contador?`,
    step * times,
    { explain: `0 + ${step} × ${times} = ${step * times}.` }
  );
}

function genLoops(d: D): Question[] {
  return d === "facil" ? varied([qLoopVisualClap, qLoopVisualJump], 8) : varied([qLoopActions, qLoopSteps, qLoopVueltas, qLoopCounter], 8);
}

// ── Si… Entonces (condicionales) ───────────────────────────────

const IF_THEN_VISUAL: [string, string, string[]][] = [
  ["Si hace frío ❄️, ¿qué te pones?", "🧥", ["🩳", "🕶️"]],
  ["Si hace calor ☀️, ¿qué te pones?", "🩳", ["🧥", "🧤"]],
  ["Si tienes hambre 😋, ¿qué comes?", "🍎", ["😴", "🚿"]],
  ["Si tienes sueño 😴, ¿qué usas?", "🛏️", ["🍎", "⚽"]],
  ["Si está lloviendo 🌧️, ¿qué usas?", "☂️", ["🕶️", "🩱"]],
  ["Si te ensucias las manos 🖐️, ¿qué haces?", "🧼", ["🍬", "📺"]],
  ["Si estás cansado 😴 en la noche, ¿qué apagas?", "💡", ["🍎", "⚽"]],
  ["Si tu juguete se rompe 🧸, ¿a quién le pides ayuda?", "👨‍👩‍👧", ["🐶", "🍕"]],
  ["Si terminas de comer 🍽️, ¿qué usas para limpiar la boca?", "🧻", ["⚽", "📺"]],
  ["Si quieres cruzar la calle 🚸, ¿qué miras primero?", "🚦", ["🍦", "🎈"]],
];

function genConditionalsFacil(): Question[] {
  return sample(IF_THEN_VISUAL, 8).map(([prompt, answer, wrong]) => ({
    kind: "mc" as const,
    prompt,
    options: shuffle([answer, ...wrong]),
    answer,
  }));
}

const CONDITIONALS: MC[] = [
  ["SI llueve ENTONCES llevo paraguas. Hoy llueve. ¿Qué hago?", "Llevo paraguas", ["No llevo nada", "Llevo gafas de sol", "Me quedo dormido"], "🌧️"],
  ["SI es de noche ENTONCES enciendo la luz. Es de día. ¿Qué pasa?", "No enciendo la luz", ["Enciendo la luz", "Apago el sol", "Cierro los ojos"], "☀️"],
  ["SI el semáforo está en verde ENTONCES cruzo, SI NO espero. Está en rojo. ¿Qué hago?", "Espero", ["Cruzo corriendo", "Cruzo despacio", "Vuelvo a casa"], "🚦"],
  ["SI tengo hambre ENTONCES como fruta. Tengo hambre. ¿Qué como?", "Fruta", ["Nada", "Piedras", "Lo que sea"], "🍎"],
  ["El robot riega SI la tierra está seca. La tierra está mojada. ¿Qué hace?", "No riega", ["Riega igual", "Quita el agua", "Planta otra semilla"], "🤖"],
  ["SI es sábado O domingo ENTONCES no hay escuela. Hoy es domingo…", "No hay escuela", ["Hay escuela", "Hay medio día de escuela", "Depende"], "📅"],
  ["SI el número es mayor que 10 ENTONCES gana premio. Sale el 7…", "No gana premio", ["Gana premio", "Gana medio premio", "Empata"], "🎰"],
  ["SI hace frío Y llueve ENTONCES me quedo en casa. Hace frío pero está soleado…", "No me quedo en casa", ["Me quedo en casa", "Abro el paraguas", "Enciendo el aire"], "🌤️", "Se necesitan LAS DOS condiciones a la vez."],
  ["SI el semáforo NO está en verde ENTONCES espero. Está en amarillo…", "Espero", ["Cruzo", "Corro", "Salto"], "🚦"],
  ["SI tengo tarea Y es de noche ENTONCES estudio con luz. No tengo tarea pero es de noche…", "No estudio con luz (no hay tarea)", ["Estudio con luz", "Apago todas las luces", "Salgo a jugar"], "📚", "Se necesita tener tarea para que se cumpla la condición."],
  ["SI llueve O hace mucho frío ENTONCES uso campera. Hace mucho frío pero no llueve…", "Uso campera", ["No uso nada", "Uso short", "Uso traje de baño"], "🧥", "Con OR basta con que se cumpla una sola condición."],
  ["SI la batería está por debajo de 20% ENTONCES cargar el celular. Está en 15%…", "Cargar el celular", ["No hacer nada", "Apagarlo para siempre", "Tirarlo"], "🔋"],
];

// ── Cazador de Bugs ─────────────────────────────────────────────

function genOrderOrCheck(facilBank: [string, string[]][]): () => Question[] {
  return () =>
    sample(facilBank, 6).map(([prompt, items]) => {
      // la mitad de las veces se pide ordenar; la otra mitad, decir si YA está bien ordenado
      if (Math.random() < 0.5) return order(prompt, items);
      const isCorrect = Math.random() < 0.5;
      const shown = isCorrect ? items : shuffle(items);
      const reallyCorrect = shown.every((it, i) => it === items[i]);
      return tf(`${prompt}\n${shown.join(" → ")}\n¿Está bien ordenado?`, reallyCorrect);
    });
}

const BUGS: MC[] = [
  ["Programa para hacer té: 1) hervir agua 2) beber el té 3) poner la bolsita. ¿Cuál es el error?", "Los pasos 2 y 3 están al revés", ["Falta el azúcar", "No hay error", "El agua no se hierve"], "🐛"],
  ["Robot pintor: 1) tomar pincel 2) pintar pared 3) mojar pincel en pintura. ¿Qué está mal?", "Debe mojar el pincel ANTES de pintar", ["No hay error", "Falta secar la pared", "Debe usar dos pinceles"], "🎨"],
  ["Programa: REPETIR 5 veces [avanzar 2] para llegar a la casilla 12 desde la 0. ¿Funciona?", "No: llega a la casilla 10", ["Sí, llega justo", "Llega a la 14", "El robot se rompe"], "🤖", "5 × 2 = 10, no 12."],
  ["Receta: 1) meter pizza al horno 2) encender el horno 3) sacar la pizza. ¿Cuál es el bug?", "Hay que encender el horno primero", ["Falta el queso", "No hay error", "Sobra el paso 3"], "🍕"],
  ["El robot debe girar a la DERECHA pero gira a la IZQUIERDA. El error es un…", "Bug (error de programa)", ["Premio", "Bucle", "Virus del resfriado"], "🐞"],
  ["Para vestirse: 1) ponerse zapatos 2) ponerse calcetines. ¿Qué está mal?", "Los calcetines van antes que los zapatos", ["Faltan los guantes", "No hay error", "Sobran los zapatos"], "🧦"],
  ["Cuando un programa tiene un error, lo mejor es…", "Revisar paso a paso y corregirlo", ["Tirar la computadora", "Rendirse", "Ignorarlo"], "🔧", "A eso se le llama depurar (debugging)."],
  ["Contraseña segura: ¿cuál es mejor?", "Xk7!nube42", ["1234", "abc", "tu nombre"], "🔐", "Larga y con letras, números y símbolos."],
  ["Programa: REPETIR 3 veces [avanzar 4] para llegar del 0 al 12. ¿Está bien?", "Sí, llega justo a la casilla 12", ["No, se pasa", "No, le falta", "El robot se rompe"], "✅", "3 × 4 = 12."],
  ["Un programa que nunca termina de repetirse se llama…", "Bucle infinito", ["Bucle perfecto", "Función mágica", "Variable eterna"], "♾️", "Un bucle infinito es un tipo de bug muy común."],
  ["Robot que debe regar SOLO si hace calor, pero riega siempre. ¿Cuál es el bug?", "Falta revisar la condición del clima", ["No hay error", "Riega poco", "Falta el agua"], "🌡️"],
  ["Programa: 1) apagar la alarma 2) despertarse 3) levantarse de la cama. ¿Qué está mal?", "Primero hay que despertarse, luego apagar la alarma", ["No hay error", "Falta desayunar", "Sobra un paso"], "⏰"],
];

const CONCEPTS: MC[] = [
  ["¿Qué es un ALGORITMO?", "Una lista de pasos para resolver algo", ["Un tipo de robot", "Un error", "Un videojuego"], "📋"],
  ["¿Qué es un BUCLE?", "Repetir instrucciones varias veces", ["Borrar el programa", "Un dibujo", "Apagar el robot"], "🔁"],
  ["¿Qué entiende de verdad una computadora?", "Instrucciones exactas", ["Adivinanzas", "Emociones", "Lo que sea"], "🖥️", "Las computadoras hacen exactamente lo que se les dice."],
  ["¿Qué guarda la MEMORIA de una computadora?", "Datos e información", ["Comida", "Aire", "Monedas"], "💾"],
  ["Internet sirve para…", "Conectar computadoras del mundo", ["Cocinar", "Volar", "Dormir"], "🌐"],
  ["Si un desconocido te escribe en internet, debes…", "Contárselo a un adulto de confianza", ["Darle tus datos", "Enviarle fotos", "Encontrarte con él"], "🛡️"],
  ["¿Qué es DEPURAR (debug) un programa?", "Encontrar y corregir errores", ["Borrar todo el programa", "Hacerlo más lento a propósito", "Cambiarle el color"], "🐛"],
  ["¿Qué es el HARDWARE de una computadora?", "Las partes físicas: pantalla, teclado, cables", ["Los programas", "Internet", "Las contraseñas"], "🖱️"],
  ["¿Qué es el SOFTWARE?", "Los programas que corren en la computadora", ["El teclado", "La pantalla", "El cable"], "💿"],
  ["Antes de compartir algo en internet, conviene…", "Pensar si es seguro y pedir permiso a un adulto", ["Compartir todo sin pensar", "Usar el nombre de otra persona", "No importa, siempre está bien"], "🤔"],
];

// ── Código Secreto (binario) ────────────────────────────────────

function qBinaryToDecimal(): Question {
  const n = ri(1, 15);
  const bin = n.toString(2).padStart(4, "0");
  return numMC(`🤖 Las computadoras cuentan en binario (unos y ceros).\n¿Qué número es ${bin}?\n(pista: las posiciones valen 8, 4, 2 y 1)`, n, {
    spread: 4,
    explain: `${bin} = ${[8, 4, 2, 1].filter((v, i) => bin[i] === "1").join(" + ") || "0"} = ${n}.`,
  });
}

function qBinaryFromDecimal(): Question {
  const n = ri(1, 15);
  const bin = n.toString(2).padStart(4, "0");
  const wrong = new Set<string>();
  let guard = 0;
  while (wrong.size < 3 && guard++ < 40) {
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

function genSecretCodeRest(): Question[] {
  const binaryQs = varied([qBinaryToDecimal, qBinaryFromDecimal], 4);
  const conceptQs = sample(CONCEPTS, 4).map(mcQuestion);
  const startWithBinary = Math.random() < 0.5;
  const out: Question[] = [];
  for (let i = 0; i < 4; i++) {
    out.push(startWithBinary ? binaryQs[i] : conceptQs[i]);
    out.push(startWithBinary ? conceptQs[i] : binaryQs[i]);
  }
  return out;
}

// "código secreto" visual: reconocer el igual entre varios (menores de 5)
const MATCH_POOL = ["🔴", "🔵", "🟢", "🟡", "🟣", "🟠", "⭐", "❤️", "🔺", "⬛"];
function buildMatchQuestion(target: string): Question {
  const wrong = sample(
    MATCH_POOL.filter((e) => e !== target),
    2
  );
  return { kind: "mc", prompt: "¿Cuál es IGUAL a este?", visual: target, options: shuffle([target, ...wrong]), answer: target };
}
function genMatchVisual(): Question[] {
  return sample(MATCH_POOL, 8).map(buildMatchQuestion);
}

// ── Cajas Mágicas (variables) — nivel nuevo ─────────────────────

const BOX_ITEMS: [string, string][] = [
  ["manzanas", "🍎"],
  ["estrellas", "⭐"],
  ["monedas", "🪙"],
  ["globos", "🎈"],
  ["caramelos", "🍬"],
];

function qBoxAdd(): Question {
  const [name, emoji] = pick(BOX_ITEMS);
  const start = ri(1, 3);
  const add = ri(1, 3);
  const visual = `📦 ${repeatEmoji(emoji, start)}   +   ${repeatEmoji(emoji, add)}`;
  return numMC(`La caja mágica tiene ${name}. Si guardas más adentro, ¿cuántas hay en total?`, start + add, { visual, spread: 2 });
}

function qBoxRemove(): Question {
  const [name, emoji] = pick(BOX_ITEMS);
  const start = ri(2, 5);
  const remove = ri(1, start - 1);
  const visual = `📦 ${repeatEmoji(emoji, start)}   →   saca ${repeatEmoji(emoji, remove)}`;
  return numMC(`La caja mágica tenía ${name}. Si sacas algunas, ¿cuántas quedan adentro?`, start - remove, { visual, spread: 2 });
}

function qVarAssignSimple(): Question {
  const name = pick(["x", "puntos", "vidas", "monedas"]);
  const start = ri(3, 12);
  const isAdd = Math.random() < 0.6;
  const delta = isAdd ? ri(1, 6) : ri(1, start);
  const finalVal = isAdd ? start + delta : start - delta;
  const op = isAdd ? "+" : "-";
  return typed(
    `Instrucciones del programa:\n${name} = ${start}\n${name} = ${name} ${op} ${delta}\n¿Cuál es el valor final de "${name}"?`,
    finalVal,
    { explain: `${start} ${op} ${delta} = ${finalVal}.` }
  );
}

function qVarAssignTwoVars(): Question {
  const a = ri(2, 10);
  const b = ri(2, 10);
  const n1 = pick(["puntos", "energia", "vidas"]);
  const n2 = pick(["bono", "extra", "premio"]);
  return typed(
    `Instrucciones del programa:\n${n1} = ${a}\n${n2} = ${b}\n${n1} = ${n1} + ${n2}\n¿Cuál es el valor final de "${n1}"?`,
    a + b,
    { explain: `${a} + ${b} = ${a + b}.` }
  );
}

function qVarAssignDouble(): Question {
  const name = pick(["monedas", "puntos", "x"]);
  const start = ri(2, 9);
  return typed(`Instrucciones del programa:\n${name} = ${start}\n${name} = ${name} × 2\n¿Cuál es el valor final de "${name}"?`, start * 2, {
    explain: `${start} × 2 = ${start * 2}.`,
  });
}

const VAR_CONCEPTS: MC[] = [
  ["¿Qué es una VARIABLE en programación?", "Una caja con nombre que guarda un dato", ["Un dibujo animado", "Un error del programa", "Un tipo de bucle"], "📦"],
  ["Si escribes edad = 8, ¿qué está pasando?", "Se guarda el valor 8 en la variable edad", ["Se borra la variable edad", "Se dibuja el número 8", "Nada, es solo un comentario"], "✏️"],
  ["¿Qué significa la instrucción x = x + 1?", "Guardar en x su valor actual más 1", ["Borrar el valor de x", "Comparar x con 1", "Dibujar la letra x"], "➕"],
  ["Las variables sirven para…", "Guardar datos que el programa puede usar y cambiar", ["Hacer que el programa se vea más bonito", "Conectar a internet", "Apagar la computadora"], "💾"],
  ["Si moneda vale 5 y haces moneda = moneda + 3, ¿cuánto vale moneda ahora?", "8", ["5", "3", "15"], "🪙"],
  ["¿Se puede cambiar el valor de una variable durante el programa?", "Sí, puede cambiar de valor", ["No, nunca cambia", "Solo los robots pueden cambiarla", "Solo una vez al día"], "🔄"],
];

function qVarConceptMC(): Question {
  return mcQuestion(pick(VAR_CONCEPTS));
}

function genVariables(d: D): Question[] {
  return d === "facil" ? varied([qBoxAdd, qBoxRemove], 8) : varied([qVarAssignSimple, qVarAssignTwoVars, qVarAssignDouble, qVarConceptMC], 8);
}

// ── Piezas Reutilizables (funciones) — nivel nuevo ──────────────

const FUNC_COMBOS_FACIL: [string, string, number][] = [
  ["SALUDO", "👋", 2],
  ["BAILE", "💃", 2],
  ["APLAUSO", "👏", 3],
];

function qFuncNamedCombo(): Question {
  const [name, emoji, per] = pick(FUNC_COMBOS_FACIL);
  const times = ri(2, 3);
  const visual = Array.from({ length: times }, () => repeatEmoji(emoji, per)).join("   |   ");
  return numMC(`El movimiento "${name}" son ${per} ${emoji} juntos.\nSi lo repites ${times} veces, ¿cuántos ${emoji} hay en total?`, per * times, { visual, spread: 2 });
}

function qFuncNamedChain(): Question {
  const [n1, e1, p1] = pick(FUNC_COMBOS_FACIL);
  const [n2, e2, p2] = pick(FUNC_COMBOS_FACIL.filter((c) => c[0] !== n1));
  const visual = `"${n1}": ${repeatEmoji(e1, p1)}     "${n2}": ${repeatEmoji(e2, p2)}`;
  return numMC(`Usas el movimiento "${n1}" una vez y luego "${n2}" una vez.\n¿Cuántas acciones hiciste en total?`, p1 + p2, { visual, spread: 2 });
}

const FUNC_ACTIONS: [string, string][] = [
  ["saltar_doble", "hace 2 saltos"],
  ["aplaudir_triple", "da 3 aplausos"],
  ["girar_dos", "gira 2 veces"],
  ["saludar_par", "saluda 2 veces"],
];
function qFuncCallCount(): Question {
  const [name, desc] = pick(FUNC_ACTIONS);
  const per = Number(desc.match(/\d+/)![0]);
  const times = ri(3, 8);
  return typed(`FUNCIÓN ${name}() → ${desc}.\nEl programa llama a ${name}() ${times} veces.\n¿Cuántas acciones totales se hacen?`, per * times, {
    explain: `${per} × ${times} = ${per * times}.`,
  });
}

interface FuncDef {
  name: string;
  desc: string;
  fn: (n: number) => number;
  min: number;
  max: number;
}
const FUNC_DEFS: FuncDef[] = [
  { name: "doble", desc: "multiplica el número por 2", fn: (n) => n * 2, min: 1, max: 20 },
  { name: "triple", desc: "multiplica el número por 3", fn: (n) => n * 3, min: 1, max: 15 },
  { name: "vecino", desc: "le suma 1 al número", fn: (n) => n + 1, min: 1, max: 50 },
  { name: "decena", desc: "le suma 10 al número", fn: (n) => n + 10, min: 1, max: 40 },
  { name: "cuadrado", desc: "lo multiplica por sí mismo", fn: (n) => n * n, min: 1, max: 10 },
];

function qFuncWithParam(): Question {
  const def = pick(FUNC_DEFS);
  const n = ri(def.min, def.max);
  const result = def.fn(n);
  return numMC(`FUNCIÓN ${def.name}(n) → ${def.desc}.\n¿Qué devuelve ${def.name}(${n})?`, result, {
    spread: Math.max(4, Math.round(result * 0.3)),
    explain: `${def.name}(${n}) = ${result}.`,
  });
}

function qFuncCompose(): Question {
  const usable = FUNC_DEFS.filter((d) => d.name !== "cuadrado");
  const a = pick(usable);
  const b = pick(usable.filter((d) => d.name !== a.name));
  const n = ri(1, 8);
  const mid = a.fn(n);
  const result = b.fn(mid);
  return numMC(
    `FUNCIÓN ${a.name}(n) → ${a.desc}.\nFUNCIÓN ${b.name}(n) → ${b.desc}.\nEjecutas ${b.name}(${a.name}(${n})). ¿Qué resultado da?`,
    result,
    { spread: Math.max(4, Math.round(result * 0.3)), explain: `Primero ${a.name}(${n}) = ${mid}. Luego ${b.name}(${mid}) = ${result}.` }
  );
}

const FUNC_CONCEPTS: MC[] = [
  ["¿Qué es una FUNCIÓN en programación?", "Un bloque de instrucciones con nombre que se puede reutilizar", ["Un error del programa", "Un tipo de robot", "Un color"], "🧩"],
  ["¿Por qué usamos funciones en un programa?", "Para no repetir el mismo código muchas veces", ["Para que el programa sea más lento", "Para borrar variables", "Para cambiar de color"], "♻️"],
  ["Los datos que le pasas a una función se llaman…", "Parámetros o argumentos", ["Bugs", "Bucles", "Píxeles"], "📥"],
  ["Lo que una función entrega como resultado se llama…", "Valor de retorno", ["Variable global", "Error", "Comentario"], "📤"],
  ["¿Cuál es la ventaja de dividir un programa grande en funciones pequeñas?", "Es más fácil de entender y de corregir", ["Ocupa más espacio en el disco", "Se vuelve más lento siempre", "No tiene ninguna ventaja"], "🧠"],
  ["Un buen nombre de función explica…", "Qué hace la función", ["El color del programa", "La hora del día", "El nombre del programador"], "🏷️"],
];

function qFuncConceptMC(): Question {
  return mcQuestion(pick(FUNC_CONCEPTS));
}

function genFunctions(d: D): Question[] {
  return d === "facil" ? varied([qFuncNamedCombo, qFuncNamedChain], 8) : varied([qFuncCallCount, qFuncWithParam, qFuncCompose, qFuncConceptMC], 8);
}

// ── genOrder genérico (bancos de secuencias) ────────────────────

function genOrder(bank: [string, string[]][]): () => Question[] {
  return () => sample(bank, 6).map(([prompt, items]) => order(prompt, items));
}

// ── Niveles ──────────────────────────────────────────────────────

export const CODING_LEVELS: LevelDef[] = [
  { name: "Paso a Paso", emoji: "👣", desc: "Ordena instrucciones e imágenes en secuencia", tier: 1, gen: (d) => (d === "facil" ? genOrder(EMOJI_SEQUENCES)() : genOrder(SEQUENCES)()) },
  { name: "Caza Patrones", emoji: "🔍", desc: "Descubre qué sigue en cada patrón", tier: 1, gen: (d) => (d === "facil" ? genPatternsFacil() : genPatternsRest()) },
  { name: "Robot Explorador", emoji: "🤖", desc: "Programa los movimientos del robot", tier: 2, gen: genRobot },
  { name: "Bucles Mágicos", emoji: "🔁", desc: "Repite instrucciones y calcula el resultado", tier: 2, gen: genLoops },
  { name: "Si… Entonces", emoji: "🚦", desc: "Condicionales: decisiones del programa", tier: 2, gen: (d) => (d === "facil" ? genConditionalsFacil() : buildMC(CONDITIONALS)) },
  { name: "Cazador de Bugs", emoji: "🐞", desc: "Encuentra el error en cada programa", tier: 3, gen: (d) => (d === "facil" ? genOrderOrCheck(EMOJI_SEQUENCES_BUGS)() : buildMC(BUGS)) },
  { name: "Gran Arquitecto", emoji: "📐", desc: "Construye algoritmos completos", tier: 3, gen: (d) => (d === "facil" ? genOrder(EMOJI_SEQUENCES_ALGO)() : genOrder(ALGORITHMS)()) },
  { name: "Código Secreto", emoji: "💾", desc: "Binario, cultura digital y encontrar el igual", tier: 3, gen: (d) => (d === "facil" ? genMatchVisual() : genSecretCodeRest()) },
  { name: "Cajas Mágicas", emoji: "📦", desc: "Variables: guarda y cambia datos como un programa real", tier: 2, gen: genVariables },
  { name: "Piezas Reutilizables", emoji: "🧩", desc: "Funciones: bloques con nombre que se pueden reutilizar", tier: 3, gen: genFunctions },
];
