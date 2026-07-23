// ─────────────────────────────────────────────────────────────
// Lectura en voz alta con la Web Speech API del navegador.
// Pieza clave para que niños que todavía no saben leer puedan
// jugar solos: el modo "Pequeños" lee cada pregunta en voz alta
// automáticamente, y cualquier otro modo tiene un botón 🔊 manual.
// No requiere red ni dependencias: es 100% del navegador.
// ─────────────────────────────────────────────────────────────

let cachedVoices: SpeechSynthesisVoice[] = [];

function loadVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !window.speechSynthesis) return [];
  const v = window.speechSynthesis.getVoices();
  if (v.length) cachedVoices = v;
  return cachedVoices;
}

if (typeof window !== "undefined" && window.speechSynthesis) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

function pickVoice(langPrefix: string): SpeechSynthesisVoice | undefined {
  const voices = loadVoices();
  return (
    voices.find((v) => v.lang.toLowerCase().startsWith(langPrefix) && /female|mujer|femenin/i.test(v.name)) ||
    voices.find((v) => v.lang.toLowerCase().startsWith(langPrefix)) ||
    undefined
  );
}

/** Limpia un texto de emojis, comillas y símbolos matemáticos para que se
 *  escuche natural al ser leído en voz alta. */
export function speakify(raw: string): string {
  return raw
    .replace(/\n/g, ". ")
    .replace(/[«»"]/g, "")
    .replace(/×/g, " por ")
    .replace(/÷/g, " dividido entre ")
    .replace(/−/g, " menos ")
    .replace(/%/g, " por ciento")
    .replace(/\bx\b/g, " por ")
    // quita emojis y otros símbolos pictográficos, conservando letras/números/puntuación básica
    .replace(
      /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}️‍]/gu,
      " "
    )
    .replace(/\s+/g, " ")
    .trim();
}

/** Lee un texto en voz alta. lang: "es" (por defecto) o "en". */
export function speak(text: string, lang: "es" | "en" = "es"): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const clean = speakify(text);
  if (!clean) return;
  window.speechSynthesis.cancel(); // corta cualquier lectura anterior
  const utter = new SpeechSynthesisUtterance(clean);
  const langCode = lang === "en" ? "en-US" : "es-ES";
  const voice = pickVoice(lang === "en" ? "en" : "es");
  if (voice) utter.voice = voice;
  utter.lang = langCode;
  utter.rate = 0.92;
  utter.pitch = 1.08;
  window.speechSynthesis.speak(utter);
}

export function stopSpeaking(): void {
  if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
}

export function speechAvailable(): boolean {
  return typeof window !== "undefined" && !!window.speechSynthesis;
}
