/* ========================================
   ERY KIT - ery-kit.js
   Ayarlar site.js içindeki window.ERY nesnesinden okunur.
   Modüller (yalnızca sayfada yeri varsa çalışır):
     [data-k-open]     şu an açık / kapalı
     [data-k-next]     bugünkü ilk boş saat
     [data-k-booking]  online randevu
     [data-k-order]    online sipariş sepeti
     [data-k-loyalty]  dijital sadakat kartı
     [data-k-packs]    paket / kampanya kartları
     ERY.bot           asistan sohbet balonu
   Bağımlılık yok.
======================================== */

(function () {
    'use strict';

    var C = window.ERY;
    if (!C) return;

    /* ---------------- yardımcılar ---------------- */

    var $ = function (s, r) { return (r || document).querySelector(s); };
    var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
    var TL = function (n) { return Math.round(n).toLocaleString('tr-TR') + ' ₺'; };
    var digits = function (v) { return String(v || '').replace(/\D/g, ''); };
    var pad = function (n) { return String(n).padStart(2, '0'); };
    var GUN = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
    var GUN_UZUN = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    var AY = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

    function el(tag, attrs, text) {
        var e = document.createElement(tag);
        for (var k in attrs || {}) e.setAttribute(k, attrs[k]);
        if (text != null) e.textContent = text;
        return e;
    }

    function html(tag, attrs, inner) { var e = el(tag, attrs); e.innerHTML = inner; return e; }

    function press(b, on) { b.setAttribute('aria-pressed', on ? 'true' : 'false'); }
    function pressed(b) { return b.getAttribute('aria-pressed') === 'true'; }

    function opt(label, sub, id) {
        var b = el('button', { type: 'button', class: 'k-opt', 'aria-pressed': 'false' });
        if (id != null) b.dataset.id = id;
        b.appendChild(document.createTextNode(label));
        if (sub) b.appendChild(el('small', null, sub));
        return b;
    }

    function radio(box, cb) {
        box.addEventListener('click', function (e) {
            var b = e.target.closest('.k-opt, .k-day');
            if (!b || b.disabled || !box.contains(b)) return;
            $$('.k-opt, .k-day', box).forEach(function (x) { press(x, x === b); });
            cb(b);
        });
    }

    // İstanbul saatiyle şimdi
    function now() {
        try {
            var o = {};
            new Intl.DateTimeFormat('en-GB', {
                timeZone: 'Europe/Istanbul', hour12: false,
                year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
            }).formatToParts(new Date()).forEach(function (p) { o[p.type] = p.value; });
            return new Date(+o.year, +o.month - 1, +o.day, +o.hour % 24, +o.minute);
        } catch (e) { return new Date(); }
    }

    function dayStart(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
    function sameDay(a, b) { return dayStart(a).getTime() === dayStart(b).getTime(); }
    function hm(min) { return pad(Math.floor(min / 60)) + ':' + pad(min % 60); }
    function dateText(d) { return GUN_UZUN[d.getDay()] + ', ' + d.getDate() + ' ' + AY[d.getMonth()]; }
    function clock() { var t = now(); return pad(t.getHours()) + ':' + pad(t.getMinutes()); }
    function wa(text) { return 'https://wa.me/' + C.whatsapp + '?text=' + encodeURIComponent(text); }
    function hours(d) { return C.saatler[d.getDay()]; }       // [açılış, kapanış] saat, ondalık olabilir

    function money(f) {
        if (f == null) return '';
        if (Array.isArray(f)) return f[0] === f[1] ? TL(f[0]) : TL(f[0]) + ' - ' + TL(f[1]);
        return TL(f);
    }

    function storage(key, val) {
        try {
            if (val === undefined) return JSON.parse(localStorage.getItem(key) || 'null');
            localStorage.setItem(key, JSON.stringify(val));
        } catch (e) { return null; }
    }

    // WhatsApp mesaj önizlemesi + gönder butonu + demo kutusu
    function preview(head) {
        var p = el('div', { class: 'k-preview', 'aria-live': 'polite' });
        p.innerHTML =
            '<div class="k-preview-head">✓ ' + head + '</div>' +
            '<div class="k-phone"><div class="k-phone-top"><i></i><div><span class="k-pn"></span><small>WhatsApp</small></div></div><div class="k-bubble"></div></div>' +
            '<a class="k-btn k-send" target="_blank" rel="noopener">WhatsApp\'tan Gönder</a>';
        $('.k-phone-top i', p).textContent = C.kisa;
        $('.k-pn', p).textContent = C.isletme;
        if (C.DEMO) {
            $('.k-send', p).hidden = true;
            var d = el('div', { class: 'k-demo' });
            d.appendChild(document.createTextNode('Bu bir örnek çalışmadır, mesaj gönderilmez. Gerçek sitede bu mesaj tek dokunuşla işletmenin WhatsApp\'ına düşer. '));
            d.appendChild(el('a', { href: 'https://wa.me/905325023600?text=' + encodeURIComponent(C.demoMesaj || 'Merhaba, örnek sitedeki sistemi işletmeme istiyorum.'), target: '_blank', rel: 'noopener' }, 'Bu sistemi işletmeme istiyorum'));
            p.appendChild(d);
        }
        p.show = function (msg) {
            var b = $('.k-bubble', p);
            b.textContent = msg;
            b.appendChild(el('time', null, clock() + ' ✓✓'));
            $('.k-send', p).href = wa(msg);
            p.classList.add('show');
            p.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        };
        p.hide = function () { p.classList.remove('show'); };
        return p;
    }

    /* ---------------- açık / kapalı ---------------- */

    function openState() {
        var n = now(), h = hours(n), t = n.getHours() + n.getMinutes() / 60;
        if (h && t >= h[0] && t < h[1]) return { open: true, text: 'Şu an açık · ' + hm(h[1] * 60) + '\'a kadar' };
        for (var i = 0; i < 8; i++) {
            var d = new Date(n.getFullYear(), n.getMonth(), n.getDate() + i), g = hours(d);
            if (!g || (i === 0 && t >= g[0])) continue;
            return { open: false, text: 'Şu an kapalı · ' + (i === 0 ? 'bugün' : i === 1 ? 'yarın' : GUN_UZUN[d.getDay()]) + ' ' + hm(g[0] * 60) + '\'da açılıyor' };
        }
        return { open: false, text: 'Şu an kapalı' };
    }

    function openBadges() {
        var s = openState();
        $$('[data-k-open]').forEach(function (b) {
            if (!b.firstChild || b.firstChild.tagName !== 'I') { b.textContent = ''; b.appendChild(el('i')); b.appendChild(el('span')); }
            b.classList.add('k-open');
            b.classList.toggle('is-open', s.open);
            b.classList.toggle('is-closed', !s.open);
            b.lastChild.textContent = s.text;
        });
    }

    /* ---------------- randevu ---------------- */

    var B = C.booking;

    // Demo: bazı saatleri dolu göster (aynı gün/saat/usta için hep aynı sonuç)
    function busy(d, min, staff) {
        var k = d.getDate() * 131 + d.getMonth() * 17 + min + (staff ? staff.length * 7 + staff.charCodeAt(0) : 0);
        return ((k * 2654435761) >>> 0) % 100 < (B.doluluk || 30);
    }

    function slotsFor(d, dur, staff) {
        var h = hours(d); if (!h) return [];
        var n = now(), step = B.adim || 30, out = [];
        var nowMin = sameDay(d, n) ? n.getHours() * 60 + n.getMinutes() + 30 : -1;
        for (var m = h[0] * 60; m + dur <= h[1] * 60; m += step) {
            out.push({ min: m, off: m <= nowMin || busy(d, m, staff), past: m <= nowMin });
        }
        return out;
    }

    function nextFree() {
        var box = $$('[data-k-next]');
        if (!box.length || !B) return;
        var n = now(), txt = '';
        for (var i = 0; i < 7 && !txt; i++) {
            var d = new Date(n.getFullYear(), n.getMonth(), n.getDate() + i);
            var s = slotsFor(d, (B.hizmetler[0] && B.hizmetler[0].sure) || B.varsayilanSure || 30, null).filter(function (x) { return !x.off; })[0];
            if (s) txt = (i === 0 ? 'Bugün' : i === 1 ? 'Yarın' : GUN_UZUN[d.getDay()]) + ' ilk boş saat: ' + hm(s.min);
        }
        box.forEach(function (b) { b.textContent = txt || 'Randevu için arayın'; });
    }

    function booking(root) {
        var st = { svc: [], staff: null, day: null, slot: null, people: B.kisi ? B.kisi.varsayilan || 2 : null };
        var step = 0, n = function () { return ++step; };

        root.classList.add('k');
        var form = el('form', { class: 'k-grid', novalidate: '' });
        var left = el('div', { class: 'k-panel' }), right = el('div', { class: 'k-panel' });
        form.appendChild(left); form.appendChild(right);
        root.appendChild(form);

        // 1. hizmet
        var svcWrap = el('div');
        svcWrap.appendChild(html('p', { class: 'k-step' }, '<b>' + n() + '</b>' + (B.hizmetBaslik || 'Hizmet') + (B.coklu ? ' <small>(birden fazla seçebilirsiniz)</small>' : '')));
        var svcBox = el('div', { class: 'k-opts', role: 'group', 'aria-label': 'Hizmet' });
        B.hizmetler.forEach(function (s) {
            var sub = [money(s.fiyat), s.sure ? s.sure + ' dk' : ''].filter(Boolean).join(' · ');
            svcBox.appendChild(opt(s.ad, sub, s.id));
        });
        svcBox.addEventListener('click', function (e) {
            var b = e.target.closest('.k-opt'); if (!b) return;
            if (B.coklu) press(b, !pressed(b));
            else $$('.k-opt', svcBox).forEach(function (x) { press(x, x === b); });
            st.svc = $$('.k-opt', svcBox).filter(pressed).map(function (x) { return x.dataset.id; });
            drawSlots(); summary();
        });
        svcWrap.appendChild(svcBox);
        if (B.hizmetler.length) left.appendChild(svcWrap);
        else step--;

        // 2. usta (isteğe bağlı)
        if (B.ustalar) {
            var stWrap = el('div');
            stWrap.appendChild(html('p', { class: 'k-step' }, '<b>' + n() + '</b>' + (B.ustaBaslik || 'Usta')));
            var stBox = el('div', { class: 'k-opts k-staff', role: 'group', 'aria-label': B.ustaBaslik || 'Usta' });
            [{ id: '', ad: 'Fark etmez', unvan: 'İlk boş olan' }].concat(B.ustalar).forEach(function (u, i) {
                var b = el('button', { type: 'button', class: 'k-opt', 'aria-pressed': i === 0 ? 'true' : 'false' });
                b.dataset.id = u.id;
                b.appendChild(el('span', { class: 'k-av' }, u.id ? u.ad.split(' ').map(function (w) { return w[0]; }).join('').slice(0, 2) : '★'));
                var t = el('span'); t.appendChild(document.createTextNode(u.ad)); t.appendChild(el('small', { style: 'display:block' }, u.unvan));
                b.appendChild(t);
                stBox.appendChild(b);
            });
            radio(stBox, function (b) { st.staff = b.dataset.id || null; st.slot = null; drawSlots(); summary(); });
            stWrap.appendChild(stBox);
            left.appendChild(stWrap);
        }

        // kişi sayısı (isteğe bağlı)
        if (B.kisi) {
            var pWrap = el('div');
            pWrap.appendChild(html('p', { class: 'k-step' }, '<b>' + n() + '</b>Kişi sayısı'));
            var pBox = el('div', { class: 'k-opts', role: 'group', 'aria-label': 'Kişi sayısı' });
            for (var p = B.kisi.min; p <= B.kisi.max; p++) {
                var pb = opt(p === B.kisi.max ? p + '+' : String(p), null, p);
                if (p === st.people) press(pb, true);
                pBox.appendChild(pb);
            }
            radio(pBox, function (b) { st.people = +b.dataset.id; summary(); });
            pWrap.appendChild(pBox);
            left.appendChild(pWrap);
        }

        // iletişim
        var cWrap = el('div');
        cWrap.appendChild(html('p', { class: 'k-step' }, '<b>' + n() + '</b>İletişim'));
        cWrap.innerHTML +=
            '<div class="k-row">' +
            '<div class="k-field"><label for="k-name">Ad Soyad</label><input id="k-name" name="name" autocomplete="name"></div>' +
            '<div class="k-field"><label for="k-phone">Telefon</label><input id="k-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="05xx xxx xx xx"></div>' +
            '</div>' +
            (B.notAlani ? '<div class="k-field" style="margin-top:14px"><label for="k-note">' + B.notAlani.label + '</label><input id="k-note" name="note" placeholder="' + B.notAlani.placeholder + '" autocomplete="off"></div>' : '');
        left.appendChild(cWrap);

        // gün
        var dWrap = el('div');
        dWrap.appendChild(html('p', { class: 'k-step' }, '<b>' + n() + '</b>Gün'));
        var dBox = el('div', { class: 'k-days', role: 'group', 'aria-label': 'Gün' });
        var t0 = now(), added = 0;
        for (var i = 0; added < (B.gunSayisi || 12) && i < 40; i++) {
            var d = new Date(t0.getFullYear(), t0.getMonth(), t0.getDate() + i);
            if (!hours(d)) continue;
            if (i === 0 && !slotsFor(d, 30, null).some(function (x) { return !x.past; })) continue;
            added++;
            var db = el('button', { type: 'button', class: 'k-day', 'aria-pressed': 'false' });
            db.innerHTML = (i === 0 ? 'Bugün' : i === 1 ? 'Yarın' : GUN[d.getDay()]) + '<strong>' + d.getDate() + '</strong>' + AY[d.getMonth()].slice(0, 3);
            db.dataset.t = d.getTime();
            dBox.appendChild(db);
        }
        radio(dBox, function (b) { st.day = new Date(+b.dataset.t); st.slot = null; drawSlots(); summary(); });
        dWrap.appendChild(dBox);
        right.appendChild(dWrap);

        // saat
        var sWrap = el('div');
        sWrap.appendChild(html('p', { class: 'k-step' }, '<b>' + n() + '</b>Saat'));
        var sBox = el('div', { class: 'k-slots', role: 'group', 'aria-label': 'Saat' });
        radio(sBox, function (b) { st.slot = +b.dataset.id; summary(); });
        sWrap.appendChild(sBox);
        right.appendChild(sWrap);

        var sum = el('div', { class: 'k-summary' }, 'Hizmet, gün ve saat seçin.');
        var err = el('p', { class: 'k-err', hidden: '' });
        var btn = el('button', { type: 'submit', class: 'k-btn' }, B.buton || 'Randevu Talebini Oluştur');
        var pv = preview('Talebiniz hazır. İşletmeye giden mesaj:');
        [sum, err, btn, pv].forEach(function (x) { right.appendChild(x); });

        function svcList() { return B.hizmetler.filter(function (s) { return st.svc.indexOf(s.id) > -1; }); }
        function duration() { return svcList().reduce(function (a, s) { return a + (s.sure || 0); }, 0) || (B.varsayilanSure || 30); }
        function staffName() { var u = (B.ustalar || []).filter(function (x) { return x.id === st.staff; })[0]; return u ? u.ad : null; }

        function total() {
            var lo = 0, hi = 0, any = false;
            svcList().forEach(function (s) {
                if (s.fiyat == null) return;
                any = true;
                var f = Array.isArray(s.fiyat) ? s.fiyat : [s.fiyat, s.fiyat];
                lo += f[0]; hi += f[1];
            });
            return any ? (lo === hi ? TL(lo) : TL(lo) + ' - ' + TL(hi)) : '';
        }

        function drawSlots() {
            sBox.innerHTML = '';
            if (!st.day) return;
            var list = slotsFor(st.day, duration(), st.staff), free = 0;
            list.forEach(function (s) {
                var b = opt(hm(s.min), null, s.min);
                if (s.off) { b.disabled = true; b.setAttribute('aria-label', hm(s.min) + (s.past ? ' geçti' : ' dolu')); }
                else free++;
                if (st.slot === s.min && !s.off) press(b, true);
                sBox.appendChild(b);
            });
            if (st.slot != null && !list.some(function (s) { return s.min === st.slot && !s.off; })) st.slot = null;
            if (!free) sBox.appendChild(el('p', { class: 'k-slots-empty' }, 'Bu gün için boş saat kalmadı, başka bir gün seçin.'));
        }

        function summary() {
            err.hidden = true; pv.hide();
            sum.innerHTML = '';
            if (!st.day || st.slot == null) { sum.textContent = !st.svc.length && B.hizmetler.length ? 'Hizmet, gün ve saat seçin.' : st.day ? 'Bir saat seçin.' : 'Gün ve saat seçin.'; return; }
            sum.appendChild(el('strong', null, dateText(st.day) + ' · ' + hm(st.slot) + (st.svc.length ? ' - ' + hm(st.slot + duration()) : '')));
            var parts = [];
            if (st.svc.length) parts.push(svcList().map(function (s) { return s.ad; }).join(', '));
            if (staffName()) parts.push(staffName());
            if (st.people) parts.push(st.people + (st.people === B.kisi.max ? '+' : '') + ' kişi');
            if (parts.length) { sum.appendChild(el('br')); sum.appendChild(document.createTextNode(parts.join(' · '))); }
            var t = total();
            if (t) sum.appendChild(el('span', { class: 'k-total' }, 'Toplam: ' + t));
        }

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            var name = $('[name=name]', form).value.trim(), phone = $('[name=phone]', form).value.trim(), note = $('[name=note]', form);
            var msg = (B.hizmetler.length && !st.svc.length) ? 'Lütfen en az bir hizmet seçin.'
                : !st.day || st.slot == null ? 'Lütfen gün ve saat seçin.'
                : name.length < 3 ? 'Lütfen adınızı yazın.'
                : digits(phone).length < 10 ? 'Lütfen geçerli bir telefon numarası yazın.' : '';
            if (msg) { err.textContent = msg; err.hidden = false; return; }

            var lines = [B.mesajBaslik || 'Merhaba, online randevu talebim:'];
            lines.push('📅 ' + dateText(st.day) + ' · ' + hm(st.slot));
            if (st.svc.length) lines.push((B.hizmetEmoji || '✂️') + ' ' + svcList().map(function (s) { return s.ad; }).join(', ') + (total() ? ' (' + total() + ')' : ''));
            if (staffName()) lines.push((B.ustaEmoji || '💈') + ' ' + staffName());
            if (st.people) lines.push('👥 ' + st.people + (st.people === B.kisi.max ? '+' : '') + ' kişi');
            if (note && note.value.trim()) lines.push('📝 ' + note.value.trim());
            lines.push('👤 ' + name + ' · ' + phone);
            pv.show(lines.join('\n'));
        });

        $$('input', form).forEach(function (x) { x.addEventListener('input', function () { err.hidden = true; }); });

        // dışarıdan hizmet seçtirme: <a data-k-pick="id">
        $$('[data-k-pick]').forEach(function (a) {
            a.addEventListener('click', function () {
                var id = a.getAttribute('data-k-pick');
                $$('.k-opt', svcBox).forEach(function (b) { if (!B.coklu) press(b, b.dataset.id === id); else if (b.dataset.id === id) press(b, true); });
                st.svc = $$('.k-opt', svcBox).filter(pressed).map(function (x) { return x.dataset.id; });
                drawSlots(); summary();
            });
        });

        var first = $('.k-day', dBox);
        if (first) first.click();
    }

    /* ---------------- sipariş ---------------- */

    function order(root) {
        var O = C.order, cart = {}, cat = 0, mode = O.teslim[0];
        root.classList.add('k', 'k-order');

        var menu = el('div', { class: 'k-panel' });
        var tabs = el('div', { class: 'k-tabs', role: 'group', 'aria-label': 'Kategori' });
        O.kategoriler.forEach(function (k, i) { var b = opt(k.ad, null, i); if (!i) press(b, true); tabs.appendChild(b); });
        radio(tabs, function (b) { cat = +b.dataset.id; drawItems(); });
        var items = el('div', { class: 'k-items' });
        menu.appendChild(tabs); menu.appendChild(items);

        var side = el('aside', { class: 'k-panel k-cart', 'aria-live': 'polite' });
        side.innerHTML =
            '<p class="k-step" style="margin:0"><b>✓</b>Sepetiniz</p>' +
            '<ul></ul><p class="k-empty">Sepetiniz boş. Menüden ürün ekleyin.</p>' +
            '<div class="k-cart-total"><span>Toplam</span><span class="k-sum">0 ₺</span></div>' +
            '<div><p class="k-step"><b>1</b>Teslim şekli</p><div class="k-opts k-mode" role="group" aria-label="Teslim şekli"></div></div>' +
            '<div class="k-row"><div class="k-field"><label for="o-name">Ad</label><input id="o-name" autocomplete="name"></div>' +
            '<div class="k-field"><label for="o-phone">Telefon</label><input id="o-phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="05xx xxx xx xx"></div></div>' +
            '<div class="k-field k-extra"><label for="o-extra"></label><input id="o-extra" autocomplete="off"></div>' +
            '<p class="k-err" hidden></p>' +
            '<button type="button" class="k-btn k-go">Siparişi Oluştur</button>';
        root.appendChild(menu); root.appendChild(side);

        var modeBox = $('.k-mode', side);
        O.teslim.forEach(function (t, i) { var b = opt(t.ad, t.not, i); if (!i) press(b, true); modeBox.appendChild(b); });
        radio(modeBox, function (b) { mode = O.teslim[+b.dataset.id]; extra(); });
        function extra() {
            var f = $('.k-extra', side);
            f.hidden = !mode.alan;
            if (mode.alan) { $('label', f).textContent = mode.alan; $('input', f).placeholder = mode.ornek || ''; }
        }
        extra();

        var pv = preview('Siparişiniz hazır. İşletmeye giden mesaj:');
        side.appendChild(pv);

        function key(c, i) { return c + '-' + i; }
        function find(k) { var p = k.split('-'); return O.kategoriler[+p[0]].urunler[+p[1]]; }

        function drawItems() {
            items.innerHTML = '';
            O.kategoriler[cat].urunler.forEach(function (u, i) {
                var k = key(cat, i), row = el('div', { class: 'k-item' });
                var info = el('div'); info.appendChild(el('strong', null, u.ad)); if (u.aciklama) info.appendChild(el('small', null, u.aciklama));
                row.appendChild(info);
                row.appendChild(el('span', { class: 'k-price' }, TL(u.fiyat)));
                var q = el('div', { class: 'k-qty' });
                var minus = el('button', { type: 'button', 'aria-label': u.ad + ' azalt' }, '−');
                var count = el('span', null, String(cart[k] || 0));
                var plus = el('button', { type: 'button', class: 'add', 'aria-label': u.ad + ' ekle' }, '+');
                minus.hidden = !cart[k]; count.hidden = !cart[k];
                minus.addEventListener('click', function () { cart[k] = Math.max((cart[k] || 0) - 1, 0); if (!cart[k]) delete cart[k]; drawItems(); drawCart(); });
                plus.addEventListener('click', function () { cart[k] = (cart[k] || 0) + 1; drawItems(); drawCart(); });
                q.appendChild(minus); q.appendChild(count); q.appendChild(plus);
                row.appendChild(q);
                items.appendChild(row);
            });
        }

        function sumCart() { return Object.keys(cart).reduce(function (a, k) { return a + find(k).fiyat * cart[k]; }, 0); }

        function drawCart() {
            var ul = $('ul', side); ul.innerHTML = '';
            Object.keys(cart).forEach(function (k) {
                var li = el('li'); li.appendChild(el('span', null, cart[k] + ' × ' + find(k).ad)); li.appendChild(el('span', null, TL(find(k).fiyat * cart[k])));
                ul.appendChild(li);
            });
            $('.k-empty', side).hidden = !!Object.keys(cart).length;
            $('.k-sum', side).textContent = TL(sumCart());
            $('.k-err', side).hidden = true;
            pv.hide();
        }

        $('.k-go', side).addEventListener('click', function () {
            var e = $('.k-err', side), name = $('#o-name').value.trim(), phone = $('#o-phone').value.trim(), ex = $('#o-extra').value.trim();
            var m = !Object.keys(cart).length ? 'Sepetiniz boş.'
                : name.length < 2 ? 'Lütfen adınızı yazın.'
                : digits(phone).length < 10 ? 'Lütfen geçerli bir telefon numarası yazın.'
                : mode.alan && mode.zorunlu && !ex ? 'Lütfen ' + mode.alan.toLocaleLowerCase('tr-TR') + ' bilgisini yazın.' : '';
            if (m) { e.textContent = m; e.hidden = false; return; }
            var lines = ['Merhaba, online sipariş:'];
            Object.keys(cart).forEach(function (k) { lines.push('• ' + cart[k] + ' × ' + find(k).ad + ' — ' + TL(find(k).fiyat * cart[k])); });
            lines.push('💳 Toplam: ' + TL(sumCart()));
            lines.push('🛍️ ' + mode.ad + (ex ? ' · ' + ex : ''));
            lines.push('👤 ' + name + ' · ' + phone);
            pv.show(lines.join('\n'));
        });

        drawItems(); drawCart();
    }

    /* ---------------- sadakat kartı ---------------- */

    function loyalty(root) {
        var L = C.loyalty, key = 'ery-loyal-' + C.isletme, n = storage(key) || L.baslangic || 0;
        root.classList.add('k', 'k-loyal');
        root.innerHTML =
            '<div><h3></h3><p class="k-l-desc"></p><div class="k-count" aria-live="polite"></div>' +
            '<button type="button" class="k-btn k-add"></button>' +
            '<button type="button" class="k-btn ghost k-reset">Kartı sıfırla</button>' +
            '<p class="k-note" style="margin-top:14px"></p></div>' +
            '<div class="k-stamps" role="img"></div>';
        $('h3', root).textContent = L.baslik;
        $('.k-l-desc', root).textContent = L.aciklama;
        $('.k-add', root).textContent = C.DEMO ? 'Dene: damga ekle' : 'Damga ekle';
        $('.k-note', root).textContent = L.not;
        var box = $('.k-stamps', root);
        for (var i = 1; i <= L.hedef + 1; i++) {
            box.appendChild(el('div', { class: 'k-stamp' + (i === L.hedef + 1 ? ' gift' : '') }, i === L.hedef + 1 ? '🎁' : String(i)));
        }
        function draw() {
            $$('.k-stamp', box).forEach(function (s, i) { s.classList.toggle('on', i < n); });
            box.setAttribute('aria-label', n + ' / ' + L.hedef + ' damga');
            $('.k-count', root).textContent = n >= L.hedef
                ? '🎉 Tebrikler! ' + L.odul + '.'
                : n + ' / ' + L.hedef + ' damga · ' + (L.hedef - n) + ' ' + (L.birim || 'alışveriş') + ' sonra ' + L.odul.toLocaleLowerCase('tr-TR');
            $('.k-add', root).disabled = n > L.hedef;
            storage(key, n);
        }
        $('.k-add', root).addEventListener('click', function () { n = Math.min(n + 1, L.hedef + 1); draw(); });
        $('.k-reset', root).addEventListener('click', function () { n = 0; draw(); });
        draw();
    }

    /* ---------------- paketler ---------------- */

    function packs(root) {
        root.classList.add('k', 'k-packs');
        C.paketler.forEach(function (p) {
            var c = el('article', { class: 'k-pack' + (p.one ? ' best' : '') });
            if (p.etiket) c.appendChild(el('span', { class: 'k-tag' }, p.etiket));
            c.appendChild(el('h3', null, p.ad));
            if (p.aciklama) c.appendChild(el('p', null, p.aciklama));
            var pr = el('div');
            if (p.eski) { pr.appendChild(el('span', { class: 'k-was' }, TL(p.eski))); pr.appendChild(el('br')); }
            pr.appendChild(el('span', { class: 'k-now' }, TL(p.fiyat)));
            c.appendChild(pr);
            var ul = el('ul'); p.icerik.forEach(function (x) { ul.appendChild(el('li', null, x)); }); c.appendChild(ul);
            var a = el('a', { class: 'k-btn' + (p.one ? '' : ' ghost'), href: p.link || '#randevu' }, p.buton || 'Randevu Al');
            if (p.secim) a.setAttribute('data-k-pick', p.secim);
            c.appendChild(a);
            root.appendChild(c);
        });
    }

    /* ---------------- asistan ---------------- */

    function bot() {
        var A = C.bot;
        var btn = el('button', { type: 'button', class: 'k-bot-btn', 'aria-label': 'Asistana sorun', 'aria-expanded': 'false' });
        btn.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-5A8 8 0 1 1 21 12z"/></svg><span>Asistana sorun</span><i class="dot"></i>';

        var box = el('div', { class: 'k-bot', role: 'dialog', 'aria-label': A.ad });
        box.innerHTML =
            '<div class="k-bot-head"><span class="k-av"></span><div><strong></strong><small>● Çevrimiçi · 7/24</small></div><button type="button" class="k-bot-close" aria-label="Kapat">×</button></div>' +
            '<div class="k-log" aria-live="polite"></div><div class="k-quick"></div>' +
            '<form class="k-bot-form"><input aria-label="Mesajınız" placeholder="Sorunuzu yazın..." autocomplete="off"><button type="submit" aria-label="Gönder"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 20l18-8L3 4v6l12 2-12 2z"/></svg></button></form>' +
            '<div class="k-bot-foot"></div>';
        $('.k-av', box).textContent = C.kisa;
        $('.k-bot-head strong', box).textContent = A.ad;
        $('.k-bot-foot', box).textContent = C.DEMO ? 'Örnek asistan · Gerçek sürüm yapay zeka ile çalışır' : 'Otomatik asistan';
        document.body.appendChild(btn);
        document.body.appendChild(box);

        var log = $('.k-log', box), form = $('.k-bot-form', box), input = $('input', form), started = false;

        function add(text, dir, link) {
            var m = el('div', { class: 'k-msg ' + dir });
            text.split(/(https?:\/\/\S+)/).forEach(function (part) {
                if (/^https?:\/\//.test(part)) m.appendChild(el('a', { href: part, target: '_blank', rel: 'noopener' }, 'Haritada aç'));
                else m.appendChild(document.createTextNode(part));
            });
            if (link) {
                m.appendChild(el('br'));
                var a = el('a', { href: link.go }, link.btn + ' →');
                a.addEventListener('click', function () { if (window.innerWidth <= 700) close(); });
                m.appendChild(a);
            }
            log.appendChild(m);
            log.scrollTop = log.scrollHeight;
        }

        function match(q) {
            var t = ' ' + q.toLocaleLowerCase('tr-TR') + ' ', best = null, score = 0;
            A.sss.forEach(function (s) {
                var n = s.k.filter(function (k) { return t.indexOf(k) > -1; }).length;
                if (n > score) { score = n; best = s; }
            });
            return best;
        }

        function ask(q) {
            add(q, 'out');
            var t = html('div', { class: 'k-msg in' }, '<span class="k-typing"><i></i><i></i><i></i></span>');
            log.appendChild(t); log.scrollTop = log.scrollHeight;
            setTimeout(function () {
                t.remove();
                var s = match(q);
                if (s) add(typeof s.c === 'function' ? s.c() : s.c, 'in', s.go ? { go: s.go, btn: s.btn } : null);
                else add(A.yedek || ('Bu soruyu ekibimize iletmem daha doğru olur. WhatsApp\'tan yazarsanız size hemen dönüş yapılır: ' + C.telefon), 'in');
            }, 650);
        }

        function open() {
            box.classList.add('open'); btn.style.display = 'none'; btn.setAttribute('aria-expanded', 'true');
            if (!started) { started = true; add(A.hosgeldin, 'in'); }
            if (window.innerWidth > 700) input.focus();
        }
        function close() { box.classList.remove('open'); btn.style.display = ''; btn.setAttribute('aria-expanded', 'false'); btn.focus(); }

        A.hizli.forEach(function (q) {
            var b = el('button', { type: 'button' }, q);
            b.addEventListener('click', function () { ask(q); });
            $('.k-quick', box).appendChild(b);
        });
        btn.addEventListener('click', open);
        $('.k-bot-close', box).addEventListener('click', close);
        document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && box.classList.contains('open')) close(); });
        form.addEventListener('submit', function (e) { e.preventDefault(); var q = input.value.trim(); if (!q) return; input.value = ''; ask(q); });
    }

    // site.js'deki cevaplarda kullanılabilsin
    C.acikDurum = function () { return openState().text; };

    /* ---------------- başlat ---------------- */

    function start() {
        openBadges(); setInterval(openBadges, 60000);
        if (C.paketler) $$('[data-k-packs]').forEach(packs);
        if (B) $$('[data-k-booking]').forEach(booking);
        nextFree();
        if (C.order) $$('[data-k-order]').forEach(order);
        if (C.loyalty) $$('[data-k-loyalty]').forEach(loyalty);
        if (C.bot) bot();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
    else start();
})();
