"use client";

import { useSyncExternalStore } from "react";

export type CloudSyncPhase = "idle" | "syncing" | "error" | "merged";

export interface CloudSyncStatus {
  phase: CloudSyncPhase;
  message: string | null;
}

const IDLE: CloudSyncStatus = { phase: "idle", message: null };

let current: CloudSyncStatus = IDLE;
const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) listener();
}

export function getCloudSyncStatus(): CloudSyncStatus {
  return current;
}

export function subscribeCloudSync(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
  };
}

export function setCloudSyncStatus(next: CloudSyncStatus): void {
  current = next;
  emit();
}

export function clearCloudSyncMessage(): void {
  if (!current.message && current.phase === "idle") return;
  current = {
    phase: current.phase === "syncing" ? "syncing" : "idle",
    message: null,
  };
  emit();
}

export function useCloudSyncStatus(): CloudSyncStatus {
  return useSyncExternalStore(subscribeCloudSync, getCloudSyncStatus, getCloudSyncStatus);
}

export function __resetCloudSyncStatusForTests(): void {
  current = IDLE;
}
