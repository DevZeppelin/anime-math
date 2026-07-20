"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Character, Profile } from "@/lib/types";
import {
  OUTFITS, WEAPONS, ACCESSORIES, SKIN_TONES, HAIR_COLORS, EYE_COLORS,
  HAIR_STYLES, EYE_STYLES, MOUTH_STYLES, FACE_MARKS,
} from "@/lib/items";
import { pick, ri, shuffle } from "@/lib/content/utils";
import Avatar from "./Avatar";

interface Props {
  profile: Profile;
  onBack: () => void;
  onReward: (coins: number, xp: number) => void;
}

type GameId = null | "duel" | "memory" | "stars";

function randomRival(): Character {
  return {
    skin: pick(SKIN_TONES),
    hairStyle: pick(HAIR_STYLES).id,
    hairColor: pick(HAIR_COLORS),
    eyeColor: pick(EYE_COLORS),
    eyeStyle: pick(EYE_STYLES).id,
    mouth: pick(MOUTH_STYLES).id,
    faceMark: pick(FACE_MARKS).id,
    outfit: pick(OUTFITS).id,
    weapon: Math.random() < 0.6 ? pick(WEAPONS).id : null,
    accessory: Math.random() < 0.5 ? pick(ACCESSORIES).id : null,
    pet: null,
    aura: null,
    background: null,
  };
}

const RIVAL_NAMES = ["Kael", "Rin", "Yuki", "Taro", "Hana", "Akira", "Sora", "Zen", "Mei", "Ryu"];

// ─────────────────────────────────────────────────────────────

