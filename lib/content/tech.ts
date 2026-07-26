import type { Difficulty, LevelDef, Question } from "../types";
import { sample, session, shuffle } from "./utils";

// ─────────────────────────────────────────────────────────────
// TECNOLOGÍA Y TELECOMUNICACIONES — materia nueva, 8 niveles.
// Fundamentos humanos (no técnicos) de cómo funciona la
// tecnología que usamos todos los días: qué pasa cuando mandás
// un mensaje, cómo viajan los datos en paquetes, qué son las
// ondas electromagnéticas, para qué sirven los protocolos, y
// cómo se mantiene todo seguro y conectado.
//   facil (Menores de 5)  → comparaciones simples con emojis:
//                           "¿esto sirve para comunicarse?",
//                           "¿se puede partir en pedacitos?".
//   normal / dificil / experto → conceptos reales y cada vez más
//                           profundos: redes, protocolos, ondas,
//                           seguridad y el mundo conectado —
//                           siempre explicados en términos
//                           humanos, sin jerga innecesaria.
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

// ── 1. Señales y Comunicación ──────────────────────────────────

const SIGNALS_FACIL: EMOJI3[] = [
  ["¿Cuál de estos usás para hablar con alguien que está lejos?", "📱", ["🪨", "🥄"]],
  ["Antes de los celulares, ¿qué usaba la gente para hablar por teléfono desde casa?", "☎️", ["🎈", "🧸"]],
  ["¿Cuál de estos recibe imágenes y sonidos que viajan por el aire?", "📺", ["🧦", "🥕"]],
  ["¿Cuál de estos NO sirve para comunicarte a distancia?", "🪨", ["📻"]],
  ["¿Cuál de estos manda tu voz a otra persona al instante?", "📞", ["👟", "🧺"]],
];

const SIGNALS_MC: MC[] = [
  ["¿Qué es 'comunicarse a distancia'?", "Mandar y recibir información sin estar juntos", ["Hablar siempre cara a cara, sin excepción", "Escribir una carta y no enviarla nunca", "Quedarte pensando sin decir nada"], "📡"],
  ["¿Qué tienen en común un teléfono, una radio y un televisor?", "Todos envían o reciben señales", ["Todos funcionan sin electricidad alguna", "Todos son exactamente del mismo color", "Ninguno necesita cables ni ondas nunca"], "📻"],
  ["¿Qué es una 'señal' en telecomunicaciones?", "Información que viaja de un lugar a otro", ["Un cartel de tránsito en la ruta", "Un tipo especial de antena", "Un error grave de conexión"], "📶"],
  ["¿Qué necesita un mensaje para llegar de un dispositivo a otro?", "Un medio para viajar, como cables u ondas", ["Nada, viaja completamente solo por magia", "Solamente necesita baterías cargadas", "Solamente necesita que esté lloviendo"], "🔌"],
  ["¿Por qué decimos que vivimos en un 'mundo conectado'?", "Porque la distancia ya casi no importa", ["Porque en el mundo todos usan el mismo idioma", "Porque ya no existen las distancias reales", "Porque todos vivimos en la misma ciudad"], "🌍"],
];

const SIGNALS_DIFICIL: MC[] = [
  ["¿Qué es un 'código' en el contexto de las telecomunicaciones?", "Una forma acordada de representar información", ["Un tipo de virus informático", "Un cable físico de red", "Un impuesto especial de telefonía"], "🔤"],
  ["¿Qué diferencia hay entre comunicación 'analógica' y 'digital'?", "La analógica es continua; la digital usa bits", ["Son exactamente lo mismo siempre", "La analógica siempre es más moderna", "La digital no usa electricidad nunca"], "📊"],
  ["¿Qué es el 'ancho de banda' de una conexión?", "Cuánta información se puede transmitir por segundo", ["El tamaño físico del cable de red", "El precio del servicio de internet", "La cantidad de dispositivos en la casa"], "📶"],
  ["¿Qué significa 'bit' en informática y telecomunicaciones?", "La unidad más chica de información: un 0 o un 1", ["Un tipo de virus informático grave", "Una antena pequeña de wifi", "Un cable delgado de red"], "0️⃣"],
  ["¿Por qué el teléfono, la radio y la TV cambiaron tanto con lo digital?", "Porque hay menos errores y se combina mejor", ["Porque dejaron de necesitar electricidad", "Porque se volvieron mucho más pesados", "Porque en realidad no cambió nada"], "🔄"],
];

const SIGNALS_EXPERTO: MC[] = [
  ["¿Por qué la digitalización mejoró tanto la calidad de las telecomunicaciones?", "Porque los errores se detectan y corrigen más fácil", ["Porque las señales digitales no viajan por el aire", "Porque eliminó toda la infraestructura necesaria", "Porque en realidad no hubo ninguna mejora"], "🔧"],
  ["¿Qué es la 'latencia' en una comunicación digital?", "El tiempo que tarda la señal en llegar", ["La cantidad de datos que se pueden enviar", "El precio total del servicio contratado", "El tipo de cable que se usa"], "⏱️"],
  ["¿Qué rol cumple la 'atenuación' de una señal en un cable o el aire?", "Es la pérdida de intensidad con la distancia", ["Es una mejora en la velocidad de transmisión", "Solo ocurre con las señales digitales", "No afecta en nada a las telecomunicaciones"], "📉"],
  ["¿Por qué toda comunicación necesita un acuerdo previo sobre la señal?", "Porque sin un formato común, los datos no se entienden", ["No hace falta ningún acuerdo previo", "Solo aplica a las cartas escritas a mano", "Es solo un mito sin base técnica real"], "🤝"],
];

