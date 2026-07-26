import type { Difficulty, LevelDef, Question } from "../types";
import { sample, session, shuffle } from "./utils";

// ─────────────────────────────────────────────────────────────
// CÍVICA Y CIUDADANÍA — materia nueva, 8 niveles. Leyes,
// Constitución y política, con foco inicial en Argentina.
//   facil (Menores de 5)  → símbolos patrios y conceptos básicos
//                           con emojis y comparaciones simples.
//   normal / dificil / experto → historia, próceres, los tres
//                           poderes, la Constitución, las leyes,
//                           la democracia y los derechos humanos,
//                           cada vez con más profundidad hasta
//                           contenido real de educación cívica
//                           para adultos.
// Nota sobre las opciones: las respuestas correctas se escriben
// tan cortas como las incorrectas a propósito — si la correcta
// es siempre la más larga, se vuelve obvia sin pensar.
// ─────────────────────────────────────────────────────────────

type D = Difficulty;
type MC = [prompt: string, answer: string, wrong: string[], visual?: string, explain?: string];

function mcQuestion([prompt, answer, wrong, visual, explain]: MC): Question {
  return { kind: "mc", prompt, visual, options: shuffle([answer, ...wrong]), answer, explain };
}

function buildMC(bank: MC[]): Question[] {
  return session(sample(bank, Math.min(10, bank.length)).map(mcQuestion));
}

type BIN = [prompt: string, correct: string, wrong: string];
function buildBinary(bank: BIN[]): Question[] {
  return session(
    sample(bank, Math.min(10, bank.length)).map(([prompt, correct, wrong]) => ({
      kind: "mc" as const,
      prompt,
      options: shuffle([correct, wrong]),
      answer: correct,
    }))
  );
}

type EMOJI3 = [prompt: string, answer: string, wrong: string[]];
function buildEmoji(bank: EMOJI3[]): Question[] {
  return session(
    sample(bank, Math.min(10, bank.length)).map(([prompt, answer, wrong]) => ({
      kind: "mc" as const,
      prompt,
      options: shuffle([answer, ...wrong]),
      answer,
    }))
  );
}

function gen4(
  facilBank: EMOJI3[] | BIN[],
  normalBank: MC[],
  dificilBank: MC[],
  expertoBank: MC[],
  facilKind: "emoji" | "binary" = "binary"
): (d: D) => Question[] {
  return (d) => {
    if (d === "facil") return facilKind === "emoji" ? buildEmoji(facilBank as EMOJI3[]) : buildBinary(facilBank as BIN[]);
    if (d === "dificil") return buildMC(dificilBank);
    if (d === "experto") return buildMC(expertoBank);
    return buildMC(normalBank);
  };
}

// ── 1. Símbolos Patrios ───────────────────────────────────────

const SYMBOLS_FACIL: EMOJI3[] = [
  ["¿Cuál es la bandera de Argentina?", "🇦🇷", ["🇧🇷", "🇮🇹"]],
  ["¿Cuál es el Sol que está en el centro de la bandera argentina?", "☀️", ["🌙", "⭐"]],
  ["¿Cuál de estos objetos sirve para PROTEGER, como un escudo?", "🛡️", ["🎈", "🧸"]],
  ["¿Con qué cantamos todos juntos en los actos de la escuela?", "🎤", ["🍽️", "🧦"]],
  ["¿Cuál de estos NO es la bandera de Argentina?", "🇺🇾", ["🇦🇷"]],
];

const SYMBOLS_MC: MC[] = [
  ["¿Quién creó la bandera argentina?", "Manuel Belgrano", ["Domingo Sarmiento", "José de San Martín", "Juan Perón"], "🎌"],
  ["¿De qué colores es la bandera argentina?", "Celeste y blanco", ["Rojo y amarillo", "Verde y blanco", "Azul y rojo"], "🇦🇷"],
  ["¿Qué representa el Sol en el centro de la bandera?", "El Sol de Mayo", ["El sol del verano", "Un dios azteca antiguo", "El escudo de otro país"], "☀️", "Es un símbolo de la Revolución de Mayo de 1810."],
  ["¿Cómo se llama la cinta celeste y blanca que se usa el Día de la Bandera?", "Escarapela", ["Banda presidencial", "Corbata", "Medalla"], "🎗️"],
  ["¿Quién escribió la letra del Himno Nacional Argentino?", "Vicente López y Planes", ["Manuel Belgrano", "José de San Martín", "Bernardino Rivadavia"], "🎼"],
  ["¿Qué elementos aparecen en el Escudo Nacional Argentino?", "Un sol, un gorro y dos manos unidas", ["Un león y una corona dorada", "Un águila y una serpiente", "Una espada y un escudo rojo"], "🛡️"],
];

