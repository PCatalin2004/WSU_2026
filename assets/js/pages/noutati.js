(() => {
  const {
    loadData,
    ready,
    renderNewsCard,
  } = window.WSU;

  const INITIAL_VISIBLE_NEWS = 3;
  const NEWS_PER_CLICK = 2;

  function hiddenNewsCards() {
    return Array.from(document.querySelectorAll("[data-news-list] .is-hidden"));
  }

  function updateLoadMoreButton(button) {
    button.classList.toggle("is-hidden", hiddenNewsCards().length === 0);
  }

  function initLoadMoreButton(button) {
    button.addEventListener("click", () => {
      hiddenNewsCards()
        .slice(0, NEWS_PER_CLICK)
        .forEach((card) => card.classList.remove("is-hidden"));

      updateLoadMoreButton(button);
    });

    updateLoadMoreButton(button);
  }

  ready(async () => {
    const host = document.querySelector("[data-news-list]");
    if (!host) return;

    const news = await loadData("news");
    host.innerHTML = news
      .map((item, index) => renderNewsCard(item, { large: true, hidden: index >= INITIAL_VISIBLE_NEWS }))
      .join("");

    const loadMoreButton = document.querySelector("[data-load-more]");
    if (loadMoreButton) {
      initLoadMoreButton(loadMoreButton);
    }
  });
})();
