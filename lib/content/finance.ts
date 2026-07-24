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

const SAVE_VISUAL_FACIL: [string, string, string[], string?][] = [
  ["¿Dónde guardamos el dinero para que esté seguro?", "🐷", ["🔥", "🚽"], "El dinero se guarda en una alcancía o en el banco, ¡nunca en el fuego!"],
  ["¿Qué es mejor hacer antes de gastar todas tus monedas?", "🤔", ["😤", "🎉"], "Pensarlo bien te ayuda a no arrepentirte después."],
  ["Si quieres algo caro, ¿qué es mejor hacer poco a poco?", "🐷", ["🍬", "😢"], "Ahorrar de a poco te ayuda a juntar para lo que quieres."],
  ["Antes de comprar algo, ¿qué es sabio hacer primero?", "🔍", ["🏃", "😴"], "Mirar bien antes de comprar te ayuda a elegir mejor."],
];
function qStorageVisual(): Question {
  const [prompt, answer, wrong, explain] = pick(SAVE_VISUAL_FACIL);
  return { kind: "mc", prompt, options: shuffle([answer, ...wrong]), answer, explain };
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
  const a = ri(10, Math.min(30, income - 20));
  const b = ri(10, Math.min(30, income - a - 1));
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

function genProc(facilFn: () => Question, restFn: () => Question, expertoFn?: () => Question): (d: D) => Question[] {
  return (d) => session(Array.from({ length: 10 }, () => (d === "facil" ? facilFn() : d === "experto" && expertoFn ? expertoFn() : restFn())));
}

// ═════════════════════════════════════════════════════════════
// CONTENIDO DE "MAESTROS" (experto) — finanzas reales para
// adultos: ingresos, presupuesto, interés compuesto y crédito.
// ═════════════════════════════════════════════════════════════

const BILL_VALUES = [5, 10, 20, 50, 100];
function qCountBills(): Question {
  const n = ri(4, 7);
  const bills = Array.from({ length: n }, () => pick(BILL_VALUES));
  const total = bills.reduce((a, b) => a + b, 0);
  const list = bills.map((b) => `$${b}`).join(" + ");
  return typed(`Tienes estos billetes: ${list}. ¿Cuánto dinero tienes en total?`, total, { visual: "💵" });
}

const SHOP_PRICES = [10, 12, 15, 18, 20, 25, 28, 30, 35];
function qShoppingTotal(): Question {
  const prices = sample(SHOP_PRICES, ri(3, 4));
  const total = prices.reduce((a, b) => a + b, 0);
  const paid = pick([150, 200, 250].filter((b) => b > total));
  return typed(
    `Compras estos productos: ${prices.map((p) => `$${p}`).join(", ")}.\nPagas con $${paid}. ¿Cuánto cambio recibes?`,
    paid - total,
    { visual: "🛍️", explain: `Total: ${prices.join(" + ")} = ${total}. Cambio: ${paid} − ${total} = ${paid - total}.` }
  );
}

function genShopExperto(): Question {
  return Math.random() < 0.5 ? qCountBills() : qShoppingTotal();
}

const NEEDS_ADULT: string[] = [
  "pagar el alquiler o la hipoteca 🏠",
  "el seguro de salud 🏥",
  "la comida del mes 🛒",
  "pagar las cuentas de luz y agua 💡",
  "el transporte para ir a trabajar 🚌",
  "ahorrar para una emergencia médica 🆘",
];
const WANTS_ADULT: string[] = [
  "una suscripción de streaming extra 📺",
  "salir a comer afuera seguido 🍽️",
  "el último modelo de celular 📱",
  "unas vacaciones de lujo ✈️",
  "ropa de marca cara 👗",
  "un auto más caro del que necesitas 🚗",
];
function qNeedWantExperto(): Question {
  if (Math.random() < 0.5) {
    const item = pick(NEEDS_ADULT);
    return {
      kind: "mc",
      prompt: `${item[0].toUpperCase()}${item.slice(1)}\n¿Es una NECESIDAD o un DESEO?`,
      options: ["❤️ Necesidad", "⭐ Deseo"],
      answer: "❤️ Necesidad",
      explain: "Las necesidades son gastos sin los que tu vida o tu estabilidad se ven afectadas.",
    };
  }
  const item = pick(WANTS_ADULT);
  return {
    kind: "mc",
    prompt: `${item[0].toUpperCase()}${item.slice(1)}\n¿Es una NECESIDAD o un DESEO?`,
    options: ["❤️ Necesidad", "⭐ Deseo"],
    answer: "⭐ Deseo",
    explain: "Los deseos mejoran tu vida pero podrías vivir bien sin ellos.",
  };
}

const CONCEPTS_WORK_EXPERTO: MC[] = [
  ["¿Qué diferencia hay entre el salario BRUTO y el NETO?", "El bruto es antes de descuentos; el neto es lo que realmente recibes en la mano", ["Son exactamente lo mismo", "El neto siempre es mayor que el bruto", "El bruto solo aplica a los freelancers"], "💵"],
  ["¿Qué es un CURRÍCULUM (CV)?", "Un resumen de tu experiencia y estudios para buscar trabajo", ["Un tipo de contrato legal", "El horario de la empresa", "Un préstamo bancario"], "📄"],
  ["¿Qué son los BENEFICIOS LABORALES?", "Ventajas extra al salario, como seguro médico o vacaciones pagas", ["Un impuesto que se descuenta del sueldo", "El nombre del jefe", "Una multa por llegar tarde"], "🎁"],
  ["¿Qué significa trabajar como FREELANCE o independiente?", "Trabajar por proyectos para distintos clientes, sin un solo empleador fijo", ["Trabajar gratis por experiencia", "No poder cobrar por el trabajo", "Trabajar solo los fines de semana"], "💻"],
  ["¿Por qué conviene investigar el salario promedio del mercado antes de negociar el propio?", "Para pedir un monto justo e informado, ni muy bajo ni irreal", ["No sirve de nada investigar", "Para copiar el sueldo de un amigo", "Es ilegal hacerlo"], "🤝"],
  ["¿Qué es la JUBILACIÓN o pensión?", "El ingreso que recibes al dejar de trabajar, tras ahorrar durante tu vida laboral", ["Un tipo de préstamo", "Una multa por dejar el trabajo", "Un bono único al empezar a trabajar"], "👴"],
];

function qSavingsExperto(): Question {
  const kind = ri(1, 2);
  if (kind === 1) {
    const monthly = pick([50, 80, 100, 150, 200]);
    const months = ri(4, 12);
    return typed(`Ahorras $${monthly} por mes. ¿Cuánto tendrás en ${months} meses?`, monthly * months, {
      visual: "🐷",
      explain: `${monthly} × ${months} = ${monthly * months}.`,
    });
  }
  const goal = pick([600, 900, 1200, 1500, 2400, 3000]);
  const monthly = pick([100, 150, 200, 300].filter((m) => goal % m === 0));
  return typed(`Quieres ahorrar $${goal} para un objetivo. Si guardas $${monthly} por mes, ¿cuántos meses necesitas?`, goal / monthly, {
    visual: "🎯",
    explain: `${goal} ÷ ${monthly} = ${goal / monthly} meses.`,
  });
}

const CONCEPTS_SAVE_EXPERTO: MC[] = [
  ["¿Qué es un FONDO DE EMERGENCIA?", "Ahorros guardados para gastos inesperados, como una reparación o pérdida de trabajo", ["Dinero que se gasta apenas se recibe", "Un préstamo del banco", "Un impuesto obligatorio"], "🆘"],
  ["¿Qué es la INFLACIÓN?", "La subida general de precios con el tiempo, que reduce el valor del dinero", ["Una bajada de precios permanente", "Un tipo de ahorro seguro", "Un impuesto sobre el salario"], "📈"],
  ["¿Qué significa 'diversificar' tus ahorros o inversiones?", "No poner todo el dinero en un solo lugar, para repartir el riesgo", ["Gastar todo en una sola cosa", "Guardar todo en efectivo bajo el colchón", "Prestarle todo tu dinero a una sola persona"], "🧺"],
  ["¿Qué es el COSTO DE OPORTUNIDAD de un gasto?", "Lo que dejas de poder hacer con ese dinero al gastarlo en otra cosa", ["El precio con impuestos incluidos", "Un descuento especial", "El costo de envío"], "⚖️"],
  ["¿Por qué las deudas de tarjeta de crédito con intereses altos son peligrosas?", "Porque la deuda puede crecer rápido si no se paga a tiempo", ["Porque las tarjetas se rompen fácil", "No tienen ningún riesgo real", "Porque solo se pueden usar una vez"], "💳"],
  ["Regla general: ¿cuántos meses de gastos se recomienda tener guardados en un fondo de emergencia?", "Entre 3 y 6 meses de gastos", ["Solo 1 día", "20 años", "No hace falta ahorrar nada"], "🗓️"],
];

function qBudgetRule(): Question {
  const income = pick([1000, 1200, 1500, 2000, 2500, 3000]);
  const part = pick([
    { pct: 20, label: "ahorrar" },
    { pct: 50, label: "gastar en necesidades" },
    { pct: 30, label: "gastar en deseos" },
  ]);
  const amount = (income * part.pct) / 100;
  return numMC(
    `Ganas $${income} al mes y sigues la regla 50/30/20 (necesidades / deseos / ahorro).\n¿Cuánto deberías ${part.label} (${part.pct}%)?`,
    amount,
    { spread: Math.max(20, Math.round(amount * 0.2)), explain: `${part.pct}% de ${income} = ${amount}.` }
  );
}

function qBudgetBig(): Question {
  const income = pick([1500, 1800, 2000, 2200, 2500]);
  const rent = pick([500, 600, 700, 800]);
  const other = ri(200, 500);
  return typed(`Ganas $${income} al mes. Pagas $${rent} de alquiler y $${other} en otros gastos fijos.\n¿Cuánto te queda para ahorrar o gastar libremente?`, income - rent - other, {
    visual: "📒",
    explain: `${income} − ${rent} − ${other} = ${income - rent - other}.`,
  });
}

function genBudgetExperto(): Question {
  return Math.random() < 0.5 ? qBudgetRule() : qBudgetBig();
}

function qCompoundInterest(): Question {
  const principal = pick([100, 200, 300, 500, 800, 1000]);
  const year1 = principal + principal / 10;
  const year2 = year1 + year1 / 10;
  return numMC(`Ahorras $${principal} a un interés compuesto del 10% anual, durante 2 años (sin retirar nada). ¿Cuánto tienes al final?`, year2, {
    spread: Math.max(15, Math.round(year2 * 0.15)),
    explain: `Año 1: ${principal} + 10% = ${year1}. Año 2: ${year1} + 10% = ${year2}. El interés compuesto también gana interés sobre el interés anterior.`,
  });
}

const CONCEPTS_INVEST_EXPERTO: MC[] = [
  ["¿Qué es una ACCIÓN (stock) de una empresa?", "Una pequeña parte de propiedad de esa empresa", ["Un préstamo que le haces al gobierno", "Un tipo de moneda extranjera", "Un impuesto sobre las ventas"], "📈"],
  ["¿Qué es el INTERÉS COMPUESTO?", "Ganar interés no solo sobre tu dinero inicial, sino también sobre los intereses ya generados", ["Un interés que nunca cambia", "Un impuesto especial del banco", "Un descuento por ahorrar"], "💰"],
  ["¿Qué es un PUNTAJE DE CRÉDITO (credit score)?", "Un número que refleja qué tan confiable eres para pagar deudas", ["La cantidad de dinero en tu cuenta", "El nombre de tu banco", "Un tipo de tarjeta física"], "📊"],
  ["Entre dos préstamos con la MISMA cuota mensual, ¿cuál conviene más?", "El que tenga la tasa de interés más baja", ["El que tenga el plazo más largo, siempre", "El del banco más conocido", "No hay diferencia entre ellos"], "🏦"],
  ["¿Qué es diversificar una inversión?", "Repartir el dinero en distintos activos para reducir el riesgo", ["Invertir todo en una sola empresa", "Guardar todo en efectivo", "Pedir un préstamo grande"], "🧺"],
  ["¿Qué es un PRESUPUESTO PERSONAL?", "Un plan de cuánto ganas y gastas para controlar tu dinero", ["Un tipo de cuenta bancaria especial", "Un impuesto anual obligatorio", "Un préstamo sin intereses"], "📒"],
];

function genBankExperto(): Question[] {
  const conceptQs = sample(CONCEPTS_INVEST_EXPERTO, 5).map(([prompt, answer, wrong, visual, explain]) => ({
    kind: "mc" as const,
    prompt,
    visual,
    options: shuffle([answer, ...wrong]),
    answer,
    explain,
  }));
  const interestQs = Array.from({ length: 5 }, qCompoundInterest);
  const out: Question[] = [];
  for (let i = 0; i < 5; i++) {
    out.push(conceptQs[i], interestQs[i]);
  }
  return out;
}

export const FINANCE_LEVELS: LevelDef[] = [
  { name: "Contando Monedas", emoji: "🪙", desc: "Suma monedas y billetes", tier: 1, gen: genProc(qCoinCountVisual, qCountMoney, qCountBills) },
  { name: "La Tienda", emoji: "🛒", desc: "Pagar, recibir cambio y saber si alcanza", tier: 1, gen: genProc(qCoinCompareVisual, () => (Math.random() < 0.5 ? qChange() : qEnough()), genShopExperto) },
  { name: "¿Necesito o Deseo?", emoji: "🤔", desc: "Diferencia necesidades de deseos", tier: 1, gen: genProc(qNeedWant, qNeedWant, qNeedWantExperto) },
  { name: "El Mundo del Trabajo", emoji: "💼", desc: "Oficios, salarios y emprendedores", tier: 1, gen: (d) => (d === "facil" ? session(Array.from({ length: 10 }, qProfessionVisual)) : d === "experto" ? buildMC(CONCEPTS_WORK_EXPERTO) : buildMC(CONCEPTS_WORK)) },
  { name: "La Alcancía", emoji: "🐷", desc: "Metas de ahorro y cuánto falta", tier: 2, gen: genProc(qCoinCountVisual, qSavings, qSavingsExperto) },
  { name: "Sabio Ahorrador", emoji: "🧠", desc: "Buenas decisiones con el dinero", tier: 2, gen: (d) => (d === "facil" ? session(Array.from({ length: 10 }, qStorageVisual)) : d === "experto" ? buildMC(CONCEPTS_SAVE_EXPERTO) : buildMC(CONCEPTS_SAVE)) },
  { name: "Mi Presupuesto", emoji: "📒", desc: "Planifica tus gastos de la semana", tier: 3, gen: genProc(qEnoughVisual, qBudget, genBudgetExperto) },
  {
    name: "Banco y Negocios",
    emoji: "🏦",
    desc: "Bancos, intereses y tu primer negocio",
    tier: 3,
    gen: (d) =>
      d === "facil"
        ? session(Array.from({ length: 10 }, qLemonadeVisual))
        : d === "experto"
          ? genBankExperto()
          : session([...sample(CONCEPTS_BANK, 6).map(([prompt, answer, wrong, visual, explain]) => ({ kind: "mc" as const, prompt, visual, options: shuffle([answer, ...wrong]), answer, explain })), ...Array.from({ length: 5 }, qBusiness)]),
  },
];
