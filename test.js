"use strict";
function Kinobox(n, t) {
    try {
        this.container = n instanceof Object ? n : document.querySelector(n);
        this.baseUrl = new URL(t.baseUrl || "https://kinobox.tv/");
        this.state = { visible: !1, isMenuOpen: !1, players: [] };
        this.search = t.search;
        this.settings = this.getSettings(t);
        this.hotkeys()
    } catch (i) {
        this.error(i)
    }
}
Kinobox.isMobile = function () {
    return "ontouchstart" in document.documentElement || window.screen.width < 500
};
Kinobox.prototype.log = function (n, t) {
    if (t) for (let i in t) n = n.replace("{" + i + "}", t[i]);
    console.info("[Kinobox] " + n)
};
Kinobox.prototype.error = function (n) {
    this.container.innerHTML = "";
    this.container.textContent = n + " " + n.stack;
    throw n;
};
Kinobox.prototype.fetch = function (n, t) {
    const r = { success: !1, data: null }, i = new XMLHttpRequest;
    i.onload = function () {
        if (i.status === 200) r.success = !0;
        else i.onerror(null)
    };
    i.onerror = function () {
        r.success = !1;
        console.error("Error " + i.status + ": " + i.statusText + "\n", i.response)
    };
    i.onloadend = function () {
        r.data = i.response;
        t.callback(r)
    };
    i.open("GET", n);
    i.setRequestHeader("Content-Type", "application/json");
    for (var u in t.headers) i.setRequestHeader(u, t.headers[u]);
    i.responseType = "json";
    i.send()
};
Kinobox.prototype.getSettings = function (n) {
    const t = {
        token: null,
        menu: {
            "default": "menuList", mobile: "menuButton",
            format: "{N} :: {T} ({Q})", limit: null, open: !1
        },
        players: {},
        params: {},
        hide: [],
        order: []
    };
    return n.token && (t.token = n.token),
        n.menu && Object.assign(t.menu, n.menu),
        n.players && (t.players = n.players),
        n.params && (t.params = n.params),
        n.hide && (t.hide = n.hide),
        n.order && (t.order = n.order), t
};
Kinobox.prototype.getSearchUrl = function (n, t) {
    const i = new URLSearchParams; t && i.set("token", t);
    n.kinopoisk && i.set("kinopoisk", n.kinopoisk);
    n.imdb && i.set("imdb", n.imdb);
    n.title && i.set("title", n.title);
    n.query && i.set("query", n.query);
    const r = this.baseUrl; return r.pathname = "api/players/main", r.search = i.toString(), r.toString()
};
Kinobox.prototype.hotkeys = function () {
    document.addEventListener("keypress", function (n) {
        const t = n.target.parentNode.firstElementChild.tagName;
        if (t !== "INPUT" && t !== "TEXTAREA") {
            const i = parseInt(n.key); i ? this.selectPlayer(i) : (n.key === "x" || n.key === "0") && this.showMenu(!this.state.isMenuOpen)
        }
    }.bind(this))
};
Kinobox.prototype.showLoader = function (n) {
    n ? this.loader.classList.remove("kinobox__hidden") : this.loader.classList.add("kinobox__hidden")
};
Kinobox.prototype.showMessage = function (n) {
    n ? (this.message.textContent = n, this.message.classList.remove("kinobox__hidden")) : (this.message.textContent = "", this.message.classList.add("kinobox__hidden"));
    this.showLoader(!1)
};
Kinobox.prototype.showMenu = function (n) {
    this.state.isMenuOpen = n;
    n ? this.ul.classList.add("active") : this.ul.classList.remove("active")
};
Kinobox.prototype.selectPlayer = function (n) {
    if (this.ul) {
        const i = '[data-number="{id}"]'.replace("{id}", n), t = this.ul.querySelector(i);
        t && t.click()
    }
};
Kinobox.prototype.showIframe = function (n) {
    this.log("Loading iframe: {url}", { url: n });
    this.showLoader(!0);
    const t = document.createElement("iframe");
    t.className = "kinobox__iframe";
    t.allowFullscreen = !0;
    t.frameBorder = "0";
    t.src = n;
    this.iframeWrapper.innerHTML = "";
    this.iframeWrapper.appendChild(t);
    const i = Date.now();
    t.addEventListener("load", function () {
        this.log("Iframe loaded in {time} ms: {url}", { time: Date.now() - i, url: t.src });
        this.showLoader(!1)
    }.bind(this))
};
Kinobox.prototype.init = function () {
    this.log("Initializing");
    const n = document.createElement("link");
    n.rel = "stylesheet";
    const t = this.baseUrl;
    t.pathname = "kinobox.min.css";
    n.href = t.toString();
    document.head.appendChild(n);
    typeof CSS != "undefined" && CSS.supports("aspect-ratio", "1/1") || (
        this.container.style.height = this.container.offsetWidth / 1.777777 + "px",
        this.container.style.maxHeight = this.container.offsetHeight + "px");
    this.buildContainer();
    this.log("Searching");
    const i = {
        headers: { "X-Href": location.href },
        callback: function (n) {
            try {
                if (!n.data) {
                    this.showMessage("Error loading data.");
                    return
                } if (n.data.message) {
                    this.showMessage(n.data.message);
                    return
                } if (n.data.length === 0) { this.showMessage("Видео не найдено."); return } this.state.players = n.data; this.buildMenu(); this.selectPlayer(1)
            } catch (t) { console.error(t); this.showMessage("Error loading data.") }
        }.bind(this)
    };
    Object.keys(this.settings.players).length && (i.headers["X-Settings"] = JSON.stringify(this.settings.players));
    this.fetch(this.getSearchUrl(this.search, this.settings.token), i)
};
Kinobox.prototype.buildContainer = function () {
    this.container.innerHTML = "";
    this.wrapper = document.createElement("div");
    this.wrapper.className = "kinobox__wrapper";
    this.container.appendChild(this.wrapper);
    this.loader = document.createElement("div");
    this.loader.className = "kinobox__loader";
    this.wrapper.appendChild(this.loader);
    this.message = document.createElement("div");
    this.message.className = "kinobox__message kinobox__hidden";
    this.wrapper.appendChild(this.message);
    this.iframeWrapper = document.createElement("div");
    this.iframeWrapper.className = "kinobox__iframeWrapper";
    this.wrapper.appendChild(this.iframeWrapper);
    this.nav = document.createElement("nav");
    this.nav.style.display = "none";
    this.nav.className = "kinobox__nav";
    this.wrapper.appendChild(this.nav)
};
Kinobox.prototype.buildMenu = function () {
    this.ul = document.createElement("ul");
    this.nav.appendChild(this.ul);
    this.buttonMenu = document.createElement("button");
    this.nav.appendChild(this.buttonMenu);
    Kinobox.isMobile() ?
        (this.nav.classList.add(this.settings.menu.mobile), this.buttonMenu.classList.add("mobileMenuButton"))
        :
        (this.nav.classList.add(this.settings.menu.default), this.settings.menu.default === "menuButton" && this.buttonMenu.classList.add("mobileMenuButton"));
    this.settings.menu.open && this.showMenu(!0);
    this.ul.addEventListener("mouseenter", function () {
        this.nav.classList.contains("menuList") && this.showMenu(!0)
    }.bind(this));
    this.ul.addEventListener("mouseleave", function () {
        this.nav.classList.contains("menuList") && this.showMenu(!1)
    }.bind(this));
    this.buttonMenu.addEventListener("click", function () {
        this.showMenu(!this.state.isMenuOpen)
    }.bind(this));
    let n = this.state.players;
    this.settings.hide.length > 0 && (n = this.state.players.filter(function (n) {
        return this.settings.hide.includes(n.source.toLowerCase()) === !1
    }.bind(this)));
    this.settings.order.length > 0 && (n = n.sort(function (n, t) {
        return this.settings.order.indexOf(t.source.toLowerCase()) === -1 ? -99 : this.settings.order.indexOf(n.source.toLowerCase()) - this.settings.order.indexOf(t.source.toLowerCase())
    }.bind(this)));
    (typeof n == "string" || n instanceof String) && (n = JSON.parse(n));
    n.forEach(function (n, t) {
        const r = (t + 1).toString(), i = document.createElement("li");
        i.dataset.number = r;
        i.dataset.url = this.buildIframeUrl(n.iframeUrl, n.source, this.settings.params);
        i.title = "{N}. {T} ({Q})".replace("{N}", r)
            .replace("{T}", n.translation || "-")
            .replace("{Q}", n.quality || "-");
        i.innerHTML = this.settings.menu.format.replace("{N}", r)
            .replace("{S}", n.source)
            .replace("{T}", n.translation || "-")
            .replace("{Q}", n.quality || "-");
        this.ul.appendChild(i);
        i.addEventListener("click", function () {
            this.log("Switch to player: {number}, {source}", { number: i.dataset.number, source: n.source });
            [].forEach.call(this.ul.querySelectorAll("li"), function (n) {
                n.classList.remove("active")
            });
            i.classList.add("active");
            this.showIframe(i.dataset.url)
        }.bind(this))
    }.bind(this))
};
Kinobox.prototype.buildIframeUrl = function (n, t, i) {
    n = new URL(n); t = t.toLowerCase();
    const r = new URLSearchParams(n.search);
    if (i.hasOwnProperty("all")) for (let n in i.all) r.set(n, i.all[n]);
    if (i.hasOwnProperty(t)) for (let n in i[t]) r.set(n, i[t][n]); return n.search = r.toString(), n.toString()
};