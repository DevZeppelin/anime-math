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
    if (d === "dificil" || d === "experto") {
      const extra = shuffle(allAnswers.filter((a) => !options.includes(a))).slice(0, d === "experto" ? 3 : 2);
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

// ═════════════════════════════════════════════════════════════
// CONTENIDO DE "MAESTROS" (experto) — inteligencia emocional y
// valores reales de adultos: vocabulario emocional avanzado,
// comunicación laboral, autocuidado, negociación y seguridad
// digital para cualquier edad.
// ═════════════════════════════════════════════════════════════

const EMOTION_VOCAB_EXPERTO: MC[] = [
  ["¿Qué diferencia hay entre sentir ENOJO y sentir FRUSTRACIÓN?", "La frustración suele surgir de un obstáculo que impide lograr algo; el enojo es una reacción más general", ["Son exactamente lo mismo", "La frustración es siempre más fuerte", "El enojo solo existe en la niñez"], "😤"],
  ["Sentir ANSIEDAD antes de algo importante (como una entrevista) es…", "Una reacción normal del cuerpo ante la incertidumbre", ["Un signo de debilidad", "Algo que nunca le pasa a los adultos", "Siempre un problema grave"], "😰"],
  ["¿Qué es la NOSTALGIA?", "Un sentimiento agridulce al recordar algo del pasado que ya no está", ["Un tipo de enojo intenso", "Miedo a lo desconocido", "Alegría sin motivo"], "🕰️"],
  ["¿Qué diferencia hay entre CULPA y VERGÜENZA?", "La culpa es sobre algo que hiciste; la vergüenza es sobre cómo te ves a ti mismo", ["Son exactamente lo mismo", "La vergüenza siempre es peor", "La culpa no tiene solución"], "😔"],
  ["¿Qué es la INTELIGENCIA EMOCIONAL?", "La capacidad de reconocer, entender y gestionar tus emociones y las de los demás", ["Ser siempre feliz sin excepción", "No sentir emociones negativas nunca", "Ser muy inteligente académicamente"], "🧠"],
  ["Sentir varias emociones contradictorias a la vez (como felicidad y tristeza juntas) es…", "Normal: las emociones humanas pueden ser complejas y mixtas", ["Imposible, siempre hay una sola emoción", "Un signo de un problema serio", "Solo les pasa a los niños"], "🎭"],
];

const SCENARIO_ADULT_MC: MC[] = [
  ["Un compañero de trabajo evita el contacto visual y responde con monosílabos. Probablemente está…", "Incómodo o preocupado por algo", ["Feliz y relajado", "Muy entusiasmado", "Aburrido sin motivo"], "😟"],
  ["Después de una presentación laboral exitosa, alguien probablemente siente…", "Orgullo y alivio", ["Vergüenza", "Indiferencia total", "Miedo sin razón"], "🎉"],
  ["Alguien que acaba de perder su empleo probablemente atraviesa…", "Una mezcla de shock, tristeza y preocupación", ["Solo alegría", "Total indiferencia", "Solo aburrimiento"], "💼"],
  ["Un amigo cancela planes repetidamente sin dar explicaciones claras. Es razonable sentir…", "Un poco de decepción, y preguntarte si está bien", ["Nada, no hay razón para sentir algo", "Furia extrema de inmediato", "Alegría por tener tiempo libre"], "📵"],
  ["Alguien que recibe una crítica constructiva y se pone a la defensiva probablemente siente…", "Que su autoestima se sintió amenazada", ["Total indiferencia", "Orgullo genuino", "Sorpresa agradable"], "🛡️"],
];

const HELP_ADULT_MC: MC[] = [
  ["¿Qué es la ESCUCHA ACTIVA?", "Prestar atención genuina, sin interrumpir, para entender realmente al otro", ["Escuchar mientras haces otra cosa", "Esperar tu turno para hablar", "Repetir todo lo que dice la otra persona"], "👂"],
  ["Ayudar a alguien sin que te lo pida, ¿es siempre lo correcto?", "No siempre: a veces conviene preguntar primero si quiere esa ayuda", ["Sí, siempre hay que ayudar sin preguntar", "No, nunca hay que ayudar sin que lo pidan", "Solo si te lo agradecen después"], "🤝"],
  ["¿Qué significa tener LÍMITES SANOS al ayudar a los demás?", "Poder decir que no cuando ayudar te perjudica demasiado a ti mismo", ["Nunca ayudar a nadie", "Ayudar siempre sin importar el costo propio", "Ayudar solo a cambio de algo"], "🚧"],
  ["¿Qué es un MENTOR?", "Alguien con más experiencia que guía y apoya a otra persona", ["Un jefe que solo da órdenes", "Un competidor directo", "Alguien que hace el trabajo por ti"], "🧑‍🏫"],
  ["El trabajo en equipo funciona mejor cuando…", "Cada persona aporta sus fortalezas y se respetan las diferencias", ["Todos hacen exactamente lo mismo", "Una sola persona decide todo", "Se compite en vez de colaborar"], "👥"],
];

const MANNERS_ADULT_MC: MC[] = [
  ["En una reunión de trabajo, interrumpir constantemente a los demás es…", "Una falta de respeto que dificulta la comunicación", ["Una forma normal de mostrar interés", "Necesario para ser escuchado", "Algo sin ninguna consecuencia"], "🗣️"],
  ["¿Qué es la EMPATÍA en una conversación difícil?", "Intentar entender genuinamente la perspectiva del otro, aunque no la compartas", ["Estar siempre de acuerdo con todo", "Ignorar lo que siente el otro", "Solo hablar de tus propios problemas"], "🤝"],
  ["Al dar una opinión negativa sobre el trabajo de alguien, es más constructivo…", "Ser específico, respetuoso y ofrecer sugerencias concretas", ["Criticar en general sin detalles", "Decirlo delante de todo el equipo para 'motivar'", "No decir nada nunca"], "📝"],
  ["¿Qué es la ASERTIVIDAD?", "Expresar lo que piensas o necesitas con claridad y respeto, sin agredir", ["Imponer siempre tu opinión", "Callarte siempre para evitar conflictos", "Ser agresivo para que te hagan caso"], "💬"],
  ["Responder mensajes de trabajo constantemente fuera de horario puede…", "Afectar el equilibrio entre la vida laboral y personal", ["Mejorar siempre la productividad sin costo", "No tener ningún efecto", "Ser obligatorio en cualquier trabajo"], "⏰"],
];

const SAFETY_ADULT_MC: MC[] = [
  ["¿Qué es el AGOTAMIENTO (burnout)?", "Un estado de agotamiento físico y emocional por estrés prolongado, sobre todo laboral", ["Cansancio normal después de dormir poco una noche", "Un tipo de enfermedad contagiosa", "Falta de vitaminas únicamente"], "😩"],
  ["Si notas señales de depresión en un ser querido, lo más útil suele ser…", "Escuchar sin juzgar y animarlo a buscar ayuda profesional", ["Decirle que simplemente 'piense positivo'", "Ignorarlo hasta que se le pase solo", "Evitarlo para no incomodarlo"], "🫂"],
  ["¿Qué es una ESTAFA (scam) común por teléfono o mensaje?", "Un intento de engañar a alguien para que entregue dinero o datos personales", ["Una oferta siempre legítima y segura", "Un tipo de encuesta oficial", "Un error técnico sin intención"], "📞"],
  ["¿Por qué es importante el AUTOCUIDADO?", "Porque cuidar tu bienestar te permite sostener el cuidado de los demás también", ["Porque es egoísta pensar en los demás", "Porque no tiene ningún efecto real", "Solo importa si tienes tiempo libre"], "🧘"],
  ["Si un desconocido pide tu contraseña o un código de verificación por teléfono, ¿qué haces?", "Nunca lo compartes: ninguna entidad seria lo pide así", ["Se lo doy si suena profesional", "Se lo doy si dice que es urgente", "Depende de qué banco sea"], "🔐"],
];

const CONFLICT_ADULT_MC: MC[] = [
  ["¿Qué es la comunicación tipo 'YO' en un conflicto (ej. «yo me siento… cuando…»)?", "Expresar cómo te sientes sin acusar directamente al otro", ["Hablar solo de ti sin escuchar", "Culpar abiertamente a la otra persona", "Evitar decir lo que sientes"], "🗣️"],
  ["En una negociación, ¿qué es una solución 'GANAR-GANAR'?", "Un acuerdo donde ambas partes obtienen algo valioso", ["Que una parte gane todo y la otra nada", "Que nadie llegue a ningún acuerdo", "Que se decida por sorteo"], "🤝"],
  ["¿Qué es la MEDIACIÓN en un conflicto?", "Cuando una persona neutral ayuda a resolver un conflicto entre otras dos", ["Cuando una de las partes decide todo", "Un tipo de castigo legal", "Ignorar el conflicto hasta que desaparezca"], "⚖️"],
  ["Evitar un conflicto indefinidamente en vez de hablarlo suele…", "Hacer que el problema crezca o se repita", ["Resolverlo automáticamente con el tiempo", "No tener ningún efecto", "Ser siempre la mejor opción"], "📈"],
  ["¿Qué significa 'elegir tus batallas' en un conflicto?", "Decidir conscientemente qué vale la pena discutir y qué no", ["Pelear por absolutamente todo", "Nunca defender tu punto de vista", "Evitar cualquier tipo de desacuerdo"], "🎯"],
];

const DIGITAL_ADULT_MC: MC[] = [
  ["¿Qué es el PHISHING?", "Un engaño digital para robar datos personales haciéndose pasar por algo confiable", ["Un tipo de videojuego", "Un método legítimo de verificación bancaria", "Un tipo de conexión wifi"], "🎣"],
  ["¿Qué es tu HUELLA DIGITAL?", "El rastro de información que dejas al usar internet", ["Tu contraseña principal", "El modelo de tu celular", "El nombre de tu proveedor de internet"], "👣"],
  ["Antes de compartir una noticia impactante, ¿qué conviene hacer?", "Verificar la fuente y ver si otros medios confiables la confirman", ["Compartirla de inmediato para avisar rápido", "Creerla porque tiene muchas reacciones", "Ignorarla siempre sin leerla"], "🔍"],
  ["¿Qué riesgo tiene usar la MISMA contraseña en todos tus servicios?", "Si una cuenta es hackeada, todas tus otras cuentas quedan en riesgo", ["Ningún riesgo, es más cómodo", "Solo afecta a esa cuenta específica", "Te bloquean automáticamente por seguridad"], "🔑"],
  ["¿Qué es la AUTENTICACIÓN EN DOS PASOS?", "Una capa extra de seguridad que pide un segundo código además de la contraseña", ["Escribir la contraseña dos veces seguidas", "Tener dos contraseñas distintas", "Un tipo de virus informático"], "🔒"],
];

const VALUES_EXPERTO_MC: MC[] = [
  ["¿Qué es la INTEGRIDAD?", "Actuar de acuerdo a tus valores incluso cuando nadie te está observando", ["Nunca cometer ni un solo error", "Hacer siempre lo que otros esperan", "Ser el más fuerte del grupo"], "🧭"],
  ["¿Qué significa hacerte RESPONSABLE de un error, más allá de solo disculparte?", "Reconocerlo, reparar el daño si es posible y aprender de él", ["Solo decir 'perdón' y seguir igual", "Culpar a alguien más", "Fingir que no pasó nada"], "🛠️"],
  ["¿Qué es la RESILIENCIA?", "La capacidad de adaptarte y recuperarte ante la adversidad", ["Nunca sentir tristeza ni dolor", "Ignorar los problemas por completo", "Ser inmune a cualquier fracaso"], "🌱"],
  ["¿Qué es la HUMILDAD, en su sentido más sano?", "Reconocer tus logros sin necesitar sentirte superior a los demás", ["Pensar que no vales nada", "Nunca aceptar un cumplido", "Rebajarte constantemente"], "🙏"],
  ["¿Por qué la GRATITUD se asocia con un mayor bienestar?", "Porque enfocarte en lo positivo mejora tu perspectiva y tus relaciones", ["Porque evita que sientas cualquier emoción negativa", "Porque obliga a los demás a tratarte mejor", "No tiene relación real con el bienestar"], "🙌"],
];

// ── generadores ──────────────────────────────────────────────

function genFaces(d: D): Question[] {
  if (d === "facil") return session(Array.from({ length: 10 }, () => pickEmojiMC(FACES, (name) => `¿Cuál cara está ${name}?`)));
  if (d === "experto") return buildMC(EMOTION_VOCAB_EXPERTO, d);
  return buildMC(EMOTION_MC, d);
}

function genScenarioEmotion(d: D): Question[] {
  if (d === "facil") return session(Array.from({ length: 10 }, qScenarioEmotion));
  if (d === "experto") return buildMC(SCENARIO_ADULT_MC, d, SCENARIO_ADULT_MC.length);
  return buildMC(SCENARIO_MC, d, SCENARIO_MC.length);
}

function genHelp(d: D): Question[] {
  if (d === "facil") return session(Array.from({ length: 10 }, qHelpVisual));
  if (d === "experto") return buildMC(HELP_ADULT_MC, d);
  return buildMC(HELP_MC, d);
}

function genManners(d: D): Question[] {
  if (d === "facil") return session(Array.from({ length: 10 }, qManners));
  if (d === "experto") return buildMC(MANNERS_ADULT_MC, d);
  return buildMC(MANNERS_MC, d);
}

function genSafety(d: D): Question[] {
  if (d === "facil") return session(Array.from({ length: 10 }, qSafety));
  if (d === "experto") return buildMC(SAFETY_ADULT_MC, d, SAFETY_ADULT_MC.length);
  return buildMC(SAFETY_MC, d, SAFETY_MC.length);
}

function genConflict(d: D): Question[] {
  if (d === "facil") return session(Array.from({ length: 10 }, qConflictVisual));
  if (d === "experto") return buildMC(CONFLICT_ADULT_MC, d, CONFLICT_ADULT_MC.length);
  return buildMC(CONFLICT_MC, d, CONFLICT_MC.length);
}

function genDigital(d: D): Question[] {
  if (d === "facil") return session(Array.from({ length: 10 }, qDigitalVisual));
  if (d === "experto") return buildMC(DIGITAL_ADULT_MC, d, DIGITAL_ADULT_MC.length);
  return buildMC(DIGITAL_MC, d, DIGITAL_MC.length);
}

function genValues(d: D): Question[] {
  if (d === "facil") return session(Array.from({ length: 10 }, qHonestyVisual));
  if (d === "experto") return buildMC(VALUES_EXPERTO_MC, d);
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
