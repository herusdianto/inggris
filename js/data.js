/*
 * Materi pelajaran.
 * vocab     : [emoji, english, indonesia]
 * qs        : soal eksplisit { t:'fill'|'mc', q, a, o:[opsi], ex? }
 * sentences : [english, indonesia] → dipakai untuk game "Susun Kalimat"
 * tip       : ringkasan materi yang tampil sebelum latihan
 */
const LEVELS = [
  {
    id: 'tk', name: 'TK', title: 'Little Stars', emoji: '🧸', color: '#ff8a3d',
    desc: 'Kenal kata pertama lewat gambar & suara: hewan, warna, angka, buah.',
    modes: ['pic', 'listen', 'pic', 'listen', 'spell'],
    units: [
      {
        id: 'tk-animals', title: 'Animals', titleId: 'Hewan', emoji: '🐶',
        vocab: [
          ['🐶', 'dog', 'anjing'], ['🐱', 'cat', 'kucing'], ['🐟', 'fish', 'ikan'], ['🐦', 'bird', 'burung'],
          ['🐘', 'elephant', 'gajah'], ['🦁', 'lion', 'singa'], ['🐄', 'cow', 'sapi'], ['🐔', 'chicken', 'ayam'],
          ['🐒', 'monkey', 'monyet'], ['🐸', 'frog', 'katak'],
        ],
      },
      {
        id: 'tk-colors', title: 'Colors', titleId: 'Warna', emoji: '🎨',
        vocab: [
          ['🔴', 'red', 'merah'], ['🔵', 'blue', 'biru'], ['🟢', 'green', 'hijau'], ['🟡', 'yellow', 'kuning'],
          ['🟠', 'orange', 'oranye'], ['🟣', 'purple', 'ungu'], ['⚫', 'black', 'hitam'], ['⚪', 'white', 'putih'],
          ['🟤', 'brown', 'cokelat'],
        ],
      },
      {
        id: 'tk-numbers', title: 'Numbers', titleId: 'Angka 1–10', emoji: '🔢',
        vocab: [
          ['1️⃣', 'one', 'satu'], ['2️⃣', 'two', 'dua'], ['3️⃣', 'three', 'tiga'], ['4️⃣', 'four', 'empat'],
          ['5️⃣', 'five', 'lima'], ['6️⃣', 'six', 'enam'], ['7️⃣', 'seven', 'tujuh'], ['8️⃣', 'eight', 'delapan'],
          ['9️⃣', 'nine', 'sembilan'], ['🔟', 'ten', 'sepuluh'],
        ],
      },
      {
        id: 'tk-fruits', title: 'Fruits', titleId: 'Buah', emoji: '🍎',
        vocab: [
          ['🍎', 'apple', 'apel'], ['🍌', 'banana', 'pisang'], ['🍇', 'grapes', 'anggur'], ['🍊', 'orange', 'jeruk'],
          ['🍉', 'watermelon', 'semangka'], ['🍓', 'strawberry', 'stroberi'], ['🍍', 'pineapple', 'nanas'],
          ['🥭', 'mango', 'mangga'], ['🍒', 'cherry', 'ceri'],
        ],
      },
      {
        id: 'tk-toys', title: 'Toys & Things', titleId: 'Mainan & Benda', emoji: '🪁',
        vocab: [
          ['⚽', 'ball', 'bola'], ['🧸', 'teddy bear', 'boneka beruang'], ['🚗', 'car', 'mobil'], ['🪁', 'kite', 'layang-layang'],
          ['🎈', 'balloon', 'balon'], ['⭐', 'star', 'bintang'], ['🌙', 'moon', 'bulan'], ['☀️', 'sun', 'matahari'],
          ['🏠', 'house', 'rumah'],
        ],
      },
    ],
  },

  {
    id: 'sd', name: 'SD', title: 'Explorer', emoji: '🎒', color: '#16a571',
    desc: 'Keluarga, tubuh, sekolah, kegiatan sehari-hari, dan kalimat sederhana.',
    modes: ['pic', 'listen', 'spell', 'en2id', 'id2en'],
    units: [
      {
        id: 'sd-greetings', title: 'Greetings', titleId: 'Salam & Perkenalan', emoji: '👋',
        tip: 'Good morning (pagi), good afternoon (siang/sore), good evening (malam saat bertemu), good night (malam saat berpisah/mau tidur).',
        qs: [
          { t: 'mc', q: '"Good morning" diucapkan pada…', a: 'Pagi hari', o: ['Pagi hari', 'Siang hari', 'Malam hari', 'Saat tidur'] },
          { t: 'mc', q: 'A: "How are you?"  B: "…"', a: "I'm fine, thank you.", o: ["I'm fine, thank you.", 'My name is Budi.', "I'm ten years old.", 'Goodbye!'] },
          { t: 'mc', q: 'A: "What is your name?"  B: "…"', a: 'My name is Sari.', o: ['My name is Sari.', "I'm fine.", 'I live in Bandung.', 'Thank you.'] },
          { t: 'mc', q: 'Mau tidur, kita bilang…', a: 'Good night', o: ['Good night', 'Good morning', 'Good afternoon', 'Hello'] },
          { t: 'mc', q: 'Arti "Nice to meet you" adalah…', a: 'Senang bertemu denganmu', o: ['Senang bertemu denganmu', 'Sampai jumpa', 'Apa kabar?', 'Terima kasih'] },
          { t: 'mc', q: 'A: "Thank you!"  B: "…"', a: "You're welcome.", o: ["You're welcome.", "I'm sorry.", 'Good night.', 'See you.'] },
          { t: 'mc', q: 'Bahasa Inggrisnya "Sampai jumpa lagi" adalah…', a: 'See you later', o: ['See you later', 'How are you', 'Excuse me', 'Thank you'] },
          { t: 'mc', q: 'A: "How old are you?"  B: "…"', a: "I'm eight years old.", o: ["I'm eight years old.", "I'm fine.", 'My name is Andi.', "I'm from Bali."] },
        ],
        sentences: [['Good morning teacher', 'Selamat pagi guru'], ['My name is Rina', 'Nama saya Rina']],
      },
      {
        id: 'sd-family', title: 'Family', titleId: 'Keluarga', emoji: '👨‍👩‍👧',
        vocab: [
          ['👨', 'father', 'ayah'], ['👩', 'mother', 'ibu'], ['👦', 'brother', 'saudara laki-laki'], ['👧', 'sister', 'saudara perempuan'],
          ['👴', 'grandfather', 'kakek'], ['👵', 'grandmother', 'nenek'], ['👶', 'baby', 'bayi'], ['👨‍👩‍👧', 'family', 'keluarga'],
        ],
        sentences: [['This is my father', 'Ini ayahku'], ['I love my mother', 'Saya sayang ibu saya'], ['My sister is a baby', 'Adik perempuanku seorang bayi']],
      },
      {
        id: 'sd-body', title: 'My Body', titleId: 'Anggota Tubuh', emoji: '🖐️',
        vocab: [
          ['👁️', 'eye', 'mata'], ['👂', 'ear', 'telinga'], ['👃', 'nose', 'hidung'], ['👄', 'mouth', 'mulut'],
          ['✋', 'hand', 'tangan'], ['🦶', 'foot', 'kaki'], ['🦷', 'tooth', 'gigi'], ['💪', 'arm', 'lengan'],
        ],
        sentences: [['I have two hands', 'Saya punya dua tangan'], ['I brush my teeth', 'Saya menggosok gigi']],
      },
      {
        id: 'sd-school', title: 'At School', titleId: 'Di Sekolah', emoji: '🏫',
        vocab: [
          ['📚', 'book', 'buku'], ['✏️', 'pencil', 'pensil'], ['🎒', 'bag', 'tas'], ['🪑', 'chair', 'kursi'],
          ['📏', 'ruler', 'penggaris'], ['✂️', 'scissors', 'gunting'], ['🖍️', 'crayon', 'krayon'], ['🏫', 'school', 'sekolah'],
        ],
        sentences: [['I go to school every day', 'Saya pergi ke sekolah setiap hari'], ['This is my new bag', 'Ini tas baruku']],
      },
      {
        id: 'sd-activities', title: 'Daily Activities', titleId: 'Kegiatan Sehari-hari', emoji: '🏃',
        vocab: [
          ['😴', 'sleep', 'tidur'], ['🍽️', 'eat', 'makan'], ['🏃', 'run', 'berlari'], ['📖', 'read', 'membaca'],
          ['✍️', 'write', 'menulis'], ['🏊', 'swim', 'berenang'], ['🎤', 'sing', 'bernyanyi'], ['💃', 'dance', 'menari'],
        ],
        sentences: [['She likes to sing', 'Dia suka bernyanyi'], ['I can swim', 'Saya bisa berenang'], ['We read a book', 'Kami membaca buku']],
      },
      {
        id: 'sd-weather', title: 'Weather & Food', titleId: 'Cuaca & Makanan', emoji: '🌦️',
        vocab: [
          ['☀️', 'sunny', 'cerah'], ['🌧️', 'rainy', 'hujan'], ['☁️', 'cloudy', 'berawan'], ['🌈', 'rainbow', 'pelangi'],
          ['🍚', 'rice', 'nasi'], ['🍞', 'bread', 'roti'], ['🥛', 'milk', 'susu'], ['🥚', 'egg', 'telur'],
        ],
        sentences: [['It is rainy today', 'Hari ini hujan'], ['I drink milk in the morning', 'Saya minum susu di pagi hari']],
      },
    ],
  },

  {
    id: 'smp', name: 'SMP', title: 'Adventurer', emoji: '🧭', color: '#3b82f6',
    desc: 'Tata bahasa dasar: simple present & past, preposisi, perbandingan, profesi.',
    modes: ['en2id', 'id2en', 'listen', 'pic'],
    units: [
      {
        id: 'smp-present', title: 'Simple Present', titleId: 'Kebiasaan & Fakta', emoji: '🔁',
        tip: 'Untuk kebiasaan/fakta. Subjek he/she/it → kata kerja + s/es (she goes, he plays). Kalimat tanya/negatif pakai do/does.',
        qs: [
          { t: 'fill', q: 'She ___ to school by bus.', a: 'goes', o: ['go', 'goes', 'going', 'went'], ex: 'Subjek "she" → go + es = goes.' },
          { t: 'fill', q: 'They ___ football every Sunday.', a: 'play', o: ['plays', 'play', 'playing', 'played'], ex: '"They" jamak → kata kerja tanpa s.' },
          { t: 'fill', q: 'My father ___ coffee every morning.', a: 'drinks', o: ['drink', 'drinks', 'drank', 'drinking'] },
          { t: 'fill', q: '___ you like pizza?', a: 'Do', o: ['Does', 'Do', 'Are', 'Is'], ex: 'Subjek "you" → pakai Do.' },
          { t: 'fill', q: 'He ___ not like vegetables.', a: 'does', o: ['do', 'does', 'is', 'are'] },
          { t: 'fill', q: 'The sun ___ in the east.', a: 'rises', o: ['rise', 'rises', 'rose', 'rising'], ex: 'Fakta umum → simple present.' },
          { t: 'fill', q: 'We ___ students.', a: 'are', o: ['is', 'am', 'are', 'be'] },
          { t: 'fill', q: 'Where ___ she live?', a: 'does', o: ['do', 'does', 'is', 'are'] },
        ],
        sentences: [['He reads a book every night', 'Dia membaca buku setiap malam'], ['We do not eat meat', 'Kami tidak makan daging']],
      },
      {
        id: 'smp-past', title: 'Simple Past', titleId: 'Kejadian Lampau', emoji: '⏪',
        tip: 'Untuk kejadian yang sudah selesai (yesterday, last week, ago). Regular verb + ed (watched); irregular berubah bentuk (go → went). Tanya/negatif pakai did + V1.',
        qs: [
          { t: 'fill', q: 'Yesterday I ___ to the market.', a: 'went', o: ['go', 'goes', 'went', 'gone'] },
          { t: 'fill', q: 'She ___ a beautiful dress last week.', a: 'bought', o: ['buy', 'buys', 'bought', 'buyed'], ex: 'buy → bought (irregular).' },
          { t: 'fill', q: 'We ___ a movie last night.', a: 'watched', o: ['watch', 'watched', 'watching', 'watches'] },
          { t: 'fill', q: '___ you see the rainbow yesterday?', a: 'Did', o: ['Do', 'Does', 'Did', 'Were'] },
          { t: 'fill', q: 'They ___ at home last Sunday.', a: 'were', o: ['was', 'were', 'are', 'is'] },
          { t: 'fill', q: 'I ___ not finish my homework.', a: 'did', o: ['do', 'does', 'did', 'was'] },
          { t: 'fill', q: 'My cat ___ a mouse this morning.', a: 'caught', o: ['catch', 'catched', 'caught', 'catching'] },
          { t: 'mc', q: 'Bentuk lampau (V2) dari "eat" adalah…', a: 'ate', o: ['ate', 'eated', 'eaten', 'eats'] },
          { t: 'mc', q: 'Bentuk lampau (V2) dari "write" adalah…', a: 'wrote', o: ['writed', 'wrote', 'written', 'writes'] },
        ],
        sentences: [['I visited my grandmother last week', 'Saya mengunjungi nenek minggu lalu'], ['She did not come to the party', 'Dia tidak datang ke pesta']],
      },
      {
        id: 'smp-prep', title: 'Prepositions', titleId: 'Kata Depan', emoji: '📦',
        tip: 'Waktu: at (jam), on (hari/tanggal), in (bulan/tahun). Tempat: in (di dalam), on (di atas permukaan), under (di bawah), between (di antara), next to (di samping).',
        qs: [
          { t: 'fill', q: 'The book is ___ the table. (di atas)', a: 'on', o: ['on', 'in', 'at', 'under'] },
          { t: 'fill', q: 'The cat is sleeping ___ the bed. (di bawah)', a: 'under', o: ['on', 'under', 'at', 'between'] },
          { t: 'fill', q: 'I was born ___ 2012.', a: 'in', o: ['in', 'on', 'at', 'by'], ex: 'Tahun → in.' },
          { t: 'fill', q: 'The meeting is ___ Monday.', a: 'on', o: ['in', 'on', 'at', 'for'], ex: 'Hari → on.' },
          { t: 'fill', q: "See you ___ 7 o'clock.", a: 'at', o: ['in', 'on', 'at', 'to'], ex: 'Jam → at.' },
          { t: 'fill', q: 'The ball is ___ the box. (di dalam)', a: 'in', o: ['in', 'on', 'at', 'next to'] },
          { t: 'fill', q: 'The bank is ___ the school and the park.', a: 'between', o: ['between', 'under', 'in', 'on'] },
          { t: 'fill', q: 'He is standing ___ the door. (di samping)', a: 'next to', o: ['next to', 'in', 'on', 'under'] },
        ],
        sentences: [['The cat is under the chair', 'Kucing itu di bawah kursi']],
      },
      {
        id: 'smp-compare', title: 'Feelings & Comparison', titleId: 'Perasaan & Perbandingan', emoji: '⚖️',
        tip: 'Kata sifat pendek: + er / + est (big → bigger → biggest). Kata sifat panjang: more / most (more expensive). Tidak beraturan: good → better → best.',
        vocab: [
          ['😊', 'happy', 'senang'], ['😢', 'sad', 'sedih'], ['😠', 'angry', 'marah'], ['😫', 'tired', 'lelah'],
          ['😨', 'scared', 'takut'], ['🤩', 'excited', 'bersemangat'], ['😌', 'calm', 'tenang'], ['🤒', 'sick', 'sakit'],
        ],
        qs: [
          { t: 'fill', q: 'An elephant is ___ than a cat.', a: 'bigger', o: ['big', 'bigger', 'biggest', 'more big'] },
          { t: 'fill', q: 'This is the ___ day of my life!', a: 'best', o: ['good', 'better', 'best', 'most good'] },
          { t: 'fill', q: 'Mount Everest is the ___ mountain in the world.', a: 'highest', o: ['high', 'higher', 'highest', 'most high'] },
          { t: 'fill', q: 'My bag is ___ expensive than yours.', a: 'more', o: ['more', 'most', 'much', 'very'] },
          { t: 'fill', q: 'Rina is as tall ___ Sinta.', a: 'as', o: ['as', 'than', 'so', 'like'] },
          { t: 'fill', q: 'He runs ___ than me.', a: 'faster', o: ['fast', 'faster', 'fastest', 'more fast'] },
        ],
      },
      {
        id: 'smp-jobs', title: 'Jobs', titleId: 'Profesi', emoji: '👩‍⚕️',
        vocab: [
          ['👨‍⚕️', 'doctor', 'dokter'], ['👩‍🏫', 'teacher', 'guru'], ['👨‍🍳', 'chef', 'koki'], ['👮', 'police officer', 'polisi'],
          ['👨‍🌾', 'farmer', 'petani'], ['👨‍🚒', 'firefighter', 'pemadam kebakaran'], ['🧑‍✈️', 'pilot', 'pilot'], ['🧑‍🎨', 'artist', 'seniman'],
        ],
        qs: [
          { t: 'mc', q: 'A person who flies a plane is a…', a: 'pilot', o: ['pilot', 'chef', 'farmer', 'doctor'] },
          { t: 'mc', q: 'A person who cooks in a restaurant is a…', a: 'chef', o: ['teacher', 'chef', 'artist', 'pilot'] },
          { t: 'mc', q: 'A: "What does your mother do?"  B: "…"', a: 'She is a teacher.', o: ['She is a teacher.', 'She is fine.', 'She is at home.', 'She is 40.'] },
        ],
        sentences: [['My father is a farmer', 'Ayahku seorang petani'], ['I want to be a doctor', 'Saya ingin menjadi dokter']],
      },
    ],
  },

  {
    id: 'sma', name: 'SMA', title: 'Challenger', emoji: '🚀', color: '#8b5cf6',
    desc: 'Present perfect, conditional, passive voice, phrasal verbs, dan modal.',
    modes: ['en2id', 'id2en', 'listen'],
    units: [
      {
        id: 'sma-perfect', title: 'Present Perfect', titleId: 'Pengalaman & Hasil', emoji: '✅',
        tip: 'have/has + V3. Untuk pengalaman (ever/never), hasil yang terasa sekarang (just/already/yet), dan durasi (for + lama waktu, since + titik waktu). Jika waktunya jelas di masa lalu (yesterday) → simple past.',
        qs: [
          { t: 'fill', q: 'I have never ___ to Bali.', a: 'been', o: ['go', 'went', 'been', 'being'] },
          { t: 'fill', q: 'She ___ lived here since 2015.', a: 'has', o: ['have', 'has', 'is', 'was'] },
          { t: 'fill', q: 'We have known each other ___ ten years.', a: 'for', o: ['for', 'since', 'ago', 'during'], ex: 'Lama waktu → for.' },
          { t: 'fill', q: 'He has worked here ___ January.', a: 'since', o: ['for', 'since', 'ago', 'from'], ex: 'Titik awal → since.' },
          { t: 'fill', q: 'Have you ___ your homework yet?', a: 'finished', o: ['finish', 'finished', 'finishing', 'finishes'] },
          { t: 'fill', q: 'They ___ just arrived.', a: 'have', o: ['has', 'have', 'are', 'did'] },
          { t: 'fill', q: 'I ___ him yesterday.', a: 'saw', o: ['have seen', 'saw', 'see', 'seen'], ex: '"yesterday" = waktu lampau jelas → simple past.' },
          { t: 'fill', q: 'How long ___ you studied English?', a: 'have', o: ['have', 'did', 'are', 'do'] },
        ],
        sentences: [['I have already eaten breakfast', 'Saya sudah sarapan'], ['She has never seen snow', 'Dia belum pernah melihat salju']],
      },
      {
        id: 'sma-cond', title: 'Conditionals', titleId: 'Kalimat Pengandaian', emoji: '🔀',
        tip: 'Type 0: If + present, present (fakta). Type 1: If + present, will + V1 (mungkin terjadi). Type 2: If + past, would + V1 (khayalan saat ini; pakai "were" untuk semua subjek).',
        qs: [
          { t: 'fill', q: 'If you heat ice, it ___.', a: 'melts', o: ['melts', 'will melted', 'melted', 'would melt'], ex: 'Fakta ilmiah → type 0.' },
          { t: 'fill', q: 'If it rains tomorrow, we ___ stay home.', a: 'will', o: ['will', 'would', 'are', 'did'] },
          { t: 'fill', q: 'If I ___ rich, I would travel the world.', a: 'were', o: ['am', 'were', 'will be', 'be'] },
          { t: 'fill', q: 'If she studies hard, she ___ pass the exam.', a: 'will', o: ['will', 'would', 'had', 'is'] },
          { t: 'fill', q: 'I would buy that car if I ___ enough money.', a: 'had', o: ['have', 'had', 'will have', 'having'] },
          { t: 'fill', q: 'Unless you hurry, you ___ miss the bus.', a: 'will', o: ['will', 'would', 'did', 'are'], ex: 'Unless = if not.' },
          { t: 'fill', q: 'If I were you, I ___ apologize.', a: 'would', o: ['will', 'would', 'am', 'did'] },
          { t: 'fill', q: 'What would you do if you ___ a ghost?', a: 'saw', o: ['see', 'saw', 'will see', 'seen'] },
        ],
        sentences: [['If I were a bird I would fly', 'Jika aku seekor burung aku akan terbang']],
      },
      {
        id: 'sma-passive', title: 'Passive Voice', titleId: 'Kalimat Pasif', emoji: '🔄',
        tip: 'Pasif = be + V3. Fokus pada objek yang dikenai pekerjaan. is/are (present), was/were (past), will be (future), have/has been (perfect), is being (continuous).',
        qs: [
          { t: 'fill', q: 'This novel ___ written by Andrea Hirata.', a: 'was', o: ['was', 'were', 'is being', 'has'] },
          { t: 'fill', q: 'English ___ spoken all over the world.', a: 'is', o: ['is', 'are', 'was', 'be'] },
          { t: 'fill', q: 'The thief ___ arrested last night.', a: 'was', o: ['is', 'was', 'were', 'has'] },
          { t: 'fill', q: 'The new bridge will ___ built next year.', a: 'be', o: ['be', 'been', 'being', 'is'] },
          { t: 'fill', q: 'The letters have ___ sent.', a: 'been', o: ['be', 'been', 'being', 'was'] },
          { t: 'fill', q: 'Rice ___ grown in many Asian countries.', a: 'is', o: ['is', 'are', 'were', 'be'] },
          { t: 'fill', q: 'The room is being ___ now.', a: 'cleaned', o: ['clean', 'cleaned', 'cleaning', 'cleans'] },
          { t: 'fill', q: 'My bike ___ stolen yesterday.', a: 'was', o: ['is', 'was', 'were', 'has'] },
        ],
        sentences: [['The cake was made by my mother', 'Kue itu dibuat oleh ibuku']],
      },
      {
        id: 'sma-phrasal', title: 'Phrasal Verbs', titleId: 'Kata Kerja Frasa', emoji: '🧩',
        vocab: [
          ['🏳️', 'give up', 'menyerah'], ['🍼', 'look after', 'merawat / menjaga'], ['🫙', 'run out of', 'kehabisan'],
          ['⏳', 'put off', 'menunda'], ['🔍', 'find out', 'mencari tahu'], ['🙅', 'turn down', 'menolak'],
          ['🤝', 'get along', 'akur / rukun'], ['💡', 'come up with', 'mencetuskan (ide)'],
        ],
        qs: [
          { t: 'fill', q: "Don't ___ up! You can do it.", a: 'give', o: ['give', 'take', 'look', 'put'] },
          { t: 'fill', q: "Can you look ___ my cat while I'm away?", a: 'after', o: ['after', 'for', 'up', 'out'] },
          { t: 'fill', q: 'We have run out ___ sugar.', a: 'of', o: ['of', 'from', 'off', 'with'] },
          { t: 'fill', q: 'She came up ___ a brilliant idea.', a: 'with', o: ['with', 'to', 'for', 'on'] },
        ],
      },
      {
        id: 'sma-modals', title: 'Modal Verbs', titleId: 'Kata Kerja Bantu Modal', emoji: '🎚️',
        tip: "must (wajib/pasti), mustn't (dilarang), should (saran), can (mampu), may (izin formal), might (mungkin), don't have to (tidak wajib).",
        qs: [
          { t: 'fill', q: 'You ___ wear a helmet when riding a motorbike. (wajib)', a: 'must', o: ['must', 'might', 'may', 'could'] },
          { t: 'fill', q: "You ___ smoke here. It's forbidden.", a: "mustn't", o: ["mustn't", "don't have to", 'should', 'can'] },
          { t: 'fill', q: 'You look sick. You ___ see a doctor. (saran)', a: 'should', o: ['should', 'must not', 'might', 'can'] },
          { t: 'fill', q: '___ I borrow your pen, please?', a: 'May', o: ['May', 'Must', 'Should', 'Need'] },
          { t: 'fill', q: 'She ___ speak three languages. (mampu)', a: 'can', o: ['can', 'must', 'should', 'may'] },
          { t: 'fill', q: 'It ___ rain later; take an umbrella. (mungkin)', a: 'might', o: ['might', 'must', 'should', 'can'] },
          { t: 'fill', q: "You don't ___ to come if you're busy.", a: 'have', o: ['have', 'must', 'should', 'need'] },
          { t: 'fill', q: 'The lights are on. He ___ be at home. (pasti)', a: 'must', o: ['must', 'should', 'can', 'may not'] },
        ],
      },
    ],
  },

  {
    id: 'upper', name: 'Upper-Int', title: 'Navigator', emoji: '🌍', color: '#ec4899',
    desc: 'Idiom, reported speech, collocation, third conditional & wish, relative clause.',
    modes: ['en2id', 'id2en', 'listen'],
    units: [
      {
        id: 'up-idioms', title: 'Idioms', titleId: 'Ungkapan', emoji: '🍰',
        tip: 'Idiom tidak bisa diartikan kata per kata. "A piece of cake" bukan sepotong kue, tetapi "sangat mudah".',
        vocab: [
          ['🍰', 'a piece of cake', 'sangat mudah'], ['🧊', 'break the ice', 'mencairkan suasana'],
          ['🤒', 'under the weather', 'kurang enak badan'], ['📚', 'hit the books', 'belajar dengan giat'],
          ['💸', 'cost an arm and a leg', 'sangat mahal'], ['🌕', 'once in a blue moon', 'sangat jarang'],
          ['🫘', 'spill the beans', 'membocorkan rahasia'], ['🐎', 'hold your horses', 'sabar dulu'],
        ],
        qs: [
          { t: 'fill', q: 'The exam was ___; I finished in 20 minutes.', a: 'a piece of cake', o: ['a piece of cake', 'under the weather', 'once in a blue moon', 'hold your horses'] },
          { t: 'fill', q: "I'm feeling a bit ___ today, so I'll stay home.", a: 'under the weather', o: ['under the weather', 'a piece of cake', 'over the moon', 'on the ball'] },
          { t: 'fill', q: 'Who ___ about the surprise party? Now she knows!', a: 'spilled the beans', o: ['spilled the beans', 'broke the ice', 'hit the books', 'held his horses'] },
          { t: 'fill', q: 'That designer bag must have ___!', a: 'cost an arm and a leg', o: ['cost an arm and a leg', 'broken the ice', 'hit the books', 'been a piece of cake'] },
        ],
      },
      {
        id: 'up-reported', title: 'Reported Speech', titleId: 'Kalimat Tidak Langsung', emoji: '💬',
        tip: 'Tense mundur satu langkah: am/is → was, will → would, have → had, V1 → V2, can → could. Perintah: told + (not) to + V1. Pertanyaan ya/tidak: asked + if/whether.',
        qs: [
          { t: 'fill', q: 'She said, "I am tired." → She said that she ___ tired.', a: 'was', o: ['is', 'was', 'were', 'has been'] },
          { t: 'fill', q: '"I will call you," he said. → He said he ___ call me.', a: 'would', o: ['will', 'would', 'shall', 'can'] },
          { t: 'fill', q: '"I have finished," Tom said. → Tom said he ___ finished.', a: 'had', o: ['has', 'had', 'have', 'was'] },
          { t: 'fill', q: '"Where do you live?" → She asked me where I ___.', a: 'lived', o: ['live', 'lived', 'do live', 'living'] },
          { t: 'fill', q: '"Don\'t touch it!" → He told me ___ touch it.', a: 'not to', o: ['not to', "don't", 'to not', 'no'] },
          { t: 'fill', q: '"Can you help me?" → She asked if I ___ help her.', a: 'could', o: ['can', 'could', 'will', 'may'] },
          { t: 'fill', q: '"Are you hungry?" → He asked me ___ I was hungry.', a: 'if', o: ['if', 'that', 'what', 'so'] },
          { t: 'fill', q: '"I saw him yesterday." → She said she had seen him the day ___.', a: 'before', o: ['before', 'ago', 'yesterday', 'after'] },
        ],
      },
      {
        id: 'up-colloc', title: 'Collocations', titleId: 'Pasangan Kata', emoji: '🔗',
        tip: 'Collocation = pasangan kata yang lazim dipakai penutur asli. make a decision (bukan do a decision), do homework, take a photo, pay attention, heavy rain, strong coffee.',
        qs: [
          { t: 'fill', q: 'I need to ___ a decision soon.', a: 'make', o: ['make', 'do', 'take', 'have'] },
          { t: 'fill', q: 'Have you ___ your homework?', a: 'done', o: ['done', 'made', 'taken', 'paid'] },
          { t: 'fill', q: 'Can you ___ a photo of us?', a: 'take', o: ['take', 'make', 'do', 'get'] },
          { t: 'fill', q: 'Please ___ attention to the teacher.', a: 'pay', o: ['pay', 'give', 'make', 'do'] },
          { t: 'fill', q: 'Everyone ___ mistakes sometimes.', a: 'makes', o: ['makes', 'does', 'takes', 'has'] },
          { t: 'fill', q: 'The flood was caused by ___ rain.', a: 'heavy', o: ['heavy', 'strong', 'big', 'thick'] },
          { t: 'fill', q: 'I like my coffee ___.', a: 'strong', o: ['strong', 'heavy', 'powerful', 'hard'] },
          { t: 'fill', q: "Don't ___ any risks with your health.", a: 'take', o: ['take', 'make', 'do', 'pay'] },
        ],
      },
      {
        id: 'up-wish', title: 'Third Conditional & Wish', titleId: 'Penyesalan & Harapan', emoji: '🌠',
        tip: 'Type 3: If + had + V3, would have + V3 (penyesalan masa lalu). Wish (sekarang): wish + past (I wish I were…). Wish (lampau): wish + had + V3.',
        qs: [
          { t: 'fill', q: 'If I had studied harder, I ___ passed the exam.', a: 'would have', o: ['would have', 'will have', 'would', 'had'] },
          { t: 'fill', q: "If she ___ the bus, she wouldn't have been late.", a: "hadn't missed", o: ["hadn't missed", "didn't miss", "wouldn't miss", "hasn't missed"] },
          { t: 'fill', q: 'I wish I ___ taller.', a: 'were', o: ['am', 'were', 'will be', 'had been'] },
          { t: 'fill', q: 'I wish I ___ to the party last night.', a: 'had gone', o: ['went', 'had gone', 'would go', 'go'] },
          { t: 'fill', q: 'If only you ___ told me earlier!', a: 'had', o: ['had', 'have', 'would', 'did'] },
          { t: 'fill', q: 'He wishes he ___ speak French.', a: 'could', o: ['can', 'could', 'will', 'has'] },
          { t: 'fill', q: 'If they had left earlier, they ___ have missed the train.', a: "wouldn't", o: ["wouldn't", "won't", "didn't", "hadn't"] },
        ],
      },
      {
        id: 'up-relative', title: 'Relative Clauses', titleId: 'Anak Kalimat Relatif', emoji: '🧷',
        tip: 'who (orang), which (benda), where (tempat), when (waktu), whose (kepemilikan), whom (objek orang, formal).',
        qs: [
          { t: 'fill', q: 'The man ___ lives next door is a doctor.', a: 'who', o: ['who', 'which', 'where', 'whose'] },
          { t: 'fill', q: 'This is the house ___ I was born.', a: 'where', o: ['where', 'which', 'when', 'who'] },
          { t: 'fill', q: 'The book ___ I bought is interesting.', a: 'which', o: ['which', 'who', 'where', 'whose'] },
          { t: 'fill', q: "That's the girl ___ father is a pilot.", a: 'whose', o: ['whose', 'who', 'which', 'whom'] },
          { t: 'fill', q: 'I remember the day ___ we first met.', a: 'when', o: ['when', 'where', 'which', 'who'] },
          { t: 'fill', q: 'The person to ___ I spoke was very helpful.', a: 'whom', o: ['whom', 'who', 'which', 'whose'] },
          { t: 'fill', q: 'Jakarta, ___ is the capital of Indonesia, is very crowded.', a: 'which', o: ['which', 'that', 'where', 'who'], ex: 'Non-defining clause (berkoma) tidak boleh pakai "that".' },
        ],
      },
    ],
  },

  {
    id: 'adv', name: 'Advanced', title: 'Master', emoji: '👑', color: '#d4a017',
    desc: 'Kosakata akademik, inversi, subjunctive, nuansa makna, dan kata penghubung formal.',
    modes: ['en2id', 'id2en', 'listen'],
    units: [
      {
        id: 'adv-vocab', title: 'Advanced Vocabulary', titleId: 'Kosakata Tingkat Lanjut', emoji: '📜',
        vocab: [
          ['🌐', 'ubiquitous', 'ada di mana-mana'], ['🔬', 'meticulous', 'sangat teliti'], ['🫧', 'ephemeral', 'berumur pendek / fana'],
          ['🛠️', 'pragmatic', 'praktis / realistis'], ['🎙️', 'eloquent', 'fasih & memikat'], ['🌱', 'resilient', 'tangguh'],
          ['🌫️', 'ambiguous', 'bermakna ganda'], ['🧐', 'scrutinize', 'meneliti dengan cermat'], ['🛡️', 'mitigate', 'meredam / mengurangi dampak'],
          ['🗣️', 'candid', 'terus terang'],
        ],
        qs: [
          { t: 'fill', q: 'Smartphones have become ___; you see them everywhere.', a: 'ubiquitous', o: ['ubiquitous', 'ephemeral', 'candid', 'meticulous'] },
          { t: 'fill', q: 'She is ___ about details; she checks everything twice.', a: 'meticulous', o: ['meticulous', 'ambiguous', 'ephemeral', 'pragmatic'] },
          { t: 'fill', q: 'Fame is often ___; it rarely lasts.', a: 'ephemeral', o: ['ephemeral', 'resilient', 'ubiquitous', 'eloquent'] },
          { t: 'fill', q: 'The instructions were ___, so everyone understood them differently.', a: 'ambiguous', o: ['ambiguous', 'candid', 'meticulous', 'resilient'] },
          { t: 'fill', q: 'Planting mangroves can help ___ the effects of coastal flooding.', a: 'mitigate', o: ['mitigate', 'scrutinize', 'obtain', 'neglect'] },
        ],
      },
      {
        id: 'adv-inversion', title: 'Inversion', titleId: 'Inversi untuk Penekanan', emoji: '🙃',
        tip: 'Setelah kata negatif/pembatas di awal kalimat (Never, Rarely, Seldom, Not only, Hardly, No sooner, Under no circumstances), urutan menjadi seperti kalimat tanya: auxiliary + subject.',
        qs: [
          { t: 'fill', q: 'Never ___ I seen such a beautiful sunset.', a: 'have', o: ['have', 'had I', 'did', 'was'] },
          { t: 'fill', q: 'Not only ___ she sing, but she also dances.', a: 'does', o: ['does', 'is', 'she', 'did not'] },
          { t: 'fill', q: 'Hardly had he arrived ___ the phone rang.', a: 'when', o: ['when', 'than', 'then', 'that'] },
          { t: 'fill', q: 'No sooner had we left ___ it started to rain.', a: 'than', o: ['than', 'when', 'then', 'as'] },
          { t: 'fill', q: 'Seldom ___ we meet such talented people.', a: 'do', o: ['do', 'are', 'we', 'have been'] },
          { t: 'fill', q: 'Under no circumstances ___ you open that door.', a: 'should', o: ['should', 'you should', 'must not', 'do not'] },
          { t: 'fill', q: '___ I known the truth, I would have acted differently.', a: 'Had', o: ['Had', 'If', 'Have', 'Should'], ex: 'Had I known = If I had known.' },
          { t: 'fill', q: 'Rarely ___ he complain about anything.', a: 'does', o: ['does', 'is', 'has', 'he'] },
        ],
        sentences: [['Not only is she intelligent but she is also kind', 'Dia tidak hanya cerdas tetapi juga baik hati']],
      },
      {
        id: 'adv-subj', title: 'Subjunctive & Mixed Conditionals', titleId: 'Subjunctive & Kondisional Campuran', emoji: '🧠',
        tip: 'Subjunctive: It is essential/vital that + subject + V1 dasar (he be, she submit). "It\'s high time" & "I\'d rather (you)" + past. Mixed: If + had V3, would + V1 (masa lalu → akibat sekarang).',
        qs: [
          { t: 'fill', q: "It's essential that he ___ on time.", a: 'be', o: ['be', 'is', 'was', 'will be'] },
          { t: 'fill', q: "I'd rather you ___ smoke in here.", a: "didn't", o: ["didn't", "don't", "won't", 'not'] },
          { t: 'fill', q: 'If I had studied medicine, I ___ a doctor now.', a: 'would be', o: ['would be', 'would have been', 'will be', 'had been'] },
          { t: 'fill', q: "It's high time we ___.", a: 'left', o: ['left', 'leave', 'will leave', 'have left'] },
          { t: 'fill', q: 'The committee insists that she ___ the truth.', a: 'tell', o: ['tell', 'tells', 'told', 'telling'] },
          { t: 'fill', q: "If she weren't so shy, she ___ spoken at the meeting yesterday.", a: 'would have', o: ['would have', 'would', 'will have', 'had'] },
          { t: 'fill', q: 'Suppose you ___ the lottery, what would you do?', a: 'won', o: ['won', 'win', 'will win', 'have won'] },
          { t: 'fill', q: 'It is vital that every student ___ the form by Friday.', a: 'submit', o: ['submit', 'submits', 'submitted', 'will submit'] },
        ],
      },
      {
        id: 'adv-nuance', title: 'Nuance & Word Choice', titleId: 'Nuansa & Pilihan Kata', emoji: '🎯',
        tip: 'Perhatikan register (formal vs informal), konotasi (positif/negatif), dan pasangan yang sering tertukar: affect (kata kerja) vs effect (kata benda), principle vs principal.',
        qs: [
          { t: 'mc', q: 'Mana sinonim paling formal untuk "get" pada "get permission"?', a: 'obtain', o: ['obtain', 'grab', 'snag', 'fetch'] },
          { t: 'fill', q: 'After the 20 km hike, we were absolutely ___.', a: 'famished', o: ['famished', 'peckish', 'full', 'thirsty'], ex: 'famished = sangat lapar; peckish = sedikit lapar.' },
          { t: 'mc', q: 'Dibanding "stingy", kata "frugal" bernuansa…', a: 'lebih positif (hemat)', o: ['lebih positif (hemat)', 'lebih negatif (pelit)', 'sama persis', 'tidak berhubungan'] },
          { t: 'fill', q: 'The new policy will ___ thousands of workers.', a: 'affect', o: ['affect', 'effect', 'infect', 'effort'] },
          { t: 'fill', q: 'Honesty is my guiding ___.', a: 'principle', o: ['principle', 'principal', 'principality', 'prince'] },
          { t: 'fill', q: 'She was ___ to accept the offer, as it seemed too good to be true.', a: 'reluctant', o: ['reluctant', 'eager', 'delighted', 'keen'] },
          { t: 'fill', q: 'Despite the ___ evidence, the jury remained unconvinced.', a: 'overwhelming', o: ['overwhelming', 'weak', 'minor', 'missing'] },
          { t: 'fill', q: 'The speaker was so ___ that the audience hung on her every word.', a: 'eloquent', o: ['eloquent', 'reticent', 'mundane', 'tedious'] },
        ],
      },
      {
        id: 'adv-linking', title: 'Formal Linking Words', titleId: 'Kata Penghubung Formal', emoji: '🪢',
        tip: 'Kontras: nevertheless, whereas, albeit, notwithstanding. Sebab-akibat: consequently, therefore, hence. Tambahan: moreover, furthermore.',
        qs: [
          { t: 'fill', q: 'The plan was risky; ___, it succeeded.', a: 'nevertheless', o: ['nevertheless', 'therefore', 'moreover', 'whereas'] },
          { t: 'fill', q: 'Some people love the city, ___ others prefer the countryside.', a: 'whereas', o: ['whereas', 'moreover', 'hence', 'therefore'] },
          { t: 'fill', q: "He didn't prepare at all; ___, he failed the interview.", a: 'consequently', o: ['consequently', 'nevertheless', 'whereas', 'albeit'] },
          { t: 'fill', q: 'The project was completed, ___ two weeks behind schedule.', a: 'albeit', o: ['albeit', 'despite', 'whereas', 'moreover'] },
          { t: 'fill', q: '___ the bad weather, the ceremony went ahead.', a: 'Notwithstanding', o: ['Notwithstanding', 'Although', 'Because', 'Unless'] },
          { t: 'fill', q: 'She is talented; ___, she works incredibly hard.', a: 'moreover', o: ['moreover', 'however', 'whereas', 'otherwise'] },
          { t: 'fill', q: 'The results were inconclusive. ___, further research is needed.', a: 'Therefore', o: ['Therefore', 'However', 'Although', 'Whereas'] },
        ],
        sentences: [['The data was limited nevertheless the findings were significant', 'Datanya terbatas, namun temuannya signifikan']],
      },
    ],
  },
];

