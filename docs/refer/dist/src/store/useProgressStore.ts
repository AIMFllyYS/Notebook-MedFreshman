import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ProgressState {
  completedSections: Set<string>;
  currentChapter: number;
  currentSection: string;
  markSectionComplete: (sectionId: string) => void;
  setCurrentChapter: (chapterId: number) => void;
  setCurrentSection: (sectionId: string) => void;
  getChapterProgress: (chapterId: number, totalSections: number) => { completed: number; total: number; percentage: number };
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      completedSections: new Set(),
      currentChapter: 1,
      currentSection: '1.1',
      
      markSectionComplete: (sectionId) => 
        set((state) => {
          const newSet = new Set(state.completedSections);
          newSet.add(sectionId);
          return { completedSections: newSet };
        }),
        
      setCurrentChapter: (chapterId) => set({ currentChapter: chapterId }),
      setCurrentSection: (sectionId) => set({ currentSection: sectionId }),
      
      getChapterProgress: (chapterId, totalSections) => {
        const state = get();
        // naive check for sections starting with chapterId
        const prefix = `${chapterId}.`;
        let count = 0;
        state.completedSections.forEach(sec => {
          if (sec.startsWith(prefix)) count++;
        });
        return {
          completed: count,
          total: totalSections,
          percentage: totalSections > 0 ? Math.round((count / totalSections) * 100) : 0
        };
      }
    }),
    {
      name: 'prob-progress',
      // Need custom serialization for Set
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const parsed = JSON.parse(str);
          return {
            state: {
              ...parsed.state,
              completedSections: new Set(parsed.state.completedSections)
            }
          };
        },
        setItem: (name, value) => {
          const state = value.state as any;
          localStorage.setItem(name, JSON.stringify({
            state: {
              ...state,
              completedSections: Array.from(state.completedSections)
            }
          }));
        },
        removeItem: (name) => localStorage.removeItem(name)
      }
    }
  )
);
