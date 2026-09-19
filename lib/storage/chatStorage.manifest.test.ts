import assert from "node:assert/strict";
import { test } from "node:test";
import {
  buildManifest,
  ensureDefaultProjects,
  isSystemProject,
  manifestFrom,
  SYSTEM_PROJECT_IDS,
  type ChatFolder,
  type SessionMeta,
} from "./chatStorage.ts";

function session(id: string, patch: Partial<SessionMeta> = {}): SessionMeta {
  return { id, title: id, createdAt: 1, updatedAt: 1, messageCount: 0, artifactIds: [], ...patch };
}

test("buildManifest 补齐可选字段，绝不留 undefined", () => {
  const manifest = buildManifest({ activeSessionId: null, sessions: [] });
  assert.equal(manifest.version, 2);
  assert.deepEqual(manifest.folders, []);
  assert.equal(manifest.activeProjectId, null);
});

test("manifestFrom 只覆盖显式字段：改会话不会丢掉项目", () => {
  const folders: ChatFolder[] = [{ id: "folder-a", name: "组胚", createdAt: 5 }];
  const source = {
    activeSessionId: "s1",
    sessionsMeta: [session("s1")],
    folders,
    activeProjectId: "folder-a",
  };
  // 2026-09-20 的真实事故：云端拉取时只写了 sessions，folders 整批消失。
  const kept = manifestFrom(source, { sessions: [session("s1"), session("s2")] });
  assert.deepEqual(kept.folders, folders);
  assert.equal(kept.activeProjectId, "folder-a");
  assert.equal(kept.activeSessionId, "s1");
  assert.equal(kept.sessions.length, 2);

  const moved = manifestFrom(source, { activeSessionId: "s2" });
  assert.deepEqual(moved.folders, folders);
  assert.equal(moved.activeSessionId, "s2");
  assert.equal(moved.sessions.length, 1);
});

test("ensureDefaultProjects 只补缺的：用户改过的名字与新建项目都保留", () => {
  assert.equal(ensureDefaultProjects([])?.length, 2);
  assert.equal(ensureDefaultProjects([])?.[0].id, "project-note");
  assert.equal(ensureDefaultProjects([])?.[1].id, "project-floating");
  assert.equal(ensureDefaultProjects([
    { id: "project-note", name: "我的笔记对话", createdAt: 1, system: "note" },
    { id: "project-floating", name: "划词摘录", createdAt: 0, system: "floating" },
  ]), null, "两个都在就不写盘");
  const seeded = ensureDefaultProjects([
    { id: "project-note", name: "我的笔记对话", createdAt: 1, system: "note" },
    { id: "folder-a", name: "组胚", createdAt: 2 },
  ]);
  assert.ok(seeded);
  assert.equal(seeded.length, 3);
  assert.equal(seeded.find((f) => f.id === "project-note")?.name, "我的笔记对话");
  assert.ok(seeded.some((f) => f.id === "project-floating"));
});

test("isSystemProject：按 system 标记或按系统 id 都算系统项目", () => {
  assert.equal(isSystemProject({ id: "project-note" }), true);
  assert.equal(isSystemProject({ id: "project-floating" }), true);
  assert.equal(isSystemProject({ id: "x", system: "note" }), true);
  assert.equal(isSystemProject({ id: "folder-a" }), false);
  assert.deepEqual([...SYSTEM_PROJECT_IDS], ["project-note", "project-floating"]);
});