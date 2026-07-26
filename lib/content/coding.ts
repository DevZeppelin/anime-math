import type { Difficulty, LevelDef, Question } from "../types";
import { ri, pick, sample, session, shuffle, typed, order, numMC, tf, repeatEmoji, varied } from "./utils";

// ─────────────────────────────────────────────────────────────
// MAESTROS (experto) — sin límite de edad: los mismos 10 niveles
// suben aquí a fundamentos reales de programación para adultos:
// complejidad algorítmica, recursión, estructuras de datos,
// lógica booleana, bugs reales, y conceptos de sistemas (APIs,
// bases de datos, hexadecimal, seguridad). Cada nivel sigue
// yendo "de menos a más" dentro de sí mismo.
// ─────────────────────────────────────────────────────────────

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
  if (d === "facil") return varied([qRobotSimpleAdvance, qRobotSimpleRetreat], 8);
  if (d === "experto") return genRobotExperto();
  return varied([qRobotWalk, qRobotGrid, qRobotCollect], 8);
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
  if (d === "facil") return varied([qLoopVisualClap, qLoopVisualJump], 8);
  if (d === "experto") return genLoopsExperto();
  return varied([qLoopActions, qLoopSteps, qLoopVueltas, qLoopCounter], 8);
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
  ["Programa: 1) apagar la alarma 2) despertarse 3) levantarse de la cama. ¿Qué está mal?", "Hay que despertarse antes de apagarla", ["No hay ningún error", "Falta el paso de desayunar", "Sobra un paso extra"], "⏰"],
];

const CONCEPTS: MC[] = [
  ["¿Qué es un ALGORITMO?", "Una lista de pasos para resolver algo", ["Un tipo de robot", "Un error", "Un videojuego"], "📋"],
  ["¿Qué es un BUCLE?", "Repetir instrucciones varias veces", ["Borrar el programa", "Un dibujo", "Apagar el robot"], "🔁"],
  ["¿Qué entiende de verdad una computadora?", "Instrucciones exactas", ["Adivinanzas", "Emociones", "Lo que sea"], "🖥️", "Las computadoras hacen exactamente lo que se les dice."],
  ["¿Qué guarda la MEMORIA de una computadora?", "Datos e información", ["Comida", "Aire", "Monedas"], "💾"],
  ["Internet sirve para…", "Conectar computadoras del mundo", ["Cocinar", "Volar", "Dormir"], "🌐"],
  ["Si un desconocido te escribe en internet, debes…", "Contárselo a un adulto de confianza", ["Darle tus datos", "Enviarle fotos", "Encontrarte con él"], "🛡️"],
  ["¿Qué es DEPURAR (debug) un programa?", "Encontrar y corregir errores", ["Borrar todo el programa", "Hacerlo más lento a propósito", "Cambiarle el color"], "🐛"],
  ["¿Qué es el HARDWARE de una computadora?", "Las partes físicas de la computadora", ["Los programas instalados", "La conexión a internet", "Las contraseñas guardadas"], "🖱️"],
  ["¿Qué es el SOFTWARE?", "Los programas de la computadora", ["El teclado físico", "La pantalla del monitor", "El cable de conexión"], "💿"],
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
    notDecimal: true,
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
  if (d === "facil") return varied([qBoxAdd, qBoxRemove], 8);
  if (d === "experto") return genVariablesExperto();
  return varied([qVarAssignSimple, qVarAssignTwoVars, qVarAssignDouble, qVarConceptMC], 8);
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
  ["¿Qué es una FUNCIÓN en programación?", "Un bloque de instrucciones reutilizable", ["Un error grave del programa", "Un tipo de robot físico", "Un color cualquiera"], "🧩"],
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
  if (d === "facil") return varied([qFuncNamedCombo, qFuncNamedChain], 8);
  if (d === "experto") return genFunctionsExperto();
  return varied([qFuncCallCount, qFuncWithParam, qFuncCompose, qFuncConceptMC], 8);
}

// ── genOrder genérico (bancos de secuencias) ────────────────────

function genOrder(bank: [string, string[]][]): () => Question[] {
  return () => sample(bank, 6).map(([prompt, items]) => order(prompt, items));
}