// ── 2. El Viaje de un Mensaje ───────────────────────────────────

const MESSAGE_FACIL: BIN[] = [
  ["Cuando mandás un mensaje de texto, ¿llega a la otra persona casi al instante, aunque esté lejos?", "⚡ Sí, casi al instante", "🐌 No, tarda semanas"],
  ["Tu mensaje puede pasar por muchas computadoras antes de llegar a destino. ¿Está bien que pase por varios lugares en el camino?", "✅ Sí, así encuentra el mejor camino", "🙅 No, tiene que ir directo sin pasar por ningún lado"],
  ["Cuando mandás una foto por el celular, ¿se divide en pedacitos para viajar más rápido?", "🧩 Sí, se divide en partes", "🚫 No, viaja entera de una sola vez"],
];

const MESSAGE_MC: MC[] = [
  ["Cuando enviás un email, ¿a dónde va primero desde tu dispositivo?", "A un servidor de correo que lo redirige", ["Directamente a la pantalla del destinatario", "Se queda guardado solo en tu celular", "Vuelve automáticamente hacia vos"], "📧"],
  ["¿Qué es un 'servidor'?", "Una computadora que guarda y entrega información", ["Un tipo especial de antena de celular", "Un cable submarino de telefonía", "Un programa para editar fotos"], "🖥️"],
  ["¿Por qué un mensaje puede llegar a otra parte del mundo en segundos?", "Porque viaja como señales eléctricas o de luz", ["Porque un avión lo transporta físicamente", "Porque las distancias en internet no existen", "Porque alguien lo copia a mano muy rápido"], "🌐"],
  ["Cuando mandás un mensaje, ¿pasa siempre por el mismo camino exacto?", "No siempre: la red elige la ruta más conveniente", ["Sí, siempre el mismo camino exacto", "No, cada mensaje da la vuelta al mundo entero", "Los mensajes no siguen ningún camino"], "🛤️"],
  ["¿Qué necesita tu mensaje para llegar a la persona correcta?", "Una dirección única que identifique al destinatario", ["Nada, se reparte al azar entre todos", "Alcanza solo con el nombre de la persona", "Necesita un dibujo especial adjunto"], "🎯"],
];

const MESSAGE_DIFICIL: MC[] = [
  ["Tu mensaje pasa por puntos intermedios que eligen el mejor camino. ¿Cómo se llaman?", "Routers (enrutadores)", ["Antenas satelitales únicamente", "Solamente cables submarinos", "Servidores de nombres de dominio"], "🔀"],
  ["¿Qué es un servidor DNS y para qué sirve al mandar un mensaje?", "Traduce nombres como 'gmail.com' a su dirección IP", ["Guarda copias de seguridad de fotos", "Es el nombre técnico de un cable óptico", "Filtra automáticamente el spam"], "📇"],
  ["¿Por qué un video tarda más en enviarse que un texto corto?", "Porque contiene muchos más datos para transmitir", ["Porque los videos usan un camino distinto", "Porque el texto no necesita usar internet", "No hay ninguna diferencia real de tiempo"], "🎥"],
  ["¿Qué pasa si un pedacito de tu mensaje se pierde o llega dañado?", "El sistema detecta el error y pide reenviarlo", ["El mensaje completo desaparece sin aviso", "No pasa nada, se ignora ese error", "Se envía un mensaje completamente distinto"], "🔁"],
  ["¿Qué significa que internet funcione de forma 'descentralizada'?", "Que si una ruta falla, los datos toman otro camino", ["Que solamente funciona en un país", "Que cada mensaje necesita un permiso especial", "Que no existen computadoras que lo compongan"], "🕸️"],
];

const MESSAGE_EXPERTO: MC[] = [
  ["¿Qué protocolo divide tu mensaje en partes y confirma que lleguen?", "TCP (Protocolo de Control de Transmisión)", ["HTML, el lenguaje de las páginas web", "USB, el conector de dispositivos", "Bluetooth, la conexión sin cables"], "📦"],
  ["¿Qué diferencia hay entre el protocolo TCP y el protocolo UDP?", "TCP confirma cada parte; UDP es más rápido", ["Son exactamente lo mismo en la práctica", "UDP siempre es más confiable que TCP", "TCP directamente no se usa en internet"], "⚡"],
  ["¿Por qué cada 'salto' entre routers añade una pequeña demora?", "Porque cada router lee y reenvía el paquete", ["Porque cada router cobra un pequeño peaje", "Porque cada router traduce a un idioma humano", "No añade ninguna demora real al viaje"], "⏳"],
  ["¿Qué es un 'protocolo de aplicación', como SMTP para el correo?", "Reglas que definen cómo formatear cierto mensaje", ["El nombre comercial de un proveedor de internet", "Un tipo particular de cable físico", "Un virus que afecta al correo electrónico"], "✉️"],
];

