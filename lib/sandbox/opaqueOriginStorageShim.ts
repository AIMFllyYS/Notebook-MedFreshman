/**
 * AI 生成 HTML 的 iframe 去掉 allow-same-origin 后进入 opaque origin，
 * 访问 localStorage / sessionStorage 会抛 SecurityError。
 * 在 srcDoc 头部注入内存 shim，第三方可视化库无感。
 * 只给 ArtifactViewer / HtmlRenderer 用；不要接到笔记页 gongshi.html。
 */

/** Artifact 浮窗：保留 scripts，去掉 same-origin。 */
export const ARTIFACT_IFRAME_SANDBOX =
  "allow-scripts allow-popups allow-forms allow-modals allow-downloads";

/** 消息内 HTML canvas：同上，并保留原有 popup-escape。 */
export const CANVAS_HTML_IFRAME_SANDBOX =
  "allow-scripts allow-popups allow-popups-to-escape-sandbox allow-forms allow-modals allow-downloads";

export const OPAQUE_ORIGIN_STORAGE_SHIM_MARKER = "data-opaque-origin-storage-shim";

/**
 * 注入 iframe 的 IIFE。必须自包含，不能依赖宿主打包辅助函数。
 * 覆盖 localStorage / sessionStorage 的 getItem、setItem、removeItem、clear、key、length。
 */
export const OPAQUE_ORIGIN_STORAGE_SHIM_SOURCE = `(function (g) {
  function createStorage() {
    var map = new Map();
    return {
      getItem: function (key) {
        var k = String(key);
        return map.has(k) ? map.get(k) : null;
      },
      setItem: function (key, value) {
        map.set(String(key), String(value));
      },
      removeItem: function (key) {
        map.delete(String(key));
      },
      clear: function () {
        map.clear();
      },
      key: function (index) {
        if (index < 0 || index >= map.size) return null;
        return Array.from(map.keys())[index] || null;
      },
      get length() {
        return map.size;
      }
    };
  }
  function needsShim(name) {
    try {
      var storage = g[name];
      if (!storage) return true;
      storage.getItem("__opaque_origin_probe__");
      return false;
    } catch (err) {
      return true;
    }
  }
  function install(name) {
    var memory = createStorage();
    try {
      Object.defineProperty(g, name, {
        configurable: true,
        enumerable: true,
        get: function () {
          return memory;
        }
      });
    } catch (err) {
      try {
        g[name] = memory;
      } catch (ignored) {}
    }
  }
  if (needsShim("localStorage")) install("localStorage");
  if (needsShim("sessionStorage")) install("sessionStorage");
})(window);`;

export function opaqueOriginStorageShimScript(): string {
  return `<script ${OPAQUE_ORIGIN_STORAGE_SHIM_MARKER}="1">${OPAQUE_ORIGIN_STORAGE_SHIM_SOURCE}</script>`;
}

/** 在与 srcDoc 相同的脚本上安装 shim（测试与注入共用一份源）。 */
export function applyOpaqueOriginStorageShim(scope: object): void {
  const run = new Function("window", OPAQUE_ORIGIN_STORAGE_SHIM_SOURCE);
  run(scope);
}

/** 把 shim 插到文档尽可能早的位置，不改写已有 script / canvas / CDN 地址。 */
export function injectOpaqueOriginStorageShim(html: string): string {
  const source = html ?? "";
  if (source.includes(OPAQUE_ORIGIN_STORAGE_SHIM_MARKER)) return source;

  const script = opaqueOriginStorageShimScript();
  const headOpen = /<head(?=[\s>])/i.exec(source);
  if (headOpen) {
    const insertAt = source.indexOf(">", headOpen.index) + 1;
    return source.slice(0, insertAt) + script + source.slice(insertAt);
  }

  const htmlOpen = /<html(?=[\s>])/i.exec(source);
  if (htmlOpen) {
    const insertAt = source.indexOf(">", htmlOpen.index) + 1;
    return `${source.slice(0, insertAt)}<head>${script}</head>${source.slice(insertAt)}`;
  }

  return script + source;
}
