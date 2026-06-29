"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Settings,
  X,
  Trophy,
  BarChart3,
  Layers,
  Repeat,
  Trash2,
  Palette,
  Keyboard,
  Calculator,
  Atom,
  FlaskConical,
  BookOpen,
  ScrollText,
  Folder,
} from "lucide-react";
import { navTree } from "@/lib/content-data/nav";
import { SUBJECT_ICONS } from "@/lib/constants/subjects";
import { useTheme } from "@/lib/hooks/useTheme";
import { FONT_CHOICES } from "@/lib/theme/appearance";
import {
  getAllProgress,
  getGlobalSummary,
  clearAllProgress,
  chapterLabel,
  compareChapter,
  scoreGrade,
  type ProgressEntry,
} from "@/lib/quiz-progress";
import AppearanceSettingsControls, { APPEARANCE_LABELS } from "./AppearanceSettingsControls";
import SettingsSection from "./SettingsSection";
import KeyboardShortcutsSettings from "./KeyboardShortcutsSettings";
import { useOverlayRegistration } from "@/lib/keyboard/useOverlayRegistration";
import { useKeyboardSettings } from "@/lib/keyboard/useKeyboardSettings";
import { SHORTCUTS } from "@/lib/keyboard/shortcuts";

const SUBJECT_ICON_MAP: Record<string, React.ComponentType<{ size?: number; style?: React.CSSProperties }>> = {
  Calculator,
  Atom,
  FlaskConical,
  BookOpen,
  ScrollText,
  Folder,
};

const SUBJECT_NAME: Record<string, string> = Object.fromEntries(
  navTree.subjects.map((s) => [s.id, s.name]),
);
const SUBJECT_ORDER: string[] = navTree.subjects.map((s) => s.id);

interface SubjectGroup {
  id: string;
  name: string;
  iconName: string;
  items: ProgressEntry[];
  avgBest: number;
}

/** 把扁平成绩按科目分组、排序，并算各科平均最佳分。 */
function groupBySubject(entries: ProgressEntry[]): SubjectGroup[] {
  const byId = new Map<string, ProgressEntry[]>();
  for (const e of entries) {
    const arr = byId.get(e.subjectId) ?? [];
    arr.push(e);
    byId.set(e.subjectId, arr);
  }
  const ids = [...byId.keys()].sort((a, b) => {
    const ia = SUBJECT_ORDER.indexOf(a);
    const ib = SUBJECT_ORDER.indexOf(b);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
  });
  return ids.map((id) => {
    const items = (byId.get(id) ?? []).slice().sort((a, b) => compareChapter(a.chapterId, b.chapterId));
    const avgBest =
      Math.round((items.reduce((acc, e) => acc + e.progress.best, 0) / items.length) * 10) / 10;
    return {
      id,
      name: SUBJECT_NAME[id] ?? id,
      iconName: SUBJECT_ICONS[id as keyof typeof SUBJECT_ICONS] ?? "Folder",
      items,
      avgBest,
    };
  });
}

/** 根据 subjectId + chapterId 在内容树中查找可导航的路由（categoryId + itemId）。 */
function findChapterRoute(subjectId: string, chapterId: string): { categoryId: string; itemId: string } | null {
  const subject = navTree.subjects.find((s) => s.id === subjectId);
  if (!subject) return null;
  for (const category of subject.categories) {
    for (const item of category.items) {
      if (item.id === chapterId) {
        if (item.children?.length) {
          return { categoryId: category.id, itemId: item.children[0].id };
        }
        return { categoryId: category.id, itemId: chapterId };
      }
    }
  }
  return null;
}

function StatCard({
  icon,
  value,
  label,
  accent,
}: {
  icon: React.ReactNode;
  value: React.ReactNode;
  label: string;
  accent?: string;
}) {
  return (
    <div
      className="flex flex-1 flex-col gap-1 rounded-[var(--md-sys-shape-corner-large,16px)] px-3.5 py-3"
      style={{
        background: "var(--md-sys-color-surface-container)",
        border: "1px solid var(--md-sys-color-outline-variant)",
      }}
    >
      <span className="flex items-center gap-1.5" style={{ color: accent ?? "var(--md-sys-color-primary)" }}>
        {icon}
        <span className="text-[20px] font-extrabold leading-none">{value}</span>
      </span>
      <span className="text-[11.5px] text-[var(--md-sys-color-on-surface-variant)]">{label}</span>
    </div>
  );
}

function ScoreBadge({ percent }: { percent: number }) {
  const grade = scoreGrade(percent);
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[12px] font-bold tabular-nums"
      style={{ color: grade.color, background: `color-mix(in srgb, ${grade.color} 14%, transparent)` }}
      title={grade.label}
    >
      {percent}
    </span>
  );
}

interface PopoverPos {
  left: number;
  bottom: number;
  width: number;
  maxHeight: number;
}

