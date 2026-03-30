(function () {
  "use strict";

  // ── Base path — set to "" to serve from root ──
  const BASE = "/preview";

  const CONTENT = BASE + "/content/";
  const PAGE_DIR = CONTENT + "pages/";
  const SITE_NAME = "Arya Samaj Pratinidhi Sabha New Zealand Incorporated";

  const PAGE_META = {
    home:         { title: "",              desc: "Arya Samaj Pratinidhi Sabha New Zealand - promoting Vedic values, universal brotherhood, and community service in New Zealand." },
    events:       { title: "Events",        desc: "Upcoming events, satsanghs, and programs organized by Arya Samaj New Zealand." },
    joinus:       { title: "Join Us",       desc: "Join the Arya Samaj family in New Zealand. Membership enquiries and information." },
    aboutus:      { title: "About Us",      desc: "About Arya Samaj Pratinidhi Sabha New Zealand Incorporated, the national representative body." },
    contactus:    { title: "Contact Us",    desc: "Contact details for Arya Samaj New Zealand executives and officers." },
    executives:   { title: "Executives",    desc: "Executive committee members of Arya Samaj Pratinidhi Sabha New Zealand." },
    purohits:     { title: "Purohits",      desc: "Purohits (priests) associated with Arya Samaj New Zealand." },
    constitution: { title: "Constitution",  desc: "Constitution of Arya Samaj Pratinidhi Sabha New Zealand Incorporated." },
    gallery:      { title: "Gallery",       desc: "Photo gallery of Arya Samaj New Zealand events and activities." },
  };

  let eventsCache = null;
  let searchIndex = null;

  // ── Strip YAML frontmatter used by Decap CMS ──
  function stripFrontmatter(md) {
    return md.replace(/^---\n[\s\S]*?---\n/, "");
  }

  // ── Fetch markdown text from a file ──
  async function fetchMD(path) {
    const res = await fetch(path);
    if (!res.ok) throw new Error(res.status);
    const text = await res.text();
    return stripFrontmatter(text);
  }

  // ── Fetch & render a markdown file into an element ──
  async function loadMD(path, targetEl, postProcess) {
    try {
      const md = await fetchMD(path);
      targetEl.innerHTML = marked.parse(md);
      if (postProcess) postProcess(targetEl);
    } catch (e) {
      console.warn(`Could not load ${path}:`, e);
      targetEl.innerHTML = `<p style="color:#999">Content unavailable.</p>`;
    }
  }

  // ── Load and cache events_list.md ──
  async function getEventsMD() {
    if (eventsCache === null) {
      try {
        eventsCache = await fetchMD(CONTENT + "events_list.md");
      } catch (e) {
        console.warn("Could not load events_list.md:", e);
        eventsCache = "";
      }
    }
    return eventsCache;
  }

  // ── Build condensed sidebar markdown from full events markdown ──
  function buildSidebarEventsMD(fullMd) {
    var sidebar = "## Upcoming Events\n\n";
    var sections = fullMd.split(/(?=^### )/m);
    var added = 0;
    for (var i = 0; i < sections.length; i++) {
      var lines = sections[i].split("\n");
      if (!lines[0].startsWith("### ")) continue;
      if (added > 0) sidebar += "\n---\n\n";
      var title = lines[0].replace("### ", "").trim();
      sidebar += "### [" + title + "](/events)\n\n";
      for (var j = 1; j < lines.length; j++) {
        if (/^\*\*(Venue|Date|Time|Starts|Ends)/.test(lines[j].trim())) {
          sidebar += lines[j] + "\n\n";
        }
      }
      sidebar += "\n";
      added++;
    }
    return sidebar;
  }

  // ── Build the top nav from menu.md ──
  function buildNav(container) {
    const links = container.querySelectorAll("a");
    const nav = document.getElementById("main-nav");
    nav.innerHTML = "";
    links.forEach((a) => {
      nav.appendChild(a.cloneNode(true));
    });
    container.innerHTML = "";
  }

  // ── Highlight active nav link ──
  function setActiveNav(page) {
    document.querySelectorAll("#main-nav a").forEach((a) => {
      const href = a.getAttribute("href");
      const target = href === "/" ? "home" : href.replace(/^\//, "");
      a.classList.toggle("active", target === page);
    });
  }

  // ── Update header title and meta tags ──
  function updateMeta(page) {
    const meta = PAGE_META[page] || { title: page, desc: "" };
    const suffix = meta.title ? " - " + meta.title : "";
    document.title = SITE_NAME + suffix;
    document.querySelector(".header-title h1 a").textContent = SITE_NAME + suffix;
    var descTag = document.querySelector('meta[name="description"]');
    if (descTag) descTag.setAttribute("content", meta.desc);
    var ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", SITE_NAME + suffix);
    var ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute("content", meta.desc);
    var canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute("href", window.location.origin + BASE + (page === "home" ? "/" : "/" + page));
  }

  // ── Get current page from pathname (strips BASE) ──
  function getPage() {
    var path = window.location.pathname;
    if (BASE && path.startsWith(BASE)) {
      path = path.slice(BASE.length);
    }
    path = path.replace(/^\//, "").replace(/\/$/, "");
    return path || "home";
  }

  // ── Navigate via History API ──
  function navigateTo(fullPath) {
    closeSearch();
    window.history.pushState(null, "", fullPath);
    route();
  }

  // ── Route ──
  async function route() {
    const page = getPage();
    setActiveNav(page);
    updateMeta(page);
    const target = document.getElementById("page-content");
    if (page === "events") {
      const eventsMd = await getEventsMD();
      target.innerHTML = marked.parse("# Events\n\n## Upcoming Events\n\n" + eventsMd);
    } else {
      loadMD(PAGE_DIR + page + ".md", target);
    }
    window.scrollTo({ top: 0 });
  }

  // ── Global click interceptor for internal links ──
  // Markdown files use root-relative links (/events, /contactus).
  // This interceptor prepends BASE so they resolve correctly.
  document.addEventListener("click", (e) => {
    const link = e.target.closest("a");
    if (!link) return;
    const href = link.getAttribute("href");
    if (!href || href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
    e.preventDefault();
    var fullPath = href.startsWith("/") ? BASE + href : href;
    navigateTo(fullPath);
    // Close mobile menu if open
    if (mainNav.classList.contains("open")) {
      mainNav.classList.remove("open");
      menuToggle.textContent = "\u2630";
      menuToggle.setAttribute("aria-label", "Toggle menu");
    }
  });

  // ── Handle browser back/forward ──
  window.addEventListener("popstate", route);

  // ── Mobile menu toggle ──
  const menuToggle = document.getElementById("menu-toggle");
  const mainNav = document.getElementById("main-nav");

  menuToggle.addEventListener("click", () => {
    const open = mainNav.classList.toggle("open");
    menuToggle.textContent = open ? "\u2715" : "\u2630";
    menuToggle.setAttribute("aria-label", open ? "Close menu" : "Toggle menu");
  });

  // ── Search ──
  const searchToggle = document.getElementById("search-toggle");
  const searchBox = document.getElementById("search-box");
  const searchInput = document.getElementById("search-input");
  const searchResults = document.getElementById("search-results");

  function stripMarkdown(md) {
    return md
      .replace(/^#{1,6}\s+/gm, "")
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/[-*_]{3,}/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  async function buildSearchIndex() {
    if (searchIndex) return;
    searchIndex = {};
    var eventsMd = await getEventsMD();
    var slugs = Object.keys(PAGE_META);
    await Promise.all(slugs.map(async function (slug) {
      try {
        var md;
        if (slug === "events") {
          md = "# Events\n\n## Upcoming Events\n\n" + eventsMd;
        } else {
          md = await fetchMD(PAGE_DIR + slug + ".md");
        }
        searchIndex[slug] = {
          title: PAGE_META[slug].title || "Home",
          text: stripMarkdown(md),
        };
      } catch (e) {
        // skip pages that fail to load
      }
    }));
  }

  function searchPages(query) {
    if (!searchIndex) return [];
    var q = query.toLowerCase();
    var results = [];
    for (var slug in searchIndex) {
      var entry = searchIndex[slug];
      var idx = entry.text.toLowerCase().indexOf(q);
      if (idx === -1) continue;
      var start = Math.max(0, idx - 50);
      var end = Math.min(entry.text.length, idx + query.length + 50);
      var before = escapeHtml(entry.text.slice(start, idx));
      var match = escapeHtml(entry.text.slice(idx, idx + query.length));
      var after = escapeHtml(entry.text.slice(idx + query.length, end));
      var snippet = (start > 0 ? "..." : "") + before + "<mark>" + match + "</mark>" + after + (end < entry.text.length ? "..." : "");
      results.push({ slug: slug, title: entry.title, snippet: snippet });
    }
    return results;
  }

  function renderResults(query) {
    if (query.length < 4) {
      searchResults.innerHTML = query.length > 0
        ? '<p class="search-min">Type at least 4 characters to search.</p>'
        : "";
      return;
    }
    var results = searchPages(query);
    if (results.length === 0) {
      searchResults.innerHTML = '<p class="search-min">No results found.</p>';
      return;
    }
    searchResults.innerHTML = results.map(function (r) {
      var href = r.slug === "home" ? "/" : "/" + r.slug;
      return '<div class="search-result"><a href="' + href + '">'
        + "<strong>" + escapeHtml(r.title) + "</strong>"
        + '<span class="search-snippet">' + r.snippet + "</span>"
        + "</a></div>";
    }).join("");
  }

  function openSearch() {
    searchBox.classList.add("open");
    searchInput.value = "";
    searchResults.innerHTML = "";
    searchInput.focus();
  }

  function closeSearch() {
    searchBox.classList.remove("open");
    searchInput.value = "";
    searchResults.innerHTML = "";
  }

  searchToggle.addEventListener("click", function (e) {
    e.stopPropagation();
    if (searchBox.classList.contains("open")) {
      closeSearch();
    } else {
      openSearch();
    }
  });

  searchInput.addEventListener("input", function () {
    renderResults(searchInput.value.trim());
  });

  // Close search when clicking outside
  document.addEventListener("click", function (e) {
    if (searchBox.classList.contains("open") && !searchBox.contains(e.target) && e.target !== searchToggle) {
      closeSearch();
    }
  });

  // Close search on Escape
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && searchBox.classList.contains("open")) {
      closeSearch();
    }
  });

  // ── Initialise ──
  async function init() {
    const menuHolder = document.createElement("div");
    const [eventsMd] = await Promise.all([
      getEventsMD(),
      loadMD(CONTENT + "menu.md", menuHolder, buildNav),
      loadMD(CONTENT + "sidebar-links.md", document.getElementById("sidebar-left")),
    ]);
    // Build sidebar events from cached events data
    const sidebarEl = document.getElementById("sidebar-right");
    sidebarEl.innerHTML = marked.parse(buildSidebarEventsMD(eventsMd));

    route();

    // Build search index in background
    buildSearchIndex();
  }

  init();
})();
