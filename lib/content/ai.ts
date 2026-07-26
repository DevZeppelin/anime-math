import type { Difficulty, LevelDef, Question } from "../types";
import { ri, pick, sample, session, shuffle, tf } from "./utils";

// ─────────────────────────────────────────────────────────────
// INTELIGENCIA ARTIFICIAL — materia nueva, 8 niveles. Los
// fundamentos para entender el mundo de hoy: qué es la IA, cómo
// "aprende" de ejemplos, cómo hablarle bien, cómo distinguirla
// de la realidad, y sus límites y responsabilidad — para
// cualquier edad, de menos a más en cada nivel de dificultad.
//   facil (Menores de 5)  → identificación visual con metáforas
//                           simples: "¿esto puede aprender?",
//                           "¿es de verdad?", buenos modales con
//                           un asistente.
//   normal / dificil / experto → conceptos reales y cada vez
//                           más profundos: aprendizaje automático,
//                           redes neuronales, prompting, sesgo,
//                           desinformación y seguridad.
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
  facilKind: "emoji" | "binary" = "emoji"
): (d: D) => Question[] {
  return (d) => {
    if (d === "facil") return facilKind === "emoji" ? buildEmoji(facilBank as EMOJI3[]) : buildBinary(facilBank as BIN[]);
    if (d === "dificil") return buildMC(dificilBank);
    if (d === "experto") return buildMC(expertoBank);
    return buildMC(normalBank);
  };
}

// ── 1. ¿Qué es la IA? ────────────────────────────────────────

const AI_THINKS_FACIL: EMOJI3[] = [
  ["¿Cuál de estos PUEDE aprender cosas nuevas?", "🤖", ["🪨", "🥄"]],
  ["¿Cuál de estos te puede hablar y responder?", "📱", ["🧱", "🍽️"]],
  ["¿Cuál de estos puede reconocer tu cara en una foto?", "📷", ["🪑", "🧦"]],
  ["¿Cuál de estos elige qué video mostrarte después?", "📺", ["🛏️", "🧺"]],
  ["¿Cuál de estos puede jugar al ajedrez pensando sus jugadas?", "💻", ["🧱", "🪨"]],
  ["¿Cuál de estos puede manejar un auto solo?", "🚘", ["🛴", "🚲"]],
];

const AI_EXAMPLES_MC: MC[] = [
  ["¿Cuál de estos usa Inteligencia Artificial?", "Un asistente de voz que responde preguntas", ["Una calculadora simple", "Un martillo de carpintero", "Un termómetro de vidrio"], "🗣️"],
  ["¿Cuál de estos usa Inteligencia Artificial?", "Una app que reconoce tu cara", ["Una linterna común", "Unas tijeras de cocina", "Un lápiz de madera"], "🔓"],
  ["¿Qué hace especial a una máquina con Inteligencia Artificial?", "Puede aprender y mejorar con el tiempo", ["Siempre hace exactamente lo mismo sin cambiar", "Solo funciona con electricidad", "Es más grande que las demás"], "🧠"],
  ["¿Cuál de estos es un ejemplo de IA en el celular?", "Las recomendaciones de videos o música", ["El reloj que muestra la hora", "La calculadora básica", "La linterna del celular"], "📱"],
  ["Un auto que se estaciona solo usando cámaras y sensores está usando…", "Inteligencia Artificial", ["Pura magia sin explicación", "Solo un motor más fuerte", "Control remoto de una persona"], "🅿️"],
  ["¿Qué NO es un ejemplo de IA?", "Un reloj de arena", ["Un traductor automático", "Un filtro que detecta caras en fotos", "Un asistente que agenda citas por voz"], "⏳"],
];

const AI_VS_AUTOMATION_MC: MC[] = [
  ["¿Cuál es la diferencia entre un programa NORMAL y uno con IA?", "El de IA mejora aprendiendo de datos", ["No hay ninguna diferencia real entre ambos", "El programa con IA es siempre más lento", "El programa normal usa más electricidad"], "⚖️"],
  ["Un semáforo automático que cambia SIEMPRE cada 30 segundos, sin importar el tráfico, es…", "Automatización simple, no IA", ["Inteligencia Artificial avanzada", "Un tipo de robot", "Un error de programación"], "🚦"],
  ["¿Qué es el «aprendizaje automático» (machine learning)?", "Una forma de IA que mejora con ejemplos", ["Un tipo de robot con ruedas", "Un curso para programadores", "Un videojuego cualquiera"], "📈"],
  ["Un traductor automático que mejora tras traducir millones de frases, ¿qué hizo?", "Aprendió patrones a partir de esos ejemplos", ["Fue programado línea por línea para cada frase posible", "Se conectó con un traductor humano en vivo", "No cambió absolutamente nada"], "🌐"],
  ["¿Qué significa que una IA sea 'de propósito específico' (narrow AI)?", "Solo sabe hacer una tarea concreta", ["Puede hacer absolutamente cualquier cosa como un humano", "Solo existe en las películas", "Es más lenta que cualquier programa normal"], "🎯"],
  ["Un personaje de videojuego (NPC) que reacciona siempre igual ante la misma acción es…", "Un programa con reglas fijas", ["Siempre es IA muy avanzada", "Imposible de programar bien", "Pura magia inexplicable"], "🎮"],
];