/** 由锚点按钮计算「在其上方弹出」的浮层位置（向上生长，靠左对齐，视口内夹取）。 */
function computePos(anchor: HTMLElement | null): PopoverPos {
  const gap = 8;
  const margin = 8;
  const vw = typeof window !== "undefined" ? window.innerWidth : 1280;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  const width = Math.min(420, vw - margin * 2);
  if (!anchor) {
    return { left: margin, bottom: 48, width, maxHeight: vh - 64 };
  }
  const r = anchor.getBoundingClientRect();
  let left = r.left;
  if (left + width > vw - margin) left = vw - margin - width;
  if (left < margin) left = margin;
  return {
    left,
    bottom: Math.max(margin, vh - r.top + gap),
    width,
    maxHeight: Math.max(160, r.top - gap - margin),
  };
}

/**
 * 全局「设置」面板：以学习成绩为核心，外加外观与数据管理。
 * 锚定在侧栏底部「设置」按钮上方弹出，无背景遮罩/虚化（不打断阅读），点击外部 / Esc 关闭。
 */
export default function GlobalSettings({
  onClose,
  anchorRef,
}: {
  onClose: () => void;
  anchorRef?: React.RefObject<HTMLButtonElement | null>;
}) {
  const theme = useTheme((s) => s.theme);
  const setTheme = useTheme((s) => s.setTheme);
  const appearance = useTheme((s) => s.appearance);
  const setAppearanceMode = useTheme((s) => s.setAppearanceMode);
  const setCustomAppearance = useTheme((s) => s.setCustomAppearance);
  const resetAppearance = useTheme((s) => s.resetAppearance);
  const router = useRouter();

  const [entries, setEntries] = useState<ProgressEntry[]>(() => getAllProgress());
  const [confirmClear, setConfirmClear] = useState(false);
  const [pos, setPos] = useState<PopoverPos>(() => computePos(null));
  const panelRef = useRef<HTMLDivElement>(null);

  useOverlayRegistration({ id: "global-settings", open: true, onClose, priority: 50 });

  // 定位：打开时即算，并随窗口尺寸 / 滚动更新。
  useLayoutEffect(() => {
    const update = () => setPos(computePos(anchorRef?.current ?? null));
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [anchorRef]);

  // 点击外部关闭（无遮罩层，靠监听实现，不影响页面交互）。Esc 由全局 overlay 栈处理。
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (panelRef.current?.contains(t)) return;
      if (anchorRef?.current?.contains(t)) return;
      onClose();
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [onClose, anchorRef]);

  const summary = useMemo(() => getGlobalSummary(entries), [entries]);
  const groups = useMemo(() => groupBySubject(entries), [entries]);
  const keyboardEnabledCount = useKeyboardSettings((s) => SHORTCUTS.length - s.disabledShortcuts.length);

  const handleClear = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    clearAllProgress();
    setEntries([]);
    setConfirmClear(false);
  };

  const node = (
    <motion.div
      ref={panelRef}
      role="dialog"
      aria-label="设置"
      initial={{ opacity: 0, scale: 0.97, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.18, ease: [0.05, 0.7, 0.1, 1] }}
      className="fixed z-[9998] flex flex-col overflow-hidden rounded-[var(--md-sys-shape-corner-extra-large,28px)]"
      style={{
        left: pos.left,
        bottom: pos.bottom,
        width: pos.width,
        maxHeight: pos.maxHeight,
        transformOrigin: "left bottom",
        background: "var(--md-sys-color-surface-container-low)",
        border: "1px solid var(--md-sys-color-outline-variant)",
        boxShadow: "var(--md-sys-elevation-level3, 0 8px 24px rgba(0,0,0,0.32))",
      }}
    >
        {/* 头部 */}
        <div
          className="flex shrink-0 items-center justify-between px-5 py-3.5"
          style={{
            borderBottom: "1px solid var(--md-sys-color-outline-variant)",
            background: "var(--md-sys-color-surface-container)",
          }}
        >
          <div className="flex items-center gap-2">
            <Settings size={16} className="text-[var(--md-sys-color-primary)]" />
            <span className="text-[14px] font-bold text-[var(--md-sys-color-on-surface)]">设置</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-[var(--md-sys-color-on-surface-variant)] transition-colors hover:bg-[var(--md-sys-color-surface-container-high)]"
            title="关闭"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
          <SettingsSection
            title="成绩"
            icon={<Trophy size={16} />}
            summary={
              summary.chapters
                ? `${summary.chapters} 章 · 平均 ${summary.avgBest} · ${summary.totalAttempts} 次`
                : "暂无测验记录"
            }
          >
            <div className="flex flex-col gap-3">
              <div className="flex gap-2.5">
                <StatCard icon={<Layers size={15} />} value={summary.chapters} label="已测章节" />
                <StatCard
                  icon={<BarChart3 size={15} />}
                  value={summary.chapters ? summary.avgBest : "—"}
                  label="平均最佳分"
                  accent={summary.chapters ? scoreGrade(summary.avgBest).color : undefined}
                />
                <StatCard icon={<Repeat size={15} />} value={summary.totalAttempts} label="测验次数" />
              </div>

              {groups.length === 0 ? (
                <div
                  className="rounded-[var(--md-sys-shape-corner-large,16px)] px-4 py-6 text-center text-[12.5px] leading-relaxed text-[var(--md-sys-color-on-surface-variant)]"
                  style={{ background: "var(--md-sys-color-surface-container-lowest)" }}
                >
                  还没有测验记录。
                  <br />
                  打开任意章节的「题目测试」标签，完成一套题后成绩会出现在这里。
                </div>
              ) : (
                <div className="flex flex-col gap-3.5">
                  {groups.map((g) => {
                    const Icon = SUBJECT_ICON_MAP[g.iconName] ?? Folder;
                    return (
                      <div key={g.id} className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 px-0.5">
                          <Icon size={15} style={{ color: "var(--md-sys-color-primary)" }} />
                          <span className="text-[13px] font-bold text-[var(--md-sys-color-on-surface)]">
                            {g.name}
                          </span>
                          <span className="text-[11.5px] text-[var(--md-sys-color-on-surface-variant)]">
                            {g.items.length} 章
                          </span>
                          <span className="ml-auto text-[11.5px] text-[var(--md-sys-color-on-surface-variant)]">
                            平均最佳
                          </span>
                          <ScoreBadge percent={g.avgBest} />
                        </div>
                        <div
                          className="flex flex-col overflow-hidden rounded-[var(--md-sys-shape-corner-large,16px)]"
                          style={{ border: "1px solid var(--md-sys-color-outline-variant)" }}
                        >
                          {g.items.map((e, i) => {
                            const route = findChapterRoute(e.subjectId, e.chapterId);
                            return (
                              <div
                                key={e.chapterId}
                                onClick={() => {
                                  if (!route) return;
                                  router.push(`/${e.subjectId}/${route.categoryId}/${route.itemId}`);
                                  onClose();
                                }}
                                className="flex items-center gap-3 px-3 py-2 transition-colors"
                                style={{
                                  background:
                                    i % 2 === 0
                                      ? "var(--md-sys-color-surface-container-lowest)"
                                      : "var(--md-sys-color-surface-container)",
                                  cursor: route ? "pointer" : "default",
                                }}
                              >
                                <span className="min-w-0 flex-1 truncate text-[12.5px] text-[var(--md-sys-color-on-surface)]">
                                  {chapterLabel(e.chapterId)}
                                </span>
                                <span className="shrink-0 text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
                                  上次 {e.progress.last.percent} · {e.progress.attempts} 次
                                </span>
                                <ScoreBadge percent={e.progress.best} />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex items-center justify-between gap-3 rounded-[var(--md-sys-shape-corner-large,16px)] bg-[var(--md-sys-color-surface-container-lowest)] px-3.5 py-2.5">
                <div className="min-w-0">
                  <div className="text-[13px] font-medium text-[var(--md-sys-color-on-surface)]">
                    清空全部成绩
                  </div>
                  <div className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
                    仅清除本机保存的测验成绩，不影响题目本身。
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={summary.chapters === 0 && !confirmClear}
                  className="press flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-semibold transition-colors disabled:opacity-40"
                  style={{
                    background: confirmClear
                      ? "var(--md-sys-color-error)"
                      : "var(--md-sys-color-surface-container-highest)",
                    color: confirmClear
                      ? "var(--md-sys-color-on-error)"
                      : "var(--md-sys-color-error)",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <Trash2 size={14} />
                  {confirmClear ? "确认清空" : "清空"}
                </button>
              </div>
            </div>
          </SettingsSection>

          <SettingsSection
            title="快捷键"
            icon={<Keyboard size={16} />}
            summary={`已启用 ${keyboardEnabledCount} / ${SHORTCUTS.length}`}
          >
            <KeyboardShortcutsSettings />
          </SettingsSection>

          <SettingsSection
            title="外观"
            icon={<Palette size={16} />}
            summary={`${theme === "light" ? "浅色" : "深色"} · ${APPEARANCE_LABELS[appearance.mode]} · ${FONT_CHOICES[appearance.custom.font].label}`}
          >
            <AppearanceSettingsControls
              theme={theme}
              setTheme={setTheme}
              appearance={appearance}
              setAppearanceMode={setAppearanceMode}
              setCustomAppearance={setCustomAppearance}
              resetAppearance={resetAppearance}
            />
          </SettingsSection>
        </div>
    </motion.div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(node, document.body);
}
