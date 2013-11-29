var scrollPercent;

var showComment = function(c) {
    $(c).parent().parent().show(150);
}

var hideComment = function(c) {
    $(c).parent().parent().hide(150);
}

var bullet = function(b) {
    console.log(b);
    $("#bc-content").append('<div class="bullet" style="top: ' + $(window).scrollTop + Math.random()*($(window.height)-140) + 'px">' + b + '</div>');
    $(".bullet").animate({left:'250px'},function(){
	$(".bullet").remove();
    });
}

var testBullet = function() {
    $(".uyan_cmt_txt").each(function(){
	var cmt_loc = parseFloat($(this).html());
	if(cmt_loc >= (scrollPercent - halfPagePercent) && cmt_loc <= (scrollPercent + halfPagePercent)) {
	    showComment(this);
	    bullet($(this).html());
	}
	else {
	    hideComment(this);
	}
	return true;
    });
}

$(window).scroll(function(){
    var s = $(window).scrollTop(),
    d = $(document).height(),
    c = $(window).height();
    scrollPercent = (s / (d - c)) * 100;
    halfPagePercent = (c / d) * 50;
    testBullet();
    //console.log("Current scroll percent range: [", (scrollPercent - halfPagePercent), (scrollPercent + halfPagePercent)),"]";
    $("#uyan_cmt_btn").attr("onclick",'$("#uyan_comment")[0].value=scrollPercent+"L_"+$("#uyan_comment")[0].value;UYAN.addCmt(this);');
});
