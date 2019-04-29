var canvas;
var ctx;
var pyramid;
var tilew = 36;
var pyramidX = 200;
var pyramidY = 560;
var pyramidH = 7;
var crews = [];
var score = 0;
var money = 0;
var secForGame = 90;
var time = secForGame * 60;
var ended = false;
var badEnd = false;
var graphics = {};
var mousePos = {x: 0, y: 0};
var tutorial = [
	[	
		"You are some random egyptian pharaoh.",
		"As you start getting older, you realize",
		"you need to build your pyramid.",
		"",
		"This short tutorial made in the last hour",
		"with 10 other things on todo list",
		"will guide you through the rules",
		"(click to continue)"
	],
	[
		"Click on the pyramid to place blocks.",
		"Try to get the same hieroglyps into groups",
		"as that earns you more money.",
		"Right click to swap the symbols on the block.",
		"Click on a hieroglyph group to cash it.",
		"",
		"You get 1 money for group of 1 symbol,",
		"3 for 2 symbols, 6 for 3 symbols, 10 for",
		"4 symbols etc. Enclosed groups get scored",
		"automatically."
	],
	[
		"Once you unlock more mines, press",
		"keys 1-4 to select which block you will",
		"be placing next.",
		"",
		"Also, you can press R to restart",
		"Good luck!"
	]
]
var currTut = 0;
var selectedCrew;
function main() {
	canvas = $("canvas")[0];
	ctx = canvas.getContext("2d");
	pyramidX = canvas.width / 2 - pyramidH * tilew;
	
	$("canvas").click(handleClick);
	$("canvas").mousemove(handleHover);
	$("canvas").contextmenu(handleRight);
	$("body").keydown(handleKey);
	restart();
	
	
	update();
}
function handleKey(e) {
	var n = e.keyCode - 48;
	console.log(n);
	if (e.keyCode === 80) {
		restart();
	}
	if (n > 0 && n < 6) {
		selectedCrew = crews[n-1];
	}
	var p = mousePos;
	if (p.x >= 0 && p.y >= 0 && p.x < pyramidH * 2 && p.y < pyramidH) {
		pyramid.handleHover(p.x, p.y);
	}
}

function handleClick(e) {
	if (currTut < tutorial.length) {
		++currTut;
		if (currTut == tutorial.length) {
			makeButtons();
		}
	}
	var p = getPCoords(e);
	if (p.x >= 0 && p.y >= 0 && p.x < pyramidH * 2) {
		pyramid.handleClick(p.x, p.y);
		pyramid.handleHover(p.x, p.y);
	}
}
function handleRight(e) {
	var stone = selectedCrew.stones[0];
	var temp = stone.left;
	stone.left = stone.right;
	stone.right = temp;
	e.preventDefault();
	var p = mousePos;
	if (p.x >= 0 && p.y >= 0 && p.x < pyramidH * 2 && p.y < pyramidH) {
		pyramid.handleHover(p.x, p.y);
	}
}
function gameEnd() {
	if (time <= 0) {
		badEnd = true;
	}
	else {
		$("#ui").append("<input type=text id='hs-name'>");
		$("#ui").append("<button onclick='submitScore()'  id='submit-button' class='button'>Submit");
	}
	ended = true;
}
function restart() {
	pyramid = new Pyramid();
	crews = [];
	time = secForGame * 60;
	ended = false;
	badEnd = false;
	var blocks = [];
	for (var i = 0; i < pyramidH * (pyramidH + 1) * .5; ++i) {
		var left = Math.ceil(Math.random() * 4);
		do {var right = Math.ceil(Math.random() * 4)} while (left === right);
		blocks.push(new Block(left, right));
	}
	for (var i = 1; i < 5; ++i) {
		var a = new Image();
		a.src = "images/hier" + i + ".png";
		graphics["hier" + i] = a;
	}
	crews.push(new Crew(50, blocks.splice(0, 10), 1));
	crews.push(new Crew(100, blocks.splice(0, 6), 2));
	crews.push(new Crew(120, blocks.splice(0, 6), 3));
	crews.push(new Crew(150, blocks.splice(0, 6), 4));
	selectedCrew = crews[0];
	selectedCrew.active = true;
	selectedCrew.speed = .5;
}
function handleHover(e) {
	var p = getPCoords(e);
	mousePos = p;
	if (p.x >= 0 && p.y >= 0 && p.x < pyramidH * 2) {
		pyramid.handleHover(p.x, p.y);
	}
}
function getPCoords(e) {
	var x = e.offsetX - pyramidX;
	var y = pyramidY - e.offsetY;
	return {x: Math.floor(x / tilew),
			y: Math.floor(y / tilew)};
}