// ── 3. Paquetes de Datos ───────────────────────────────────────

const PACKETS_FACIL: BIN[] = [
  ["Si tenés que mandar una caja muy grande por correo, ¿es más fácil mandarla entera o partirla en cajas más chicas?", "📦📦📦 Partirla en cajas más chicas", "📦 Mandarla entera sin dividir"],
  ["Cuando mandás una foto grande por el celular, la información se divide en pedacitos que viajan por separado. ¿Se vuelven a unir al llegar?", "🧩 Sí, se reordenan y se unen", "🚫 No, quedan separados para siempre"],
  ["Si un pedacito de tu mensaje se pierde en el camino, ¿se puede pedir que lo reenvíen?", "🔁 Sí, se puede reenviar", "😢 No, el mensaje se pierde para siempre"],
];

const PACKETS_MC: MC[] = [
  ["¿Qué es un 'paquete de datos'?", "Un pedacito de información con su propia dirección", ["Una caja física que se envía por correo", "Un tipo de virus informático", "El nombre de una aplicación cualquiera"], "📦"],
  ["¿Por qué se divide la información en paquetes?", "Para que viaje mejor y tome distintos caminos", ["Porque así ocupa más espacio en el celular", "Porque es obligatorio por alguna ley", "Para que tarde mucho más en llegar"], "🧩"],
  ["¿Qué información lleva cada paquete, además del contenido?", "Su dirección de origen, destino y su lugar", ["Solo el nombre completo del remitente", "Nada más que un montón de ceros", "Únicamente el precio del envío"], "🏷️"],
  ["¿Los paquetes llegan siempre en el mismo orden en que se enviaron?", "No siempre: pueden llegar desordenados", ["Sí, siempre llegan perfectamente en orden", "Nunca llegan, se pierden absolutamente todos", "Llegan todos exactamente al mismo tiempo"], "🔢"],
  ["¿Qué pasa si un paquete de datos se pierde en el camino?", "Se puede pedir que se reenvíe ese paquete", ["Todo el mensaje se cancela para siempre", "No se nota ninguna diferencia real", "El resto de los paquetes también se borran"], "🔁"],
];

const PACKETS_DIFICIL: MC[] = [
  ["¿Cómo se llama dividir la información en paquetes para transmitirla?", "Conmutación de paquetes (packet switching)", ["Conmutación exclusiva de circuitos", "Transmisión puramente analógica", "Cifrado de extremo a extremo"], "🔀"],
  ["¿Qué ventaja tiene la conmutación de paquetes frente a una línea fija?", "Muchos usuarios comparten la red con eficiencia", ["Hace que cada llamada sea más costosa", "Impide que dos mensajes viajen a la vez", "Elimina la necesidad de direcciones"], "🌐"],
  ["¿Qué contiene el 'encabezado' (header) de un paquete de datos?", "Origen, destino y su número de secuencia", ["El contenido completo, sin ningún dato extra", "Solamente publicidad del proveedor", "El nombre del proveedor de internet"], "📋"],
  ["¿Por qué es importante el 'número de secuencia' de cada paquete?", "Permite reordenar los paquetes al llegar", ["Sirve solo para contar cuántos mensajes mandaste", "No tiene ninguna función real", "Es simplemente el precio del paquete"], "🔢"],
];

const PACKETS_EXPERTO: MC[] = [
  ["¿Qué capa del modelo de redes divide los datos y los enruta?", "La capa de red (IP, en el modelo TCP/IP)", ["La capa física exclusivamente", "La capa de aplicación del modelo", "El disco duro del dispositivo"], "🗂️"],
  ["¿Qué es la 'unidad máxima de transmisión' (MTU) en una red?", "El tamaño máximo posible de un paquete", ["La cantidad máxima de usuarios conectados", "El precio máximo de un plan de datos", "La velocidad máxima permitida por ley"], "📏"],
  ["¿Por qué el 'packet switching' fue clave en el diseño de internet?", "La red seguía funcionando aunque algo fallara", ["Porque era más barato de instalar en 1960", "Porque impedía cualquier error de transmisión", "No tuvo ninguna ventaja real en su momento"], "🕸️"],
  ["¿Qué función cumple el checksum incluido en muchos paquetes?", "Detecta si el paquete se corrompió en el viaje", ["Cifra el contenido para que nadie lo lea", "Acelera bastante la velocidad de conexión", "Identifica siempre al usuario que lo envió"], "✅"],
];

// ── 4. Ondas Electromagnéticas ──────────────────────────────────

const WAVES_FACIL: BIN[] = [
  ["La luz del sol viaja hasta la Tierra sin cables, a través del espacio vacío. ¿Puede viajar información de forma parecida, sin cables?", "📡 Sí, mediante ondas invisibles", "🔌 No, siempre necesita un cable"],
  ["El wifi de tu casa conecta el celular sin ningún cable. ¿Usa ondas invisibles para hacerlo?", "📶 Sí, usa ondas de radio", "🧶 No, usa un hilo invisible"],
  ["¿Podés ver las ondas de wifi o de tu celular a simple vista?", "👁️‍🗨️ No, son invisibles para el ojo humano", "👀 Sí, se ven como una luz de color"],
];

