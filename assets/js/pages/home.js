window.WSU.ready(async () => {
  const newsHost = document.querySelector("[data-home-news]");
  if (newsHost) {
    const news = await window.WSU.loadData("news");
    newsHost.innerHTML = news.slice(0, 3).map((item) => window.WSU.renderNewsCard(item)).join("");
  }

  const galleryHost = document.querySelector("[data-home-gallery]");
  if (galleryHost) {
    const gallery = await window.WSU.loadData("gallery");
    const featured = [0, 6, 9, 13].map((index) => gallery[index]).filter(Boolean);
    galleryHost.innerHTML = featured
      .map((item) => window.WSU.responsiveImage(item.image, { sizes: "(max-width: 860px) 50vw, 25vw", srcSize: "thumb" }))
      .join("");
  }

  document.querySelectorAll("[data-countdown]").forEach((countdown) => {
    const target = new Date(countdown.dataset.countdown).getTime();
    const daysNode = countdown.querySelector("[data-days]");
    const hoursNode = countdown.querySelector("[data-hours]");
    const minutesNode = countdown.querySelector("[data-minutes]");

    const update = () => {
      const diff = Math.max(0, target - Date.now());
      const totalMinutes = Math.floor(diff / 60000);
      const days = Math.floor(totalMinutes / 1440);
      const hours = Math.floor((totalMinutes % 1440) / 60);
      const minutes = totalMinutes % 60;

      if (daysNode) daysNode.textContent = String(days);
      if (hoursNode) hoursNode.textContent = String(hours).padStart(2, "0");
      if (minutesNode) minutesNode.textContent = String(minutes).padStart(2, "0");
    };

    update();
    setInterval(update, 60000);
  });
});
