import assert from "node:assert/strict";
import { test } from "node:test";
import {
  EMPTY_DB_BACKEND,
  loadLiveCatalogSnapshot,
  migrateEmptyDatabase,
} from "./empty-postgres.ts";
import { catalogsMatch, diffCatalogs } from "./migrate.ts";

test("empty PGlite migrate equals live catalog snapshot", { timeout: 60_000 }, async () => {
  const result = await migrateEmptyDatabase();
  const snapshot = loadLiveCatalogSnapshot();
  const diff = diffCatalogs(result.catalog, snapshot.catalog);

  assert.equal(result.backend, EMPTY_DB_BACKEND);
  assert.deepEqual(result.applied, ["0001", "0002", "0003", "0004", "0005", "0006", "0007", "0008"]);
  assert.deepEqual(result.replay, {
    applied: [],
    skipped: ["0001", "0002", "0003", "0004", "0005", "0006", "0007", "0008"],
  });
  assert.equal(result.currentVersion, "0008");
  assert.equal(result.status.applied[0]?.version, "0001");
  assert.equal(result.status.applied[1]?.version, "0002");
  assert.equal(result.status.applied[2]?.version, "0003");
  assert.equal(result.status.applied[3]?.version, "0004");
  assert.equal(result.status.applied[4]?.version, "0005");
  assert.equal(result.status.applied[5]?.version, "0006");
  assert.equal(result.status.applied[6]?.version, "0007");
  assert.equal(result.status.applied[7]?.version, "0008");
  assert.equal(result.status.pending.length, 0);
  assert.equal(
    catalogsMatch(diff),
    true,
    `empty catalog must equal live snapshot: ${JSON.stringify(diff)}`,
  );
  assert.deepEqual(diff.noise, []);
  assert.deepEqual(result.catalog.tables, snapshot.catalog.tables);
  assert.deepEqual(result.catalog.indexes, snapshot.catalog.indexes);
  assert.deepEqual(result.catalog.triggers, snapshot.catalog.triggers);
  assert.deepEqual(result.catalog.policies, snapshot.catalog.policies);
  assert.deepEqual(result.catalog.rlsTables, snapshot.catalog.rlsTables);
});
