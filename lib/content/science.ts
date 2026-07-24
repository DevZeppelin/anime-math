import type { Difficulty, LevelDef, Question } from "../types";
import { pick, pickEmojiMC, sample, session, shuffle, tf } from "./utils";

// ─────────────────────────────────────────────────────────────
// CIENCIAS — 8 niveles, adaptados a 3 edades:
//   facil (Menores de 5)  → identificación pura por imágenes:
//                           animales, cuerpo, clima, espacio y
//                           estados de la materia, todo narrado
//                           en voz alta con opciones en emoji.
//   normal / dificil       → el temario clásico con más texto.
// ─────────────────────────────────────────────────────────────

type D = Difficulty;
type MC = [prompt: string, answer: string, distractors: string[], visual?: string, explain?: string];
type TF = [prompt: string, answer: boolean, explain?: string];

function build(mcs: MC[], tfs: TF[] = [], d: Difficulty = "normal", take = 10): Question[] {
  const allAnswers = mcs.map((m) => m[1]);
  const qs: Question[] = [
    ...mcs.map(([prompt, answer, wrong, visual, explain]) => {
      let options = [answer, ...wrong];
      // en difícil (y aún más en experto) se suman respuestas de otras preguntas del mismo tema
      if (d === "dificil" || d === "experto") {
        const extra = shuffle(allAnswers.filter((a) => !options.includes(a))).slice(0, d === "experto" ? 3 : 2);
        options = [...options, ...extra];
      }
      return {
        kind: "mc" as const,
        prompt,
        visual,
        options: shuffle(options),
        answer,
        explain,
      };
    }),
    ...tfs.map(([prompt, answer, explain]) => tf(prompt, answer, { explain })),
  ];
  return session(sample(qs, take + 2));
}

// ── bancos de imágenes puras para "Pequeños" ───────────────────

const ANIMAL_ID: [string, string][] = [
  ["el perro", "🐶"], ["el gato", "🐱"], ["la vaca", "🐮"], ["el caballo", "🐴"],
  ["la oveja", "🐑"], ["el pollo", "🐔"], ["el pato", "🦆"], ["el cerdo", "🐷"],
  ["el león", "🦁"], ["el elefante", "🐘"], ["el mono", "🐵"], ["el oso", "🐻"],
  ["el conejo", "🐰"], ["la tortuga", "🐢"], ["el pez", "🐟"], ["el pájaro", "🐦"],
];

const FRUIT_ID: [string, string][] = [
  ["la manzana", "🍎"], ["el plátano", "🍌"], ["la naranja", "🍊"], ["la fresa", "🍓"], ["la uva", "🍇"],
];
const NOT_FRUIT: string[] = ["🚗", "👟", "📺", "🎈", "✏️", "🧦"];
function qIsFruit(): Question {
  const useFruit = Math.random() < 0.5;
  if (useFruit) {
    const [name, emoji] = pick(FRUIT_ID);
    const wrong = sample(NOT_FRUIT, 2);
    return { kind: "mc", prompt: `¿Cuál de estos ES una fruta?`, visual: undefined, options: shuffle([emoji, ...wrong]), answer: emoji, explain: `${name} es una fruta.` };
  }
  const wrong2 = sample(NOT_FRUIT, 1);
  const fruit = pick(FRUIT_ID)[1];
  const nonFruit = pick(NOT_FRUIT.filter((f) => f !== wrong2[0]));
  return { kind: "mc", prompt: `¿Cuál de estos NO es una fruta?`, options: shuffle([nonFruit, fruit, ...wrong2]), answer: nonFruit };
}

const BODY_PARTS_ES: [string, string][] = [
  ["la nariz", "👃"], ["el ojo", "👁️"], ["la oreja", "👂"], ["la boca", "👄"],
  ["la mano", "✋"], ["el pie", "🦶"], ["el diente", "🦷"], ["el pelo", "💇"],
];

const MATTER_VISUAL: [string, string][] = [
  ["un líquido", "💧"], ["un sólido", "🪨"], ["un gas", "🎈"],
];

const SPACE_ID: [string, string][] = [
  ["el Sol", "☀️"], ["la Luna", "🌙"], ["una estrella", "⭐"], ["un planeta", "🪐"],
  ["un cohete", "🚀"], ["un astronauta", "👨‍🚀"],
];

const WEATHER_ID: [string, string][] = [
  ["un día soleado", "☀️"], ["un día lluvioso", "🌧️"], ["un día nevado", "❄️"],
  ["un día con viento", "🌬️"], ["un arcoíris", "🌈"], ["una nube", "☁️"],
];

