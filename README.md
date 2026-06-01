# ⚡ Anime Math Academy

App para aprender las **tablas de multiplicar** con temática anime. Cada cuenta correcta da monedas 🪙 que se usan para **comprar cartas de personajes anime** y **subirlas de nivel**. El progreso se guarda automáticamente en el navegador (localStorage).

## ✨ Características

- **Ayuda visual**: cada multiplicación se muestra con puntos (ej. 3 filas de 6 = 18) para que el niño *entienda* el porqué.
- **Respuesta libre siempre**: el jugador puede escribir el número en cualquier momento. Si se acaba el tiempo (5 s), aparece además una opción múltiple — pero el campo de texto sigue activo.
- **Recompensas por velocidad**: responder rápido da más monedas. Hay bono por racha cada 5 aciertos seguidos.
- **Tienda de cartas**: 12 personajes anime con 4 rarezas (Común, Raro, Épico, Legendario). Se compran y se suben de nivel (hasta nivel 10), aumentando su poder.
- **Compañero**: la carta seleccionada acompaña al jugador en la pantalla de juego.
- **Guardado automático** en el dispositivo. Botón para reiniciar progreso.

## 🚀 Correr en local

Necesitas Node.js 18.18+ (recomendado 20+).

```bash
npm install
npm run dev
```

Abre http://localhost:3000

## ☁️ Deploy en Vercel

**Opción A — desde la web (más fácil):**
1. Subí esta carpeta a un repositorio en GitHub.
2. Entrá a https://vercel.com → *Add New → Project* → importá el repo.
3. Vercel detecta Next.js automáticamente. Click en **Deploy**. Listo.

**Opción B — con la CLI:**
```bash
npm i -g vercel
vercel
```
Seguí las instrucciones (aceptá los valores por defecto).

## 🛠️ Personalizar

- **Cartas / personajes**: editá `lib/data.ts` (nombres, colores, rarezas, costos, poder).
- **Dibujo de personajes**: `components/CharacterArt.tsx` (SVG paramétrico).
- **Recompensas y tiempos**: `components/Game.tsx` (constante `TIMER_MS` y función `resolve`).
- **Estilos**: `app/globals.css`.

## 📁 Estructura

```
app/
  layout.tsx       fuentes + metadata
  page.tsx         carga el juego (client-only)
  globals.css      sistema de diseño
components/
  Game.tsx         lógica completa del juego
  CharacterArt.tsx retrato SVG de personajes
lib/
  data.ts          cartas, rarezas, fórmulas de poder
  storage.ts       guardado en localStorage
```
