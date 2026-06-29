import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const quizDir = join(root, "content", "quiz", "physics");
const strictStyle = process.argv.includes("--strict-style");
const onlyArg = process.argv.find((arg) => arg.startsWith("--only="));
const only = onlyArg ? new Set(onlyArg.slice("--only=".length).split(",").map((s) => s.trim()).filter(Boolean)) : null;

const moduleUrl = pathToFileURL(join(root, "lib", "quiz", "physicsRecordingQuality.ts")).href;
const { PHYSICS_RECORDING_IDS, validatePhysicsRecordingQuiz } = await import(moduleUrl);

const ids = only ? PHYSICS_RECORDING_IDS.filter((id) => only.has(id)) : PHYSICS_RECORDING_IDS;
const existing = new Set(readdirSync(quizDir).filter((file) => file.endsWith(".json")));
let errorCount = 0;
let warningCount = 0;

for (const id of ids) {
  const fileName = `${id}.json`;
  const rel = `content/quiz/physics/${fileName}`;
  if (!existing.has(fileName)) {
    console.error(`[error] ${rel}: missing file`);
    errorCount += 1;
    continue;
  }

  let quiz;
  try {
    quiz = JSON.parse(readFileSync(join(quizDir, fileName), "utf8"));
  } catch (error) {
    console.error(`[error] ${rel}: JSON parse failed: ${error instanceof Error ? error.message : String(error)}`);
    errorCount += 1;
    continue;
  }

  const result = validatePhysicsRecordingQuiz(quiz, { filePath: rel, strictStyle });
  for (const warning of result.warnings) {
    console.warn(`[warn] ${rel}: ${warning}`);
  }
  for (const error of result.errors) {
    console.error(`[error] ${rel}: ${error}`);
  }
  warningCount += result.warnings.length;
  errorCount += result.errors.length;
}

console.log(`physics recording quiz quality: ${ids.length} files checked, ${errorCount} errors, ${warningCount} warnings`);
if (errorCount > 0) process.exit(1);
