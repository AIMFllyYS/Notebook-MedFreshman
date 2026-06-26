import DOMPurify from "dompurify";

const SVG_ALLOWED_TAGS = [
  "svg", "g", "circle", "ellipse", "rect", "line", "polyline", "polygon",
  "path", "text", "tspan", "textPath", "defs", "marker", "use", "symbol",
  "clipPath", "mask", "pattern", "linearGradient", "radialGradient", "stop",
  "title", "desc", "image",
];

const SVG_ALLOWED_ATTRS = [
  "viewBox", "xmlns", "width", "height", "x", "y", "cx", "cy", "r", "rx", "ry",
  "x1", "y1", "x2", "y2", "d", "points", "fill", "stroke", "stroke-width",
  "stroke-dasharray", "stroke-linecap", "stroke-linejoin", "opacity",
  "fill-opacity", "stroke-opacity", "transform", "font-size", "font-family",
  "font-weight", "text-anchor", "dominant-baseline", "dx", "dy",
  "markerWidth", "markerHeight", "refX", "refY", "orient", "id", "class",
  "clip-path", "mask", "filter", "gradientUnits", "offset", "stop-color",
  "stop-opacity", "patternUnits", "preserveAspectRatio", "role", "aria-label",
  "startOffset", "textLength", "lengthAdjust", "marker-end", "marker-start",
  "marker-mid", "fill-rule", "clip-rule", "letter-spacing", "word-spacing",
  "writing-mode", "alignment-baseline", "baseline-shift",
];

/**
 * Sanitize AI-generated SVG content to prevent XSS.
 * Optionally adapts hardcoded black/white colors to theme-aware tokens.
 */
export function sanitizeSvg(raw: string, themeAdapt = true): string {
  if (typeof window === "undefined") return raw;

  let clean: string;
  try {
    clean = DOMPurify.sanitize(raw, {
      USE_PROFILES: { svg: true, svgFilters: true },
      ADD_TAGS: SVG_ALLOWED_TAGS,
      ADD_ATTR: SVG_ALLOWED_ATTRS,
      FORBID_TAGS: ["script", "foreignObject", "iframe", "object", "embed"],
      FORBID_ATTR: ["onclick", "onload", "onerror", "onmouseover", "onmouseout", "onfocus", "onblur"],
    });
  } catch {
    // 畸形输入可能令 DOMPurify 内部抛错；返回空串让上层降级，绝不让异常冒泡成白屏。
    return "";
  }

  if (themeAdapt) {
    clean = clean
      .replace(/(fill|stroke)="(?:black|#000(?:000)?|rgb\(0,\s*0,\s*0\))"/g, '$1="currentColor"')
      .replace(/fill="(?:white|#fff(?:fff)?|rgb\(255,\s*255,\s*255\))"/g, 'fill="var(--diagram-surface)"');
  }

  return clean;
}
