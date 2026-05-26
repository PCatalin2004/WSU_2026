const WSU_DATA_BASE = "assets/data";

const socialIconPaths = {
  facebook: "assets/img/icons/Facebook.png",
  instagram: "assets/img/icons/Instagram.png",
  tiktok: "assets/img/icons/Tiktok.png",
  "music-2": "assets/img/icons/Tiktok.png",
};

const htmlEntities = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#039;",
};

const dataCache = new Map();
const queuedPageInitializers = [];
let loadedSite = null;

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (character) => htmlEntities[character]);
}

function joinClasses(...classes) {
  return classes.filter(Boolean).join(" ");
}

function isExternalLink(href = "") {
  return /^https?:\/\//.test(href);
}

function linkAttrs(href) {
  return isExternalLink(href) ? ' target="_blank" rel="noopener noreferrer"' : "";
}

async function readJson(response, name) {
  if (!response.ok) {
    throw new Error(`Nu am putut încărca ${name}.json`);
  }

  return response.json();
}

function loadData(name) {
  if (!dataCache.has(name)) {
    const request = fetch(`${WSU_DATA_BASE}/${name}.json`).then((response) => readJson(response, name));
    dataCache.set(name, request);
  }

  return dataCache.get(name);
}

function refreshIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function imageUrl(image, size = "large") {
  if (image.src) return image.src;
  return `${image.base}-large.webp`;
}

function responsiveImage(image, options = {}) {
  const {
    className = "",
    fetchPriority = "",
    loading = "lazy",
    sizes = "(max-width: 860px) 100vw, 50vw",
    srcSize = "large",
  } = options;

  const classAttr = className ? ` class="${escapeHtml(className)}"` : "";
  const priorityAttr = fetchPriority ? ` fetchpriority="${escapeHtml(fetchPriority)}"` : "";
  const src = imageUrl(image, srcSize);

  return `<img${classAttr} loading="${loading}" decoding="async"${priorityAttr} src="${escapeHtml(src)}" alt="${escapeHtml(image.alt)}">`;
}

function renderNewsCard(item, options = {}) {
  const { hidden = false, large = false } = options;
  const headingTag = large ? "h2" : "h3";
  const cardClasses = joinClasses("news-card", large && "large", hidden && "is-hidden", "reveal-card");
  const imageSizes = large ? "(max-width: 860px) 100vw, 340px" : "(max-width: 860px) 100vw, 33vw";
  const summary = large ? `<p>${escapeHtml(item.summary)}</p>` : "";
  const linkClass = large ? ' class="button button-outline"' : "";

  return `
    <article class="${cardClasses}">
      ${responsiveImage(item.image, { sizes: imageSizes })}
      <div>
        <span class="tag">${escapeHtml(item.tag)}</span>
        <${headingTag}>${escapeHtml(item.title)}</${headingTag}>
        ${summary}
        <a${linkClass} href="${escapeHtml(item.href)}"${linkAttrs(item.href)}>Citiți mai mult</a>
      </div>
    </article>
  `;
}

function renderNavLink(item, currentPage) {
  const pageAliases = {
    "articol.html": "noutati.html",
  };
  const activePage = pageAliases[currentPage] || currentPage;
  const isCurrentPage = item.href === activePage;
  const activeAttrs = isCurrentPage ? ' class="is-active" aria-current="page"' : "";

  return `<a href="${escapeHtml(item.href)}"${activeAttrs}>${escapeHtml(item.label)}</a>`;
}

