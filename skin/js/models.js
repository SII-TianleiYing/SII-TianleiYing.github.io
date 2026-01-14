$(function () {
  var DATA_URL = "data/models.json";

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function normalizeType(t) {
    t = String(t || "").trim().toUpperCase();
    return (t === "A" || t === "I") ? t : "";
  }

  function createCard(model) {
    var name = escapeHtml(model.name);
    var abs = escapeHtml(model.abstract);
    var img = escapeHtml(model.graphical_abstract);
    var link = String(model.links || "").trim();

    // Use <a> so the whole card is clickable
    var $a = $("<a></a>")
      .addClass("item_a")
      .attr("href", link || "javascript:void(0);")
      .attr("target", link ? "_blank" : "_self")
      .attr("rel", link ? "noopener" : "");

    // Image (with fallback)
    var DEFAULT_GA = "skin/images/models/default.svg";
    var src = img ? img : DEFAULT_GA;

    var $img = $("<img>")
      .attr("src", src)
      .attr("alt", name ? (name + " graphical abstract") : "Model graphical abstract")
      .on("error", function () {
        // if image fails to load, fall back to default once
        if (this.src.indexOf(DEFAULT_GA) === -1) {
          this.src = DEFAULT_GA;
        }
      });

    // Title + abstract
    var $title = $("<div></div>").addClass("item_bt").html(name);
    var $desc = $("<div></div>").addClass("item_bt2").html(abs);

    $a.append($img, $title, $desc);

    // If no link, disable pointer behavior
    if (!link) {
      $a.css({ cursor: "default" });
      $a.on("click", function (e) { e.preventDefault(); });
    }

    return $a;
  }

  // ===== Home page: fill the Models swiper (.mySwiper1) from the same models.json =====
  function createHomeSlide(model) {
    var name = escapeHtml(model.name);
    var abs  = escapeHtml(model.abstract);
    var img  = String(model.graphical_abstract || "").trim();
    var link = String(model.links || "").trim();

    var DEFAULT_GA = "skin/images/models/default.svg";
    var src = img ? img : DEFAULT_GA;

    var $slide = $("<div></div>").addClass("swiper-slide");

    // Use <a class="item"> to reuse index.html card style (.item in style.css)
    // style.css has the .item card look :contentReference[oaicite:4]{index=4}
    var $card = $("<a></a>")
      .addClass("item")
      .attr("href", link || "javascript:void(0);")
      .attr("target", link ? "_blank" : "_self")
      .attr("rel", link ? "noopener" : "")
      .css({ display: "block", color: "inherit", textDecoration: "none" });

    var $img = $("<img>")
      .attr("src", src)
      .attr("alt", name ? (name + " graphical abstract") : "Model graphical abstract")
      .on("error", function () {
        if (this.src.indexOf(DEFAULT_GA) === -1) this.src = DEFAULT_GA;
      });

    var $title = $("<div></div>").addClass("item_bt").html(name);
    var $desc  = $("<div></div>").addClass("item_bt2").html(abs);

    $card.append($img, $title, $desc);

    // If no link, disable click
    if (!link) {
      $card.css({ cursor: "default" });
      $card.on("click", function (e) { e.preventDefault(); });
    }

    $slide.append($card);
    return $slide;
  }

  function refreshHomeSwiper() {
    var el = document.querySelector(".mySwiper1");
    if (!el) return;

    // Swiper attaches instance to DOM element: el.swiper
    var sw = el.swiper;
    if (!sw) return;

    // If loop enabled, rebuild loop after changing slides
    if (sw.params && sw.params.loop) {
      if (typeof sw.loopDestroy === "function") sw.loopDestroy();
      sw.update();
      if (typeof sw.loopCreate === "function") sw.loopCreate();
      sw.update();
    } else {
      sw.update();
    }
  }

  function renderHomeModelsCarousel(models) {
    // Only run on pages that have the home swiper
    var $wrapper = $(".mySwiper1 .swiper-wrapper");
    if (!$wrapper.length) return;

    // Optional: limit number of slides on home
    var list = (models || []).slice(0); // keep JSON order

    $wrapper.empty();

    if (!list.length) {
      // keep at least 1 slide so Swiper doesn't look broken
      $wrapper.append(
        $("<div></div>").addClass("swiper-slide").append(
          $("<div></div>").addClass("item").css({ padding: ".6rem .4rem" }).text("No models yet.")
        )
      );
      refreshHomeSwiper();
      return;
    }

    list.forEach(function (m) {
      $wrapper.append(createHomeSlide(m));
    });

    // After DOM updated, tell Swiper to recalc
    refreshHomeSwiper();
  }

  function renderModels(models) {
    var groups = { A: [], I: [] };

    (models || []).forEach(function (m) {
      var t = normalizeType(m.type);
      if (!t) return;
      groups[t].push(m);
    });

    function renderInto(containerId, list) {
      var $wrap = $("#" + containerId);
      $wrap.empty();

      if (!list || !list.length) {
        $wrap.append(
          $("<div></div>")
            .css({ width: "100%", textAlign: "center", padding: ".3rem 0", color: "#888" })
            .text("No models yet.")
        );
        return;
      }

      list.forEach(function (m) {
        $wrap.append(createCard(m));
      });
    }

    renderInto("modelsA", groups.A);
    renderInto("modelsI", groups.I);
  }

  function initSectionToggles() {
    function toggle($header) {
      var $section = $header.closest(".models_section");
      var $list = $section.find(".models_list");
      var isCollapsed = $section.hasClass("collapsed");

      if (isCollapsed) {
        $section.removeClass("collapsed").addClass("expanded");
        $header.attr("aria-expanded", "true");
        $list.stop(true, true).slideDown(200, function(){ $(this).css('display','flex'); });
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
      renderModels(data);
      renderHomeModelsCarousel(data);
    })
    .fail(function () {
      // Keep page usable even if JSON is missing
      renderModels([]);
      renderHomeModelsCarousel([]);
      // Optional: log for debugging
      if (window.console && console.warn) console.warn("Failed to load:", DATA_URL);
    });
});