// ═════════════════════════════════════════════════════════════
// CONTENIDO DE "MAESTROS" (experto) — fundamentos reales de
// programación, sin límite de edad.
// ═════════════════════════════════════════════════════════════

// ── 1. Paso a Paso: flujos de trabajo reales de desarrollo ─────

const SEQUENCES_EXPERTO: [string, string[]][] = [
  ["Ordena los pasos de una búsqueda binaria en una lista ordenada", ["Mirar el elemento del medio", "Comparar con el valor buscado", "Descartar la mitad donde no puede estar", "Repetir en la mitad restante"]],
  ["Ordena el flujo de un Pull Request en Git", ["Crear una rama nueva", "Hacer commits con los cambios", "Abrir el Pull Request", "Fusionar (merge) tras la revisión"]],
  ["Ordena las fases clásicas del ciclo de vida de un software", ["Analizar los requisitos", "Diseñar la solución", "Programar el código", "Probar y lanzar"]],
  ["Ordena cómo se depura (debug) un error en producción", ["Reproducir el error", "Leer el mensaje y los registros (logs)", "Aislar la causa con pruebas", "Aplicar y verificar la solución"]],
  ["Ordena el proceso de entrenar un modelo simple de aprendizaje automático", ["Recolectar datos de ejemplo", "Dividir en datos de entrenamiento y de prueba", "Ajustar el modelo con los datos", "Evaluar qué tan bien predice"]],
  ["Ordena cómo funciona una petición a un sitio web", ["El navegador envía la solicitud", "El servidor la recibe y la procesa", "El servidor devuelve una respuesta", "El navegador la muestra en pantalla"]],
  ["Ordena los pasos típicos para optimizar código lento", ["Medir qué parte tarda más", "Buscar la causa (bucles o consultas repetidas)", "Aplicar una mejora concreta", "Volver a medir para confirmar la mejora"]],
  ["Ordena una pasada del algoritmo de ordenamiento burbuja", ["Comparar dos elementos vecinos", "Intercambiarlos si están en el orden incorrecto", "Avanzar al siguiente par", "Repetir hasta el final de la lista"]],
];

// ── 2. Caza Patrones: secuencias matemáticas + complejidad ─────

function qFibonacci(): Question {
  const a0 = ri(1, 3);
  const a1 = ri(1, 3);
  const seq = [a0, a1];
  for (let i = 2; i < 6; i++) seq.push(seq[i - 1] + seq[i - 2]);
  return typed(`¿Qué número sigue? ${seq.slice(0, 5).join(", ")}, …`, seq[5], {
    explain: `Cada número es la suma de los dos anteriores (sucesión de Fibonacci): ${seq[3]} + ${seq[4]} = ${seq[5]}.`,
  });
}

const PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71];
function qPrimeNext(): Question {
  const start = ri(0, PRIMES.length - 6);
  const seq = PRIMES.slice(start, start + 4);
  const answer = PRIMES[start + 4];
  return numMC(`¿Qué número sigue? ${seq.join(", ")}, …`, answer, {
    spread: 6,
    explain: "Son números primos: solo se dividen exactamente por 1 y por sí mismos.",
  });
}

function qPowerOfTwo(): Question {
  const startExp = ri(3, 7);
  const seq = [0, 1, 2, 3].map((i) => 2 ** (startExp + i));
  return typed(`¿Qué número sigue? ${seq.join(", ")}, …`, 2 ** (startExp + 4), {
    explain: "Cada número es el doble del anterior: potencias de 2, la base de la memoria de las computadoras.",
  });
}

function qFactorialSeq(): Question {
  const seq = [1, 2, 6, 24, 120];
  return typed(`¿Qué número sigue? ${seq.join(", ")}, …`, 720, {
    explain: "Es el factorial: 1, 1×2, 1×2×3, 1×2×3×4… El siguiente es 1×2×3×4×5×6 = 720.",
  });
}

