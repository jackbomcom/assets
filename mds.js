/* =========================================================
   JACKBOM EMBER THEME — JS LOADER
   ---------------------------------------------------------
   Tema CSS'ini (jackbom-theme.css) JavaScript ile sayfaya
   enjekte eder ve <head> içinde HER ZAMAN en sonda kalmasını
   garanti eder. Next.js chunk'ları sonradan stylesheet
   eklediği için bu kritik: en sonda olmayan tema ezilir.

   KULLANIM (3 yoldan biri):

   1) Siteye script olarak:
        <script src="/assets/jackbom-theme-loader.js" defer></script>
      (CSS yolunu aşağıdaki CONFIG.href ile ayarlayın)

   2) Konsola yapıştır / bookmarklet / Tampermonkey:
        Dosyanın tamamını kopyalayıp konsola yapıştırın.

   3) CSS'i inline gömmek isterseniz:
        CONFIG.inlineCss alanına CSS metnini yapıştırın,
        href kullanılmaz, fetch yapılmaz.
   ========================================================= */
(function () {
  'use strict';

  var CONFIG = {
    // Tema CSS dosyasının yolu (aynı origin ya da CORS açık CDN)
    href: '/css/jackbom-theme.css',

    // CSS'i dosya yerine doğrudan buraya yapıştırmak isterseniz:
    // inlineCss: ':root { --accent: #ee3524 !important; } ...'
    inlineCss: null,

    // <style> etiketine verilecek id (tekrar yüklemeyi engeller)
    id: 'jackbom-ember-theme',

    // <head> sonunda kalmasını sürekli koru (Next.js için önerilir)
    keepLast: true,

    // fetch başarısız olursa <link rel=stylesheet> ile dene
    linkFallback: true,

    // konsola log bas
    debug: false
  };

  var log = function () {
    if (CONFIG.debug && window.console) {
      console.log.apply(console, ['[jackbom-theme]'].concat([].slice.call(arguments)));
    }
  };

  // --- zaten yüklüyse çık --------------------------------------------------
  if (document.getElementById(CONFIG.id)) {
    log('zaten yüklü, atlanıyor');
    return;
  }

  var styleEl = null;
  var observer = null;

  /** <style> etiketini oluşturup head sonuna koyar */
  function injectCss(cssText) {
    styleEl = document.createElement('style');
    styleEl.id = CONFIG.id;
    styleEl.setAttribute('data-jackbom', 'ember');
    styleEl.type = 'text/css';
    styleEl.appendChild(document.createTextNode(cssText));
    (document.head || document.documentElement).appendChild(styleEl);
    log('CSS enjekte edildi (' + cssText.length + ' karakter)');
    if (CONFIG.keepLast) keepLast();
  }

  /** fetch olmazsa klasik <link> ile yükle */
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

  /**
   * Tema etiketini <head> içinde son sırada tutar.
   * Next.js runtime'da yeni <style>/<link> eklediğinde
   * temayı yeniden sona taşır.
   */
  function keepLast() {
    if (!('MutationObserver' in window)) return;

    var moveScheduled = false;
    function moveToEnd() {
      moveScheduled = false;
      var head = document.head;
      if (!head || !styleEl) return;
      if (head.lastElementChild !== styleEl) {
        head.appendChild(styleEl); // appendChild = taşır, kopyalamaz
        log('tema tekrar en sona alındı');
      }
    }

    observer = new MutationObserver(function (mutations) {
      for (var i = 0; i < mutations.length; i++) {
        var added = mutations[i].addedNodes;
        for (var j = 0; j < added.length; j++) {
          var n = added[j];
          if (n.nodeType !== 1) continue;
          var tag = n.tagName;
          if (tag === 'STYLE' || (tag === 'LINK' && n.rel === 'stylesheet')) {
            if (n !== styleEl && !moveScheduled) {
              moveScheduled = true;
              requestAnimationFrame(moveToEnd);
            }
          }
        }
        // biri temayı silerse geri koy
        var removed = mutations[i].removedNodes;
        for (var k = 0; k < removed.length; k++) {
          if (removed[k] === styleEl) {
            log('tema silinmiş, geri ekleniyor');
            document.head.appendChild(styleEl);
          }
        }
      }
    });

    observer.observe(document.head, { childList: true });
    log('keepLast observer aktif');
  }

  // --- yükleme akışı -------------------------------------------------------
  function boot() {
    if (CONFIG.inlineCss) {
      injectCss(CONFIG.inlineCss);
      return;
    }

    if (!window.fetch) {
      injectLink(CONFIG.href);
      return;
    }

    fetch(CONFIG.href, { credentials: 'same-origin', cache: 'no-cache' })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.text();
      })
      .then(injectCss)
      .catch(function (err) {
        log('fetch başarısız:', err.message);
        if (CONFIG.linkFallback) injectLink(CONFIG.href);
      });
  }

  if (document.head) {
    boot();
  } else {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  }

  // --- dışarıdan kontrol ---------------------------------------------------
  window.JackbomTheme = {
    config: CONFIG,
    remove: function () {
      if (observer) observer.disconnect();
      if (styleEl && styleEl.parentNode) styleEl.parentNode.removeChild(styleEl);
      styleEl = null;
      log('tema kaldırıldı');
    },
    reload: function () {
      this.remove();
      boot();
    },
    element: function () { return styleEl; }
  };
})();