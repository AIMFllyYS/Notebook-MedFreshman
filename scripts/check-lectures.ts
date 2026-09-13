/**
 * 课堂内容校验闸门：供 prebuild / CI / 内容 PR 使用。
 *  1) validateAllLessons：schema、文件齐全、静态 HTML 安全、手卡 reveal、题源角色/哈希、跨课节唯一/重叠；
 *  2) 校验 lectures.generated.json 是否最新（等价于 gen-lectures-manifest --check）。
 * 用法：node --import tsx scripts/check-lectures.ts
 */
import { execFileSync } from "node:child_process";
import path from "node:path";
import { validateAllLessons } from "@/lib/content/lectures/validate";

function main(): void {
  const { errors, warnings, results } = validateAllLessons();
  for (const w of warnings) console.warn(`! ${w}`);
  if (errors.length) {
    console.error(`lectures 校验发现 ${errors.length} 个错误：`);
    for (const e of errors) console.error(`  ✗ ${e}`);
    process.exit(1);
  }

  // 生成产物新鲜度（过期则要求重跑 pnpm gen:lectures）。
  try {
    execFileSync(
      process.execPath,
      ["--import", "tsx", path.join(process.cwd(), "scripts", "gen-lectures-manifest.ts"), "--check"],
      { stdio: "inherit" },
    );
  } catch {
    process.exit(1);
  }

  console.log(`lectures 校验通过：${results.length} 节课。`);
}

main();
