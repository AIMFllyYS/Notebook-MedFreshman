import type { CloudSyncKind } from "./types";

let enabled = false;
let suppress = 0;

export function isCloudSyncEnabled(): boolean {
  return enabled;
}

export function setCloudSyncEnabled(value: boolean): void {
  enabled = value;
}

export function beginCloudSyncApply(): void {
  suppress += 1;
}

export function endCloudSyncApply(): void {
  suppress = Math.max(0, suppress - 1);
}

function canSchedule(): boolean {
  return enabled && suppress === 0 && typeof window !== "undefined";
}

export function scheduleCloudUpsert(kind: CloudSyncKind, clientId: string): void {
  if (!canSchedule() || !clientId) return;
  void import("./engine").then((mod) => mod.enqueueUpsert(kind, clientId));
}

export function scheduleCloudTombstone(kind: CloudSyncKind, clientId: string): void {
  if (!canSchedule() || !clientId) return;
  void import("./engine").then((mod) => mod.enqueueTombstone(kind, clientId));
}

export function scheduleCloudPull(): void {
  if (!canSchedule()) return;
  void import("./engine").then((mod) => mod.pullAndPushAll());
}
