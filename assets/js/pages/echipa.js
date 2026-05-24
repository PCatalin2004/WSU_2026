(() => {
  const {
    escapeHtml,
    linkAttrs,
    loadData,
    ready,
    renderSocialIcon,
  } = window.WSU;

  const PERSONAL_SOCIAL_ICONS = new Set(["facebook", "instagram"]);

  const knownPortraits = {
    default: "assets/img/echipa/Eca1.png",
    hover: "assets/img/echipa/Eca2.png",
  };

  const unknownPortraits = {
    default: "assets/img/echipa/Unknown_1.png",
    hover: "assets/img/echipa/Unknown_2.png",
  };

  function portraitsForMember(member) {
    return member.name.toLowerCase() === "ecaterina corbu" ? knownPortraits : unknownPortraits;
  }

  function socialIconLinks(member, site) {
    const personalLinks = Array.isArray(member.socials) ? member.socials : [];

    if (personalLinks.length) {
      return personalLinks;
    }

    return site.footer.social.filter((item) => PERSONAL_SOCIAL_ICONS.has(item.icon));
  }

  function renderSocialLink(item, memberName) {
    return `
      <a href="${escapeHtml(item.href)}"${linkAttrs(item.href)} aria-label="${escapeHtml(`${item.label} - ${memberName}`)}">
        ${renderSocialIcon(item, "mini-socials-icon")}
      </a>
    `;
  }

  function renderMiniSocials(member, site) {
    const links = socialIconLinks(member, site);
    if (!links.length) return "";

    return `
      <div class="mini-socials">
        ${links.map((item) => renderSocialLink(item, member.name)).join("")}
      </div>
    `;
  }

  function renderTeamPortrait(portraits) {
    return `
      <div class="team-member-portrait" aria-hidden="true">
        <img class="team-member-image team-member-image-default" loading="eager" decoding="async" src="${portraits.default}" alt="">
        <img class="team-member-image team-member-image-hover" loading="eager" decoding="async" src="${portraits.hover}" alt="">
      </div>
    `;
  }

  function renderManagementMember(member, site) {
    return `
      <article class="team-member reveal-card">
        <div class="team-member-card">
          ${renderTeamPortrait(portraitsForMember(member))}
          <h3>${escapeHtml(member.name)}</h3>
          <p>${escapeHtml(member.role)}</p>
          ${renderMiniSocials(member, site)}
        </div>
      </article>
    `;
  }

  function renderCoordinator(role) {
    return `
      <article class="team-member reveal-card">
        <div class="team-member-card">
          ${renderTeamPortrait(unknownPortraits)}
          <h3>În curând</h3>
          <p>${escapeHtml(role)}</p>
        </div>
      </article>
    `;
  }

  ready(async (site) => {
    const teamHost = document.querySelector("[data-team-management]");
    const coordinatorHost = document.querySelector("[data-team-coordinators]");
    if (!teamHost && !coordinatorHost) return;

    const team = await loadData("team");

    if (teamHost) {
      teamHost.innerHTML = team.management.map((member) => renderManagementMember(member, site)).join("");
    }

    if (coordinatorHost) {
      coordinatorHost.innerHTML = team.coordinators.map(renderCoordinator).join("");
    }
  });
})();
