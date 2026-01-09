 var w_width = $(window).width();

function getRem(design_w, unit) {
    var html = document.getElementsByTagName("html")[0];
    var real_w = document.documentElement.clientWidth;
    (real_w > design_w) && (real_w = design_w);
    html.style.fontSize = real_w / design_w * unit + "px";
}
 if(w_width>1200){
getRem(1920, 100);

//window.addEventListener("resize",getRem);
window.onresize = function () {
    getRem(1920, 100)
};


}else if(w_width>980){
	getRem(1680, 100);
	
	//window.addEventListener("resize",getRem);
	window.onresize = function () {
	    getRem(1680, 100)
	};
}else{
	getRem(980, 100);
	
	//window.addEventListener("resize",getRem);
	window.onresize = function () {
	    getRem(980, 100)
	};
}


$(document).ready(function(){
	$(".head_logo").on("click",function(){
		window.location.href='/'
	})
})