const ECO_VISUAL_FACIL: [string, string, string[], string?][] = [
  ["¿Dónde va la basura?", "🗑️", ["🌊", "🌳"], "La basura va siempre al tacho de basura, ¡nunca al agua ni a la naturaleza!"],
  ["¿Cuál es una fuente de energía limpia?", "☀️", ["🛢️", "🔥"], "El sol nos da energía limpia, sin ensuciar el aire."],
  ["¿Qué hacemos con el papel y el cartón para cuidar el planeta?", "♻️", ["🗑️", "🔥"], "Reciclar el papel ayuda a no talar tantos árboles."],
  ["¿Qué apagamos para ahorrar energía al salir de un cuarto?", "💡", ["🚪", "🪟"], "Apagar la luz que no usamos ahorra energía."],
  ["¿Qué plantamos para ayudar al planeta?", "🌳", ["🗑️", "🔥"], "Los árboles nos dan aire limpio para respirar."],
];
function qTrashVisual(): Question {
  const [prompt, answer, wrong, explain] = pick(ECO_VISUAL_FACIL);
  return { kind: "mc", prompt, options: shuffle([answer, ...wrong]), answer, explain };
}

const SIMPLE_TF_FACTS: TF[] = [
  ["El sol es caliente", true],
  ["Los peces pueden volar como los pájaros", false, "Los peces nadan; no vuelan."],
  ["La nieve es fría", true],
  ["Los gatos dicen «muu»", false, "Los gatos dicen «miau»; la vaca dice «muu»."],
  ["El hielo es frío", true],
  ["El fuego es frío", false, "El fuego quema: es muy caliente."],
  ["Los pájaros pueden volar", true],
  ["Las piedras flotan en el agua", false, "Las piedras son pesadas y se hunden."],
  ["De noche vemos la Luna", true],
  ["Los peces respiran fuera del agua como nosotros", false, "Los peces respiran con branquias, dentro del agua."],
];

// ── bancos clásicos para "Aventureros" y "Genios" ──────────────

const ANIMALS_MC: MC[] = [
  ["¿Qué animal es un mamífero?", "La ballena", ["El tiburón", "El pingüino", "La rana"], "🍼", "Las ballenas respiran aire y amamantan a sus crías."],
  ["¿Qué animal es un ave?", "El pingüino", ["El murciélago", "La mariposa", "El delfín"], "🪶", "Aunque no vuela, el pingüino tiene plumas y pone huevos."],
  ["¿Qué animal es un reptil?", "La tortuga", ["La salamandra", "El sapo", "El ratón"], "🦎", "Los reptiles tienen escamas y sangre fría."],
  ["¿Qué animal es un anfibio?", "La rana", ["La lagartija", "La serpiente", "El pez payaso"], "💧", "Los anfibios viven en el agua y en la tierra."],
  ["¿Qué animal es un insecto?", "La hormiga", ["La araña", "El caracol", "La lombriz"], "6️⃣", "Los insectos tienen 6 patas; las arañas tienen 8."],
  ["¿Cuál de estos animales es herbívoro?", "La vaca", ["El león", "El lobo", "El águila"], "🌿", "Herbívoro = come plantas."],
  ["¿Cuál de estos animales es carnívoro?", "El tigre", ["El conejo", "La jirafa", "El caballo"], "🍖", "Carnívoro = come carne."],
  ["¿Qué animal pone huevos?", "La gallina", ["La vaca", "El perro", "El delfín"], "🥚"],
  ["¿Cómo nacen los mamíferos?", "Del vientre de su madre", ["De un huevo", "De una semilla", "Del agua"], "🍼"],
  ["¿Qué usa un pez para respirar?", "Branquias", ["Pulmones", "La piel", "La nariz"], "🐟"],
];

const PLANTS_MC: MC[] = [
  ["¿Qué necesita una planta para crecer?", "Luz, agua y aire", ["Solo agua", "Solo tierra", "Oscuridad y frío"], "🌱"],
  ["¿Qué parte de la planta absorbe el agua?", "La raíz", ["La flor", "La hoja", "El fruto"], "🌿"],
  ["¿En qué parte hacen las plantas su alimento?", "En las hojas", ["En las raíces", "En el tallo", "En las flores"], "🍃", "Se llama fotosíntesis y usa la luz del sol."],
  ["¿Qué parte de la planta se convierte en fruto?", "La flor", ["La raíz", "La hoja", "El tallo"], "🍎"],
  ["¿Qué hay dentro de un fruto?", "Semillas", ["Raíces", "Hojas", "Flores"], "🍎"],
  ["¿Cómo se llama el proceso de las plantas para fabricar alimento con luz?", "Fotosíntesis", ["Digestión", "Germinación", "Respiración"], "☀️"],
  ["¿Qué transporta el tallo?", "Agua y nutrientes", ["Semillas", "Luz", "Aire"], "🌾"],
  ["¿Quiénes ayudan a llevar el polen de flor en flor?", "Las abejas", ["Los peces", "Los gatos", "Las lombrices"], "🌼"],
  ["Cuando una semilla empieza a crecer, decimos que…", "Germina", ["Florece", "Madura", "Respira"], "🌰"],
  ["¿Qué árbol nos da bellotas?", "El roble", ["El pino", "El manzano", "La palmera"], "🌳"],
];