function update() {
	requestAnimationFrame(update);
	if (currTut >= tutorial.length) {
		if (ended) {
			if (time > 0) {
				time -= 60;
				score += 1;
			}
			if (money > 0) {
				money -= 1;
				score += 1;
			}
		}
		else {
			--time;
			for (var c of crews) {
				c.update();
			}
			if (time <= 0) {
				gameEnd();
			}
		}
	}
	draw();
}

function makeButtons() {
	$(".up-button").remove();
	for (var i = 0; i < 4; ++i) {
		if (crews[i].stones.length > 0) {
			var $b = $("<button class='up-button button' onclick='crews[" + i + "].upgrade()'>Upgrade for " + crews[i].upgradeCost() + "</button>");
			if (crews[i].upgradeCost() > money) {
				$b.addClass("gray");
			}
			$b.css("top", 55 + 50 * i);
			$b.css("left", canvas.width * .5 + 250 * (i%2 ? -1 : 1));
			$("#ui").append($b);
		}
	}
}

function draw() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.save();
	ctx.translate(pyramidX, pyramidY);
	pyramid.draw();
	ctx.restore();
	ctx.fillStyle = "black";
	ctx.save();
	ctx.translate(canvas.width / 2, 50);
	
	var sw = true;
	for (var c of crews) {
		c.draw(sw = !sw);
		
		ctx.translate(0, 50);
	}
	ctx.restore();
	ctx.font = "30px Arial";
	ctx.textAlign = "left";
	ctx.fillText("Money: " + money, 10, 370);
	ctx.fillText("Time: " + Math.floor(time / 60), 10, 410);
	ctx.fillText("Score: " + score, 10, 580);
	ctx.textAlign = "center";
	
	if (currTut < tutorial.length) {
		ctx.fillStyle = "#ffdd88";
		ctx.fillRect(canvas.width * .5 - 300, 50, 600, 400);
		ctx.fillStyle = "#222222"
		var t = tutorial[currTut];
		for (var i = 0; i < t.length; ++i) {
			ctx.fillText(t[i], canvas.width / 2, 120 + 30 * i)
		}
	}
	if (ended) {
		ctx.fillStyle = "#ffdd88";
		ctx.fillRect(canvas.width * .5 - 170, 50, 340, 250);
		ctx.fillStyle = "#222222";
		if (badEnd) {
			ctx.fillText("Unfortunately, you", canvas.width * .5, 100);
			ctx.fillText("died before managing", canvas.width * .5, 140);
			ctx.fillText("to finish the pyramid.", canvas.width * .5, 180);
			ctx.fillText("(You ran out of time)", canvas.width * .5, 220);
			ctx.fillText("Try again (press R)!", canvas.width * .5, 270);
		}
		else {
			ctx.fillText("Congratulations!", canvas.width * .5, 100);
			ctx.fillText("You just succesfully", canvas.width * .5, 140);
			ctx.fillText("built your grave!", canvas.width * .5, 180);
			ctx.fillText("Thanks for playing!", canvas.width * .5, 250);
		}
	}
}

function submitScore() {
	var name = $("#hs-name").val();
	$.ajax({
		url: "submit.php?display=" + name + "&score=" + score,
		type: "GET",
		crossDomain: true,
		success: function(data){
			console.log(data);
			$("#submit-button").remove();
		}
	})
}

function getScores() {
	$.ajax({
		url: "fetch.php?display=" + name + "&score=" + score,
		type: "GET",
		crossDomain: true,
		success: function(data){
			console.log(data);
			$("#submit-button").remove();
		}
	})
}

onload = main;