const WAVES_MC: MC[] = [
  ["¿Qué son las ondas electromagnéticas?", "Energía que viaja por el espacio sin aire", ["Un tipo de cable especial de red", "Un programa de computadora cualquiera", "Un tipo particular de batería"], "📡"],
  ["¿Qué tienen en común la luz, el wifi y las ondas de radio?", "Son ondas electromagnéticas de distinta frecuencia", ["No tienen absolutamente nada en común", "Todas necesitan cables para poder viajar", "Solo existen dentro de un router"], "🌈"],
  ["¿Cómo viaja la señal de wifi del router hasta tu celular?", "Por ondas de radio invisibles en el aire", ["A través de un cable invisible", "Por medio de un sonido audible", "No viaja, ya está en el celular"], "📶"],
  ["¿Por qué el wifi se debilita si hay muchas paredes de por medio?", "Porque las ondas pierden energía al chocar", ["Porque las paredes cambian de color", "Porque el wifi se apaga solo de repente", "No tiene ninguna relación con las paredes"], "🧱"],
  ["¿Qué usa el control remoto de tu televisor para funcionar?", "Ondas infrarrojas, invisibles al ojo humano", ["Un sonido muy fuerte y agudo", "Un imán bastante potente", "Solo electricidad estática"], "📺"],
];

const WAVES_DIFICIL: MC[] = [
  ["¿Qué determina que una onda se use para wifi, radio FM o luz?", "Su frecuencia dentro del espectro electromagnético", ["El color del dispositivo que la emite", "El precio del servicio contratado", "La marca del fabricante del aparato"], "📊"],
  ["¿Qué es el 'espectro electromagnético'?", "Todo el rango de frecuencias posibles de ondas", ["Un tipo de cable de fibra óptica", "El nombre de una empresa de telecomunicaciones", "Un programa para editar señales"], "🌈"],
  ["¿Por qué los gobiernos regulan qué frecuencias usa cada servicio?", "Para que las señales no se interfieran entre sí", ["Porque las ondas se gastan si se usan mucho", "Es solo una formalidad sin efecto técnico", "Porque las ondas tienen un color específico"], "📋"],
  ["¿Qué ventaja tienen las frecuencias más altas, como algunas de 5G?", "Más datos por segundo pero menos distancia", ["Siempre llegan mucho más lejos que las bajas", "No tienen ninguna diferencia práctica real", "Solo sirven para las radios AM"], "📶"],
  ["¿Qué es la 'interferencia' entre señales electromagnéticas?", "Cuando dos ondas se superponen y se afectan", ["Un tipo de virus informático grave", "Un cable roto físicamente en algún punto", "Un problema exclusivo de la fibra óptica"], "〰️"],
];

const WAVES_EXPERTO: MC[] = [
  ["¿Qué relación hay entre frecuencia y longitud de onda?", "Son inversamente proporcionales entre sí", ["Son siempre exactamente iguales", "No tienen ninguna relación entre sí", "La longitud de onda depende del clima"], "🧮"],
  ["¿Por qué las ondas electromagnéticas viajan por el vacío del espacio?", "No necesitan un medio material para viajar", ["Porque son mucho más lentas que el sonido", "Porque el espacio tiene aire suficiente", "En realidad no pueden viajar por el vacío"], "🌌"],
  ["¿Qué es la 'modulación' de una señal en radio, wifi y telefonía?", "Variar una propiedad de la onda para codificar", ["Un tipo particular de antena física", "Un impuesto sobre las telecomunicaciones", "El nombre de un cable submarino"], "🎛️"],
  ["¿Por qué algunas frecuencias muy altas de 5G necesitan tantas antenas?", "Se atenúan rápido y alcanzan poca distancia", ["Porque son ondas de sonido, no electromagnéticas", "Porque cada antena emite un color distinto", "En realidad alcanzan más distancia que las bajas"], "📡"],
];

// ── 5. Redes e Internet ─────────────────────────────────────────

const NET_FACIL: BIN[] = [
  ["Cada casa tiene una dirección para que le lleguen las cartas. ¿Cada dispositivo conectado a internet también tiene una dirección propia?", "🏠 Sí, se llama dirección IP", "🚫 No, todos comparten la misma"],
  ["Internet conecta millones de computadoras en todo el mundo. ¿Es una sola computadora gigante?", "🌐 No, es una red de muchísimas computadoras conectadas", "💻 Sí, es una sola computadora enorme"],
  ["Para usar internet en casa, ¿hace falta algún tipo de conexión, como cable, wifi o datos móviles?", "🔌 Sí, siempre hace falta algún tipo de conexión", "🪄 No, funciona sin ningún tipo de conexión"],
];

