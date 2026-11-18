# Modernisasi PWA Install Prompt Discriminated Union

Tanggal: 2026-11-18 11:18:00
Topik: `refactor(pwa): modernize useInstallPrompt return signature to discriminated union`

## Task / Masalah
Hook `useInstallPrompt` sebelumnya mengembalikan sekumpulan boolean terpisah (`canInstall`, `installed`, `isIos`, `showIosHint`) yang berpotensi menghasilkan status mustahil (*impossible states*), seperti status terpasang (`installed: true`) namun dialog instalasi tetap aktif (`canInstall: true`) atau instruksi iOS tetap tampil.

## Berkas yang Diubah
- `src/hooks/useInstallPrompt.ts`: Mengubah return signature menjadi discriminated union `InstallPromptResult` dengan diskriminator `status: 'installed' | 'available' | 'ios_instructions' | 'unsupported'`, dengan tetap mempertahankan properti pendukung untuk backward compatibility 100%.
- `src/components/common/InstallButton.tsx`: Merefaktor logika render menggunakan `switch (pwa.status)` yang terverifikasi secara statis tanpa tumpang tindih kondisi.
- `tests/useInstallPrompt.test.tsx`: Menambahkan asersi `state.status` untuk setiap transisi siklus instalasi PWA.
- `plans/2026-11-18-explicit-state-machines-modernization.md`: Update task dan progress log.

## Keputusan Teknis & Bisnis
- Menetapkan hierarki prioritas status:
  1. `installed`: Pengguna/anak yang sudah memasang aplikasi tidak boleh diganggu oleh tombol/dialog instalasi.
  2. `available`: Tersedia `beforeinstallprompt` browser native (Chromium/Android) untuk alur instalasi satu klik.
  3. `ios_instructions`: Safari iOS tanpa API prompt programatik, menampilkan kartu panduan 'Add to Home Screen' selama belum ditutup pengguna.
  4. `unsupported`: Fallback untuk browser non-PWA atau setelah petunjuk ditutup.
- Mempertahankan backward compatibility penuh pada return signature hook sehingga konsumen yang mendestruktur properti boolean lama tetap berjalan tanpa regresi.

## Verifikasi
- `npm run typecheck` (`tsc --noEmit`): 0 error.
- `npx vitest run tests/useInstallPrompt.test.tsx tests/screens/HomeScreen.test.tsx`: 18/18 tes lulus.

## Proposed Commit Message
`refactor(pwa): modernize useInstallPrompt return signature to discriminated union`
