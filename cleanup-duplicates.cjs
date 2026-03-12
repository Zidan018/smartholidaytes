const fs = require('fs');
let c = fs.readFileSync('generate-pages.cjs', 'utf8');

// The block we injected looks like this:
/*
                destinationsGroups: [
                    { title: '🗺️ Paket 1 (Rp xxx.xxx)', items: ['Destinasi 1', 'Destinasi 2'] },
                    { title: '🗺️ Paket 2 (Rp xxx.xxx)', items: ['Destinasi 3', 'Destinasi 4'] },
                    { title: '🗺️ Paket 3 (Rp xxx.xxx)', items: ['Hotel Bintang 3', 'Kamar Twin Share'] },
                ],
*/

// A generic regex to match the destinationsGroups array
const blockRegex = /\s*destinationsGroups:\s*\[[\s\S]*?\],/g;

// To safely clean this up, we will split the file by the start of a package definition `{ \n name:`
// Then inside each package, we ensure only the FIRST destinationsGroups block is kept, 
// and the rest are deleted.
// Wait, an easier way is to just find two adjacent destinationsGroups blocks and replace with one.
// Let's look at the structure by removing consecutive matches.

let previousC = '';
while (previousC !== c) {
    previousC = c;
    // Match a destinationsGroups block, followed by optional whitespace, followed by another destinationsGroups block
    // We capture the first block and replace the whole match with just the first block.
    c = c.replace(/(destinationsGroups:\s*\[[\s\S]*?\],)(\s*destinationsGroups:\s*\[[\s\S]*?\],)+/g, '$1');
}

fs.writeFileSync('generate-pages.cjs', c, 'utf8');
console.log('Successfully cleaned up all duplicate destinationsGroups!');
