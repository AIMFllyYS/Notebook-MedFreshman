# Physics Recording Remaining Content Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish the remaining university physics recording examples and quiz rewrites for `rec-07~17, rec-19~27`, using source-grounded content, detailed worked solutions, SVG figures where useful, and Python-verified calculations.

**Architecture:** Keep the existing recording page architecture unchanged: examples live under `content/examples/physics/recording/rec-NN/`, quizzes stay in `content/quiz/physics/rec-NN.json`, and SVG figures are static files under `public/images/physics/svg/recording/rec-NN/`. Content is produced batch-by-batch with source extraction, example drafting, quiz rewriting, Python verification, quality gates, and a local commit per phase.

**Tech Stack:** Markdown, JSON, KaTeX, static SVG assets, Node test runner, React tests, PowerShell, Python verification scripts under `tmp/physics-recording-verification/`.

---

## Current State

Completed and committed earlier:

- Recording example loader and rendering support.
- Static `::figure{src="..."}` support for examples and quiz markdown.
- Batch A examples and quizzes: `rec-01`, `rec-02`, `rec-03`, `rec-04`, `rec-06`.
- LaTeX escape repair and guard for recording examples.

Remaining scope:

- Batch B: `rec-07`, `rec-08`, `rec-09`, `rec-10`, `rec-11`
- Batch C: `rec-12`, `rec-13`, `rec-14`, `rec-15`, `rec-16`
- Batch D: `rec-17`, `rec-19`, `rec-20`, `rec-21`, `rec-22`
- Batch E: `rec-23`, `rec-24`, `rec-25`, `rec-26`, `rec-27`

Do not create `rec-05` or `rec-18` content.

---

## File Responsibilities

- `content/physics/recording/rec-NN.md`: source recording notes/transcript; read-only input.
- `content/examples/physics/recording/rec-NN/EX##_*.md`: ordered worked examples shown in the recording example tab.
- `content/quiz/physics/rec-NN.json`: 24-question, 100-point recording quiz for each lecture.
- `public/images/physics/svg/recording/rec-NN/*.svg`: static diagrams referenced by examples or quiz markdown.
- `tmp/physics-recording-verification/rec-NN/*.py`: nontrivial calculation checks; not committed unless the repository policy changes.
- `scripts/check-recording-example-latex-escapes.mjs`: guard against corrupted LaTeX source.
- `scripts/check-physics-recording-quiz-quality.mjs`: quiz quality gate.
- `tests/content/physicsRecordingExampleLatex.test.ts`: content regression guard for example LaTeX.
- `tests/content/physicsRecordingQuizQuality.test.ts`: content regression guard for quiz structure and style.

---

## Global Content Rules

Every lecture must satisfy these rules before commit:

- Examples follow the classroom order in `content/physics/recording/rec-NN.md`.
- If the transcript has an explicit example, preserve its given quantities and target as much as possible.
- If the transcript only sketches an example, write a faithful improved version within the same knowledge boundary.
- Quiz questions must be independent questions; stems must not use phrases like "根据录音", "参考录音", "老师说", "课堂上讲到".
- Quiz coverage per lecture must include formula use, memory checks, basic concepts, transfer applications, and example transfer.
- Worked solutions must use a stable answer-card style: known quantities, formula, substitution, calculation, unit, conclusion, and option analysis or common mistake.
- Nontrivial arithmetic, algebraic simplification, numerical approximation, or unit conversion must have a matching Python verification script.
- LaTeX must be written literally in Markdown/JSON. Do not generate Markdown through ordinary JavaScript strings that can interpret `\f`, `\t`, `\r`, `\v`, or `\n` inside formulas.
- SVG must be static files referenced by `::figure{src="/images/physics/svg/recording/rec-NN/file.svg" alt="..."}`. Do not place raw `<svg>` inside Markdown or quiz JSON.
- Preserve UTF-8. Do not rename Chinese files through a shell path encoding path that prints `????`.

---

## Batch B Knowledge Map

`rec-07`: mechanical waves, wave function, phase difference, wave energy, Huygens principle, diffraction.

`rec-08`: wave superposition, interference, coherent conditions, standing waves, nodes/antinodes, half-wave loss, string and pipe modes if present in source.

`rec-09`: Doppler effect, molecular kinetic theory, ideal gas state equation, equipartition, Maxwell speed distribution.

