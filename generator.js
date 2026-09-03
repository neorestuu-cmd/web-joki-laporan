/**
 * JokiLaporan.id — Rule-Based Content Generator (generator.js)
 * Generates report sections from user data + template sentences
 */

const GENERATOR = (() => {

  // ==================== TEMPLATE RENDERING ====================
  function renderTemplate(template, data) {
    if (!template) return '';
    return template.replace(/\{(\w+)\}/g, (match, key) => {
      const val = getNestedValue(data, key);
      return val !== undefined && val !== null && val !== '' ? val : `[${key}]`;
    });
  }

  function getNestedValue(obj, key) {
    return key.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : undefined), obj);
  }

  // ==================== DATE FORMATTING ====================
  function formatDateId(isoStr) {
    if (!isoStr) return '';
    const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
    const d = new Date(isoStr);
    if (isNaN(d)) return isoStr;
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }

  function formatDateRange(start, end) {
    if (!start || !end) return '_______ s.d. _______';
    return `${formatDateId(start)} sampai dengan ${formatDateId(end)}`;
  }

  function getYear(isoStr) {
    if (!isoStr) return new Date().getFullYear();
    return new Date(isoStr).getFullYear();
  }

  // ==================== BUILD CONTEXT ====================
  function buildContext(data) {
    const activities = data.activities || [];
    const ringkasanKegiatan = activities.length > 0
      ? activities.slice(0, 3).map(a => a.name || a.kegiatan || 'kegiatan PKL').join(', ')
      : 'berbagai kegiatan PKL';

    return {
      // Student
      namaSiswa: data.namaSiswa || '[Nama Siswa]',
      nis: data.nis || data.nim || '[NIS]',
      kelas: data.kelas || '[Kelas]',
      jurusan: data.jurusan || '[Jurusan]',

      // School
      sekolah: data.sekolah || '[Nama Sekolah]',
      kepalaSekolah: data.kepalaSekolah || '[Kepala Sekolah]',
      guruPembimbing: data.guruPembimbing || '[Guru Pembimbing]',
      kota: data.kota || '[Kota]',

      // Company
      perusahaan: data.namaPerusahaan || '[Nama Perusahaan]',
      namaPerusahaan: data.namaPerusahaan || '[Nama Perusahaan]',
      alamatPerusahaan: data.alamatPerusahaan || '[Alamat Perusahaan]',
      bidangUsaha: data.bidangUsaha || '[Bidang Usaha]',
      namaPembimbing: data.namaPembimbing || '[Nama Pembimbing]',
      jabatanPembimbing: data.jabatanPembimbing || 'Pembimbing Lapangan',

      // Company profile
      sejarahPerusahaan: data.sejarahPerusahaan || 'Data sejarah perusahaan belum diisi.',
      visiPerusahaan: data.visiPerusahaan || 'Visi: belum diisi.',
      misiPerusahaan: data.misiPerusahaan || 'Misi: belum diisi.',

      // PKL period
      tanggalMulai: formatDateId(data.tanggalMulai),
      tanggalSelesai: formatDateId(data.tanggalSelesai),
      periodeLength: data.tanggalMulai && data.tanggalSelesai
        ? Math.round((new Date(data.tanggalSelesai) - new Date(data.tanggalMulai)) / (7 * 24 * 60 * 60 * 1000)) + ' minggu'
        : '[durasi]',
      tahun: getYear(data.tanggalMulai || data.tanggalSelesai),

      // Content
      ringkasanKegiatan,
      kesimpulan: data.kesimpulan || '',
      saran: data.saran || '',

      // Dynamic answers
      ...(data.answers || {})
    };
  }

  // ==================== SECTION GENERATORS ====================

  function genCover(data, ctx, fmt) {
    const year = ctx.tahun;
    return `LAPORAN PRAKTIK KERJA LAPANGAN

Disusun untuk Memenuhi Salah Satu Syarat
Kelulusan Kompetensi Keahlian ${ctx.jurusan}

Dilaksanakan di:
${ctx.namaPerusahaan}
${ctx.alamatPerusahaan}

Disusun Oleh:

Nama    : ${ctx.namaSiswa}
NIS     : ${ctx.nis}
Kelas   : ${ctx.kelas}
Jurusan : ${ctx.jurusan}

${ctx.sekolah}
Tahun Pelajaran ${year}/${year + 1}`;
  }

  function genPengesahan(data, ctx) {
    return `LEMBAR PENGESAHAN

Laporan Praktik Kerja Lapangan (PKL) ini telah diperiksa dan disahkan oleh pembimbing industri dan guru pembimbing sekolah.

Nama         : ${ctx.namaSiswa}
NIS          : ${ctx.nis}
Kelas        : ${ctx.kelas}
Program Studi: ${ctx.jurusan}
Tempat PKL   : ${ctx.namaPerusahaan}
Alamat       : ${ctx.alamatPerusahaan}
Periode PKL  : ${ctx.tanggalMulai} s.d. ${ctx.tanggalSelesai}


Disahkan di ${ctx.kota}, ${ctx.tanggalSelesai}


Pembimbing Industri,                    Guru Pembimbing,



${ctx.namaPembimbing}                   ________________________
${ctx.jabatanPembimbing}                NIP.


Mengetahui,
Kepala ${ctx.sekolah}


________________________
NIP.`;
  }

  function genKataPengantar(data, ctx, contentTemplates) {
    const ct = contentTemplates.find(c => c.sectionKey === 'kata_pengantar');
    if (ct) return renderTemplate(ct.template, ctx);

    return `KATA PENGANTAR
    
Puji syukur selalu terpanjatkan atas kehadirat Allah SWT yang telah melimpahkan nikmat, rahmat, serta hidayah-Nya kepada penulis. Pada kesempatan ini penulis menyampaikan terima kasih kepada semua pihak yang terlibat dalam penyusunan laporan sehingga penulis dapat menyelesaikan kegiatan Praktik Kerja Lapangan (PKL) yang dilaksanakan pada tanggal ${ctx.tanggalMulai} dan juga telah selesai dalam menyusun laporan Praktik Kerja Lapangan (PKL).

Laporan ini dibuat sebagai bentuk pertanggungjawaban secara tertulis atas pelaksanaan Praktik Kerja Lapangan yang telah saya lakukan di ${ctx.namaPerusahaan}. Selama proses pengerjaan hingga pembuatan laporan ini, penulis mendapatkan banyak bantuan, dukungan, dan arahan dari berbagai pihak. Oleh karena itu, dalam kesempatan ini, penulis ingin menyampaikan rasa terima kasih kepada :
1. Heppy Budi Kurniawan, S.Sn., M.Pd., selaku Kepala SMKN 1 Pracimantoro, yang telah memberikan dukungan dan bimbingan selama pelaksanaan PKL.
2. Sika Agusta Fermi Susila, S.ST., selaku Wks. Hubin SMKN 1 Pracimantoro,
3. ...................................., selaku Kepala program keahlian ${ctx.jurusan}, yang telah membantu dalam penyusunan program dan memberikan arahan yang berharga.
4. ...................................., selaku pembimbing PKL, yang telah senantiasa membimbing dan mendampingi penulis selama proses ini.
5. ...................................., selaku guru ....................... yang telah mendampingi selama PKL.
6. ...................................., selaku Manager wakil kepala cabang di ${ctx.namaPerusahaan}, yang telah memberikan izin serta kesempatan bagi penulis untuk melaksanakan PKL di perusahaan ini.
7. ...................................., selaku pembimbing di ${ctx.namaPerusahaan}, yang telah memberikan bimbingan dan pengetahuan yang sangat bermanfaat,
8. Kedua Orang tua penulis yang telah mendukung kegiatan PKL ini selama ......... bulan dalam segi materi maupun spiritual.
9. Semua pihak............................... yang telah mengajarkan banyak hal dan berbagai pengalaman berharga serta berkontribusi dalam membantu kegiatan PKL ini yang tidak bisa penulis sebutkan satu persatu.
10. Semua teman-teman yang telah mendukung penulis dalam kegiatan PKL ini yang tidak dapat saya sebutkan satu persatu.

Laporan ini jauh dari kata kesempurnaan, kritik dan saran yang bersifat membangun sangat saya butuhkan. Harapan saya semoga laporan yang memuat pengalaman dan pengetahuan yang didapatkan selama melaksanakan Praktik Kerja Lapangan (PKL) ini dapat bermanfaat.

Penulis


${ctx.namaSiswa}`;
  }

  function genDaftarIsi(data, ctx) {
    return `DAFTAR ISI
HALAMAN JUDUL .................................................... i
LEMBAR PENGESAHAN ................................................ ii
KATA PENGANTAR ................................................... iii
DAFTAR ISI ....................................................... iv
DAFTAR GAMBAR .................................................... v
DAFTAR TABEL ..................................................... vi
BAB I PENDAHULUAN ................................................. 1
A. Latar Belakang .............................................. 1
B. Tujuan Pelaksanaan Praktik Kerja Lapangan ................... 2
C. Waktu dan Tempat Pelaksanaan PKL ............................ 3
D. Bidang yang Dikerjakan ...................................... 3
BAB II GAMBARAN PERUSAHAAN ........................................ 4
A. Sejarah Singkat Industri .................................... 4
B. Visi, Misi dan Tujuan Perusahaan ............................ 5
C. Struktur Organisasi ......................................... 6
D. Pelayanan Jasa yang Dihasilkan .............................. 7
E. Peraturan dan Tata Tertib Kerja ............................. 7
BAB III KEGIATAN PRAKTIK KERJA LAPANGAN ........................... 8
A. Deskripsi Kegiatan Harian ................................... 8
B. Prosedur dan Teknik Pekerjaan ............................... 9
C. Peralatan dan Bahan yang Digunakan .......................... 10
D. Hasil Kerja yang Dicapai .................................... 11
E. Kendala dan Solusi .......................................... 12
BAB IV PEMBAHASAN ................................................. 13
A. Keterkaitan kegiatan PKL dengan Kompetensi Keahlian ....... 13
B. Penerapan Ilmu yang didapatkan di Sekolah ................... 14
C. Sinkronisasi Kebutuhan Industri Terhadap Lulusan / Alumni ... 15
D. Analisis Perbedaan Teori dan Praktik ........................ 16
BAB V PENUTUP ..................................................... 17
A. Kesimpulan .................................................. 17
B. Saran untuk Sekolah dan Industri ............................ 18
LAMPIRAN-LAMPIRAN ................................................. 19
A. Agenda dan Daftar Hadir ..................................... 19
B. Foto Kegiatan ............................................... 20
C. Fotokopi Sertifikat PKL ..................................... 21`;
  }

  function genDaftarGambar(data, ctx) {
    const activities = data.activities || [];
    let lines = ['DAFTAR GAMBAR\n'];
    let imgNum = 1;
    activities.forEach((act, idx) => {
      const photos = act.photos || [];
      photos.forEach((photo, pIdx) => {
        const caption = photo.caption || `Kegiatan ${act.name || `Kegiatan ${idx + 1}`}`;
        lines.push(`Gambar 4.${imgNum} ${caption} .................................................. ${11 + idx}`);
        imgNum++;
      });
    });
    if (imgNum === 1) lines.push('Gambar 4.1 Dokumentasi Kegiatan PKL ....................................... 12');
    return lines.join('\n');
  }

  function genBab1(data, ctx, contentTemplates) {
    return {
      heading: 'BAB I',
      subheading: 'PENDAHULUAN',
      sections: [
        {
          label: 'A.',
          title: 'Latar Belakang',
          type: 'paragraph',
          content: `Praktik Kerja Lapangan (PKL) adalah salah satu kegiatan yang wajib diikuti oleh siswa SMK, dengan tujuan memberikan pengalaman langsung dalam berbagai tugas dan lingkungan kerja. Melalui PKL, siswa bisa mendapatkan pengetahuan teori dari sekolah sekaligus mengaplikasikan langsung ilmu yang sudah dipelajari. Sehingga siswa bisa tahu cara kerja di industri, mulai dari metode kerja, cara menggunakan alat, sampai cara menerapkan aturan kerja yang berlaku. Selain itu, PKL juga membantu siswa mengenal lingkungan kerja secara langsung, sehingga bisa lebih siap menghadapi dunia kerja setelah lulus.\n\nPelaksanaan PKL berperan penting bagi siswa SMK karena dapat meningkatkan keterampilan, pengetahuan, dan pengalaman bekerja. Selama masa pelaksanaan PKL, para siswa diajarkan untuk bersikap disiplin, tanggung jawab, serta mampu bekerja sama dengan rekan sekerja. Siswa juga belajar berkomunikasi dengan baik, serta belajar mengatasi berbagai masalah yang muncul di lapangan. Bagi siswa yang mengambil jurusan ${ctx.jurusan}, PKL sangat berguna untuk meningkatkan kemampuan di bidang tersebut sesuai kompetensi keahlian yang dipelajari.`
        },
        {
          label: 'B.',
          title: 'Tujuan Pelaksanaan Praktik Kerja Lapangan',
          type: 'list',
          content: [
            'Meningkatkan kompetensi keahlian yang telah diperoleh di sekolah.',
            'Bertambahnya wawasan mengenai dunia kerja khususnya berupa pengalaman secara langsung/nyata dalam rangka menanamkan iklim kerja positif yang berorientasi pada mutu proses dan hasil kerja.',
            `Meningkatkan hard skills serta tertanamnya etos kerja yang tinggi sesuai Prosedur Operasional Standar (POS) dan budaya di dunia kerja.`,
            'Memperkuat kemampuan produktif sesuai dengan konsentrasi keahlian yang dipelajari.',
            'Mengembangkan kemampuan sesuai perkembangan dunia kerja dengan bimbingan/arahan pembimbing dunia kerja dan dapat berkontribusi kepada dunia kerja.',
            'Memperkuat karakter sesuai dengan nilai-nilai yang tumbuh dari budaya dunia kerja dan sesuai dengan Profil Pelajar Pancasila.',
            'Mengembangkan kemandirian belajar dan kemampuan kewirausahaan peserta PKL, dan peningkatan keahlian profesional sebagai bekal untuk meningkatkan taraf hidup dan pengembangan diri secara berkelanjutan.',
            'Menumbuhkan rasa percaya diri yang selanjutnya akan memotivasi peserta untuk meningkatkan keahlian profesionalnya pada tingkat yang lebih tinggi.'
          ]
        },
        {
          label: 'C.',
          title: 'Waktu dan Tempat Pelaksanaan PKL',
          type: 'list',
          content: [
            `Waktu pelaksanaan Praktik Kerja Lapangan dilaksanakan pada tanggal .............. sampai dengan......................`,
            `Tempat pelaksanaan Praktik Kerja Lapangan di ${ctx.namaPerusahaan || '...............'}`
          ]
        },
        {
          label: 'D.',
          title: 'Bidang yang Dikerjakan',
          type: 'paragraph',
          content: `Bidang yang dikerjakan selama PKL meliputi............... (Disesuaikan dengan jurusan)`
        }
      ]
    };
  }

  function genBab2(data, ctx) {
    return {
      heading: 'BAB II',
      subheading: 'GAMBARAN PERUSAHAAN',
      sections: [
        {
          label: 'A.',
          title: 'Sejarah Singkat Industri',
          type: 'paragraph',
          content: ctx.sejarahPerusahaan || `${ctx.namaPerusahaan} adalah perusahaan yang bergerak di bidang ${ctx.bidangUsaha || '...'}. Berdiri sejak............, ${ctx.namaPerusahaan} telah memberikan pelayanan terbaik kepada pelanggan. Seiring dengan perkembangan kebutuhan masyarakat di sekitar ${ctx.kota || 'Indonesia'} akan perangkat dan layanan bidang ${ctx.bidangUsaha || '...'}, maka ${ctx.namaPerusahaan} mulai berkembang....................................`
        },
        {
          label: 'B.',
          title: 'Visi dan Misi Perusahaan',
          type: 'paragraph',
          content: ctx.visiPerusahaan ? `Visi: ${ctx.visiPerusahaan}\n\nMisi: ${ctx.misiPerusahaan}` : '(Diuraikan sesuai visi dan misi perusahaan atau tempat PKL)'
        },
        {
          label: 'C.',
          title: 'Struktur Organisasi',
          type: 'paragraph',
          content: '(dibuat dalam bentuk bagan dan diuraikan)'
        },
        {
          label: 'D.',
          title: 'Pelayanan Jasa yang Dihasilkan',
          type: 'paragraph',
          content: `${ctx.namaPerusahaan} adalah perusahaan yang bergerak di bidang ${ctx.bidangUsaha || '...'}. Produk dan layanan yang dihasilkan antara lain..................... (Disesuaikan dengan tempat PKL).`
        },
        {
          label: 'E.',
          title: 'Peraturan dan Tata Tertib Kerja',
          type: 'paragraph',
          content: `Peraturan dan tata tertib adalah aturan yang harus diikuti oleh setiap orang dalam suatu lingkungan, baik disekolah maupun di tempat kerja. Aturan ini dibuat agar semua kegiatan bisa berjalan dengan rapi, tertib, dan lancar tanpa ada gangguan sama sekali. Selain itu, aturan juga digunakan untuk mengontrol sikap dan tindakan seseorang agar lebih tertib, patuh, serta menghormati orang lain di sekitar.\n1. Peraturan dan tata tertib kerja yang diterapkan di ${ctx.namaPerusahaan} adalah sebagai berikut:\n2. Jam Operasional di ......................................`
        }
      ]
    };
  }

  function genBab3(data, ctx) {
    const jurusan = (data.jurusan || ctx.jurusan || '').toLowerCase();
    let teori = '';

    if (jurusan.includes('tkj') || jurusan.includes('jaringan') || jurusan.includes('komputer')) {
      teori = `BAB III
LANDASAN TEORI

3.1 Jaringan Komputer

Jaringan komputer adalah sekumpulan komputer beserta perangkat-perangkat lain yang saling terhubung satu sama lain melalui media transmisi. Jaringan komputer memungkinkan komunikasi dan berbagi sumber daya antar perangkat yang terhubung.

3.2 Jenis-jenis Jaringan Komputer

a. LAN (Local Area Network)
LAN adalah jaringan komputer yang mencakup area yang terbatas, seperti sebuah gedung atau sekelompok gedung.

b. WAN (Wide Area Network)
WAN adalah jaringan komputer yang mencakup area yang luas, seperti jaringan antar kota atau antar negara.

c. MAN (Metropolitan Area Network)
MAN adalah jaringan komputer yang mencakup area metropoliten atau sebuah kota.

3.3 Perangkat Jaringan

a. Router: Perangkat yang digunakan untuk menghubungkan dua atau lebih jaringan yang berbeda.
b. Switch: Perangkat yang digunakan untuk menghubungkan beberapa komputer dalam satu jaringan.
c. Access Point: Perangkat yang memungkinkan perangkat wireless untuk terhubung ke jaringan.
d. Kabel UTP: Kabel yang umum digunakan untuk koneksi jaringan ethernet.`;
    } else if (jurusan.includes('rpl') || jurusan.includes('perangkat lunak')) {
      teori = `BAB III
LANDASAN TEORI

3.1 Rekayasa Perangkat Lunak

Rekayasa perangkat lunak (Software Engineering) adalah pendekatan sistematis untuk pengembangan, operasi, dan pemeliharaan perangkat lunak.

3.2 Metodologi Pengembangan Perangkat Lunak

a. Waterfall: Model pengembangan yang bersifat sekuensial, dimana setiap fase harus selesai sebelum fase berikutnya dimulai.
b. Agile: Metodologi yang berfokus pada kolaborasi tim dan adaptasi terhadap perubahan.
c. Scrum: Framework agile yang menggunakan sprint untuk mengatur pekerjaan.

3.3 Teknologi yang Digunakan

Dalam pelaksanaan PKL, penulis menggunakan berbagai teknologi pengembangan perangkat lunak yang relevan dengan kegiatan di ${ctx.namaPerusahaan}.`;
    } else if (jurusan.includes('akun')) {
      teori = `BAB III
LANDASAN TEORI

3.1 Pengertian Akuntansi

Akuntansi adalah proses pencatatan, pengklasifikasian, peringkasan, dan pelaporan transaksi keuangan suatu entitas untuk menghasilkan informasi yang berguna bagi pengambilan keputusan.

3.2 Siklus Akuntansi

Siklus akuntansi meliputi: pencatatan bukti transaksi, pencatatan jurnal, pembuatan buku besar, neraca saldo, jurnal penyesuaian, dan laporan keuangan.

3.3 Laporan Keuangan

Laporan keuangan terdiri dari: Laporan Laba Rugi, Neraca (Laporan Posisi Keuangan), Laporan Perubahan Ekuitas, dan Laporan Arus Kas.`;
    } else {
      teori = `BAB III
LANDASAN TEORI

3.1 Pengertian Praktik Kerja Lapangan

Praktik Kerja Lapangan (PKL) adalah suatu kegiatan pendidikan yang dilaksanakan di dunia usaha atau industri yang relevan dengan program keahlian peserta didik.

3.2 Dasar Hukum

Pelaksanaan PKL didasarkan pada Permendikbud No. 50 Tahun 2020 tentang Praktik Kerja Lapangan bagi Peserta Didik.

3.3 Kompetensi yang Dikembangkan

Dalam pelaksanaan PKL di ${ctx.namaPerusahaan}, penulis mengembangkan kompetensi yang relevan dengan bidang ${ctx.jurusan}.`;
    }

    return teori;
  }

  function genBab4(data, ctx, contentTemplates) {
    const activities = data.activities || [];
    const ctKegiatan = contentTemplates.find(c => c.sectionKey === 'bab4_kegiatan');
    // build activity items for structured output
    const activityItems = activities.length > 0 ? activities.map((act, idx) => ({
      tanggal: formatDateId(act.tanggal || act.date),
      nama: act.name || act.kegiatan || `Kegiatan ${idx+1}`,
      deskripsi: act.description || act.deskripsi || '',
      langkah: (act.steps || act.langkahKerja || '').split('\n').filter(s => s.trim()),
      hasil: act.result || act.hasil || 'Kegiatan berhasil dilaksanakan.',
      kendala: act.kendala || '',
      solusi: act.solusi || '',
      photos: act.photos || []
    })) : [];

    let kegiatanSection = '';
    let imgCounter = 1;

    if (activities.length === 0) {
      kegiatanSection = 'Data kegiatan PKL belum diisi.';
    } else {
      activities.forEach((act, idx) => {
        const actCtx = {
          ...ctx,
          tanggal: formatDateId(act.tanggal || act.date),
          kegiatan: act.name || act.kegiatan || `Kegiatan ${idx + 1}`,
          deskripsi: act.description || act.deskripsi || '',
          alat: [act.alat, act.bahan, act.software].filter(Boolean).join(', ') || '-',
          langkahKerja: act.steps || act.langkahKerja
            ? (act.steps || act.langkahKerja).split('\n').map((s, i) => `${i + 1}. ${s.trim()}`).join('\n')
            : '(langkah kerja belum diisi)',
          hasil: act.result || act.hasil || 'Kegiatan berhasil dilaksanakan.',
          kendala_solusi: act.kendala
            ? `Kendala yang ditemukan: ${act.kendala}. ${act.solusi ? `Solusi yang diterapkan: ${act.solusi}` : ''}`
            : ''
        };

        let kegText = '';
        if (ctKegiatan) {
          kegText = renderTemplate(ctKegiatan.template, actCtx);
        } else {
          kegText = `Pada tanggal ${actCtx.tanggal}, penulis melakukan kegiatan ${actCtx.kegiatan}. ${actCtx.deskripsi} Alat dan bahan yang digunakan: ${actCtx.alat}. Langkah-langkah yang dilakukan:\n${actCtx.langkahKerja}\n\nHasil kegiatan: ${actCtx.hasil}. ${actCtx.kendala_solusi}`;
        }

        kegiatanSection += `4.2.${idx + 1} ${act.name || `Kegiatan ${idx + 1}`}\n\n`;
        kegiatanSection += kegText + '\n\n';

        // Add photo placeholders
        const photos = act.photos || [];
        if (photos.length > 0) {
          photos.forEach((photo, pIdx) => {
            const caption = photo.caption || `Kegiatan ${act.name || idx + 1}`;
            kegiatanSection += `[FOTO ${imgCounter}]\nGambar 4.${imgCounter} ${caption}\n\n`;
            imgCounter++;
          });
        }
      });
    }

    // Alat & bahan summary
    const allAlat = [...new Set(activities.flatMap(a => [a.alat, a.bahan, a.software].filter(Boolean)))];

    // Kendala & solusi summary
    const kendalas = activities.filter(a => a.kendala).map((a, i) => `${i + 1}. ${a.kendala} — Solusi: ${a.solusi || 'Berkonsultasi dengan pembimbing'}`);

    return {
      heading: 'BAB III',
      subheading: 'KEGIATAN PRAKTIK KERJA LAPANGAN',
      sections: [
        {
          label: 'A.',
          title: 'Deskripsi Kegiatan Harian',
          type: 'paragraph',
          content: `Selama melaksanakan Praktik Kerja Lapangan (PKL) di ${ctx.namaPerusahaan}, saya melakukan berbagai kegiatan yang berkaitan dengan perawatan, perbaikan, dan pengecekan perangkat. Kegiatan yang dilakukan antara lain sebagai berikut:............... (disesuaikan dengan kegiatan harian di tempat PKL)`,
          activities: activityItems
        },
        {
          label: 'B.',
          title: 'Prosedur dan Teknik Pekerjaan',
          type: 'bullets',
          content: [
            'Prosedur kerja diawali dengan briefing pagi.',
            'Memastikan tempat kerja sudah bersih.',
            'Mempersiapkan alat dan bahan yang akan digunakan sesuai SOP.',
            `Kemudian pelaksanaan tugas sesuai jobdesk ${ctx.jurusan} yang digunakan meliputi ............... (disesuaikan dengan pekerjaan di tempat PKL).`
          ]
        },
        {
          label: 'C.',
          title: 'Peralatan dan Bahan yang Digunakan',
          type: 'paragraph',
          content: '(uraikan alat dan bahan yang digunakan saat melaksanakan tugas sesuai jobdesk dalam bentuk tabel)'
        },
        {
          label: 'D.',
          title: 'Hasil Kerja yang Dicapai',
          type: 'paragraph',
          content: `Setelah melakukan kegiatan PKL selama ${ctx.periodeLength} di ${ctx.namaPerusahaan}, banyak hal yang telah saya lakukan. Banyak hal yang saya maksud di antaranya:.............................`
        },
        {
          label: 'E.',
          title: 'Kendala dan Solusi',
          type: 'paragraph',
          content: activityItems.some(a => a.kendala)
            ? activityItems.filter(a => a.kendala).map(a => `Kendala : ${a.kendala}\nSolusi  : ${a.solusi || 'Berkonsultasi dengan pembimbing'}`).join('\n')
            : `Kendala : ..............................\nSolusi  : ..............................`
        }
      ]
    };

  }

  // BAB IV: PEMBAHASAN (terpisah dari BAB III Kegiatan PKL)
  function genBab4Pembahasan(data, ctx) {
    const jurusan = ctx.jurusan || '...';
    const tableRowsKompetensi = [
      'Komputer dan Jaringan Dasar','Pemrograman','Desain Grafis',
      'Teknologi WAN','Administrasi Infrastruktur Jaringan',
      'Administrasi Sistem Jaringan','Teknologi Layanan Jaringan','Kreativitas, Inovasi, dan Kewirausahaan'
    ].map((el,i) => `<tr><td style="padding:6px;border:1px solid #000;text-align:center">${i+1}.</td><td style="padding:6px;border:1px solid #000">${el}</td><td style="padding:6px;border:1px solid #000">&nbsp;</td><td style="padding:6px;border:1px solid #000">&nbsp;</td></tr>`).join('');

    const tableRowsSinkronisasi = [
      'Apakah industri tempat kalian PKL bisa menerima lulusan SMK? Jelaskan!',
      'Posisi/Jabatan apa saja yang dibutuhkan pada tempat kalian PKL untuk lulusan SMK?',
      'Berapa kisaran gaji yang diterima untuk lulusan SMK di industri tempat kalian PKL?',
      'Keterampilan dan syarat apa yang dibutuhkan industri tempat kalian PKL untuk calon pelamar kerja lulusan SMK?',
      'Apakah industri tempat kalian PKL selanjutnya akan merekrut siswa PKL jika kinerjanya bagus selama PKL?'
    ].map((q,i) => `<tr><td style="padding:6px;border:1px solid #000;text-align:center;vertical-align:top;width:30px">${i+1}.</td><td style="padding:6px;border:1px solid #000;vertical-align:top">${q}</td><td style="padding:6px;border:1px solid #000;width:40%">&nbsp;</td></tr>`).join('');

    const tableRowsAnalisis = [
      '1.','2.'
    ].map(n => `<tr><td style="padding:6px;border:1px solid #000;text-align:center">${n}</td><td style="padding:6px;border:1px solid #000">&nbsp;</td><td style="padding:6px;border:1px solid #000">&nbsp;</td></tr>`).join('');

    return {
      heading: 'BAB IV',
      subheading: 'PEMBAHASAN',
      sections: [
        {
          label: 'A.',
          title: 'Keterkaitan Kegiatan PKL Dengan Kompetensi Keahlian',
          type: 'html',
          html: `<table style="width:100%;border-collapse:collapse;font-size:11pt;margin-top:8px">
            <thead>
              <tr>
                <th style="padding:6px;border:1px solid #000;text-align:center;width:30px">NO.</th>
                <th style="padding:6px;border:1px solid #000;text-align:center">ELEMEN</th>
                <th colspan="2" style="padding:6px;border:1px solid #000;text-align:center">KETERLAKSANAAN DI DU/DI</th>
              </tr>
              <tr>
                <th style="border:1px solid #000"></th>
                <th style="border:1px solid #000"></th>
                <th style="padding:6px;border:1px solid #000;text-align:center">YA</th>
                <th style="padding:6px;border:1px solid #000;text-align:center">TIDAK</th>
              </tr>
            </thead>
            <tbody>${tableRowsKompetensi}</tbody>
          </table>`
        },
        {
          label: 'B.',
          title: 'Penerapan Ilmu Yang Didapatkan di Sekolah',
          type: 'paragraph',
          content: `Penerapan Ilmu sekolah saat Praktik Kerja Lapangan (PKL) bagi siswa jurusan ${jurusan} sangat krusial karena di sinilah teori jaringan yang kompleks bertemu dengan infrastruktur nyata. Berikut adalah beberapa bentuk penerapan konkret ilmu ${jurusan} di industri:............................`
        },
        {
          label: 'C.',
          title: 'Sinkronisasi Kebutuhan Industri Terhadap Lulusan /Alumni SMK',
          type: 'html',
          html: `<table style="width:100%;border-collapse:collapse;font-size:11pt;margin-top:8px">
            <thead>
              <tr>
                <th style="padding:6px;border:1px solid #000;text-align:center;width:30px">NO.</th>
                <th style="padding:6px;border:1px solid #000;text-align:center">PERTANYAAN</th>
                <th style="padding:6px;border:1px solid #000;text-align:center">JAWABAN</th>
              </tr>
            </thead>
            <tbody>${tableRowsSinkronisasi}</tbody>
          </table>`
        },
        {
          label: 'D.',
          title: 'Analisis Perbedaan Teori dan Praktik',
          type: 'html',
          html: `<p style="margin:4px 0 8px;text-align:justify">Kompetensi dilaksanakan di Industri namun belum diajarkan di sekolah.</p>
          <table style="width:100%;border-collapse:collapse;font-size:11pt">
            <thead>
              <tr>
                <th style="padding:6px;border:1px solid #000;text-align:center;width:30px">NO.</th>
                <th style="padding:6px;border:1px solid #000">Uraian Kompetensi</th>
                <th style="padding:6px;border:1px solid #000">Saran Untuk Sekolah</th>
              </tr>
            </thead>
            <tbody>${tableRowsAnalisis}</tbody>
          </table>`
        }
      ]
    };
  }

  function genBab5(data, ctx, contentTemplates) {
    const kesimpulan = data.kesimpulan
      || `Berdasarkan pelaksanaan PKL di ${ctx.namaPerusahaan} selama ${ctx.periodeLength}, penulis dapat mengambil kesimpulan:\n1. PKL telah memberikan banyak manfaat, terutama dalam mengembangkan kompetensi di bidang ${ctx.jurusan}.\n2. Selama PKL, penulis telah melaksanakan berbagai kegiatan yaitu ${ctx.ringkasanKegiatan}.\n3. Pengalaman ini sangat berharga untuk persiapan memasuki dunia kerja.`;

    const saranIndustri = `1. Terus meningkatkan kualitas bimbingan kepada peserta PKL sehingga peserta PKL dapat belajar lebih banyak hal di dunia industri.\n2. Meningkatkan dokumentasi prosedur kerja, untuk memudahkan proses pembelajaran bagi siswa PKL.`;
    const saranSekolah = `1. Lebih meningkatkan kerja sama antara sekolah dan industri, sehingga pelaksanaan PKL dapat berlangsung lebih efektif dan sesuai dengan kebutuhan dunia kerja.\n2. Memberikan pembekalan yang lebih lengkap sebelum siswa dikirim ke tempat PKL.`;
    const saranSiswa = `\u2022 Meningkatkan inisiatif dan proaktif dalam pencari pengalaman dan pengetahuan baru selama PKL.\n\u2022 Mendokumentasikan setiap kegiatan dan pengalaman selama PKL, untuk bahan evaluasi dan dokumentasi laporan.\n\u2022 Lebih meningkatkan ketelitian dalam setiap pekerjaan yang diberikan.\n\u2022 Tidak malu bertanya ketika terdapat kesulitan.`;

    return {
      heading: 'BAB V',
      subheading: 'PENUTUP',
      sections: [
        {
          label: 'A.',
          title: 'Kesimpulan',
          type: 'paragraph',
          content: kesimpulan
        },
        {
          label: 'B.',
          title: 'Saran',
          type: 'saran',
          items: [
            { subtitle: '1. Saran bagi Industri', content: saranIndustri },
            { subtitle: '2. Saran bagi Sekolah', content: saranSekolah },
            { subtitle: '3. Saran bagi Siswa', content: saranSiswa }
          ]
        }
      ]
    };
  }

  function genDaftarPustaka(data, ctx) {
    const year = ctx.tahun;
    return `DAFTAR PUSTAKA

Kementerian Pendidikan dan Kebudayaan Republik Indonesia. (2020). Permendikbud No. 50 Tahun 2020 tentang Praktik Kerja Lapangan. Jakarta: Kemendikbud.

Sugiyono. (2020). Metode Penelitian Pendidikan. Bandung: Alfabeta.

Tim Penyusun ${ctx.sekolah}. (${year}). Panduan Pelaksanaan Praktik Kerja Lapangan. ${ctx.kota || 'Jakarta'}: ${ctx.sekolah}.

${ctx.namaPerusahaan}. (${year}). Company Profile ${ctx.namaPerusahaan}. [Dokumen Internal].

Wikipedia. (${year}). ${ctx.jurusan}. https://id.wikipedia.org/wiki/${encodeURIComponent(ctx.jurusan)} [Diakses pada ${ctx.tanggalSelesai || new Date().toLocaleDateString('id-ID')}].`;
  }

  function genLampiran(data, ctx) {
    const activities = data.activities || [];
    let lampiranText = `LAMPIRAN

Lampiran 1. Surat Keterangan Praktik Kerja Lapangan
[Terlampir]

Lampiran 2. Daftar Hadir PKL
[Terlampir]

Lampiran 3. Jurnal Kegiatan Harian
[Terlampir]

Lampiran 4. Nilai PKL dari ${ctx.namaPerusahaan}
[Terlampir]

Lampiran 5. Lembar Penilaian Pembimbing Sekolah
[Terlampir]

Lampiran 6. Dokumentasi Foto Kegiatan PKL\n`;

    let imgNum = 1;
    activities.forEach((act, idx) => {
      const photos = act.photos || [];
      photos.forEach((photo) => {
        const caption = photo.caption || `Dokumentasi Kegiatan ${act.name || idx + 1}`;
        lampiranText += `\n[FOTO LAMPIRAN ${imgNum}]\nFoto ${imgNum}: ${caption}\n`;
        imgNum++;
      });
    });

    if (imgNum === 1) {
      lampiranText += '\n[Foto dokumentasi kegiatan PKL terlampir]\n';
    }

    return lampiranText;
  }

  // ==================== MAIN GENERATE FUNCTION ====================
  function generate(data) {
    try {
      // Get content templates from DB (or use defaults)
      let contentTemplates = [];
      if (typeof DB !== 'undefined') {
        const templateId = data.templateId || 'tpl_generic';
        contentTemplates = DB.contentTemplates.getByTemplate(templateId);
      }

      const ctx = buildContext(data);
      const fmt = (typeof DB !== 'undefined')
        ? DB.formattingRules.getDefault()
        : { font: 'Times New Roman', fontSize: 12 };

      return {
        cover: genCover(data, ctx, fmt),
        pengesahan: genPengesahan(data, ctx),
        katapengantar: genKataPengantar(data, ctx, contentTemplates),
        daftarisi: genDaftarIsi(data, ctx),
        daftargambar: genDaftarGambar(data, ctx),
        bab1: genBab1(data, ctx, contentTemplates),
        bab2: genBab2(data, ctx),
        bab3: genBab3(data, ctx),
        bab4: genBab4(data, ctx, contentTemplates),
        bab5: genBab5(data, ctx, contentTemplates),
        bab4pembahasan: genBab4Pembahasan(data, ctx),
        daftarpustaka: genDaftarPustaka(data, ctx),
        lampiran: genLampiran(data, ctx),
        data,
        ctx,
        generatedAt: new Date().toISOString()
      };
    } catch (err) {
      console.error('[GENERATOR] Error generating report:', err);
      throw err;
    }
  }

  // ==================== HTML PREVIEW GENERATOR ====================
  // Renders structured bab objects (bab1-bab5 are now objects, not plain strings)
  function generateHtmlPreview(report, sectionKey) {
    const { ctx, data } = report;
    const section = report[sectionKey];
    if (!section) return '<p style="color:#888">Bagian tidak tersedia.</p>';

    // Plain string sections (daftargambar, daftarpustaka, lampiran, bab3)
    if (typeof section === 'string') {
      return renderPlainText(section, data);
    }

    // BAB IV Pembahasan special
    if (sectionKey === 'bab4pembahasan') {
      return renderPembahasan(section, ctx);
    }

    // Structured BAB object
    let html = '';
    html += `<p style="text-align:center;font-weight:bold;margin:0 0 4px;font-size:12pt">${section.heading || ''}</p>`;
    html += `<p style="text-align:center;font-weight:bold;margin:0 0 20px;font-size:12pt">${section.subheading || ''}</p>`;

    (section.sections || []).forEach(s => {
      // Sub-heading: bold "A. Title"
      html += `<p style="font-weight:bold;margin:14px 0 6px"><strong>${s.label}</strong> ${s.title}</p>`;

      if (s.type === 'paragraph') {
        const paras = (s.content || '').split('\n');
        paras.forEach(p => {
          const t = p.trim();
          if (!t) return;
          if (t.match(/^\d+\./)) {
            html += `<p style="margin:3px 0;text-align:justify">${t}</p>`;
          } else {
            html += `<p style="margin:3px 0;text-align:justify;text-indent:1.25cm">${t}</p>`;
          }
        });
        // Render activity blocks
        if (s.activities && s.activities.length > 0) {
          s.activities.forEach((act, idx) => {
            html += `<p style="margin:10px 0 4px;font-style:italic;font-weight:bold">Kegiatan ${idx+1}: ${act.nama} (${act.tanggal || ''})</p>`;
            if (act.deskripsi) html += `<p style="margin:3px 0;text-align:justify;text-indent:1.25cm">${act.deskripsi}</p>`;
            if (act.photos && act.photos.length > 0) {
              act.photos.forEach((ph, pi) => {
                const src = ph.data || ph.src;
                const cap = ph.caption || `Foto ${idx+1}.${pi+1}`;
                if (src) {
                  html += `<div style="text-align:center;margin:12px 0"><img src="${src}" style="max-width:100%;max-height:260px;border:1px solid #ddd"><br><em style="font-size:10pt">${cap}</em></div>`;
                }
              });
            }
          });
        }
      } else if (s.type === 'list') {
        (s.content || []).forEach((item, i) => {
          html += `<p style="margin:3px 0;text-align:justify">${i+1}. ${item}</p>`;
        });
      } else if (s.type === 'bullets') {
        (s.content || []).forEach(item => {
          html += `<p style="margin:3px 0;text-align:justify;padding-left:20px">&bull; ${item}</p>`;
        });
      } else if (s.type === 'saran') {
        (s.items || []).forEach(si => {
          html += `<p style="margin:8px 0 4px;font-weight:normal">${si.subtitle}</p>`;
          const sarLines = (si.content || '').split('\n');
          sarLines.forEach(line => {
            const t = line.trim();
            if (!t) return;
            if (t.startsWith('\u2022') || t.startsWith('-')) {
              html += `<p style="margin:2px 0;text-align:justify;padding-left:20px">${t}</p>`;
            } else {
              html += `<p style="margin:2px 0;text-align:justify">${t}</p>`;
            }
          });
        });
      }
    });

    return html;
  }

  function renderPlainText(content, data) {
    const lines = content.split('\n');
    let html = '';
    lines.forEach(line => {
      const t = line.trim();
      if (!t) { html += '<p style="margin:4px 0"></p>'; return; }
      if (t.match(/^BAB [IVX]+$/)) {
        html += `<p style="text-align:center;font-weight:bold;margin:0 0 4px">${t}</p>`;
      } else if (t.match(/^[A-Z ]+$/) && t.length > 3) {
        html += `<p style="text-align:center;font-weight:bold;margin:0 0 16px">${t}</p>`;
      } else if (t.match(/^\d+\./)) {
        html += `<p style="margin:3px 0;text-align:justify">${t}</p>`;
      } else if (t.startsWith('[FOTO')) {
        const match = t.match(/\[FOTO (\d+)\]/);
        const imgNum = match ? parseInt(match[1]) : 0;
        const activities = (data && data.activities) || [];
        let photoSrc = null, photoCaption = '', counter = 1;
        outer: for (const act of activities) {
          for (const ph of (act.photos || [])) {
            if (counter === imgNum) { photoSrc = ph.data || ph.src; photoCaption = ph.caption || ''; break outer; }
            counter++;
          }
        }
        if (photoSrc) {
          html += `<div style="text-align:center;margin:12px 0"><img src="${photoSrc}" style="max-width:100%;max-height:260px;border:1px solid #ddd"><br><em style="font-size:10pt">${photoCaption}</em></div>`;
        } else {
          html += `<div style="text-align:center;margin:12px 0;padding:16px;background:#f5f5f5;border:1px dashed #ccc;color:#888;font-size:10pt">[Foto ${imgNum}] ${photoCaption}</div>`;
        }
      } else if (t.match(/^Gambar \d+/)) {
        html += `<p style="text-align:center;font-size:10pt;color:#444;margin:2px 0"><em>${t}</em></p>`;
      } else {
        html += `<p style="margin:4px 0;text-align:justify;text-indent:1.25cm">${t}</p>`;
      }
    });
    return html;
  }

  function renderPembahasan(section, ctx) {
    return `
      <p style="text-align:center;font-weight:bold;margin:0 0 4px">BAB IV</p>
      <p style="text-align:center;font-weight:bold;margin:0 0 20px">PEMBAHASAN</p>
      ${(section.sections||[]).map(s => `
        <p style="font-weight:bold;margin:14px 0 8px"><strong>${s.label}</strong> ${s.title}</p>
        ${s.html || ''}
      `).join('')}
    `;
  }

  // ==================== WATERMARK ====================
  function addWatermark(element, text = 'JokiLaporan.id — Versi Gratis') {
    const wm = document.createElement('div');
    wm.className = 'pdf-watermark';
    wm.textContent = text;
    element.style.position = 'relative';
    element.appendChild(wm);
  }

  // ==================== DOCX GENERATOR ====================
  async function generateDocx(report) {
    if (typeof docx === 'undefined') throw new Error('docx library not loaded');

    const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
            PageBreak, ImageRun, Table, TableRow, TableCell, WidthType, BorderStyle } = docx;

    const { ctx, data } = report;

    const sectionOrder = ['cover', 'pengesahan', 'katapengantar', 'daftarisi', 'daftargambar', 'bab1', 'bab2', 'bab3', 'bab4', 'bab4pembahasan', 'bab5', 'daftarpustaka', 'lampiran'];

    function flattenSection(sec) {
      if (typeof sec === 'string') return sec;
      if (!sec) return '';
      let text = '';
      if (sec.heading) text += sec.heading + '\n';
      if (sec.subheading) text += sec.subheading + '\n\n';
      (sec.sections || []).forEach(s => {
        text += s.label + ' ' + s.title + '\n\n';
        if (s.type === 'html') {
          // crude HTML strip for docx
          text += (s.html || '').replace(/<[^>]*>/g, '\n').replace(/\n+/g, '\n').trim() + '\n\n';
        } else if (s.type === 'saran') {
          text += (s.items || []).map(i => i.subtitle + '\n' + i.content).join('\n') + '\n\n';
        } else if (s.type === 'bullets' || s.type === 'list') {
          text += (s.content || []).map(c => c).join('\n') + '\n\n';
        } else {
          text += (s.content || '') + '\n\n';
        }
      });
      return text;
    }

    const sep = '\n\n' + '='.repeat(80) + '\n\n';
    const fullText = sectionOrder.map(k => flattenSection(report[k])).join(sep);
    const lines = fullText.split('\n');

    const paragraphs = [];

    for (const line of lines) {
      const trimmed = line.trim();

      if (!trimmed) {
        paragraphs.push(new Paragraph({ text: '', spacing: { after: 100 } }));
        continue;
      }

      if (trimmed.match(/^BAB [IVX]+$/)) {
        paragraphs.push(new Paragraph({
          children: [new TextRun({ text: trimmed, bold: true, size: 28, font: 'Times New Roman' })],
          alignment: AlignmentType.CENTER,
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 480, after: 240 },
          pageBreakBefore: true
        }));
      } else if (trimmed.match(/^[A-Z0-9]+\.[A-Z0-9]+ /)) {
        paragraphs.push(new Paragraph({
          children: [new TextRun({ text: trimmed, bold: true, size: 24, font: 'Times New Roman' })],
          spacing: { before: 280, after: 140 }
        }));
      } else if (trimmed.match(/^\d+\. /) || trimmed.match(/^[a-z]\. /)) {
        paragraphs.push(new Paragraph({
          children: [new TextRun({ text: trimmed, size: 24, font: 'Times New Roman' })],
          spacing: { after: 80 },
          indent: { left: 360 }
        }));
      } else if (trimmed.startsWith('[FOTO') || trimmed.startsWith('Gambar')) {
        paragraphs.push(new Paragraph({
          children: [new TextRun({ text: trimmed, size: 22, italics: true, color: '666666', font: 'Times New Roman' })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 120, after: 120 }
        }));
      } else {
        paragraphs.push(new Paragraph({
          children: [new TextRun({ text: trimmed, size: 24, font: 'Times New Roman' })],
          alignment: AlignmentType.JUSTIFIED,
          spacing: { after: 120, line: 360, lineRule: 'auto' },
          indent: { firstLine: 720 }
        }));
      }
    }

    const doc = new Document({
      sections: [{
        properties: {
          page: {
            margin: { top: 1134, right: 851, bottom: 1134, left: 1361 } // 3cm, 2.5cm, 3cm, 4cm in twentieths of a point
          }
        },
        children: paragraphs
      }],
      styles: {
        default: {
          document: {
            run: { font: 'Times New Roman', size: 24, color: '000000' }
          }
        }
      }
    });

    return await Packer.toBlob(doc);
  }

  // PUBLIC API
  return { generate, generateHtmlPreview, generateDocx, addWatermark, renderTemplate, buildContext, formatDateId };
})();
