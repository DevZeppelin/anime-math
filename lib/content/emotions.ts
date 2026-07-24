import type { Difficulty, LevelDef, Question } from "../types";
import { pick, pickEmojiMC, sample, session, shuffle } from "./utils";

// ─────────────────────────────────────────────────────────────
// EMOCIONES Y VALORES — materia nueva, 8 niveles de educación
// socioemocional (SEL): reconocer emociones, compartir, buenos
// modales, seguridad personal y resolución de conflictos. Un
// pilar de los currículos de Finlandia y Canadá, y el tema
// MÁS visual de todos — las caras emoji SON la emoción.
//   facil (Menores de 5)  → carita ↔ emoción, ayudar, seguridad.
//   normal / dificil       → escenarios con más matices.
// ─────────────────────────────────────────────────────────────

type D = Difficulty;
type MC = [prompt: string, answer: string, distractors: string[], visual?: string, explain?: string];

function buildMC(bank: MC[], d: D, take = 10): Question[] {
  const allAnswers = bank.map((m) => m[1]);
  const qs: Question[] = bank.map(([prompt, answer, wrong, visual, explain]) => {
    let options = [answer, ...wrong];
    if (d === "dificil") {
      const extra = shuffle(allAnswers.filter((a) => !options.includes(a))).slice(0, 2);
      options = [...options, ...extra];
    }
    return { kind: "mc" as const, prompt, visual, options: shuffle(options), answer, explain };
  });
  return session(sample(qs, Math.min(take + 2, qs.length)));
}

// ── caras y emociones (menores de 5) ───────────────────────────

const FACES: [string, string][] = [
  ["feliz", "😊"], ["triste", "😢"], ["enojado", "😠"], ["asustado", "😱"],
  ["cansado", "😴"], ["sorprendido", "😮"], ["enamorado", "🥰"], ["avergonzado", "😳"],
];

const SCENARIO_EMOTION: [string, string, string[]][] = [
  ["A Ana se le rompió su juguete favorito.", "😢", ["😊", "😠"]],
  ["Leo ganó el primer premio en la carrera.", "😊", ["😢", "😱"]],
  ["Sofía vio una araña gigante en su cuarto.", "😱", ["😊", "😴"]],
  ["A Mateo le quitaron su juguete sin pedirlo.", "😠", ["😊", "😴"]],
  ["Ya es la hora de dormir de Emma.", "😴", ["😊", "😠"]],
  ["Nico recibió un regalo sorpresa que no esperaba.", "😮", ["😢", "😴"]],
];
function qScenarioEmotion(): Question {
  const [prompt, answer, wrong] = pick(SCENARIO_EMOTION);
  return { kind: "mc", prompt, options: shuffle([answer, ...wrong]), answer };
}

// ── compartir y ayudar (menores de 5) ──────────────────────────

const HELP_VISUAL: [string, string, string[]][] = [
  ["Tu amigo está triste 😢. ¿Qué haces?", "🤗", ["🙈", "😝"]],
  ["Tu amigo se cayó y se lastimó 🤕. ¿Qué haces?", "🤗", ["😂", "🙈"]],
  ["Un amigo tiene hambre y no tiene comida 🍽️. ¿Qué haces?", "🍎", ["🙅", "😤"]],
  ["Tu hermanito quiere jugar contigo 🧸. ¿Qué haces?", "😊", ["😠", "🙈"]],
  ["Ves a alguien solo en el recreo 🏫. ¿Qué haces?", "🤝", ["🙈", "😏"]],
];
function qHelpVisual(): Question {
  const [prompt, answer, wrong] = pick(HELP_VISUAL);
  return { kind: "mc", prompt, options: shuffle([answer, ...wrong]), answer };
}

// ── buenos modales (menores de 5): opción binaria ícono+palabra ─

