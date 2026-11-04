# Panduan Memindahkan Landing Page ke GitHub Pages

Panduan ini untuk Anda yang **belum pernah memakai Git atau GitHub**. Semua istilah dijelaskan saat pertama muncul, dan setiap perintah disertai penjelasan apa yang terjadi.

Sistem Operasi: **Windows**
Waktu yang dibutuhkan: sekitar 30–45 menit untuk pertama kali.

---

## Apa yang sebenarnya berubah

Sekarang, Apps Script mengerjakan dua hal sekaligus: menyimpan data **dan** menyajikan halaman.

Setelah pindah, tugasnya dibagi:

| | Sekarang | Setelah pindah |
|---|---|---|
| Menyajikan halaman | Apps Script | GitHub Pages |
| Menyimpan data | Apps Script | Apps Script (tidak berubah) |
| Alamat situs | `script.google.com/macros/s/AKfy…/exec` | `username.github.io/nama-repo/` |
| Dashboard admin | `…/exec?v=admin` | **tetap di Apps Script**, tidak pindah |

**Backend Anda tidak disentuh sama sekali.** Spreadsheet, folder Drive, notifikasi email, dan dashboard admin semuanya tetap berjalan seperti sekarang.

### Kenapa repot pindah?

- **Mesin pencari bisa menemukan situs Anda.** Google tidak mengindeks halaman dari `script.google.com`. Ini alasan terkuatnya.
- **Tautan yang dibagikan punya pratinjau.** Dikirim ke WhatsApp, muncul judul dan gambar, bukan tautan panjang tanpa keterangan.
- **Bisa pakai domain sendiri**, misalnya `etalase.pembelajarsejati.my.id`.
- **Halaman terbuka lebih cepat**, karena tidak melewati pembungkus iframe Apps Script.
- **Banner "This application was created by a Google Apps Script user" hilang.**

### Apa yang perlu diterima

- Dashboard admin tetap di URL Apps Script yang lama. Itu justru bagus — halaman admin memang tidak perlu terindeks Google.
- Setiap kali mengubah tampilan, Anda menjalankan tiga perintah di terminal, bukan klik Deploy.

---

## Glosarium singkat

| Istilah | Artinya |
|---|---|
| **Repository (repo)** | Folder proyek di GitHub — semacam Google Drive untuk kode |
| **Commit** | Menyimpan perubahan beserta catatan singkat, lengkap dengan riwayatnya |
| **Push** | Mengirim perubahan dari komputer ke GitHub |
| **Branch** | Cabang/versi proyek. Yang dipakai di sini hanya `main` |
| **Personal Access Token** | "Kata sandi khusus" dari GitHub untuk terminal. GitHub tidak lagi menerima kata sandi akun biasa |
| **PowerShell** | Terminal bawaan Windows |

---

## TAHAP 0 — Siapkan dulu di Apps Script

Kerjakan ini sebelum menyentuh GitHub.

### 0a. Pastikan deployment bisa diakses siapa saja

Apps Script → **Deploy → Manage deployments** → ✏️ → periksa:

| Kolom | Nilai |
|---|---|
| Execute as | **Me** |
| Who has access | **Anyone** |

Kalau bukan "Anyone", situs GitHub Pages tidak akan bisa mengambil data.

### 0b. Salin URL Web App

Di layar yang sama, salin **Web app URL**. Bentuknya:

```
https://script.google.com/macros/s/AKfycbz88JxpQeOZ5ikR16i.../exec
```

Simpan dulu di Notepad.

### 0c. Pastikan `doPost` ada di `Kode.gs`

Buka `Kode.gs`, cari `function doPost`. Fungsi ini yang akan menerima data checkout dari GitHub Pages. Kalau tidak ada, situs bisa tampil tapi tombol Beli tidak berfungsi.

---

## TAHAP 1 — Isi URL di `config.js`

Ekstrak berkas ZIP yang Anda terima. Hasilnya folder bernama `landing-page-etalase`.

Buka `landing-page-etalase\js\config.js` dengan Notepad. Ganti baris terakhir:

```javascript
var GAS_URL = 'TEMPEL_URL_EXEC_ANDA_DI_SINI';
```

menjadi URL dari Tahap 0b:

