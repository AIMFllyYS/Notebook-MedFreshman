import type { Skill } from '@/lib/types/skill';
import { PERSIST_KEYS } from '@/lib/storage/idbStorage';
import { createPersistedStore } from '@/lib/stores/_persist';

// 技能库持久化（IndexedDB，gailvlun-db）。异步水合：首屏为空，消费方用
// useHydrated(useSkills) 门控。最多 20 个技能；来源可以是 .md / ZIP / .skill。

export const MAX_SKILLS = 20;

interface AddSkillInput {
  name: string;
  description: string;
  content: string;
}

interface InstallSkillInput extends AddSkillInput {
  /** 市场条目 id：同 sourceId 已导入则原地更新（保留 id / pinned / 用户改过的名称）。 */
  sourceId: string;
  sourceVersion?: string;
}

export type InstallSkillResult = "added" | "updated" | "full";

interface SkillsState {
  skills: Skill[];
  /** IndexedDB 异步水合完成标志。 */
  _hasHydrated: boolean;
  _setHasHydrated: (v: boolean) => void;
  /** 新增技能；超过 MAX_SKILLS 时拒绝并返回 false。 */
  addSkill: (input: AddSkillInput) => boolean;
  /** 市场导入：同 sourceId 更新内容，否则新增；满员（且非更新）返回 "full"。 */
  installSkill: (input: InstallSkillInput) => InstallSkillResult;
  updateSkill: (id: string, updates: Partial<Pick<Skill, 'name' | 'description'>>) => void;
  deleteSkill: (id: string) => void;
  togglePin: (id: string) => void;
}

export const useSkills = createPersistedStore<SkillsState>(
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

      installSkill: (input) => {
        const existing = get().skills.find((sk) => sk.sourceId === input.sourceId);
        if (existing) {
          set((s) => ({
            skills: s.skills.map((sk) =>
              sk.id === existing.id
                ? { ...sk, description: input.description.trim(), content: input.content, sourceVersion: input.sourceVersion }
                : sk,
            ),
          }));
          return "updated";
        }
        if (get().skills.length >= MAX_SKILLS) return "full";
        const id = `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
        const skill: Skill = {
          id,
          name: input.name.trim() || '未命名技能',
          description: input.description.trim(),
          content: input.content,
          pinned: false,
          createdAt: Date.now(),
          sourceId: input.sourceId,
          sourceVersion: input.sourceVersion,
        };
        set((s) => ({ skills: [...s.skills, skill] }));
        return "added";
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
      storage: "idb",
      partialize: (s) => ({ skills: s.skills }),
      onRehydrateStorage: () => (state) => {
        state?._setHasHydrated(true);
      },
    },
);