const BODY_MC: MC[] = [
  ["¿Qué órgano bombea la sangre?", "El corazón", ["El cerebro", "El estómago", "Los pulmones"], "🩸"],
  ["¿Con qué órgano pensamos?", "El cerebro", ["El corazón", "El hígado", "Los riñones"], "💭"],
  ["¿Qué órganos usamos para respirar?", "Los pulmones", ["Los riñones", "Los músculos", "Los huesos"], "🌬️"],
  ["¿Dónde se digiere la comida?", "En el estómago", ["En los pulmones", "En el corazón", "En los oídos"], "🍽️"],
  ["¿Qué protege al cerebro?", "El cráneo", ["Las costillas", "La columna", "Los músculos"], "🦴"],
  ["¿Cuántos dientes de leche tienen los niños?", "20", ["32", "10", "40"], "🦷"],
  ["¿Qué sentido usamos con los ojos?", "La vista", ["El oído", "El olfato", "El tacto"], "👀"],
  ["¿Qué sentido usamos con la piel?", "El tacto", ["El gusto", "La vista", "El oído"], "🧊", "Con la piel sentimos frío, calor y texturas."],
  ["¿Qué le da forma y sostén a nuestro cuerpo?", "El esqueleto", ["La piel", "El pelo", "La sangre"], "🧍"],
  ["¿Qué debemos hacer para cuidar los dientes?", "Cepillarlos todos los días", ["Comer muchos dulces", "No usarlos", "Lavarlos una vez al mes"], "🦷"],
];

const MATTER_MC: MC[] = [
  ["El hielo es agua en estado…", "Sólido", ["Líquido", "Gaseoso", "Invisible"], "🧊"],
  ["El vapor es agua en estado…", "Gaseoso", ["Sólido", "Líquido", "Congelado"], "💨"],
  ["Cuando el hielo se calienta, se…", "Derrite", ["Congela", "Evapora al instante", "Endurece"], "☀️", "Pasa de sólido a líquido: se llama fusión."],
  ["Cuando el agua hierve se convierte en…", "Vapor", ["Hielo", "Nieve", "Lluvia"], "♨️"],
  ["La lluvia cae cuando el vapor de las nubes se…", "Condensa", ["Evapora", "Congela siempre", "Ilumina"], "🌧️"],
  ["¿Cuál es un líquido?", "La leche", ["La piedra", "El aire", "La madera"], "💧", "Los líquidos no tienen forma propia: toman la del recipiente."],
  ["¿Cuál es un gas?", "El aire", ["El jugo", "La arena", "El vidrio"], "💨"],
  ["¿Qué estado tiene forma propia?", "El sólido", ["El líquido", "El gas", "Ninguno"], "🤔"],
  ["El ciclo del agua empieza cuando el sol…", "Evapora el agua", ["Congela el mar", "Apaga las nubes", "Seca la lluvia"], "🔆"],
  ["¿Qué flota en el agua?", "Un corcho", ["Una moneda", "Una piedra", "Una llave"], "🛟"],
];

const SPACE_MC: MC[] = [
  ["¿Qué es el Sol?", "Una estrella", ["Un planeta", "Una luna", "Un cometa"], "☀️"],
  ["¿En qué planeta vivimos?", "La Tierra", ["Marte", "Venus", "Júpiter"], "🏠"],
  ["¿Cuál es el planeta rojo?", "Marte", ["Saturno", "Mercurio", "Neptuno"], "🔴"],
  ["¿Cuál es el planeta más grande?", "Júpiter", ["La Tierra", "Marte", "Mercurio"], "🪐"],
  ["¿Qué planeta tiene anillos famosos?", "Saturno", ["Venus", "La Tierra", "Marte"], "💍"],
  ["¿Qué gira alrededor de la Tierra?", "La Luna", ["El Sol", "Marte", "Las estrellas"], "🌍"],
  ["¿Cuánto tarda la Tierra en dar la vuelta al Sol?", "Un año", ["Un día", "Un mes", "Una semana"], "🗓️"],
  ["El día y la noche existen porque la Tierra…", "Gira sobre sí misma", ["Se apaga", "Se esconde", "Cambia de lugar con la Luna"], "🌓"],
  ["¿Cómo se llama nuestra galaxia?", "La Vía Láctea", ["Andrómeda", "El Sistema Solar", "La Nube Estelar"], "🌌"],
  ["¿Quién viaja al espacio?", "Un astronauta", ["Un buzo", "Un piloto de avión", "Un alpinista"], "🚀"],
];

