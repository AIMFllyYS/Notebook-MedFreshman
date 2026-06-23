import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Skill } from '@/lib/types/skill';
import { idbStorage, PERSIST_KEYS } from '@/lib/storage/idbStorage';

// 技能库持久化（IndexedDB，gailvlun-db）。异步水合：首屏为空，消费方用
// useHydrated(useSkills) 门控。最多 20 个技能；每个为单个 .md 文件解析而来。

export const MAX_SKILLS = 20;

interface AddSkillInput {
  name: string;
  description: string;
  content: string;
}

interface SkillsState {
  skills: Skill[];
  /** IndexedDB 异步水合完成标志。 */
  _hasHydrated: boolean;
  _setHasHydrated: (v: boolean) => void;
  /** 新增技能；超过 MAX_SKILLS 时拒绝并返回 false。 */
  addSkill: (input: AddSkillInput) => boolean;
  updateSkill: (id: string, updates: Partial<Pick<Skill, 'name' | 'description'>>) => void;
  deleteSkill: (id: string) => void;
  togglePin: (id: string) => void;
}

export const useSkills = create<SkillsState>()(
  persist(
    (set, get) => ({
      skills: [],
      _hasHydrated: false,
      _setHasHydrated: (v) => set({ _hasHydrated: v }),

      addSkill: (input) => {
        if (get().skills.length >= MAX_SKILLS) return false;
        const id = `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
        const skill: Skill = {
          id,
          name: input.name.trim() || '未命名技能',
          description: input.description.trim(),
          content: input.content,
          pinned: false,
          createdAt: Date.now(),
        };
        set((s) => ({ skills: [...s.skills, skill] }));
        return true;
      },

      updateSkill: (id, updates) => {
        set((s) => ({
          skills: s.skills.map((sk) =>
            sk.id === id
              ? {
                  ...sk,
                  ...(updates.name !== undefined ? { name: updates.name } : {}),
                  ...(updates.description !== undefined ? { description: updates.description } : {}),
                }
              : sk,
          ),
        }));
      },

      deleteSkill: (id) => {
        set((s) => ({ skills: s.skills.filter((sk) => sk.id !== id) }));
      },

      togglePin: (id) => {
        set((s) => ({
          skills: s.skills.map((sk) => (sk.id === id ? { ...sk, pinned: !sk.pinned } : sk)),
        }));
      },
    }),
    {
      name: PERSIST_KEYS.skills,
      storage: createJSONStorage(() => idbStorage),
      partialize: (s) => ({ skills: s.skills }),
      onRehydrateStorage: () => (state) => {
        state?._setHasHydrated(true);
      },
    },
  ),
);
