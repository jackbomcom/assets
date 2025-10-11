(() => {
    (() => {
        try {
            const originalXHROpen = XMLHttpRequest.prototype.open;
            const originalXHRSend = XMLHttpRequest.prototype.send;
            let lastPathname = window.location.pathname;

            XMLHttpRequest.prototype.open = function (method, url, ...rest) {
                this._url = url;
                this._method = method;
                const currentPathname = window.location.pathname;

                if (url.includes("verify")) {
                    waitForElement("header #dropdownUser").then(() => handleRouteChange());
                }
                if (url.includes("logout")) {
                    waitForElement("header .header__signin").then(() => handleRouteChange());
                }
                if (currentPathname !== lastPathname) {
                    lastPathname = currentPathname;
                    handleRouteChange();
                }
                return originalXHROpen.apply(this, [method, url, ...rest]);
            };

            XMLHttpRequest.prototype.send = function (...args) {
                /*
                this.addEventListener('readystatechange', function () {
                  if (this.readyState === 4 && this._url.includes('/user') && document.querySelectorAll('input[data-user]').length === 0) {
                    const response = JSON.parse(this.responseText);
                    const username = response.data.username;

                    const input = document.createElement('input');
                    input.type = 'hidden';
                    input.setAttribute('data-user', username);
                    document.body.appendChild(input);
                  }
                });
                this.addEventListener('readystatechange', function () {
                  if (this.readyState === 4 && this._url.includes('/sliders/') && document.querySelectorAll(`input[data-sliders-${window.localStorage.language}]`).length === 0) {
                    const response = JSON.parse(this.responseText);
                    const sliders = response.data.sliders;

                    const input = document.createElement('input');
                    input.type = 'hidden';
                    input.setAttribute(`data-sliders-${window.localStorage.language}`, JSON.stringify(sliders));
                    document.body.appendChild(input);
                  }
                });
                */
                this.addEventListener("readystatechange", function () {
                    if (this.readyState === 4 && this._url.includes("state/") && !(window.userVipState && window.userVipState.length)) {
                        const response = JSON.parse(this.responseText);
                        const state = response.data;

                        window.userVipState = state;
                    }
                });
                return originalXHRSend.apply(this, args);
            };
        } catch (error) {
            console.error(error);
        }
    })();

    const loadResource = (type, src) =>
        new Promise((resolve, reject) => {
            const element = document.createElement(type === "script" ? "script" : "link");
            Object.assign(
                element,
                type === "script"
                    ? {
                        src,
                        type: "text/javascript",
                        onload: resolve,
                        onerror: reject,
                    }
                    : {
                        href: src,
                        rel: "stylesheet",
                        onload: resolve,
                        onerror: reject,
                    }
            );
            document.head.appendChild(element);
        });

    const waitForElement = (selector, length = 0) =>
        new Promise((resolve) => {
            const checkExist = () => ($(selector).length > length ? resolve($(selector)) : setTimeout(checkExist, 100));
            checkExist();
        });

    const waitForValue = (selector, length = 0) =>
        new Promise((resolve) => {
            const checkExist = () => ($(selector).length > length && $(selector).val() !== "" ? resolve($(selector)) : setTimeout(checkExist, 100));
            checkExist();
        });

    const waitForSwiper = (selector, language) =>
        new Promise((resolve) => {
            const checkExist = () => {
                const element = $(selector)[0];
                if (element && element.swiper && element.swiper.slides && element.swiper.slides.length) {
                    const sliderItems = element.swiper.slides;
                    if (sliderItems.length > 2 && (!language || $(sliderItems[0]).find("a").attr("href").includes(`/${language}`))) {
                        return resolve(sliderItems);
                    }
                }
                setTimeout(checkExist, 100);
            };
            checkExist();
        });

    // Id: 0 (Sidebar customization)
    let isProcessingCustomizeSidebar = false;
    const customizeSidebar = async (isMobile, isHomePage, isUserLoggedIn) => {
        if (isProcessingCustomizeSidebar) return;
        isProcessingCustomizeSidebar = true;

        try {
            if ($(".sidebar .custom, .header .custom").length) $(".sidebar .custom, .header .custom").remove();

            const promoImage = "https://jackbomcom.github.io/assets/images/gztmvqp41k935xns.webp";
            const liveImage = "https://jackbomcom.github.io/assets/images/xkwtqza58m249vbc.webp";
            const howtoImage = "https://jackbomcom.github.io/assets/images/howtobg1.png";
            const promoActiveClass = window.location.pathname.includes("promotion") ? "passive" : "";
            const liveActiveClass = window.location.pathname.includes("live-casino") ? "passive" : "";
            const language = window.localStorage.language;

            const langMap = {
                tr: {
                    telegramChannel: "Telegram Kanalı",
                    telegramSupport: "Telegram Destek",
                    whatsappSupport: "WhatsApp Destek",
                    liveTV: "Jackbom Canlı TV",
                    mobileApp: "Mobil Uygulama",
                    promotions: "Promosyonlar",
                    howToInvest: "Nasıl Yatırım Yaparım?",
                    bigWins: "Büyük Kazançlar",
                    new: "Yeni",
                    live: "Live",
                },
                en: {
                    telegramChannel: "Telegram Channel",
                    telegramSupport: "Telegram Support",
                    whatsappSupport: "WhatsApp Support",
                    liveTV: "Jackbom Live TV",
                    mobileApp: "Mobile Application",
                    promotions: "Promotions",
                    howToInvest: "How To Invest?",
                    bigWins: "Big Wins",
                    new: "New",
                    live: "Live",
                },
                ru: {
                    telegramChannel: "Канал В Telegram",
                    telegramSupport: "Поддержка В Telegram",
                    whatsappSupport: "Поддержка В WhatsApp",
                    liveTV: "Jackbom ТВ В Прямом Эфире",
                    mobileApp: "Мобильное Приложение",
                    promotions: "Акции",
                    howToInvest: "Как Инвестировать?",
                    bigWins: "Большие Выигрыши",
                    new: "Новый",
                    live: "Живой",
                },
                fr: {
                    telegramChannel: "Chaîne Telegram",
                    telegramSupport: "Support Telegram",
                    whatsappSupport: "Support WhatsApp",
                    liveTV: "Jackbom TV En Direct",
                    mobileApp: "Application Mobile",
                    promotions: "Promotions",
                    howToInvest: "Comment Investir?",
                    bigWins: "Gros Gains",
                    new: "Nouveau",
                    live: "En Direct",
                },
                ch: {
                    telegramChannel: "电报频道",
                    telegramSupport: "电报支持",
                    whatsappSupport: "WhatsApp 支持",
                    liveTV: "Jackbom 直播电视",
                    mobileApp: "移动应用",
                    promotions: "促销",
                    howToInvest: "如何投资？",
                    bigWins: "大赢家",
                    new: "新的",
                    live: "直播",
                },
                it: {
                    telegramChannel: "Canale Telegram",
                    telegramSupport: "Supporto Telegram",
                    whatsappSupport: "Supporto WhatsApp",
                    liveTV: "Jackbom TV In Diretta",
                    mobileApp: "Applicazione Mobile",
                    promotions: "Promozioni",
                    howToInvest: "Come Investire?",
                    bigWins: "Grandi Vincite",
                    new: "Nuovo",
                    live: "Dal Vivo",
                },
                ar: {
                    telegramChannel: "قناة تيليجرام",
                    telegramSupport: "دعم تيليجرام",
                    whatsappSupport: "دعم واتساب",
                    liveTV: "جاكبوم تلفزيون مباشر",
                    mobileApp: "تطبيق الهاتف المحمول",
                    promotions: "عروض ترويجية",
                    howToInvest: "كيف تستثمر؟",
                    bigWins: "أرباح كبيرة",
                    new: "جديد",
                    live: "مباشر",
                },
            };

            const menuItems = [
                {
                    name: "Instagram",
                    url: "https://www.instagram.com/jackbomresmi",
                    icon: "fa-brands fa-instagram",
                },
                {
                    name: "Twitter",
                    url: "https://x.com/jackbom_tr",
                    icon: "fa-brands fa-x-twitter",
                },
                {
                    name: "YouTube",
                    url: "https://www.youtube.com/@Jackbomyt",
                    icon: "fa-brands fa-youtube",
                },
                {
                    name: langMap[language].telegramChannel,
                    url: "https://t.me/jackbomtr",
                    icon: "fa-brands fa-telegram",
                },
                {
                    name: langMap[language].whatsappSupport,
                    url: "https://api.whatsapp.com/send/?phone=33753456653&text&type=phone_number&app_absent=0",
                    icon: "fa-brands fa-whatsapp",
                },
                {
                    name: langMap[language].telegramSupport,
                    url: "https://t.me/+37258520425",
                    icon: "fa-brands fa-telegram",
                },
                {
                    name: langMap[language].liveTV,
                    url: `https://jackbomtv8.com`,
                    icon: "fa-solid fa-circle-play",
                },
                {
                    name: langMap[language].mobileApp,
                    url: "https://jackbom.app",
                    icon: "fa-solid fa-mobile-screen",
                },
            ];

            const sidebarBigLinksHtml = `
        <div class="sidebar__links custom custom-promo">
          <a class="sidebar__link sidebar__link--casino w-100 ${promoActiveClass} promo-${isMobile ? "mobile" : "desktop"}" href="javascript:void(0);" style="background: url(&quot;${promoImage}&quot;) left center / cover no-repeat;">
            <span>${langMap[language].promotions}</span>
          </a>
          ${
                isMobile
                    ? `
          <a class="sidebar__link sidebar__link--casino w-100 howto-${isMobile ? "mobile" : "desktop"}" href="javascript:void(0);" style="background: url(&quot;${howtoImage}&quot;) left center / cover no-repeat;">
            <span>${langMap[language].howToInvest}</span>
          </a>
          `
                    : ""
            }
        </div>
      `;

            const sidebarSingleBigLinkHtml = `
        <a class="sidebar__link sidebar__link--casino ${liveActiveClass} custom custom-live" href="javascript:void(0);" style="background: url(&quot;${liveImage}&quot;) left center / cover no-repeat;">
          <span>${langMap[language].live}</span>
        </a>
      `;

            const sidebarSmallLinksHtml = `
        <a class="sidebar__link-small custom custom-promo sidebar__link-small--purple ${promoActiveClass}" href="javascript:void(0);" style="background: url(&quot;${promoImage}&quot;) left center / cover no-repeat;"></a>
      `;

            const sidebarSingleSmallLinkHtml = `
        <a class="sidebar__link-small custom custom-live sidebar__link-small--purple ${liveActiveClass}" href="javascript:void(0);" style="background: url(&quot;${liveImage}&quot;) left center / cover no-repeat;"></a>
      `;

            const sidebarMenuHtml = `
        <div class="sidebar__menu custom">
          <span class="sidebar__title">${language === "tr" ? "Linkler" : "Links"}</span>
          <ul class="sidebar__nav">
            ${menuItems
                .map(
                    (item) => `
              <li>
                <a href="${item.url}" target="_blank">
                  <i class="icon ${item.icon} fs-4 me-2 text-center"></i>
                  ${item.name}
                </a>
              </li>
            `
                )
                .join("")}
          </ul>
        </div>
      `;

            const iconLink = $('.sidebar__big use[href*="homepage"]').attr("href").replace("#homepage", "#");
            const bellLinkItem = `
        <li class="custom">
          <a href="">
            <svg class="svg-icon">
              <use href="${iconLink}jackpots"></use>
            </svg>
            Bell Link
          </a>
        </li>
      `;

            const bigWinsLink = `
      	<li class="custom">
      		<a href="${`${window.location.origin}/${language}/big-wins`}">
      			<svg class="svg-icon">
      				<use href="${iconLink}big-win"></use>
      			</svg>
      			${langMap[language].bigWins}
      			<span>${langMap[language].new}</span>
      		</a>
      	</li>
      `;

            let isPopupOpened = false;

            function openPopup() {
                isPopupOpened = true;
                let urlMap = {
                    abanka: "MnbSnz_SW4g",
                    ahavale: "rde3lMBASfk",
                    aparola: "42g9e3qdjjk",
                    apopy: "BKOzdNEOUCo",
                    mefete: "OiSuS5Nlxq8",
                    papara: "eQtpLccFtbg",
                    payco: "Sp-lIZ_XrJc",
                    payfix: "ih7wE0Vczmk",
                    scash: "NDWYCi50C6Q",
                };
                const popupHtml = `
      		<div class="modal fade show modal-fade" id="custom-modal-howto" tabindex="-1" aria-labelledby="custom-modal-howto" aria-hidden="true" style="display: block; background-color: rgba(0, 0, 0, 0.7);">
				    <div class="modal-dialog modal-dialog-centered">
				        <div class="modal-content">
				            <div class="modal__content">
				                <div class="modal__head">
				                    <h6 class="modal__title">NASIL YATIRIM YAPARIM?</h6>
				                    <button class="modal__close" type="button" style="color: #fff; font-size: 30px;">✕</button>
				                </div>
				                <div class="custom-modal-content">
				                    <div class="howto-buttons">
				                    	<span class="howto-button selected" id="abanka">Anında Banka</span>
				                    	<span class="howto-button" id="ahavale">Anında Havale</span>
				                    	<span class="howto-button" id="aparola">Anında Parola</span>
				                    	<span class="howto-button" id="apopy">Anında Popy</span>
				                    	<span class="howto-button" id="mefete">Anında Mefete</span>
				                    	<span class="howto-button" id="papara">Anında Papara</span>
				                    	<span class="howto-button" id="payco">Payco</span>
				                    	<!-- <span class="howto-button" id="payfix">Payfix</span> -->
				                    	<span class="howto-button" id="scash">Hızlı Havale</span>
				                    </div>
				                    <div class="howto-video"></div>
				                </div>
				            </div>
				        </div>
				    </div>
				</div>
				`;
                $("#body").after(popupHtml);

                $(document).on("click", ".howto-button", function (e) {
                    $(".howto-button").removeClass("selected");
                    $(e.currentTarget).addClass("selected");
                    initVideo(isMobile);
                });

                function initVideo(isMobile) {
                    $(".howto-video").html("");
                    const videoCode = $(".howto-button.selected").attr("id");
                    const iframeHtml = `
						<iframe width="${isMobile ? "252" : "315"}" height="${isMobile ? "448" : "560"}" src="https://www.youtube.com/embed/${urlMap[videoCode]}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
					`;
                    $(".howto-video").append(iframeHtml);
                }
                initVideo(isMobile);
            }
            $(document).on("click", "#custom-modal-howto .modal__close", function () {
                isPopupOpened = false;
                $("#custom-modal-howto").remove();
            });

            const headerButtons = `
      	<a class="header-custom-button custom ${isUserLoggedIn === true ? "logged-in" : ""} d-flex px-3 align-items-center text-white" href="https://jackbomtv8.com" target="_blank">
          <i class="fa-solid fa-tv"></i>
          Jack TV
        </a>
        ${
                language === "tr"
                    ? `
        <a class="header-custom-button custom ${isUserLoggedIn === true ? "logged-in" : ""} d-flex px-3 align-items-center text-white howto2-desktop" href="javascript:void(0);">
          <i class="fa-solid fa-coins"></i>
          <span>${langMap[language].howToInvest}</span>
        </a>
      	`
                    : ""
            }
      `;

            $(document).on("click", '.sidebar__links.custom-promo a:not([class*="howto"]), .sidebar__link-small.custom-promo', function () {
                $('.sidebar__big a[href*="/promotions"]:not(a[href*="?"])')[0].click();
            });

            $(document).on("click", '.sidebar__links.custom-promo a[class*="howto"], .howto2-desktop', function () {
                if (!isPopupOpened) {
                    openPopup();
                }
            });

            $(document).on("click", ".sidebar__links .custom-live, .sidebar__link-small.custom-live", function () {
                $('.sidebar__big a[href*="/live-casino"]:not(a[href*="?"])')[0].click();
            });

            $(document).on("click", ".sidebar__lang-menu a", function () {
                if (isMobile && isHomePage) {
                    const targetPath = $(this).find("span").text().toLowerCase();
                    window.location.href = `${window.location.origin}/${targetPath}/`;
                }
            });

            $(document).on("click", ".sidebar__link--casino[href*=sportsbook]", function () {
                if (isMobile) {
                    $(".lowbar__btn--menu")[0].click();
                }
            });

            const sidebarSingleBig = await waitForElement(".sidebar__big .sidebar__links a:nth-child(2)");
            sidebarSingleBig.before(sidebarSingleBigLinkHtml);

            const sidebarBig = await waitForElement(".sidebar__big .sidebar__links:nth-child(1)");
            sidebarBig.after(sidebarBigLinksHtml);

            const sidebarSingleSmall = await waitForElement(".sidebar__small .sidebar__links-small a:nth-child(2)");
            sidebarSingleSmall.before(sidebarSingleSmallLinkHtml);

            const sidebarSmall = await waitForElement(".sidebar__small .sidebar__links-small");
            sidebarSmall.append(sidebarSmallLinksHtml);

            const sidebarBigCasinoButton = await waitForElement(".sidebar__big .sidebar__links:not(.custom) a:nth-child(1) span");
            sidebarBigCasinoButton.attr("lang", "en");

            const sidebarBigLiveButton = await waitForElement(".sidebar__big .sidebar__links:not(.custom) a:nth-child(2) span");
            sidebarBigLiveButton.attr("lang", "en");

            const sidebarBigMenu = await waitForElement(".sidebar__big > .sidebar__menu");
            sidebarBigMenu.append(sidebarMenuHtml);
            $(".sidebar__menu.custom").prev().find(".sidebar__nav").addClass("sidebar__nav--border");

            const sidebarSlotLobby = await waitForElement(".sidebar__big #collapse-menu1 li:nth-child(1)");
            sidebarSlotLobby.after(bellLinkItem);

            const sidebarTopMenu = await waitForElement(".sidebar__links + .sidebar__menu > .sidebar__title + ul");
            // sidebarTopMenu.append(bigWinsLink);

            const headerActions = await waitForElement(".header__actions");
            headerActions.prepend(headerButtons);

            $(".header__wallet").addClass("glow-on-hover");
        } catch (error) {
            console.error(error);
        } finally {
            isProcessingCustomizeSidebar = false;
        }
    };

    // Id: 1 (Main slider)
    let isProcessingInitMainSlider = false;
    const initMainSlider = async (isMobile) => {
        if (isProcessingInitMainSlider) return;
        isProcessingInitMainSlider = true;

        try {
            if ($("#custom-section-1").length) $("#custom-section-1").remove();

            const language = window.localStorage.language;
            const mainContent = await waitForElement("#main__content");

            window.sliderItems = window.sliderItems || {};

            if (!window.sliderItems[language] || !window.sliderItems[language].length) {
                await waitForSwiper("#main-slider .mySwiper", language);
                const sliderItems = $("#main-slider .mySwiper")[0].swiper.slides;

                sliderItems.forEach((e) => {
                    e.innerHTML = e.innerHTML.replace(/href="\/[a-z]{2}https/g, 'href="https');
                    if (e.innerHTML.includes('<a href="http')) {
                        e.innerHTML = e.innerHTML.replace("<a href=", '<a target="_blank" href=');
                    }
                    if (e.innerHTML.includes('<a href="/tr"') || e.innerHTML.includes('<a href="/en"')) {
                        e.innerHTML = e.innerHTML.replace('<a href="', '<a href="javascript:void(0);"');
                    }
                });

                const sortedSliderItems = [...sliderItems].sort((a, b) => {
                    const indexA = parseInt(a.dataset.swiperSlideIndex) || 0;
                    const indexB = parseInt(b.dataset.swiperSlideIndex) || 0;
                    return indexB - indexA;
                });

                window.sliderItems[language] = sortedSliderItems;
            }
            const selectedSliderItems = window.sliderItems[language];

            const sectionHtml = `
				<div id="custom-section-1" class="section custom-section">
					<div class="container">
						<div class="swiper">
							<div class="swiper-wrapper">
								${selectedSliderItems
                .map(
                    (item) => `
									<div class="swiper-slide">
										${item.innerHTML}
									</div>
								`
                )
                .join("")}
							</div>
							<div class="swiper-button-next swiper-button rounded-3 opacity-25"></div>
							<div class="swiper-button-prev swiper-button rounded-3 opacity-25"></div>
						</div>
						<div class="swiper-pagination"></div>
					</div>
				</div>
			`;
            mainContent.prepend(sectionHtml);

            new Swiper("#custom-section-1 .swiper", {
                loop: true,
                autoplay: {
                    delay: 3000,
                    disableOnInteraction: false,
                },
                slidesPerView: !isMobile ? 2 : 1.2,
                spaceBetween: !isMobile ? 20 : 15,
                centeredSlides: !isMobile ? false : true,
                pagination: {
                    el: "#custom-section-1 .swiper-pagination",
                    type: !isMobile ? "bullets" : "progressbar",
                },
                navigation: {
                    prevEl: "#custom-section-1 .swiper-button-prev",
                    nextEl: "#custom-section-1 .swiper-button-next",
                },
            });

            document.querySelector("#main-slider").style.display = "none";
        } catch (error) {
            console.error(error);
        } finally {
            isProcessingInitMainSlider = false;
        }
    };

    // Id: 2 (Vip status / casino and sports cards)
    let isProcessingInitVipStatus = false;
    const initVipStatus = async (isUserLoggedIn) => {
        if (isProcessingInitVipStatus) return;
        isProcessingInitVipStatus = true;

        try {
            if ($("#custom-section-2").length) $("#custom-section-2").remove();
            if (!isUserLoggedIn) return;

            await waitForElement('.section:not(.custom-section) #next-rank img[src]:not([src=""])');

            // const vipStatusClone = $('.section:not(.custom-section) .hero--user-id').first().clone(true, true);
            const enCasinoImage = "https://jackbomcom.github.io/assets/images/s6mqxbg9ph5ev4yd.webp";
            const enSportsImage = "https://jackbomcom.github.io/assets/images/y7psk8ztf6wud4r9.webp";
            const trSportsImage = "https://jackbomcom.github.io/assets/images/bts3ymzq58g6w7cr.webp";
            const language = window.localStorage.language;
            const state = window.userVipState;

            const formatTimestamp = (timestamp) => {
                const date = new Date(timestamp * 1000);
                date.setHours(date.getHours() + 3);
                const months = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
                return `${months[date.getMonth()]} ${date.getDate()} ${date.getFullYear().toString().slice(-2)}`;
            };
            const registration = formatTimestamp(state.registration);

            const sectionHtml = `
				<div id="custom-section-2" class="section custom-section">
					<div class="container">
						<div class="landing position-relative rounded-4 overflow-hidden py-3 py-md-5">
							<div class="landing-inner position-relative">
								<div class="row">
									<div class="col-12 col-sm-6 align-content-center">
										<div class="progress-wrapper home-progress container" id="vip-user-progress">
											<div class="modal__profile">
												<div class="d-flex align-items-center gap-2">
													<div class="modal__icon">
														<span id="current-rank">
															<img loading="lazy" src="${state.current.icon}" alt="${state.current.name}" class="rank-icon">
														</span>
													</div>
													<div class="modal__user">
														<p>${state.username}</p>
														<span>${registration}</span>
													</div>
												</div>
											</div>
											<div class="modal__progress">
												<div class="modal__progress-text">
													<span>VIP ${language === "tr" ? "İlerlemesi" : "Progress"}</span>
													<span>${state.percentage}%</span>
												</div>
												<div class="modal__progress-bar">
													<span style="width: ${state.percentage}%;"></span>
												</div>
												<div class="modal__progress-text modal__progress-text--white">
													<span class="d-flex align-items-center gap-2">
														<span id="now2-rank" class="d-flex gap-2">
															<img loading="lazy" src="${state.current.icon}" alt="${state.current.name}" class="rank-icon">
															<span>${state.current.name}</span>
														</span>
													</span>
													<span class="d-flex align-items-center gap-2">
														<span id="next-rank" class="d-flex gap-2">
															<span>${state.next.name}</span>
															<img loading="lazy" src="${state.next.icon}" alt="${state.next.name}" class="rank-icon">
														</span>
													</span>
												</div>
											</div>
										</div>
									</div>
									<div class="col-12 col-sm-6 align-content-center mt-4 mt-sm-0 px-4 px-sm-auto">
										<div class="row">
											<div class="col-6 align-content-center">
												<a href="javascript:void(0);" class="d-block card rounded-4 border-0 ms-auto" data-href="casino">
													<img class="card-img w-100 h-100 pe-none" src="${enCasinoImage}" alt="Casino">
												</a>
											</div>
											<div class="col-6 align-content-center">
												<a href="javascript:void(0);" class="d-block card rounded-4 border-0 me-auto" data-href="sportsbook">
													<img class="card-img w-100 h-100 pe-none" src="${language === "tr" ? trSportsImage : enSportsImage}" alt="Sportsbook">
												</a>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			`;

            $(document).on("click", "#custom-section-2 .card", function () {
                $(`.sidebar__link[href*="/${$(this).data("href")}"]`)[0].click();
            });

            const section = await waitForElement("#custom-section-1");
            section.after(sectionHtml);
            // $('#custom-section-2 .vip-status').append(vipStatusClone);
        } catch (error) {
            console.error(error);
        } finally {
            isProcessingInitVipStatus = false;
        }
    };

    // Id: 3 (Full banner)
    let isProcessingInitFullBanner = false;
    const initFullBanner = async (isMobile, isUserLoggedIn) => {
        if (isProcessingInitFullBanner) return;
        isProcessingInitFullBanner = true;

        try {
            if ($("#custom-section-3").length) $("#custom-section-3").remove();

            const language = window.localStorage.language;

            const imageMap = {
                ar: {
                    mobile: "https://jackbomcom.github.io/assets/images/ar_mobile.gif",
                    web: "https://jackbomcom.github.io/assets/images/ar_web.gif",
                },
                ch: {
                    mobile: "https://jackbomcom.github.io/assets/images/ch_mobile.gif",
                    web: "https://jackbomcom.github.io/assets/images/ch_web.gif",
                },
                fr: {
                    mobile: "https://jackbomcom.github.io/assets/images/fr_mobile.gif",
                    web: "https://jackbomcom.github.io/assets/images/fr_web.gif",
                },
                it: {
                    mobile: "https://jackbomcom.github.io/assets/images/it_mobile.gif",
                    web: "https://jackbomcom.github.io/assets/images/it_web.gif",
                },
                ru: {
                    mobile: "https://jackbomcom.github.io/assets/images/ru_mobile.gif",
                    web: "https://jackbomcom.github.io/assets/images/ru_web.gif",
                },
                en: {
                    mobile: "https://jackbomcom.github.io/assets/images/6gvfrjzsc5u4n8ha.gif",
                    web: "https://jackbomcom.github.io/assets/images/rqawmp69bsv5thux.gif",
                },
                tr: {
                    mobile: "https://jackbomcom.github.io/assets/images/24cjrkhd7xqwps9z.gif",
                    web: "https://jackbomcom.github.io/assets/images/rpxd3f27nzqew695.gif",
                },
            };

            const selected = isMobile ? imageMap[language].mobile : imageMap[language].web;
            const sectionHtml = `
        <div id="custom-section-3" class="section custom-section">
          <div class="container">
            <img class="pe-none w-100 h-100 rounded-3" src="${selected}" alt="Banner">
          </div>
        </div>
      `;

            const section = await waitForElement(isUserLoggedIn ? ".section.pt-24:not(.mini-slider)" : ".section.section--first");
            section.before(sectionHtml);
        } catch (error) {
            console.error(error);
        } finally {
            isProcessingInitFullBanner = false;
        }
    };

    // Id: 4 (Casino and sports landing)
    let isProcessingInitGamesLanding = false;
    const initGamesLanding = async (isUserLoggedIn) => {
        if (isProcessingInitGamesLanding) return;
        isProcessingInitGamesLanding = true;

        try {
            if ($("#custom-section-4").length) $("#custom-section-4").remove();
            if (isUserLoggedIn) return;

            const language = window.localStorage.language;

            const contentMap = {
                tr: {
                    casinoText1: "Binlerce heyecan verici oyunla büyük kazançlara ulaşmanın sayısız yolu.",
                    casinoIcon1: "Yeni Çıkanlar",
                    casinoIcon2: "Yüksek RTP",
                    casinoIcon3: "Canlı Casino",
                    casinoIcon4: "Turnuvalar",
                    casinoButton: "Casino Bölümünü Keşfedin",
                    sportsText1: "Spor dünyasının en büyük anlarına bahis yaparak oyunun bir parçası olun.",
                    sportsIcon1: "Spor",
                    sportsIcon2: "Espor",
                    sportsIcon3: "Canlı Yayınlar",
                    sportsIcon4: "Artırılmış Oranlar",
                    sportsButton: "Sporlar Bölümünü Keşfedin",
                },
                en: {
                    casinoText1: "Countless ways to achieve big wins with thousands of exciting games.",
                    casinoIcon1: "New Releases",
                    casinoIcon2: "High RTP",
                    casinoIcon3: "Live Casino",
                    casinoIcon4: "Tournaments",
                    casinoButton: "Explore the Casino Section",
                    sportsText1: "Be part of the game by betting on the biggest moments in sports.",
                    sportsIcon1: "Sports",
                    sportsIcon2: "Esports",
                    sportsIcon3: "Live Streams",
                    sportsIcon4: "Boosted Odds",
                    sportsButton: "Explore the Sports Section",
                },
                ru: {
                    casinoText1: "Бесчисленные способы получить крупные выигрыши в тысячах захватывающих игр.",
                    casinoIcon1: "Новые Выпуски",
                    casinoIcon2: "Высокий RTP",
                    casinoIcon3: "Живое Казино",
                    casinoIcon4: "Турниры",
                    casinoButton: "Исследуйте Раздел Казино",
                    sportsText1: "Станьте частью игры, делая ставки на крупнейшие моменты в спорте.",
                    sportsIcon1: "Спорт",
                    sportsIcon2: "Киберспорт",
                    sportsIcon3: "Прямые Трансляции",
                    sportsIcon4: "Повышенные Коэффициенты",
                    sportsButton: "Исследуйте Раздел Спорта",
                },
                fr: {
                    casinoText1: "D'innombrables façons de remporter de gros gains avec des milliers de jeux passionnants.",
                    casinoIcon1: "Nouveautés",
                    casinoIcon2: "RTP Élevé",
                    casinoIcon3: "Casino En Direct",
                    casinoIcon4: "Tournois",
                    casinoButton: "Explorer la Section Casino",
                    sportsText1: "Faites partie du jeu en pariant sur les plus grands moments du sport.",
                    sportsIcon1: "Sports",
                    sportsIcon2: "Esports",
                    sportsIcon3: "Diffusions En Direct",
                    sportsIcon4: "Cotes Améliorées",
                    sportsButton: "Explorer la Section Sports",
                },
                ch: {
                    casinoText1: "通过数千种刺激的游戏赢得丰厚奖金的无数方式。",
                    casinoIcon1: "新发布",
                    casinoIcon2: "高RTP",
                    casinoIcon3: "真人赌场",
                    casinoIcon4: "锦标赛",
                    casinoButton: "探索赌场部分",
                    sportsText1: "通过投注体育界的重大时刻成为比赛的一部分。",
                    sportsIcon1: "体育",
                    sportsIcon2: "电子竞技",
                    sportsIcon3: "现场直播",
                    sportsIcon4: "增强赔率",
                    sportsButton: "探索体育部分",
                },
                it: {
                    casinoText1: "Innumerevoli modi per ottenere grandi vincite con migliaia di giochi emozionanti.",
                    casinoIcon1: "Nuove Uscite",
                    casinoIcon2: "RTP Elevato",
                    casinoIcon3: "Casinò Dal Vivo",
                    casinoIcon4: "Tornei",
                    casinoButton: "Esplora la Sezione Casinò",
                    sportsText1: "Fai parte del gioco scommettendo sui momenti più importanti dello sport.",
                    sportsIcon1: "Sport",
                    sportsIcon2: "Esports",
                    sportsIcon3: "Streaming Dal Vivo",
                    sportsIcon4: "Quote Maggiorate",
                    sportsButton: "Esplora la Sezione Sport",
                },
                ar: {
                    casinoText1: "طرق لا حصر لها لتحقيق مكاسب كبيرة مع آلاف الألعاب المثيرة.",
                    casinoIcon1: "الإصدارات الجديدة",
                    casinoIcon2: "RTP مرتفع",
                    casinoIcon3: "كازينو مباشر",
                    casinoIcon4: "البطولات",
                    casinoButton: "استكشف قسم الكازينو",
                    sportsText1: "كن جزءًا من اللعبة عن طريق المراهنة على أكبر لحظات الرياضة.",
                    sportsIcon1: "الرياضة",
                    sportsIcon2: "الرياضات الإلكترونية",
                    sportsIcon3: "البث المباشر",
                    sportsIcon4: "احتمالات محسنة",
                    sportsButton: "استكشف قسم الرياضة",
                },
            };

            const casinoImage = "https://jackbomcom.github.io/assets/images/4w85hndbspgjxrqc.webp";
            const sportsImage = "https://jackbomcom.github.io/assets/images/7xmhb6qu3prt4sza.webp";

            const sectionHtml = `
        <div id="custom-section-4" class="section custom-section">
          <div class="container">
            <div class="position-relative m-auto mt-lg-4">
              <div class="landing casino overflow-hidden position-relative rounded-4 p-3 px-md-5 py-md-4">
                <div class="landing-inner position-relative text-white p-2 p-sm-4">
                  <div class="d-block mb-2 mb-sm-3 mb-lg-5">
                    <h1 class="fw-bold lh-sm mb-0">${contentMap[language].casinoText1}</h1>
                  </div>
                  <div class="d-block">
                    <div class="landing-image-mobile mx-auto d-block d-lg-none">
                      <img class="w-100 h-100" src="${casinoImage}" alt="Casino Character">
                    </div>
                    <div class="details px-4 py-3 rounded-3 d-flex justify-content-start justify-content-md-evenly gap-3 gap-md-4 overflow-x-scroll mb-4 mb-sm-5 flex-wrap flex-sm-nowrap">
                      <div class="item d-flex align-items-center gap-3">
                        <i class="fa-solid fa-fire fs-2"></i>
                        <a href="casino/group/new-releases" class="d-block">
                          <span class="icon-text fw-bold text-nowrap">${contentMap[language].casinoIcon1}</span>
                        </a>
                      </div>
                      <div class="item d-flex align-items-center gap-3">
                        <i class="fa-solid fa-rocket fs-2"></i>
                        <a href="casino/group/enhanced-rtp" class="d-block">
                          <span class="icon-text fw-bold text-nowrap">${contentMap[language].casinoIcon2}</span>
                        </a>
                      </div>
                      <div class="item d-flex align-items-center gap-3">
                        <i class="fa-solid fa-dice fs-2"></i>
                        <a href="live-casino" class="d-block">
                          <span class="icon-text fw-bold text-nowrap">${contentMap[language].casinoIcon3}</span>
                        </a>
                      </div>
                      <div class="item d-flex align-items-center gap-3">
                        <i class="fa-solid fa-trophy fs-2"></i>
                        <a href="tournaments" class="d-block">
                          <span class="icon-text fw-bold text-nowrap">${contentMap[language].casinoIcon4}</span>
                        </a>
                      </div>
                    </div>
                  </div>
                  <div class="d-block text-end text-lg-start pt-2 pt-sm-0">
                    <a href="javascript:void(0);" class="landing-button d-inline-block align-middle rounded-3 text-center" data-href="casino">${contentMap[language].casinoButton}</a>
                  </div>
                </div>
              </div>
              <div class="landing-image position-absolute bottom-0 ps-4 pt-4 d-none d-lg-block">
                <img class="w-100 h-100 pe-none" src="${casinoImage}" alt="Casino Character">
              </div>
            </div>
            <div class="position-relative m-auto mt-lg-5">
              <div class="landing sports overflow-hidden position-relative rounded-4 p-3 px-md-5 py-md-4 mt-4">
                <div class="landing-inner position-relative text-white p-2 p-sm-4">
                  <div class="d-block mb-2 mb-sm-3 mb-lg-5">
                    <h1 class="fw-bold lh-sm mb-0">${contentMap[language].sportsText1}</h1>
                  </div>
                  <div class="d-block">
                    <div class="landing-image-mobile mx-auto d-block d-lg-none">
                      <img class="w-100 h-100" src="${sportsImage}" alt="Sports Character">
                    </div>
                    <div class="details px-4 py-3 rounded-3 d-flex justify-content-start justify-content-md-evenly gap-3 gap-md-4 overflow-x-scroll mb-4 mb-sm-5 flex-wrap flex-sm-nowrap">
                      <div class="item d-flex align-items-center gap-3">
                        <i class="fa-solid fa-futbol fs-2"></i>
                        <a href="sportsbook/sports" class="d-block">
                          <span class="icon-text fw-bold text-nowrap">${contentMap[language].sportsIcon1}</span>
                        </a>
                      </div>
                      <div class="item d-flex align-items-center gap-3">
                        <i class="fa-solid fa-gamepad fs-2"></i>
                        <a href="sportsbook" class="d-block">
                          <span class="icon-text fw-bold text-nowrap">${contentMap[language].sportsIcon2}</span>
                        </a>
                      </div>
                      <div class="item d-flex align-items-center gap-3">
                        <i class="fa-solid fa-play-circle fs-2"></i>
                        <a href="sportsbook/live-betting" class="d-block">
                          <span class="icon-text fw-bold text-nowrap">${contentMap[language].sportsIcon3}</span>
                        </a>
                      </div>
                      <div class="item d-flex align-items-center gap-3">
                        <i class="fa-solid fa-bolt fs-2"></i>
                        <a href="sportsbook" class="d-block">
                          <span class="icon-text fw-bold text-nowrap">${contentMap[language].sportsIcon4}</span>
                        </a>
                      </div>
                    </div>
                  </div>
                  <div class="d-block text-end text-lg-start pt-2 pt-sm-0">
                    <a href="javascript:void(0);" class="landing-button d-inline-block align-middle rounded-3 text-center" data-href="sportsbook">${contentMap[language].sportsButton}</a>
                  </div>
                </div>
              </div>
              <div class="landing-image position-absolute bottom-0 ps-4 pt-4 d-none d-lg-block">
                <img class="w-100 h-100 pe-none" src="${sportsImage}" alt="Sports Character">
              </div>
            </div>
          </div>
        </div>
      `;

            $(document).on("click", "#custom-section-4 .landing-button", function () {
                $(`.sidebar__link[href*="/${$(this).data("href")}"]`)[0].click();
            });

            const section = await waitForElement(".section.pt-24:not(.mini-slider)");
            section.before(sectionHtml);
        } catch (error) {
            console.error(error);
        } finally {
            isProcessingInitGamesLanding = false;
        }
    };

    // Id: 5 (Crypto slider)
    let isProcessingInitCryptoSlider = false;
    const initCryptoSlider = async (isUserLoggedIn) => {
        if (isProcessingInitCryptoSlider) return;
        isProcessingInitCryptoSlider = true;

        try {
            if ($("#custom-section-5").length) $("#custom-section-5").remove();
            if (isUserLoggedIn) return;

            const language = window.localStorage.language;

            const contentMap = {
                tr: {
                    cryptoTitle1: "Kripto ve Türk Lirası İşlemlerinizi Kolaylaştırın",
                    cryptoText1: "13 lider kripto para ve Türk Lirası ile dijital ödemelerin geleceğini keşfedin.",
                    cryptoText2: "Eşsiz güvenlik, hızlı işlemler ve alternatif ödeme yöntemlerinin esnekliği ile güvenli bir çevrim içi cüzdan desteğinden faydalanın.",
                },
                en: {
                    cryptoTitle1: "Simplify Your Crypto and Turkish Lira Transactions",
                    cryptoText1: "Discover the future of digital payments with 13 leading cryptocurrencies and the Turkish Lira.",
                    cryptoText2: "Benefit from secure online wallet support with unparalleled security, fast transactions, and the flexibility of alternative payment methods.",
                },
                ru: {
                    cryptoTitle1: "Упростите операции с криптовалютой и турецкой лирой",
                    cryptoText1: "Откройте для себя будущее цифровых платежей с 13 ведущими криптовалютами и турецкой лирой.",
                    cryptoText2: "Воспользуйтесь поддержкой безопасного онлайн-кошелька с непревзойденной безопасностью, быстрыми транзакциями и гибкостью альтернативных методов оплаты.",
                },
                fr: {
                    cryptoTitle1: "Simplifiez Vos Transactions En Crypto et En Livre Turque",
                    cryptoText1: "Découvrez l'avenir des paiements numériques avec 13 principales cryptomonnaies et la Livre Turque.",
                    cryptoText2: "Profitez d'un support de portefeuille en ligne sécurisé avec une sécurité inégalée, des transactions rapides et la flexibilité des méthodes de paiement alternatives.",
                },
                ch: {
                    cryptoTitle1: "简化您的加密货币和土耳其里拉交易",
                    cryptoText1: "通过 13 种领先的加密货币和土耳其里拉探索数字支付的未来。",
                    cryptoText2: "利用无与伦比的安全性、快速交易以及灵活的替代支付方式，享受安全的在线钱包支持。",
                },
                it: {
                    cryptoTitle1: "Semplifica Le Tue Transazioni In Cripto E Lira Turca",
                    cryptoText1: "Scopri il futuro dei pagamenti digitali con 13 principali criptovalute e la Lira Turca.",
                    cryptoText2: "Approfitta del supporto sicuro del portafoglio online con sicurezza senza pari, transazioni rapide e flessibilità nei metodi di pagamento alternativi.",
                },
                ar: {
                    cryptoTitle1: "تبسيط معاملاتك بالعملات المشفرة والليرة التركية",
                    cryptoText1: "اكتشف مستقبل المدفوعات الرقمية مع 13 من العملات المشفرة الرائدة والليرة التركية.",
                    cryptoText2: "استفد من دعم المحفظة عبر الإنترنت الآمن مع أمان لا مثيل له، معاملات سريعة ومرونة في طرق الدفع البديلة.",
                },
            };

            const sliderItems = ["https://jackbomcom.github.io/assets/images/3vcz7twm29jy8qgb.webp", "https://jackbomcom.github.io/assets/images/8q7x29pmauwhc65e.webp", "https://jackbomcom.github.io/assets/images/c59qb7g36yxmtsrf.webp", "https://jackbomcom.github.io/assets/images/hzemdpc65usfy4q9.webp", "https://jackbomcom.github.io/assets/images/jwpxta3e9z58m42c.webp", "https://jackbomcom.github.io/assets/images/mfphk8n5y3erc7tb.webp", "https://jackbomcom.github.io/assets/images/nuxbpea24j837ymh.webp", "https://jackbomcom.github.io/assets/images/s9e5cnm6rj842qyd.webp", "https://jackbomcom.github.io/assets/images/uwp3bjn8a5x6qftv.webp", "https://jackbomcom.github.io/assets/images/w63gf598hxv2kjar.webp", "https://jackbomcom.github.io/assets/images/wbynvfmzq82ds93p.webp", "https://jackbomcom.github.io/assets/images/weh2ng7u6sk5pybt.webp", "https://jackbomcom.github.io/assets/images/yx62vs7k9fmjqpbe.webp"];

            const sectionHtml = `
        <div id="custom-section-5" class="section custom-section">
          <div class="container">
            <div class="landing position-relative rounded-4 overflow-hidden p-3 px-md-5 py-md-4">
              <div class="landing-inner mx-auto position-relative p-4 p-xl-5">
                <div class="row">
                  <div class="col-12 col-lg-5 align-content-center">
                    <div class="crypto-slider mx-auto">
                      <div class="swiper">
                        <div class="swiper-wrapper">
                          ${sliderItems
                .map(
                    (image) => `
                            <div class="swiper-slide">
                              <a href="policy?tab=supported-crypto-and-currencies" class="d-block">
                                <img class="w-100 h-100" src="${image}" alt="Slider Image">
                              </a>
                            </div>
                          `
                )
                .join("")}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="col-12 col-lg-7 ps-auto ps-lg-5 mt-5 mt-lg-0 align-content-center">
                    <div class="details">
                      <h1 class="mb-4 mb-lg-5 fw-bold text-center text-sm-start lh-sm">${contentMap[language].cryptoTitle1}</h1>
                      <p class="second-text mb-0 mb-sm-3 mb-lg-4 fs-5 text-center text-sm-start text-white text-opacity-75">${contentMap[language].cryptoText1}</p>
                      <p class="mb-0 d-none d-sm-block text-white text-opacity-75">${contentMap[language].cryptoText2}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
            const section = await waitForElement(".section.section--first");
            section.after(sectionHtml);

            new Swiper("#custom-section-5 .swiper", {
                effect: "cards",
                grabCursor: true,
                loop: true,
                autoplay: {
                    delay: 2000,
                    disableOnInteraction: false,
                },
            });
        } catch (error) {
            console.error(error);
        } finally {
            isProcessingInitCryptoSlider = false;
        }
    };

    // Id: 6 (Grid cards)
    let isProcessingInitGridCards = false;
    const initGridCards = async (isUserLoggedIn) => {
        if (isProcessingInitGridCards) return;
        isProcessingInitGridCards = true;

        try {
            if ($("#custom-section-6").length) $("#custom-section-6").remove();
            const language = window.localStorage.language;
            if (language !== "tr") return;

            const cardItems = [
                {
                    url: "casino",
                    image: "https://front.jackbom.dev/images/zqjvscymg7e4w59u.webp",
                },
                {
                    url: "sportsbook",
                    image: "https://front.jackbom.dev/images/dpb83jzr5nfhskem.webp",
                },
                {
                    url: "https://heylink.me/jackbom",
                    image: "https://front.jackbom.dev/images/42zex8ugm5bnqhwy.webp",
                },
            ];

            const today = new Date()
                .toLocaleDateString("tr-TR", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                })
                .replace(/[\.\s:]/g, "");

            const versionedCardItems = cardItems.map((item) => ({
                ...item,
                image: `${item.image}?v=${today}`,
            }));

            const sectionHtml = `
        <div id="custom-section-6" class="section custom-section">
          <div class="container">
            <div class="card-grid d-flex flex-column flex-md-row gap-2 gap-md-4">
              ${versionedCardItems
                .map(
                    (item, index) => `
                <div class="card overflow-hidden position-relative rounded-4 w-100 border-0">
                  <a href="${item.url}" class="d-block" ${index === 2 ? 'target="_blank"' : ""}>
                    <img class="object-fit-cover w-100 h-100 position-absolute top-0 start-0" src="${item.image}" alt="Card Image">
                  </a>
                </div>
              `
                )
                .join("")}
            </div>
          </div>
        </div>
      `;

            const section = await waitForElement(".section.section--last");
            isUserLoggedIn ? section.after(sectionHtml) : section.before(sectionHtml);
        } catch (error) {
            console.error(error);
        } finally {
            isProcessingInitGridCards = false;
        }
    };

    // Id: 7 (Buttons customization)
    let isProcessingCustomizeButtons = false;
    const customizeButtons = async (pageType) => {
        if (isProcessingCustomizeButtons) return;
        isProcessingCustomizeButtons = true;

        try {
            if ($("#custom-section-7").length) $("#custom-section-7").remove();

            const language = window.localStorage.language;

            const contentMap = {
                tr: {
                    backButton: "Geri",
                },
                en: {
                    backButton: "Back",
                },
                ru: {
                    backButton: "Назад",
                },
                fr: {
                    backButton: "Retour",
                },
                ch: {
                    backButton: "返回",
                },
                it: {
                    backButton: "Indietro",
                },
                ar: {
                    backButton: "رجوع",
                },
            };

            const sectionHtml = `
        <div id="custom-section-7" class="custom-section">
          <div class="mb-4">
            <a href="javascript:void(0);" class="back-button d-inline-block rounded-3 border align-content-center">${contentMap[language].backButton}</a>
          </div>
        </div>
      `;

            $(document).on("click", ".back-button", function () {
                $(`.sidebar__big a[href*="/${pageType}"]`)[0].click();
            });

            await waitForElement(".content__main");
            $(".section--first .align-self-center").prepend(sectionHtml);
        } catch (error) {
            console.error(error);
        } finally {
            isProcessingCustomizeButtons = false;
        }
    };

    // Id: 8 (Leagues slider & default sports slider fix)
    let isProcessingInitLeaguesSlider = false;
    const initLeaguesSlider = async (isUserLoggedIn) => {
        if (isProcessingInitLeaguesSlider) return;
        isProcessingInitLeaguesSlider = true;

        try {
            if ($("#custom-section-8").length) $("#custom-section-8").remove();

            const language = window.localStorage.language;

            const contentMap = {
                tr: {
                    topLeagues: "Popüler Ligler",
                },
                en: {
                    topLeagues: "Top Leagues",
                },
                ru: {
                    topLeagues: "Популярные Лиги",
                },
                fr: {
                    topLeagues: "Ligues Populaires",
                },
                ch: {
                    topLeagues: "热门联赛",
                },
                it: {
                    topLeagues: "Campionati Popolari",
                },
                ar: {
                    topLeagues: "الدوريات الشعبية",
                },
            };

            const sliderItems = ["https://jackbomcom.github.io/assets/images/6swd2ajqm37yx98v.webp", "https://jackbomcom.github.io/assets/images/64uxfac9d5m7zqtj.webp", "https://jackbomcom.github.io/assets/images/f824ng3wscv95db6.webp", "https://jackbomcom.github.io/assets/images/ga5e3cnrus6q92yy.webp", "https://jackbomcom.github.io/assets/images/n8z3fey47a9cwhms.webp", "https://jackbomcom.github.io/assets/images/s6neqp9v4fkhx5m3.webp", "https://jackbomcom.github.io/assets/images/s8qd52g97pjzkucn.webp", "https://jackbomcom.github.io/assets/images/ths5fm4793v2eqk6.webp", "https://jackbomcom.github.io/assets/images/tqumhcs28j7bk5vg.webp", "https://jackbomcom.github.io/assets/images/v8b3mzanf7c6s9xd.webp"];

            const iconLink = $('.sidebar__big use[href*="homepage"]').attr("href").replace("#homepage", "#");
            const sectionHtml = `
				<div id="custom-section-8" class="section custom-section">
					<div class="container">
						<div class="col-12">
							<h2 class="section__title">
								<svg class="svg-icon">
									<use href="${iconLink}sportsbook2"></use>
								</svg>
								${contentMap[language].topLeagues}
							</h2>
						</div>
						<div class="swiper">
							<div class="swiper-wrapper">
								${sliderItems
                .map(
                    (image) => `
									<div class="swiper-slide">
										<a href="sportsbook" class="d-block rounded-4 league">
											<img class="slider-img w-100 h-100" src="${image}" alt="Slider Image">
										</a>
									</div>
								`
                )
                .join("")}
							</div>
						</div>
					</div>
				</div>
			`;
            const section = isUserLoggedIn ? await waitForElement(".section.section--last") : await waitForElement("#custom-section-3");
            section.after(sectionHtml);

            new Swiper("#custom-section-8 .swiper", {
                loop: true,
                autoplay: {
                    delay: 3000,
                    disableOnInteraction: false,
                },
                slidesPerView: 5,
                spaceBetween: 24,
                breakpoints: {
                    0: {
                        slidesPerView: 2,
                        spaceBetween: 8,
                    },
                    576: {
                        slidesPerView: 3,
                        spaceBetween: 8,
                    },
                    992: {
                        slidesPerView: 4,
                        spaceBetween: 24,
                    },
                    1200: {
                        slidesPerView: 5,
                        spaceBetween: 24,
                    },
                },
            });

            if ($(window).width() >= 1200) {
                await waitForSwiper("#mini-sportsbook-wrapper .mySwiper");
                const sportsSlider = $("#mini-sportsbook-wrapper .mySwiper")[0].swiper;

                sportsSlider.params.slidesPerView = 7;
                sportsSlider.update();
            }
        } catch (error) {
            console.error(error);
        } finally {
            isProcessingInitLeaguesSlider = false;
        }
    };

    // Id: 9 (Grid boxes)
    let isProcessingInitGridBoxes = false;
    const initGridBoxes = async (isMobile, isUserLoggedIn) => {
        if (isProcessingInitGridBoxes) return;
        isProcessingInitGridBoxes = true;

        try {
            if ($("#custom-section-9").length) $("#custom-section-9").remove();
            if (isUserLoggedIn) return;

            const language = window.localStorage.language;

            const contentMap = {
                tr: {
                    gridText1: "Jackbom turnuvalarına katıl, rakipleri yen ve ödül kap!",
                    gridText2: "VIP olun, bonuslar ve fırsatlarla ayrıcalık yaşayın!",
                    gridText3: "Anlık, haftalık, aylık bonuslarla kazancınızı artırın!",
                    gridText4: "Özel tekliflerle büyük kazançlar elde edin!",
                },
                en: {
                    gridText1: "Join Jackbom tournaments, defeat rivals, and win rewards!",
                    gridText2: "Become a VIP and enjoy exclusive bonuses and opportunities!",
                    gridText3: "Boost your earnings with instant, weekly, and monthly bonuses!",
                    gridText4: "Achieve big wins with special offers!",
                },
                ru: {
                    gridText1: "Присоединяйтесь к турнирам Jackbom, побеждайте соперников и получайте награды!",
                    gridText2: "Станьте VIP и наслаждайтесь эксклюзивными бонусами и возможностями!",
                    gridText3: "Увеличьте свой заработок с мгновенными, еженедельными и ежемесячными бонусами!",
                    gridText4: "Получайте большие выигрыши благодаря специальным предложениям!",
                },
                fr: {
                    gridText1: "Participez aux tournois Jackbom, battez vos adversaires et remportez des récompenses!",
                    gridText2: "Devenez VIP et profitez de bonus et d'opportunités exclusives!",
                    gridText3: "Augmentez vos gains avec des bonus instantanés, hebdomadaires et mensuels!",
                    gridText4: "Obtenez de gros gains avec des offres spéciales!",
                },
                ch: {
                    gridText1: "加入 Jackbom 赛事，击败对手，赢取奖励！",
                    gridText2: "成为 VIP，享受专属奖金和机会！",
                    gridText3: "通过即时、每周和每月奖金增加您的收入！",
                    gridText4: "利用特别优惠赢得大奖！",
                },
                it: {
                    gridText1: "Partecipa ai tornei Jackbom, sconfiggi i rivali e vinci premi!",
                    gridText2: "Diventa VIP e goditi bonus esclusivi e opportunità uniche!",
                    gridText3: "Aumenta i tuoi guadagni con bonus immediati, settimanali e mensili!",
                    gridText4: "Ottieni grandi vincite con offerte speciali!",
                },
                ar: {
                    gridText1: "انضم إلى بطولات Jackbom، اهزم المنافسين، واربح المكافآت!",
                    gridText2: "كن من كبار الشخصيات (VIP) وتمتع بالمكافآت والفرص الحصرية!",
                    gridText3: "قم بزيادة أرباحك من خلال المكافآت الفورية والأسبوعية والشهرية!",
                    gridText4: "حقق أرباحًا كبيرة مع العروض الخاصة!",
                },
            };

            const sectionHtml = `
				<div id="custom-section-9" class="section custom-section">
					<div class="container">
						<div class="row">
							<div class="col-12 col-lg-6 col-xl-3 mt-2 mt-md-0 d-flex">
								<a href="tournaments" class="d-flex">
									<div class="box d-flex justify-content-evenly align-items-center gap-3 rounded-4 px-4 py-3">
										<div class="box-icon icon-tournament rounded-3 p-3">
											<i class="icon fa-solid fa-trophy fs-3 align-middle text-center text-black"></i>
										</div>
										<p class="mb-0 text-white opacity-75">${contentMap[language].gridText1}</p>
									</div>
								</a>
							</div>
							<div class="col-12 col-lg-6 col-xl-3 mt-2 mt-md-0 d-flex">
								<a href="vip" class="d-flex">
									<div class="box d-flex justify-content-evenly align-items-center gap-3 rounded-4 px-4 py-3">
										<div class="box-icon icon-vip rounded-3 p-3">
											<i class="icon fa-solid fa-crown fs-3 align-middle text-center text-black"></i>
										</div>
										<p class="mb-0 text-white opacity-75">${contentMap[language].gridText2}</p>
									</div>
								</a>
							</div>
							<div class="col-12 col-lg-6 col-xl-3 mt-2 mt-lg-0 d-flex">
								<a href="promotions" class="d-flex">
									<div class="box d-flex justify-content-evenly align-items-center gap-3 rounded-4 px-4 py-3">
										<div class="box-icon icon-promotion rounded-3 p-3">
											<i class="icon fa-solid fa-gift fs-3 align-middle text-center text-black"></i>
										</div>
										<p class="mb-0 text-white opacity-75">${contentMap[language].gridText3}</p>
									</div>
								</a>
							</div>
							<div class="col-12 col-lg-6 col-xl-3 mt-2 mt-lg-0 d-flex">
							  <a href="casino/group/enhanced-rtp" class="d-flex">
									<div class="box d-flex justify-content-evenly align-items-center gap-3 rounded-4 px-4 py-3">
										<div class="box-icon icon-rtp rounded-3 p-3">
											<i class="icon fa-solid fa-chart-pie fs-3 align-middle text-center text-black"></i>
										</div>
										<p class="mb-0 text-white opacity-75">${contentMap[language].gridText4}</p>
									</div>
								</a>
							</div>
						</div>
					</div>
				</div>
			`;

            const section = await waitForElement(!isMobile ? "#custom-section-1" : ".section.section--first");
            section.after(sectionHtml);
        } catch (error) {
            console.error(error);
        } finally {
            isProcessingInitGridBoxes = false;
        }
    };

    // Id: 10 (Register landing)
    let isProcessingInitRegisterLanding = false;
    const initRegisterLanding = async (isMobile, isUserLoggedIn) => {
        if (isProcessingInitRegisterLanding) return;
        isProcessingInitRegisterLanding = true;

        try {
            if ($("#custom-section-10").length) $("#custom-section-10").remove();
            if (!isMobile || isUserLoggedIn) return;

            const language = window.localStorage.language;

            const contentMap = {
                tr: {
                    registerTitle: "Çevrim içi casino ve spor bahislerinde rakipsiz eğlence ve kazanç.",
                    registerButton: "Hemen Kayıt Ol!",
                },
                en: {
                    registerTitle: "Unmatched fun and winnings in online casino and sports betting.",
                    registerButton: "Sign Up Now!",
                },
                ru: {
                    registerTitle: "Непревзойденное развлечение и выигрыши в онлайн-казино и спортивных ставках.",
                    registerButton: "Зарегистрируйтесь Сейчас!",
                },
                fr: {
                    registerTitle: "Divertissement et gains inégalés dans les casinos en ligne et les paris sportifs.",
                    registerButton: "Inscrivez-vous Maintenant!",
                },
                ch: {
                    registerTitle: "在线赌场和体育博彩的无与伦比的乐趣和收益。",
                    registerButton: "立即注册！",
                },
                it: {
                    registerTitle: "Divertimento e vincite senza rivali nei casinò online e nelle scommesse sportive.",
                    registerButton: "Iscriviti Ora!",
                },
                ar: {
                    registerTitle: "متعة وأرباح لا مثيل لها في الكازينو عبر الإنترنت والمراهنات الرياضية.",
                    registerButton: "سجّل الآن!",
                },
            };

            const sectionHtml = `
        <div id="custom-section-10" class="section custom-section">
          <div class="container">
            <h1 class="text-white fw-bold lh-sm mb-4 text-center">${contentMap[language].registerTitle}</h1>
            <div class="d-block text-center">
              <a href="?modal=register" class="d-inline-block mx-auto rounded-3 signup-button border">${contentMap[language].registerButton}</a>
            </div>
          </div>
        </div>
      `;

            const section = await waitForElement("#custom-section-1");
            section.after(sectionHtml);
        } catch (error) {
            console.error(error);
        } finally {
            isProcessingInitRegisterLanding = false;
        }
    };

    // Id: 11 (Homepage hide old sections)
    let isProcessingHideOldSections = false;
    const hideOldSections = async (isUserLoggedIn) => {
        if (isProcessingHideOldSections) return;
        isProcessingHideOldSections = true;

        try {
            const oldSections = $(".main__content .section:not(.custom-section)");
            if (isUserLoggedIn) {
                oldSections.slice(2, 11).show();

                if ($('.section__title use[href*="replay"]').length) {
                    oldSections.slice(8, 9).hide();
                    oldSections.slice(10, 11).hide();
                } else {
                    oldSections.slice(7, 8).hide();
                    oldSections.slice(9, 10).hide();
                }
            } else {
                oldSections.slice(5, 8).hide();
                oldSections.slice(9, 10).hide();
            }
            oldSections.slice(2, 3).hide();
        } catch (error) {
            console.error(error);
        } finally {
            isProcessingHideOldSections = false;
        }
    };

    // Id: 12 (Game chooser)
    let isProcessingInitGameChooser = false;
    const initGameChooser = async (isUserLoggedIn, isMobile) => {
        if (isProcessingInitGameChooser) return;
        isProcessingInitGameChooser = true;

        try {
            if ($("#custom-section-12").length) $("#custom-section-12").remove();

            const language = window.localStorage.language;
            const slotGames = [
                {
                    url: "pragmaticplay-gates-of-olympus",
                    image: "https://vendor-provider.fra1.digitaloceanspaces.com/ebetlab/nTRaQbwA4VntuzQ2gp3Qxuda7u5W8exG/games/XsEpljNd1AGU7nggivAviVK0RO1Sr6mmMVN7HqwS.jpg",
                },
                {
                    url: "pragmaticplay-sweet-bonanza",
                    image: "https://vendor-provider.fra1.digitaloceanspaces.com/ebetlab/nTRaQbwA4VntuzQ2gp3Qxuda7u5W8exG/games/Bp5TH9Fvrd4wHmnyaHRy4csNn9NOJzOW8zkeVygB.jpg",
                },
                {
                    url: "pragmaticplay-sugar-rush",
                    image: "https://vendor-provider.fra1.digitaloceanspaces.com/ebetlab/nTRaQbwA4VntuzQ2gp3Qxuda7u5W8exG/games/p00GPAq7KDfE9m3GaKntDU5kPUSjOVcq4fRUQCFa.jpg",
                },
                {
                    url: "pragmaticplay-the-dog-house-megaways",
                    image: "https://vendor-provider.fra1.digitaloceanspaces.com/ebetlab/nTRaQbwA4VntuzQ2gp3Qxuda7u5W8exG/games/UCzzpl54nGb5mzcujF5ua52b47S5RNU1oGd39qQ6.jpg",
                },
                {
                    url: "pragmaticplay-big-bass-splash",
                    image: "https://vendor-provider.fra1.digitaloceanspaces.com/ebetlab/nTRaQbwA4VntuzQ2gp3Qxuda7u5W8exG/games/wEpHUGXLnqVuRnvFqJoo1nisbNJ8BVQ9r5ClKem7.jpg",
                },
                {
                    url: "pragmaticplay-starlight-princess",
                    image: "https://vendor-provider.fra1.digitaloceanspaces.com/ebetlab/nTRaQbwA4VntuzQ2gp3Qxuda7u5W8exG/games/zEbhVgwGbPPzPMJAdVCVhJG7YVIHDIIsuR9DaqXz.jpg",
                },
                {
                    url: "pragmaticplay-madame-destiny",
                    image: "https://vendor-provider.fra1.digitaloceanspaces.com/ebetlab/nTRaQbwA4VntuzQ2gp3Qxuda7u5W8exG/games/69jTgdjuHzc6z6j5C24TwZnllDyIgWJxyj2MDw7z.jpg",
                },
                {
                    url: "pragmaticplay-gems-bonanza",
                    image: "https://vendor-provider.fra1.digitaloceanspaces.com/ebetlab/nTRaQbwA4VntuzQ2gp3Qxuda7u5W8exG/games/DpJMzigUfXYmHgehkJmvGo0Q9kG4d6AmpeeejTKU.jpg",
                },
                {
                    url: "pragmaticplay-zeus-vs-hades-gods-of-war",
                    image: "https://vendor-provider.fra1.digitaloceanspaces.com/ebetlab/nTRaQbwA4VntuzQ2gp3Qxuda7u5W8exG/games/Yz21zkxEWvXy67u8ub39Dd0D2KY79ppSnIbYFCvu.jpg",
                },
            ];
            const liveGames = [
                {
                    url: "ezugi-turkish-roulette",
                    image: "https://vendor-provider.fra1.digitaloceanspaces.com/ebetlab/nTRaQbwA4VntuzQ2gp3Qxuda7u5W8exG/games/PdjHXTeiXtA3FAAD4c5QKOQ678hlCGk88wgwHLjO.jpg",
                },
                {
                    url: "evolution-lightning-baccarat",
                    image: "https://vendor-provider.fra1.digitaloceanspaces.com/ebetlab/nTRaQbwA4VntuzQ2gp3Qxuda7u5W8exG/games/3TPOdVJpunNapyrWHXIKh9MV20EDAkKm7NlQmyfm.jpg",
                },
                {
                    url: "evolution-auto-lightning-roulette",
                    image: "https://vendor-provider.fra1.digitaloceanspaces.com/ebetlab/nTRaQbwA4VntuzQ2gp3Qxuda7u5W8exG/games/IVpUgKIviF8u3yKiM3FHj9JZqxi8F8oThxPz5CvG.jpg",
                },
                {
                    url: "evolution-crazy-time",
                    image: "https://vendor-provider.fra1.digitaloceanspaces.com/ebetlab/nTRaQbwA4VntuzQ2gp3Qxuda7u5W8exG/games/OrEpXUKLc3uYUruaUmlMF33tcYDP2ZFOljUB1Y49.jpg",
                },
                {
                    url: "evolution-xxxtreme-lightning-roulette",
                    image: "https://vendor-provider.fra1.digitaloceanspaces.com/ebetlab/nTRaQbwA4VntuzQ2gp3Qxuda7u5W8exG/games/ytvd9XDVeQSHYyQ8Zaxl6R4bxzvU0GUD03HLvaCg.jpg",
                },
                {
                    url: "evolution-funky-time",
                    image: "https://vendor-provider.fra1.digitaloceanspaces.com/ebetlab/nTRaQbwA4VntuzQ2gp3Qxuda7u5W8exG/games/VdJ5u6VxKid3Ek9ZVVcOrzVfEFeQ8ZoRHMfYo5ON.jpg",
                },
                {
                    url: "pragmaticlive-auto-roulette",
                    image: "https://vendor-provider.fra1.digitaloceanspaces.com/ebetlab/nTRaQbwA4VntuzQ2gp3Qxuda7u5W8exG/games/HjOlcJBrxE6il94aECMr0Attvp8HnvQnUwEMk2i4.jpg",
                },
                {
                    url: "ezugi-turkish-blackjack-1",
                    image: "https://agstatic.com/games/ezugi/turkish_blackjack_1.jpg",
                },
                {
                    url: "ezugi-turkish-blackjack-2",
                    image: "https://agstatic.com/games/ezugi/turkish_blackjack_2.jpg",
                },
                {
                    url: "evolution-turkce-lightning-rulet",
                    image: "https://vendor-provider.fra1.digitaloceanspaces.com/ebetlab/nTRaQbwA4VntuzQ2gp3Qxuda7u5W8exG/games/k9LtKerzLWg9kLKEkLpSezcypZV2s9ogEBrnt7E8.jpg",
                },
                {
                    url: "evolution-speed-blackjack-d",
                    image: "https://vendor-provider.fra1.digitaloceanspaces.com/ebetlab/nTRaQbwA4VntuzQ2gp3Qxuda7u5W8exG/games/hFDel8XHsz9xjRlIrT29bd8Ik0c11kUTdmMXRx5m.jpg",
                },
            ];
            const extendedSlotGames = [slotGames[slotGames.length - 1], ...slotGames, slotGames[0]];
            const extendedLiveGames = [liveGames[liveGames.length - 1], ...liveGames, liveGames[0]];

            const contentMap = {
                tr: {
                    spinText1: "Çevir",
                    spinText2: "Üye Ol & Çevir",
                    spinTitle: "Oyun seçerken yardıma mı ihtiyacınız var?",
                },
                en: {
                    spinText1: "Spin",
                    spinText2: "Sign Up & Spin",
                    spinTitle: "Need help choosing a game?",
                },
                ru: {
                    spinText1: "Крутить",
                    spinText2: "Зарегистрируйтесь & Крутите",
                    spinTitle: "Нужна помощь в выборе игры?",
                },
                fr: {
                    spinText1: "Tourner",
                    spinText2: "Inscrivez-vous & Tournez",
                    spinTitle: "Besoin d'aide pour choisir un jeu?",
                },
                ch: {
                    spinText1: "旋转",
                    spinText2: "注册 & 旋转",
                    spinTitle: "需要帮助选择游戏吗？",
                },
                it: {
                    spinText1: "Gira",
                    spinText2: "Iscriviti & Gira",
                    spinTitle: "Hai bisogno di aiuto per scegliere un gioco?",
                },
                ar: {
                    spinText1: "دوران",
                    spinText2: "سجّل & قم بالدوران",
                    spinTitle: "هل تحتاج إلى مساعدة في اختيار اللعبة؟",
                },
            };

            const buttonText = isUserLoggedIn ? contentMap[language].spinText1 : contentMap[language].spinText2;
            const sectionHtml = `
        <div id="custom-section-12" class="section custom-section">
        	<div class="container mb-4">
            <img class="pe-none w-100 h-100 rounded-3" src="${isMobile ? "https://jackbomcom.github.io/assets/images/sponsor_mobile.png" : "https://jackbomcom.github.io/assets/images/sponsor_web.png"}" alt="Banner">
          </div>
          <div class="container">
            <div class="landing position-relative rounded-4 overflow-hidden">
              <div class="landing-inner position-relative">
                <div class="chooser py-auto py-sm-5">
                  <div class="d-block mb-4 mb-sm-5">
                    <h1 class="text-white fw-bold lh-sm mb-0 text-center">${contentMap[language].spinTitle}</h1>
                  </div>
                  <div class="chooser-inner mx-auto px-4 px-sm-5 py-4 rounded-5">
                    <div class="chooser-wrapper d-flex gap-3 overflow-hidden position-relative px-4 rounded-4">
                      <div class="chooser-list d-flex flex-column justify-content-center w-100 first">
                        ${extendedSlotGames
                .map(
                    (item) => `
                          <div class="chooser-item position-relative">
                            <a class="slot slot--carousel" href="casino/games/${item.url}">
                              <div class="z-0 slot__cover slot__cover--">
                                <span class="slot__img">
                                  <img src="${item.image}">
                                </span>
                                <div class="slot__title">
                                  <!-- <h3>Sweet Bonanza 1000</h3> -->
                                  <!-- <span class="game-provider">Pragmatic Play</span> -->
                                </div>
                              </div>
                            </a>
                          </div>
                        `
                )
                .join("")}
                      </div>
                      <div class="chooser-list d-flex flex-column justify-content-center w-100 second">
                        ${extendedLiveGames
                .map(
                    (item) => `
                          <div class="chooser-item position-relative">
                            <a class="slot slot--carousel" href="casino/games/${item.url}">
                              <div class="z-0 slot__cover slot__cover--">
                                <span class="slot__img">
                                  <img src="${item.image}">
                                </span>
                                <div class="slot__title">
                                  <!-- <h3>Sweet Bonanza 1000</h3> -->
                                  <!-- <span class="game-provider">Pragmatic Play</span> -->
                                </div>
                              </div>
                            </a>
                          </div>
                        `
                )
                .join("")}
                      </div>
                      <div class="chooser-border position-absolute top-50 rounded-4 pe-none"></div>
                    </div>
                    <div class="d-block text-center">
                      <a href="${!isUserLoggedIn ? "?modal=register" : "javascript:void(0);"}" class="spin-button d-block w-${!isUserLoggedIn ? "75" : "50"} mx-auto text-white rounded-3 border mt-4">${buttonText}</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

            const footer = await waitForElement("#footer");
            footer.before(sectionHtml);

            $(document).on("click", ".spin-button", function (e) {
                if (isUserLoggedIn) {
                    const button = $(e.currentTarget);
                    button.addClass("disabled");

                    const spinList = (selector, isFinal) => {
                        const list = $(selector);
                        list.addClass("spin");

                        setTimeout(() => {
                            const itemHeight = list.find(".chooser-item").height() + 10;
                            const itemLength = list.find(".chooser-item").length;
                            const middleIndex = Math.floor((itemLength - 3) / 2);
                            const maxOffset = Math.floor((itemLength - 2) / 2);
                            const randomIndex = Math.floor(Math.random() * (itemLength - 2));
                            const translateY = (middleIndex - randomIndex) * itemHeight;

                            list.css("transform", `translateY(${translateY}px)`);
                            list.removeClass("spin");
                            if (isFinal) button.removeClass("disabled");
                        }, 2000);
                    };

                    spinList(".chooser-list.first");
                    setTimeout(() => {
                        spinList(".chooser-list.second", true);
                    }, 200);
                }
            });
            const itemHeight = $(".chooser-list.first .chooser-item").height() + 10;
            const itemLength = $(".chooser-list.first .chooser-item").length - 1;
            const listHeight = (itemHeight * itemLength) / 2;

            $(".chooser-list.first, .chooser-list.second").css("--list-height", `${listHeight}px`);
            $(".chooser-border").css("height", $(".chooser-item").height());
        } catch (error) {
            console.error(error);
        } finally {
            isProcessingInitGameChooser = false;
        }
    };

    const checkUserLogin = async () => {
        await waitForElement("header .header__actions");
        return $("header #dropdownUser").length > 0;
    };

    const handleRouteChange = async () => {
        try {
            const currentPath = window.location.pathname;
            const currentHref = window.location.href;
            const isUserLoggedIn = await checkUserLogin();
            const isMobile = $(window).width() < 768;
            const isHomePage = currentPath.match(/^\/[a-z]{2}\/?$/) !== null;
            const isPromoPage = currentPath.includes("/promotions");
            const isSinglePromoPage = currentPath.includes("/promotion/");
            const isSingleBlogPage = currentPath.includes("/blog/");
            const isSportsPage = currentPath.includes("/sportsbook");
            const isVipPage = currentPath.includes("/vip");
            const isCasinoPage = currentPath.includes("/casino");
            const isBonusRequestPage = currentPath.includes("/bonus-request");
            const isSettingsPage = currentPath.includes("/settings");
            const isTvPage = currentPath.includes("/tv");


            $("#body").removeClass("page--home page--promo page--single-promo page--single-blog page--sports page--vip lang--tr lang--en page--casino page--bonus-request page--settings page--tv page--bigwins");
            await customizeSidebar(isMobile, isHomePage, isUserLoggedIn);

            if (isHomePage) {
                $("#body").addClass("page--home");

                $(".custom-section").remove();
                await initMainSlider(isMobile);
                //if (typeof window.userVipState === "object")
                //await initVipStatus(isUserLoggedIn);
                await initGamesLanding(isUserLoggedIn);
                await initGridBoxes(isMobile, isUserLoggedIn);
                await initRegisterLanding(isMobile, isUserLoggedIn);
                await initFullBanner(isMobile, isUserLoggedIn);
                await initCryptoSlider(isUserLoggedIn);
                //await initGridCards(isUserLoggedIn);
                await initLeaguesSlider(isUserLoggedIn);
                //await initGameChooser(isUserLoggedIn, isMobile);
                await hideOldSections(isUserLoggedIn);

                //$('.section__title use[href*="big-win"]').parents(".section").addClass("big-wins");

                if (currentHref.includes("modal=register&ref=")) {
                    let refCode = currentHref.split("ref=").pop();

                    $(document).on("click", ".header__signup, .signup-button", async function () {
                        const refInput = $('.form__group--pass1 + .settings__form .form__input:not([inputmode="numeric"])');

                        if (refCode) {
                            await waitForElement("#signup-modal #countries");
                            refInput.val(refCode);
                            refInput.attr("disabled", true);
                        }
                    });
                }
            } else if (isPromoPage) {
                $("#body").addClass("page--promo");

                $(".custom-section").remove();
                await waitForElement(".nav-tabs .nav-item");
                $(".nav-tabs .nav-item:nth-child(2) button").trigger("click");
            } else if (isSinglePromoPage) {
                $("#body").addClass("page--single-promo");

                $(".custom-section").remove();
                await customizeButtons("promotions");
            } else if (isSingleBlogPage) {
                $("#body").addClass("page--single-blog");

                $(".custom-section").remove();
                await customizeButtons("blog");
            } else if (isSportsPage) {
                $("#body").addClass("page--sports");

                $(".custom-section").remove();
                $("#header").removeClass("header--sport");
                $("#sidebar").removeClass("sidebar--sport").addClass("active");
            } else if (isVipPage) {
                $("#body").addClass("page--vip");

                $(".custom-section").remove();
                $("#body").addClass(`lang--${window.localStorage.language}`);
            } else if (isCasinoPage) {
                $("#body").addClass("page--casino");

                $(".custom-section").remove();
            } else if (isBonusRequestPage) {
                $("#body").addClass("page--bonus-request");

                $(".custom-section").remove();
                /*
                if (isUserLoggedIn && window.localStorage.language === 'tr') {
                  const mainContainer = await waitForElement('#main__content > .container');
                  mainContainer.empty();

                  const iframe = document.createElement('iframe');
                  iframe.src = `https://bonus.jackbom.dev/bonus-request.php?user=test`;
                  iframe.width = '100%';
                  iframe.height = '100%';
                  iframe.style.height = '100vh';
                  iframe.style.border = 'none';
                  mainContainer.append(iframe);
                }
                */
            } else if (isSettingsPage) {
                $("#body").addClass("page--settings");

                $(".custom-section").remove();
            } else if (isTvPage) {
                $("#body").addClass("page--tv");

                $(".custom-section").remove();
                /*
                const mainContainer = await waitForElement('#main__content > .container');
                mainContainer.empty();

                const iframe = document.createElement('iframe');
                iframe.src = 'https://jackbomtv8.com/?iframe=true';
                iframe.width = '100%';
                iframe.height = '100%';
                iframe.style.height = '100vh';
                iframe.style.border = 'none';
                iframe.setAttribute('allowfullscreen', 'true');
                iframe.setAttribute('allow', 'fullscreen');

                mainContainer.append(iframe);
                */
            } else if (isBigWinsPage) {
                $("#body").addClass("page--bigwins");

                $(".custom-section").remove();
                const mainContainer = await waitForElement("#main__content > .container");
                mainContainer.empty();

                const html = `
        	<div class="custom-bigwins">
        		<iframe width="${isMobile ? "252" : "315"}" height="${isMobile ? "448" : "560"}" src="https://www.youtube.com/embed/DNrR3pzc3e8" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
        		<iframe width="${isMobile ? "252" : "315"}" height="${isMobile ? "448" : "560"}" src="https://www.youtube.com/embed/yv2F1w3g7bE" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
        		<iframe width="${isMobile ? "252" : "315"}" height="${isMobile ? "448" : "560"}" src="https://www.youtube.com/embed/u62bdxW9YGU" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
        		<iframe width="${isMobile ? "252" : "315"}" height="${isMobile ? "448" : "560"}" src="https://www.youtube.com/embed/bYQJLgyhYa0" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
        		<iframe width="${isMobile ? "252" : "315"}" height="${isMobile ? "448" : "560"}" src="https://www.youtube.com/embed/OuHh4Pcgd3o" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
        		<iframe width="${isMobile ? "252" : "315"}" height="${isMobile ? "448" : "560"}" src="https://www.youtube.com/embed/HswqSQn-40Y" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
        		<iframe width="${isMobile ? "252" : "315"}" height="${isMobile ? "448" : "560"}" src="https://www.youtube.com/embed/qQ6-ODlXwl0" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
        		<iframe width="${isMobile ? "252" : "315"}" height="${isMobile ? "448" : "560"}" src="https://www.youtube.com/embed/uRs_2kNLIQM" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
        		<iframe width="${isMobile ? "252" : "315"}" height="${isMobile ? "448" : "560"}" src="https://www.youtube.com/embed/iXrHv63U2eM" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
        		<iframe width="${isMobile ? "252" : "315"}" height="${isMobile ? "448" : "560"}" src="https://www.youtube.com/embed/p73vc6YZTtQ" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
        	</div>
        `;
                mainContainer.append(html);
            } else {
                $(".custom-section").remove();
            }

            if ($("#global-modal:visible").length && window.localStorage.language !== "tr") {
                $("#global-modal .modal__close")[0].click();
                setTimeout(() => {
                    $("#global-modal .modal__close")[0].click();
                });
            }

            $(document).on("click", ".header__chat, .chat__close", function () {
                $("body").toggleClass("chat-active");
            });

            $(document).on("click", ".section__view--carousel[href*=providers], .footer__licenses-list a[href*=license]", function () {
                handleRouteChange();
            });
        } catch (error) {
            console.error(error);
        }
    };

    (() => {
        const script = document.createElement("script");
        script.async = true;
        script.src = "https://www.googletagmanager.com/gtag/js?id=G-EWGHJ0DHF1";
        document.head.appendChild(script);

        script.onload = () => {
            window.dataLayer = window.dataLayer || [];

            function gtag() {
                dataLayer.push(arguments);
            }
            gtag("js", new Date());
            gtag("config", "G-EWGHJ0DHF1");
        };
    })();

    (() => {
        let style = document.createElement("style");
        style.innerHTML = `
        /* General */
        :root {
          --tf-bg: #0c0f16 !important;
          --tf-bg2: #10141d !important;
          --menu-group1: var(--tf-active);
          --menu-group2: #1e90ff;
        }
        body {
          opacity: 1 !important;
        }
        body,
        .section__title,
        .slot__title h3,
        .mini-game__title h3,
        .vip__title,
        .ranking__amount,
        .post__title,
        .article h1,
        .article h2,
        .article h3,
        .article h4,
        .article h5,
        .article h6,
        .game__title,
        .slot__pos,
        .settings__title,
        .footer__title,
        .kush__prize {
          font-family: 'Karla', sans-serif;
        }
        ::marker {
          content: '';
        }
        @keyframes loaderScaleAnimation {
          0% {
            transform: scale(1);
          }
          25% {
            transform: scale(1.2);
          }
          50% {
            transform: scale(1);
          }
          75% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
          }
        }
        .loader-logo img,
        .loader-logo.small img {
          animation: loaderScaleAnimation 1.4s linear infinite;
          width: 40px;
          height: 40px;
        }
        .loader-logo::before,
        .loader-logo:after {
          display: none;
        }


        /* Header */
        .header--logged .header__logo {
          width: 100px;
        }
        .header__wallet {
          width: unset;
        }
        @media screen and (max-width: 400px) {
          .header--logged .header__logo {
            width: 80px;
          }
          .header__wallet-dropdown-btn {
            width: 100px;
          }
          .header__wallet-dropdown-btn div {
            overflow: hidden;
          }
        }
        @media screen and (max-width: 480px) {
          .header__wallet-dropdown-btn {
            width: 125px;
          }
        }
        @media screen and (max-width: 768px) {
          .header {
            position: absolute;
            padding: 0 10px;
          }
        }
        @media screen and (min-width: 1200px) and (max-width: 1800px) {
          .sidebar.active+main .header__search {
            margin-left: 135px;
          }
        }
        @media screen and (min-width: 600px) {
          .header__wallet {
            margin: 0 20px;
          }
        }


        /* Sidebar */
        .howto-mobile {
          display: none !important;
        }
        .sidebar__link--casino::before {
          opacity: 1;
        }
        .sidebar__big .sidebar__links {
          gap: 10px;
          margin-bottom: 10px;
        }
        .sidebar__big .sidebar__links:not(.custom) a span {
          font-size: 14px;
        }
        .sidebar__big .sidebar__links .howto-mobile span {
          font-size: 12px;
          line-height: 1.4;
          text-align: center;
        }
        .sidebar__links + .sidebar__menu {
          margin-top: 20px;
        }
        .sidebar__big a[href*="?modal=bonus-request"] span {
        	font-size: 16px !important;
        	font-weight: 700;
        	text-transform: uppercase;
        	margin-left: 0 !important;
        }
        .sidebar__nav a {
          border: none;
          border-radius: 999px;
        }
        .sidebar__nav-small a,
        .sidebar__nav-small button {
          border: none;
        }
        .sidebar__nav--collapse {
          border: none;
          border-radius: 10px;
        }
        @keyframes menuShakeAnimation {
          0% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-2px);
          }
          50% {
            transform: translateX(2px);
          }
          75% {
            transform: translateX(-2px);
          }
          100% {
            transform: translateX(0);
          }
        }
        .sidebar__content a:hover svg,
        .sidebar__nav-small button:hover svg {
          animation: menuShakeAnimation 0.4s ease;
        }
        .sidebar__content .svg-icon {
          transition: none;
        }
        .sidebar__content .svg-icon use {
          stroke: transparent;
        }
        .sidebar__content .svg-icon use[href*="homepage"] {
          color: var(--menu-group1);
        }
        .sidebar__content .svg-icon use[href*="big-win"] {
          color: var(--menu-group1);
        }
        .sidebar__content .svg-icon use[href*="vip-club"] {
          color: var(--menu-group1);
        }
        .sidebar__content .svg-icon use[href*="blog"] {
          color: var(--menu-group1);
        }
        .sidebar__content .svg-icon use[href*="casino2"] {
          color: var(--menu-group1);
        }
        .sidebar__content .svg-icon use[href*="gamer"] {
          color: var(--menu-group1);
        }
        .sidebar__content .svg-icon use[href*="chart"] {
          color: var(--menu-group1);
        }
        .sidebar__content .svg-icon use[href*="slots2"] {
          color: var(--menu-group2);
        }
        .sidebar__content .svg-icon use[href*="live-casino"] {
          color: var(--menu-group2);
        }
        .sidebar__content .svg-icon use[href*="sportsbook2"] {
          color: var(--menu-group2);
        }
        .sidebar__links.custom + div > span + ul .svg-icon use[href*="sportsbook"] {
          color: var(--menu-group1);
        }
        .sidebar__content .svg-icon use[href*="exclusive"] {
          color: var(--menu-group2);
        }
        .sidebar__content .svg-icon use[href*="virtual-sports"] {
          color: var(--menu-group2);
        }
        .sidebar__content .svg-icon use[href*="gift"] {
          color: var(--menu-group1);
        }
        .sidebar__content .svg-icon use[href*="tournaments"] {
          color: var(--menu-group1);
        }
        .sidebar__content .svg-icon use[href*="vip"] {
          color: var(--menu-group1);
        }
        .sidebar__content .svg-icon use[href*="challenge"] {
          color: var(--menu-group1);
        }
        .sidebar__content .svg-icon use[href*="stream"] {
          color: var(--menu-group1);
        }
        .sidebar__content .svg-icon use[href*="pokr-side"] {
          color: var(--menu-group1);
        }
        .sidebar__content .svg-icon use[href*="phone"] {
          color: var(--menu-group1);
        }
        .sidebar__content .svg-icon use[href*="sportsbook-basketball"] {
          color: var(--menu-group1);
        }
        .sidebar__content .svg-icon use[href*="affiliate"] {
          color: var(--menu-group1);
        }
        .sidebar__content .svg-icon use[href*="head-set"],
        .sidebar__content .svg-icon use[href*="headset"] {
          color: var(--menu-group2);
        }
        .sidebar__content .svg-icon use[href*="privacy"],
        .sidebar__content .svg-icon use[href*="shield"] {
          color: var(--menu-group2);
        }
        .sidebar__content .svg-icon use[href*="favourited"] {
          color: var(--menu-group1);
        }
        .sidebar__content .svg-icon use[href*="profile"] {
          fill: var(--menu-group1);
        }
        .sidebar__content li.active .svg-icon use {
          color: var(--tf-active);
          fill: var(--tf-active);
        }
        .sidebar__content .sidebar__nav--collapse .svg-icon use[href*="profile"],
        .sidebar__content .sidebar__nav--collapse .svg-icon use[href*="vip-club"] {
          color: var(--tf-tc);
          fill: var(--tf-tc);
        }
        .sidebar__content .sidebar__nav--collapse a:hover .svg-icon use[href*="profile"],
        .sidebar__content .sidebar__nav--collapse a:hover .svg-icon use[href*="vip-club"] {
          color: var(--tf-active);
          fill: var(--tf-active);
        }
        .sidebar__link.passive,
        .sidebar__link-small.passive {
          filter: contrast(0.75);
        }


        /* Lowbar */
        .lowbar {
          padding: 10px 5px !important;
        }
        .support {
          display: none !important;
        }


        /* Content */
        .container {
          max-width: 1440px;
        }
        @media screen and (min-width: 991px) {
          .container {
            padding-left: 35px;
            padding-right: 35px;
          }
        }
        .section {
          padding-top: 40px !important;
        }
        .section__title-wrap {
          margin-bottom: 10px;
        }
        .col-12 > .section__title {
          margin-bottom: 20px;
        }
        @media screen and (max-width: 768px) {
          #main:not(.main--game) #main__content {
            padding-top: 80px;
          }
          .section {
            padding-top: 0 !important;
          }
          .section__title-wrap {
            margin-bottom: 20px;
          }
        }
        .hero {
          border-radius: 15px;
        }
        .promo-post__date {
          display: none;
        }
        .promo-post__text {
          height: 72px;
        }
        .content__main--big {
          border-radius: 15px;
        }
        .content__main .tournament__cover {
          margin-top: 0;
          aspect-ratio: 1.816;
          margin-bottom: 35px;
          margin-left: auto;
          margin-right: auto;
          max-width: 525px;
        }
        .content__main .tournament__cover img {
          max-height: 100%;
          height: 100%;
          border-radius: 10px;
        }
        .post__cover {
          margin-bottom: 20px;
        }
        .post__meta {
          display: none;
        }
        .blog__cover {
          width: 100%;
          margin-bottom: 35px;
          margin-left: auto;
          margin-right: auto;
          max-width: 560px;
        }
        .blog__cover img {
          border-radius: 10px;
        }
        .ranking__list {
          overflow-y: hidden;
        }
        .section__title {
          text-transform: capitalize;
        }
        .filter .settings__btn {
          width: unset;
          padding: 4px 22px;
        }
        .tabs-nav {
          padding: 0;
        }


        /* Games */
        .slot {
          border-radius: 15px;
          padding-top: 0 !important;
        }
        .slot__cover {
          padding-bottom: 135%;
        }
        .slot__img {
          aspect-ratio: 0.741;
          transform: none !important;
        }
        .slot__img img {
          width: 100%;
          height: 100%;
        }
        .slot[href*="/ebetlab"] .game-provider {
          visibility: hidden;
        }
        .slot[href*="/ebetlab"] .game-provider::after {
          content: 'Jackbom Originals';
          visibility: visible;
          position: absolute;
          left: 20px;
          bottom: 20px;
        }
        .slot[href*="/ebetlab"] .slot__img::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-position: center;
          background-size: cover;
        }
        .slot[href*="/ebetlab-mines"] .slot__img::after {
          background-image: url('https://jackbomcom.github.io/assets/images/f8qhx62bygzknud7.webp');
        }
        .slot[href*="/ebetlab-crash"] .slot__img::after {
          background-image: url('https://jackbomcom.github.io/assets/images/njec8zra74usb263.webp');
        }
        .slot[href*="/ebetlab-plinko"] .slot__img::after {
          background-image: url('https://jackbomcom.github.io/assets/images/r5h7b42vjgytnmdc.webp');
        }
        .slot[href*="/ebetlab-keno"] .slot__img::after {
          background-image: url('https://jackbomcom.github.io/assets/images/t3yfmdhwgxr59s4z.webp');
        }
        .slot[href*="/ebetlab-dice"] .slot__img::after {
          background-image: url('https://jackbomcom.github.io/assets/images/t94nj537e6dmf8xh.webp');
        }
        .slot__title {
          height: 100%;
          background: linear-gradient(0deg, #ff4001cc 60%, transparent 100%);
          display: flex;
          justify-content: flex-end;
          align-items: center;
          padding: 20px;
          gap: 8px;
          opacity: 0;
          pointer-events: none;
          transition: all 0.4s;
        }
        .slot__title::before {
          content: '\f04b';
          font-family: 'Font Awesome 6 Free';
          font-weight: 900;
          font-size: 32px;
          width: 64px;
          height: 64px;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: #fff3;
          border-radius: 100%;
          padding-left: 6px;
          position: absolute;
          top: 25%;
          transform: scale(0.5);
          transition: all 0.4s;
        }
        .slot__title h3 {
          margin-bottom: 0;
          font-size: 16px;
          text-transform: capitalize;
          font-weight: 500;
          line-height: 20px;
          text-align: left;
          text-shadow: 0 0 2px #000;
          width: 100%;
        }
        .slot__title span {
          margin-bottom: 0;
          text-transform: capitalize;
          text-align: left;
          font-size: 12px;
          width: 100%;
        }
        .slot__pos {
          text-shadow: 0 0 2px #000;
          font-size: 16px;
          height: 26px;
          z-index: 11;
          background-color: var(--tf-active) !important;
        }
        @media screen and (min-width: 600px) {
          .slot {
            margin-top: 10px;
          }
          /*
          .slot:hover {
            box-shadow: rgb(255 64 1 / 75%) 0px 7px 29px -3px !important;
          }
          */
          .slot:hover .slot__title {
            opacity: 1;
            pointer-events: all;
          }
          .slot:hover .slot__title::before {
            transform: none;
          }
          .slot:hover .slot__img {
            filter: blur(2px) brightness(0.8);
            transform: scale(1.05) !important;
          }
        }
        @media screen and (max-width: 600px) {
          .slot:hover {
            transform: none !important;
          }
          .slot__pos {
            font-size: 14px;
            height: 24px;
          }
        }


        /* Big wins */
        .section.big-wins .splide__slide {
          width: 100%;
          border-radius: 0;
        }
        .kush {
          overflow: hidden !important;
          position: relative;
        }
        .kush__cover {
          border-radius: 0;
          width: 100%;
          height: unset !important;
          aspect-ratio: 0.7411;
          border-radius: 10px;
        }
        .kush__cover img {
          border-radius: 0;
        }
        .kush__winner {
          z-index: 1;
        }
        .kush__title {
          display: none;
        }
        .kush .chat__user {
          margin-right: 10px;
          margin-top: 8px;
        }
        .kush__prize {
          color: var(--tf-active);
          margin-bottom: 10px;
        }
        .kush .rank-icon {
          width: 24px !important;
          height: 24px !important;
        }


        /* Mini games */
        .mini-game {
          border-radius: 20px;
        }
        .mini-game__img img {
          object-fit: cover;
          width: 100%;
          height: 100%;
        }
        .mini-game__title {
          display: none;
        }
        @media screen and (max-width: 768px) {
          .mini-game:hover .mini-game__img {
            transform: none;
          }
        }


        /* Game detail */
        .frame-mob .slot:hover {
          box-shadow: none !important;
          transform: none;
        }
        .frame-mob .slot__title h3 {
          font-size: 14px;
          line-height: 16px;
          height: 32px;
          margin-bottom: 5px;
        }
        .frame-mob .slot__title span {
          font-size: 10px;
        }
        .frame-mob__btns,
        .frame__btns {
          gap: 30px;
          align-items: stretch;
        }
        .frame__btn {
          padding: 12px 24px;
          width: 50%;
          height: unset;
          margin-right: 0 !important;
        }
        .frame__btn:hover {
          color: #fff !important;
        }
        .frame__play {
          padding: 12px 24px;
          width: 50%;
          height: unset;
          gap: 0;
        }
        .frame__play svg {
          display: none;
        }
        .frame__logo {
          background-image: var(--tf-logo);
        }
        @media screen and (max-width: 768px) {
          .frame-mob__btns,
          .frame__btns {
            gap: 15px;
          }
        }
        .frame__play {
          transform: scale(0.9);
        }


        /* Providers */
        .partner {
          border-radius: 0;
          border: none;
          padding: 0 !important;
          min-height: 100px;
          animation: none;
          margin-top: 10px !important;
        }
        .partner img {
          max-width: 50%;
        }
        .partner[href*="/providers/ebetlab"]::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: var(--tf-logo2) center center no-repeat;
          background-size: 50%;
          z-index: 11;
          filter: invert(1) grayscale(1);
        }
        .partner[href*="/providers/ebetlab"] .partner__logo {
          display: none;
        }
        .swiper.providers .swiper-slide {
          margin-right: 0 !important;
        }
        @media screen and (max-width: 576px) {
          .partner {
            margin-top: 0 !important;
          }
          .partner::before {
            display: none;
          }
        }


        /* Vip */
        .progress-wrapper {
          background-color: var(--tf-bg2);
          position: relative;
          overflow: hidden;
          padding: 12px 24px !important;
        }
        .progress-wrapper::before {
          display: none;
        }
        .modal__progress-bar {
          height: 10px;
          border-radius: 999px;
          border: none;
          background-color: #59595933;
        }
        .modal__progress-bar span {
          height: 6px;
        }
        .modal__icon {
          background-color: #59595940;
        }
        .modal__user p {
          color: var(--tf-tc);
          font-weight: 500;
        }
        #now2-rank,
        #next-rank {
          align-items: center;
        }
        .progress-wrapper .rank-icon,
        .ranking .rank-icon {
          width: 50px !important;
          height: 50px !important;
        }
        .vip {
          justify-content: flex-end;
          aspect-ratio: 3/1;
          border-radius: 15px;
        }
        .vip__title,
        .vip__text,
        .vip__btn {
          display: none;
        }
        .vip:before {
          filter: none;
        }
        #body.lang--tr .vip:before {
          background: url('https://jackbomcom.github.io/assets/images/65cxfm8nbkr932pe.webp') center center/contain no-repeat;
        }
        #body.lang--en .vip:before {
          background: url('https://jackbomcom.github.io/assets/images/6djmgeuc8qxpf5yb.webp') center center/contain no-repeat;
        }
        @media screen and (max-width: 768px) {
          .vip {
            aspect-ratio: 16/9;
          }
          #body.lang--tr .vip:before {
            background: url('https://jackbomcom.github.io/assets/images/rmwqnh6a7bpk3z29.webp') center center/contain no-repeat;
          }
          #body.lang--en .vip:before {
            background: url('https://jackbomcom.github.io/assets/images/sy86pvje9gwz7tq4.webp') center center/contain no-repeat;
          }
        }
        .ranking::after {
          content: '';
          width: 100%;
          height: 100%;
          position: absolute;
          bottom: -120px;
          right: -120px;
          background-position: center;
          background-size: 100%;
          background-repeat: no-repeat;
          opacity: 0.1;
          transform: rotate(-20deg);
          transition: all 0.4s;
        }
        .ranking:hover::after {
          bottom: -100px;
          right: -100px;
          transform: rotate(-10deg);
          opacity: 0.2;
        }
        .ranking p {
          transition: all 0.4s;
        }
        .ranking:hover p {
          color: #babbc4;
        }
        .ranking.state-slug-classic::after {
          background-image: url('https://vendor-provider.fra1.digitaloceanspaces.com/ebetlab/vip-states/nTRaQbwA4VntuzQ2gp3Qxuda7u5W8exG/2PUIxjLbmKdfkXc5LV3VgsFmLfAHIOqm2WS1gdjZ.png');
        }
        .ranking.state-slug-bronzi::after {
          background-image: url('https://vendor-provider.fra1.digitaloceanspaces.com/ebetlab/vip-states/nTRaQbwA4VntuzQ2gp3Qxuda7u5W8exG/UHHPE63JaUaFrNwmunlAkc4x2EuVqlH5ihP4AuJ4.png');
        }
        .ranking.state-slug-bronzii::after {
          background-image: url('https://vendor-provider.fra1.digitaloceanspaces.com/ebetlab/vip-states/nTRaQbwA4VntuzQ2gp3Qxuda7u5W8exG/jhP5DPwUak0OEt9vK2f7cOSLQdvHJl7OtF8vhyUi.png');
        }
        .ranking.state-slug-bronziii::after {
          background-image: url('https://vendor-provider.fra1.digitaloceanspaces.com/ebetlab/vip-states/nTRaQbwA4VntuzQ2gp3Qxuda7u5W8exG/hvIecCKm7sR6q3fAwKpna2kgPglchk7QNdQxObiI.png');
        }
        .ranking.state-slug-silveri::after {
          background-image: url('https://vendor-provider.fra1.digitaloceanspaces.com/ebetlab/vip-states/nTRaQbwA4VntuzQ2gp3Qxuda7u5W8exG/GkAZXguX64rStHgT3uLox1BlshfiabzK0VtHPyeH.png');
        }
        .ranking.state-slug-silverii::after {
          background-image: url('https://vendor-provider.fra1.digitaloceanspaces.com/ebetlab/vip-states/nTRaQbwA4VntuzQ2gp3Qxuda7u5W8exG/X5nfP2GE9nhLcFoCqDIWnKno2q3f9t4ADZ8cDOp1.png');
        }
        .ranking.state-slug-silveriii::after {
          background-image: url('https://vendor-provider.fra1.digitaloceanspaces.com/ebetlab/vip-states/nTRaQbwA4VntuzQ2gp3Qxuda7u5W8exG/6ZCnKjGc7UuBWWjowbFaOb5n0OQ2SyksLuWZoMIi.png');
        }
        .ranking.state-slug-goldi::after {
          background-image: url('https://vendor-provider.fra1.digitaloceanspaces.com/ebetlab/vip-states/nTRaQbwA4VntuzQ2gp3Qxuda7u5W8exG/SA8UPMHuGikTYC7qcWo7VTtV2wztFC1R1fA4Nknw.png');
        }
        .ranking.state-slug-goldii::after {
          background-image: url('https://vendor-provider.fra1.digitaloceanspaces.com/ebetlab/vip-states/nTRaQbwA4VntuzQ2gp3Qxuda7u5W8exG/G081tbn7VlaYS7ySlK8isgCq6w8uD9l6cTacgI2h.png');
        }
        .ranking.state-slug-goldiii::after {
          background-image: url('https://vendor-provider.fra1.digitaloceanspaces.com/ebetlab/vip-states/nTRaQbwA4VntuzQ2gp3Qxuda7u5W8exG/312SjeJ2prRKmvoAR7HQu8u72Ftqnju9bGZtUr9c.png');
        }
        .ranking.state-slug-platinumi::after {
          background-image: url('https://vendor-provider.fra1.digitaloceanspaces.com/ebetlab/vip-states/nTRaQbwA4VntuzQ2gp3Qxuda7u5W8exG/th9iwpZpcZgas4elzYeUT6QJjmp6BXjdnhiKhlw9.png');
        }
        .ranking.state-slug-platinumii::after {
          background-image: url('https://vendor-provider.fra1.digitaloceanspaces.com/ebetlab/vip-states/nTRaQbwA4VntuzQ2gp3Qxuda7u5W8exG/R3EatRIuwJ7Av72XpD4bEXgajpcHwDgROisEcH35.png');
        }
        .ranking.state-slug-platinumiii::after {
          background-image: url('https://vendor-provider.fra1.digitaloceanspaces.com/ebetlab/vip-states/nTRaQbwA4VntuzQ2gp3Qxuda7u5W8exG/Ggr9L4IPlVK5F8m9uoCIUeHAdgy9O0WZAA6RaSIJ.png');
        }
        .ranking.state-slug-platinumiv::after {
          background-image: url('https://vendor-provider.fra1.digitaloceanspaces.com/ebetlab/vip-states/nTRaQbwA4VntuzQ2gp3Qxuda7u5W8exG/ukgSa8BIoXdQPpegvc0Mmcnju7g6YRss6w88DkZa.png');
        }
        .ranking.state-slug-platinumv::after {
          background-image: url('https://vendor-provider.fra1.digitaloceanspaces.com/ebetlab/vip-states/nTRaQbwA4VntuzQ2gp3Qxuda7u5W8exG/3srK25NQMnUwT4J24FrO1dRrzyPBKGNFM1gghAOZ.png');
        }
        .ranking.state-slug-diamondi::after {
          background-image: url('https://vendor-provider.fra1.digitaloceanspaces.com/ebetlab/vip-states/nTRaQbwA4VntuzQ2gp3Qxuda7u5W8exG/pFgz00nunUwxVPyzpeIx8utJsvAn1mjPk9enI2NE.png');
        }
        .ranking.state-slug-diamondii::after {
          background-image: url('https://vendor-provider.fra1.digitaloceanspaces.com/ebetlab/vip-states/nTRaQbwA4VntuzQ2gp3Qxuda7u5W8exG/ete7zxYke20jWbMw6NHx2jOatS2fh2ShDpTuKTI9.png');
        }
        .ranking.state-slug-diamondiii::after {
          background-image: url('https://vendor-provider.fra1.digitaloceanspaces.com/ebetlab/vip-states/nTRaQbwA4VntuzQ2gp3Qxuda7u5W8exG/lLndqI2VtokDRKiZb9Yl7ySfP7pROukg7KD4ACkN.png');
        }
        .ranking.state-slug-diamondiv::after {
          background-image: url('https://vendor-provider.fra1.digitaloceanspaces.com/ebetlab/vip-states/nTRaQbwA4VntuzQ2gp3Qxuda7u5W8exG/lvkKoLL01t8ltMyDsucRa4RLYEzdfd3Tubx30ll6.png');
        }
        .ranking.state-slug-jack::after {
          background-image: url('https://vendor-provider.fra1.digitaloceanspaces.com/ebetlab/vip-states/nTRaQbwA4VntuzQ2gp3Qxuda7u5W8exG/aHSFQLk9DKzUzR94wcLBiJoWxbT5CRyIWHhxUwQx.png');
        }
        .ranking.state-slug-jackbom::after {
          background-image: url('https://vendor-provider.fra1.digitaloceanspaces.com/ebetlab/vip-states/nTRaQbwA4VntuzQ2gp3Qxuda7u5W8exG/lBr458pB0bQv8pLrVrXZgufGOFGav26KNetIjO1h.png');
        }


        /* Profile */
        .accordion-benefits__card--silver .settings__container::before,
        .accordion-benefits__card--gold .settings__container::before,
        .accordion-benefits__card--rose .settings__container::before {
          content: ' Talep edilmediği sürece bu alan zorunlu değildir.';
          color: var(--tf-active);
          font-weight: bold;
          display: block;
        }
        @media screen and (min-width: 768px) {
          .accordion-benefits__card--silver .settings__container::before,
          .accordion-benefits__card--gold .settings__container::before,
          .accordion-benefits__card--rose .settings__container::before {
            margin-top: 15px;
          }
        }


        /* Modals */
        /*
        #wallet-modal .form__note {
          font-size: 14px;
          background-color: var(--tf-active);
          color: var(--tf-tc);
          padding-top: 0;
          border-radius: 10px;
          margin-top: 30px;
          padding: 10px 15px !important;
          text-align: center;
          font-style: normal;
        }
        #wallet-modal .form__note:hover {
          background-color: #fff;
          color: #000;
        }
        */
        #wallet-modal .form__note {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 8px;
          padding-top: 30px;
          border-top: 1px solid var(--tf-border);
          font-style: normal;
          font-size: 14px;
          line-height: 22px;
          font-weight: bold;
          color: var(--tf-active);
          max-width: 528px;
          margin: auto;
          margin-top: 30px;
        }
        #wallet-modal .form__note::after {
          content: 'BİLGİLERİ DOĞRULA';
          display: flex;
          justify-content: center;
          align-items: center;
          height: 46px;
          background: var(--tf-active-opacity);
          border-radius: 8px;
          border: 1px solid var(--tf-border);
          padding: 0 20px;
          color: var(--tf-tc);
          white-space: nowrap;
          font-weight: 500;
          line-height: 20px;
        }
        #wallet-modal .form__cellar {
          max-width: 528px;
          margin-left: auto;
          margin-right: auto;
          justify-content: space-between;
          gap: 8px;
        }
        #deposit-modal .deposit__title {
          font-size: 12px;
        }
        /*
        #wallet-modal .form__description {
          visibility: hidden;
        }
        #wallet-modal .form__description::after {
          content: 'Minimum çekim 100.00000000 TRY.';
          visibility: visible;
          display: block;
        }
        */
        #global-modal .modal-content {
          background-color: var(--tf-bg2);
          margin: 10px;
          padding: 10px;
          overflow: hidden;
          border-radius: 20px;
        }
        #global-modal .modal__head {
          justify-content: end;
          padding-right: 0;
          margin-bottom: 10px;
        }
        #global-modal .modal__head::after {
          content: '';
          position: absolute;
          top: 5px;
          left: 50%;
          transform: translateX(-50%);
          width: 120px;
          height: 5px;
          background-color: var(--tf-tc2);
          border-radius: 999px;
          pointer-events: none;
        }
        #global-modal .modal__img {
          border-radius: 15px;
        }
        @media screen and (min-width: 1200px) {
          #signin-modal .modal__content {
            height: 548px;
          }
        }
        .custom-modal-content {
          display: flex;
          gap: 20px;
          margin-top: 30px;
        }
        .howto-buttons {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .howto-button {
          padding: 10px 20px;
          background: linear-gradient(180deg, rgba(255, 64, 1, 0.2) 0%, rgba(255, 64, 1, 0.05) 100%);
          border-radius: 8px;
          color: #fff;
          cursor: pointer;
          display: block;
          width: 100%;
          opacity: 0.5;
          font-size: 18px;
        }
        .howto-button.selected {
          opacity: 1;
          color: var(--tf-active);
        }
        .howto-video {
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .howto-video iframe {
          border-radius: 8px;
        }
        @media screen and (max-width: 768px) {
          .custom-modal-content {
            flex-direction: column;
            margin-top: 20px;
            gap: 15px;
          }
          .howto-buttons {
            flex-wrap: wrap;
            flex-direction: row;
            gap: 5px;
          }
          .howto-button {
            padding: 6px 12px;
            text-align: center;
            border-radius: 6px;
            display: inline-block;
            width: unset;
            flex: 1;
            white-space: nowrap;
            font-size: 16px;
          }
          .howto-video iframe {
            border-radius: 6px;
          }
        }


        /* Footer */
        .conversion-wrapper {
          margin-top: 60px;
          justify-content: flex-start;
          padding-top: 0;
        }
        @media screen and (max-width: 768px) {
          .conversion-wrapper {
            margin-top: 30px;
          }
        }
        .footer__accepted {
          padding: 20px;
          flex-wrap: nowrap;
          overflow-y: auto;
          gap: 20px;
          border-radius: 15px;
        }
        .footer__accepted li:before {
          display: none;
        }
        .footer__accepted li {
          padding: 0;
          margin: 0;
          flex-direction: column;
          gap: 6px;
        }
        .instrument-icon-wrapper {
          width: 1.6rem;
          height: 1.6rem;
          border-radius: 100%;
        }
        .footer__logo {
          background: var(--tf-logo) no-repeat left center;
        }


        /* Buttons */
        .section__view,
        .tabs-nav__btn.active,
        .table-wrap__select,
        #custom-section-12 .spin-button,
        #custom-section-10 .signup-button,
        #custom-section-7 .back-button {
          border-color: var(--tf-active) !important;
          background: none !important;
          background-color: var(--tf-active-opacity) !important;
        }
        .section__view:hover,
        .tabs-nav__btn.active:hover,
        #custom-section-12 .spin-button:hover,
        #custom-section-10 .signup-button:hover,
        #custom-section-7 .back-button:hover {
          background-color: var(--tf-active) !important;
          color: var(--tf-tc) !important;
        }
        .table-wrap__select.ss-content {
          background-color: var(--tf-bg) !important;
        }
        .glow-on-hover {
          position: relative;
          z-index: 0;
          font-weight: 500;
        }
        .glow-on-hover:before {
          content: '';
          background: linear-gradient(45deg, #ff0000, #ff7300, #fffb00, #48ff00, #00ffd5, #002bff, #7a00ff, #ff00c8, #ff0000);
          position: absolute;
          top: -2px;
          left:-2px;
          background-size: 400%;
          z-index: -1;
          filter: blur(12px);
          width: calc(100% + 4px);
          height: calc(100% + 4px);
          animation: glowing 50s linear infinite;
          transition: opacity 0.3s ease-in-out;
          border-radius: 8px;
          opacity: 0.2;
        }
        .glow-on-hover:after {
          z-index: -1;
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          left: 0;
          top: 0;
          border-radius: 8px;
        }
        @keyframes glowing {
          0% {
            background-position: 0 0;
          }
          50% {
            background-position: 400% 0;
          }
          100% {
            background-position: 0 0;
          }
        }
        .header-custom-button {
          background: linear-gradient(180deg, rgba(255, 64, 1, 0.2) 0%, rgba(255, 64, 1, 0.05) 100%);
          height: 46px;
          gap: 10px;
          border-radius: 8px;
          font-weight: 500;
        }
        .header-custom-button:hover {
          color: var(--tf-active) !important;
        }
        .header__wallet-btn svg {
          display: none;
        }
        .header__wallet-btn::after {
          content: '\\24';
          font-family: 'Font Awesome 6 Free';
          font-weight: 900;
          font-size: 22px;
          color: var(--tf-tc) !important;
        }
        @media screen and (max-width: 600px) {
          .header-custom-button {
            display: none !important;
          }
        }
        .howto2-desktop {
          width: 150px;
          display: none !important;
        }
        .howto2-desktop i {
          font-size: 18px;
        }
        .howto2-desktop span {
          font-size: 14px;
          line-height: 1.2;
          text-align: center;
        }
        @media screen and (min-width: 600px) and (max-width: 1300px) {
          .header__wallet-dropdown {
            position: absolute;
            top: 0;
            right: 50px;
            width: 60px;
            overflow: hidden;
            pointer-events: none;
          }
          #dropdownWalet > div {
            position: relative;
          }
          #dropdownWalet > div::after {
            content: '';
            position: absolute;
            top: 0;
            right: 0;
            width: 50px;
            height: 100%;
            background: linear-gradient(to right, transparent, var(--tf-bg));
          }
          .header__wallet-btn {
            margin-left: 60px;
          }
          .header__wallet:hover .header__wallet-dropdown {
            position: unset;
            pointer-events: all;
            width: 174px;
            transition: width 0.1s ease-in-out;
          }
          .header__wallet:hover .header__wallet-btn {
            margin-left: unset;
          }
          .header__wallet:hover #dropdownWalet > div::after {
            display: none;
          }
        }
        @media screen and (max-width: 992px) {
          .header__wallet:hover .header__wallet-dropdown {
            width: 160px;
          }
        }
        @media screen and (max-width: 768px) {
          .header__wallet:hover .header__wallet-dropdown {
            width: 150px;
          }
        }


        /* Home page custom. */
        .page--home .section.pt-24,
        .section.mini-slider {
          display: none !important;
        }
        .page--home .section.section--last {
          padding-bottom: 0;
        }
        .section.pt-24 .mySwiper,
        .section.pt-24 .id-t-d,
        .section.pt-24 .id-t-d+div {
          opacity: 0;
        }


        /* Promo page custom. */
        .page--promo .nav-tabs .nav-item:nth-child(1) {
          display: none;
        }


        /* Tv page custom. */
        .page--tv .section--first {
          padding: 0 !important;
        }


        /* Big wins page custom. */
        .custom-bigwins {
          display: flex;
          gap: 40px;
          flex-wrap: wrap-reverse;
        }
        .custom-bigwins iframe {
          border-radius: 10px;
          flex: 1 1 25%;
          box-shadow: 0 0 0 6px var(--tf-active-opacity);
        }
        @media screen and (max-width: 768px) {
          .custom-bigwins {
            padding: 30px 20px;
            gap: 30px;
          }
        }


        /* General custom. */
        @media screen and (max-width: 768px) {
          /*
          div[id*='comm100-'] {
            display: none !important;
          }
          */
        }
        @media screen and (min-width: 768px) {
          div[id*='comm100-'] iframe {
            display: block !important;
          }
          body.chat-active div[id*='comm100-'] {
            display: none !important;
          }
        }


        /* 0 */
        .sidebar__menu.custom .icon {
          width: 24px;
        }


        /* 1 */
        #custom-section-1 .swiper-button {
          background-color: #00000066;
          width: 54px;
          height: 54px;
          transition: all 0.1s;
        }
        #custom-section-1:hover .swiper-button {
          opacity: 1 !important;
        }
        #custom-section-1 .swiper-button::after {
          color: #fff;
          font-size: 22px;
          background-color: transparent !important;
        }
        #custom-section-1 .swiper-button-prev {
          left: 20px;
        }
        #custom-section-1 .swiper-button-next {
          right: 20px;
        }
        @media screen and (max-width: 768px) {
          #custom-section-1 .swiper-button {
            width: 44px;
            height: 44px;
          }
          #custom-section-1 .swiper-button::after {
            font-size: 18px;
          }
          #custom-section-1 .swiper-button-prev {
            left: 45px;
          }
          #custom-section-1 .swiper-button-next {
            right: 45px;
          }
        }
        #custom-section-1 .swiper-button-disabled {
          display: none;
        }
        #custom-section-1 .swiper-pagination-progressbar {
          background-color: var(--tf-active-opacity);
          height: 2px;
          width: 100% !important;
          padding: 0;
        }
        #custom-section-1 .swiper-pagination-progressbar-fill {
          background-color: var(--tf-active);
        }
        @media screen and (min-width: 768px) {
          #custom-section-1 .swiper-pagination {
            width: auto !important;
            left: 50%;
            transform: translateX(-50%);
            padding: 8px;
            border-radius: 999px;
            background-color: #00000066;
            bottom: 15px;
            display: flex;
          }
          #custom-section-1 .swiper-pagination {
            opacity: 0.25;
          }
          #custom-section-1:hover .swiper-pagination {
            opacity: 1;
          }
          #custom-section-1 .swiper-pagination-bullet {
            width: 8px;
            height: 8px;
          }
          #custom-section-1 .swiper-pagination-bullet {
            background-color: var(--tf-active);
          }
        }


        /* 2 */
        #custom-section-2 .landing {
          background: linear-gradient(to right, #ff40011a 25%, #ff400105);
        }
        #custom-section-2 .landing::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: 100%;
          pointer-events: none;
          background-size: 20% !important;
          background: url('https://jackbomcom.github.io/assets/images/t4pe27vgd9w8nja3.webp');
          background-position: right !important;
          transform: rotate(-9deg) scale(1.8);
          filter: brightness(0.3);
          opacity: 0.1;
        }
        #custom-section-2 .progress-wrapper {
          margin: auto;
          max-width: 30vw !important;
          border: 2px solid var(--tf-tc2);
          border-radius: 15px;
        }
        @media screen and (max-width: 992px) {
          #custom-section-2 .progress-wrapper {
            max-width: calc(100% - 24px) !important;
          }
        }
        #custom-section-2 .card {
          transition: all 0.2s;
        }
        @media screen and (max-width: 576px) {
          #custom-section-2 .landing {
            background: linear-gradient(to bottom, #ff40011a 30%, #ff400105);
          }
          #custom-section-2 .progress-wrapper {
            box-shadow: none !important;
          }
          #custom-section-2 .landing::before {
            background-size: 80% !important;
          }
        }
        @media screen and (min-width: 768px) {
          #custom-section-2 .card {
            max-width: 200px;
          }
        }
        #custom-section-2 .card:hover {
          transform: scale(0.96);
        }


        /* 4 */
        #custom-section-4 .landing {
          background-color: var(--tf-bg2);
        }
        #custom-section-4 .landing::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: 100%;
          pointer-events: none;
          background-size: cover !important;
          background-position: center !important;
          transform: rotate(-10deg) scale(1.6);
        }
        #custom-section-4 .landing.casino {
          background-color: #ff1744;
        }
        #custom-section-4 .landing.casino::before {
          background: url('https://jackbomcom.github.io/assets/images/pux96raqtbwz74ym.webp');
          opacity: 0.5;
        }
        #custom-section-4 .landing.sports {
          background-color: #003c8f;
        }
        #custom-section-4 .landing.sports::before {
          background: url('https://jackbomcom.github.io/assets/images/7ur4nmdv8639wpat.webp');
          opacity: 0.3;
        }
        #custom-section-4 .landing-inner {
          max-width: calc(100% - 380px);
        }
        #custom-section-4 .landing-button {
          font-weight: 500;
          padding: 12px 24px;
        }
        #custom-section-4 .landing.casino .landing-button {
          background-color: #9d1d35;
        }
        #custom-section-4 .landing.sports .landing-button {
          background-color: #0b2c60;
        }
        #custom-section-4 .details {
          background-color: #00000040;
        }
        #custom-section-4 .landing.casino .details::-webkit-scrollbar-track {
          background: transparent;
        }
        #custom-section-4 .landing.casino .details::-webkit-scrollbar-thumb {
          background: #ff1744;
        }
        #custom-section-4 .landing.sports .details::-webkit-scrollbar-track {
          background: transparent;
        }
        #custom-section-4 .landing.sports .details::-webkit-scrollbar-thumb {
          background: #003c8f;
        }
        @media screen and (min-width: 768px) {
          #custom-section-4 .icon-text {
            font-size: 1.25rem;
          }
        }
        #custom-section-4 .landing-image {
          aspect-ratio: 0.6933;
          right: 10px;
          height: calc(100% + 80px);
        }
        #custom-section-4 .landing-image-mobile {
          aspect-ratio: 0.6933;
        }
        @media screen and (max-width: 992px) {
          #custom-section-4 .landing-inner {
            max-width: 100%;
          }
          #custom-section-4 .landing-image-mobile {
            height: 300px;
          }
        }
        @media screen and (max-width: 768px) {
          #custom-section-4 .landing::before {
            transform: none;
            background-position: left !important;
          }
          #custom-section-4 .landing-image-mobile {
            height: 250px;
          }
          #custom-section-4 .item {
            flex: calc(50% - 2rem);
          }
          #custom-section-4 .details {
            overflow-x: hidden !important;
          }
          #custom-section-4 .icon-text {
            white-space: normal !important;
          }
          #custom-section-4 .landing-button {
            width: 100%;
          }
        }


        /* 5 */
        #custom-section-5 .landing {
          background-color: var(--tf-active);
        }
        #custom-section-5 .landing::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: 100%;
          pointer-events: none;
          background-size: cover !important;
          background: url('https://jackbomcom.github.io/assets/images/6wfm3xqhkdr4ejnc.webp');
          filter: brightness(0.6);
          background-position: center !important;
          transform: rotate(-10deg) scale(1.6);
        }
        #custom-section-5 .landing-inner {
          max-width: 1200px;
        }
        #custom-section-5 .crypto-slider {
          max-width: 325px;
        }
        @media screen and (max-width: 992px) {
          #custom-section-5 .crypto-slider {
            max-width: 225px;
          }
        }
        @media screen and (max-width: 768px) {
          #custom-section-5 .landing::before {
            transform: none;
            background-position: left !important;
          }
          #custom-section-5 .crypto-slider {
            max-width: 175px;
          }
        }
        #custom-section-5 .swiper-slide-shadow {
          display: none;
        }
        #custom-section-5 .details p {
          font-weight: 500;
        }
        @media screen and (max-width: 576px) {
          #custom-section-5 .second-text {
            font-size: 1rem !important;
          }
        }


        /* 6 */
        #custom-section-6 .card-grid {
          height: 400px;
        }
        #custom-section-6 .card {
          flex: 33.333%;
          transition: all 0.2s;
        }
        #custom-section-6 .card:hover {
          flex: 0 0 600px;
        }
        @media screen and (max-width: 1600px) {
          #custom-section-6 .card-grid {
            height: 350px;
          }
          #custom-section-6 .card:hover {
            flex: 0 0 525px;
          }
        }
        @media screen and (max-width: 1400px) {
          #custom-section-6 .card-grid {
            height: 300px;
          }
          #custom-section-6 .card:hover {
            flex: 0 0 450px;
          }
        }
        @media screen and (max-width: 768px) {
          #custom-section-6 .card-grid {
            height: auto;
          }
          #custom-section-6 .card {
            max-height: 225px;
            aspect-ratio: 4/3;
          }
        }


        /* 7 */
        #custom-section-7 .back-button {
          font-weight: 500;
          padding: 0 20px;
          height: 46px;
        }


        /* 8 */
        #custom-section-8 .league {
          transition: all 0.4s;
        }
        @media screen and (min-width: 768px) {
          #custom-section-8 .league:hover {
            transform: scale(0.96);
          }
        }


        /* 9 */
        #custom-section-9 .box {
          background-color: var(--tf-bg2);
        }
        #custom-section-9 .icon {
          width: 32px;
        }
        #custom-section-9 .icon-tournament {
          background: linear-gradient(-45deg, transparent, #1e90ff);
        }
        #custom-section-9 .icon-vip {
          background: linear-gradient(-45deg, transparent, #ffcc00);
        }
        #custom-section-9 .icon-promotion {
          background: linear-gradient(-45deg, transparent, #dc143c);
        }
        #custom-section-9 .icon-rtp {
          background: linear-gradient(-45deg, transparent, #228b22);
        }
        #custom-section-9 .box p {
          font-weight: 500;
        }


        /* 10 */
        #custom-section-10 .signup-button {
          font-weight: 500;
          padding: 12px 24px;
        }


        /* 12 */
        #custom-section-12 {
          padding-bottom: 40px;
        }
        @media screen and (min-width: 576px) {
          #custom-section-12 .landing {
            background: linear-gradient(to bottom, #ff40011a 25%, #ff400105);
          }
          #custom-section-12 .landing::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            height: 100%;
            width: 100%;
            pointer-events: none;
            background-size: 25% !important;
            background: url('https://jackbomcom.github.io/assets/images/t4pe27vgd9w8nja3.webp');
            background-position: right !important;
            transform: rotate(-9deg) scale(1.8);
            filter: brightness(0.3);
            opacity: 0.1;
          }
        }
        #custom-section-12 .chooser-inner {
          max-width: 500px;
          background-color: var(--tf-bg2);
        }
        #custom-section-12 .chooser-wrapper {
          max-height: 400px;
          background-color: var(--tf-bg);
        }
        #custom-section-12 .chooser-wrapper::before,
        #custom-section-12 .chooser-wrapper::after {
          content: '';
          position: absolute;
          left: 0;
          width: 100%;
          height: 20%;
          z-index: 1;
        }
        #custom-section-12 .chooser-wrapper::before {
          top: 0;
          background: linear-gradient(to bottom, var(--tf-bg), transparent);
        }
        #custom-section-12 .chooser-wrapper::after {
          bottom: 0;
          background: linear-gradient(to top, var(--tf-bg), transparent);
        }
        #custom-section-12 .chooser-list {
          gap: 10px;
        }
        @keyframes slotAnimation {
          0% {
            transform: translateY(var(--list-height));
          }
          100% {
            transform: translateY(calc(-1 * var(--list-height)));
          }
        }
        #custom-section-12 .chooser-list.spin {
          animation: slotAnimation 0.5s linear infinite;
        }
        #custom-section-12 .chooser-item {
          aspect-ratio: 0.7415;
        }
        #custom-section-12 .chooser-list.spin .slot {
          pointer-events: none;
          filter: blur(1px);
        }
        #custom-section-12 .slot {
          margin-top: 0 !important;
        }
        #custom-section-12 .slot:hover {
          transform: none;
        }
        #custom-section-12 .slot__title::before {
          top: 50%;
          transform: translateY(-50%);
        }
        #custom-section-12 .chooser-border {
          content: '';
          width: calc(100% - 3rem);
          transform: translateY(-50%);
          box-shadow: 0 0 0 6px var(--tf-active), 0 0 18px var(--tf-active), inset 0 0 12px var(--tf-bg);
        }
        #custom-section-12 .spin-button {
          font-weight: 500;
          padding: 12px 24px;
        }
        #custom-section-12 .spin-button.disabled {
          pointer-events: none;
          opacity: 0.3;
        }
      `;
        document.head.appendChild(style);
    })();

    (() => {
        const script = document.createElement("script");
        script.src = "//d1l6p2sc9645hc.cloudfront.net/gosquared.js";
        script.async = true;

        script.onload = () => {
            window._gs =
                window._gs ||
                function () {
                    (window._gs.q = window._gs.q || []).push(arguments);
                };

            _gs("GSN-473767-R");
            _gs("set", "anonymizeIP", true);
        };

        document.head.appendChild(script);
    })();

    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function (key, value) {
        const event = new Event("storageChange");
        originalSetItem.apply(this, arguments);
        if (key === "language") {
            document.dispatchEvent(event);
        }
    };

    let currentLanguage = window.localStorage.language || null;

    document.addEventListener("storageChange", () => {
        const newLanguage = window.localStorage.language;
        if (newLanguage !== currentLanguage) {
            currentLanguage = newLanguage;
            handleRouteChange();
        }
    });

    (async () => {
        try {
            loadResource("style", "https://fonts.googleapis.com/css2?family=Karla:ital,wght@0,200..800;1,200..800&display=swap");
            loadResource("style", "https://cdnjs.cloudflare.com/ajax/libs/Swiper/11.0.5/swiper-bundle.min.css");
            loadResource("style", "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.1/css/all.min.css");
            await loadResource("script", "https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js");

            await Promise.all([loadResource("script", "https://cdnjs.cloudflare.com/ajax/libs/Swiper/11.0.5/swiper-bundle.min.js")]);

            handleRouteChange();
        } catch (error) {
            console.error(error);
        }
    })();
})();