const SYMBOLS_DIFICIL: MC[] = [
  ["¿En qué año se creó la bandera argentina?", "1812", ["1810", "1816", "1853"], "🎌"],
  ["¿Dónde izó Manuel Belgrano la bandera por primera vez?", "En Rosario, junto al Paraná", ["En Buenos Aires", "En Mendoza", "En Tucumán"], "🏞️"],
  ["¿En qué año se agregó el Sol a la bandera argentina?", "1818", ["1812", "1853", "1900"], "☀️"],
  ["¿Quién compuso la música del Himno Nacional?", "Blas Parera", ["Vicente López y Planes", "Manuel Belgrano", "Domingo Sarmiento"], "🎵"],
  ["El gorro que aparece en el Escudo Nacional se llama…", "Gorro frigio", ["Gorro de invierno", "Sombrero gaucho", "Corona real dorada"], "🎩", "Es un símbolo histórico de libertad."],
  ["¿En qué año se adoptó oficialmente el Escudo Nacional Argentino?", "1813", ["1810", "1816", "1853"], "🛡️"],
];

const SYMBOLS_EXPERTO: MC[] = [
  ["¿Por qué el origen de los colores celeste y blanco no está confirmado?", "Porque los historiadores no logran un acuerdo", ["Porque nunca nadie investigó el tema", "Porque los colores cambiaron muchas veces", "Porque España impuso esos colores"], "📚", "Se debate entre el cielo de mayo, la escarapela y otras influencias de la época."],
  ["¿En qué consiste el 'Juramento a la Bandera' de 4º grado?", "Un acto donde se promete defender la bandera", ["Un examen final de historia argentina", "Un trámite para votar por primera vez", "Un juicio simbólico sin valor legal"], "🎓"],
  ["¿Qué cuerpo colegiado adoptó formalmente el Escudo Nacional en 1813?", "La Asamblea del Año XIII", ["El Congreso de Tucumán", "La Primera Junta", "El Cabildo de Buenos Aires"], "🏛️"],
  ["¿Por qué existen normas oficiales sobre el uso de los símbolos patrios?", "Para asegurar su uso correcto y respetuoso", ["Porque están prohibidos fuera de la escuela", "Porque cambian de diseño cada año", "Porque no existe ninguna norma al respecto"], "📜"],
];

// ── 2. Días Patrios y Próceres ─────────────────────────────────

const DATES_FACIL: BIN[] = [
  ["El 25 de mayo festejamos que Argentina empezó a gobernarse sola. ¿Es un día importante?", "🎉 Sí, es un día patrio", "😴 No, es un día cualquiera"],
  ["San Martín cruzó a caballo las montañas más altas de América para ayudar a otros países a ser libres. ¿Qué cruzó?", "🏔️ Los Andes", "🌊 El mar"],
  ["El 9 de julio festejamos que Argentina se declaró libre. ¿De quién nos independizamos?", "👑 De España", "🐧 De la Antártida"],
  ["Manuel Belgrano creó algo que flamea en las escuelas todos los días. ¿Qué creó?", "🇦🇷 La bandera", "⚽ Una pelota"],
  ["El 20 de junio recordamos a Belgrano. ¿Qué se festeja ese día?", "🎗️ El Día de la Bandera", "🎂 Su cumpleaños"],
];

const DATES_MC: MC[] = [
  ["¿Qué se festeja el 25 de mayo?", "La Revolución de Mayo de 1810", ["La independencia de España", "El día de la bandera", "El cumpleaños de San Martín"], "🎉"],
  ["¿Qué se festeja el 9 de julio?", "La Independencia Argentina", ["La Revolución de Mayo", "El día de la bandera", "El descubrimiento de América"], "🎆"],
  ["¿Quién es conocido como 'El Padre de la Patria'?", "José de San Martín", ["Manuel Belgrano", "Domingo Sarmiento", "Juan Perón"], "⚔️"],
  ["¿Qué hizo San Martín para ayudar a liberar Chile y Perú?", "Cruzó los Andes con su ejército", ["Navegó directo hasta Europa", "Construyó un puente enorme", "Escribió una carta al rey"], "🏔️"],
  ["¿Qué órgano de gobierno se formó el 25 de mayo de 1810?", "La Primera Junta de Gobierno", ["El Congreso de Tucumán", "La Corte Suprema", "El Cabildo español"], "🏛️"],
  ["¿En qué ciudad se declaró la independencia argentina en 1816?", "San Miguel de Tucumán", ["Buenos Aires", "Córdoba", "Mendoza"], "🏙️"],
];

const DATES_DIFICIL: MC[] = [
  ["¿Quién presidió la Primera Junta de Gobierno en 1810?", "Cornelio Saavedra", ["Mariano Moreno", "Manuel Belgrano", "Juan José Castelli"], "🏛️"],
  ["¿Qué cargo ocupó Mariano Moreno en la Primera Junta?", "Secretario", ["Presidente", "Tesorero", "Ministro de guerra"], "✍️"],
  ["¿En qué provincia formó San Martín el Ejército de los Andes?", "Mendoza", ["Tucumán", "Salta", "Córdoba"], "🐴"],
  ["¿Qué general defendió el norte argentino con la llamada 'guerra gaucha'?", "Martín Miguel de Güemes", ["José de San Martín", "Manuel Belgrano", "Bernardino Rivadavia"], "🐎"],
  ["¿Quién fue Juana Azurduy?", "Una líder guerrillera de la independencia", ["Una escritora del siglo veinte", "La primera presidenta argentina", "Una reina de España antigua"], "⚔️"],
  ["¿Qué fecha se conmemora como 'Día Nacional de la Memoria por la Verdad y la Justicia'?", "24 de marzo", ["20 de junio", "17 de agosto", "12 de octubre"], "🕯️"],
];

