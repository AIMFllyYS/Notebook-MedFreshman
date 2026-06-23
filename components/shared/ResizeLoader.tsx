"use client";

import React from "react";

/**
 * 拖拽面板时的加载覆盖层。
 *
 * 性能：动画**只用 transform / opacity**（走 GPU 合成层，拖拽期几乎不触发主线程重绘）。
 * - PageLoader（正文区）：翻页用 rotateY + opacity。
 * - ChatSkeleton（右栏 AI 对话）：消息气泡骨架 + 一道 translateX 掠过的高光（shimmer）。
 *   注意：项目里的 `.animate-shimmer` 走 background-position（会重绘），拖拽期不用它；
 *   这里气泡本体静止、只让高光层做 transform 位移，保证拖拽零主线程重绘。
 * 动画定义在 globals.css 的 .resize-loader 相关规则中。
 */

const PAGE_SVG_PATH =
  "M90,0 L90,120 L11,120 C4.92486775,120 0,115.075132 0,109 L0,11 C0,4.92486775 4.92486775,0 11,0 L90,0 Z M71.5,81 L18.5,81 C17.1192881,81 16,82.1192881 16,83.5 C16,84.8254834 17.0315359,85.9100387 18.3356243,85.9946823 L18.5,86 L71.5,86 C72.8807119,86 74,84.8807119 74,83.5 C74,82.1745166 72.9684641,81.0899613 71.6643757,81.0053177 L71.5,81 Z M71.5,57 L18.5,57 C17.1192881,57 16,58.1192881 16,59.5 C16,60.8254834 17.0315359,61.9100387 18.3356243,61.9946823 L18.5,62 L71.5,62 C72.8807119,62 74,60.8807119 74,59.5 C74,58.1192881 72.8807119,57 71.5,57 Z M71.5,33 L18.5,33 C17.1192881,33 16,34.1192881 16,35.5 C16,36.8254834 17.0315359,37.9100387 18.3356243,37.9946823 L18.5,38 L71.5,38 C72.8807119,38 74,36.8807119 74,35.5 C74,34.1192881 72.8807119,33 71.5,33 Z";

/** 右栏（AI 对话）拖拽骨架屏：交替左右的消息气泡 + 合成层高光掠过。 */
export function ChatSkeleton() {
  const bubbles: { side: "left" | "right"; width: string; height: number }[] = [
    { side: "left", width: "64%", height: 40 },
    { side: "right", width: "46%", height: 32 },
    { side: "left", width: "76%", height: 56 },
    { side: "right", width: "38%", height: 32 },
    { side: "left", width: "58%", height: 44 },
  ];
  return (
    <div className="resize-loader resize-loader-chat">
      <div className="chat-skel">
        {bubbles.map((b, i) => (
          <span
            key={i}
            className={`chat-skel-bubble ${b.side}`}
            style={{ width: b.width, height: b.height }}
          />
        ))}
      </div>
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="resize-loader resize-loader-page">
      <div className="page-loader">
        <div>
          <ul>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <li key={i}>
                <svg fill="currentColor" viewBox="0 0 90 120">
                  <path d={PAGE_SVG_PATH} />
                </svg>
              </li>
            ))}
          </ul>
        </div>
        <span>加载中</span>
      </div>
    </div>
  );
}
