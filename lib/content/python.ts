import type { Difficulty, LevelDef, Question } from "../types";
import { ri, pick, sample, numMC, textMC, tf, info, varied } from "./utils";

// ─────────────────────────────────────────────────────────────
// PROGRAMACIÓN: APRENDE PYTHON — 13 niveles, estilo SoloLearn.
// A diferencia de "Programación" (lógica y algoritmos con
// imágenes/pseudocódigo), esta materia enseña el LENGUAJE Python
// en sí: sintaxis real, código de verdad, de los fundamentos
// (print, variables) a temas avanzados (funciones, errores,
// clases). Cada nivel combina:
//   1) tarjetas "info" — código + explicación, sin puntaje ni
//      riesgo, como una lección de lectura (ver kind "info" en
//      types.ts y su render especial en LessonPlayer.tsx).
//   2) preguntas de práctica (mc/tf/type) que muestran código y
//      preguntan qué hace, qué imprime, o piden completar algo.
// La profundidad escala con la dificultad: "facil" muestra 1
// tarjeta simple + 3 preguntas fáciles; "experto" (Maestros, sin
// límite de edad) suma tarjetas y preguntas más avanzadas hasta
// cubrir el tema por completo — para que a un adulto real le
// sirva para aprender Python de punta a punta.
// ─────────────────────────────────────────────────────────────

type D = Difficulty;

const NAMES = ["Ana", "Leo", "Mia", "Sol", "Max", "Zoe", "Tom", "Eva", "Luz", "Kai", "Iris", "Nico"];
const FRUITS = ["manzana", "banana", "pera", "uva", "kiwi", "mango", "naranja", "frutilla", "durazno", "sandía"];

/** Recorta las tarjetas de enseñanza según la dificultad: 1 (facil) → 4 (experto), acumulativas. */
function cardsForTier(all: Question[], d: D): Question[] {
  const n = d === "facil" ? 1 : d === "normal" ? 2 : d === "dificil" ? 3 : 4;
  return all.slice(0, Math.min(n, all.length));
}

/** Cuántas preguntas de práctica arma cada dificultad. */
function practiceCount(d: D): number {
  return d === "facil" ? 3 : d === "normal" ? 5 : d === "dificil" ? 6 : 8;
}

// ═════════════════════════════════════════════════════════════
// 1. ¡Hola, Python!
// ═════════════════════════════════════════════════════════════

const L1_CARDS: Question[] = [
  info("🐍 Tu primer programa", `print("Hola, mundo")`, "La función print() muestra un mensaje en la pantalla. El texto que querés mostrar va entre comillas.", { output: "Hola, mundo" }),
  info("🖨️ Imprimir varias cosas", `print("Python", "es", "genial")`, "print() puede recibir varias cosas separadas por comas. Por defecto las separa con un espacio.", { output: "Python es genial" }),
  info("💬 Comentarios", `# Esto es un comentario\nprint("Hola")`, "Las líneas que empiezan con # son comentarios: Python las ignora por completo. Sirven para explicar el código a otras personas (¡o a vos mismo en el futuro!).", { output: "Hola" }),
  info("⚙️ El parámetro sep", `print("Hola", "Python", sep="-")`, 'print() tiene un parámetro opcional sep que cambia qué se usa para separar los valores. Acá, en vez de un espacio, usa un guion.', { output: "Hola-Python" }),
];

const PRINT_WORDS = ["Hola", "Chau", "Genial", "Bienvenido", "Python", "Vamos"];
function qPrintLiteral(): Question {
  const w = pick(PRINT_WORDS);
  const wrong = sample(PRINT_WORDS.filter((x) => x !== w), 2);
  return textMC("¿Qué imprime exactamente este código?", w, [...wrong, `"${w}"`], {
    code: `print("${w}")`,
    explain: `print() muestra el texto que está entre comillas, sin las comillas: ${w}.`,
  });
}

const PRINT_PAIRS: [string, string][] = [["Hola", "Mundo"], ["Buen", "día"], ["Vamos", "equipo"], ["Python", "mola"]];
function qPrintMultiple(): Question {
  const [a, b] = pick(PRINT_PAIRS);
  const answer = `${a} ${b}`;
  return textMC("¿Qué imprime este código?", answer, [`${a}${b}`, `${a},${b}`, `${b} ${a}`], {
    code: `print("${a}", "${b}")`,
    explain: `Con varios argumentos, print() los separa con un espacio: "${answer}".`,
  });
}

function qCommentEffect(): Question {
  const w = pick(PRINT_WORDS);
  return tf("¿Este código imprime algo en pantalla?", false, {
    code: `# print("${w}")`,
    explain: "La línea empieza con #, así que es un comentario: Python la ignora y no imprime nada.",
  });
}

function qWhatIsPrint(): Question {
  return textMC("¿Para qué sirve la función print() en Python?", "Mostrar un mensaje en la pantalla", [
    "Guardar un archivo en la computadora",
    "Pedirle un dato al usuario",
    "Borrar una variable",
  ]);
}

function qSepParam(): Question {
  const [a, b] = pick(PRINT_PAIRS);
  return textMC("¿Qué imprime este código?", `${a}-${b}`, [`${a} ${b}`, `${a}${b}`, `${a},${b}`], {
    code: `print("${a}", "${b}", sep="-")`,
    explain: 'sep="-" le dice a print() que use un guion en vez de un espacio para separar.',
  });
}

function qQuotesNeeded(): Question {
  return tf('¿print(Hola), sin comillas, funciona igual que print("Hola")?', false, {
    explain: "Sin comillas, Python busca una variable llamada Hola y, como no existe, da un error (NameError).",
  });
}

function L1_PRACTICE(d: D): (() => Question)[] {
  const facil = [qPrintLiteral, qWhatIsPrint];
  if (d === "facil") return facil;
  const core = [...facil, qPrintMultiple, qCommentEffect];
  if (d === "experto") return [...core, qSepParam, qQuotesNeeded];
  return core;
}

function genHello(d: D): Question[] {
  return [...cardsForTier(L1_CARDS, d), ...varied(L1_PRACTICE(d), practiceCount(d))];
}

// ═════════════════════════════════════════════════════════════
// 2. Variables y Tipos
// ═════════════════════════════════════════════════════════════

const L2_CARDS: Question[] = [
  info("📦 Guardar datos en variables", `nombre = "Ana"\nedad = 10\nprint(nombre, edad)`, "Una variable es un nombre que guarda un valor. Con = le asignás un valor; después podés usarla las veces que quieras.", { output: "Ana 10" }),
  info("🔄 Reasignar una variable", `x = 5\nx = x + 1\nprint(x)`, "Una variable puede cambiar de valor. Acá x vale 5, y después se actualiza sumándole 1: ahora vale 6.", { output: "6" }),
  info("🏷️ El tipo de dato: type()", `print(type(5))\nprint(type("hola"))`, "Python tiene distintos tipos de datos: int (enteros), float (decimales), str (texto) y bool (verdadero/falso). type() te dice cuál es.", { output: "<class 'int'>\n<class 'str'>" }),
  info("✅ Booleanos", `activo = True\nprint(type(activo))`, "True y False son del tipo bool, y se escriben siempre con mayúscula inicial. Sirven para representar verdadero o falso.", { output: "<class 'bool'>" }),
];