const AI_HISTORY_EXPERTO: MC[] = [
  ["¿Qué propuso Alan Turing con su famosa prueba (Test de Turing)?", "Que es 'inteligente' si engaña a un humano al conversar", ["Que las máquinas nunca podrán pensar", "Un examen de matemáticas para robots", "Una forma de medir la velocidad de una computadora"], "🧪"],
  ["¿Qué diferencia hay entre IA 'estrecha' (narrow) e IA 'general' (AGI)?", "La estrecha resuelve una tarea; la general, cualquiera", ["Son exactamente lo mismo siempre", "La general es solo para videojuegos", "La estrecha es más nueva que la general"], "🌐"],
  ["¿Qué es un ALGORITMO en el contexto de la IA?", "Una serie de pasos para procesar datos", ["Un tipo de robot físico real", "Un error grave de programación", "Un tipo de virus informático"], "📋"],
  ["Toda la IA actual se basa principalmente en…", "Encontrar patrones en grandes cantidades de datos", ["Sentimientos y conciencia real propia", "Un tipo de magia digital", "Reglas escritas a mano para cada caso posible"], "📊"],
  ["¿Desde qué década existe el campo de estudio de la Inteligencia Artificial?", "Desde los años 1950", ["Desde los años 2010", "Desde los años 1800", "Desde el año 2000"], "🗓️", "El término se acuñó en una conferencia académica en 1956."],
];

// ── 2. Aprender de Ejemplos ───────────────────────────────────

const AI_CLASSIFY_FACIL: EMOJI3[] = [
  ["Le enseñas a un robot mostrándole frutas. ¿Cuál de estos ES una fruta?", "🍎", ["🚗", "👟"]],
  ["Le enseñas a un robot mostrándole animales. ¿Cuál de estos ES un animal?", "🐶", ["🪑", "📱"]],
  ["Le enseñas a un robot mostrándole vehículos. ¿Cuál de estos ES un vehículo?", "🚗", ["🍎", "🐶"]],
  ["Le enseñas a un robot mostrándole formas redondas. ¿Cuál de estos es REDONDO?", "⚽", ["🟥", "🔺"]],
];

const ML_BASICS_MC: MC[] = [
  ["¿Qué necesita una máquina para 'aprender' a reconocer gatos en fotos?", "Ver muchos ejemplos de fotos de gatos", ["Solo una foto de un gato", "Ninguna foto, ya lo sabe", "Un manual de instrucciones escrito a mano"], "🐱"],
  ["Mientras MÁS ejemplos buenos y variados tenga una IA para aprender, generalmente…", "Mejor aprende a reconocer cosas nuevas", ["Funciona mucho peor", "No cambia absolutamente nada", "Se rompe por completo"], "📈"],
  ["Si le enseñas a una IA a reconocer perros SOLO con fotos de perros pequeños, ¿qué puede pasar?", "Puede confundirse con un perro grande", ["Reconocerá perfecto cualquier perro", "Dejará de funcionar por completo", "Aprenderá a reconocer gatos en cambio"], "🐕"],
  ["¿Qué es un 'dato de entrenamiento'?", "Un ejemplo usado para enseñarle a la máquina", ["Un tipo de error grave", "El nombre del programador", "Un premio especial"], "📚"],
  ["Después de que una IA aprende, ¿cómo sabemos si aprendió bien?", "La probamos con ejemplos nuevos que nunca vio", ["Le preguntamos si se siente segura", "No hay ninguna forma de saberlo", "Esperamos que adivine bien"], "✅"],
];

const ML_DEEP_MC: MC[] = [
  ["¿Qué es 'sobreajuste' (overfitting)?", "Cuando la IA memoriza en vez de aprender", ["Cuando la IA es demasiado rápida", "Cuando hay muy pocos datos disponibles", "Cuando el programa pesa mucho"], "📦"],
  ["¿Por qué se separan los datos en 'entrenamiento' y 'prueba'?", "Para comprobar que aprendió patrones reales", ["Para que el programa ocupe menos espacio", "Es solo una tradición sin motivo", "Para que funcione más lenta"], "🧪"],
  ["¿Qué diferencia hay entre aprendizaje SUPERVISADO y NO supervisado?", "En el supervisado hay respuesta correcta; en el otro no", ["Son exactamente lo mismo siempre", "El no supervisado es siempre mejor", "El supervisado no usa ningún dato"], "🏷️"],
  ["Si entrenas una IA de contratación solo con datos históricos de un tipo de candidato, ¿qué riesgo corres?", "Que repita y amplifique ese sesgo", ["Ningún riesgo, los datos históricos son siempre neutrales", "Que la IA se vuelva más lenta", "Que deje de funcionar del todo"], "⚠️"],
];