const ORDER_BIGO: [string, string[]][] = [
  ["Ordena estos algoritmos del MÁS RÁPIDO al MÁS LENTO cuando hay muchos datos", ["O(1) — tiempo constante", "O(log n) — como la búsqueda binaria", "O(n) — recorrer la lista una vez", "O(n²) — comparar cada elemento con todos"]],
  ["Ordena estas formas de buscar un dato, de MENOS a MÁS pasos a medida que crecen los datos", ["Acceder directo por índice", "Buscar partiendo siempre al medio (lista ordenada)", "Revisar la lista completa una vez", "Comparar cada elemento con todos los demás"]],
];
function qBigOrder(): Question {
  const [prompt, items] = pick(ORDER_BIGO);
  return order(prompt, items, { explain: "A esto se le llama la complejidad de un algoritmo: cuánto trabajo extra necesita cuando los datos crecen." });
}

function genPatternsExperto(): Question[] {
  return varied([qFibonacci, qPrimeNext, qPowerOfTwo, qFactorialSeq, qBigOrder], 8);
}

// ── 3. Robot Explorador: trazar código real con arrays ─────────

function qArrayTrace(): Question {
  const arr = Array.from({ length: 5 }, () => ri(1, 30));
  const idx = ri(0, 4);
  return typed(
    `lista = [${arr.join(", ")}]\nresultado = lista[${idx}]\n¿Cuál es el valor de "resultado"? (el primer índice es 0)`,
    arr[idx],
    { explain: `El índice ${idx} apunta al elemento número ${idx + 1} de la lista: ${arr[idx]}.` }
  );
}

function qArraySum(): Question {
  const arr = Array.from({ length: 4 }, () => ri(2, 20));
  return typed(
    `suma = 0\nPARA cada número en [${arr.join(", ")}]:\n    suma = suma + número\n¿Cuánto vale "suma" al final?`,
    arr.reduce((a, b) => a + b, 0),
    { explain: `${arr.join(" + ")} = ${arr.reduce((a, b) => a + b, 0)}.` }
  );
}

function qMatrixTrace(): Question {
  const rows = Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => ri(1, 9)));
  const r = ri(0, 2);
  const c = ri(0, 2);
  const display = rows.map((row) => `[${row.join(", ")}]`).join(", ");
  return typed(`matriz = [${display}]\n¿Cuál es el valor de matriz[${r}][${c}]?\n(fila ${r}, columna ${c}, empezando en 0)`, rows[r][c], {
    explain: `La fila ${r} es [${rows[r].join(", ")}]; su columna ${c} vale ${rows[r][c]}.`,
  });
}

function qLoopRange(): Question {
  const n = ri(4, 9);
  const inclusive = Math.random() < 0.5;
  if (inclusive) {
    return numMC(`Este bucle: PARA i DESDE 0 HASTA ${n} (incluyendo ${n}, o sea i <= ${n}).\n¿Cuántas veces se ejecuta?`, n + 1, {
      spread: 2,
      explain: `Cuenta 0,1,2,…,${n}: son ${n + 1} valores en total.`,
    });
  }
  return numMC(`Este bucle: PARA i DESDE 0 HASTA ${n} (SIN incluir ${n}, o sea i < ${n}).\n¿Cuántas veces se ejecuta?`, n, {
    spread: 2,
    explain: `Cuenta 0,1,2,…,${n - 1}: son ${n} valores. Confundir "<" con "<=" es el clásico error "off-by-one".`,
  });
}

function genRobotExperto(): Question[] {
  return varied([qArrayTrace, qArraySum, qMatrixTrace, qLoopRange], 8);
}

// ── 4. Bucles Mágicos: anidados, while, break ───────────────────

function qNestedLoop(): Question {
  const a = ri(2, 5);
  const b = ri(2, 6);
  return typed(`PARA i DESDE 1 HASTA ${a}:\n    PARA j DESDE 1 HASTA ${b}:\n        imprimir "*"\n¿Cuántas veces se imprime "*"?`, a * b, {
    explain: `El bucle externo se repite ${a} veces y por cada una el interno se repite ${b}: ${a} × ${b} = ${a * b}.`,
  });
}

function qWhileLoop(): Question {
  const start = ri(1, 3);
  const limit = pick([20, 30, 50, 100]);
  let x = start;
  let steps = 0;
  while (x < limit) {
    x *= 2;
    steps++;
  }
  return typed(`x = ${start}\nMIENTRAS x < ${limit}:\n    x = x × 2\n¿En qué valor termina x?`, x, {
    explain: `x se duplica ${steps} veces hasta superar ${limit}, terminando en ${x}.`,
  });
}

