import fs from "fs";
import path from "path";
import {
  resolveProvider,
  chatCompletionsUrl,
} from "../lib/ai/provider";

const MODEL_ID = (
  process.env.AI_MODEL_FLASH ||
  process.env.AI_MODEL_PRO ||
  ""
).trim();
const TEXTBOOK_DIR = path.resolve(process.cwd(), "content/maogai/textbook");
const MAP_PATH = path.resolve(
  process.cwd(),
  "scripts/temp/maogai-textbook/split-map.json"
);

const SYSTEM_PROMPT = `你是教材排版助手。任务：把用户提供的教材小节正文重写成“大纲笔记式” markdown，便于复习。

严格约束（必须遵守）：
1. 你是排版助手，不是作者。必须保留原文的每一句话、每一个事实、每一个数据、每一条引用，不得省略、不得改写原意、不得添加原文没有的观点。
2. 参考风格：content/maogai/detail/3.1.md、1.2.md、7.1.md（讲解型大纲笔记，多用 callout、表格、列表）。
3. 保持原文件顶部的 # 标题不变（仅保留标题文字，不要加引号或额外标记）。
4. 使用层级标题组织：# 节标题、## 大点、### 小点、#### 细节。
5. 原文中凡是出现“第一/第二/第三/第四/第五”“一是/二是/三是”“首先/其次/再次/最后”“（一）（二）（三）”等分点表述，必须转换成清晰的 - 列表，且列表项必须保留原文对应句子的完整内容，不能精简。
6. 核心概念、定义用 :::definition{label=概念名} ... ::: 包裹。注意：被包裹的 definition 中的内容也必须是原文原句，不能改写。
7. 重要总结、因果分析、方法论用 :::insight{label=...} ... ::: 或 :::note{label=...} ... ::: 包裹，包裹内容必须来自原文。
8. 时间线、阶段、对比用 Markdown 表格呈现，表格中的文字必须来自原文。
9. 保留所有原文图片，格式必须完全一致：![...](/images/maogai/textbook/...)。
10. 保留所有 <sup>①</sup> 类脚注标记。
11. 不要使用 4 个冒号的指令（::::），容器指令只用 3 个冒号（:::）。
12. 不要输出任何解释性文字，只输出改写后的 markdown 正文。
13. 不要输出代码块包裹（如 \`\`\`markdown）。
14. 改写后的中文字符数应尽量接近原文，不得低于原文的 92%。`;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function callModel(userContent: string): Promise<string> {
  if (!MODEL_ID) {
    throw new Error(
      "未配置 AI 模型。请在 .env.local 中设置 AI_MODEL_FLASH 或 AI_MODEL_PRO，或显式传入 --model。"
    );
  }
  const provider = resolveProvider(MODEL_ID);
  if (!provider.configured || !provider.baseUrl || !provider.apiKey) {
    throw new Error(
      `模型 ${MODEL_ID} 未配置：baseUrl=${provider.baseUrl ? "ok" : "missing"}, apiKey=${provider.apiKey ? "ok" : "missing"}`
    );
  }

  const url = chatCompletionsUrl(provider.baseUrl);
  const body = {
    model: provider.apiModelId,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userContent },
    ],
    stream: false,
    temperature: 0.2,
    max_tokens: 8192,
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${provider.apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`上游 API 错误 ${res.status}: ${text.slice(0, 300)}`);
  }

  const json = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = json.choices?.[0]?.message?.content;
  if (typeof content !== "string") {
    throw new Error("上游 API 返回内容为空或格式异常");
  }
  return content;
}

