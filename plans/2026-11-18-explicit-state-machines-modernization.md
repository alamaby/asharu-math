# Modernisasi Mesin Status Implisit (Explicit State Machines Modernization)

Created: 2026-11-18 08:55:00

## Objective
Mengidentifikasi seluruh mesin status implisit (*implicit state machines*) di dalam aplikasi Asharu Math, dan merumuskan perubahan arsitektur terpadu yang meningkatkan Pengalaman Pengguna (*User Experience* / UX), Pengalaman Pengembang (*Developer Experience* / DX), dan Pengalaman Agen AI (*Agent Experience* / AX) secara simultan tanpa merusak perilaku fungsional yang sudah berjalan (*zero behavioral regression*).

## Scope
- Analisis seluruh layar latihan dan belajar: `LearnScreen`, `PracticeScreen`, `ConceptLearnScreen`, `StoryLearnScreen`, `GardenScreen` (`MagicAppleGarden`), `AquariumScreen` (`CheerfulAquarium`), dan `TrainScreen` (`TrainScene`).
- Analisis manajemen konteks dan infrastruktur: `NavigationContext` (leave-guard), `ProgressContext`, `useInstallPrompt` (PWA lifecycle), dan `ShareAchievement`.
- Analisis resolver navigasi antar level: `LevelSelectScreen`, `HomeScreen`, dan `ResultScreen`.
- Komponen papan interaktif nilai tempat: `StackedPlaceValueBoard`.

## Milestones
1. **Fase 1: Audit & Pemetaan Menyeluruh Mesin Status Implisit** — Mengidentifikasi variabel status yang terpecah, race condition, dan sidecar flags di seluruh modul.
2. **Fase 2: Perbaikan Bug Routing & Pemusatan Level Resolver** — Memperbaiki diskrepansi routing `kebun-` dan `akuarium-` antara `HomeScreen`, `LevelSelectScreen`, dan `ResultScreen`.
3. **Fase 3: Refaktorisasi Layar Sesi Belajar Kuis Ringan** — Mengabstraksi `ConceptLearnScreen` dan `StoryLearnScreen` ke dalam reducer kuis berbasis discriminated union.
4. **Fase 4: Rekonstruksi Layar Interaktif Nilai Tempat** — Mengubah 15+ `useState` pada `MagicAppleGarden` dan `CheerfulAquarium` menjadi explicit state machine.
5. **Fase 5: Pengaktifan Mesin Status Kereta Terpadu** — Menghubungkan `trainStateMachine.ts` secara nyata ke `TrainScreen.tsx` dan `TrainScene.ts`.
6. **Fase 6: Modernisasi Leave-Guard Navigasi & Lifecycle PWA/Share** — Membersihkan kontrak penahanan navigasi dan siklus instalasi/berbagi kartu.

## Tasks
- [x] Buat fungsi kanonikal `resolveScreenForLevel(levelId: string): Screen` untuk menyelesaikan rute level di satu sumber kebenaran.
- [x] Satukan siklus hidup kuis konsep dan soal cerita ke dalam pure reducer `questionSessionMachine` dan hook `useQuestionSession`.
- [ ] Satukan dual-session state di `PracticeScreen.tsx` menjadi single discriminated union.
- [ ] Gantikan `autoAdvanceToken` dan ref guard di `LearnScreen.tsx` dengan explicit step status lifecycle.
- [ ] Satukan 15+ flag di `MagicAppleGarden.tsx` dan `CheerfulAquarium.tsx` ke dalam `placeValueWorldReducer`.
- [ ] Sambungkan `transitionTrain` dari `trainStateMachine.ts` ke dalam event handler `TrainScreen.tsx`.
- [ ] Ubah return value `useInstallPrompt` menjadi discriminated union status PWA.
- [ ] Modernisasi state modal `ShareAchievement.tsx` dengan penanganan status kegagalan kanvas.

## Risks
- **Regresi Animasi dan Audio Berantai**: Perubahan dari `useEffect` berbasis `setTimeout` ke explicit reducer dapat memengaruhi urutan audio WebAudio/TTS jika adapter efek samping tidak sinkron dengan tepat.
- **Kompatibilitas Komponen Three.js**: Scene 3D pada Kereta dan Akuarium berjalan di luar siklus React; transisi state React tidak boleh memicu re-render canvas yang memutus frame rate 60 FPS.
- **Kontrak Metadata Riwayat & Storage**: Struktur data `SessionSummary`, `UserProgress`, dan `TrainSessionSnapshot` harus dijaga 100% identik agar tidak merusak data lokal pengguna (`localStorage`).

## Progress Log
- 2026-11-18 08:55:00 — Dokumen plan disusun berdasarkan audit mendalam terhadap seluruh berkas sumber di `src/`.
- 2026-11-18 09:12:00 — Prioritas 1 selesai: implementasi `resolveScreenForLevel` di `src/data/levels.ts` dan integrasi di `LevelSelectScreen`, `HomeScreen`, dan `ResultScreen`. 33 test suites lulus (v1.14.2).
- 2026-11-18 09:32:00 — Prioritas 2 selesai: pembuatan pure reducer `questionSessionMachine` dan custom hook `useQuestionSession` untuk unifikasi `ConceptLearnScreen` dan `StoryLearnScreen`. 62 test files (438 tests) lulus 100%.

## Notes
- Semua usulan perubahan mempertahankan kontrak props publik, aturan pedagogis matematika anak SD (mis. susunan angka tanpa `reverse()`), dan sistem penyimpanan lokal saat ini.
