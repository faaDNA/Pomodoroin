# Product Requirements Document (PRD): Pomodoroin

## 1. Executive Summary

- **Problem Statement**: Pengembang membutuhkan aplikasi Pomodoro sederhana tanpa autentikasi untuk melatih integrasi frontend Next.js dan backend Spring Boot.
- **Proposed Solution**: Web timer Pomodoro ringan ("Pomodoroin") dengan alur timer focus/break, alarm audio, kustomisasi durasi, dan data tanpa database.
- **Success Criteria**:
  - Timer akurasi 100% tanpa drift > 1 detik per 25 menit.
  - Audio alarm berbunyi tepat waktu saat countdown menyentuh `00:00`.
  - Frontend First Contentful Paint (FCP) < 0.8 detik di lingkungan lokal.
  - API Spring Boot merespons dalam < 50ms.

---

## 2. User Experience & Functionality

### User Personas
- **Developer / Student**: Pengguna yang butuh alat bantu fokus langsung pakai tanpa registrasi.

### User Stories & Acceptance Criteria

1. **User Story - Timer Utama**:
   - *As a user*, saya ingin menjalankan, pause, dan reset timer Pomodoro agar bisa mengatur sesi kerja dan istirahat.
   - **Acceptance Criteria**:
     - Mode default: Focus (25 min), Short Break (5 min), Long Break (15 min).
     - Tombol Start/Pause/Reset merespons instant (< 100ms).
     - Display waktu format `MM:SS` di UI dan browser tab title (misal `24:59 - Focus`).

2. **User Story - Kustomisasi Durasi**:
   - *As a user*, saya ingin mengubah durasi focus/break sesuai kebutuhan saya.
   - **Acceptance Criteria**:
     - Form input menit untuk Focus, Short Break, dan Long Break.
     - Nilai tersimpan otomatis di `localStorage` browser.
     - Reset timer langsung mengikuti aturan nilai baru.

3. **User Story - Notifikasi Audio**:
   - *As a user*, saya ingin mendengar suara alarm saat sesi berakhir agar tidak melewati waktu.
   - **Acceptance Criteria**:
     - Memakai Web Audio API / HTML5 Audio (suara beep).
     - Alarm berbunyi 3x siklus beep saat timer mencapai `00:00`.
     - Opsi Mute/Unmute audio di UI.

### Non-Goals
- Tidak ada sistem autentikasi / login pengguna.
- Tidak ada database persistensi (PostgreSQL/MySQL/MongoDB).
- Tidak ada fitur multiplayer / room focus bersama.

---

## 3. AI System Requirements
- *Not Applicable*

---

## 4. Technical Specifications

### Architecture Overview
```
+----------------------------------------------------+
|                Client (Browser)                    |
|                                                    |
|  +----------------------------------------------+  |
|  |           Next.js (App Router)               |  |
|  |  - React State (Timer logic, Audio player)   |  |
|  |  - localStorage (Preset duration configs)    |  |
|  +-----------------------+----------------------+  |
+--------------------------|-------------------------+
                           | HTTP / REST API
+--------------------------v-------------------------+
|                Spring Boot (Maven)                 |
|  - Health Check Endpoint (/api/health)             |
|  - App Metadata / Default Settings (/api/config)   |
|  - In-Memory Stat Counter (/api/stats)             |
+----------------------------------------------------+
```

### Integration Points
- **GET `/api/health`**: Ping status backend.
- **GET `/api/config`**: Ambil konfigurasi default timer dari Spring Boot.
- **POST `/api/stats/complete`**: Increment total sesi Pomodoro selesai (disimpan di in-memory Spring Boot runtime).

### Security & Privacy
- Zero PII tersimpan.
- CORS policy: Spring Boot mengizinkan origin frontend Next.js (`http://localhost:3000`).

---

## 5. Risks & Roadmap

### Phased Rollout (Backend First)

- **Phase 1: Backend Spring Boot (MVP)**:
  - Setup Spring Boot 3+ (Maven, Java 17/21).
  - Web dependency (`spring-boot-starter-web`).
  - Endpoint `GET /api/health`, `GET /api/config`, `POST /api/stats/complete`.
  - CORS configuration (`http://localhost:3000`).

- **Phase 2: Frontend Next.js**:
  - Setup Next.js App Router + Tailwind CSS.
  - Integration REST API backend.
  - Timer logic, Audio player, `localStorage`.

### Technical Risks & Mitigations
- **Risk**: Browser background tab throttling membuat JavaScript `setInterval` melambat.
  - **Mitigation**: Gunakan Timestamp delta (`Date.now()`) untuk hitung sisa waktu.