`rec-10`: mean free path, collision frequency, Boltzmann distribution in gravitational field, atmospheric pressure integral, liquid surface tension and surface energy.

`rec-11`: electric field of charged ring, disk, finite rod, infinite line, infinite plane, parallel plates, electric field lines, electric flux.

---

## Batch C Knowledge Map

`rec-12`: Gauss theorem proof, electric flux signs, charged spherical shell, uniformly charged sphere, electrostatic circulation theorem, electric potential.

`rec-13`: electric field, potential, Gauss law, conductors/dielectrics or adjacent source topics.

`rec-14`: magnetic field foundation, Oersted/Ampere, Lorentz force, Biot-Savart law, straight wire, circular arc, solenoid.

`rec-15`: Ampere circuital theorem, symmetry solving, charged particle motion in magnetic field, cyclotron radius/period/pitch.

`rec-16`: Ampere force on current elements, force between current-carrying conductors, ampere definition, current loop torque, magnetic dipole moment, Hall effect.

---

## Batch D Knowledge Map

`rec-17`: electromagnetic induction, Faraday law, Lenz law, motional emf, self/mutual inductance, magnetic energy if present.

`rec-19`: induced electric field, non-conservative vortex electric field, circular changing magnetic-field examples, square-loop induced emf, mutual inductance and self-inductance.

`rec-20`: Maxwell equations, displacement current, electromagnetic waves, LC oscillation, antenna radiation, single spherical refraction imaging.

`rec-21`: single spherical refraction review, thin-lens combinations, non-contact lens systems, eye optics, magnifier, myopia/hyperopia correction, microscope resolution.

`rec-22`: magnetic-field exercise review, quadratic drag separation of variables, Doppler calculation, Gauss-law potential exercise, geometrical optics exercises, wave optics introduction, Young double-slit interference.

---

## Batch E Knowledge Map

`rec-23`: light polarization, Brewster law, polarizers, 3D glasses, birefringence, ordinary and extraordinary rays, double-slit and single-slit exercise review, blackbody radiation and photoelectric-effect opening.

`rec-24`: lens exercise review, blackbody radiation and photoelectric effect review, Compton effect, photon energy and momentum, Compton wavelength shift, hydrogen spectrum, Bohr theory, de Broglie wave.

`rec-25`: de Broglie explanation of Bohr quantization, electron diffraction, Davisson-Germer experiment, uncertainty relation, energy-time uncertainty, wave function and Schrodinger equation.

`rec-26`: quantum-mechanics review, nuclear composition, mass number and charge number, nuclear radius and density, mass defect, binding energy, specific binding energy, nuclear force, radioactivity, nuclear decay, nuclear energy.

`rec-27`: X-ray production, X-ray tube structure, tube current and tube voltage, intensity and hardness, bremsstrahlung, continuous and characteristic spectra, cutoff wavelength, laser and medical applications.

---

## Task 1: Batch B Source Extraction

**Files:**
- Read: `content/physics/recording/rec-07.md`
- Read: `content/physics/recording/rec-08.md`
- Read: `content/physics/recording/rec-09.md`
- Read: `content/physics/recording/rec-10.md`
- Read: `content/physics/recording/rec-11.md`
- Create: `tmp/physics-recording-verification/rec-07/README.md`
- Create: `tmp/physics-recording-verification/rec-08/README.md`
- Create: `tmp/physics-recording-verification/rec-09/README.md`
- Create: `tmp/physics-recording-verification/rec-10/README.md`
- Create: `tmp/physics-recording-verification/rec-11/README.md`

- [ ] **Step 1: Extract lecture outline**

For each lecture, create a temporary README with this exact structure:

```markdown
# rec-NN source extraction

## Knowledge points

1. ...

## Classroom examples in order

1. Timestamp or source heading: ...
   - Given:
   - Required:
   - Core formula:
   - Needs SVG: yes/no

## Quiz transfer directions

1. Formula use:
2. Memory:
3. Basic concept:
4. Transfer:
5. Example transfer:
```

- [ ] **Step 2: Verify no lecture is guessed**

Run:

