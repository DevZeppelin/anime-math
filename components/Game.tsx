"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { Profile, RootSave } from "@/lib/types";
import {
  loadRoot,
  saveRoot,
  upsertProfile,
  deleteProfile,
  touchDailyStreak,
  resetProfileProgress,
  resolveImportCollision,
  MAX_PROFILES,
} from "@/lib/storage";
import { levelFromXp, levelProgress, levelUpReward, checkAchievements, levelKey } from "@/lib/progression";
import { getSubject } from "@/lib/content";
import Avatar from "./Avatar";
import ProfileSelect from "./ProfileSelect";
import Dashboard from "./Dashboard";
import SubjectMap from "./SubjectMap";

// pantallas que no hacen falta en la primera pintada: cada una se baja como
// un chunk aparte solo cuando el jugador realmente navega ahí, así el bundle
// inicial (selección de perfil + inicio) pesa mucho menos en celulares viejos.
const screenLoading = () => <div className="shell center-load" />;
const CharacterCreator = dynamic(() => import("./CharacterCreator"), { ssr: false, loading: screenLoading });
const LessonPlayer = dynamic(() => import("./LessonPlayer"), { ssr: false, loading: screenLoading });
const Shop = dynamic(() => import("./Shop"), { ssr: false, loading: screenLoading });
const Wardrobe = dynamic(() => import("./Wardrobe"), { ssr: false, loading: screenLoading });
const Achievements = dynamic(() => import("./Achievements"), { ssr: false, loading: screenLoading });
const Minigames = dynamic(() => import("./Minigames"), { ssr: false, loading: screenLoading });

type Screen =
  | { t: "profiles" }
  | { t: "create" }
  | { t: "home" }
  | { t: "subject"; id: string }
  | { t: "lesson"; subject: string; idx: number }
  | { t: "shop" }
  | { t: "wardrobe" }
  | { t: "achievements" }
  | { t: "games" };

interface Toast {
  id: number;
  emoji: string;
  title: string;
  sub?: string;
}