const DATES_EXPERTO: MC[] = [
  ["¿Qué significó jurídicamente la Revolución de Mayo de 1810?", "El fin del gobierno virreinal español", ["La independencia total e inmediata", "La sanción de la primera Constitución", "La abolición total de la esclavitud"], "📜", "Se gobernó en nombre del rey depuesto Fernando VII hasta 1816."],
  ["¿Por qué el Congreso de Tucumán tardó seis años en declarar la independencia?", "Por disputas internas e inestabilidad militar", ["Porque nadie quería la independencia", "Por la falta total de próceres", "Porque España lo prohibía legalmente"], "⚖️"],
  ["¿En qué consistió el 'Plan Continental' de San Martín?", "Cruzar los Andes para liberar Chile y Perú", ["Un tratado comercial con Inglaterra", "El nombre de su ejército personal", "Una ley votada por el Congreso"], "🗺️"],
  ["¿Por qué se considera a Mariano Moreno una figura clave del ala más radical?", "Impulsó ideas republicanas más abiertas", ["Porque fue el primer presidente electo", "Porque firmó la independencia en 1816", "Porque compuso el Himno Nacional"], "📖"],
];

// ── 3. La Nación y su Organización ─────────────────────────────

const NATION_FACIL: BIN[] = [
  ["Un país tiene su propia bandera y su propio gobierno. ¿Argentina es un país?", "✅ Sí, es un país", "🙅 No, es una ciudad"],
  ["Buenos Aires es la ciudad donde está el gobierno de todo el país. ¿Cómo se llama eso?", "🏙️ Es la Capital", "🏖️ Es una playa"],
  ["Argentina se divide en partes para organizarse mejor, como Córdoba o Mendoza. ¿Cómo se llaman esas partes?", "🗺️ Provincias", "🍕 Comidas"],
  ["¿Necesita un país reglas para que todos vivan mejor y en orden?", "✅ Sí, se llaman leyes", "🙅 No, cada uno hace lo que quiere"],
  ["El Presidente gobierna para todo el país. ¿Lo elige la gente votando?", "🗳️ Sí, lo elegimos votando", "🎲 No, se elige al azar"],
];

const NATION_MC: MC[] = [
  ["¿Cómo se llama la forma de gobierno de Argentina?", "República representativa y federal", ["Una monarquía hereditaria", "Una dictadura militar", "Un imperio colonial"], "🏛️"],
  ["¿Cuál es la capital de la República Argentina?", "Ciudad Autónoma de Buenos Aires", ["La ciudad de Córdoba", "La ciudad de Rosario", "La ciudad de Mendoza"], "🏙️"],
  ["¿En cuántas provincias se divide Argentina, sin contar la Ciudad de Buenos Aires?", "23 provincias", ["10 provincias", "50 provincias", "5 provincias"], "🗺️"],
  ["¿Qué significa que Argentina sea un país 'federal'?", "Que las provincias tienen sus propios gobiernos", ["Que solo existe un gobierno para todo el país", "Que Argentina no tiene provincias", "Que lo gobierna un país vecino"], "🤝"],
  ["¿Qué es la Constitución Nacional?", "La ley más importante del país", ["Un libro de historia antigua", "El himno oficial del país", "Un mapa turístico oficial"], "📖"],
  ["¿Cómo se llama a las personas que nacen o viven legalmente en un país y tienen derechos y deberes allí?", "Ciudadanos", ["Turistas", "Visitantes", "Extranjeros de paso"], "🧑‍🤝‍🧑"],
];

const NATION_DIFICIL: MC[] = [
  ["¿Qué significa que Argentina sea una república 'representativa'?", "Que el pueblo gobierna mediante representantes", ["Que gobierna un rey por herencia familiar", "Que no existen elecciones nunca", "Que gobiernan solamente los jueces"], "🗳️"],
  ["Además de las 23 provincias, ¿qué otro distrito tiene autonomía propia desde 1994?", "La Ciudad Autónoma de Buenos Aires", ["La región de la Patagonia", "La provincia del Chaco", "Ninguna otra región del país"], "🏙️"],
  ["¿Qué diferencia hay entre un Estado 'unitario' y uno 'federal'?", "En el federal, las provincias tienen poder propio", ["Son exactamente lo mismo siempre", "El unitario tiene más provincias", "El federal no tiene presidente"], "⚖️"],
  ["¿Qué es la soberanía de un Estado?", "La capacidad de gobernarse a sí mismo", ["El nombre oficial del país entero", "El himno nacional del país", "El idioma oficial del país"], "🌐"],
  ["¿Qué órgano representa a las provincias en el gobierno nacional?", "El Senado", ["La Cámara de Diputados", "La Corte Suprema", "El Ministerio de Economía"], "🏛️"],
];