const MANNERS_VISUAL: [string, string, string][] = [
  ["Tu amigo te ayudó con algo. ¿Qué le dices?", "🙏 Gracias", "🤐 Nada"],
  ["Quieres pedirle algo a un adulto. ¿Cómo empiezas?", "🙏 Por favor", "😤 ¡Dámelo!"],
  ["Sin querer empujaste a alguien. ¿Qué le dices?", "😔 Perdón", "🤷 Nada"],
  ["Llega una visita a tu casa. ¿Qué le dices?", "👋 Hola", "🙈 Me escondo"],
  ["Terminaste de comer en la mesa. ¿Qué dices antes de irte?", "🙋 ¿Puedo levantarme?", "🏃 Me voy corriendo"],
];
function qManners(): Question {
  const [prompt, correct, wrong] = pick(MANNERS_VISUAL);
  return { kind: "mc", prompt, options: shuffle([correct, wrong]), answer: correct };
}

// ── seguridad personal (menores de 5) ──────────────────────────

const SAFETY_VISUAL: [string, string, string][] = [
  ["Un desconocido te ofrece dulces 🍬. ¿Qué haces?", "🙋 Le cuento a un adulto", "🍬 Acepto los dulces"],
  ["Ves fuego en la cocina 🔥. ¿Qué haces?", "🙋 Aviso a un adulto", "🙈 No hago nada"],
  ["Vas a cruzar la calle 🚦. ¿Qué haces primero?", "👀 Miro a los dos lados", "🏃 Cruzo corriendo"],
  ["Alguien te pide tu nombre y dirección por internet 💻. ¿Qué haces?", "🙋 Le pregunto a un adulto", "⌨️ Se lo cuento todo"],
  ["Te subes a la bicicleta 🚲. ¿Qué te pones primero?", "🪖 El casco", "🎧 Los audífonos"],
];
function qSafety(): Question {
  const [prompt, correct, wrong] = pick(SAFETY_VISUAL);
  return { kind: "mc", prompt, options: shuffle([correct, wrong]), answer: correct };
}

// ── resolver pequeños conflictos (menores de 5) ────────────────

const CONFLICT_VISUAL: [string, string, string][] = [
  ["Dos niños quieren el mismo columpio 🛝. ¿Qué es lo mejor?", "🔄 Turnarse", "😤 Pelear por él"],
  ["Tú y tu amigo quieren el mismo juguete 🧸 a la vez. ¿Qué haces?", "🤝 Jugarlo juntos", "🥊 Quitárselo"],
  ["Sin querer chocaste con un amigo y se cayó. ¿Qué le dices?", "😔 Perdón, ¿estás bien?", "🙈 Nada, sigo caminando"],
  ["Dos amigos no se ponen de acuerdo en qué jugar. ¿Qué es lo mejor?", "🗣️ Hablarlo entre los dos", "😡 Gritar más fuerte"],
  ["Un amigo está enojado contigo por algo que hiciste. ¿Qué haces?", "🙏 Pedir disculpas", "🤷 Ignorarlo"],
];
function qConflictVisual(): Question {
  const [prompt, correct, wrong] = pick(CONFLICT_VISUAL);
  return { kind: "mc", prompt, options: shuffle([correct, wrong]), answer: correct };
}

// ── uso de pantallas (menores de 5) ────────────────────────────

const DIGITAL_VISUAL: [string, string, string][] = [
  ["Jugaste mucho rato con la tablet 📱. ¿Qué haces ahora?", "🌳 Salgo a jugar afuera", "📱 Sigo jugando más"],
  ["Es de noche y hay que dormir 😴. ¿Qué haces con la pantalla?", "🌙 La apago", "📱 Sigo mirando"],
  ["Estás comiendo con tu familia 🍽️. ¿Usas la pantalla?", "🙅 No, como sin pantalla", "📱 Sí, todo el tiempo"],
  ["Ya jugaste tu tiempo de pantalla de hoy ⏰. ¿Qué haces?", "🧩 Juego con otra cosa", "😭 Pido más tiempo llorando"],
];
function qDigitalVisual(): Question {
  const [prompt, correct, wrong] = pick(DIGITAL_VISUAL);
  return { kind: "mc", prompt, options: shuffle([correct, wrong]), answer: correct };
}