function qVarAssignRead(): Question {
  const n = pick(NAMES);
  return textMC("¿Qué imprime este código?", n, sample(NAMES.filter((x) => x !== n), 3), {
    code: `nombre = "${n}"\nprint(nombre)`,
    explain: `La variable nombre guarda "${n}", y print(nombre) muestra su valor.`,
  });
}

function qVarReassign(): Question {
  const start = ri(1, 10);
  const add = ri(1, 5);
  return numMC("¿Qué imprime este código?", start + add, {
    code: `x = ${start}\nx = x + ${add}\nprint(x)`,
    spread: 3,
    explain: `x empieza en ${start} y se le suma ${add}: ${start} + ${add} = ${start + add}.`,
  });
}

function qVarNaming(): Question {
  return tf('¿"2x" es un nombre válido para una variable en Python?', false, {
    explain: 'Un nombre de variable no puede empezar con un número. "x2" sí sería válido.',
  });
}

const TYPE_SAMPLES: [string, string][] = [
  ["5", "int"],
  ['"hola"', "str"],
  ["3.5", "float"],
  ["True", "bool"],
];
function qTypeOf(): Question {
  const [lit, t] = pick(TYPE_SAMPLES);
  return textMC(`¿Qué imprime type(${lit})?`, `<class '${t}'>`, TYPE_SAMPLES.filter(([l]) => l !== lit).map(([, tt]) => `<class '${tt}'>`), {
    code: `print(type(${lit}))`,
    explain: `${lit} es de tipo ${t}.`,
  });
}

function qBoolConcept(): Question {
  return textMC("¿Cuál es el tipo de dato de True en Python?", "bool", ["int", "str", "float"]);
}

function L2_PRACTICE(d: D): (() => Question)[] {
  const facil = [qVarAssignRead, qVarReassign];
  if (d === "facil") return facil;
  const core = [...facil, qVarNaming];
  if (d === "normal") return core;
  const advanced = [...core, qTypeOf];
  if (d === "dificil") return advanced;
  return [...advanced, qBoolConcept];
}

function genVariables(d: D): Question[] {
  return [...cardsForTier(L2_CARDS, d), ...varied(L2_PRACTICE(d), practiceCount(d))];
}

// ═════════════════════════════════════════════════════════════
// 3. Operadores
// ═════════════════════════════════════════════════════════════

const L3_CARDS: Question[] = [
  info("➕ Operadores aritméticos", `print(7 + 3)\nprint(7 - 3)`, "Python entiende los operadores matemáticos básicos: + (suma), - (resta), * (multiplicación) y / (división).", { output: "10\n4" }),
  info("➗ División entera y resto", `print(7 // 2)\nprint(7 % 2)`, "// es la división entera (se queda con la parte entera) y % es el resto de esa división. 7 dividido 2 da 3 y sobra 1.", { output: "3\n1" }),
  info("⚡ Potencia", `print(2 ** 3)`, "** eleva un número a una potencia. 2 ** 3 significa 2 elevado a la 3, o sea 2×2×2.", { output: "8" }),
  info("🔗 Operadores lógicos", `print(5 > 3 and 2 < 1)`, "and, or y not combinan comparaciones. and es verdadero solo si AMBOS lados son verdaderos: 5 > 3 es True, pero 2 < 1 es False, así que el resultado es False.", { output: "False" }),
];

function qArithOp(): Question {
  const op = pick(["+", "-", "*"] as const);
  let a = ri(2, 12);
  let b = ri(2, 9);
  if (op === "-" && b > a) [a, b] = [b, a];
  const result = op === "+" ? a + b : op === "-" ? a - b : a * b;
  return numMC("¿Qué imprime este código?", result, { code: `print(${a} ${op} ${b})`, explain: `${a} ${op} ${b} = ${result}.` });
}

function qComparison(): Question {
  const a = ri(1, 20);
  const b = ri(1, 20);
  const op = pick(["==", ">", "<"] as const);
  const result = op === ">" ? a > b : op === "<" ? a < b : a === b;
  return tf("¿Este código imprime True?", result, {
    code: `print(${a} ${op} ${b})`,
    explain: `${a} ${op} ${b} es ${result ? "True" : "False"}.`,
  });
}

function qFloorMod(): Question {
  const useMod = Math.random() < 0.5;
  const a = ri(10, 30);
  const b = ri(2, 6);
  const result = useMod ? a % b : Math.floor(a / b);
  return numMC("¿Qué imprime este código?", result, {
    code: useMod ? `print(${a} % ${b})` : `print(${a} // ${b})`,
    spread: 3,
    explain: useMod
      ? `% da el resto de la división: ${a} entre ${b} da resto ${result}.`
      : `// da la parte entera de la división: ${a} ÷ ${b} ≈ ${(a / b).toFixed(2)}, y la parte entera es ${result}.`,
  });
}

function qPower(): Question {
  const base = ri(2, 5);
  const exp = ri(2, 4);
  const result = base ** exp;
  return numMC("¿Qué imprime este código?", result, {
    code: `print(${base} ** ${exp})`,
    spread: Math.max(4, Math.round(result * 0.3)),
    explain: `${base} ** ${exp} = ${Array.from({ length: exp }, () => base).join(" × ")} = ${result}.`,
  });
}

function qLogical(): Question {
  const a = ri(1, 10);
  const b = ri(1, 10);
  const c = ri(1, 10);
  const e = ri(1, 10);
  const useAnd = Math.random() < 0.5;
  const left = a > b;
  const right = c > e;
  const result = useAnd ? left && right : left || right;
  return tf("¿Este código imprime True?", result, {
    code: `print(${a} > ${b} ${useAnd ? "and" : "or"} ${c} > ${e})`,
    explain: `${a} > ${b} es ${left}. ${c} > ${e} es ${right}. Con ${useAnd ? "and (ambos deben ser True)" : "or (alcanza con uno)"}, el resultado es ${result}.`,
  });
}

function L3_PRACTICE(d: D): (() => Question)[] {
  const facil = [qArithOp, qComparison];
  if (d === "facil") return facil;
  const core = [...facil, qFloorMod];
  if (d === "normal") return core;
  const advanced = [...core, qPower];
  if (d === "dificil") return advanced;
  return [...advanced, qLogical];
}

function genOperators(d: D): Question[] {
  return [...cardsForTier(L3_CARDS, d), ...varied(L3_PRACTICE(d), practiceCount(d))];
}

// ═════════════════════════════════════════════════════════════
// 4. Cadenas de Texto
// ═════════════════════════════════════════════════════════════

const L4_CARDS: Question[] = [
  info("🔤 Concatenar texto", `nombre = "Ana"\nprint("Hola, " + nombre)`, "Con + podés unir (concatenar) dos strings (textos) para formar uno nuevo.", { output: "Hola, Ana" }),
  info("✨ f-strings", `nombre = "Ana"\nprint(f"Hola, {nombre}")`, "Una f-string (con una f antes de las comillas) te deja insertar variables directamente dentro del texto, usando llaves {}. Es la forma más clara de combinar texto y variables.", { output: "Hola, Ana" }),
  info("📏 Longitud e índices", `palabra = "Python"\nprint(len(palabra))\nprint(palabra[0])`, "len() cuenta cuántos caracteres tiene un string. Cada carácter tiene una posición (índice) que empieza en 0, así que palabra[0] es la primera letra.", { output: "6\nP" }),
  info("🔡 Métodos de texto", `saludo = "hola"\nprint(saludo.upper())`, "Los strings tienen métodos útiles: .upper() pasa todo a mayúsculas, .lower() a minúsculas. Se usan con un punto después de la variable.", { output: "HOLA" }),
];

