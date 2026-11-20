// news-image-20261120: koran satu halaman untuk Jumat 20 November 2026.
// Gambarnya adalah entry.jpg di samping file ini. Program ini memeriksa
// bahwa gambar itu JPEG 1024x1024 yang lengkap dan di bawah 1 MiB, lalu
// menyalinnya ke direktori output sebagai entry.png dan memeriksa ulang
// salinannya byte-per-byte, supaya dua kali jalan menghasilkan byte yang sama.
//
// Menjalankan sendiri: mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import * as berkas from 'node:fs';
import * as kripto from 'node:crypto';
import * as jalur from 'node:path';
import { fileURLToPath as ubahUrlKeJalur } from 'node:url';

// Folder tempat main.ts berada.
const FOLDER = jalur.dirname(ubahUrlKeJalur(import.meta.url));
const NAMA = 'entry.jpg';
const BATAS = 1048576; // 1 MiB
const SISI = 1024;

type Ukuran = { lebar: number; tinggi: number };

// Ukuran dari segmen SOF0/SOF2 pertama; undefined bila bukan JPEG atau
// tidak ada segmen ukuran sebelum penanda akhir gambar.
function ukurJpeg(isi: Buffer): Ukuran | undefined {
  if (isi.length < 4 || isi[0] !== 0xff || isi[1] !== 0xd8) return undefined;
  let pos = 2;
  let ketemu: Ukuran | undefined;
  while (pos + 4 <= isi.length && ketemu === undefined) {
    if (isi[pos] !== 0xff) break;
    const kode = isi[pos + 1];
    if (kode === 0xd9) break; // EOI: akhir gambar, ukuran tidak ketemu
    if (kode === 0x01 || (kode >= 0xd0 && kode <= 0xd7)) {
      pos += 2;
      continue;
    }
    const panjang = isi.readUInt16BE(pos + 2);
    if (panjang < 2 || pos + 2 + panjang > isi.length) break;
    if (kode === 0xc0 || kode === 0xc2) {
      ketemu = { tinggi: isi.readUInt16BE(pos + 5), lebar: isi.readUInt16BE(pos + 7) };
    } else {
      pos += 2 + panjang;
    }
  }
  return ketemu;
}

function sidikJari(isi: Buffer): string {
  return kripto.createHash('sha256').update(isi).digest('hex');
}

function berhenti(pesan: string, kode: number): never {
  process.stderr.write(`news-image-20261120: ${pesan}\n`);
  process.exit(kode);
}

const sumber = jalur.join(FOLDER, NAMA);
if (!berkas.existsSync(sumber)) {
  berhenti(`tidak ada ${NAMA} di samping main.ts; jalankan compose.py dulu`, 2);
}
const asli = berkas.readFileSync(sumber);
if (asli.length > BATAS) {
  berhenti(`${NAMA} besarnya ${asli.length} byte, melewati batas ${BATAS} byte`, 1);
}
const ukuran = ukurJpeg(asli);
if (ukuran === undefined) {
  berhenti(`${NAMA} tidak punya penanda ukuran JPEG`, 1);
}
if (ukuran.lebar !== SISI || ukuran.tinggi !== SISI) {
  berhenti(`${NAMA} ukurannya ${ukuran.lebar}x${ukuran.tinggi}, harusnya ${SISI}x${SISI}`, 1);
}

const folderKeluar = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
berkas.mkdirSync(folderKeluar, { recursive: true });
const tujuan = jalur.join(folderKeluar, 'entry.png');
berkas.writeFileSync(tujuan, asli);
const salinan = berkas.readFileSync(tujuan);
if (salinan.length !== asli.length || sidikJari(salinan) !== sidikJari(asli)) {
  berhenti(`salinan di ${tujuan} tidak sama persis dengan ${NAMA}`, 1);
}
// Baca lagi penanda ukuran dari salinannya sendiri: tujuan yang terpotong
// atau tertukar akan ketahuan di sini walau jumlah byte-nya kebetulan sama.
const ukuranSalinan = ukurJpeg(salinan);
if (ukuranSalinan === undefined || ukuranSalinan.lebar !== SISI || ukuranSalinan.tinggi !== SISI) {
  berhenti(`salinan di ${tujuan} tidak terbaca sebagai JPEG ${SISI}x${SISI}`, 1);
}
process.stdout.write(`news-image-20261120: menulis ${tujuan} (${salinan.length} byte, JPEG 1024x1024, sha256 ${sidikJari(salinan).slice(0, 16)}...)\n`);
