$(function () {
  var DATA_URL = "data/databases.json";
  var DEFAULT_GA = "skin/images/models/default.svg"; // <-- change if you store the default image elsewhere

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function createCard(item) {
    var name = escapeHtml(item.name);
    var abs  = escapeHtml(item.abstract);
    var img  = String(item.graphical_abstract || "").trim();
    var link = String(item.links || "").trim();

    // Use <a> so the whole card is clickable
    var $a = $("<a></a>")
      .addClass("item_a")
      .attr("href", link || "javascript:void(0);")
      .attr("target", link ? "_blank" : "_self")
      .attr("rel", link ? "noopener" : "");

    // Image (with fallback)
    var DEFAULT_GA = "skin/images/databases/default.svg";
    var src = img ? img : DEFAULT_GA;

    var $img = $("<img>")
      .attr("src", src)
      .attr("alt", name ? (name + " graphical abstract") : "Databases graphical abstract")
      .on("error", function () {
        // if image fails to load, fall back to default once
        if (this.src.indexOf(DEFAULT_GA) === -1) {
          this.src = DEFAULT_GA;
        }
      });


    // Title + abstract
    var $title = $("<div></div>").addClass("item_bt").html(name);
    var $desc  = $("<div></div>").addClass("item_bt2").html(abs);

    $a.append($img, $title, $desc);

    // If no link, disable pointer behavior
    if (!link) {
      $a.css({ cursor: "default" });
      $a.on("click", function (e) { e.preventDefault(); });
    }

    return $a;
  }
  /* ===== Home (index.html) carousel support ===== */

  function createHomeSlide(item) {
    var name = escapeHtml(item.name);
    var abs  = escapeHtml(item.abstract);
    var img  = String(item.graphical_abstract || "").trim();
    var link = String(item.links || "").trim();

    var DEFAULT_GA_HOME = "skin/images/databases/default.svg";
    var src = img ? img : DEFAULT_GA_HOME;

    // <a> makes the whole card clickable (same behavior as Models)
    var $a = $("<a></a>")
      .addClass("item")
      .attr("href", link || "javascript:void(0);")
      .attr("target", link ? "_blank" : "_self")
      .attr("rel", link ? "noopener" : "");

    var $img = $("<img>")
      .attr("src", src)
      .attr("alt", name ? (name + " graphical abstract") : "Database graphical abstract")
      .on("error", function () {
        if (this.src.indexOf(DEFAULT_GA_HOME) === -1) this.src = DEFAULT_GA_HOME;
      });

    var $title = $("<div></div>").addClass("item_bt").html(name);
    var $desc  = $("<div></div>").addClass("item_bt2").html(abs);

    $a.append($img, $title, $desc);

    if (!link) {
      $a.css({ cursor: "default" });
      $a.on("click", function (e) { e.preventDefault(); });
    }

    return $("<div></div>").addClass("swiper-slide").append($a);
  }

  function refreshHomeDBSwiper() {
    var el = document.querySelector(".mySwiperDB");
    if (!el || !el.swiper) return;

    var sw = el.swiper;
    if (sw.params && sw.params.loop) {
      sw.loopDestroy();
      sw.update();
      sw.loopCreate();
      sw.update();
    } else {
      sw.update();
    }
  }

  function renderHomeDatabasesCarousel(list) {
    var $wrapper = $(".mySwiperDB .swiper-wrapper");
    if (!$wrapper.length) return; // 不在 index.html 就直接跳过（不会影响 Databases.html）

    $wrapper.empty();

    if (!list || !list.length) {
      // 兜底占位
      $wrapper.append(
        $("<div></div>").addClass("swiper-slide").append(
          $("<div></div>").addClass("item").append(
            $("<img>").attr("src", "skin/images/databases/default.svg").attr("alt", "Default"),
            $("<div></div>").addClass("item_bt").text("No databases yet."),
            $("<div></div>").addClass("item_bt2").text("Please check back soon.")
          )
        )
      );
      refreshHomeDBSwiper();
      return;
    }

    // 可选：只在首页展示前 N 个（比如 8 个）
    // list = list.slice(0, 8);

    list.forEach(function (d) {
      $wrapper.append(createHomeSlide(d));
    });

    refreshHomeDBSwiper();
  }

  function renderDatabases(list) {
    var $wrap = $("#databasesList");
    $wrap.empty();

    if (!list || !list.length) {
      $wrap.append(
        $("<div></div>")
          .css({ width: "100%", textAlign: "center", padding: ".3rem 0", color: "#888" })
          .text("No databases yet.")
      );
      return;
    }

    list.forEach(function (d) {
      $wrap.append(createCard(d));
    });
  }

  function initSectionToggles() {
    function toggle($header) {
      var $section = $header.closest(".models_section");
      var $list = $section.find(".models_list");
      var isCollapsed = $section.hasClass("collapsed");

      if (isCollapsed) {
        $section.removeClass("collapsed").addClass("expanded");
        $header.attr("aria-expanded", "true");
        $list.stop(true, true).slideDown(200, function () {
          // keep flex layout + avoid cropping shadows
          $(this).css({ display: "flex", overflow: "visible" });
        });
      } else {
        $section.addClass("collapsed").removeClass("expanded");
        $header.attr("aria-expanded", "false");
        $list.stop(true, true).slideUp(200);
      }
    }

    $(".models_section_header").on("click", function () {
      toggle($(this));
    });

    $(".models_section_header").on("keydown", function (e) {
      if (e.key === "Enter" || e.key === " " || e.keyCode === 13 || e.keyCode === 32) {
        e.preventDefault();
        toggle($(this));
      }
    });
  }

  initSectionToggles();

  $.getJSON(DATA_URL)
    .done(function (data) {
      renderDatabases(data);
      renderHomeDatabasesCarousel(data); 
    })
    .fail(function () {
      renderDatabases([]);
      renderHomeDatabasesCarousel([]);
      if (window.console && console.warn) console.warn("Failed to load:", DATA_URL);
    });
});