```javascript
var GAS_URL = 'https://script.google.com/macros/s/AKfycbz88.../exec';
```

Simpan. **Ini satu-satunya berkas yang perlu Anda sunting.**

> Kalau langkah ini terlewat, situs akan tampil kosong dengan kartu-kartu yang tidak pernah terisi.

---

## TAHAP 2 — Pasang Git

1. Unduh dari **https://git-scm.com/download/win**
2. Jalankan pemasangnya, klik **Next** terus sampai selesai — pengaturan bawaannya sudah benar
3. Setelah selesai, buka **PowerShell** dari Start Menu dan ketik:

```powershell
git --version
```

Kalau muncul `git version 2.xx.x`, Git sudah terpasang.

---

## TAHAP 3 — Buat akun GitHub

Daftar di **https://github.com** kalau belum punya.

> Username yang Anda pilih akan jadi bagian alamat situs: `username.github.io/nama-repo/`. Pilih yang pendek dan enak dibaca.

---

## TAHAP 4 — Kenalkan diri Anda ke Git

Cukup sekali seumur hidup komputer ini. Di PowerShell:

```powershell
git config --global user.name "Nama Anda"
git config --global user.email "email@akun-github-anda.com"
```

`user.name` bebas, hanya label di riwayat perubahan. `user.email` sebaiknya sama dengan email akun GitHub.

Periksa hasilnya:

```powershell
git config --global user.name
```

---

## TAHAP 5 — Buat repository di GitHub

Di github.com:

1. Klik tombol **+** di kanan atas → **New repository**
2. **Repository name:** `etalase-produk-digital` (atau nama lain, tanpa spasi)
3. Pilih **Public**
4. **JANGAN centang** "Add a README file", "Add .gitignore", maupun "Choose a license"
5. Klik **Create repository**

Biarkan halaman yang muncul tetap terbuka — nanti URL-nya dipakai.

> **Kenapa harus Public?** GitHub Pages gratis hanya untuk repository publik. Ini aman: berkas frontend tidak memuat kata sandi apa pun. URL `/exec` memang alamat publik, dan endpoint-nya hanya bisa membaca konten aktif serta menulis leads.

---

## TAHAP 6 — Buka terminal di folder yang benar

Ini langkah yang **paling sering salah**. Perhatikan betul.

1. Buka folder `landing-page-etalase` di File Explorer
2. Klik **address bar** di atas (tempat tertulis jalur folder)
3. Ketik `powershell` lalu tekan **Enter**

PowerShell terbuka tepat di folder itu.

Sekarang periksa isinya:

```powershell
dir
```

Yang **harus** terlihat:

```
Mode     Name
----     ----
d----    css
d----    js
-a---    index.html
-a---    PANDUAN-GITHUB-PAGES.md
-a---    README.md
```

**Syarat mutlak: `index.html` harus terlihat di daftar ini.**

Kalau yang muncul justru folder `landing-page-etalase` sendiri, berarti Anda satu tingkat terlalu tinggi. Ketik:

```powershell
cd landing-page-etalase
dir
```

> ⚠️ Ini gerbang paling penting di seluruh panduan. Git akan menerima folder yang salah **tanpa protes sedikit pun** — semua perintah berhasil, tidak ada pesan error, tapi situsnya 404. Jangan lanjut sebelum `index.html` terlihat.

---

## TAHAP 7 — Kirim ke GitHub

Jalankan satu per satu, jangan sekaligus.

### 7a. Siapkan folder sebagai repo Git

```powershell
git init
```

Hasil normal: `Initialized empty Git repository in ...`

### 7b. Daftarkan semua berkas

```powershell
git add .
```

> ⚠️ Ada **titik** di akhir, artinya "semua berkas di folder ini". Tanpa titik, tidak ada yang didaftarkan.

Hasil normal: tidak ada tulisan apa pun. Diam berarti berhasil.

### 7c. Simpan sebagai commit pertama

```powershell
git commit -m "Landing page pertama"
```

Hasil normal: daftar berkas, seperti `create mode 100644 index.html`.

### 7d. Beri nama cabang utama

```powershell
git branch -M main
```

### 7e. Sambungkan ke GitHub

Ganti `USERNAME` dan `NAMA-REPO` dengan milik Anda:

