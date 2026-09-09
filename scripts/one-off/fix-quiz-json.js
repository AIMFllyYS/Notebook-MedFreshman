const fs = require('fs');
const files = ['ch01','ch06','ch07','ch09','ch11','ch13'];

for (const f of files) {
  const path = 'content/quiz/chemistry/' + f + '.json';
  let s = fs.readFileSync(path, 'utf8');

  // Replace unescaped double quotes inside JSON string values
  // Strategy: find patterns like ..."text"inner"text"... and escape inner quotes
  // The issue is Chinese text containing "word" (ASCII double quotes used as emphasis)

  // Replace ASCII double quotes used as Chinese emphasis markers with 「」
  // Pattern: a quote that's preceded by a CJK char or punctuation and followed by CJK
  s = s.replace(/(?<=[一-鿿　-〿，。、；：！？）\s])"([^"]{1,20})"(?=[一-鿿　-〿，。、；：！？（\s,.\-])/g, '「$1」');

  try {
    const d = JSON.parse(s);
    console.log(f + ': FIXED (' + d.questions.length + ' questions)');
    fs.writeFileSync(path, s, 'utf8');
  } catch(e) {
    // Try more aggressive fix: replace ALL unescaped quotes in string values
    // Use a state machine approach
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
          inString = true;
          result.push(c);
        } else {
          // Check if this is a real closing quote
          const rest = s.substring(i+1, i+10).trimStart();
          if (rest[0] === ',' || rest[0] === '}' || rest[0] === ']' || rest[0] === ':' || rest === '') {
            inString = false;
            result.push(c);
          } else {
            // This is an inner quote - escape it
            result.push('\\"');
          }
        }
      } else {
        result.push(c);
      }
      i++;
    }

    const fixed = result.join('');
    try {
      const d = JSON.parse(fixed);
      console.log(f + ': FIXED aggressive (' + d.questions.length + ' questions)');
      fs.writeFileSync(path, fixed, 'utf8');
    } catch(e2) {
      console.log(f + ': STILL BROKEN - ' + e2.message.substring(0,80));
    }
  }
}
