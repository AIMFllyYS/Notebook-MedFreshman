"use client";

import { useState } from "react";
import { ImageOff } from "lucide-react";

interface ContentImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  node?: unknown;
}

/**
 * Shared image component for markdown content (NoteRenderer & QuizMarkdown).
 * Wraps in <figure> when a title/caption is present; shows a fallback on error.
 */
export function ContentImage({ src, alt, title, node, ...rest }: ContentImageProps) {
  const [errored, setErrored] = useState(false);

  if (errored || !src) {
    return (
      <span className="figure-directive-error" role="img" aria-label={alt ?? "image"}>
        <ImageOff size={24} />
        <span>{alt || "图片加载失败"}</span>
      </span>
    );
  }

  const imgEl = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt ?? ""}
      title={title}
      loading="lazy"
      decoding="async"
      onError={() => setErrored(true)}
      {...rest}
    />
  );

  if (title) {
    return (
      <figure className="figure-directive">
        {imgEl}
        <figcaption>{title}</figcaption>
      </figure>
    );
  }

  return imgEl;
}
