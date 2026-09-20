import assert from "node:assert/strict";
import { test } from "node:test";
import { i18nKeys, translate } from "./index.ts";
import { en } from "./messages/en.ts";
import { zh } from "./messages/zh.ts";

/** 独立实现一遍压平：拿它跟 i18nKeys 对照，避免「用被测代码验证被测代码」。 */
function flatten(source: Record<string, unknown>, prefix = ""): string[] {
  const keys: string[] = [];
  for (const [name, value] of Object.entries(source)) {
    const path = prefix ? `${prefix}.${name}` : name;
    if (typeof value === "string") keys.push(path);
    else if (value && typeof value === "object") keys.push(...flatten(value as Record<string, unknown>, path));
  }
  return keys;
}

/**
 * 其它子智能体正在并行写的组件按字面量引用这些 key：名字和存在性都是对外契约。
 * 这是跨模块契约清单，不是词典镜像；并行开发期结束后已收窄（死 key 与同义重复项已删）。
 */
const REQUIRED_KEYS = [
  "agent.nav.newChat", "agent.nav.assets", "agent.nav.scheduled", "agent.nav.plugins",
  "agent.sidebar.title", "agent.sidebar.search", "agent.sidebar.collapse",
  "agent.sidebar.projects", "agent.sidebar.recents", "agent.sidebar.archived",
  "agent.sidebar.newProject", "agent.sidebar.project.newChat", "agent.sidebar.project.rename",
  "agent.sidebar.empty.project", "agent.sidebar.empty.notes", "agent.sidebar.empty.selection",
  "agent.sidebar.empty.recents", "agent.sidebar.empty.archived",
  "agent.sidebar.backToList", "agent.sidebar.viewArchived",
  "agent.center.tab.answer", "agent.center.tab.links", "agent.center.tab.images", "agent.center.tabs.aria",
  "agent.sources.count", "agent.sources.openPanel",
  "agent.sources.query",
  "agent.sources.empty", "agent.sources.noLink",
  "agent.links.empty", "agent.images.empty", "agent.images.search", "agent.images.generated",
  "agent.quiz.dock.title", "agent.quiz.dock.open", "agent.quiz.dock.created",
  "agent.quiz.intent.check", "agent.quiz.intent.diagnose", "agent.quiz.intent.practice", "agent.quiz.intent.exam",
  "agent.quiz.empty", "agent.quiz.reveal.blank", "agent.quiz.reveal.multiple", "agent.quiz.reveal.default",
  "agent.quiz.progress", "agent.quiz.redo", "agent.quiz.dropped",
  "agent.selection.title",
  "agent.dock.collapse", "agent.dock.global", "agent.dock.shrink",
  "settings.language.title", "settings.language.zh", "settings.language.en", "settings.language.desc",
];

test("dot-path 取值：嵌套分组按 . 逐层取，中英各取各的", () => {
  assert.equal(translate("zh", "agent.nav.assets"), "我的资产");
  assert.equal(translate("en", "agent.nav.assets"), "My assets");
  assert.equal(translate("zh", "settings.language.title"), "语言");
  assert.equal(translate("en", "settings.language.title"), "Language");
  // 分组标题也走汉化（用户口径：默认中文），英文界面才显示 Projects / Recents
  assert.equal(translate("zh", "agent.sidebar.projects"), "项目");
  assert.equal(translate("zh", "agent.sidebar.recents"), "最近");
  assert.equal(translate("en", "agent.sidebar.projects"), "Projects");
  assert.equal(translate("en", "agent.sidebar.recents"), "Recents");
});

test("变量插值：{name} / {count} 按 vars 替换，位数为 0 的值也不能被当成缺省", () => {
  assert.equal(translate("zh", "agent.sidebar.project.newChat", { name: "组胚" }), "在「组胚」里新建对话");
  assert.equal(translate("zh", "agent.sidebar.more", { count: 3 }), "还有 3 个");
  assert.equal(translate("en", "agent.sources.query", { query: "mitochondria" }), "Searched “mitochondria”");
  assert.equal(translate("en", "agent.quiz.progress", { done: 0, total: 5 }), "0 / 5 answered");
  // 没给值的占位符原样保留：比悄悄渲染成空串更容易定位
  assert.equal(translate("zh", "agent.quiz.dock.created"), "已出题 · {count} 题");
});

test("目标语言缺 key 时回退中文（而不是显示 key）", () => {
  const dict = en.agent.sources as Record<string, unknown>;
  const saved = dict.count;
  delete dict.count;
  try {
    assert.equal(translate("en", "agent.sources.count"), "来源 · {count}");
  } finally {
    dict.count = saved;
  }
});

/** @types/node 把 process.env 标成只读，测试要临时改 NODE_ENV 只能走这层可变视图。 */
function setNodeEnv(value: string): () => void {
  const env = process.env as Record<string, string | undefined>;
  const previous = env.NODE_ENV;
  env.NODE_ENV = value;
  return () => { env.NODE_ENV = previous; };
}

/** 收集一次调用里 console.warn 的内容；translate 的开发期告警是它唯一可观测的信号。 */
function captureWarnings(run: () => void): string[] {
  const original = console.warn;
  const warnings: string[] = [];
  console.warn = (...args: unknown[]) => { warnings.push(args.map(String).join(" ")); };
  try {
    run();
  } finally {
    console.warn = original;
  }
  return warnings;
}

test("两边都没有的 key：原样返回 key，并在非生产环境告警", () => {
  const restoreEnv = setNodeEnv("test");
  try {
    let result = "";
    const warnings = captureWarnings(() => { result = translate("zh", "agent.not.exists"); });
    assert.equal(result, "agent.not.exists");
    assert.equal(warnings.length, 1);
    assert.match(warnings[0], /agent\.not\.exists/);
  } finally {
    restoreEnv();
  }
});

test("生产环境不告警", () => {
  const restoreEnv = setNodeEnv("production");
  try {
    let result = "";
    const warnings = captureWarnings(() => { result = translate("zh", "agent.not.exists"); });
    assert.equal(result, "agent.not.exists");
    assert.equal(warnings.length, 0);
  } finally {
    restoreEnv();
  }
});

test("中英形状一致：两边 key 集合完全相同（漏翻 / 多翻都在这里失败）", () => {
  const zhKeys = flatten(zh).sort();
  const enKeys = flatten(en).sort();
  assert.deepEqual(enKeys, zhKeys);
  // i18nKeys 必须等于中文真相源的 key 集合，不允许另有一份手工清单
  assert.deepEqual([...i18nKeys].sort(), zhKeys);
});

test("并行组件按字面量引用的 key 全部存在", () => {
  for (const key of REQUIRED_KEYS) {
    for (const locale of ["zh", "en"] as const) {
      assert.notEqual(translate(locale, key), key, `${locale} 缺少 ${key}`);
    }
  }
  assert.equal(i18nKeys.length, flatten(zh).length);
});
