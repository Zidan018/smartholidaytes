const fs = require('fs');

const slugify = text => text.toLowerCase()
    .replace(/[^a-z0-9 ]+/g, '')
    .replace(/ +/g, '-')
    .replace(/(^-|-$)+/g, '');


// ====================================================
// HELPER: Rundown Timeline (Collapsible)
// ====================================================
function getRundownHtml(rundown) {
    const items = rundown.map(r => `
        <div class="timeline-item reveal">
            <div class="time">${r.time}</div>
            <div class="content"><h4>${r.activity}</h4><p>${r.desc}</p></div>
        </div>`).join('');
    return `
    <section class="section" style="padding-top:0;">
        <div class="container">
            <details class="rundown-toggle">
                <summary class="rundown-summary">
                    <span>🗺️ Lihat Estimasi Perjalanan</span>
                    <span class="rundown-arrow">▼</span>
                </summary>
                <div class="rundown-body">
                    <p style="text-align:center;color:var(--text-light);margin-bottom:32px;">Estimasi jadwal kegiatan selama perjalanan Anda.</p>
                    <div class="timeline">${items}</div>
                </div>
            </details>
        </div>
    </section>`;
}


// Default includes/excludes jika tidak didefinisikan per paket
const DEFAULT_INCLUDES = [
    'Transportasi Privat ber-AC',
    'Tiket Masuk Objek Wisata',
    'Guide berpengalaman',
    'Air Mineral selama perjalanan',
    'Penjemputan & Pengantaran',
];
const DEFAULT_EXCLUDES = [
    'Pengeluaran & makan pribadi',
    'Wahana tambahan / ojek lokal',
    'Tips sukarela untuk guide',
];

function getPricingHtml(startPrice, subPackages, pkgName) {
    // Normalisasi: jika string → ubah ke objek
    const rawPkgs = (subPackages && subPackages.length > 0) ? subPackages : [{ name: 'Paket Privat' }];
    const pkgs = rawPkgs.map(sp =>
        typeof sp === 'string'
            ? { name: sp, price: 'Hubungi Admin', note: '', includes: DEFAULT_INCLUDES, excludes: DEFAULT_EXCLUDES }
            : {
                name: sp.name || 'Paket',
                price: sp.price || 'Hubungi Admin',
                note: sp.note || '',
                destinations: sp.destinations || null,
                destinationsGroups: sp.destinationsGroups || null,
                includes: sp.includes || DEFAULT_INCLUDES,
                excludes: sp.excludes || DEFAULT_EXCLUDES,
            }
    );

    const tabs = pkgs.map((sp, i) =>
        `<button class="subpkg-tab${i === 0 ? ' active' : ''}" onclick="switchPkg(${i}, this)" data-idx="${i}">
            ${sp.name}
        </button>`
    ).join('');

    const panels = pkgs.map((sp, i) => {
        const waMsg = encodeURIComponent(`Halo Smart Holiday, saya ingin menanyakan harga untuk *${pkgName}* – *${sp.name}*. Mohon infonya, terima kasih!`);
        const priceDisplay = sp.price || 'Hubungi Admin';
        const noteHtml = sp.note ? `<p style="font-size:0.85rem;color:var(--text-light);margin-top:6px;">📌 ${sp.note}</p>` : '';
        const includesHtml = sp.includes.map(item => `<li>${item}</li>`).join('');
        const excludesHtml = sp.excludes.map(item => `<li>${item}</li>`).join('');

        let dropdownsHtml = '';
        if (sp.destinationsGroups && sp.destinationsGroups.length > 0) {
            dropdownsHtml = sp.destinationsGroups.map(grp => `
                <details style="background:#f8f9fa; border-radius:8px; padding:10px 14px; border:1px solid #eee; cursor:pointer; margin-bottom: 8px;">
                    <summary style="font-weight:600; color:var(--primary); display:flex; justify-content:space-between; align-items:center; list-style:none;">
                        <span>${grp.title}</span>
                        <span style="font-size:0.8rem;">▼</span>
                    </summary>
                    <ul style="margin-top:12px; list-style:none; padding-left:10px; font-size:0.9rem; color:#555; display:flex; flex-direction:column; gap:8px;">
                        ${(grp.items || []).map(d => `<li>📍 ${d}</li>`).join('')}
                    </ul>
                </details>
            `).join('');
        } else {
            const destinations = sp.destinations || ['Destinasi 1 (Ganti nama tempatnya di sini)', 'Destinasi 2 (Ganti nama tempatnya di sini)', 'Destinasi 3'];
            const destinationsHtml = destinations.map(d => `<li>📍 ${d}</li>`).join('');
            dropdownsHtml = `
                <details style="background:#f8f9fa; border-radius:8px; padding:10px 14px; border:1px solid #eee; cursor:pointer;">
                    <summary style="font-weight:600; color:var(--primary); display:flex; justify-content:space-between; align-items:center; list-style:none;">
                        <span>🗺️ Destinasi Kunjungan</span>
                        <span style="font-size:0.8rem;">▼</span>
                    </summary>
                    <ul style="margin-top:12px; list-style:none; padding-left:10px; font-size:0.9rem; color:#555; display:flex; flex-direction:column; gap:8px;">
                        ${destinationsHtml}
                    </ul>
                </details>
            `;
        }

        return `
        <div class="subpkg-panel${i === 0 ? ' active' : ''}" id="panel-${i}">
            <div class="pricing-container">
                <div class="pricing-card main-price zoom-in" style="display:flex; flex-direction:column; justify-content:space-between;">
                    <div>
                        <div class="badge-popular">💼 ${sp.name}</div>
                        <h3>${sp.name}</h3>
                        ${noteHtml}
                        
                        <div class="destinations-dropdown" style="margin-top:16px;">
                            ${dropdownsHtml}
                        </div>
                    </div>

                    <div style="margin-top:24px; text-align:center; border-top:1px dashed #eee; padding-top:16px;">
                        <p style="font-size:0.9rem; color:#888; margin-bottom:4px;">Harga Mulai dari</p>
                        <div class="price" style="margin-bottom:12px; justify-content:center;">
                            <span class="amount" style="font-size:1.6rem; color:var(--primary); font-weight:800;">${priceDisplay}</span>
                        </div>
                        <div class="price-addons" style="margin-bottom:12px;"><p><strong>Promo & Diskon</strong> tersedia untuk grup besar</p></div>
                        <a href="https://wa.me/6281252909674?text=${waMsg}"
                           class="btn-primary full-width" target="_blank">
                            💬 Tanya Harga ${sp.name}
                        </a>
                    </div>
                </div>
                <div class="inclusions-card slide-in-right">
                    <div class="inc-box glassmorphism" style="border:1px solid #eee;">
                        <h4><span class="icon">✅</span> Sudah Termasuk</h4>
                        <ul>${includesHtml}</ul>
                    </div>
                    <div class="inc-box glassmorphism mt-4" style="border:1px solid #eee;">
                        <h4><span class="icon">❌</span> Belum Termasuk</h4>
                        <ul>${excludesHtml}</ul>
                    </div>
                </div>
            </div>
        </div>`;
    }).join('');

    return `
    <section id="pricing" class="section bg-light">
        <div class="container">
            <div class="section-header text-center fade-in-up">
                <h2 class="section-title">💰 Harga Paket</h2>
                <p>Pilih jenis paket untuk melihat detail harga dan informasi lebih lanjut</p>
            </div>
            <div class="subpkg-tabs-wrapper fade-in-up">
                <div class="subpkg-tabs">${tabs}</div>
            </div>
            <div class="subpkg-panels">${panels}</div>
        </div>
    </section>

    <style>
        .subpkg-tabs-wrapper { margin-bottom: 32px; }
        .subpkg-tabs { display:flex; flex-wrap:wrap; gap:10px; justify-content:center; }
        .subpkg-tab {
            padding: 10px 24px; border-radius: 999px;
            border: 2px solid var(--primary); background: transparent;
            color: var(--primary); font-weight: 600; font-size: 0.9rem;
            cursor: pointer; transition: all 0.25s ease; font-family: inherit;
        }
        .subpkg-tab:hover, .subpkg-tab.active {
            background: var(--primary); color: #fff;
            transform: translateY(-2px); box-shadow: 0 6px 16px rgba(21,101,192,0.3);
        }
        .subpkg-panel { display: none; animation: fadeSlideIn 0.35s ease; }
        .subpkg-panel.active { display: block; }
        @keyframes fadeSlideIn {
            from { opacity: 0; transform: translateY(16px); }
            to   { opacity: 1; transform: translateY(0); }
        }
    </style>
    <script>
        function switchPkg(idx, btn) {
            document.querySelectorAll('.subpkg-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.subpkg-panel').forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById('panel-' + idx).classList.add('active');
        }
    </script>`;
}

// ====================================================
// HELPER: Base HTML template
// ====================================================
const baseHtml = (title, mainTitle, subtitle, backLink, backLabel, bodyContent) => `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title} | SmartHoliday</title>
    <meta name="description" content="Paket Tour ${title} - SmartTour." />
    <link rel="stylesheet" href="./style.css" />
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    
</head>
<body>
    <nav class="navbar" id="navbar">
        <div class="nav-container">
            <a href="./" class="logo logo-img-link">
                <img src="./aset/logo.png" alt="Smart Holiday" class="logo-img">
            </a>
            <div class="nav-links">
                <a href="./">Home</a>
                <a href="/#packages">Paket Tour</a>
                <a href="./tentang-kami.html">Tentang Kami</a>
            </div>
            <a href="https://wa.me/6281252909674" class="btn-primary btn-nav">Pesan Sekarang</a>
            <button class="mobile-menu-toggle" aria-label="Toggle menu">
                <span></span><span></span><span></span>
            </button>
        </div>
    </nav>

    <header class="hero" style="min-height:55vh;height:55vh;">
        <img class="hero-bg" src="${typeof pkg !== 'undefined' ? (pkg.heroImage || pkg.image) : '/foto-ini.jpg'}" alt="${title}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;z-index:-2;animation:bgScale 20s infinite alternate;">
        <div class="hero-overlay" style="position:absolute;top:0;left:0;width:100%;height:100%;background:linear-gradient(160deg,rgba(0,0,0,0.65) 0%,rgba(0,0,0,0.35) 100%);z-index:-1;"></div>
        <div class="hero-content" style="z-index:10;color:#fff;text-align:center;padding:0 20px;margin-top:60px;">
            ${backLink ? `<p style="margin-bottom:12px;font-size:0.9rem;opacity:0.8;">◀ <a href="${backLink}" style="color:#f29f05;font-weight:600;">${backLabel}</a></p>` : ''}
            <h1 class="fade-in-up">${mainTitle}</h1>
            <p class="fade-in-up delay-1" style="margin-top:10px;opacity:0.9;">${subtitle}</p>
        </div>
    </header>

    ${bodyContent}

    <footer class="footer">
        <div class="container fade-in-up delay-1">
            <div class="footer-grid">
                <div class="footer-about">
                    <h3>Smart<span>Holiday</span></h3>
                    <p>Smart Holiday merupakan perusahaan layanan jasa tour and travel yang berkantor pusat di Purwokerto dan melayani berbagai paket wisata domestik maupun internasional dengan layanan terbaik.</p>
                </div>
                <div class="footer-links">
                    <h4>Navigasi</h4>
                    <ul>
                        <li><a href="./">Home</a></li>
                        <li><a href="./#packages">Paket Tour</a></li>
                        <li><a href="./#pricing">Harga Paket</a></li>
                    </ul>
                </div>
                <div class="footer-contact">
                    <h4>Hubungi Kami</h4>
                    <p>📍 Jln. Patriot,No 36 Karang Pucung,Kecamatan Purwokerto Timur,Kabupaten Banyumas, Prov. Jawa Tengah</p>
                    <p>📞 +62 812-5290-9674</p>
                    <p>✉️ info@smartholiday.com</p>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2026 SmartHoliday. All rights reserved.</p>
            </div>
        </div>
    </footer>
    <script type="module" src="./main.js"></script>
</body>
</html>`;

// ====================================================
// ====================== DATA ========================
// EDIT PAKET DI SINI
// ====================================================

