import type { SVGProps } from "react";

export type FileGlyphKind =
  | "pdf"
  | "docx"
  | "ppt"
  | "markdown"
  | "html"
  | "text"
  | "image"
  | "code";

/** Office / Adobe 习惯色。文件窗身份不走应用 primary 紫。 */
export const FILE_TYPE_COLORS: Record<FileGlyphKind, { fill: string; fillDark: string }> = {
  pdf: { fill: "#E5252A", fillDark: "#FF5C61" },
  docx: { fill: "#2B579A", fillDark: "#5B8DEF" },
  ppt: { fill: "#C43E1C", fillDark: "#F06B45" },
  markdown: { fill: "#0F766E", fillDark: "#2DD4BF" },
  html: { fill: "#E44D26", fillDark: "#FF7A55" },
  text: { fill: "#475569", fillDark: "#94A3B8" },
  image: { fill: "#0F9D58", fillDark: "#34D399" },
  code: { fill: "#334155", fillDark: "#7DD3FC" },
};

export function resolveFileGlyphKind(data: {
  kind?: string;
  mimeType?: string;
  name?: string;
}): FileGlyphKind {
  const name = (data.name ?? "").toLowerCase();
  const mime = (data.mimeType ?? "").toLowerCase();
  const kind = data.kind ?? "";
  if (
    kind === "ppt" ||
    mime.includes("powerpoint") ||
    mime.includes("presentation") ||
    /\.pptx?$/.test(name)
  ) {
    return "ppt";
  }
  if (kind === "pdf" || mime.includes("pdf") || name.endsWith(".pdf")) return "pdf";
  if (
    kind === "docx" ||
    mime.includes("wordprocessing") ||
    name.endsWith(".docx") ||
    name.endsWith(".doc")
  ) {
    return "docx";
  }
  if (kind === "html" || mime.includes("html") || /\.html?$/.test(name)) return "html";
  if (kind === "markdown" || mime.includes("markdown") || /\.md(?:own)?$/.test(name)) return "markdown";
  if (kind === "image" || mime.startsWith("image/")) return "image";
  if (
    /\.(js|ts|tsx|jsx|mjs|cjs|py|json|jsonl|css|yml|yaml|xml|sql|sh|bash|ps1)$/.test(name) ||
    mime.includes("javascript") ||
    mime.includes("typescript") ||
    mime.includes("json")
  ) {
    return "code";
  }
  return "text";
}

export function fileTypeAccent(data: {
  kind?: string;
  mimeType?: string;
  name?: string;
}): string {
  return FILE_TYPE_COLORS[resolveFileGlyphKind(data)].fill;
}

interface FileTypeIconProps extends Omit<SVGProps<SVGSVGElement>, "width" | "height"> {
  kind?: FileGlyphKind;
  mimeType?: string;
  name?: string;
  size?: number;
}

function resolveFill(kind: FileGlyphKind): string {
  const colors = FILE_TYPE_COLORS[kind];
  if (typeof document === "undefined") return colors.fill;
  return document.documentElement.getAttribute("data-theme") === "dark" ? colors.fillDark : colors.fill;
}

function DocumentBody({ color }: { color: string }) {
  return (
    <g fill="none" stroke={color} strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round">
      <path d="M4.85 2.05h8.15L20.2 9.25V20.55c0 .95-.77 1.7-1.7 1.7H4.85c-.93 0-1.7-.75-1.7-1.7V3.75c0-.93.77-1.7 1.7-1.7Z" />
      <path d="M13 2.05v6.15c0 .58.47 1.05 1.05 1.05H20.2" />
    </g>
  );
}

function Label({ children, color, fontSize = 6.4 }: { children: string; color: string; fontSize?: number }) {
  return (
    <text
      x="12"
      y="17.55"
      textAnchor="middle"
      fill={color}
      fontSize={fontSize}
      fontWeight={800}
      fontFamily='ui-sans-serif, system-ui, "Segoe UI", sans-serif'
      letterSpacing="-0.04em"
    >
      {children}
    </text>
  );
}

export default function FileTypeIcon({
  kind,
  mimeType,
  name,
  size = 18,
  ...props
}: FileTypeIconProps) {
  const glyph = kind ?? resolveFileGlyphKind({ mimeType, name });
  const color = resolveFill(glyph);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      overflow="visible"
      aria-hidden="true"
      data-file-kind={glyph}
      className="file-type-icon"
      {...props}
    >
      <DocumentBody color={color} />
      {glyph === "pdf" ? <Label color={color} fontSize={6}>PDF</Label> : null}
      {glyph === "docx" ? <Label color={color} fontSize={8.6}>W</Label> : null}
      {glyph === "ppt" ? (
        <g fill="none" stroke={color} strokeWidth="1.35" strokeLinejoin="round">
          <rect x="6.35" y="11.05" width="5.15" height="3.5" rx="0.55" />
          <rect x="12.5" y="11.05" width="5.15" height="3.5" rx="0.55" />
          <rect x="6.35" y="15.35" width="5.15" height="3.5" rx="0.55" />
          <rect x="12.5" y="15.35" width="5.15" height="3.5" rx="0.55" />
        </g>
      ) : null}
      {glyph === "markdown" ? <Label color={color} fontSize={5.8}>MD</Label> : null}
      {glyph === "html" ? (
        <text
          x="12"
          y="17.7"
          textAnchor="middle"
          fill={color}
          fontSize={6.8}
          fontWeight={800}
          fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
        >
          {"</>"}
        </text>
      ) : null}
      {glyph === "text" ? (
        <g fill="none" stroke={color} strokeWidth="1.45" strokeLinecap="round">
          <path d="M6.85 12.05h10.3" />
          <path d="M6.85 15.05h10.3" />
          <path d="M6.85 18.05h7.2" />
        </g>
      ) : null}
      {glyph === "image" ? (
        <g fill="none" stroke={color} strokeWidth="1.45" strokeLinejoin="round" strokeLinecap="round">
          <circle cx="8.7" cy="12.05" r="1.25" />
          <path d="M6.45 19.1 10.15 14.7l2.3 2.5 2.2-3 3.25 4.9" />
        </g>
      ) : null}
      {glyph === "code" ? (
        <text
          x="12"
          y="17.7"
          textAnchor="middle"
          fill={color}
          fontSize={6.8}
          fontWeight={800}
          fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
        >
          {"{ }"}
        </text>
      ) : null}
    </svg>
  );
}
