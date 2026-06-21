"use client";

import { useState } from "react";
import { ImageOff } from "lucide-react";

interface NodeProps {
  node?: { properties?: Record<string, unknown> };
  children?: React.ReactNode;
}

export function Figure({ node }: NodeProps) {
  const src = String(node?.properties?.src ?? "");
  const alt = String(node?.properties?.alt ?? "");
  const caption = String(node?.properties?.caption ?? "");
  const [errored, setErrored] = useState(false);

  if (!src) return null;

  return (
    <figure className="figure-directive">
      {errored ? (
        <span className="figure-directive-error" role="img" aria-label={alt}>
          <ImageOff size={24} />
          <span>{alt || "图片加载失败"}</span>
        </span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onError={() => setErrored(true)}
        />
      )}
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}
