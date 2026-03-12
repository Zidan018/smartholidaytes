const fs = require('fs');
let c = fs.readFileSync('generate-pages.cjs', 'utf8');

// The regex will find 2 or more consecutive destinations: [...] blocks and reduce them to 1
const blockRegex = /\s*destinations:\s*\[[\s\S]*?\],/g;

// To do this safely globally, I'll match `name:` then the rest of the object until `includes:`
// and within that, remove all but the last `destinations:` block.
// Actually, an easier way is to just replace multiple occurrences of the same string if they are adjacent.
const exactBlock = `                destinations: [
                    'Destinasi 1 (Ganti nama tempatnya di sini)',
                    'Destinasi 2 (Ganti nama tempatnya di sini)',
                    'Destinasi 3',
                ],`;

// We just replace double matches with single matches repeatedly until no more changes
let oldC = '';
while (oldC !== c) {
    oldC = c;
    c = c.replace(new RegExp(exactBlock + '\\n' + exactBlock, 'g'), exactBlock);
}

// Now let's inject destinationsGroups into Paket Outing Class
c = c.replace(
    /name:\s*'Paket Outing Class',[\s\S]*?destinations:\s*\[[\s\S]*?\],/,
    `name: 'Paket Outing Class',
                price: 'Hubungi Admin',
                note: 'Cocok untuk instansi sekolah / kampus',
                
                // ⬇️ CONTOH MENGGUNAKAN MULTIPLE DROPDOWN (LEBIH DARI 1 KATEGORI)
                destinationsGroups: [
                    { title: '🗺️ Destinasi Hari 1', items: ['Candi Borobudur', 'Malioboro', 'Pusat Oleh-oleh'] },
                    { title: '🗺️ Destinasi Hari 2', items: ['Pantai Parangtritis', 'Tebing Breksi'] },
                    { title: '🏨 Info Akomodasi', items: ['Hotel Bintang 3', 'Kamar Twin Share (2 Orang/Kamar)'] },
                ],`
);

fs.writeFileSync('generate-pages.cjs', c, 'utf8');
console.log('Cleanup and injection done!');
