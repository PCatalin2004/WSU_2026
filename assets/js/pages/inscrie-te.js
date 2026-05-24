window.WSU.ready(async () => {
  const signupLinks = document.querySelectorAll("[data-signup-form]");
  const period = document.querySelector("[data-signup-period]");
  const deadline = document.querySelector("[data-signup-deadline]");
  const documentsHost = document.querySelector("[data-signup-documents]");
  const stepsHost = document.querySelector("[data-signup-steps]");
  const faqHost = document.querySelector("[data-signup-faq]");
  if (!signupLinks.length && !documentsHost && !stepsHost && !faqHost) return;

  const signup = await window.WSU.loadData("signup");
  signupLinks.forEach((link) => {
    link.setAttribute("href", signup.formUrl);
    link.setAttribute("target", "_blank");
    link.setAttribute("rel", "noopener noreferrer");
  });

  if (period) period.textContent = signup.period;
  if (deadline) deadline.textContent = signup.deadline;

  if (documentsHost) {
    documentsHost.innerHTML = signup.documents
      .map(
        (documentItem) => `
          <a class="document-link reveal-card" href="${window.WSU.escapeHtml(documentItem.href)}"${window.WSU.linkAttrs(documentItem.href)}>
            <i data-lucide="${window.WSU.escapeHtml(documentItem.icon)}"></i>
            <span>${window.WSU.escapeHtml(documentItem.label)}</span>
          </a>
        `,
      )
      .join("");
  }

  if (stepsHost) {
    stepsHost.innerHTML = signup.steps
      .map(
        (step, index) => `
          <article class="process-card reveal-card">
            <span>${String(index + 1).padStart(2, "0")}</span>
            <h3>${window.WSU.escapeHtml(step.title)}</h3>
            <p>${window.WSU.escapeHtml(step.text)}</p>
          </article>
        `,
      )
      .join("");
  }

  if (faqHost) {
    faqHost.innerHTML = signup.faq
      .map(
        (item) => `
          <details class="faq-item">
            <summary>${window.WSU.escapeHtml(item.question)}</summary>
            <p>${window.WSU.escapeHtml(item.answer)}</p>
          </details>
        `,
      )
      .join("");
  }
});