const domesticPackages = [
    {
        id: 'yogyakarta',
        name: 'Yogyakarta',
        image: './aset/jogjabg.jpg',
        shortDesc: 'Kota budaya dengan Borobudur, Malioboro, Prambanan, dan kuliner legendaris.',
        subPackages: [
            // === EDIT DI SINI ===========================
            // name     = nama paket (tampil sebagai tab yang bisa diklik)
            // price    = harga (contoh: 'Rp 450.000/pax' atau 'Hubungi Admin')
            // note     = catatan kecil di bawah harga (boleh dikosongkan: '')
            // includes = daftar "Sudah Termasuk"
            // excludes = daftar "Belum Termasuk"
            // ======================================================
            {
                name: 'Paket Promo',
                price: 'Rp 300.000 /pax',
                note: 'Harga spesial untuk rombongan | Destinasi: Yogyakarta',
                destinationsGroups: [
                    { title: '🗺️ Paket 1 (Rp 320.000 / pax)', items: ['Pantai Kukup', 'Pictniq Land', 'Hutan Pinus Becici', 'Malioboro', 'Sentra Bakpia Jogja'] },
                    { title: '🗺️ Paket 2 (Rp 300.000 / pax)', items: ['Pantai Sepanjang', 'Tebing Breksi', 'Hutan Pinus Pengger', 'Malioboro', 'Sentra Bakpia Jogja'] },
                    { title: '🗺️ Paket 3 (Rp 320.000 / pax)', items: ['Pantai Indrayanti', 'Hutan Pinus Becici', 'Little Tokyo', 'Malioboro', 'Sentra Bakpia Jogja'] },
                    { title: '🗺️ Paket 4 (Rp 390.000 / pax)', items: ['Pantai Depok', 'Studio Alam Gamplong Jeep Gumukpasir', 'Malioboro', 'Sentra Bakpia Jogja'] },
                    { title: '🗺️ Paket 5 (Rp 330,000 / pax)', items: ['Pantai Drini', 'Obelisk hills', 'Pinus Pengger', 'Malioboro', 'Sentra Bakpia Jogja'] },
                    { title: '🗺️ Paket 6 (Rp 350.000 / pax)', items: ['Lava Jeep Tour Merapi', 'Ibarbo Park', 'Malioboro', 'Sentra Bakpia Jogja'] },
                ],
                includes: [
                    'Armada BUS Pariwisata Terbaru',
                    'Tiket Masuk Lokawisata',
                    'Tour Guide',
                    'Makan',
                    'Air Mineral Botol',
                    'Asuransi',
                    'P3K',
                    'Doorprizee',
                    'Dokumentasi',
                    'Banner Wisata',
                ],
                excludes: [
                    'Tempat dan Tujuan bisa menyesuaikan dengan keinginan',
                    'Peserta minimal 45 pax per BUS',
                    'Harga dapat berubah sewaktu-waktu',
                    'Fasilitas lengkap, aman, nyaman, dan sudah di handling oleh kami',
                ],
            },
            {
                name: 'Paket 15 Pax',
                price: 'Rp 470.000 /pax',
                note: 'Minimal 15 orang | Cocok untuk grup sekolah / kantor',
                destinationsGroups: [
                    { title: '🗺️ Paket 1 (Rp 470.000 / pax)', items: ['Pantai kukup', 'Pictniq Land', 'Hutan Pinus Becici', 'Malioboro', 'Sentra Bakpia Jogja'] },
                    { title: '🗺️ Paket 2 (Rp 450.000 / pax)', items: ['Pantai Sepanjang', 'Tebing Breksi', 'Hutan Pinus Becici', 'Malioboro', 'Sentra Bakpia Jogja'] },
                    { title: '🗺️ Paket 3 (Rp 520.000 / pax)', items: ['Pantai Indrayanti', 'Hutan Pinus Pengger', 'Jeep Advanture Pinus Pengger', 'Malioboro', 'Sentra Bakpia Jogja'] },
                    { title: '🗺️ Paket 4 (Rp 500.000 / pax)', items: ['Pantai Depok', 'Jeep Tour Gumuk Pasir', 'Taman Sari', 'Malioboro', 'Sentra Bakpia Jogja'] },
                    { title: '🗺️ Paket 5 (Rp 480.000 / pax)', items: ['Pantai Drini', 'On The Rock', 'Hutan Pinus Pengger', 'Sentra Bakpia Jogja'] },
                    { title: '🗺️ Paket 6 (Rp 500.000 / pax)', items: ['Lava Jeep Tour Merapi', 'The Lost World Castile', 'Malioboro', 'Sentra Bakpia Jogja'] },
                    { title: '🗺️ Paket 7 (Rp 470.000 / pax)', items: ['Tebing Breksi', 'Pantai Parangtritis', 'Obelisk Sea View', 'Malioboro', 'Sentra Bakpia Jogja'] },
                ],
                includes: [
                    'Armada ELF Pariwisata Terbaru',
                    'Tiket Masuk Lokawisata',
                    'Tour Guide',
                    'Makan',
                    'Air Mineral Botol',
                    'Asuransi',
                    'P3K',
                    'Doorprizee',
                    'Dokumentasi',
                    'Banner Wisata',
                ],
                excludes: [
                    'Tempat dan Tujuan bisa menyesuaikan dengan keinginan',
                    'Peserta minimal 45 pax per BUS',
                    'Harga dapat berubah sewaktu-waktu',
                    'Fasilitas lengkap, aman, nyaman, dan sudah di handling oleh kami',
                ],
            },
            {
                name: 'Paket Berlima',
                price: 'Rp 530.000 /pax',
                note: 'Untuk 5 orang | Kendaraan privat nyaman',
                destinationsGroups: [
                    { title: '🗺️ Paket 1 (Rp 530,000 / pax)', items: ['Pantai Kuku', 'Tebing Breksi', 'Hutan Pinus Pengger', 'Malioboro', 'Sentral Bakpia Jogja'] },
                    { title: '🗺️ Paket 2 (Rp 560.000 / pax)', items: ['Pantai Indrayanti', 'Hutan Pinus Pengger', 'Obelisk Hills', 'Malioboro', 'Sentral Bakpia Jogja'] },
                    { title: '🗺️ Paket 3 (Rp 550.000 / pax)', items: ['Pantai Depok', 'Studio Alam Gamplong', 'Taman Sari', 'Malioboro', 'Sentral Bakpia Jogja'] },
                    { title: '🗺️ Paket 4 (Rp 560,000 / pax)', items: ['Tebing Breksi', 'Pictniq Land', 'Hutan Pinus Becici', 'Malioboro', 'Sentral Bakpia Jogja'] },
                    { title: '🗺️ Paket 5 (Rp 580,000 / pax)', items: ['Pantai Parangtritis', 'Museum Affandi', 'Malioboro', 'Sentral Bakpia Jogja'] },
                    { title: '🗺️ Paket 6 (Rp 570,000 / pax)', items: ['Pantai Drini', 'Seribu Batu Songgo Langit', 'Obelisk Sea View', 'Malioboro', 'Sentral Bakpia Jogja'] },
                ],
                includes: [
                    'Armada Mobil Pribadi',
                    'Tiket Masuk Lokawisata',
                    'Tour Guide',
                    'Makan',
                    'Air Mineral Botol',
                    'Asuransi',
                    'P3K',
                    'Doorprizee',
                    'Dokumentasi',
                    'Banner Wisata',
                ],
                excludes: [
                    'Tempat dan Tujuan bisa menyesuaikan dengan keinginan',
                    'Peserta minimal 45 pax per BUS',
                    'Harga dapat berubah sewaktu-waktu',
                    'Fasilitas lengkap, aman, nyaman, dan sudah di handling oleh kami',
                ],
            },
            {
                name: 'Paket Inap (2 DAY 1 NIGHT)',
                price: 'Rp 1.300.000 /pax',
                note: 'Paket lengkap untuk acara keluarga besar',
                destinationsGroups: [
                    { title: '🗺️ Paket 1 (Rp 1.300.000 / pax)', items: ['Pantai Gunung Kidul', 'Hutan Pinus Pengger', 'Pictniq Land', 'Lava Jeep Tour Merapi', 'Bhumi Merapi', 'Malioboro', 'Sentral Bakpia Jogja'] },
                    { title: '🗺️ Paket 2 (Rp 1.400.000 / pax)', items: ['Rafting Sungai Elo', 'Ketepass', 'Pictniq Land', 'Pantai Parangtritis', 'Obelisk Sea View', 'Malioboro', 'Sentral Bakpia Jogja'] },
                ],
                includes: [
                    'Armada BUS Pariwisata Terbaru',
                    'Tiket Masuk Lokawisata',
                    'Tour Guide',
                    'Makan 6x',
                    'Air Mineral Botol',
                    'Asuransi',
                    'P3K',
                    'Doorprizee',
                    'Dokumentasi',
                    'Banner Wisata',
                    'Snack',
                    'Hotel Berbintang',
                ],
                excludes: [
                    'Tempat dan Tujuan Bisa Menyesuaikan dengan keinginan',
                    'Peserta minimal 45 pax per BUS',
                    'Harga dapat berubah sewaktu-waktu',
                    'Fasilitas lengkap, aman, nyaman, dan sudah di handling oleh kami',
                    'Hotel Bintang 3 atau setaraf',
                    '2 Person Per Room'
                ],
            },
        ],
        desc: 'Yogyakarta adalah kota istimewa yang memadukan kekayaan budaya, sejarah, dan alam. Anda bisa mengunjungi Candi Borobudur – keajaiban dunia yang megah, Candi Prambanan yang eksotis, berjalan di Jalan Malioboro, mencicip gudeg, hingga menikmati sunset di Pantai Parangtritis.\n\nSmartHoliday menyediakan berbagai pilihan paket Yogyakarta: Paket Promo untuk budget terbaik, Paket 15 Pax untuk grup besar, Paket Berlima untuk rombongan kecil, Outbond seru, dan Family Gathering yang berkesan.',
        price: 'Hubungi Admin',
        schedules: [{ date: 'Setiap Hari', day: 'Fleksibel', available: true }],
        rundown: [
            { time: '21.00-22.00', activity: 'Persiapan Pemberangkatan', desc: '' },
            { time: '22.00-04.30', activity: 'Berangkat Menuju Jogja', desc: '' },
            { time: '04.30-06.30', activity: 'Transit Shubuh, MCK Dan Sarapan Pagi', desc: '' },
            { time: '06.30-07.00', activity: 'Perjalanan Menuju Objek Wisata (Lava Tour Merapi)', desc: '' },
            { time: '07.00-09.30', activity: 'Wisata Di Lava Tour Merapi', desc: '' },
            { time: '09.30-11.00', activity: 'Melanjutkan Perjalanan Menuju Objek Wisata Selanjutnya (Pictniq Land)', desc: '' },
            { time: '11.00-13.30', activity: 'Wisata di Pictniq Land', desc: '' },
            { time: '13.30-14.30', activity: 'Perjalanan Menuju Pusat Oleh-Oleh', desc: '' },
            { time: '14.30-15.30', activity: 'Wisata Belanja Di Pusat Oleh-Oleh', desc: '' },
            { time: '15.30-16.00', activity: 'Perjalanan Menuju Malioboro', desc: '' },
            { time: '16.00-17.30', activity: 'Berwisata Di Malioboro', desc: '' },
            { time: '17.30-23.00', activity: 'Perjalanan Pulang Menuju Purwokerto', desc: '' },
            { time: '23.00', activity: 'Tiba Di Purwokerto', desc: '' },
        ]
    },
    {
        id: 'semarang',
        name: 'Semarang',
        image: './aset/semarangbg.jpg',
        shortDesc: 'Kota atlas dengan Lawang Sewu, Kota Lama, dan kuliner legendaris lumpia.',
        subPackages: [
            // === EDIT DI SINI ===========================
            // name     = nama paket (tampil sebagai tab yang bisa diklik)
            // price    = harga (contoh: 'Rp 450.000/pax' atau 'Hubungi Admin')
            // note     = catatan kecil di bawah harga (boleh dikosongkan: '')
            // includes = daftar "Sudah Termasuk"
            // excludes = daftar "Belum Termasuk"
            // ======================================================
            {
                name: 'Paket Promo',
                price: 'Rp 300.000 /pax',
                note: 'Harga spesial untuk rombongan | Destinasi: Semarang',
                destinationsGroups: [
                    { title: '🗺️ Paket 1 (Rp 330.000 / pax)', items: ['Masjid Agung Jawa Tengah', 'Kota Lama', 'Dusun Sumilir', 'Lawang Sewu'] },
                    { title: '🗺️ Paket 2 (Rp 320.000 / pax)', items: ['Masjid Agung Jawa Tengah', 'Lawang Sewu', 'Kota Lama', 'Firdaus Fatimahzahro'] },
                    { title: '🗺️ Paket 3 (Rp 300.000 / pax)', items: ['Masjid Agung Jawa Tengah', 'Grand Maerokoco', 'Sam Poo Kong', 'Kota Lama'] },
                    { title: '🗺️ Paket 4 (Rp 325.000 / pax)', items: ['Masjid Agung Jawa Tengah', 'Cimory', 'Dusun Sumilir', 'Kota Lama'] },
                    { title: '🗺️ Paket 5 (Rp 330.000 / pax)', items: ['Masjid Agung Jawa Tengah', 'Kota Lama', 'Taman Bunga Celosia', 'Grand Maerokoco'] },
                    { title: '🗺️ Paket 6 (Rp 390.000 / pax)', items: ['Masjid Agung Jawa Tengah', 'Kota Lama', 'Saloka Park', 'Pusat Oleh-Oleh'] },
                ],
                includes: [
                    'Doorprize',
                    'Asuransi',
                    'P3K',
                    'Air Mineral Botol',
                    'Dokumentasi',
                    'Tour Guide',
                    'Tiket Masuk Lokawisata',
                    'Makan',
                    'Banner Wisata',
                    'Armada Hiace dan BUS Pariwisata'
                ],
                excludes: [
                    '',
                ],
            },
            {
                name: 'Paket 15 Pax',
                price: 'Rp 460.000 /pax',
                note: 'Minimal 15 orang | Cocok untuk grup sekolah / kantor',
                destinationsGroups: [
                    { title: '🗺️ Paket 1 (Rp 480.000 / pax)', items: ['Masjid Agung Jawa Tengah', 'Kota Lama', 'Dusun Sumilir', 'Lawang Sewu'] },
                    { title: '🗺️ Paket 2 (Rp 480.000 / pax)', items: ['Masjid Agung Jawa Tengah', 'Lawang Sewu', 'Kota Lama', 'Firdaus Fatimahzahro'] },
                    { title: '🗺️ Paket 3 (Rp 460.000 / pax)', items: ['Masjid Agung Jawa Tengah', 'Grand Maerokoco', 'Sam Poo Kong', 'Kota Lama'] },
                    { title: '🗺️ Paket 4 (Rp 480.000 / pax)', items: ['Masjid Agung Jawa Tengah', 'Cimory Dairy Land', 'Dusun Sumilir', 'Kota Lama'] },
                    { title: '🗺️ Paket 5 (Rp 480.000 / pax)', items: ['Masjid Agung Jawa Tengah', 'Kota Lama', 'Taman Bunga Celosia', 'Grand Maerokoco'] },
                    { title: '🗺️ Paket 6 (Rp 550.000 / pax)', items: ['Masjid Agung Jawa Tengah', 'Kota Lama', 'Saloka Park', 'Pusat Oleh-Oleh'] },
                ],
                includes: [
                    'Armada ELF',
                    'Tor Guide',
                    'Tiket MAsuk Lokawisata',
                    'Makan 1x',
                    'Banner Wisata',
                    'Doorprize',
                    'P3K',
                    'Air Mineral Botol',
                ],
                excludes: [
                    ''
                ],
            },
            {
                name: 'Paket Inap',
                price: 'Rp 1.250.000 /pax',
                note: 'Paket lengkap untuk acara keluarga besar',
                destinationsGroups: [
                    { title: '🗺️ Paket 1 (Rp 1.250.000 / pax)', items: ['Masjid Agung Jawa Tengah', 'Kota Lama', 'Lawang Sewu', 'Samm Poo Kong', 'Dusun Semilir', 'Taman Bunga Celosia'] },
                ],
                includes: [
                    'Transportasi ber-AC Purwokerto – Semarang PP',
                    'Fasilitator & MC acara',
                    'Games & hiburan keluarga',
                    'Dokumentasi foto & video',
                    'Air mineral selama acara',
                    'Tiket masuk objek wisata',
                ],
                excludes: [
                    '',
                ],
            },
        ],
        desc: 'Semarang menawarkan perpaduan wisata sejarah kolonial, wisata alam, dan kuliner yang menggugah selera. Kunjungi Lawang Sewu yang ikonik, Kota Lama yang memesona, Klenteng Sam Poo Kong, dan rasakan sensasi bajak laut di Kapal Apung.\n\nSmartHoliday memiliki berbagai pilihan paket Semarang yang bisa disesuaikan dengan kebutuhan grup Anda.',
        price: 'Hubungi Admin',
        schedules: [{ date: 'Setiap Hari', day: 'Fleksibel', available: true }],
        rundown: [
            { time: '23.00-00.00', activity: 'Persiapan Pemberangkatan', desc: '' },
            { time: '00.00-05.00', activity: 'Berangkat Menuju Semarang (Goa Maria Kerep Ambarawa', desc: '' },
            { time: '05.00-07.30', activity: 'Transit Makan Pagi', desc: '' },
            { time: '07.30-09.00', activity: 'Wisata Reliji di Goa Maria Kerep Ambarawa', desc: '' },
            { time: '09.00-09.30', activity: 'Perjalanan Menuju Pasar Sayur', desc: '' },
            { time: '09.30-10.00', activity: 'Wisata Belanja Di Pasar Bandungan', desc: '' },
            { time: '10.00-10.30', activity: 'Melanjutkan Perjalanan Menuju Objek Wisata Selanjutnya (Taman Bunga Celosia)', desc: '' },
            { time: '10.30-11.30', activity: 'Wisata Di Taman Bunga Celosia', desc: '' },
            { time: '11.30-12.30', activity: 'Makan Siang', desc: '' },
            { time: '12.30-13.30', activity: 'Perjalanan Menuju Dusun Semilir', desc: '' },
            { time: '13.30-17.00', activity: 'Wisata Di Dusun Semilir', desc: '' },
            { time: '17.00-18.00', activity: 'Makan Malam', desc: '' },
            { time: '18.00-23.00', activity: 'Perjalanan Pulang Menuju Purwokerto', desc: '' },
            { time: '23.00-00.00', activity: 'Persiapan Pemberangkatan', desc: '' },
            { time: '23.00', activity: 'Tiba Di Purwokerto', desc: '' },
        ]
    },
    {
        id: 'bandung',
        name: 'Bandung',
        image: './aset/bandungbg.jpg',
        shortDesc: 'Kota kembang dengan factory outlet, wisata alam Kawah Putih, dan kuliner kekinian.',
        subPackages: [
            // === EDIT DI SINI ===========================
            // name     = nama paket (tampil sebagai tab yang bisa diklik)
            // price    = harga (contoh: 'Rp 450.000/pax' atau 'Hubungi Admin')
            // note     = catatan kecil di bawah harga (boleh dikosongkan: '')
            // includes = daftar "Sudah Termasuk"
            // excludes = daftar "Belum Termasuk"
            // ======================================================
            {
                name: 'Paket Promo',
                price: 'Rp 360.000 /pax',
                note: 'Harga spesial untuk rombongan | Destinasi: Bandung',
                destinationsGroups: [
                    { title: '🗺️ Paket 1 (Rp 390.000 / pax)', items: ['Masjid Raya Al Jabbar', 'Tangkuban Perahu', 'De Castello', 'Pusat Oleh-Oleh'] },
                    { title: '🗺️ Paket 2 (Rp 390.000 / pax)', items: ['Masjid Raya Al Jabbar', 'The Great Asia Africa', 'Floating Market', 'Pusat Oleh-Oleh'] },
                    { title: '🗺️ Paket 3 (Rp 360.000 / pax)', items: ['Masjid Raya Al Jabbar', 'Darm House', 'Lembah Dewata', 'Pusat Oleh-Oleh'] },
                    { title: '🗺️ Paket 4 (Rp 410.000 / pax)', items: ['Masjid Raya Al Jabbar', 'Kawah Putih', 'Situ Patenggang', 'Pusat Oleh-Oleh'] },
                    { title: '🗺️ Paket 5 (Rp 430.000 / pax)', items: ['Masjid Raya Al Jabbar', 'De Castello', 'Saung Mang Udjo', 'Pusat Oleh-Oleh'] },
                ],
                includes: [
                    'Doorprize',
                    'Asuransi',
                    'P3K',
                    'Air Mineral Botol',
                    'Dokumentasi',
                    'Tour Guide',
                    'Tiket Masuk Lokawisata',
                    'Makan',
                    'Armada Bus Pariwisata',
                ],
                excludes: [
                    '',
                ],
            },
            {
                name: 'Paket 15 Pax',
                price: 'Rp 620.000 /pax',
                note: 'Minimal 15 orang | Cocok untuk grup sekolah / kantor',
                destinationsGroups: [
                    { title: '🗺️ Paket 1 (Rp 640.000 / pax)', items: ['Masjid Raya Al Jabbar', 'Tangkuban Perahu', 'De Castello', 'Pusat Oleh-Oleh'] },
                    { title: '🗺️ Paket 2 (Rp 650.000 / pax)', items: ['Masjid Raya Al Jabbar', 'The Great Asia Africa', 'Floating Market', 'Pusat Oleh-Oleh'] },
                    { title: '🗺️ Paket 3 (Rp 620.000 / pax)', items: ['Masjid Raya Al Jabbar', 'Farm House', 'Lembah Dewata', 'Pusat Oleh-Oleh'] },
                    { title: '🗺️ Paket 4 (Rp 690.000 / pax)', items: ['Masjid Raya Al Jabbar', 'Kawah Putih', 'Situ Patenggang', 'Pusat Oleh-Oleh'] },
                    { title: '🗺️ Paket 5 (Rp 740.000 / pax)', items: ['Masjid Raya Al Jabbar', 'Floating Market', 'Saung Mang Udjo', 'Pusat Oleh-Oleh'] },
                    { title: '🗺️ Paket 6 (Rp 650.000 / pax)', items: ['Masjid Raya Al Jabbar', 'Dusun Bambu', 'Mini Mania', 'Wisata Garden'] },
                ],
                includes: [
                    'Armada ELF',
                    'Tour Guide',
                    'Tiket Masuk Lokawisata',
                    'Makan 1x',
                    'Banner Wisata',
                    'Dokumentasi',
                    'Doorprize',
                    'P3K',
                    'Air Mineral Botol',
                ],
                excludes: [
                    '',
                ],
            },
            {
                name: 'Paket Inap',
                price: 'Rp 1.400.000 /pax',
                note: 'Paket lengkap untuk acara keluarga besar',
                destinationsGroups: [
                    { title: '🗺️ Paket 1 (Rp 1.400.000 / pax)', items: ['De Castello', 'Lembah Dewata', 'Floating Market', 'Tangkuban Perahu', 'Farm House', 'Masjid Raya Al Jabbar', 'Pusat Oleh-Oleh'] },
                    { title: '🗺️ Paket 2 (Rp 1.450.000 / pax)', items: ['Rafting Pangalengan', 'Nimo Highland', 'Dusun Babu', 'Tangkuban Perahu', 'Masjid Raya Al Jabbar', 'Pusat Oleh-Oleh'] },
                ],
                includes: [
                    'Transportasi ber-AC Purwokerto – Bandung PP',
                    'Fasilitator & MC acara',
                    'Games & hiburan keluarga',
                    'Dokumentasi foto & video',
                    'Air mineral selama acara',
                    'Tiket masuk objek wisata',
                ],
                excludes: [
                    '',
                ],
            },
        ],
        desc: 'Bandung adalah destinasi favorit wisatawan yang menawarkan segalanya: factory outlet mewah, wisata alam indah (Kawah Putih, Tangkuban Perahu), kuliner kekinian, hingga heritage kota tua.\n\nSmartHoliday menghadirkan paket Bandung yang lengkap mulai dari Paket Promo hemat hingga Family Gathering yang seru dan berkesan.',
        price: 'Hubungi Admin',
        schedules: [{ date: 'Setiap Hari', day: 'Fleksibel', available: true }],
        rundown: [
            { time: '', activity: '6 Februari 2026', desc: '' },
            { time: '19.00-20.00', activity: 'Persiapan Penjemputan', desc: '' },
            { time: '20.00-04.00', activity: 'Perjalanan Menuju Bandung', desc: '' },
            { time: '', activity: '7 Februari 2026', desc: '' },
            { time: '04.00-05.30', activity: 'Transit Ibadah Sholat subuh dan MCK di Masjid Raya Al Jabbar', desc: '' },
            { time: '05.30-07.30', activity: 'Perjalanan Menuju Rumah Makan', desc: '' },
            { time: '07.30-08.00', activity: 'Sarapan Pagi', desc: '' },
            { time: '08.00-08.30', activity: 'Perjalanan Menuju Tangkuban Perahu', desc: '' },
            { time: '08.30-10.30', activity: 'Bersiwata Di Tangkuban Perahu', desc: '' },
            { time: '10.30-11.00', activity: 'Perjalanan Menuju Lembah Dewata', desc: '' },
            { time: '11.00-12.30', activity: 'Wisata Di Lembah Dewata', desc: '' },
            { time: '12.30-12.45', activity: 'Perjalanan Menuju Rumah Makan', desc: '' },
            { time: '12.45-13.30', activity: 'ISHOMA Siang', desc: '' },
            { time: '14.00-14.15', activity: 'Perjalanan Menuju Floating Market', desc: '' },
            { time: '14.15-16.30', activity: 'Wisata Di Floating Market', desc: '' },
            { time: '16.30-17.30', activity: 'Perjalanan Menuju Cihampelas', desc: '' },
            { time: '17.30-19.00', activity: 'Wisata Di Cihampelas', desc: '' },
            { time: '19.00-20.00', activity: 'Perjalanan Menuju Rumah Makan', desc: '' },
            { time: '20.00-21.00', activity: 'ISHOMA Makan', desc: '' },
            { time: '21.00-04.00', activity: 'Perjalanan Pulang Menuju Ke Purwokerto', desc: '' },
            { time: '', activity: '8 Februari 2026', desc: '' },
            { time: '04.00', activity: 'Sampai Di Purwokerto', desc: '' },
        ]
    },
    {
        id: 'dieng',
        name: 'Dieng',
        image: './aset/diengbg.jpg',
        shortDesc: 'Dataran tinggi mistis dengan Telaga Warna, Candi Arjuna, dan sunrise Golden Sunrise.',
        subPackages: [
            // === EDIT DI SINI ===========================
            // name     = nama paket (tampil sebagai tab yang bisa diklik)
            // price    = harga (contoh: 'Rp 450.000/pax' atau 'Hubungi Admin')
            // note     = catatan kecil di bawah harga (boleh dikosongkan: '')
            // includes = daftar "Sudah Termasuk"
            // excludes = daftar "Belum Termasuk"
            // ======================================================
            {
                name: 'Paket Promo',
                price: 'Rp 340.000 /pax',
                note: 'Harga spesial untuk rombongan | Destinasi: Dieng',
                destinationsGroups: [
                    { title: '🗺️ Paket 1 (Rp 370.000 /pax)', items: ['Batu Angkruk', 'Kawah Cikidang', 'Candi Arjuna', 'Pusat Oleh-Oleh'] },
                    { title: '🗺️ Paket 2 (Rp 340.000 /pax)', items: ['Pintu Langit', 'Telaga Menjer', 'Kebun Teh Panama', 'Pusat Oleh-Oleh'] },
                    { title: '🗺️ Paket 3 (Rp 360.000 /pax)', items: ['Sikunir', 'Telaga Warna', 'Kebun Teh Panama', 'Pusat Oleh-Oleh'] },
                ],
                includes: [
                    'BUS Pariwisata Terbaru',
                    'Tour Guide atau Pemandu',
                    'Tiket Masuk Lokawisata',
                    'Asuransi Wisata',
                    'P3K',
                    'Dokumentasi',
                    'Makan',
                    'Banner Foto',
                    'Air Mineral Botol'
                ],
                excludes: [
                    '',
                ],
            },
            {
                name: 'Paket Dieng Berlima',
                price: 'Rp 500.000',
                note: 'Minimal 15 orang | Cocok untuk grup sekolah / kantor',
                destinationsGroups: [
                    { title: '🗺️ Paket 1 (Rp 540.000 /pax)', items: ['Candi Arjuna', 'Kawah Sikidang', 'Sikunir', 'Pusat Oleh-Oleh'] },
                    { title: '🗺️ Paket 2 (Rp 500.000 /pax)', items: ['Mahasky Batu Angkruk', 'Kebun Teh Panama', 'Telaga Menjer', 'Pusat Oleh-Oleh'] },
                    { title: '🗺️ Paket 3 (Rp 520.000 /pax)', items: ['Pintu Langit Sky View', 'Telaga Warna', 'Kebun Teh Tambi', 'Pusat Oleh-Oleh'] },
                    { title: '🗺️ Paket 4 (Rp 500.000 /pax)', items: ['Gardu Pandang', 'Kahyangan Skyline', 'Telaga Menjer', 'Pusat Oleh-Oleh'] },
                    { title: '🗺️ Paket 5 (Rp 530.000 /pax)', items: ['Mahasky Batu Angkruk', 'Telaga Merdada', 'Dieng Park', 'Pusat Oleh-Oleh'] },
                ],
                includes: [
                    'Armada Mobil',
                    'Tour Guide atau Pemandu',
                    'Tiket Masuk Lokawisata',
                    'Asuransi Wisata',
                    'P3K',
                    'Dokumentasi',
                    'Makan',
                    'Banner Foto',
                    'Air Mineral Botol'
                ],
                excludes: [
                    '',
                ],
            },
        ],
        desc: 'Dieng adalah salah satu destinasi wisata paling menakjubkan di Jawa Tengah. Di sini Anda bisa menikmati Golden Sunrise yang terkenal, Telaga Warna yang memukau, Candi Arjuna yang bersejarah, Kawah Sikidang yang aktif, dan Sumur Jalatunda yang legendaris.\n\nSmartHoliday menyediakan paket Dieng dengan berbagai pilihan sesuai kebutuhan grup Anda.',
        price: 'Hubungi Admin',
        schedules: [{ date: 'Setiap Hari', day: 'Fleksibel', available: true }],
        rundown: [
            { time: '21.00-22.00', activity: 'Persiapan Pemberangkatan', desc: '' },
            { time: '22.00-04.00', activity: 'Perjalanan Menuju Dieng (Sikunir)', desc: '' },
            { time: '04.00-06.30', activity: 'Wisata Dan Menikmati Sunrise di Sikunir', desc: '' },
            { time: '06.30-07.30', activity: 'Fun Games', desc: '' },
            { time: '07.30-08.00', activity: 'Perjalanan Menuju Rumah Makan', desc: '' },
            { time: '08.00-14.00', activity: 'Sarapan Pagi dan Acara Pelepasan', desc: '' },
            { time: '14.00-15.00', activity: 'Perjalanan Menuju Wonosobo', desc: '' },
            { time: '15.00-16.00', activity: 'Menikmati Kuliner Khas Wonosobo (Mie Ongklok)', desc: '' },
            { time: '16.00-20.00', activity: 'Perjalanan Pulang Ke Purwokerto', desc: '' },
            { time: '20.00', activity: 'Sampai Di Purwokerto', desc: '' },
        ]
    },
    {
        id: 'pangandaran',
        name: 'Pangandaran',
        image: './aset/pangandaranbg.jpg',
        shortDesc: 'Pantai eksotis di Jawa Barat dengan green canyon, batu karas, dan seafood segar.',
        subPackages: [
            // === EDIT DI SINI ===========================
            // name     = nama paket (tampil sebagai tab yang bisa diklik)
            // price    = harga (contoh: 'Rp 450.000/pax' atau 'Hubungi Admin')
            // note     = catatan kecil di bawah harga (boleh dikosongkan: '')
            // includes = daftar "Sudah Termasuk"
            // excludes = daftar "Belum Termasuk"
            // ======================================================
            {
                name: 'Paket Promo',
                price: 'Rp 260.000 /pax',
                note: 'Harga spesial untuk rombongan | Destinasi: Pangandaran',
                destinationsGroups: [
                    { title: '🗺️ Paket 1 (Rp 260.000 / pax)', items: ['Pantai Pangandaran', 'Batu Hiu', 'Kampung Turis', 'Pusat Oleh-Oleh'] },
                    { title: '🗺️ Paket 2 (Rp 310.000 / pax)', items: ['Pantai Pangandaran', 'Green Canyon', 'Kampung Turis', 'Pusat Oleh-Oleh'] },
                    { title: '🗺️ Paket 3 (Rp 320.000 / pax)', items: ['Pantai Pangandaran', 'Citumang', 'Batu Hiu', 'Pusat Oleh-Oleh'] },
                ],
                includes: [
                    'Doorprize',
                    'Asuransi',
                    'P3K',
                    'Air MINERAL Botol',
                    'Dokumentasi',
                    'Tour Guide',
                    'Tiket Masuk Lokawisata',
                    'Makan',
                    'Banner Wisata',
                    'Armada BUS Pariwisata 45pax',
                ],
                excludes: [
                    '',
                ],
            },
            {
                name: 'Paket 15 Pax',
                price: 'Rp 420.000 /pax',
                note: 'Minimal 15 orang | Cocok untuk grup sekolah / kantor',
                destinationsGroups: [
                    { title: '🗺️ Paket 1 (Rp 420.000 / pax)', items: ['Pantai Pangandaran', 'Batu Hiu', 'Kampung Turis', 'Pusat Oleh-Oleh'] },
                    { title: '🗺️ Paket 2 (Rp 470.000 / pax)', items: ['Pantai Pangandaran', 'Citumang', 'Batu Hiu', 'Pusat Oleh-Oleh'] },
                    { title: '🗺️ Paket 3 (Rp 420.000 / pax)', items: ['Pantai Pangandaran', 'Aquarium Indonesia', 'Kampung Turis', 'Batu Hiu'] },
                ],
                includes: [
                    'Armada ELF',
                    'Tour Guide',
                    'Tiket Masuk Lokawisata',
                    'Makan 1x',
                    'Banner Wisata',
                    'Dokumentasi',
                    'Doorprize',
                    'P3K',
                    'Air Mineral Botol'
                ],
                excludes: [
                    '',
                ],
            },
            {
                name: 'Paket Inap',
                price: 'Rp 1.200.000 /pax',
                note: 'Paket lengkap untuk acara keluarga besar',
                destinationsGroups: [
                    { title: '🗺️ Paket 1 (Rp 1.200.000)', items: ['Pantai Pangandaran', 'Pantai Batu Karas', 'Batu Hiu', 'Kampung Turis', 'Body Rafting Citumang', 'Pusat Oleh-Oleh'] },
                ],
                includes: [
                    'Transportasi ber-AC Purwokerto – Pangandaran PP',
                    'Fasilitator & MC acara',
                    'Games & hiburan keluarga',
                    'Dokumentasi foto & video',
                    'Air mineral selama acara',
                    'Tiket masuk objek wisata',
                ],
                excludes: [
                    '',
                ],
            },
        ],
        desc: 'Pangandaran menawarkan keindahan pantai yang memukau, Green Canyon yang menakjubkan, serta seafood segar yang lezat. Pantai Barat dan Pantai Timur Pangandaran masing-masing memiliki daya tarik unik.\n\nSmartHoliday memiliki paket Pangandaran lengkap untuk semua kebutuhan.',
        price: 'Hubungi Admin',
        schedules: [{ date: 'Setiap Hari', day: 'Fleksibel', available: true }],
        rundown: [
            { time: '01.00-01.30', activity: 'Persiapan Pemberangkatan', desc: '' },
            { time: '01.30-05.00', activity: 'Perjalanan Menuju Pantai', desc: '' },
            { time: '05.00-07.00', activity: 'Transit Sholat Shubuh, MCK, dan Sarapan Pagi', desc: '' },
            { time: '07.00-07.30', activity: 'Perjalanan Menuju Batu Hiu', desc: '' },
            { time: '07.30-09.00', activity: 'Berwisata Di Pantai Batu Hiu', desc: '' },
            { time: '09.00-09.30', activity: 'Perjalanan Menuju Ke Citumang Body Siang', desc: '' },
            { time: '09.30-13.00', activity: 'Body Rafting Citumang Sekaligus Makan Siang', desc: '' },
            { time: '13.00-14.00', activity: 'Perjalanan Menuju Pantai Pangandaran', desc: '' },
            { time: '14.00-17.30', activity: 'Berwisata Di Pantai Pangandaran', desc: '' },
            { time: '17.30-19.00', activity: 'ISHOMA Makan Malam', desc: '' },
            { time: '19.00-19.30', activity: 'Perjalanan Menuju Pusat Oleh-Oleh', desc: '' },
            { time: '19.30-20.00', activity: 'Wisata Belanja Di Pusat Oleh-Oleh', desc: '' },
            { time: '20.00-00.00', activity: 'Perjalanan Pulang Menuju Banyumas, Purwokerto', desc: '' },
            { time: '00.00', activity: 'Sampai Di Banyumas, Purwokerto', desc: '' },
        ]
    },
    {
        id: 'solo',
        name: 'Solo',
        image: './aset/solobg.jpg',
        shortDesc: 'Kota budaya Jawa dengan Keraton Kasunanan, Pasar Klewer, dan kuliner autentik.',
        subPackages: [
            // === EDIT DI SINI ===========================
            // name     = nama paket (tampil sebagai tab yang bisa diklik)
            // price    = harga (contoh: 'Rp 450.000/pax' atau 'Hubungi Admin')
            // note     = catatan kecil di bawah harga (boleh dikosongkan: '')
            // includes = daftar "Sudah Termasuk"
            // excludes = daftar "Belum Termasuk"
            // ======================================================
            {
                name: 'Paket Promo',
                price: 'Rp 290.000 /pax',
                note: 'Harga spesial untuk rombongan | Destinasi: Solo',
                destinationsGroups: [
                    { title: '🗺️ Paket 1 (Rp 290.000 / pax)', items: ['Masjid Syekh Zayed', 'Pasar Klewer', 'House Of Danarhadi', 'Pusat Oleh-Oleh'] },
                    { title: '🗺️ Paket 2 (Rp 330.000 / pax)', items: ['Masjid Syekh Zayed', 'Pasar Gede', 'Safari Solo', 'Pusat Oleh-Oleh'] },
                    { title: '🗺️ Paket 3 (Rp 270.000 / pax)', items: ['Masjid Syekh Zayed', 'Benteng Vastenburg', 'AKW Mobil Listrik', 'Pusat Oleh-Oleh'] },
                    { title: '🗺️ Paket 4 (Rp 290.000 / pax)', items: ['Masjid Syekh Zayed', 'Pasar Gede', 'De Tjolomadoe', 'Pusat Oleh-Oleh'] },
                    { title: '🗺️ Paket 5 (Rp 340.000 / pax)', items: ['Masjid Syekh Zayed', 'Sakura Hills', 'Lawu Park', 'Pusat Oleh-Oleh'] },
                ],
                includes: [
                    'Doorprize',
                    'Asuransi',
                    'P3K',
                    'Air Mineral Botol',
                    'Dokumentasi',
                    'Tour Guide',
                    'Tiket Masuk Lokawisata',
                    'Makan 1x',
                    'Banner Wisata',
                    'Big BUS 45 pax dan Medium 30 pax'
                ],
                excludes: [
                    '',
                ],
            },
            {
                name: 'Paket 15 Pax',
                price: 'Rp 460.000 /pax',
                note: 'Minimal 15 orang | Cocok untuk grup sekolah / kantor',
                destinationsGroups: [
                    { title: '🗺️ Paket 1 (Rp 470.000 / pax)', items: ['Masjid Syekh Zayed', 'Pasar Klewer', 'House Of Danarhadi', 'Pusat Oleh-Oleh'] },
                    { title: '🗺️ Paket 2 (Rp 500.000 / pax)', items: ['Masjid Syekh Zayed', 'Pasar Gede', 'Safari Solo', 'Pusat Oleh-Oleh'] },
                    { title: '🗺️ Paket 3 (Rp 460.000 / pax)', items: ['Masjid Syekh Zayed', 'Benteng Vastenburg', 'AKW Mobil Listrik', 'Pasar Gede'] },
                    { title: '🗺️ Paket 4 (Rp 470.000 / pax)', items: ['Masjid Syekh Zayed', 'Pasar Gede', 'De Tjolomadoe', 'Pusat Oleh-Oleh'] },
                    { title: '🗺️ Paket 5 (Rp 500.000 / pax)', items: ['Masjid Syekh Zayed', 'Sakura Hills', 'Lawu Park', 'Pusat Oleh-Oleh'] },
                ],
                includes: [
                    'Armada ELF',
                    'Tour Guide',
                    'Tiket Masuk Lokawisata',
                    'Makan 1x',
                    'Banner Wisata',
                    'Dokumentasi',
                    'Doorprize',
                    'P3K',
                    'Air Mineral Botol',
                ],
                excludes: [
                    '',
                ],
            },
        ],
        desc: 'Solo (Surakarta) adalah kota budaya Jawa yang kental dengan tradisi keraton. Kunjungi Keraton Kasunanan dan Pura Mangkunegaran, berbelanja batik di Pasar Klewer, dan nikmati nasi liwet serta tengkleng khas Solo.\n\nSmartHoliday menawarkan paket Solo yang bisa digabung dengan Yogyakarta untuk pengalaman wisata budaya Jawa yang lebih lengkap.',
        price: 'Hubungi Admin',
        schedules: [{ date: 'Setiap Hari', day: 'Fleksibel', available: true }],
        rundown: [
            { time: '04.30-05.30', activity: 'Persiapan Pemberangkatan di Stasiun Purwokerto', desc: '' },
            { time: '05.30-09.22', activity: 'Perjalanan Menuju Solo Via Kereta Logawa', desc: '' },
            { time: '09.22-10.00', activity: 'Perjalanan Menuju Benteng Vestenburg', desc: '' },
            { time: '10.00-11.00', activity: 'Berwisata Di Benteng Vestenburg', desc: '' },
            { time: '11.00-12.00', activity: 'Berwisata Dengan Mobil Listrik Solo', desc: '' },
            { time: '12.00-12.30', activity: 'Perjalanan Menuju Resto Anak Pantai', desc: '' },
            { time: '12.30-13.30', activity: 'ISHOMA Makan Siang', desc: '' },
            { time: '13.30-14.00', activity: 'Perjalanan Menuju Pusat Grosir Solo', desc: '' },
            { time: '14.00-16.00', activity: 'Wisata Belanja Pusat Grosir Solo', desc: '' },
            { time: '16.00-16.30', activity: 'Perjalanan Menuju Pusat Oleh-Oleh', desc: '' },
            { time: '16.30-17.00', activity: 'Wisata Oleh-Oleh Solo', desc: '' },
            { time: '17.00-17.30', activity: 'Perjalanan Menuju Masjid Syekh Zayyed', desc: '' },
            { time: '17.30-19.00', activity: 'Transit Sholat Maghrib di Masjid Syekh Zayyed', desc: '' },
            { time: '19.00-19.15', activity: 'Perjalanan Menuju Stasiun', desc: '' },
            { time: '19.15-20.15', activity: 'Persiapan Pulang dari Stasiun Purwosari', desc: '' },
            { time: '20.15-00.09', activity: 'Perjalanan Pulang Menuju Stasiun Purwokerto Via Kereta Bengawan', desc: '' },
            { time: '00.09', activity: 'Sampai di Purwokerto', desc: '' },
        ]
    },
    {
        id: 'banyumas',
        name: 'Banyumas',
        image: './aset/banyumasbg.jpg',
        shortDesc: 'Wisata lokal Banyumas dan sekitarnya: Baturraden, Curug, dan berbagai destinasi seru.',
        subPackages: [
            // === EDIT DI SINI ===========================
            // name     = nama paket (tampil sebagai tab yang bisa diklik)
            // price    = harga (contoh: 'Rp 450.000/pax' atau 'Hubungi Admin')
            // note     = catatan kecil di bawah harga (boleh dikosongkan: '')
            // includes = daftar "Sudah Termasuk"
            // excludes = daftar "Belum Termasuk"
            // ======================================================
            {
                name: 'Paket Promo',
                price: 'Rp 650.000 /pax',
                note: '',
                destinationsGroups: [
                    { title: '🗺️ Paket 1', items: ['Curug Bayan', 'Baturaden', 'Small World', 'Pelataran Menara', 'Batik Banyumas', '👉HIACE Rp 800.000 /pax', '👉MEDIUM Rp 750.000 /pax', '👉BIG BUS Rp 700.000 /pax'] },
                    { title: '🗺️ Paket 2', items: ['Alas Pitu', 'Curug Bayan', 'Sorjem Serayu', 'Kota Lama Banyumas', 'Batik Mruyung', '👉HIACE Rp 750.000 /pax', '👉MEDIUM Rp 700.000 /pax', '👉BIG BUS Rp 650.000 /pax'] },
                    { title: '🗺️ Paket 3', items: ['Baturaden', 'Botani', 'Pinus', 'Limpakuwus', 'Telaga Sunyi', '👉HIACE Rp 750.000 /pax', '👉MEDIUM Rp 700.000 /pax', '👉BG BUS Rp 650.000'] },
                    { title: '🗺️ Paket 4', items: ['Palawi', 'Kebun Raya Baturaden', 'Pancuran 7 Beleng', 'The Village', '👉HIACE Rp 750.000 /pax', '👉MEDIUM Rp 700.000 /pax', '👉BG BUS Rp 650.000 /pax'] },
                ],
                includes: [
                    'Armada Hiace/BUS',
                    'Tiket Masuk Lokawisata',
                    'Makan dan Snack',
                    'Banner Foto dan Dokumentasi Wisata',
                    'Tour Guide atau Pemandu',
                    'P3K Standar',
                    'Asuransi Wisata',
                    'Doorprize',
                ],
                excludes: [
                    'Makan pribadi (kecuali disebutkan)',
                    'Wahana tambahan berbayar',
                    'Tips guide (sukarela)',
                ],
            },
            {
                name: 'Paket Inap',
                price: 'Rp 650.000 /pax',
                note: '',
                destinationsGroups: [
                    { title: '🗺️ Paket UMKM', items: ['Visit Ke Pembuatan WIK', 'Visit Ke Pembuatan Batik Antojamil', 'Visit Ke Pembuatan Getuk Goreng', 'Menara Pandang', 'Curug Bayan', 'Sorjem Serayu', '👉HIACE Rp 800.000 /pax', '👉MEDIUM Rp 750.000 /pax', '👉BIG BUS Rp 700.000 /pax'] },
                    { title: '🗺️ Paket EDUKASI', items: ['Penanganan Sampah', 'Pembuatan Nopia', 'Kota Lama Banyumas', 'Sumur 3 Abad Banyumas', 'Baturaden + Pancuran 3', '👉HIACE Rp 900.000 /pax', '👉MEDIUM Rp 850.000 /pax', '👉BIG BUS Rp 800.000 /pax'] },
                    { title: '🗺️ Paket 1000 CURUG', items: ['Curug Bayan', 'Curug Telu', 'Curug Jenggala', 'Curug Pinang', 'Alas Pitu', '👉HIACE Rp 750.000 /pax', '👉MEDIUM Rp 700.000 /pax', '👉BIG BUS Rp 650.000 /pax'] },
                    { title: '🗺️ Paket EDUKASI 2', items: ['Provit Farm Village', 'Peternakan Sapi Baturaden', 'River Tubing', 'Manggala Ranch', 'Menara Pandang', '👉HIACE Rp 850.000 /pax', '👉MEDIUM Rp 800.000 /pax', '👉BIG BUS Rp 750.000 /pax'] },
                ],
                includes: [
                    'BUS Pariwisata Terbaru',
                    'Tiket Masuk Wisata',
                    'Banner Foto',
                    'Tour Guide atau Pemandu',
                    'P3K Standar',
                    'Asuransi Wisata',
                    'Doorprize',
                    'Dokumentasi Wisata',
                    'Hotel Bintang 3',
                ],
                excludes: [
                    'Makan pribadi',
                    'Wahana tambahan berbayar',
                    'Tips guide (sukarela)',
                ],
            },
        ],
        desc: 'Banyumas dan sekitarnya menyimpan banyak destinasi wisata yang indah: Baturraden dengan pemandian air panasnya, berbagai curug (air terjun) yang asri, wisata alam Gunung Slamet, serta berbagai destinasi sejarah dan budaya.\n\nSmartHoliday menawarkan paket wisata lokal Banyumas dengan pilihan paket Inap (menginap) dan Non-Inap (day trip) yang dapat disesuaikan untuk keluarga, grup perusahaan, maupun sekolah.',
        price: 'Hubungi Admin',
        schedules: [{ date: 'Setiap Hari', day: 'Fleksibel', available: true }],
        rundown: [
            { time: 'Pagi', activity: 'Baturraden', desc: 'Bermain di kawasan wisata Baturraden.' },
            { time: 'Siang', activity: 'Curug & Alam', desc: 'Menikmati air terjun dan alam sekitar.' },
            { time: 'Sore', activity: 'Kuliner Khas Banyumas', desc: 'Mendoan, sroto, dan sate jamur.' },
        ]
    },
    {
        id: 'bromo',
        name: 'Bromo',
        image: './aset/bromobg.jpg',
        shortDesc: 'Sunrise spektakuler di Lautan Pasir Bromo – one day trip paling populer dari Purwokerto.',
        subPackages: [
            // === EDIT DI SINI ===========================
            // name     = nama paket (tampil sebagai tab yang bisa diklik)
            // price    = harga (contoh: 'Rp 450.000/pax' atau 'Hubungi Admin')
            // note     = catatan kecil di bawah harga (boleh dikosongkan: '')
            // includes = daftar "Sudah Termasuk"
            // excludes = daftar "Belum Termasuk"
            // ======================================================
            {
                name: 'Paket Open Trip Bromo One Day',
                price: 'Rp 950.000 /pax',
                note: '',
                destinationsGroups: [
                    { title: '🗺️ Destinasi Wisata', items: ['Penanjakan', 'Lembah Widodaren/Pasir Berbisik', 'Pura Luhur Poten', 'Kawah Gnung Bromo', 'Gunung Batok', 'Bukit Teletubis', 'Pusat Oleh-oleh'] },
                ],
                includes: [
                    'Doorprize',
                    'Asuransi',
                    'P3K',
                    'Air Mineral Botol',
                    'Dokumentasi',
                    'Tour Guide',
                    'Tiket Masuk Lokawisata',
                    'Makan 3x',
                    'Banner Wisata',
                    'Big BUS 45 pax',
                ],
                excludes: [
                    '',                ],
            },
            {
                name: 'Paket Bromo-Malang-Probolinggo',
                price: 'Rp 1.700.000 /pax',
                note: 'Minimal 15 orang | Bus pariwisata ber-AC',
                destinationsGroups: [
                    { title: '🗺️ Paket 1 (Rp 1.700.000 / pax)', items: ['Jeep Bromo', 'Penanjakan 1', 'Kawah Bromo', 'Bukit Teletubis/Pasir Berbisik', 'Jatim Park 1', 'Museum Angkut', 'Petik Apel'] },
                    { title: '🗺️ Paket 2 (Rp 1.700.000 / pax)', items: ['Jatim Park 2', 'Eco Green Park', 'Batu Love Park', 'Petik Apel', 'San Terra', 'Pusat Oleh-Oleh'] },
                    { title: '🗺️ Paket 3 (Rp 1.700.000 / pax)', items: ['Jeep Bromo', 'Penanjakan 1', 'Kawah Bromo', 'Pasir Berbisik', 'Gili Ketapang', 'Snorkeling', 'Banana Boat'] },
                ],
                includes: [
                    'Doorprize',
                    'Asuransi',
                    'P3K',
                    'Air Mineral Botol',
                    'Dokumentasi',
                    'Tour Guide',
                    'Tiket Masuk Lokawisata',
                    'Makan 3x',
                    'Banner Wisata',
                    'Big BUS 45 pax',
                ],
                excludes: [
                    '',
                ],
            },
            {
                name: 'Jadwal Pemberangkatan (Paket Open Trip)',
                price: 'Hubungi Admin',
                note: '',
                destinationsGroups: [
                    { title: '🗺️ Maret', items: ['05-07-08 Maret 2026', '11-14-15 Maret 2026', '19-21-22 Maret 2026', '26-28-29 Maret 2026'] },
                    { title: '🗺️ April', items: ['02-04-05 April 2026', '09-11-12 April 2026', '16-18-19 April 2026', '23-25-26 April 2026'] },
                    { title: '🗺️ Mei', items: ['30 April - 02-03 Mei 2026', '07-09-10 Mei 2026', '14-16-17 Mei 2026', '21-23-24 Mei 2026', '28-30-31 Mei 2026'] },
                    { title: '🗺️ Juni', items: ['04-06-07 Juni 2026', '11-13-14 Juni 2026', '18-20-21 Juni 2026', '18-20-21 Juni 2026', '25-27-28 Juni 2026'] },
                    { title: '🗺️ Juli', items: ['02-04-05 Juli 2026', '09-11-12 Juli 2026', '16-18-19 Juli 2026', '23-25-26 Juli 2026', '30 Juli 2026'] },
                    { title: '🗺️ Agustus', items: ['01-02 Agustus 2026', '06-08-09 Agustus 2026', '13-15-16 Agustus 2026', '20-22-23 Agsutus 2026', '27-29-30 Agustus 2026'] },
                    { title: '🗺️ September', items: ['03-05-06 September 2026', '10-12-13 September 2026', '17-19-20 September 2026', '24-26 September dan 17 Oktober 2026'] },
                    { title: '🗺️ Oktober', items: ['01-03-04 Oktober 2026', '08-10-11 Oktober 2026', '15-17-18 Oktober 2026', '22-24-25 Oktober 2026', '29-31 Oktober 2026'] },
                    { title: '🗺️ November', items: ['05-07-08 November 2026', '12-14-15 November 2026', '19-21-22 November 2026', '26-28-29 November 2026'] },
                    { title: '🗺️ Desember', items: ['03-05-06 Desember 2026', '10-12-13 Desember 2026', '18-19-20 Desember 2026', '24-26-27 Desember 2026'] },
                ],
                includes: [
                    'Transportasi dari titik kumpul (Purwokerto/Purbalingga)',
                    'Jeep 4WD lautan pasir (sharing)',
                    'Tiket masuk kawasan Bromo',
                    'Guide lokal berpengalaman',
                    'Air mineral',
                ],
                excludes: [
                    '',
                ],
            },
        ],
        desc: 'Gunung Bromo adalah ikon wisata Jawa Timur yang menawarkan panorama sunrise paling dramatis di Indonesia. Nikmati golden sunrise dari Penanjakan, melintasi Lautan Pasir dengan jeep 4WD, mendaki kawah aktif Bromo, dan berfoto di Bukit Teletubbies yang ikonik.\n\nSmartHoliday menawarkan Bromo One Day Trip (ODT) yang berangkat malam dan pulang siang hari, serta Open Trip untuk bergabung dengan peserta lain.',
        price: 'Hubungi Admin',
        schedules: [
            { date: 'Setiap Jumat & Sabtu', day: 'Weekend', available: true },
            { date: 'Hari Biasa (min. 4 pax)', day: 'Weekday', available: true },
        ],
        rundown: [
            { time: '12.00-13.00', activity: 'Persiapan Pemberangkatan', desc: '' },
            { time: '13.00-01.30', activity: 'Perjalanan Menuju Probolinggo (Sukapura) (Sekaligus Makan Malam di Solo', desc: '' },
            { time: '01.30-02.00', activity: 'Persiapan Jeep Bromo', desc: '' },
            { time: '02.00-04.30', activity: 'Perjalanan Menuju Penanjakan 1 (Sunrise Point)', desc: '' },
            { time: '04.30-11.00', activity: 'Rangkaian Kegiatan Wisata Jeep Bromo (Gunung Batok, Kawah Bromo, Pura, Pasir Berbisik, Bukit Teletubbies', desc: '' },
            { time: '11.00-12.00', activity: 'Perjalanan Menuju RM. Bromo Asri', desc: '' },
            { time: '12.00-13.00', activity: 'ISHOMA Makan Siang di RM. Bromo Asri', desc: '' },
            { time: '13.00-13.15', activity: 'Perjalanan Menuju Pusat Oleh-Oleh Probolinggo', desc: '' },
            { time: '13.15-14.00', activity: 'Berwisata Belanja di Pusat Oleh-Oleh Probolinggo', desc: '' },
            { time: '14.00-19.00', activity: 'Perjalanan Menuju Rumah Makan', desc: '' },
            { time: '19.00-20.00', activity: 'ISHOMA Makan Malam', desc: '' },
            { time: '20.00-00.00', activity: 'Perjalanan Pulang Menuju Purwokerto', desc: '' },
            { time: '00.00', activity: 'Sampai di Purwokerto', desc: '' },
        ]
    },
        {
        id: 'pulaupari',
        name: 'Pulau Pari',
        image: './aset/pulauparibg.jpg',
        shortDesc: 'Pulau Pari: Tempat di mana hiruk-pikuk kota kalah telak oleh suara desiran air laut.',
        subPackages: [
            // === EDIT DI SINI ===========================
            // name     = nama paket (tampil sebagai tab yang bisa diklik)
            // price    = harga (contoh: 'Rp 450.000/pax' atau 'Hubungi Admin')
            // note     = catatan kecil di bawah harga (boleh dikosongkan: '')
            // includes = daftar "Sudah Termasuk"
            // excludes = daftar "Belum Termasuk"
            // ======================================================
            {
                name: 'Paket Open Trip Pulau Pari 2D 1N',
                price: 'Rp 1.840.000 /pax',
                note: '',
                destinationsGroups: [
                    { title: '🗺️ Destinasi Wisata', items: ['Pantai Pasir Perawan', 'Pantai Bintang Laut', 'APL Dan Pulau Burung (SPOT Snorkeling)', 'Manggrove Forest (Optional)', 'Tanjung Baggak (SPOT Sunrise)'] },
                ],
                includes: [
                    'Tiket Kapal PP + Asuransi',
                    'Homestay AC (Sharing)',
                    'Welcome Drink',
                    'Makan 3X 2H1M',
                    'Kapal Snorkeling',
                    'Sepeda Santai',
                    'Alat Snorkeling',
                    'Dokumentasi Underwater',
                    'BBQ (Ikan Segar Dan Sosis',
                    'Retribusi Tiket Wisata',
                    'Local Guide',
                    'Air Mineral',
                ],
                excludes: [
                    '',
                ],
            },
            {
                name: 'Jadwal Keberangkatan',
                price: '',
                note: '',
                destinationsGroups: [
                    { title: '🗺️ Maret', items: ['07-08 Maret 2026', '14-15 Maret 2026', '21-22 Maret 2026', '28-29 Maret 2026'] },
                    { title: '🗺️ April', items: ['04-05 April 2026', '11-12 April 2026', '18-19 April 2026', '25-26 April 2026'] },
                    { title: '🗺️ Mei', items: ['02-03 Mei 2026', '09-10 Mei 2026', '16-17 Mei 2026', '23-24 Mei 2026', '30-31 Mei 2026'] },
                    { title: '🗺️ Juni', items: ['06-07 Juni 2026', '13-14 Juni 2026', '20-21 Juni 2026', '27-28 Juni 2026'] },
                    { title: '🗺️ Juli', items: ['04-05 Juli 2026', '11-12 Juli 2026', '18-19 Juli 2026', '25-26 Juli 2026'] },
                    { title: '🗺️ Agustus', items: ['01-02 Agustus 2026', '08-09 Agustus 2026', '15-16 Agustus 2026', '22-23 Agustus 2026', '29-30 Agustus 2026'] },
                    { title: '🗺️ September', items: ['05-06 September 2026', '12-13 September 2026', '19-20 September 2026', '26-27 September 2026'] },
                    { title: '🗺️ Oktober', items: ['03-04 Oktober 2026', '10-11 Oktober 2026', '17-18 Oktober 2026', '24-25 Oktober 2026', '31 Oktober dan 01 November 2026'] },
                    { title: '🗺️ November', items: ['07-08 November 2026', '14-15 November 2026', '21-22 November 2026', '28-29 November 2026'] },
                    { title: '🗺️ Desember', items: ['05-06 Desember 2026', '12-13 Desember 2026', '19-20 Desember 2026', '26-27 Desember 2026'] },
                ],
                includes: [
                    'BUS Pariwisata Terbaru',
                    'Tiket Masuk Wisata',
                    'Banner Foto',
                    'Tour Guide atau Pemandu',
                    'P3K Standar',
                    'Asuransi Wisata',
                    'Doorprize',
                    'Dokumentasi Wisata',
                    'Hotel Bintang 3',
                ],
                excludes: [
                    '',
                ],
            },
        ],
        desc: 'Cari destinasi wisata yang aman untuk anak-anak tapi tetap seru buat orang dewasa? Pulau Pari jawabannya! Dengan perairan yang tenang dan dangkal di Pantai Pasir Perawan, si kecil bisa bebas bermain pasir dan air. Nikmati momen kebersamaan dengan BBQ ikan segar di tepi pantai saat malam tiba. Paket lengkap, dekat, dan pastinya ramah di kantong',
        price: 'Hubungi Admin',
        schedules: [{ date: 'Setiap Hari', day: 'Fleksibel', available: true }],
        rundown: [
            { time: 'DAY 1 (06.00-06.30)', activity: 'Meeting Point Pelabuhan Kali Adem Muara Angke', desc: '' },
            { time: '06.30-07.00', activity: 'Mencari Tempat Yang Nyaman di Kapal', desc: '' },
            { time: '07.30-09.30', activity: 'Perjalanan Menuju Pulau Pari', desc: '' },
            { time: '09.30-12.00', activity: 'Check In Homestay, Bersepeda Hunting Foto di Pantai Pasir Perawan', desc: '' },
            { time: '12.00-13.00', activity: 'Kembali Ke Homstay, Makan Siang dan Persiapan Kegiatan Snorkeling', desc: '' },
            { time: '13.00-15.00', activity: 'Kegiatan Snorkeling, Perjalanan Dengan Kapal Tradisional Menuju Spot Snorkeling', desc: '' },
            { time: '15.00-17.00', activity: 'Kembali Ke Pulau Pari, Acara Bebas dan Santai di Pantai Pasir Perawan,(Bisa Explore Hutan Mangrove Menggunakan Sampan *Exclude Perahu Sampan Rp 15.000/orang', desc: '' },
            { time: '17.00-18.00', activity: 'Hunting Sunset di Pantai Pasir Perawan', desc: '' },
            { time: '18.00-20.00', activity: 'Kembali Ke Homestay, Mandi, dan Makan Malam', desc: '' },
            { time: '20.00-22.00', activity: 'Acara BBQ (Sudah Kami Siapkan)', desc: '' },
            { time: '22.00-05.00', activity: 'Acara Bebas dan Istirahat', desc: '' },
            { time: 'DAY 2 (05.00-06.30)', activity: 'Hunting Sunrise Tanjung Reggae (Tidak Wajib/Personal)', desc: '' },
            { time: '06.30-07.30', activity: 'Mandi, Sarapan Pagi', desc: '' },
            { time: '07.30-09.00', activity: 'Bersantai Ria di Pantai Bintang Laut', desc: '' },
            { time: '09.00-09.15', activity: 'Kembali Ke Homestay , Packing dan Check-Out Homestay', desc: '' },
            { time: '09.15-10.00', activity: 'Berkumpul di Dermaga Pulau Pari dan Mencari Tempat Yang Nyaman di Kapal', desc: '' },
            { time: '10.00-12.00', activity: 'Perjalanan Kembali Menuju Pelabuhan Kali Adem Muara Angke dan Trip Selesai', desc: '' },
        ]
    },
    {
        id: 'karimun-jawa',
        name: 'Karimun Jawa',
        image: './aset/karimunjawabg.jpg',
        shortDesc: 'Kepulauan tropis Jawa Tengah dengan snorkeling, diving, dan pantai pasir putih memukau.',
        subPackages: [
            // === EDIT DI SINI ===========================
            // name     = nama paket (tampil sebagai tab yang bisa diklik)
            // price    = harga (contoh: 'Rp 450.000/pax' atau 'Hubungi Admin')
            // note     = catatan kecil di bawah harga (boleh dikosongkan: '')
            // includes = daftar "Sudah Termasuk"
            // excludes = daftar "Belum Termasuk"
            // ======================================================
            {
                name: 'Paket Open Trip 2D 1N',
                price: 'Rp 1.950.000 /pax',
                note: '',
                destinationsGroups: [
                    { title: '🗺️ Destinasi', items: ['Pantai Boby', 'Pantai Tanjung Gelam', 'Snorkelling', 'Pengangkatan Hiu', 'Alun-Alun Karimun Jawa'] },
                ],
                includes: [
                    'Tiket Kapal Express Bahari PP',
                    'Makan Prasmanan 6x BBQ 1x Pas Ikan Bakar Di Pulau',
                    'Mobil Pelabuhan ke Penginapan',
                    'Mobil Penginapan ke Pelabuhan',
                    'Penginapan Sesuai Pilihan',
                    'Alat Snorkeling',
                    'Life Jacket / Pelampung',
                    'Kapal Buat Tour',
                    'Air Mineral Selamaa Wisata',
                    'Restribusi di Karimun Jawa',
                    'Roti Buat Makan Ikan',
                    'Guide Lokal Bersertifikat',
                    'Tour Leader Dari Karjaw Tour',
                    'Dokumentasi Foto Upwater',
                    'Biaya Sandar Kapal',
                    'Tiket Masuk Wisata',
                ],
                excludes: [
                    '',
                ],
            },
            {
                name: 'Jadwal Pemberangkatan',
                price: '',
                note: '',
                destinationsGroups: [
                    { title: '🗺️ Maret', items: ['07-08 Maret 2026', '14-15 Maret 2026', '21-22 Maret 2026', '28-29 Maret 2026'] },
                    { title: '🗺️ April', items: ['04-05 April 2026', '11-12 April 20266', '18-19 April 2026', '25-26 April'] },
                    { title: '🗺️ Mei', items: ['02-03 Mei 2026', '09-10 Mei 2026', '16-17 Mei 2026', '23-24 Mei 2026', '30-31 Mei 2026'] },
                    { title: '🗺️ Juni', items: ['06-07 Juni 2026', '13-14 Juni 2026', '20-21 Juni 2026', '27-28 Juni 2026'] },
                    { title: '🗺️ Juli', items: ['04-05 Juli 2026', '11-12 Juli 2026', '18-19 Juli 2026', '25-26 Juli 2026'] },
                    { title: '🗺️ Agustus', items: ['01-02 Agustus 2026', '08-09 Agustus 2026', '15-16 Agustus 2026', '22-23 Agustus 2026', '29-30 Agustus 2026'] },
                    { title: '🗺️ September', items: ['05-06 September 2026', '12-13 September 2026', '19-20 September 2026', '26-27 September 2026'] },
                    { title: '🗺️ Oktober', items: ['03-04 Oktober 2026', '10-11 Oktober 2026', '17-18 Oktober 2026', '24-25 Oktober 2026', '31 Oktober-1 November 2026'] },
                    { title: '🗺️ November', items: ['07-08 November 2026', '14-15 November 2026', '21-22 November 2026', '28-29 November 2026'] },
                    { title: '🗺️ Desember', items: ['05-06 Desember 2026', '12-13 Desember 2026', '19-20 Desember 2026', '26-27 Desember 2026'] },
                ],
                includes: [
                    'Transportasi Purwokerto – Jepara PP',
                    'Kapal penyeberangan ke Karimun Jawa',
                    'Penginapan 2 malam (sharing)',
                    'Island Hopping 4-5 pulau + snorkeling',
                    'Makan 4x (sesuai program)',
                    'Air Mineral selama perjalanan',
                    'Guide lokal berpengalaman',
                    'Dokumentasi foto perjalanan',
                ],
                excludes: [
                    '',
                ],
            },
        ],
        desc: 'Karimun Jawa adalah kepulauan cantik di Laut Jawa yang terletak di Kabupaten Jepara. Dengan 27 pulau berpasir putih, terumbu karang yang masih terjaga, dan air laut sebening kristal, Karimun Jawa menjadi surga snorkeling dan diving kelas dunia.\n\nSmartHoliday menawarkan paket 2D1N dan 3D2N Karimun Jawa, serta Open Trip untuk bergabung bersama peserta lain dengan harga lebih terjangkau.',
        price: 'Hubungi Admin',
        schedules: [
            { date: 'Jumat - Minggu (2D1N)', day: 'Weekend', available: true },
            { date: 'Kamis - Sabtu (3D2N)', day: 'Reguler', available: true },
        ],
        rundown: [
            { time: 'DAY 1 (10.00)', activity: 'Meet Point di Pelabuhan Jepara', desc:''},
            { time: '10.30', activity: 'Masuk Ke Kapal Express', desc:''},
            { time: '11.00', activity: 'Perjalanan Ke Karimun Jawa', desc:''},
            { time: '13.15', activity: 'Makan Siang di Penginapan', desc:''},
            { time: '13.30', activity: 'Persiapan Tour', desc:''},
            { time: '14.30', activity: 'Ke Pantai Boby', desc:''},
            { time: '15.30', activity: 'Ke Bukit Love', desc:''},
            { time: '17.00', activity: 'Ke Pantai Tanjung Gelam', desc:''},
            { time: '18.00', activity: 'Kembali Ke Penginapan', desc:''},
            { time: '19.00', activity: 'Makan Malam di Penginapan Dengan Menu Utama Ikan Bakar', desc:''},
            { time: '21.00', activity: 'Bisa Ke Alun-Alun Karimun Jawa Berjalan Kaki Bareng-Bareng', desc:''},
            { time: '22.00', activity: 'Kembali Kee Penginapan dan Istirahat', desc:''},
            { time: 'DAY 2 (06.30)', activity: 'Makan Pagi di Penginapan', desc:''},
            { time: '07.00', activity: 'Berwisata Ke Spot Snorkeling', desc:''},
            { time: '09.00', activity: 'Ke Penakaran Hiu', desc:''},
            { time: '10.00', activity: 'Kembali Ke Penginapan', desc:''},
            { time: '11.00', activity: 'Kapal Menuju Jepara', desc:''},
            { time: '13.00', activity: 'Kapal Tiba di Jepara dan Tour', desc:''},
        ]
    },
    {
        id: 'bali',
        name: 'Bali',
        image: './aset/balibg.jpg',
        shortDesc: 'Pulau Dewata dengan pantai eksotis, pura bersejarah, dan budaya unik yang memukau.',
        subPackages: [
            // === EDIT DI SINI ===========================
            // name     = nama paket (tampil sebagai tab yang bisa diklik)
            // price    = harga (contoh: 'Rp 450.000/pax' atau 'Hubungi Admin')
            // note     = catatan kecil di bawah harga (boleh dikosongkan: '')
            // includes = daftar "Sudah Termasuk"
            // excludes = daftar "Belum Termasuk"
            // ======================================================
            {
                name: 'Paket Open Trip Bali 3D 2N',
                price: 'Rp 2.500.000 /pax',
                note: 'Privat group | Min. 15 orang',
                destinationsGroups: [
                    { title: '🗺️ Destinasi Wisata', items: ['Tanah Lot', 'Desa Adat Panglipuran', 'Tanjung Benoa', 'Puja Mandala', 'Pantai Pandawa', 'Pantai Melasti', 'Dinner Jimbaran', 'Krishna', 'Joger', 'Bedugul'] },
                ],
                includes: [
                    'Doorprize',
                    'Asuransi',
                    'P3K',
                    'Air Mineral Botol',
                    'Dokumentasi',
                    'Tiket Kereta PP (Purwokerto - Ketapang)',
                    'Tour Guide',
                    'Tiket Masuk Lokawisata',
                    'Makan 11x',
                    'Banner WWisata',
                    'Hotel Bintang 3/Setaraf'
                ],
                excludes: [
                    '',
                ],
            },
            {
                name: 'Jadwal Pemberangkatan',
                price: 'Hubungi Admin',
                note: 'Gabung peserta lain | Jadwal tiap Jumat – Senin',
                destinationsGroups: [
                    { title: '🗺️ Paket 1 (Rp xxx.xxx)', items: ['Destinasi 1', 'Destinasi 2'] },
                    { title: '🗺️ Paket 2 (Rp xxx.xxx)', items: ['Destinasi 3', 'Destinasi 4'] },
                    { title: '🗺️ Paket 3 (Rp xxx.xxx)', items: ['Hotel Bintang 3', 'Kamar Twin Share'] },
                ],
                includes: [
                    'Tiket pesawat PP (dari Semarang/Jakarta)',
                    'Penginapan 2 malam (sharing kamar 2 orang)',
                    'Program tour: Tanah Lot, Ubud, Uluwatu, Kintamani',
                    'Transportasi shuttle antar peserta',
                    'Guide wisata berbahasa Indonesia',
                    'Air mineral selama tour',
                ],
                excludes: [
                    '',
                ],
            },
        ],
        desc: 'Bali adalah destinasi wisata kelas dunia yang menawarkan perpaduan sempurna antara keindahan alam, kekayaan budaya, dan kuliner lezat. Dari Tanah Lot yang ikonik, Ubud yang tenang, Kuta yang ramai, Uluwatu yang dramatis, hingga Seminyak yang chic.\n\nSmartHoliday menghadirkan Paket Bali 3D2N dan Open Trip Bali 3D2N untuk kenyamanan perjalanan Anda.',
        price: 'Hubungi Admin',
        schedules: [
            { date: 'Setiap Jumat', day: 'Mingguan', available: true },
            { date: 'Open Trip (gabung peserta)', day: 'Terjadwal', available: true },
        ],
        rundown: [
            { time: 'DAY 1 (06.00-06.45)', activity: 'Persiapan Pemberangkatan di Stasiun Purwokerto', desc: '' },
            { time: '06.45-21.20', activity: 'Perjalanan Menuju Stasiun Ketapang Banyuwangi (Via Logawa)', desc: '' },
            { time: '21.20-22.00', activity: 'Perjalanan Menuju Pelabuhan Ketapang', desc: '' },
            { time: '22.00-01.00', activity: 'Menyebrangi Selat Bali', desc: '' },
            { time: 'DAY 2 (01.00-05.00)', activity: 'Perjalanan Menuju Rumah Makan', desc: '' },
            { time: '05.00-06.00', activity: 'Sarapan Pagi', desc: '' },
            { time: '06.00-06.30', activity: 'Perjalanan Menuju Tanah Lot', desc: '' },
            { time: '06.30-08.30', activity: 'Wisata di Tanah Lot', desc: '' },
            { time: '08.30-11.00', activity: 'Perjalanan Menuju Desa Penglipuran', desc: '' },
            { time: '11.00-13.30', activity: 'Wisata di Desa Penglipuran (Sekaligus Makan Siang)', desc: '' },
            { time: '13.30-15.30', activity: 'Perjalanan Menuju Tanjung Benoa', desc: '' },
            { time: '15.30-18.00', activity: 'Wisata di Tanjung Benoa', desc: '' },
            { time: '18.00-19.00', activity: 'ISHOMA Makan Malam', desc: '' },
            { time: '19.00-20.00', activity: 'Perjalanan Menuju Hotel', desc: '' },
            { time: '20.00-20.30', activity: 'Check-In Hotel and Free Time', desc: '' },
            { time: 'DAY 3 (06.00-08.00)', activity: 'Sarapan Pagi (WITA)', desc: '' },
            { time: '08.00-08.30', activity: 'Perjalanan Menuju Puja Mandala', desc: '' },
            { time: '08.30-10.00', activity: 'Berwisata di Puja Mandala', desc: '' },
            { time: '10.00-10.30', activity: 'Perjalanan Menuju Pantai Pandawa', desc: '' },
            { time: '10.30-17.00', activity: 'Berwisata di Pantai Pandawa, Pantai Melasti Sekaligus Makan Siang', desc: '' },
            { time: '17.00-18.00', activity: 'Perjalanan Menuju Pantai Jimbaran', desc: '' },
            { time: '18.00-21.00', activity: 'Dinner Pantai Jimbaran', desc: '' },
            { time: '21.00-21.30', activity: 'Perjalanan Kembali Ke Hotel dann Free Time', desc: '' },
            { time: 'DAY 4 (06.00-07.30)', activity: 'Sarapan Pagi dan Check-Out Hotel', desc: '' },
            { time: '07.30-08..00', activity: 'Perjalanan Menuju Krishna', desc: '' },
            { time: '08.00-09.00', activity: 'Berwisata di Krishna', desc: '' },
            { time: '09.00-11.00', activity: 'Perjalanan Menuju Joger', desc: '' },
            { time: '11.00-12.00', activity: 'Wisata Belanja Joger', desc: '' },
            { time: '12.00-13.30', activity: 'Perjalanan Menuju Bedugul', desc: '' },
            { time: '13.30-17.00', activity: 'Berwisata di Bedugul', desc: '' },
            { time: '17.00-22.00', activity: 'Perjalanan Menuju Pelabuhan Gilimanuk (Sekaligus Makan Malam)', desc: '' },
            { time: '23.00-02.00', activity: 'Menyebrangi Selat Bali', desc: '' },
            { time: 'DAY 5 (02.00-02.30)', activity: 'Perjalanan Menuju Stasiun Ketapang Banyuwangi', desc: '' },
            { time: '02.30-06.15', activity: 'Persiapan Pulangdi Stasiun Ketapang Banyuwangi', desc: '' },
            { time: '06.15-20.20', activity: 'Perjalanan Menuju Stasiun Purwokerto (Via Logawa)', desc: '' },
            { time: '20.20', activity: 'Sampai Di Purwokerto', desc: '' },
        ]
    },
];

