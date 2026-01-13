(function () {
  // ========= helpers =========
  function escapeHtml(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function typeLabel(type) {
    var t = String(type || "").toLowerCase();
    var map = {
      journal: "Journal Article",
      conference: "Conference Paper",
      preprint: "Preprint",
      patent: "Patent",
      bookchapter: "Book Chapter",
      dataset: "Dataset",
      other: "Other"
    };
    return map[t] || "Other";
  }

  function typeClass(type) {
    var t = String(type || "other").toLowerCase().replace(/[^a-z0-9_-]/g, "");
    return "pub_type_badge--" + t;
  }

  function iconForKind(kind) {
    var k = String(kind || "").toLowerCase();
    if (k === "pdf") return "fas fa-file-pdf";
    if (k === "doi") return "fas fa-external-link-alt";
    if (k === "paper" || k === "journal" || k === "page") return "fas fa-globe";
    if (k === "pubmed") return "fas fa-database";
    if (k === "code" || k === "github") return "fas fa-code";
    if (k === "data" || k === "dataset") return "fas fa-database";
    if (k === "slides") return "fas fa-file-powerpoint";
    if (k === "video") return "fas fa-video";
    return "fas fa-link";
  }

  function normalizeDateStr(pub) {
    // 你规定 date 是 ISO 字符串；缺省时用 year-00-00 保底，保证可排序
    var y = pub && pub.year ? String(pub.year) : "";
    var d = pub && pub.date ? String(pub.date) : "";
    if (d && /^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
    if (d && /^\d{4}-\d{2}$/.test(d)) return d + "-00";
    if (y && /^\d{4}$/.test(y)) return y + "-00-00";
    return "0000-00-00";
  }

  function getPrimaryTitleUrl(pub) {
    // 优先用 links 里的 paper，其次 doi 字段
    var links = Array.isArray(pub.links) ? pub.links : [];
    for (var i = 0; i < links.length; i++) {
      var k = String(links[i].kind || "").toLowerCase();
      if (k === "paper" || k === "journal" || k === "page") return links[i].url || "";
    }
    if (pub.doi) return "https://doi.org/" + String(pub.doi).trim();
    return "";
  }

  function buildLinks(pub) {
    var links = Array.isArray(pub.links) ? pub.links.slice() : [];

    // 自动补 DOI link（如果 doi 有、links 里没写）
    var hasDoi = links.some(function (l) {
      return String(l.kind || "").toLowerCase() === "doi";
    });
    if (pub.doi && !hasDoi) {
      links.push({
        kind: "doi",
        label: "DOI: " + String(pub.doi).trim(),
        url: "https://doi.org/" + String(pub.doi).trim()
      });
    }

    if (links.length === 0) {
      return (
        '<ul class="tp_pub_list">' +
          '<li><i class="fas fa-link"></i><span>No links provided.</span></li>' +
        "</ul>"
      );
    }

    var items = links
      .filter(function (l) { return l && l.url; })
      .map(function (l) {
        var icon = iconForKind(l.kind);
        var label = l.label ? l.label : (l.kind ? String(l.kind).toUpperCase() : "Link");
        return (
          '<li>' +
            '<i class="' + icon + '"></i>' +
            '<a class="tp_pub_list" href="' + escapeHtml(l.url) + '" target="_blank" rel="noopener noreferrer">' +
              escapeHtml(label) +
            "</a>" +
          "</li>"
        );
      })
      .join("");

    return '<ul class="tp_pub_list">' + items + "</ul>";
  }

  function buildAbstractHtml(pub) {
    var abs = pub.abstract ? String(pub.abstract) : "";
    if (!abs.trim()) {
      return "<p>No abstract provided.</p>";
    }
    // 支持 \n\n 分段
    var parts = abs.split(/\n\s*\n/g).map(function (p) { return p.trim(); }).filter(Boolean);
    return parts.map(function (p) { return "<p>" + escapeHtml(p) + "</p>"; }).join("");
  }

  function renderPubItem(pub) {
    var authors = Array.isArray(pub.authors) ? pub.authors.join(", ") : (pub.authors || "");
    var titleUrl = getPrimaryTitleUrl(pub);
    var titleHtml = titleUrl
      ? '<a class="pub_title_link" href="' + escapeHtml(titleUrl) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(pub.title || "") + "</a>"
      : "<span>" + escapeHtml(pub.title || "") + "</span>";

    var venueName = pub.venue && pub.venue.name ? pub.venue.name : "";
    var venueIf = pub.venue && pub.venue.if ? pub.venue.if : "";
    var venueLoc = pub.venue && pub.venue.location ? pub.venue.location : "";

    var venueMeta = [];
    if (venueIf) venueMeta.push("IF=" + venueIf);
    if (venueLoc) venueMeta.push(venueLoc);

    var venueLine =
    "<p class=\"pub_venue\">" +
        "<em>" + escapeHtml(venueName) + "</em>" +
        (venueMeta.length ? " <span class=\"pub_venue_meta\">(" + escapeHtml(venueMeta.join(" · ")) + ")</span>" : "") +
        " <span class=\"pub_type_badge " + typeClass(pub.type) + "\">" + escapeHtml(typeLabel(pub.type)) + "</span>" +
    "</p>";

    return (
    '<div class="cation_item_li" data-id="' + escapeHtml(pub.id || "") + '" data-type="' + escapeHtml(pub.type || "") + '" data-date="' + escapeHtml(normalizeDateStr(pub)) + '">' +
        '<div class="cation_item_li_bt">' +
        '<p class="pub_authors">' + escapeHtml(authors) + "</p>" +
        '<h3 class="pub_title">' +
            titleHtml +
        "</h3>" +
        venueLine +



          // 原来的点击结构（保留）
          '<div class="tp_pub_menu">' +
            '<div class="tp_tab_links">' +
              '<span class="tp_abstract_link">' +
                '<a href="javascript:void(0);" onclick="showSection(this, \'abstract\')">' +
                  '<i class="fas fa-file-alt"></i> Abstract' +
                "</a>" +
              "</span>" +
              '<span class="tp_resource_link">' +
                '<a href="javascript:void(0);" onclick="showSection(this, \'links\')">' +
                  '<i class="fas fa-link"></i> Links' +
                "</a>" +
              "</span>" +
            "</div>" +
            '<button class="close_btn" onclick="hideAllSections(this)">' +
              '<i class="fas fa-times"></i> Close' +
            "</button>" +
          "</div>" +

          '<div class="tp_abstract">' +
            '<div class="tp_content_header">' +
              '<div class="tp_content_title"><i class="fas fa-file-alt"></i> Abstract</div>' +
              '<button class="tp_close_content" onclick="hideCurrentSection(this)" title="Close"><i class="fas fa-times"></i></button>' +
            "</div>" +
            '<div class="tp_abstract_content">' + buildAbstractHtml(pub) + "</div>" +
          "</div>" +

          '<div class="tp_links">' +
            '<div class="tp_content_header">' +
              '<div class="tp_content_title"><i class="fas fa-link"></i> Related Links</div>' +
              '<button class="tp_close_content" onclick="hideCurrentSection(this)" title="Close"><i class="fas fa-times"></i></button>' +
            "</div>" +
            '<div class="tp_links_entry">' + buildLinks(pub) + "</div>" +
          "</div>" +

          '<div class="no_content">' +
            '<i class="fas fa-folder-open"></i>' +
            '<p>No content selected. Click on "Abstract" or "Links" to view content.</p>' +
            '<button class="close_btn" onclick="showSectionFromNoContent(this)" style="margin-top: 10px;">' +
              '<i class="fas fa-file-alt"></i> Show Abstract' +
            "</button>" +
          "</div>" +
        "</div>" +
      "</div>"
    );
  }

  function groupByYear(pubs) {
    var map = {};
    pubs.forEach(function (p) {
      var y = p.year;
      if (!y && p.date && /^\d{4}/.test(p.date)) y = parseInt(String(p.date).slice(0, 4), 10);
      if (!y) y = 0;
      if (!map[y]) map[y] = [];
      map[y].push(p);
    });
    return map;
  }

  function sortPubsDesc(a, b) {
    var da = normalizeDateStr(a);
    var db = normalizeDateStr(b);
    // ISO 字符串可直接比较
    if (da > db) return -1;
    if (da < db) return 1;
    var ta = String(a.title || "");
    var tb = String(b.title || "");
    return ta.localeCompare(tb);
  }

  function renderYearGroup(year, pubs) {
    pubs.sort(sortPubsDesc);

    var itemsHtml = pubs.map(renderPubItem).join("");

    // 年份在色块上面；色块用现有 .cation_item 做“年块容器”
    return (
      '<div class="pub_year_group" data-year="' + escapeHtml(year) + '">' +
        '<div class="pub_year_label">' + escapeHtml(year) + "</div>" +
        '<div class="cation_item pub_year_block">' +
          itemsHtml +
        "</div>" +
      "</div>"
    );
  }

  async function loadPublications(jsonUrl, containerEl) {
    try {
      var res = await fetch(jsonUrl, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch publications.json: " + res.status);
      var data = await res.json();
      if (!Array.isArray(data)) throw new Error("publications.json must be an array");

      // 过滤掉明显无效的条目
      var pubs = data.filter(function (p) { return p && p.title; });

      var byYear = groupByYear(pubs);
      var years = Object.keys(byYear)
        .map(function (y) { return parseInt(y, 10); })
        .filter(function (y) { return !isNaN(y) && y > 0; })
        .sort(function (a, b) { return b - a; }); // 年份倒序

      var html = years.map(function (y) { return renderYearGroup(y, byYear[y]); }).join("");
      containerEl.innerHTML = html || '<p style="padding:.4rem 0;">No publications found.</p>';
      setupPublicationSearch(containerEl);
    } catch (err) {
      console.error(err);
      containerEl.innerHTML =
        '<p style="padding:.4rem 0; color:#c00;">Failed to load publications. Please check console.</p>';
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    var pubContainer = document.getElementById("publicationsContainer");
    if (pubContainer) {
      // 你的 json 地址
      loadPublications("data/publications.json", pubContainer);
    }
  });

  // 可选：暴露给调试用
  window._loadPublications = loadPublications;
function buildSearchIndex(containerEl){
  var items = containerEl.querySelectorAll(".cation_item_li");
  items.forEach(function (item) {
    // 抽取你要搜索的字段：作者/标题/期刊/标签/doi/date 等
    var authors = item.querySelector(".pub_authors")?.textContent || "";
    var title = item.querySelector(".pub_title")?.textContent || "";
    var venue = item.querySelector(".pub_venue")?.textContent || "";
    var type = item.getAttribute("data-type") || "";
    var date = item.getAttribute("data-date") || "";

    item.dataset.search = (authors + " " + title + " " + venue + " " + type + " " + date)
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
  });
}

    function setupPublicationSearch(pubRootEl){
    var input = document.getElementById("pubSearchInput");
    var clearBtn = document.getElementById("pubSearchClear");
    if (!input || !clearBtn) return;

    buildSearchIndex(pubRootEl);

    function applyFilter(){
        var q = (input.value || "").toLowerCase().trim();

        // 1) 过滤每条 publication
        var items = pubRootEl.querySelectorAll(".cation_item_li");
        items.forEach(function(item){
        var hay = item.dataset.search || "";
        var hit = !q || hay.indexOf(q) !== -1;
        item.style.display = hit ? "" : "none";
        });

        // 2) 如果某一年下没有任何可见条目，就隐藏整年块
        var groups = pubRootEl.querySelectorAll(".pub_year_group");
        groups.forEach(function(g){
        var visibleCount = g.querySelectorAll(".cation_item_li:not([style*='display: none'])").length;
        g.style.display = visibleCount ? "" : "none";
        });
    }

    input.addEventListener("input", applyFilter);

    clearBtn.addEventListener("click", function(){
        input.value = "";
        applyFilter();
        input.focus();
    });

    // 初始应用一次（以防默认有值）
    applyFilter();
    }
})();
