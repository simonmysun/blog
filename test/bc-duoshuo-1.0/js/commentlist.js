	var scrollPercent = function() { return ($(window).scrollTop() /
    ($(document).height() - $(window).height())) * 100; }

var halfPagePercent = function() { return ($(window).height() /
    $(document).height()) * 50; }

var in_ = function(x, a, b) { if(x>=a&&x<=b) { return true; } else {
    return false; } }

var commentContainer = { version: '1.0',

    createNew: function() { var C = {};

	C.init = function(backdropid) { console.log(backdropid);
	    C.reshape(); C.backdrop = '#' + backdropid; // where
	    comments fly by C.commentList = new Array(); C.rowStatus =
	    new Array(); for(i = 0; i < C.size.maxRow; i++) { var r =
	    {}; r.tailSpeed = 1; r.tailLoc = 0; C.rowStatus[i] = r; }
	    C.fps = 10; C.duration = 8000; };


	C.size = {}; C.reshape = function() { C.size.width =
	$(C.backdrop).width(); C.size.height = $(window).height();
	C.size.top = $(window).scrollTop(); C.size.maxRow =
	Math.floor(C.size.height / 30) - 5;
	$(C.backdrop).css('font-size',C.size.height / 18 + 'px'); };

	C.getRow = function(c) { for(i = 0; i < maxRow; i++) {
	    if(C.rowStatus[i].tailLoc / C.rowStatus[i].tailSpeed <=
	    C.size.width / c.speed) { return i; } } return -1; };

	C.addComment = function() { $('.ds-post').each(function() {
	    var id = $(this).attr('data-post-id');
	    if(C.commentList[id] == undefined) { var c; try { c =
	    eval('(' + $(this).find("p").html() + ')'); // c.style,
	    c.loc, c.content, c.loc.  c.id = id;
	    $("#post-content").append('<div class="bullet" id="' + x +
	    '" style="left:' + C.size.width + 'px;top:0px;">' + '<div
	    style="' + c.style + '">' + c.content + '</div></div>');
	    c.len = $('#' + id)[0].offsetWidth; c.speed = 0; c.row =
	    -1; C.commentList[id] = c; } catch(e) { //
	    console.log("JSON decode error: "+e.description); } } });
	    };

	C.refresh = function() { console.log('dd');
	    if($('#showflyingcomments')[0].checked==true){
	    $('.flyingbox').show(150); C.reshape(); C.addComments();
	    $('.flyingbox').each(function(){
	    if(in_(C.commentList[this.id].loc, (scrollPercent() -
	    halfPagePercent()), (scrollPercent() + halfPagePercent()))
	    == false) { this.style.left=C.size.width;
	    if(parseFloat(this.left) + parseFloat(this.offsetWidth) >
	    0) { C.commentList[this.id].speed *= 20; } else {
	    C.commentList[this.id].speed = 0;
	    C.commentList[this.id].row = -1; } }
	    if(C.commentList[this.id].row == -1) {
	    C.commentList[this.id].row = getRow(commentList[this.id]);
	    if(C.commentList[this.id].row != -1) {
	    C.commentList[this.id].speed = (commentList[this.id].len +
	    C.size.width) / C.duration; C.rowStatus[row].tailSpeed =
	    speed; C.rowStatus[row].tailLoc = C.size.width; } }
	    if(parseFloat(this.left) + parseFloat(this.offsetWidth) >
	    0) { this.left = (parseFloat(this.left) -
	    commentList[this.id].speed) + 'px'; this.top =
	    (parseFloat(bp.size.top) + 30 * commentList[this.id].row)
	    + 'px'; } }); for(i = 0; i < maxRow; i++) {
	    if(C.rowStatus[i].tailLoc > 0) { C.rowStatus[i].tailLoc -=
	    C.rowStatus[i].tailSpeed; } else { C.rowStatus[i].tailLoc
	    = 0; } } } else { $('.flyingbox').hide(150); }
	    setTimeout(function() { C.refresh(); },C.fps); };

	return C; }, }
