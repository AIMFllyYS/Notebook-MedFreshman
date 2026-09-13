/**
 * Compatibility entry for the real SDK smoke test.
 * Usage: node --import tsx scripts/verify-models.ts --live [--strict] [--matrix] [--tools]
 * The old probe forced temperature=0, max_tokens=8 and counted HTTP 200 as success.
 * Delegate to the production adapter and verify actual text/landed model instead.
 */
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = spawnSync(process.execPath, ['--import', 'tsx', fileURLToPath(new URL('./verify-gateway-live.ts', import.meta.url)), ...process.argv.slice(2)], { stdio: 'inherit' });
  process.exitCode = result.status ?? 1;
}
