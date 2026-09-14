import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import FileTypeIcon, { resolveFileGlyphKind, fileTypeAccent, FILE_TYPE_COLORS } from "./FileTypeIcon";

describe("resolveFileGlyphKind", () => {
  it("maps common attachments by kind, mime, and filename", () => {
    expect(resolveFileGlyphKind({ kind: "pdf" })).toBe("pdf");
    expect(resolveFileGlyphKind({ name: "讲义.pdf" })).toBe("pdf");
    expect(resolveFileGlyphKind({ kind: "ppt", mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation" })).toBe("ppt");
    expect(resolveFileGlyphKind({ mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", name: "笔记.docx" })).toBe("docx");
    expect(resolveFileGlyphKind({ kind: "markdown" })).toBe("markdown");
    expect(resolveFileGlyphKind({ name: "index.html" })).toBe("html");
    expect(resolveFileGlyphKind({ kind: "text", name: "notes.txt" })).toBe("text");
    expect(resolveFileGlyphKind({ name: "main.ts" })).toBe("code");
    expect(resolveFileGlyphKind({ kind: "image" })).toBe("image");
    expect(resolveFileGlyphKind({
      kind: "pdf",
      name: "课.pptx",
      mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    })).toBe("ppt");
  });

  it("gives each glyph a distinct fill", () => {
    const fills = Object.values(FILE_TYPE_COLORS).map((item) => item.fill);
    expect(new Set(fills).size).toBe(fills.length);
    expect(fileTypeAccent({ kind: "pdf" })).toBe(FILE_TYPE_COLORS.pdf.fill);
    expect(fileTypeAccent({ kind: "ppt" })).not.toBe(fileTypeAccent({ kind: "pdf" }));
  });
});

describe("FileTypeIcon", () => {
  it("renders a unique mark per kind", () => {
    const { rerender, container } = render(<FileTypeIcon kind="pdf" />);
    expect(container.querySelector('[data-file-kind="pdf"]')).toBeTruthy();
    expect(container.textContent).toContain("PDF");

    rerender(<FileTypeIcon kind="docx" />);
    expect(container.querySelector('[data-file-kind="docx"]')).toBeTruthy();
    expect(container.textContent).toContain("W");

    rerender(<FileTypeIcon kind="ppt" />);
    expect(container.querySelectorAll("rect").length).toBeGreaterThan(3);

    rerender(<FileTypeIcon kind="html" />);
    expect(container.textContent).toContain("</>");
  });
});
