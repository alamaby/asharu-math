/**
 * Konten dokumen hukum bilingual (Privacy Policy & Terms of Service).
 * Placeholder [NAMA PEMILIK] dan [EMAIL KONTAK] wajib diganti sebelum produksi.
 */

export interface LegalSection {
  title: string
  paragraphs: string[]
}

export interface LegalDocument {
  title: string
  updatedLabel: string
  updatedDate: string
  sections: LegalSection[]
}

const OWNER = '[NAMA PEMILIK]'
const EMAIL = '[EMAIL KONTAK]'
const SITE = 'Asharu Math (math.asharu.id)'
const UPDATED_ID = '26 Agustus 2026'
const UPDATED_EN = 'August 26, 2026'

export const PRIVACY_POLICY: { id: LegalDocument; en: LegalDocument } = {
  id: {
    title: 'Kebijakan Privasi',
    updatedLabel: 'Terakhir diperbarui:',
    updatedDate: UPDATED_ID,
    sections: [
      {
        title: 'Ringkasan Singkat',
        paragraphs: [
          `${SITE} adalah aplikasi belajar matematika gratis untuk anak. Kami tidak membuat akun, tidak meminta foto, tidak melacak aktivitas anak di situs lain, dan seluruh progres belajar tersimpan hanya di perangkat anak sendiri.`,
          'Iklan di aplikasi ini disajikan oleh Google AdSense dalam mode ramah anak: kami menandai situs ini untuk perawatan khusus anak, sehingga Google hanya menayangkan iklan kontekstual non-terpersonalisasi tanpa membuat profil minat anak.',
        ],
      },
      {
        title: 'Data yang Tersimpan di Perangkat (localStorage)',
        paragraphs: [
          'Progres belajar (level yang selesai, skor bintang, pencapaian, statistik jawaban, preferensi suara/animasi/bahasa) dan nama panggilan opsional tersimpan secara lokal di browser perangkat menggunakan localStorage.',
          'Data ini TIDAK pernah dikirim ke server kami — kami bahkan tidak memiliki server data. Menghapus data situs di browser atau menekan "Hapus Progres" di Pengaturan akan menghapus semuanya secara permanen.',
        ],
      },
      {
        title: 'Iklan Pihak Ketiga (Google AdSense)',
        paragraphs: [
          'Situs ini menayangkan iklan dari Google AdSense. Karena situs ditandai untuk perawatan khusus anak, Google tidak menayangkan iklan berdasarkan profil minat dan tidak mengizinkan remarketing kepada pengunjung situs ini.',
          'Google serta mitra sertifikasinya dapat menggunakan cookie atau identifier perangkat terbatas untuk keperluan teknis seperti frekuensi tayang, pembatasan iklan, dan deteksi penipuan.',
          'Anda dapat mempelajari cara Google menggunakan data pada https://policies.google.com/technologies/partner-sites dan mengontrol iklan pada https://adssettings.google.com.',
        ],
      },
      {
        title: 'Layanan Teknis Lainnya',
        paragraphs: [
          'Situs ini di-hosting oleh Vercel Inc., yang memproses log teknis standar (mis. alamat IP sementara) untuk keperluan penyajian dan keamanan situs sesuai kebijakan privasi Vercel.',
          'Font tampilan dimuat dari Google Fonts. Tidak ada layanan analitik atau pelacakan pihak ketiga lainnya.',
        ],
      },
      {
        title: 'Hak Orang Tua dan Wali',
        paragraphs: [
          'Kami menyarankan pendampingan orang tua saat anak berlatih. Orang tua dapat menghapus seluruh data anak kapan saja melalui Pengaturan → Hapus Progres, atau dengan membersihkan data situs pada browser perangkat.',
          'Pertanyaan, permintaan, atau keluhan mengenai data anak dapat disampaikan ke ' +
            EMAIL +
            '.',
        ],
      },
      {
        title: 'Perubahan Kebijakan',
        paragraphs: [
          'Kebijakan ini dapat diperbarui sewaktu-waktu. Tanggal pembaruan tercantum di bagian atas dokumen; perubahan material akan diumumkan pada halaman utama situs.',
        ],
      },
      {
        title: 'Kontak',
        paragraphs: [`${OWNER} — ${EMAIL}`],
      },
    ],
  },
  en: {
    title: 'Privacy Policy',
    updatedLabel: 'Last updated:',
    updatedDate: UPDATED_EN,
    sections: [
      {
        title: 'Quick Summary',
        paragraphs: [
          `${SITE} is a free math learning app for children. We do not create accounts, do not ask for photos, do not track children across other sites, and all learning progress stays on the child's own device.`,
          'Ads in this app are served by Google AdSense in a child-friendly mode: this site is tagged for child-directed treatment, so Google only shows contextual, non-personalized ads without building an interest profile of the child.',
        ],
      },
      {
        title: 'Data Stored on the Device (localStorage)',
        paragraphs: [
          'Learning progress (completed levels, star scores, achievements, answer statistics, sound/animation/language preferences) and an optional nickname are stored locally in the device browser using localStorage.',
          'This data is NEVER sent to our servers — we do not even have a data server. Clearing site data in the browser or pressing "Reset Progress" in Settings removes everything permanently.',
        ],
      },
      {
        title: 'Third-Party Advertising (Google AdSense)',
        paragraphs: [
          'This site shows ads from Google AdSense. Because the site is tagged for child-directed treatment, Google does not serve interest-profiled ads and does not allow remarketing to visitors of this site.',
          'Google and its certified partners may use limited cookies or device identifiers for technical purposes such as frequency capping, ad restriction, and fraud detection.',
          'You can learn how Google uses data at https://policies.google.com/technologies/partner-sites and control ads at https://adssettings.google.com.',
        ],
      },
      {
        title: 'Other Technical Services',
        paragraphs: [
          'This site is hosted by Vercel Inc., which processes standard technical logs (e.g., temporary IP addresses) for serving and securing the site according to Vercel\u2019s privacy policy.',
          'Display fonts load from Google Fonts. There are no analytics or other third-party tracking services.',
        ],
      },
      {
        title: 'Parental Rights',
        paragraphs: [
          'We recommend parental supervision during practice sessions. Parents can erase all of a child\u2019s data anytime via Settings → Reset Progress, or by clearing site data in the device browser.',
          'Questions, requests, or complaints regarding a child\u2019s data can be sent to ' +
            EMAIL +
            '.',
        ],
      },
      {
        title: 'Changes to This Policy',
        paragraphs: [
          'This policy may be updated from time to time. The revision date appears at the top of this document; material changes will be announced on the home page.',
        ],
      },
      {
        title: 'Contact',
        paragraphs: [`${OWNER} — ${EMAIL}`],
      },
    ],
  },
}

