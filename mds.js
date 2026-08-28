(function () {
  'use strict';

  var CONFIG = {
    href: 'https://mdscdn.pw/jackbom/theme.css',
    inlineCss: null,
    id: 'jackbom-ember-theme',
    keepLast: true,
    linkFallback: true,
    debug: false,
    maxMovesPerSecond: 20   // güvenlik sigortası
  };

  function log() {
    if (CONFIG.debug && window.console) {
      console.log.apply(console, ['[jackbom-theme]'].concat([].slice.call(arguments)));
    }
  }
  function warn(e) {
    if (window.console) console.warn('[jackbom-theme]', e && e.message ? e.message : e);
  }

  if (document.getElementById(CONFIG.id)) { log('zaten yüklü'); return; }

  var styleEl = null;
  var observer = null;
  var moving = false;          // re-entrancy kilidi
  var moveCount = 0;
  var windowStart = Date.now();

  function injectCss(cssText) {
    styleEl = document.createElement('style');
    styleEl.id = CONFIG.id;
    styleEl.setAttribute('data-jackbom', 'ember');
    styleEl.appendChild(document.createTextNode(cssText));
    (document.head || document.documentElement).appendChild(styleEl);
    log('CSS enjekte edildi (' + cssText.length + ' karakter)');
    if (CONFIG.keepLast) keepLast();
  }

  function injectLink(href) {
    var link = document.createElement('link');
    link.id = CONFIG.id;
    link.rel = 'stylesheet';
    link.href = href;
    link.setAttribute('data-jackbom', 'ember');
    (document.head || document.documentElement).appendChild(link);
    styleEl = link;
    log('link ile yüklendi:', href);
    if (CONFIG.keepLast) keepLast();
  }

  /* --- temayı <head> sonunda tut ---------------------------------------- */
  function moveToEnd() {
    if (moving || !styleEl) return;

    var head = document.head;
    if (!head) return;

    // zaten sondaysa DOKUNMA (v1'in asıl hatası buydu)
    if (head.lastElementChild === styleEl) return;

    // sigorta: saniyede N taşımadan fazlaysa vazgeç
    var now = Date.now();
    if (now - windowStart > 1000) { windowStart = now; moveCount = 0; }
    if (++moveCount > CONFIG.maxMovesPerSecond) {
      warn('çok fazla taşıma, keepLast kapatıldı');
      stopObserver();
      return;
    }

    moving = true;
    try {
      if (observer) observer.disconnect();        // taşıma mutasyonunu görme
      head.appendChild(styleEl);
      log('tema en sona alındı');
    } catch (e) {
      warn(e);
    } finally {
      try {
        if (observer) {
          observer.takeRecords();                 // biriken kayıtları at
          observer.observe(head, { childList: true });
        }
      } catch (e) { warn(e); }
      moving = false;
    }
  }

  function stopObserver() {
    try { if (observer) observer.disconnect(); } catch (e) {}
    observer = null;
  }

  function keepLast() {
    if (!('MutationObserver' in window) || !document.head) return;

    var scheduled = false;
    function schedule() {
      if (scheduled || moving) return;
      scheduled = true;
      var run = function () { scheduled = false; moveToEnd(); };
      if (window.requestAnimationFrame) requestAnimationFrame(run);
      else setTimeout(run, 16);
    }

    try {
      observer = new MutationObserver(function (mutations) {
        if (moving) return;                       // kendi taşımamızı yoksay
        try {
          // tema DOM'dan gerçekten koptuysa geri ekle
          if (styleEl && !styleEl.isConnected) {
            moving = true;
            try { document.head.appendChild(styleEl); }
            finally { moving = false; }
            log('tema silinmişti, geri eklendi');
            return;
          }
          for (var i = 0; i < mutations.length; i++) {
            var added = mutations[i].addedNodes;
            for (var j = 0; j < added.length; j++) {
              var n = added[j];
              if (n.nodeType !== 1 || n === styleEl) continue;
              if (n.tagName === 'STYLE' ||
                 (n.tagName === 'LINK' && n.rel === 'stylesheet')) {
                schedule();
                return;
              }
            }
          }
        } catch (e) { warn(e); stopObserver(); }
      });
      observer.observe(document.head, { childList: true });
      log('keepLast aktif');
    } catch (e) { warn(e); }
  }

  /* --- yükleme ---------------------------------------------------------- */
  function boot() {
    try {
      if (CONFIG.inlineCss) { injectCss(CONFIG.inlineCss); return; }

      if (!window.fetch) { injectLink(CONFIG.href); return; }

      fetch(CONFIG.href, { credentials: 'same-origin', cache: 'no-cache' })
        .then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status + ' — ' + CONFIG.href);
          return res.text();
        })
        .then(injectCss)
        .catch(function (err) {
          warn(err);
          if (CONFIG.linkFallback) { try { injectLink(CONFIG.href); } catch (e) { warn(e); } }
        });
    } catch (e) { warn(e); }
  }

  if (document.head) boot();
  else document.addEventListener('DOMContentLoaded', boot, { once: true });

  window.JackbomTheme = {
    config: CONFIG,
    remove: function () {
      stopObserver();
      if (styleEl && styleEl.parentNode) styleEl.parentNode.removeChild(styleEl);
      styleEl = null;
    },
    reload: function () { this.remove(); boot(); },
    stopKeepLast: stopObserver,
    element: function () { return styleEl; }
  };
})();