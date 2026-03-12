/**
 * Migration script: Convert all subPackages from string[] to object[]
 * Each object now has: name, price, note, includes, excludes
 * Run: node migrate-all-packages.cjs
 */

const fs = require('fs');

// ============================================================
// TEMPLATE HELPER: sub-paket standar domestik (5 tipe)
// ============================================================
function domestikStandard(destinasi, kota) {
    return [
        {
            name: 'Paket Promo',
            price: 'Hubungi Admin',
            note: `Harga spesial untuk rombongan | Destinasi: ${kota}`,
            includes: [
                `Transportasi ber-AC Purwokerto – ${kota} PP`,
                'Tiket masuk objek wisata (sesuai program)',
                'Guide lokal berpengalaman',
                'Air mineral selama perjalanan',
                'Penjemputan dari titik kumpul Purwokerto',
            ],
            excludes: [
                'Makan pribadi (kecuali disebutkan)',
                'Wahana tambahan berbayar',
                'Tips guide (sukarela)',
                'Penginapan (paket day trip)',
            ],
        },
        {
            name: 'Paket 15 Pax',
            price: 'Hubungi Admin',
            note: `Minimal 15 orang | Cocok untuk grup sekolah / kantor`,
            includes: [
                `Bus pariwisata ber-AC Purwokerto – ${kota} PP`,
                'Tiket masuk objek wisata (sesuai program)',
                'Guide lokal berpengalaman',
                'Air mineral selama perjalanan',
                'Koordinator rombongan',
                'Penjemputan dari titik kumpul Purwokerto',
            ],
            excludes: [
                'Makan pribadi (kecuali paket all-inclusive)',
                'Wahana tambahan berbayar',
                'Tips guide (sukarela)',
            ],
        },
        {
            name: 'Paket Berlima',
            price: 'Hubungi Admin',
            note: `Untuk 5 orang | Kendaraan privat nyaman`,
            includes: [
                `Minibus/Hiace privat ber-AC Purwokerto – ${kota} PP`,
                'Tiket masuk objek wisata (sesuai program)',
                'Guide lokal berpengalaman',
                'Air mineral selama perjalanan',
                'Penjemputan dari alamat / titik kumpul',
            ],
            excludes: [
                'Makan pribadi (kecuali disebutkan)',
                'Wahana tambahan berbayar',
                'Tips guide (sukarela)',
            ],
        },
        {
            name: 'Outbond',
            price: 'Hubungi Admin',
            note: `Program outbond seru untuk tim / komunitas`,
            includes: [
                `Transportasi ber-AC Purwokerto – ${kota} PP`,
                'Fasilitator outbond profesional',
                'Peralatan outbond lengkap',
                'Snack & air mineral',
                'Tiket masuk lokasi outbond',
                'Dokumentasi foto kegiatan',
            ],
            excludes: [
                'Makan siang (tersedia tambahan)',
                'Penginapan (kecuali paket inap)',
                'Perlengkapan pribadi',
            ],
        },
        {
            name: 'Family Gathering',
            price: 'Hubungi Admin',
            note: `Paket lengkap untuk acara keluarga besar`,
            includes: [
                `Transportasi ber-AC Purwokerto – ${kota} PP`,
                'Fasilitator & MC acara',
                'Games & hiburan keluarga',
                'Dokumentasi foto & video',
                'Air mineral selama acara',
                'Tiket masuk objek wisata',
            ],
            excludes: [
                'Makan bersama (tersedia paket catering)',
                'Souvenir / kenang-kenangan',
                'Dekorasi khusus (tersedia tambahan)',
            ],
        },
    ];
}