const EARTH_MC: MC[] = [
  ["¿Qué cubre la mayor parte de la Tierra?", "Agua", ["Tierra", "Hielo", "Arena"], "🗺️", "Casi 3 de cada 4 partes del planeta son océanos."],
  ["¿Cómo se llama una montaña que arroja lava?", "Volcán", ["Colina", "Acantilado", "Cueva"], "🔥"],
  ["¿Cuál es el océano más grande?", "El Pacífico", ["El Atlántico", "El Índico", "El Ártico"], "🌊"],
  ["¿Qué es un desierto?", "Un lugar muy seco", ["Un lugar con muchos ríos", "Un bosque frío", "Una playa"], "🏜️"],
  ["¿Dónde viven los pingüinos salvajes?", "En el hemisferio sur", ["En el Polo Norte", "En los desiertos", "En la selva"], "🐧"],
  ["¿Qué instrumento mide la temperatura?", "El termómetro", ["La brújula", "La regla", "El reloj"], "🥵"],
  ["¿Qué señala siempre una brújula?", "El norte", ["El sur", "El este", "La casa"], "🧭"],
  ["El agua de los ríos llega al…", "Mar", ["Cielo", "Desierto", "Volcán"], "🏞️"],
  ["¿Cómo se llama la capa de aire que rodea la Tierra?", "Atmósfera", ["Corteza", "Órbita", "Estratósfera lunar"], "🌐"],
  ["¿Qué estación llega después del invierno?", "La primavera", ["El verano", "El otoño", "Otra vez invierno"], "📅"],
];

const ECO_MC: MC[] = [
  ["¿Dónde debe ir una botella de plástico usada?", "Al contenedor de reciclaje", ["Al suelo", "Al río", "A la fogata"], "🧴"],
  ["¿Cuál es una energía limpia?", "La energía solar", ["El carbón", "El petróleo", "La gasolina"], "🔋", "Las energías limpias no ensucian el aire."],
  ["¿Qué podemos hacer para ahorrar agua?", "Cerrar el grifo al cepillarnos", ["Bañarnos 3 veces al día", "Regar al mediodía", "Dejar el grifo abierto"], "🚿"],
  ["¿Qué material tarda MÁS en desaparecer en la naturaleza?", "El plástico", ["Una cáscara de banana", "El papel", "Una hoja seca"], "⏳", "El plástico puede tardar cientos de años."],
  ["Reutilizar significa…", "Darle un nuevo uso a algo", ["Tirarlo a la basura", "Comprar uno nuevo", "Esconderlo"], "🔁"],
  ["¿Qué hacen los árboles por nosotros?", "Producen oxígeno", ["Producen plástico", "Generan basura", "Atraen tormentas"], "🌳"],
  ["¿Cuál transporte contamina menos?", "La bicicleta", ["El auto", "El avión", "La moto"], "🚦"],
  ["Si vemos basura en el parque, lo mejor es…", "Recogerla y tirarla en su lugar", ["Ignorarla", "Patearla", "Taparla con hojas"], "🗑️"],
  ["¿Qué animal está en peligro por el hielo que se derrite?", "El oso polar", ["El gato", "La paloma", "El caballo"], "🌡️"],
  ["Apagar la luz al salir de una habitación…", "Ahorra energía", ["Gasta más", "No cambia nada", "Rompe la lámpara"], "💡"],
];

const MIX_TF: TF[] = [
  ["El Sol gira alrededor de la Tierra", false, "Es al revés: la Tierra gira alrededor del Sol."],
  ["Las arañas son insectos", false, "Tienen 8 patas: son arácnidos."],
  ["El agua hierve a 100 grados", true],
  ["Los delfines son peces", false, "Son mamíferos: respiran aire."],
  ["Las plantas necesitan luz para vivir", true],
  ["Los huesos del cuerpo están vivos y crecen", true],
  ["La Luna tiene luz propia", false, "Refleja la luz del Sol."],
  ["Reciclar ayuda al planeta", true],
  ["Los dinosaurios y los humanos vivieron juntos", false, "Se extinguieron millones de años antes."],
  ["El rayo se ve antes de oír el trueno", true, "La luz viaja más rápido que el sonido."],
];

