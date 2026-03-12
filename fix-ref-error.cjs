const fs = require('fs');
let c = fs.readFileSync('generate-pages.cjs', 'utf8');

c = c.replace(
    'src="${pkg.image || \'/foto-ini.jpg\'}" alt="${title}"',
    'src="${typeof pkg !== \'undefined\' ? pkg.image : \'/foto-ini.jpg\'}" alt="${title}"'
);

fs.writeFileSync('generate-pages.cjs', c, 'utf8');
console.log('Fixed reference error');
