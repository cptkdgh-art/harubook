/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 📘 하루책 (Harubook)
 * 📂 stores / usePartnerStore
 * 🔧 진폭 × 리듬-상호
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { create } from 'zustand';
import { db, now } from '@/lib/db/dexie';
import type { Partner, ThemeType, WorldType, Personality } from '@/types/partner';

/* ════════════════════════════════
   1. STATE INTERFACE
   ════════════════════════════════ */

interface PartnerState {
  partner: Partner | null;
  isOnboarded: boolean;

  loadPartner: () => Promise<void>;
  createPartner: (name: string, theme: ThemeType, world: WorldType, personality: Personality) => Promise<void>;
  updatePartner: (changes: Partial<Partner>) => Promise<void>;
}

/* ════════════════════════════════
   2. STORE
   ════════════════════════════════ */

export const usePartnerStore = create<PartnerState>((set) => ({
  partner: null,
  isOnboarded: false,

  loadPartner: async () => {
    const partner = await db.partner.toCollection().first();
    set({ partner: partner || null, isOnboarded: !!partner });
  },

  createPartner: async (name, theme, world, personality) => {
    await db.partner.clear();
    const newPartner: Partner = {
      name,
      theme,
      world,
      personality,
      relationshipDepth: 1,
      createdAt: now(),
    };
    await db.partner.add(newPartner);
    set({ partner: newPartner, isOnboarded: true });
  },

  updatePartner: async (changes) => {
    const existing = await db.partner.toCollection().first();
    if (existing?.id) {
      await db.partner.update(existing.id, changes);
      const updated = await db.partner.get(existing.id);
      set({ partner: updated || null });
    }
  },
}));
