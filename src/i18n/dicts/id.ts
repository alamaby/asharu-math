/**
 * Kamus Bahasa Indonesia — sumber kebenaran seluruh teks UI.
 * Entry berupa string statis atau fungsi berparameter (interpolasi type-safe).
 */

const id = {
  // Navigasi
  'tab.home': 'Beranda',
  'tab.levels': 'Belajar',
  'tab.practice': 'Latihan',
  'tab.achievements': 'Pencapaian',
  'nav.mainAria': 'Navigasi utama',
  'nav.bottomAria': 'Navigasi bawah',
  'header.back': 'Kembali',
  'header.muteSound': 'Matikan suara',
  'header.unmuteSound': 'Nyalakan suara',

  // Beranda
  'home.askName': 'Halo! Aku Asya. Sebelum mulai, siapa namamu?',
  'home.greetingNoName':
    'Halo! Aku Asya. Yuk, belajar berhitung bersusun! Mulai dari satuan, lalu lanjut ke puluhan.',
  'home.greetingName': (p: { name: string }) =>
    `Halo, ${p.name}! Yuk, belajar berhitung bersusun! Mulai dari satuan, lalu lanjut ke puluhan.`,
  'home.greetingEdit': (p: { name: string }) =>
    `Halo, ${p.name}! Mau ganti nama? Tulis yang baru di bawah ya.`,
  'home.editName': '✏️ Ubah nama',
  'home.summaryAria': 'Ringkasan progres',
  'home.levelsDone': 'Level selesai',
  'home.dayStreak': 'Hari berturut-turut',
  'home.correctCount': 'Jawaban benar',
  'home.actionsAria': 'Tindakan utama',
  'home.continueWithLevel': (p: { level: string }) => `▶ Lanjutkan: ${p.level}`,
  'home.continueNone': '▶ Lanjutkan (mulai level pertama dulu)',
  'home.startLearning': '📚 Mulai Belajar',
  'home.practice': '✏️ Latihan Soal',
  'home.recentAchievements': 'Pencapaian terbaru 🏆',

  // Form nama anak
  'form.label': 'Siapa namamu?',
  'form.placeholder': 'Nama panggilan',
  'form.ariaLabel': 'Nama panggilan anak',
  'form.save': 'Simpan Nama',
  'form.skip': 'Lewati dulu',
  'form.deviceNote': 'Nama hanya tersimpan di perangkat ini ya.',
  'form.errorEmpty': 'Tulis dulu namamu ya.',

  // Pengaturan
  'settings.title': 'Pengaturan',
  'settings.nameSection': 'Nama Anak ✏️',
  'settings.nameDesc':
    'Nama panggilan dipakai untuk sapaan dan kartu pencapaian saat dibagikan. Tidak wajib diisi.',
  'settings.deleteName': '🗑️ Hapus nama',
  'settings.languageSection': 'Bahasa 🌐',
  'settings.languageDesc': 'Perubahan langsung berlaku di seluruh aplikasi.',
  'settings.sound': 'Suara 🔊',
  'settings.soundDesc': 'Bunyi ramah saat jawaban benar atau salah',
  'settings.animations': 'Animasi ✨',
  'settings.animationsDesc':
    'Animasi kecil yang menyenangkan (dimatikan juga mengikuti pengaturan perangkat)',
  'settings.dataSection': 'Hapus Progres',
  'settings.dataDesc':
    'Semua level, skor, dan pencapaian akan dihapus dari perangkat ini. Tindakan ini tidak bisa dibatalkan.',
  'settings.deleteProgress': '🗑️ Hapus Progres',
  'settings.privacyNote':
    '🔒 Asharu Math menyimpan progres hanya di perangkat ini (localStorage) dan tidak mengumpulkan nama, foto, maupun data pribadi anak lainnya.',
  'dialog.deleteTitle': 'Hapus semua progres?',
  'dialog.deleteDesc':
    'Level selesai, skor, dan pencapaian akan hilang. Kamu bisa mulai belajar lagi dari awal.',
  'dialog.confirmDelete': 'Ya, hapus',
  'dialog.cancel': 'Batal',
  'dialog.yes': 'Ya',

  // Pilih level
  'levels.bubble':
    'Pilih level ya! Selesaikan level berurutan untuk membuka level berikutnya. Kamu juga bisa mengulang level lama kapan saja.',
  'levelCard.numbered': (p: { number: number; name: string }) => `Level ${p.number}: ${p.name}`,
  'levelCard.challenge': (p: { name: string }) => `Tantangan: ${p.name}`,
  'levelCard.start': 'Mulai',
  'levelCard.repeat': 'Mengulang',
  'levelCard.examplePrefix': 'Contoh:',
  'levelCard.questionSuffix': (p: { n: number }) => `${p.n} soal`,
  'levelCard.notFinished': 'Belum selesai',
  'levelCard.lockedHint': 'Selesaikan level sebelumnya dulu ya',

  // Pencapaian & bagikan
  'ach.bubble': (p: { count: number; total: number }) =>
    `Kamu sudah membuka ${p.count} dari ${p.total} pencapaian. Ayo kumpulkan semuanya!`,
  'ach.unlockedAt': (p: { date: string }) => `Dibuka pada ${p.date}`,
  'share.open': '🔗 Bagikan',
  'share.title': 'Bagikan Pencapaian 🎉',
  'share.closePanel': 'Tutup panel berbagi',
  'share.preparing': 'Menyiapkan gambar…',
  'share.imageAlt': (p: { name: string; child: string | null }) =>
    p.child ? `Kartu pencapaian ${p.name} milik ${p.child}` : `Kartu pencapaian ${p.name}`,
  'share.sendImage': '📤 Bagikan Gambar',
  'share.downloadImage': '⬇️ Unduh Gambar',
  'share.viaDevice': '🔗 Bagikan lewat perangkat',
  'share.copyText': '📋 Salin Teks',
  'share.sharedOk': 'Pencapaian berhasil dibagikan!',
  'share.downloadOk': 'Gambar pencapaian diunduh!',
  'share.copyOk': 'Teks pencapaian sudah disalin!',
  'share.shareFail': 'Belum bisa membagikan sekarang. Coba unduh gambarnya ya.',
  'share.copyFail': 'Belum bisa menyalin sekarang.',
  'share.template': (p: { intro: string; achievement: string; url: string }) =>
    `${p.intro}Aku mendapatkan pencapaian '${p.achievement}' di Asharu Math! Yuk, belajar matematika bersama di ${p.url}`,
  'share.introWithName': (p: { name: string }) => `Namaku ${p.name}. `,
  'ach.cardLabel': 'P E N C A P A I A N',
  'ach.greet': (p: { name: string | null }) => (p.name ? `Hebat, ${p.name}!` : 'Hebat!'),

  // Hasil sesi
  'result.titleSuffix': (p: { title: string }) => `${p.title} selesai! 🎉`,
  'result.starsAria': (p: { stars: number }) => `Kamu mendapat ${p.stars} dari 3 bintang`,
  'result.totalQuestions': 'Total soal',
  'result.firstTry': 'Benar sekali coba',
  'result.recovered': 'Diperbaiki',
  'result.newAchievements': 'Pencapaian baru! 🏆',
  'result.nextActionsAria': 'Tindakan selanjutnya',
  'result.practiceAgain': '🔁 Latihan Lagi',
  'result.retryLevel': '🔁 Ulangi Level Ini',
  'result.nextLevel': 'Level Berikutnya →',
  'result.goHome': '🏠 Beranda',

  // Mode belajar
  'learn.sessionAria': 'Progres sesi',
  'learn.questionOf': (p: { current: number; total: number }) =>
    `Soal ${p.current} dari ${p.total}`,
  'learn.progressLabel': (p: { current: number; total: number }) =>
    `Progres belajar, soal ${p.current} dari ${p.total}`,
  'learn.finishedTitle': 'Selesai! Kamu hebat! 🎉',
  'learn.preparingResult': 'Menyiapkan hasil latihan…',
  'learn.exitTitle': 'Keluar dari level?',
  'learn.exitDesc':
    'Level ini belum selesai, jadi progresnya belum tersimpan. Yuk lanjut supaya levelnya terbuka!',
  'learn.exitConfirm': 'Ya, Keluar',
  'learn.exitCancel': 'Lanjut Belajar',

  // Instruksi langkah belajar (diterjemahkan saat render)
  'steps.introAdd': (p: { first: number; second: number }) =>
    `Ayo jumlahkan ${p.first} + ${p.second}! Kita mulai dari kolom satuan. Tekan tombol Berikutnya untuk mulai.`,
  'steps.introSub': (p: { first: number; second: number }) =>
    `Ayo kurangkan ${p.first} − ${p.second}! Mulai dari kolom satuan. Tekan tombol Berikutnya untuk mulai.`,
  'steps.writeCarryAnswer': (p: { carryIn: number; place: string }) =>
    `Tulis angka simpan ${p.carryIn} di kotak jawaban ${p.place}.`,
  'steps.interimFirst': (p: { a: number; b: number }) =>
    `Mulai dari satuan. Berapa ${p.a} + ${p.b}? Tulis hasilnya di Kotak Hitung, lalu tekan tombol hijau Periksa.`,
  'steps.interimNext': (p: { sumText: string }) =>
    `Sekarang hitung ${p.sumText}. Tulis hasilnya di Kotak Hitung, lalu tekan tombol hijau Periksa.`,
  'steps.answerFromSum': (p: { rawSum: number; digit: number; place: string }) =>
    `Hasilnya ${p.rawSum}. Tulis ${p.digit} di kotak jawaban ${p.place}.`,
  'steps.writeCarryBox': (p: { carryOut: number; place: string }) =>
    `Simpan angka ${p.carryOut} di kotak simpan ${p.place}.`,
  'steps.writeAnswerPlain': (p: { digit: number; place: string }) =>
    `Tulis ${p.digit} di kotak jawaban ${p.place}.`,
  'steps.reviewAdd': (p: { first: number; second: number; result: number }) =>
    `Hebat! ${p.first} + ${p.second} = ${p.result}.`,
  'steps.reviewSub': (p: { first: number; second: number; result: number }) =>
    `Hebat! ${p.first} − ${p.second} = ${p.result}.`,
  'steps.borrowQuestion': (p: { top: number; bottom: number }) =>
    `Apakah ${p.top} bisa dikurangi ${p.bottom}?`,
  'steps.borrowExplainChain': (p: { top: number; bottom: number }) =>
    `${p.top} tidak cukup dikurangi ${p.bottom}, sedangkan kolom di sebelah kiri bernilai 0. Pinjaman diteruskan sampai ketemu kolom yang bisa memberi. Lihat perubahannya, lalu tekan Berikutnya.`,
  'steps.borrowExplainSimple': (p: { top: number; bottom: number; leftPlace: string }) =>
    `${p.top} tidak cukup dikurangi ${p.bottom}. Kita pinjam 10 dari kolom ${p.leftPlace}. Lihat perubahannya, lalu tekan Berikutnya.`,
  'steps.subtractAfterBorrow': (p: { topAfter: number; bottom: number; place: string }) =>
    `Sekarang berapa ${p.topAfter} − ${p.bottom}? Tulis hasilnya di kotak ${p.place}.`,
  'steps.subtractChainMid': (p: { topAfter: number; bottom: number; place: string }) =>
    `Ingat, angka 0 tadi sudah dipinjam lalu meminjam 10 sehingga menjadi ${p.topAfter}. Berapa ${p.topAfter} − ${p.bottom}? Tulis di kotak ${p.place}.`,
  'steps.subtractPlain': (p: {
    original: number
    effective: number
    bottom: number
    place: string
  }) => {
    const reminder =
      p.effective !== p.original
        ? `Ingat, ${p.original} sudah dipinjam 1 sehingga menjadi ${p.effective}. `
        : ''
    return `${reminder}Berapa ${p.effective} − ${p.bottom}? Tulis di kotak ${p.place}.`
  },

  // Nilai tempat
  'answer.aria': (p: { place: string; value: number | null }) =>
    p.value === null
      ? `Kotak jawaban ${p.place}, kosong`
      : `Kotak jawaban ${p.place}, berisi ${p.value}`,
  'carry.aria': (p: { place: string; value: number | null }) =>
    p.value === null
      ? `Kotak simpan ${p.place}, kosong`
      : `Kotak simpan ${p.place}, berisi ${p.value}`,
  'borrow.newValueAria': (p: { place: string; after: number }) =>
    `Nilai baru kolom ${p.place}: ${p.after}`,
  'borrow.becomes': (p: { place: string; after: number }) => `${p.place} menjadi ${p.after}`,
  'learn.adhocTitle': 'Belajar Langkah demi Langkah',
  'practice.sessionTitle': 'Latihan Soal',
  'practice.customSessionTitle': 'Soal Buatan Sendiri',
  'mascot.aria': 'Asya, maskot Asharu Math',
  'place.units': 'satuan',
  'place.tens': 'puluhan',
  'place.hundreds': 'ratusan',
  'place.thousands': 'ribuan',
  'join.and': ' dan ',

  // Petunjuk latihan
  'hint.genericRight': 'Ingat, mulai dari sebelah kanan.',
  'hint.genericUnits': 'Coba periksa kolom satuan dulu.',
  'hint.genericSlow': 'Hitung pelan-pelan satu kolom ya.',
  'hint.places': (p: { places: string }) => `Hampir benar! Periksa lagi kolom ${p.places}.`,
  'hint.carry': 'Apakah ada angka yang perlu disimpan? Coba hitung ulang dari satuan.',
  'hint.borrow':
    'Coba lihat kotak pinjamnya. Jika angka atas tidak cukup, pinjam 10 dari kolom sebelah kiri.',
  'hint.columnwise': 'Jumlahkan tiap kolom dari kanan, lalu cocokkan satu per satu.',
  'hint.guided': 'Ayo belajar bersama langkah demi langkah supaya lebih mudah!',

  // Mode latihan
  'practice.bubble': 'Mau latihan apa hari ini? Pilih jenis soalnya, atau buat soalmu sendiri!',
  'practice.configTitle': 'Pengaturan Latihan',
  'practice.operationLabel': 'Jenis soal',
  'practice.op.addition': 'Penjumlahan saja',
  'practice.op.subtraction': 'Pengurangan saja',
  'practice.op.mixed': 'Campuran',
  'practice.digitsLabel': 'Jumlah digit',
  'practice.digitOption': (p: { n: number }) => `${p.n} digit`,
  'practice.countLabel': 'Jumlah soal',
  'practice.countOption': (p: { n: number }) => `${p.n} soal`,
  'practice.carryLabel': 'Kesulitan',
  'practice.carry.none': 'Tanpa menyimpan / meminjam',
  'practice.carry.required': 'Dengan menyimpan / meminjam',
  'practice.carry.any': 'Campuran',
  'practice.start': 'Mulai Latihan',
  'practice.customTitle': 'Buat Soal Sendiri ✏️',
  'practice.customDesc': 'Ketik dua angka (maksimal 4 digit), lalu kerjakan bersusun di sini!',
  'practice.topNumber': 'Angka atas',
  'practice.bottomNumber': 'Angka bawah',
  'practice.topAria': 'Angka atas untuk soal buatan sendiri',
  'practice.bottomAria': 'Angka bawah untuk soal buatan sendiri',
  'practice.addBtn': '+ Tambah',
  'practice.subBtn': '− Kurang',
  'practice.groupAria': 'Pilih operasi',
  'practice.doIt': 'Kerjakan Soal Ini',
  'practice.progressAria': 'Progres latihan',
  'practice.hintFooter':
    'Ketuk kotak jawaban untuk memilih kolom. Isi dari kanan (satuan) dulu ya!',
  'practice.offerGuided': 'Mau belajar soal ini langkah demi langkah bersama Asya?',
  'practice.guidedYes': 'Ya, ayo belajar!',
  'practice.guidedNo': 'Lanjut coba sendiri',
  'practice.praise1': 'Benar! Hebat!',
  'practice.praise2': 'Bagus sekali!',
  'practice.praise3': 'Kamu berhasil!',
  'practice.praise4': 'Luar biasa!',
  'feedback.wrongPractice': 'Belum tepat. Lihat petunjuk di bawah ya.',
  'feedback.nextProblem': 'Bagus! Lanjut ke soal berikutnya!',

  // Keyboard & panduan
  'keypad.groupAria': 'Keyboard angka',
  'keypad.digit': (p: { digit: number }) => `Angka ${p.digit}`,
  'keypad.backspace': 'Hapus satu angka',
  'keypad.checkDefault': 'Periksa',
  'guide.sectionAria': 'Panduan langkah',
  'guide.next': 'Berikutnya →',
  'guide.back': '← Kembali',
  'guide.repeat': '↻ Ulangi Penjelasan',
  'guide.countingBox': 'Kotak Hitung:',
  'guide.canBorrow': 'Bisa',
  'guide.cannotBorrow': 'Tidak bisa',
  'guide.interimAria': (p: { value: string | null }) =>
    p.value === null
      ? 'Kotak hitung sementara, kosong'
      : `Kotak hitung sementara, berisi ${p.value}`,

  // Tombol pasang aplikasi
  'install.button': '📲 Pasang Aplikasi',
  'install.iosPre': '📲 Pasang di iPhone: tekan tombol',
  'install.iosShare': 'Bagikan',
  'install.iosMid': 'di Safari, lalu pilih',
  'install.iosAdd': 'Tambahkan ke Layar Utama',
  'install.dismissAria': 'Tutup petunjuk pemasangan',
}

export default id
export type Dict = typeof id
