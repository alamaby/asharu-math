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
  'home.levelsPerGrade': (p: { k1: number; k1Total: number; k2: number; k2Total: number }) =>
    `K1 ${p.k1}/${p.k1Total} · K2 ${p.k2}/${p.k2Total}`,
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
    'Pilih level mana saja ya! Kamu bebas mencoba level apapun. Mengulang level lama kapan saja juga boleh.',
  'levels.grade1': 'Kelas 1 — Fondasi',
  'levels.grade2': 'Kelas 2 — Bersusun',
  'levelCard.numbered': (p: { number: number; name: string }) => `Level ${p.number}: ${p.name}`,
  'levelCard.challenge': (p: { name: string }) => `Tantangan: ${p.name}`,
  'levelCard.start': 'Mulai',
  'levelCard.repeat': 'Mengulang',
  'levelCard.examplePrefix': 'Contoh:',
  'levelCard.questionSuffix': (p: { n: number }) => `${p.n} soal`,
  'levelCard.notFinished': 'Belum selesai',
  'levelCard.neverTried': '✨ Belum dicoba',
  'levelCard.perfect': '🏆 Sempurna!',

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
    'Level ini belum selesai, jadi progresnya belum tersimpan. Yuk lanjut supaya bintangnya terkumpul!',
  'learn.exitConfirm': 'Ya, Keluar',
  'learn.exitCancel': 'Lanjut Belajar',

  // Instruksi langkah belajar (diterjemahkan saat render)
  'steps.introAdd': (p: { first: number; second: number }) =>
    `Ayo jumlahkan ${p.first} + ${p.second}! Kita mulai dari kolom satuan. Tekan tombol Berikutnya untuk mulai.`,
  'steps.introSub': (p: { first: number; second: number }) =>
    `Ayo kurangkan ${p.first} − ${p.second}! Mulai dari kolom satuan. Tekan tombol Berikutnya untuk mulai.`,
  'steps.interimFirst': (p: { a: number; b: number }) =>
    `Mulai dari satuan. Berapa ${p.a} + ${p.b}? Tulis hasilnya di Kotak Hitung — kotak jawaban ikut terisi otomatis.`,
  'steps.interimNext': (p: { sumText: string }) =>
    `Sekarang hitung ${p.sumText}. Tulis hasilnya di Kotak Hitung — kotak jawaban ikut terisi otomatis.`,
  'steps.carryDown': (p: { digit: number; place: string }) =>
    `Angka simpan ${p.digit} turun ke kotak jawaban ${p.place}.`,
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
  // Soal konsep (pilihan ganda) — render-time via i18n/concept.ts
  'concept.countPrompt': (p: { icon: string }) => `Hitung ada berapa ${p.icon} di bawah ini?`,
  'concept.comparePrompt': (p: { left: number; right: number }) =>
    `Mana yang lebih besar, ${p.left} atau ${p.right}? Atau sama?`,
  'concept.placePrompt': (p: { number: number; place: string }) =>
    `Pada bilangan ${p.number}, angka di nilai tempat ${p.place} adalah berapa?`,
  'concept.choiceGreater': 'Kiri lebih besar',
  'concept.choiceLess': 'Kanan lebih besar',
  'concept.choiceEqual': 'Sama besar',
  'concept.iconApple': 'apel',
  'concept.iconStar': 'bintang',
  'concept.iconDot': 'titik',
  'concept.countingAria': 'Gambar hitung',
  'concept.countingAriaWithCount': (p: { count: number }) => `Gambar hitung: ${p.count} benda`,
  'concept.correctFeedback': 'Benar! Hebat!',
  'concept.wrongFeedback': 'Belum tepat. Coba lagi ya!',
  'concept.revealedFeedback': (p: { answer: string }) => `Jawaban yang benar adalah ${p.answer}.`,
  // Story (soal cerita) — 47 key
  'story.stem-f0-add': (p: { name: string; item: string; a: number; b: number }) =>
    `${p.name} punya ${p.a} ${p.item}. Teman-temannya memberi ${p.b} ${p.item} lagi. Berapa sekarang ${p.item} ${p.name}?`,
  'story.stem-f0-sub': (p: { name: string; item: string; a: number; b: number }) =>
    `${p.name} punya ${p.a} ${p.item}. Dibagikan sebanyak ${p.b} ${p.item}. Berapa ${p.item} ${p.name} sekarang?`,
  'story.stem-f1-diff': (p: { nameA: string; nameB: string; item: string; x: number; y: number }) =>
    `${p.nameA} punya ${p.x} ${p.item}, lebih banyak ${p.y} dari ${p.nameB}.`,
  'story.stem-f2-transfer-color': (p: {
    nameA: string
    nameB: string
    item: string
    x: number
    p: number
    q: number
    r: number
    s: number
  }) =>
    `${p.nameA} punya ${p.x} ${p.item} merah. ${p.p} di antaranya hijau dan ${p.q} di antaranya biru. ${p.nameB} mempunyai ${p.s} ${p.item} kuning. Berapa ${p.item} yang berpindah?`,
  'story.stem-f2-transfer-size': (p: {
    nameA: string
    nameB: string
    item: string
    x: number
    p: number
    q: number
    r: number
    s: number
  }) =>
    `${p.nameA} punya ${p.x} ${p.item}. ${p.p} di antaranya besar dan ${p.q} di antaranya kecil. ${p.nameB} mempunyai ${p.s} ${p.item} sedang. Berapa ${p.item} yang berpindah?`,
  'story.stem-f3-chain': (p: {
    nameA: string
    nameB: string
    nameC: string
    item: string
    m: number
    n: number
  }) =>
    `${p.nameC} punya ${p.n} ${p.item}. ${p.nameB} punya ${p.m} ${p.item} lebih banyak dari ${p.nameC}. ${p.nameA} punya ${p.n} ${p.item} sebanyak ${p.nameB}.`,
  'story.stem-f4-join3': (p: {
    nameA: string
    nameB: string
    nameC: string
    item: string
    x: number
    y: number
    z: number
  }) =>
    `${p.nameA} punya ${p.x} ${p.item}, ${p.nameB} punya ${p.y} ${p.item}, dan ${p.nameC} punya ${p.z} ${p.item}.`,
  'story.stem-f5-tiered': (p: {
    nameA: string
    nameB: string
    item: string
    x: number
    y: number
    z: number
  }) =>
    `${p.nameA} punya ${p.x} ${p.item}. Diminim ${p.y} ${p.item} oleh ${p.nameB}. Sisa ${p.item} itu ditambah ${p.z} ${p.item} lagi.`,
  'story.part-f1-b': (p: { nameB: string; item: string }) => `Berapa ${p.item} milik ${p.nameB}?`,
  'story.part-f1-total': (p: { nameA: string; nameB: string; item: string }) =>
    `Berapa jumlah ${p.item} ${p.nameA} dan ${p.nameB} together?`,
  'story.part-f2-p-r': (p: { nameA: string; item: string }) =>
    `Berapa ${p.item} milik ${p.nameA} setelah dipindahkan?`,
  'story.part-f2-x-r': (p: { nameA: string; item: string }) =>
    `Sisa berapa ${p.item} milik ${p.nameA}?`,
  'story.part-f2-s+r': (p: { nameB: string; item: string }) =>
    `Berapa ${p.item} milik ${p.nameB} setelah menerima?`,
  'story.part-f3-b': (p: { nameB: string; item: string }) => `Berapa ${p.item} milik ${p.nameB}?`,
  'story.part-f3-a': (p: { nameA: string; item: string }) => `Berapa ${p.item} milik ${p.nameA}?`,
  'story.part-f3-total': (p: { nameA: string; nameB: string; nameC: string; item: string }) =>
    `Total berapa ${p.item} mereka bertiga?`,
  'story.part-f4-total3': (p: { nameA: string; nameB: string; nameC: string; item: string }) =>
    `Berapa jumlah semua ${p.item} mereka?`,
  'story.part-f4-totalAC': (p: { nameA: string; nameC: string; item: string }) =>
    `Berapa ${p.item} milik ${p.nameA} dan ${p.nameC} together?`,
  'story.part-f5-rest': (p: { nameA: string; item: string }) =>
    `Berapa sisa ${p.item} milik ${p.nameA}?`,
  'story.part-f5-final': (p: { nameA: string; item: string }) =>
    `Berapa ${p.item} milik ${p.nameA} setelah ditambah?`,
  'story.item-marbles': 'kelereng',
  'story.item-apples': 'apel',
  'story.item-books': 'buku',
  'story.item-fish': 'ikan',
  'story.item-cakes': 'kue',
  'story.item-pencils': 'pensil',
  'story.item-candies': 'permen',
  'story.item-balls': 'bola',
  'story.item-flowers': 'bunga',
  'story.item-birds': 'burung',
  'story.partOf': (p: { current: number; total: number }) => `Bagian ${p.current} dari ${p.total}`,
  'story.tryColumn': '📐 Belajar Bersusun',
  'practice.sessionTitle': 'Latihan Soal',
  'practice.customSessionTitle': 'Soal Buatan Sendiri',
  'practice.modeLabel': 'Jenis penyajian',
  'practice.modeColumn': 'Bersusun',
  'practice.modeStory': 'Soal cerita',
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

  // Dokumen hukum & footer
  'legal.privacyTitle': 'Kebijakan Privasi',
  'legal.termsTitle': 'Syarat dan Ketentuan Layanan',
  'legal.openFromSettings': 'Buka dokumen lengkap',
  'settings.legalSection': '⚖️ Legal',
  'home.footerRights': (p: { year: number }) => `© ${p.year} Asharu Math`,
  'home.version': (p: { version: string }) => `v${p.version}`,
  'settings.version': (p: { version: string }) => `Versi v${p.version}`,

  // Iklan
  'ads.label': 'Iklan',

  // Kebun Apel Ajaib
  'garden.title': 'Kebun Apel Ajaib 🍎',
  'garden.subtitle': 'Belajar puluhan dan satuan lewat kebun apel!',
  'garden.startUnit': 'Kita mulai dari kolom satuan.',
  'garden.combineHint': 'Gabungkan apel satuan. Hitung semuanya ya!',
  'garden.tenToBasket': 'Sepuluh apel satuan dapat ditukar menjadi satu keranjang puluhan.',
  'garden.openBasket': 'Satu keranjang puluhan dapat dibuka menjadi sepuluh apel satuan.',
  'garden.countTens': 'Sekarang hitung kolom puluhan.',
  'garden.notEnough': 'Apel belum cukup. Yuk, tukarkan satu keranjang puluhan.',
  'garden.successCarry': 'Hebat! Sepuluh satuan sudah kamu tukar menjadi satu puluhan.',
  'garden.successBorrow': 'Bagus! Satu puluhan sudah kamu tukar menjadi sepuluh satuan.',
  'garden.correctGeneral': 'Hebat, jawabanmu benar!',
  'garden.tryAgain': 'Belum tepat. Yuk, hitung kembali apel pada kolom satuan.',
  'garden.hintOnes': 'Periksa lagi jumlah apel di kolom satuan.',
  'garden.hintTens': 'Periksa lagi jumlah keranjang di kolom puluhan.',
  'garden.narrationFallback': 'Instruksi ditampilkan di layar.',
  'garden.basketLabel': 'Keranjang puluhan',
  'garden.appleLabel': 'Apel satuan',
  'garden.tensArea': 'Area Puluhan',
  'garden.onesArea': 'Area Satuan',
  'garden.unitsColor': 'Satuan: kuning amber',
  'garden.tensColor': 'Puluhan: hijau zamrud',
  'garden.exchangeAction': 'Tukarkan 10 apel menjadi 1 keranjang',
  'garden.openAction': 'Buka 1 keranjang menjadi 10 apel',
  'garden.enterOnes': 'Masukkan jawaban satuan',
  'garden.enterTens': 'Masukkan jawaban puluhan',
  'garden.enterHundreds': 'Masukkan jawaban ratusan',
  'garden.hintHundreds': 'Periksa lagi jumlah peti di kolom ratusan.',
  'garden.hundredsArea': 'Area Ratusan',
  'garden.hundredsColor': 'Ratusan: ungu violet',
  'garden.crateLabel': 'Peti ratusan 100 apel',
  'garden.exchangeHundredAction': 'Tukarkan 10 keranjang menjadi 1 peti',
  'garden.openHundredAction': 'Buka 1 peti menjadi 10 keranjang',
  'garden.tenTensToHundred': 'Sepuluh keranjang puluhan dapat ditukar menjadi satu peti ratusan.',
  'garden.countHundreds': 'Sekarang hitung kolom ratusan.',
  'garden.successCarryHundred': 'Hebat! Sepuluh keranjang sudah menjadi satu peti ratusan.',
  'garden.soundOn': 'Suara hidup',
  'garden.soundOff': 'Suara mati',
  'garden.repeatHint': 'Ulangi Petunjuk',
  'garden.check': 'Periksa',
  'garden.reset': 'Ulangi Soal',
  'garden.next': 'Soal Berikutnya',
  'garden.progress': (p: { current: number; total: number }) => `Soal ${p.current} dari ${p.total}`,
  'garden.resultTitle': 'Kebun Selesai! 🎉',
  'garden.tryGarden': '🍎 Coba Kebun Apel',
  'garden.level1Name': 'Kebun: Tambah Tanpa Simpan',
  'garden.level2Name': 'Kebun: Tambah Dengan Simpan',
  'garden.level3Name': 'Kebun: Kurang Tanpa Tukar',
  'garden.level4Name': 'Kebun: Kurang Dengan Tukar',
  'garden.level1Goal': 'Menjumlahkan 2 digit tanpa menyimpan lewat kebun apel',
  'garden.level2Goal': 'Menjumlahkan 2 digit dengan menyimpan lewat kebun apel',
  'garden.level3Goal': 'Mengurangkan 2 digit tanpa menukar lewat kebun apel',
  'garden.level4Goal': 'Mengurangkan 2 digit dengan menukar lewat kebun apel',

  // Akuarium Ikan Ceria
  'aquarium.title': 'Akuarium Ikan Ceria 🐠',
  'aquarium.subtitle': 'Belajar puluhan dan satuan lewat ikan ceria!',
  'aquarium.startUnit': 'Kita mulai dari kolom satuan.',
  'aquarium.combineHint': 'Gabungkan ikan satuan. Hitung semuanya ya!',
  'aquarium.tenToGroup': 'Sepuluh ikan satuan dapat membentuk satu kelompok puluhan.',
  'aquarium.splitGroup': 'Satu kelompok puluhan dapat berpencar menjadi sepuluh ikan satuan.',
  'aquarium.countTens': 'Sekarang hitung kolom puluhan.',
  'aquarium.notEnough':
    'Dua ikan belum cukup untuk diambil tujuh. Yuk, tukarkan satu kelompok puluhan.',
  'aquarium.successCarry': 'Hebat! Sepuluh ikan satuan sudah menjadi satu kelompok puluhan.',
  'aquarium.successBorrow':
    'Bagus! Satu kelompok puluhan sudah ditukar menjadi sepuluh ikan satuan.',
  'aquarium.correctGeneral': 'Hebat, jawabanmu benar!',
  'aquarium.tryAgain': 'Hampir benar. Yuk, hitung kembali ikan di kolom satuan.',
  'aquarium.hintOnes': 'Periksa lagi jumlah ikan di kolom satuan.',
  'aquarium.hintTens': 'Periksa lagi jumlah kelompok di kolom puluhan.',
  'aquarium.fishLabel': 'Ikan satuan',
  'aquarium.groupLabel': 'Kelompok puluhan',
  'aquarium.tensArea': 'Area Puluhan',
  'aquarium.onesArea': 'Area Satuan',
  'aquarium.unitsColor': 'Satuan: kuning amber',
  'aquarium.tensColor': 'Puluhan: biru cerah',
  'aquarium.formGroupAction': 'Bentuk 10 ikan menjadi 1 kelompok',
  'aquarium.splitGroupAction': 'Pecah 1 kelompok menjadi 10 ikan',
  'aquarium.enterOnes': 'Masukkan jawaban satuan',
  'aquarium.enterTens': 'Masukkan jawaban puluhan',
  'aquarium.enterHundreds': 'Masukkan jawaban ratusan',
  'aquarium.hintHundreds': 'Periksa lagi jumlah peti di kolom ratusan.',
  'aquarium.hundredsArea': 'Area Ratusan',
  'aquarium.hundredsColor': 'Ratusan: ungu violet',
  'aquarium.tankLabel': 'Tangki ratusan',
  'aquarium.formHundredAction': 'Bentuk 10 kelompok menjadi 1 tangki',
  'aquarium.splitHundredAction': 'Pecah 1 tangki menjadi 10 kelompok',
  'aquarium.tenGroupsToHundred':
    'Sepuluh kelompok puluhan dapat ditukar menjadi satu tangki ratusan.',
  'aquarium.countHundreds': 'Sekarang hitung kolom ratusan.',
  'aquarium.successCarryHundred': 'Hebat! Sepuluh kelompok sudah menjadi satu tangki ratusan.',
  'aquarium.soundOn': 'Suara hidup',
  'aquarium.soundOff': 'Suara mati',
  'aquarium.repeatHint': 'Ulangi Petunjuk',
  'aquarium.check': 'Periksa',
  'aquarium.reset': 'Ulangi Soal',
  'aquarium.next': 'Soal Berikutnya',
  'aquarium.progress': (p: { current: number; total: number }) =>
    `Soal ${p.current} dari ${p.total}`,
  'aquarium.resultTitle': 'Akuarium Selesai! 🎉',
  'aquarium.tryAquarium': '🐠 Coba Akuarium Ikan',
  'aquarium.level1Name': 'Akuarium: Tambah Tanpa Simpan',
  'aquarium.level2Name': 'Akuarium: Tambah Dengan Simpan',
  'aquarium.level3Name': 'Akuarium: Kurang Tanpa Tukar',
  'aquarium.level4Name': 'Akuarium: Kurang Dengan Tukar',
  'aquarium.level1Goal': 'Menjumlahkan 2 digit tanpa menyimpan lewat akuarium',
  'aquarium.level2Goal': 'Menjumlahkan 2 digit dengan menyimpan lewat akuarium',
  'aquarium.level3Goal': 'Mengurangkan 2 digit tanpa menukar lewat akuarium',
  'aquarium.level4Goal': 'Mengurangkan 2 digit dengan menukar lewat akuarium',

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