export const TERMS_OF_SERVICE: { id: LegalDocument; en: LegalDocument } = {
  id: {
    title: 'Syarat dan Ketentuan Layanan',
    updatedLabel: 'Terakhir diperbarui:',
    updatedDate: UPDATED_ID,
    sections: [
      {
        title: 'Penerimaan Syarat',
        paragraphs: [
          `Dengan membuka atau menggunakan ${SITE} ("Aplikasi"), Anda menyetujui Syarat dan Ketentuan ini. Aplikasi ditujukan untuk anak usia sekolah dasar dan dirancang digunakan di bawah arahan/pengawasan orang tua atau wali.`,
        ],
      },
      {
        title: 'Tanpa Akun',
        paragraphs: [
          'Aplikasi tidak menyediakan pendaftaran akun. Seluruh progres tersimpan lokal di perangkat pengguna dan menjadi tanggung jawab pengguna/orang tuanya (termasuk risiko hilang apabila data browser dibersihkan).',
        ],
      },
      {
        title: 'Penggunaan yang Wajar',
        paragraphs: [
          'Anda dilarang mengganggu, merekayasa balik, mengambil isi secara massal otomatis, atau menggunakan Aplikasi untuk tujuan yang melanggar hukum. Konten latihan matematika pada Aplikasi dibuat original dan dilindungi hak cipta ' +
            OWNER +
            '.',
        ],
      },
      {
        title: 'Materi Pihak Ketiga',
        paragraphs: [
          'Aplikasi menampilkan iklan dari Google AdSense. ' +
            OWNER +
            ' tidak bertanggung jawab atas isi iklan maupun situs tujuan iklan; klik iklan berada di luar kendali Aplikasi. Iklan dikonfigurasi ramah anak sesuai Kebijakan Privasi kami.',
        ],
      },
      {
        title: 'Tanpa Jaminan',
        paragraphs: [
          'Aplikasi disediakan "sebagaimana adanya" tanpa jaminan bentuk apa pun, baik tersurat maupun tersirat, termasuk kesesuaian untuk tujuan tertentu atau ketidakputusan materi ajar untuk setiap individu.',
        ],
      },
      {
        title: 'Batasan Tanggung Jawab',
        paragraphs: [
          'Sejauh diizinkan hukum yang berlaku, ' +
            OWNER +
            ' tidak bertanggung jawab atas kerugian langsung/tidak langsung yang timbul dari penggunaan atau ketidakmampuan menggunakan Aplikasi, termasuk hilangnya progres yang tersimpan di perangkat pengguna.',
        ],
      },
      {
        title: 'Perubahan dan Penghentian',
        paragraphs: [
          'Kami dapat memperbarui fitur, memodifikasi syarat ini, atau menghentikan layanan sewaktu-waktu. Syarat yang berlaku adalah versi terbaru yang tampil pada halaman ini.',
        ],
      },
      {
        title: 'Kontak',
        paragraphs: [`${OWNER} — ${EMAIL}`],
      },
    ],
  },
  en: {
    title: 'Terms of Service',
    updatedLabel: 'Last updated:',
    updatedDate: UPDATED_EN,
    sections: [
      {
        title: 'Acceptance of Terms',
        paragraphs: [
          `By opening or using ${SITE} (the "App"), you agree to these Terms of Service. The App is intended for primary-school-age children and is designed to be used under the direction/supervision of a parent or guardian.`,
        ],
      },
      {
        title: 'No Accounts',
        paragraphs: [
          'The App has no account registration. All progress is stored locally on the user\u2019s device and remains the responsibility of the user/parent (including any loss if browser data is cleared).',
        ],
      },
      {
        title: 'Fair Use',
        paragraphs: [
          'You may not disrupt, reverse engineer, bulk-scrape content automatically, or use the App for unlawful purposes. The math practice content in the App is original and copyrighted by ' +
            OWNER +
            '.',
        ],
      },
      {
        title: 'Third-Party Material',
        paragraphs: [
          'The App displays ads from Google AdSense. ' +
            OWNER +
            ' is not responsible for ad content or advertised destinations; clicking ads happens outside the App\u2019s control. Ads are configured to be child-friendly as described in our Privacy Policy.',
        ],
      },
      {
        title: 'No Warranty',
        paragraphs: [
          'The App is provided "as is" without warranties of any kind, express or implied, including fitness for a particular purpose or the suitability of teaching material for every individual learner.',
        ],
      },
      {
        title: 'Limitation of Liability',
        paragraphs: [
          'To the extent permitted by applicable law, ' +
            OWNER +
            ' shall not be liable for direct or indirect damages arising from use of or inability to use the App, including loss of progress stored on the user\u2019s device.',
        ],
      },
      {
        title: 'Changes and Termination',
        paragraphs: [
          'We may update features, modify these terms, or discontinue the service at any time. The current version on this page is the version that applies.',
        ],
      },
      {
        title: 'Contact',
        paragraphs: [`${OWNER} — ${EMAIL}`],
      },
    ],
  },
}
