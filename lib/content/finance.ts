import type { Difficulty, LevelDef, Question } from "../types";
import { ri, pick, pickEmojiMC, sample, session, shuffle, numMC, typed, tf, repeatEmoji } from "./utils";

// ─────────────────────────────────────────────────────────────
// FINANZAS — 8 niveles, adaptados a 3 edades:
//   facil (Menores de 5)  → contar monedas con dibujos, oficios
//                           por imagen y "necesito vs. deseo" con
//                           íconos, todo narrado en voz alta.
//   normal / dificil       → dinero, ahorro, presupuesto, bancos.
// ─────────────────────────────────────────────────────────────

type D = Difficulty;

const COIN_VALUES = [1, 2, 5, 10];

// ── generadores visuales para "Pequeños" ───────────────────────

function qCoinCountVisual(): Question {
  const n = ri(1, 5);
  return numMC(`¿Cuántas monedas hay?`, n, { visual: repeatEmoji("🪙", n), spread: 2 });
}

function qCoinCompareVisual(): Question {
  let a = ri(1, 6);
  let b = ri(1, 6);
  if (a === b) b = a === 6 ? a - 2 : a + 2;
  const mayor = Math.max(a, b);
  return {
    kind: "mc",
    prompt: "¿Cuál grupo tiene MÁS monedas?",
    visual: `${repeatEmoji("🪙", a)}\n${repeatEmoji("🪙", b)}`,
    options: [String(a), String(b)].sort(() => Math.random() - 0.5),
    answer: String(mayor),
  };
}

function qEnoughVisual(): Question {
  const have = ri(2, 6);
  const cost = ri(2, 6);
  return tf(`¿Te alcanzan las monedas para comprarlo?`, have >= cost, {
    visual: `Tienes: ${repeatEmoji("🪙", have)}\nCuesta: ${repeatEmoji("🪙", cost)}`,
  });
}

const PROFESSIONS_ID: [string, string][] = [
  ["el doctor", "👨‍⚕️"], ["el bombero", "👨‍🚒"], ["el policía", "👮"], ["el panadero", "🥖"],
  ["el granjero", "👨‍🌾"], ["el pescador", "🎣"], ["el maestro", "🧑‍🏫"], ["el cocinero", "👨‍🍳"],
];
function qProfessionVisual(): Question {
  return pickEmojiMC(PROFESSIONS_ID, (name) => `¿Quién es ${name}?`);
}

function qStorageVisual(): Question {
  return {
    kind: "mc",
    prompt: "¿Dónde guardamos el dinero para que esté seguro?",
    options: shuffle(["🐷", "🔥", "🚽"]),
    answer: "🐷",
    explain: "El dinero se guarda en una alcancía o en el banco, ¡nunca en el fuego!",
  };
}

function qLemonadeVisual(): Question {
  const n = ri(1, 5);
  return numMC(`Vendes ${repeatEmoji("🍋", n)} a 1 moneda cada uno.\n¿Cuántas monedas ganaste?`, n, { spread: 2 });
}

// ── generadores clásicos para "Aventureros" y "Genios" ─────────

function qCountMoney(): Question {
  const n = ri(3, 5);
  const coins = Array.from({ length: n }, () => pick(COIN_VALUES));
  const total = coins.reduce((a, b) => a + b, 0);
  const list = coins.map((c) => `$${c}`).join(" + ");
  return typed(`Tienes estas monedas: ${list}. ¿Cuánto dinero tienes en total?`, total, { visual: "🪙" });
}

function qChange(): Question {
  const price = ri(3, 45);
  const paid = pick([10, 20, 50].filter((b) => b > price));
  return typed(
    `Un juguete cuesta $${price} y pagas con un billete de $${paid}. ¿Cuánto cambio te devuelven?`,
    paid - price,
    { visual: "🧸", explain: `${paid} − ${price} = ${paid - price}.` }
  );
}