const INVENT_MC: MC[] = [
  ["¿Quién estudió los chimpancés durante toda su vida?", "Jane Goodall", ["Marie Curie", "Albert Einstein", "Isaac Newton"], "🐒"],
  ["Marie Curie fue una gran científica que ganó…", "Dos premios Nobel", ["Una medalla olímpica", "Un concurso de canto", "Una carrera espacial"], "🧪"],
  ["¿Qué inventó Thomas Edison (entre muchas cosas)?", "La lámpara eléctrica práctica", ["El avión", "El teléfono móvil", "La rueda"], "🧑‍🔬"],
  ["¿Qué observó Isaac Newton para pensar en la gravedad?", "Una manzana cayendo", ["Un rayo", "Una estrella fugaz", "Un río"], "🌳"],
  ["Los hermanos Wright inventaron…", "El avión", ["El barco", "El tren", "El submarino"], "👬"],
  ["¿Qué instrumento usamos para ver las estrellas?", "El telescopio", ["El microscopio", "La lupa", "El periscopio"], "⭐"],
  ["¿Qué instrumento usamos para ver cosas diminutas?", "El microscopio", ["El telescopio", "Los binoculares", "El espejo"], "🐜"],
  ["¿Quién pintó e inventó máquinas hace 500 años?", "Leonardo da Vinci", ["Pablo Picasso", "Cristóbal Colón", "Mozart"], "🎨"],
];

// ═════════════════════════════════════════════════════════════
// CONTENIDO DE "MAESTROS" (experto) — ciencia real de adultos:
// química, física, biología, astronomía y geología reales.
// ═════════════════════════════════════════════════════════════

const ANIMALS_EXPERTO_MC: MC[] = [
  ["¿Qué es la TAXONOMÍA en biología?", "El sistema científico para clasificar a los seres vivos en categorías", ["Un tipo de dieta animal", "El estudio de los fósiles únicamente", "Un tipo de hábitat"], "🧬"],
  ["¿Qué unidad básica de clasificación agrupa organismos que pueden reproducirse entre sí?", "La especie", ["El género", "El reino", "La familia"], "🐾"],
  ["¿Qué es un ECOSISTEMA?", "Un conjunto de seres vivos y su ambiente físico interactuando entre sí", ["Un tipo de animal", "Un zoológico", "Una especie en particular"], "🌎"],
  ["En una cadena alimenticia, ¿qué función cumplen los DESCOMPONEDORES?", "Descomponen materia orgánica muerta y reciclan nutrientes al ecosistema", ["Cazan a los depredadores", "Producen su propio alimento con luz solar", "No cumplen ninguna función"], "🍄"],
  ["¿Qué propuso Charles Darwin sobre la evolución de las especies?", "Que las especies cambian con el tiempo mediante selección natural", ["Que todas las especies son inmutables", "Que los animales eligen su propia evolución", "Que solo las plantas evolucionan"], "🧭"],
  ["¿Qué significa que una especie esté EN PELIGRO DE EXTINCIÓN?", "Que su población es tan baja que corre riesgo real de desaparecer", ["Que ya no existe en ningún lugar", "Que solo vive en zoológicos", "Que se está reproduciendo muy rápido"], "🦏"],
];

const PLANTS_EXPERTO_MC: MC[] = [
  ["¿Qué gases intercambia una planta durante la fotosíntesis?", "Absorbe dióxido de carbono y libera oxígeno", ["Absorbe oxígeno y libera dióxido de carbono siempre", "Solo absorbe agua", "No intercambia gases"], "🌿"],
  ["¿Qué es la RESPIRACIÓN CELULAR en las plantas?", "El proceso donde usan el azúcar producido para obtener energía, liberando CO2", ["Lo mismo que la fotosíntesis", "Solo ocurre de noche en algunas plantas", "Un tipo de enfermedad de las plantas"], "🍃"],
  ["¿Qué papel cumplen los bosques en el CICLO DEL CARBONO?", "Absorben grandes cantidades de CO2 de la atmósfera", ["Producen todo el CO2 del planeta", "No participan del ciclo del carbono", "Solo liberan carbono, nunca lo absorben"], "🌳"],
  ["¿Qué es la POLINIZACIÓN CRUZADA?", "Cuando el polen de una flor fecunda a una flor distinta de otra planta", ["Cuando una planta se poliniza a sí misma siempre", "Un tipo de enfermedad de las flores", "El riego artificial de las plantas"], "🐝"],
  ["¿Por qué algunas semillas tienen alas o ganchos?", "Para dispersarse más lejos con el viento o pegándose a los animales", ["Para defenderse de otras plantas", "Para absorber más agua", "No tienen ninguna función"], "🌱"],
  ["¿Qué es la CLOROFILA?", "El pigmento verde que capta la luz solar para la fotosíntesis", ["Un tipo de raíz", "El azúcar que produce la planta", "Un insecto que poliniza flores"], "🍀"],
];

