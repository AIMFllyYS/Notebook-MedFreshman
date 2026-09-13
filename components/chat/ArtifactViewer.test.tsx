import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import ArtifactViewer from "./ArtifactViewer";
import { useArtifacts } from "@/lib/hooks/useArtifacts";
import { useWindowManager } from "@/lib/hooks/useWindowManager";
import {
  ARTIFACT_IFRAME_SANDBOX,
  OPAQUE_ORIGIN_STORAGE_SHIM_MARKER,
} from "@/lib/sandbox/opaqueOriginStorageShim";

const HISTORICAL_HTML = `<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js"></script>
</head>
<body>
  <canvas id="view"></canvas>
  <script>
    const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById("view") });
  </script>
</body>
</html>`;

describe("ArtifactViewer", () => {
  beforeEach(() => {
    useArtifacts.setState({ order: [], byId: {}, viewerId: null, _hasHydrated: true });
    useWindowManager.setState({ windows: [], topZ: 5000, activeWindowId: null });
  });

  afterEach(() => {
    cleanup();
    useArtifacts.setState({ order: [], byId: {}, viewerId: null, _hasHydrated: true });
    useWindowManager.setState({ windows: [], topZ: 5000, activeWindowId: null });
  });

  it("opens a stored artifact without allow-same-origin and with a storage shim", () => {
    useArtifacts.getState().saveDone("art_hist", "历史演示", HISTORICAL_HTML);
    useArtifacts.getState().openViewer("art_hist");
    render(<ArtifactViewer />);

    const frame = screen.getByTitle("历史演示");
    const sandbox = frame.getAttribute("sandbox") ?? "";
    const srcDoc = frame.getAttribute("srcdoc") ?? "";

    expect(sandbox).toBe(ARTIFACT_IFRAME_SANDBOX);
    expect(sandbox).toContain("allow-scripts");
    expect(sandbox).not.toContain("allow-same-origin");
    expect(srcDoc).toContain(OPAQUE_ORIGIN_STORAGE_SHIM_MARKER);
    expect(srcDoc).toContain("https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js");
    expect(srcDoc).toContain('<canvas id="view"></canvas>');
    expect(useArtifacts.getState().byId.art_hist.html).toBe(HISTORICAL_HTML);
  });
});
