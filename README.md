# Landing Page Etalase Produk Digital & Kelas

Frontend statis untuk GitHub Pages. Backend tetap di Google Apps Script
(Google Sheets + Drive), dipanggil lewat REST API.

## Pemasangan singkat

1. Buka `js/config.js`, isi `GAS_URL` dengan URL `/exec` Web App Apps Script Anda
2. Jalankan `git init` **di folder ini** (folder yang berisi `index.html`)
3. `git add .` → `git commit -m "Upload pertama"` → `git push`
4. Settings → Pages → Branch: `main` / root → Save

Panduan lengkap langkah demi langkah ada di **PANDUAN-GITHUB-PAGES.md**.

## Struktur

```
index.html          struktur halaman + meta SEO/Open Graph
css/style.css       token warna + gaya
js/config.js        URL backend — satu-satunya berkas yang perlu disunting
js/tema.js          lima token warna + mesin tema (lavender/biru/mustard)
js/app.js           ambil data, render bagian, checkout leads
```

## Hubungan dengan backend

| Keperluan | Cara |
|---|---|
| Ambil konten | `GET  {GAS_URL}?api=konten` |
| Simpan leads | `POST {GAS_URL}` body `{"aksi":"simpanLeads","data":{...}}` |
| Catat kunjungan | `POST {GAS_URL}` body `{"aksi":"catatKunjungan"}` |

Permintaan POST memakai `Content-Type: text/plain` agar tetap menjadi
*simple request* — Apps Script tidak menjawab preflight `OPTIONS`.

Deployment Apps Script harus disetel **Execute as: Me** dan
**Who has access: Anyone**.

## Mengubah konten vs mengubah tampilan

- **Konten** (produk, harga, testimoni, tema warna) → lewat dashboard admin
  di Apps Script. Tidak perlu menyentuh GitHub.
- **Tampilan dan struktur** → sunting berkas di sini, lalu `git push`.