const internationalPackages = [
    {
        id: 'open-trip-3-negara',
        name: 'Open Trip 3 Negara Asia 7D 6N',
        image: './aset/3negarabg.jpg',
        shortDesc: 'Jelajah 3 negara Asia (Malaysia, Singapore, Thailand) dalam satu paket Open Trip terjadwal dengan harga terbaik.',
        subPackages: [
            // === EDIT DI SINI ===========================
            // name     = nama paket (tampil sebagai tab yang bisa diklik)
            // price    = harga (contoh: 'Rp 450.000/pax' atau 'Hubungi Admin')
            // note     = catatan kecil di bawah harga (boleh dikosongkan: '')
            // includes = daftar "Sudah Termasuk"
            // excludes = daftar "Belum Termasuk"
            // ======================================================
            {
                name: '7 DAY 6 NIGHT',
                price: 'Rp 7,5JT /pax',
                note: 'Jadwal terjadwal bulanan | Cek Jadwal Pemberangkatan Secara Berkala',
                destinationsGroups: [
                    { title: '🗺️ Start Jakarta', items: ['Rp 7.500.000 / pax'] },
                    { title: '🗺️ Start Jogjakarta', items: ['Rp 8.450.000 / pax'] },
                    { title: '🗺️ Start Semarang', items: ['Rp 7.799.000 / pax'] },
                    { title: '🗺️ Start Medan', items: ['Rp 6.699.000 / pax'] },
                    { title: '🗺️ Start Surabaya', items: ['Rp 7.650.000 / pax'] },
                ],
                includes: [
                    'BUS dan Pesawat',
                    'Guide Service',
                    'Makan Sesuai Program',
                    'Air Mineral Selama Tour',
                    'Hotel Berbintang',
                    'Dokumentasi',
                    'Tiket Masuk Wisata',
                    'Guide Lokal',
                    'Asuransi Tour',
                ],
                excludes: [
                    'Bagasi',
                    'Tipping Guide',
                ],
            },
            {
                name: 'Jadwal Pemberangkatan',
                price: 'Hubungi Admin',
                note: 'Jadwal terjadwal bulanan | Cek admin untuk tanggal',
                destinationsGroups: [
                    { title: '🗺️ Januari', items: ['7-3 Januari 2026', '8-14 Januari 2026', '14-20 Januari 2026', '15-21 Januari 2026', '21-27 Januari 2026', '22-28 Januari 2026', '28-03 Februari', '29-04 Januari 2026'] },
                    { title: '🗺️ Februari', items: ['04-19 Februari 2026', '05-11 Februari 2026', '11-17 Februari 2026 (Imlek)'] },
                    { title: '🗺️ Maret', items: ['18-24 Maret 2026', '20-26 Maret 2026'] },
                    { title: '🗺️ April', items: ['01-05 April 2026', '02-06 April 2026', '08-14 April 2026', '09-15 April 2026', '15-21 April 2026', '16-22 April 2026', '22-28 April 2026', '23-29 April 2026', '29-05 Mei 2026', '30-06 Mei 2026'] },
                    { title: '🗺️ Mei', items: ['06-12 Mei 2026', '07-13 Mei 2026', '13-19 Mei 2026', '14-20 Mei 2026', '20-26 Mei 2026', '21-27 Mei 2026', '27-02 Juni 2026', '28-03 Juni 2026'] },
                    { title: '🗺️ Juni', items: ['03-09 Juni 2026', '04-10 Juni 2026', '10-16 Juni 2026', '11-17 Juni 2026', '17-23 Juni 2026', '18-24 Juni 2026', '24-30 Juni 2026', '25-01 Juli 2026'] },
                    { title: '🗺️ Juli', items: ['01-07 Juli 2026', '02-08 Juli 2026', '08-14 Juli 2026', '09-15 Juli 2026', '15-21 Juli 2026', '16-22 Juli 2026', '22-28 Juli 2026', '23-29 Juli 2026', '29-04 Agustus 2026', '30-05 Agustus 2026'] },
                ],
                includes: [
                    'BUS dan Pesawat',
                    'Guide Service',
                    'Makan Sesuai Program',
                    'Air Mineral Selama Tour',
                    'Hotel Berbintang',
                    'Dokumentasi',
                    'Tiket Masuk Wisata',
                    'Guide Lokal',
                    'Asuransi Tour',
                ],
                excludes: [
                    'Visa (diurus mandiri atau dibantu +biaya)',
                ],
            },
        ],
        desc: 'Paket Open Trip 3 Negara SmartHoliday memberikan kesempatan untuk menjelajahi 3 negara Asia dalam satu perjalanan yang seru dan efisien. Bergabunglah bersama peserta lain dari berbagai kota untuk menghemat biaya tanpa mengurangi kualitas perjalanan.\n\nHubungi admin SmartHoliday untuk mengetahui jadwal keberangkatan dan harga terbaru Open Trip 3 Negara.',
        price: 'Hubungi Admin',
        schedules: [{ date: 'Terjadwal Bulanan', day: 'Cek Admin', available: true }],
        rundown: [
            { time: 'Hari 1-2', activity: 'Negara 1 – Bangkok/Vietnam', desc: 'City tour, kuliner, dan wisata budaya lokal.' },
            { time: 'Hari 3-4', activity: 'Negara 2 – Pattaya/Kamboja', desc: 'Wisata pantai, temple, dan aktivitas lokal.' },
            { time: 'Hari 5-6', activity: 'Negara 3 – Singapore/Malaysia', desc: 'Gardens by the Bay, Marina Bay Sands, shopping.' },
            { time: 'Hari 7', activity: 'Pulang ke Indonesia', desc: 'Penerbangan kembali.' },
        ]
    },
    {
        id: 'vietnam',
        name: 'Vietnam Tour Package',
        image: './aset/vietnambg.jpg',
        shortDesc: 'Jelajah Ha Long Bay, Hanoi, Ho Chi Minh City, dan kuliner khas Vietnam yang lezat.',
        subPackages: [
            // === EDIT DI SINI ===========================
            // name     = nama paket (tampil sebagai tab yang bisa diklik)
            // price    = harga (contoh: 'Rp 450.000/pax' atau 'Hubungi Admin')
            // note     = catatan kecil di bawah harga (boleh dikosongkan: '')
            // includes = daftar "Sudah Termasuk"
            // excludes = daftar "Belum Termasuk"
            // ======================================================
            {
                name: 'Vietnam Tour Package',
                price: 'Rp 11,8JT /pax',
                note: '5 hari 4 malam | Hanoi + Ha Long Bay + Ho Chi Minh',
                destinationsGroups: [
                    { title: '🗺️ Start Jakarta', items: ['Rp 11,8JT /pax (Low Season)'] },
                ],
                includes: [
                    'BUS dan Pesawat',
                    'Guide Service',
                    'Makan Sesuai Program',
                    'Air Mineral Selama Tour',
                    'Hotel Berbintang',
                    'Dokumentasi',
                    'Tiket Masuk Wisata',
                    'Guide Lokal',
                    'Asuransi Tour',
                ],
                excludes: [
                    'Visa Vietnam (dibantu pengurusan)',
                ],
            },
        ],
        desc: 'Vietnam adalah destinasi Asia Tenggara yang semakin populer dengan kekayaan budaya, sejarah, dan kuliner yang unik. Ha Long Bay yang menakjubkan, Old Town Hoi An yang cantik, Ha Noi yang kental budaya, hingga Ho Chi Minh City yang dinamis.\n\nSmartHoliday menghadirkan paket Vietnam yang lengkap dengan guide berbahasa Indonesia, akomodasi nyaman, dan itinerary yang sudah terbukti memuaskan.',
        price: 'Hubungi Admin',
        schedules: [{ date: 'Terjadwal Bulanan', day: 'Reguler', available: true }],
        rundown: [
            { time: 'Hari 1', activity: 'Tiba di Hanoi', desc: 'Check-in hotel, city tour Hanoi sore hari.' },
            { time: 'Hari 2', activity: 'Ha Long Bay', desc: 'Cruise Ha Long Bay, goa-goa spektakuler, kayaking.' },
        ]
    },
    {
        id: 'bangkok',
        name: 'Bangkok Tour Package',
        image: './aset/bangkokbg.jpg',
        shortDesc: 'Ibukota Thailand dengan Grand Palace, temple megah, dan street food yang menggugah selera.',
        subPackages: [
            // === EDIT DI SINI ===========================
            // name     = nama paket (tampil sebagai tab yang bisa diklik)
            // price    = harga (contoh: 'Rp 450.000/pax' atau 'Hubungi Admin')
            // note     = catatan kecil di bawah harga (boleh dikosongkan: '')
            // includes = daftar "Sudah Termasuk"
            // excludes = daftar "Belum Termasuk"
            // ======================================================
            {
                name: 'Land Only Bangkok Pattaya 4D 3N',
                price: 'Rp 2,8JT /pax',
                note: '4 hari 3 malam | Bangkok City Tour lengkap',
                destinationsGroups: [
                    { title: '🗺️ Paket Land Only Bangkok Pattaya 4D3N', items: ['Rp 2,8JT /pax (Low Season)'] },
                ],
                includes: [
                    'BUS dan Pesawat',
                    'Guide Service',
                    'Makan Sesuai Program',
                    'Air Mineral Selama Tour',
                    'Hotel Berbintang',
                    'Dokumentasi',
                    'Tiket Masuk Wisata',
                    'Guide Lokal',
                    'Asuransi Tour',
                ],
                excludes: [
                    'Visa (bebas visa untuk WNI)',
                ],
            },
        ],
        desc: 'Bangkok adalah kota yang tak pernah tidur dengan segala daya tariknya: Grand Palace dan Wat Phra Kaew yang megah, Wat Arun yang ikonik di tepi Sungai Chao Phraya, shopping di MBK dan Siam Paragon, dan street food terlezat di Asia.\n\nSmartHoliday menyediakan paket Bangkok yang komprehensif dan dapat dikombinasikan dengan Pattaya atau destinasi lain di Thailand.',
        price: 'Hubungi Admin',
        schedules: [{ date: 'Terjadwal Bulanan', day: 'Reguler', available: true }],
        rundown: [
            { time: 'Hari 1', activity: 'Tiba di Bangkok', desc: 'Check-in hotel, menikmati Chatuchak Night Market.' },
        ]
    },
    {
        id: 'hainan',
        name: 'Hainan China Tour Package 5D 3N',
        image: './aset/hainanbg.jpg',
        shortDesc: 'Hawaii-nya China dengan pantai tropis, spa, dan wisata resort kelas dunia.',
        subPackages: [
            // === EDIT DI SINI ===========================
            // name     = nama paket (tampil sebagai tab yang bisa diklik)
            // price    = harga (contoh: 'Rp 450.000/pax' atau 'Hubungi Admin')
            // note     = catatan kecil di bawah harga (boleh dikosongkan: '')
            // includes = daftar "Sudah Termasuk"
            // excludes = daftar "Belum Termasuk"
            // ======================================================
            {
                name: 'Hainan China Tour Package 5D3N',
                price: 'Rp 5,7JT /pax',
                note: '5 hari 3 malam | Sanya – Haikou',
                destinationsGroups: [
                    { title: '🗺️ Paket Hainan China Tour Package 5D3N', items: ['Rp 5,7JT /pax (Low Season)'] },
                ],
                includes: [
                    'BUS dan Pesawat',
                    'Guide Service',
                    'Makan Sesuai Program',
                    'Air Mineral Selama Tour',
                    'Hotel Berbintang',
                    'Dokumentasi',
                    'Tiket Masuk Wisata',
                    'Guide Lokal',
                    'Asuransi Tour',
                ],
                excludes: [
                    'Visa China (dibantu pengurusan)',
                ],
            },
        ],
        desc: 'Hainan adalah pulau tropis di selatan China yang dijuluki "Hawaii of China" dengan pantai-pantai memukau, resort mewah kelas dunia, dan iklim tropis yang nyaman sepanjang tahun. Sanya, kota wisata utama di Hainan, menawarkan Yalong Bay yang indah, Tianya Haijiao yang romantis, dan Nanshan Buddhist Center yang megah.\n\nSmartHoliday menyediakan paket Hainan yang lengkap termasuk visa, tiket, dan akomodasi pilihan.',
        price: 'Hubungi Admin',
        schedules: [{ date: 'Terjadwal Bulanan', day: 'Reguler', available: true }],
        rundown: [
            { time: 'Hari 1', activity: 'Tiba di Haikou', desc: 'Check-in hotel, jelajah kota Haikou.' },
        ]
    },
    {
        id: 'korea',
        name: '5 Day Amazing Korea Seoul Nami Island',
        image: './aset/koreabg.jpg',
        shortDesc: 'Negeri K-Pop dan K-Drama dengan Gyeongbokgung, Nami Island, dan kuliner autentik.',
        subPackages: [
            // === EDIT DI SINI ===========================
            // name     = nama paket (tampil sebagai tab yang bisa diklik)
            // price    = harga (contoh: 'Rp 450.000/pax' atau 'Hubungi Admin')
            // note     = catatan kecil di bawah harga (boleh dikosongkan: '')
            // includes = daftar "Sudah Termasuk"
            // excludes = daftar "Belum Termasuk"
            // ======================================================
            {
                name: '5D3N Korea Seoul Nami Island',
                price: 'Rp 11,3JT /pax',
                note: '5 hari 3 malam | Seoul – Nami Island – Everland',
                destinationsGroups: [
                    { title: '🗺️ Paket 5D3N Korea Seoul Nami Island', items: ['Rp 11,3JT /pax (Low Season)'] },
                ],
                includes: [
                    'BUS dan Pesawat',
                    'Guide Service',
                    'Makan Sesuai Program',
                    'Air Mineral Selama Tour',
                    'Hotel Berbintang',
                    'Dokumentasi',
                    'Tiket Masuk Wisata',
                    'Guide Lokal',
                    'Asuransi Tour',
                ],
                excludes: [
                    'Visa Korea (dibantu pengurusan)',
                ],
            },
        ],
        desc: 'Korea Selatan adalah destinasi impian penggemar budaya Korea dengan K-Pop, K-Drama, dan K-Food. Jelajahi Gyeongbokgung Palace yang megah, romantisnya Nami Island, keindahan musim semi di Everland, dan hiruk-pikuk belanja di Myeongdong dan Dongdaemun.\n\nSmartHoliday menghadirkan paket Korea lengkap dengan visa, tiket, akomodasi, dan guide berbahasa Indonesia.',
        price: 'Hubungi Admin',
        schedules: [{ date: 'Terjadwal Bulanan', day: 'Reguler', available: true }],
        rundown: [
            { time: 'Hari 1', activity: 'Tiba di Seoul', desc: 'Check-in di Myeongdong, malam bebas.' },
        ]
    },
    {
        id: 'japan',
        name: 'Tokyo Japan Tour Package',
        image: './aset/japanbg.jpg',
        shortDesc: 'Negeri sakura dengan Tokyo, Kyoto, Osaka, Gunung Fuji, dan kuliner autentik.',
        subPackages: [
            // === EDIT DI SINI ===========================
            // name     = nama paket (tampil sebagai tab yang bisa diklik)
            // price    = harga (contoh: 'Rp 450.000/pax' atau 'Hubungi Admin')
            // note     = catatan kecil di bawah harga (boleh dikosongkan: '')
            // includes = daftar "Sudah Termasuk"
            // excludes = daftar "Belum Termasuk"
            // ======================================================
            {
                name: 'Tokyo Disneyland',
                price: 'Rp 21,5JT /pax',
                note: '7 hari 6 malam | Tokyo – Mountain Fuji – Takayama Old Town – Shibuya',
                destinationsGroups: [
                    { title: '🗺️ Paket Tokyo Disneyland 7D6N', items: ['Rp 21,5JT /pax (Low Season)'] },
                ],
                includes: [
                    'BUS dan Pesawat',
                    'Guide Service',
                    'Makan Sesuai Program',
                    'Air Mineral Selama Tour',
                    'Hotel Berbintang',
                    'Dokumentasi',
                    'Tiket Masuk Wisata',
                    'Guide Lokal',
                    'Asuransi Tour',
                ],
                excludes: [
                    'Visa Jepang (dibantu pengurusan)',
                ],
            },
        ],
        desc: 'Jepang adalah salah satu destinasi impian terpopuler di dunia yang memadukan tradisi kuno dengan modernitas mutakhir. Tokyo yang dinamis, Kyoto yang tenang dan sarat sejarah, Osaka yang terkenal dengan kuliner, dan panorama Gunung Fuji yang ikonik.\n\nSmartHoliday menghadirkan paket Jepang yang telah dirancang matang: visa, tiket, hotel strategis, dan guide berbahasa Indonesia yang berpengalaman.',
        price: 'Hubungi Admin',
        schedules: [{ date: 'Terjadwal Bulanan', day: 'Reguler', available: true }],
        rundown: [
            { time: 'Hari 1', activity: 'Tiba di Tokyo', desc: 'Check-in hotel, malam di Shinjuku.' },
        ]
    },
    {
        id: 'sydney-melbourne',
        name: 'Sydney Melbourne Tour Package',
        image: './aset/sydneybg.jpg',
        shortDesc: 'Nikmati pesona Australia yang iconic & classy!',
        subPackages: [
            // === EDIT DI SINI ===========================
            // name     = nama paket (tampil sebagai tab yang bisa diklik)
            // price    = harga (contoh: 'Rp 450.000/pax' atau 'Hubungi Admin')
            // note     = catatan kecil di bawah harga (boleh dikosongkan: '')
            // includes = daftar "Sudah Termasuk"
            // excludes = daftar "Belum Termasuk"
            // ======================================================
            {
                name: 'Sydney Melbourne Tour Package 7D6N',
                price: 'Rp 25,5JT /pax',
                note: '7 hari 6 malam | Sydney Opera House – Bondi Beach – Royal Botanial Garden – Shibuya',
                destinationsGroups: [
                    { title: '🗺️ Paket Sydney Melbourne 7D6N', items: ['Rp 25,5JT /pax (Low Season)'] },
                ],
                includes: [
                    'BUS dan Pesawat',
                    'Guide Service',
                    'Makan Sesuai Program',
                    'Air Mineral Selama Tour',
                    'Hotel Berbintang',
                    'Dokumentasi',
                    'Tiket Masuk Wisata',
                    'Guide Lokal',
                    'Asuransi Tour',
                ],
                excludes: [
                    'Visa sydney (dibantu pengurusan)',
                ],
            },
        ],
        desc: 'Sydney adalah salah satu destinasi impian terpopuler di dunia yang memadukan pesona kota metropolitan yang dinamis dengan keindahan alam pesisir yang memukau. Kemegahan Sydney Opera House yang ikonik, kawasan The Rocks yang kaya akan sejarah, Darling Harbour yang semarak dengan kulinernya, dan keindahan panorama Pantai Bondi yang mendunia.\n\nSmartHoliday menghadirkan paket Sydney Melbourne yang telah dirancang matang: visa, tiket, hotel strategis, dan guide berbahasa Indonesia yang berpengalaman.',
        price: 'Hubungi Admin',
        schedules: [{ date: 'Terjadwal Bulanan', day: 'Reguler', available: true }],
        rundown: [
            { time: 'Hari 1', activity: 'Tiba di Tokyo', desc: 'Check-in hotel, malam di Shinjuku.' },
        ]
    },
    {
        id: 'shangai-china',
        name: 'Shangai China Tour Package',
        image: './aset/shangaibg.jpg',
        shortDesc: 'Jelajahi Zhujiajiao Water Town, Jinji Lake, TV Tower hingga serunya Shangai Disneyland',
        subPackages: [
            // === EDIT DI SINI ===========================
            // name     = nama paket (tampil sebagai tab yang bisa diklik)
            // price    = harga (contoh: 'Rp 450.000/pax' atau 'Hubungi Admin')
            // note     = catatan kecil di bawah harga (boleh dikosongkan: '')
            // includes = daftar "Sudah Termasuk"
            // excludes = daftar "Belum Termasuk"
            // ======================================================
            {
                name: 'Shangai China Tour Package 8D7N',
                price: 'Rp 20,5JT /pax',
                note: '8 hari 7 malam | Zhujiajiao – Jinji Lake – Shenxianju – Tv Tower – Disney Land',
                destinationsGroups: [
                    { title: '🗺️ Paket Tour Shangai China (Special Lebaran 2026)', items: ['Rp 20,5JT /pax (Low Season)'] },
                ],
                includes: [
                    'BUS dan Pesawat',
                    'Guide Service',
                    'Makan Sesuai Program',
                    'Air Mineral Selama Tour',
                    'Hotel Berbintang',
                    'Dokumentasi',
                    'Tiket Masuk Wisata',
                    'Guide Lokal',
                    'Asuransi Tour',
                ],
                excludes: [
                    'Visa shangai (dibantu pengurusan)',
                ],
            },
        ],
        desc: 'Shanghai adalah salah satu destinasi impian terpopuler di dunia yang memadukan warisan budaya klasik Tiongkok dengan kemegahan metropolitan yang futuristik. Kawasan Nanjing Road yang dinamis, Yu Garden yang tenang dan sarat akan sejarah kuno, Xintiandi yang terkenal dengan kulinernya, serta panorama The Bund berlatar deretan gedung pencakar langit yang ikonik.\n\nSmartHoliday menghadirkan paket Shangai China yang telah dirancang matang: visa, tiket, hotel strategis, dan guide berbahasa Indonesia yang berpengalaman.',
        price: 'Hubungi Admin',
        schedules: [{ date: 'Terjadwal Bulanan', day: 'Reguler', available: true }],
        rundown: [
            { time: 'Hari 1', activity: 'Tiba di Tokyo', desc: 'Check-in hotel, malam di Shinjuku.' },
        ]
    },
    {
        id: 'vietnam-Sa Pa',
        name: 'Vietnam Sa Pa Tour Package',
        image: './aset/sapabg.jpg',
        shortDesc: 'Explore indahnya Sa Pa, naik ke puncak Fansipan Mountain (The Roof of Indochina), nongkrong estetik di Cha Phe Linh Cafe, dan BONUS pengalaman seru Scenic Train menuju Fansipan ',
        subPackages: [
            // === EDIT DI SINI ===========================
            // name     = nama paket (tampil sebagai tab yang bisa diklik)
            // price    = harga (contoh: 'Rp 450.000/pax' atau 'Hubungi Admin')
            // note     = catatan kecil di bawah harga (boleh dikosongkan: '')
            // includes = daftar "Sudah Termasuk"
            // excludes = daftar "Belum Termasuk"
            // ======================================================
            {
                name: 'Vietnam Sa Pa Tour Package 6D5N',
                price: 'Rp 18,5JT /pax',
                note: '8 hari 7 malam | Vietnam Sa Pa – Fan Si Fan Mountain – Cha Phe Lnh Cafe',
                destinationsGroups: [
                    { title: '🗺️ Paket Tour Vietnam Sa Pa 6D5N', items: ['Rp 18,5JT /pax (Low Season)'] },
                ],
                includes: [
                    'BUS dan Pesawat',
                    'Guide Service',
                    'Makan Sesuai Program',
                    'Air Mineral Selama Tour',
                    'Hotel Berbintang',
                    'Dokumentasi',
                    'Tiket Masuk Wisata',
                    'Guide Lokal',
                    'Asuransi Tour',
                ],
                excludes: [
                    'Visa vietnam (dibantu pengurusan)',
                ],
            },
        ],
        desc: 'Vietnam adalah salah satu destinasi impian terpopuler di dunia yang memadukan warisan budaya kuno dengan pesona alam yang menakjubkan. Ho Chi Minh City yang dinamis, Hoi An yang tenang dan sarat sejarah, Hanoi yang terkenal dengan kelezatan kulinernya, serta panorama terasering Sa Pa yang ikonik.\n\nSmartHoliday menghadirkan paket Shangai China yang telah dirancang matang: visa, tiket, hotel strategis, dan guide berbahasa Indonesia yang berpengalaman.',
        price: 'Hubungi Admin',
        schedules: [{ date: 'Terjadwal Bulanan', day: 'Reguler', available: true }],
        rundown: [
            { time: 'Hari 1', activity: 'Tiba di Tokyo', desc: 'Check-in hotel, malam di Shinjuku.' },
        ]
    },
];