const GREET_PREFIXES = ["Hola, ", "Bienvenido, ", "Hasta luego, ", "Gracias, "];
function qConcat(): Question {
  const prefix = pick(GREET_PREFIXES);
  const n = pick(NAMES);
  const answer = prefix + n;
  return textMC("¿Qué imprime este código?", answer, [prefix.trim() + n, n + prefix, prefix + n.toLowerCase()], {
    code: `nombre = "${n}"\nprint("${prefix}" + nombre)`,
    explain: `+ une los dos textos tal cual están, sin agregar ni quitar espacios: "${answer}".`,
  });
}

function qFString(): Question {
  const n = pick(NAMES);
  const answer = `Hola, ${n}`;
  return textMC("¿Qué imprime este código?", answer, ["Hola, {nombre}", `f"Hola, ${n}"`, `Hola, "${n}"`], {
    code: `nombre = "${n}"\nprint(f"Hola, {nombre}")`,
    explain: `La f-string reemplaza {nombre} por el valor de la variable: "${answer}".`,
  });
}

const LEN_WORDS = ["Python", "programar", "variable", "funcion", "codigo", "hola"];
function qLen(): Question {
  const w = pick(LEN_WORDS);
  return numMC("¿Qué imprime este código?", w.length, {
    code: `palabra = "${w}"\nprint(len(palabra))`,
    spread: 2,
    explain: `"${w}" tiene ${w.length} caracteres.`,
  });
}

const INDEX_WORDS = ["Python", "hola", "codigo", "clase"];
function qIndex(): Question {
  const w = pick(INDEX_WORDS);
  const idx = ri(0, w.length - 1);
  const answer = w[idx];
  const letters = Array.from(new Set(w.split(""))).filter((c) => c !== answer);
  return textMC("¿Qué imprime este código?", answer, sample(letters, Math.min(3, letters.length)), {
    code: `palabra = "${w}"\nprint(palabra[${idx}])`,
    explain: `Los índices empiezan en 0, así que palabra[${idx}] es el carácter número ${idx + 1}: "${answer}".`,
  });
}

const CASE_WORDS = ["hola", "python", "codigo", "clase", "mundo"];
function qUpperLower(): Question {
  const w = pick(CASE_WORDS);
  const answer = w.toUpperCase();
  return textMC("¿Qué imprime este código?", answer, [w, w[0].toUpperCase() + w.slice(1), w + w], {
    code: `texto = "${w}"\nprint(texto.upper())`,
    explain: `.upper() convierte todo el texto a mayúsculas: "${answer}".`,
  });
}

function L4_PRACTICE(d: D): (() => Question)[] {
  const facil = [qConcat];
  if (d === "facil") return facil;
  const normal = [...facil, qFString];
  if (d === "normal") return normal;
  const advanced = [...normal, qLen, qIndex];
  if (d === "dificil") return advanced;
  return [...advanced, qUpperLower];
}

function genStrings(d: D): Question[] {
  return [...cardsForTier(L4_CARDS, d), ...varied(L4_PRACTICE(d), practiceCount(d))];
}

// ═════════════════════════════════════════════════════════════
// 5. Entrada de Datos
// ═════════════════════════════════════════════════════════════

const L5_CARDS: Question[] = [
  info("⌨️ Pedir datos con input()", `nombre = input("¿Cómo te llamás? ")\nprint("Hola,", nombre)`, "input() muestra un mensaje y espera a que la persona escriba algo y presione Enter. Lo que escribe se guarda en la variable.", { output: "(espera que escribas tu nombre y después te saluda)" }),
  info("🔤 input() siempre da texto", `edad = input("Edad: ")\nprint(type(edad))`, "Ojo: input() SIEMPRE devuelve un string (texto), aunque la persona escriba solo números.", { output: "<class 'str'>" }),
  info("🔢 Convertir a número", `edad = int(input("Edad: "))\nprint(edad + 1)`, "Para poder hacer cuentas con lo que escribe el usuario, hay que convertirlo con int() (entero) o float() (decimal).", { output: "si escribís 10 → 11" }),
  info("💰 float() para decimales", `precio = float(input("Precio: "))\nprint(precio * 1.21)`, "float() convierte texto a número decimal. Es ideal para dinero, medidas o cualquier cosa que no sea un entero exacto.", { output: "si escribís 100 → 121.0" }),
];

function qInputReturnsStr(): Question {
  return tf("¿input() siempre devuelve texto (str), aunque escribas solo números?", true, {
    explain: "Sí: input() devuelve siempre un string. Si querés un número, hay que convertirlo con int() o float().",
  });
}

function qNeedConversion(): Question {
  return textMC("¿Qué función convierte un texto en un número entero?", "int()", ["str()", "print()", "float()"]);
}

function qConversionResult(): Question {
  const n = ri(1, 50);
  return numMC(`Si el usuario escribe "${n}", ¿qué imprime este código?`, n + 1, {
    code: `edad = int(input("Edad: "))\nprint(edad + 1)`,
    spread: 3,
    explain: `int("${n}") convierte el texto en el número ${n}, y ${n} + 1 = ${n + 1}.`,
  });
}

function qTypeErrorConcept(): Question {
  return tf('¿"5" + 3 funciona y da 8 en Python?', false, {
    explain: '"5" es texto y 3 es número: sumarlos da un error (TypeError). Antes hay que convertir: int("5") + 3.',
  });
}

function qFloatConversion(): Question {
  const price = ri(50, 500);
  const total = Math.round(price * 1.21 * 100) / 100;
  return numMC(`Si el usuario escribe "${price}", ¿qué imprime este código? (con IVA del 21%, redondeado)`, total, {
    code: `precio = float(input("Precio: "))\nprint(round(precio * 1.21, 2))`,
    spread: Math.max(10, Math.round(total * 0.2)),
    explain: `float("${price}") da ${price}.0, y ${price} × 1.21 = ${total}.`,
  });
}

function L5_PRACTICE(d: D): (() => Question)[] {
  const facil = [qInputReturnsStr, qNeedConversion];
  if (d === "facil") return facil;
  const normal = [...facil, qConversionResult];
  if (d === "normal") return normal;
  const advanced = [...normal, qTypeErrorConcept];
  if (d === "dificil") return advanced;
  return [...advanced, qFloatConversion];
}

function genInput(d: D): Question[] {
  return [...cardsForTier(L5_CARDS, d), ...varied(L5_PRACTICE(d), practiceCount(d))];
}

// ═════════════════════════════════════════════════════════════
// 6. Condicionales
// ═════════════════════════════════════════════════════════════

