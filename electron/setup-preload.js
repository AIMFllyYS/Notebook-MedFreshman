// Preload for the setup window — exposes a tiny, safe IPC bridge.
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("setupAPI", {
  getKeys: () => ipcRenderer.invoke("setup:get-keys"),
  save: (keys) => ipcRenderer.invoke("setup:save", keys),
  test: (keys) => ipcRenderer.invoke("setup:test", keys),
});