function qEnough(): Question {
  const have = ri(10, 60);
  const price = ri(5, 70);
  return tf(`Tienes $${have} y quieres comprar algo que cuesta $${price}. ¿Te alcanza el dinero?`, have >= price, {
    visual: "🛍️",
    explain: have >= price ? `Sí: $${have} es igual o más que $${price}.` : `No: te faltan $${price - have}.`,
  });
}

const NEEDS: string[] = ["agua para beber 💧", "comida saludable 🍎", "un abrigo para el invierno 🧥", "medicinas cuando estás enfermo 💊", "un lugar donde vivir 🏠", "ir a la escuela 🏫", "zapatos para caminar 👟", "visitar al doctor 🩺"];
const WANTS: string[] = ["un videojuego nuevo 🎮", "caramelos 🍬", "un juguete de moda 🧸", "una bicicleta de carreras 🚴", "helado de postre 🍦", "figuritas coleccionables ✨", "un teléfono nuevo 📱", "entradas al cine 🎬"];

function qNeedWant(): Question {
  if (Math.random() < 0.5) {
    const item = pick(NEEDS);
    return {
      kind: "mc",
      prompt: `${item[0].toUpperCase()}${item.slice(1)}\n¿Es una NECESIDAD o un DESEO?`,
      options: ["❤️ Necesidad", "⭐ Deseo"],
      answer: "❤️ Necesidad",
      explain: "Las necesidades son cosas sin las que no podemos vivir bien.",
    };
  }
  const item = pick(WANTS);
  return {
    kind: "mc",
    prompt: `${item[0].toUpperCase()}${item.slice(1)}\n¿Es una NECESIDAD o un DESEO?`,
    options: ["❤️ Necesidad", "⭐ Deseo"],
    answer: "⭐ Deseo",
    explain: "Los deseos son cosas lindas pero no imprescindibles.",
  };
}

function qSavings(): Question {
  const kind = ri(1, 3);
  if (kind === 1) {
    const weekly = ri(2, 10);
    const weeks = ri(3, 8);
    return typed(
      `Ahorras $${weekly} por semana. ¿Cuánto tendrás en ${weeks} semanas?`,
      weekly * weeks,
      { visual: "🐷", explain: `${weekly} × ${weeks} = ${weekly * weeks}.` }
    );
  }
  if (kind === 2) {
    const goal = pick([30, 40, 50, 60, 80, 100]);
    const weekly = pick([5, 10].filter((w) => goal % w === 0));
    return typed(
      `Quieres ahorrar $${goal} para un regalo. Si guardas $${weekly} por semana, ¿cuántas semanas necesitas?`,
      goal / weekly,
      { visual: "🎁", explain: `${goal} ÷ ${weekly} = ${goal / weekly} semanas.` }
    );
  }
  const have = ri(10, 40);
  const goal = have + ri(10, 40);
  return typed(`Tu meta es ahorrar $${goal} y ya tienes $${have}. ¿Cuánto te falta?`, goal - have, { visual: "🎯" });
}

type MC = [string, string, string[], string?, string?];

const CONCEPTS_SAVE: MC[] = [
  ["¿Qué significa AHORRAR?", "Guardar dinero para el futuro", ["Gastar todo rápido", "Perder el dinero", "Pedir prestado"], "🐷"],
  ["¿Dónde es buena idea guardar tus ahorros?", "En una alcancía o en el banco", ["Debajo de una piedra en el parque", "En el bolsillo con agujeros", "Prestárselo a cualquiera"], "🏦"],
  ["Si quieres algo caro, lo más inteligente es…", "Ahorrar poco a poco hasta juntarlo", ["Comprarlo aunque no te alcance", "Enojarte", "Rendirte"], "🎯"],
  ["Antes de comprar algo conviene preguntarse…", "¿Lo necesito de verdad?", ["¿Es de mi color favorito?", "¿Lo tiene mi amigo?", "¿Está de moda?"], "🤔"],
  ["Comparar precios antes de comprar sirve para…", "Encontrar la mejor oferta", ["Perder tiempo", "Gastar más", "Presumir"], "🔎"],
  ["Una oferta de «2×1» significa…", "Llevas 2 y pagas 1", ["Pagas el doble", "Llevas la mitad", "Es gratis"], "🏷️"],
];

