import type { Difficulty, LevelDef, Question } from "../types";
import { sample, session, shuffle, tf } from "./utils";

// ─────────────────────────────────────────────────────────────
// CIENCIAS — 8 niveles: seres vivos, cuerpo humano, materia,
// espacio, la Tierra y ecología
// ─────────────────────────────────────────────────────────────

type MC = [prompt: string, answer: string, distractors: string[], visual?: string, explain?: string];
type TF = [prompt: string, answer: boolean, explain?: string];

function build(mcs: MC[], tfs: TF[] = [], d: Difficulty = "normal", take = 10): Question[] {
  const allAnswers = mcs.map((m) => m[1]);
  const qs: Question[] = [
    ...mcs.map(([prompt, answer, wrong, visual, explain]) => {
      let options = [answer, ...wrong];
      // en difícil se suman respuestas de otras preguntas del mismo tema
      if (d === "dificil") {
        const extra = shuffle(allAnswers.filter((a) => !options.includes(a))).slice(0, 2);
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

export const SCIENCE_LEVELS: LevelDef[] = [
  { name: "Reino Animal", emoji: "🦁", desc: "Mamíferos, aves, reptiles y más", tier: 1, gen: (d) => build(ANIMALS_MC, [], d) },
  { name: "Mundo Verde", emoji: "🌱", desc: "Las plantas y sus secretos", tier: 1, gen: (d) => build(PLANTS_MC, [], d) },
  { name: "Mi Cuerpo", emoji: "🫀", desc: "Órganos, sentidos y salud", tier: 2, gen: (d) => build(BODY_MC, [], d) },
  { name: "Laboratorio de Materia", emoji: "🧪", desc: "Sólidos, líquidos, gases y el ciclo del agua", tier: 2, gen: (d) => build(MATTER_MC, [], d) },
  { name: "Viaje Espacial", emoji: "🚀", desc: "El Sol, la Luna y los planetas", tier: 2, gen: (d) => build(SPACE_MC, [], d) },
  { name: "Planeta Tierra", emoji: "🌍", desc: "Océanos, volcanes, clima y estaciones", tier: 2, gen: (d) => build(EARTH_MC, [], d) },
  { name: "Guardianes del Planeta", emoji: "♻️", desc: "Ecología, reciclaje y energía limpia", tier: 3, gen: (d) => build(ECO_MC, [], d) },
  { name: "Grandes Mentes", emoji: "🔬", desc: "Inventos, científicos y verdadero o falso", tier: 3, gen: (d) => build(INVENT_MC, MIX_TF, d) },
];
