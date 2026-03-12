const fs = require('fs');
let c = fs.readFileSync('generate-pages.cjs', 'utf8');

// Update image reference in Yogykarta
c = c.replace(
    "id: 'yogyakarta',\n        name: 'Yogyakarta',\n        shortDesc: 'Kota budaya",
    "id: 'yogyakarta',\n        name: 'Yogyakarta',\n        image: './aset/jogja.jpeg',\n        shortDesc: 'Kota budaya"
);

// Update img-main template
c = c.replace(
    'class="img-main" style="border-radius:20px;width:100%;height:auto;object-fit:contain;box-shadow:0 8px 24px rgba(0,0,0,0.06);"',
    'class="img-main" style="border-radius:20px;width:100%;max-width:500px;height:auto;object-fit:contain;display:block;margin:0 auto 2rem auto;box-shadow:0 8px 24px rgba(0,0,0,0.06);"'
);

// Update other places that used foto-ini.jpg to support pkg.image
c = c.replace(
    '<img src="./foto-ini.jpg" alt="${pkg.name}" class="img-main"',
    '<img src="${pkg.image || \'./foto-ini.jpg\'}" alt="${pkg.name}" class="img-main"'
);

c = c.replace(
    '<img class="hero-bg" src="/foto-ini.jpg"',
    '<img class="hero-bg" src="${pkg.image || \'/foto-ini.jpg\'}"'
);

c = c.replace(
    '<img src="/foto-ini.jpg" alt="${pkg.name}" >',
    '<img src="${pkg.image || \'/foto-ini.jpg\'}" alt="${pkg.name}" style="width:100%; height:260px; object-fit:contain; background:#f4f9ff; border-radius:16px 16px 0 0;">'
);

fs.writeFileSync('generate-pages.cjs', c, 'utf8');
console.log('Done!');
