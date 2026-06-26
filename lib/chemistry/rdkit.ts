"use client";

import type { RDKitModule } from "@rdkit/rdkit";

/**
 * RDKit(WASM) 单例加载器。
 *
 * emscripten 胶水 JS 经打包器（Next/Turbopack）易出问题，所以走「运行时注入
 * public 脚本」最稳：脚本设 window.initRDKitModule，再用 locateFile 指向同源
 * /rdkit/RDKit_minimal.wasm。dev 与打包应用（127.0.0.1:35349）均离线可用。
 *
 * 加载失败时清空 promise 允许重试，并抛错由调用方（MoleculeRenderer）降级为提示卡，
 * 绝不让异常冒泡成白屏。
 */

const RDKIT_JS = "/rdkit/RDKit_minimal.js";
const RDKIT_WASM = "/rdkit/RDKit_minimal.wasm";

let rdkitPromise: Promise<RDKitModule> | null = null;

function injectScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>("script[data-rdkit]");
    if (existing) {
      if (existing.dataset.loaded === "1") return resolve();
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("RDKit 脚本加载失败")));
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.dataset.rdkit = "1";
    s.addEventListener("load", () => {
      s.dataset.loaded = "1";
      resolve();
    });
    s.addEventListener("error", () => reject(new Error("RDKit 脚本加载失败")));
    document.head.appendChild(s);
  });
}

export function loadRDKit(): Promise<RDKitModule> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("RDKit 仅客户端可用"));
  }
  if (rdkitPromise) return rdkitPromise;

  rdkitPromise = (async () => {
    await injectScript(RDKIT_JS);
    if (typeof window.initRDKitModule !== "function") {
      throw new Error("initRDKitModule 未就绪");
    }
    return window.initRDKitModule({ locateFile: () => RDKIT_WASM });
  })().catch((e) => {
    rdkitPromise = null; // 允许下次重试
    throw e;
  });

  return rdkitPromise;
}
