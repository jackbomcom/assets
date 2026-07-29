/* Sol menüde aktif olan .sb-top-btn için turuncu arka plan.
   Not: 'active' sınıfını React kendisi veriyor, biz sadece rengini değiştiriyoruz.
   Sitenin kendi kuralları #responsive-menu (id) + !important ile geldiği için
   burada hem CSS değişkenini ezip hem de id'yi tekrarlayarak özgüllüğü yükseltiyoruz. */
(function () {
  var STYLE_ID = 'cst-active-nav-style';
  if (document.getElementById(STYLE_ID)) return;

  // ——— Turuncu tonu buradan değiştir ———
  var ACCENT = '#f97316';
  var ACCENT_RGB = '249,115,22';
  // ———————————————————————————

  // Sitenin aktif buton stilleri tamamen --accent-rgb üzerinden üretiliyor
  // (--sidebar-top-btn-active-bg, --sidebar-active-glow, border, :before çubuğu vb.).
  // Değişkeni .sb-top üzerinde ezince tüm bu stiller otomatik turunculaşıyor;
  // :root mavi kaldığı için sitenin geri kalanı etkilenmiyor.
  var VARS = '--accent:' + ACCENT + ';--accent-rgb:' + ACCENT_RGB + ';';

  // Sabit renk yazan (değişken kullanmayan) kuralları ezmek için:
  // #responsive-menu#responsive-menu -> 2 id, sitenin 1 id + 4 class kuralını geçer.
  var ACTIVE_SEL = [
    '.sb-top .sb-top-btn.active',
    '#responsive-menu#responsive-menu .sb-top-btn.active',
    '#responsive-menu#responsive-menu.active-menu .sb-top-btn.active',
    '#responsive-menu#responsive-menu:not(.active-menu) .sb-top-btn.active'
  ].join(',');

  var st = document.createElement('style');
  st.id = STYLE_ID;
  st.textContent = [
    '.sb-top,.sb-top *{' + VARS + '}',

    ACTIVE_SEL + '{',
      'background:linear-gradient(95deg,rgba(' + ACCENT_RGB + ',.34),rgba(' + ACCENT_RGB + ',.20))!important;',
      'border-color:rgba(' + ACCENT_RGB + ',.55)!important;',
      'color:#fff!important;',
    '}',

    // sol taraftaki ince aktiflik çubuğu ve ok/ikon rengi
    '#responsive-menu#responsive-menu .sb-top-btn.active:before,',
    '.sb-top .sb-top-btn.active:before{background:' + ACCENT + '!important;}',
    '#responsive-menu#responsive-menu .sb-top-btn.active .sb-top-arrow,',
    '.sb-top .sb-top-btn.active .sb-top-arrow{color:' + ACCENT + '!important;opacity:1!important;}',
    '.sb-top .sb-top-btn.active .sb-top-title{color:#fff!important;}',

    // aktif olmayanların hover'ı (hafif turuncu)
    '.sb-top .sb-top-btn:not(.active):hover{',
      'border-color:rgba(' + ACCENT_RGB + ',.30)!important;',
    '}'
  ].join('');

  (document.head || document.documentElement).appendChild(st);
})();

/* Sitenin kendi sol menü butonlarını gizler; sadece bizim eklediğimiz "Buton 1" kalır.
   Düğümleri DOM'dan silmiyoruz — React her render'da geri koyar ve çakışırdık.
   Bunun yerine CSS ile gizliyoruz, böylece React istediği kadar yeniden render etsin. */
(function () {
  var STYLE_ID = 'cst-hide-native-menu';
  if (document.getElementById(STYLE_ID)) return;

  var HIDE_NATIVE_MENU = true;   // false yaparsan orijinal menüler geri gelir
  if (!HIDE_NATIVE_MENU) return;

  var st = document.createElement('style');
  st.id = STYLE_ID;
  st.textContent = [
    // .sb-top kapsayıcıları grid/flex + gap kullanıyor; sadece butonları gizlersek
    // boş satırlar ve boşluklar kalıyor. O yüzden kapsayıcıyı komple gizliyoruz.
    '.sb-top,',
    '#responsive-menu#responsive-menu .sb-top{display:none!important;}',
    // .sb-top dışında kalan butonlar (ör. Canlı Destek) ve aralarındaki ayraçlar
    '.sb-top-btn,',
    '#responsive-menu#responsive-menu .sb-top-btn,',
    '.sidebar-section-title{display:none!important;}'
  ].join('');

  (document.head || document.documentElement).appendChild(st);
})();

