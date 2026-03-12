const fs = require('fs');
let c = fs.readFileSync('generate-pages.cjs', 'utf8');

// First, let's remove the accidental destinations array I put in Dieng
c = c.replace(/destinations:\s*\[[\s\S]*?\],\s*details: \[/g, 'details: [');

// Now, globally add the destinations block right before every details: [
const destinationsBlock = `destinations: [
                'Destinasi 1 (Ganti nama tempatnya di sini)',
                'Destinasi 2 (Ganti nama tempatnya di sini)',
                'Destinasi 3',
            ],
            details: [`;

c = c.replace(/details: \[/g, destinationsBlock);

fs.writeFileSync('generate-pages.cjs', c, 'utf8');
console.log('Successfully injected destinations array into all packages!');
