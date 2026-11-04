/**
 * ============================================================================
 * app.js — Logika landing page (versi GitHub Pages)
 * ============================================================================
 * Alur: ambil konten → terapkan tema → render tiap bagian → pasang interaksi.
 * Seluruh panggilan server lewat fetch() ke REST API di GAS_URL
 * (lihat js/config.js), bukan google.script.run. Permintaan dibuat sebagai
 * "simple request" dengan Content-Type text/plain agar peramban tidak
 * mengirim preflight OPTIONS — Apps Script tidak menjawab preflight, dan
 * permintaannya akan terblokir CORS.
 * ============================================================================
 */

var DATA = null;
var produkTerpilih = null;

/* ---------- Pembantu ---------- */
function $(id) { return document.getElementById(id); }
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
function waLink(nomor, pesan) {
  return 'https://wa.me/' + String(nomor).replace(/\D/g,'') + '?text=' + encodeURIComponent(pesan);
}

/* ---------- Jembatan ke Apps Script ---------- */

/** GET ke endpoint JSON: GAS_URL?api=konten */
function ambil(api) {
  return fetch(GAS_URL + '?api=' + encodeURIComponent(api))
    .then(function (r) { return r.json(); })
    .then(function (j) {
      if (!j.ok) throw new Error(j.pesan || 'Balasan server tidak sah.');
      return j.data;
    });
}

/** POST aksi ke Apps Script. */
function kirim(aksi, data) {
  return fetch(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ aksi: aksi, data: data })
  }).then(function (r) { return r.json(); });
}

/* ---------- Toast ---------- */
function toast(pesan, jenis) {
  var warna = { sukses:'var(--accent)', galat:'var(--danger)', info:'var(--action)' }[jenis || 'info'];
  var el = document.createElement('div');
  el.className = 'pointer-events-auto bg-surface-container-lowest rounded-2xl px-4 py-3 shadow-lg ' +
                 'text-sm max-w-xs border border-outline-variant';
  el.style.borderLeft = '4px solid rgb(' + warna + ')';
  el.textContent = pesan;
  $('toastArea').appendChild(el);
  setTimeout(function () { el.remove(); }, 4500);
}

/* ---------- Menu mobile ---------- */
function bukaMenu()  { $('laci').hidden = false; document.body.style.overflow = 'hidden'; }
function tutupMenu() { $('laci').hidden = true;  document.body.style.overflow = ''; }


/* ========================================================================
 * MUAT DATA
 * ====================================================================== */

ambil('konten')
  .then(mulai)
  .catch(function (e) {
    toast('Gagal memuat konten. Coba muat ulang halaman.', 'galat');
    console.error(e);
  });

function mulai(data) {
  DATA = data;
  terapkanTema(data.tema.preset === 'kustom' ? data.tema : data.tema.preset);

  renderBrand(data.brand);
  renderHero(data.hero);
  renderProduk(data.produk);
  renderKelas(data.kelas, data.kurikulum);
  renderHasil(data.hasilKelas);
  renderTestimoni(data.testimoni);

  catatKunjunganSekali();
}


/* ========================================================================
 * RENDER
 * ====================================================================== */

function renderBrand(b) {
  $('namaBrand').textContent = b.nama;
  document.title = b.nama + (b.tagline ? ' — ' + b.tagline : '');
  if (b.logo) { $('logo').src = b.logo; $('logo').hidden = false; }

  var pesan = 'Halo, saya ingin bertanya tentang produk di ' + b.nama;
  var tautan = b.wa ? waLink(b.wa, pesan) : ('mailto:' + b.email);
  ['ctaNav','ctaLaci','ctaFooter','waApung'].forEach(function (id) { $(id).href = tautan; });

  $('hakCipta').textContent = '© ' + new Date().getFullYear() + ' ' + b.nama + '. Seluruh hak dilindungi.';
}

/* --- Hero slideshow --- */
var heroIdx = 0, heroTimer = null;