```powershell
git remote add origin https://github.com/USERNAME/NAMA-REPO.git
```

> Kalau muncul `remote origin already exists`, berarti sudah pernah disambungkan. Lewati saja. Kalau alamatnya salah, perbaiki dengan `git remote set-url origin https://github.com/USERNAME/NAMA-REPO.git`

### 7f. Kirim

```powershell
git push -u origin main
```

Akan muncul permintaan:

- **Username:** ketik username GitHub Anda
- **Password:** **bukan** kata sandi akun — tempel **Personal Access Token** (lihat Tahap 8)

> 💡 **Saat menempel token, layar tetap kosong.** Tidak ada bintang, tidak ada karakter apa pun. Ini **normal**, bukan tanda gagal. Klik kanan untuk menempel, lalu tekan Enter.

Tanda berhasil:

```
Writing objects: 100% (10/10), done.
 * [new branch]      main -> main
```

---

## TAHAP 8 — Membuat Personal Access Token

Kalau di Tahap 7f muncul `Password authentication is not supported`, itu bukan kesalahan Anda — GitHub memang sudah tidak menerima kata sandi akun untuk terminal.

1. Buka **https://github.com/settings/tokens**
2. **Generate new token** → pilih **Generate new token (classic)**
3. Isi:
   - **Note:** `git-push-token`
   - **Expiration:** `90 days`, atau `No expiration` kalau tidak mau repot memperpanjang
   - **Centang:** ✅ **repo** — ini wajib
4. Klik **Generate token**
5. **Salin token** yang muncul (diawali `ghp_`). Token ini **hanya ditampilkan sekali** — simpan dulu di Notepad
6. Kembali ke PowerShell, jalankan lagi `git push -u origin main`
7. Tempel token sebagai password

> Kalau terminal terasa terlalu merepotkan, ada jalan lain: pasang **GitHub Desktop** dari https://desktop.github.com. Login lewat browser, pilih **Add Local Repository** → arahkan ke folder `landing-page-etalase` → **Publish repository**. Tidak perlu token sama sekali.

---

## TAHAP 9 — Nyalakan GitHub Pages

### 9a. Periksa dulu isi repo

Buka `https://github.com/USERNAME/NAMA-REPO` di browser. Pastikan:

- ✅ `index.html` terlihat di daftar paling atas
- ✅ Ada folder `css` dan `js`
- ❌ Tidak boleh ada berkas `.gs` — itu milik Apps Script

Kalau yang terlihat justru folder `landing-page-etalase`, lompat ke bagian **Kalau Situs 404** di bawah.

### 9b. Aktifkan Pages

Di repo: tab **Settings** (paling kanan) → **Pages** di menu kiri.

| Kolom | Nilai |
|---|---|
| Source | **Deploy from a branch** |
| Branch | **main** — **/ (root)** |
| Enforce HTTPS | ✅ dicentang |

Klik **Save**, tunggu 1–2 menit, lalu muat ulang halaman. Akan muncul:

> Your site is live at `https://USERNAME.github.io/NAMA-REPO/`

### 9c. Uji situsnya

Buka alamat itu dan periksa:

1. Hero tampil dan berganti otomatis tiap 5 detik
2. Kartu produk muncul lengkap dengan harga
3. Akordeon kurikulum bisa dibuka-tutup
4. Klik **Beli Sekarang** → isi form → submit → cek sheet `Leads` bertambah

Yang nomor 4 paling penting, karena itu membuktikan jembatan ke Apps Script benar-benar tersambung.

---

## TAHAP 10 — Cara mengubah tampilan nanti

Setelah menyunting berkas apa pun di folder tersebut, jalankan tiga perintah dari PowerShell di folder yang sama:

```powershell
git add .
git commit -m "Perbaiki bagian testimoni"
git push
```

GitHub Pages membangun ulang dalam 1–2 menit. Kalau masih tampil versi lama, itu cache peramban — tekan **Ctrl + Shift + R**.

> **Catatan penting:** mengubah **konten** (produk, harga, testimoni, tema warna) **tidak perlu** menyentuh GitHub sama sekali. Itu tetap lewat dashboard admin seperti biasa, dan situsnya ikut berubah sendiri. GitHub hanya untuk mengubah **tampilan dan struktur**.

---

## Kalau Situs 404