export default function Minigames({ profile, onBack, onReward }: Props) {
  const [game, setGame] = useState<GameId>(null);

  if (game === "duel") return <Duel profile={profile} onDone={onReward} onExit={() => setGame(null)} />;
  if (game === "memory") return <Memory profile={profile} onDone={onReward} onExit={() => setGame(null)} />;
  if (game === "stars") return <StarRain profile={profile} onDone={onReward} onExit={() => setGame(null)} />;

  return (
    <div className="games-screen">
      <div className="map-header">
        <button className="btn ghost" onClick={onBack}>← Volver</button>
        <h2 className="display map-title">🎮 Arena de Juegos</h2>
        <span className="map-tagline">Luce a tu héroe y gana monedas extra</span>
      </div>
      <div className="games-grid">
        <button className="game-card panel" onClick={() => setGame("duel")}>
          <span className="game-emoji">⚔️</span>
          <b className="display">Duelo Relámpago</b>
          <small>Cálculo veloz contra un rival de la academia. ¡45 segundos!</small>
        </button>
        <button className="game-card panel" onClick={() => setGame("memory")}>
          <span className="game-emoji">🧠</span>
          <b className="display">Memoria Mágica</b>
          <small>Encuentra las parejas en la menor cantidad de intentos.</small>
        </button>
        <button className="game-card panel" onClick={() => setGame("stars")}>
          <span className="game-emoji">🌠</span>
          <b className="display">Lluvia de Estrellas</b>
          <small>Atrapa estrellas y esquiva bombas durante 30 segundos.</small>
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

// ── 1. Duelo Relámpago ───────────────────────────────────────

const DUEL_SECONDS = 45;

function duelQuestion() {
  const kind = ri(1, 3);
  let a: number, b: number, ans: number, prompt: string;
  if (kind === 1) {
    a = ri(3, 30); b = ri(3, 30); ans = a + b; prompt = `${a} + ${b}`;
  } else if (kind === 2) {
    a = ri(10, 40); b = ri(2, a - 2); ans = a - b; prompt = `${a} − ${b}`;
  } else {
    a = ri(2, 9); b = ri(2, 9); ans = a * b; prompt = `${a} × ${b}`;
  }
  const opts = new Set<number>([ans]);
  while (opts.size < 3) {
    const v = ans + ri(1, 6) * (Math.random() < 0.5 ? -1 : 1);
    if (v >= 0) opts.add(v);
  }
  return { prompt, ans, opts: shuffle([...opts]) };
}

function Duel({ profile, onDone, onExit }: { profile: Profile; onDone: (c: number, x: number) => void; onExit: () => void }) {
  const rival = useMemo(randomRival, []);
  const rivalName = useMemo(() => pick(RIVAL_NAMES.filter((n) => n !== profile.name)), [profile.name]);
  const [q, setQ] = useState(duelQuestion);
  const [score, setScore] = useState(0);
  const [rivalScore, setRivalScore] = useState(0);
  const [time, setTime] = useState(DUEL_SECONDS);
  const [flash, setFlash] = useState<"" | "ok" | "no">("");
  const [over, setOver] = useState(false);
  const rewardSent = useRef(false);

  useEffect(() => {
    if (over) return;
    const t = setInterval(() => setTime((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [over]);

  useEffect(() => {
    if (over) return;
    let alive = true;
    const tick = () => {
      if (!alive) return;
      setRivalScore((s) => s + 1);
      timer = setTimeout(tick, ri(2600, 4200));
    };
    let timer = setTimeout(tick, ri(2600, 4200));
    return () => { alive = false; clearTimeout(timer); };
  }, [over]);

  useEffect(() => {
    if (time <= 0 && !over) setOver(true);
  }, [time, over]);

  useEffect(() => {
    if (over && !rewardSent.current) {
      rewardSent.current = true;
      const coins = score > rivalScore ? 30 : score === rivalScore ? 15 : 8;
      onDone(coins, 10 + score);
    }
  }, [over, score, rivalScore, onDone]);

  const answer = (v: number) => {
    if (over) return;
    const ok = v === q.ans;
    if (ok) setScore((s) => s + 1);
    setFlash(ok ? "ok" : "no");
    setTimeout(() => setFlash(""), 250);
    setQ(duelQuestion());
  };

  if (over) {
    const win = score > rivalScore;
    const coins = win ? 30 : score === rivalScore ? 15 : 8;
    return (
      <div className="games-screen">
        <GameOver
          title={win ? "🏆 ¡VICTORIA!" : score === rivalScore ? "🤝 ¡Empate!" : "😅 Derrota…"}
          lines={[`Tú ${score} — ${rivalScore} ${rivalName}`]}
          coins={coins}
          xp={10 + score}
          onRetry={onExit}
          onExit={onExit}
        />
      </div>
    );
  }

  return (
    <div className="games-screen duel">
      <div className="duel-header">
        <div className="duel-side">
          <Avatar character={profile.character} size={90} idle />
          <b className="display">{profile.name}</b>
          <span className="duel-score">{score}</span>
        </div>
        <div className="duel-center">
          <span className="duel-timer display">{time}s</span>
          <span className="duel-vs display">VS</span>
        </div>
        <div className="duel-side rival">
          <Avatar character={rival} size={90} idle />
          <b className="display">{rivalName}</b>
          <span className="duel-score">{rivalScore}</span>
        </div>
      </div>

      <div className={`q-card panel duel-q ${flash === "ok" ? "flash-ok" : flash === "no" ? "flash-no" : ""}`}>
        <p className="q-prompt display duel-prompt">{q.prompt} = ?</p>
        <div className="mc-grid">
          {q.opts.map((o) => (
            <button key={o} className="mc-btn" onClick={() => answer(o)}>
              {o}
            </button>
          ))}
        </div>
      </div>
      <button className="btn ghost small" onClick={onExit}>✕ Salir</button>
    </div>
  );
}

// ── 2. Memoria Mágica ────────────────────────────────────────

const MEMORY_POOL = ["🐉", "⚔️", "🔮", "🏰", "🦄", "🌟", "🧪", "👑", "🦊", "🌙"];

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

// ── 3. Lluvia de Estrellas ───────────────────────────────────

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
            onClick={() => catchItem(it)}
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