function renderHero(slide) {
  if (!slide.length) return;

  $('heroDot').innerHTML = slide.map(function (_, i) {
    return '<button onclick="keSlide(' + i + ')" aria-label="Slide ' + (i+1) + '" ' +
           'class="dot h-2 rounded-full transition-all" style="width:8px;background:rgb(var(--ink)/.25)"></button>';
  }).join('');

  keSlide(0);
  heroTimer = setInterval(function () { keSlide((heroIdx + 1) % slide.length); }, 5000);

  // Geser di layar sentuh
  var x0 = null, area = $('heroGambar');
  area.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive:true });
  area.addEventListener('touchend', function (e) {
    if (x0 === null) return;
    var d = e.changedTouches[0].clientX - x0;
    if (Math.abs(d) > 50) keSlide((heroIdx + (d < 0 ? 1 : slide.length - 1)) % slide.length);
    x0 = null;
  }, { passive:true });
}

function keSlide(i) {
  var s = DATA.hero[i];
  if (!s) return;
  heroIdx = i;

  $('heroTeks').innerHTML =
    '<h1 class="text-4xl lg:text-5xl font-bold leading-[1.12] text-on-secondary-fixed">' + esc(s.judul) + '</h1>' +
    '<p class="text-lg text-on-secondary-fixed/80 max-w-xl leading-relaxed">' + esc(s.subjudul) + '</p>' +
    '<div class="flex flex-wrap gap-3 pt-1">' +
      '<a href="' + esc(s.cta_link || '#produk') + '" class="pil pil-utama">' + esc(s.cta_teks || 'Lihat Produk') +
        '<span class="material-symbols-outlined text-[18px]">arrow_forward</span></a>' +
      '<a href="#kelas" class="pil pil-garis">Lihat Kelas</a>' +
    '</div>';

  $('heroGambar').className = 'aspect-[4/3] rounded-[2rem] overflow-hidden bg-surface-container-lowest/40';
  $('heroGambar').innerHTML = s.gambar_url
    ? '<img src="' + esc(s.gambar_url) + '" alt="" class="w-full h-full object-cover">' : '';

  [].forEach.call(document.querySelectorAll('#heroDot .dot'), function (d, j) {
    d.style.width = (j === i ? '24px' : '8px');
    d.style.background = (j === i ? 'rgb(var(--ink))' : 'rgb(var(--ink)/.25)');
  });
}

/* --- Kartu produk --- */
function renderProduk(list) {
  $('gridProduk').innerHTML = list.map(function (p) {
    return '<article class="kartu overflow-hidden flex flex-col">' +
      '<div class="relative aspect-video bg-surface-container">' +
        (p.gambar_url ? '<img src="' + esc(p.gambar_url) + '" alt="" class="w-full h-full object-cover">' : '') +
        '<span class="absolute top-3 left-3 px-3 py-1 rounded-lg bg-surface-container-lowest/90 text-xs font-semibold">' +
          esc(p.tipe) + '</span>' +
      '</div>' +
      '<div class="p-5 flex flex-col flex-1">' +
        '<h3 class="font-bold text-lg leading-snug klem-2">' + esc(p.nama) + '</h3>' +
        '<p class="text-sm text-on-surface-variant mt-2 klem-2">' + esc(p.deskripsi) + '</p>' +
        '<div class="flex items-center gap-2 flex-wrap mt-4">' +
          '<span class="text-2xl font-bold text-primary">' + esc(p.harga_tampil) + '</span>' +
          (p.coret_tampil ? '<span class="text-sm text-on-surface-variant line-through">' + esc(p.coret_tampil) + '</span>' : '') +
          (p.diskon > 0 ? '<span class="px-2 py-0.5 rounded-full bg-tertiary-fixed text-tertiary text-xs font-bold">Hemat ' + p.diskon + '%</span>' : '') +
        '</div>' +
        '<button onclick="bukaCheckout(\'' + esc(p.id) + '\')" class="pil pil-utama w-full justify-center mt-5">Beli Sekarang</button>' +
      '</div></article>';
  }).join('');
}

