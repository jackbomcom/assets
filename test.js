(() => {
    'use strict';

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