function qLoopSumIf(): Question {
  const arr = Array.from({ length: 5 }, () => ri(1, 20));
  const total = arr.filter((n) => n % 2 === 0).reduce((a, b) => a + b, 0);
  return typed(
    `total = 0\nPARA cada n en [${arr.join(", ")}]:\n    SI n es par:\n        total = total + n\n¿Cuánto vale "total" al final?`,
    total,
    { explain: `Los pares de la lista son ${arr.filter((n) => n % 2 === 0).join(", ") || "ninguno"}, que suman ${total}.` }
  );
}

function qLoopBreak(): Question {
  const stop = ri(3, 8);
  return typed(
    `PARA i DESDE 1 HASTA 10:\n    SI i == ${stop}:\n        ROMPER (break)\n    imprimir i\n¿Cuántas veces se imprime un número?`,
    stop - 1,
    { explain: `Se imprime 1, 2, …, ${stop - 1} y al llegar a ${stop} el bucle se detiene ANTES de imprimirlo: ${stop - 1} veces.` }
  );
}

function genLoopsExperto(): Question[] {
  return varied([qNestedLoop, qWhileLoop, qLoopSumIf, qLoopBreak], 8);
}

// ── 5. Si… Entonces: lógica booleana ────────────────────────────

function qBoolAnd(): Question {
  const a = Math.random() < 0.5;
  const b = Math.random() < 0.5;
  return tf(`A = ${a ? "Verdadero" : "Falso"}, B = ${b ? "Verdadero" : "Falso"}.\n¿Cuánto vale A Y (AND) B?`, a && b, {
    explain: "AND (Y) solo es verdadero si AMBAS partes son verdaderas.",
  });
}
function qBoolOr(): Question {
  const a = Math.random() < 0.5;
  const b = Math.random() < 0.5;
  return tf(`A = ${a ? "Verdadero" : "Falso"}, B = ${b ? "Verdadero" : "Falso"}.\n¿Cuánto vale A O (OR) B?`, a || b, {
    explain: "OR (O) es verdadero si AL MENOS UNA de las dos partes es verdadera.",
  });
}
function qBoolNot(): Question {
  const a = Math.random() < 0.5;
  return tf(`A = ${a ? "Verdadero" : "Falso"}.\n¿Cuánto vale NO (NOT) A?`, !a, {
    explain: "NOT invierte el valor: verdadero pasa a falso y falso pasa a verdadero.",
  });
}
function qBoolXor(): Question {
  const a = Math.random() < 0.5;
  const b = Math.random() < 0.5;
  return tf(`A = ${a ? "Verdadero" : "Falso"}, B = ${b ? "Verdadero" : "Falso"}.\n¿Cuánto vale A XOR B? (verdadero solo si son DISTINTOS)`, a !== b, {
    explain: "XOR es verdadero únicamente cuando A y B tienen valores diferentes.",
  });
}
function qCondTrace(): Question {
  const age = ri(10, 70);
  const hasLicense = Math.random() < 0.5;
  const canDrive = age >= 18 && hasLicense;
  return tf(
    `edad = ${age}\ntiene_licencia = ${hasLicense ? "verdadero" : "falso"}\nSI edad >= 18 Y tiene_licencia ENTONCES puede_manejar = verdadero, SI NO puede_manejar = falso.\n¿"puede_manejar" es verdadero?`,
    canDrive,
    { explain: `edad >= 18 es ${age >= 18 ? "verdadero" : "falso"}; tiene_licencia es ${hasLicense ? "verdadero" : "falso"}. AND necesita que AMBAS lo sean.` }
  );
}

function genCondExperto(): Question[] {
  return varied([qBoolAnd, qBoolOr, qBoolNot, qBoolXor, qCondTrace], 8);
}

// ── 6. Cazador de Bugs: errores reales de código ────────────────