export default function Game() {
  const [root, setRoot] = useState<RootSave | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [screen, setScreen] = useState<Screen>({ t: "profiles" });
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);
  // fuente de verdad síncrona: evita efectos secundarios dentro de updaters
  const rootRef = useRef<RootSave | null>(null);

  useEffect(() => {
    const r = loadRoot();
    rootRef.current = r;
    setRoot(r);
  }, []);

  const commit = useCallback((nr: RootSave) => {
    rootRef.current = nr;
    saveRoot(nr);
    setRoot(nr);
  }, []);

  const pushToast = useCallback((emoji: string, title: string, sub?: string) => {
    const id = ++toastId.current;
    setToasts((ts) => [...ts, { id, emoji, title, sub }]);
    setTimeout(() => setToasts((ts) => ts.filter((t) => t.id !== id)), 4200);
  }, []);

  /** Aplica un cambio al perfil activo + revisa subidas de nivel y logros. */
  const updateProfile = useCallback(
    (fn: (p: Profile) => Profile) => {
      const r = rootRef.current;
      if (!r || !activeId || !r.profiles[activeId]) return;
      const prev = r.profiles[activeId];
      let next = fn(prev);

      // subida de nivel de jugador
      const beforeLv = levelFromXp(prev.xp);
      const afterLv = levelFromXp(next.xp);
      if (afterLv > beforeLv) {
        let coins = 0;
        let gems = 0;
        for (let lv = beforeLv + 1; lv <= afterLv; lv++) {
          const rw = levelUpReward(lv);
          coins += rw.coins;
          gems += rw.gems;
        }
        next = { ...next, coins: next.coins + coins, gems: next.gems + gems };
        pushToast("🆙", `¡Nivel ${afterLv}!`, `+${coins} monedas · +${gems} gemas`);
      }

      // logros
      const res = checkAchievements(next);
      next = res.profile;
      for (const a of res.unlocked) {
        pushToast(a.emoji, `Logro: ${a.name}`, `+${a.gems} 💎 — ${a.desc}`);
      }

      commit(upsertProfile(r, next));
    },
    [activeId, pushToast, commit]
  );

  const enterProfile = useCallback(
    (id: string) => {
      setActiveId(id);
      setScreen({ t: "home" });
      const r = rootRef.current;
      if (!r || !r.profiles[id]) return;
      const { profile, firstToday } = touchDailyStreak(r.profiles[id]);
      let next = profile;
      if (firstToday) {
        const bonus = 10 + 5 * Math.min(profile.streakDays, 7);
        next = { ...next, coins: next.coins + bonus };
        pushToast("🔥", `¡Día ${profile.streakDays} de racha!`, `Bono diario: +${bonus} monedas`);
      }
      const res = checkAchievements(next);
      next = res.profile;
      for (const a of res.unlocked) pushToast(a.emoji, `Logro: ${a.name}`, `+${a.gems} 💎`);
      commit(upsertProfile(r, next));
    },
    [pushToast, commit]
  );

  if (!root) {
    return (
      <div className="shell center-load">
        <div className="display" style={{ fontSize: 28 }}>⚡ Cargando…</div>
      </div>
    );
  }

  const profile = activeId ? (root.profiles[activeId] ?? null) : null;

  // ── barra superior ─────────────────────────────────────────
  const showHeader = profile && screen.t !== "profiles" && screen.t !== "create" && screen.t !== "lesson";
  const lp = profile ? levelProgress(profile.xp) : null;

  return (
    <div className="shell">
      {showHeader && profile && lp && (
        <header className="topbar">
          <button className="profile-chip" onClick={() => setScreen({ t: "home" })} title="Ir al inicio">
            <span className="chip-avatar">
              <Avatar character={profile.character} size={40} />
            </span>
            <span className="chip-info">
              <b className="display">{profile.name}</b>
              <span className="chip-level">
                Nv {lp.level}
                <span className="xpbar">
                  <span className="xpbar-fill" style={{ width: `${Math.round((lp.into / lp.needed) * 100)}%` }} />
                </span>
              </span>
            </span>
          </button>
          <div className="top-right">
            <span className="pill coin">🪙 {profile.coins}</span>
            <span className="pill gem">💎 {profile.gems}</span>
            <span className="pill streak" title="Racha de días">🔥 {profile.streakDays}</span>
            <button
              className="pill exit"
              onClick={() => {
                setActiveId(null);
                setScreen({ t: "profiles" });
              }}
              title="Cambiar de perfil"
            >
              👥
            </button>
          </div>
        </header>
      )}

      {screen.t === "profiles" && (
        <ProfileSelect
          root={root}
          onSelect={enterProfile}
          onCreate={() => setScreen({ t: "create" })}
          onDelete={(id) => {
            const r = rootRef.current;
            if (r) commit(deleteProfile(r, id));
          }}
          onReset={(id) => {
            const r = rootRef.current;
            const prev = r?.profiles[id];
            if (!r || !prev) return;
            commit(upsertProfile(r, resetProfileProgress(prev)));
            pushToast("🔄", "Progreso reiniciado", "Nivel, lecciones y logros a cero — monedas e ítems intactos");
          }}
          onImport={(profile) => {
            const r = rootRef.current ?? { v: 1, profiles: {}, order: [] };
            if (r.order.length >= MAX_PROFILES) {
              pushToast("⚠️", "Límite de héroes", `Ya tenés ${MAX_PROFILES} personajes`);
              return;
            }
            const resolved = resolveImportCollision(profile, r.order);
            commit(upsertProfile(r, resolved));
            pushToast("📥", "Héroe importado", resolved.name);
          }}
        />
      )}

      {screen.t === "create" && (
        <CharacterCreator
          onCancel={() => setScreen({ t: "profiles" })}
          onDone={(p) => {
            const r = rootRef.current ?? { v: 1, profiles: {}, order: [] };
            commit(upsertProfile(r, p));
            enterProfile(p.id);
          }}
        />
      )}

      {screen.t === "home" && profile && (
        <Dashboard
          profile={profile}
          onOpenSubject={(id) => setScreen({ t: "subject", id })}
          onNav={(t) => setScreen({ t } as Screen)}
          onDifficulty={(d) => {
            updateProfile((p) => ({ ...p, difficulty: d }));
            pushToast("🎚️", `Modo ${d === "facil" ? "Explorador" : d === "normal" ? "Aventurero" : "Maestro"}`, "Las lecciones se adaptan a este nivel");
          }}
        />
      )}

      {screen.t === "subject" && profile && (() => {
        const subject = getSubject(screen.id);
        if (!subject) return null;
        return (
          <SubjectMap
            subject={subject}
            profile={profile}
            onBack={() => setScreen({ t: "home" })}
            onPlay={(idx) => setScreen({ t: "lesson", subject: subject.id, idx })}
          />
        );
      })()}

      {screen.t === "lesson" && profile && (() => {
        const subject = getSubject(screen.subject);
        if (!subject) return null;
        const idx = screen.idx;
        return (
          <LessonPlayer
            key={`${subject.id}-${idx}`}
            subject={subject}
            levelIdx={idx}
            profile={profile}
            onComplete={(res) => {
              updateProfile((p) => {
                const key = levelKey(subject.id, idx, p.difficulty ?? "normal");
                const prevRec = p.levels[key] ?? { stars: 0 as const, plays: 0 };
                const firstThreeStars = res.passed && res.stars === 3 && prevRec.stars < 3;
                return {
                  ...p,
                  coins: p.coins + res.coins,
                  xp: p.xp + res.xp,
                  gems: p.gems + (firstThreeStars ? 1 : 0),
                  levels: {
                    ...p.levels,
                    [key]: {
                      stars: Math.max(prevRec.stars, res.passed ? res.stars : 0) as 0 | 1 | 2 | 3,
                      plays: prevRec.plays + 1,
                    },
                  },
                  stats: {
                    ...p.stats,
                    answered: p.stats.answered + res.answered,
                    correct: p.stats.correct + res.correct,
                    lessons: p.stats.lessons + (res.passed ? 1 : 0),
                    perfects: p.stats.perfects + (res.passed && res.stars === 3 ? 1 : 0),
                    bestStreak: Math.max(p.stats.bestStreak, res.bestStreak),
                  },
                };
              });
            }}
            onExit={() => setScreen({ t: "subject", id: subject.id })}
          />
        );
      })()}

      {screen.t === "shop" && profile && (
        <Shop profile={profile} updateProfile={updateProfile} onBack={() => setScreen({ t: "home" })} />
      )}

      {screen.t === "wardrobe" && profile && (
        <Wardrobe profile={profile} updateProfile={updateProfile} onBack={() => setScreen({ t: "home" })} />
      )}

      {screen.t === "achievements" && profile && (
        <Achievements profile={profile} onBack={() => setScreen({ t: "home" })} />
      )}

      {screen.t === "games" && profile && (
        <Minigames
          profile={profile}
          onBack={() => setScreen({ t: "home" })}
          onReward={(coins, xp) => {
            updateProfile((p) => ({
              ...p,
              coins: p.coins + coins,
              xp: p.xp + xp,
              stats: { ...p.stats, minigames: p.stats.minigames + 1 },
            }));
          }}
        />
      )}

      {/* toasts */}
      <div className="toasts">
        {toasts.map((t) => (
          <div key={t.id} className="toast">
            <span className="toast-emoji">{t.emoji}</span>
            <span>
              <b>{t.title}</b>
              {t.sub && <small>{t.sub}</small>}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