```powershell
Get-ChildItem -LiteralPath tmp\physics-recording-verification -Directory |
  Where-Object Name -in @('rec-07','rec-08','rec-09','rec-10','rec-11') |
  ForEach-Object {
    $pattern = @('待'+'确认', 'T'+'ODO', 'T'+'BD', '未'+'提取', '需'+'补充') -join '|'
    Get-Content -LiteralPath (Join-Path $_.FullName 'README.md') -Encoding UTF8 | Select-String -Pattern $pattern
  }
```

Expected: no output.

---

## Task 2: Batch B Examples

**Files:**
- Create: `content/examples/physics/recording/rec-07/EX##_*.md`
- Create: `content/examples/physics/recording/rec-08/EX##_*.md`
- Create: `content/examples/physics/recording/rec-09/EX##_*.md`
- Create: `content/examples/physics/recording/rec-10/EX##_*.md`
- Create: `content/examples/physics/recording/rec-11/EX##_*.md`
- Create as needed: `public/images/physics/svg/recording/rec-07/*.svg`
- Create as needed: `public/images/physics/svg/recording/rec-08/*.svg`
- Create as needed: `public/images/physics/svg/recording/rec-09/*.svg`
- Create as needed: `public/images/physics/svg/recording/rec-10/*.svg`
- Create as needed: `public/images/physics/svg/recording/rec-11/*.svg`

- [ ] **Step 1: Write ordered examples**

For each example Markdown file, use this template:

```markdown
---
title: "例题标题"
order: 1
source: "rec-NN"
---

## 题目

题目正文，必要时引用静态图：

::figure{src="/images/physics/svg/recording/rec-NN/example-name.svg" alt="图示说明"}

## 解

**已知：** ...

**求：** ...

**公式：** ...

$$
...
$$

**代入与计算：** ...

$$
...
$$

**结论：** ...

**易错点：** ...
```

- [ ] **Step 2: Run example LaTeX guard**

Run:

```powershell
node scripts/check-recording-example-latex-escapes.mjs
node --import tsx --test tests/content/physicsRecordingExampleLatex.test.ts
```

Expected: both pass.

- [ ] **Step 3: Commit examples**

Run:

```powershell
git add content/examples/physics/recording/rec-07 content/examples/physics/recording/rec-08 content/examples/physics/recording/rec-09 content/examples/physics/recording/rec-10 content/examples/physics/recording/rec-11 public/images/physics/svg/recording/rec-07 public/images/physics/svg/recording/rec-08 public/images/physics/svg/recording/rec-09 public/images/physics/svg/recording/rec-10 public/images/physics/svg/recording/rec-11
git commit -m "content(physics): add recording examples rec-07-rec-11"
```

---

## Task 3: Batch B Quiz Rewrite

**Files:**
- Modify: `content/quiz/physics/rec-07.json`
- Modify: `content/quiz/physics/rec-08.json`
- Modify: `content/quiz/physics/rec-09.json`
- Modify: `content/quiz/physics/rec-10.json`
- Modify: `content/quiz/physics/rec-11.json`
- Create: `tmp/physics-recording-verification/rec-07/*.py`
- Create: `tmp/physics-recording-verification/rec-08/*.py`
- Create: `tmp/physics-recording-verification/rec-09/*.py`
- Create: `tmp/physics-recording-verification/rec-10/*.py`
- Create: `tmp/physics-recording-verification/rec-11/*.py`

- [ ] **Step 1: Rewrite each quiz**

Each JSON must keep:

```json
{
  "subjectId": "physics",
  "chapterId": "rec-NN",
  "questionCount": 24,
  "totalScore": 100,
  "durationMinutes": 50
}
```

Each question must include:

```json
{
  "id": "rec-NN-q01",
  "type": "single-choice",
  "stem": "独立题干，不引用录音语境。",
  "options": [
    { "id": "A", "text": "..." },
    { "id": "B", "text": "..." },
    { "id": "C", "text": "..." },
    { "id": "D", "text": "..." }
  ],
  "answer": "A",
  "analysis": "按已知、公式、代入、计算、单位、结论、选项辨析逐步展开。",
  "score": 4,
  "sourceChapter": "rec-NN",
  "sourceRef": {
    "path": "content/physics/recording/rec-NN.md",
    "label": "rec-NN · 时间或小节 · 知识点"
  }
}
```

- [ ] **Step 2: Verify Python calculations**

Run every Python file:

