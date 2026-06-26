"use client";

import React from "react";

interface VizErrorBoundaryProps {
  /** 渲染失败时提示卡的标题，如「图形」「分子结构」。 */
  label?: string;
  /** 可选：失败时允许展开查看的原始内容（SVG/HTML/SMILES 源码）。 */
  source?: string;
  children: React.ReactNode;
}

interface VizErrorBoundaryState {
  failed: boolean;
  showSource: boolean;
}

/**
 * 可视化块专用错误边界。
 *
 * 聊天/笔记里的 AI 生成图（SvgDiagram / 分子结构 / 沙箱 HTML）经
 * dangerouslySetInnerHTML、DOMPurify、第三方 WASM 渲染，畸形或半截内容可能在
 * render 阶段同步抛错。没有边界时，单个坏图会让整棵消息子树卸载 → 整屏白屏。
 *
 * 这里把每个可视化块单独包住：出错只把**该块**降级为内联提示卡，
 * 其余消息正常显示，绝不冒泡成白屏。
 */
export class VizErrorBoundary extends React.Component<
  VizErrorBoundaryProps,
  VizErrorBoundaryState
> {
  constructor(props: VizErrorBoundaryProps) {
    super(props);
    this.state = { failed: false, showSource: false };
  }

  static getDerivedStateFromError(): Partial<VizErrorBoundaryState> {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    // 仅开发期留痕，生产静默降级（不打扰用户）。
    if (process.env.NODE_ENV !== "production") {
      console.warn("[VizErrorBoundary] 可视化块渲染失败，已降级：", error);
    }
  }

  render() {
    if (!this.state.failed) return this.props.children;

    const { label = "图形", source } = this.props;
    return (
      <div className="viz-error-card">
        <div className="viz-error-head">⚠️ 该{label}渲染失败（已跳过，不影响其余内容）</div>
        {source && source.trim() ? (
          <>
            <button
              type="button"
              className="viz-error-toggle press"
              onClick={() => this.setState((s) => ({ showSource: !s.showSource }))}
            >
              {this.state.showSource ? "收起源码" : "查看源码"}
            </button>
            {this.state.showSource && (
              <pre className="viz-error-source">{source}</pre>
            )}
          </>
        ) : null}
      </div>
    );
  }
}

export default VizErrorBoundary;
