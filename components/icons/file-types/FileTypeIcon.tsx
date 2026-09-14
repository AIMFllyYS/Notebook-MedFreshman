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
  if (kind === "pdf" || mime.includes("pdf") || name.endsWith(".pdf")) return "pdf";
  if (
    kind === "ppt" ||
    mime.includes("powerpoint") ||
    mime.includes("presentation") ||
    /\.pptx?$/.test(name)
  ) {
    return "ppt";
  }
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

function DocumentBody({ fill }: { fill: string }) {
  return (
    <>
      <path
        fill={fill}
        d="M6.2 2.4h7.4L19.6 8.4V20.2c0 .9-.7 1.6-1.6 1.6H6.2c-.9 0-1.6-.7-1.6-1.6V4c0-.9.7-1.6 1.6-1.6Z"
      />
      <path fill="rgba(255,255,255,0.28)" d="M13.6 2.4V7.6c0 .6.5 1.1 1.1 1.1h5" />
      <path fill="rgba(0,0,0,0.12)" d="M13.6 2.4 19.6 8.4h-5c-.6 0-1.1-.5-1.1-1.1V2.4Z" />
    </>
  );
}

function Label({ children, fontSize = 6.2 }: { children: string; fontSize?: number }) {
  return (
    <text
      x="12"
      y="17.4"
      textAnchor="middle"
      fill="#fff"
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
  size = 16,
  ...props
}: FileTypeIconProps) {
  const glyph = kind ?? resolveFileGlyphKind({ mimeType, name });
  const fill = resolveFill(glyph);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      data-file-kind={glyph}
      className="file-type-icon"
      {...props}
    >
      <DocumentBody fill={fill} />
      {glyph === "pdf" ? <Label fontSize={5.6}>PDF</Label> : null}
      {glyph === "docx" ? <Label fontSize={8.2}>W</Label> : null}
      {glyph === "ppt" ? (
        <>
          <rect x="7.2" y="11.2" width="4.2" height="3.1" rx="0.45" fill="#fff" opacity="0.95" />
          <rect x="12.6" y="11.2" width="4.2" height="3.1" rx="0.45" fill="#fff" opacity="0.7" />
          <rect x="7.2" y="15.1" width="4.2" height="3.1" rx="0.45" fill="#fff" opacity="0.7" />
          <rect x="12.6" y="15.1" width="4.2" height="3.1" rx="0.45" fill="#fff" opacity="0.5" />
        </>
      ) : null}
      {glyph === "markdown" ? <Label fontSize={5.4}>MD</Label> : null}
      {glyph === "html" ? (
        <text
          x="12"
          y="17.6"
          textAnchor="middle"
          fill="#fff"
          fontSize={6.4}
          fontWeight={800}
          fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
        >
          {"</>"}
        </text>
      ) : null}
      {glyph === "text" ? (
        <>
          <rect x="7.4" y="11.4" width="9.2" height="1.35" rx="0.5" fill="#fff" />
          <rect x="7.4" y="14" width="9.2" height="1.35" rx="0.5" fill="#fff" opacity="0.85" />
          <rect x="7.4" y="16.6" width="6.4" height="1.35" rx="0.5" fill="#fff" opacity="0.65" />
        </>
      ) : null}
      {glyph === "image" ? (
        <>
          <circle cx="9.1" cy="12.2" r="1.15" fill="#fff" />
          <path fill="#fff" d="M7.2 18.4 10.4 14.6l2.2 2.4 2.1-2.8 2.9 4.2H7.2Z" />
        </>
      ) : null}
      {glyph === "code" ? (
        <text
          x="12"
          y="17.6"
          textAnchor="middle"
          fill="#fff"
          fontSize={6.4}
          fontWeight={800}
          fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
        >
          {"{ }"}
        </text>
      ) : null}
    </svg>
  );
}
