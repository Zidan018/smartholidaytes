const fs = require('fs');
let c = fs.readFileSync('generate-pages.cjs', 'utf8');

// The exact string in Karimun Jawa Paket 2D 1N
const target = `            name:  'Paket 2D 1N',
            price: 'Rp 450.000/pax',
            note:  'Min. 4 orang | Berangkat setiap Jumat malam',`;

const replacement = `            name:  'Paket 2D 1N',
            price: 'Rp 450.000/pax',
            note:  'Min. 4 orang | Berangkat setiap Jumat malam',
            details: [
                { label: 'Durasi', value: '2 Hari 1 Malam' },
                { label: 'Titik Kumpul', value: 'Pelabuhan Kartini Jepara' },
                { label: 'Penginapan', value: 'Homestay AC (Sharing)' },
                { label: 'Aktivitas', value: 'Island Hopping & Snorkeling' },
            ],`;

const targetCRLF = target.replace(/\n/g, '\r\n');

if (c.includes(targetCRLF)) {
    c = c.replace(targetCRLF, replacement.replace(/\n/g, '\r\n'));
    console.log('Injected details (CRLF)');
} else if (c.includes(target)) {
    c = c.replace(target, replacement);
    console.log('Injected details (LF)');
} else {
    // try looser matching
    c = c.replace(/price:\s*'Rp 450.000\/pax',\s*note:\s*'Min. 4 orang \| Berangkat setiap Jumat malam',/, `price: 'Rp 450.000/pax',\n            note: 'Min. 4 orang | Berangkat setiap Jumat malam',\n            details: [\n                { label: 'Durasi', value: '2 Hari 1 Malam' },\n                { label: 'Titik Kumpul', value: 'Pelabuhan Kartini Jepara' },\n                { label: 'Penginapan', value: 'Homestay AC (Sharing)' },\n                { label: 'Aktivitas', value: 'Island Hopping & Snorkeling' },\n            ],`);
    console.log('Injected details (Regex fallback)');
}

fs.writeFileSync('generate-pages.cjs', c, 'utf8');