const AVATARS = ['🦊', '🐼', '🐯', '🐸', '🐵', '🦄', '🐧', '🐨', '🦁', '🐙', '🐢', '🦉'];

const BADGES = [
  { id: 'first', emoji: '🌱', name: 'Langkah Pertama', desc: 'Selesaikan 1 pelajaran' },
  { id: 'perfect', emoji: '💯', name: 'Sempurna', desc: 'Pelajaran tanpa salah' },
  { id: 'combo10', emoji: '⚡', name: 'Combo x10', desc: '10 jawaban benar berturut-turut' },
  { id: 'streak3', emoji: '🔥', name: 'Semangat 3 Hari', desc: 'Belajar 3 hari berturut-turut' },
  { id: 'streak7', emoji: '🏅', name: 'Seminggu Penuh', desc: 'Streak 7 hari' },
  { id: 'streak30', emoji: '🏆', name: 'Sebulan Konsisten', desc: 'Streak 30 hari' },
  { id: 'xp100', emoji: '⭐', name: '100 XP', desc: 'Kumpulkan 100 XP' },
  { id: 'xp1000', emoji: '🌟', name: '1.000 XP', desc: 'Kumpulkan 1.000 XP' },
  { id: 'xp5000', emoji: '💫', name: '5.000 XP', desc: 'Kumpulkan 5.000 XP' },
  { id: 'words50', emoji: '📖', name: 'Kolektor Kata', desc: 'Kuasai 50 kosakata' },
  { id: 'goal7', emoji: '🎯', name: 'Target Tercapai x7', desc: 'Capai target harian 7 kali' },
  { id: 'challenge', emoji: '🗓️', name: 'Penantang', desc: 'Selesaikan tantangan harian' },
  ...LEVELS.map(l => ({ id: 'level-' + l.id, emoji: l.emoji, name: 'Lulus ' + l.name, desc: `Selesaikan semua unit ${l.name}` })),
];
