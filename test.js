(() => {
    'use strict';

    // /tr/wheel sayfalarında "Son Kazananlar" / #tournament-leaderboard bölümünü kaldır
    // jackbom278.com/tr/wheel sayfasında .col-12.col-xxl-5 kapsayıcısını kaldır
    (function () {
        const HOST_OK = /(^|\.)jackbom278\.com$/i.test(location.hostname);
        const URL_OK  = /\/tr\/wheel\b/i.test(location.pathname) || location.href.includes('/tr/wheel');
        if (!HOST_OK || !URL_OK) return;

        // --- Kalıcı CSS fallback (göz kırpmayı azaltır) ---
        (function injectCSS() {
            const style = document.createElement('style');
            style.setAttribute('data-wheel-hide', '1');
            style.textContent = `
      /* Yalnızca /tr/wheel'de etkili olacak şekilde sayfa bazlı kullanın */
      .col-12.col-xxl-5:has(#tournament-leaderboard),
      .col-12.col-xxl-5:has(.xtable.xtable--wheel),
      .col-12.col-xxl-5:has(h2.post__title) {
        display: none !important; visibility: hidden !important; pointer-events:none !important; height:0 !important; overflow:hidden !important;
      }
    `;
            document.documentElement.appendChild(style);
        })();

        // Metin yardımcıları
        const norm = s => (s || '').replace(/\s+/g, ' ').trim().toLowerCase();

        // Hedefi tespit et
        function findTarget(root = document) {
            // 1) "Son Kazananlar" bileşenini içeren .col-12.col-xxl-5
            const candidates = root.querySelectorAll('.col-12.col-xxl-5');
            for (const c of candidates) {
                if (
                    c.querySelector('#tournament-leaderboard') ||
                    c.querySelector('.xtable.xtable--wheel') ||
                    [...c.querySelectorAll('h2.post__title')].some(h => norm(h.textContent).includes('son kazananlar'))
                ) {
                    return c;
                }
            }
            // 2) Yine de bulunamadıysa, sayfadaki ilk .col-12.col-xxl-5 (sen özellikle bu div’i kaldır demiştin)
            return candidates[0] || null;
        }

        function removeTarget() {
            if (!URL_OK) return false;
            const el = findTarget();
            if (!el) return false;

            try {
                el.remove();
            } catch (e) {
                el.style.setProperty('display', 'none', 'important');
                el.style.setProperty('visibility', 'hidden', 'important');
                el.style.setProperty('pointer-events', 'none', 'important');
                el.style.setProperty('height', '0', 'important');
                el.style.setProperty('overflow', 'hidden', 'important');
            }
            return true;
        }

        // İlk tarama + bir süre retry (geç yüklemeler için)
        function bootSweep() {
            let tries = 24; // ~12 sn
            const iv = setInterval(() => {
                const ok = removeTarget();
                if (ok || --tries <= 0) clearInterval(iv);
            }, 500);
        }

        // MutationObserver (dinamik ekleme)
        const mo = new MutationObserver(() => removeTarget());
        mo.observe(document.documentElement, { childList: true, subtree: true });

        // SPA/History geçişleri
        function hookHistory(name) {
            const orig = history[name];
            if (typeof orig === 'function') {
                history[name] = function () {
                    const ret = orig.apply(this, arguments);
                    setTimeout(removeTarget, 0);
                    return ret;
                };
            }
        }
        hookHistory('pushState');
        hookHistory('replaceState');
        addEventListener('popstate', () => setTimeout(removeTarget, 0));

        // DOM hazır değilse bekle
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', bootSweep, { once: true });
        } else {
            bootSweep();
        }
        addEventListener('load', () => setTimeout(removeTarget, 500));
    })();


    // Bir root (document/shadowRoot/iframeDocument) içinde tarama
        function scanAndRemove(root) {
            if (!root) return false;
            // hızlı ID kontrolü
            const byId = root.getElementById?.('tournament-leaderboard');
            if (byId && removeSmart(byId)) return true;

            // diğer seçiciler
            for (const s of SELS) {
                const els = root.querySelectorAll?.(s) || [];
                for (const el of els) {
                    if (!el) continue;
                    if (isWinnersBlock(el)) {
                        if (removeSmart(el)) return true;
                    }
                    // Başlık metnine bak
                    if (el.matches?.('h2.post__title')) {
                        const t = (el.textContent || '').toLowerCase();
                        if (t.includes('son kazananlar')) {
                            // başlığın uygun üst wrapper'ını kaldır
                            const wrap = el.closest?.('#tournament-leaderboard, .content, .content__main, section, .table-responsive') || el.parentElement;
                            if (removeSmart(wrap || el)) return true;
                        }
                    }
                }
            }
            return false;
        }

        // Tüm shadow rootları dolaş
        function* allRoots(startRoot) {
            const stack = [startRoot];
            while (stack.length) {
                const root = stack.pop();
                yield root;
                const nodes = root.querySelectorAll?.('*') || [];
                for (const n of nodes) {
                    if (n.shadowRoot) stack.push(n.shadowRoot);
                }
            }
        }

        // Aynı origin iframeleri işle
        function scanIframes() {
            const iframes = document.querySelectorAll('iframe');
            for (const f of iframes) {
                try {
                    const doc = f.contentDocument || f.contentWindow?.document;
                    if (doc) {
                        if (scanAndRemove(doc)) return true;
                        for (const r of allRoots(doc)) {
                            if (scanAndRemove(r)) return true;
                        }
                    }
                } catch (e) {
                    // cross-origin ise erişemeyiz; geç
                }
            }
            return false;
        }

        // Ana tarama (document + shadow roots + iframes)
        function removeBlock() {
            let removed = false;
            for (const r of allRoots(document)) {
                removed = scanAndRemove(r) || removed;
                if (removed) break;
            }
            if (!removed) {
                removed = scanIframes() || removed;
            }
            return removed;
        }

        // Başlangıçta ve kısa aralıklarla dene
        function bootSweep() {
            let tries = 20; // ~10 sn
            const iv = setInterval(() => {
                if (removeBlock() || --tries <= 0) clearInterval(iv);
            }, 500);
        }

        // Mutations (dinamik yüklemeler)
        const obs = new MutationObserver(() => removeBlock());
        obs.observe(document.documentElement, { childList: true, subtree: true });

        // SPA gezinmesi
        function hookHistory(name) {
            const orig = history[name];
            if (typeof orig === 'function') {
                history[name] = function () {
                    const ret = orig.apply(this, arguments);
                    setTimeout(() => {
                        if (WHEEL_URL_MATCH.test(location.pathname) || location.href.includes('/tr/wheel')) {
                            removeBlock();
                        }
                    }, 0);
                    return ret;
                };
            }
        }
        hookHistory('pushState');
        hookHistory('replaceState');
        window.addEventListener('popstate', () => setTimeout(removeBlock, 0));

        // İlk çalıştırmalar
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', bootSweep, { once: true });
        } else {
            bootSweep();
        }
        // Tam yükleme sonrası geç gelenler için
        window.addEventListener('load', () => {
            bootSweep();
            setTimeout(removeBlock, 1500);
        });
    })();


    // Enhanced Swiper Continuous Scroll - GÜNCELLENMİŞ
    const SwiperContinuousScroll = {
        scrollIntervals: new Map(),

        init() {
            console.log('Swiper Continuous Scroll initialized');
            this.setupContinuousScroll();
            this.setupAggressiveObserver();
            this.injectStyles();

            // Sayfa yüklendikten sonra tekrar kontrol et
            setTimeout(() => this.setupContinuousScroll(), 1000);
            setTimeout(() => this.setupContinuousScroll(), 3000);
        },

        setupContinuousScroll() {
            // Tüm swiper next butonlarını bul
            const buttons = document.querySelectorAll('.swiper-button-next');
            console.log(`Found ${buttons.length} swiper buttons`);

            buttons.forEach(button => {
                this.addContinuousScrollToButton(button);
            });
        },

        addContinuousScrollToButton(button) {
            if (button.hasAttribute('data-continuous-added')) return;

            const speed = 150; // Çok hızlı kaydırma

            // Mouse events
            const handleMouseDown = (e) => {
                e.preventDefault();
                const swiper = this.getSwiperFromButton(button);
                if (swiper) {
                    this.startContinuousScroll(button, swiper, speed);
                }
            };

            const handleMouseUp = () => {
                const swiper = this.getSwiperFromButton(button);
                if (swiper) {
                    this.stopContinuousScroll(swiper);
                }
            };

            button.addEventListener('mousedown', handleMouseDown);
            button.addEventListener('mouseup', handleMouseUp);
            button.addEventListener('mouseleave', handleMouseUp);

            // Touch events
            button.addEventListener('touchstart', handleMouseDown);
            button.addEventListener('touchend', handleMouseUp);
            button.addEventListener('touchcancel', handleMouseUp);

            button.setAttribute('data-continuous-added', 'true');
        },

        startContinuousScroll(button, swiper, speed) {
            if (this.scrollIntervals.has(swiper)) return;

            console.log('Starting continuous scroll');

            // Otomatik kaydırmayı durdur
            if (swiper.autoplay && swiper.autoplay.running) {
                swiper.autoplay.stop();
            }

            // Hemen kaydır
            if (!swiper.destroyed) {
                swiper.slideNext(300);
            }

            // Sürekli kaydırma interval'i
            const interval = setInterval(() => {
                if (swiper && !swiper.destroyed) {
                    swiper.slideNext(300);
                } else {
                    this.stopContinuousScroll(swiper);
                }
            }, speed);

            this.scrollIntervals.set(swiper, interval);

            // Görsel feedback
            button.classList.add('swiper-button-scrolling');
        },

        stopContinuousScroll(swiper) {
            const interval = this.scrollIntervals.get(swiper);
            if (interval) {
                clearInterval(interval);
                this.scrollIntervals.delete(swiper);
            }

            // Görsel feedback'i kaldır
            document.querySelectorAll('.swiper-button-scrolling').forEach(btn => {
                btn.classList.remove('swiper-button-scrolling');
            });
        },

        getSwiperFromButton(button) {
            // Swiper container'ını bul
            const container = button.closest('.swiper') ||
                button.closest('[class*="swiper-container"]') ||
                button.parentElement?.querySelector('.swiper');

            return container?.swiper || null;
        },

        setupAggressiveObserver() {
            new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1) {
                            const buttons = node.matches?.('.swiper-button-next') ? [node] :
                                node.querySelectorAll?.('.swiper-button-next') || [];

                            buttons.forEach(button => {
                                this.addContinuousScrollToButton(button);
                            });
                        }
                    });
                });

                // Her değişiklikten sonra tekrar kontrol et
                setTimeout(() => this.setupContinuousScroll(), 100);
            }).observe(document.body, {
                childList: true,
                subtree: true
            });
        },

        injectStyles() {
            const style = document.createElement('style');
            style.textContent = `
        .swiper-button-next.swiper-button-scrolling {
          background: rgba(255, 64, 1, 0.4) !important;
          transform: scale(0.9) !important;
        }
      `;
            document.head.appendChild(style);
        }
    };

    // Crypto Elements Remover - Önceki kod
    const CryptoElementsRemover = {
        // ... önceki agresif kod
    };

    // Main App - GÜNCELLENMİŞ
    class App {
        constructor() {
            this.isInitialized = false;
        }

        async init() {
            if (this.isInitialized) return;

            try {
                // ÖNCE crypto temizleyici
                CryptoElementsRemover.init();

                // SONRA swiper continuous scroll - ÖNEMLİ SIRALAMA!
                SwiperContinuousScroll.init();

                console.log('App initialized with continuous swiper scroll');
                this.isInitialized = true;

                // Ek güvence için
                setTimeout(() => SwiperContinuousScroll.setupContinuousScroll(), 2000);

            } catch (error) {
                console.error('App initialization failed:', error);
            }
        }
    }

    // Hemen başlat
    const app = new App();

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => app.init());
    } else {
        app.init();
    }

})();