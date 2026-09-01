"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { GraduationCap } from "lucide-react";
import {
  ACADEMIC_YEAR_IDS,
  ACADEMIC_YEAR_LABELS,
  academicYearOfSubject,
  type AcademicYearId,
} from "@/lib/constants/academic-year";
import { useAcademicYear } from "@/lib/hooks/useAcademicYear";

/**
 * 「切换学年」控件。设置面板用完整样式，侧栏用紧凑样式。
 * 切到另一学年时，若当前路由属于被隐藏科目，回到首页（不删文件）。
 */
export default function AcademicYearSwitcher({
  variant = "full",
}: {
  variant?: "full" | "compact";
}) {
  const year = useAcademicYear((s) => s.year);
  const setYear = useAcademicYear((s) => s.setYear);
  const hydrate = useAcademicYear((s) => s.hydrate);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const applyYear = (next: AcademicYearId) => {
    if (next === year) return;
    setYear(next);
    const firstSeg = pathname.split("/").filter(Boolean)[0];
    if (firstSeg && academicYearOfSubject(firstSeg) !== next) {
      router.push("/");
    }
  };

  if (variant === "compact") {
    return (
      <div
        role="group"
        aria-label="切换学年"
        style={{
          display: "flex",
          gap: 4,
          margin: "4px 8px 6px",
          padding: 3,
          borderRadius: 9,
          background: "var(--md-sys-color-surface-container)",
          border: "1px solid var(--md-sys-color-outline-variant)",
        }}
      >
        {ACADEMIC_YEAR_IDS.map((id) => {
          const active = year === id;
          return (
            <button
              key={id}
              type="button"
              aria-pressed={active}
              onClick={() => applyYear(id)}
              className="press"
              style={{
                flex: 1,
                border: "none",
                cursor: "pointer",
                borderRadius: 7,
                padding: "5px 6px",
                fontSize: 11.5,
                fontWeight: 650,
                background: active ? "var(--md-sys-color-primary)" : "transparent",
                color: active
                  ? "var(--md-sys-color-on-primary)"
                  : "var(--md-sys-color-on-surface-variant)",
              }}
            >
              {ACADEMIC_YEAR_LABELS[id]}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      role="group"
      aria-label="切换学年"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        padding: "12px 12px 10px",
        borderRadius: "var(--md-sys-shape-corner-large,16px)",
        background: "var(--md-sys-color-surface-container)",
        border: "1px solid var(--md-sys-color-outline-variant)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          color: "var(--md-sys-color-on-surface)",
        }}
      >
        <GraduationCap size={16} />
        <span style={{ fontSize: 13, fontWeight: 700 }}>切换学年</span>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        {ACADEMIC_YEAR_IDS.map((id) => {
          const active = year === id;
          return (
            <button
              key={id}
              type="button"
              aria-pressed={active}
              onClick={() => applyYear(id)}
              className="press"
              style={{
                flex: 1,
                border: "none",
                cursor: "pointer",
                borderRadius: 999,
                padding: "7px 10px",
                fontSize: 12.5,
                fontWeight: 650,
                background: active
                  ? "var(--md-sys-color-primary)"
                  : "var(--md-sys-color-surface-container-highest)",
                color: active
                  ? "var(--md-sys-color-on-primary)"
                  : "var(--md-sys-color-on-surface)",
              }}
            >
              {ACADEMIC_YEAR_LABELS[id]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
