$(function () {
  var DATA_URL = "data/databases.json";
  var DEFAULT_GA = "skin/images/models/default.png"; // <-- change if you store the default image elsewhere

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
    var DEFAULT_GA = "skin/images/databases/default.png";
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
    })
    .fail(function () {
      renderDatabases([]);
      if (window.console && console.warn) console.warn("Failed to load:", DATA_URL);
    });
});
