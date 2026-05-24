(() => {
  const {
    loadData,
    ready,
    renderNewsCard,
    responsiveImage,
  } = window.WSU;

  const COUNTDOWN_INTERVAL = 60 * 1000;
  const FEATURED_GALLERY_INDEXES = [0, 6, 9, 13];

  async function renderHomeNews() {
    const host = document.querySelector("[data-home-news]");
    if (!host) return;

    const news = await loadData("news");
    host.innerHTML = news.slice(0, 3).map((item) => renderNewsCard(item)).join("");
  }

  function pickFeaturedGalleryItems(gallery) {
    return FEATURED_GALLERY_INDEXES.map((index) => gallery[index]).filter(Boolean);
  }

  async function renderHomeGallery() {
    const host = document.querySelector("[data-home-gallery]");
    if (!host) return;

    const gallery = await loadData("gallery");
    host.innerHTML = pickFeaturedGalleryItems(gallery)
      .map((item) => responsiveImage(item.image, { sizes: "(max-width: 860px) 50vw, 25vw" }))
      .join("");
  }

  function getCountdownParts(targetTime) {
    const difference = Math.max(0, targetTime - Date.now());
    const totalMinutes = Math.floor(difference / COUNTDOWN_INTERVAL);

    return {
      days: Math.floor(totalMinutes / 1440),
      hours: Math.floor((totalMinutes % 1440) / 60),
      minutes: totalMinutes % 60,
    };
  }

  function updateCountdown(countdown) {
    const targetTime = new Date(countdown.dataset.countdown).getTime();
    const { days, hours, minutes } = getCountdownParts(targetTime);
    const daysNode = countdown.querySelector("[data-days]");
    const hoursNode = countdown.querySelector("[data-hours]");
    const minutesNode = countdown.querySelector("[data-minutes]");

    if (daysNode) daysNode.textContent = String(days);
    if (hoursNode) hoursNode.textContent = String(hours).padStart(2, "0");
    if (minutesNode) minutesNode.textContent = String(minutes).padStart(2, "0");
  }

  function initCountdown(countdown) {
    updateCountdown(countdown);
    window.setInterval(() => updateCountdown(countdown), COUNTDOWN_INTERVAL);
  }

  function initCountdowns() {
    document.querySelectorAll("[data-countdown]").forEach(initCountdown);
  }

  ready(async () => {
    await Promise.all([renderHomeNews(), renderHomeGallery()]);
    initCountdowns();
  });
})();
