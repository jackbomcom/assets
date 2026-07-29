/* Sol menüde aktif olan .sb-top-btn için turuncu arka plan */
(function () {
  var STYLE_ID = 'cst-active-nav-style';
  if (document.getElementById(STYLE_ID)) return;

  var ACCENT = '#f97316';       // turuncu
  var ACCENT_SOFT = 'rgba(249,115,22,.18)';
  var ACCENT_SOFT2 = 'rgba(249,115,22,.06)';

  var st = document.createElement('style');
  st.id = STYLE_ID;
  st.textContent = [
    // aktif buton
    '.sb-top .sb-top-btn.active{',
      'background:linear-gradient(90deg,' + ACCENT_SOFT + ',' + ACCENT_SOFT2 + ')!important;',
      'box-shadow:inset 3px 0 0 0 ' + ACCENT + '!important;',
      'color:#fff!important;',
      'border-radius:10px;',
      'transition:background .2s ease,box-shadow .2s ease;',
    '}',
    // aktif butonun ikonu + yazısı
    '.sb-top .sb-top-btn.active .icon,',
    '.sb-top .sb-top-btn.active .icon svg,',
    '.sb-top .sb-top-btn.active .sb-top-arrow{color:' + ACCENT + '!important;opacity:1;}',
    '.sb-top .sb-top-btn.active .sb-top-title{color:#fff!important;font-weight:700;}',
    // aktif olmayanların hover'ı (hafif turuncu)
    '.sb-top .sb-top-btn:not(.active):hover{',
      'background:rgba(249,115,22,.10)!important;border-radius:10px;',
    '}'
  ].join('');
  (document.head || document.documentElement).appendChild(st);

  // SPA gezinmelerinde site .active sınıfını geç güncellerse yedek olarak biz de işaretleyelim
  function syncActive() {
    var btns = document.querySelectorAll('.sb-top .sb-top-btn');
    if (!btns.length) return;
    var path = location.pathname.replace(/\/+$/, '') || '/';
    var best = null, bestLen = -1;
    [].forEach.call(btns, function (a) {
      var href = (a.getAttribute('href') || '').replace(/\/+$/, '');
      if (!href) return;
      if (path === href || path.indexOf(href + '/') === 0) {
        if (href.length > bestLen) { bestLen = href.length; best = a; }
      }
    });
    if (!best) return;
    [].forEach.call(btns, function (a) { a.classList.toggle('active', a === best); });
  }

  syncActive();
  ['pushState', 'replaceState'].forEach(function (m) {
    var orig = history[m];
    history[m] = function () {
      var r = orig.apply(this, arguments);
      setTimeout(syncActive, 50);
      return r;
    };
  });
  window.addEventListener('popstate', function () { setTimeout(syncActive, 50); });

  var t;
  new MutationObserver(function () {
    clearTimeout(t);
    t = setTimeout(syncActive, 150);
  }).observe(document.documentElement, { childList: true, subtree: true });
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

  // Canlı Destek'in altına yerleştir
  function place() {
    if (document.body.contains(box)) return true;
    var support = document.querySelector('.sb-top-btn.supportbtn') ||
                  [].slice.call(document.querySelectorAll('.sb-top-btn')).filter(function (a) {
                    var t = a.querySelector('.sb-top-title');
                    return t && t.textContent.trim() === 'Canlı Destek';
                  })[0];
    if (!support) return false;
    support.insertAdjacentElement('afterend', box);
    console.log('[' + TITLE + '] eklendi');
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