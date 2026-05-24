(() => {
  const {
    escapeHtml,
    linkAttrs,
    loadData,
    ready,
  } = window.WSU;

  function pageNeedsSignupData() {
    return Boolean(
      document.querySelector(
        [
          "[data-signup-form]",
          "[data-signup-period]",
          "[data-signup-deadline]",
          "[data-signup-documents]",
          "[data-signup-steps]",
          "[data-signup-faq]",
        ].join(", "),
      ),
    );
  }

  function updateSignupLinks(formUrl) {
    document.querySelectorAll("[data-signup-form]").forEach((link) => {
      link.setAttribute("href", formUrl);
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener noreferrer");
    });
  }

  function updateText(selector, text) {
    const element = document.querySelector(selector);
    if (element) {
      element.textContent = text;
    }
  }

  function renderDocumentLink(documentItem) {
    return `
      <a class="document-link reveal-card" href="${escapeHtml(documentItem.href)}"${linkAttrs(documentItem.href)}>
        <i data-lucide="${escapeHtml(documentItem.icon)}"></i>
        <span>${escapeHtml(documentItem.label)}</span>
      </a>
    `;
  }

  function renderProcessStep(step, index) {
    return `
      <article class="process-card reveal-card">
        <span>${String(index + 1).padStart(2, "0")}</span>
        <h3>${escapeHtml(step.title)}</h3>
        <p>${escapeHtml(step.text)}</p>
      </article>
    `;
  }

  function renderFaqItem(item) {
    return `
      <details class="faq-item">
        <summary>${escapeHtml(item.question)}</summary>
        <p>${escapeHtml(item.answer)}</p>
      </details>
    `;
  }

  function renderCollection(selector, items, renderItem) {
    const host = document.querySelector(selector);
    if (!host) return;

    host.innerHTML = items.map(renderItem).join("");
  }

  ready(async () => {
    if (!pageNeedsSignupData()) return;

    const signup = await loadData("signup");

    updateSignupLinks(signup.formUrl);
    updateText("[data-signup-period]", signup.period);
    updateText("[data-signup-deadline]", signup.deadline);

    renderCollection("[data-signup-documents]", signup.documents, renderDocumentLink);
    renderCollection("[data-signup-steps]", signup.steps, renderProcessStep);
    renderCollection("[data-signup-faq]", signup.faq, renderFaqItem);
  });
})();
