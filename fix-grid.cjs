const fs = require('fs');
let c = fs.readFileSync('generate-pages.cjs', 'utf8');

c = c.replace(
    'class="overview-grid" style="grid-template-columns:1fr 1fr;align-items:start;gap:50px;"',
    'class="overview-grid" style="align-items:start;gap:50px;"'
);

fs.writeFileSync('generate-pages.cjs', c, 'utf8');
console.log('Fixed grid inline style!');