```powershell
Get-ChildItem -LiteralPath tmp\physics-recording-verification -Recurse -Filter *.py |
  Where-Object FullName -match 'rec-(07|08|09|10|11)' |
  ForEach-Object { python $_.FullName }
```

Expected: every script exits with code 0 and prints a concise numeric check.

- [ ] **Step 3: Run quiz quality gates**

Run:

```powershell
node --import tsx scripts/check-physics-recording-quiz-quality.mjs --only=rec-07,rec-08,rec-09,rec-10,rec-11 --strict-style
node --import tsx --test tests/content/physicsRecordingQuizQuality.test.ts
```

Expected: both pass.

- [ ] **Step 4: Commit quiz rewrite**

Run:

```powershell
git add content/quiz/physics/rec-07.json content/quiz/physics/rec-08.json content/quiz/physics/rec-09.json content/quiz/physics/rec-10.json content/quiz/physics/rec-11.json
git commit -m "content(physics): rewrite recording quizzes rec-07-rec-11"
```

---

## Task 4: Batch C Content

**Files:**
- Read: `content/physics/recording/rec-12.md`
- Read: `content/physics/recording/rec-13.md`
- Read: `content/physics/recording/rec-14.md`
- Read: `content/physics/recording/rec-15.md`
- Read: `content/physics/recording/rec-16.md`
- Create: `content/examples/physics/recording/rec-12/EX##_*.md`
- Create: `content/examples/physics/recording/rec-13/EX##_*.md`
- Create: `content/examples/physics/recording/rec-14/EX##_*.md`
- Create: `content/examples/physics/recording/rec-15/EX##_*.md`
- Create: `content/examples/physics/recording/rec-16/EX##_*.md`
- Modify: `content/quiz/physics/rec-12.json`
- Modify: `content/quiz/physics/rec-13.json`
- Modify: `content/quiz/physics/rec-14.json`
- Modify: `content/quiz/physics/rec-15.json`
- Modify: `content/quiz/physics/rec-16.json`
- Create as needed: `public/images/physics/svg/recording/rec-12/*.svg`
- Create as needed: `public/images/physics/svg/recording/rec-13/*.svg`
- Create as needed: `public/images/physics/svg/recording/rec-14/*.svg`
- Create as needed: `public/images/physics/svg/recording/rec-15/*.svg`
- Create as needed: `public/images/physics/svg/recording/rec-16/*.svg`

- [ ] **Step 1: Extract source and write examples**

Use the Task 1 extraction README structure and Task 2 example template. For magnetic-field diagrams, prefer clear static SVGs for straight wire, circular arc, solenoid, Lorentz-force orientation, and helical motion.

- [ ] **Step 2: Rewrite quizzes and Python checks**

Use the Task 3 JSON shape. Add Python checks for Biot-Savart numeric cases, circular-arc magnetic field, solenoid field, cyclotron radius, period, and pitch when those appear in the quiz.

- [ ] **Step 3: Run gates**

Run:

```powershell
node scripts/check-recording-example-latex-escapes.mjs
node --import tsx --test tests/content/physicsRecordingExampleLatex.test.ts
node --import tsx scripts/check-physics-recording-quiz-quality.mjs --only=rec-12,rec-13,rec-14,rec-15,rec-16 --strict-style
node --import tsx --test tests/content/physicsRecordingQuizQuality.test.ts
node scripts/check-katex-chars.mjs
```

Expected: all pass.

- [ ] **Step 4: Commit Batch C**

Run:

```powershell
git add content/examples/physics/recording/rec-12 content/examples/physics/recording/rec-13 content/examples/physics/recording/rec-14 content/examples/physics/recording/rec-15 content/examples/physics/recording/rec-16 public/images/physics/svg/recording/rec-12 public/images/physics/svg/recording/rec-13 public/images/physics/svg/recording/rec-14 public/images/physics/svg/recording/rec-15 public/images/physics/svg/recording/rec-16 content/quiz/physics/rec-12.json content/quiz/physics/rec-13.json content/quiz/physics/rec-14.json content/quiz/physics/rec-15.json content/quiz/physics/rec-16.json
git commit -m "content(physics): complete recording content rec-12-rec-16"
```

---

## Task 5: Batch D Content