const L6_CARDS: Question[] = [
  info("🚦 if / else", `edad = 10\nif edad >= 18:\n    print("Adulto")\nelse:\n    print("Menor")`, 'if evalúa una condición: si es verdadera, ejecuta el bloque de abajo (indentado); si es falsa, ejecuta el bloque de else. Como edad es 10 y no es ≥ 18, se imprime "Menor".', { output: "Menor" }),
  info("🎯 elif: más caminos", `nota = 7\nif nota >= 9:\n    print("Excelente")\nelif nota >= 6:\n    print("Aprobado")\nelse:\n    print("Reprobado")`, 'elif ("else if") agrega condiciones intermedias. Python revisa cada condición en orden hasta encontrar una verdadera.', { output: "Aprobado" }),
  info("📐 La indentación importa", `if True:\nprint("Hola")`, "Este código tiene un error: a print() le falta la indentación (los espacios) que indica que pertenece al bloque del if. Python usa la indentación para saber qué código va \"dentro\" de cada bloque — es obligatoria, no solo estética.", { output: "IndentationError" }),
  info("🔗 Condiciones combinadas", `edad = 20\ntiene_dni = True\nif edad >= 18 and tiene_dni:\n    print("Puede votar")`, "Dentro de un if podés combinar varias condiciones con and, or y not, igual que en cualquier expresión lógica.", { output: "Puede votar" }),
];

function qIfElseOutput(): Question {
  const edad = ri(5, 25);
  const branch = edad >= 18 ? "Adulto" : "Menor";
  return textMC("¿Qué imprime este código?", branch, ["Adulto", "Menor", "Nada", "Error"].filter((x) => x !== branch), {
    code: `edad = ${edad}\nif edad >= 18:\n    print("Adulto")\nelse:\n    print("Menor")`,
    explain: `edad vale ${edad}, ${edad >= 18 ? "que sí es" : "que NO es"} mayor o igual a 18, así que imprime "${branch}".`,
  });
}

function qElifOutput(): Question {
  const nota = ri(1, 10);
  const branch = nota >= 9 ? "Excelente" : nota >= 6 ? "Aprobado" : "Reprobado";
  return textMC("¿Qué imprime este código?", branch, ["Excelente", "Aprobado", "Reprobado"].filter((x) => x !== branch), {
    code: `nota = ${nota}\nif nota >= 9:\n    print("Excelente")\nelif nota >= 6:\n    print("Aprobado")\nelse:\n    print("Reprobado")`,
    explain: `nota vale ${nota}. ${nota >= 9 ? "Es ≥ 9" : nota >= 6 ? "No llega a 9 pero sí es ≥ 6" : "No llega a 6"}, así que imprime "${branch}".`,
  });
}

function qIndentMatters(): Question {
  return tf("¿La indentación (los espacios al principio de la línea) es obligatoria en Python?", true, {
    explain: "Sí: a diferencia de otros lenguajes, Python usa la indentación para marcar qué código pertenece a cada bloque (if, for, función, etc).",
  });
}

function qNestedLogic(): Question {
  const edad = ri(15, 25);
  const dni = Math.random() < 0.5;
  const puede = edad >= 18 && dni;
  return tf('¿Este código imprime "Puede votar"?', puede, {
    code: `edad = ${edad}\ntiene_dni = ${dni ? "True" : "False"}\nif edad >= 18 and tiene_dni:\n    print("Puede votar")`,
    explain: `edad ${edad >= 18 ? "sí es" : "no es"} ≥ 18, y tiene_dni es ${dni}. Con and, ambas deben ser True: el resultado es ${puede}.`,
  });
}

function L6_PRACTICE(d: D): (() => Question)[] {
  const facil = [qIfElseOutput];
  if (d === "facil") return facil;
  const normal = [...facil, qElifOutput];
  if (d === "normal") return normal;
  const advanced = [...normal, qIndentMatters];
  if (d === "dificil") return advanced;
  return [...advanced, qNestedLogic];
}

function genConditionals(d: D): Question[] {
  return [...cardsForTier(L6_CARDS, d), ...varied(L6_PRACTICE(d), practiceCount(d))];
}

// ═════════════════════════════════════════════════════════════
// 7. Bucle for
// ═════════════════════════════════════════════════════════════

const L7_CARDS: Question[] = [
  info("🔁 for con range()", `for i in range(3):\n    print(i)`, "range(3) genera los números 0, 1, 2 (empieza en 0 y NO incluye el 3). El bucle for repite el bloque una vez por cada uno de esos números.", { output: "0\n1\n2" }),
  info("🎯 range() con inicio y fin", `for i in range(1, 4):\n    print(i)`, "Si le das dos números a range(), el primero es el inicio y el segundo es el fin (sin incluir). range(1, 4) da 1, 2, 3.", { output: "1\n2\n3" }),
  info("🔤 Iterar un texto", `for letra in "Sol":\n    print(letra)`, "Un for también puede recorrer un string, letra por letra, en el orden en que aparecen.", { output: "S\no\nl" }),
  info("⏭️ range() con paso (step)", `for i in range(0, 10, 2):\n    print(i)`, 'El tercer número de range() es el "paso": cuánto salta entre número y número. range(0, 10, 2) da los pares: 0, 2, 4, 6, 8.', { output: "0\n2\n4\n6\n8" }),
];

function qRangeCount(): Question {
  const n = ri(2, 8);
  return numMC("¿Cuántas veces se ejecuta print() en este código?", n, {
    code: `for i in range(${n}):\n    print(i)`,
    spread: 2,
    explain: `range(${n}) genera ${n} números (del 0 al ${n - 1}), así que el bucle se repite ${n} veces.`,
  });
}

function qRangeLast(): Question {
  const n = ri(2, 9);
  return numMC("¿Cuál es el último número que imprime este código?", n - 1, {
    code: `for i in range(${n}):\n    print(i)`,
    spread: 2,
    explain: `range(${n}) va de 0 a ${n - 1} (no incluye el ${n}), así que el último valor impreso es ${n - 1}.`,
  });
}

function qRangeStartEnd(): Question {
  const a = ri(1, 5);
  const b = ri(a + 2, a + 7);
  return numMC("¿Cuántas veces se ejecuta este bucle?", b - a, {
    code: `for i in range(${a}, ${b}):\n    print(i)`,
    spread: 2,
    explain: `range(${a}, ${b}) genera los números del ${a} al ${b - 1}: en total ${b - a}.`,
  });
}

const FOR_STRING_WORDS = ["Sol", "Python", "hola", "clase", "codigo"];
function qForStringLen(): Question {
  const w = pick(FOR_STRING_WORDS);
  return numMC("¿Cuántas veces se ejecuta print() en este código?", w.length, {
    code: `for letra in "${w}":\n    print(letra)`,
    spread: 2,
    explain: `El for recorre cada carácter del string "${w}", que tiene ${w.length} caracteres.`,
  });
}

function qRangeStep(): Question {
  const step = pick([2, 3]);
  const end = step === 2 ? 10 : 12;
  const values: number[] = [];
  for (let i = 0; i < end; i += step) values.push(i);
  const answer = values.join(", ");
  return textMC("¿Qué números imprime este código, en orden?", answer, [
    Array.from({ length: end }, (_, i) => i).join(", "),
    values.slice().reverse().join(", "),
    values.map((v) => v + step).join(", "),
  ], {
    code: `for i in range(0, ${end}, ${step}):\n    print(i)`,
    explain: `range(0, ${end}, ${step}) empieza en 0 y salta de a ${step}: ${answer}.`,
  });
}

function L7_PRACTICE(d: D): (() => Question)[] {
  const facil = [qRangeCount, qRangeLast];
  if (d === "facil") return facil;
  const normal = [...facil, qRangeStartEnd];
  if (d === "normal") return normal;
  const advanced = [...normal, qForStringLen];
  if (d === "dificil") return advanced;
  return [...advanced, qRangeStep];
}