// ── honestidad y responsabilidad (menores de 5) ────────────────

const HONESTY_VISUAL: [string, string, string][] = [
  ["Encontraste una moneda 🪙 que no es tuya. ¿Qué haces?", "🙋 Pregunto de quién es", "🤐 Me la quedo callado"],
  ["Rompiste un juguete sin querer 🧸. ¿Qué dices?", "😔 Digo la verdad", "🤥 Digo que no fui yo"],
  ["Un amigo te presta su libro 📖. ¿Qué haces al terminar?", "🤲 Se lo devuelvo con cuidado", "🗑️ Lo dejo tirado"],
  ["Viste basura tirada en el piso 🗑️. ¿Qué haces?", "🚮 La levanto y la tiro en su lugar", "🤷 Hago como que no la vi"],
  ["Ganaste un juego pero tu amigo perdió y está triste 😢. ¿Qué haces?", "🤗 Lo consuelo y sigo jugando con él", "😝 Me burlo de él"],
];
function qHonestyVisual(): Question {
  const [prompt, correct, wrong] = pick(HONESTY_VISUAL);
  return { kind: "mc", prompt, options: shuffle([correct, wrong]), answer: correct };
}

// ── bancos clásicos para "Aventureros" y "Genios" ──────────────

const SCENARIO_MC: MC[] = [
  ["Nadie quiso sentarse con Tomás en el almuerzo. Probablemente se siente…", "Solo o triste", ["Emocionado", "Orgulloso", "Aburrido"], "🍱"],
  ["Valentina practicó mucho para el examen y le fue muy bien. Se siente…", "Orgullosa", ["Avergonzada", "Asustada", "Enojada"], "📝"],
  ["A Hugo se le perdió su mascota. Es probable que sienta…", "Preocupación", ["Alegría", "Aburrimiento", "Calma"], "🐾"],
  ["Emma tuvo que hablar frente a toda la clase por primera vez. Antes de empezar, probablemente sintió…", "Nervios", ["Enojo", "Sueño", "Hambre"], "🎤"],
  ["Nico rompió sin querer el juguete de su hermano. Lo correcto es sentir…", "Culpa, y pedir disculpas", ["Orgullo", "Alegría", "Indiferencia"], "🧸"],
  ["Sofía ayudó a un compañero que se había caído. Después probablemente se sintió…", "Bien consigo misma", ["Avergonzada", "Enojada", "Aburrida"], "🤝"],
];

const EMOTION_MC: MC[] = [
  ["Ana perdió su juguete favorito. ¿Cómo se siente probablemente?", "Triste", ["Feliz", "Aburrida", "Orgullosa"], "😢"],
  ["Leo ganó el primer lugar en la carrera. ¿Cómo se siente?", "Orgulloso y feliz", ["Triste", "Avergonzado", "Aburrido"], "🏆"],
  ["A Mía le gritaron sin razón. Es probable que se sienta…", "Enojada o dolida", ["Feliz", "Aburrida", "Orgullosa"], "😠"],
  ["Cuando cometemos un error, lo más sano es…", "Reconocerlo y aprender de él", ["Negarlo siempre", "Culpar a otros", "Enojarse con todos"], "🤔"],
  ["Sentir miedo antes de algo nuevo es…", "Normal: a todos nos pasa a veces", ["Una debilidad", "Algo vergonzoso", "Imposible de sentir"], "😌"],
  ["¿Qué significa EMPATÍA?", "Entender cómo se siente otra persona", ["Ser el más fuerte", "Ganar siempre", "Ignorar a los demás"], "🤝"],
];