const NET_MC: MC[] = [
  ["¿Qué es internet?", "Una red global de millones de computadoras", ["Un solo programa instalado en tu celular", "Una empresa que fabrica computadoras", "Un tipo de cable bien específico"], "🌐"],
  ["¿Qué es una 'dirección IP'?", "Un número único que identifica a un dispositivo", ["El nombre de usuario de tus redes sociales", "El precio de tu plan de internet", "El nombre del wifi de tu casa"], "🔢"],
  ["¿Qué es un 'router' (enrutador)?", "Dirige los datos entre redes por el mejor camino", ["Un tipo de virus informático grave", "Una aplicación cualquiera para chatear", "El cable que llega hasta tu casa"], "📡"],
  ["¿Qué es un 'ISP' o proveedor de internet?", "La empresa que te da acceso a internet", ["Un tipo de aplicación de mensajería", "Un dispositivo que mide tu velocidad de wifi", "Un antivirus para tu computadora"], "🏢"],
  ["¿Por qué necesitás contraseña para conectarte a algunas redes wifi?", "Para que solo gente autorizada use esa red", ["Es solo una formalidad sin ningún propósito", "Para que la señal sea mucho más fuerte", "Para que el router se caliente menos"], "🔐"],
];

const NET_DIFICIL: MC[] = [
  ["¿Qué diferencia hay entre una red 'LAN' y una 'WAN' como internet?", "La LAN es local; la WAN conecta redes distantes", ["Son exactamente lo mismo en la práctica", "La LAN siempre es más rápida que cualquier WAN", "La WAN solo existe dentro de una oficina"], "🏢"],
  ["¿Qué es un 'servidor DNS' y qué función cumple?", "Traduce nombres de dominio a direcciones IP", ["Guarda copias de seguridad automáticas", "Filtra los virus de los correos entrantes", "Acelera la velocidad general del wifi"], "📇"],
  ["¿Qué significa que dos dispositivos se comuniquen 'punto a punto'?", "Intercambian datos sin un servidor intermediario", ["Que usan solamente cables de fibra óptica", "Que siempre necesitan un servidor central", "Que solo funciona con wifi, nunca con datos"], "🔗"],
  ["¿Qué es un 'firewall' (cortafuegos)?", "Filtra el tráfico y bloquea conexiones peligrosas", ["Un cable resistente al fuego real", "Un tipo de antena de mucha potencia", "Un programa cualquiera para ver videos"], "🧱"],
  ["¿Por qué muchas casas usan un router wifi además del cable de calle?", "Para repartir la conexión entre varios aparatos", ["Porque el cable no puede entrar a los edificios", "Porque el router genera electricidad propia", "No cumple ninguna función real en la casa"], "📶"],
];

const NET_EXPERTO: MC[] = [
  ["¿Qué es el modelo TCP/IP y por qué es la base técnica de internet?", "Protocolos en capas que empaquetan y enrutan", ["Es el nombre comercial de un proveedor", "Es un tipo particular de cable óptico", "Es un antivirus para computadoras"], "🗂️"],
  ["¿Por qué se creó IPv6 si ya existía IPv4?", "Porque las direcciones IPv4 empezaron a agotarse", ["Son exactamente el mismo protocolo con otro nombre", "IPv4 es en realidad más nuevo que IPv6", "IPv6 solo funciona con cables, nunca con wifi"], "🔢"],
  ["¿Qué función cumple un 'proxy' en una red?", "Actúa de intermediario entre un aparato e internet", ["Es un tipo de virus que roba contraseñas", "Aumenta la velocidad de la luz de las ondas", "Es el nombre de un cable submarino"], "🔀"],
  ["¿Por qué se dice que internet fue diseñado para ser 'resiliente'?", "Los datos pueden tomar otra ruta si una falla", ["Porque nunca tuvo ninguna falla desde su creación", "Porque un solo servidor controla todo el tráfico", "Porque se diseñó solo para uso militar"], "🕸️"],
];

// ── 6. Protocolos: El Idioma de las Máquinas ────────────────────

const PROTOCOLS_FACIL: BIN[] = [
  ["Si dos personas hablan idiomas distintos, ¿pueden entenderse fácilmente sin ponerse de acuerdo antes?", "🤝 No, necesitan un idioma en común", "🗣️ Sí, siempre se entienden igual"],
  ["Las computadoras también necesitan 'ponerse de acuerdo' en cómo hablarse para entenderse. ¿Eso tiene un nombre?", "📜 Sí, se llama protocolo", "🙅 No, hablan cualquier idioma al azar"],
  ["Cuando ves 'https' antes de una dirección web, ¿significa que la conexión está más protegida?", "🔒 Sí, esa 's' indica una conexión segura", "🔓 No, no significa nada"],
];

const PROTOCOLS_MC: MC[] = [
  ["¿Qué es un 'protocolo' en informática?", "Reglas acordadas para que dos aparatos se entiendan", ["Un tipo de virus informático grave", "Un cable especial de red", "El nombre de una app de mensajería"], "📜"],
  ["¿Para qué sirve el protocolo HTTP?", "Define cómo tu navegador pide páginas web", ["Sirve para mandar mensajes de texto", "Es el nombre de una antena de wifi", "Sirve solamente para grabar videos"], "🌐"],
  ["¿Qué significa la 's' extra en 'https'?", "Que la conexión está cifrada y es más segura", ["Que la página carga mucho más lenta", "Que la página tiene más publicidad", "No significa absolutamente nada especial"], "🔒"],
  ["¿Qué protocolo usan muchos programas para enviar emails?", "SMTP, entre otros protocolos de correo", ["HTML, el lenguaje de las páginas web", "USB, el conector físico", "Bluetooth, la conexión sin cables"], "📧"],
  ["¿Por qué es importante que todos usen los mismos protocolos?", "Para que cualquier aparato se comunique con otro", ["No es importante, cada aparato inventa el suyo", "Solo importa dentro de una misma empresa", "Es solo tradición sin efecto práctico real"], "🤝"],
];