const NATION_EXPERTO: MC[] = [
  ["¿Qué establece el artículo 1° de la Constitución sobre la forma de gobierno?", "Que adopta la forma representativa y federal", ["Que Argentina es una monarquía parlamentaria", "Que el poder lo tiene un solo partido", "Que las provincias no tienen autonomía"], "📜"],
  ["¿Qué implica el principio de 'autonomía provincial'?", "Que cada provincia dicta su propia constitución", ["Que cada provincia puede separarse cuando quiera", "Que las provincias no pueden tener leyes propias", "Que solo Buenos Aires tiene autonomía"], "⚖️", "Siempre sin contradecir la Constitución Nacional."],
  ["¿Qué diferencia hay entre 'nación' y 'Estado'?", "La nación es cultural; el Estado es político", ["Son sinónimos exactos, sin diferencia", "El Estado es siempre más antiguo", "La nación es solo el territorio físico"], "🧩"],
  ["¿Qué rol cumplen los tratados internacionales de derechos humanos desde 1994?", "Algunos tienen jerarquía constitucional", ["No tienen ningún valor legal en Argentina", "Están por debajo de cualquier ley provincial", "Solo aplican a otros países"], "🌎"],
];

// ── 4. Los Tres Poderes ────────────────────────────────────────

const POWERS_FACIL: BIN[] = [
  ["Alguien tiene que gobernar el país día a día. ¿Quién hace ese trabajo en Argentina?", "🎩 El Presidente", "🐒 Nadie, cada uno hace lo que quiere"],
  ["Alguien tiene que crear las leyes, como las reglas de un juego. ¿Quién las crea?", "🏛️ El Congreso", "🎲 Se inventan solas"],
  ["Si dos personas tienen un problema y no se ponen de acuerdo, ¿quién decide según la ley?", "⚖️ Un juez", "🙈 Nadie decide nunca"],
  ["¿Está bien que una sola persona tenga TODO el poder sin ningún control?", "🙅 No, por eso el poder se reparte", "👑 Sí, así es más rápido"],
];

const POWERS_MC: MC[] = [
  ["¿Cuáles son los tres poderes del Estado argentino?", "Ejecutivo, Legislativo y Judicial", ["Militar, Policial y Civil", "Norte, Sur y Centro", "Presidencial, Real e Imperial"], "🏛️"],
  ["¿Quién encabeza el Poder Ejecutivo en Argentina?", "El Presidente de la Nación", ["El Presidente de la Corte Suprema", "El Gobernador de Buenos Aires", "Un ministro cualquiera del gabinete"], "🎩"],
  ["¿Qué función cumple el Poder Legislativo?", "Crear, modificar y debatir las leyes", ["Dictar sentencias en juicios", "Manejar el ejército nacional", "Cobrar impuestos en la calle"], "📝"],
  ["¿Qué función cumple el Poder Judicial?", "Aplicar la ley y resolver conflictos", ["Crear todas las leyes nuevas", "Gobernar el país día a día", "Organizar solo las elecciones"], "⚖️"],
  ["¿Por qué existen tres poderes separados en vez de uno solo?", "Para que ninguno tenga demasiado poder", ["Para que el país tenga tres banderas", "Es solo una tradición sin motivo", "Para ahorrar dinero público"], "🔄"],
  ["¿Cómo se llama el máximo tribunal de justicia de Argentina?", "Corte Suprema de Justicia de la Nación", ["Congreso Nacional Argentino", "La Casa Rosada de gobierno", "El Banco Central del país"], "⚖️"],
];

const POWERS_DIFICIL: MC[] = [
  ["¿Cómo está compuesto el Poder Legislativo argentino?", "Por dos cámaras: Senado y Diputados", ["Por una sola cámara de senadores", "Por el Presidente y sus ministros", "Por los gobernadores solamente"], "🏛️"],
  ["¿Cuántos senadores representan a cada provincia y a la Ciudad de Buenos Aires?", "3 senadores", ["1 senador", "10 senadores", "23 senadores"], "🪑"],
  ["¿De qué depende la cantidad de diputados que tiene cada provincia?", "De la cantidad de habitantes de esa provincia", ["Del tamaño del territorio en kilómetros", "De un sorteo anual al azar", "Es siempre la misma para todas"], "👥"],
  ["¿Qué es el 'gabinete' del Poder Ejecutivo?", "Los ministros que ayudan a gobernar", ["Los jueces de la Corte Suprema", "Los senadores de la oposición", "El equipo de seguridad del Congreso"], "🗄️"],
  ["¿Qué es el sistema de 'pesos y contrapesos' entre poderes?", "Un mecanismo donde los poderes se controlan", ["Un sistema para pesar monedas", "Un tipo de balanza judicial", "Un impuesto especial del Estado"], "⚖️"],
  ["¿Quién designa a los jueces de la Corte Suprema en Argentina?", "El Presidente, con acuerdo del Senado", ["Los ciudadanos por voto directo", "Solo el Congreso sin el Presidente", "Los propios jueces, sin control externo"], "👨‍⚖️"],
];