/* --- Kelas, kurikulum, video --- */
function renderKelas(k, modul) {
  if (!k) return;
  $('namaKelas').textContent = k.nama;
  $('descKelas').textContent = k.deskripsi;

  $('chipKelas').innerHTML = [['schedule', k.durasi], ['signal_cellular_alt', k.level], ['workspace_premium','Sertifikat']]
    .filter(function (c) { return c[1]; })
    .map(function (c) {
      return '<span class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-surface-container text-sm font-medium">' +
             '<span class="material-symbols-outlined text-[18px]">' + c[0] + '</span>' + esc(c[1]) + '</span>';
    }).join('');

  if (k.video_youtube_url) {
    $('videoBungkus').innerHTML =
      '<div class="relative aspect-video bg-surface-container">' +
      '<iframe id="ytVideo" class="absolute inset-0 w-full h-full" src="" title="Video profil" ' +
      'allow="accelerometer; autoplay; encrypted-media; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>' +
      '<p class="text-xs text-on-surface-variant p-3 bg-surface-container-lowest">Video diputar otomatis tanpa suara. Nyalakan suara lewat tombol di pemutar.</p>';
    siapkanVideo(k.video_youtube_url);
  }

  $('akordeon').innerHTML = modul.map(function (m, i) {
    return '<div class="bg-surface-container-lowest rounded-2xl border border-outline-variant overflow-hidden">' +
      '<button onclick="buka(' + i + ')" aria-expanded="' + (i===0) + '" ' +
        'class="w-full flex items-center gap-4 p-4 text-left hover:bg-surface-container-low transition">' +
        '<span class="w-9 h-9 rounded-full bg-secondary-fixed text-on-secondary-fixed font-bold text-sm flex items-center justify-center shrink-0">' +
          esc(m.modul_ke) + '</span>' +
        '<span class="font-semibold flex-1">' + esc(m.judul) + '</span>' +
        '<span class="material-symbols-outlined panah transition-transform" style="' + (i===0?'transform:rotate(180deg)':'') + '">expand_more</span>' +
      '</button>' +
      '<div class="isi px-4 pb-4 pl-[4.25rem]" ' + (i===0?'':'hidden') + '>' +
        '<ul class="space-y-2">' + (m.topik_list || []).map(function (t) {
          return '<li class="flex gap-2 text-sm text-on-surface-variant">' +
                 '<span class="material-symbols-outlined text-[18px] text-tertiary shrink-0">check</span>' + esc(t) + '</li>';
        }).join('') + '</ul></div></div>';
  }).join('');
}

function buka(i) {
  var kotak = document.querySelectorAll('#akordeon > div');
  [].forEach.call(kotak, function (el, j) {
    var isi = el.querySelector('.isi'), panah = el.querySelector('.panah'),
        tombol = el.querySelector('button');
    var tampil = (j === i) && isi.hasAttribute('hidden');
    isi.hidden = !tampil;
    panah.style.transform = tampil ? 'rotate(180deg)' : '';
    tombol.setAttribute('aria-expanded', tampil);
  });
}

/** Autoplay (wajib mute) saat bagian video masuk layar. */
function siapkanVideo(url) {
  var bersih = String(url).split('?')[0];
  var sudah = false;
  var pantau = new IntersectionObserver(function (entri) {
    entri.forEach(function (e) {
      if (e.isIntersecting && !sudah) {
        sudah = true;
        $('ytVideo').src = bersih + '?autoplay=1&mute=1&rel=0&playsinline=1';
        pantau.disconnect();
      }
    });
  }, { threshold: 0.4 });
  pantau.observe($('videoBungkus'));
}

