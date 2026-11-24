const fs = require('fs');

const htmlPath = 'c:/MY FILES/BERUSAHA/MNH-Agency/4-Wedding-plane(putri)/wedding-static/index.html';
const html = fs.readFileSync(htmlPath, 'utf8');

const flStart = html.indexOf('const FL={');
let braceCount = 0;
let flEnd = -1;
let started = false;
for (let i = flStart; i < html.length; i++) {
  if (html[i] === '{') {
    braceCount++;
    started = true;
  } else if (html[i] === '}') {
    braceCount--;
    if (started && braceCount === 0) {
      flEnd = i + 1;
      break;
    }
  }
}

const flCode = html.slice(flStart, flEnd);

const assetsPath = 'c:/MY FILES/BERUSAHA/MNH-Agency/4-Wedding-plane(putri)/wedding-plan-putri/components/planner/data/assets.ts';
let assetsContent = fs.readFileSync(assetsPath, 'utf8');

if (!assetsContent.includes('export const FL')) {
  assetsContent += `\nexport ${flCode};\n`;
  fs.writeFileSync(assetsPath, assetsContent);
  console.log('Appended FL to assets.ts successfully!');
} else {
  console.log('FL already exists in assets.ts');
}
