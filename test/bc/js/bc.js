var scrollPercent;

var showComment = function(c) {
    $(c).parent().parent().fadeIn();
}

var hideComment = function(c) {
    $(c).parent().parent().fadeOut();
}

var bullet = function(b) {
    //$(b).addClass("bullet");
    //$("#bc-content").after($(b).clone);
    //$(b).removeClass("bullet");
    //$(".bullet").fadeOut();
}

var testBullet = function() {
    $(".uyan_cmt_txt").each(function(){
	var cmt_loc = parseFloat($(this).html());
	if(cmt_loc >= (scrollPercent - halfPagePercent) && cmt_loc <= (scrollPercent + halfPagePercent)) {
	    showComment(this);
	    bullet(this);
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
