const fs = require('fs');

function fixJsonQuotes(s) {
  // State machine to properly escape inner double quotes in JSON strings
  let result = [];
  let inString = false;
  let escaped = false;
  let i = 0;

  while (i < s.length) {
    const c = s[i];

    if (escaped) {
      result.push(c);
      escaped = false;
      i++;
      continue;
    }

    if (c === '\\' && inString) {
      result.push(c);
      escaped = true;
      i++;
      continue;
    }

    if (c === '"') {
      if (!inString) {
        // Opening quote of a string
        inString = true;
        result.push(c);
        i++;
        continue;
      }

      // We're inside a string and hit a quote. Is it the closing quote?
      // Look ahead to see what comes after
      let j = i + 1;
      while (j < s.length && (s[j] === ' ' || s[j] === '\n' || s[j] === '\r' || s[j] === '\t')) j++;
      const nextChar = s[j];

      if (nextChar === ',' || nextChar === '}' || nextChar === ']' || nextChar === ':' || nextChar === undefined) {
        // This is a real closing quote
        inString = false;
        result.push(c);
      } else {
        // This is an inner quote that needs escaping
        result.push('\\"');
      }
    } else {
      result.push(c);
    }
    i++;
  }

  return result.join('');
}

const files = ['ch01','ch03','ch05','ch06','ch07','ch08','ch09','ch11','ch12','ch13','ch14'];

for (const f of files) {
  const path = 'content/quiz/chemistry/' + f + '.json';
  const s = fs.readFileSync(path, 'utf8');
  const fixed = fixJsonQuotes(s);

  try {
    const d = JSON.parse(fixed);
    console.log(f + ': FIXED (' + d.questions.length + ' questions)');
    fs.writeFileSync(path, fixed, 'utf8');
  } catch(e) {
    console.log(f + ': STILL BROKEN at pos ' + (e.message.match(/position (\d+)/)?.[1] || '?'));
    // Show context around error
    const pos = parseInt(e.message.match(/position (\d+)/)?.[1] || '0');
    if (pos > 0) {
      console.log('  Context: ' + JSON.stringify(fixed.substring(Math.max(0,pos-40), pos+40)));
    }
  }
}