const BUGS_EXPERTO: MC[] = [
  ["Este código debería comparar: SI x = 5 ENTONCES x = x + 1. ¿Cuál es el bug?", "Usa = (asignar) en vez de == (comparar)", ["No hay ningún bug", "Falta un punto y coma", "x nunca puede valer 5"], "🐛", "En muchos lenguajes = asigna y == compara: confundirlos es un bug clásico."],
  ["PARA i DESDE 0 HASTA 10: lista[i] = 0 — y la lista solo tiene 10 casillas (índices 0 a 9). ¿Cuál es el bug?", "Se accede a lista[10], que no existe", ["No hay ningún bug real", "La lista es demasiado grande", "Falta inicializar la variable i"], "📛", "Es un error de índice fuera de rango, típico off-by-one."],
  ["MIENTRAS x > 0: imprimir(x) — y x nunca cambia dentro del bucle. ¿Qué pasa?", "Bucle infinito: nunca se detiene", ["Se ejecuta una sola vez", "No hay ningún bug", "Imprime x = 0"], "♾️", "Si la condición nunca deja de cumplirse, el bucle no termina."],
  ["Una función divide(a, b) hace 'devolver a / b' sin comprobar nada. ¿Qué bug puede ocurrir?", "División por cero si b vale 0", ["Nunca puede fallar", "Solo funciona con números negativos", "Falta multiplicar"], "➗"],
  ["La variable 'contador' se declara DENTRO de una función y se intenta usar FUERA de ella. ¿Cuál es el problema?", "Error de alcance: no existe afuera", ["No hay ningún problema real", "Falta ponerle un valor inicial", "El nombre está mal escrito"], "🔭", "Una variable local solo existe dentro de la función donde nace."],
  ["Código: SI dato_del_usuario ENTONCES ejecutar(dato_del_usuario), sin revisar qué contiene. ¿Qué riesgo hay?", "Puede ejecutar código malicioso (inyección)", ["Ninguno, es totalmente seguro", "Solo afecta el diseño visual", "Hace el programa más rápido"], "🔓", "Nunca hay que confiar ciegamente en datos que vienen del usuario."],
  ["Una función suma_lista(lista) siempre revisa lista[0], lista[1] y lista[2] sin importar el tamaño real. ¿Cuál es el bug?", "Falla con otra cantidad de elementos", ["Es la forma correcta de hacerlo", "Es más rápida así, siempre", "Falta multiplicar por dos"], "📏"],
  ["Se probó una función SOLO con el caso 'todo funciona bien' y nunca con datos raros (vacío, negativo, enorme). ¿Qué falta?", "Probar casos límite (edge cases)", ["Nada, así se prueba siempre", "Probar con menos casos aún", "Cambiarle el nombre a la función"], "🧪"],
  ["Una función se llama a sí misma (recursión) pero nunca tiene un caso base que la detenga. ¿Qué pasa?", "Se llama sin fin hasta agotar la memoria", ["Funciona perfecto siempre igual", "Se detiene sola tras 10 llamadas", "No hace absolutamente nada"], "🔁", "Eso se llama stack overflow — toda función recursiva necesita un caso base."],
  ["Dos partes del programa leen y escriben la MISMA variable global al mismo tiempo, sin ningún control. ¿Qué problema es este?", "Una condición de carrera (race condition)", ["Un error de ortografía", "Un problema de diseño de colores", "No es ningún problema"], "⚡", "Cuando el orden de ejecución cambia el resultado, hay una condición de carrera."],
];

// ── 7. Gran Arquitecto: diseño de algoritmos ────────────────────

const ALGORITHMS_EXPERTO: [string, string[]][] = [
  ["Ordena los pasos del algoritmo de ORDENAMIENTO POR SELECCIÓN en una pasada", ["Buscar el menor elemento de la lista", "Intercambiarlo con el primer elemento", "Repetir con el resto de la lista", "Continuar hasta que todo esté ordenado"]],
  ["Ordena los pasos para diseñar un algoritmo desde cero", ["Entender bien el problema", "Pensar ejemplos de entrada y salida", "Diseñar los pasos en pseudocódigo", "Programarlo y probarlo con casos reales"]],
  ["Ordena el proceso de una búsqueda binaria en una lista ordenada", ["Mirar el elemento del medio", "Si es el valor buscado, terminar", "Si es menor, buscar en la mitad derecha", "Si es mayor, buscar en la mitad izquierda"]],
  ["Ordena los pasos para desplegar (deploy) una app con seguridad", ["Probar los cambios en el entorno local", "Ejecutar las pruebas automáticas", "Desplegar primero a un entorno de prueba", "Publicar en producción y monitorear"]],
  ["Ordena las capas típicas de una app web, desde lo que ve el usuario hasta los datos", ["Interfaz (frontend)", "Servidor (backend)", "Lógica de negocio", "Base de datos"]],
  ["Ordena cómo resuelve la recursión el cálculo de factorial(n)", ["Si n es 0 o 1, devolver 1 (caso base)", "Si no, multiplicar n por factorial(n-1)", "Cada llamada reduce el problema en 1", "Las llamadas se combinan al volver"]],
];

