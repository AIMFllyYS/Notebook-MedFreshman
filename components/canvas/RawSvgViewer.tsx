"use client";

import {
  useRef,
  useState,
  useMemo,
  useEffect,
  useCallback,
  type PointerEvent as RPointerEvent,
  type WheelEvent as RWheelEvent,
} from "react";
import { CanvasControls } from "./CanvasControls";
import { CanvasFullscreenPortal } from "./CanvasFullscreenPortal";
import { useCanvasFullscreen } from "@/lib/hooks/useCanvasFullscreen";
import { useSettings } from "@/lib/hooks/useSettings";
import { sanitizeSvg } from "@/lib/utils/sanitizeSvg";
import { analyzeSvgHealth } from "@/lib/svg/svgHealth";
import PencilSparklesIcon from "@/components/icons/PencilSparklesIcon";

export interface RawSvgViewerProps {
  /** Sanitized SVG markup (inner elements, may or may not include an <svg> root) */
  svg: string;
  title?: string;
  width?: number;
  height?: number;
  sourceSvg?: string;
  topic?: string;
  repairModelId?: string;
  enableAiRepair?: boolean;
  onRepairContent?: (svg: string) => void;
}

const ZOOM_MIN = 0.25;
const ZOOM_MAX = 4;

/**
 * 给缺 viewBox 的 <svg> 根补一个 viewBox。
 *
 * 白屏根因（无报错那种）：AI 偶尔写 `<svg width="100%" height="100%">` 而**不带 viewBox**，
 * 此时 svg 无内在宽高比，被 canvas.css 的 `.svg-raw-content svg{height:auto}` 压成 0 高 →
 * 画布是个空白框（不抛错、VizErrorBoundary 接不到 → 用户看到“白屏”）。补上 viewBox 后
 * `height:auto` 就有比例可算，永不塌 0。优先用根上的数值 width/height 推 viewBox，缺则用画布默认尺寸。
 */
