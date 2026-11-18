/**
 * Mesin status modal berbagi pencapaian (ShareAchievement).
 *
 * Menggantikan variabel status tersebar (open, imageBlob, imageUrl, busy, message)
 * dengan discriminated union `phase` untuk mencegah impossible states:
 * - 'closed': panel tidak tampil di layar.
 * - 'rendering': dialog terbuka, canvas sedang menggambar kartu pencapaian.
 * - 'ready': gambar kartu siap dibagikan/diunduh secara visual.
 * - 'error': canvas gagal atau tidak didukung di lingkungan pengguna; teks dan tautan tetap dapat dibagikan.
 */

export type ShareDialogPhase = 'closed' | 'rendering' | 'ready' | 'error'

export type ShareDialogState =
  | {
      phase: 'closed'
    }
  | {
      phase: 'rendering'
      feedback: string | null
    }
  | {
      phase: 'ready'
      imageBlob: Blob
      imageUrl: string
      busy: boolean
      feedback: string | null
    }
  | {
      phase: 'error'
      feedback: string | null
    }

export type ShareDialogAction =
  | { type: 'OPEN' }
  | { type: 'IMAGE_READY'; blob: Blob; url: string }
  | { type: 'IMAGE_FAILED'; feedback?: string }
  | { type: 'SET_BUSY'; busy: boolean }
  | { type: 'SET_FEEDBACK'; message: string }
  | { type: 'CLOSE' }

export const initialShareDialogState: ShareDialogState = {
  phase: 'closed',
}

/**
 * Pure reducer untuk siklus modal berbagi pencapaian.
 *
 * Alasan bisnis transisi:
 * 1. OPEN: Mengalihkan langsung ke fase 'rendering' agar pratinjau kartu lama yang mungkin kadaluwarsa tidak muncul sesaat.
 * 2. IMAGE_READY: Hanya diterima saat sedang 'rendering'. Mengaktifkan tombol 'Kirim Gambar' dan 'Unduh Gambar'.
 * 3. IMAGE_FAILED: Menghindari pengguna terjebak di skeleton loading tanpa akhir saat canvas tidak didukung.
 * 4. SET_BUSY: Mencegah spam klik tombol berbagi saat proses transfer Web Share API sedang berlangsung.
 * 5. CLOSE: Menutup dialog dan membersihkan state.
 */
export function shareDialogReducer(
  state: ShareDialogState,
  action: ShareDialogAction,
): ShareDialogState {
  switch (action.type) {
    case 'OPEN':
      return {
        phase: 'rendering',
        feedback: null,
      }

    case 'IMAGE_READY':
      if (state.phase !== 'rendering') return state
      return {
        phase: 'ready',
        imageBlob: action.blob,
        imageUrl: action.url,
        busy: false,
        feedback: null,
      }

    case 'IMAGE_FAILED':
      if (state.phase !== 'rendering') return state
      return {
        phase: 'error',
        feedback: action.feedback ?? null,
      }

    case 'SET_BUSY':
      if (state.phase !== 'ready') return state
      return {
        ...state,
        busy: action.busy,
      }

    case 'SET_FEEDBACK':
      if (state.phase === 'closed') return state
      return {
        ...state,
        feedback: action.message,
      }

    case 'CLOSE':
      return {
        phase: 'closed',
      }

    default:
      return state
  }
}