const CONCEPTS_WORK: MC[] = [
  ["El dinero de las familias normalmente viene de…", "Trabajar", ["Un árbol de billetes", "La suerte", "Los videojuegos"], "💼"],
  ["¿Qué es un SALARIO?", "El pago que recibe alguien por su trabajo", ["Un tipo de moneda", "Un impuesto", "Un premio de lotería"], "💵"],
  ["¿Quién cura a los pacientes?", "El médico", ["El panadero", "El piloto", "El carpintero"], "🩺"],
  ["¿Quién construye casas?", "El albañil", ["El chef", "El dentista", "El músico"], "👷"],
  ["¿Quién prepara el pan?", "El panadero", ["El bombero", "El astronauta", "El taxista"], "🥖"],
  ["Cuando ayudas en casa y te dan una propina, ese dinero es tu…", "Ingreso", ["Gasto", "Deuda", "Impuesto"], "🪙"],
  ["¿Qué es un EMPRENDEDOR?", "Alguien que crea su propio negocio", ["Alguien que nunca trabaja", "Un tipo de banco", "Un cliente"], "🚀"],
  ["Un trabajo bien hecho suele traer…", "Confianza y más oportunidades", ["Problemas", "Menos amigos", "Nada"], "⭐"],
];

const CONCEPTS_BANK: MC[] = [
  ["¿Qué es un BANCO?", "Un lugar seguro donde guardar dinero", ["Una tienda de juguetes", "Un tipo de alcancía rota", "Un lugar para esconderse"], "🏦"],
  ["¿Qué es el INTERÉS que paga el banco?", "Dinero extra por mantener tus ahorros", ["Una multa", "Un impuesto", "El precio de entrar"], "📈"],
  ["Si el banco te da 10% de interés al año y ahorras $100, al final del año tienes…", "$110", ["$100", "$90", "$200"], "🧮", "10% de 100 es 10, y 100 + 10 = 110."],
  ["¿Qué es una DEUDA?", "Dinero que debes devolver", ["Un regalo", "Un premio", "Tu salario"], "📉"],
  ["Pedir prestado está bien si…", "Sabes que podrás devolverlo", ["Nunca piensas devolverlo", "Es para gastar sin pensar", "Se lo pides a un extraño"], "🤝"],
  ["Una tarjeta de débito usa…", "El dinero que ya tienes guardado", ["Dinero infinito", "Dinero del vecino", "Dinero de mentira"], "💳"],
  ["¿Qué pasa si gastas más de lo que ganas?", "Te quedas sin dinero o con deudas", ["Te vuelves rico", "No pasa nada", "El banco te aplaude"], "⚠️"],
  ["Donar una parte de lo que tienes a quien lo necesita es…", "Generosidad", ["Un gasto tonto", "Una deuda", "Un impuesto"], "💝"],
  ["Si ahorras $200 al 10% de interés anual durante 2 años (sin retirar nada), ¿cuánto interés ganas en total?", "$42", ["$20", "$40", "$400"], "📊", "Año 1: 200×10%=20 → 220. Año 2: 220×10%=22 → total interés 20+22=42 (interés compuesto)."],
];

function qBudget(): Question {
  const income = pick([50, 60, 80, 100]);
  const a = ri(10, 30);
  const b = ri(10, 30);
  const spent = a + b;
  const kind = ri(1, 2);
  if (kind === 1) {
    return typed(
      `Tienes $${income} para la semana. Gastas $${a} en el cine y $${b} en meriendas. ¿Cuánto te queda?`,
      income - spent,
      { visual: "📒", explain: `${income} − ${spent} = ${income - spent}.` }
    );
  }
  const c = ri(15, 45);
  return tf(
    `Tienes $${income}. Quieres gastar $${a} en un libro, $${b} en un helado y $${c} en un juego. ¿Te alcanza para todo?`,
    income >= a + b + c,
    { visual: "🧾", explain: `El total es $${a + b + c}.` }
  );
}

