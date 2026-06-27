const fs = require('fs');
let s = fs.readFileSync('content/quiz/chemistry/ch08.json', 'utf8');

// Remove backtick code blocks (replace with placeholder)
s = s.replace(/```[\s\S]*?```/g, '(结构式见解析)');

// Fix inner quotes
function fixJsonQuotes(s) {
  let result = [];
  let inString = false;
  let escaped = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (escaped) { result.push(c); escaped = false; continue; }
    if (c === '\\' && inString) { result.push(c); escaped = true; continue; }
    if (c === '"') {
      if (!inString) { inString = true; result.push(c); continue; }
      let j = i + 1;
      while (j < s.length && (s[j] === ' ' || s[j] === '\n' || s[j] === '\r' || s[j] === '\t')) j++;
      const next = s[j];
      if (next === ',' || next === '}' || next === ']' || next === ':' || next === undefined) {
        inString = false; result.push(c);
      } else { result.push('\\"'); }
    } else { result.push(c); }
  }
  return result.join('');
}

const fixed = fixJsonQuotes(s);
try {
  const d = JSON.parse(fixed);
  console.log('ch08: FIXED (' + d.questions.length + ' questions)');
  fs.writeFileSync('content/quiz/chemistry/ch08.json', fixed, 'utf8');
} catch(e) {
  console.log('Still broken: ' + e.message.substring(0, 100));
  const pos = parseInt(e.message.match(/position (\d+)/)?.[1] || '0');
  if (pos > 0) console.log('Context:', JSON.stringify(fixed.substring(Math.max(0,pos-30), pos+30)));
}