const ML_EXPERTO_MC: MC[] = [
  ["¿Qué es un 'modelo' en Machine Learning?", "El resultado entrenado que hace predicciones", ["El programador que lo entrena", "El nombre oficial del proyecto", "Un tipo especial de computadora"], "🧮"],
  ["¿Qué mide la 'exactitud' (accuracy) de un modelo?", "Qué porcentaje de predicciones acierta", ["Qué tan rápido corre el programa", "Cuánta memoria RAM utiliza", "Cuántas líneas de código tiene"], "🎯"],
  ["¿Qué es una 'característica' (feature) en un modelo predictivo?", "Un dato de entrada usado para predecir", ["El resultado final que predice el modelo", "Un tipo de error grave", "El nombre completo del algoritmo"], "🔑"],
  ["¿Por qué es importante la calidad y diversidad de los datos de entrenamiento?", "Porque solo aprende lo que hay en esos datos", ["No importa, cualquier dato sirve igual", "Solo importa la cantidad, nunca la calidad", "Los datos no afectan el resultado final"], "🗂️"],
  ["¿Qué es el 'aprendizaje por refuerzo' (reinforcement learning)?", "Aprende probando acciones y recibiendo premios", ["Aprender copiando exactamente un libro de texto", "Un tipo especial de hardware", "Un examen final del propio modelo"], "🎮"],
];

// ── 3. El Cerebro Digital (redes neuronales) ──────────────────

const BRAIN_FACIL: EMOJI3[] = [
  ["¿Con qué parte de tu cuerpo PIENSAS?", "🧠", ["👃", "👂"]],
  ["Tu cerebro tiene millones de piezas conectadas llamadas neuronas. ¿Qué imagen se parece a una RED de conexiones?", "🕸️", ["🍎", "⚽"]],
  ["Las computadoras inteligentes copian la idea de las neuronas de tu cerebro. ¿Dónde están TUS neuronas?", "🧠", ["🦵", "👁️"]],
];

const NEURAL_MC: MC[] = [
  ["¿Qué es una 'red neuronal' en informática?", "Un programa inspirado en las neuronas del cerebro", ["Una red de internet más rápida", "Un cable especial de red", "Un tipo de virus informático"], "🕸️"],
  ["¿Qué hace cada 'neurona artificial' dentro de una red neuronal?", "Recibe, procesa y pasa información", ["Piensa exactamente como una persona", "Guarda fotos y videos", "Nada, son puramente decorativas"], "🔵"],
  ["Las redes neuronales se organizan en 'capas' (layers). ¿Qué significa esto?", "Grupos de neuronas conectadas en niveles", ["Un tipo especial de batería", "El color oficial de la pantalla", "El nombre de un lenguaje de programación"], "📚"],
  ["¿Para qué se usan las redes neuronales hoy en día?", "Reconocer imágenes, voces, traducir idiomas y más", ["Solamente para jugar ajedrez", "Solo para hacer cálculos simples", "No se usan en la vida real hoy"], "🌟"],
];

const NEURAL_DEEP_MC: MC[] = [
  ["En una red neuronal, ¿qué son los 'pesos' (weights)?", "Números que la red ajusta al aprender", ["El peso físico de la computadora", "La cantidad total de memoria usada", "El nombre propio de cada neurona"], "⚖️"],
  ["¿Qué pasa durante el 'entrenamiento' de una red neuronal?", "Ajusta sus pesos para reducir errores", ["Se conecta a internet por primera vez", "Se instala en una nueva computadora", "Cambia de nombre por completo"], "🏋️"],
  ["Una red con MUCHAS capas se llama…", "Red profunda (deep learning)", ["Una red superficial", "Una red totalmente rota", "Una red bastante antigua"], "🏔️"],
  ["¿Por qué las redes neuronales necesitan muchos datos y bastante poder de cómputo?", "Porque ajustan millones de números, probando mucho", ["Porque son puramente decorativas", "No es cierto, necesitan muy poco", "Solo por pura tradición"], "💻"],
];