function genForLoop(d: D): Question[] {
  return [...cardsForTier(L7_CARDS, d), ...varied(L7_PRACTICE(d), practiceCount(d))];
}

// ═════════════════════════════════════════════════════════════
// 8. Bucle while
// ═════════════════════════════════════════════════════════════

const L8_CARDS: Question[] = [
  info("🔂 while: repetir mientras se cumpla", `contador = 0\nwhile contador < 3:\n    print(contador)\n    contador += 1`, "while repite el bloque MIENTRAS la condición sea verdadera. Es clave actualizar la variable adentro del bucle (acá con += 1) para que en algún momento la condición se vuelva falsa.", { output: "0\n1\n2" }),
  info("♾️ El riesgo del bucle infinito", `contador = 0\nwhile contador < 3:\n    print("Hola")`, 'Si te olvidás de actualizar la variable de la condición, el bucle nunca termina: se repite para siempre (bucle infinito). Este código nunca deja de imprimir "Hola".', { output: "Hola\nHola\nHola\n… (para siempre) ⚠️" }),
  info("🛑 break: cortar el bucle", `for i in range(5):\n    if i == 3:\n        break\n    print(i)`, "break corta el bucle inmediatamente, sin terminar las repeticiones que quedaban. Acá, apenas i llega a 3, el bucle se corta.", { output: "0\n1\n2" }),
  info("⏭️ continue: saltar una vuelta", `for i in range(5):\n    if i == 2:\n        continue\n    print(i)`, "continue salta el resto del bloque y pasa directamente a la siguiente vuelta, sin cortar el bucle entero. Acá se salta solo el print() cuando i es 2.", { output: "0\n1\n3\n4" }),
];

function qWhileCount(): Question {
  const limit = ri(2, 6);
  return numMC("¿Cuántas veces imprime este código?", limit, {
    code: `contador = 0\nwhile contador < ${limit}:\n    print(contador)\n    contador += 1`,
    spread: 2,
    explain: `El bucle sigue mientras contador sea menor que ${limit}: se repite ${limit} veces (contador vale 0, 1, ..., ${limit - 1}).`,
  });
}

function qWhileFinal(): Question {
  const limit = ri(2, 8);
  return numMC("¿Cuánto vale contador DESPUÉS de que termina el bucle?", limit, {
    code: `contador = 0\nwhile contador < ${limit}:\n    contador += 1`,
    spread: 2,
    explain: `El bucle suma 1 hasta que contador deja de ser menor que ${limit}: al terminar, contador vale exactamente ${limit}.`,
  });
}

function qInfiniteLoopRisk(): Question {
  return tf("¿Este bucle es infinito (nunca termina)?", true, {
    code: `contador = 0\nwhile contador < 5:\n    print("Hola")`,
    explain: "contador nunca cambia dentro del bucle, así que la condición contador < 5 siempre es verdadera: se repite para siempre.",
  });
}

function qBreakOutput(): Question {
  const stop = ri(2, 4);
  const values = Array.from({ length: stop }, (_, i) => i);
  return textMC("¿Qué números imprime este código, en orden?", values.join(", "), [
    Array.from({ length: 5 }, (_, i) => i).join(", "),
    values.slice().reverse().join(", "),
    "(no imprime nada)",
  ], {
    code: `for i in range(5):\n    if i == ${stop}:\n        break\n    print(i)`,
    explain: `El bucle imprime hasta antes de que i llegue a ${stop}: cuando i vale ${stop}, break corta todo. Imprime: ${values.join(", ")}.`,
  });
}

function qContinueOutput(): Question {
  const skip = ri(1, 3);
  const values = Array.from({ length: 5 }, (_, i) => i).filter((i) => i !== skip);
  return textMC("¿Qué números imprime este código, en orden?", values.join(", "), [
    Array.from({ length: 5 }, (_, i) => i).join(", "),
    Array.from({ length: skip }, (_, i) => i).join(", "),
    values.slice().reverse().join(", "),
  ], {
    code: `for i in range(5):\n    if i == ${skip}:\n        continue\n    print(i)`,
    explain: `continue salta solo el print() cuando i vale ${skip}; el bucle sigue con el resto de los valores: ${values.join(", ")}.`,
  });
}

function L8_PRACTICE(d: D): (() => Question)[] {
  const facil = [qWhileCount];
  if (d === "facil") return facil;
  const normal = [...facil, qWhileFinal, qInfiniteLoopRisk];
  if (d === "normal") return normal;
  const advanced = [...normal, qBreakOutput];
  if (d === "dificil") return advanced;
  return [...advanced, qContinueOutput];
}

function genWhileLoop(d: D): Question[] {
  return [...cardsForTier(L8_CARDS, d), ...varied(L8_PRACTICE(d), practiceCount(d))];
}

// ═════════════════════════════════════════════════════════════
// 9. Listas
// ═════════════════════════════════════════════════════════════

const L9_CARDS: Question[] = [
  info("📃 Crear una lista", `frutas = ["manzana", "banana", "pera"]\nprint(frutas[0])`, "Una lista guarda varios valores en un solo lugar, entre corchetes [] y separados por comas. Cada elemento tiene un índice que empieza en 0.", { output: "manzana" }),
  info("➕ Agregar elementos: append()", `frutas.append("uva")\nprint(frutas)`, ".append() agrega un elemento al final de la lista. Es una de las formas más comunes de hacerla crecer.", { output: "['manzana', 'banana', 'pera', 'uva']" }),
  info("↩️ Índices negativos", `print(frutas[-1])`, "Los índices negativos cuentan desde el final: -1 es el último elemento, -2 el anteúltimo, y así.", { output: "uva" }),
  info("✂️ Slicing: sublistas", `print(frutas[1:3])`, "El slicing [inicio:fin] te da una sublista, desde el índice inicio hasta fin SIN incluirlo. frutas[1:3] toma los elementos en posición 1 y 2.", { output: "['banana', 'pera']" }),
];

function qListIndex(): Question {
  const list = sample(FRUITS, 4);
  const idx = ri(0, 3);
  const answer = list[idx];
  const wrong = list.filter((x) => x !== answer);
  return textMC("¿Qué imprime este código?", answer, wrong, {
    code: `frutas = [${list.map((f) => `"${f}"`).join(", ")}]\nprint(frutas[${idx}])`,
    explain: `El índice ${idx} corresponde a la posición número ${idx + 1} de la lista: "${answer}".`,
  });
}

function qListLen(): Question {
  const n = ri(3, 7);
  const list = sample(FRUITS, n);
  return numMC("¿Qué imprime este código?", n, {
    code: `frutas = [${list.map((f) => `"${f}"`).join(", ")}]\nprint(len(frutas))`,
    spread: 2,
    explain: `La lista tiene ${n} elementos.`,
  });
}

function qListAppend(): Question {
  const list = sample(FRUITS, 3);
  const newItem = pick(FRUITS.filter((f) => !list.includes(f)));
  const quoted = (arr: string[]) => `[${arr.map((f) => `"${f}"`).join(", ")}]`;
  const before = quoted(list);
  const after = quoted([...list, newItem]);
  const wrongFront = quoted([newItem, ...list]);
  return textMC("¿Qué imprime este código?", after, [before, wrongFront], {
    code: `frutas = ${before}\nfrutas.append("${newItem}")\nprint(frutas)`,
    explain: `.append() agrega "${newItem}" al FINAL de la lista: ${after}.`,
  });
}

