"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Profile, Question, SubjectDef } from "@/lib/types";
import { DIFFICULTY_META } from "@/lib/types";
import { adaptQuestion, checkTyped, shuffle } from "@/lib/content/utils";
import { TIER_COINS, TIER_XP, LESSON_BONUS, QUESTION_SECONDS, starsForErrors } from "@/lib/progression";
import { speak, speechAvailable, stopSpeaking } from "@/lib/speech";
import Avatar from "./Avatar";

export interface LessonResult {
  passed: boolean;
  stars: 1 | 2 | 3;
  coins: number;
  xp: number;
  correct: number;
  answered: number;
  bestStreak: number;
}

interface Props {
  subject: SubjectDef;
  levelIdx: number;
  profile: Profile;
  onComplete: (res: LessonResult) => void;
  onExit: () => void;
}

type Phase = "ask" | "feedback" | "result" | "failed";

const PRAISE = ["¡Correcto!", "¡Genial!", "¡Excelente!", "¡Muy bien!", "¡Increíble!", "¡Eso es!"];

export default function LessonPlayer({ subject, levelIdx, profile, onComplete, onExit }: Props) {
  const level = subject.levels[levelIdx];
  const diff = profile.difficulty ?? "normal";
  const dMeta = DIFFICULTY_META[diff];
  const questions = useMemo(
    () => level.gen(diff).map((q) => adaptQuestion(q, diff)),
    [level, diff]
  );

  const hasShield = profile.abilities.includes("ab_shield");
  const hasTime = profile.abilities.includes("ab_time");
  const hasHint = profile.abilities.includes("ab_hint");
  const hasCoins = profile.abilities.includes("ab_coins");
  const hasXp = profile.abilities.includes("ab_xp");
  const hasLucky = profile.abilities.includes("ab_lucky");

  const maxHearts = 3 + (hasShield ? 1 : 0);
  const qSeconds = Math.max(12, QUESTION_SECONDS + dMeta.timeBonus + (hasTime ? 8 : 0));

  const [qi, setQi] = useState(0);
  const [phase, setPhase] = useState<Phase>("ask");
  const [hearts, setHearts] = useState(maxHearts);
  const [errors, setErrors] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [coins, setCoins] = useState(0);
  const [xp, setXp] = useState(0);
  const [lastOk, setLastOk] = useState(false);
  const [lastGain, setLastGain] = useState(0);
  const [lucky, setLucky] = useState(false);
  const [fast, setFast] = useState(false);
  const [timeLeft, setTimeLeft] = useState(qSeconds);
  const [hintUsed, setHintUsed] = useState(false);
  const [hidden, setHidden] = useState<string[]>([]);
  const [typedVal, setTypedVal] = useState("");
  const [orderPool, setOrderPool] = useState<string[]>([]);
  const [orderSel, setOrderSel] = useState<string[]>([]);

  const doneRef = useRef(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const q: Question | undefined = questions[qi];

  // preparar cada pregunta
  useEffect(() => {
    if (!q) return;
    setTypedVal("");
    setHidden([]);
    if (q.kind === "order") {
      setOrderPool(shuffle(q.items));
      setOrderSel([]);
    }
    setTimeLeft(qSeconds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qi]);

  // temporizador
  useEffect(() => {
    if (phase !== "ask" || !q) return;
    const iv = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 0.1) {
          clearInterval(iv);
          resolve(false);
          return 0;
        }
        return t - 0.1;
      });
    }, 100);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, qi]);

  // foco solo para respuestas de texto (las numéricas usan el teclado en pantalla)
  useEffect(() => {
    if (phase === "ask" && q?.kind === "type" && !q.numeric) inputRef.current?.focus();
  }, [phase, qi, q]);

  // lectura en voz alta: clave para que los "Pequeños" (que no saben leer)
  // puedan jugar solos. En ese modo se lee automáticamente cada pregunta;
  // en los demás modos queda disponible el botón 🔊 para quien lo necesite.
  // el idioma especial de la materia (p.ej. inglés) solo se usa en modo
  // "Pequeños", donde el prompt ES la palabra suelta en ese idioma;
  // en los demás modos los prompts son oraciones en español.
  const lessonLang = diff === "facil" ? subject.lang ?? "es" : "es";
  const speakPrompt = useCallback(() => {
    if (q) speak(q.prompt, lessonLang);
  }, [q, lessonLang]);
  useEffect(() => {
    if (diff !== "facil" || phase !== "ask" || !q) return;
    const t = setTimeout(() => speak(q.prompt, lessonLang), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qi, phase, diff]);
  useEffect(() => stopSpeaking, []); // corta la voz al desmontar la lección

  const finish = useCallback(
    (failed: boolean, fErrors: number, fCorrect: number, fCoins: number, fXp: number, fBest: number, fAnswered: number) => {
      if (doneRef.current) return;
      doneRef.current = true;
      let totalCoins = fCoins;
      let totalXp = fXp;
      if (!failed) {
        totalCoins += LESSON_BONUS[level.tier];
        totalXp += 20;
        if (fErrors === 0) totalCoins += 25;
      } else {
        totalCoins = Math.floor(totalCoins / 2);
      }
      if (hasCoins) totalCoins = Math.round(totalCoins * 1.25);
      if (hasXp) totalXp = Math.round(totalXp * 1.25);
      setCoins(totalCoins);
      setXp(totalXp);
      onComplete({
        passed: !failed,
        stars: starsForErrors(fErrors),
        coins: totalCoins,
        xp: totalXp,
        correct: fCorrect,
        answered: fAnswered,
        bestStreak: fBest,
      });
    },
    [level.tier, hasCoins, hasXp, onComplete]
  );

  /** Resuelve la pregunta actual. */
  const resolve = useCallback(
    (ok: boolean) => {
      if (phase !== "ask") return;
      setLastOk(ok);
      let gain = 0;
      let wasLucky = false;
      let wasFast = false;
      const newCorrect = correctCount + (ok ? 1 : 0);
      const newErrors = errors + (ok ? 0 : 1);
      const newStreak = ok ? streak + 1 : 0;
      const newBest = Math.max(bestStreak, newStreak);
      const newHearts = ok ? hearts : hearts - 1;
      if (ok) {
        gain = TIER_COINS[level.tier] + Math.min(streak, 5);
        // premio por velocidad: responder con más del 60% del tiempo restante
        if (timeLeft > qSeconds * 0.6) {
          gain += 3;
          wasFast = true;
        }
        // premio por dificultad elegida
        gain = Math.round(gain * dMeta.coinMult);
        if (hasLucky && Math.random() < 0.15) {
          gain *= 2;
          wasLucky = true;
        }
      }
      setLucky(wasLucky);
      setFast(wasFast);
      setLastGain(gain);
      setCorrectCount(newCorrect);
      setErrors(newErrors);
      setStreak(newStreak);
      setBestStreak(newBest);
      setHearts(newHearts);
      const newCoins = coins + gain;
      const newXp = xp + (ok ? TIER_XP[level.tier] : 0);
      setCoins(newCoins);
      setXp(newXp);

      const answered = qi + 1;
      if (!ok && newHearts <= 0) {
        setPhase("feedback");
        setTimeout(() => {
          setPhase("failed");
          finish(true, newErrors, newCorrect, newCoins, newXp, newBest, answered);
        }, 1600);
        return;
      }
      setPhase("feedback");
      if (ok) {
        setTimeout(() => advance(answered, newErrors, newCorrect, newCoins, newXp, newBest), 1000);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [phase, correctCount, errors, streak, bestStreak, hearts, coins, xp, qi, level.tier, hasLucky, finish, timeLeft, qSeconds, dMeta.coinMult]
  );

  const advance = useCallback(
    (answered: number, e = errors, c = correctCount, co = coins, x = xp, b = bestStreak) => {
      if (answered >= questions.length) {
        setPhase("result");
        finish(false, e, c, co, x, b, answered);
      } else {
        setQi(answered);
        setPhase("ask");
      }
    },
    [questions.length, errors, correctCount, coins, xp, bestStreak, finish]
  );

  /** Escritura con validación instantánea estilo Duolingo:
   *  numérica → se resuelve sola al completar los dígitos;
   *  texto → se resuelve sola en cuanto coincide. */
  const onTyped = useCallback(
    (val: string) => {
      if (phase !== "ask" || !q || q.kind !== "type") return;
      setTypedVal(val);
      const clean = val.trim();
      if (clean === "") return;
      if (q.numeric) {
        if (clean.replace("-", "").length >= q.answer.replace("-", "").length) resolve(checkTyped(q, clean));
      } else if (checkTyped(q, clean)) {
        resolve(true);
      }
    },
    [phase, q, resolve]
  );

  // teclado físico para preguntas numéricas (el input visible es un display)
  useEffect(() => {
    if (phase !== "ask" || !q || q.kind !== "type" || !q.numeric) return;
    const onKey = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) onTyped(typedVal + e.key);
      else if (e.key === "Backspace") setTypedVal((v) => v.slice(0, -1));
      else if (e.key === "-" && typedVal === "") setTypedVal("-");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, q, typedVal, onTyped]);

  if (!q && phase === "ask") return null;

  const correctText = (() => {
    if (!q) return "";
    if (q.kind === "mc") return q.answer;
    if (q.kind === "type") return q.answer;
    if (q.kind === "tf") return q.answer ? "Verdadero" : "Falso";
    return q.items.join(" → ");
  })();

  // ── pantallas finales ──────────────────────────────────────
  if (phase === "result" || phase === "failed") {
    const passed = phase === "result";
    const stars = starsForErrors(errors);
    return (
      <div className="lesson-shell">
        <div className={`result-panel panel ${passed ? "win" : "lose"}`}>
          {passed && stars === 3 && (
            <div className="confetti">
              {Array.from({ length: 18 }, (_, i) => (
                <span key={i} className="confetti-bit" style={{ ["--i" as never]: i }} />
              ))}
            </div>
          )}
          <div className="result-avatar">
            <Avatar character={profile.character} size={140} idle />
          </div>
          <h2 className="display result-title">
            {passed ? (stars === 3 ? "¡PERFECTO! 🌟" : "¡Lección superada!") : "¡Casi lo logras!"}
          </h2>
          {passed ? (
            <div className="result-stars">
              {[1, 2, 3].map((s) => (
                <span key={s} className={`big-star ${s <= stars ? "on" : ""}`}>★</span>
              ))}
            </div>
          ) : (
            <p className="result-sub">Te quedaste sin corazones… ¡inténtalo otra vez, tú puedes! 💪</p>
          )}
          <div className="result-rewards">
            <span className="pill coin">🪙 +{coins}</span>
            <span className="pill xppill">⚡ +{xp} XP</span>
            <span className="pill">✅ {correctCount}/{questions.length}</span>
          </div>
          <div className="result-actions">
            <button className="btn primary big" onClick={onExit}>
              Continuar →
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!q) return null;

  const timerPct = Math.max(0, (timeLeft / qSeconds) * 100);
  const praise = PRAISE[correctCount % PRAISE.length];

  return (
    <div className="lesson-shell">
      {/* barra superior de la lección */}
      <div className="lesson-top">
        <button className="btn ghost small" onClick={onExit} title="Abandonar lección">
          ✕
        </button>
        <div className="lesson-progress">
          <div className="lesson-progress-fill" style={{ width: `${(qi / questions.length) * 100}%` }} />
        </div>
        <div className="hearts">
          {Array.from({ length: maxHearts }, (_, i) => (
            <span key={i} className={i < hearts ? "heart" : "heart off"}>
              {i < hearts ? "❤️" : "🖤"}
            </span>
          ))}
        </div>
      </div>

      <div className="lesson-meta">
        <span className="lesson-level display">
          {level.emoji} {level.name}
        </span>
        <span className="lesson-counters">
          {streak >= 3 && <span className="streak-flame">🔥 {streak}</span>}
          <span className="pill small" title={`Modo ${dMeta.label}`}>{dMeta.emoji}</span>
          <span className="pill coin small">🪙 {coins}</span>
        </span>
      </div>

      {/* temporizador */}
      <div className={`timerbar ${timerPct < 25 ? "urgent" : ""}`}>
        <div className="timerbar-fill" style={{ width: `${timerPct}%` }} />
      </div>

      {/* pregunta */}
      <div className={`q-card panel ${phase === "feedback" ? (lastOk ? "flash-ok" : "flash-no") : ""}`}>
        {q.visual && <div className={`q-visual ${q.visual.length > 10 ? "small" : ""} ${diff === "facil" ? "big" : ""}`}>{q.visual}</div>}
        <div className="q-prompt-row">
          <p className="q-prompt display">{q.prompt}</p>
          {speechAvailable() && (
            <button className="speak-btn" onClick={speakPrompt} title="Escuchar la pregunta" aria-label="Escuchar la pregunta">
              🔊
            </button>
          )}
        </div>

        {q.kind === "mc" && (
          <div className={`mc-grid ${q.options.some((o) => o.length > 18) ? "long" : ""}`}>
            {q.options.map((opt) => {
              const isHidden = hidden.includes(opt);
              const showState =
                phase === "feedback" ? (opt === q.answer ? "good" : "dim") : "";
              return (
                <button
                  key={opt}
                  className={`mc-btn ${showState} ${isHidden ? "hidden-opt" : ""}`}
                  disabled={phase !== "ask" || isHidden}
                  onClick={() => resolve(opt === q.answer)}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        )}

        {q.kind === "tf" && (
          <div className="tf-row">
            <button
              className={`mc-btn tf-true ${phase === "feedback" ? (q.answer ? "good" : "dim") : ""}`}
              disabled={phase !== "ask"}
              onClick={() => resolve(q.answer === true)}
            >
              ✅ Verdadero
            </button>
            <button
              className={`mc-btn tf-false ${phase === "feedback" ? (!q.answer ? "good" : "dim") : ""}`}
              disabled={phase !== "ask"}
              onClick={() => resolve(q.answer === false)}
            >
              ❌ Falso
            </button>
          </div>
        )}

        {q.kind === "type" && q.numeric && (
          <div className="type-area">
            {/* display de la respuesta: se valida sola al completar los dígitos */}
            <div className={`type-display display ${typedVal ? "filled" : ""}`}>
              {typedVal || "?"}
            </div>
            <div className="numpad">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
                <button
                  key={d}
                  className="numpad-btn display"
                  disabled={phase !== "ask"}
                  onClick={() => onTyped(typedVal + d)}
                >
                  {d}
                </button>
              ))}
              <button
                className="numpad-btn aux"
                disabled={phase !== "ask" || typedVal === ""}
                onClick={() => setTypedVal((v) => v.slice(0, -1))}
              >
                ⌫
              </button>
              <button
                className="numpad-btn display"
                disabled={phase !== "ask"}
                onClick={() => onTyped(typedVal + "0")}
              >
                0
              </button>
              <span className="numpad-spacer" />
            </div>
          </div>
        )}

        {q.kind === "type" && !q.numeric && (
          <form
            className="type-row"
            onSubmit={(e) => {
              e.preventDefault();
              if (phase === "ask" && typedVal.trim() !== "") resolve(checkTyped(q, typedVal));
            }}
          >
            <input
              ref={inputRef}
              className="type-input display"
              value={typedVal}
              inputMode="text"
              autoComplete="off"
              autoCapitalize="off"
              placeholder="escribe aquí…"
              disabled={phase !== "ask"}
              onChange={(e) => onTyped(e.target.value)}
            />
            <button className="btn primary" type="submit" disabled={phase !== "ask" || typedVal.trim() === ""}>
              Comprobar
            </button>
          </form>
        )}

        {q.kind === "order" && (
          <div className="order-area">
            <div className="order-selected">
              {orderSel.length === 0 && <span className="order-hint">Toca los pasos en orden 👇</span>}
              {orderSel.map((it, i) => (
                <span key={it} className="order-step">
                  <b>{i + 1}.</b> {it}
                </span>
              ))}
            </div>
            <div className="order-pool">
              {orderPool.map((it) => (
                <button
                  key={it}
                  className="mc-btn order-opt"
                  disabled={phase !== "ask"}
                  onClick={() => {
                    // al colocar la última pieza se comprueba solo
                    const nextPool = orderPool.filter((x) => x !== it);
                    const nextSel = [...orderSel, it];
                    setOrderPool(nextPool);
                    setOrderSel(nextSel);
                    if (nextPool.length === 0) resolve(nextSel.every((x, i) => x === q.items[i]));
                  }}
                >
                  {it}
                </button>
              ))}
            </div>
            <div className="order-actions">
              <button
                className="btn ghost small"
                disabled={phase !== "ask" || orderSel.length === 0}
                onClick={() => {
                  setOrderPool(shuffle(q.items));
                  setOrderSel([]);
                }}
              >
                ↺ Reiniciar
              </button>
            </div>
          </div>
        )}

        {/* pista 50/50 */}
        {hasHint && !hintUsed && q.kind === "mc" && phase === "ask" && (
          <button
            className="hint-btn"
            onClick={() => {
              const wrong = q.options.filter((o) => o !== q.answer);
              setHidden(shuffle(wrong).slice(0, Math.min(2, wrong.length - 1)));
              setHintUsed(true);
            }}
          >
            🦅 Usar pista 50/50
          </button>
        )}
      </div>

      <div className="lesson-companion">
        <Avatar character={profile.character} size={90} idle />
      </div>

      {/* hoja de feedback inferior estilo Duolingo */}
      {phase === "feedback" && (
        <div className={`sheet ${lastOk ? "ok" : "no"}`}>
          <div className="sheet-inner">
            {lastOk ? (
              <div className="sheet-msg">
                <span className="sheet-icon">{lucky ? "🍀" : fast ? "⚡" : "✨"}</span>
                <div className="sheet-text">
                  <b className="display">{lucky ? "¡SUERTE x2!" : fast ? "¡Súper veloz!" : praise}</b>
                  <small>
                    +{lastGain} 🪙{fast && " · bono de velocidad ⚡"}
                  </small>
                </div>
              </div>
            ) : (
              <>
                <div className="sheet-msg">
                  <span className="sheet-icon">💡</span>
                  <div className="sheet-text">
                    <b className="display">La respuesta era: {correctText}</b>
                    {"explain" in q && q.explain && <small>{q.explain}</small>}
                  </div>
                </div>
                {hearts > 0 && (
                  <button className="btn primary big sheet-btn" onClick={() => advance(qi + 1)}>
                    Entendido →
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