function qBusiness(): Question {
  const kind = ri(1, 3);
  if (kind === 1) {
    const cost = ri(2, 6);
    const price = cost + ri(1, 5);
    const units = ri(3, 10);
    return typed(
      `Haces limonada 🍋. Cada vaso te cuesta $${cost} y lo vendes a $${price}. Si vendes ${units} vasos, ¿cuánto GANAS en total?`,
      (price - cost) * units,
      { explain: `Ganancia por vaso: $${price - cost}. Total: ${price - cost} × ${units} = ${(price - cost) * units}.` }
    );
  }
  if (kind === 2) {
    const cost = ri(3, 9);
    const price = cost + ri(2, 6);
    return typed(
      `Vendes pulseras a $${price} y hacer cada una te cuesta $${cost}. ¿Cuál es tu ganancia por pulsera?`,
      price - cost,
      { visual: "📿" }
    );
  }
  const price = ri(4, 9);
  const goal = price * ri(4, 9);
  return typed(
    `Vendes galletas a $${price} cada una. ¿Cuántas necesitas vender para juntar $${goal}?`,
    goal / price,
    { visual: "🍪", explain: `${goal} ÷ ${price} = ${goal / price}.` }
  );
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

function genProc(facilFn: () => Question, restFn: () => Question): (d: D) => Question[] {
  return (d) => session(Array.from({ length: 10 }, () => (d === "facil" ? facilFn() : restFn())));
}

export const FINANCE_LEVELS: LevelDef[] = [
  { name: "Contando Monedas", emoji: "🪙", desc: "Suma monedas y billetes", tier: 1, gen: genProc(qCoinCountVisual, qCountMoney) },
  { name: "La Tienda", emoji: "🛒", desc: "Pagar, recibir cambio y saber si alcanza", tier: 1, gen: genProc(qCoinCompareVisual, () => (Math.random() < 0.5 ? qChange() : qEnough())) },
  { name: "¿Necesito o Deseo?", emoji: "🤔", desc: "Diferencia necesidades de deseos", tier: 1, gen: genProc(qNeedWant, qNeedWant) },
  { name: "El Mundo del Trabajo", emoji: "💼", desc: "Oficios, salarios y emprendedores", tier: 1, gen: (d) => (d === "facil" ? session(Array.from({ length: 10 }, qProfessionVisual)) : buildMC(CONCEPTS_WORK)) },
  { name: "La Alcancía", emoji: "🐷", desc: "Metas de ahorro y cuánto falta", tier: 2, gen: genProc(qCoinCountVisual, qSavings) },
  { name: "Sabio Ahorrador", emoji: "🧠", desc: "Buenas decisiones con el dinero", tier: 2, gen: (d) => (d === "facil" ? session(Array.from({ length: 10 }, qStorageVisual)) : buildMC(CONCEPTS_SAVE)) },
  { name: "Mi Presupuesto", emoji: "📒", desc: "Planifica tus gastos de la semana", tier: 3, gen: genProc(qEnoughVisual, qBudget) },
  {
    name: "Banco y Negocios",
    emoji: "🏦",
    desc: "Bancos, intereses y tu primer negocio",
    tier: 3,
    gen: (d) =>
      d === "facil"
        ? session(Array.from({ length: 10 }, qLemonadeVisual))
        : session([...sample(CONCEPTS_BANK, 6).map(([prompt, answer, wrong, visual, explain]) => ({ kind: "mc" as const, prompt, visual, options: shuffle([answer, ...wrong]), answer, explain })), ...Array.from({ length: 5 }, qBusiness)]),
  },
];
