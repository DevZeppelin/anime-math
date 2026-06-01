"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CharacterArt from "./CharacterArt";
import {
  CARDS,
  RARITY_META,
  MAX_LEVEL,
  cardPower,
  levelUpCost,
  getCard,
  type Rarity,
} from "@/lib/data";
import { loadState, saveState, resetState, DEFAULT_STATE, type SaveState } from "@/lib/storage";

const DOT_COLORS = ["#ff6b6b", "#ffd93d", "#6bcb77", "#4d96ff", "#ff922b", "#cc5de8", "#f06595", "#38d9a9"];
const TIMER_MS = 7000;

type Mode = "play" | "cards";
type Phase = "input" | "resolved";

interface Q {
  a: number;
  b: number;
  ans: number;
}

interface FloatCoin {
  id: number;
  amount: number;
  x: number;
  y: number;
}

function makeQuestion(table: number | null): Q {
  let a: number, b: number;
  if (table) {
    a = table;
    b = Math.floor(Math.random() * 10) + 1;
  } else {
    a = Math.floor(Math.random() * 10) + 1;
    b = Math.floor(Math.random() * 10) + 1;
    if (a > b) [a, b] = [b, a]; // smaller first = fewer rows of more dots
  }
  return { a, b, ans: a * b };
}

// how hard a given factor is to recall → reward multiplier
function tableWeight(n: number): number {
  if (n === 1) return 0.2; // muy baja
  if (n === 2 || n === 5 || n === 10) return 0.5; // bajas
  if (n === 3 || n === 4) return 0.8; // media
  return 1.4; // 6, 7, 8, 9 → las que más puntos dan
}

// difficulty multiplier for a question: use the chosen table, or the
// harder of the two operands in random mode
function rewardMult(table: number | null, a: number, b: number): number {
  if (table) return tableWeight(table);
  return Math.max(tableWeight(a), tableWeight(b));
}

function makeMC(ans: number): number[] {
  const set = new Set<number>([ans]);
  while (set.size < 4) {
    const off = Math.floor(Math.random() * 14) - 7;
    const v = ans + off;
    if (v > 0 && v !== ans) set.add(v);
  }
  return [...set].sort(() => Math.random() - 0.5);
}

