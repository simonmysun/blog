var bulletPool = {
/*
  bullet id -> content, length, flying.. etc.
*/
    var version = 1.0;
    
    var createNew: function(id) {
	var bp = {};

	bp.canvas = '#' + id;
	//bp.canvas = window;
	bp.fps = 10;
	bp.speed = 1;

	bp.init = function() {
	    bp.changeSize();
	    bp.bulletList = new Array();
	    bp.row = new Array();
	    for(x=0;x<bp.size.maxRow;x++) {
		bp.row[x] = 1;
	    }
	    bp.flying = new Array();
	    bp.wait = new Array();
	}

	bp.bulletList = new Array();
	bp.row = new Array();
	bp.flying = new Array();
	bp.wait = new Array();

	bp.size = {
	    width: 0,
	    height: 0,
	    top: 0,
	    maxRow: 0,
	};

	bp.changeSize = function() {
	    bp.size.width = $(bp.canvas).width();
	    bp.size.height = $(bp.canvas).height();
	    bp.size.top = $(window).scrollTop();
	    bp.size.maxRow = Math.floor(bp.size.width / 30) - 1;
	};

	bp.getRow = function() {
	    for(x=0;x<bp.size.maxRow;x++) {
		if(bp.row[x] <= 0) {
		    return x;
		}
	    }
	    return -1;
	}

	bp.add = function() {
	    $(".ds-post").each(function() {
		if(bp.bulletList[$(this).attr("data-post-id")] == undefined) {
		    var bullet = eval('' + $(this).find("p").html() + '');
		    bullet.id = $(this).attr("data-post-id") + "";
		    bullet.flying = false;
		    bp.bulletList[$(this).attr("data-post-id")] = bullet;
		}
		return true;
	    });
	};

	bp.fly = function(bullet) {
	    bp.flying[bullet.id] = bullet;
	    $("#bc-content").append('<div class="bullet" id="' + x + '" style="left:' + bp.size.width + 'px;top:' + (bp.size.top + bullet.loc * 30) + 'px;">' + '<div style="' + bullet.style + '">' + bp.bulletList[x].content + '</div></div>'); 
	    bp.row[loc] = $("#" + bullet.id)[0].offsetWidth + 15;
	    bp.bulletList[bullet.id].flying = true;
	}

	bp.launch = function() {
	    var loc = bp.getRow();
	    var flag = 1 ;
	    while(loc != -1 && flag == 1) {
		flag = 0;
		for(x in bp.wait) {
		    if(bp.wait[x] != undefined) {
			bp.fly(bp.wait[x]);
			bp.wait[x] = undefined;
			flag = 1;
			break;
		    }
		}
		loc = bp.getRow();
	    }
	    flag = 0;
	    while(loc != -1 && flag >= 0) {
		flag = -1;
		for(x in bp.bulletList) {
		    if(bp.bulletList[x]!=undefined) {
			if(bp.bulletList[x].flying == false && in_(bp.bulletList[x].loc, (scrollPercent() - halfPagePercent()), (scrollPercent() + halfPagePercent()))) {
			    bp.fly(bp.bulletlist[x]);
			    flag = 2;
			    break;
			}
			if(bp.bulletList[x].flying == true && in_(bp.bulletList[x].loc, (scrollPercent() - halfPagePercent()), (scrollPercent() + halfPagePercent())) == false) {
			    bp.flying[x].speed = 20;
			}
		    }
		}
		if(flag == 1) {
		    bp.wait[x] = 1;
		}
		loc = bp.getRow();
	    }
	};

	bp.refresh = function() {

	    if($('#showbullet')[0].checked==true){
		$('.bullet').show(150);
	    }
	    else {
		$('.bullet').hide(150);
	    }
	    
	    //console.log("draw");
	    
	    bp.changeSize();
	    bp.add();
	    bp.launch();
	    
	    $('.bullet').css('left',function(index,left) {
		return (parseInt(left) - bp.flying[$(this).attr('id')].speed) + 'px';
	    });
	    $('.bullet').css('top',function(){return((bp.size.top + 30 * (bp.flying[$(this).attr('id')].loc)) + 'px');});
	    $('.bullet').each(function(index,bullet) {
		console.log("fly");
		var left =parseInt(bullet.style.left); 
		var offset =parseInt(bullet.offsetWidth);
		if (left + offset < 5) {
		    bp.bulletList[$(bullet).attr('id')].flying = false;
		    bp.flying[$(bullet).attr('id')] = undefined;
		    $('#' + bullet.id).remove();
		}
	    });
	    for(x in bp.row) {
		if(bp.row[x] > 0) {
		    bp.row[x] -= bp.speed;
		}
	    }

	    setTimeout(function() {
		bp.refresh();
	    },bp.fps);
	};
	
	return bp;
    }
}
