"use client";

import React, { useEffect, useRef, useState } from "react";
import type { Profile } from "@/lib/types";
import { ri, shuffle } from "@/lib/content/utils";
import Avatar from "./Avatar";

// ─────────────────────────────────────────────────────────────
// Arena de juegos: minijuegos de habilidad (reflejos, precisión,
// memoria, puntería) que dan recompensas en monedas y XP.
// ─────────────────────────────────────────────────────────────

interface Props {
  profile: Profile;
  onBack: () => void;
  onReward: (coins: number, xp: number) => void;
}

type GameId = null | "reflex" | "slash" | "memory" | "stars" | "tables";

export default function Minigames({ profile, onBack, onReward }: Props) {
  const [game, setGame] = useState<GameId>(null);

  if (game === "reflex") return <Reflex profile={profile} onDone={onReward} onExit={() => setGame(null)} />;
  if (game === "slash") return <Slash profile={profile} onDone={onReward} onExit={() => setGame(null)} />;
  if (game === "memory") return <Memory profile={profile} onDone={onReward} onExit={() => setGame(null)} />;
  if (game === "stars") return <StarRain profile={profile} onDone={onReward} onExit={() => setGame(null)} />;
  if (game === "tables") return <Tables profile={profile} onDone={onReward} onExit={() => setGame(null)} />;

  return (
    <div className="games-screen">
      <div className="map-header">
        <button className="btn ghost" onClick={onBack}>← Volver</button>
        <h2 className="display map-title">🎮 Arena de Juegos</h2>
        <span className="map-tagline">Entrena tus habilidades ninja y gana monedas extra</span>
      </div>
      <div className="games-grid">
        <button className="game-card panel" onClick={() => setGame("reflex")}>
          <span className="game-emoji">⚡</span>
          <b className="display">Reflejo Ninja</b>
          <small>Espera la señal… ¡y toca lo más rápido que puedas! 5 rondas.</small>
          <span className="game-skill">Entrena: reflejos y paciencia</span>
        </button>
        <button className="game-card panel" onClick={() => setGame("slash")}>
          <span className="game-emoji">🗡️</span>
          <b className="display">Corte Samurái</b>
          <small>Corta justo cuando el brillo pase por la zona dorada. 8 cortes.</small>
          <span className="game-skill">Entrena: precisión y timing</span>
        </button>
        <button className="game-card panel" onClick={() => setGame("memory")}>
          <span className="game-emoji">🧠</span>
          <b className="display">Memoria Mágica</b>
          <small>Encuentra las parejas en la menor cantidad de intentos.</small>
          <span className="game-skill">Entrena: memoria visual</span>
        </button>
        <button className="game-card panel" onClick={() => setGame("stars")}>
          <span className="game-emoji">🌠</span>
          <b className="display">Lluvia de Estrellas</b>
          <small>Atrapa estrellas y esquiva bombas durante 30 segundos.</small>
          <span className="game-skill">Entrena: puntería y velocidad</span>
        </button>
        <button className="game-card panel" onClick={() => setGame("tables")}>
          <span className="game-emoji">✖️</span>
          <b className="display">Tablas Ninja</b>
          <small>Elegí qué tablas practicar y respondé rápido: cuanto más difícil la tabla, más monedas paga.</small>
          <span className="game-skill">Entrena: tablas de multiplicar</span>
        </button>
      </div>
    </div>
  );
}

// ── panel de fin de juego compartido ─────────────────────────

function GameOver({ title, lines, coins, xp, onRetry, onExit }: {
  title: string;
  lines: string[];
  coins: number;
  xp: number;
  onRetry: () => void;
  onExit: () => void;
}) {
  return (
    <div className="game-over panel">
      <h2 className="display result-title">{title}</h2>
      {lines.map((l, i) => (
        <p key={i} className="result-sub">{l}</p>
      ))}
      <div className="result-rewards">
        <span className="pill coin">🪙 +{coins}</span>
        <span className="pill xppill">⚡ +{xp} XP</span>
      </div>
      <div className="result-actions">
        <button className="btn ghost" onClick={onExit}>← Arena</button>
        <button className="btn primary" onClick={onRetry}>Jugar otra vez 🔁</button>
      </div>
    </div>
  );
}