const NEURAL_EXPERTO_MC: MC[] = [
  ["¿Qué es la 'función de activación' de una neurona artificial?", "Decide si la neurona se activa y pasa la señal", ["El botón físico de encendido", "El nombre técnico del modelo", "Un tipo de error de cálculo"], "⚡"],
  ["¿Qué es el entrenamiento por 'retropropagación' (backpropagation), en simple?", "Ajusta los pesos hacia atrás para mejorar", ["Un tipo grave de virus informático", "Copiar y pegar código de otra red", "Borrar la red y empezar de cero"], "🔄"],
  ["¿Qué es un modelo de lenguaje grande (LLM), como el que usan los chats de IA?", "Una red entrenada con enormes cantidades de texto", ["Una base de datos de respuestas escritas a mano", "Un diccionario tradicional impreso", "Un buscador clásico de internet"], "💬"],
  ["¿Los modelos de IA actuales 'entienden' de verdad lo que dicen, como una persona?", "No, solo reconocen patrones del lenguaje", ["Sí, entienden exactamente igual que un humano", "Sí, y además tienen sentimientos propios", "No se sabe, es un misterio total"], "🤔", "Reconocen patrones estadísticos, sin comprensión ni conciencia real — clave para usarlos con sentido crítico."],
];

// ── 4. Hablando con Máquinas (prompting) ──────────────────────

const TALK_FACIL: BIN[] = [
  ["Quieres que el asistente te ponga música. ¿Qué le dices?", "🎵 Por favor, pon música", "😤 ¡Dame música ya!"],
  ["El asistente no entendió lo que dijiste. ¿Qué haces?", "🗣️ Lo repito más claro", "😠 Le grito"],
  ["Le preguntas algo al asistente y te ayuda. ¿Qué le dices?", "🙏 Gracias", "🤐 Nada"],
];

const PROMPT_BASICS_MC: MC[] = [
  ["Para que un asistente de IA te entienda mejor, conviene…", "Hablar claro y decir qué necesitás", ["Hablar lo más rápido posible", "Usar palabras cualquiera al azar", "Susurrar bien bajito"], "🗣️"],
  ["Si le pides a una IA «cuéntame sobre animales» es una pregunta…", "Muy general, conviene ser más específico", ["Perfecta, no se puede mejorar", "Imposible de responder bien", "Demasiado corta para servir"], "🐾"],
  ["Dar ejemplos de lo que quieres a una IA generalmente…", "Ayuda a que entienda mejor lo que buscas", ["Confunde siempre a cualquier IA", "No cambia absolutamente nada", "Hace que la IA se apague"], "📝"],
  ["Si la respuesta de la IA no es lo que esperabas, lo mejor es…", "Reformular la pregunta con más detalles", ["Rendirse de inmediato sin más", "Repetir exactamente lo mismo una y otra vez", "Culpar siempre a la computadora"], "🔁"],
];

const PROMPT_DEEP_MC: MC[] = [
  ["¿Qué es un 'prompt' cuando usas una IA generativa?", "El texto que le das para pedir algo", ["El nombre de la empresa que la creó", "Un tipo de error del sistema", "La respuesta que da la IA"], "⌨️"],
  ["¿Por qué ayuda darle CONTEXTO a una IA (quién eres, para qué lo necesitas)?", "Porque adapta la respuesta a tu situación", ["No sirve de nada, la IA lo ignora siempre", "La hace más lenta sin beneficio", "Es obligatorio o no responde"], "🧩"],
  ["Pedirle a una IA 'explícalo como si tuviera 10 años' es un ejemplo de…", "Ajustar el nivel de la respuesta", ["Un simple error de tipeo", "Algo imposible de pedir bien", "Una falta grave de respeto"], "🎚️"],
  ["Si necesitas un formato específico (una lista, una tabla), ¿qué conviene hacer?", "Pedirlo explícitamente en el prompt", ["Es imposible, la IA elige el formato siempre", "No hace falta decir nada nunca", "Solo funciona algunos días de la semana"], "📋"],
];

const PROMPT_EXPERTO_MC: MC[] = [
  ["¿Qué es el 'prompt de sistema' (system prompt) en muchas IA de chat?", "Instrucciones previas al mensaje del usuario", ["El primer mensaje que escribe el usuario", "Un error grave del programa", "El nombre técnico de la respuesta"], "⚙️"],
  ["¿Qué significa dar 'ejemplos' (few-shot) dentro de un prompt?", "Mostrarle a la IA ejemplos del resultado esperado", ["Pedirle que adivine sin ninguna pista", "Un tipo de error de programación", "Reducir la cantidad de texto siempre"], "🎯"],
  ["Pedirle a una IA que 'piense paso a paso' antes de responder suele…", "Mejorar respuestas en problemas complejos", ["Empeorar siempre la respuesta final", "No tener ningún efecto real", "Hacer que deje de responder"], "🪜"],
  ["¿Qué es una 'alucinación' de una IA generativa?", "Información que suena segura pero es falsa", ["Un simple error de pantalla", "Cuando la IA se apaga sola", "Un tipo de virus informático"], "👻", "Por eso siempre conviene verificar datos importantes."],
  ["¿Qué controla el parámetro de 'temperatura' en muchos modelos generativos?", "Qué tan creativas son las respuestas", ["La temperatura física del procesador", "La velocidad de internet actual", "El idioma final de la respuesta"], "🌡️"],
];