/* --- Hasil kelas --- */
function renderHasil(list) {
  $('gridHasil').innerHTML = list.map(function (h) {
    var tgl = new Date(h.tanggal);
    var label = isNaN(tgl) ? '' : tgl.toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' });
    return '<article class="kartu overflow-hidden">' +
      '<div class="relative aspect-[4/3] bg-surface-container">' +
        (h.gambar_url ? '<img src="' + esc(h.gambar_url) + '" alt="" class="w-full h-full object-cover">' : '') +
        (label ? '<span class="absolute top-3 right-3 px-3 py-1 rounded-lg bg-surface-container-lowest/90 text-xs font-medium">' + label + '</span>' : '') +
      '</div>' +
      '<div class="p-5">' +
        '<h3 class="font-bold leading-snug klem-2">' + esc(h.judul) + '</h3>' +
        '<p class="text-sm text-tertiary font-medium mt-2">' + esc(h.nama_member) + '</p>' +
        '<p class="text-sm text-on-surface-variant mt-2 klem-2">' + esc(h.ringkasan) + '</p>' +
      '</div></article>';
  }).join('');
}

/* --- Testimoni --- */
function renderTestimoni(list) {
  $('gridTesti').innerHTML = list.map(function (t) {
    var n = Math.max(0, Math.min(5, Number(t.rating) || 0));
    var bintang = '';
    for (var i = 0; i < 5; i++) {
      bintang += '<span class="material-symbols-outlined text-[18px] text-primary" style="font-variation-settings:\'FILL\' ' +
                 (i < n ? 1 : 0) + '">star</span>';
    }
    return '<figure class="bg-surface-container-lowest rounded-[1.5rem] p-6 border border-outline-variant">' +
      '<div class="flex items-center gap-3">' +
        '<img src="' + esc(t.avatar_url) + '" alt="" class="w-12 h-12 rounded-full object-cover bg-surface-container">' +
        '<figcaption><p class="font-semibold">' + esc(t.nama) + '</p>' +
        '<p class="text-xs text-on-surface-variant">' + esc(t.peran) + '</p></figcaption>' +
      '</div>' +
      '<div class="flex gap-0.5 mt-4">' + bintang + '</div>' +
      '<blockquote class="text-sm leading-relaxed mt-3 text-on-surface-variant">' + esc(t.isi) + '</blockquote>' +
      '</figure>';
  }).join('');
}


/* ========================================================================
 * CHECKOUT
 * ====================================================================== */

function bukaCheckout(id) {
  produkTerpilih = DATA.produk.filter(function (p) { return String(p.id) === String(id); })[0];
  if (!produkTerpilih) return;

  $('mProdukNama').textContent  = produkTerpilih.nama;
  $('mProdukHarga').textContent = produkTerpilih.harga_tampil;
  $('mProdukGambar').src        = produkTerpilih.gambar_url || '';

  $('formTahap').hidden = false;
  $('suksesTahap').hidden = true;
  $('modal').hidden = false;
  document.body.style.overflow = 'hidden';
  setTimeout(function () { $('fNama').focus(); }, 50);
}

function tutupCheckout() {
  $('modal').hidden = true;
  document.body.style.overflow = '';
  bersihkanGalat();
}

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && !$('modal').hidden) tutupCheckout();
});

function bersihkanGalat() {
  [].forEach.call(document.querySelectorAll('.galat'), function (p) { p.hidden = true; p.textContent = ''; });
  [].forEach.call(document.querySelectorAll('#formLeads input'), function (i) {
    i.classList.remove('border-error'); i.classList.add('border-outline-variant');
  });
}

function tandaiGalat(el, pesan) {
  el.classList.add('border-error');
  el.classList.remove('border-outline-variant');
  var p = el.parentElement.querySelector('.galat');
  if (p) { p.textContent = pesan; p.hidden = false; }
}

