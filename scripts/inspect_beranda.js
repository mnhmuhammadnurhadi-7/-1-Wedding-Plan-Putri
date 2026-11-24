const fs = require('fs');
const v = fs.readFileSync('c:/MY FILES/BERUSAHA/MNH-Agency/4-Wedding-plane(putri)/wedding-plan-putri/components/planner/data/vBeranda_full.js', 'utf8');

const retIdx = v.indexOf('return `<div class="bn">');
fs.writeFileSync('c:/MY FILES/BERUSAHA/MNH-Agency/4-Wedding-plane(putri)/wedding-plan-putri/components/planner/data/beranda_template.txt', v.slice(retIdx));
console.log('Saved beranda_template.txt, length:', v.length - retIdx);