Gejalanya khas: halaman **404 — File not found**, padahal semua perintah git tadi berhasil tanpa satu pun pesan error.

Penyebabnya hampir selalu sama: `git init` dijalankan di folder induk, bukan di folder yang berisi `index.html`.

Perbaikannya tidak perlu menghapus repository. Cukup kirim ulang dari folder yang benar:

```powershell
cd "C:\jalur\ke\landing-page-etalase"
dir
```

Pastikan `index.html` terlihat. Baru lanjut:

```powershell
git init
git add .
git commit -m "Perbaiki: kirim dari folder yang benar"
git branch -M main
git remote add origin https://github.com/USERNAME/NAMA-REPO.git
git push -u origin main --force
```

`--force` menimpa isi repository dengan versi di komputer Anda. Aman di sini karena isi yang lama memang salah struktur — tapi Anda berhak tahu apa yang sedang dijalankan, bukan sekadar menyalin perintah.

Tunggu 1–2 menit, buka situs, tekan **Ctrl + Shift + R**.

---

## Daftar masalah & solusi

| Yang terlihat | Artinya | Yang harus dilakukan |
|---|---|---|
| Situs tampil tapi kartu kosong semua | `GAS_URL` di `js/config.js` belum diisi atau salah | Perbaiki, lalu `git add .` → `git commit -m "fix url"` → `git push` |
| Console (F12) merah: **CORS policy** | Deployment Apps Script tidak disetel "Anyone" | Apps Script → Manage deployments → Who has access: **Anyone** → Deploy versi baru |
| Halaman tampil tanpa warna, teks polos | Folder `css/` dan `js/` tidak ikut terkirim | Lihat bagian **Kalau Situs 404** |
| `fatal: not a git repository` | Belum `git init`, atau folder salah | Jalankan `dir` dulu, pastikan `index.html` terlihat |
| `remote origin already exists` | Sudah pernah disambungkan | Lewati, lanjut ke `git push` |
| `Password authentication is not supported` | GitHub menolak kata sandi akun | Buat Personal Access Token (Tahap 8) |
| `Invalid username or token` | Token salah, kedaluwarsa, atau scope `repo` belum dicentang | Buat token baru, pastikan ✅ **repo** |
| Tidak ada karakter saat mengetik password | Perilaku normal terminal | Tetap tempel lalu Enter |
| `error: src refspec main does not match any` | Belum ada commit | Jalankan `git add .` lalu `git commit -m "Upload pertama"` |
| `Updates were rejected…` | Repo GitHub punya berkas yang tidak ada di komputer | `git pull --rebase origin main` lalu `git push` |
| `LF will be replaced by CRLF` | Perbedaan format baris Windows vs Linux | **Abaikan.** Ini peringatan biasa, bukan kesalahan |
| Tombol Beli tidak menyimpan apa-apa | `doPost` belum ada di `Kode.gs` | Periksa Tahap 0c |
| Situs tampil versi lama setelah push | Cache peramban | **Ctrl + Shift + R**, atau buka di jendela Incognito |

---

## Setelah situs jalan

Hal-hal yang bisa dilakukan berikutnya, berurutan dari yang paling berguna:

1. **Ganti `og:image` di `index.html`** dengan URL gambar asli, supaya tautan yang dibagikan ke WhatsApp punya pratinjau yang menarik
2. **Pasang domain sendiri** — Settings → Pages → Custom domain, lalu arahkan DNS ke GitHub
3. **Daftarkan ke Google Search Console** agar situs mulai terindeks
4. **Ganti Tailwind CDN dengan CSS statis** supaya halaman lebih cepat. Ini yang paling teknis dan paling bisa ditunda

---

## Isi berkas dalam paket ini

```
landing-page-etalase/
├── index.html                  ← struktur halaman + meta SEO
├── README.md
├── PANDUAN-GITHUB-PAGES.md     ← dokumen ini
├── css/
│   └── style.css               ← token warna + gaya
└── js/
    ├── config.js               ← SATU-SATUNYA yang perlu disunting
    ├── tema.js                 ← lima token warna + mesin tema
    └── app.js                  ← ambil data, render, checkout
```

Folder `landing-page-etalase` itulah yang dijalankan `git init` — bukan folder induknya.
