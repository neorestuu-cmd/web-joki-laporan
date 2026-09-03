/**
 * JokiLaporan.id — LocalStorage Database (db.js)
 * Configuration-driven: Schools, Departments, Templates, Questions, Plans
 */

const DB = (() => {
  const S = APP.storage;

  const KEYS = {
    schools: 'joki_db_schools',
    departments: 'joki_db_departments',
    templates: 'joki_db_templates',
    sections: 'joki_db_sections',
    questions: 'joki_db_questions',
    qOptions: 'joki_db_question_options',
    contentTemplates: 'joki_db_content_templates',
    formattingRules: 'joki_db_formatting_rules',
    plans: 'joki_db_plans',
    seeded: 'joki_db_seeded'
  };

  // ==================== SEED DATA ====================
  const SEED = {
    schools: [
      { id: 'sch_1', name: 'SMK Negeri 1 Bandung', address: 'Jl. Wastukancana No. 3, Bandung', city: 'Bandung', province: 'Jawa Barat', active: true },
      { id: 'sch_2', name: 'SMK Negeri 2 Jakarta', address: 'Jl. Hayam Wuruk No. 18, Jakarta Pusat', city: 'Jakarta', province: 'DKI Jakarta', active: true },
      { id: 'sch_3', name: 'SMK Telkom Malang', address: 'Jl. Danau Ranau Sawojajar, Malang', city: 'Malang', province: 'Jawa Timur', active: true },
      { id: 'sch_4', name: 'SMK Muhammadiyah 1 Surabaya', address: 'Jl. Kapasan No. 36, Surabaya', city: 'Surabaya', province: 'Jawa Timur', active: true },
      { id: 'sch_custom', name: 'Sekolah Lainnya', address: '', city: '', province: '', active: true }
    ],

    departments: [
      // Bandung
      { id: 'dep_tkj_1', schoolId: 'sch_1', name: 'Teknik Komputer dan Jaringan', shortName: 'TKJ', templateId: 'tpl_tkj', active: true },
      { id: 'dep_rpl_1', schoolId: 'sch_1', name: 'Rekayasa Perangkat Lunak', shortName: 'RPL', templateId: 'tpl_rpl', active: true },
      { id: 'dep_mm_1', schoolId: 'sch_1', name: 'Multimedia', shortName: 'MM', templateId: 'tpl_mm', active: true },
      { id: 'dep_akl_1', schoolId: 'sch_1', name: 'Akuntansi dan Keuangan Lembaga', shortName: 'AKL', templateId: 'tpl_akl', active: true },
      { id: 'dep_dkv_1', schoolId: 'sch_1', name: 'Desain Komunikasi Visual', shortName: 'DKV', templateId: 'tpl_dkv', active: true },
      // Jakarta
      { id: 'dep_tkj_2', schoolId: 'sch_2', name: 'Teknik Komputer dan Jaringan', shortName: 'TKJ', templateId: 'tpl_tkj', active: true },
      { id: 'dep_rpl_2', schoolId: 'sch_2', name: 'Rekayasa Perangkat Lunak', shortName: 'RPL', templateId: 'tpl_rpl', active: true },
      { id: 'dep_mplb_2', schoolId: 'sch_2', name: 'Manajemen Perkantoran dan Layanan Bisnis', shortName: 'MPLB', templateId: 'tpl_mplb', active: true },
      // Malang
      { id: 'dep_tkj_3', schoolId: 'sch_3', name: 'Teknik Komputer dan Jaringan', shortName: 'TKJ', templateId: 'tpl_tkj', active: true },
      { id: 'dep_rpl_3', schoolId: 'sch_3', name: 'Rekayasa Perangkat Lunak', shortName: 'RPL', templateId: 'tpl_rpl', active: true },
      // Surabaya
      { id: 'dep_tkj_4', schoolId: 'sch_4', name: 'Teknik Komputer dan Jaringan', shortName: 'TKJ', templateId: 'tpl_tkj', active: true },
      { id: 'dep_akl_4', schoolId: 'sch_4', name: 'Akuntansi dan Keuangan Lembaga', shortName: 'AKL', templateId: 'tpl_akl', active: true },
      // Custom school - generic
      { id: 'dep_generic', schoolId: 'sch_custom', name: 'Jurusan Lainnya', shortName: 'UMUM', templateId: 'tpl_generic', active: true }
    ],

    templates: [
      { id: 'tpl_tkj', name: 'Laporan PKL TKJ', departmentType: 'TKJ', reportTitle: 'LAPORAN PRAKTIK KERJA LAPANGAN', active: true },
      { id: 'tpl_rpl', name: 'Laporan PKL RPL', departmentType: 'RPL', reportTitle: 'LAPORAN PRAKTIK KERJA LAPANGAN', active: true },
      { id: 'tpl_mm', name: 'Laporan PKL Multimedia', departmentType: 'MM', reportTitle: 'LAPORAN PRAKTIK KERJA LAPANGAN', active: true },
      { id: 'tpl_akl', name: 'Laporan PKL Akuntansi', departmentType: 'AKL', reportTitle: 'LAPORAN PRAKTIK KERJA LAPANGAN', active: true },
      { id: 'tpl_dkv', name: 'Laporan PKL DKV', departmentType: 'DKV', reportTitle: 'LAPORAN PRAKTIK KERJA LAPANGAN', active: true },
      { id: 'tpl_mplb', name: 'Laporan PKL MPLB', departmentType: 'MPLB', reportTitle: 'LAPORAN PRAKTIK KERJA LAPANGAN', active: true },
      { id: 'tpl_generic', name: 'Laporan PKL Umum', departmentType: 'UMUM', reportTitle: 'LAPORAN PRAKTIK KERJA LAPANGAN', active: true }
    ],

    // Questions per department type
    questions: [
      // TKJ Questions
      { id: 'q_tkj_1', templateId: 'tpl_tkj', sectionKey: 'activities', type: 'select', label: 'Jenis Kegiatan', required: true, order: 1, hasOther: true },
      { id: 'q_tkj_2', templateId: 'tpl_tkj', sectionKey: 'activities', type: 'text', label: 'Perangkat yang Digunakan', placeholder: 'Contoh: Laptop Dell, Switch Cisco', required: false, order: 2 },
      { id: 'q_tkj_3', templateId: 'tpl_tkj', sectionKey: 'activities', type: 'text', label: 'Software yang Digunakan', placeholder: 'Contoh: Windows Server, Cisco Packet Tracer', required: false, order: 3 },
      { id: 'q_tkj_4', templateId: 'tpl_tkj', sectionKey: 'activities', type: 'text', label: 'Alat yang Digunakan', placeholder: 'Contoh: Tang, Krimping tool, Kabel UTP', required: false, order: 4 },
      { id: 'q_tkj_5', templateId: 'tpl_tkj', sectionKey: 'activities', type: 'textarea', label: 'Masalah/Kendala yang Ditemukan', placeholder: 'Ceritakan masalah yang ditemukan...', required: false, order: 5 },
      { id: 'q_tkj_6', templateId: 'tpl_tkj', sectionKey: 'activities', type: 'textarea', label: 'Langkah Troubleshooting/Penyelesaian', placeholder: 'Langkah-langkah yang dilakukan...', required: false, order: 6 },
      { id: 'q_tkj_7', templateId: 'tpl_tkj', sectionKey: 'conclusion', type: 'textarea', label: 'Kesimpulan PKL', placeholder: 'Tuliskan kesimpulan dari pengalaman PKL...', required: false, order: 1 },
      { id: 'q_tkj_8', templateId: 'tpl_tkj', sectionKey: 'conclusion', type: 'textarea', label: 'Saran', placeholder: 'Saran untuk sekolah dan perusahaan...', required: false, order: 2 },

      // RPL Questions
      { id: 'q_rpl_1', templateId: 'tpl_rpl', sectionKey: 'activities', type: 'text', label: 'Nama Aplikasi/Proyek', placeholder: 'Contoh: Sistem Manajemen Inventori', required: true, order: 1 },
      { id: 'q_rpl_2', templateId: 'tpl_rpl', sectionKey: 'activities', type: 'text', label: 'Teknologi yang Digunakan', placeholder: 'Contoh: React.js, Node.js, MySQL', required: false, order: 2 },
      { id: 'q_rpl_3', templateId: 'tpl_rpl', sectionKey: 'activities', type: 'text', label: 'Bahasa Pemrograman', placeholder: 'Contoh: JavaScript, PHP, Python', required: false, order: 3 },
      { id: 'q_rpl_4', templateId: 'tpl_rpl', sectionKey: 'activities', type: 'text', label: 'Database yang Digunakan', placeholder: 'Contoh: MySQL, PostgreSQL, MongoDB', required: false, order: 4 },
      { id: 'q_rpl_5', templateId: 'tpl_rpl', sectionKey: 'activities', type: 'textarea', label: 'Fitur yang Dikerjakan', placeholder: 'Deskripsikan fitur-fitur yang dikembangkan...', required: false, order: 5 },
      { id: 'q_rpl_6', templateId: 'tpl_rpl', sectionKey: 'activities', type: 'textarea', label: 'Proses Development', placeholder: 'Ceritakan proses pengembangan...', required: false, order: 6 },
      { id: 'q_rpl_7', templateId: 'tpl_rpl', sectionKey: 'activities', type: 'textarea', label: 'Bug/Masalah yang Ditemukan', placeholder: 'Bug atau masalah yang ditemukan selama development...', required: false, order: 7 },
      { id: 'q_rpl_8', templateId: 'tpl_rpl', sectionKey: 'conclusion', type: 'textarea', label: 'Kesimpulan PKL', placeholder: 'Tuliskan kesimpulan dari pengalaman PKL...', required: false, order: 1 },
      { id: 'q_rpl_9', templateId: 'tpl_rpl', sectionKey: 'conclusion', type: 'textarea', label: 'Saran', placeholder: 'Saran untuk pengembangan ke depan...', required: false, order: 2 },

      // AKL Questions
      { id: 'q_akl_1', templateId: 'tpl_akl', sectionKey: 'activities', type: 'select', label: 'Jenis Transaksi/Kegiatan', required: true, order: 1, hasOther: true },
      { id: 'q_akl_2', templateId: 'tpl_akl', sectionKey: 'activities', type: 'text', label: 'Dokumen yang Digunakan', placeholder: 'Contoh: Faktur, Jurnal, Bukti kas masuk', required: false, order: 2 },
      { id: 'q_akl_3', templateId: 'tpl_akl', sectionKey: 'activities', type: 'text', label: 'Software Akuntansi', placeholder: 'Contoh: MYOB, Accurate, Microsoft Excel', required: false, order: 3 },
      { id: 'q_akl_4', templateId: 'tpl_akl', sectionKey: 'activities', type: 'textarea', label: 'Proses Pencatatan/Pekerjaan', placeholder: 'Ceritakan proses pencatatan transaksi...', required: false, order: 4 },
      { id: 'q_akl_5', templateId: 'tpl_akl', sectionKey: 'conclusion', type: 'textarea', label: 'Kesimpulan PKL', required: false, order: 1 },

      // MM Questions
      { id: 'q_mm_1', templateId: 'tpl_mm', sectionKey: 'activities', type: 'select', label: 'Jenis Pekerjaan Multimedia', required: true, order: 1, hasOther: true },
      { id: 'q_mm_2', templateId: 'tpl_mm', sectionKey: 'activities', type: 'text', label: 'Software yang Digunakan', placeholder: 'Contoh: Adobe Premiere, Photoshop, After Effects', required: false, order: 2 },
      { id: 'q_mm_3', templateId: 'tpl_mm', sectionKey: 'activities', type: 'textarea', label: 'Proses Produksi', placeholder: 'Ceritakan proses produksi multimedia...', required: false, order: 3 },
      { id: 'q_mm_4', templateId: 'tpl_mm', sectionKey: 'conclusion', type: 'textarea', label: 'Kesimpulan PKL', required: false, order: 1 },

      // DKV Questions
      { id: 'q_dkv_1', templateId: 'tpl_dkv', sectionKey: 'activities', type: 'text', label: 'Nama Proyek/Klien', placeholder: 'Contoh: Brosur produk X untuk PT. ABC', required: true, order: 1 },
      { id: 'q_dkv_2', templateId: 'tpl_dkv', sectionKey: 'activities', type: 'text', label: 'Software Design yang Digunakan', placeholder: 'Contoh: Adobe Illustrator, CorelDRAW, Figma', required: false, order: 2 },
      { id: 'q_dkv_3', templateId: 'tpl_dkv', sectionKey: 'activities', type: 'textarea', label: 'Konsep dan Proses Desain', placeholder: 'Ceritakan konsep kreatif dan proses desain...', required: false, order: 3 },
      { id: 'q_dkv_4', templateId: 'tpl_dkv', sectionKey: 'conclusion', type: 'textarea', label: 'Kesimpulan PKL', required: false, order: 1 },

      // MPLB Questions
      { id: 'q_mplb_1', templateId: 'tpl_mplb', sectionKey: 'activities', type: 'select', label: 'Jenis Pekerjaan Kantor', required: true, order: 1, hasOther: true },
      { id: 'q_mplb_2', templateId: 'tpl_mplb', sectionKey: 'activities', type: 'textarea', label: 'Proses Pekerjaan', placeholder: 'Ceritakan proses pekerjaan kantor...', required: false, order: 2 },
      { id: 'q_mplb_3', templateId: 'tpl_mplb', sectionKey: 'conclusion', type: 'textarea', label: 'Kesimpulan PKL', required: false, order: 1 },

      // Generic Questions
      { id: 'q_gen_1', templateId: 'tpl_generic', sectionKey: 'activities', type: 'text', label: 'Jenis Pekerjaan', required: true, order: 1 },
      { id: 'q_gen_2', templateId: 'tpl_generic', sectionKey: 'activities', type: 'textarea', label: 'Deskripsi Pekerjaan', required: false, order: 2 },
      { id: 'q_gen_3', templateId: 'tpl_generic', sectionKey: 'conclusion', type: 'textarea', label: 'Kesimpulan PKL', required: false, order: 1 }
    ],

    // Question options (for select/radio/checkbox type questions)
    questionOptions: [
      // TKJ - Jenis Kegiatan
      { id: 'opt_tkj_1_1', questionId: 'q_tkj_1', value: 'Instalasi Software', label: 'Instalasi Software', order: 1 },
      { id: 'opt_tkj_1_2', questionId: 'q_tkj_1', value: 'Troubleshooting Komputer', label: 'Troubleshooting Komputer', order: 2 },
      { id: 'opt_tkj_1_3', questionId: 'q_tkj_1', value: 'Perakitan Komputer', label: 'Perakitan Komputer', order: 3 },
      { id: 'opt_tkj_1_4', questionId: 'q_tkj_1', value: 'Instalasi Jaringan', label: 'Instalasi Jaringan', order: 4 },
      { id: 'opt_tkj_1_5', questionId: 'q_tkj_1', value: 'Konfigurasi Router/Switch', label: 'Konfigurasi Router/Switch', order: 5 },
      { id: 'opt_tkj_1_6', questionId: 'q_tkj_1', value: 'Instalasi Server', label: 'Instalasi Server', order: 6 },
      { id: 'opt_tkj_1_7', questionId: 'q_tkj_1', value: 'Maintenance Komputer', label: 'Maintenance Komputer', order: 7 },

      // AKL - Jenis Transaksi
      { id: 'opt_akl_1_1', questionId: 'q_akl_1', value: 'Pencatatan Jurnal Umum', label: 'Pencatatan Jurnal Umum', order: 1 },
      { id: 'opt_akl_1_2', questionId: 'q_akl_1', value: 'Pembuatan Laporan Keuangan', label: 'Pembuatan Laporan Keuangan', order: 2 },
      { id: 'opt_akl_1_3', questionId: 'q_akl_1', value: 'Pengelolaan Kas', label: 'Pengelolaan Kas', order: 3 },
      { id: 'opt_akl_1_4', questionId: 'q_akl_1', value: 'Input Data Transaksi', label: 'Input Data Transaksi', order: 4 },
      { id: 'opt_akl_1_5', questionId: 'q_akl_1', value: 'Rekonsiliasi Bank', label: 'Rekonsiliasi Bank', order: 5 },
      { id: 'opt_akl_1_6', questionId: 'q_akl_1', value: 'Pembuatan Invoice/Faktur', label: 'Pembuatan Invoice/Faktur', order: 6 },

      // MM - Jenis Pekerjaan
      { id: 'opt_mm_1_1', questionId: 'q_mm_1', value: 'Editing Video', label: 'Editing Video', order: 1 },
      { id: 'opt_mm_1_2', questionId: 'q_mm_1', value: 'Desain Grafis', label: 'Desain Grafis', order: 2 },
      { id: 'opt_mm_1_3', questionId: 'q_mm_1', value: 'Fotografi', label: 'Fotografi', order: 3 },
      { id: 'opt_mm_1_4', questionId: 'q_mm_1', value: 'Motion Graphics', label: 'Motion Graphics', order: 4 },
      { id: 'opt_mm_1_5', questionId: 'q_mm_1', value: 'Pembuatan Konten Media Sosial', label: 'Pembuatan Konten Media Sosial', order: 5 },

      // MPLB - Jenis Pekerjaan
      { id: 'opt_mplb_1_1', questionId: 'q_mplb_1', value: 'Pengelolaan Surat', label: 'Pengelolaan Surat', order: 1 },
      { id: 'opt_mplb_1_2', questionId: 'q_mplb_1', value: 'Pengarsipan Dokumen', label: 'Pengarsipan Dokumen', order: 2 },
      { id: 'opt_mplb_1_3', questionId: 'q_mplb_1', value: 'Pelayanan Tamu/Pelanggan', label: 'Pelayanan Tamu/Pelanggan', order: 3 },
      { id: 'opt_mplb_1_4', questionId: 'q_mplb_1', value: 'Input Data', label: 'Input Data', order: 4 },
      { id: 'opt_mplb_1_5', questionId: 'q_mplb_1', value: 'Pembuatan Laporan', label: 'Pembuatan Laporan', order: 5 }
    ],

    // Content templates (sentence templates for report generation)
    contentTemplates: [
      // TKJ
      {
        id: 'ct_tkj_latar', templateId: 'tpl_tkj', sectionKey: 'bab1_latar',
        template: 'Perkembangan teknologi informasi dan komunikasi saat ini berkembang sangat pesat, khususnya di bidang jaringan komputer dan sistem informasi. Perkembangan ini menuntut sumber daya manusia yang kompeten dan terampil, terutama bagi siswa yang mengambil program keahlian {jurusan}. Praktik Kerja Lapangan (PKL) merupakan salah satu program yang dilaksanakan oleh {sekolah} sebagai bentuk pendidikan sistem ganda (PSG) untuk mendekatkan siswa dengan dunia industri. Melalui PKL di {perusahaan}, penulis mendapat kesempatan untuk mengaplikasikan ilmu yang telah dipelajari di sekolah sekaligus mempelajari teknologi terbaru yang digunakan di dunia industri.'
      },
      {
        id: 'ct_tkj_tujuan', templateId: 'tpl_tkj', sectionKey: 'bab1_tujuan',
        template: 'Adapun tujuan dari pelaksanaan Praktik Kerja Lapangan (PKL) ini adalah sebagai berikut:\n1. Menerapkan ilmu pengetahuan dan keterampilan yang telah dipelajari di sekolah ke dalam dunia kerja nyata.\n2. Meningkatkan kemampuan teknis dalam bidang {jurusan} melalui pengalaman langsung di lapangan.\n3. Mengenal dan memahami lingkungan kerja di {perusahaan} secara langsung.\n4. Mempersiapkan diri untuk memasuki dunia kerja setelah lulus dari {sekolah}.\n5. Memenuhi syarat kelulusan program keahlian {jurusan} di {sekolah}.'
      },
      {
        id: 'ct_tkj_kegiatan', templateId: 'tpl_tkj', sectionKey: 'bab4_kegiatan',
        template: 'Pada tanggal {tanggal}, penulis melakukan kegiatan {kegiatan}. Kegiatan ini menggunakan {alat}. {deskripsi} Langkah-langkah yang dilakukan adalah sebagai berikut:\n{langkahKerja}\nHasil dari kegiatan ini adalah {hasil}. {kendala_solusi}'
      },

      // RPL
      {
        id: 'ct_rpl_latar', templateId: 'tpl_rpl', sectionKey: 'bab1_latar',
        template: 'Di era digitalisasi yang semakin pesat, kebutuhan akan pengembang perangkat lunak yang kompeten semakin meningkat. Industri teknologi informasi membutuhkan tenaga ahli yang tidak hanya menguasai teori, tetapi juga memiliki pengalaman praktis dalam pengembangan aplikasi. Melalui program Praktik Kerja Lapangan (PKL) di {perusahaan}, siswa program keahlian {jurusan} dari {sekolah} mendapat kesempatan untuk terlibat langsung dalam proyek pengembangan perangkat lunak nyata. Hal ini merupakan wujud nyata dari program pendidikan berbasis industri yang diterapkan oleh {sekolah}.'
      },
      {
        id: 'ct_rpl_kegiatan', templateId: 'tpl_rpl', sectionKey: 'bab4_kegiatan',
        template: 'Pada tanggal {tanggal}, penulis mengerjakan {kegiatan}. {deskripsi} Teknologi yang digunakan dalam kegiatan ini adalah {alat}. Proses pengerjaan meliputi:\n{langkahKerja}\nHasil yang dicapai adalah {hasil}. {kendala_solusi}'
      },

      // AKL
      {
        id: 'ct_akl_latar', templateId: 'tpl_akl', sectionKey: 'bab1_latar',
        template: 'Akuntansi merupakan tulang punggung dari setiap kegiatan bisnis dan organisasi. Kemampuan dalam mencatat, menganalisis, dan menyajikan informasi keuangan secara akurat sangat diperlukan oleh setiap perusahaan. Melalui Praktik Kerja Lapangan (PKL) di {perusahaan}, penulis sebagai siswa program keahlian {jurusan} dari {sekolah} mendapat kesempatan untuk mempelajari dan mempraktikkan langsung pengelolaan keuangan di lingkungan kerja yang sesungguhnya. Pengalaman ini sangat berharga dalam mempersiapkan diri menghadapi dunia kerja yang kompetitif.'
      },
      {
        id: 'ct_akl_kegiatan', templateId: 'tpl_akl', sectionKey: 'bab4_kegiatan',
        template: 'Pada tanggal {tanggal}, penulis melaksanakan kegiatan {kegiatan}. {deskripsi} Dokumen dan peralatan yang digunakan adalah {alat}. Langkah-langkah yang dilakukan:\n{langkahKerja}\nHasil dari kegiatan ini adalah {hasil}. {kendala_solusi}'
      },

      // Generic (fallback)
      {
        id: 'ct_gen_latar', templateId: 'tpl_generic', sectionKey: 'bab1_latar',
        template: 'Praktik Kerja Lapangan (PKL) merupakan salah satu program pendidikan yang bertujuan untuk memberikan pengalaman kerja nyata kepada siswa sebelum memasuki dunia kerja. Melalui PKL yang dilaksanakan di {perusahaan}, penulis sebagai siswa {sekolah} jurusan {jurusan} mendapat kesempatan untuk menerapkan ilmu yang telah dipelajari sekaligus mempelajari hal-hal baru yang bermanfaat. Pengalaman ini diharapkan dapat memperluas wawasan dan meningkatkan kesiapan penulis dalam menghadapi tantangan dunia kerja.'
      },
      {
        id: 'ct_gen_kegiatan', templateId: 'tpl_generic', sectionKey: 'bab4_kegiatan',
        template: 'Pada tanggal {tanggal}, penulis melakukan kegiatan {kegiatan}. {deskripsi} Alat dan bahan yang digunakan: {alat}.\n{langkahKerja}\nHasil kegiatan: {hasil}. {kendala_solusi}'
      },

      // Shared templates for all
      {
        id: 'ct_kata_pengantar', templateId: 'all', sectionKey: 'kata_pengantar',
        template: 'Puji syukur penulis panjatkan ke hadirat Allah SWT atas rahmat dan karunia-Nya sehingga penulis dapat menyelesaikan Laporan Praktik Kerja Lapangan (PKL) ini dengan baik. Laporan ini disusun sebagai pertanggungjawaban atas pelaksanaan PKL yang telah penulis laksanakan di {perusahaan}, {alamatPerusahaan}, selama periode {tanggalMulai} sampai dengan {tanggalSelesai}.\n\nPada kesempatan ini, penulis ingin menyampaikan ucapan terima kasih yang sebesar-besarnya kepada:\n1. Bapak/Ibu Kepala {sekolah} yang telah memberikan kesempatan dan izin untuk melaksanakan PKL.\n2. {namaPembimbing} selaku pembimbing dari pihak {perusahaan} yang telah memberikan bimbingan dan arahan.\n3. Bapak/Ibu guru pembimbing dari {sekolah} yang senantiasa memberikan motivasi dan bimbingan.\n4. Seluruh karyawan {perusahaan} yang telah membantu penulis selama pelaksanaan PKL.\n5. Orang tua dan keluarga yang selalu memberikan dukungan moral dan material.\n6. Teman-teman yang telah memberikan semangat dan dorongan.\n\nPenulis menyadari bahwa laporan ini masih jauh dari sempurna. Oleh karena itu, penulis mengharapkan kritik dan saran yang membangun demi penyempurnaan laporan ini.\n\nSemoga laporan PKL ini dapat bermanfaat bagi semua pihak, khususnya bagi siswa yang akan melaksanakan PKL di masa yang akan datang.\n\n{kota}, {tanggalSelesai}\n\nPenulis,\n\n\n{namaSiswa}'
      },
      {
        id: 'ct_kesimpulan', templateId: 'all', sectionKey: 'bab5_kesimpulan',
        template: 'Berdasarkan pelaksanaan Praktik Kerja Lapangan (PKL) yang telah dilaksanakan di {perusahaan} selama periode {tanggalMulai} sampai dengan {tanggalSelesai}, penulis dapat mengambil kesimpulan sebagai berikut:\n\n1. PKL yang dilaksanakan di {perusahaan} telah memberikan pengalaman kerja yang sangat berharga bagi penulis dalam mengaplikasikan ilmu yang dipelajari di {sekolah}.\n2. Selama pelaksanaan PKL, penulis telah melaksanakan berbagai kegiatan yang berhubungan dengan bidang {jurusan}, di antaranya {ringkasanKegiatan}.\n3. Penulis dapat meningkatkan kemampuan teknis dan soft skills yang sangat diperlukan dalam dunia kerja, seperti kemampuan komunikasi, kerjasama tim, dan kedisiplinan.\n4. Lingkungan kerja di {perusahaan} sangat kondusif dan mendukung proses pembelajaran penulis selama PKL berlangsung.'
      },
      {
        id: 'ct_saran', templateId: 'all', sectionKey: 'bab5_saran',
        template: 'Berdasarkan pengalaman selama Praktik Kerja Lapangan, penulis ingin menyampaikan beberapa saran sebagai berikut:\n\n1. Bagi Sekolah ({sekolah}):\n   - Lebih meningkatkan kerjasama dengan perusahaan/instansi agar siswa PKL dapat ditempatkan sesuai dengan bidang keahliannya.\n   - Meningkatkan pembekalan materi teknis sebelum siswa melaksanakan PKL.\n   - Memperbanyak kunjungan pembimbing ke lokasi PKL untuk memantau perkembangan siswa.\n\n2. Bagi {perusahaan}:\n   - Terus meningkatkan program bimbingan bagi siswa PKL agar mereka dapat belajar lebih banyak.\n   - Memberikan tugas-tugas yang lebih menantang agar siswa PKL dapat mengembangkan kemampuannya.\n\n3. Bagi Siswa yang Akan Melaksanakan PKL:\n   - Manfaatkan waktu PKL sebaik-baiknya untuk belajar dan mengembangkan diri.\n   - Jaga sikap profesional dan disiplin selama PKL.\n   - Jangan ragu untuk bertanya kepada pembimbing jika ada hal yang belum dipahami.'
      }
    ],

    // Formatting rules per template
    formattingRules: [
      {
        id: 'fr_default', templateId: 'all',
        font: 'Times New Roman', fontSize: 12,
        marginTop: 3, marginRight: 3, marginBottom: 3, marginLeft: 4,
        lineSpacing: 1.5, paragraphSpacing: 12,
        headerFont: 'Times New Roman', headerSize: 14,
        numberingFormat: 'BAB I, BAB II',
        watermarkText: 'JokiLaporan.id - Versi Gratis',
        pageSize: 'A4'
      }
    ],

    plans: [
      {
        id: 'free', name: 'Gratis', price: 0, priceStr: 'Gratis',
        maxReports: 1, maxActivities: 10, maxPhotos: 20,
        canDocx: false, canPdfNoWatermark: false, revisions: 0,
        rewardRequired: true, active: true,
        features: ['1x Laporan Aktif', 'Maks. 10 Kegiatan', 'Maks. 20 Foto', 'Download PDF (via Reward)', 'Watermark di PDF']
      },
      {
        id: 'pro', name: 'Pro', price: 30000, priceStr: 'Rp 30.000',
        maxReports: 1, maxActivities: 50, maxPhotos: 100,
        canDocx: true, canPdfNoWatermark: true, revisions: 5,
        rewardRequired: false, active: true,
        features: ['1x Laporan', 'Maks. 50 Kegiatan', 'Maks. 100 Foto', 'Download PDF + DOCX', 'Tanpa Watermark', '5x Revisi']
      },
      {
        id: 'premium', name: 'Premium', price: 50000, priceStr: 'Rp 50.000',
        maxReports: 3, maxActivities: -1, maxPhotos: -1,
        canDocx: true, canPdfNoWatermark: true, revisions: 10,
        rewardRequired: false, active: true,
        features: ['3x Laporan', 'Kegiatan Tak Terbatas', 'Foto Tak Terbatas', 'Download PDF + DOCX', 'Tanpa Watermark', '10x Revisi']
      }
    ]
  };

  // ==================== SEEDING ====================
  function seed() {
    if (S.get(KEYS.seeded)) return; // Already seeded
    S.set(KEYS.schools, SEED.schools);
    S.set(KEYS.departments, SEED.departments);
    S.set(KEYS.templates, SEED.templates);
    S.set(KEYS.questions, SEED.questions);
    S.set(KEYS.qOptions, SEED.questionOptions);
    S.set(KEYS.contentTemplates, SEED.contentTemplates);
    S.set(KEYS.formattingRules, SEED.formattingRules);
    S.set(KEYS.plans, SEED.plans);
    S.set(KEYS.seeded, true);
    console.log('[DB] Seed data loaded successfully');
  }

  // ==================== CRUD HELPERS ====================
  function getAll(key) { return S.get(key) || []; }
  function saveAll(key, data) { return S.set(key, data); }

  function findById(key, id) { return getAll(key).find(item => item.id === id) || null; }
  function findWhere(key, predicate) { return getAll(key).filter(predicate); }

  function insert(key, item) {
    const all = getAll(key);
    all.push(item);
    saveAll(key, all);
    return item;
  }

  function update(key, id, updates) {
    const all = getAll(key);
    const idx = all.findIndex(item => item.id === id);
    if (idx === -1) return null;
    all[idx] = { ...all[idx], ...updates, updatedAt: new Date().toISOString() };
    saveAll(key, all);
    return all[idx];
  }

  function remove(key, id) {
    const all = getAll(key);
    const filtered = all.filter(item => item.id !== id);
    saveAll(key, filtered);
    return filtered.length < all.length;
  }

  // ==================== PUBLIC API ====================
  return {
    seed,

    // Schools
    schools: {
      getAll: () => getAll(KEYS.schools).filter(s => s.active !== false),
      getById: (id) => findById(KEYS.schools, id),
      create: (data) => insert(KEYS.schools, { id: 'sch_' + Date.now(), active: true, ...data }),
      update: (id, data) => update(KEYS.schools, id, data),
      delete: (id) => remove(KEYS.schools, id)
    },

    // Departments
    departments: {
      getAll: () => getAll(KEYS.departments).filter(d => d.active !== false),
      getBySchool: (schoolId) => findWhere(KEYS.departments, d => d.schoolId === schoolId && d.active !== false),
      getById: (id) => findById(KEYS.departments, id),
      create: (data) => insert(KEYS.departments, { id: 'dep_' + Date.now(), active: true, ...data }),
      update: (id, data) => update(KEYS.departments, id, data),
      delete: (id) => remove(KEYS.departments, id)
    },

    // Templates
    templates: {
      getAll: () => getAll(KEYS.templates).filter(t => t.active !== false),
      getById: (id) => findById(KEYS.templates, id),
      create: (data) => insert(KEYS.templates, { id: 'tpl_' + Date.now(), active: true, ...data }),
      update: (id, data) => update(KEYS.templates, id, data),
      delete: (id) => remove(KEYS.templates, id)
    },

    // Questions
    questions: {
      getAll: () => getAll(KEYS.questions),
      getByTemplate: (templateId) => findWhere(KEYS.questions, q => q.templateId === templateId).sort((a, b) => a.order - b.order),
      getByTemplateAndSection: (templateId, sectionKey) =>
        findWhere(KEYS.questions, q => q.templateId === templateId && q.sectionKey === sectionKey).sort((a, b) => a.order - b.order),
      getById: (id) => findById(KEYS.questions, id),
      create: (data) => insert(KEYS.questions, { id: 'q_' + Date.now(), ...data }),
      update: (id, data) => update(KEYS.questions, id, data),
      delete: (id) => remove(KEYS.questions, id)
    },

    // Question Options
    questionOptions: {
      getByQuestion: (questionId) => findWhere(KEYS.qOptions, o => o.questionId === questionId).sort((a, b) => a.order - b.order),
      create: (data) => insert(KEYS.qOptions, { id: 'opt_' + Date.now(), ...data }),
      update: (id, data) => update(KEYS.qOptions, id, data),
      delete: (id) => remove(KEYS.qOptions, id)
    },

    // Content Templates
    contentTemplates: {
      getByTemplate: (templateId) => findWhere(KEYS.contentTemplates, ct => ct.templateId === templateId || ct.templateId === 'all'),
      getByTemplateAndSection: (templateId, sectionKey) =>
        findWhere(KEYS.contentTemplates, ct => (ct.templateId === templateId || ct.templateId === 'all') && ct.sectionKey === sectionKey),
      create: (data) => insert(KEYS.contentTemplates, { id: 'ct_' + Date.now(), ...data }),
      update: (id, data) => update(KEYS.contentTemplates, id, data),
      delete: (id) => remove(KEYS.contentTemplates, id)
    },

    // Formatting Rules
    formattingRules: {
      getDefault: () => findWhere(KEYS.formattingRules, fr => fr.templateId === 'all')[0] || SEED.formattingRules[0],
      getByTemplate: (templateId) => findWhere(KEYS.formattingRules, fr => fr.templateId === templateId || fr.templateId === 'all')[0],
      update: (id, data) => update(KEYS.formattingRules, id, data)
    },

    // Plans
    plans: {
      getAll: () => getAll(KEYS.plans).filter(p => p.active !== false),
      getById: (id) => findById(KEYS.plans, id) || SEED.plans.find(p => p.id === id),
      update: (id, data) => update(KEYS.plans, id, data)
    },

    // Raw access
    raw: { getAll, findById, findWhere, insert, update, remove }
  };
})();

// Auto-seed on load
DB.seed();
