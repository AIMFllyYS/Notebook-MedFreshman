// Electron main process — Gailvlun desktop shell (Route A: env injection).
//
// Lifecycle:
//   ready -> load encrypted keys from userData
//          -> if AI_API_KEY missing, show native setup window (blocks)
//          -> spawn the Next standalone server as a child (Electron-as-Node),
//             injecting baked config + the user's 3 keys as env
//          -> wait for the local port, then open the app window on 127.0.0.1:PORT
//   "设置" menu reopens the setup window; saving restarts the server + reloads.
//   quit -> kill the server child.
//
// The Next app code is unchanged; it just reads process.env.* from the injected env.

const { app, BrowserWindow, ipcMain, safeStorage, Menu, dialog, shell } = require("electron");
const { spawn } = require("node:child_process");
const path = require("node:path");
const fs = require("node:fs");
const net = require("node:net");
const http = require("node:http");
const BAKED = require("./config");

// Only AI_API_KEY (SiliconFlow) is required for the core AI features; MiMo/Zhipu
// are optional and only unlock their own features.
const REQUIRED_KEYS = ["AI_API_KEY"];
const KEY_NAMES = ["AI_API_KEY", "MIMO_API_KEY", "ZHIPU_API_KEY"];

const KEYS_FILE = path.join(app.getPath("userData"), "keys.enc");

let serverProc = null;
let serverPort = null;
let mainWindow = null;
let setupWindow = null;
let firstRunResolver = null; // set while the blocking first-run gate is open

// ---------- key storage (encrypted at rest via OS DPAPI on Windows) ----------
function loadKeys() {
  try {
    const buf = fs.readFileSync(KEYS_FILE);
    const json = safeStorage.isEncryptionAvailable()
      ? safeStorage.decryptString(buf)
      : buf.toString("utf8");
    const obj = JSON.parse(json);
    return obj && typeof obj === "object" ? obj : {};
  } catch {
    return {};
  }
}

function saveKeys(keys) {
  const clean = {};
  for (const k of KEY_NAMES) clean[k] = typeof keys[k] === "string" ? keys[k].trim() : "";
  const json = JSON.stringify(clean);
  const data = safeStorage.isEncryptionAvailable()
    ? safeStorage.encryptString(json)
    : Buffer.from(json, "utf8");
  fs.writeFileSync(KEYS_FILE, data);
  return clean;
}

function hasRequiredKeys(keys) {
  return !!keys && REQUIRED_KEYS.every((k) => keys[k] && String(keys[k]).trim());
}

// ---------- server orchestration ----------
// Fixed loopback port → stable renderer origin (http://127.0.0.1:35349) so the app's
// IndexedDB/localStorage survive restarts. A RANDOM port per launch changes the origin
// every time, which silently orphans ALL stored data (chat history / skills / review
// cards) — the root cause of "everything's gone after reboot". Never change APP_PORT
// once shipped, or users lose access to data saved under the previous origin.
const APP_PORT = Number(BAKED.APP_PORT) || 35349;

function checkPortFree(port) {
  return new Promise((resolve) => {
    const srv = net.createServer();
    srv.once("error", () => resolve(false));
    srv.listen(port, "127.0.0.1", () => srv.close(() => resolve(true)));
  });
}

// Wait until APP_PORT is bindable. On a "save keys → restart server" cycle the previous
// child may still be releasing it, so poll briefly. If a FOREIGN app holds it we time out
// and let the caller surface a clear message — we NEVER silently switch ports (switching
// would change the origin and lose the user's data).
async function waitPortFree(port, timeoutMs = 6000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await checkPortFree(port)) return true;
    await new Promise((r) => setTimeout(r, 200));
  }
  return false;
}

function standaloneDir() {
  return app.isPackaged
    ? path.join(process.resourcesPath, "standalone")
    : path.join(__dirname, "..", ".next", "standalone");
}

function waitForServer(port, timeoutMs = 60000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const ping = () => {
      const req = http.get({ host: "127.0.0.1", port, path: "/", timeout: 2000 }, (res) => {
        res.destroy();
        resolve();
      });
      req.on("timeout", () => req.destroy());
      req.on("error", () => {
        if (Date.now() - start > timeoutMs) reject(new Error("Next 服务启动超时"));
        else setTimeout(ping, 400);
      });
    };
    ping();
  });
}

