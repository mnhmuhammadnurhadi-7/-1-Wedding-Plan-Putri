const fs = require('fs');

const htmlPath = 'c:/MY FILES/BERUSAHA/MNH-Agency/4-Wedding-plane(putri)/wedding-static/index.html';
const html = fs.readFileSync(htmlPath, 'utf8');

// Temukan const BNFL=
const bnflStart = html.indexOf('const BNFL=');
let braceCount = 0;
let bnflEnd = -1;
let started = false;
for (let i = bnflStart; i < html.length; i++) {
  if (html[i] === '{') {
    braceCount++;
    started = true;
  } else if (html[i] === '}') {
    braceCount--;
    if (started && braceCount === 0) {
      bnflEnd = i + 1;
      break;
    }
  }
}
const bnflCode = html.slice(bnflStart, bnflEnd);

// Temukan const BN_COUPLE="
const coupleStart = html.indexOf('const BN_COUPLE="');
const strStart = coupleStart + 'const BN_COUPLE="'.length;
const strEnd = html.indexOf('";', strStart);
const coupleCode = html.slice(coupleStart, strEnd + 1);

console.log('BNFL length:', bnflCode.length);
console.log('BN_COUPLE length:', coupleCode.length);

const tsContent = `// Auto-generated assets from wedding-static/index.html
export ${bnflCode};

export ${coupleCode};

export const BN_CLR = ['var(--c1)', 'var(--c2)', 'var(--c3)', 'var(--c4)', 'var(--c5)', 'var(--c6)', 'var(--c7)', 'var(--c8)'];

export const INSTR_COL: Record<string, string> = {
  'Tabungan': 'var(--rose-s)',
  'Deposito': 'var(--butter-s)',
  'Obligasi / SBN': 'var(--sage-s)',
  'Reksa Dana': 'var(--lav-s)',
  'Saham / ETF': 'var(--c6)',
  'Lainnya': 'var(--c8)'
};
`;

fs.writeFileSync('c:/MY FILES/BERUSAHA/MNH-Agency/4-Wedding-plane(putri)/wedding-plan-putri/components/planner/data/assets.ts', tsContent);
console.log('Successfully wrote assets.ts! Total Size:', tsContent.length);
