(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);

  const status = $("publicProfileStatus");
  const cover = $("publicProfileCover");
  const projects = $("publicProjects");
  const grid = $("publicProjectGrid");
  const repoList = $("publicRepoList");

  function showStatus(message, isError = false) {
    if (!status) return;

    status.textContent = message;
    status.hidden = false;
    status.classList.toggle("is-error", isError);
  }

  function addText(parent, tag, className, value) {
    const element = document.createElement(tag);

    if (className) element.className = className;

    element.textContent = value == null ? "" : String(value);
    parent.appendChild(element);

    return element;
  }

  function formatCount(value) {
    const count = Number(value || 0);

    return count >= 1000
      ? `${(count / 1000).toFixed(1).replace(/\.0$/, "")}k`
      : String(count);
  }

  function formatDate(value) {
    if (!value) return "DATE UNKNOWN";

    const date = new Date(value);

    if (!Number.isFinite(date.getTime())) {
      return "DATE UNKNOWN";
    }

    return `UPDATED ${date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }).toUpperCase()}`;
  }

  function safeGithubUrl(value) {
    try {
      const url = new URL(value);

      if (
        url.protocol === "https:" &&
        url.hostname === "github.com"
      ) {
        return url.href;
      }
    } catch (_) {
      // Use the fallback below.
    }

    return "https://github.com";
  }

  function makeRepoCard(repo, index) {
    const link = document.createElement("a");

    link.className =
      `project-card is-visible${index === 0 ? " project-featured" : ""}`;

    link.href = safeGithubUrl(repo.html_url);
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    const top = addText(link, "div", "project-card-top", "");

    addText(
      top,
      "span",
      "project-number",
      `${String(index + 1).padStart(2, "0")} / ${
        (repo.language || "REPOSITORY").toUpperCase()
      }`
    );

    addText(
      top,
      "span",
      `project-state${repo.archived ? " project-state-muted" : ""}`,
      repo.archived
        ? "ARCHIVED"
        : repo.fork
          ? "FORK"
          : "PUBLIC BUILD"
    );

    const art = addText(
      link,
      "div",
      `project-art art-dynamic art-tone-${index % 4}`,
      ""
    );

    art.setAttribute("aria-hidden", "true");

    addText(
      art,
      "span",
      "dynamic-art-label",
      (repo.language || "PUBLIC REPOSITORY").toUpperCase()
    );

    const orbit = document.createElement("div");
    orbit.className = "dynamic-orbit";
    art.appendChild(orbit);

    const symbol = addText(art, "div", "dynamic-symbol", "");
    const initials = String(repo.name || "GH")
      .split(/[-_\s.]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase();

    addText(symbol, "span", "", initials || "GH");

    const metrics = addText(art, "div", "dynamic-metrics", "");

    addText(
      metrics,
      "span",
      "",
      `★ ${formatCount(repo.stargazers_count)}`
    );

    addText(
      metrics,
      "span",
      "",
      `⑂ ${formatCount(repo.forks_count)}`
    );

    addText(
      art,
      "span",
      "dynamic-art-index",
      `REPO / ${String(index + 1).padStart(2, "0")}`
    );

    const scan = document.createElement("div");
    scan.className = "dynamic-scan";
    art.appendChild(scan);

    const info = addText(link, "div", "project-info", "");
    const copy = addText(info, "div", "", "");

    addText(
      copy,
      "span",
      "project-type",
      (repo.language || "PUBLIC REPOSITORY").toUpperCase()
    );

    addText(copy, "h3", "", repo.name || "Untitled repository");

    addText(
      copy,
      "p",
      "",
      repo.description || "No description provided for this repository."
    );

    const tags = addText(copy, "div", "tag-row", "");

    if (repo.language) {
      addText(tags, "span", "", repo.language);
    }

    (Array.isArray(repo.topics) ? repo.topics : [])
      .slice(0, 3)
      .forEach((topic) => addText(tags, "span", "", topic));

    const meta = addText(copy, "div", "repo-meta-row", "");

    addText(
      meta,
      "span",
      "",
      `★ ${formatCount(repo.stargazers_count)}`
    );

    addText(
      meta,
      "span",
      "",
      `⑂ ${formatCount(repo.forks_count)}`
    );

    addText(meta, "span", "", formatDate(repo.updated_at));
    addText(info, "span", "project-open", "↗");

    return link;
  }

  function makeRepoRow(repo, index) {
    const link = document.createElement("a");

    link.className = "repo-row";
    link.href = safeGithubUrl(repo.html_url);
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    addText(
      link,
      "span",
      "repo-index",
      String(index + 1).padStart(2, "0")
    );

    addText(link, "span", "repo-name", repo.name || "Repository");

    addText(
      link,
      "span",
      "repo-description",
      repo.description ||
        `${repo.language || "Public repository"} · ${formatDate(repo.updated_at)}`
    );

    addText(link, "span", "repo-arrow", "↗");

    return link;
  }

  function renderRepositories(bundle) {
    const profile = bundle.profile || {};
    const repositories = Array.isArray(bundle.repositories)
      ? [...bundle.repositories]
      : [];

    repositories.sort(
      (a, b) =>
        new Date(b.pushed_at || b.updated_at || 0) -
        new Date(a.pushed_at || a.updated_at || 0)
    );

    if (grid) grid.replaceChildren();
    if (repoList) repoList.replaceChildren();

    if (!repositories.length) {
      addText(
        grid,
        "div",
        "empty-state",
        "No public repositories are available for this GitHub account."
      );
    } else {
      repositories.slice(0, 3).forEach((repo, index) => {
        grid.appendChild(makeRepoCard(repo, index));
      });

      repositories.slice(3).forEach((repo, index) => {
        repoList.appendChild(makeRepoRow(repo, index + 3));
      });
    }

    const stats = $("publicStats");

    if (stats) {
      stats.replaceChildren();

      [
        ["PUBLIC REPOSITORIES", formatCount(profile.public_repos)],
        ["FOLLOWERS", formatCount(profile.followers)],
        ["FOLLOWING", formatCount(profile.following)]
      ].forEach(([label, value]) => {
        const item = document.createElement("div");

        addText(item, "span", "", label);
        addText(item, "strong", "", value);

        stats.appendChild(item);
      });
    }

    const projectsNote = $("publicProjectsNote");

    if (projectsNote) {
      projectsNote.textContent =
        `${repositories.length} public repositories loaded from GitHub.`;
    }
  }

  async function loadPublicProfile() {
    const params = new URLSearchParams(window.location.search);
    const voidId = (params.get("id") || "").trim();

    if (!/^[A-Za-z0-9_-]{3,32}$/.test(voidId)) {
      throw new Error(
        "Invalid VOID profile link. Open a profile using profile.html?id=VOID_ID."
      );
    }

    const config = window.VOID_CONFIG || {};

    if (
      !config.supabaseUrl ||
      !config.supabasePublishableKey ||
      !window.supabase ||
      typeof window.supabase.createClient !== "function"
    ) {
      throw new Error(
        "Supabase configuration could not load. Check supabase-config.js."
      );
    }

    const client = window.supabase.createClient(
      config.supabaseUrl,
      config.supabasePublishableKey
    );

    const { data, error } = await client.rpc(
      "void_public_profile_by_username",
      { input_username: voidId }
    );

    if (error) throw error;

    const profile = Array.isArray(data) ? data[0] : data;

    if (!profile) {
      throw new Error(
        "VOID profile not found, or the owner has disabled public profile discovery."
      );
    }

    const displayName = profile.display_name || profile.void_id || voidId;
    const githubUsername = profile.github_username || "";

    $("publicDisplayName").textContent = displayName;
    $("publicVoidId").textContent = `VOID ID / ${profile.void_id || voidId}`;
    $("publicBio").textContent =
      profile.bio || "A personal VOID profile and public project portfolio.";

    const githubId = $("publicGithubId");
    githubId.textContent = githubUsername
      ? `GITHUB / @${githubUsername}`
      : "GITHUB / NOT CONNECTED";

    const githubLink = $("publicGithubLink");
    const footerGithub = $("publicFooterGithub");

    [githubLink, footerGithub].forEach((link) => {
      if (!link) return;

      link.hidden = !githubUsername;

      if (githubUsername) {
        link.href =
          `https://github.com/${encodeURIComponent(githubUsername)}`;
      }
    });

    const avatar = $("publicAvatar");
    avatar.src = "https://github.com/ghost.png";
    avatar.alt = `${displayName} profile avatar`;

    if (cover) cover.hidden = false;

    // Reveal the profile even if GitHub's API is unavailable.
    if (!githubUsername) {
      if (projects) projects.hidden = true;
      status.hidden = true;
      return;
    }

    if (projects) projects.hidden = false;

    $("publicProjectsTitle").textContent = `${displayName}'s projects.`;

    showStatus("Profile found. Loading public GitHub repositories…");

    try {
      if (!window.VOIDGitHub) {
        throw new Error("GitHub helper did not load.");
      }

      const bundle = await window.VOIDGitHub.getBundle(githubUsername);

      if (bundle.profile.avatar_url) {
        avatar.src = bundle.profile.avatar_url;
      }

      renderRepositories(bundle);
      status.hidden = true;
    } catch (error) {
      if (grid) {
        grid.replaceChildren();

        addText(
          grid,
          "div",
          "empty-state",
          "Your VOID profile loaded, but GitHub repositories could not be fetched. Please try again later."
        );
      }

      if (repoList) repoList.replaceChildren();

      showStatus(
        `Profile loaded, but GitHub sync failed: ${error.message}`,
        true
      );
    }
  }

  // Prevent the page from displaying its loading message forever.
  let timeoutId;

  const timeout = new Promise((_, reject) => {
    timeoutId = window.setTimeout(() => {
      reject(
        new Error(
          "The request timed out. Check your internet connection and Supabase settings, then refresh."
        )
      );
    }, 15000);
  });

  Promise.race([loadPublicProfile(), timeout])
    .catch((error) => {
      console.error("VOID public profile error:", error);
      showStatus(error.message || "Unable to load this public profile.", true);
    })
    .finally(() => {
      window.clearTimeout(timeoutId);
    });
})();