// ============================================================
// DEFINISI SUBPACKAGES BARU UNTUK SEMUA PAKET
// ============================================================
const ALL_NEW_SUBPACKAGES = {

    // ---------- DOMESTIK ----------

    'yogyakarta': domestikStandard('Yogyakarta', 'Yogyakarta'),
    'semarang': domestikStandard('Semarang', 'Semarang'),
    'bandung': domestikStandard('Bandung', 'Bandung'),
    'dieng': domestikStandard('Dieng', 'Dieng'),
    'pangandaran': domestikStandard('Pangandaran', 'Pangandaran'),
    'jakarta': domestikStandard('Jakarta', 'Jakarta'),
    'solo': domestikStandard('Solo', 'Solo'),
    'pacitan': domestikStandard('Pacitan', 'Pacitan'),

    'banyumas': [
        {
            name: 'Paket Inap',
            price: 'Hubungi Admin',
            note: 'Menginap 1 malam di sekitar Baturraden / Banyumas',
            includes: [
                'Transportasi lokal ber-AC',
                'Penginapan 1 malam (sharing)',
                'Tiket masuk objek wisata lokal',
                'Guide lokal berpengalaman',
                'Air mineral selama perjalanan',
            ],
            excludes: [
                'Makan pribadi (kecuali disebutkan)',
                'Wahana tambahan berbayar',
                'Tips guide (sukarela)',
            ],
        },
        {
            name: 'Paket Non-Inap',
            price: 'Hubungi Admin',
            note: 'Day trip – berangkat pagi, pulang sore/malam',
            includes: [
                'Transportasi lokal ber-AC',
                'Tiket masuk objek wisata lokal',
                'Guide lokal berpengalaman',
                'Air mineral selama perjalanan',
                'Penjemputan dari titik kumpul',
            ],
            excludes: [
                'Makan pribadi',
                'Wahana tambahan berbayar',
                'Tips guide (sukarela)',
            ],
        },
    ],

    'pulau-seribu': [
        {
            name: 'Paket Wisata Pulau Seribu',
            price: 'Hubungi Admin',
            note: 'Paket privat untuk keluarga / grup',
            includes: [
                'Transportasi Jakarta – Dermaga PP',
                'Kapal penyeberangan ke Pulau Seribu',
                'Penginapan 1 malam (sharing)',
                'Snorkeling 2–3 spot',
                'Peralatan snorkeling',
                'Makan 2x (siang & malam)',
                'Air mineral selama perjalanan',
            ],
            excludes: [
                'Wahana tambahan (banana boat, parasailing)',
                'Makan di luar program',
                'Tips guide (sukarela)',
            ],
        },
        {
            name: 'Paket 15 Pax',
            price: 'Hubungi Admin',
            note: 'Minimal 15 orang | Harga lebih hemat per orang',
            includes: [
                'Transportasi Jakarta – Dermaga PP (bus)',
                'Kapal penyeberangan ke Pulau Seribu',
                'Penginapan 1 malam (sharing kamar 4 orang)',
                'Snorkeling 2–3 spot',
                'Peralatan snorkeling',
                'Makan 2x (siang & malam)',
                'Air mineral selama perjalanan',
            ],
            excludes: [
                'Wahana tambahan (banana boat, parasailing)',
                'Makan di luar program',
                'Tips guide (sukarela)',
            ],
        },
        {
            name: 'Open Trip Pulau Seribu',
            price: 'Hubungi Admin',
            note: 'Bergabung dengan peserta lain | Jadwal terjadwal bulanan',
            includes: [
                'Kapal penyeberangan ke Pulau Seribu',
                'Penginapan 1 malam (sharing kamar 4-6 orang)',
                'Snorkeling 2 spot',
                'Peralatan snorkeling',
                'Makan 2x (siang & malam)',
                'Guide lokal',
            ],
            excludes: [
                'Transportasi ke dermaga (mandiri)',
                'Wahana tambahan',
                'Makan di luar program',
            ],
        },
    ],

    'bromo': [
        {
            name: 'Paket Bromo One Day',
            price: 'Hubungi Admin',
            note: 'Berangkat malam, kembali sore | Privat group',
            includes: [
                'Transportasi Purwokerto – Probolinggo PP (elf/bus)',
                'Jeep 4WD lautan pasir (sharing)',
                'Tiket masuk kawasan Bromo',
                'Guide lokal berpengalaman',
                'Air mineral selama perjalanan',
            ],
            excludes: [
                'Makan pribadi',
                'Sewa kuda di kawah Bromo',
                'Tips guide & driver (sukarela)',
                'Masker / jaket hangat pribadi',
            ],
        },
        {
            name: 'Paket 15 Pax',
            price: 'Hubungi Admin',
            note: 'Minimal 15 orang | Bus pariwisata ber-AC',
            includes: [
                'Bus pariwisata ber-AC Purwokerto – Probolinggo PP',
                'Jeep 4WD lautan pasir (sharing)',
                'Tiket masuk kawasan Bromo',
                'Guide lokal berpengalaman',
                'Air mineral selama perjalanan',
                'Koordinator rombongan',
            ],
            excludes: [
                'Makan pribadi',
                'Sewa kuda di kawah Bromo',
                'Tips guide & driver (sukarela)',
            ],
        },
        {
            name: 'Open Trip Bromo One Day',
            price: 'Hubungi Admin',
            note: 'Bergabung dengan peserta lain | Jadwal tiap Jumat–Sabtu',
            includes: [
                'Transportasi dari titik kumpul (Purwokerto/Purbalingga)',
                'Jeep 4WD lautan pasir (sharing)',
                'Tiket masuk kawasan Bromo',
                'Guide lokal berpengalaman',
                'Air mineral',
            ],
            excludes: [
                'Makan pribadi',
                'Sewa kuda',
                'Tips guide & driver (sukarela)',
                'Masker / jaket hangat pribadi',
            ],
        },
    ],

    'bromo-malang': [
        {
            name: 'Paket Bromo Malang',
            price: 'Hubungi Admin',
            note: '3 hari 2 malam | Bromo + City Tour Malang',
            includes: [
                'Transportasi Purwokerto – Malang PP (sleeper bus/elf)',
                'Jeep 4WD lautan pasir Bromo (sharing)',
                'Penginapan 2 malam di Malang',
                'Tiket masuk Bromo & objek wisata Malang',
                'City tour Malang (Jatim Park, Selecta, Coban Rondo)',
                'Guide lokal berpengalaman',
                'Air mineral selama perjalanan',
            ],
            excludes: [
                'Makan pribadi (ada rekomendasi resto)',
                'Sewa kuda di Bromo',
                'Tips guide & driver (sukarela)',
                'Pengeluaran pribadi',
            ],
        },
    ],

    'karimun-jawa': [
        {
            name: 'Paket 2D 1N',
            price: 'Rp 450.000/pax',
            note: 'Min. 4 orang | Berangkat setiap Jumat malam',
            includes: [
                'Transportasi Purwokerto – Jepara PP',
                'Kapal penyeberangan ke Karimun Jawa',
                'Penginapan 1 malam (sharing)',
                'Island Hopping 3 pulau + snorkeling',
                'Makan 2x (makan siang & makan malam)',
                'Air Mineral selama perjalanan',
                'Guide lokal berpengalaman',
            ],
            excludes: [
                'Peralatan snorkeling (bisa sewa Rp 25.000)',
                'Pengeluaran & makan pribadi tambahan',
                'Tips guide sukarela',
                'Wahana tambahan (banana boat, dll)',
            ],
        },
        {
            name: 'Paket 3D 2N',
            price: 'Rp 750.000/pax',
            note: 'Min. 4 orang | Berangkat setiap Kamis malam',
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
                'Peralatan snorkeling (bisa sewa Rp 25.000)',
                'Pengeluaran & makan pribadi tambahan',
                'Tips guide sukarela',
                'Wahana tambahan (banana boat, dll)',
            ],
        },
        {
            name: 'Open Trip 2D 1N',
            price: 'Rp 350.000/pax',
            note: 'Bergabung peserta lain | Jadwal terjadwal tiap bulan',
            includes: [
                'Transportasi dari titik kumpul (Purwokerto/Semarang)',
                'Kapal penyeberangan ke Karimun Jawa',
                'Penginapan 1 malam (sharing 4–6 orang)',
                'Island Hopping 3 pulau + snorkeling',
                'Makan 2x (makan siang & malam)',
                'Air Mineral selama perjalanan',
                'Guide lokal berpengalaman',
            ],
            excludes: [
                'Peralatan snorkeling (bisa sewa Rp 25.000)',
                'Pengeluaran & makan pribadi tambahan',
                'Tips guide sukarela',
            ],
        },
    ],

    'labuan-bajo': [
        {
            name: 'Paket Labuan Bajo 2D 1N',
            price: 'Hubungi Admin',
            note: 'Termasuk tiket pesawat & penginapan',
            includes: [
                'Tiket pesawat PP (dari Jakarta/Surabaya)',
                'Penginapan 1 malam di Labuan Bajo (bintang 3)',
                'Island hopping: Pink Beach, Padar Island',
                'Kunjungan Pulau Komodo (trekking)',
                'Snorkeling 2 spot',
                'Makan 2x sesuai program',
                'Kapal wisata privat',
                'Guide lokal bersertikat TNKK',
            ],
            excludes: [
                'Tiket retribusi TNKK (Rp 150.000/pax)',
                'Makan di luar program',
                'Porter trekking (sukarela)',
                'Pengeluaran pribadi',
            ],
        },
    ],

    'lombok': [
        {
            name: 'Paket Wisata Lombok',
            price: 'Hubungi Admin',
            note: '3 hari 2 malam | Gili Island + City Tour',
            includes: [
                'Tiket pesawat PP (dari Surabaya/Semarang)',
                'Penginapan 2 malam di Mataram/Senggigi',
                'Gili Island: snorkeling + island hopping',
                'Pantai Kuta Lombok & Tanjung Aan',
                'Transportasi darat selama tour',
                'Guide lokal berpengalaman',
                'Air mineral selama perjalanan',
            ],
            excludes: [
                'Makan pribadi (ada rekomendasi resto)',
                'Sewa motor / transportasi mandiri',
                'Tips guide & driver (sukarela)',
                'Pengeluaran pribadi',
            ],
        },
    ],

    'bali': [
        {
            name: 'Paket Wisata Bali 3D 2N',
            price: 'Hubungi Admin',
            note: 'Privat group | Min. 2 orang',
            includes: [
                'Tiket pesawat PP (dari Semarang/Jakarta)',
                'Penginapan 2 malam (bintang 2-3)',
                'Tanah Lot + Uluwatu + Kecak Dance',
                'Ubud: Tegalalang, Monkey Forest, Pasar Ubud',
                'Kintamani: panorama Gunung Batur',
                'Transportasi privat ber-AC selama tour',
                'Guide lokal berpengalaman',
                'Air mineral selama perjalanan',
            ],
            excludes: [
                'Makan pribadi (ada rekomendasi resto)',
                'Tiket GWK / Waterbom (opsional)',
                'Tips guide & driver (sukarela)',
                'Pengeluaran belanja pribadi',
            ],
        },
        {
            name: 'Open Trip Bali 3D 2N',
            price: 'Hubungi Admin',
            note: 'Gabung peserta lain | Jadwal tiap Jumat – Senin',
            includes: [
                'Tiket pesawat PP (dari Semarang/Jakarta)',
                'Penginapan 2 malam (sharing kamar 2 orang)',
                'Program tour: Tanah Lot, Ubud, Uluwatu, Kintamani',
                'Transportasi shuttle antar peserta',
                'Guide wisata berbahasa Indonesia',
                'Air mineral selama tour',
            ],
            excludes: [
                'Makan pribadi (ada rekomendasi resto)',
                'Tiket wahana opsional',
                'Tips guide & driver (sukarela)',
                'Pengeluaran belanja pribadi',
            ],
        },
    ],

    // ---------- INTERNASIONAL ----------

    'open-trip-3-negara': [
        {
            name: 'Open Trip 3 Negara',
            price: 'Hubungi Admin',
            note: 'Jadwal terjadwal bulanan | Cek admin untuk tanggal',
            includes: [
                'Tiket pesawat internasional (sesuai rute)',
                'Penginapan selama tour (sharing twin bed)',
                'Kunjungan ke 3 negara sesuai itinerary',
                'Transportasi antar kota / negara',
                'Guide berbahasa Indonesia',
                'Air mineral selama tour',
                'Asuransi perjalanan',
            ],
            excludes: [
                'Visa (diurus mandiri atau dibantu +biaya)',
                'Makan di luar program',
                'Pengeluaran belanja pribadi',
                'Tips guide & driver (sukarela)',
            ],
        },
    ],

    'tour-23-negara': [
        {
            name: 'Paket Tour 2 Negara',
            price: 'Hubungi Admin',
            note: 'Minimal 2 orang | Rute fleksibel sesuai request',
            includes: [
                'Tiket pesawat internasional PP',
                'Penginapan di 2 negara (hotel sesuai paket)',
                'City tour di masing-masing negara',
                'Transportasi antar kota / negara',
                'Guide berbahasa Indonesia / lokal',
                'Air mineral selama tour',
                'Asuransi perjalanan',
            ],
            excludes: [
                'Visa (diurus mandiri atau dibantu +biaya)',
                'Makan di luar program',
                'Pengeluaran belanja pribadi',
                'Tips guide (sukarela)',
            ],
        },
        {
            name: 'Paket Tour 3 Negara',
            price: 'Hubungi Admin',
            note: 'Minimal 2 orang | Kombinasi 3 negara sesuai request',
            includes: [
                'Tiket pesawat internasional (semua rute)',
                'Penginapan di 3 negara (hotel sesuai paket)',
                'City tour di masing-masing negara',
                'Transportasi antar kota / negara',
                'Guide berbahasa Indonesia / lokal',
                'Air mineral selama tour',
                'Asuransi perjalanan',
            ],
            excludes: [
                'Visa (diurus mandiri atau dibantu +biaya)',
                'Makan di luar program',
                'Pengeluaran belanja pribadi',
                'Tips guide (sukarela)',
            ],
        },
    ],

    'school-competition': [
        {
            name: 'International School Competition',
            price: 'Hubungi Admin',
            note: 'Disesuaikan dengan jadwal & lokasi kompetisi',
            includes: [
                'Pengurusan dokumen & visa (didampingi)',
                'Tiket pesawat PP',
                'Akomodasi selama kompetisi',
                'Transportasi dari-ke bandara & venue',
                'Pendampingan pembimbing Smart Holiday',
                'Asuransi perjalanan pelajar',
                'Koordinasi dengan panitia kompetisi',
            ],
            excludes: [
                'Biaya pendaftaran kompetisi',
                'Makan di luar program',
                'Pengeluaran pribadi',
                'Perlengkapan kompetisi',
            ],
        },
    ],

    'vietnam': [
        {
            name: 'Vietnam Tour Package',
            price: 'Hubungi Admin',
            note: '5 hari 4 malam | Hanoi + Ha Long Bay + Ho Chi Minh',
            includes: [
                'Tiket pesawat PP (dari Jakarta/Surabaya)',
                'Penginapan 4 malam (hotel bintang 3)',
                'Ha Long Bay cruise 1 malam di atas kapal',
                'Cu Chi Tunnels & Mekong Delta tour',
                'Transportasi selama tour',
                'Guide berbahasa Indonesia',
                'Makan sesuai itinerary',
                'Asuransi perjalanan',
            ],
            excludes: [
                'Visa Vietnam (dibantu pengurusan)',
                'Makan di luar program',
                'Pengeluaran & belanja pribadi',
                'Tips guide (sukarela)',
            ],
        },
    ],

    'bangkok': [
        {
            name: 'Bangkok Tour Package',
            price: 'Hubungi Admin',
            note: '4 hari 3 malam | Bangkok City Tour lengkap',
            includes: [
                'Tiket pesawat PP (dari Jakarta/Surabaya)',
                'Penginapan 3 malam (hotel bintang 3, Silom/Sukhumvit)',
                'Grand Palace, Wat Pho, Wat Arun, Pasar Terapung',
                'Shopping: MBK & Siam Paragon',
                'Transportasi selama tour (BTS/van)',
                'Guide berbahasa Indonesia',
                'Asuransi perjalanan',
            ],
            excludes: [
                'Visa (bebas visa untuk WNI)',
                'Makan pribadi (ada rekomendasi)',
                'Pengeluaran & belanja pribadi',
                'Tips guide (sukarela)',
            ],
        },
    ],

    'pattaya': [
        {
            name: 'Pattaya Tour Package',
            price: 'Hubungi Admin',
            note: '4 hari 3 malam | Bangkok + Pattaya',
            includes: [
                'Tiket pesawat PP (dari Jakarta/Surabaya)',
                'Penginapan 3 malam (hotel bintang 3)',
                'Coral Island (Koh Larn): snorkeling + banana boat',
                'Sanctuary of Truth tour',
                'Transfer Bangkok ↔ Pattaya',
                'Guide berbahasa Indonesia',
                'Asuransi perjalanan',
            ],
            excludes: [
                'Visa (bebas visa untuk WNI)',
                'Makan pribadi (ada rekomendasi)',
                'Wahana tambahan di Coral Island',
                'Pengeluaran & belanja pribadi',
                'Tips guide (sukarela)',
            ],
        },
    ],

    'hainan': [
        {
            name: 'Hainan Tour Package',
            price: 'Hubungi Admin',
            note: '4 hari 3 malam | Sanya – Haikou',
            includes: [
                'Tiket pesawat PP (dari Jakarta)',
                'Penginapan 3 malam (hotel bintang 4)',
                'Yalong Bay & Sanya city tour',
                'Nanshan Buddhist Center & Tianya Haijiao',
                'Duty-free shopping tour',
                'Transportasi selama tour',
                'Guide berbahasa Indonesia',
                'Asuransi perjalanan',
            ],
            excludes: [
                'Visa China (dibantu pengurusan)',
                'Makan di luar program',
                'Pengeluaran & belanja pribadi',
                'Tips guide (sukarela)',
            ],
        },
    ],

    'korea': [
        {
            name: 'Korea Tour Package',
            price: 'Hubungi Admin',
            note: '5 hari 4 malam | Seoul – Nami Island – Everland',
            includes: [
                'Tiket pesawat PP (dari Jakarta/Surabaya)',
                'Penginapan 4 malam (hotel bintang 3, Myeongdong)',
                'Gyeongbokgung, N Seoul Tower, Bukchon Hanok Village',
                'Nami Island & Petite France',
                'Everland / Lotte World (pilih salah satu)',
                'Dongdaemun Shopping',
                'Transportasi selama tour',
                'Guide berbahasa Indonesia',
                'Asuransi perjalanan',
            ],
            excludes: [
                'Visa Korea (dibantu pengurusan)',
                'Makan di luar program',
                'Pengeluaran & belanja pribadi',
                'Tips guide (sukarela)',
            ],
        },
    ],

    'japan': [
        {
            name: 'Japan Tour Package',
            price: 'Hubungi Admin',
            note: '6 hari 5 malam | Tokyo – Hakone – Kyoto – Osaka',
            includes: [
                'Tiket pesawat PP (dari Jakarta/Surabaya)',
                'Penginapan 5 malam (hotel sesuai program)',
                'Tokyo: Asakusa, Shibuya Crossing, Harajuku, Akihabara',
                'Hakone: view Gunung Fuji + onsen tradisional',
                'Kyoto: Fushimi Inari, Kinkaku-ji, Nishiki Market',
                'Osaka: Osaka Castle, Dotonbori, Universal Studios Japan',
                'JR Pass / transportasi selama tour',
                'Guide berbahasa Indonesia',
                'Asuransi perjalanan',
            ],
            excludes: [
                'Visa Jepang (dibantu pengurusan)',
                'Makan di luar program',
                'Pengeluaran & belanja pribadi',
                'Tips guide (sukarela)',
            ],
        },
    ],

    'school-visit': [
        {
            name: 'School Visit International',
            price: 'Hubungi Admin',
            note: 'Disesuaikan dengan kebutuhan sekolah / institusi',
            includes: [
                'Koordinasi dengan sekolah/universitas tujuan',
                'Tiket pesawat PP',
                'Penginapan selama program',
                'Campus tour & cultural exchange',
                'Wisata edukatif (museum, science center)',
                'Transportasi selama program',
                'Pendampingan dari Smart Holiday',
                'Asuransi perjalanan pelajar',
            ],
            excludes: [
                'Visa (dibantu pengurusan)',
                'Makan di luar program',
                'Pengeluaran pribadi',
                'Perlengkapan belajar / seragam',
            ],
        },
    ],
};