const BODY_EXPERTO_MC: MC[] = [
  ["¿Qué es el ADN?", "La molécula que contiene la información genética de un ser vivo", ["Un tipo de célula sanguínea", "Una hormona del cuerpo", "Un órgano del sistema digestivo"], "🧬"],
  ["¿Qué sistema del cuerpo combate infecciones?", "El sistema inmunológico", ["El sistema digestivo", "El sistema muscular", "El sistema urinario"], "🛡️"],
  ["¿Qué son las NEURONAS?", "Células especializadas que transmiten información en el sistema nervioso", ["Las células que forman los huesos", "Un tipo de glóbulo rojo", "Las células de la piel"], "🧠"],
  ["¿Qué es la HOMEOSTASIS?", "La capacidad del cuerpo de mantener un equilibrio interno estable", ["Un tipo de enfermedad crónica", "El proceso de crecer en la pubertad", "La digestión de las proteínas"], "⚖️"],
  ["¿Qué órgano produce la insulina para controlar el azúcar en la sangre?", "El páncreas", ["El hígado", "El bazo", "La vesícula"], "🩺"],
  ["¿Cuántos cromosomas tiene normalmente una célula humana?", "46", ["23", "92", "12"], "🧬", "23 pares, uno de cada progenitor."],
];

const MATTER_EXPERTO_MC: MC[] = [
  ["¿Qué es un ÁTOMO?", "La unidad más pequeña de un elemento que conserva sus propiedades", ["Una mezcla de dos sustancias", "Un tipo de molécula orgánica únicamente", "Un estado especial del agua"], "⚛️"],
  ["¿Qué es la TABLA PERIÓDICA?", "Una lista organizada de todos los elementos químicos conocidos", ["Un calendario científico", "Un tipo de gráfico de temperaturas", "Una lista de compuestos prohibidos"], "🧪"],
  ["¿Cuál es la diferencia entre un cambio FÍSICO y uno QUÍMICO?", "El físico no crea sustancias nuevas; el químico sí forma sustancias distintas", ["Son exactamente lo mismo", "El químico nunca se puede revertir, el físico siempre sí", "El físico solo ocurre con líquidos"], "🔥"],
  ["¿Qué mide la escala de pH?", "Qué tan ácida o básica (alcalina) es una sustancia", ["La temperatura de un líquido", "La densidad de un material", "La velocidad de una reacción"], "🧫"],
  ["¿Qué gas es esencial para que algo se queme (combustión)?", "El oxígeno", ["El nitrógeno", "El dióxido de carbono", "El hidrógeno"], "🔥"],
  ["¿Qué es una MOLÉCULA?", "Dos o más átomos unidos químicamente", ["Un átomo sin carga eléctrica", "Un tipo de energía", "Un estado de la materia"], "🔗"],
];

const SPACE_EXPERTO_MC: MC[] = [
  ["¿Qué es un AÑO LUZ?", "La distancia que recorre la luz en un año (no es una medida de tiempo)", ["El tiempo que tarda la luz del Sol en llegar a la Tierra", "Un año en otro planeta", "La velocidad de la luz"], "💫"],
  ["¿Qué es una GALAXIA?", "Un enorme conjunto de millones o billones de estrellas, gas y polvo", ["Un grupo de planetas alrededor de una estrella", "Otro nombre para el Sistema Solar", "Una nube de un solo color en el cielo"], "🌌"],
  ["¿Qué es un EXOPLANETA?", "Un planeta que orbita una estrella fuera de nuestro sistema solar", ["Un planeta sin atmósfera", "Una luna muy grande", "Un asteroide gigante"], "🪐"],
  ["¿Qué puede pasar cuando una estrella muy grande llega al final de su vida?", "Puede explotar como una supernova", ["Se convierte en un planeta", "Desaparece sin dejar rastro", "Se vuelve un cometa"], "💥"],
  ["¿Qué fuerza mantiene a los planetas orbitando alrededor del Sol?", "La gravedad", ["El viento solar", "El magnetismo terrestre", "La luz solar"], "🌀"],
  ["¿Qué es un AGUJERO NEGRO?", "Una región del espacio con gravedad tan fuerte que ni la luz puede escapar", ["Un planeta sin luz propia", "Un tipo de eclipse", "Una estrella apagada sin gravedad"], "⚫"],
];

