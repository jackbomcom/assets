(() => {
    'use strict';

    // Enhanced Crypto Elements Remover - GÜNCELLENMİŞ
    const CryptoElementsRemover = {
        selectors: [
            '[data-code="BTCUSD"]',
            '[data-code="ETHUSD"]',
            '[data-code="BNBUSD"]',
            '[data-code="SOLUSD"]',
            '[data-code="ADAUSD"]',
            '[data-code="XRPUSD"]',
            '[data-code="DOTUSD"]',
            '[data-code="DOGEUSD"]',
            '[data-code*="USD"]', // Tüm USD pair'leri
            '.ticker-card',
            '.ticker-header',
            '.ticker-title',
            '.instrument-icon-wrapper',
            '.ticker-symbol',
            '.ticker-change',
            '.ticker-price',
            '.ticker-sub',
            '[class*="crypto"]',
            '[class*="ticker"]'
        ],

        init() {
            console.log('Enhanced Crypto Elements Remover initialized');
            this.aggressiveRemove();
            this.setupAggressiveObserver();
            this.setupPeriodicCleanup();

            // Sayfa yüklendikten sonra birkaç kez daha temizlik yap
            setTimeout(() => this.aggressiveRemove(), 1000);
            setTimeout(() => this.aggressiveRemove(), 3000);
        },

        aggressiveRemove() {
            let totalRemoved = 0;

            // 1. Selector-based removal
            this.selectors.forEach(selector => {
                try {
                    const elements = document.querySelectorAll(selector);
                    elements.forEach(element => {
                        element.remove();
                        totalRemoved++;
                    });
                } catch (e) {
                    console.warn('Error removing elements with selector:', selector, e);
                }
            });

            // 2. Text-based removal (fallback)
            this.removeByTextContent();

            // 3. Section-based removal
            this.removeCryptoSections();

            if (totalRemoved > 0) {
                console.log(`Aggressive removal: ${totalRemoved} elements removed`);
            }
        },

        removeByTextContent() {
            const cryptoKeywords = ['BTC', 'ETH', 'BNB', 'SOL', 'ADA', 'XRP', 'DOT', 'DOGE', 'Kaldıraç'];

            cryptoKeywords.forEach(keyword => {
                const xpath = `//*[contains(text(), '${keyword}')]`;
                const elements = document.evaluate(xpath, document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);

                for (let i = 0; i < elements.snapshotLength; i++) {
                    const element = elements.snapshotItem(i);
                    if (element && element.parentElement) {
                        element.remove();
                    }
                }
            });
        },

        removeCryptoSections() {
            const sections = document.querySelectorAll('section, div, span');

            sections.forEach(section => {
                const text = section.textContent || '';
                if (text.includes('BTC') || text.includes('ETH') || text.includes('Kaldıraç')) {
                    section.remove();
                }
            });
        },

        setupAggressiveObserver() {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1) {
                            // Hızlı kontrol
                            if (this.isCryptoNode(node)) {
                                node.remove();
                                return;
                            }

                            // Detaylı kontrol
                            this.selectors.forEach(selector => {
                                const elements = node.matches?.(selector) ? [node] : node.querySelectorAll?.(selector);
                                if (elements) {
                                    elements.forEach(element => element.remove());
                                }
                            });
                        }
                    });
                });

                // Her mutation'dan sonra ek temizlik
                setTimeout(() => this.aggressiveRemove(), 50);
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['data-code', 'class', 'style']
            });
        },

        isCryptoNode(node) {
            if (!node.matches) return false;

            return this.selectors.some(selector => node.matches(selector)) ||
                (node.textContent && (
                    node.textContent.includes('BTC') ||
                    node.textContent.includes('ETH') ||
                    node.textContent.includes('Kaldıraç')
                ));
        },

        setupPeriodicCleanup() {
            // Her 1 saniyede bir temizlik
            setInterval(() => {
                this.aggressiveRemove();
            }, 1000);
        }
    };

    // Diğer remover'lar...
    const TickerRemover = {
        // ... önceki kod
    };

    const LastBetsRemover = {
        // ... önceki kod
    };

    // Main App - GÜNCELLENMİŞ
    class App {
        constructor() {
            this.isInitialized = false;
        }

        async init() {
            if (this.isInitialized) return;

            try {
                // ÖNCE crypto remover'ı başlat - ÖNEMLİ!
                CryptoElementsRemover.init();

                // Sonra diğer remover'lar
                TickerRemover.init();
                LastBetsRemover.init();

                // Kaynakları yükle
                await ResourceManager.loadAll();

                console.log('App initialized with enhanced crypto removal');
                this.isInitialized = true;
            } catch (error) {
                console.error('App initialization failed:', error);
            }
        }
    }

    // Hemen başlat
    const app = new App();

    // DOM hazır olmasını beklemeden başlat
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => app.init());
    } else {
        app.init();
    }

    // Sayfa tamamen yüklendikten sonra ek temizlik
    window.addEventListener('load', () => {
        setTimeout(() => CryptoElementsRemover.aggressiveRemove(), 1000);
        setTimeout(() => CryptoElementsRemover.aggressiveRemove(), 3000);
    });

})();