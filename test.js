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
        // ... diğer config ayarları
    };

    // Crypto Elements Remover - EKLENEN KISIM
    const CryptoElementsRemover = {
        selectors: [
            '[data-code="BTCUSD"]',
            '[data-code="ETHUSD"]',
            '[data-code="BNBUSD"]',
            '[data-code="SOLUSD"]',
            '[data-code="LTCUSD"]',
            // İhtiyaca göre diğer crypto pair'leri ekleyin
        ],

        init() {
            this.removeExisting();
            this.setupObserver();
            console.log('Crypto elements remover initialized');
        },

        removeExisting() {
            let totalRemoved = 0;

            this.selectors.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    element.remove();
                    totalRemoved++;
                });

                if (elements.length > 0) {
                    console.log(`Removed ${elements.length} elements with selector: ${selector}`);
                }
            });

            if (totalRemoved > 0) {
                console.log(`Total crypto elements removed: ${totalRemoved}`);
            }
        },

        setupObserver() {
            new MutationObserver((mutations) => {
                let removedCount = 0;

                mutations.forEach(mutation => {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) {
                            this.selectors.forEach(selector => {
                                const elements = node.matches?.(selector) ? [node] : node.querySelectorAll?.(selector);
                                if (elements) {
                                    elements.forEach(element => {
                                        element.remove();
                                        removedCount++;
                                    });
                                }
                            });
                        }
                    });
                });

                if (removedCount > 0) {
                    console.log(`Dynamically removed ${removedCount} crypto elements`);
                }
            }).observe(document.body, {
                childList: true,
                subtree: true
            });
        },

        // Yeni selector ekleme imkanı
        addSelector(selector) {
            if (!this.selectors.includes(selector)) {
                this.selectors.push(selector);
                this.removeExisting(); // Yeni selector için hemen temizlik yap
            }
        }
    };

    // Last Bets Remover - Önceki kod
    const LastBetsRemover = {
        init() {
            this.removeExisting();
            this.setupObserver();
        },

        removeExisting() {
            const element = document.getElementById('last-bets-wrapper');
            if (element) {
                element.remove();
                console.log('Last bets wrapper removed');
            }
        },

        setupObserver() {
            new MutationObserver(() => {
                this.removeExisting();
            }).observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    };

    // Utility Functions
    const Utils = {
        debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },

        throttle(func, limit) {
            let inThrottle;
            return function(...args) {
                if (!inThrottle) {
                    func.apply(this, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        },

        safeJsonParse(str, defaultValue = {}) {
            try {
                return JSON.parse(str);
            } catch {
                return defaultValue;
            }
        }
    };

    // DOM Helper
    const DOMHelper = {
        async waitForElement(selector, timeout = 5000) {
            return new Promise((resolve, reject) => {
                const element = document.querySelector(selector);
                if (element) return resolve(element);

                const observer = new MutationObserver(() => {
                    const element = document.querySelector(selector);
                    if (element) {
                        observer.disconnect();
                        resolve(element);
                    }
                });

                observer.observe(document.body, {
                    childList: true,
                    subtree: true
                });

                setTimeout(() => {
                    observer.disconnect();
                    reject(new Error(`Element ${selector} not found within ${timeout}ms`));
                }, timeout);
            });
        },

        removeElements(selectors) {
            selectors.forEach(selector => {
                document.querySelectorAll(selector).forEach(el => el.remove());
            });
        }
    };

    // State Manager
    const StateManager = {
        processing: new Set(),

        isProcessing(key) {
            return this.processing.has(key);
        },

        startProcessing(key) {
            this.processing.add(key);
        },

        endProcessing(key) {
            this.processing.delete(key);
        },

        async executeIfNotProcessing(key, fn) {
            if (this.isProcessing(key)) return;

            this.startProcessing(key);
            try {
                await fn();
            } finally {
                this.endProcessing(key);
            }
        }
    };

    // XHR Interceptor
    const XHRInterceptor = {
        init() {
            try {
                const originalOpen = XMLHttpRequest.prototype.open;
                const originalSend = XMLHttpRequest.prototype.send;
                let lastPathname = window.location.pathname;

                XMLHttpRequest.prototype.open = function(method, url, ...rest) {
                    this._url = url;
                    this._method = method;

                    XHRInterceptor.handleUrlChange(url, window.location.pathname, lastPathname);
                    lastPathname = window.location.pathname;

                    return originalOpen.apply(this, [method, url, ...rest]);
                };

                XMLHttpRequest.prototype.send = function(...args) {
                    this.addEventListener('readystatechange', () => {
                        if (this.readyState === 4 && this._url.includes('state/')) {
                            XHRInterceptor.handleStateResponse(this);
                        }
                    });
                    return originalSend.apply(this, args);
                };
            } catch (error) {
                console.error('XHR Interceptor error:', error);
            }
        },

        handleUrlChange(url, currentPath, lastPath) {
            if (url.includes('verify')) {
                DOMHelper.waitForElement('header #dropdownUser')
                    .then(() => RouteManager.handleRouteChange());
            }
            if (url.includes('logout')) {
                DOMHelper.waitForElement('header .header__signin')
                    .then(() => RouteManager.handleRouteChange());
            }
            if (currentPath !== lastPath) {
                RouteManager.handleRouteChange();
            }
        },

        handleStateResponse(xhr) {
            if (!window.userVipState?.length) {
                try {
                    const response = Utils.safeJsonParse(xhr.responseText);
                    window.userVipState = response.data;
                } catch (error) {
                    console.warn('Failed to parse state response:', error);
                }
            }
        }
    };

    // Route Manager
    const RouteManager = {
        currentPath: null,
        components: new Map(),

        async handleRouteChange() {
            const path = window.location.pathname;
            if (path === this.currentPath) return;

            this.currentPath = path;
            this.cleanupComponents();

            // Hem last bets hem de crypto elementleri temizle - EKLENEN KISIM
            LastBetsRemover.removeExisting();
            CryptoElementsRemover.removeExisting();

            const routeConfig = this.getRouteConfig(path);
            await this.initializeRoute(routeConfig);
        },

        getRouteConfig(path) {
            const configs = {
                '/': {
                    type: 'homepage',
                    components: ['sidebar', 'mainSlider']
                },
                // ... diğer route config'leri
            };

            return configs[path] || { type: 'default', components: ['sidebar'] };
        },

        async initializeRoute(routeConfig) {
            const { isMobile, isUserLoggedIn } = await this.getEnvironmentInfo();

            // Component initialization logic buraya...
        },

        async getEnvironmentInfo() {
            await DOMHelper.waitForElement('header .header__actions');
            return {
                isMobile: window.innerWidth < 768,
                isUserLoggedIn: !!document.querySelector('header #dropdownUser')
            };
        },

        cleanupComponents() {
            this.components.forEach(component => component.cleanup());
            this.components.clear();
            DOMHelper.removeElements(['.custom-section']);
        }
    };

    // Resource Manager
    const ResourceManager = {
        loaded: new Set(),

        async loadCSS(href) {
            if (this.loaded.has(href)) return Promise.resolve();

            return new Promise((resolve, reject) => {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = href;
                link.onload = () => {
                    this.loaded.add(href);
                    resolve();
                };
                link.onerror = reject;
                document.head.appendChild(link);
            });
        },

        async loadScript(src) {
            if (this.loaded.has(src)) return Promise.resolve();

            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = src;
                script.async = true;
                script.onload = () => {
                    this.loaded.add(src);
                    resolve();
                };
                script.onerror = reject;
                document.head.appendChild(script);
            });
        },

        async loadAll() {
            try {
                await Promise.all([
                    this.loadCSS(CONFIG.resources.googleFonts),
                    this.loadCSS(CONFIG.resources.swiperCSS),
                    this.loadCSS(CONFIG.resources.fontAwesome),
                    this.loadScript(CONFIG.resources.swiper)
                ]);
            } catch (error) {
                console.warn('Resource loading warning:', error);
            }
        }
    };

    // Main Initialization
    class App {
        constructor() {
            this.isInitialized = false;
        }

        async init() {
            if (this.isInitialized) return;

            try {
                // Tüm remover'ları başlat - EKLENEN KISIM
                LastBetsRemover.init();
                CryptoElementsRemover.init();

                // Kaynakları yükle
                await ResourceManager.loadAll();

                // Interceptor'ları başlat
                XHRInterceptor.init();

                // Sayfa değişikliklerini dinle
                this.setupEventListeners();

                // İlk route'u işle
                await RouteManager.handleRouteChange();

                this.isInitialized = true;
                console.log('App initialized successfully with crypto elements remover');
            } catch (error) {
                console.error('App initialization failed:', error);
            }
        }

        setupEventListeners() {
            // Dil değişikliklerini dinle
            const originalSetItem = localStorage.setItem;
            localStorage.setItem = function(key, value) {
                originalSetItem.apply(this, arguments);
                if (key === 'language') {
                    RouteManager.handleRouteChange();
                }
            };

            // Resize event'ini throttle et
            window.addEventListener('resize', Utils.throttle(() => {
                RouteManager.handleRouteChange();
            }, 250));
        }
    }

    // Uygulamayı başlat
    const app = new App();

    // DOM hazır olduğunda başlat
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => app.init());
    } else {
        app.init();
    }

})();