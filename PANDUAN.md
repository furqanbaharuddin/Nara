# Nara — Asisten pribadi Furqan (panduan pasang)

Isi folder ini:
- `index.html` — aplikasinya (satu file)
- `manifest.json`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` — supaya bisa dipasang sebagai ikon di iPhone & Mac
- `Asisten.gs` — kode server sinkron iPhone ⇄ Mac (opsional, langkah 4)

Urutannya: **(1) API key Claude → (2) pasang ke Netlify → (3) pasang ke iPhone & Mac → (4) sambungkan kasir & sinkron.**

---

## 1. Buat API key Claude (sekali saja, ±5 menit)

1. Buka **https://console.anthropic.com** dan masuk (bisa pakai akun Google).
2. Menu **Billing** → **Add credits** → isi saldo. Mulai dari **$5** sudah cukup untuk berbulan-bulan ngobrol pribadi.
3. Menu **API Keys** → **Create Key** → beri nama `Nara` → **Create**.
4. Salin key yang muncul (diawali `sk-ant-…`). Simpan di Notes; key ini hanya ditampilkan sekali.

> Key ini seperti password rekening: jangan dibagikan. Di aplikasi, key tersimpan hanya di perangkat Anda dan hanya dikirim ke api.anthropic.com.

## 2. Pasang ke Netlify (seperti aplikasi kasir dulu)

1. Buka **https://app.netlify.com** → masuk dengan akun yang sama dengan aplikasi kasir.
2. **Add new site → Deploy manually**.
3. Seret **seluruh folder `asisten-app`** ini ke kotak unggah (bukan hanya `index.html`; ikonnya ikut).
4. Tunggu sebentar, klik **Site settings → Change site name** → beri nama misalnya `nara-furqan` → alamatnya jadi `https://nara-furqan.netlify.app`.
5. Pastikan **Site protection** *tidak* aktif (sama seperti kasir), supaya bisa dibuka dari HP.

Kalau nanti ada versi baru, ulangi langkah 2–3 saja (**Deploys → drag & drop**); alamatnya tetap.

## 3. Pasang sebagai aplikasi

**iPhone**
1. Buka alamat Netlify di **Safari** (bukan Chrome).
2. Tombol **Bagikan** (kotak dengan panah ke atas) → **Tambah ke Layar Utama** → **Tambah**.
3. Buka dari ikon **Nara** di layar utama. Saat pertama kali menekan mikrofon, Safari minta izin mikrofon → **Izinkan**.

**Mac**
1. Buka alamat yang sama di **Safari**.
2. Menu **File → Add to Dock** → **Add**.
3. Buka dari Dock. Pertama kali pakai mikrofon → **Allow**.

Lalu di aplikasi: ikon **roda gigi** → tempel **API key Claude** → **Simpan**. Coba ketik "halo".

**Cara pakai:** layar utama adalah wajah Nara. Tekan **tombol hijau** (mikrofon) sekali → bicara. Dia menjawab dengan suara lalu otomatis mendengarkan lagi; ketuk wajahnya kapan saja untuk memotong. Tekan tombol itu lagi (merah) untuk selesai. Ikon **keyboard** di kanan atas membuka riwayat obrolan dan kotak ketik; jawaban yang diketik tetap dibacakan (bisa dimatikan lewat ikon speaker di panel itu).

Suara Indonesia: kalau suaranya terdengar seperti orang asing membaca Bahasa Indonesia, pilih suara di Pengaturan → Suara. Jika tidak ada pilihan "Indonesia", unduh dulu:
- iPhone: Pengaturan → Aksesibilitas → Konten Lisan → Suara → **Bahasa Indonesia** → unduh (mis. *Damayanti*).
- Mac: System Settings → Accessibility → Spoken Content → System voice → Manage voices → **Indonesian**.

## 4. Sambungkan data studio & sinkron antar perangkat

**Data kasir** (supaya dia bisa jawab "pemasukan hari ini berapa?")
1. Di aplikasi kasir, login sebagai Owner → **Pengaturan**: salin **URL server** (…/exec) dan **Kunci API**.
2. Di Nara: Pengaturan → bagian **Data studio** → tempel keduanya → **Simpan**. Status "Server kasir terhubung" muncul di bawah kotak pesan.
3. Coba tanya: "Berapa pemasukan S.Parman hari ini?", "Siapa yang belum lunas?", "Booking minggu ini apa saja?"

Nara hanya **membaca** data kasir; dia tidak pernah mengubah transaksi.

**Sinkron iPhone ⇄ Mac** (supaya obrolan dan ingatannya sama di kedua perangkat)
1. Ikuti petunjuk di bagian atas file `Asisten.gs` (buat Google Sheet baru → Apps Script → tempel → `setup` → Terapkan). Prosesnya persis seperti server kasir dulu.
2. Masukkan **URL** dan **Kunci sinkron** di Pengaturan → bagian **Sinkron**, di iPhone dan di Mac.
3. Setiap kali aplikasi dibuka, dia menarik ingatan terbaru; setiap ada obrolan baru, dia menyimpan ke Sheet. API key Claude dan kunci kasir sengaja **tidak** ikut disinkronkan.

---

## Cara kerja ingatannya

- **Riwayat obrolan**: tersimpan di perangkat (dan di Sheet bila sinkron aktif). 30 pesan terakhir ikut dikirim ke Claude tiap kali dia menjawab.
- **Catatan**: kalau Anda bilang "ingat ya, …" dia menyimpannya ke daftar catatan (bisa dilihat/diedit di Pengaturan).
- **Ringkasan otomatis**: saat obrolan lewat 40 pesan, bagian lama diringkas jadi beberapa baris ingatan, supaya dia tetap "kenal" Anda tanpa mengirim semuanya (hemat biaya).
- **Hapus**: Pengaturan → Hapus riwayat obrolan (tekan dua kali).

## Internet

Nara bisa mencari di internet sendiri (berita, cuaca, harga, alamat) memakai pencarian bawaan Claude. Dia yang memutuskan kapan perlu mencari; obrolan biasa tidak memicu pencarian. Biayanya sekitar Rp160 per pencarian (US$10 per 1.000), dipotong dari saldo API yang sama.

## Biaya

- Mode cepat (bawaan) memakai model Haiku: paling murah dan jawabannya hampir seketika; cocok untuk ngobrol harian.
- Matikan "Mode cepat" untuk pertanyaan yang butuh dipikir panjang (memakai Sonnet).
- Pantau pemakaian di console.anthropic.com → Usage. Pakai pribadi biasanya di bawah $1–3 per bulan.

## Kalau ada masalah

| Gejala | Yang perlu dicek |
|---|---|
| "API key ditolak" | Salin ulang key (pastikan tidak ada spasi); saldo di Billing belum habis |
| Mikrofon tidak merespons | Buka dari Safari / ikon yang dipasang lewat Safari; izinkan mikrofon di Pengaturan → Safari (iPhone) atau Safari → Settings → Websites → Microphone (Mac) |
| Suara tidak keluar di iPhone | Pastikan tombol bisu (silent switch) tidak aktif; mode bicara butuh satu ketukan di wajah dulu |
| "Server kasir menolak" | Kunci API kasir salah/sudah diganti; salin lagi dari aplikasi kasir (Owner) |
| Dia tidak ingat obrolan di perangkat lain | Isi URL & kunci sinkron di **kedua** perangkat; buka ulang aplikasi |