async function startServer(keys) {
  stopServer();
  serverPort = APP_PORT;
  if (!(await waitPortFree(APP_PORT))) {
    throw new Error(
      `本地端口 ${APP_PORT} 被其它程序占用。该端口用于 Gailvlun 的本地数据持久化，不能更换` +
        `（否则将读不到你之前保存的对话 / 技能 / 复习卡）。请关闭占用该端口的程序后重新启动 Gailvlun。`,
    );
  }
  const dir = standaloneDir();
  const serverJs = path.join(dir, "server.js");
  if (!fs.existsSync(serverJs)) {
    throw new Error(`未找到 standalone server.js：${serverJs}\n请先运行桌面构建。`);
  }
  const env = {
    ...process.env,
    ...BAKED,
    AI_API_KEY: keys.AI_API_KEY || "",
    MIMO_API_KEY: keys.MIMO_API_KEY || "",
    ZHIPU_API_KEY: keys.ZHIPU_API_KEY || "",
    PORT: String(serverPort),
    HOSTNAME: "127.0.0.1",
    NODE_ENV: "production",
    ELECTRON_RUN_AS_NODE: "1", // run server.js with Electron's bundled Node
  };
  const proc = spawn(process.execPath, [serverJs], { cwd: dir, env, stdio: ["ignore", "pipe", "pipe"] });
  serverProc = proc;

  // Keep the tail of stderr so startup failures explain themselves instead of just
  // timing out. (The original symptom — missing node_modules — printed a clear
  // `Cannot find module 'next'` here that the user never saw.)
  let stderrTail = "";
  let starting = true;
  proc.stdout.on("data", (d) => console.log("[server]", d.toString().trimEnd()));
  proc.stderr.on("data", (d) => {
    const s = d.toString();
    stderrTail = (stderrTail + s).slice(-4000);
    console.error("[server]", s.trimEnd());
  });

  // Race "server is up" against "child died early" so a crash surfaces immediately
  // with its real reason, rather than waiting the full waitForServer timeout.
  const earlyExit = new Promise((_, reject) => {
    proc.once("exit", (code) => {
      if (!starting) {
        if (code && code !== 0) console.error(`[server] exited with code ${code}`);
        return;
      }
      const tail = stderrTail.trim();
      reject(new Error(`Next 服务进程提前退出（退出码 ${code}）。${tail ? `\n\n${tail.slice(-1200)}` : ""}`));
    });
  });

  try {
    await Promise.race([waitForServer(serverPort), earlyExit]);
  } catch (err) {
    const msg = String(err && err.message ? err.message : err);
    const tail = stderrTail.trim();
    throw new Error(tail && !msg.includes(tail.slice(-40)) ? `${msg}\n\n${tail.slice(-1200)}` : msg);
  } finally {
    starting = false;
  }
}

function stopServer() {
  if (serverProc) {
    try {
      serverProc.kill();
    } catch {}
    serverProc = null;
  }
}

// ---------- windows ----------
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 680,
    backgroundColor: "#0b0b0f",
    title: "Gailvlun · 期末复习工作站",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      // 启用 <webview> 标签 —— 内置浏览器在桌面端用真实 Chromium 视图运行（真·全站）。
      webviewTag: true,
    },
  });
  // 收紧内嵌 webview 的预设：禁 node 集成、保持上下文隔离（嵌入任意站点的安全基线）。
  mainWindow.webContents.on("will-attach-webview", (_e, webPreferences) => {
    webPreferences.nodeIntegration = false;
    webPreferences.contextIsolation = true;
    delete webPreferences.preload;
  });
  mainWindow.loadURL(`http://127.0.0.1:${serverPort}/`);
  // open external links in the system browser, keep app links internal
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http://127.0.0.1")) return { action: "allow" };
    shell.openExternal(url);
    return { action: "deny" };
  });
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

function openSetupWindow() {
  if (setupWindow) {
    setupWindow.focus();
    return;
  }
  setupWindow = new BrowserWindow({
    width: 560,
    height: 600,
    resizable: false,
    title: "Gailvlun · API 密钥设置",
    parent: mainWindow || undefined,
    modal: !!mainWindow,
    backgroundColor: "#0b0b0f",
    webPreferences: { preload: path.join(__dirname, "setup-preload.js"), contextIsolation: true },
  });
  setupWindow.removeMenu();
  setupWindow.loadFile(path.join(__dirname, "setup.html"));
  setupWindow.on("closed", () => {
    setupWindow = null;
  });
}

