# 🏰 Academia Aventura

La escuela hecha juego: una app educativa RPG donde los niños aprenden las
habilidades esenciales del nuevo mundo mientras crean, personalizan y hacen
crecer a su propio héroe.

## 📚 Las 6 materias

Currículo inspirado en los programas de primaria de **Finlandia, Singapur,
Estonia y Canadá** — los países referentes en educación básica:

| Materia | Contenido | Niveles |
|---|---|---|
| 🔢 Matemáticas | Sumas → restas → tablas → división → fracciones → porcentajes → problemas | 12 |
| 🇬🇧 Inglés | Vocabulario esencial (pre-A1 → A1): colores, animales, familia, comida, cuerpo, verbos, frases reales | 10 |
| 📚 Lengua | Sílabas, ortografía (B/V, H, G/J, C/S/Z), sinónimos, antónimos, gramática, comprensión lectora, refranes | 8 |
| 🔬 Ciencias | Seres vivos, plantas, cuerpo humano, materia, espacio, la Tierra, ecología, grandes científicos | 8 |
| 💰 Finanzas | Contar dinero, cambio, necesidades vs deseos, ahorro, trabajo, presupuesto, bancos, primer negocio | 8 |
| 💻 Programación | Secuencias, patrones, robots, bucles, condicionales, bugs, algoritmos, binario y seguridad digital | 8 |

Las preguntas combinan **opción múltiple, respuesta escrita, verdadero/falso y
ordenar pasos**; matemáticas, finanzas y programación generan ejercicios
proceduralmente (nunca se repiten igual).

## ⚔️ El juego

- **Héroe RPG de cuerpo completo**: 10 tonos de piel, 14 peinados, 18 colores
  de pelo, 5 estilos de ojos, 10 colores de ojos, 5 expresiones de boca y
  6 marcas faciales (pecas, cicatriz, estrellita…).
- **56 ítems equipables**: 14 trajes, 12 armas/herramientas, 12 accesorios,
  10 mascotas, 8 auras y 8 fondos, con rarezas (común → legendario).
- **Economía doble**: 🪙 monedas (lecciones) y 💎 gemas (logros, niveles,
  lecciones perfectas).
- **6 habilidades pasivas**: más monedas, más XP, más tiempo, corazón extra,
  pista 50/50, suerte x2.
- **Progresión**: XP y nivel de jugador, estrellas por nivel (1–3),
  desbloqueo progresivo, ~30 logros, racha diaria con bono.
- **Arena de minijuegos** para lucir al héroe: Duelo Relámpago (cálculo
  contra un rival), Memoria Mágica y Lluvia de Estrellas.
- **Multi-perfil**: hasta 6 niños en el mismo dispositivo, cada uno con su
  héroe y su progreso (guardado en localStorage, sin servidor).

## 🚀 Correr en local

Necesitas Node.js 18.18+ (recomendado 20+).

```bash
npm install
npm run dev    # http://localhost:3000
npm run build  # build de producción (estático)
```

## ☁️ Deploy en Vercel

1. Subí esta carpeta a un repositorio en GitHub.
2. Entrá a https://vercel.com → *Add New → Project* → importá el repo.
3. Vercel detecta Next.js automáticamente. Click en **Deploy**. Listo.

Next.js + React + TypeScript, sin dependencias extra: todo el arte es SVG
generado por código y el estado vive en el navegador.

## 🗂️ Estructura

```
lib/
  types.ts        # modelos (Perfil, Personaje, Ítem, Pregunta…)
  storage.ts      # multi-perfil en localStorage + racha diaria
  items.ts        # catálogo de ítems y habilidades
  progression.ts  # XP, niveles, logros, economía
  content/        # currículo: una materia por archivo
components/
  Avatar.tsx      # héroe SVG por capas (traje, arma, mascota, aura…)
  Game.tsx        # orquestador: navegación, recompensas, toasts
  LessonPlayer.tsx# lecciones con corazones, tiempo, pistas y rachas
  Shop / Wardrobe / Achievements / Minigames / …
```

## 🛠️ Personalizar

- **Materias y ejercicios**: `lib/content/<materia>.ts` — agrega niveles o
  preguntas a los bancos.
- **Ítems nuevos**: `lib/items.ts` (y su dibujo en `components/Avatar.tsx`
  si es un traje/arma/accesorio nuevo).
- **Recompensas y dificultad**: `lib/progression.ts`.
- **Estilos**: `app/globals.css`.