const PROTOCOLS_DIFICIL: MC[] = [
  ["¿Qué protocolo divide los datos en paquetes y confirma su entrega?", "TCP (Protocolo de Control de Transmisión)", ["HTTP, usado solo para páginas web", "DNS, el que traduce nombres de dominio", "Wifi, la conexión inalámbrica"], "📦"],
  ["¿Qué protocolo traduce nombres de dominio en direcciones IP?", "DNS (Sistema de Nombres de Dominio)", ["FTP, usado para transferir archivos", "SMTP, usado para enviar correos", "Bluetooth, la conexión sin cables"], "📇"],
  ["¿Qué protocolo se usa para transferir archivos entre computadoras?", "FTP (Protocolo de Transferencia de Archivos)", ["HTTP, usado solo para páginas web", "DNS, el que traduce dominios en IP", "SMTP, usado para enviar correos"], "📁"],
  ["¿Por qué existen protocolos distintos para tareas distintas?", "Porque cada tarea necesita algo diferente", ["Porque las empresas quieren complicar todo", "No hay ninguna razón técnica real detrás", "Porque cada país usa un protocolo distinto"], "🧩"],
  ["¿Qué capa de HTTPS se encarga de cifrar la comunicación?", "TLS/SSL, una capa de seguridad extra", ["El propio HTML de la página web", "El router del wifi de tu casa", "El teclado físico del dispositivo"], "🔐"],
];

const PROTOCOLS_EXPERTO: MC[] = [
  ["¿Qué es el 'protocolo de enlace' (handshake) al iniciar HTTPS?", "Cliente y servidor acuerdan cómo cifrar la conexión", ["Un saludo simbólico sin función técnica", "Un tipo particular de error de conexión", "Un protocolo exclusivo del correo electrónico"], "🤝"],
  ["¿Qué diferencia práctica hay entre TCP y UDP en una videollamada?", "UDP prioriza velocidad; TCP la entrega completa", ["Son exactamente iguales en todo sentido", "TCP siempre es mejor para cualquier transmisión", "UDP no se usa nunca en telecomunicaciones"], "🎥"],
  ["¿Por qué los protocolos de internet están organizados 'en capas'?", "Cada capa resuelve un problema por separado", ["Porque así el cable físico pesa menos", "Es solo una forma de dibujar diagramas", "Cada capa representa un país distinto"], "🗂️"],
  ["¿Qué ventaja aporta que un protocolo sea un 'estándar abierto'?", "Cualquier fabricante puede implementarlo", ["Solo una empresa puede usarlo legalmente", "Vuelve la conexión automáticamente más lenta", "Impide que se actualice con el tiempo"], "🌍"],
];

// ── 7. Seguridad y Privacidad Digital ───────────────────────────

const SECURITY_FACIL: BIN[] = [
  ["¿Está bien compartir tu contraseña con cualquier persona que te la pida?", "🙅 No, la contraseña es solo tuya", "🔓 Sí, no hay problema"],
  ["Ves un candadito 🔒 en la barra del navegador cuando entrás a una página. ¿Eso indica que la conexión es más segura?", "🔒 Sí, indica una conexión más protegida", "🚪 No, no significa nada"],
  ["Si un mensaje te pide tus datos personales de forma rara y sospechosa, ¿qué es mejor hacer?", "🙋 Preguntarle a un adulto antes de responder", "⌨️ Responder todo sin dudar"],
];

const SECURITY_MC: MC[] = [
  ["¿Qué es una contraseña 'segura'?", "Una combinación larga y difícil de adivinar", ["Cualquier palabra corta y fácil de recordar", "El mismo número para todas tus cuentas", "No hace falta que sea difícil de adivinar"], "🔑"],
  ["¿Qué es el 'cifrado' de la información?", "Convertir los datos en un código secreto", ["Borrar la información por completo", "Hacer una copia extra sin ningún cambio", "Enviar el mensaje mucho más rápido"], "🔐"],
  ["¿Por qué es más seguro comprar en una web con 'https'?", "Porque tus datos viajan cifrados y protegidos", ["Porque esas páginas nunca tienen errores", "No hay ninguna diferencia real entre ambas", "Porque siempre son mucho más baratas"], "🛒"],
  ["¿Qué es un antivirus?", "Detecta y bloquea programas maliciosos", ["Un tipo de cable especial de red", "Una aplicación cualquiera para editar fotos", "Un protocolo más de internet"], "🛡️"],
  ["¿Por qué conviene usar contraseñas distintas para cada cuenta?", "Para que una cuenta filtrada no afecte a las demás", ["No hay ninguna razón, da igual repetirla", "Porque es obligatorio por ley en todo el mundo", "Porque las contraseñas se gastan con el uso"], "🔑"],
];