// ── 1. Reflejo Ninja (tiempo de reacción) ────────────────────

const REFLEX_ROUNDS = 5;

function reflexCoins(avg: number): number {
  if (avg < 300) return 35;
  if (avg < 400) return 28;
  if (avg < 500) return 22;
  if (avg < 650) return 15;
  return 10;
}

function reflexRank(avg: number): string {
  if (avg < 300) return "🥷 ¡Reflejos de ninja legendario!";
  if (avg < 400) return "⚔️ ¡Reflejos de samurái!";
  if (avg < 500) return "🦊 ¡Rápido como un kitsune!";
  if (avg < 650) return "🐢 Buen ritmo, sigue entrenando.";
  return "🌱 ¡La práctica hace al maestro!";
}

function Reflex({ profile, onDone, onExit }: { profile: Profile; onDone: (c: number, x: number) => void; onExit: () => void }) {
  type St = "idle" | "wait" | "go" | "early" | "hit" | "done";
  const [state, setState] = useState<St>("idle");
  const [times, setTimes] = useState<number[]>([]);
  const [lastMs, setLastMs] = useState(0);
  const goAt = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rewardSent = useRef(false);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const startRound = () => {
    setState("wait");
    timerRef.current = setTimeout(() => {
      goAt.current = performance.now();
      setState("go");
    }, 1200 + Math.random() * 2300);
  };

  const avg = times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;

  useEffect(() => {
    if (state === "done" && !rewardSent.current) {
      rewardSent.current = true;
      onDone(reflexCoins(avg), 10 + times.length * 2);
    }
  }, [state, avg, times.length, onDone]);

  const tap = () => {
    if (state === "idle" || state === "early") {
      startRound();
      return;
    }
    if (state === "wait") {
      // tocó antes de la señal: control de impulsos 😄
      if (timerRef.current) clearTimeout(timerRef.current);
      setState("early");
      return;
    }
    if (state === "go") {
      const ms = Math.round(performance.now() - goAt.current);
      const nt = [...times, ms];
      setLastMs(ms);
      setTimes(nt);
      setState("hit");
      timerRef.current = setTimeout(() => {
        setState(nt.length >= REFLEX_ROUNDS ? "done" : "wait");
        if (nt.length < REFLEX_ROUNDS) startRound();
      }, 900);
    }
  };

  if (state === "done") {
    return (
      <div className="games-screen">
        <GameOver
          title="⚡ ¡Entrenamiento completo!"
          lines={[`Promedio: ${avg} ms`, reflexRank(avg)]}
          coins={reflexCoins(avg)}
          xp={10 + times.length * 2}
          onRetry={onExit}
          onExit={onExit}
        />
      </div>
    );
  }

  return (
    <div className="games-screen">
      <div className="memory-top">
        <Avatar character={profile.character} size={80} idle />
        <div>
          <h2 className="display map-title">⚡ Reflejo Ninja</h2>
          <span className="map-tagline">Ronda {Math.min(times.length + 1, REFLEX_ROUNDS)} de {REFLEX_ROUNDS}</span>
        </div>
        <button className="btn ghost small" onClick={onExit}>✕ Salir</button>
      </div>

      <button className={`reflex-field panel ${state}`} onPointerDown={tap}>
        {state === "idle" && (
          <>
            <span className="reflex-big">🥷</span>
            <b className="display">Toca para empezar</b>
            <small>Espera el verde… ¡y toca al instante!</small>
          </>
        )}
        {state === "wait" && (
          <>
            <span className="reflex-big">🌑</span>
            <b className="display">Espera…</b>
            <small>Aún no… paciencia ninja</small>
          </>
        )}
        {state === "go" && (
          <>
            <span className="reflex-big">⚡</span>
            <b className="display">¡AHORA!</b>
          </>
        )}
        {state === "early" && (
          <>
            <span className="reflex-big">😅</span>
            <b className="display">¡Muy pronto!</b>
            <small>Un ninja sabe esperar. Toca para reintentar.</small>
          </>
        )}
        {state === "hit" && (
          <>
            <span className="reflex-big">🎯</span>
            <b className="display">{lastMs} ms</b>
            <small>{lastMs < 350 ? "¡Impresionante!" : lastMs < 550 ? "¡Muy bien!" : "¡Sigue así!"}</small>
          </>
        )}
        <div className="reflex-dots">
          {Array.from({ length: REFLEX_ROUNDS }, (_, i) => (
            <span key={i} className={`reflex-dot ${i < times.length ? "on" : ""}`}>
              {i < times.length ? `${times[i]}` : "·"}
            </span>
          ))}
        </div>
      </button>
    </div>
  );
}

