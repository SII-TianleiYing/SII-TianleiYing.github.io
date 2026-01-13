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
    var DEFAULT_GA = "skin/images/models/default.png";
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
    })
    .fail(function () {
      // Keep page usable even if JSON is missing
      renderModels([]);
      // Optional: log for debugging
      if (window.console && console.warn) console.warn("Failed to load:", DATA_URL);
    });
});
