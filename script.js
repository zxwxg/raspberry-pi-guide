/* ==========================================================================
   Raspberry Pi Guide — site behaviour
   Author: Mohammed Al-Quwaizani
   Hand-written JavaScript. No dependencies, no trackers, no network calls.
   Everything here is progressive: the pages remain readable and usable
   with JavaScript disabled.
   ========================================================================== */
(function () {
  "use strict";

  var AUTHOR_NAME = "Mohammed Al-Quwaizani";
  var AUTHOR_INITIALS = "MA";
  var REVIEW_DATE = "October 2026";

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ---------------------------------------------------------------------
     1. Theme (dark / light) — remembered, respects the system preference
     --------------------------------------------------------------------- */
  var THEME_KEY = "rpi-theme";

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    var btn = $("[data-theme-toggle]");
    if (btn) {
      btn.textContent = theme === "light" ? "🌙" : "☀️";
      btn.setAttribute("aria-label", theme === "light" ? "Switch to dark theme" : "Switch to light theme");
      btn.setAttribute("aria-pressed", theme === "light" ? "true" : "false");
    }
    var meta = $('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "theme-color");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", theme === "light" ? "#f6f8fc" : "#071023");
  }

  var savedTheme = null;
  try { savedTheme = localStorage.getItem(THEME_KEY); } catch (e) {}
  applyTheme(savedTheme || "dark");   // dark navy is the default look

  document.addEventListener("click", function (ev) {
    if (!ev.target.closest("[data-theme-toggle]")) return;
    var next = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
    applyTheme(next);
    try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
  });

  /* ---------------------------------------------------------------------
     2. Mobile navigation drawer
     --------------------------------------------------------------------- */
  function setDrawer(open) {
    var links = $(".nav-links");
    var toggle = $("[data-nav-toggle]");
    var overlay = $(".nav-overlay");
    if (links) links.classList.toggle("open", open);
    if (toggle) toggle.setAttribute("aria-expanded", open ? "true" : "false");
    if (overlay) overlay.setAttribute("data-open", open ? "true" : "false");
    document.body.style.overflow = open ? "hidden" : "";
  }

  document.addEventListener("click", function (ev) {
    if (ev.target.closest("[data-nav-toggle]")) {
      var links = $(".nav-links");
      setDrawer(!(links && links.classList.contains("open")));
      return;
    }
    if (ev.target.closest(".nav-overlay") || ev.target.closest(".nav-links a")) setDrawer(false);
  });

  document.addEventListener("keydown", function (ev) {
    if (ev.key !== "Escape") return;
    setDrawer(false);
    var panel = $(".toc-panel");
    if (panel && panel.getAttribute("data-open") === "true") panel.setAttribute("data-open", "false");
  });

  /* ---------------------------------------------------------------------
     3. Reading progress bar
     --------------------------------------------------------------------- */
  var progress = document.createElement("div");
  progress.className = "progress";
  progress.setAttribute("role", "presentation");
  document.body.appendChild(progress);

  function updateProgress() {
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    var pct = max > 0 ? (window.scrollY / max) * 100 : 0;
    progress.style.width = Math.min(100, Math.max(0, pct)) + "%";
    var header = document.querySelector(".site-header");
    if (header) header.classList.toggle("scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", function () {
    updateProgress();
  }, { passive: true });
  window.addEventListener("resize", updateProgress, { passive: true });
  updateProgress();

  /* ---------------------------------------------------------------------
     4. Byline: author + review date + reading time, added under the H1
     --------------------------------------------------------------------- */
  function readingTime() {
    var main = $("main") || document.body;
    var words = (main.innerText || "").trim().split(/\s+/).length;
    return Math.max(1, Math.round(words / 220));
  }

  function injectByline() {
    var head = $(".page-head .container");
    if (!head || head.querySelector(".byline") || document.body.hasAttribute("data-no-byline")) return;
    var el = document.createElement("div");
    el.className = "byline";
    el.innerHTML =
      '<span class="avatar" aria-hidden="true">' + AUTHOR_INITIALS + "</span>" +
      '<span class="who"><b>' + AUTHOR_NAME + "</b>Author, editor &amp; developer of this guide</span>" +
      '<span class="sep" aria-hidden="true"></span>' +
      '<span class="meta">Reviewed ' + REVIEW_DATE + '</span>' +
      '<span class="sep" aria-hidden="true"></span>' +
      '<span class="meta">' + readingTime() + " min read</span>" +
      '<span class="sep" aria-hidden="true"></span>' +
      '<a class="meta" href="about.html">About this project →</a>';
    head.appendChild(el);
  }

  /* ---------------------------------------------------------------------
     5. Floating dock: section navigator + back to top
     --------------------------------------------------------------------- */
  function buildToc() {
    var main = $("main");
    if (!main) return;
    var heads = $$("main h2").filter(function (h) { return h.offsetParent !== null || true; });
    if (heads.length < 3) return;

    var panel = document.createElement("div");
    panel.className = "toc-panel";
    panel.setAttribute("data-open", "false");
    panel.setAttribute("aria-label", "Sections on this page");
    var html = '<div class="toc-head">On this page</div><a href="#top" data-toc-link>↑ Top of page</a>';
    heads.forEach(function (h, i) {
      if (!h.id) h.id = "section-" + (i + 1);
      var label = (h.textContent || "").replace(/\s+/g, " ").trim();
      if (label.length > 58) label = label.slice(0, 56) + "…";
      html += '<a href="#' + h.id + '" data-toc-link>' + label + "</a>";
    });
    panel.innerHTML = html;

    var dock = document.createElement("div");
    dock.className = "dock";

    var topBtn = document.createElement("button");
    topBtn.type = "button";
    topBtn.className = "dock-btn";
    topBtn.setAttribute("aria-label", "Back to top");
    topBtn.innerHTML = "↑ <span>Top</span>";
    topBtn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    var tocBtn = document.createElement("button");
    tocBtn.type = "button";
    tocBtn.className = "dock-btn";
    tocBtn.setAttribute("aria-expanded", "false");
    tocBtn.innerHTML = "☰ <span>Sections</span>";
    tocBtn.addEventListener("click", function () {
      var open = panel.getAttribute("data-open") !== "true";
      panel.setAttribute("data-open", open ? "true" : "false");
      tocBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });

    panel.addEventListener("click", function (ev) {
      if (ev.target.closest("[data-toc-link]")) {
        panel.setAttribute("data-open", "false");
        tocBtn.setAttribute("aria-expanded", "false");
      }
    });

    dock.appendChild(panel);
    dock.appendChild(topBtn);
    dock.appendChild(tocBtn);
    document.body.appendChild(dock);

    /* scrollspy */
    var links = $$("[data-toc-link]", panel);
    if ("IntersectionObserver" in window) {
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          links.forEach(function (a) {
            a.classList.toggle("active", a.getAttribute("href") === "#" + en.target.id);
          });
        });
      }, { rootMargin: "-25% 0px -65% 0px", threshold: 0 });
      heads.forEach(function (h) { spy.observe(h); });
    }

    /* hide the dock until the reader has scrolled a little */
    var onScroll = function () {
      dock.style.opacity = window.scrollY > 420 ? "1" : "0";
      dock.style.pointerEvents = window.scrollY > 420 ? "auto" : "none";
      dock.style.transform = window.scrollY > 420 ? "none" : "translateY(12px)";
    };
    dock.style.transition = "opacity .4s ease, transform .4s cubic-bezier(.22,1,.36,1)";
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------------------------------------------------------------------
     6. Currency switcher
     Prices are written as data-usd="60" in the HTML and rendered here.
     --------------------------------------------------------------------- */
  var CURRENCIES = {
    USD: { code: "USD", locale: "en-US", rate: 1, label: "USD $" },
    EUR: { code: "EUR", locale: "de-DE", rate: 0.92, label: "EUR €" },
    GBP: { code: "GBP", locale: "en-GB", rate: 0.79, label: "GBP £" },
    SAR: { code: "SAR", locale: "en-SA", rate: 3.75, label: "SAR" },
    AED: { code: "AED", locale: "en-AE", rate: 3.67, label: "AED" },
    MAD: { code: "MAD", locale: "fr-MA", rate: 9.95, label: "MAD" },
    EGP: { code: "EGP", locale: "en-EG", rate: 48.5, label: "EGP" },
    JOD: { code: "JOD", locale: "en-JO", rate: 0.71, label: "JOD" },
    QAR: { code: "QAR", locale: "en-QA", rate: 3.64, label: "QAR" },
    KWD: { code: "KWD", locale: "en-KW", rate: 0.31, label: "KWD" },
    TRY: { code: "TRY", locale: "tr-TR", rate: 34.5, label: "TRY ₺" },
    INR: { code: "INR", locale: "en-IN", rate: 84, label: "INR ₹" }
  };

  var CUR_KEY = "rpi-currency";
  var currentCurrency = "USD";
  try {
    var stored = localStorage.getItem(CUR_KEY);
    if (stored && CURRENCIES[stored]) currentCurrency = stored;
  } catch (e) {}

  function formatMoney(usd, currency) {
    var c = CURRENCIES[currency] || CURRENCIES.USD;
    var value = usd * c.rate;
    var digits = value % 1 !== 0 ? 2 : 0;
    try {
      return new Intl.NumberFormat(c.locale, {
        style: "currency", currency: c.code,
        minimumFractionDigits: digits, maximumFractionDigits: digits
      }).format(value);
    } catch (e) {
      return "$" + value.toFixed(0);
    }
  }

  function applyCurrency(currency) {
    currentCurrency = currency;
    $$("[data-usd]").forEach(function (el) {
      var usd = parseFloat(el.getAttribute("data-usd"));
      if (isNaN(usd)) return;
      el.textContent = (el.getAttribute("data-prefix") || "") + formatMoney(usd, currency) + (el.getAttribute("data-suffix") || "");
    });
    $$("[data-usd-range]").forEach(function (el) {
      var parts = (el.getAttribute("data-usd-range") || "").split("-");
      if (parts.length !== 2) return;
      el.textContent = formatMoney(parseFloat(parts[0]), currency) + " – " + formatMoney(parseFloat(parts[1]), currency);
    });
    try { localStorage.setItem(CUR_KEY, currency); } catch (e) {}
    document.dispatchEvent(new CustomEvent("currency:changed", { detail: { currency: currency } }));
  }

  function initCurrencySelects() {
    $$("[data-currency-select]").forEach(function (sel) {
      sel.innerHTML = Object.keys(CURRENCIES).map(function (k) {
        return '<option value="' + k + '">' + CURRENCIES[k].label + "</option>";
      }).join("");
      sel.value = currentCurrency;
      sel.addEventListener("change", function () { applyCurrency(sel.value); });
    });
    document.addEventListener("currency:changed", function (ev) {
      $$("[data-currency-select]").forEach(function (sel) {
        if (sel.value !== ev.detail.currency) sel.value = ev.detail.currency;
      });
      renderCalculator();
      renderPowerCost();
    });
  }

  /* ---------------------------------------------------------------------
     7. Copy buttons
     --------------------------------------------------------------------- */
  $$(".code-block pre").forEach(function (pre) {
    var btn = document.createElement("button");
    btn.className = "copy-btn";
    btn.type = "button";
    btn.textContent = "Copy";
    btn.setAttribute("aria-label", "Copy this command block to the clipboard");
    btn.addEventListener("click", function () {
      var text = pre.innerText;
      var done = function () {
        btn.textContent = "Copied ✓";
        btn.classList.add("done");
        window.setTimeout(function () { btn.textContent = "Copy"; btn.classList.remove("done"); }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text, done); });
      } else {
        fallbackCopy(text, done);
      }
    });
    pre.parentNode.appendChild(btn);
  });

  function fallbackCopy(text, done) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.cssText = "position:fixed;top:0;left:0;opacity:0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); done(); } catch (e) {}
    document.body.removeChild(ta);
  }

  /* ---------------------------------------------------------------------
     8. Accordion (accessible)
     --------------------------------------------------------------------- */
  $$(".acc-item").forEach(function (item, i) {
    var q = item.querySelector(".acc-q");
    var a = item.querySelector(".acc-a");
    if (!q || !a) return;
    var id = a.id || "acc-panel-" + i;
    a.id = id;
    q.setAttribute("aria-controls", id);
    q.setAttribute("aria-expanded", "false");
    q.addEventListener("click", function () {
      var isOpen = item.classList.contains("open");
      var parent = item.parentNode;
      if (parent) {
        $$(".acc-item.open", parent).forEach(function (o) {
          if (o === item) return;
          o.classList.remove("open");
          var oa = o.querySelector(".acc-a");
          var oq = o.querySelector(".acc-q");
          if (oa) oa.style.maxHeight = "0px";
          if (oq) oq.setAttribute("aria-expanded", "false");
        });
      }
      item.classList.toggle("open", !isOpen);
      a.style.maxHeight = !isOpen ? a.scrollHeight + 40 + "px" : "0px";
      q.setAttribute("aria-expanded", !isOpen ? "true" : "false");
    });
  });

  /* ---------------------------------------------------------------------
     9. Reveal on scroll + animated counters
     --------------------------------------------------------------------- */
  var revealables = $$(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add("in");
        io.unobserve(en.target);
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });
    revealables.forEach(function (el, i) {
      el.style.transitionDelay = (i % 6) * 55 + "ms";
      io.observe(el);
    });

    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        var target = parseFloat(el.getAttribute("data-count"));
        var suffix = el.getAttribute("data-suffix") || "";
        var decimals = (el.getAttribute("data-decimals") || "0") | 0;
        var start = performance.now();
        var dur = 1300;
        (function step(now) {
          var p = Math.min((now - start) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = (target * eased).toFixed(decimals) + suffix;
          if (p < 1) window.requestAnimationFrame(step);
        })(start);
        cio.unobserve(el);
      });
    }, { threshold: 0.35 });
    $$("[data-count]").forEach(function (c) { cio.observe(c); });
  } else {
    revealables.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------------------------------------------------------------------
     10. Project filters
     --------------------------------------------------------------------- */
  document.addEventListener("click", function (ev) {
    var btn = ev.target.closest("[data-filter]");
    if (!btn) return;
    var group = btn.closest(".filters");
    if (group) $$("button", group).forEach(function (b) {
      b.classList.remove("active");
      b.setAttribute("aria-pressed", "false");
    });
    btn.classList.add("active");
    btn.setAttribute("aria-pressed", "true");
    var tag = btn.getAttribute("data-filter");
    var shown = 0;
    $$("[data-tags]").forEach(function (card) {
      var tags = (card.getAttribute("data-tags") || "").split(/\s+/);
      var show = tag === "all" || tags.indexOf(tag) !== -1;
      card.setAttribute("data-hidden", show ? "false" : "true");
      if (show) shown++;
    });
    var counter = $("[data-filter-count]");
    if (counter) counter.textContent = shown;
  });

  /* ---------------------------------------------------------------------
     11. Build calculator
     --------------------------------------------------------------------- */
  function renderCalculator() {
    var host = $("[data-calculator]");
    if (!host) return;
    var totalUsd = 0;
    var lines = [];

    $$("[data-price-usd]", host).forEach(function (el) {
      var price = parseFloat(el.getAttribute("data-price-usd")) || 0;
      var row = el.closest(".calc-row");
      var qtyInput = row ? row.querySelector("[data-qty]") : null;
      var check = row ? row.querySelector('input[type="checkbox"]') : null;
      var qty = qtyInput ? Math.max(0, parseInt(qtyInput.value, 10) || 0) : 1;
      var included = !check || check.checked;
      if (qtyInput) included = qty > 0;
      if (!included) return;
      var amount = price * qty;
      totalUsd += amount;
      var name = el.getAttribute("data-name") || "";
      if (qty > 1) name += " ×" + qty;
      lines.push({ name: name, amount: amount });
    });

    var out = $("[data-calc-total]");
    if (out) out.textContent = formatMoney(totalUsd, currentCurrency);

    var list = $("[data-calc-list]");
    if (list) {
      list.innerHTML = lines.map(function (l) {
        return "<li><span>" + l.name + "</span><span>" + formatMoney(l.amount, currentCurrency) + "</span></li>";
      }).join("") || '<li><span class="muted">Nothing selected yet</span><span></span></li>';
    }

    var annual = $("[data-calc-annual]");
    if (annual) annual.textContent = formatMoney(totalUsd * 0.06, currentCurrency);
  }

  /* ---------------------------------------------------------------------
     12. Electricity calculator
     --------------------------------------------------------------------- */
  function renderPowerCost() {
    var host = $("[data-power-calc]");
    if (!host) return;
    var elWatts = host.querySelector("[data-watts]");
    var elHours = host.querySelector("[data-hours]");
    var elPrice = host.querySelector("[data-kwh-price]");
    if (!elWatts || !elHours || !elPrice) return;

    var watts = parseFloat(elWatts.value) || 0;
    var hours = parseFloat(elHours.value) || 0;
    var usdPerKwh = parseFloat(elPrice.value) || 0;
    var kwhMonth = (watts / 1000) * hours * 30;
    var costUsdMonth = kwhMonth * usdPerKwh;

    var a = host.querySelector("[data-power-kwh]");
    var b = host.querySelector("[data-power-cost]");
    var c = host.querySelector("[data-power-year]");
    if (a) a.textContent = kwhMonth.toFixed(1) + " kWh";
    if (b) b.textContent = formatMoney(costUsdMonth, currentCurrency) + " / month";
    if (c) c.textContent = formatMoney(costUsdMonth * 12, currentCurrency) + " / year";
  }

  document.addEventListener("input", function (ev) {
    if (ev.target.closest("[data-calculator]")) renderCalculator();
    if (ev.target.closest("[data-power-calc]")) renderPowerCost();
  });
  document.addEventListener("change", function (ev) {
    if (ev.target.closest("[data-calculator]")) renderCalculator();
    if (ev.target.closest("[data-power-calc]")) renderPowerCost();
  });

  /* ---------------------------------------------------------------------
     13. Photo lightbox
     --------------------------------------------------------------------- */
  function initLightbox() {
    var figures = $$(".photo[data-lightbox]");
    if (!figures.length) return;

    var box = document.createElement("div");
    box.className = "lightbox";
    box.setAttribute("data-open", "false");
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.setAttribute("aria-label", "Photo viewer");
    box.innerHTML =
      '<button class="lightbox-btn lb-close" type="button" aria-label="Close (Esc)">✕</button>' +
      '<button class="lightbox-btn lb-prev" type="button" aria-label="Previous photo (left arrow)">‹</button>' +
      '<button class="lightbox-btn lb-next" type="button" aria-label="Next photo (right arrow)">›</button>' +
      '<div class="lightbox-inner"><img alt="">' +
      '<div class="lb-cap"></div><div class="lb-credit"></div></div>' +
      '<div class="lb-count"></div>';
    document.body.appendChild(box);

    var img = box.querySelector("img");
    var cap = box.querySelector(".lb-cap");
    var cred = box.querySelector(".lb-credit");
    var count = box.querySelector(".lb-count");
    var index = 0;

    function show(i) {
      index = (i + figures.length) % figures.length;
      var fig = figures[index];
      var source = fig.querySelector("img");
      img.src = source.getAttribute("src");
      img.alt = source.getAttribute("alt") || "";
      img.classList.remove("swap");
      void img.offsetWidth;   /* restart the fade */
      img.classList.add("swap");
      var caption = fig.querySelector("figcaption");
      cap.innerHTML = caption ? caption.innerHTML : (fig.getAttribute("data-caption") || "");
      var credit = fig.getAttribute("data-credit") || "";
      var license = fig.getAttribute("data-license") || "";
      var licenseUrl = fig.getAttribute("data-license-url") || "";
      var srcUrl = fig.getAttribute("data-source") || "";
      var bits = [];
      if (credit) bits.push("Photo: " + credit);
      if (license) {
        bits.push(licenseUrl ? '<a href="' + licenseUrl + '" target="_blank" rel="noopener">' + license + "</a>" : license);
      }
      if (srcUrl) bits.push('<a href="' + srcUrl + '" target="_blank" rel="noopener">Wikimedia Commons</a>');
      cred.innerHTML = bits.join(" · ");
      count.textContent = (index + 1) + " / " + figures.length;
    }

    function close() {
      box.setAttribute("data-open", "false");
      document.body.style.overflow = "";
    }
    function isOpen() { return box.getAttribute("data-open") === "true"; }
    function open(i) {
      show(i);
      box.setAttribute("data-open", "true");
      document.body.style.overflow = "hidden";
      box.querySelector(".lb-close").focus();
    }

    figures.forEach(function (fig, i) {
      var pic = fig.querySelector("img");
      if (!pic) return;
      fig.setAttribute("tabindex", "0");
      fig.setAttribute("role", "button");
      var capEl = fig.querySelector("figcaption");
      var label = capEl ? capEl.textContent.trim() : (fig.getAttribute("data-caption") || "photo");
      fig.setAttribute("aria-label", "Open photo: " + label);
      pic.addEventListener("click", function () { open(i); });
      fig.addEventListener("keydown", function (ev) {
        if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); open(i); }
      });
    });

    box.querySelector(".lb-close").addEventListener("click", close);
    box.querySelector(".lb-prev").addEventListener("click", function () { show(index - 1); });
    box.querySelector(".lb-next").addEventListener("click", function () { show(index + 1); });
    box.addEventListener("click", function (ev) { if (ev.target === box) close(); });

    document.addEventListener("keydown", function (ev) {
      if (!isOpen()) return;
      if (ev.key === "Escape") close();
      else if (ev.key === "ArrowLeft") show(index - 1);
      else if (ev.key === "ArrowRight") show(index + 1);
    });
  }

  /* ---------------------------------------------------------------------
     14. External links get a safe target, in-page anchors stay in place
     --------------------------------------------------------------------- */
  $$('a[href^="http"]').forEach(function (a) {
    if (a.hostname && a.hostname !== location.hostname) {
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener noreferrer");
    }
  });

  /* ---------------------------------------------------------------------
     16. Responsive tables
     On a phone a 7-column price table is unreadable and the price column
     ends up off-screen. Below 720px every row is turned into a small card
     that shows "LABEL: value" pairs, so the price is always visible.
     --------------------------------------------------------------------- */
  function responsiveTables() {
    var small = window.matchMedia("(max-width: 720px)").matches;
    $$(".table-wrap table").forEach(function (table) {
      var heads = $$("thead th", table).map(function (th) {
        return (th.textContent || "").replace(/\s+/g, " ").trim();
      });
      var carry = "";
      $$("tbody tr", table).forEach(function (tr) {
        var cells = $$("td", tr);
        var groupCell = null;
        cells.forEach(function (td, i) {
          if (td.rowSpan > 1) {
            groupCell = td;
            td.classList.add("stack-group");
          } else if (!td.getAttribute("data-label")) {
            td.setAttribute("data-label", heads[i] || "");
          }
        });
        if (groupCell) carry = (groupCell.textContent || "").replace(/\s+/g, " ").trim();
        if (carry) tr.setAttribute("data-group", carry);
      });
      table.classList.toggle("stack", small);
    });
  }

  var resizeTimer = null;
  window.addEventListener("resize", function () {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(responsiveTables, 180);
  }, { passive: true });

  /* ---------------------------------------------------------------------
     17. Boot
     --------------------------------------------------------------------- */
  /* images fade in as they arrive instead of popping in */
  function fadeInImages() {
    $$(".photo img, .hero-art img").forEach(function (img) {
      if (img.complete && img.naturalWidth > 0) return;   /* already on screen */
      img.style.opacity = "0";
      var show = function () { img.style.opacity = "1"; };
      img.addEventListener("load", show, { once: true });
      img.addEventListener("error", show, { once: true });
    });
  }

  function boot() {
    /* the final numbers live in the HTML for no-JS readers; here they are
       reset so the count-up animation starts from zero without a flash */
    if ("IntersectionObserver" in window) {
      $$("[data-count]").forEach(function (el) {
        el.textContent = "0" + (el.getAttribute("data-suffix") || "");
      });
    }
    fadeInImages();
    injectByline();
    buildToc();
    initLightbox();
    responsiveTables();
    initCurrencySelects();
    applyCurrency(currentCurrency);
    renderCalculator();
    renderPowerCost();
    updateProgress();

    var here = location.pathname.split("/").pop() || "index.html";
    $$(".nav-links a").forEach(function (a) {
      if (a.getAttribute("href") === here) {
        a.classList.add("active");
        a.setAttribute("aria-current", "page");
      }
    });

    $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  window.RPiSite = { applyCurrency: applyCurrency, formatMoney: formatMoney, author: AUTHOR_NAME };
})();