const SECURITY_DIFICIL: MC[] = [
  ["¿Qué es el 'cifrado de extremo a extremo' de apps como WhatsApp?", "Solo el emisor y el receptor leen el mensaje", ["Un cifrado que protege solamente el wifi", "Un tipo cualquiera de compresión de archivos", "Un protocolo exclusivo para videollamadas"], "🔐"],
  ["¿Qué es un ataque de 'phishing'?", "Engañar haciéndose pasar por algo confiable", ["Un tipo de virus que daña solo el hardware", "Una técnica cualquiera para acelerar el wifi", "Un protocolo oficial más de seguridad"], "🎣"],
  ["¿Qué es la 'autenticación en dos pasos' (2FA)?", "Pide una segunda confirmación además de la clave", ["Un tipo de contraseña bastante más corta", "Una forma de compartir tu clave con más gente", "Un protocolo exclusivo de correo electrónico"], "📲"],
  ["¿Por qué usar wifi público sin contraseña puede ser riesgoso?", "Otros en la misma red pueden ver tu tráfico", ["No representa ningún riesgo real ni menor", "Porque el wifi público siempre es más lento", "Porque cobra un impuesto extra automático"], "📶"],
  ["¿Qué es una VPN (red privada virtual)?", "Cifra tu conexión y oculta tu tráfico de red", ["Un tipo de antivirus exclusivo para celulares", "Un protocolo cualquiera para enviar correos", "Un cable de red físico bastante especial"], "🕵️"],
];

const SECURITY_EXPERTO: MC[] = [
  ["¿Qué es la 'criptografía de clave pública' usada en HTTPS?", "Cada usuario tiene clave pública y privada", ["Todos comparten la misma clave secreta", "Un tipo de contraseña más corta de lo normal", "Un protocolo exclusivo de redes wifi domésticas"], "🔑"],
  ["¿Qué es un 'certificado digital' (SSL/TLS) en una web segura?", "Verifica que el servidor es quien dice ser", ["Es un documento legal sin relación con la tecnología", "Es el nombre técnico de un antivirus", "Sirve solamente para acelerar la conexión"], "📜"],
  ["¿Por qué conviene mantener actualizado el software de tus dispositivos?", "Corrige fallas de seguridad recién descubiertas", ["Cambia solamente el color de la interfaz", "No tiene ninguna relación con la seguridad", "Hace que el dispositivo pese bastante menos"], "🔄"],
  ["¿Qué principio da a cada usuario solo los permisos mínimos necesarios?", "El principio de 'mínimo privilegio'", ["El principio de máxima velocidad posible", "El principio de código abierto obligatorio", "El principio de contraseña única para todos"], "🔒"],
];

// ── 8. El Mundo Conectado ───────────────────────────────────────

const WORLD_FACIL: BIN[] = [
  ["Cuando hablás por videollamada con alguien en otro país, ¿la señal puede viajar por cables debajo del mar?", "🌊 Sí, existen cables submarinos gigantes", "🚫 No, es imposible que pase por el mar"],
  ["Los satélites que orbitan la Tierra, ¿pueden ayudar a enviar señales de un lado del planeta a otro?", "🛰️ Sí, algunos sirven para comunicaciones", "🚫 No, solo sirven para sacar fotos"],
  ["Hoy en día, muchos aparatos de la casa, como heladeras o lamparitas, se pueden conectar a internet. ¿Puede pasar eso?", "💡 Sí, se llaman dispositivos inteligentes conectados", "🚫 No, solo las computadoras se conectan a internet"],
];

const WORLD_MC: MC[] = [
  ["¿Cómo viaja gran parte de la información entre continentes?", "Por largos cables de fibra óptica bajo el mar", ["Únicamente a través de satélites", "Por avión, en discos físicos", "No existe conexión real entre continentes"], "🌊"],
  ["¿Qué es la 'fibra óptica'?", "Un cable que transmite luz muy rápido y lejos", ["Un tipo de antena de celular", "Un cable que transmite solo electricidad", "Un programa cualquiera de computadora"], "💡"],
  ["¿Para qué sirven los satélites de comunicación?", "Llevan señal a lugares remotos sin cables", ["Solo para sacar fotos del espacio", "Solo para predecir el estado del clima", "No tienen relación con las telecomunicaciones"], "🛰️"],
  ["¿Qué es 'la nube' (cloud) donde guardás fotos y archivos?", "Servidores de otras empresas en distintos lugares", ["Un espacio físico dentro de tu celular", "Una nube real que está en el cielo", "Un tipo de virus informático"], "☁️"],
  ["¿Qué significa que una heladera o lamparita sea 'inteligente'?", "Envía y recibe datos, y se controla a distancia", ["Que piensa exactamente como una persona", "Que ya no necesita electricidad", "Que funciona sin ningún control humano"], "💡"],
];

