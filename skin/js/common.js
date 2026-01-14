$(function() {
    // 菜单点击事件
    $(".m_menu").on("click", function(){
        var $this = $(this);
        var $menu = $(".head_menu");
        
        $this.toggleClass("active");
        
        if ($(window).width() <= 980) {
            if ($menu.hasClass("active")) {
                $menu.removeClass("active").slideUp(300);
            } else {
                $menu.addClass("active").slideDown(300);
            }
        }
    });
    
    // 监听窗口大小变化
    $(window).on('resize', function() {
        var width = $(window).width();
        var $menu = $(".head_menu");
        
        if (width > 980) {
            // 桌面端：重置所有
            $(".m_menu").removeClass("active");
            $menu.removeClass("active").css({
                'display': 'flex',
                'height': 'auto'
            });
        } else {
            // 移动端：根据状态设置显示
            if (!$menu.hasClass("active")) {
                $menu.css('display', 'none');
            } else {
                $menu.css('display', 'block');
            }
        }
    });
    
    // 初始状态
    $(window).trigger('resize');

    var header = document.querySelector('.header');
    if (!header) return;

    function onScroll() {
        if (window.scrollY > 40) header.classList.add('scrolled');
        else header.classList.remove('scrolled');
    }

    onScroll();
    window.addEventListener('scroll', onScroll);

  var $win = $(window);
  var $header = $(".header");

  var lastY = $win.scrollTop();
  var delta = 6;          // 忽略很小的抖动（越大越“稳”）
  var hideAfter = 160;    // 下滑超过多少 px 才开始隐藏（你想“更晚隐藏”就调大）
  var mouseRevealY = 70;  // 鼠标靠近顶部多少 px 强制显示

  function showHeader() {
    $header.removeClass("nav-hidden").addClass("nav-shown");
  }
  function hideHeader() {
    $header.addClass("nav-hidden").removeClass("nav-shown");
  }

  // 初始显示
  showHeader();

  $win.on("scroll", function () {
    var y = $win.scrollTop();
    var diff = y - lastY;

    if (Math.abs(diff) < delta) return; // 抖动不处理

    if (y <= 0) { // 顶部永远显示
      showHeader();
      lastY = y;
      return;
    }

    // 向下滚：隐藏（但要滚到一定距离之后才隐藏）
    if (diff > 0 && y > hideAfter) {
      hideHeader();
    }
    // 向上滚：显示
    else if (diff < 0) {
      showHeader();
    }

    lastY = y;
  });

  // 桌面端：鼠标靠近顶部，立即唤出导航（即使正在隐藏）
  $(document).on("mousemove", function (e) {
    if (e.clientY <= mouseRevealY) showHeader();
  });

  // 手机端：点汉堡菜单时强制显示，避免“点不到”
  $(".m_menu").on("click", function () {
    showHeader();
  });
});