// First-run blocking gate: resolves with saved keys once the user saves a valid
// required key (via setup:save -> firstRunResolver), or with null if they close
// the window without one.
function runFirstRunSetup() {
  return new Promise((resolve) => {
    let done = false;
    const finish = (val) => {
      if (done) return;
      done = true;
      firstRunResolver = null;
      clearInterval(check);
      resolve(val);
    };
    firstRunResolver = (saved) => finish(saved);
    openSetupWindow();
    const check = setInterval(() => {
      if (!setupWindow) finish(hasRequiredKeys(loadKeys()) ? loadKeys() : null);
    }, 400);
  });
}

// ---------- menu ----------
function buildMenu() {
  const template = [
    {
      label: "应用",
      submenu: [
        { label: "API 密钥设置…", click: () => openSetupWindow() },
        { type: "separator" },
        { role: "reload", label: "刷新" },
        { role: "toggleDevTools", label: "开发者工具" },
        { type: "separator" },
        { role: "quit", label: "退出" },
      ],
    },
    {
      label: "编辑",
      submenu: [
        { role: "undo", label: "撤销" },
        { role: "redo", label: "重做" },
        { type: "separator" },
        { role: "cut", label: "剪切" },
        { role: "copy", label: "复制" },
        { role: "paste", label: "粘贴" },
        { role: "selectAll", label: "全选" },
      ],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

// ---------- IPC (setup window) ----------
ipcMain.handle("setup:get-keys", () => loadKeys());

ipcMain.handle("setup:save", async (_e, keys) => {
  const saved = saveKeys(keys);
  try {
    if (serverProc) {
      // already running -> apply new keys immediately (restart + reload)
      await startServer(saved);
      if (mainWindow) mainWindow.loadURL(`http://127.0.0.1:${serverPort}/`);
    }
    // first-run gate (server not started yet) -> let app.whenReady continue
    if (firstRunResolver) {
      const resolve = firstRunResolver;
      firstRunResolver = null;
      resolve(saved);
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err && err.message ? err.message : err) };
  }
});

// Best-effort validation: GET {base}/models with the SiliconFlow key.
ipcMain.handle("setup:test", async (_e, keys) => {
  const result = {};
  const tryModels = async (base, key, label) => {
    if (!key || !key.trim()) return { label, status: "empty" };
    try {
      const resp = await fetch(`${base.replace(/\/+$/, "")}/models`, {
        headers: { Authorization: `Bearer ${key.trim()}` },
      });
      return { label, status: resp.ok ? "ok" : `http ${resp.status}` };
    } catch (e) {
      return { label, status: `error: ${String(e && e.message ? e.message : e)}` };
    }
  };
  result.AI_API_KEY = await tryModels(BAKED.AI_BASE_URL, keys.AI_API_KEY, "硅基流动");
  result.MIMO_API_KEY = await tryModels(BAKED.MIMO_BASE_URL, keys.MIMO_API_KEY, "小米 MiMo");
  // Zhipu web-search uses a different API surface; we only check non-empty.
  result.ZHIPU_API_KEY = { label: "智谱", status: keys.ZHIPU_API_KEY?.trim() ? "filled" : "empty" };
  return result;
});

// ---------- app lifecycle ----------
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  // 内置浏览器 webview 弹出的窗口（OAuth/登录弹窗等）放行为真实窗口，让第三方登录流程
  // 正常工作；非 http/https 协议一律拒绝。
  app.on("web-contents-created", (_e, contents) => {
    if (typeof contents.getType === "function" && contents.getType() === "webview") {
      contents.setWindowOpenHandler(({ url }) =>
        /^https?:\/\//i.test(url) ? { action: "allow" } : { action: "deny" },
      );
    }
  });

  app.whenReady().then(async () => {
    buildMenu();
    let keys = loadKeys();
    if (!hasRequiredKeys(keys)) {
      keys = await runFirstRunSetup();
      if (!keys || !hasRequiredKeys(keys)) {
        app.quit();
        return;
      }
    }
    try {
      await startServer(keys);
      createMainWindow();
    } catch (err) {
      dialog.showErrorBox("启动失败", String(err && err.message ? err.message : err));
      app.quit();
    }
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0 && serverPort) createMainWindow();
  });

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
  });

  app.on("before-quit", stopServer);
  app.on("will-quit", stopServer);
}