// ====================================================
// GENERATE LISTING PAGES (domestic.html & international.html)
// ====================================================
function generateListingPage(type, packages) {
    const isIntl = type === 'international';
    const title = isIntl ? 'Paket Wisata Internasional' : 'Paket Wisata Domestik';
    const subtitle = isIntl
        ? 'Wujudkan impian keliling dunia bersama SmartTour. Paket lengkap, harga terjangkau.'
        : 'Jelajahi keindahan nusantara dari Sabang sampai Merauke bersama SmartTour.';
    const badgeColor = isIntl ? '#3b82f6' : '#f29f05';
    const badgeLabel = isIntl ? '✈️ Internasional' : '🇮🇩 Domestik';
    const filename = isIntl ? 'international.html' : 'domestic.html';

    const cards = packages.map((pkg, i) => `
        <a href="/${pkg.id}.html" class="card destination-card zoom-in delay-${i % 4}" style="position:relative;">
            <img src="${pkg.image || '/foto-ini.jpg'}" alt="${pkg.name}" style="width:100%; height:260px; object-fit:contain; background:#f4f9ff; border-radius:16px 16px 0 0;">
            <div style="position:absolute;top:16px;left:16px;background:${badgeColor};color:#fff;padding:5px 14px;border-radius:50px;font-size:0.8rem;font-weight:700;">${badgeLabel}</div>
            <div class="card-content">
                <h3>${pkg.name}</h3>
                <p>${pkg.shortDesc}</p>
                <p style="margin-top:10px;color:${badgeColor};font-weight:700;font-size:1rem;">Mulai dari ${pkg.price}</p>
                <span style="display:inline-block;margin-top:10px;color:${badgeColor};font-weight:700;">Lihat Detail →</span>
            </div>
        </a>`).join('');

    const body = `
    <section class="section">
        <div class="container">
            <div class="section-header text-center fade-in-up">
                <h2 class="section-title">${title}</h2>
                <p>${subtitle}</p>
            </div>
            <div class="grid-cards" style="grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:30px;">
                ${cards}
            </div>
        </div>
    </section>`;

    const html = baseHtml(title, title, subtitle, '/', 'Home', body);
    fs.writeFileSync(filename, html, 'utf8');
    console.log(`✅ Generated ${filename}`);
}