function qListNegIndex(): Question {
  const list = sample(FRUITS, 4);
  const answer = list[list.length - 1];
  const wrong = list.filter((x) => x !== answer);
  return textMC("¿Qué imprime este código?", answer, wrong, {
    code: `frutas = [${list.map((f) => `"${f}"`).join(", ")}]\nprint(frutas[-1])`,
    explain: `El índice -1 es siempre el ÚLTIMO elemento de la lista: "${answer}".`,
  });
}

function qListSlice(): Question {
  const list = sample(FRUITS, 5);
  const a = ri(0, 2);
  const b = ri(a + 1, 4);
  const quoted = (arr: string[]) => `[${arr.map((f) => `"${f}"`).join(", ")}]`;
  const answer = quoted(list.slice(a, b));
  const wrongFull = quoted(list);
  // complemento de la porción correcta: por construcción nunca coincide
  // con la respuesta ni con la lista completa (evita distractores duplicados).
  const wrongOff = quoted([...list.slice(0, a), ...list.slice(b)]);
  return textMC("¿Qué imprime este código?", answer, [wrongFull, wrongOff], {
    code: `frutas = ${quoted(list)}\nprint(frutas[${a}:${b}])`,
    explain: `frutas[${a}:${b}] toma desde el índice ${a} hasta el ${b} SIN incluirlo: ${answer}.`,
  });
}

function L9_PRACTICE(d: D): (() => Question)[] {
  const facil = [qListIndex, qListLen];
  if (d === "facil") return facil;
  const normal = [...facil, qListAppend];
  if (d === "normal") return normal;
  const advanced = [...normal, qListNegIndex];
  if (d === "dificil") return advanced;
  return [...advanced, qListSlice];
}

function genLists(d: D): Question[] {
  return [...cardsForTier(L9_CARDS, d), ...varied(L9_PRACTICE(d), practiceCount(d))];
}

// ═════════════════════════════════════════════════════════════
// 10. Diccionarios
// ═════════════════════════════════════════════════════════════

const L10_CARDS: Question[] = [
  info("🗂️ Crear un diccionario", `persona = {"nombre": "Ana", "edad": 10}\nprint(persona["nombre"])`, "Un diccionario guarda pares clave: valor entre llaves {}. En vez de un índice numérico, accedés a cada valor usando su clave.", { output: "Ana" }),
  info("➕ Agregar una clave nueva", `persona["ciudad"] = "Lima"\nprint(persona)`, "Para agregar (o cambiar) una clave, le asignás un valor con []. Si la clave no existía, se crea.", { output: "{'nombre': 'Ana', 'edad': 10, 'ciudad': 'Lima'}" }),
  info("🛡️ .get(): acceso seguro", `print(persona.get("pais", "Desconocido"))`, 'Acceder a una clave que no existe con [] da error. .get() es más seguro: si la clave no está, devuelve el valor por defecto que le indiques (acá, "Desconocido") en vez de romper el programa.', { output: "Desconocido" }),
  info("🔑 Iterar un diccionario", `for clave in persona:\n    print(clave)`, "Un for sobre un diccionario recorre sus CLAVES, una por una (no los valores).", { output: "nombre\nedad\nciudad" }),
];

const PEOPLE_KEYS: [string, string][] = [
  ["nombre", "Ana"],
  ["mascota", "Rex"],
  ["ciudad", "Lima"],
  ["color favorito", "azul"],
];
function qDictAccess(): Question {
  const [key, val] = pick(PEOPLE_KEYS);
  const otherVals = PEOPLE_KEYS.filter(([k]) => k !== key).map(([, v]) => v);
  return textMC("¿Qué imprime este código?", val, sample(otherVals, Math.min(3, otherVals.length)), {
    code: `datos = {"${key}": "${val}"}\nprint(datos["${key}"])`,
    explain: `datos["${key}"] devuelve el valor asociado a esa clave: "${val}".`,
  });
}

function qDictAddKey(): Question {
  const [k1, v1] = pick(PEOPLE_KEYS);
  const rest = PEOPLE_KEYS.filter(([k]) => k !== k1);
  const [k2, v2] = pick(rest);
  const before = `{"${k1}": "${v1}"}`;
  const after = `{"${k1}": "${v1}", "${k2}": "${v2}"}`;
  return textMC("¿Qué imprime este código?", after, [before, `{"${k2}": "${v2}"}`], {
    code: `datos = ${before}\ndatos["${k2}"] = "${v2}"\nprint(datos)`,
    explain: `Asignar datos["${k2}"] = "${v2}" agrega esa clave nueva al diccionario.`,
  });
}

function qDictGetDefault(): Question {
  const [k1, v1] = pick(PEOPLE_KEYS);
  return textMC("¿Qué imprime este código?", "Sin datos", ["Error", v1, "None"], {
    code: `datos = {"${k1}": "${v1}"}\nprint(datos.get("telefono", "Sin datos"))`,
    explain: `Como "telefono" no está en el diccionario, .get() devuelve el valor por defecto: "Sin datos".`,
  });
}

function qDictMissingKeyError(): Question {
  return tf("¿Acceder con [] a una clave que no existe en el diccionario da un error?", true, {
    explain: "Sí (KeyError). Por eso .get() es más seguro cuando no estás seguro de si la clave existe.",
  });
}

function qDictIterate(): Question {
  const keys = sample(PEOPLE_KEYS.map(([k]) => k), 3);
  return textMC("¿Qué imprime este código?", keys.join(", "), [
    PEOPLE_KEYS.filter(([k]) => keys.includes(k)).map(([, v]) => v).join(", "),
    keys.slice().reverse().join(", "),
  ], {
    code: `datos = {${keys.map((k) => `"${k}": "..."`).join(", ")}}\nfor clave in datos:\n    print(clave)`,
    explain: `Recorrer un diccionario con for te da sus CLAVES, en el orden en que fueron agregadas: ${keys.join(", ")}.`,
  });
}

function L10_PRACTICE(d: D): (() => Question)[] {
  const facil = [qDictAccess];
  if (d === "facil") return facil;
  const normal = [...facil, qDictAddKey];
  if (d === "normal") return normal;
  const advanced = [...normal, qDictGetDefault, qDictMissingKeyError];
  if (d === "dificil") return advanced;
  return [...advanced, qDictIterate];
}

function genDicts(d: D): Question[] {
  return [...cardsForTier(L10_CARDS, d), ...varied(L10_PRACTICE(d), practiceCount(d))];
}

// ═════════════════════════════════════════════════════════════
// 11. Funciones
// ═════════════════════════════════════════════════════════════

const L11_CARDS: Question[] = [
  info("🧩 def y return", `def saludar(nombre):\n    return "Hola, " + nombre\n\nprint(saludar("Ana"))`, "def crea una función: le das un nombre y, entre paréntesis, los parámetros que recibe. return indica qué valor devuelve la función cuando la llamás.", { output: "Hola, Ana" }),
  info("➕ Varios parámetros", `def sumar(a, b):\n    return a + b\n\nprint(sumar(3, 4))`, "Una función puede recibir varios parámetros, separados por comas. Al llamarla, le pasás un valor (argumento) para cada uno, en el mismo orden.", { output: "7" }),
  info("🎛️ Valores por defecto", `def saludar(nombre="amigo"):\n    return "Hola, " + nombre\n\nprint(saludar())`, "Un parámetro puede tener un valor por defecto. Si no le pasás nada al llamar la función, usa ese valor.", { output: "Hola, amigo" }),
  info("🚫 Sin return: None", `def saludar(nombre):\n    print("Hola, " + nombre)\n\nresultado = saludar("Ana")\nprint(resultado)`, 'Si una función no tiene return, en realidad devuelve None (un valor especial que significa "nada"). El print() de adentro muestra el saludo, pero eso no es lo mismo que "devolver" un valor.', { output: "Hola, Ana\nNone" }),
];