**Files:**
- Read: `content/physics/recording/rec-17.md`
- Read: `content/physics/recording/rec-19.md`
- Read: `content/physics/recording/rec-20.md`
- Read: `content/physics/recording/rec-21.md`
- Read: `content/physics/recording/rec-22.md`
- Create: `content/examples/physics/recording/rec-17/EX##_*.md`
- Create: `content/examples/physics/recording/rec-19/EX##_*.md`
- Create: `content/examples/physics/recording/rec-20/EX##_*.md`
- Create: `content/examples/physics/recording/rec-21/EX##_*.md`
- Create: `content/examples/physics/recording/rec-22/EX##_*.md`
- Modify: `content/quiz/physics/rec-17.json`
- Modify: `content/quiz/physics/rec-19.json`
- Modify: `content/quiz/physics/rec-20.json`
- Modify: `content/quiz/physics/rec-21.json`
- Modify: `content/quiz/physics/rec-22.json`
- Create as needed: `public/images/physics/svg/recording/rec-17/*.svg`
- Create as needed: `public/images/physics/svg/recording/rec-19/*.svg`
- Create as needed: `public/images/physics/svg/recording/rec-20/*.svg`
- Create as needed: `public/images/physics/svg/recording/rec-21/*.svg`
- Create as needed: `public/images/physics/svg/recording/rec-22/*.svg`

- [ ] **Step 1: Extract source and write examples**

Use the same extraction README and example template. Since `rec-18` is absent, verify transitions from `rec-17` to `rec-19` strictly from the actual files and do not invent continuity.

- [ ] **Step 2: Rewrite quizzes and Python checks**

Use the Task 3 JSON shape. Add Python checks for induction, AC, optics, or modern-physics calculations according to the extracted source topics.

- [ ] **Step 3: Run gates**

Run:

```powershell
node scripts/check-recording-example-latex-escapes.mjs
node --import tsx --test tests/content/physicsRecordingExampleLatex.test.ts
node --import tsx scripts/check-physics-recording-quiz-quality.mjs --only=rec-17,rec-19,rec-20,rec-21,rec-22 --strict-style
node --import tsx --test tests/content/physicsRecordingQuizQuality.test.ts
node scripts/check-katex-chars.mjs
```

Expected: all pass.

- [ ] **Step 4: Commit Batch D**

Run:

```powershell
git add content/examples/physics/recording/rec-17 content/examples/physics/recording/rec-19 content/examples/physics/recording/rec-20 content/examples/physics/recording/rec-21 content/examples/physics/recording/rec-22 public/images/physics/svg/recording/rec-17 public/images/physics/svg/recording/rec-19 public/images/physics/svg/recording/rec-20 public/images/physics/svg/recording/rec-21 public/images/physics/svg/recording/rec-22 content/quiz/physics/rec-17.json content/quiz/physics/rec-19.json content/quiz/physics/rec-20.json content/quiz/physics/rec-21.json content/quiz/physics/rec-22.json
git commit -m "content(physics): complete recording content rec-17-rec-22"
```

---

## Task 6: Batch E Content

**Files:**
- Read: `content/physics/recording/rec-23.md`
- Read: `content/physics/recording/rec-24.md`
- Read: `content/physics/recording/rec-25.md`
- Read: `content/physics/recording/rec-26.md`
- Read: `content/physics/recording/rec-27.md`
- Create: `content/examples/physics/recording/rec-23/EX##_*.md`
- Create: `content/examples/physics/recording/rec-24/EX##_*.md`
- Create: `content/examples/physics/recording/rec-25/EX##_*.md`
- Create: `content/examples/physics/recording/rec-26/EX##_*.md`
- Create: `content/examples/physics/recording/rec-27/EX##_*.md`
- Modify: `content/quiz/physics/rec-23.json`
- Modify: `content/quiz/physics/rec-24.json`
- Modify: `content/quiz/physics/rec-25.json`
- Modify: `content/quiz/physics/rec-26.json`
- Modify: `content/quiz/physics/rec-27.json`
- Create as needed: `public/images/physics/svg/recording/rec-23/*.svg`
- Create as needed: `public/images/physics/svg/recording/rec-24/*.svg`
- Create as needed: `public/images/physics/svg/recording/rec-25/*.svg`
- Create as needed: `public/images/physics/svg/recording/rec-26/*.svg`
- Create as needed: `public/images/physics/svg/recording/rec-27/*.svg`

