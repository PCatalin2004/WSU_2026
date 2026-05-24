(() => {
  const {
    escapeHtml,
    linkAttrs,
    loadData,
    ready,
    responsiveImage,
  } = window.WSU;

  function renderFacultyCard(faculty, formUrl) {
    const searchText = `${faculty.title} ${faculty.keywords}`;

    return `
      <article class="faculty-card reveal-card" data-title="${escapeHtml(searchText)}">
        ${responsiveImage(faculty.image, { sizes: "(max-width: 860px) 100vw, 315px" })}
        <div>
          <h2>${escapeHtml(faculty.title)}</h2>
          <p>${escapeHtml(faculty.description)}</p>
          <a href="${escapeHtml(formUrl)}"${linkAttrs(formUrl)}>Înscrie-te!</a>
        </div>
      </article>
    `;
  }

  function createNoResultsMessage(host) {
    const message = document.createElement("p");
    message.className = "no-results";
    message.setAttribute("aria-live", "polite");
    message.textContent = "Nu am găsit o facultate pentru căutarea ta.";

    host.after(message);
    return message;
  }

  function cardMatchesSearch(card, query) {
    const searchArea = `${card.dataset.title || ""} ${card.textContent}`.toLowerCase();
    return query === "" || searchArea.includes(query);
  }

  function filterFacultyCards(cards, noResults, query) {
    let visibleCards = 0;

    cards.forEach((card) => {
      const shouldShow = cardMatchesSearch(card, query);
      card.hidden = !shouldShow;

      if (shouldShow) {
        visibleCards += 1;
      }
    });

    noResults.classList.toggle("is-visible", visibleCards === 0);
  }

  function initFacultySearch(host) {
    const searchInput = document.querySelector("[data-faculty-search]");
    const cards = Array.from(host.querySelectorAll(".faculty-card"));

    if (!searchInput || cards.length === 0) return;

    const noResults = createNoResultsMessage(host);

    searchInput.addEventListener("input", () => {
      filterFacultyCards(cards, noResults, searchInput.value.trim().toLowerCase());
    });
  }

  ready(async () => {
    const host = document.querySelector("[data-faculty-grid]");
    if (!host) return;

    const [faculties, signup] = await Promise.all([
      loadData("faculties"),
      loadData("signup"),
    ]);

    host.innerHTML = faculties.map((faculty) => renderFacultyCard(faculty, signup.formUrl)).join("");
    initFacultySearch(host);
  });
})();