const POWERS_EXPERTO: MC[] = [
  ["¿Qué es el 'juicio político' y a quiénes puede aplicarse en Argentina?", "Un proceso para destituir a un funcionario", ["Una elección presidencial anticipada", "Un tipo de indulto presidencial", "Un decreto de necesidad y urgencia"], "⚖️", "Se aplica al Presidente, jueces y otros altos cargos por mal desempeño o delitos."],
  ["¿Qué son los 'Decretos de Necesidad y Urgencia' (DNU)?", "Normas con fuerza de ley que dicta el Ejecutivo", ["Leyes ordinarias votadas por el Congreso", "Fallos dictados por la Corte Suprema", "Tratados internacionales firmados"], "📄"],
  ["¿Qué controla el llamado 'control de constitucionalidad' del Poder Judicial?", "Que las leyes respeten la Constitución", ["El precio de los productos en el mercado", "Los resultados electorales únicamente", "El presupuesto militar exclusivamente"], "🔍"],
  ["¿Por qué se dice que el Poder Judicial debe ser 'independiente'?", "Para que juzgue sin presiones políticas", ["Porque no depende del presupuesto nacional", "Porque los jueces no cobran sueldo", "Porque no aplica ninguna ley escrita"], "🛡️"],
];

// ── 5. La Constitución Nacional ────────────────────────────────

const CONSTITUTION_FACIL: BIN[] = [
  ["Un juego de mesa tiene reglas para jugarlo bien. Un país también tiene sus reglas más importantes. ¿Cómo se llaman?", "📖 La Constitución", "🎈 Los cuentos"],
  ["¿Todos, incluso el Presidente, tienen que respetar las reglas más importantes del país?", "✅ Sí, todos deben respetarlas", "🙅 No, el Presidente hace lo que quiere"],
  ["¿Tenés derecho a ir a la escuela y aprender?", "✅ Sí, es un derecho tuyo", "🙅 No, es solo un favor"],
];

const CONSTITUTION_MC: MC[] = [
  ["¿Qué es la Constitución Nacional?", "La ley suprema que organiza el país", ["Un libro de cuentos históricos", "El nombre oficial del himno", "Una ley que solo aplica en Buenos Aires"], "📖"],
  ["¿En qué año se sancionó la primera Constitución Nacional Argentina?", "1853", ["1810", "1816", "1994"], "📜"],
  ["¿Qué son los 'derechos' que da la Constitución?", "Cosas que toda persona puede hacer o recibir", ["Castigos para quien no obedece", "Beneficios solo para adultos mayores", "Reglas que solo valen para los jueces"], "✋"],
  ["¿Qué son los 'deberes' de los ciudadanos?", "Obligaciones que debemos cumplir", ["Cosas opcionales para todos", "Solo aplican a la policía", "No existen en la Constitución"], "📋"],
  ["¿Por qué se dice que la Constitución es la 'ley suprema'?", "Porque ninguna otra ley puede contradecirla", ["Porque es la ley más larga", "Porque solo la usan los jueces", "Porque fue la primera ley de la historia"], "👑"],
];

const CONSTITUTION_DIFICIL: MC[] = [
  ["¿En qué año fue la última gran reforma de la Constitución Nacional Argentina?", "1994", ["1853", "1949", "2001"], "📜"],
  ["¿Qué cambio importante trajo la reforma constitucional de 1994?", "La reelección presidencial, entre otros cambios", ["La abolición de la esclavitud", "La creación del voto femenino", "La independencia de Argentina"], "🔄"],
  ["¿Qué parte de la Constitución contiene los derechos y garantías de las personas?", "La primera parte, llamada parte dogmática", ["Solo el preámbulo introductorio", "Ninguna parte, están en otra ley", "La parte orgánica exclusivamente"], "📚"],
  ["¿Qué es el 'Preámbulo' de la Constitución?", "Un texto introductorio con los valores del país", ["El primer artículo con fuerza de ley", "Una lista completa de próceres", "Un decreto presidencial cualquiera"], "✍️"],
  ["¿Qué significa que un derecho esté 'garantizado' constitucionalmente?", "Que el Estado debe protegerlo siempre", ["Que es opcional respetarlo", "Que solo aplica los feriados", "Que caduca cada 4 años"], "🛡️"],
];

const CONSTITUTION_EXPERTO: MC[] = [
  ["¿Qué jerarquía tienen ciertos tratados de derechos humanos según la reforma de 1994?", "Jerarquía constitucional, igual que la Constitución", ["Están por debajo de cualquier ley provincial", "No tienen ningún valor legal alguno", "Reemplazan completamente a la Constitución"], "🌎"],
  ["¿Qué es el 'control de convencionalidad'?", "Aplicar también los tratados de derechos humanos", ["Un tipo de elección presidencial", "Un impuesto aduanero especial", "Un permiso para reformar la bandera"], "⚖️", "Es una obligación de los jueces al momento de juzgar."],
  ["¿Qué diferencia hay entre la 'parte dogmática' y la 'parte orgánica'?", "La dogmática da derechos; la orgánica organiza poderes", ["Son exactamente lo mismo siempre", "La orgánica es mucho más antigua", "La dogmática solo aplica a extranjeros"], "📐"],
  ["¿Por qué la Constitución de 1949 fue derogada y se restauró la de 1853 en 1956?", "Un golpe de Estado declaró nula esa reforma", ["Porque el pueblo votó en contra en un referéndum", "Porque no incluía ningún derecho social", "Porque España lo exigió formalmente"], "📜", "Fue tras el golpe que depuso al gobierno peronista, muestra del impacto de la inestabilidad institucional en la historia constitucional argentina."],
];