const WORLD_DIFICIL: MC[] = [
  ["¿Qué son las redes '4G' y '5G' en la telefonía celular?", "Generaciones de tecnología móvil cada vez más rápidas", ["Marcas específicas de celulares", "Un tipo de wifi doméstico exclusivo", "Nombres de aplicaciones de mensajería"], "📶"],
  ["¿Por qué 5G conecta muchos más dispositivos que las redes anteriores?", "Usa más frecuencias y reparte mejor la capacidad", ["Porque elimina la necesidad de antenas", "Porque solamente funciona de noche", "No hay ninguna diferencia real de capacidad"], "📡"],
  ["¿Qué es el 'Internet de las Cosas' (IoT)?", "Objetos cotidianos conectados que intercambian datos", ["Un tipo exclusivo de videojuego", "Un protocolo solo para computadoras de escritorio", "Un sistema operativo de celulares"], "🌐"],
  ["¿Qué ventaja ofrece guardar archivos 'en la nube'?", "Accedés desde cualquier aparato sin perderlos", ["Ocupan más espacio físico en tu casa", "Solamente se pueden abrir una vez", "Es exactamente igual que guardarlos local"], "☁️"],
  ["¿Qué son los 'centros de datos' que sostienen internet y la nube?", "Instalaciones con miles de servidores activos siempre", ["Pequeñas antenas instaladas en los techos", "Un tipo particular de cable submarino", "Oficinas donde solo se venden celulares"], "🏢"],
];

const WORLD_EXPERTO: MC[] = [
  ["¿Por qué la mayoría del tráfico intercontinental va por cables submarinos?", "Ofrecen mucha más capacidad y menor demora", ["Los satélites no pueden transmitir datos", "Está prohibido usar satélites para esto", "En realidad casi todo va por satélite"], "🌊"],
  ["¿Qué busca resolver una constelación de satélites de órbita baja (LEO)?", "Reducir la demora en zonas sin cables", ["Reemplazar del todo a la fibra óptica mundial", "Evitar el uso de cualquier frecuencia de radio", "Eliminar la necesidad de routers domésticos"], "🛰️"],
  ["¿Qué es la 'computación en el borde' frente a la nube centralizada?", "Procesar los datos cerca de donde se generan", ["Un tipo de cable de red más grueso", "Un protocolo exclusivo de correo electrónico", "Un sistema para subir el precio de internet"], "⚡"],
  ["¿Por qué el Internet de las Cosas plantea desafíos de seguridad?", "Suma millones de aparatos difíciles de proteger", ["Los electrodomésticos no se conectan en la práctica", "No representa ningún desafío real de seguridad", "Todos los dispositivos IoT usan la misma clave"], "🔓"],
];

export const TECH_LEVELS: LevelDef[] = [
  {
    name: "Señales y Comunicación",
    emoji: "📡",
    desc: "Cómo se comunican a distancia las personas y las máquinas",
    tier: 1,
    gen: gen4(SIGNALS_FACIL, SIGNALS_MC, SIGNALS_DIFICIL, SIGNALS_EXPERTO, "emoji"),
  },
  {
    name: "El Viaje de un Mensaje",
    emoji: "📧",
    desc: "Qué pasa de verdad cuando mandás un mail o un mensaje",
    tier: 1,
    gen: gen4(MESSAGE_FACIL, MESSAGE_MC, MESSAGE_DIFICIL, MESSAGE_EXPERTO),
  },
  {
    name: "Paquetes de Datos",
    emoji: "📦",
    desc: "Por qué la información viaja partida en pedacitos",
    tier: 1,
    gen: gen4(PACKETS_FACIL, PACKETS_MC, PACKETS_DIFICIL, PACKETS_EXPERTO),
  },
  {
    name: "Ondas Electromagnéticas",
    emoji: "📶",
    desc: "Las ondas invisibles detrás del wifi, la radio y el celular",
    tier: 2,
    gen: gen4(WAVES_FACIL, WAVES_MC, WAVES_DIFICIL, WAVES_EXPERTO),
  },
  {
    name: "Redes e Internet",
    emoji: "🌐",
    desc: "Cómo se conectan entre sí millones de dispositivos",
    tier: 2,
    gen: gen4(NET_FACIL, NET_MC, NET_DIFICIL, NET_EXPERTO),
  },
  {
    name: "Protocolos: El Idioma de las Máquinas",
    emoji: "📜",
    desc: "Las reglas que permiten que dos aparatos se entiendan",
    tier: 2,
    gen: gen4(PROTOCOLS_FACIL, PROTOCOLS_MC, PROTOCOLS_DIFICIL, PROTOCOLS_EXPERTO),
  },
  {
    name: "Seguridad y Privacidad Digital",
    emoji: "🔐",
    desc: "Contraseñas, cifrado y buenos hábitos en internet",
    tier: 3,
    gen: gen4(SECURITY_FACIL, SECURITY_MC, SECURITY_DIFICIL, SECURITY_EXPERTO),
  },
  {
    name: "El Mundo Conectado",
    emoji: "🛰️",
    desc: "Cables submarinos, satélites, 5G y la nube",
    tier: 3,
    gen: gen4(WORLD_FACIL, WORLD_MC, WORLD_DIFICIL, WORLD_EXPERTO),
  },
];