// ====================================================
// GENERATE INDIVIDUAL PACKAGE DETAIL PAGES
// ====================================================
function generatePackagePages(packages, listingFile, listingLabel) {
    packages.forEach(pkg => {
        const descParagraphs = pkg.desc.split('\n\n').map(p => `<p style="margin-bottom:16px;line-height:1.9;color:#555;">${p}</p>`).join('');
        const body = `
        <!-- Description Section -->
        <section class="section" style="padding-bottom:0; padding-top: 60px;">
            <div class="container">
                <div class="overview-grid" style="align-items:start;gap:50px;">
                    <div class="overview-text slide-in-left">
                        <h2 class="section-title" style="text-align:left;">${pkg.name}</h2>
                        <div style="margin-top:28px;font-size:1.05rem;line-height:1.9;color:#555;">
                            ${descParagraphs}
                        </div>
                    </div>
                    <div class="overview-images slide-in-right">
                        <img src="${pkg.image || './foto-ini.jpg'}" alt="${pkg.name}" class="img-main" >
                    </div>
                </div>
            </div>
        </section>

        ${getRundownHtml(pkg.rundown)}
        ${getPricingHtml(pkg.price, pkg.subPackages, pkg.name)}

        <!-- WhatsApp CTA after pricing -->
        <section class="section" style="padding-top:0;padding-bottom:60px;">
            <div class="container" style="text-align:center;">
                <a href="https://wa.me/6281252909674" class="btn-primary" style="display:inline-flex;align-items:center;gap:10px;font-size:1.1rem;padding:16px 40px;">
                    💬 Tanya &amp; Pesan via WhatsApp
                </a>
                <p style="margin-top:14px;color:#888;font-size:0.9rem;">Respon cepat · Konsultasi GRATIS · Booking mudah</p>
            </div>
        </section>
        `;


        const html = baseHtml(pkg.name, `Paket Tour ${pkg.name}`, pkg.shortDesc, `/${listingFile}`, listingLabel, body);
        fs.writeFileSync(`${pkg.id}.html`, html, 'utf8');
        console.log(`  ↳ Generated ${pkg.id}.html`);
    });
}

