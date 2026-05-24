const WSU_DATA_BASE = "assets/data";

const dataCache = new Map();
const pageCallbacks = [];
let readySite = null;

const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const loadData = async (name) => {
  if (!dataCache.has(name)) {
    dataCache.set(
      name,
      fetch(`${WSU_DATA_BASE}/${name}.json`).then((response) => {
        if (!response.ok) {
          throw new Error(`Nu am putut încărca ${name}.json`);
        }
        return response.json();
      }),
    );
  }
  return dataCache.get(name);
};

const refreshIcons = () => {
  if (window.lucide) {
    window.lucide.createIcons();
  }
};

const linkAttrs = (href) => (/^https?:\/\//.test(href) ? ' target="_blank" rel="noopener noreferrer"' : "");

const imageUrl = (image, size = "medium") => `${image.base}-${size}.webp`;

const responsiveImage = (image, options = {}) => {
  const {
    className = "",
    loading = "lazy",
    sizes = "(max-width: 860px) 100vw, 50vw",
    srcSize = "medium",
    fetchPriority = "",
  } = options;
  const classAttr = className ? ` class="${escapeHtml(className)}"` : "";
  const priorityAttr = fetchPriority ? ` fetchpriority="${escapeHtml(fetchPriority)}"` : "";

  return `<img${classAttr} loading="${loading}" decoding="async"${priorityAttr} src="${imageUrl(image, srcSize)}" srcset="${imageUrl(image, "thumb")} 520w, ${imageUrl(image, "medium")} 900w, ${imageUrl(image, "large")} 1600w" sizes="${escapeHtml(sizes)}" alt="${escapeHtml(image.alt)}">`;
};

const renderNewsCard = (item, options = {}) => {
  const { large = false, hidden = false } = options;
  const heading = large ? "h2" : "h3";
  const imageSizes = large ? "(max-width: 860px) 100vw, 340px" : "(max-width: 860px) 100vw, 33vw";

  return `
    <article class="news-card${large ? " large" : ""}${hidden ? " is-hidden" : ""} reveal-card">
      ${responsiveImage(item.image, { sizes: imageSizes })}
      <div>
        <span class="tag">${escapeHtml(item.tag)}</span>
        <${heading}>${escapeHtml(item.title)}</${heading}>
        ${large ? `<p>${escapeHtml(item.summary)}</p>` : ""}
        <a${large ? ' class="button button-outline"' : ""} href="${escapeHtml(item.href)}"${linkAttrs(item.href)}>Citiți mai mult</a>
      </div>
    </article>
  `;
};

const renderHeader = (site) => {
  const host = document.querySelector("[data-site-header]");
  if (!host) return;

  const currentPage = location.pathname.split("/").pop() || "index.html";
  const nav = site.navigation
    .map((item) => {
      const active = item.href === currentPage ? ' class="is-active" aria-current="page"' : "";
      return `<a href="${escapeHtml(item.href)}"${active}>${escapeHtml(item.label)}</a>`;
    })
    .join("");

  host.innerHTML = `
    <header class="site-header" data-header>
      <a class="brand" href="index.html" aria-label="${escapeHtml(site.brand.name)}">
        <img loading="eager" fetchpriority="high" decoding="async" src="${escapeHtml(site.brand.logo)}" alt="${escapeHtml(site.brand.logoAlt)}">
        <span>${escapeHtml(site.brand.shortName)}</span>
      </a>
      <button class="nav-toggle" type="button" aria-label="Deschide meniul" aria-expanded="false" data-nav-toggle>
        <i data-lucide="menu"></i>
      </button>
      <nav class="site-nav" aria-label="Navigare principală" data-nav>
        ${nav}
      </nav>
      <a class="header-action" href="${escapeHtml(site.headerAction.href)}">${escapeHtml(site.headerAction.label)}</a>
    </header>
  `;
};

const renderFooter = (site) => {
  const host = document.querySelector("[data-site-footer]");
  if (!host) return;

  const partners = site.footer.partners
    .map((partner) => `<img loading="lazy" decoding="async" src="${escapeHtml(partner.src)}" alt="${escapeHtml(partner.alt)}">`)
    .join("");

  const social = site.footer.social
    .map(
      (item) =>
        `<a href="${escapeHtml(item.href)}"${linkAttrs(item.href)} aria-label="${escapeHtml(item.label)}"><i data-lucide="${escapeHtml(item.icon)}"></i></a>`,
    )
    .join("");

  host.innerHTML = `
    <footer class="site-footer" id="contact">
      <div class="container footer-grid">
        <div>
          <h2>${escapeHtml(site.footer.projectLabel)}</h2>
          <a class="footer-logo" href="${escapeHtml(site.footer.osut.href)}"${linkAttrs(site.footer.osut.href)}>
            <img loading="lazy" decoding="async" src="${escapeHtml(site.footer.osut.logo)}" alt="${escapeHtml(site.footer.osut.alt)}">
          </a>
        </div>
        <div>
          <h2>${escapeHtml(site.footer.partnersLabel)}</h2>
          <div class="partner-row">${partners}</div>
        </div>
        <div>
          <h2>${escapeHtml(site.footer.contactLabel)}</h2>
          <p>${site.footer.address}</p>
          <div class="social-row">${social}</div>
        </div>
      </div>
    </footer>
  `;
};

const renderCookieBanner = (site) => {
  const host = document.querySelector("[data-site-cookie]");
  if (!host) return;

  host.innerHTML = `
    <div class="cookie-banner" data-cookie-banner>
      <p>${escapeHtml(site.cookie.text)}</p>
      <button class="button button-dark" type="button" data-cookie-accept>${escapeHtml(site.cookie.button)}</button>
    </div>
  `;
};

const renderSiteChrome = async () => {
  const site = await loadData("site");
  renderHeader(site);
  renderFooter(site);
  renderCookieBanner(site);
  return site;
};

const initNavigation = () => {
  const header = document.querySelector("[data-header]");
  const nav = document.querySelector("[data-nav]");
  const navToggle = document.querySelector("[data-nav-toggle]");

  const setNavOpen = (isOpen) => {
    if (!nav || !navToggle) return;
    nav.classList.toggle("is-open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "Închide meniul" : "Deschide meniul");
    navToggle.innerHTML = isOpen ? '<i data-lucide="x"></i>' : '<i data-lucide="menu"></i>';
    refreshIcons();
  };

  if (nav && navToggle) {
    navToggle.addEventListener("click", () => {
      setNavOpen(!nav.classList.contains("is-open"));
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setNavOpen(false));
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setNavOpen(false);
    }
  });

  const updateHeader = () => {
    header?.classList.toggle("is-elevated", window.scrollY > 8);
  };
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  return setNavOpen;
};

const initCookieBanner = () => {
  const banner = document.querySelector("[data-cookie-banner]");
  const acceptButton = document.querySelector("[data-cookie-accept]");
  try {
    if (banner && localStorage.getItem("wsu-cookie-ok") === "true") {
      banner.classList.add("is-hidden");
    }
    if (banner && acceptButton) {
      acceptButton.addEventListener("click", () => {
        localStorage.setItem("wsu-cookie-ok", "true");
        banner.classList.add("is-hidden");
      });
    }
  } catch {
    acceptButton?.addEventListener("click", () => banner?.classList.add("is-hidden"));
  }
};

const initReveal = () => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const targets = document.querySelectorAll(".section, .reveal-card");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    targets.forEach((target) => target.classList.add("is-visible"));
    return;
  }

  targets.forEach((target) => target.classList.add("reveal"));
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 },
  );

  targets.forEach((target) => observer.observe(target));
};

const runPageCallbacks = async (site) => {
  while (pageCallbacks.length) {
    const callback = pageCallbacks.shift();
    await callback(site);
  }
};

const ready = (callback) => {
  if (readySite) {
    Promise.resolve(callback(readySite))
      .then(() => {
        refreshIcons();
        initReveal();
      })
      .catch(console.error);
    return;
  }
  pageCallbacks.push(callback);
};

window.WSU = {
  escapeHtml,
  imageUrl,
  initReveal,
  linkAttrs,
  loadData,
  ready,
  refreshIcons,
  renderNewsCard,
  responsiveImage,
};

document.addEventListener("DOMContentLoaded", async () => {
  try {
    readySite = await renderSiteChrome();
    initNavigation();
    initCookieBanner();
    await runPageCallbacks(readySite);
  } catch (error) {
    console.error(error);
  } finally {
    refreshIcons();
    initReveal();
  }
});
