(() => {
  const {
    escapeHtml,
    imageUrl,
    loadData,
    ready,
  } = window.WSU;

  function articleSlug() {
    const fromQuery = new URLSearchParams(window.location.search).get("slug");
    if (fromQuery) return fromQuery;

    const fromDataset = document.body.dataset.articleSlug || document.querySelector("[data-article-page]")?.dataset.articleSlug;
    if (fromDataset) return fromDataset;

    return "";
  }

  function updatePageMeta(article) {
    document.title = `${article.title} - West Summer University`;

    const description = document.querySelector('meta[name="description"]');
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDescription = document.querySelector('meta[property="og:description"]');
    const ogImage = document.querySelector('meta[property="og:image"]');

    if (description) description.setAttribute("content", article.summary);
    if (ogTitle) ogTitle.setAttribute("content", article.title);
    if (ogDescription) ogDescription.setAttribute("content", article.summary);
    if (ogImage) ogImage.setAttribute("content", imageUrl(article.image));
  }

  function renderContentBlock(block) {
    if (block.type === "heading") {
      return `<h2>${escapeHtml(block.text)}</h2>`;
    }

    if (block.type === "list") {
      return `
        <ul>
          ${(block.items || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
        </ul>
      `;
    }

    return `<p>${escapeHtml(block.text)}</p>`;
  }

  function renderArticle(article) {
    const image = imageUrl(article.image);
    const body = article.contentHtml || (article.content || []).map(renderContentBlock).join("");

    updatePageMeta(article);

    return `
      <section class="page-hero article-hero" style="background-image: url('${escapeHtml(image)}')">
        <div class="hero-overlay"></div>
        <div class="container page-hero-content">
          <p class="eyebrow">${escapeHtml(article.tag)}</p>
          <h1>${escapeHtml(article.title)}</h1>
          <div class="article-meta">
            <span>${escapeHtml(article.date)}</span>
            <span>${escapeHtml(article.author)}</span>
          </div>
        </div>
      </section>
      <section class="section section-gradient article-section">
        <article class="container article-container">
          <figure class="article-cover">
            <img loading="eager" decoding="async" src="${escapeHtml(image)}" alt="${escapeHtml(article.image.alt)}">
          </figure>
          <div class="article-body">
            ${body}
          </div>
          <div class="article-actions">
            <a class="button button-outline" href="noutati.html">Înapoi la noutăți</a>
            <a class="button button-primary" href="inscrie-te.html">Înscrie-te!</a>
          </div>
        </article>
      </section>
    `;
  }

  function renderMissingArticle() {
    return `
      <section class="page-hero article-hero" style="background-image: url('assets/img/home/parada-wsu-large.webp')">
        <div class="hero-overlay"></div>
        <div class="container page-hero-content">
          <p class="eyebrow">Noutăți</p>
          <h1>Articolul nu a fost găsit.</h1>
        </div>
      </section>
      <section class="section section-gradient">
        <div class="container article-not-found">
          <p>Linkul local nu corespunde niciunui articol publicat în această versiune a site-ului.</p>
          <a class="button button-primary" href="noutati.html">Înapoi la noutăți</a>
        </div>
      </section>
    `;
  }

  function enhanceArticleContent(host) {
    host.querySelectorAll(".article-body a[href]").forEach((link) => {
      const href = link.getAttribute("href") || "";
      if (!/^https?:\/\//.test(href)) return;

      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener noreferrer");
    });

    host.querySelectorAll(".article-body img").forEach((image) => {
      image.loading = image.loading || "lazy";
      image.decoding = image.decoding || "async";
    });
  }

  ready(async () => {
    const host = document.querySelector("[data-article-page]");
    if (!host) return;

    const news = await loadData("news");
    const article = news.find((item) => item.slug === articleSlug());

    host.innerHTML = article ? renderArticle(article) : renderMissingArticle();

    if (article) {
      enhanceArticleContent(host);
    }
  });
})();