// ── 6. Leyes y Justicia ────────────────────────────────────────

const LAW_FACIL: BIN[] = [
  ["Las leyes son como las reglas de tu casa, pero para todo el país. ¿Sirven para vivir mejor todos juntos?", "✅ Sí, ayudan a convivir", "🙅 No, no sirven para nada"],
  ["Si alguien rompe una ley importante, como robar, ¿puede haber una consecuencia?", "⚖️ Sí, un juez decide qué pasa", "🙈 No, nunca pasa nada"],
  ["¿Las leyes son iguales para todos, sin importar quién sea?", "✅ Sí, todos somos iguales ante la ley", "👑 No, algunos no tienen que cumplirlas"],
];

const LAW_MC: MC[] = [
  ["¿Quién crea las leyes en Argentina?", "El Congreso Nacional (Senado y Diputados)", ["El Presidente, actuando solo", "Los jueces de los tribunales", "La policía de cada provincia"], "📝"],
  ["¿Qué hace un juez?", "Decide quién tiene razón en un conflicto", ["Crea nuevas leyes para el país", "Gobierna el país día a día", "Cobra los impuestos nacionales"], "⚖️"],
  ["¿Por qué es importante que las leyes se apliquen igual para todos?", "Para que exista justicia real", ["Para que sea más rápido el trámite", "No es algo importante", "Solo importa para los ricos"], "🟰"],
  ["¿Qué es un delito?", "Una acción prohibida con un castigo legal", ["Cualquier cosa que a alguien no le guste", "Un tipo especial de impuesto", "Un premio que da el gobierno"], "🚫"],
  ["Si tenés un problema legal y no podés pagar un abogado, ¿existe ayuda gratuita del Estado?", "Sí, existen defensores públicos gratuitos", ["No, siempre hay que pagar un abogado", "Solo existe para los políticos", "Solo existe los fines de semana"], "🧑‍⚖️"],
];

const LAW_DIFICIL: MC[] = [
  ["¿Cómo se llama el proceso por el cual un proyecto se convierte en ley en Argentina?", "Debe aprobarse en ambas cámaras del Congreso", ["Solo lo firma el Presidente solo", "Lo decide un único diputado", "Lo vota solo la Corte Suprema"], "📜"],
  ["¿Qué diferencia hay entre derecho PENAL y derecho CIVIL?", "El penal trata delitos; el civil regula personas", ["Son exactamente lo mismo siempre", "El civil solo aplica a menores de edad", "El penal no existe en Argentina"], "⚖️"],
  ["¿Qué principio establece que nadie puede ser castigado por una ley que no existía cuando cometió el acto?", "Principio de legalidad penal", ["Principio de mayoría automática", "Principio de gratuidad total", "Principio de unanimidad total"], "📅"],
  ["¿Qué garantiza el derecho a la 'defensa en juicio'?", "Que el acusado pueda defenderse y ser oído", ["Que siempre gana el acusado igual", "Que no hace falta ningún juicio", "Que solo aplica a los adultos mayores"], "🧑‍⚖️"],
  ["¿Qué es la 'presunción de inocencia'?", "Considerar inocente hasta probar lo contrario", ["Que todos son culpables hasta probar lo contrario", "Un tipo de indulto automático especial", "Una regla que solo aplica a menores"], "🙅‍♂️"],
];

const LAW_EXPERTO: MC[] = [
  ["¿Qué diferencia hay entre una LEY y un DECRETO?", "La ley la sanciona el Congreso; el decreto, el Ejecutivo", ["Son exactamente lo mismo siempre", "El decreto siempre vale más que la ley", "La ley la firma solamente un juez"], "📄"],
  ["¿Qué es el 'debido proceso legal'?", "Las garantías básicas de todo proceso judicial", ["Un trámite administrativo sin importancia", "Algo que solo aplica a causas civiles menores", "Un impuesto judicial especial"], "⚖️"],
  ["¿Qué rol cumple el Ministerio Público Fiscal en el proceso penal?", "Investiga los delitos y acusa en nombre del Estado", ["Defiende siempre al acusado penal", "Dicta todas las sentencias finales", "Redacta las leyes del Congreso"], "🕵️"],
  ["¿Qué significa que el Poder Judicial argentino tenga distintas 'instancias'?", "Que un fallo puede apelarse a un tribunal superior", ["Que cada instancia juzga un delito distinto sin relación", "Que solo hay un único tribunal en todo el país", "Que las instancias son solo simbólicas"], "🏢"],
];

// ── 7. Democracia y Votación ────────────────────────────────────

const DEMOCRACY_FACIL: BIN[] = [
  ["Cuando un grupo tiene que elegir algo, como qué juego jugar, ¿está bien que todos opinen y elijan?", "🙋 Sí, eso es votar", "🤐 No, uno solo decide por todos"],
  ["Cuando sos grande, en Argentina ¿podés elegir quién gobierna el país?", "🗳️ Sí, votando", "🙅 No, nunca se puede elegir"],
  ["El voto es en secreto, para que nadie sepa por quién votaste si vos no querés. ¿Está bien que sea secreto?", "✅ Sí, así votás libremente", "👀 No, todos deberían verlo"],
];

