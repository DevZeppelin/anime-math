"use client";

import React, { useState } from "react";
import type { ItemType, Profile } from "@/lib/types";
import { RARITY_META } from "@/lib/types";
import { ALL_ITEMS, ITEM_TYPE_META, getItem } from "@/lib/items";
import HeroStage from "./HeroStage";
import AppearanceEditor from "./AppearanceEditor";

interface Props {
  profile: Profile;
  updateProfile: (fn: (p: Profile) => Profile) => void;
  onBack: () => void;
}

type Tab = "look" | ItemType;
const TABS: Tab[] = ["look", "outfit", "weapon", "accessory", "back", "necklace", "ring", "boots", "pet", "aura", "background"];

const SLOT: Record<ItemType, keyof Profile["character"]> = {
  outfit: "outfit",
  weapon: "weapon",
  accessory: "accessory",
  back: "back",
  necklace: "necklace",
  ring: "ring",
  boots: "boots",
  pet: "pet",
  aura: "aura",
  background: "background",
};

export default function Wardrobe({ profile, updateProfile, onBack }: Props) {
  const [tab, setTab] = useState<Tab>("look");
  const ch = profile.character;

  const setChar = (patch: Partial<Profile["character"]>) =>
    updateProfile((p) => ({ ...p, character: { ...p.character, ...patch } }));

  return (
    <div className="wardrobe-screen">
      <div className="map-header">
        <button className="btn ghost" onClick={onBack}>← Volver</button>
        <h2 className="display map-title">👕 Vestuario</h2>
        <span className="map-tagline">Personaliza tu héroe con todo lo que has ganado</span>
      </div>

      <div className="shop-layout">
        <aside className="panel shop-preview">
          <HeroStage character={ch} size={170} showBackground name={profile.name} />
        </aside>

        <div className="shop-main">
          <div className="tab-row">
            {TABS.map((t) => (
              <button key={t} className={`tab ${tab === t ? "sel" : ""}`} onClick={() => setTab(t)}>
                {t === "look" ? "🎨 Apariencia" : `${ITEM_TYPE_META[t].emoji} ${ITEM_TYPE_META[t].label}`}
              </button>
            ))}
          </div>

          {tab === "look" ? (
            <div className="look-panels">
              <AppearanceEditor character={ch} onChange={setChar} />
            </div>
          ) : (
            (() => {
              const t = tab as ItemType;
              const ownedItems = ALL_ITEMS.filter((i) => i.type === t && profile.owned.includes(i.id));

              if (t === "weapon") {
                const mainItem = getItem(ch.weapon);
                const offItem = getItem(ch.weapon2);
                return (
                  <div className="shop-grid">
                    <div className="weapon-hands-hint">
                      <span>✋ Mano principal: <b>{mainItem?.name ?? "Ninguna"}</b></span>
                      <span>🤚 Mano secundaria: <b>{offItem?.name ?? "Ninguna"}</b></span>
                    </div>
                    {ownedItems.map((item) => {
                      const rar = RARITY_META[item.rarity];
                      const inMain = ch.weapon === item.id;
                      const inOff = ch.weapon2 === item.id;
                      return (
                        <div
                          key={item.id}
                          className={`shop-card panel ${inMain || inOff ? "equipped" : ""}`}
                          style={{ ["--rar" as never]: rar.color }}
                        >
                          <span className="rarity-tag" style={{ color: rar.color }}>{rar.label}</span>
                          <span className="shop-emoji">{item.emoji}</span>
                          <b className="display">{item.name}</b>
                          <div className="hand-btns">
                            <button
                              className={`btn small ${inMain ? "equip" : "ghost"}`}
                              onClick={() => setChar({ weapon: inMain ? null : item.id })}
                            >
                              {inMain ? "✋ Quitar" : "✋ Principal"}
                            </button>
                            <button
                              className={`btn small ${inOff ? "equip" : "ghost"}`}
                              onClick={() => setChar({ weapon2: inOff ? null : item.id })}
                            >
                              {inOff ? "🤚 Quitar" : "🤚 Secundaria"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    {ownedItems.length === 0 && (
                      <p className="empty-hint">
                        Aún no tienes {ITEM_TYPE_META[t].label.toLowerCase()}. ¡Gana monedas en las lecciones y visita la tienda! 🛒
                      </p>
                    )}
                  </div>
                );
              }

              const slot = SLOT[t];
              const current = ch[slot];
              return (
                <div className="shop-grid">
                  {t !== "outfit" && (
                    <button
                      className={`shop-card panel none-card ${current === null ? "equipped" : ""}`}
                      onClick={() => setChar({ [slot]: null } as Partial<Profile["character"]>)}
                    >
                      <span className="shop-emoji">🚫</span>
                      <b className="display">Nada</b>
                      <small className="shop-desc">Quitar este equipo</small>
                      {current === null && <span className="owned-tag">⭐ Equipado</span>}
                    </button>
                  )}
                  {ownedItems.map((item) => {
                    const rar = RARITY_META[item.rarity];
                    const equipped = current === item.id;
                    return (
                      <button
                        key={item.id}
                        className={`shop-card panel ${equipped ? "equipped" : ""}`}
                        style={{ ["--rar" as never]: rar.color }}
                        onClick={() => setChar({ [slot]: item.id } as Partial<Profile["character"]>)}
                      >
                        <span className="rarity-tag" style={{ color: rar.color }}>{rar.label}</span>
                        <span className="shop-emoji">{item.emoji}</span>
                        <b className="display">{item.name}</b>
                        {equipped && <span className="owned-tag">⭐ Equipado</span>}
                      </button>
                    );
                  })}
                  {ownedItems.length === 0 && (
                    <p className="empty-hint">
                      Aún no tienes {ITEM_TYPE_META[t].label.toLowerCase()}. ¡Gana monedas en las lecciones y visita la tienda! 🛒
                    </p>
                  )}
                </div>
              );
            })()
          )}
        </div>
      </div>
    </div>
  );
}