const HELP_MC: MC[] = [
  ["Un compañero está solo en el recreo. Lo más amable es…", "Invitarlo a jugar", ["Ignorarlo", "Reírse de él", "Contarle a todos que está solo"], "🤝"],
  ["Tu amigo se cayó y se lastimó la rodilla. ¿Qué haces?", "Ayudarlo y pedir ayuda a un adulto", ["Reírte", "Seguir jugando sin más", "Filmarlo"], "🤕"],
  ["Compartir tus cosas con los demás…", "Fortalece la amistad", ["Te hace perder siempre", "Es de mala educación", "No sirve de nada"], "🧸"],
  ["Si alguien te presta algo, debes…", "Cuidarlo y devolverlo", ["Quedártelo", "Romperlo si quieres", "Prestárselo a otro sin avisar"], "🤲"],
  ["Trabajar en equipo significa…", "Ayudarse entre todos para lograr algo", ["Hacer todo solo", "Competir contra tus compañeros", "Mandar a los demás"], "👥"],
];

const MANNERS_MC: MC[] = [
  ["¿Qué se dice al recibir un regalo?", "Gracias", ["Nada, es normal", "¿Por qué me diste esto?", "Qué feo regalo"], "🎁"],
  ["¿Qué se dice al pedir algo?", "Por favor", ["¡Dámelo ya!", "Lo quiero ahora", "Nada, solo lo tomo"], "🙏"],
  ["Si interrumpiste sin querer a alguien, ¿qué dices?", "Perdón, continúa", ["Nada, sigo hablando", "¡Cállate tú!", "No me importa"], "🗣️"],
  ["Antes de tomar algo que no es tuyo, debes…", "Pedir permiso", ["Tomarlo igual", "Esconderlo", "Decir que es tuyo"], "🤲"],
  ["Cuando alguien estornuda, es amable decir…", "Salud", ["Nada", "Qué asco", "Aléjate"], "🤧"],
];

const SAFETY_MC: MC[] = [
  ["Si un desconocido te ofrece subir a su auto, debes…", "Decir NO y avisar a un adulto de confianza", ["Subir si parece amable", "Ir solo a ver qué quiere", "No decirle a nadie"], "🚗"],
  ["¿A quién le cuentas si algo te hace sentir incómodo?", "A un adulto de confianza", ["A nadie, es un secreto", "A un desconocido", "A internet"], "🛡️"],
  ["Antes de cruzar la calle, debes…", "Mirar a ambos lados y usar el semáforo", ["Cruzar corriendo", "Cruzar con los ojos cerrados", "Esperar que alguien te empuje"], "🚦"],
  ["Si hueles a gas o ves fuego en casa, debes…", "Avisar a un adulto de inmediato", ["Esconderte y no decir nada", "Investigar tú solo", "Seguir jugando"], "🔥"],
  ["Al andar en bicicleta o patineta, es importante usar…", "Casco", ["Sandalias", "Guantes de cocina", "Nada especial"], "🪖"],
  ["Si alguien en internet te pide fotos o datos personales, debes…", "Contárselo a un adulto y no responder", ["Enviarle todo", "Quedar de verlo en persona", "Ignorarlo pero no contar nada"], "💻"],
];

const CONFLICT_MC: MC[] = [
  ["Dos amigos quieren el mismo juguete. La mejor solución es…", "Turnarse o jugar juntos", ["Pelear por él", "Que se lo quede el más fuerte", "Romperlo"], "🧸"],
  ["Si alguien te molesta repetidamente, lo mejor es…", "Decírselo a un adulto de confianza", ["Responder con más agresión", "Guardártelo siempre", "Molestarlo de vuelta"], "🗣️"],
  ["Cuando dos personas discuten, ayuda mucho…", "Escuchar el punto de vista del otro", ["Gritar más fuerte", "Irse sin hablar", "Tener siempre la razón"], "👂"],
  ["Si cometiste un error que afectó a alguien, lo correcto es…", "Pedir disculpas y reparar el daño", ["Negarlo", "Culpar a otro", "Ignorarlo"], "🤝"],
  ["El BULLYING (acoso escolar) es…", "Molestar a alguien de forma repetida e intencional", ["Un juego divertido para todos", "Una broma sin importancia", "Algo que hay que ignorar siempre"], "🚫", "El acoso nunca es un juego: siempre hay que contarlo a un adulto."],
];