// ── 8. Código Secreto: hexadecimal y conceptos de sistemas ──────

function qHexToDecimal(): Question {
  const n = ri(16, 255);
  const hex = n.toString(16).toUpperCase();
  return numMC(`💻 En hexadecimal (base 16, usa 0-9 y A-F) el número es ${hex}.\n¿Qué número decimal es?`, n, {
    spread: 24,
    explain: `${hex} en hexadecimal equivale a ${n} en decimal.`,
  });
}
function qDecimalToHex(): Question {
  const n = ri(16, 255);
  const hex = n.toString(16).toUpperCase();
  const wrong = new Set<string>();
  let guard = 0;
  while (wrong.size < 3 && guard++ < 40) {
    const w = ri(16, 255).toString(16).toUpperCase();
    if (w !== hex) wrong.add(w);
  }
  return { kind: "mc", prompt: `💻 ¿Cómo se escribe el número ${n} en hexadecimal (base 16)?`, options: shuffle([hex, ...wrong]), answer: hex, notDecimal: true };
}

const CONCEPTS_EXPERTO: MC[] = [
  ["¿Qué es un lenguaje COMPILADO?", "Traduce todo el código antes de ejecutarlo", ["Se ejecuta línea por línea sin traducir", "No necesita ningún traductor", "Solo sirve para páginas web"], "⚙️"],
  ["¿Qué es un lenguaje INTERPRETADO?", "Se traduce y ejecuta línea por línea mientras corre", ["Se traduce todo de una vez antes de ejecutar", "No se traduce nunca", "Es más rápido siempre que uno compilado"], "🐍"],
  ["¿Qué es una API?", "Una forma en que dos programas se comunican", ["Un tipo de virus informático", "Un lenguaje de programación", "Un tipo de archivo de imagen"], "🔌"],
  ["¿Qué es una BASE DE DATOS?", "Un sistema para guardar información", ["Un tipo especial de pantalla", "Un tipo de virus informático", "Un lenguaje de programación"], "🗄️"],
  ["¿Qué hace el CONTROL DE VERSIONES (como Git)?", "Guarda el historial de cambios del código", ["Borra el código viejo para siempre", "Solo sirve para copias de seguridad de fotos", "Traduce el código a otro idioma"], "🗂️"],
  ["¿Qué significa que una contraseña esté 'hasheada'?", "Se guarda transformada, no se puede leer", ["Se guarda tal cual la escribiste", "Se envía por correo a todos siempre", "Se borra automáticamente después"], "🔐"],
  ["¿Qué es HTTPS en la barra del navegador?", "Una conexión cifrada y más segura", ["Un tipo de virus del navegador", "Un tipo de buscador web", "Un lenguaje de programación"], "🔒"],
  ["¿Qué es la NUBE (cloud) en informática?", "Computadoras de otra empresa, vía internet", ["Un clima especial para las computadoras", "Un tipo especial de pantalla", "Un cable especial y raro"], "☁️"],
  ["¿Qué diferencia hay entre HARDWARE y FIRMWARE?", "El firmware es software dentro del hardware", ["Son exactamente lo mismo siempre", "El hardware es solo un programa", "El firmware es solo para videojuegos"], "🔩"],
  ["¿Qué es la INTELIGENCIA ARTIFICIAL, en pocas palabras?", "Programas que aprenden patrones de datos", ["Robots con sentimientos reales propios", "Una computadora mucho más rápida", "Un tipo de videojuego nuevo"], "🤖"],
];

