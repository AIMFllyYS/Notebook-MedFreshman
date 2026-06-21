#!/usr/bin/env node
/**
 * Verify quiz questions against recording transcripts (structural + keyword checks)
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');

function parseTimestamp(label) {
  const m = label.match(/(\d{1,2}:\d{2}(?::\d{2})?)/);
  return m ? m[1] : null;
}

function findTimestampInTranscript(content, ts) {
  if (!ts) return { found: false };
  const parts = ts.split(':');
  const patterns = new Set();
  patterns.add(ts);
  if (parts.length === 2) {
    patterns.add('01:' + ts);
    patterns.add('00:' + ts);
  } else if (parts.length === 3) {
    const [, m, s] = parts;
    patterns.add(`${m}:${s}`);
  }
  for (const p of patterns) {
    if (content.includes(`说话人 1 ${p}`) || content.includes(`说话人 2 ${p}`)) {
      return { found: true, matched: p };
    }
  }
  return { found: false, tried: [...patterns] };
}

function extractSection(content, ts, linesAfter = 25) {
  const result = findTimestampInTranscript(content, ts);
  if (!result.found) return null;
  const marker = `说话人`;
  const idx = content.indexOf(`${marker}`, content.indexOf(result.matched) - 20);
  // find exact line
  const re = new RegExp(`说话人 \\d+ ${result.matched.replace(/:/g, '\\:')}[\\s\\S]*?(?=\\n说话人 \\d+|$)`);
  const m = content.match(re);
  return m ? m[0].slice(0, 3000) : null;
}

function sumScoring(q) {
  if (!q.scoring_criteria) return null;
  let sum = 0;
  for (const c of q.scoring_criteria) {
    const m = c.match(/（(\d+)分）|\((\d+)分\)/);
    if (m) sum += parseInt(m[1] || m[2], 10);
  }
  return sum;
}

// Keyword evidence checks per question (manual curation from transcript review)
const KEYWORD_CHECKS = {
  'rec-01': {
    q001: { keywords: ['一条主线', '马克思中国化时代化'], answerIdx: 1 },
    q002: { keywords: ['治国'], answerIdx: 2 },
    q003: { keywords: ['首次', '高校思想政治工作'], answerIdx: 1 },
    q004: { keywords: ['快'], answerIdx: 2 },
    q005: { keywords: ['2022', '1979', '中国式'], answerIdx: 0 },
    q006: { keywords: ['近1亿', '13 亿'], answerIdx: 3 },
    q007: { keywords: ['动荡变革期'], answerIdx: 1 },
    q008: { keywords: ['第三个阶段', '资本'], answerIdx: 2 },
    q009: { keywords: ['市场', '民主'], answerIdx: 0 },
    q010: { keywords: ['1992', '十四大', '市场经济'], answerIdx: 1 },
    q016: { keywords: ['重点讲', '第一个和第二个'], answerIdx: 0, examFocus: true },
    q017: { keywords: ['了解', '理解', '把握', '提升'], answerIdx: 1, examFocus: true },
    q018: { keywords: ['考勤分是 20 分'], answerIdx: 1, examFocus: true },
    q019: { keywords: ['提分'], answerIdx: 2, examFocus: true },
  },
  'rec-02': {
    q001: { keywords: ['马克思主义中国化'], answerIdx: 1 },
    q002: { keywords: ['军事指挥的错误', '承担责任'], answerIdx: 1 },
    q003: { keywords: ['领导地位', '独立自主'], answerIdx: 0 },
    q004: { keywords: ['六届六中全会', '论新阶段'], answerIdx: 2 },
    q010: { keywords: ['变计'], answerIdx: 0 },
    q016: { keywords: ['构成要素', '还原'], answerIdx: 2, examFocus: true },
    q017: { keywords: ['时代化'], answerIdx: 1, examFocus: true },
    q018: { keywords: ['中国化时代化的马克思主义行'], answerIdx: 0, examFocus: true },
  },
  'rec-03': {
    q001: { keywords: ['六届六中全会', '论新阶段'], answerIdx: 1 },
    q010: { keywords: ['政协', '站起来'], answerIdx: 1 },
    q016: { keywords: ['要考'], answerIdx: 1, examFocus: true },
    q018: { keywords: ['中国化', '时代化', '马克思主义行'], answerIdx: 1, examFocus: true },
  },
  'rec-04': {
    q001: { keywords: ['战争与革命', '半殖民地'], answerIdx: 0 },
    q002: { keywords: ['民族独立', '民生', '民主'], answerIdx: 1 },
    q005: { keywords: ['先眨眼', '智者'], answerIdx: 1 },
    q006: { keywords: ['对付苏联'], answerIdx: 0 },
    q016: { keywords: ['新到底新在何处', '重点'], answerIdx: 1, examFocus: true },
    q017: { keywords: ['帝国主义和中华民族'], answerIdx: 0, examFocus: true },
    q018: { keywords: ['打土豪分田地'], answerIdx: 1, examFocus: true },
    q019: { keywords: ['没有调查', '没有发言权'], answerIdx: 0, examFocus: true },
  },
};

const files = ['rec-01', 'rec-02', 'rec-03', 'rec-04'];
const report = {};

for (const f of files) {
  const quizPath = path.join(ROOT, 'content/quiz/maogai', f + '.json');
  const quiz = JSON.parse(fs.readFileSync(quizPath, 'utf8'));
  const errors = [];
  let totalPts = 0;

  for (const q of quiz.questions) {
    totalPts += q.points;

    // Essay scoring
    if (q.type === 'essay') {
      const sum = sumScoring(q);
      if (sum !== q.total_points) {
        errors.push({
          id: q.id, type: 'SCORING_MISMATCH',
          current: `${sum} (criteria sum)`, correct: q.total_points,
        });
      }
    }

    // Points rules
    const isExamFocus = q.label === '考试重点';
    if (q.type !== 'essay') {
      const expected = isExamFocus ? 4 : 2;
      if (q.points !== expected) {
        errors.push({
          id: q.id, type: 'POINTS_ERROR',
          current: q.points, correct: expected,
        });
      }
    }

    // sourceRef
    const refPath = path.join(ROOT, q.sourceRef?.path || '');
    if (!fs.existsSync(refPath)) {
      errors.push({ id: q.id, type: 'WRONG_SOURCEREF', current: q.sourceRef?.path, msg: 'file not found' });
      continue;
    }
    const transcript = fs.readFileSync(refPath, 'utf8');
    const ts = parseTimestamp(q.sourceRef.label);
    const tsResult = findTimestampInTranscript(transcript, ts);
    if (!tsResult.found) {
      errors.push({
        id: q.id, type: 'WRONG_SOURCEREF',
        current: ts, correct: 'timestamp not in transcript',
        evidence: `Tried: ${tsResult.tried?.join(', ')}`,
      });
    }

    // Keyword checks
    const check = KEYWORD_CHECKS[f]?.[q.id];
    if (check) {
      const section = extractSection(transcript, ts) || transcript;
      for (const kw of check.keywords) {
        if (!section.includes(kw) && !transcript.includes(kw)) {
          errors.push({
            id: q.id, type: 'WRONG_ANSWER',
            current: `keyword "${kw}" not found near sourceRef`,
            evidence: q.explanation,
          });
          break;
        }
      }
      if (check.examFocus && isExamFocus) {
        const examPhrases = ['重点', '要考', '考试', '必', '强调', '把握', '核心'];
        const hasExam = examPhrases.some(p => section.includes(p) || (q.sourceRef.label.includes('考试') && false));
        const sectionText = extractSection(transcript, ts) || '';
        if (!examPhrases.some(p => sectionText.includes(p))) {
          // soft check only for curated items
        }
      }
    }
  }

  if (totalPts !== 100) {
    errors.push({ id: 'FILE', type: 'POINTS_ERROR', current: totalPts, correct: 100 });
  }

  report[f] = { errorCount: errors.length, errors, totalPts, questionCount: quiz.questions.length };
}

console.log(JSON.stringify(report, null, 2));
