import { describe, it, expect, beforeEach } from 'vitest';
import { useProgressStore } from './useProgressStore';

describe('useProgressStore', () => {
  beforeEach(() => {
    // Clear localStorage and reset store state before each test
    localStorage.clear();
    useProgressStore.setState({
      completedSections: new Set(),
      currentChapter: 1,
      currentSection: '1.1',
    });
  });

  it('should initialize with empty completed sections', () => {
    const state = useProgressStore.getState();
    expect(state.completedSections.size).toBe(0);
    expect(state.currentChapter).toBe(1);
    expect(state.currentSection).toBe('1.1');
  });

  it('should mark a section as complete', () => {
    const { markSectionComplete } = useProgressStore.getState();
    markSectionComplete('1.2');

    const state = useProgressStore.getState();
    expect(state.completedSections.has('1.2')).toBe(true);
    expect(state.completedSections.size).toBe(1);
  });

  it('should not duplicate completed sections', () => {
    const { markSectionComplete } = useProgressStore.getState();
    markSectionComplete('1.2');
    markSectionComplete('1.2');

    const state = useProgressStore.getState();
    expect(state.completedSections.size).toBe(1);
  });

  it('should correctly calculate chapter progress', () => {
    const { markSectionComplete, getChapterProgress } = useProgressStore.getState();
    
    // Total sections = 5
    const progressBefore = getChapterProgress(1, 5);
    expect(progressBefore.completed).toBe(0);
    expect(progressBefore.percentage).toBe(0);

    markSectionComplete('1.1');
    markSectionComplete('1.2');
    markSectionComplete('2.1'); // Different chapter

    const progressAfter = getChapterProgress(1, 5);
    expect(progressAfter.completed).toBe(2);
    expect(progressAfter.percentage).toBe(40);
  });

  it('should update current chapter and section', () => {
    const { setCurrentChapter, setCurrentSection } = useProgressStore.getState();
    
    setCurrentChapter(3);
    setCurrentSection('3.2');

    const state = useProgressStore.getState();
    expect(state.currentChapter).toBe(3);
    expect(state.currentSection).toBe('3.2');
  });
});
