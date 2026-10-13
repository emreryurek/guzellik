/* ========================================
   NOVA GÜZELLİK - site.js (ayarlar)
   MÜŞTERİYE TESLİMDE: bilgileri, hizmetleri ve paketleri doldur, DEMO'yu false yap.
   Çalışan kod ery-kit.js içinde, ona dokunmana gerek yok.
======================================== */

window.ERY = {
    DEMO: true,
    isletme: 'NOVA Güzellik',
    kisa: 'N',
    whatsapp: '905555555555',
    telefon: '0555 555 55 55',
    adres: 'Örnek Mah. Örnek Sk. No:1, İstanbul',
    harita: 'https://www.google.com/maps/search/?api=1&query=Istanbul%2C%20Turkey',
    demoMesaj: 'Merhaba, güzellik salonu örneğindeki online randevu sistemini işletmeme istiyorum.',

    saatler: { 0: null, 1: [10, 19], 2: [10, 19], 3: [10, 19], 4: [10, 19], 5: [10, 19], 6: [10, 19] },

    booking: {
        coklu: true,
        adim: 30,
        hizmetEmoji: '✨',
        hizmetler: [
            { id: 'cilt',   ad: 'Cilt Bakımı',        fiyat: 1500,        sure: 60 },
            { id: 'lazer',  ad: 'Lazer Epilasyon',    fiyat: [600, 1500], sure: 30 },
            { id: 'mani',   ad: 'Manikür',            fiyat: 450,         sure: 45 },
            { id: 'pedi',   ad: 'Pedikür',            fiyat: 550,         sure: 50 },
            { id: 'oje',    ad: 'Kalıcı Oje',         fiyat: 600,         sure: 60 },
            { id: 'kas',    ad: 'Kaş Tasarımı',       fiyat: 350,         sure: 20 },
            { id: 'kirpik', ad: 'Kirpik Lifting',     fiyat: 900,         sure: 60 },
            { id: 'makyaj', ad: 'Makyaj',             fiyat: 1800,        sure: 60 },
            { id: 'fon',    ad: 'Saç Bakımı & Fön',   fiyat: 400,         sure: 30 }
        ],
        ustaBaslik: 'Uzman',
        ustaEmoji: '🌸',
        ustalar: [
            { id: 'selin', ad: 'Selin', unvan: 'Cilt bakım uzmanı' },
            { id: 'derya', ad: 'Derya', unvan: 'Tırnak & kirpik' },
            { id: 'melis', ad: 'Melis', unvan: 'Makyaj artisti' }
        ]
    },

    paketler: [
        { ad: 'İlk Ziyaret Cilt Bakımı', aciklama: 'Salonu ilk kez deneyenlere özel.', eski: 1500, fiyat: 1050,
          icerik: ['Cilt analizi', 'Derin temizlik ve nem bakımı', 'Size özel ev bakımı önerisi'], secim: 'cilt', buton: 'Bu Paketle Randevu Al' },
        { ad: 'Lazer 6 Seans Paketi', etiket: 'EN ÇOK TERCİH EDİLEN', one: true, aciklama: 'Tek bölge, 6 seans, 1 seans hediye.', eski: 9000, fiyat: 6750,
          icerik: ['6 seans + 1 hediye seans', 'Ücretsiz deneme atışı', 'Seans takvimi WhatsApp\'tan hatırlatılır'], secim: 'lazer', buton: 'Bu Paketle Randevu Al' },
        { ad: 'Gelin Paketi', aciklama: 'Düğün günü ve öncesi için.', eski: 4800, fiyat: 3900,
          icerik: ['Prova makyajı', 'Gelin makyajı', 'Manikür ve kaş tasarımı'], secim: 'makyaj', buton: 'Bu Paketle Randevu Al' }
    ],

    bot: {
        ad: 'NOVA Asistan',
        hosgeldin: 'Merhaba! 🌸 NOVA asistanıyım. Fiyatlar, kampanyalar, boş saatler veya hizmetlerimiz hakkında sorabilirsiniz.',
        hizli: ['Fiyatlar', 'Kampanyalar', 'Lazer kaç seans?', 'Çalışma saatleri', 'Adres'],
        sss: [
            { k: ['fiyat', 'ücret', 'ucret', 'kaç para', 'kac para', 'ne kadar', 'kaç tl', 'kac tl'],
              c: 'Cilt bakımı 1.500 ₺, manikür 450 ₺, kalıcı oje 600 ₺, kaş tasarımı 350 ₺, kirpik lifting 900 ₺, makyaj 1.800 ₺. Lazer bölgeye göre 600 - 1.500 ₺.', go: '#randevu', btn: 'Randevu al' },
            { k: ['kampanya', 'indirim', 'paket', 'fırsat', 'firsat', 'gelin'],
              c: 'İlk ziyarete cilt bakımı 1.050 ₺, lazer 6 seans paketinde 1 seans hediye, gelin paketi 3.900 ₺.', go: '#kampanya', btn: 'Kampanyaları gör' },
            { k: ['lazer', 'epilasyon', 'seans', 'acı', 'aci', 'acıtır'],
              c: 'Lazerde genelde 6 - 8 seans öneriyoruz, seanslar 4 - 6 hafta arayla. Cihazımızda soğutma başlığı var, işlem çoğu kişi için rahat geçiyor. İlk gelişte ücretsiz deneme atışı yapıyoruz.', go: '#kampanya', btn: 'Lazer paketini gör' },
            { k: ['boş', 'bos', 'müsait', 'musait', 'yer var', 'bugün', 'bugun', 'randevu'],
              c: 'Online randevuda boş saatleri görüp hemen yer ayırtabilirsiniz. Uzmanınızı da seçebilirsiniz.', go: '#randevu', btn: 'Boş saatleri gör' },
            { k: ['saat', 'açık', 'acik', 'kapalı', 'kapali', 'kaçta', 'kacta', 'pazar'],
              c: function () { return 'Pazartesi - Cumartesi 10:00 - 19:00 arası açığız, pazar kapalı.\n' + ERY.acikDurum() + '.'; } },
            { k: ['adres', 'nerede', 'konum', 'yol', 'harita', 'otopark'],
              c: function () { return 'Adresimiz: ' + ERY.adres + '.\nYol tarifi: ' + ERY.harita; } },
            { k: ['iptal', 'ertele', 'değiştir', 'degistir', 'gelemeyeceğim'],
              c: function () { return 'Randevunuzu bir gün önceden haber vererek ücretsiz değiştirebilirsiniz. WhatsApp\'tan yazmanız yeterli: ' + ERY.telefon; } },
            { k: ['hijyen', 'steril', 'temiz', 'tek kullanımlık'],
              c: 'Ekipmanlar her müşteriden sonra sterilize edilir, tek kullanımlık ürünler her seferinde yenilenir.' },
            { k: ['erkek', 'bay '],
              c: 'Şu an yalnızca kadın müşterilere hizmet veriyoruz.' },
            { k: ['kart', 'taksit', 'nakit', 'ödeme', 'odeme'],
              c: 'Nakit ve kredi kartı geçiyor. Paketlerde kredi kartına 3 taksit yapılabiliyor.' },
            { k: ['merhaba', 'selam', 'slm', 'iyi günler', 'sa '],
              c: 'Merhaba! 🌸 Size nasıl yardımcı olabilirim?' },
            { k: ['teşekkür', 'tesekkur', 'sağol', 'sagol', 'tamam'],
              c: 'Rica ederim, görüşmek üzere! 🌸' }
        ]
    }
};
