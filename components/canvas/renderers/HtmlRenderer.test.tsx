import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { HtmlRenderer } from "./HtmlRenderer";
import {
  CANVAS_HTML_IFRAME_SANDBOX,
  OPAQUE_ORIGIN_STORAGE_SHIM_MARKER,
} from "@/lib/sandbox/opaqueOriginStorageShim";

const VIZ_HTML = `<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
  <canvas id="plot"></canvas>
</body>
</html>`;

describe("HtmlRenderer", () => {
  afterEach(() => {
    cleanup();
  });

  it("sandboxes AI HTML without same-origin and does not strip canvas or CDN scripts", () => {
    render(
      <HtmlRenderer
        block={{
          kind: "html",
          title: "chart demo",
          source: VIZ_HTML,
        }}
      />,
    );

    const frame = screen.getByTitle("chart demo");
    const sandbox = frame.getAttribute("sandbox") ?? "";
    const srcDoc = frame.getAttribute("srcdoc") ?? "";

    expect(sandbox).toBe(CANVAS_HTML_IFRAME_SANDBOX);
    expect(sandbox).toContain("allow-scripts");
    expect(sandbox).not.toContain("allow-same-origin");
    expect(srcDoc).toContain(OPAQUE_ORIGIN_STORAGE_SHIM_MARKER);
    expect(srcDoc).toContain("https://cdn.jsdelivr.net/npm/chart.js");
    expect(srcDoc).toContain('<canvas id="plot"></canvas>');
  });
});
