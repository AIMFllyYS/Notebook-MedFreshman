import "@testing-library/jest-dom/vitest";
// JSDOM has no viewport scrolling; motion's measurement pass still calls this API.
import { vi } from 'vitest';
window.scrollTo = vi.fn();