function qFuncReturnArith(): Question {
  const a = ri(2, 15);
  const b = ri(2, 15);
  return numMC("¿Qué imprime este código?", a + b, {
    code: `def sumar(a, b):\n    return a + b\n\nprint(sumar(${a}, ${b}))`,
    spread: 3,
    explain: `sumar(${a}, ${b}) devuelve ${a} + ${b} = ${a + b}.`,
  });
}

function qFuncReturnString(): Question {
  const n = pick(NAMES);
  return textMC("¿Qué imprime este código?", `Hola, ${n}`, [n, "Hola, {nombre}", `saludar(${n})`], {
    code: `def saludar(nombre):\n    return "Hola, " + nombre\n\nprint(saludar("${n}"))`,
    explain: `La función devuelve "Hola, " unido con el valor de nombre: "Hola, ${n}".`,
  });
}

function qFuncDefaultParam(): Question {
  const useDefault = Math.random() < 0.5;
  const n = pick(NAMES);
  const answer = useDefault ? "Hola, amigo" : `Hola, ${n}`;
  return textMC("¿Qué imprime este código?", answer, ["Hola, amigo", `Hola, ${n}`, "Error"].filter((x) => x !== answer), {
    code: `def saludar(nombre="amigo"):\n    return "Hola, " + nombre\n\nprint(saludar(${useDefault ? "" : `"${n}"`}))`,
    explain: useDefault
      ? "Como no se pasó ningún argumento, usa el valor por defecto: amigo."
      : `Se pasó "${n}" como argumento, así que reemplaza al valor por defecto.`,
  });
}

function qFuncNoReturn(): Question {
  return tf("¿Si una función no tiene return, print(función()) muestra None?", true, {
    explain: "Sí: sin return, la función devuelve None por defecto, aunque haya hecho print() de otra cosa adentro.",
  });
}

function qFuncMultipleCalls(): Question {
  const a = ri(2, 10);
  const b = ri(2, 10);
  const c = ri(2, 10);
  const result = (a + b) * c;
  return numMC("¿Qué imprime este código?", result, {
    code: `def sumar(a, b):\n    return a + b\n\ndef multiplicar(a, b):\n    return a * b\n\nprint(multiplicar(sumar(${a}, ${b}), ${c}))`,
    spread: Math.max(6, Math.round(result * 0.25)),
    explain: `Primero sumar(${a}, ${b}) da ${a + b}. Después multiplicar(${a + b}, ${c}) da ${a + b} × ${c} = ${result}.`,
  });
}

function L11_PRACTICE(d: D): (() => Question)[] {
  const facil = [qFuncReturnArith, qFuncReturnString];
  if (d === "facil") return facil;
  const normal = [...facil, qFuncDefaultParam];
  if (d === "normal") return normal;
  const advanced = [...normal, qFuncNoReturn];
  if (d === "dificil") return advanced;
  return [...advanced, qFuncMultipleCalls];
}

function genFunctions(d: D): Question[] {
  return [...cardsForTier(L11_CARDS, d), ...varied(L11_PRACTICE(d), practiceCount(d))];
}

// ═════════════════════════════════════════════════════════════
// 12. Manejo de Errores
// ═════════════════════════════════════════════════════════════

const L12_CARDS: Question[] = [
  info("⚠️ Cuando el código falla", `edad = int("hola")`, 'A veces el código falla en tiempo de ejecución: acá int("hola") falla porque "hola" no es un número. Esto se llama una excepción, y detiene el programa si no se maneja.', { output: "ValueError: invalid literal for int()" }),
  info("🛡️ try / except", `try:\n    edad = int(input("Edad: "))\n    print("Tenés", edad, "años")\nexcept:\n    print("Eso no es un número válido")`, 'try/except te deja "intentar" un código riesgoso: si falla, en vez de romper el programa, ejecuta el bloque except.', { output: 'si escribís "abc" → "Eso no es un número válido"' }),
  info("🎯 Capturar el tipo de error", `try:\n    print(10 / 0)\nexcept ZeroDivisionError:\n    print("No se puede dividir por cero")`, "Podés especificar QUÉ tipo de error atrapar (acá, dividir por cero). Así manejás cada problema de forma distinta y no ocultás errores inesperados.", { output: "No se puede dividir por cero" }),
  info("✅ else y finally", `try:\n    n = int("5")\nexcept ValueError:\n    print("Error")\nelse:\n    print("Todo salió bien:", n)\nfinally:\n    print("Esto siempre se ejecuta")`, 'else se ejecuta solo si NO hubo error, y finally se ejecuta siempre, haya habido error o no. Es útil para "limpiar" al final (por ejemplo, cerrar un archivo).', { output: "Todo salió bien: 5\nEsto siempre se ejecuta" }),
];

function qWhyTryExcept(): Question {
  return textMC("¿Para qué sirve try/except en Python?", "Para manejar errores sin que el programa se detenga", [
    "Para hacer que el código corra más rápido",
    "Para crear una nueva variable",
    "Para repetir un bloque de código varias veces",
  ]);
}

const BAD_CODE: [string, string][] = [
  [`int("hola")`, "convertir texto que no es un número"],
  ["10 / 0", "dividir por cero"],
  ["lista[10]", "acceder a un índice que no existe en la lista"],
];
function qWhatFails(): Question {
  const [code, why] = pick(BAD_CODE);
  return tf("¿Este código puede provocar un error (excepción)?", true, {
    code,
    explain: `Sí: falla al ${why}.`,
  });
}

function qTryExceptOutput(): Question {
  const willFail = Math.random() < 0.5;
  const input = willFail ? "abc" : String(ri(1, 99));
  const answer = willFail ? "Eso no es un número válido" : `Tenés ${input} años`;
  return textMC(`Si el usuario escribe "${input}", ¿qué imprime este código?`, answer, ["Eso no es un número válido", `Tenés ${input} años`].filter((x) => x !== answer), {
    code: `try:\n    edad = int(input("Edad: "))\n    print("Tenés", edad, "años")\nexcept:\n    print("Eso no es un número válido")`,
    explain: willFail
      ? `int("${input}") falla porque "${input}" no es un número, así que salta al except.`
      : `int("${input}") funciona bien, así que se imprime el mensaje normal.`,
  });
}

function qZeroDivision(): Question {
  return textMC("¿Qué imprime este código?", "No se puede dividir por cero", ["Error", "0", "inf"], {
    code: `try:\n    print(10 / 0)\nexcept ZeroDivisionError:\n    print("No se puede dividir por cero")`,
    explain: "Dividir por cero causa un ZeroDivisionError, que el except captura e imprime el mensaje.",
  });
}