export default function Game() {
  const [ready, setReady] = useState(false);
  const [save, setSave] = useState<SaveState>(DEFAULT_STATE);
  const [mode, setMode] = useState<Mode>("play");
  const [started, setStarted] = useState(false);

  // gameplay
  const [q, setQ] = useState<Q>({ a: 3, b: 6, ans: 18 });
  const [timerVal, setTimerVal] = useState(100);
  const [showMC, setShowMC] = useState(false);
  const [mcOpts, setMcOpts] = useState<number[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [phase, setPhase] = useState<Phase>("input");
  const [streak, setStreak] = useState(0);
  const [dotsVisible, setDotsVisible] = useState(0);
  const [inputFlash, setInputFlash] = useState<"" | "ok" | "no">("");
  const [mcFlash, setMcFlash] = useState<{ ok: number; no: number } | null>(null);
  const [pop, setPop] = useState<{ ok: boolean; coins: number; ans: number; streak: number } | null>(null);
  const [floats, setFloats] = useState<FloatCoin[]>([]);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dotRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const nextRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startedAt = useRef<number>(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const floatId = useRef(0);

  // ── load persisted state ──────────────────────────────
  useEffect(() => {
    const s = loadState();
    setSave(s);
    setReady(true);
  }, []);

  const persist = useCallback((next: SaveState) => {
    setSave(next);
    saveState(next);
  }, []);

  // ── timers cleanup ────────────────────────────────────
  const clearTimers = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (dotRef.current) clearInterval(dotRef.current);
    if (nextRef.current) clearTimeout(nextRef.current);
    timerRef.current = null;
    dotRef.current = null;
    nextRef.current = null;
  }, []);

  // ── start a new question ──────────────────────────────
  const newQuestion = useCallback(
    (table: number | null) => {
      clearTimers();
      const nq = makeQuestion(table);
      setQ(nq);
      setTimerVal(100);
      setShowMC(false);
      setMcOpts([]);
      setInputVal("");
      setPhase("input");
      setDotsVisible(0);
      setInputFlash("");
      setMcFlash(null);
      startedAt.current = Date.now();

      // animate dots
      const total = nq.a * nq.b;
      const delay = total > 60 ? 24 : total > 36 ? 38 : total > 18 ? 55 : 75;
      let shown = 0;
      dotRef.current = setInterval(() => {
        shown++;
        setDotsVisible(shown);
        if (shown >= total && dotRef.current) {
          clearInterval(dotRef.current);
          dotRef.current = null;
        }
      }, delay);

      // timer countdown -> reveal MC at 0
      const steps = 50;
      let elapsed = 0;
      timerRef.current = setInterval(() => {
        elapsed++;
        setTimerVal(Math.max(0, 100 - (elapsed / steps) * 100));
        if (elapsed >= steps) {
          if (timerRef.current) clearInterval(timerRef.current);
          timerRef.current = null;
          setShowMC(true);
          setMcOpts(makeMC(nq.ans));
        }
      }, TIMER_MS / steps);

      setTimeout(() => inputRef.current?.focus(), 60);
    },
    [clearTimers]
  );

  // leaving play mode stops the round; the player must press Play again
  useEffect(() => {
    if (mode !== "play") {
      clearTimers();
      setStarted(false);
    }
  }, [mode, clearTimers]);

  // start the game when the player presses Play
  const startGame = useCallback(() => {
    setStarted(true);
    newQuestion(save.table);
  }, [newQuestion, save.table]);

  // stop the game at any time and return to the Play screen
  const stopGame = useCallback(() => {
    clearTimers();
    setStarted(false);
    setStreak(0);
    setPop(null);
  }, [clearTimers]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  // ── resolve an answer ─────────────────────────────────
  const resolve = useCallback(
    (correct: boolean, viaMC: boolean) => {
      if (phase === "resolved") return;
      setPhase("resolved");
      clearTimers();

      let coins = 0;
      let newStreak = streak;
      if (correct) {
        const secs = (Date.now() - startedAt.current) / 1000;
        // reward speed hard: blazing-fast answers pay a lot, anything
        // after the 7s timer pays very little — to push answering quickly
        let base: number;
        if (viaMC) base = 8;
        else if (secs < 2) base = 120;
        else if (secs < 3.5) base = 70;
        else if (secs < 5) base = 40;
        else if (secs < 7) base = 20;
        else base = 8;
        newStreak = streak + 1;
        if (newStreak % 5 === 0) base += 50; // streak bonus
        // scale everything by table difficulty: ×1 pays very little, 6-9 the most
        coins = Math.round(base * rewardMult(save.table, q.a, q.b));
        setStreak(newStreak);

        // float coins near center
        const fc: FloatCoin[] = [];
        const n = Math.min(3, Math.ceil(coins / 35));
        for (let i = 0; i < n; i++) {
          fc.push({
            id: floatId.current++,
            amount: coins,
            x: 40 + Math.random() * 20,
            y: 38 + Math.random() * 18,
          });
        }
        setFloats((f) => [...f, ...fc]);
        setTimeout(() => setFloats((f) => f.filter((x) => !fc.find((c) => c.id === x.id))), 1450);

        persist({
          ...save,
          coins: save.coins + coins,
          totalCorrect: save.totalCorrect + 1,
          bestStreak: Math.max(save.bestStreak, newStreak),
        });
      } else {
        newStreak = 0;
        setStreak(0);
      }

      setPop({ ok: correct, coins, ans: q.ans, streak: newStreak });
      nextRef.current = setTimeout(
        () => {
          setPop(null);
          newQuestion(save.table);
        },
        correct ? 1500 : 1900
      );
    },
    [phase, streak, q.ans, save, persist, clearTimers, newQuestion]
  );

  const submitInput = useCallback(() => {
    if (phase !== "input") return;
    const v = parseInt(inputVal, 10);
    if (isNaN(v)) return;
    const correct = v === q.ans;
    setInputFlash(correct ? "ok" : "no");
    setTimeout(() => resolve(correct, false), 380);
  }, [phase, inputVal, q.ans, resolve]);

  const pickMC = useCallback(
    (v: number) => {
      if (phase !== "input") return;
      setMcFlash({ ok: q.ans, no: v });
      setTimeout(() => resolve(v === q.ans, true), 480);
    },
    [phase, q.ans, resolve]
  );

  // ── card actions ──────────────────────────────────────
  const buyCard = useCallback(
    (id: string) => {
      const card = getCard(id);
      if (!card || save.owned[id] || save.coins < card.cost) return;
      persist({
        ...save,
        coins: save.coins - card.cost,
        owned: { ...save.owned, [id]: 1 },
        selected: save.selected ?? id,
      });
    },
    [save, persist]
  );

  const upgradeCard = useCallback(
    (id: string) => {
      const card = getCard(id);
      const lvl = save.owned[id];
      if (!card || !lvl || lvl >= MAX_LEVEL) return;
      const cost = levelUpCost(card, lvl);
      if (save.coins < cost) return;
      persist({
        ...save,
        coins: save.coins - cost,
        owned: { ...save.owned, [id]: lvl + 1 },
      });
    },
    [save, persist]
  );

  const selectCard = useCallback(
    (id: string) => {
      persist({ ...save, selected: save.selected === id ? null : id });
    },
    [save, persist]
  );

  const setTable = useCallback(
    (t: number | null) => {
      persist({ ...save, table: t });
      if (mode === "play" && started) newQuestion(t);
    },
    [save, persist, mode, started, newQuestion]
  );

  const doReset = useCallback(() => {
    if (typeof window !== "undefined" && window.confirm("¿Borrar todo el progreso y empezar de cero?")) {
      resetState();
      setSave({ ...DEFAULT_STATE });
      setStreak(0);
      setStarted(false);
      clearTimers();
    }
  }, [clearTimers]);

  // ── derived ───────────────────────────────────────────
  const companion = useMemo(() => {
    if (save.selected && save.owned[save.selected]) {
      const c = getCard(save.selected);
      if (c) return { card: c, level: save.owned[save.selected] };
    }
    const firstOwned = Object.keys(save.owned)[0];
    if (firstOwned) {
      const c = getCard(firstOwned);
      if (c) return { card: c, level: save.owned[firstOwned] };
    }
    return null;
  }, [save.selected, save.owned]);

  const ownedCount = Object.keys(save.owned).length;

  if (!ready) {
    return (
      <div className="shell">
        <div className="empty">Cargando tu aventura… ⚡</div>
      </div>
    );
  }

  const timerColor = timerVal > 55 ? "#3df09a" : timerVal > 28 ? "#ffcf3a" : "#ff5a6e";
  const total = q.a * q.b;
  const dotSize = total > 60 ? 7 : total > 30 ? 9 : total > 18 ? 11 : 14;

  return (
    <div className="shell">
      {/* top bar */}
      <div className="topbar">
        <div className="brand display">
          <span className="spark">⚡</span>
          <span>
            Anime <b>Math</b>
          </span>
        </div>
        <div className="topnav">
          <div className="coins">🪙 {save.coins.toLocaleString()}</div>
        </div>
      </div>

      {/* tabs */}
      <div className="tabs">
        <button className={`tab display ${mode === "play" ? "on" : ""}`} onClick={() => setMode("play")}>
          🎮 Jugar
        </button>
        <button className={`tab display ${mode === "cards" ? "on" : ""}`} onClick={() => setMode("cards")}>
          🃏 Cartas {ownedCount > 0 && `(${ownedCount}/${CARDS.length})`}
        </button>
      </div>

      {mode === "play" ? (
        <PlayView
          q={q}
          streak={streak}
          timerVal={timerVal}
          timerColor={timerColor}
          dotsVisible={dotsVisible}
          dotSize={dotSize}
          showMC={showMC}
          mcOpts={mcOpts}
          inputVal={inputVal}
          inputFlash={inputFlash}
          mcFlash={mcFlash}
          phase={phase}
          companion={companion}
          table={save.table}
          totalCorrect={save.totalCorrect}
          bestStreak={save.bestStreak}
          started={started}
          inputRef={inputRef}
          onInput={setInputVal}
          onSubmit={submitInput}
          onPickMC={pickMC}
          onSetTable={setTable}
          onStart={startGame}
          onStop={stopGame}
        />
      ) : (
        <CardsView save={save} onBuy={buyCard} onUpgrade={upgradeCard} onSelect={selectCard} />
      )}

      <div className="footer">
        Hecho con ⚡ · tu progreso se guarda automáticamente en este dispositivo
        <br />
        <button className="resetbtn" onClick={doReset}>
          Reiniciar progreso
        </button>
      </div>

      {/* result popup */}
      {pop && (
        <div className="overlay">
          <div className={`respop ${pop.ok ? "ok" : "no"}`}>
            <div className="em">{pop.ok ? ["🎉", "⭐", "🔥", "💫", "✨"][Math.floor(Math.random() * 5)] : "💪"}</div>
            <div className="tx display">{pop.ok ? "¡Correcto!" : `Era ${pop.ans}`}</div>
            {pop.ok && <div className="co display">+{pop.coins} 🪙</div>}
            {pop.ok && pop.streak > 1 && <div className="sk">🔥 Racha de {pop.streak}</div>}
          </div>
        </div>
      )}

      {/* float coins */}
      {floats.map((f) => (
        <div key={f.id} className="fcoin" style={{ left: `${f.x}%`, top: `${f.y}%` }}>
          +{f.amount}🪙
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   PLAY VIEW
   ───────────────────────────────────────────────────────── */
interface PlayProps {
  q: Q;
  streak: number;
  timerVal: number;
  timerColor: string;
  dotsVisible: number;
  dotSize: number;
  showMC: boolean;
  mcOpts: number[];
  inputVal: string;
  inputFlash: "" | "ok" | "no";
  mcFlash: { ok: number; no: number } | null;
  phase: Phase;
  companion: { card: ReturnType<typeof getCard>; level: number } | null;
  table: number | null;
  totalCorrect: number;
  bestStreak: number;
  started: boolean;
  inputRef: React.RefObject<HTMLInputElement>;
  onInput: (v: string) => void;
  onSubmit: () => void;
  onPickMC: (v: number) => void;
  onSetTable: (t: number | null) => void;
  onStart: () => void;
  onStop: () => void;
}

function PlayView(p: PlayProps) {
  const rows = Array.from({ length: p.q.a });
  const cols = Array.from({ length: p.q.b });

  return (
    <div className={`game-grid ${p.started ? "playing" : ""}`}>
      {/* companion side */}
      <div>
        <div className="companion" style={{ ["--c" as string]: p.companion?.card?.aura ?? "#8b5cff" }}>
          <div className="ring" />
          {p.companion?.card ? (
            <>
              <div style={{ display: "grid", placeItems: "center" }}>
                <CharacterArt card={p.companion.card} size={120} glow />
              </div>
              <div className="nm display">{p.companion.card.name}</div>
              <div className="ti">{p.companion.card.title}</div>
              <div className="stat-row">
                <div className="stat">
                  <div className="v display">Nv {p.companion.level}</div>
                  <div className="l">Nivel</div>
                </div>
                <div className="stat">
                  <div className="v display">{cardPower(p.companion.card, p.companion.level)}</div>
                  <div className="l">Poder</div>
                </div>
              </div>
            </>
          ) : (
            <div style={{ padding: "20px 6px" }}>
              <div style={{ fontSize: 44 }}>🃏</div>
              <div className="nm display" style={{ fontSize: 15, marginTop: 8 }}>
                Sin compañero
              </div>
              <div className="ti">¡Gana monedas y compra tu primera carta!</div>
            </div>
          )}
        </div>

        <div className="panel" style={{ marginTop: 14, padding: 16 }}>
          <div className="section-h">Tabla a practicar</div>
          <div className="tablepick" style={{ justifyContent: "flex-start", margin: 0 }}>
            <button className={`tbtn ${p.table === null ? "on" : ""}`} onClick={() => p.onSetTable(null)}>
              🎲
            </button>
            {Array.from({ length: 10 }, (_, i) => (
              <button key={i} className={`tbtn ${p.table === i + 1 ? "on" : ""}`} onClick={() => p.onSetTable(i + 1)}>
                ×{i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* question side */}
      <div className="qzone">
        {!p.started ? (
          <div className="startscreen">
            <div className="startbig">✖️</div>
            <div className="starttitle display">¿List@ para practicar?</div>
            <div className="startsub">
              Elige una tabla y dale al botón cuando quieras empezar.
              <br />
              Tendrás 7 segundos por pregunta.
            </div>
            <button className="playbtn display" onClick={p.onStart}>
              ▶ ¡Jugar!
            </button>
          </div>
        ) : (
        <>
        <div className="qhead">
          <div className={`streak ${p.streak >= 5 ? "hot" : ""}`}>🔥 Racha: {p.streak}</div>
          <div className="qhead-right">
            <div style={{ fontSize: 13, color: "var(--txt-dim)" }}>✅ {p.totalCorrect} · 🏆 {p.bestStreak}</div>
            <button className="stopbtn" onClick={p.onStop}>
              ⏹ Detener
            </button>
          </div>
        </div>

        <div className="timer">
          <i style={{ width: `${p.timerVal}%`, background: p.timerColor }} />
        </div>

        <div className="question">
          <div className="lbl">¿Cuánto es?</div>
          <div className="eq display">
            {p.q.a} × {p.q.b} = ?
          </div>
        </div>

        <div className="dots">
          <div className="cap">
            💡 Pista: {p.q.a} {p.q.a === 1 ? "fila" : "filas"} de {p.q.b}
          </div>
          <div className="dotgrid">
            {rows.map((_, ri) => (
              <div className="drow" key={ri}>
                {cols.map((__, ci) => {
                  const idx = ri * p.q.b + ci;
                  const on = idx < p.dotsVisible;
                  const col = DOT_COLORS[ri % DOT_COLORS.length];
                  return (
                    <span
                      key={ci}
                      className={`dot ${on ? "on" : ""}`}
                      style={{
                        width: p.dotSize,
                        height: p.dotSize,
                        background: col,
                        boxShadow: on ? `0 0 6px ${col}aa` : "none",
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* answer: input ALWAYS available */}
        <div>
          <div className="answer">
            <input
              ref={p.inputRef}
              type="number"
              inputMode="numeric"
              className={`ans-input ${p.inputFlash} ${p.inputFlash === "no" ? "shake" : ""}`}
              placeholder="?"
              value={p.inputVal}
              disabled={p.phase === "resolved"}
              onChange={(e) => p.onInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") p.onSubmit();
              }}
            />
            <button className="ans-btn" onClick={p.onSubmit} disabled={p.phase === "resolved"} aria-label="Responder">
              ✓
            </button>
          </div>

          {/* multiple choice appears after timer, input still usable */}
          {p.showMC && (
            <div className="mc-wrap">
              <div className="mc-hint">⏰ ¿Necesitas ayuda? Escribe el número o elige una opción</div>
              <div className="mc-grid">
                {p.mcOpts.map((o) => {
                  let cls = "mc-btn display";
                  if (p.mcFlash) {
                    if (o === p.mcFlash.ok) cls += " mc-ok";
                    else if (o === p.mcFlash.no) cls += " mc-no";
                  }
                  return (
                    <button key={o} className={cls} onClick={() => p.onPickMC(o)} disabled={p.phase === "resolved"}>
                      {o}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        </>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   CARDS VIEW
   ───────────────────────────────────────────────────────── */
function CardsView({
  save,
  onBuy,
  onUpgrade,
  onSelect,
}: {
  save: SaveState;
  onBuy: (id: string) => void;
  onUpgrade: (id: string) => void;
  onSelect: (id: string) => void;
}) {
  const sorted = useMemo(
    () => [...CARDS].sort((a, b) => RARITY_META[a.rarity].order - RARITY_META[b.rarity].order),
    []
  );

  return (
    <div className="panel">
      <div className="section-h">Colección de cartas — cómpralas y súbelas de nivel</div>
      <div className="card-grid">
        {sorted.map((card) => {
          const meta = RARITY_META[card.rarity];
          const level = save.owned[card.id] ?? 0;
          const owned = level > 0;
          const isSel = save.selected === card.id;
          const canBuy = !owned && save.coins >= card.cost;
          const upCost = owned ? levelUpCost(card, level) : 0;
          const canUp = owned && level < MAX_LEVEL && save.coins >= upCost;
          const power = owned ? cardPower(card, level) : card.basePower;
          const maxPower = cardPower(card, MAX_LEVEL);

          return (
            <div
              key={card.id}
              className={`card ${owned ? "owned" : "locked"}`}
              style={{ ["--rc" as string]: meta.color, ["--rg" as string]: meta.glow }}
            >
              <span className="rar" style={{ background: meta.color }}>
                {meta.label}
              </span>
              <span className="emb">{card.emblem}</span>

              <div className="art-wrap">
                {owned && <div className="auraglow" />}
                <CharacterArt card={card} size={104} glow={owned} />
              </div>

              <div className="cn display">{card.name}</div>
              <div className="ct">{card.title}</div>

              <div className="stars">
                {owned
                  ? "⭐".repeat(Math.min(5, Math.ceil((level / MAX_LEVEL) * 5)))
                  : "·".repeat(meta.stars)}
              </div>

              {owned && (
                <>
                  <div className="lvl">
                    Nivel {level}/{MAX_LEVEL} · Poder {power}
                  </div>
                  <div className="powerbar">
                    <i style={{ width: `${(power / maxPower) * 100}%` }} />
                  </div>
                </>
              )}

              <div className="btnrow">
                {!owned ? (
                  <button className="cardbtn buy" onClick={() => onBuy(card.id)} disabled={!canBuy}>
                    🪙 {card.cost}
                  </button>
                ) : level < MAX_LEVEL ? (
                  <button className="cardbtn up" onClick={() => onUpgrade(card.id)} disabled={!canUp}>
                    ⬆ Subir nivel · 🪙 {upCost}
                  </button>
                ) : (
                  <button className="cardbtn max" disabled>
                    ✦ Nivel máximo
                  </button>
                )}

                {owned && (
                  <button className={`cardbtn sel ${isSel ? "active" : ""}`} onClick={() => onSelect(card.id)}>
                    {isSel ? "✓ Compañero" : "Elegir compañero"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
