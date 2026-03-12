const fs = require('fs');
let c = fs.readFileSync('generate-pages.cjs', 'utf8');

const regex = /\s*destinations:\s*\[[\s\S]*?\],/g;

const groupBlock = `
                destinationsGroups: [
                    { title: '🗺️ Destinasi Hari 1', items: ['Destinasi 1', 'Destinasi 2'] },
                    { title: '🗺️ Destinasi Hari 2', items: ['Destinasi 3', 'Destinasi 4'] },
                    { title: '🏨 Info Akomodasi', items: ['Hotel Bintang 3', 'Kamar Twin Share'] },
                ],`;

c = c.replace(regex, groupBlock);

fs.writeFileSync('generate-pages.cjs', c, 'utf8');
console.log('Successfully injected destinationsGroups array into all packages!');
