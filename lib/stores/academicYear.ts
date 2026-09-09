"use client";

import { create } from "zustand";
import {
  ACADEMIC_YEAR_STORAGE_KEY,
  DEFAULT_ACADEMIC_YEAR,
  isAcademicYearId,
  type AcademicYearId,
} from "@/lib/constants/academic-year";

function readStoredYear(): AcademicYearId {
  if (typeof window === "undefined") return DEFAULT_ACADEMIC_YEAR;
  try {
    const value = window.localStorage.getItem(ACADEMIC_YEAR_STORAGE_KEY);
    if (isAcademicYearId(value)) return value;
  } catch {
    /* ignore quota / private mode */
  }
  return DEFAULT_ACADEMIC_YEAR;
}

function writeStoredYear(year: AcademicYearId): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ACADEMIC_YEAR_STORAGE_KEY, year);
  } catch {
    /* ignore */
  }
}

interface AcademicYearState {
  year: AcademicYearId;
  hydrated: boolean;
  setYear: (year: AcademicYearId) => void;
  hydrate: () => void;
}

/**
 * 当前学年单一真相源。书架顶栏与设置共用；落地 localStorage。
 * 默认大二上学期（当前学期）；切到尚无教材的学期只显示空书架。
 */
export const useAcademicYear = create<AcademicYearState>((set) => ({
  year: DEFAULT_ACADEMIC_YEAR,
  hydrated: false,
  setYear: (year) => {
    writeStoredYear(year);
    set({ year, hydrated: true });
  },
  hydrate: () => set({ year: readStoredYear(), hydrated: true }),
}));
