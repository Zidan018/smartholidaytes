const fs = require('fs');
let c = fs.readFileSync('generate-pages.cjs', 'utf8');

// The regex looks for `note: '...',` 
// and injects the `details:` block right after it.
const regex = /(note:\s*'.*?',[\r\n]+)\s*(?!details:)/g;

const replacement = `$1            details: [
                { label: 'Durasi', value: 'Sesuai Program' },
                { label: 'Titik Kumpul', value: 'Sesuai Kesepakatan' },
                { label: 'Akomodasi', value: 'Sesuai Pilihan' },
            ],
            `;

const originalLength = c.length;
c = c.replace(regex, replacement);

if (c.length !== originalLength) {
    fs.writeFileSync('generate-pages.cjs', c, 'utf8');
    console.log('Successfully injected details array into all packages!');
} else {
    console.log('No matches found to replace.');
}