// ====================================================
// RUN GENERATOR
// ====================================================
console.log('\n🚀 Generating pages...\n');

generateListingPage('domestic', domesticPackages);
generatePackagePages(domesticPackages, 'domestic.html', 'Paket Domestik');

console.log('');
generateListingPage('international', internationalPackages);
generatePackagePages(internationalPackages, 'international.html', 'Paket Internasional');

// ====================================================
// GENERATE TENTANG KAMI PAGE
// ====================================================
const tentangKamiContent = `
<section class="section" style="padding-top:60px; padding-bottom:60px;">
    <div class="container">
        <div class="about-card glassmorphism" style="padding:40px; border-radius:12px; max-width:800px; margin:0 auto; background:#fff; border:1px solid #eee; box-shadow:0 10px 30px rgba(0,0,0,0.05);">
            <h2 style="text-align:center; color:var(--primary); margin-bottom:24px;">Tentang Smart Holiday</h2>
            <p style="font-size:1.1rem; line-height:1.8; color:#444; margin-bottom:20px; text-align:justify;">
                Kami <strong>SMART HOLIDAY</strong> sebuah Perusahaan Biro Jasa Perjalanan Wisata (Tour & Travel) dengan pengalaman lebih dari 16 tahun, yang bernaung di bawah <strong>CV SMART 99</strong>. Adapun produk jasa kami, di antaranya:
            </p>
            <ol style="font-size:1.05rem; line-height:1.8; color:#555; margin-left:20px; margin-bottom:24px; display:flex; flex-direction:column; gap:8px;">
                <li>Wisata dalam dan Luar negeri</li>
                <li>Study Visit Luar Negeri</li>
                <li>Family Gathering</li>
                <li>Event Organizer</li>
                <li>Ticketing (Pesawat, Kereta api, Kapal laut)</li>
            </ol>
            <div style="background:#f4f9ff; padding:20px; border-radius:8px; border-left:4px solid var(--primary); margin-bottom:24px;">
                <p style="font-weight:600; color:var(--primary); margin:0;">
                    DAN KAMI TERGABUNG DI DALAM ORGANISASI RESMI: <br>
                    <span style="font-size:1.2rem; color:#ff9800;">ASITA, ASSPI, IPI, HPI</span>
                </p>
            </div>
            <p style="font-weight:600; text-align:center; color:#333; margin-bottom:16px;">
                DENGAN INI KAMI LAMPIRKAN LEGALITAS KAMI SEBAGAI BERIKUT:
            </p>
            <div style="text-align:center; padding:30px; border:2px dashed #ddd; border-radius:8px; color:#888;">
                <em>[ Area untuk melampirkan foto/dokumen legalitas ]</em>
            </div>
        </div>
    </div>
</section>
`;

const htmlTentangKami = baseHtml('Tentang Kami', 'Tentang Perusahaan', 'Mengenal lebih dekat pengalaman dan kredibilitas kami', '/', 'Home', tentangKamiContent);
fs.writeFileSync('tentang-kami.html', htmlTentangKami, 'utf8');
console.log('✅ Generated tentang-kami.html');

console.log('\n✅ All pages generated successfully!\n');