// ── 5. ¿Real o Robot? (media literacy) ────────────────────────

const REAL_VS_FANTASY: EMOJI3[] = [
  ["¿Cuál de estos animales es de VERDAD?", "🐘", ["🦄", "🐉"]],
  ["¿Cuál de estos animales es de VERDAD?", "🐧", ["🧜", "🐲"]],
  ["¿Cuál de estas cosas es de VERDAD?", "🌙", ["🪄", "🧞"]],
];

const AI_DETECT_MC: MC[] = [
  ["¿Qué señal puede indicar que una imagen fue creada por IA?", "Detalles raros, como dedos de más", ["Que tenga muchos colores", "Que sea muy pequeña en tamaño", "Que tenga un marco decorado"], "✋"],
  ["Si ves una noticia sorprendente en internet, antes de creerla conviene…", "Buscar otras fuentes confiables", ["Compartirla de inmediato con todos", "Creerla porque tiene una foto", "Ignorarla siempre sin mirar"], "🔍"],
  ["¿Puede una IA crear videos o audios falsos de una persona diciendo algo que nunca dijo?", "Sí, se llaman 'deepfakes'", ["No, es totalmente imposible", "Solo en películas de ciencia ficción", "Solo con fotos, nunca con video"], "🎭"],
  ["¿Por qué es importante saber que algo fue hecho por IA?", "Para evaluarlo con sentido crítico", ["No importa en lo absoluto", "Solo importa si es gratuito", "Solo lo necesitan los programadores"], "🧠"],
];

const DEEPFAKE_MC: MC[] = [
  ["¿Qué es un 'deepfake'?", "Un video o audio falso generado con IA", ["Un tipo grave de virus informático", "Una cámara sumamente avanzada", "Un formato de archivo de imagen"], "🎭"],
  ["Si un texto suena muy convincente pero no cita ninguna fuente verificable, conviene…", "Investigar más antes de creerlo", ["Creerlo porque suena muy seguro", "Compartirlo igual, no importa", "Ignorarlo sin revisar nada"], "📰"],
  ["¿Qué es la 'procedencia' (provenance) de un contenido digital?", "De dónde viene y cómo fue modificado", ["El precio total del contenido", "El tamaño exacto del archivo", "El nombre del creador únicamente"], "🏷️"],
  ["¿Por qué las imágenes generadas por IA pueden tener errores en texto o manos?", "Porque aprendió patrones visuales generales", ["Porque siempre lo hacen a propósito", "Porque las cámaras usadas son viejas", "No es cierto, nunca tienen errores"], "🖐️"],
];

const MEDIA_LITERACY_EXPERTO: MC[] = [
  ["¿Qué es una 'marca de agua' (watermark) digital pensada para contenido de IA?", "Una señal para identificar contenido hecho con IA", ["Un efecto visual decorativo sin función", "Un tipo de compresión de archivos", "El nombre completo del autor humano"], "💧"],
  ["¿Por qué es difícil detectar con 100% de certeza si un texto fue escrito por IA?", "Porque el lenguaje generado es muy similar al humano", ["Es siempre muy trivial detectarlo", "Los textos de IA siempre tienen errores obvios", "No es difícil, hay una regla fija"], "🕵️"],
  ["Frente a contenido dudoso, la alfabetización mediática recomienda sobre todo…", "Verificar la fuente original antes de creer", ["Confiar siempre en lo primero que se ve", "Compartir rápido para avisar a todos", "Ignorar siempre cualquier noticia nueva"], "✅"],
  ["¿Qué riesgo social se menciona más sobre los deepfakes?", "Pueden usarse para desinformación o fraude", ["No tienen ningún riesgo real jamás", "Solo sirven para entretenimiento inofensivo", "Están prohibidos en todo el mundo"], "⚠️"],
];

// ── 6. IA Justa y Sabia (ética y sesgo) ───────────────────────

const FAIR_FACIL: BIN[] = [
  ["Un juego de la compu solo elige ganadores altos, nunca bajitos. ¿Es justo?", "😟 No es justo", "😊 Sí, está bien"],
  ["Una máquina debe tratar a todas las personas…", "⚖️ Por igual", "🙅 Distinto según le caigan bien"],
  ["Si un robot se equivoca, ¿puede pasar?", "✅ Sí, y hay que corregirlo", "🙅 No, las máquinas nunca se equivocan"],
];

