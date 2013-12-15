var bulletPool = {
/*
  bullet id -> content, loc(scrollPercent), length( -> speed), flying, row.. etc.
*/
    version: '1.0',

    createNew: function(id) { // return a new object bulletPool
	var bp = {};

	bp.canvas = '#' + id; // a place for bullets to fly
	//bp.canvas = window; // sometimes it's not div which is scrolling
	bp.fps = 10; // refresh every fps ms
	bp.speed = 1; // will be deleted
	bp.duration = 8000; // expected duration of a comment

	bp.init = function() { // initialization
	    bp.changeSize();
	    bp.bulletList = new Array();
	    bp.row = new Array();
	    for(x = 0; x < bp.size.maxRow; x++) {
		var r = {};
		r.tailspeed = 1;
		r.tailloc = 0;
		bp.row[x] = r;
	    }
	    bp.flying = new Array();
	    bp.wait = new Array();
	}

	bp.bulletList = new Array(); // a list of all comments
	bp.row = new Array(); // a list of rows. used in determining where to launch the bullets
	bp.flying = new Array(); // a list of flying comments
	bp.wait = new Array(); // a queue of comments that should fly but have no space

	bp.size = {
	    width: 0,
	    height: 0,
	    top: 0,
	    maxRow: 0,
	};

	bp.changeSize = function() { // correct the size of the convas. 
	    bp.size.width = $(bp.canvas).width();
	    bp.size.height = $(window).height();
	    bp.size.top = $(window).scrollTop();
	    bp.size.maxRow = Math.floor(bp.size.height / 30) - 5;
	};

	bp.getRow = function(speed) { // get a row that can put a comment of appointed speed in
	    for(x=0;x<bp.size.maxRow;x++) {
		if(bp.row[x].tailloc/bp.row[x].tailspeed <= bp.size.width/speed) {
		    return x;
		}
	    }
	    return -1;
	};

	bp.add = function() { // pull and decode all comments into bulletList
	    $(".ds-post").each(function() {
		if(bp.bulletList[$(this).attr("data-post-id")] == undefined) {
		    var bullet;
		    try {
			bullet = eval('(' + $(this).find("p").html() + ')');
			bullet.id = $(this).attr("data-post-id") + "";
			bullet.flying = false;
			bp.bulletList[bullet.id] = bullet;
		    } catch(e){
			// console.log("JSON decode error: "+e.description);
		    }
		}
		return true;
	    });
	};

	bp.fly = function(bullet,r) { // let a comment fly at row r
	    bp.flying[bullet.id] = bullet;
	    bp.flying[bullet.id].len = $("#" + bullet.id)[0].offsetWidth;
	    bp.flying[bullet.id].row = r;
	    $("#bc-container").append('<div class="bullet" id="' + x + '" style="left:' + bp.size.width + 'px;top:' + (bp.size.top + r * 30) + 'px;">' + '<div style="' + bullet.style + '">' + bp.bulletList[x].content + '</div></div>'); 
	    bp.row[r].tailloc = bp.size.width + ($("#" + bullet.id)[0].offsetWidth + 15); // tail location of the tail of the comment 
	    bp.row[r].tailspeed = ($("#" + bullet.id)[0].offsetWidth + 15)/bp.duratiom; // tailspeed of last comment of current row
	    bp.bulletList[bullet.id].flying = true;
	}

	bp.launch = function() { // check and let comments fly
	    for(x in bp.wait) { // comments in queue go first
		if(bp.wait[x] != undefined) {
		    r = bp.getRow((bp.wait[x].len + bp.size.width) / bp.duration);
		    if(r == -1) {
			break;
		    }
		    bp.fly(bp.wait[x],r);
		    bp.wait[x] = undefined;
		}
	    }
	    for(x in bp.bulletList) {
		if(bp.bulletList[x] != undefined) {
		    r = bp.getRow((bp.bulletList[x].len + bp.size.width) / bp.duration);
		    if(r == -1) {
			break;
		    }
		    if(bp.bulletList[x].flying == false && in_(bulletList[x].loc, (scrollPercent() - halfPagePercent()), (scrollPercent() + halfPagePercent()))) {
			bp.fly(bp.bulletList[x],r);
		    }
		    if(bp.bulletList[x].flying == true &&  in_(bulletList[x].loc, (scrollPercent() - halfPagePercent()), (scrollPercent() + halfPagePercent())) == false) {
			bp.flying[x].len /= 20; // accelerate
		    }
		}
	    }
	};

	bp.refresh = function() {
	    console.log('dd');
	    if($('#showbullet')[0].checked==true){
		$('.bullet').show(150);
		bp.changeSize();
		bp.add();
		bp.launch();	
		$('.bullet').css('left',function(index,left) {
		    return (parseInt(left) - (bp.size.width + bp.flying[$(this).attr('id')].len) / bp.duration) + 'px';
		}); 
		$('.bullet').css('top',function(){
		    return((bp.size.top + 30 * (bp.flying[$(this).attr('id')].row)) + 'px');
		});
		$('.bullet').each(function(index,bullet) {
		    var left = parseInt(bullet.style.left); 
		    var offset = parseInt(bullet.offsetWidth);
		    if (left + offset < 5) {
			bp.bulletList[$(bullet).attr('id')].flying = false;
			bp.flying[$(bullet).attr('id')] = undefined;
			$('#' + bullet.id).remove();
		    }
		});
		for(x in bp.row) {
		    if(bp.row[x].tailloc > 0) {
			bp.row[x].tailloc -= bp.row[x].tailspeed;
		    } else {
			bp.row[x].tailloc = 0;
		    }
		}
	    }
	    else {
		$('.bullet').hide(150);
	    }
	    setTimeout(function() {
		bp.refresh();
	    },bp.fps);
	};

	return bp;
    }
}
