const fs = require('fs');
const path = 'content/quiz/chemistry/ch03.json';
let s = fs.readFileSync(path, 'utf8');

// Fix problematic escape sequences in the raw file
// Replace literal backspace chars (\x08) that came from unescaped \b in JSON
s = s.replace(/\x08/g, '\\b');
// Fix KaTeX \\bond → double-escaped
s = s.replace(/\\\\bond/g, '\\\\\\\\bond');
s = s.replace(/\\\\ce\{/g, '\\\\\\\\ce{');

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
  console.log('ch03: FIXED (' + d.questions.length + ' questions)');
  fs.writeFileSync(path, fixed, 'utf8');
} catch(e) {
  console.log('Still broken: ' + e.message.substring(0, 100));
  const pos = parseInt(e.message.match(/position (\d+)/)?.[1] || '0');
  if (pos > 0) console.log('Context:', JSON.stringify(fixed.substring(Math.max(0,pos-40), pos+40)));
}
