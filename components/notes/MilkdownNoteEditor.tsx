"use client";

import { useEffect, useRef, useState } from "react";
import { Crepe } from "@milkdown/crepe";
import "@milkdown/crepe/theme/common/style.css";
import "@milkdown/crepe/theme/frame.css";

/**
 * 个人笔记的「渲染编辑」层。
 * Markdown 字符串仍是唯一真相源（UserNote.markdown）；Crepe 只是可写的所见即所得视图。
 * 课程笔记 NoteRenderer 不走这里。
 */
export default function MilkdownNoteEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (markdown: string) => void;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const onChangeRef = useRef(onChange);
  const [failed, setFailed] = useState(false);
  onChangeRef.current = onChange;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let cancelled = false;
    let crepe: Crepe | null = null;

    const boot = async () => {
      try {
        crepe = new Crepe({
          root,
          defaultValue: value,
          features: {
            [Crepe.Feature.ImageBlock]: false,
            [Crepe.Feature.TopBar]: false,
            [Crepe.Feature.AI]: false,
            [Crepe.Feature.Latex]: true,
            [Crepe.Feature.Toolbar]: true,
            [Crepe.Feature.BlockEdit]: true,
          },
          featureConfigs: {
            [Crepe.Feature.Placeholder]: {
              text: "写短要点提纲。支持 $KaTeX$、表格、任务列表。输入 / 唤出块。",
              mode: "doc",
            },
          },
        });
        crepe.on((listener) => {
          listener.markdownUpdated((_ctx, markdown) => {
            if (cancelled) return;
            onChangeRef.current(markdown);
          });
        });
        await crepe.create();
        if (cancelled) {
          await crepe.destroy();
          crepe = null;
        }
      } catch {
        if (!cancelled) setFailed(true);
      }
    };

    void boot();
    return () => {
      cancelled = true;
      const instance = crepe;
      crepe = null;
      if (instance) void instance.destroy();
    };
    // 只在挂载时读入当前 Markdown。切回源码再进来会整页重挂，拿到最新正文。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (failed) {
    return (
      <textarea
        data-no-drag
        className="user-note-source"
        value={value}
        spellCheck={false}
        aria-label="笔记正文（Markdown）"
        onChange={(event) => onChange(event.target.value)}
      />
    );
  }

  return <div ref={rootRef} className="user-note-crepe" data-no-drag aria-label="笔记渲染编辑" />;
}