// ── 2. Corte Samurái (precisión y timing) ────────────────────

const SLASH_CUTS = 8;

function Slash({ profile, onDone, onExit }: { profile: Profile; onDone: (c: number, x: number) => void; onExit: () => void }) {
  const [cut, setCut] = useState(0);
  const [score, setScore] = useState(0);
  const [pos, setPos] = useState(0); // 0..100
  const [zone, setZone] = useState({ c: 50, w: 30 });
  const [fx, setFx] = useState<"" | "perfect" | "good" | "miss">("");
  const [over, setOver] = useState(false);
  const posRef = useRef(0);
  const dirRef = useRef(1);
  const rafRef = useRef(0);
  const rewardSent = useRef(false);

  // el brillo va y viene por la barra, cada corte más rápido
  useEffect(() => {
    if (over) return;
    let last = performance.now();
    const speed = 85 + cut * 16; // % por segundo
    const loop = (t: number) => {
      const dt = (t - last) / 1000;
      last = t;
      let p = posRef.current + dirRef.current * dt * speed;
      if (p >= 100) { p = 100; dirRef.current = -1; }
      if (p <= 0) { p = 0; dirRef.current = 1; }
      posRef.current = p;
      setPos(p);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [cut, over]);

  const coins = Math.min(40, score * 2);
  const xp = 8 + score;

  useEffect(() => {
    if (over && !rewardSent.current) {
      rewardSent.current = true;
      onDone(coins, xp);
    }
  }, [over, coins, xp, onDone]);

  const slash = () => {
    if (over || fx) return;
    const d = Math.abs(posRef.current - zone.c);
    let gained = 0;
    let f: "" | "perfect" | "good" | "miss" = "miss";
    if (d <= zone.w / 4) { gained = 3; f = "perfect"; }
    else if (d <= zone.w / 2) { gained = 2; f = "good"; }
    setScore((s) => s + gained);
    setFx(f);
    setTimeout(() => {
      setFx("");
      const next = cut + 1;
      if (next >= SLASH_CUTS) setOver(true);
      else {
        setCut(next);
        setZone({ c: 18 + Math.random() * 64, w: Math.max(10, 30 - next * 2.6) });
      }
    }, 480);
  };

  if (over) {
    const max = SLASH_CUTS * 3;
    return (
      <div className="games-screen">
        <GameOver
          title={score >= max - 2 ? "🗡️ ¡Maestro del corte!" : score >= max / 2 ? "⚔️ ¡Gran técnica!" : "🎋 ¡Buen entrenamiento!"}
          lines={[`Puntaje: ${score} / ${max}`]}
          coins={coins}
          xp={xp}
          onRetry={onExit}
          onExit={onExit}
        />
      </div>
    );
  }

  return (
    <div className="games-screen">
      <div className="memory-top">
        <Avatar character={profile.character} size={80} idle />
        <div>
          <h2 className="display map-title">🗡️ Corte Samurái</h2>
          <span className="map-tagline">Corte {cut + 1} de {SLASH_CUTS} · Puntos: {score}</span>
        </div>
        <button className="btn ghost small" onClick={onExit}>✕ Salir</button>
      </div>

      <div className="slash-stage panel">
        <div className="slash-target">🎋</div>
        <div className="slash-bar">
          <div
            className="slash-zone"
            style={{ left: `${zone.c - zone.w / 2}%`, width: `${zone.w}%` }}
          />
          <div
            className="slash-zone perfect"
            style={{ left: `${zone.c - zone.w / 4}%`, width: `${zone.w / 2}%` }}
          />
          <div className="slash-marker" style={{ left: `${pos}%` }} />
        </div>
        <div className={`slash-fx display ${fx}`}>
          {fx === "perfect" ? "✨ ¡PERFECTO! +3" : fx === "good" ? "👍 ¡Bien! +2" : fx === "miss" ? "💨 Falló…" : " "}
        </div>
        <button className="btn primary big slash-btn display" onPointerDown={slash} disabled={!!fx}>
          🗡️ ¡CORTAR!
        </button>
      </div>
    </div>
  );
}

// ── 3. Memoria Mágica ────────────────────────────────────────

const MEMORY_POOL = ["🐉", "⚔️", "🌸", "🏯", "🦊", "🌙", "🍜", "👘", "🎋", "🗻"];

interface MemCard {
  id: number;
  emoji: string;
  state: "down" | "up" | "matched";
}

function makeDeck(): MemCard[] {
  const chosen = shuffle(MEMORY_POOL).slice(0, 6);
  return shuffle([...chosen, ...chosen]).map((emoji, i) => ({ id: i, emoji, state: "down" as const }));
}

function Memory({ profile, onDone, onExit }: { profile: Profile; onDone: (c: number, x: number) => void; onExit: () => void }) {
  const [deck, setDeck] = useState<MemCard[]>(makeDeck);
  const [busy, setBusy] = useState(false);
  const [moves, setMoves] = useState(0);
  const rewardSent = useRef(false);

  const matched = deck.every((c) => c.state === "matched");

  useEffect(() => {
    if (matched && !rewardSent.current) {
      rewardSent.current = true;
      const coins = Math.max(8, 30 - Math.max(0, moves - 6) * 2);
      onDone(coins, 12);
    }
  }, [matched, moves, onDone]);

  const flip = (id: number) => {
    if (busy) return;
    const card = deck.find((c) => c.id === id);
    if (!card || card.state !== "down") return;
    const up = deck.filter((c) => c.state === "up");
    if (up.length >= 2) return;
    const nd = deck.map((c) => (c.id === id ? { ...c, state: "up" as const } : c));
    const nowUp = nd.filter((c) => c.state === "up");
    if (nowUp.length === 2) {
      setMoves((m) => m + 1);
      if (nowUp[0].emoji === nowUp[1].emoji) {
        setDeck(nd.map((c) => (c.state === "up" ? { ...c, state: "matched" as const } : c)));
        return;
      }
      setBusy(true);
      setDeck(nd);
      setTimeout(() => {
        setDeck((d2) => d2.map((c) => (c.state === "up" ? { ...c, state: "down" as const } : c)));
        setBusy(false);
      }, 800);
      return;
    }
    setDeck(nd);
  };

  if (matched) {
    const coins = Math.max(8, 30 - Math.max(0, moves - 6) * 2);
    return (
      <div className="games-screen">
        <GameOver
          title="🧠 ¡Memoria completada!"
          lines={[`Lo lograste en ${moves} intentos`]}
          coins={coins}
          xp={12}
          onRetry={onExit}
          onExit={onExit}
        />
      </div>
    );
  }

  return (
    <div className="games-screen">
      <div className="memory-top">
        <Avatar character={profile.character} size={80} idle />
        <div>
          <h2 className="display map-title">🧠 Memoria Mágica</h2>
          <span className="map-tagline">Intentos: {moves}</span>
        </div>
        <button className="btn ghost small" onClick={onExit}>✕ Salir</button>
      </div>
      <div className="memory-grid">
        {deck.map((c) => (
          <button
            key={c.id}
            className={`mem-card ${c.state !== "down" ? "up" : ""} ${c.state === "matched" ? "matched" : ""}`}
            onClick={() => flip(c.id)}
          >
            <span className="mem-face front">✦</span>
            <span className="mem-face back">{c.emoji}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── 4. Lluvia de Estrellas ───────────────────────────────────

const RAIN_SECONDS = 30;

interface Falling {
  id: number;
  x: number; // %
  type: "star" | "gem" | "bomb";
  dur: number; // s
}

function StarRain({ profile, onDone, onExit }: { profile: Profile; onDone: (c: number, x: number) => void; onExit: () => void }) {
  const [items, setItems] = useState<Falling[]>([]);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(RAIN_SECONDS);
  const [over, setOver] = useState(false);
  const idRef = useRef(0);
  const rewardSent = useRef(false);

  useEffect(() => {
    if (over) return;
    const t = setInterval(() => setTime((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [over]);

  useEffect(() => {
    if (time <= 0 && !over) setOver(true);
  }, [time, over]);

  useEffect(() => {
    if (over) return;
    const spawn = setInterval(() => {
      const id = ++idRef.current;
      const r = Math.random();
      const type: Falling["type"] = r < 0.62 ? "star" : r < 0.78 ? "gem" : "bomb";
      const dur = 2.6 + Math.random() * 1.6;
      setItems((its) => [...its, { id, x: 5 + Math.random() * 88, type, dur }]);
      setTimeout(() => setItems((its) => its.filter((i) => i.id !== id)), dur * 1000);
    }, 550);
    return () => clearInterval(spawn);
  }, [over]);

  useEffect(() => {
    if (over && !rewardSent.current) {
      rewardSent.current = true;
      onDone(Math.max(0, Math.min(score, 40)), 8 + Math.max(0, Math.floor(score / 2)));
    }
  }, [over, score, onDone]);

  const catchItem = (it: Falling) => {
    setItems((its) => its.filter((i) => i.id !== it.id));
    setScore((s) => s + (it.type === "star" ? 1 : it.type === "gem" ? 3 : -3));
  };

  if (over) {
    return (
      <div className="games-screen">
        <GameOver
          title="🌠 ¡Fin de la lluvia!"
          lines={[`Puntaje: ${score}`]}
          coins={Math.max(0, Math.min(score, 40))}
          xp={8 + Math.max(0, Math.floor(score / 2))}
          onRetry={onExit}
          onExit={onExit}
        />
      </div>
    );
  }

  return (
    <div className="games-screen">
      <div className="memory-top">
        <div>
          <h2 className="display map-title">🌠 Lluvia de Estrellas</h2>
          <span className="map-tagline">⭐ +1 · 💎 +3 · 💣 −3</span>
        </div>
        <span className="pill">⏱ {time}s · ⭐ {score}</span>
        <button className="btn ghost small" onClick={onExit}>✕ Salir</button>
      </div>
      <div className="rain-field panel">
        {items.map((it) => (
          <button
            key={it.id}
            className="rain-item"
            style={{ left: `${it.x}%`, animationDuration: `${it.dur}s` }}
            onPointerDown={() => catchItem(it)}
          >
            {it.type === "star" ? "⭐" : it.type === "gem" ? "💎" : "💣"}
          </button>
        ))}
        <div className="rain-avatar">
          <Avatar character={profile.character} size={90} idle />
        </div>
      </div>
    </div>
  );
}

// ── 5. Tablas Ninja (multiplicación con ayuda visual) ────────

const TABLE_ROUNDS = 10;
const TABLE_NUMS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const TABLE_ICONS = ["🍬", "🍓", "⭐", "🍎", "🎈", "🍩", "🐟", "🍀", "🔵", "🌸", "🍋", "🐝"];

// el 1, el 2 y el 10 son las tablas más fáciles (el 10 es solo agregar un
// cero) y pagan poco; el 6, 7 y 8 son las que más cuesta memorizar y el 9
// paga el máximo.
function tableTier(t: number): 1 | 2 | 3 | 4 {
  if (t === 1 || t === 2 || t === 10) return 1;
  if (t <= 5) return 2;
  if (t <= 8) return 3;
  return 4;
}
const TIER_BASE = { 1: 1, 2: 2, 3: 3, 4: 5 } as const;
const TIER_LABEL = { 1: "Fácil", 2: "Media", 3: "Difícil", 4: "Experta" } as const;
const TIER_EMOJI = { 1: "🟢", 2: "🟡", 3: "🟠", 4: "🔴" } as const;

/** Elige tabla + multiplicador al azar, evitando repetir el par anterior. */
function nextPair(tables: number[], last: [number, number] | null): [number, number] {
  let t = tables[0];
  let m = 1;
  do {
    t = tables[Math.floor(Math.random() * tables.length)];
    m = ri(1, 10);
  } while (last && t === last[0] && m === last[1] && tables.length * 10 > 1);
  return [t, m];
}

function Tables({ profile, onDone, onExit }: { profile: Profile; onDone: (c: number, x: number) => void; onExit: () => void }) {
  const [phase, setPhase] = useState<"pick" | "play" | "done">("pick");
  const [tables, setTables] = useState<number[]>([]);
  const [round, setRound] = useState(0);
  const [pair, setPair] = useState<[number, number]>([2, 1]);
  const [icon, setIcon] = useState(TABLE_ICONS[0]);
  const [typedVal, setTypedVal] = useState("");
  const [fx, setFx] = useState<"" | "ok" | "no">("");
  const [coins, setCoins] = useState(0);
  const [xp, setXp] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [lastGain, setLastGain] = useState(0);
  const startAt = useRef(0);
  const lastPair = useRef<[number, number] | null>(null);
  const rewardSent = useRef(false);

  const toggleTable = (t: number) =>
    setTables((ts) => (ts.includes(t) ? ts.filter((x) => x !== t) : [...ts, t].sort((a, b) => a - b)));

  const rollRound = (list: number[], prev: [number, number] | null) => {
    const p = nextPair(list, prev);
    lastPair.current = p;
    setPair(p);
    setIcon(TABLE_ICONS[Math.floor(Math.random() * TABLE_ICONS.length)]);
    setTypedVal("");
    setFx("");
    startAt.current = performance.now();
  };

  const startGame = () => {
    if (tables.length === 0) return;
    setRound(0);
    rollRound(tables, null);
    setPhase("play");
  };

  const retry = () => {
    rewardSent.current = false;
    setCoins(0);
    setXp(0);
    setCorrectCount(0);
    setStreak(0);
    setBestStreak(0);
    startGame();
  };

  const answer = pair[0] * pair[1];

  const submit = (val: string) => {
    if (fx || phase !== "play") return;
    const ok = Number(val) === answer;
    const elapsed = performance.now() - startAt.current;
    let gained = 0;
    let gxp = 0;
    if (ok) {
      const base = TIER_BASE[tableTier(pair[0])];
      const speedMult = elapsed < 1500 ? 2 : elapsed < 3000 ? 1.5 : elapsed < 6000 ? 1 : 0.5;
      gained = Math.round(base * speedMult) + Math.min(streak, 3);
      gxp = Math.round(base * 0.8) + 1;
      setCorrectCount((c) => c + 1);
      setStreak((s) => {
        const ns = s + 1;
        setBestStreak((b) => Math.max(b, ns));
        return ns;
      });
    } else {
      setStreak(0);
    }
    setLastGain(gained);
    setCoins((c) => c + gained);
    setXp((x) => x + gxp);
    setFx(ok ? "ok" : "no");
    const r = round + 1;
    setTimeout(() => {
      setRound(r);
      if (r >= TABLE_ROUNDS) setPhase("done");
      else rollRound(tables, lastPair.current);
    }, ok ? 650 : 1000);
  };

  const onTyped = (val: string) => {
    if (fx) return;
    setTypedVal(val);
    if (val !== "" && val.length >= String(answer).length) submit(val);
  };

  // teclado físico, igual que en las lecciones
  useEffect(() => {
    if (phase !== "play" || fx) return;
    const onKey = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) onTyped(typedVal + e.key);
      else if (e.key === "Backspace") setTypedVal((v) => v.slice(0, -1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, fx, typedVal]);

  useEffect(() => {
    if (phase === "done" && !rewardSent.current) {
      rewardSent.current = true;
      onDone(coins, xp);
    }
  }, [phase, coins, xp, onDone]);

  if (phase === "pick") {
    return (
      <div className="games-screen">
        <div className="map-header">
          <button className="btn ghost" onClick={onExit}>← Volver</button>
          <h2 className="display map-title">✖️ Tablas Ninja</h2>
          <span className="map-tagline">Elegí qué tablas querés practicar</span>
        </div>
        <div className="table-picker panel">
          <p className="table-picker-hint">🪙 Las tablas más difíciles pagan más monedas — ¡animate a elegirlas!</p>
          <div className="table-grid">
            {TABLE_NUMS.map((t) => {
              const tier = tableTier(t);
              return (
                <button
                  key={t}
                  className={`table-chip ${tables.includes(t) ? "on" : ""}`}
                  onClick={() => toggleTable(t)}
                >
                  <b className="display">×{t}</b>
                  <span className="table-chip-tier">
                    {TIER_EMOJI[tier]} {TIER_LABEL[tier]}
                  </span>
                  <span className="table-chip-pay">🪙{TIER_BASE[tier]}+</span>
                </button>
              );
            })}
          </div>
          <div className="table-picker-actions">
            <button className="btn ghost small" onClick={() => setTables(TABLE_NUMS)}>Elegir todas</button>
            <button className="btn ghost small" disabled={tables.length === 0} onClick={() => setTables([])}>
              Ninguna
            </button>
          </div>
          <button className="btn primary big" disabled={tables.length === 0} onClick={startGame}>
            {tables.length === 0
              ? "Elegí al menos una tabla"
              : `¡Empezar! (${tables.length} ${tables.length === 1 ? "tabla" : "tablas"}) →`}
          </button>
        </div>
      </div>
    );
  }

  if (phase === "done") {
    return (
      <div className="games-screen">
        <GameOver
          title={
            correctCount === TABLE_ROUNDS
              ? "✖️ ¡Tablas perfectas!"
              : correctCount >= TABLE_ROUNDS * 0.7
              ? "✖️ ¡Muy bien!"
              : "✖️ ¡Sigue practicando!"
          }
          lines={[`Acertaste ${correctCount} de ${TABLE_ROUNDS}`, `Mejor racha: 🔥 ${bestStreak}`]}
          coins={coins}
          xp={xp}
          onRetry={retry}
          onExit={onExit}
        />
      </div>
    );
  }

  const dense = pair[0] * pair[1] > 40;

  return (
    <div className="games-screen">
      <div className="memory-top">
        <Avatar character={profile.character} size={80} idle />
        <div>
          <h2 className="display map-title">✖️ Tablas Ninja</h2>
          <span className="map-tagline">
            Pregunta {Math.min(round + 1, TABLE_ROUNDS)} de {TABLE_ROUNDS}
            {streak >= 3 && <span className="streak-flame"> 🔥 {streak}</span>}
          </span>
        </div>
        <span className="pill coin">🪙 {coins}</span>
        <button className="btn ghost small" onClick={onExit}>✕ Salir</button>
      </div>

      <div className="tbl-stage panel">
        <div className={`tbl-visual ${fx} ${dense ? "dense" : ""}`}>
          {Array.from({ length: pair[0] }, (_, r) => (
            <div className="tbl-row" key={r}>
              {Array.from({ length: pair[1] }, (_, c) => (
                <span key={c} className="tbl-dot">{icon}</span>
              ))}
            </div>
          ))}
        </div>

        <div className="tbl-equation display">
          <span>{pair[0]} × {pair[1]} =</span>
          <span className={`tbl-answer ${typedVal ? "filled" : ""}`}>{typedVal || "?"}</span>
        </div>

        <div className="tbl-fx display">
          {fx === "ok" && `✨ ¡Bien! +${lastGain} 🪙`}
          {fx === "no" && `💡 Era ${answer}`}
        </div>

        <div className="type-area">
          <div className="numpad">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
              <button
                key={d}
                className="numpad-btn display"
                disabled={!!fx}
                onClick={() => onTyped(typedVal + d)}
              >
                {d}
              </button>
            ))}
            <button
              className="numpad-btn aux"
              disabled={!!fx || typedVal === ""}
              onClick={() => setTypedVal((v) => v.slice(0, -1))}
            >
              ⌫
            </button>
            <button className="numpad-btn display" disabled={!!fx} onClick={() => onTyped(typedVal + "0")}>
              0
            </button>
            <span className="numpad-spacer" />
          </div>
        </div>
      </div>
    </div>
  );
}