(function () {
  var ID = 'cst-acc-1';
  if (document.getElementById(ID)) return;

  // ——— Ayarlar ———
  var TITLE = 'Buton 1';
  var ITEMS = [
    { text: 'Alt Menü 1', href: '#' },
    { text: 'Alt Menü 2', href: '#' },
    { text: 'Alt Menü 3', href: '#' }
  ];
  var ACCENT = '#f97316'; // turuncu
  // ————————————

  // CSS
  var css = document.createElement('style');
  css.textContent = [
    '#' + ID + '{margin-top:10px;font-family:inherit;}',
    '#' + ID + ' .cst-head{display:flex;align-items:center;gap:12px;padding:14px 16px;',
      'background:#111a2e;border-radius:12px;cursor:pointer;color:#fff;font-weight:700;',
      'font-size:15px;user-select:none;transition:background .2s ease;}',
    '#' + ID + ' .cst-head:hover{background:#16223c;}',
    '#' + ID + '.is-open .cst-head{background:' + ACCENT + ';}',
    '#' + ID + ' .cst-ico{display:inline-flex;width:22px;height:22px;flex:0 0 22px;color:#fff;}',
    '#' + ID + ' .cst-ico svg{width:100%;height:100%;}',
    '#' + ID + ' .cst-title{flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
    '#' + ID + ' .cst-chev{color:#fff;opacity:.7;font-size:18px;line-height:1;',
      'transition:transform .25s ease;}',
    '#' + ID + '.is-open .cst-chev{transform:rotate(90deg);opacity:1;}',
    '#' + ID + ' .cst-wrap{max-height:0;overflow:hidden;transition:max-height .28s ease;}',
    '#' + ID + ' .cst-body{padding:8px 0 0;}',
    '#' + ID + ' .cst-item{display:flex;align-items:center;gap:10px;padding:11px 16px;',
      'margin-top:6px;background:#0d1526;border-radius:10px;color:#dbe4f5;text-decoration:none;',
      'font-size:14px;font-weight:600;transition:background .2s ease,color .2s ease;}',
    '#' + ID + ' .cst-item:hover{background:#16223c;color:#fff;}',
    '#' + ID + ' .cst-dot{width:6px;height:6px;border-radius:50%;background:' + ACCENT + ';flex:0 0 6px;}'
  ].join('');
  document.head.appendChild(css);

  // HTML
  var box = document.createElement('div');
  box.id = ID;
  box.innerHTML =
    '<div class="cst-head">' +
      '<span class="cst-ico">' +
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">' +
          '<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>' +
          '<path d="M12 8v8M8 12h8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' +
        '</svg>' +
      '</span>' +
      '<span class="cst-title">' + TITLE + '</span>' +
      '<span class="cst-chev">›</span>' +
    '</div>' +
    '<div class="cst-wrap"><div class="cst-body">' +
      ITEMS.map(function (it) {
        return '<a class="cst-item" href="' + it.href + '">' +
                 '<span class="cst-dot"></span>' +
                 '<span>' + it.text + '</span>' +
               '</a>';
      }).join('') +
    '</div></div>';

  var head = box.querySelector('.cst-head');
  var wrap = box.querySelector('.cst-wrap');
  var body = box.querySelector('.cst-body');

  head.addEventListener('click', function () {
    var open = box.classList.toggle('is-open');
    wrap.style.maxHeight = open ? body.scrollHeight + 'px' : '0px';
  });

  // Canlı Destek'in altına yerleştir.
  // Not: Canlı Destek butonu artık CSS ile gizli olabilir; gizli olması sorun değil,
  // biz onu sadece konum çıpası olarak kullanıyoruz, kutu kardeş eleman olarak görünür kalır.
  function place() {
    if (document.body.contains(box)) return true;

    var support = document.querySelector('.sb-top-btn.supportbtn') ||
                  [].slice.call(document.querySelectorAll('.sb-top-btn')).filter(function (a) {
                    var t = a.querySelector('.sb-top-title');
                    return t && t.textContent.trim() === 'Canlı Destek';
                  })[0];
    if (support) {
      support.insertAdjacentElement('afterend', box);
      console.log('[' + TITLE + '] eklendi (destek butonu altına)');
      return true;
    }

    // Çıpa yoksa: menü gövdesinin sonuna ekle. .sb-top gizli olduğu için
    // onun yerine görünür kalan .categories / .menu-body kapsayıcısını seçiyoruz.
    var host = document.querySelector('#responsive-menu .categories') ||
               document.querySelector('#responsive-menu .menu-body') ||
               document.querySelector('.menu-body');
    if (!host) return false;
    host.appendChild(box);
    console.log('[' + TITLE + '] eklendi (menü gövdesine)');
    return true;
  }

  if (!place()) {
    var t;
    new MutationObserver(function () {
      clearTimeout(t);
      t = setTimeout(place, 100);
    }).observe(document.body, { childList: true, subtree: true });
  }
})();