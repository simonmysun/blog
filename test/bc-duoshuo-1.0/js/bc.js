var scrollPercent = function() {
    return ($(window).scrollTop() / ($(document).height() - $(window).height())) * 100;
}

var halfPagePercent = function() {
    return ($(window).height() / $(document).height()) * 50;
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
    $(c).parent().parent().fadeIn(150);
}

var hideComment = function(c) {
    $(c).parent().parent().fadeOut(150);
}

var checkComment = function() {
    $('.ds-comment-body').find('p').each(function() {
	var cmt_loc = eval('(' + $(this).html() + ')').loc;
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
    $('.ds-post-button').click(function(){
	try {
	    var tmp = eval('(' + $('.ds-textarea-wrapper.ds-rounded-top').find('textarea').val() + ')');
	} catch(e){
	    var bullet = {};
	    bullet.content = $('.ds-textarea-wrapper.ds-rounded-top').find('textarea').val();
	    bullet.style = 'background-color:#fff;opacity:0.7;border:1px solid #bbb;font-size:18px';
	    bullet.loc=scrollPercent();
	    bullet.ver=bulletPool.version;
	    $('.ds-textarea-wrapper.ds-rounded-top').find('textarea').val(JSON.stringify(bullet));
	}
    });
}


var clear = function() {
    $('.ds-login-buttons').remove();
    $('.ds-comments-info').remove();
    $('.ds-comment-footer').remove();
    $('.ds-toolbar-buttons').remove();
    $('#bs-bc-navbar-collapse-1').prepend($('.ds-replybox').detach());
    $('.ds-replybox').attr('id','my-reply-box');
    $('.ds-replybox').removeClass();
    $('.ds-textarea-wrapper.ds-rounded-top').addClass('col-xs-7 col-sm-8 col-md-8 col-lg-7');
    $('.ds-post-toolbar').addClass('col-xs-4 col-sm-3 col-md-3 col-lg-4');
    $('#my-reply-box').find('form').addClass('navbar-form navbar-left form-fill');
    $('#my-reply-box').find('textarea').addClass('bullet-input');
    $('#my-reply-box').find('a').remove();
    $('form.form-fill').addClass('row')
    $('form.form-fill').append('<div class="col-xs-1 col-sm-1 col-md-1 col-lg-1"><input type="checkbox" id="showbullet" checked></div>');
    $('.ds-hidden-text').css('display','none');
    $('.ds-post-button').addClass('btn btn-block');
}

$(window).scroll(function(){
    checkComment();
});

var bp1 = bulletPool.createNew('bc-content');
bp1.init();

$(document).ready(function(){
    setTimeout(function(){
	clear();
	makeBtn();
	$(window).scroll();
	bp1.refresh();
    },4000);
});


