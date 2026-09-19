import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { join } from "node:path";

const root = process.cwd();

function readWorkspaceFile(path: string) {
  return readFileSync(join(root, path), "utf8");
}

test("顶栏与壳走 StudySolo 三模式，不再写期末复习工作站", () => {
  const appShell = readWorkspaceFile("components/layout/AppShell.tsx");
  const mobile = readWorkspaceFile("components/layout/MobileTopBar.tsx");
  const switcher = readWorkspaceFile("components/layout/ModeSwitcher.tsx");
  const bookshelf = readWorkspaceFile("components/layout/HomeBookshelf.tsx");
  const logo = readWorkspaceFile("components/layout/BrandLogo.tsx");

  assert.match(appShell, /from "\.\/ModeSwitcher"/);
  assert.match(appShell, /<ModeSwitcher\s*\/>/);
  assert.match(appShell, /useAppMode/);
  assert.match(appShell, /usesStudioChrome/);
  assert.match(appShell, /usesMobileStudioChrome/);
  assert.match(appShell, /retainAgentOnStudio/);
  assert.match(appShell, /hrefForMobileAppMode/);
  assert.doesNotMatch(appShell, /期末复习工作站/);
  assert.doesNotMatch(appShell, /from "\.\/BrandLogo"/);

  assert.match(mobile, /打开侧栏/);
  assert.match(mobile, /usesMobileStudioChrome/);
  assert.doesNotMatch(mobile, /from "\.\/ModeSwitcher"/);
  assert.doesNotMatch(mobile, /from "\.\/BrandLogo"/);

  const drawer = readWorkspaceFile("components/layout/MobileSidebarDrawer.tsx");
  assert.match(drawer, /<ModeSwitcher compact stayOnStudioForAgent \/>/);
  assert.match(drawer, /SubjectFolderTree/);

  assert.match(switcher, /from "@\/components\/ui\/AnchoredMenu"/);
  assert.match(switcher, /appModeTitle/);
  assert.match(switcher, /app-mode-option-\$\{item\}/);
  assert.match(switcher, /APP_MODES\.map/);

  assert.match(bookshelf, /StudySolo/);
  assert.doesNotMatch(bookshelf, /期末复习工作站/);
  assert.match(logo, /aria-label="StudySolo"/);
});

test("Agent / Class 路由接上，Agent 复用 ChatPanel 槽位", () => {
  const agentPage = readWorkspaceFile("app/agent/page.tsx");
  const classPage = readWorkspaceFile("app/class/page.tsx");
  const workspace = readWorkspaceFile("components/layout/AgentWorkspace.tsx");
  const appShell = readWorkspaceFile("components/layout/AppShell.tsx");
  const placeholder = readWorkspaceFile("components/layout/ClassPlaceholder.tsx");

  assert.match(agentPage, /from "@\/components\/layout\/AgentWorkspace"/);
  assert.match(classPage, /from "@\/components\/layout\/ClassPlaceholder"/);
  // 左对话栏是常驻列（可收起），右侧工作区是顶层外壳里与顶栏并列、通到窗口最顶的一列。
  assert.match(workspace, /data-agent-slot="conversations"/);
  assert.match(workspace, /data-agent-slot="main"/);
  assert.doesNotMatch(workspace, /data-agent-slot="windows"/);
  assert.match(workspace, /AgentConversationSidebar/);
  assert.match(workspace, /components\/chat\/ChatPanel/);
  assert.doesNotMatch(workspace, /next\/dynamic/);
  assert.match(workspace, /if \(isMobile\)/);
  assert.match(workspace, /展开对话栏/);
  const dockColumn = readWorkspaceFile("components/layout/AgentDockColumn.tsx");
  assert.match(dockColumn, /data-agent-slot="windows"/);
  assert.match(dockColumn, /hideAiTab/);
  assert.match(dockColumn, /hideBuiltinTabs/);
  assert.match(dockColumn, /showWindowDock/);
  assert.match(appShell, /AgentDockColumn/);
  assert.match(appShell, /isAgentRoute/);
  assert.match(appShell, /agent-dock-toggle|展开右侧工作区/);
  const sidebar = readWorkspaceFile("components/layout/AgentConversationSidebar.tsx");
  assert.match(sidebar, /from "\.\/LeftDock"/);
  assert.match(sidebar, /正常对话/);
  assert.match(sidebar, /划词助手对话/);
  assert.match(appShell, /hideWindowTaskbar/);
  assert.match(placeholder, /开发中/);

  const settings = readWorkspaceFile("components/layout/MobileSettingsPanel.tsx");
  const globalSettings = readWorkspaceFile("components/layout/GlobalSettings.tsx");
  assert.match(settings, /from "\.\/GlobalSettings"/);
  assert.match(settings, /variant="page"/);
  assert.doesNotMatch(settings, /ChatSettings/);
  assert.match(globalSettings, /mobile-settings-quota/);
  assert.match(globalSettings, /AccountQuota/);
  assert.doesNotMatch(globalSettings, /UserQuotaPanel/);
  assert.match(appShell, /MobileSidebarDrawer/);
  assert.match(appShell, /MobileMiniChat/);
});
