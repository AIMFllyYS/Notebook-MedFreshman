"use client";

import { AgentImageIcon } from "@/components/icons/AgentIcons";
import { ChatImage } from "@/components/chat/ChatImage";
import { ImageStrip } from "@/components/chat/ImageStrip";
import { dedupeByKey, webItemKey } from "@/lib/chat/traceSources";
import type { ResultCardProps } from "@/lib/ai/agent/tools/registry";

export default function ImageSearchResultCard({ part }: ResultCardProps<"imageSearch">) {
  if (part.state !== "output-available" || !part.output.sources?.length) return null;
  const sources = dedupeByKey(part.output.sources, webItemKey);
  if (!sources.length) return null;

  return (
    <div className="image-search-gallery">
      <div className="image-search-gallery-header">
        <AgentImageIcon size={16} />
        <span>本次搜索图片 · {sources.length} 张</span>
        <span className="image-search-gallery-via">via Unsplash</span>
      </div>
      <ImageStrip>
        {sources.map((source) => (
          <div
            key={source.url}
            className="image-search-gallery-item"
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData("text/uri-list", source.url);
              e.dataTransfer.setData("text/plain", source.url);
              e.dataTransfer.effectAllowed = "copy";
            }}
          >
            <ChatImage src={source.url} alt={source.alt || source.title || "图片"} />
            <div className="image-search-gallery-credit">
              <a href={source.url} target="_blank" rel="noopener noreferrer">
                {source.title || source.alt || "图片"}
              </a>
              {source.author ? (
                <>
                  {" · "}
                  <a href={source.authorUrl || source.url} target="_blank" rel="noopener noreferrer">
                    {source.author}
                  </a>
                </>
              ) : null}
              {" · "}
              <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer">Unsplash</a>
            </div>
          </div>
        ))}
      </ImageStrip>
    </div>
  );
}