const DEMOCRACY_MC: MC[] = [
  ["¿Qué es la democracia?", "Un gobierno donde el pueblo elige votando", ["Un gobierno donde manda un rey solo", "Un gobierno que no tiene elecciones", "Un gobierno de tipo militar"], "🗳️"],
  ["¿A partir de qué edad se puede votar en Argentina de forma optativa?", "16 años", ["10 años", "21 años", "25 años"], "🗳️"],
  ["¿Es obligatorio votar en Argentina para los mayores de 18 y hasta los 70 años?", "Sí, es obligatorio para todos", ["No, es totalmente opcional siempre", "Solo en elecciones presidenciales", "Solo si uno quiere"], "☑️"],
  ["¿Por qué el voto es secreto en Argentina?", "Para votar libremente sin miedo", ["Para que casi nadie vote", "Para que solo el gobierno sepa el resultado", "Porque es más rápido contarlo"], "🤫"],
  ["¿Qué es un partido político?", "Un grupo político que se presenta a elecciones", ["Una fiesta de cumpleaños familiar", "Un edificio público del gobierno", "Un tipo especial de impuesto"], "🎗️"],
];

const DEMOCRACY_DIFICIL: MC[] = [
  ["¿Qué ley estableció por primera vez el voto secreto y obligatorio (masculino) en Argentina?", "La Ley Sáenz Peña, de 1912", ["La Constitución de 1853", "La ley de voto femenino", "La ley de reforma de 1994"], "📜"],
  ["¿En qué año se estableció el voto femenino en Argentina?", "1947", ["1912", "1853", "1983"], "🗳️"],
  ["¿Qué es el sistema electoral 'proporcional' usado para elegir diputados?", "Reparte las bancas según el porcentaje de votos", ["Gana siempre el partido con un solo voto más", "Se sortea al azar entre los candidatos", "Solo vota la Corte Suprema entera"], "📊"],
  ["¿Qué es una elección 'primaria' (PASO) en Argentina?", "Una elección previa para definir candidatos", ["La elección final que define al Presidente", "Un festejo patrio nacional", "Un tipo de juicio político"], "🗳️"],
  ["¿Desde qué año se recuperó la democracia de forma ininterrumpida en Argentina?", "1983", ["1912", "1946", "2001"], "📅"],
];

const DEMOCRACY_EXPERTO: MC[] = [
  ["¿Qué diferencia hay entre democracia 'directa' y 'representativa'?", "En la directa decide el pueblo; en la representativa, sus elegidos", ["Son exactamente lo mismo siempre", "La directa ya no se usa nunca en el mundo actual", "La representativa no tiene elecciones"], "🏛️"],
  ["¿Qué es el 'quórum' en el Congreso?", "El mínimo de legisladores para poder sesionar", ["La cantidad total de votos de toda la elección", "El sueldo mensual de los diputados", "El nombre de una ley electoral"], "🪑"],
  ["¿Qué riesgo señalan los politólogos sobre el 'clientelismo político'?", "Cambiar favores por apoyo político", ["Es un sistema que fortalece siempre la democracia", "Es obligatorio por la Constitución", "No tiene relación con la política"], "🤝", "Puede debilitar la igualdad real del voto."],
  ["¿Por qué se considera la libertad de prensa esencial para una democracia sana?", "Porque permite controlar al poder e informar", ["Porque genera más ganancias a los medios", "No tiene relación con la democracia", "Porque lo exige un tratado comercial"], "📰"],
];

// ── 8. Ciudadanía y Derechos Humanos ────────────────────────────

const CITIZENSHIP_FACIL: BIN[] = [
  ["¿Todas las personas merecen ser tratadas con respeto, sin importar cómo sean?", "❤️ Sí, todos merecemos respeto", "🙅 No, solo algunos"],
  ["Si ves que alguien trata mal a otro compañero, ¿está bien avisarle a un adulto?", "🙋 Sí, está bien pedir ayuda", "🤐 No, hay que quedarse callado"],
  ["¿Tenés derecho a expresar lo que pensás y sentís?", "🗣️ Sí, es tu derecho", "🤐 No, hay que quedarse callado siempre"],
];

const CITIZENSHIP_MC: MC[] = [
  ["¿Qué son los Derechos Humanos?", "Derechos que tiene toda persona por serlo", ["Beneficios que solo tienen algunos países", "Premios que da el gobierno a los ganadores", "Reglas que solo aplican a los adultos"], "🌍"],
  ["¿Qué es la igualdad ante la ley?", "Que la ley trata a todos por igual", ["Que todos ganan el mismo sueldo", "Que solo los ricos tienen derechos", "Que en realidad no existen las leyes"], "🟰"],
  ["¿Qué es la libertad de expresión?", "El derecho a compartir tus ideas libremente", ["El derecho a no ir a la escuela", "Un permiso especial solo para periodistas", "Un impuesto especial del Estado"], "🗣️"],
  ["¿Por qué es importante participar en la vida de tu comunidad?", "Porque ayuda a mejorar la sociedad", ["No sirve absolutamente de nada", "Solo pueden participar los adultos mayores", "Es obligatorio y nunca es voluntario"], "🤝"],
];

