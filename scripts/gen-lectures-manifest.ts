/**
 * 课堂内容生成器：扫描 content/<subject>/lectures/<lesson>/，严格校验后
 * 确定性地写出 lib/content-data/lectures.generated.json（只含元数据/指针/哈希，不含正文）。
 *
 * 用法：
 *   node --import tsx scripts/gen-lectures-manifest.ts          # 生成 / 覆盖
 *   node --import tsx scripts/gen-lectures-manifest.ts --check  # CI：已提交文件过期则非零退出
 *
 * 该生成器独立于 gen-nav-manifest：它只读 lesson.json + 学科别名 + 材料文件，
 * 不读取最终导航清单；manifest 适配层（lib/content-data/lectures.ts）再把它合并进导航。
 */
import fs from "node:fs";
import path from "node:path";
import { validateAllLessons } from "@/lib/content/lectures/validate";
import {
  LECTURES_GENERATED_VERSION,
  type LectureCatalog,
} from "@/lib/content/lectures/catalog";

const OUT = path.join(process.cwd(), "lib", "content-data", "lectures.generated.json");
const check = process.argv.includes("--check");

// 生成产物必须是合法 JSON（被 lib/content-data/lectures.ts 以 resolveJsonModule 直接 import），
// 因此不写 `//` 头注释；「请勿手改 / 如何重生成」的说明维护在 SOP 12 与本脚本头注释里。
function serialize(data: unknown): string {
  return JSON.stringify(data, null, 2) + "\n";
}

function main(): void {
  const { errors, warnings, results } = validateAllLessons();
  if (warnings.length) {
    console.warn(`lectures: ${warnings.length} warning(s)`);
    for (const w of warnings) console.warn(`  ! ${w}`);
  }
  if (errors.length) {
    console.error(`lectures: ${errors.length} error(s)`);
    for (const e of errors) console.error(`  ✗ ${e}`);
    process.exit(1);
  }

  const catalog: LectureCatalog = {
    schemaVersion: LECTURES_GENERATED_VERSION,
    lessons: results.map((r) => r.entry),
  };
  const body = serialize(catalog);

  if (check) {
    const current = fs.existsSync(OUT) ? fs.readFileSync(OUT, "utf8") : "";
    if (current !== body) {
      console.error(
        "lectures.generated.json 已过期：请运行 pnpm gen:lectures 并提交产物。",
      );
      process.exit(1);
    }
    console.log("lectures.generated.json 已是最新。");
    return;
  }

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, body, "utf8");
  console.log(
    `lectures: 已生成 ${catalog.lessons.length} 节课 → lib/content-data/lectures.generated.json`,
  );
}

main();
