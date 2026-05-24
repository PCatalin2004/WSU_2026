const renderMiniSocials = (site) => {
  const social = site.footer.social.filter((item) => item.icon === "facebook" || item.icon === "instagram");
  return `
    <div class="mini-socials">
      ${social
        .map(
          (item) =>
            `<a href="${window.WSU.escapeHtml(item.href)}"${window.WSU.linkAttrs(item.href)} aria-label="${window.WSU.escapeHtml(item.label)}"><i data-lucide="${window.WSU.escapeHtml(item.icon)}"></i></a>`,
        )
        .join("")}
    </div>
  `;
};

window.WSU.ready(async (site) => {
  const teamHost = document.querySelector("[data-team-management]");
  const coordinatorHost = document.querySelector("[data-team-coordinators]");
  if (!teamHost && !coordinatorHost) return;

  const team = await window.WSU.loadData("team");

  if (teamHost) {
    teamHost.innerHTML = team.management
      .map(
        (member) => `
          <article class="team-card reveal-card">
            ${window.WSU.responsiveImage(member.image, { sizes: "(max-width: 860px) 100vw, 33vw" })}
            <div>
              <h2>${window.WSU.escapeHtml(member.name)}</h2>
              <p>${window.WSU.escapeHtml(member.role)}</p>
              ${renderMiniSocials(site)}
            </div>
          </article>
        `,
      )
      .join("");
  }

  if (coordinatorHost) {
    coordinatorHost.innerHTML = team.coordinators
      .map(
        (role) => `
          <article class="reveal-card">
            ${window.WSU.responsiveImage(team.placeholderImage, { sizes: "92px", srcSize: "thumb" })}
            <h3>În curând</h3>
            <p>${window.WSU.escapeHtml(role)}</p>
          </article>
        `,
      )
      .join("");
  }
});
