(() => {
    'use strict';

    // Configuration
    const CONFIG = {
        resources: {
            swiper: 'https://cdnjs.cloudflare.com/ajax/libs/Swiper/11.0.5/swiper-bundle.min.js',
            swiperCSS: 'https://cdnjs.cloudflare.com/ajax/libs/Swiper/11.0.5/swiper-bundle.min.css',
            fontAwesome: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.1/css/all.min.css',
            googleFonts: 'https://fonts.googleapis.com/css2?family=Karla:ital,wght@0,200..800;1,200..800&display=swap'
        },
    };

    // Swiper Continuous Scroll - EKLENEN KISIM
    const SwiperContinuousScroll = {
        scrollInterval: null,

        init() {
            this.setupContinuousScroll();
            this.setupObserver();
            console.log('Swiper continuous scroll initialized');
        },

        setupContinuousScroll() {
            document.querySelectorAll('.swiper-button-next').forEach(button => {
                this.addContinuousScroll(button);
            });
        },

        addContinuousScroll(button) {
            if (button.hasAttribute('data-continuous-added')) return;

            const scrollSpeed = 300; // Kaydırma hızı (ms)

            // Mouse events
            button.addEventListener('mousedown', (e) => {
                e.preventDefault();
                this.startContinuousScroll(button, scrollSpeed);
            });

            button.addEventListener('mouseup', this.stopContinuousScroll.bind(this));
            button.addEventListener('mouseleave', this.stopContinuousScroll.bind(this));

            // Touch events
            button.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.startContinuousScroll(button, scrollSpeed);
            });

            button.addEventListener('touchend', this.stopContinuousScroll.bind(this));
            button.addEventListener('touchcancel', this.stopContinuousScroll.bind(this));

            button.setAttribute('data-continuous-added', 'true');
        },

        startContinuousScroll(button, speed) {
            if (this.scrollInterval) return;

            const swiper = this.getSwiperFromButton(button);
            if (!swiper) return;

            // İlk kaydırmayı hemen yap
            swiper.slideNext();

            // Interval ile devam et
            this.scrollInterval = setInterval(() => {
                if (swiper && !swiper.destroyed) {
                    swiper.slideNext();
                } else {
                    this.stopContinuousScroll();
                }
            }, speed);

            // Visual feedback
            button.classList.add('swiper-button-scrolling');
            button.style.opacity = '0.7';
        },

        stopContinuousScroll() {
            if (this.scrollInterval) {
                clearInterval(this.scrollInterval);
                this.scrollInterval = null;
            }

            // Visual feedback'i kaldır
            document.querySelectorAll('.swiper-button-scrolling').forEach(btn => {
                btn.classList.remove('swiper-button-scrolling');
                btn.style.opacity = '';
            });
        },

        getSwiperFromButton(button) {
            // Swiper container'ını bul
            const swiperContainer = button.closest('.swiper') ||
                button.closest('[class*="swiper"]') ||
                button.parentElement.querySelector('.swiper');

            if (swiperContainer && swiperContainer.swiper) {
                return swiperContainer.swiper;
            }

            // Global swiper instances'ını kontrol et
            if (window.swiperInstances) {
                for (let swiper of window.swiperInstances) {
                    if (swiper.el && swiper.el.contains(button)) {
                        return swiper;
                    }
                }
            }

            return null;
        },

        setupObserver() {
            new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1) {
                            const buttons = node.matches?.('.swiper-button-next') ? [node] :
                                node.querySelectorAll?.('.swiper-button-next') || [];

                            buttons.forEach(button => {
                                this.addContinuousScroll(button);
                            });
                        }
                    });
                });
            }).observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    };

    // CSS için stil ekleme - EKLENEN KISIM
    const addContinuousScrollStyles = () => {
        const style = document.createElement('style');
        style.textContent = `
      .swiper-button-next.swiper-button-scrolling {
        background-color: rgba(255, 64, 1, 0.2) !important;
        transform: scale(0.95);
        transition: all 0.1s ease;
      }
      
      .swiper-button-next:active {
        transform: scale(0.9);
      }
    `;
        document.head.appendChild(style);
    };

    // Önceki remover'lar (LastBetsRemover, CryptoElementsRemover, TickerRemover)
    // ... (önceki kodlar aynen kalacak)

    // Route Manager - Güncellenmiş
    const RouteManager = {
        currentPath: null,

        async handleRouteChange() {
            const path = window.location.pathname;
            if (path === this.currentPath) return;

            this.currentPath = path;
            this.cleanupComponents();

            // Remover'ları tetikle
            // ... (önceki remover çağrıları)

            // Swiper continuous scroll'u yeniden başlat - EKLENEN KISIM
            setTimeout(() => {
                SwiperContinuousScroll.setupContinuousScroll();
            }, 1000);

            const routeConfig = this.getRouteConfig(path);
            await this.initializeRoute(routeConfig);
        },

        // ... diğer methodlar
    };

    // Main Initialization - Güncellenmiş
    class App {
        constructor() {
            this.isInitialized = false;
        }

        async init() {
            if (this.isInitialized) return;

            try {
                // Stilleri ekle - EKLENEN KISIM
                addContinuousScrollStyles();

                // Remover'ları başlat
                // ... (önceki remover init'leri)

                // Swiper continuous scroll'u başlat - EKLENEN KISIM
                SwiperContinuousScroll.init();

                // Kaynakları yükle
                await ResourceManager.loadAll();

                // Interceptor'ları başlat
                XHRInterceptor.init();

                // Sayfa değişikliklerini dinle
                this.setupEventListeners();

                // İlk route'u işle
                await RouteManager.handleRouteChange();

                this.isInitialized = true;
                console.log('App initialized with continuous scroll');
            } catch (error) {
                console.error('App initialization failed:', error);
            }
        }

        setupEventListeners() {
            // ... önceki event listener'lar
        }
    }

    // Uygulamayı başlat
    const app = new App();

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => app.init());
    } else {
        app.init();
    }

})();