function ensureViewBox(markup: string, w: number, h: number): string {
  const open = markup.match(/<svg\b[^>]*>/i);
  if (!open) return markup;
  const tag = open[0];
  if (/\bviewbox\s*=/i.test(tag)) return markup; // 已有 viewBox：不动
  const wn = tag.match(/\bwidth\s*=\s*["']?\s*(\d+(?:\.\d+)?)/i);
  const hn = tag.match(/\bheight\s*=\s*["']?\s*(\d+(?:\.\d+)?)/i);
  const vw = wn ? parseFloat(wn[1]) : w;
  const vh = hn ? parseFloat(hn[1]) : h;
  return markup.replace(tag, tag.replace(/<svg\b/i, `<svg viewBox="0 0 ${vw} ${vh}"`));
}

/**
 * Lightweight SVG renderer for AI-authored diagrams with their own coordinate system.
 * No grid, no axes, no math coordinate mapping — just pan/zoom + theme CSS.
 */
export function RawSvgViewer({
  svg,
  title = "示意图",
  width = 400,
  height = 300,
  sourceSvg,
  topic,
  repairModelId,
  enableAiRepair = true,
  onRepairContent,
}: RawSvgViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedModelId = useSettings((s) => s.selectedModelId);
  const customApiGroups = useSettings((s) => s.customApiGroups);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [collapsed, setCollapsed] = useState(false);
  const [showSource, setShowSource] = useState(false);
  const [localRepair, setLocalRepair] = useState<{ base: string; svg: string } | null>(null);
  const [showRepair, setShowRepair] = useState(false);
  const [repairInstruction, setRepairInstruction] = useState("");
  const [repairing, setRepairing] = useState(false);
  const [repairError, setRepairError] = useState<string | null>(null);
  const { fullscreen, toggle, exit } = useCanvasFullscreen();
  const dragRef = useRef<{ startX: number; startY: number; panX: number; panY: number } | null>(null);

  const displaySvg = localRepair?.base === svg ? localRepair.svg : svg;

  const handlePointerDown = useCallback(
    (e: RPointerEvent<HTMLDivElement>) => {
      // 守卫：按到右上角控件键时不要起拖拽 / setPointerCapture——否则指针被 wrapper 捕获，
      // 按钮的 click 会被重定向到 wrapper、永不触发（zoom/reset/maximize 全失灵的根因）。
      if ((e.target as HTMLElement).closest(".svg-canvas-controls, .svg-repair-popover")) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      dragRef.current = { startX: e.clientX, startY: e.clientY, panX: pan.x, panY: pan.y };
    },
    [pan],
  );

  const handlePointerMove = useCallback((e: RPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setPan({ x: dragRef.current.panX + dx, y: dragRef.current.panY + dy });
  }, []);

  const handlePointerUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  const handleWheel = useCallback((e: RWheelEvent<HTMLDivElement>) => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    const factor = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom((z) => Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, z * factor)));
  }, []);

  const resetView = useCallback(() => {
    setPan({ x: 0, y: 0 });
    setZoom(1);
  }, []);

  const repairSvg = useCallback(async () => {
    if (repairing) return;
    setRepairing(true);
    setRepairError(null);
    try {
      const res = await fetch("/api/svg-repair", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          svg: sourceSvg || displaySvg,
          title,
          topic,
          instruction: repairInstruction,
          modelId: repairModelId || selectedModelId,
          customApiGroups,
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok || typeof payload.svg !== "string") {
        throw new Error(typeof payload.error === "string" ? payload.error : "SVG 修复失败，请稍后重试。");
      }
      const cleaned = sanitizeSvg(payload.svg);
      if (!cleaned.trim()) {
        throw new Error("模型返回的 SVG 被安全清洗后为空，请换一种描述重试。");
      }
      setLocalRepair({ base: svg, svg: cleaned });
      onRepairContent?.(cleaned);
      setShowRepair(false);
      setRepairInstruction("");
    } catch (err) {
      setRepairError(err instanceof Error ? err.message : "SVG 修复失败，请稍后重试。");
    } finally {
      setRepairing(false);
    }
  }, [
    customApiGroups,
    displaySvg,
    onRepairContent,
    repairInstruction,
    repairModelId,
    repairing,
    selectedModelId,
    sourceSvg,
    svg,
    title,
    topic,
  ]);

  const hasOwnSvgRoot = displaySvg.trimStart().startsWith("<svg");
  const innerHtml = useMemo(() => {
    const base = hasOwnSvgRoot
      ? displaySvg
      : `<svg viewBox="0 0 ${width} ${height}" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">${displaySvg}</svg>`;
    return ensureViewBox(base, width, height);
  }, [displaySvg, hasOwnSvgRoot, width, height]);
  const health = useMemo(() => analyzeSvgHealth(innerHtml), [innerHtml]);
  const degraded = collapsed || !health.ok;

  // 终极兜底：渲染后量一次内嵌 svg。容器已布局(宽≥4)但 svg 高度塌成 ~0（任何成因的“白屏”）
  // → 切到源码兜底卡，用户永不只看到空白；同时把源码亮出来便于定位。内容变化会重量、可自动恢复。
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const wrap = containerRef.current;
      if (!wrap) return;
      const wr = wrap.getBoundingClientRect();
      if (wr.width < 4) {
        setCollapsed(false); // 容器尚未布局，别误判
        return;
      }
      const el = wrap.querySelector(".svg-raw-inner svg");
      if (!el) {
        setCollapsed(true);
        return;
      }
      // 阈值取 2px：真·塌缩是 0/亚像素；正常图（哪怕很扁的数轴）都有数 px 高，不误判。
      setCollapsed(el.getBoundingClientRect().height < 2);
    });
    return () => cancelAnimationFrame(raf);
  }, [innerHtml]);

  return (
    <CanvasFullscreenPortal open={fullscreen} onExit={exit}>
      <div
        ref={containerRef}
        className="svg-canvas-wrapper svg-raw-content"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
        role="img"
        aria-label={title}
        style={{ touchAction: "none" }}
      >
        {enableAiRepair && (
          <div className="svg-canvas-controls svg-canvas-controls-left">
            <button
              type="button"
              className="press"
              onClick={() => setShowRepair((v) => !v)}
              title="AI 修复 SVG"
              aria-label="AI repair SVG"
            >
              <PencilSparklesIcon size={11} />
            </button>
          </div>
        )}
        {showRepair && (
          <div className="svg-repair-popover">
            <textarea
              value={repairInstruction}
              onChange={(e) => setRepairInstruction(e.target.value)}
              placeholder="描述希望 AI 如何修复这张图，例如：补全可见图形、让坐标进入画布、增强标注。"
              rows={3}
            />
            {repairError && <div className="svg-repair-error">{repairError}</div>}
            <div className="svg-repair-actions">
              <button type="button" className="press" onClick={() => setShowRepair(false)} disabled={repairing}>
                取消
              </button>
              <button type="button" className="press svg-repair-submit" onClick={repairSvg} disabled={repairing}>
                {repairing ? "修复中..." : "修复画布"}
              </button>
            </div>
          </div>
        )}
        <div
          className="svg-raw-inner"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "center center",
            width: "100%",
            height: "auto",
            minHeight: height,
            // 塌缩时把零高 svg 收进 0 高容器（不占位），改由下方兜底卡呈现。
            ...(degraded ? { position: "absolute", visibility: "hidden", pointerEvents: "none" } : null),
          }}
          dangerouslySetInnerHTML={{ __html: innerHtml }}
        />
        {degraded && (
          <div className="viz-error-card" style={{ margin: 8 }}>
            <div className="viz-error-head">SVG diagram is not visible</div>
            <div className="viz-error-body">
              这张 SVG 画布目前没有可见图形，可能是内容为空、元素超出 viewBox，或被安全清洗后失去可见元素。可使用左上角 AI 按钮手动修复。
            </div>
            <button
              type="button"
              className="viz-error-toggle press"
              onClick={() => setShowSource((v) => !v)}
            >
              {showSource ? "收起源码" : "查看源码"}
            </button>
            {showSource && <pre className="viz-error-source">{displaySvg}</pre>}
          </div>
        )}
        <CanvasControls
          onReset={resetView}
          onZoomIn={() => setZoom((z) => Math.min(ZOOM_MAX, z * 1.2))}
          onZoomOut={() => setZoom((z) => Math.max(ZOOM_MIN, z / 1.2))}
          onMaximize={toggle}
          fullscreen={fullscreen}
        />
      </div>
    </CanvasFullscreenPortal>
  );
}
