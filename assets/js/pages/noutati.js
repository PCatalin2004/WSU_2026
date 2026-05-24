window.WSU.ready(async () => {
  const host = document.querySelector("[data-news-list]");
  if (!host) return;

  const news = await window.WSU.loadData("news");
  host.innerHTML = news
    .map((item, index) => window.WSU.renderNewsCard(item, { large: true, hidden: index > 2 }))
    .join("");

  const loadMoreButton = document.querySelector("[data-load-more]");
  if (!loadMoreButton) return;

  const updateButtonState = () => {
    loadMoreButton.classList.toggle("is-hidden", document.querySelectorAll("[data-news-list] .is-hidden").length === 0);
  };

  loadMoreButton.addEventListener("click", () => {
    const hiddenItems = Array.from(document.querySelectorAll("[data-news-list] .is-hidden"));
    hiddenItems.slice(0, 2).forEach((item) => item.classList.remove("is-hidden"));
    updateButtonState();
  });

  updateButtonState();
});