// ============================================================
// JALANKAN MIGRASI
// ============================================================
let content = fs.readFileSync('generate-pages.cjs', 'utf8');
let changed = 0;

for (const [pkgId, newSubPkgs] of Object.entries(ALL_NEW_SUBPACKAGES)) {
    // Cari pola subPackages yang sudah jadi string array ATAU object array lama
    // Gunakan regex untuk menemukan dan mengganti bagian subPackages
    const jsonStr = JSON.stringify(newSubPkgs, null, 12)
        .replace(/"/g, "'")
        // Fix: ganti koma di akhir setiap item array agar tetap valid JS
        .replace(/,\n(\s*)\]/g, ',\n$1]');

    // Format sebagai JS array yang lebih rapi
    const formatted = newSubPkgs.map(sp => {
        const includesStr = sp.includes.map(i => `                    '${i}'`).join(',\n');
        const excludesStr = sp.excludes.map(e => `                    '${e}'`).join(',\n');
        return `        {
            name:  '${sp.name}',
            price: '${sp.price}',
            note:  '${sp.note}',
            includes: [
${includesStr},
            ],
            excludes: [
${excludesStr},
            ],
        }`;
    }).join(',\n        ');

    const newSubPkgsCode = `subPackages: [\n        // ── EDIT DI SINI ─────────────────────────────────────────────────────\n        // name     = nama paket (tampil sebagai tab)\n        // price    = harga (contoh: 'Rp 450.000/pax' atau 'Hubungi Admin')\n        // note     = catatan kecil di bawah harga (opsional)\n        // includes = daftar "Sudah Termasuk"\n        // excludes = daftar "Belum Termasuk"\n        // ─────────────────────────────────────────────────────────────────────\n        ${formatted},\n        ],`;

    // Cari dan ganti subPackages untuk paket ini
    // Pattern untuk match string array: subPackages: ['...', '...']
    const strArrayPattern = new RegExp(
        `(id:\\s*'${pkgId}'[\\s\\S]*?subPackages:\\s*)\\[[^\\]]*\\]`,
        ''
    );

    // Pattern untuk match yang sudah jadi object array
    const objArrayPattern = new RegExp(
        `(id:\\s*'${pkgId}'[\\s\\S]*?subPackages:\\s*)\\[\\s*\\/\\/[\\s\\S]*?(?=\\],)\\],`,
        ''
    );

    if (strArrayPattern.test(content)) {
        content = content.replace(strArrayPattern, `$1[${newSubPkgs.map(s => `'${s.name}'`).join(', ')}]`);
        // Actually let's do it properly
    }

    // Simpler: find the exact package block and do targeted replacement
    const idIdx = content.indexOf(`id: '${pkgId}'`);
    if (idIdx === -1) {
        console.log(`⚠️  Package '${pkgId}' not found, skipping.`);
        continue;
    }

    // Find subPackages after the id
    const subStart = content.indexOf('subPackages:', idIdx);
    if (subStart === -1) {
        console.log(`⚠️  subPackages for '${pkgId}' not found, skipping.`);
        continue;
    }

    // Find the end of subPackages array - could be ] or ],
    // Handle both string array (single line) and object array (multi-line)
    let bracketDepth = 0;
    let inStr = false;
    let strChar = '';
    let subEnd = -1;
    let startBracket = content.indexOf('[', subStart);

    for (let i = startBracket; i < content.length; i++) {
        const ch = content[i];
        if (!inStr) {
            if (ch === "'" || ch === '"' || ch === '`') { inStr = true; strChar = ch; }
            else if (ch === '[' || ch === '{') bracketDepth++;
            else if (ch === ']' || ch === '}') {
                bracketDepth--;
                if (bracketDepth === 0) {
                    subEnd = i + 1; // include the closing bracket
                    // check if followed by comma
                    if (content[subEnd] === ',') subEnd++;
                    break;
                }
            }
        } else {
            if (ch === strChar && content[i - 1] !== '\\') inStr = false;
        }
    }

    if (subEnd === -1) {
        console.log(`⚠️  Could not find end of subPackages for '${pkgId}'`);
        continue;
    }

    const replacement = `subPackages: [\n        // ── EDIT DI SINI ──────────────────────────────────────────────────────\n        // name     = nama paket (tampil sebagai tab yang bisa diklik)\n        // price    = harga (contoh: 'Rp 450.000/pax' atau 'Hubungi Admin')\n        // note     = catatan kecil di bawah harga (boleh dikosongkan: '')\n        // includes = daftar "Sudah Termasuk"\n        // excludes = daftar "Belum Termasuk"\n        // ─────────────────────────────────────────────────────────────────────\n        ${formatted},\n        ],`;

    content = content.slice(0, subStart) + replacement + content.slice(subEnd);
    changed++;
    console.log(`✅ Migrated: ${pkgId}`);
}

fs.writeFileSync('generate-pages.cjs', content, 'utf8');
console.log(`\n🎉 Done! ${changed} packages migrated to new object format.`);
