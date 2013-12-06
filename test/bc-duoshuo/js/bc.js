var speed=1;

var scrollPercent = function() {
    return ($(window).scrollTop() / ($(document).height() - $(window).height())) * 100;
}

var halfPagePercent = function() {
    return ($(window).height() / $(document).height()) * 50;
}

var totWidth = function() {
    return $("#bc-content").width();
}

var in_ = function(x, a, b) {
    if(x>=a&&x<=b) {
	return true;
    }
    else {
	return false;
    }
}

var showComment = function(c) {
    $(c).parent().parent().show(150);
}

var hideComment = function(c) {
    $(c).parent().parent().hide(150);
}

var checkBullet = function() {
    $(".ds-comment-body").find("p").each(function() {
	var cmt_loc = parseFloat($(this).html());
	if(in_(cmt_loc, (scrollPercent() - halfPagePercent()), (scrollPercent() + halfPagePercent()))) {
	    showComment(this);
	}
	else {
	    hideComment(this);
	}
	return true;
    });
}

var makeBtn = function() {
    $(".ds-post-button").click(function(){
	$(".ds-textarea-wrapper.ds-rounded-top").find("textarea").val(scrollPercent() + "L_" + $(".ds-textarea-wrapper.ds-rounded-top").find("textarea").val());
    });
}


var clear = function() {
    $(".ds-login-buttons").remove();
    $(".ds-comments-info").remove();
    $(".ds-comment-footer").remove();
    $(".ds-toolbar-buttons").remove();
    $("#bs-bc-navbar-collapse-1").append($(".ds-replybox").detach());
    $(".ds-replybox").attr("id","my-reply-box");
    $(".ds-replybox").removeClass();
    $(".ds-textarea-wrapper.ds-rounded-top").addClass("col-xs-8 col-sm-9 col-md-9 col-lg-8");
    $(".ds-post-toolbar").addClass("col-xs-4 col-sm-3 col-md-3 col-lg-4");
    
    $("#my-reply-box").find("form").addClass("navbar-form navbar-left form-fill");
    $("#my-reply-box").find("textarea").addClass("bullet-input");
    $("#my-reply-box").find("a").remove();
    $(".ds-hidden-text").css("display","none");
    $(".ds-post-button").addClass("btn btn-block");
}

$(window).scroll(function(){
    checkBullet();
});

var bp1 = bulletPool.createNew('bc-content');
bp1.init();

$(document).ready(function(){
    clear();
    $(window).scroll();
    makeBtn();
    setTimeout(function(){bp1.refresh()},40);
});


