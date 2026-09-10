import { create, type StateCreator } from "zustand";
import { persist, createJSONStorage, type PersistOptions } from "zustand/middleware";
import { idbStorage } from "@/lib/storage/idbStorage";

export type PersistedStoreOptions<T> = {
  /** 必须与搬家前的 persist name 逐字相同，否则用户数据对不上。 */
  name: string;
  storage: "idb" | "local";
  version?: number;
  migrate?: PersistOptions<T, unknown>["migrate"];
  partialize?: PersistOptions<T, unknown>["partialize"];
  onRehydrateStorage?: PersistOptions<T, unknown>["onRehydrateStorage"];
};

export function createPersistedStore<T>(
  initializer: StateCreator<T>,
  opts: PersistedStoreOptions<T>,
) {
  const storage =
    opts.storage === "idb"
      ? createJSONStorage(() => idbStorage)
      : createJSONStorage(() => localStorage);

  return create<T>()(
    persist(initializer, {
      name: opts.name,
      storage,
      ...(opts.version != null ? { version: opts.version } : {}),
      ...(opts.migrate ? { migrate: opts.migrate } : {}),
      ...(opts.partialize ? { partialize: opts.partialize } : {}),
      ...(opts.onRehydrateStorage ? { onRehydrateStorage: opts.onRehydrateStorage } : {}),
    }),
  );
}