function renderHeader(site) {
  const host = document.querySelector("[data-site-header]");
  if (!host) return;

  const currentPage = location.pathname.split("/").pop() || "index.html";
  const navItems = site.navigation.map((item) => renderNavLink(item, currentPage)).join("");

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
        ${navItems}
      </nav>
    </header>
  `;
}

function renderPartnerLogo(partner) {
  return `<img loading="lazy" decoding="async" src="${escapeHtml(partner.src)}" alt="${escapeHtml(partner.alt)}">`;
}

function socialIconPath(item) {
  const iconKey = String(item.icon || "").toLowerCase();
  const labelKey = String(item.label || "").toLowerCase();

  return socialIconPaths[iconKey] || socialIconPaths[labelKey] || "";
}

function socialIconName(item) {
  const iconKey = String(item.icon || "").toLowerCase();
  const labelKey = String(item.label || "").toLowerCase();

  if (socialIconPaths[iconKey]) return iconKey;
  if (socialIconPaths[labelKey]) return labelKey;

  return iconKey || labelKey || "generic";
}

function renderSocialIcon(item, className = "social-icon-image") {
  const iconPath = socialIconPath(item);
  const iconName = socialIconName(item);

  if (iconPath) {
    const iconClasses = joinClasses(className, "social-icon", `social-icon-${iconName}`);
    return `<img class="${escapeHtml(iconClasses)}" loading="lazy" decoding="async" src="${escapeHtml(iconPath)}" alt="" aria-hidden="true">`;
  }

  return `<i data-lucide="${escapeHtml(item.icon)}"></i>`;
}

function renderSocialLink(item) {
  return `<a href="${escapeHtml(item.href)}"${linkAttrs(item.href)} aria-label="${escapeHtml(item.label)}">${renderSocialIcon(item)}</a>`;
}

function renderFooter(site) {
  const host = document.querySelector("[data-site-footer]");
  if (!host) return;

  const partners = site.footer.partners.map(renderPartnerLogo).join("");
  const socialLinks = site.footer.social.map(renderSocialLink).join("");

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
          <div class="social-row">${socialLinks}</div>
        </div>
      </div>
    </footer>
  `;
}

async function renderSiteChrome() {
  const site = await loadData("site");

  renderHeader(site);
  renderFooter(site);

  return site;
}

function createMobileMenuController(nav, navToggle) {
  return function setNavOpen(isOpen) {
    if (!nav || !navToggle) return;

    nav.classList.toggle("is-open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "Închide meniul" : "Deschide meniul");
    navToggle.innerHTML = isOpen ? '<i data-lucide="x"></i>' : '<i data-lucide="menu"></i>';
    refreshIcons();
  };
}

function watchHeaderElevation(header) {
  if (!header) return;

  const updateHeader = () => {
    header.classList.toggle("is-elevated", window.scrollY > 8);
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });
}

function initNavigation() {
  const header = document.querySelector("[data-header]");
  const nav = document.querySelector("[data-nav]");
  const navToggle = document.querySelector("[data-nav-toggle]");
  const setNavOpen = createMobileMenuController(nav, navToggle);

  navToggle?.addEventListener("click", () => {
    setNavOpen(!nav?.classList.contains("is-open"));
  });

  nav?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setNavOpen(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setNavOpen(false);
    }
  });

  watchHeaderElevation(header);
}

function showImmediately(targets) {
  targets.forEach((target) => {
    target.classList.remove("reveal");
    target.classList.add("is-visible");
  });
}

function initReveal() {
  const targets = document.querySelectorAll(".section, .reveal-card, .reveal");
  showImmediately(targets);
}

async function runPageInitializer(callback, site) {
  await callback(site);
  refreshIcons();
  initReveal();
}

async function runQueuedPageInitializers(site) {
  while (queuedPageInitializers.length) {
    const callback = queuedPageInitializers.shift();
    await runPageInitializer(callback, site);
  }
}

function ready(callback) {
  if (!loadedSite) {
    queuedPageInitializers.push(callback);
    return;
  }

  runPageInitializer(callback, loadedSite).catch(console.error);
}

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
  renderSocialIcon,
};

document.addEventListener("DOMContentLoaded", async () => {
  try {
    loadedSite = await renderSiteChrome();
    initNavigation();
    await runQueuedPageInitializers(loadedSite);
  } catch (error) {
    console.error(error);
  } finally {
    refreshIcons();
    initReveal();
  }
});
