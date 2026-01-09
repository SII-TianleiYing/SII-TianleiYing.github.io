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
});