- [ ] **Step 1: Extract source and write examples**

Use the same extraction README and example template. For final-course recordings, first identify whether the lecture is optics, relativity, quantum, atomic, or nuclear content, then keep all examples inside that source boundary.

- [ ] **Step 2: Rewrite quizzes and Python checks**

Use the Task 3 JSON shape. Add Python checks for lens/interference/diffraction/relativity/quantum/atomic calculations according to the extracted source topics.

- [ ] **Step 3: Run gates**

Run:

```powershell
node scripts/check-recording-example-latex-escapes.mjs
node --import tsx --test tests/content/physicsRecordingExampleLatex.test.ts
node --import tsx scripts/check-physics-recording-quiz-quality.mjs --only=rec-23,rec-24,rec-25,rec-26,rec-27 --strict-style
node --import tsx --test tests/content/physicsRecordingQuizQuality.test.ts
node scripts/check-katex-chars.mjs
```

Expected: all pass.

- [ ] **Step 4: Commit Batch E**

Run:

```powershell
git add content/examples/physics/recording/rec-23 content/examples/physics/recording/rec-24 content/examples/physics/recording/rec-25 content/examples/physics/recording/rec-26 content/examples/physics/recording/rec-27 public/images/physics/svg/recording/rec-23 public/images/physics/svg/recording/rec-24 public/images/physics/svg/recording/rec-25 public/images/physics/svg/recording/rec-26 public/images/physics/svg/recording/rec-27 content/quiz/physics/rec-23.json content/quiz/physics/rec-24.json content/quiz/physics/rec-25.json content/quiz/physics/rec-26.json content/quiz/physics/rec-27.json
git commit -m "content(physics): complete recording content rec-23-rec-27"
```

---

## Task 7: Full Acceptance

**Files:**
- Verify: all `content/examples/physics/recording/rec-*`
- Verify: all `content/quiz/physics/rec-*.json`
- Verify: all `public/images/physics/svg/recording/rec-*`

- [ ] **Step 1: Run full content and rendering gates**

Run:

```powershell
npm run check:encoding
node scripts/check-recording-example-latex-escapes.mjs
node scripts/check-katex-chars.mjs
node scripts/check-prose-svg-rules.mjs
npm run test:react -- components/quiz/QuizMarkdown.test.tsx
node --import tsx --test tests/api/loader.test.ts tests/content/physicsRecordingExampleLatex.test.ts tests/content/physicsRecordingQuizQuality.test.ts
node --import tsx scripts/check-physics-recording-quiz-quality.mjs --only=rec-01,rec-02,rec-03,rec-04,rec-06,rec-07,rec-08,rec-09,rec-10,rec-11,rec-12,rec-13,rec-14,rec-15,rec-16,rec-17,rec-19,rec-20,rec-21,rec-22,rec-23,rec-24,rec-25,rec-26,rec-27 --strict-style
```

Expected: all pass.

- [ ] **Step 2: Check no unsupported lectures were added**

Run:

```powershell
Test-Path content\examples\physics\recording\rec-05
Test-Path content\examples\physics\recording\rec-18
Test-Path content\quiz\physics\rec-05.json
Test-Path content\quiz\physics\rec-18.json
```

Expected: four `False` outputs.

- [ ] **Step 3: Check final git scope**

Run:

```powershell
git status --short
git diff --check -- content/examples/physics/recording content/quiz/physics public/images/physics/svg/recording scripts tests package.json
```

Expected: no whitespace errors. Any unrelated dirty files remain unstaged.

- [ ] **Step 4: Commit final verification notes if a tracked verification artifact was intentionally updated**

Only if a tracked docs or test artifact changed during acceptance:

```powershell
git add docs scripts tests package.json
git commit -m "test(physics): verify recording quiz and example content"
```

If no tracked verification artifact changed, do not create an empty commit.

---

## Execution Recommendation

Use subagent-driven execution by batch:

1. Source extraction subagent for a 5-lecture batch.
2. Example-writing subagent for the same batch.
3. Quiz-writing subagent for the same batch.
4. Verification subagent that checks formulas, Python outputs, source references, and rendering guards.
5. Main agent reviews diffs, runs gates, stages only batch files, commits.

This is slower than one-shot generation, but it is the right shape for this content because each lecture needs source grounding, formula correctness, and renderer-safe Markdown.
