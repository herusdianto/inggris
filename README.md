# English Quest 🦊

Game web untuk belajar bahasa Inggris dari **TK sampai Advanced**. Tanpa build, tanpa backend — cukup HTML, CSS, dan JavaScript.

## Menjalankan

```bash
python3 -m http.server 8000
# buka http://localhost:8000
```

(Bisa juga langsung membuka `index.html` di browser.)

## Fitur

- **6 jenjang, 31 unit**: TK · SD · SMP · SMA · Upper-Intermediate · Advanced
- **7 jenis mini-game**: tebak gambar, dengarkan & pilih (text-to-speech), eja huruf, lengkapi kalimat, pilihan ganda/terjemahan, susun kalimat, cocokkan pasangan
- Soal yang salah diulang di akhir pelajaran dan masuk ke menu **Ulangi**
- **Progres harian**: target XP harian, streak 🔥, grafik XP 7/30 hari, kalender aktivitas 16 minggu
- Bintang per unit, unit terbuka berurutan, tantangan harian (+30 XP), combo, 18 lencana
- **Tema terang / gelap / ikuti sistem**
- Data tersimpan di `localStorage`; bisa ekspor/impor JSON dari menu Pengaturan

## Struktur

```
index.html
css/style.css
js/data.js   ← materi pelajaran (tambah unit/soal di sini)
js/app.js    ← logika game, progres, tampilan
```

### Menambah materi

Tambahkan unit di `LEVELS` pada `js/data.js`:

```js
{
  id: 'sd-colors2', title: 'More Colors', titleId: 'Warna Lagi', emoji: '🎨',
  tip: 'Ringkasan materi (opsional)',
  vocab: [['🩷', 'pink', 'merah muda']],                       // otomatis jadi game gambar/dengar/eja/cocokkan
  qs: [{ t: 'fill', q: 'The sky is ___.', a: 'blue', o: ['blue', 'red', 'green', 'pink'], ex: 'Penjelasan' }],
  sentences: [['I like pink', 'Saya suka merah muda']],        // game susun kalimat
}
```
