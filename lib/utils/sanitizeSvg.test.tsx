import { describe, expect, it } from "vitest";
import { sanitizeSvg } from "./sanitizeSvg";

describe("sanitizeSvg", () => {
  it("strips class attributes so injected app classes cannot materialize", () => {
    const out = sanitizeSvg(
      '<svg class="image-lightbox-backdrop" viewBox="0 0 10 10"><rect class="chat-input-container" width="10" height="10"/></svg>',
      false,
    );
    expect(out).not.toMatch(/class=/);
    expect(out).toContain("viewBox=");
    expect(out).toContain("<rect");
  });

  it("keeps id for internal url(#) references", () => {
    const out = sanitizeSvg(
      '<svg viewBox="0 0 10 10"><defs><marker id="m"><path d="M0 0L1 1"/></marker></defs><line x1="0" y1="0" x2="1" y2="1" marker-end="url(#m)"/></svg>',
      false,
    );
    expect(out).toContain('id="m"');
    expect(out).toContain("url(#m)");
  });

  it("still removes script and event handlers", () => {
    const out = sanitizeSvg(
      '<svg viewBox="0 0 10 10" onload="alert(1)"><script>alert(2)</script><rect width="10" height="10" onclick="alert(3)"/></svg>',
      false,
    );
    expect(out).not.toMatch(/<script|onload|onclick/i);
  });
});