const FAIR_MC: MC[] = [
  ["Si a una IA solo le muestras ejemplos de un tipo de persona, ¿qué puede pasar?", "Puede aprender a favorecer solo a ese tipo (sesgo)", ["Aprenderá a tratar a todos exactamente igual siempre", "No pasa nada, es imposible que se sesgue", "Dejará de funcionar del todo"], "⚖️"],
  ["¿Qué significa que una IA sea 'justa' (fair)?", "Que no trata peor a un grupo sin motivo", ["Que responde de forma muy rápida", "Que es totalmente gratis para todos", "Que nunca se actualiza jamás"], "🤝"],
  ["¿Puede una IA equivocarse o dar una respuesta incorrecta?", "Sí, ninguna IA es perfecta ni acierta siempre", ["No, nunca se equivoca jamás", "Solo se equivoca los fines de semana", "Solo las IA viejas se equivocan"], "❌"],
  ["Antes de confiar ciegamente en una decisión importante tomada por una IA (como un diagnóstico), conviene…", "Que una persona experta la revise también", ["Confiar siempre sin revisar nada", "Ignorar siempre lo que dice la IA", "No importa, da todo igual"], "👩‍⚕️"],
];

const BIAS_DEEP_MC: MC[] = [
  ["¿Qué es el SESGO (bias) en una IA?", "Cuando el sistema favorece injustamente a un grupo", ["Un tipo de error de conexión a internet", "La velocidad con la que responde", "El idioma que usa el sistema"], "⚖️"],
  ["Si una IA de contratación aprendió de datos históricos con poca diversidad, puede…", "Repetir y amplificar esa falta de diversidad", ["Corregir automáticamente cualquier injusticia pasada", "Ser siempre perfectamente neutral", "Dejar de funcionar por completo"], "💼"],
  ["¿Por qué es importante la PRIVACIDAD al usar herramientas de IA?", "Porque tus datos pueden usarse para entrenar sistemas", ["No es importante, la IA nunca guarda nada", "Solo importa para empresas grandes", "Es un tema exclusivo de programadores"], "🔐"],
  ["¿Qué significa que una IA sea 'transparente' o 'explicable'?", "Que se entiende por qué tomó una decisión", ["Que no tiene ningún costo real", "Que es invisible en la pantalla", "Que funciona sin electricidad"], "🔍"],
];

const ETHICS_EXPERTO_MC: MC[] = [
  ["¿Qué es la 'responsabilidad' (accountability) en sistemas de IA?", "Que quede claro quién responde por los errores", ["Que la IA se disculpe automáticamente", "Un tipo de garantía comercial únicamente", "No aplica a la IA, solo a personas"], "📜"],
  ["¿Por qué muchos países están creando REGULACIONES específicas para la IA?", "Para establecer límites legales sobre su uso", ["Porque quieren prohibir toda la tecnología", "No existen regulaciones sobre IA en ningún lugar", "Solo aplica a los videojuegos"], "⚖️"],
  ["¿Qué es un caso típico de uso ÉTICAMENTE riesgoso de la IA?", "Usarla para vigilancia masiva sin consentimiento", ["Usarla para corregir la ortografía", "Usarla para recomendar música nueva", "Usarla para traducir un menú de comida"], "👁️"],
  ["¿Qué papel debería tener SIEMPRE una persona humana en decisiones de IA de alto impacto (salud, justicia, empleo)?", "Supervisión y revisión final humana", ["Ningún papel, la IA decide sola siempre", "Solo revisar una vez por año", "Un papel decorativo sin autoridad real"], "🧑‍⚖️"],
];

// ── 7. IA en tu Vida (aplicaciones e impacto) ─────────────────

const AI_USES_FACIL: EMOJI3[] = [
  ["¿Qué usa IA para recomendarte qué ver después?", "📺", ["🪟", "🚪"]],
  ["¿Qué usa IA para traducir palabras a otro idioma?", "🌐", ["🪑", "🧸"]],
  ["¿Qué usa IA para escuchar y responder tus preguntas?", "🔊", ["🧦", "🥄"]],
  ["¿Qué usa IA para reconocer tu cara y desbloquearse?", "📱", ["🧱", "🥕"]],
];

const AI_FIELDS_MC: MC[] = [
  ["¿En qué área se usa la IA para ayudar a detectar enfermedades en radiografías?", "Medicina", ["Cocina", "Jardinería", "Costura"], "🏥"],
  ["¿Cómo ayuda la IA en los mapas y GPS?", "Calculando la ruta más rápida", ["Dibujando el mapa a mano lentamente", "Imprimiendo folletos turísticos", "No se usa nunca en mapas"], "🗺️"],
  ["Los videojuegos usan IA para…", "Que los personajes reaccionen más realista", ["Hacer que el juego pese menos siempre", "Cambiar el color de la pantalla", "Apagar la consola automáticamente"], "🎮"],
  ["¿Cómo se usa la IA en las redes sociales?", "Para recomendar contenido según tus gustos", ["Para cobrar la electricidad usada", "Para fabricar todos los celulares", "No se usa en redes sociales nunca"], "📱"],
];