const DIGITAL_MC: MC[] = [
  ["¿Cuánto tiempo de pantallas es sano para un niño al día?", "Un tiempo limitado, con pausas", ["Todo el día sin parar", "Ninguno, nunca", "Toda la noche"], "📱"],
  ["Si ves algo en internet que te asusta o incomoda, debes…", "Cerrarlo y contárselo a un adulto", ["Seguir mirando solo", "Compartirlo con más amigos", "Ignorarlo sin contar nada"], "💻"],
  ["Antes de compartir una foto de otra persona, es respetuoso…", "Pedirle permiso", ["Compartirla sin avisar", "Editarla para burlarte", "No importa, es internet"], "📸"],
  ["Escribir cosas hirientes a alguien por internet es…", "Ciberacoso: nunca está bien", ["Solo una broma", "Normal si es en broma", "Sin consecuencias"], "🚫"],
  ["Una contraseña segura debe ser…", "Larga y solo tuya, ni compartida", ["Tu nombre", "1234", "La misma en todos lados y compartida"], "🔐"],
];

// ── generadores ──────────────────────────────────────────────

function genFaces(d: D): Question[] {
  if (d === "facil") return session(Array.from({ length: 10 }, () => pickEmojiMC(FACES, (name) => `¿Cuál cara está ${name}?`)));
  return buildMC(EMOTION_MC, d);
}

function genScenarioEmotion(d: D): Question[] {
  if (d === "facil") return session(Array.from({ length: 10 }, qScenarioEmotion));
  return buildMC(SCENARIO_MC, d, SCENARIO_MC.length);
}

function genHelp(d: D): Question[] {
  if (d === "facil") return session(Array.from({ length: 10 }, qHelpVisual));
  return buildMC(HELP_MC, d);
}

function genManners(d: D): Question[] {
  if (d === "facil") return session(Array.from({ length: 10 }, qManners));
  return buildMC(MANNERS_MC, d);
}

function genSafety(d: D): Question[] {
  if (d === "facil") return session(Array.from({ length: 10 }, qSafety));
  return buildMC(SAFETY_MC, d, SAFETY_MC.length);
}

function genConflict(d: D): Question[] {
  if (d === "facil") return session(Array.from({ length: 10 }, qConflictVisual));
  return buildMC(CONFLICT_MC, d, CONFLICT_MC.length);
}

function genDigital(d: D): Question[] {
  if (d === "facil") return session(Array.from({ length: 10 }, qDigitalVisual));
  return buildMC(DIGITAL_MC, d, DIGITAL_MC.length);
}

function genValues(d: D): Question[] {
  if (d === "facil") return session(Array.from({ length: 10 }, qHonestyVisual));
  return buildMC([...HELP_MC.slice(0, 3), ...CONFLICT_MC.slice(0, 3)], d);
}

export const EMOTIONS_LEVELS: LevelDef[] = [
  { name: "¿Cómo me Siento?", emoji: "😊", desc: "Reconoce las emociones básicas", tier: 1, gen: genFaces },
  { name: "¿Qué le Pasa?", emoji: "🎭", desc: "Identifica emociones en pequeñas historias", tier: 1, gen: genScenarioEmotion },
  { name: "Compartir y Ayudar", emoji: "🤝", desc: "Amistad, generosidad y trabajo en equipo", tier: 1, gen: genHelp },
  { name: "Buenos Modales", emoji: "🙏", desc: "Gracias, por favor y perdón", tier: 2, gen: genManners },
  { name: "Cuídate y Cuídalos", emoji: "🛡️", desc: "Seguridad personal en casa y en la calle", tier: 2, gen: genSafety },
  { name: "Resolviendo Conflictos", emoji: "🕊️", desc: "Cómo resolver problemas sin pelear", tier: 2, gen: genConflict },
  { name: "Ciudadanía Digital", emoji: "💻", desc: "Uso seguro y amable de la tecnología", tier: 3, gen: genDigital },
  { name: "Grandes Valores", emoji: "⭐", desc: "Honestidad, respeto y responsabilidad", tier: 3, gen: genValues },
];