const CITIZENSHIP_DIFICIL: MC[] = [
  ["¿Qué organismo internacional promueve y vigila el cumplimiento de los Derechos Humanos en América?", "La Comisión Interamericana de Derechos Humanos", ["La FIFA, organismo del fútbol", "El Banco Mundial de finanzas", "Únicamente la Cruz Roja"], "🌎"],
  ["¿Qué establece la Declaración Universal de los Derechos Humanos de 1948?", "Derechos básicos para todas las personas del mundo", ["Solo aplica a los países de Europa", "Es una ley argentina exclusivamente", "Solo tiene valor simbólico sin impacto real"], "📜"],
  ["¿Qué es una 'minoría' en términos de derechos y ciudadanía?", "Un grupo con menos poder que necesita protección", ["Un grupo de personas menores de edad únicamente", "Un partido político pequeño sin ningún derecho", "Un grupo sin ningún derecho legal"], "🧑‍🤝‍🧑"],
  ["¿Qué significa 'discriminación' y por qué las leyes la prohíben?", "Tratar peor a alguien por su origen o condición", ["Es simplemente tener gustos distintos", "Es un tipo de elección democrática", "Es obligatoria en algunos países"], "🚫"],
];

const CITIZENSHIP_EXPERTO: MC[] = [
  ["¿Qué es el principio de 'no regresividad' en materia de derechos sociales?", "Que un derecho reconocido no debe reducirse sin motivo", ["Que los derechos deben eliminarse cada cierto tiempo", "Que solo aplica a derechos económicos de empresas", "Que los derechos son iguales en todos los países"], "📈"],
  ["¿Qué diferencia hay entre derechos 'civiles y políticos' y derechos 'económicos, sociales y culturales'?", "Los primeros protegen libertades; los segundos, condiciones de vida", ["Son exactamente la misma categoría siempre", "Los económicos no están reconocidos en ningún tratado", "Los civiles solo existen en Argentina"], "⚖️"],
  ["¿Qué función cumplen los organismos que investigan crímenes de lesa humanidad, como los de la última dictadura argentina (1976-1983)?", "Investigar, juzgar y preservar la memoria histórica", ["Organizar todas las elecciones presidenciales", "Cobrar los impuestos nacionales", "Dictar nuevas leyes económicas"], "🕯️"],
  ["¿Por qué se considera que la libertad de prensa y el acceso a la información pública son pilares de la ciudadanía democrática?", "Porque permiten controlar al poder", ["Porque generan más impuestos para el Estado", "No tienen relación con la ciudadanía", "Solo benefician a los periodistas"], "📰"],
];

export const CIVICS_LEVELS: LevelDef[] = [
  {
    name: "Símbolos Patrios",
    emoji: "🇦🇷",
    desc: "La bandera, el escudo y el himno de tu país",
    tier: 1,
    gen: gen4(SYMBOLS_FACIL, SYMBOLS_MC, SYMBOLS_DIFICIL, SYMBOLS_EXPERTO, "emoji"),
  },
  {
    name: "Días Patrios y Próceres",
    emoji: "🎉",
    desc: "Las fechas y los héroes que hicieron historia",
    tier: 1,
    gen: gen4(DATES_FACIL, DATES_MC, DATES_DIFICIL, DATES_EXPERTO),
  },
  {
    name: "La Nación y su Organización",
    emoji: "🗺️",
    desc: "Qué es un país, sus provincias y su capital",
    tier: 1,
    gen: gen4(NATION_FACIL, NATION_MC, NATION_DIFICIL, NATION_EXPERTO),
  },
  {
    name: "Los Tres Poderes",
    emoji: "🏛️",
    desc: "Cómo se reparte el gobierno para que nadie abuse",
    tier: 2,
    gen: gen4(POWERS_FACIL, POWERS_MC, POWERS_DIFICIL, POWERS_EXPERTO),
  },
  {
    name: "La Constitución Nacional",
    emoji: "📖",
    desc: "La ley más importante del país y tus derechos",
    tier: 2,
    gen: gen4(CONSTITUTION_FACIL, CONSTITUTION_MC, CONSTITUTION_DIFICIL, CONSTITUTION_EXPERTO),
  },
  {
    name: "Leyes y Justicia",
    emoji: "⚖️",
    desc: "Cómo se crean las leyes y cómo funciona la justicia",
    tier: 2,
    gen: gen4(LAW_FACIL, LAW_MC, LAW_DIFICIL, LAW_EXPERTO),
  },
  {
    name: "Democracia y Votación",
    emoji: "🗳️",
    desc: "Cómo elegimos entre todos quién nos gobierna",
    tier: 3,
    gen: gen4(DEMOCRACY_FACIL, DEMOCRACY_MC, DEMOCRACY_DIFICIL, DEMOCRACY_EXPERTO),
  },
  {
    name: "Ciudadanía y Derechos Humanos",
    emoji: "🤝",
    desc: "El respeto, la igualdad y los derechos de todos",
    tier: 3,
    gen: gen4(CITIZENSHIP_FACIL, CITIZENSHIP_MC, CITIZENSHIP_DIFICIL, CITIZENSHIP_EXPERTO),
  },
];