const AI_IMPACT_MC: MC[] = [
  ["¿Cómo ayuda la IA en la agricultura moderna?", "Analizando imágenes de cultivos a tiempo", ["Reemplazando toda el agua de riego", "Solo sirve para decorar tractores", "No se usa nunca en agricultura"], "🌾"],
  ["¿Qué papel juega la IA en la traducción automática moderna?", "Aprende de millones de textos reales", ["Traduce palabra por palabra con un diccionario fijo", "Solo funciona con dos idiomas", "No mejora nunca con el tiempo"], "🌍"],
  ["Los autos con conducción asistida usan IA principalmente para…", "Interpretar cámaras y sensores en tiempo real", ["Solo tocar bocina automáticamente", "Cambiar el color del auto solo", "Encender la radio del auto"], "🚗"],
  ["¿Qué impacto puede tener la IA en el mundo laboral?", "Automatizar tareas y crear nuevos trabajos", ["No tiene ningún impacto en los empleos", "Elimina todos los empleos sin excepción", "Solo afecta a los programadores"], "💼"],
];

const AI_FUTURE_EXPERTO: MC[] = [
  ["¿Qué significa 'automatización' de tareas por IA en el mundo laboral actual?", "Que tareas repetitivas necesitan menos personas", ["Que todos los trabajos desaparecerán mañana", "Que solo afecta a las fábricas", "Que es ilegal en la mayoría de países"], "🤖"],
  ["¿Qué tipo de habilidades humanas suelen ser más difíciles de reemplazar por IA?", "Pensamiento crítico, creatividad y juicio ético", ["Ninguna, la IA puede reemplazar cualquier habilidad", "Solo las habilidades manuales básicas", "Solo las matemáticas avanzadas"], "🧠"],
  ["¿Por qué muchas empresas de salud usan IA como APOYO y no como reemplazo del médico?", "Porque la decisión final necesita juicio humano", ["Porque la IA nunca funciona en medicina", "Es solo una moda sin motivo real", "La ley lo prohíbe en todos los países"], "🩺"],
  ["¿Qué habilidad se vuelve más valiosa para trabajar CON herramientas de IA?", "Formular buenas preguntas y evaluar respuestas", ["Memorizar manuales completos enteros", "Evitar usar tecnología por completo", "Ninguna habilidad nueva es necesaria"], "🎯"],
];

// ── 8. Seguridad y Límites ─────────────────────────────────────

const SAFETY_AI_FACIL: BIN[] = [
  ["Un robot de un juego te dice algo raro. ¿Qué haces?", "🙋 Le cuento a un adulto", "🤐 Le creo todo sin preguntar"],
  ["El asistente de voz no sabe algo. ¿Está bien que se equivoque?", "✅ Sí, a veces se equivoca", "🙅 No, siempre tiene que saber todo"],
  ["Alguien te pide tu nombre completo por el chat de un juego. ¿Qué haces?", "🙋 Le pregunto a un adulto primero", "⌨️ Se lo cuento todo"],
];

const SAFETY_MC: MC[] = [
  ["¿Puede una IA de chat inventar información falsa que suena segura?", "Sí, se llama 'alucinación'", ["No, siempre dice la verdad", "Solo miente los fines de semana", "Solo pasa con IA muy antigua"], "👻"],
  ["Antes de confiar en un dato importante que te dio una IA (salud, dinero, tarea), conviene…", "Verificarlo en otra fuente confiable", ["Confiar siempre, sin ninguna duda", "Ignorarlo siempre sin más", "Compartirlo de inmediato sin revisar"], "🔍"],
  ["¿Es buena idea compartir contraseñas o datos personales con un chat de IA?", "No, nunca conviene compartir eso", ["Sí, siempre es totalmente seguro", "Solo si la IA lo pide amablemente", "No importa, nadie nunca lo ve"], "🔐"],
  ["¿Una IA 'entiende' tus sentimientos exactamente como lo haría un amigo humano?", "No, solo reconoce patrones en el texto", ["Sí, siente exactamente igual siempre", "Sí, y además recuerda todo para siempre", "No se puede saber nunca bien"], "💭"],
];

