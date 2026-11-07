# Pomodoroin

Pomodoro timer sederhana tanpa login dan tanpa database. Timer fokus/istirahat, durasi kustom, alarm saat sesi habis, dan total menit fokus yang sudah diselesaikan (mis. 25 + 25 menit → "50 menit fokus"). Data durasi dan riwayat sesi disimpan di `localStorage` browser; backend Spring Boot hanya menyediakan konfigurasi default dan salinan total menit secara in-memory.

```
backend/    Spring Boot 3.3 (Java 17, Maven wrapper)
frontend/   Next.js 16 App Router + Tailwind CSS v4
```

## Prasyarat

- Java 17 atau lebih baru (`java -version`) — Maven tidak perlu, pakai `mvnw.cmd`
- Node.js 18 atau lebih baru (`node -v`)

## Menjalankan

Butuh dua terminal.

**1. Backend** (`http://localhost:8080`)

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

Linux/macOS: `./mvnw spring-boot:run`

**2. Frontend** (`http://localhost:3000`)

```powershell
cd frontend
npm install
npm run dev
```

Buka http://localhost:3000.

Backend boleh mati — app tetap jalan penuh secara lokal.

## API

| Method | Path                  | Keterangan                                                 |
| ------ | --------------------- | ---------------------------------------------------------- |
| GET    | `/api/health`         | cek status                                                 |
| GET    | `/api/config`         | durasi default (menit)                                     |
| GET    | `/api/stats`          | `{ completed, totalMinutes }` total sesi & menit fokus     |
| POST   | `/api/stats/sessions` | `{ sessions: [{ id, minutes }] }` simpan sesi (idempotent) |

CORS hanya mengizinkan `http://localhost:3000`. Ganti port frontend → ubah `WebConfig.java`.

## Test & cek

```powershell
cd backend;  .\mvnw.cmd test        # MockMvc: health, config, akumulasi total menit
cd frontend; npm run lint           # eslint
cd frontend; npm run build          # build produksi
cd frontend; npm run check:ui       # butuh app jalan di :3000
```

`check:ui` memakai Chrome + puppeteer-core: cek overflow responsif di 390px, modal pengaturan (buka via tombol, tutup via Esc), siklus 4 putaran yang harus berakhir di istirahat panjang, field durasi yang harus boleh kosong sebelum diketik ulang, timer berjalan (25:00 → detik berkurang), judul tab, dan hydration setelah durasi diubah lalu refresh. Screenshot tersimpan di `.impeccable/review/`.

## Struktur singkat

- `frontend/src/app/page.tsx` — seluruh UI + logika timer (client component). Durasi dan riwayat sesi fokus disimpan lewat `useSyncExternalStore` agar aman dari hydration mismatch; alarm memakai Web Audio API.
- `frontend/src/app/layout.tsx`, `globals.css` — font Geist/Geist Mono, ground gelap.
- `backend/src/main/java/com/pomodoroin/backend/PomodoroController.java` — endpoint REST.
- `backend/src/main/java/com/pomodoroin/backend/WebConfig.java` — CORS.
- `PRD.md`, `PRODUCT.md`, `DESIGN.md` — kebutuhan produk dan sistem desain.

## Catatan

- Total menit di backend hilang saat restart (in-memory, tanpa database); frontend otomatis mereplay sesi lokal saat backend terhubung kembali.
- Kunci `localStorage`: `pomodoroin.durations` (durasi) dan `pomodoroin.sessions` (riwayat sesi fokus).
- Ganti nama produk? Cari `Pomodoroin`/`pomodoroin` di `frontend/src`, `backend/`, dan dokumen.
