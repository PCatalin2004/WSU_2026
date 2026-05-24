window.WSU.ready(async () => {
  const host = document.querySelector("[data-faculty-grid]");
  if (!host) return;

  const [faculties, signup] = await Promise.all([window.WSU.loadData("faculties"), window.WSU.loadData("signup")]);
  host.innerHTML = faculties
    .map(
      (faculty) => `
        <article class="faculty-card reveal-card" data-title="${window.WSU.escapeHtml(`${faculty.title} ${faculty.keywords}`)}">
          ${window.WSU.responsiveImage(faculty.image, { sizes: "(max-width: 860px) 100vw, 210px" })}
          <div>
            <h2>${window.WSU.escapeHtml(faculty.title)}</h2>
            <p>${window.WSU.escapeHtml(faculty.description)}</p>
            <a href="${window.WSU.escapeHtml(signup.formUrl)}"${window.WSU.linkAttrs(signup.formUrl)}>Înscrie-te!</a>
          </div>
        </article>
      `,
    )
    .join("");

  const facultySearch = document.querySelector("[data-faculty-search]");
  const facultyCards = Array.from(document.querySelectorAll("[data-faculty-grid] .faculty-card"));
  if (!facultySearch || !facultyCards.length) return;

  const noResults = document.createElement("p");
  noResults.className = "no-results";
  noResults.setAttribute("aria-live", "polite");
  noResults.textContent = "Nu am găsit o facultate pentru căutarea ta.";
  host.after(noResults);

  facultySearch.addEventListener("input", () => {
    const query = facultySearch.value.trim().toLowerCase();
    let visibleCount = 0;

    facultyCards.forEach((card) => {
      const haystack = `${card.dataset.title || ""} ${card.textContent}`.toLowerCase();
      const isVisible = query === "" || haystack.includes(query);
      card.hidden = !isVisible;
      if (isVisible) visibleCount += 1;
    });

    noResults.classList.toggle("is-visible", visibleCount === 0);
  });
});