const EARTH_EXPERTO_MC: MC[] = [
  ["¿Qué es la TECTÓNICA DE PLACAS?", "La teoría de que la corteza terrestre está dividida en placas que se mueven lentamente", ["La medición de la temperatura del planeta", "Un tipo de mapa antiguo", "El estudio de los océanos únicamente"], "🌍"],
  ["¿Qué capa de la Tierra es líquida y genera su campo magnético?", "El núcleo externo", ["La corteza", "El manto superior", "La atmósfera"], "🧲"],
  ["¿Cuál es la diferencia entre CLIMA y TIEMPO (weather)?", "El clima es el patrón promedio a largo plazo; el tiempo es lo que pasa en un día concreto", ["Son exactamente lo mismo", "El tiempo dura años y el clima solo un día", "El clima solo existe en el ecuador"], "🌦️"],
  ["¿Qué causa la mayoría de los terremotos?", "El movimiento repentino entre placas tectónicas", ["Las mareas del océano", "El viento fuerte", "Los cambios de estación"], "🌋"],
  ["¿Qué es el CICLO DE LAS ROCAS?", "La transformación continua entre rocas ígneas, sedimentarias y metamórficas", ["El proceso de erosión del suelo únicamente", "Un tipo de volcán", "El movimiento de las mareas"], "🪨"],
  ["¿Qué gas de efecto invernadero ha aumentado más por la actividad humana?", "El dióxido de carbono (CO2)", ["El oxígeno", "El helio", "El nitrógeno"], "🏭"],
];

const ECO_EXPERTO_MC: MC[] = [
  ["¿Qué es el CAMBIO CLIMÁTICO?", "El cambio a largo plazo en los patrones de temperatura y clima de la Tierra", ["Un cambio de estación normal", "Un tipo de tormenta puntual", "La rotación diaria de la Tierra"], "🌡️"],
  ["¿Qué es la HUELLA DE CARBONO?", "La cantidad de gases de efecto invernadero que genera una persona o actividad", ["El tamaño del pie de una persona", "Un tipo de contaminación del agua", "La cantidad de basura reciclada"], "👣"],
  ["¿Qué es la energía RENOVABLE?", "Energía de fuentes que se reponen naturalmente, como el sol o el viento", ["Energía que nunca se agota gastarla mal", "Solo la energía nuclear", "Energía que contamina menos pero se acaba igual"], "♻️"],
  ["¿Qué es la BIODIVERSIDAD?", "La variedad de seres vivos que existen en un lugar o en el planeta", ["La cantidad total de agua dulce", "El número de países del mundo", "Un tipo de reciclaje"], "🦋"],
  ["¿Qué es la DEFORESTACIÓN y por qué preocupa?", "Talar bosques a gran escala, lo que reduce el oxígeno producido y el hábitat de especies", ["Plantar árboles nuevos en el desierto", "Un tipo de incendio natural sin causa humana", "El crecimiento normal de los bosques"], "🪓"],
  ["¿Qué es el DESARROLLO SOSTENIBLE?", "Satisfacer las necesidades actuales sin comprometer las de futuras generaciones", ["Crecer económicamente sin importar el ambiente", "Dejar de producir cualquier cosa", "Un tipo de energía nuclear"], "🌱"],
];

const INVENT_EXPERTO_MC: MC[] = [
  ["¿Qué es el MÉTODO CIENTÍFICO?", "Un proceso de observar, formular hipótesis, experimentar y sacar conclusiones", ["Copiar lo que dice un libro de texto", "Adivinar y esperar tener suerte", "Un tipo de examen escolar"], "🔬"],
  ["¿Qué es una HIPÓTESIS?", "Una explicación posible de un fenómeno que se puede poner a prueba", ["Una ley científica ya comprobada para siempre", "Un experimento fallido", "Una opinión sin ninguna base"], "💡"],
  ["¿Por qué es importante que un experimento se pueda REPETIR?", "Para confirmar que el resultado no fue casualidad", ["Para tardar más tiempo en publicarlo", "No es importante, un solo intento alcanza", "Para gastar más materiales"], "🔁"],
  ["¿Qué estudió Gregor Mendel, considerado el padre de la genética?", "Cómo se heredan las características en plantas de arveja", ["Las órbitas de los planetas", "La composición del agua", "Las bacterias y los virus"], "🌱"],
  ["¿Qué descubrió Alexander Fleming, cambiando la medicina para siempre?", "La penicilina, el primer antibiótico", ["La vacuna contra la viruela", "El microscopio", "La estructura del ADN"], "💊"],
  ["¿Qué es la 'revisión por pares' (peer review) en ciencia?", "Cuando otros científicos revisan un estudio antes de que se publique", ["Cuando un científico revisa su propio trabajo solo", "Un premio científico anual", "Un tipo de experimento en pareja"], "📝"],
];