function genSecretCodeExperto(): Question[] {
  const hexQs = varied([qHexToDecimal, qDecimalToHex], 4);
  const conceptQs = sample(CONCEPTS_EXPERTO, 4).map(mcQuestion);
  const startWithHex = Math.random() < 0.5;
  const out: Question[] = [];
  for (let i = 0; i < 4; i++) {
    out.push(startWithHex ? hexQs[i] : conceptQs[i]);
    out.push(startWithHex ? conceptQs[i] : hexQs[i]);
  }
  return out;
}

// ── 9. Cajas Mágicas: tipos, alcance y constantes ───────────────

const VAR_CONCEPTS_EXPERTO: MC[] = [
  ["¿Qué TIPO de dato es 7?", "Número entero (integer)", ["Texto (string)", "Verdadero/falso (boolean)", "Lista (array)"], "🔢"],
  ["¿Qué TIPO de dato es \"hola\"?", "Texto (string)", ["Número", "Booleano", "Lista"], "🔤"],
  ["¿Qué TIPO de dato es verdadero o falso?", "Booleano (boolean)", ["Número decimal", "Texto", "Lista"], "✅"],
  ["¿Qué es una CONSTANTE?", "Un valor que no puede cambiar una vez definido", ["Una variable que cambia siempre", "Un tipo de función", "Un error del programa"], "🔒"],
  ["Una variable declarada DENTRO de una función tiene alcance…", "Local: solo existe dentro de esa función", ["Global: existe en todo el programa", "Eterno: nunca se borra", "Ninguno"], "🔭"],
  ["Si sumas el texto \"5\" con el número 3 sin convertir el tipo, ¿qué puede pasar?", "Depende del lenguaje: error o texto \"53\"", ["Siempre da 8 sin excepción", "Siempre da error sin excepción", "Se ignora el texto por completo"], "⚠️"],
];

function qVarTraceAdvanced(): Question {
  const start = ri(60, 150);
  const a = ri(1, 20);
  const b = ri(1, 20);
  const c = ri(1, 10);
  const result = start - a + b - c;
  return typed(
    `Instrucciones del programa:\ninventario = ${start}\nventas = ${a}\ndevoluciones = ${b}\ndañados = ${c}\ninventario = inventario - ventas + devoluciones - dañados\n¿Cuál es el valor final de "inventario"?`,
    result,
    { explain: `${start} − ${a} + ${b} − ${c} = ${result}.` }
  );
}

function qVarArray(): Question {
  const arr = Array.from({ length: 3 }, () => ri(5, 40));
  const idx = ri(0, 2);
  const newVal = ri(1, 99);
  const finalArr = [...arr];
  finalArr[idx] = newVal;
  const total = finalArr.reduce((a, b) => a + b, 0);
  return typed(
    `lista = [${arr.join(", ")}]\nlista[${idx}] = ${newVal}\n¿Cuánto suman todos los elementos de la lista ahora?`,
    total,
    { explain: `Después del cambio la lista es [${finalArr.join(", ")}], que suma ${total}.` }
  );
}

function qVarConceptExperto(): Question {
  return mcQuestion(pick(VAR_CONCEPTS_EXPERTO));
}

function genVariablesExperto(): Question[] {
  return varied([qVarTraceAdvanced, qVarArray, qVarConceptExperto], 8);
}

// ── 10. Piezas Reutilizables: recursión y funciones de orden superior ──

function qRecursionFactorial(): Question {
  const n = ri(3, 7);
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return typed(
    `función factorial(n):\n    si n <= 1: devolver 1\n    si no: devolver n × factorial(n-1)\n¿Cuánto devuelve factorial(${n})?`,
    result,
    { explain: `factorial(${n}) = ${Array.from({ length: n }, (_, i) => i + 1).join(" × ")} = ${result}.` }
  );
}

function qRecursionFibonacci(): Question {
  const n = ri(5, 9);
  const fib = (k: number): number => (k <= 1 ? k : fib(k - 1) + fib(k - 2));
  const result = fib(n);
  return typed(
    `función fib(n):\n    si n <= 1: devolver n\n    si no: devolver fib(n-1) + fib(n-2)\n¿Cuánto devuelve fib(${n})?`,
    result,
    { explain: `fib(${n}) = fib(${n - 1}) + fib(${n - 2}) = ${result}, siguiendo la sucesión de Fibonacci.` }
  );
}

