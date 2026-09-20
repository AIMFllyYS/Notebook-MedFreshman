"use client";

import { useState, type ImgHTMLAttributes } from "react";
import { ImageOff } from "lucide-react";
import { useLightbox } from "@/lib/stores/lightbox";
import { useT } from "@/lib/i18n";

export function ChatImage({ src, alt, title, ...rest }: ImgHTMLAttributes<HTMLImageElement>) {
  const t = useT();
  const [errored, setErrored] = useState(false);
  const openLightbox = useLightbox((s) => s.open);

  const resolvedSrc: string | undefined = typeof src === "string" ? src : undefined;

  if (errored || !resolvedSrc) {
    return (
      <span className="figure-directive-error" role="img" aria-label={alt ?? "image"}>
        <ImageOff size={24} />
        <span>{alt || t("trace.images.loadFailed")}</span>
      </span>
    );
  }

  const handleClick = () => {
    openLightbox(resolvedSrc, alt || title || "");
  };

  const imgEl = (
    <img
      src={resolvedSrc}
      alt={alt ?? ""}
      title={title}
      loading="lazy"
      decoding="async"
      onError={() => setErrored(true)}
      onClick={handleClick}
      className="chat-image-clickable"
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