$('formLeads').addEventListener('submit', function (e) {
  e.preventDefault();
  bersihkanGalat();

  var nama = $('fNama').value.trim(),
      prof = $('fProfesi').value.trim(),
      wa   = $('fWa').value.trim(),
      mail = $('fEmail').value.trim();

  var lolos = true;
  if (!nama) { tandaiGalat($('fNama'), 'Nama wajib diisi.'); lolos = false; }
  if (!prof) { tandaiGalat($('fProfesi'), 'Profesi wajib diisi.'); lolos = false; }
  if (!/^0?8[0-9]{7,13}$|^(\+?62)[0-9]{8,13}$/.test(wa.replace(/[\s-]/g,''))) {
    tandaiGalat($('fWa'), 'Nomor WhatsApp tidak valid.'); lolos = false;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mail)) {
    tandaiGalat($('fEmail'), 'Format email tidak valid.'); lolos = false;
  }
  if (!lolos) return;

  kunciTombol(true);

  kirim('simpanLeads', {
    nama: nama, profesi: prof, no_wa: wa, email: mail,
    produk_id: produkTerpilih.id, jebakan: $('fJebakan').value
  }).then(function (r) {
    if (!r.ok) { kunciTombol(false); toast(r.pesan || 'Gagal menyimpan.', 'galat'); return; }
    tampilkanSukses(r.link_beli);
    kunciTombol(false);
    $('formLeads').reset();
  }).catch(function (err) {
    kunciTombol(false);
    toast('Koneksi bermasalah. Coba lagi.', 'galat');
    console.error(err);
  });
});

/**
 * Layar sukses dengan tombol lanjut.
 *
 * Catatan: peramban memblokir window.open yang tidak berasal langsung dari
 * klik pengguna, dan halaman Apps Script berjalan di dalam iframe sehingga
 * aturannya lebih ketat lagi. Maka pengalihan otomatis diganti tautan nyata —
 * klik pada tautan selalu dihitung sebagai gerakan pengguna.
 */
function tampilkanSukses(link) {
  $('formTahap').hidden = true;
  $('suksesTahap').hidden = false;
  setTimeout(function () { $('barSukses').style.width = '100%'; }, 50);

  var ket = $('suksesTahap').querySelector('p');
  if (ket) ket.textContent = link
    ? 'Satu langkah lagi — lanjutkan ke halaman pembayaran.'
    : 'Admin kami akan menghubungi Anda lewat WhatsApp.';

  var area = $('aksiLanjut');
  if (!area) {
    area = document.createElement('div');
    area.id = 'aksiLanjut';
    area.className = 'space-y-2 mt-6';
    $('suksesTahap').appendChild(area);
  }
  area.innerHTML = '';

  if (link) {
    var a = document.createElement('a');
    a.href = link;
    a.target = '_blank';
    a.rel = 'noopener';
    a.className = 'pil pil-utama w-full justify-center !py-3.5';
    a.innerHTML = 'Buka Halaman Pembayaran' +
      '<span class="material-symbols-outlined text-[18px]">open_in_new</span>';
    a.addEventListener('click', function () { setTimeout(tutupCheckout, 500); });
    area.appendChild(a);
  }

  var tutup = document.createElement('button');
  tutup.type = 'button';
  tutup.className = 'block w-full text-sm text-on-surface-variant hover:text-on-surface py-2';
  tutup.textContent = link ? 'Nanti saja' : 'Tutup';
  tutup.addEventListener('click', tutupCheckout);
  area.appendChild(tutup);
}

function kunciTombol(kunci) {
  $('btnKirim').disabled = kunci;
  $('btnKirim').style.opacity = kunci ? '.6' : '';
  $('btnKirim').style.cursor = kunci ? 'not-allowed' : '';
  $('btnLabel').textContent = kunci ? 'Memproses…' : 'Lanjut ke Pembayaran';
}


/* ========================================================================
 * KUNJUNGAN — sekali per sesi peramban
 * ====================================================================== */

function catatKunjunganSekali() {
  try {
    if (sessionStorage.getItem('kunjungan_tercatat')) return;
    sessionStorage.setItem('kunjungan_tercatat', '1');
  } catch (e) { /* mode privat: tetap catat sekali */ }
  kirim('catatKunjungan', null).catch(function () { /* diabaikan bila gagal */ });
}