function extractMemoryBlock(text: string): { body: string; memory: string } {
  const m = text.match(
    /(\n|^):{3,4}memory\{[\s\S]*?\n\s*:?-{0,1}:{3}\s*$/m
  );
  if (!m) return { body: text, memory: "" };
  const rawMemory = m[0];
  const fixedMemory = rawMemory
    .replace(/^:{4}memory\{/, ":::memory{")
    .replace(/\n[\s\-]*:{3}\s*$/, "\n:::");
  const body = text.replace(rawMemory, "").trimEnd();
  return { body, memory: fixedMemory };
}

function countCnChars(text: string): number {
  return (text.match(/[\u4e00-\u9fa5]/g) || []).length;
}

function extractImages(text: string): string[] {
  const matches = text.match(/!\[.*?\]\(.*?\)/g) || [];
  return matches;
}

function cleanOutput(raw: string): string {
  let out = raw.replace(/\r\n/g, "\n").trim();
  // Strip optional markdown code fences
  if (out.startsWith("```markdown")) {
    out = out.slice("```markdown".length).trim();
  }
  if (out.startsWith("```")) {
    out = out.slice(3).trim();
  }
  if (out.endsWith("```")) {
    out = out.slice(0, -3).trim();
  }
  // Ensure no four-colon directives
  out = out.replace(/^(:{4,})\s*([a-zA-Z][\w-]*)\{/gm, ":::$2{");
  return out;
}

async function rewriteSection(section: {
  id: string;
  chapterId: string;
  title: string;
}): Promise<{
  id: string;
  ok: boolean;
  warnings: string[];
}> {
  const filePath = path.join(TEXTBOOK_DIR, `${section.id}.md`);
  const original = fs.readFileSync(filePath, "utf8").replace(/\r\n/g, "\n");
  const { body: prose, memory } = extractMemoryBlock(original);

  const originalImages = extractImages(prose);
  const originalCn = countCnChars(prose);

  const userContent = `请把下面这篇教材小节重写成大纲笔记式 markdown。\n\n---\n\n${prose}\n\n---\n\n只输出改写后的正文，不要解释。`;

  let lastOutput = "";
  let warnings: string[] = [];
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const raw = await callModel(userContent);
      let out = cleanOutput(raw);

      // Basic validation
      const warningsNow: string[] = [];
      if (/^:{4}/m.test(out)) {
        warningsNow.push("仍存在四冒号指令");
        out = out.replace(/^:{4,}\s*([a-zA-Z][\w-]*)\{/gm, ":::$1{");
      }

      const outImages = extractImages(out);
      const missingImages = originalImages.filter(
        (img) => !outImages.includes(img)
      );
      if (missingImages.length > 0) {
        warningsNow.push(`缺失图片 ${missingImages.length} 张，已补回`);
        out += "\n\n" + missingImages.join("\n\n");
      }

      const outCn = countCnChars(out);
      const ratio = outCn / Math.max(originalCn, 1);
      if (ratio < 0.92 || ratio > 1.20) {
        warningsNow.push(
          `中文字符数偏差 ${((ratio - 1) * 100).toFixed(1)}%`
        );
      }

      // If still bad after retries, keep latest and warn
      if (attempt === 3 && warningsNow.length > 0) {
        warnings = warningsNow;
      }

      if (warningsNow.length === 0 || attempt === 3) {
        if (memory) {
          out += "\n\n" + memory;
        }
        fs.writeFileSync(filePath, out + "\n", "utf8");
        lastOutput = out;
        break;
      }

      lastOutput = out;
      warnings = warningsNow;
      console.log(`  ${section.id} 第 ${attempt} 次未通过校验，重试...`);
      await sleep(1000);
    } catch (e) {
      const err = e instanceof Error ? e.message : String(e);
      warnings.push(`调用失败: ${err}`);
      console.log(`  ${section.id} 第 ${attempt} 次调用失败: ${err}`);
      await sleep(2000);
    }
  }

  const ok = warnings.length === 0;
  return { id: section.id, ok, warnings };
}

async function main() {
  const onlyIdx = process.argv.indexOf("--only");
  const onlyId = onlyIdx !== -1 ? process.argv[onlyIdx + 1] : undefined;

  const sections = JSON.parse(fs.readFileSync(MAP_PATH, "utf8")) as Array<{
    id: string;
    chapterId: string;
    title: string;
  }>;

  const targetSections = onlyId
    ? sections.filter((s) => s.id === onlyId)
    : sections;

  if (targetSections.length === 0) {
    console.error(`未找到小节 ${onlyId}`);
    process.exit(1);
  }

  console.log(
    `准备重写 ${targetSections.length} 个小节，模型: ${MODEL_ID || "未指定"}`
  );

  const results: Array<{ id: string; ok: boolean; warnings: string[] }> = [];
  for (const section of targetSections) {
    console.log(`→ ${section.id} ${section.title}`);
    const res = await rewriteSection(section);
    results.push(res);
    if (!res.ok) {
      console.log(`  ⚠ ${res.warnings.join("；")}`);
    }
    await sleep(500);
  }

  const failed = results.filter((r) => !r.ok);
  console.log(`\n完成。成功 ${results.length - failed.length}/${results.length}`);
  if (failed.length) {
    console.log("有警告的文件：");
    for (const f of failed) {
      console.log(`- ${f.id}: ${f.warnings.join("；")}`);
    }
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