const FUNC_CONCEPTS_EXPERTO: MC[] = [
  ["¿Qué es una función de ORDEN SUPERIOR?", "Una función que recibe o devuelve otra función", ["Una función más rápida que las demás", "Una función sin parámetros", "Un tipo de bucle"], "🧩"],
  ["¿Qué es una función PURA?", "Siempre da el mismo resultado con los mismos datos", ["Una función sin errores nunca jamás", "Una función que usa solo números", "Una función muy corta y simple"], "💎"],
  ["¿Qué necesita SIEMPRE una función recursiva para no fallar?", "Un caso base que detenga las llamadas", ["Muchos parámetros", "Ser muy corta", "No puede tener condicionales"], "🔁"],
  ["¿Qué es un PARÁMETRO POR DEFECTO?", "Un valor usado si no pasás ese argumento", ["Un parámetro obligatorio siempre", "Un error grave de programación", "El primer parámetro de cualquier función"], "⚙️"],
  ["¿Qué significa que una función tenga EFECTOS SECUNDARIOS?", "Que cambia algo fuera de sí misma", ["Que tarda mucho en ejecutarse siempre", "Que tiene muchos parámetros extra", "Que no devuelve absolutamente nada"], "🌊"],
  ["¿Por qué son útiles las funciones puras?", "Son más fáciles de probar y predecir", ["Porque son las únicas que existen", "Porque siempre son mucho más cortas", "Porque no necesitan ningún nombre"], "🧠"],
];

function qFuncConceptExperto(): Question {
  return mcQuestion(pick(FUNC_CONCEPTS_EXPERTO));
}

function genFunctionsExperto(): Question[] {
  return varied([qRecursionFactorial, qRecursionFibonacci, qFuncConceptExperto], 8);
}

// ── Niveles ──────────────────────────────────────────────────────

export const CODING_LEVELS: LevelDef[] = [
  { name: "Paso a Paso", emoji: "👣", desc: "Ordena instrucciones e imágenes en secuencia", tier: 1, gen: (d) => (d === "facil" ? genOrder(EMOJI_SEQUENCES)() : d === "experto" ? genOrder(SEQUENCES_EXPERTO)() : genOrder(SEQUENCES)()) },
  { name: "Caza Patrones", emoji: "🔍", desc: "Descubre qué sigue en cada patrón", tier: 1, gen: (d) => (d === "facil" ? genPatternsFacil() : d === "experto" ? genPatternsExperto() : genPatternsRest()) },
  { name: "Robot Explorador", emoji: "🤖", desc: "Programa los movimientos del robot", tier: 2, gen: genRobot },
  { name: "Bucles Mágicos", emoji: "🔁", desc: "Repite instrucciones y calcula el resultado", tier: 2, gen: genLoops },
  { name: "Si… Entonces", emoji: "🚦", desc: "Condicionales: decisiones del programa", tier: 2, gen: (d) => (d === "facil" ? genConditionalsFacil() : d === "experto" ? genCondExperto() : buildMC(CONDITIONALS)) },
  { name: "Cazador de Bugs", emoji: "🐞", desc: "Encuentra el error en cada programa", tier: 3, gen: (d) => (d === "facil" ? genOrderOrCheck(EMOJI_SEQUENCES_BUGS)() : d === "experto" ? buildMC(BUGS_EXPERTO) : buildMC(BUGS)) },
  { name: "Gran Arquitecto", emoji: "📐", desc: "Construye algoritmos completos", tier: 3, gen: (d) => (d === "facil" ? genOrder(EMOJI_SEQUENCES_ALGO)() : d === "experto" ? genOrder(ALGORITHMS_EXPERTO)() : genOrder(ALGORITHMS)()) },
  { name: "Código Secreto", emoji: "💾", desc: "Binario, cultura digital y encontrar el igual", tier: 3, gen: (d) => (d === "facil" ? genMatchVisual() : d === "experto" ? genSecretCodeExperto() : genSecretCodeRest()) },
  { name: "Cajas Mágicas", emoji: "📦", desc: "Variables: guarda y cambia datos como un programa real", tier: 2, gen: genVariables },
  { name: "Piezas Reutilizables", emoji: "🧩", desc: "Funciones: bloques con nombre que se pueden reutilizar", tier: 3, gen: genFunctions },
];