function qFinallyAlways(): Question {
  return tf("¿El bloque finally se ejecuta SIEMPRE, haya habido error o no?", true, {
    explain: "Sí, esa es justamente su utilidad: código que debe correr pase lo que pase (por ejemplo, cerrar un archivo).",
  });
}

function L12_PRACTICE(d: D): (() => Question)[] {
  const facil = [qWhyTryExcept, qWhatFails];
  if (d === "facil") return facil;
  const normal = [...facil, qTryExceptOutput];
  if (d === "normal") return normal;
  const advanced = [...normal, qZeroDivision];
  if (d === "dificil") return advanced;
  return [...advanced, qFinallyAlways];
}

function genErrors(d: D): Question[] {
  return [...cardsForTier(L12_CARDS, d), ...varied(L12_PRACTICE(d), practiceCount(d))];
}

// ═════════════════════════════════════════════════════════════
// 13. Clases y Objetos
// ═════════════════════════════════════════════════════════════

const L13_CARDS: Question[] = [
  info("🏗️ class: el molde de un objeto", `class Perro:\n    def __init__(self, nombre):\n        self.nombre = nombre\n\nmi_perro = Perro("Rex")\nprint(mi_perro.nombre)`, 'Una clase es un "molde" para crear objetos. __init__ es un método especial que se ejecuta al crear un objeto nuevo, y define sus atributos (datos propios). self representa "este objeto en particular".', { output: "Rex" }),
  info("⚙️ Métodos: acciones del objeto", `class Perro:\n    def __init__(self, nombre):\n        self.nombre = nombre\n    def ladrar(self):\n        return self.nombre + " dice: ¡Guau!"\n\nmi_perro = Perro("Rex")\nprint(mi_perro.ladrar())`, "Un método es una función definida dentro de una clase: representa algo que el objeto PUEDE HACER. Siempre recibe self como primer parámetro para acceder a sus propios atributos.", { output: "Rex dice: ¡Guau!" }),
  info("🐕 Varios objetos, mismo molde", `perro1 = Perro("Rex")\nperro2 = Perro("Luna")\nprint(perro1.nombre)\nprint(perro2.nombre)`, "De una misma clase podés crear muchos objetos (instancias) distintos, cada uno con sus propios valores guardados por separado.", { output: "Rex\nLuna" }),
  info("🧬 Herencia", `class Animal:\n    def __init__(self, nombre):\n        self.nombre = nombre\n    def sonido(self):\n        return "..."\n\nclass Gato(Animal):\n    def sonido(self):\n        return "Miau"\n\nmi_gato = Gato("Michi")\nprint(mi_gato.sonido())`, "Una clase puede heredar de otra (Gato(Animal)): recibe sus atributos y métodos, y puede sobrescribir alguno para comportarse distinto. Es la base de la reutilización en programación orientada a objetos.", { output: "Miau" }),
];

function qClassAttribute(): Question {
  const n = pick(NAMES);
  return textMC("¿Qué imprime este código?", n, sample(NAMES.filter((x) => x !== n), 3), {
    code: `class Persona:\n    def __init__(self, nombre):\n        self.nombre = nombre\n\np = Persona("${n}")\nprint(p.nombre)`,
    explain: `__init__ guarda "${n}" en self.nombre al crear el objeto, y p.nombre lo devuelve.`,
  });
}

function qWhatIsInit(): Question {
  return textMC("¿Cuándo se ejecuta el método __init__ de una clase?", "Automáticamente, al crear un objeto nuevo", [
    "Cada vez que llamás a cualquier método",
    "Solo si lo llamás vos manualmente",
    "Al final del programa",
  ]);
}

function qMethodCall(): Question {
  const n = pick(NAMES);
  return textMC("¿Qué imprime este código?", `${n} dice: ¡Guau!`, [n, "¡Guau!", `Perro("${n}")`], {
    code: `class Perro:\n    def __init__(self, nombre):\n        self.nombre = nombre\n    def ladrar(self):\n        return self.nombre + " dice: ¡Guau!"\n\nmi_perro = Perro("${n}")\nprint(mi_perro.ladrar())`,
    explain: `ladrar() usa self.nombre ("${n}") y arma el mensaje completo.`,
  });
}

function qMultipleInstances(): Question {
  const [n1, n2] = sample(NAMES, 2);
  return tf("¿perro1.nombre y perro2.nombre pueden tener valores distintos?", true, {
    code: `perro1 = Perro("${n1}")\nperro2 = Perro("${n2}")`,
    explain: "Sí: cada objeto (instancia) guarda sus propios atributos por separado, aunque vengan de la misma clase.",
  });
}

function qInheritanceConcept(): Question {
  return textMC("¿Qué significa que la clase Gato herede de Animal (class Gato(Animal))?", "Gato recibe los atributos y métodos de Animal, y puede sobrescribirlos", [
    "Gato y Animal son exactamente la misma clase",
    "Animal deja de funcionar una vez que existe Gato",
    "Gato solo puede usarse dentro de Animal",
  ]);
}

function L13_PRACTICE(d: D): (() => Question)[] {
  const facil = [qClassAttribute, qWhatIsInit];
  if (d === "facil") return facil;
  const normal = [...facil, qMethodCall];
  if (d === "normal") return normal;
  const advanced = [...normal, qMultipleInstances];
  if (d === "dificil") return advanced;
  return [...advanced, qInheritanceConcept];
}

function genClasses(d: D): Question[] {
  return [...cardsForTier(L13_CARDS, d), ...varied(L13_PRACTICE(d), practiceCount(d))];
}

// ── Niveles ──────────────────────────────────────────────────────

export const PYTHON_LEVELS: LevelDef[] = [
  { name: "¡Hola, Python!", emoji: "🐍", desc: "print(), comentarios y tu primer código", tier: 1, gen: genHello },
  { name: "Variables y Tipos", emoji: "🏷️", desc: "Guarda y actualiza datos con nombre", tier: 1, gen: genVariables },
  { name: "Operadores", emoji: "🧮", desc: "Suma, resta, compara y combina condiciones", tier: 1, gen: genOperators },
  { name: "Cadenas de Texto", emoji: "🔤", desc: "Uní, medí y transformá texto como un pro", tier: 2, gen: genStrings },
  { name: "Entrada de Datos", emoji: "⌨️", desc: "Pedile datos al usuario con input()", tier: 2, gen: genInput },
  { name: "Condicionales", emoji: "🚦", desc: "if / elif / else: decisiones del programa", tier: 2, gen: genConditionals },
  { name: "Bucle for", emoji: "🔁", desc: "Repetí código con for y range()", tier: 2, gen: genForLoop },
  { name: "Bucle while", emoji: "🔂", desc: "Repetí mientras se cumpla una condición", tier: 2, gen: genWhileLoop },
  { name: "Listas", emoji: "📃", desc: "Guardá y organizá varios valores juntos", tier: 3, gen: genLists },
  { name: "Diccionarios", emoji: "🗂️", desc: "Pares clave-valor para datos con nombre", tier: 3, gen: genDicts },
  { name: "Funciones", emoji: "🧩", desc: "def, parámetros y return: código reutilizable", tier: 3, gen: genFunctions },
  { name: "Manejo de Errores", emoji: "⚠️", desc: "try / except: cuando algo puede fallar", tier: 3, gen: genErrors },
  { name: "Clases y Objetos", emoji: "🏗️", desc: "class, objetos y herencia: piezas reales de software", tier: 3, gen: genClasses },
];