const MIX_TF_EXPERTO: TF[] = [
  ["Una teoría científica es solo una opinión sin evidencia", false, "Una teoría científica está respaldada por mucha evidencia y experimentos repetidos."],
  ["El calentamiento global actual está respaldado por consenso científico", true],
  ["Los antibióticos curan infecciones virales como la gripe común", false, "Los antibióticos combaten bacterias, no virus."],
  ["El ADN se encuentra dentro del núcleo de la mayoría de las células", true],
  ["Las placas tectónicas de la Tierra están completamente quietas y nunca se mueven", false, "Se mueven muy lentamente, unos pocos centímetros por año."],
];

// ── generador con rama visual para "Pequeños" ──────────────────

function scienceLevel(
  facilBanks: [string, string][][],
  facilPrompts: ((name: string) => string)[],
  mcs: MC[],
  tfs: TF[] = [],
  expertoMcs?: MC[]
): (d: D) => Question[] {
  return (d) => {
    if (d === "facil") {
      return session(
        Array.from({ length: 10 }, () => {
          const i = Math.floor(Math.random() * facilBanks.length);
          return pickEmojiMC(facilBanks[i], facilPrompts[i]);
        })
      );
    }
    if (d === "experto" && expertoMcs) return build(expertoMcs, [], d);
    return build(mcs, tfs, d);
  };
}

export const SCIENCE_LEVELS: LevelDef[] = [
  {
    name: "Reino Animal",
    emoji: "🦁",
    desc: "Mamíferos, aves, reptiles y más",
    tier: 1,
    gen: scienceLevel([ANIMAL_ID], [(name) => `¿Cuál es ${name}?`], ANIMALS_MC, [], ANIMALS_EXPERTO_MC),
  },
  {
    name: "Mundo Verde",
    emoji: "🌱",
    desc: "Las plantas, las frutas y sus secretos",
    tier: 1,
    gen: (d) => (d === "facil" ? session(Array.from({ length: 10 }, qIsFruit)) : d === "experto" ? build(PLANTS_EXPERTO_MC, [], d) : build(PLANTS_MC, [], d)),
  },
  {
    name: "Mi Cuerpo",
    emoji: "🫀",
    desc: "Órganos, sentidos y salud",
    tier: 2,
    gen: scienceLevel([BODY_PARTS_ES], [(name) => `¿Dónde está ${name}?`], BODY_MC, [], BODY_EXPERTO_MC),
  },
  {
    name: "Laboratorio de Materia",
    emoji: "🧪",
    desc: "Sólidos, líquidos, gases y el ciclo del agua",
    tier: 2,
    gen: scienceLevel([MATTER_VISUAL], [(name) => `¿Cuál de estos es ${name}?`], MATTER_MC, [], MATTER_EXPERTO_MC),
  },
  {
    name: "Viaje Espacial",
    emoji: "🚀",
    desc: "El Sol, la Luna y los planetas",
    tier: 2,
    gen: scienceLevel([SPACE_ID], [(name) => `¿Cuál es ${name}?`], SPACE_MC, [], SPACE_EXPERTO_MC),
  },
  {
    name: "Planeta Tierra",
    emoji: "🌍",
    desc: "Océanos, volcanes, clima y estaciones",
    tier: 2,
    gen: scienceLevel([WEATHER_ID], [(name) => `¿Cuál es ${name}?`], EARTH_MC, [], EARTH_EXPERTO_MC),
  },
  {
    name: "Guardianes del Planeta",
    emoji: "♻️",
    desc: "Ecología, reciclaje y energía limpia",
    tier: 3,
    gen: (d) => (d === "facil" ? session(Array.from({ length: 10 }, qTrashVisual)) : d === "experto" ? build(ECO_EXPERTO_MC, [], d) : build(ECO_MC, [], d)),
  },
  {
    name: "Grandes Mentes",
    emoji: "🔬",
    desc: "Inventos, científicos y verdadero o falso",
    tier: 3,
    gen: (d) =>
      d === "facil"
        ? session(SIMPLE_TF_FACTS.map(([prompt, answer, explain]) => tf(prompt, answer, { explain })))
        : d === "experto"
          ? build(INVENT_EXPERTO_MC, MIX_TF_EXPERTO, d)
          : build(INVENT_MC, MIX_TF, d),
  },
];
