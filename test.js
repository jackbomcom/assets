(() => {
    'use strict';

    // Configuration - Tüm ayarlar merkezi bir yerde
    const CONFIG = {
        resources: {
            swiper: 'https://cdnjs.cloudflare.com/ajax/libs/Swiper/11.0.5/swiper-bundle.min.js',
            swiperCSS: 'https://cdnjs.cloudflare.com/ajax/libs/Swiper/11.0.5/swiper-bundle.min.css',
            fontAwesome: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.1/css/all.min.css',
            googleFonts: 'https://fonts.googleapis.com/css2?family=Karla:ital,wght@0,200..800;1,200..800&display=swap'
        },
        images: {
            promo: "https://jackbomcom.github.io/assets/images/gztmvqp41k935xns.webp",
            live: "https://jackbomcom.github.io/assets/images/xkwtqza58m249vbc.webp",
            howto: "https://jackbomcom.github.io/assets/images/howtobg1.png",
            // Diğer resimler buraya...
        },
        urls: {
            telegramChannel: "https://t.me/jackbomtr",
            whatsappSupport: "https://api.whatsapp.com/send/?phone=33753456653",
            liveTV: "https://jackbomtv8.com",
            // Diğer URL'ler buraya...
        }
    };

    // Language Manager
    const LanguageManager = {
        strings: {
            tr: {
                telegramChannel: "Telegram Kanalı",
                promotions: "Promosyonlar",
                howToInvest: "Nasıl Yatırım Yaparım?",
                backButton: "Geri"
            },
            en: {
                telegramChannel: "Telegram Channel",
                promotions: "Promotions",
                howToInvest: "How To Invest?",
                backButton: "Back"
            }
            // Diğer diller...
        },

        get(key) {
            const lang = window.localStorage.language || 'en';
            return this.strings[lang]?.[key] || this.strings.en[key] || key;
        },

        getAll() {
            const lang = window.localStorage.language || 'en';
            return this.strings[lang] || this.strings.en;
        }
    };

    // Utility Functions
    const Utils = {
        // Debounce fonksiyonu - performans için
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

        // Throttle fonksiyonu
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

        // Safe JSON parse
        safeJsonParse(str, defaultValue = {}) {
            try {
                return JSON.parse(str);
            } catch {
                return defaultValue;
            }
        },

        // Element oluşturma helper'ı
        createElement(tag, attributes = {}, children = []) {
            const element = document.createElement(tag);
            Object.assign(element, attributes);
            children.forEach(child => {
                if (typeof child === 'string') {
                    element.appendChild(document.createTextNode(child));
                } else {
                    element.appendChild(child);
                }
            });
            return element;
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

        async waitForValue(selector, timeout = 5000) {
            return new Promise((resolve, reject) => {
                const checkValue = () => {
                    const element = document.querySelector(selector);
                    if (element && element.value) {
                        resolve(element);
                    }
                };

                checkValue();

                const observer = new MutationObserver(checkValue);
                observer.observe(document.body, {
                    childList: true,
                    subtree: true,
                    characterData: true
                });

                setTimeout(() => {
                    observer.disconnect();
                    reject(new Error(`Value for ${selector} not found within ${timeout}ms`));
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

    // Component Base Class
    class Component {
        constructor() {
            this.id = `custom-section-${Math.random().toString(36).substr(2, 9)}`;
        }

        async init() {
            // Override in child classes
        }

        cleanup() {
            const element = document.getElementById(this.id);
            if (element) element.remove();
        }

        async waitForDependencies() {
            // Override if needed
        }
    }

    // Sidebar Component
    class SidebarComponent extends Component {
        async init(isMobile, isHomePage, isUserLoggedIn) {
            await StateManager.executeIfNotProcessing('sidebar', async () => {
                this.cleanup();
                await this.customizeSidebar(isMobile, isHomePage, isUserLoggedIn);
            });
        }

        async customizeSidebar(isMobile, isHomePage, isUserLoggedIn) {
            try {
                DOMHelper.removeElements(['.sidebar .custom', '.header .custom']);

                const menuItems = this.generateMenuItems();
                const sidebarHtml = this.generateSidebarHtml(isMobile, isUserLoggedIn, menuItems);

                await this.injectSidebarElements(sidebarHtml, isMobile);
                this.attachEventListeners(isMobile, isHomePage);
            } catch (error) {
                console.error('Sidebar customization error:', error);
            }
        }

        generateMenuItems() {
            return [
                { name: LanguageManager.get('telegramChannel'), url: CONFIG.urls.telegramChannel, icon: 'fa-brands fa-telegram' },
                // Diğer menu item'ları...
            ];
        }

        generateSidebarHtml(isMobile, isUserLoggedIn, menuItems) {
            // HTML generation logic buraya...
            return {
                bigLinks: `<div>...</div>`,
                menu: `<div>...</div>`,
                headerButtons: `<div>...</div>`
            };
        }

        async injectSidebarElements(html, isMobile) {
            // DOM injection logic buraya...
        }

        attachEventListeners(isMobile, isHomePage) {
            // Event listener'lar buraya...
        }
    }

    // Main Slider Component
    class MainSliderComponent extends Component {
        async init(isMobile) {
            await StateManager.executeIfNotProcessing('mainSlider', async () => {
                this.cleanup();
                await this.initializeSlider(isMobile);
            });
        }

        async initializeSlider(isMobile) {
            try {
                const language = window.localStorage.language;
                const sliderItems = await this.getSliderItems(language);
                const sliderHtml = this.generateSliderHtml(sliderItems);

                await this.injectSlider(sliderHtml, isMobile);
                this.initializeSwiper(isMobile);
            } catch (error) {
                console.error('Main slider initialization error:', error);
            }
        }

        async getSliderItems(language) {
            if (!window.sliderItems) window.sliderItems = {};

            if (!window.sliderItems[language]) {
                await DOMHelper.waitForElement('#main-slider .mySwiper');
                const slider = document.querySelector('#main-slider .mySwiper').swiper;
                window.sliderItems[language] = this.processSliderItems(slider.slides);
            }

            return window.sliderItems[language];
        }

        processSliderItems(slides) {
            return [...slides]
                .map(slide => this.cleanSlideHtml(slide.innerHTML))
                .sort((a, b) => (b.dataset?.swiperSlideIndex || 0) - (a.dataset?.swiperSlideIndex || 0));
        }

        cleanSlideHtml(html) {
            return html
                .replace(/href="\/[a-z]{2}https/g, 'href="https')
                .replace('<a href="', '<a target="_blank" href=');
        }

        generateSliderHtml(sliderItems) {
            return `
        <div id="${this.id}" class="section custom-section">
          <div class="container">
            <div class="swiper">
              <div class="swiper-wrapper">
                ${sliderItems.map(item => `
                  <div class="swiper-slide">${item}</div>
                `).join('')}
              </div>
              <div class="swiper-button-next"></div>
              <div class="swiper-button-prev"></div>
            </div>
            <div class="swiper-pagination"></div>
          </div>
        </div>
      `;
        }

        async injectSlider(html, isMobile) {
            const mainContent = await DOMHelper.waitForElement('#main__content');
            mainContent.insertAdjacentHTML('afterbegin', html);
        }

        initializeSwiper(isMobile) {
            new Swiper(`#${this.id} .swiper`, {
                loop: true,
                autoplay: { delay: 3000 },
                slidesPerView: isMobile ? 1.2 : 2,
                spaceBetween: isMobile ? 15 : 20,
                pagination: { el: `.swiper-pagination` },
                navigation: {
                    prevEl: `.swiper-button-prev`,
                    nextEl: `.swiper-button-next`
                }
            });
        }
    }

    // Component Registry
    const ComponentRegistry = {
        components: new Map(),

        register(name, componentClass) {
            this.components.set(name, componentClass);
        },

        async getComponent(name) {
            if (!this.components.has(name)) {
                throw new Error(`Component ${name} not registered`);
            }
            return this.components.get(name);
        },

        async initComponent(name, ...args) {
            const ComponentClass = await this.getComponent(name);
            const instance = new ComponentClass();
            await instance.init(...args);
            return instance;
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

            const routeConfig = this.getRouteConfig(path);
            await this.initializeRoute(routeConfig);
        },

        getRouteConfig(path) {
            const configs = {
                '/': {
                    type: 'homepage',
                    components: ['sidebar', 'mainSlider', 'vipStatus', 'gamesLanding', 'gridBoxes']
                },
                '/promotions': {
                    type: 'promo',
                    components: ['sidebar']
                },
                // Diğer route'lar...
            };

            return configs[path] || { type: 'default', components: ['sidebar'] };
        },

        async initializeRoute(routeConfig) {
            const { isMobile, isUserLoggedIn } = await this.getEnvironmentInfo();

            for (const componentName of routeConfig.components) {
                try {
                    const instance = await ComponentRegistry.initComponent(
                        componentName,
                        isMobile,
                        routeConfig.type === 'homepage',
                        isUserLoggedIn
                    );
                    this.components.set(componentName, instance);
                } catch (error) {
                    console.warn(`Failed to initialize ${componentName}:`, error);
                }
            }
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

    // Analytics Manager
    const AnalyticsManager = {
        init() {
            this.loadGoogleAnalytics();
            this.loadGoSquared();
        },

        loadGoogleAnalytics() {
            const script = document.createElement('script');
            script.async = true;
            script.src = 'https://www.googletagmanager.com/gtag/js?id=G-EWGHJ0DHF1';
            script.onload = () => {
                window.dataLayer = window.dataLayer || [];
                function gtag(){ dataLayer.push(arguments); }
                gtag('js', new Date());
                gtag('config', 'G-EWGHJ0DHF1');
            };
            document.head.appendChild(script);
        },

        loadGoSquared() {
            const script = document.createElement('script');
            script.src = '//d1l6p2sc9645hc.cloudfront.net/gosquared.js';
            script.async = true;
            script.onload = () => {
                window._gs = window._gs || function() { (window._gs.q = window._gs.q || []).push(arguments); };
                _gs('GSN-473767-R');
                _gs('set', 'anonymizeIP', true);
            };
            document.head.appendChild(script);
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
                // Component'leri kaydet
                ComponentRegistry.register('sidebar', SidebarComponent);
                ComponentRegistry.register('mainSlider', MainSliderComponent);
                // Diğer component'leri kaydet...

                // Kaynakları yükle
                await ResourceManager.loadAll();

                // Interceptor'ları başlat
                XHRInterceptor.init();

                // Analytics'i başlat
                AnalyticsManager.init();

                // Sayfa değişikliklerini dinle
                this.setupEventListeners();

                // İlk route'u işle
                await RouteManager.handleRouteChange();

                this.isInitialized = true;
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