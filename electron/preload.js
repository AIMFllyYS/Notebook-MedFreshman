// Main window preload. The app is a normal web app served from 127.0.0.1, so it
// needs no privileged bridge for its core features. We expose a tiny, read-only
// `window.desktop` flag so the renderer can feature-detect the Electron build and
// switch the in-app browser from <iframe> to a real <webview> (真实浏览器).
const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("desktop", {
  isElectron: true,
  platform: process.platform,
});
