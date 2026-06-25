import Link from "next/link";
import {
  Calculator, Atom, FlaskConical, BookOpen, ScrollText, Folder,
  GraduationCap, BookOpenCheck,
} from "lucide-react";
import { contentTree } from "@/lib/content-data/manifest";
import { subjectColor } from "@/lib/constants/subjects";
import type { Subject } from "@/lib/types/content";

// 首页 · 书架：每个科目一本「书」，悬浮出「开始学习 / 开始复习」。
// 开始学习 → 该科首个可学习章节；开始复习 → /[subject]/review 记忆卡复习板。

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; style?: React.CSSProperties }>> = {
  Calculator, Atom, FlaskConical, BookOpen, ScrollText, Folder,
};

/** 该科「开始学习」落点：优先 detail，否则第一个有内容的板块的首项。 */
function firstLearnHref(subject: Subject): string | null {
  const cat =
    subject.categories.find((c) => c.id === "detail" && c.items.length > 0) ??
    subject.categories.find((c) => c.items.length > 0);
  if (!cat) return null;
  return `/${subject.id}/${cat.id}/${cat.items[0].id}`;
}

function overlayBtn(primary: boolean): React.CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "9px 16px",
    borderRadius: 9,
    fontSize: 13,
    fontWeight: 600,
    textDecoration: "none",
    minWidth: 132,
    justifyContent: "center",
    background: primary ? "#fff" : "transparent",
    color: primary ? "#141414" : "#fff",
    border: primary ? "none" : "1.5px solid rgba(255,255,255,0.85)",
  };
}

function BookCard({ subject }: { subject: Subject }) {
  const Icon = ICON_MAP[subject.icon] ?? BookOpen;
  const learnHref = firstLearnHref(subject);
  const chapterCount = subject.categories.reduce((n, c) => n + c.items.length, 0);
  const color = subjectColor(subject.id);

  return (
    <div className="group" style={{ position: "relative", aspectRatio: "3 / 4" }}>
      <div
        style={{
          height: "100%",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          padding: 16,
          borderRadius: "4px 12px 12px 4px",
          overflow: "hidden",
          border: "1px solid var(--line)",
          borderLeft: `6px solid ${color}`,
          background: `linear-gradient(150deg, color-mix(in oklab, ${color} 22%, var(--md-sys-color-surface-container-high)) 0%, var(--md-sys-color-surface-container-high) 72%)`,
          boxShadow: "0 8px 22px -10px rgba(0,0,0,0.35)",
          transition: "transform 0.18s ease, box-shadow 0.18s ease",
        }}
        className="group-hover:-translate-y-1 group-hover:shadow-lg"
      >
        {/* 顶部高光细线 */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            background: `linear-gradient(90deg, transparent, color-mix(in oklab, ${color} 60%, transparent), transparent)`,
            pointerEvents: "none",
          }}
        />
        {/* 学科图标大号水印（装饰 SVG） */}
        <Icon
          size={150}
          style={{
            position: "absolute",
            right: -22,
            bottom: -16,
            color,
            opacity: 0.08,
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative", zIndex: 1 }}>
          <Icon size={30} style={{ color }} />
        </div>
        <div style={{ marginTop: "auto", position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: 16.5, fontWeight: 700, color: "var(--ink)", lineHeight: 1.25 }}>
            {subject.name}
          </div>
          <div style={{ fontSize: 12, color: "var(--ink-faint)", marginTop: 3 }}>
            {subject.categories.length} 个板块 · {chapterCount} 项
          </div>
        </div>

        {/* 悬浮遮罩：开始学习 / 开始复习（须高于正文 zIndex） */}
        <div
          className="opacity-0 group-hover:opacity-100"
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            gap: 10,
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(10,12,20,0.56)",
            backdropFilter: "blur(1px)",
            transition: "opacity 0.18s ease",
            padding: 16,
          }}
        >
          {learnHref ? (
            <Link href={learnHref} style={overlayBtn(true)}>
              <GraduationCap size={15} /> 开始学习
            </Link>
          ) : (
            <span style={{ ...overlayBtn(true), opacity: 0.5, cursor: "default" }}>
              <GraduationCap size={15} /> 暂无内容
            </span>
          )}
          <Link href={`/${subject.id}/review`} style={overlayBtn(false)}>
            <BookOpenCheck size={15} /> 开始复习
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="scroll-y" style={{ height: "100%", background: "var(--bg-app)" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "40px 28px 56px" }}>
        <header style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.01em" }}>
            期末复习工作站
          </h1>
          <p style={{ fontSize: 14, color: "var(--ink-soft)", marginTop: 8, lineHeight: 1.7 }}>
            选一本书：<b>开始学习</b> 进入正文，<b>开始复习</b> 翻看你划词 / 右键「记录」生成的记忆卡。
          </p>
        </header>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(186px, 1fr))",
            gap: 20,
          }}
        >
          {contentTree.subjects.map((subject) => (
            <BookCard key={subject.id} subject={subject} />
          ))}
        </div>
      </div>
    </div>
  );
}
