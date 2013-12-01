var scrollPercent, halfPagePercent;

var allBullets = new Array();
var flyingBullet = new Array();

var addBullet = function(b) {
    //console.log(b);
    var bullet = new Object();
    bullet.id = $(b).attr("data-post-id") + "";
    bullet.loc = parseFloat($(b).find("p").html());
    bullet.content = $(b).find("p").html().replace(/.*L_/,"");
    bullet.flying = false;
    allBullets[$(b).attr("data-post-id")] = bullet;
}

var showComment = function(c) {
    $(c).parent().parent().show(150);
}

var hideComment = function(c) {
    $(c).parent().parent().hide(150);
}

var flyAway = function(b) {
    $("#" + b.id).remove();
    b.flying = false;
}

var flyOut = function(b) {
    $("#"+ b.id).animate({left:((totWidth / 2) + 'px')}, 1000, flyAway(b));
}

var sleep = function(b) {
    setTimeout("flyOut(b);",1000)
}

var flyIn = function(b) {
    $("#"+ b.id).animate({left:((totWidth + 200) + 'px')}, 1000, flyOut(b));
}

var bulletFly = function(b) {
    console.log(b);
    if(in_(b.loc, (scrollPercent - halfPagePercent), (scrollPercent + halfPagePercent))&&b.flying==false) {
	var randHeight = ($(window).scrollTop() + Math.random()*($(window).height() - 200));
	var totWidth = $("#bc-content").width();
	$("#bc-content").append('<div class="bullet" id="' + b.id + '" style="left:-300px;top:' + randHeight + 'px;">' + b.content + '</div>');    
	b.flying = true;
	flyIn(b);
    }
}

var in_ = function(x, a, b) {
    if(x>=a&&x<=b) {
	return true;
    }
    else {
	return false;
    }
}

var checkBullet = function() {
    $(".ds-comment-body").find("p").each(function() {
	var cmt_loc = parseFloat($(this).html());
	if(in_(cmt_loc, (scrollPercent - halfPagePercent), (scrollPercent + halfPagePercent))) {
	    showComment(this);
	}
	else {
	    hideComment(this);
	}
	return true;
    });
    for(b in allBullets) {
	bulletFly(allBullets[b]);
    }
}

var makeBtn = function() {
    $(".ds-post-button").click(function(){
	$(".ds-textarea-wrapper.ds-rounded-top").find("textarea").val(scrollPercent + "L_" + $(".ds-textarea-wrapper.ds-rounded-top").find("textarea").val());
    });
}

var debug = function(a) {
    for(x in a) {
	console.log(a[x]);
    }
}

var makeBulletList = function() {
    $(".ds-post").each(function() {
	addBullet(this);
	return true;
    });
}

var clear = function() {
    $(".ds-login-buttons").remove();
    $(".ds-comments-info").remove();
    $(".ds-comment-footer").remove();
}

$(window).scroll(function(){
    var s = $(window).scrollTop(),
    d = $(document).height(),
    c = $(window).height();
    scrollPercent = (s / (d - c)) * 100;
    halfPagePercent = (c / d) * 50;
    checkBullet();
    clear();
});

$(document).ready(function(){
    clear();
    makeBtn();
    makeBulletList();
    $(window).scroll();
});


