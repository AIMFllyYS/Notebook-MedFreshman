import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { join } from "node:path";

const root = process.cwd();

function readWorkspaceFile(path: string) {
  return readFileSync(join(root, path), "utf8");
}

test("左下角坞显示头像和昵称，设置菜单顶部是账户信息", () => {
  const dock = readWorkspaceFile("components/layout/LeftDock.tsx");
  const settings = readWorkspaceFile("components/layout/GlobalSettings.tsx");
  const dialog = readWorkspaceFile("components/layout/AccountDialog.tsx");
  const sidebar = readWorkspaceFile("components/layout/SubjectSidebar.tsx");

  assert.match(dock, /LeftDockFace/);
  assert.match(dock, /useAccountProfile/);
  assert.match(dock, /UserDockMenu|user-menu-quota|额度/);
  assert.match(sidebar, /LeftDock/);
  assert.match(sidebar, /UserQuotaPanel/);
  assert.match(settings, /data-testid="account-card"/);
  assert.match(settings, /Math\.min\(352/);
  assert.match(settings, /AccountDialog/);
  assert.match(dialog, /只保存在这台设备/);
  assert.match(dialog, /设置密码|修改密码/);
});

test("昵称走档案 API，头像只本地 persist", () => {
  const store = readWorkspaceFile("lib/stores/userProfile.ts");
  const client = readWorkspaceFile("lib/profile/client.ts");
  const migration = readWorkspaceFile("supabase/migrations/0006_app_users_nickname.sql");
  const authFetch = readWorkspaceFile("lib/auth/installAiAuthFetch.ts");

  assert.match(store, /studysolo-user-profile/);
  assert.match(store, /setLocalAvatar/);
  assert.doesNotMatch(store, /from\("app_users"\)/);
  assert.match(client, /\/api\/profile/);
  assert.match(migration, /add column if not exists nickname/);
  assert.doesNotMatch(migration, /avatar/);
  assert.match(authFetch, /\/api\/profile/);
});
