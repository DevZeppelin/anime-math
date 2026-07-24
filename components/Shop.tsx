"use client";

import React, { useState } from "react";
import type { ItemDef, ItemType, Profile } from "@/lib/types";
import { RARITY_META } from "@/lib/types";
import { ALL_ITEMS, ABILITIES, ITEM_TYPE_META } from "@/lib/items";
import HeroStage from "./HeroStage";

interface Props {
  profile: Profile;
  updateProfile: (fn: (p: Profile) => Profile) => void;
  onBack: () => void;
}

const TABS: (ItemType | "ability")[] = [
  "outfit", "weapon", "accessory", "back", "necklace", "ring", "boots", "pet", "aura", "background", "ability",
];

function equipPatch(item: ItemDef): Partial<Profile["character"]> {
  switch (item.type) {
    case "outfit": return { outfit: item.id };
    case "weapon": return { weapon: item.id };
    case "accessory": return { accessory: item.id };
    case "back": return { back: item.id };
    case "necklace": return { necklace: item.id };
    case "ring": return { ring: item.id };
    case "boots": return { boots: item.id };
    case "pet": return { pet: item.id };
    case "aura": return { aura: item.id };
    case "background": return { background: item.id };
  }
}

export function isEquipped(p: Profile, item: ItemDef): boolean {
  const c = p.character;
  return (
    c.outfit === item.id || c.weapon === item.id || c.weapon2 === item.id || c.accessory === item.id ||
    c.back === item.id || c.necklace === item.id || c.ring === item.id || c.boots === item.id ||
    c.pet === item.id || c.aura === item.id || c.background === item.id
  );
}

export default function Shop({ profile, updateProfile, onBack }: Props) {
  const [tab, setTab] = useState<ItemType | "ability">("outfit");

  const sorted = ALL_ITEMS.filter((i) => i.type === tab).sort(
    (a, b) => RARITY_META[a.rarity].order - RARITY_META[b.rarity].order || (a.gems ?? 0) - (b.gems ?? 0) || a.price - b.price
  );

  return (
    <div className="shop-screen">
      <div className="map-header">
        <button className="btn ghost" onClick={onBack}>← Volver</button>
        <h2 className="display map-title">🛒 Tienda Mágica</h2>
        <span className="map-tagline">Gana monedas y gemas estudiando para conseguirlo todo</span>
      </div>

      <div className="shop-layout">
        <aside className="panel shop-preview">
          <HeroStage character={profile.character} size={160} showBackground />
          <div className="shop-wallet">
            <span className="pill coin">🪙 {profile.coins}</span>
            <span className="pill gem">💎 {profile.gems}</span>
          </div>
        </aside>

        <div className="shop-main">
          <div className="tab-row">
            {TABS.map((t) => (
              <button key={t} className={`tab ${tab === t ? "sel" : ""}`} onClick={() => setTab(t)}>
                {t === "ability" ? "💫 Habilidades" : `${ITEM_TYPE_META[t].emoji} ${ITEM_TYPE_META[t].label}`}
              </button>
            ))}
          </div>

          {tab === "ability" ? (
            <div className="shop-grid">
              {ABILITIES.map((a) => {
                const owned = profile.abilities.includes(a.id);
                const canBuy = profile.gems >= a.gems;
                return (
                  <div key={a.id} className="shop-card panel ability-card">
                    <span className="shop-emoji">{a.emoji}</span>
                    <b className="display">{a.name}</b>
                    <small className="shop-desc">{a.desc}</small>
                    {owned ? (
                      <span className="owned-tag">✅ Aprendida</span>
                    ) : (
                      <button
                        className="btn buy"
                        disabled={!canBuy}
                        onClick={() =>
                          updateProfile((p) =>
                            p.gems >= a.gems && !p.abilities.includes(a.id)
                              ? { ...p, gems: p.gems - a.gems, abilities: [...p.abilities, a.id] }
                              : p
                          )
                        }
                      >
                        💎 {a.gems}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="shop-grid">
              {sorted.map((item) => {
                const owned = profile.owned.includes(item.id);
                const equipped = isEquipped(profile, item);
                const useGems = (item.gems ?? 0) > 0;
                const canBuy = useGems ? profile.gems >= item.gems! : profile.coins >= item.price;
                const rar = RARITY_META[item.rarity];
                return (
                  <div key={item.id} className="shop-card panel" style={{ ["--rar" as never]: rar.color, ["--rarGlow" as never]: rar.glow }}>
                    <span className="rarity-tag" style={{ color: rar.color }}>{rar.label}</span>
                    <span className="shop-emoji">{item.emoji}</span>
                    <b className="display">{item.name}</b>
                    <small className="shop-desc">{item.desc}</small>
                    {!owned ? (
                      item.price === 0 && !useGems ? (
                        <span className="owned-tag">Inicial</span>
                      ) : (
                        <button
                          className="btn buy"
                          disabled={!canBuy}
                          onClick={() =>
                            updateProfile((p) => {
                              if (p.owned.includes(item.id)) return p;
                              if (useGems) {
                                if (p.gems < item.gems!) return p;
                                return { ...p, gems: p.gems - item.gems!, owned: [...p.owned, item.id] };
                              }
                              if (p.coins < item.price) return p;
                              return { ...p, coins: p.coins - item.price, owned: [...p.owned, item.id] };
                            })
                          }
                        >
                          {useGems ? `💎 ${item.gems}` : `🪙 ${item.price}`}
                        </button>
                      )
                    ) : equipped ? (
                      <span className="owned-tag">⭐ Equipado</span>
                    ) : (
                      <button
                        className="btn equip"
                        onClick={() =>
                          updateProfile((p) => ({ ...p, character: { ...p.character, ...equipPatch(item) } }))
                        }
                      >
                        Equipar
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
