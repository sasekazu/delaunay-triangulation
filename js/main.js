// JavaScript Document
/// <reference path="http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js" />
/// <reference path="numeric-1.2.6.min.js" />

var colors=['lightsalmon', 'lightseagreen', 'aquamarine', 'mediumpurple', 'darkcyan', 'darkgray', 'orchid', 'peru', 'dodgerblue'];


$(document).ready(function () {
	initEvents($("#myCanvas"));
});

function drawPoints(canvas, points) {
	var context=canvas.get(0).getContext("2d");
	var canvasWidth=canvas.width();
	var canvasHeight=canvas.height();
	context.setTransform(1, 0, 0, 1, 0, 0);
	for(var i=0; i<points.length; ++i) {
		context.beginPath();
		context.arc(points[i][0], points[i][1], 5, 0, 2*Math.PI, true);
		context.fill();
	}
}

function drawTriangles(canvas, points, triangles) {
	var context=canvas.get(0).getContext("2d");
	var canvasWidth=canvas.width();
	var canvasHeight=canvas.height();
	context.setTransform(1, 0, 0, 1, 0, 0);
	var tri;
	for(var i=0; i<triangles.length; ++i) {
		tri=triangles[i];
		context.beginPath();
		context.moveTo(points[tri[0]][0], points[tri[0]][1]);
		context.lineTo(points[tri[1]][0], points[tri[1]][1]);
		context.lineTo(points[tri[2]][0], points[tri[2]][1]);
		context.lineTo(points[tri[0]][0], points[tri[0]][1]);
		context.stroke();
	}
}


function fillTriangles(canvas, points, triangles) {
	var context=canvas.get(0).getContext("2d");
	var canvasWidth=canvas.width();
	var canvasHeight=canvas.height();
	context.setTransform(1, 0, 0, 1, 0, 0);
	var tri;
	for(var i=0; i<triangles.length; ++i) {
		context.fillStyle=colors[i%colors.length];
		tri=triangles[i];
		context.beginPath();
		context.moveTo(points[tri[0]][0], points[tri[0]][1]);
		context.lineTo(points[tri[1]][0], points[tri[1]][1]);
		context.lineTo(points[tri[2]][0], points[tri[2]][1]);
		context.lineTo(points[tri[0]][0], points[tri[0]][1]);
		context.fill();
	}
}


// 三角形の外接円を描画
function drawCircumcircles(canvas, points, tri) {
	var context=canvas.get(0).getContext("2d");
	var cir;
	for(var i=0; i<tri.length; ++i) {
		context.strokeStyle=colors[i%colors.length];
		context.beginPath();
		cir=new Circumcircle(points[tri[i][0]], points[tri[i][1]], points[tri[i][2]]);
		context.arc(cir.p[0], cir.p[1], cir.rad, 0, Math.PI*2, true);
		context.stroke();
	}
}

function initEvents(canvas) {
	var canvasWidth=canvas.width();
	var canvasHeight=canvas.height();
	var points=[];
	var selectPoint=null;
	// mouseクリック時のイベントコールバック設定
	canvas.mousedown(function (event) {
		// 左クリック
		if(event.button==0) {
			var canvasOffset=canvas.offset();
			var canvasX=Math.floor(event.pageX-canvasOffset.left);
			var canvasY=Math.floor(event.pageY-canvasOffset.top);
			if(canvasX<0||canvasX>canvasWidth) {
				return;
			}
			if(canvasY<0||canvasY>canvasHeight) {
				return;
			}
			points.push([canvasX, canvasY]);
			draw();
		}
		// 右クリック
		else if(event.button==2) {
			var canvasOffset=canvas.offset();
			var canvasX=Math.floor(event.pageX-canvasOffset.left);
			var canvasY=Math.floor(event.pageY-canvasOffset.top);
			if(canvasX<0||canvasX>canvasWidth) {
				return;
			}
			if(canvasY<0||canvasY>canvasHeight) {
				return;
			}
			var clickPos=[canvasX, canvasY];
			var dist;
			for(var i=0; i<points.length; ++i) {
				dist=numeric.norm2(numeric.sub(points[i], clickPos));
				if(dist<10) {
					selectPoint=i;
					break;
				}
			}
		}
	});
	// mouse移動時のイベントコールバック設定
	canvas.mousemove(function (event) {
		var canvasOffset=canvas.offset();
		var canvasX=Math.floor(event.pageX-canvasOffset.left);
		var canvasY=Math.floor(event.pageY-canvasOffset.top);
		if(canvasX<0||canvasX>canvasWidth) {
			return;
		}
		if(canvasY<0||canvasY>canvasHeight) {
			return;
		}
		if(selectPoint!=null) {
			points[selectPoint]=[canvasX, canvasY];
			draw();
		}
	});
	// mouseクリック解除時のイベントコールバック設定
	$(window).mouseup(function (event) {
		selectPoint=null;
		draw();
	});

	// キーイベント
	document.onkeydown=function (e) {
		// Mozilla(Firefox, NN) and Opera
		if(e!=null) {
			keycode=e.which;
			ctrl=typeof e.modifiers=='undefined'?e.ctrlKey:e.modifiers&Event.CONTROL_MASK;
			shift=typeof e.modifiers=='undefined'?e.shiftKey:e.modifiers&Event.SHIFT_MASK;
			// イベントの上位伝播を防止
			e.preventDefault();
			e.stopPropagation();
			// Internet Explorer
		} else {
			keycode=event.keyCode;
			ctrl=event.ctrlKey;
			shift=event.shiftKey;
			// イベントの上位伝播を防止
			event.returnValue=false;
			event.cancelBubble=true;
		}
		// キーコードの文字を取得
		// Backspace で最新の追加点を削除
		if(keycode==8) {
			remove();
		} else if(keycode==116) {
			location.reload(false);
		} else {
			keychar=String.fromCharCode(keycode).toUpperCase();
			if(keychar=="D") {
				remove();
			}
		}
		function remove() {
			points.splice(points.length-1, 1);
			draw();
		}
	}

	$("input").click(function() {draw()});

	// リセットボタン
	$("#reset").click(function () {
		points=[];
		draw();
	})
	function draw() {
		var context = canvas.get(0).getContext("2d");
		context.clearRect(0, 0, canvasWidth, canvasHeight);
		var tri = new DelaunayTriangulation(points, canvasHeight, 0, canvasWidth, 0);
		context.strokeStyle='black';
		context.lineWidth=2;
		if($('#colorCheckBox').is(':checked')) {
			fillTriangles(canvas, points, tri);
		}
		drawTriangles(canvas, points, tri);

		if($('#gaisetuenCheckBox').is(':checked')) {
			context.lineWidth=2;
			drawCircumcircles(canvas, points, tri);
		}
		context.fillStyle='black';

		drawPoints(canvas, points);
	}
}

