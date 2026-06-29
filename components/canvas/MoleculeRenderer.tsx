"use client";

import { useEffect, useState } from "react";
import { loadRDKit } from "@/lib/chemistry/rdkit";
import { sanitizeSvg } from "@/lib/utils/sanitizeSvg";
import { RawSvgViewer } from "./RawSvgViewer";

interface MoleculeRendererProps {
  /** AI 写的 SMILES（也接受 RDKit 能解析的 MolBlock/SMARTS）。 */
  smiles: string;
  title?: string;
  width?: number;
  height?: number;
}

interface Resolved {
  /** 已解析对应的 SMILES，用于派生 loading（key !== input 即仍在渲染）。 */
  key: string;
  svg?: string;
  error?: string;
}

/**
 * SMILES → RDKit(WASM) → 2D 键线式 SVG，套进 RawSvgViewer（缩放/全屏/主题适配复用）。
 *
 * AI 只需写 SMILES（文本，最可靠），结构布局交给 RDKit 确定性渲染。
 * 任意失败（库加载失败 / SMILES 非法 / 渲染异常）都降级为提示卡，不白屏。
 * 投影式（费歇尔/纽曼/哈沃斯/锯架/楔形）RDKit 不支持，由 AI 走 mode="raw" 模板 SVG。
 */
export function MoleculeRenderer({ smiles, title, width = 380, height = 300 }: MoleculeRendererProps) {
  const input = (smiles || "").trim();
  // setState 只在异步回调里发生（避免 set-state-in-effect）；loading 由 key !== input 派生。
  const [resolved, setResolved] = useState<Resolved>({ key: "" });

  useEffect(() => {
    if (!input) return;
    let alive = true;
    loadRDKit()
      .then((RDKit) => {
        if (!alive) return;
        const mol = RDKit.get_mol(input);
        try {
          if (!mol || !mol.is_valid()) {
            setResolved({ key: input, error: "无法解析结构式" });
            return;
          }
          setResolved({ key: input, svg: mol.get_svg(width, height) });
        } finally {
          mol?.delete();
        }
      })
      .catch(() => {
        if (alive) setResolved({ key: input, error: "化学渲染引擎加载失败（RDKit）" });
      });
    return () => {
      alive = false;
    };
  }, [input, width, height]);

  if (!input) {
    return <div className="molecule-status molecule-status-error">⚠️ 未提供 SMILES</div>;
  }
  if (resolved.key !== input) {
    return <div className="molecule-status">正在渲染分子结构…</div>;
  }
  if (resolved.error || !resolved.svg) {
    return (
      <div className="molecule-status molecule-status-error">
        ⚠️ {resolved.error || "结构渲染失败"}
        <code className="molecule-smiles">{smiles}</code>
      </div>
    );
  }
  return (
    <RawSvgViewer svg={sanitizeSvg(resolved.svg)} title={title || "分子结构"} width={width} height={height} enableAiRepair={false} />
  );
}

export default MoleculeRenderer;