const HALLUCINATION_DEEP_MC: MC[] = [
  ["¿Qué es una 'alucinación' en un modelo de IA generativa?", "Una respuesta convincente pero inventada", ["Un error de la pantalla del celular", "Un tipo grave de virus informático", "Cuando la IA se apaga sola de repente"], "👻"],
  ["¿Por qué las IA generativas pueden alucinar datos, fechas o citas?", "Porque predicen texto probable sin verificar hechos", ["Lo hacen a propósito para engañar siempre", "Nunca sucede en la práctica real", "Solo pasa si el internet está lento"], "📊"],
  ["¿Qué significa 'sesgo de automatización' (confiar demasiado en la máquina)?", "Aceptar una respuesta de IA sin cuestionarla", ["Preferir siempre hacer las cosas a mano", "Un tipo grave de error de hardware", "No tiene ninguna relación con la IA"], "🤖"],
  ["Para decisiones importantes (médicas, legales, financieras), lo más responsable es…", "Usar la IA como apoyo, con revisión experta", ["Dejar que la IA decida sola siempre", "Nunca usar ninguna herramienta digital", "Elegir al azar entre lo que dice la IA"], "⚖️"],
];

const SAFETY_EXPERTO_MC: MC[] = [
  ["¿Qué se entiende por 'alineación' (alignment) de un sistema de IA?", "Que sus objetivos coincidan con los valores humanos", ["Que el texto esté centrado en la pantalla", "Que la IA sea más rápida que otras", "Un tipo de instalación de software"], "🎯"],
  ["¿Por qué los modelos actuales de IA generativa NO 'saben' si algo que dicen es verdadero?", "Porque generan la respuesta más probable, sin verificar", ["Porque están rotos casi siempre", "Porque no tienen memoria suficiente", "Porque no fueron entrenados en ningún idioma"], "🧩"],
  ["¿Qué rol cumple la SUPERVISIÓN HUMANA (human-in-the-loop) en sistemas de IA críticos?", "Revisar y poder frenar decisiones automatizadas", ["Ninguno, ralentiza todo sin beneficio", "Solo aplica a los robots físicos", "Es opcional y muy poco importante"], "🧑‍💻"],
  ["Al usar IA para tareas laborales o académicas, ¿qué buena práctica se recomienda?", "Revisar y hacerte responsable del resultado", ["Copiar y entregar la respuesta sin revisar nunca", "Nunca usar estas herramientas bajo ninguna circunstancia", "Confiar ciegamente porque es tecnología nueva"], "✅"],
];

export const AI_LEVELS: LevelDef[] = [
  {
    name: "¿Qué es la IA?",
    emoji: "🤖",
    desc: "Descubre qué hace que una máquina sea inteligente",
    tier: 1,
    gen: gen4(AI_THINKS_FACIL, AI_EXAMPLES_MC, AI_VS_AUTOMATION_MC, AI_HISTORY_EXPERTO),
  },
  {
    name: "Aprender de Ejemplos",
    emoji: "📚",
    desc: "Cómo aprende una máquina a partir de datos",
    tier: 1,
    gen: gen4(AI_CLASSIFY_FACIL, ML_BASICS_MC, ML_DEEP_MC, ML_EXPERTO_MC),
  },
  {
    name: "El Cerebro Digital",
    emoji: "🕸️",
    desc: "Redes neuronales, inspiradas en tu propio cerebro",
    tier: 2,
    gen: gen4(BRAIN_FACIL, NEURAL_MC, NEURAL_DEEP_MC, NEURAL_EXPERTO_MC),
  },
  {
    name: "Hablando con Máquinas",
    emoji: "💬",
    desc: "Cómo pedirle bien las cosas a una IA",
    tier: 2,
    gen: gen4(TALK_FACIL, PROMPT_BASICS_MC, PROMPT_DEEP_MC, PROMPT_EXPERTO_MC, "binary"),
  },
  {
    name: "¿Real o Robot?",
    emoji: "🎭",
    desc: "Distingue lo real de lo generado por IA",
    tier: 3,
    gen: gen4(REAL_VS_FANTASY, AI_DETECT_MC, DEEPFAKE_MC, MEDIA_LITERACY_EXPERTO),
  },
  {
    name: "IA Justa y Sabia",
    emoji: "⚖️",
    desc: "Sesgo, justicia y ética en la Inteligencia Artificial",
    tier: 3,
    gen: gen4(FAIR_FACIL, FAIR_MC, BIAS_DEEP_MC, ETHICS_EXPERTO_MC, "binary"),
  },
  {
    name: "IA en tu Vida",
    emoji: "🌍",
    desc: "Dónde está la IA hoy y cómo cambia el trabajo",
    tier: 2,
    gen: gen4(AI_USES_FACIL, AI_FIELDS_MC, AI_IMPACT_MC, AI_FUTURE_EXPERTO),
  },
  {
    name: "Seguridad y Límites",
    emoji: "🛡️",
    desc: "Lo que la IA NO sabe hacer, y cómo usarla con cabeza",
    tier: 3,
    gen: gen4(SAFETY_AI_FACIL, SAFETY_MC, HALLUCINATION_DEEP_MC, SAFETY_EXPERTO_MC, "binary"),
  },
];
