'use client';

import { createContext, useContext, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { BookOpen, Globe } from "lucide-react";
import type { CitationSource } from "@/lib/chat/citationCatalog";
import { citationByIndex, parseCiteIndexes } from "@/lib/chat/citationCatalog";
import { openCitationSource } from "@/lib/chat/openCitation";
import { useT } from "@/lib/i18n";

export const CitationCatalogContext = createContext<CitationSource[]>([]);

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function popoverPosition(anchor: DOMRect) {
  const width = Math.min(300, window.innerWidth - 16);
  const left = Math.min(Math.max(8, anchor.left + anchor.width / 2 - width / 2), window.innerWidth - width - 8);
  const below = anchor.bottom + 8;
  const top = below + 160 > window.innerHeight ? Math.max(8, anchor.top - 168) : below;
  return { top, left, width };
}

export function InlineCiteMarker({
  source,
  catalog,
}: {
  source: CitationSource;
  catalog: readonly CitationSource[];
}) {
  const t = useT();
  const popoverId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 280 });

  const syncPos = () => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPos(popoverPosition(rect));
  };

  useEffect(() => {
    if (!open) return;
    syncPos();
    const onScroll = () => syncPos();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
  }, [open]);

  const title = source.title.trim() || t("agent.citation.untitled");
  const locator = source.kind === "web" && source.url ? hostOf(source.url) : source.path || "";

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className="inline-cite"
        data-testid="inline-cite"
        data-cite-index={source.index}
        aria-label={t("agent.citation.markerAria", { index: source.index, title })}
        aria-describedby={open ? popoverId : undefined}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          openCitationSource(source, catalog);
        }}
      >
        {source.index}
      </button>
      {open && typeof document !== "undefined"
        ? createPortal(
            <div
              id={popoverId}
              role="tooltip"
              className="inline-cite-popover"
              data-testid="inline-cite-popover"
              style={{ top: pos.top, left: pos.left, width: pos.width }}
              onMouseEnter={() => setOpen(true)}
              onMouseLeave={() => setOpen(false)}
            >
              <div className="inline-cite-popover-kicker">
                {source.kind === "web" ? <Globe size={12} /> : <BookOpen size={12} />}
                <span>{source.kind === "web" ? t("agent.citation.kindWeb") : t("agent.citation.kindNote")}</span>
                <span className="inline-cite-popover-index">{source.index}</span>
              </div>
              <div className="inline-cite-popover-title-row">
                <strong className="inline-cite-popover-title">{title}</strong>
              </div>
              {locator ? <div className="inline-cite-popover-loc">{locator}</div> : null}
              {source.snippet ? <p className="inline-cite-popover-snippet">{source.snippet}</p> : null}
              <div className="inline-cite-popover-hint">{t("agent.citation.open")}</div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

export function CiteRef({
  indexes,
}: {
  indexes?: string;
  node?: unknown;
}) {
  const catalog = useContext(CitationCatalogContext);
  const nums = parseCiteIndexes(String(indexes ?? ""));
  const sources = nums
    .map((index) => citationByIndex(catalog, index))
    .filter((source): source is CitationSource => Boolean(source));
  if (!sources.length) return <span>[{indexes}]</span>;
  return (
    <span className="inline-cite-cluster">
      {sources.map((source) => (
        <InlineCiteMarker key={source.index} source={source} catalog={catalog} />
      ))}
    </span>
  );
}
