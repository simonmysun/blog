var bulletPool = {
/*
  bullet id -> content, length, flying.. etc.
*/
    createNew: function(id) {
	var bp = {};

	//bp.canvas = '#' + id;
	bp.canvas = window;

	bp.init = function() {
	    bp.changeSize();
	    bp.bulletList = new Array();
	    bp.rows = new Array();
	    for(x=0;x<bp.size.maxRow;x++) {
		bp.row[x] = 1;
	    }
	    bp.flying = new Array();
	    bp.wait = new Array();
	}

	bp.bulletList = new Array();
	bp.rows = new Array();
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
	    bp.size.top = $(bp.canvas).scrollTop();
	    bp.size.maxRow = Math.floor(bp.size.width / 20) - 1;
	};

	bp.getRow = function() {
	    for(x in bp.row) {
		if(bp.row[x] <= 0) {
		    return x;
		}
	    }
	    return -1;
	}

	bp.add = function() {
	    $(".ds-post").each(function() {
		var bullet = new Object();
		bullet.id = $(this).attr("data-post-id") + "";
		bullet.loc = parseFloat($(this).find("p").html());
		bullet.content = $(this).find("p").html().replace(/.*L_/,"");
		bullet.flying = false;
		bp.bulletList[$(this).attr("data-post-id")] = bullet;
		return true;
	    });
	};

	bp.fly = function(x,loc) {
	    bp.flying[x] = 1;
	    $("#bc-content").append('<div class="bullet" id="' + x + '" style="left:' + bp.size.width + ';top:' + (bp.size.top + loc * 20) + 'px;">' + bp.bulletList[x].content + '</div>'); 
	    bp.row[loc] = $("$" + x).width();
	    bp.bulletList[x].flying = true;
	}

	bp.launch = function() {
	    var loc = bp.getRow();
	    var flag = 1 ;
	    while(loc != -1 && flag == 1) {
		flag = 0;
		for(x in bp.wait) {
		    bp.fly(x,loc);
		    bp.wait[x] = undefined;
		    flag = 1;
		    break;
		}
		loc = bp.getRow();
	    }
	    flag = 1;
	    while(loc != -1 && flag == 1) {
		flag = 0;
		for(x in bp.bulletList) {
		    if(bp.bulletList[x].flying == false) {
			bp.fly(x,loc);
			flag = 1;
			break;
		    }
		    if(flag == 0) {
			bp.queue[x] = 1;
		    }
		}
		loc = bp.getRow();
	    }
	};

	bp.refresh = function() {
	    
	    bp.changeSize();
	    bp.add();
	    bp.launch();
	    
	    $('.bullet')
		.css(left,function(index,left) {
		    return left - speed;
		})
		.each(function(index,bullet) {
		    var left =parseInt(bullet.style.left); 
		    var offset =parseInt(bullet.offsetWidth);
		    if (left + offset <0) {
			bp.bulletList[bullet.attr('id')],flying = false;
			bp.flying[bullet.attr('id')] = undefined;
		    }
		});
	    for(x in bp.row) {
		bp.row[x] -= speed;
	    }
	};
	
	return bp;
    }
}
