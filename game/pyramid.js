function Pyramid() {
	this.pieces = [];
	for (var i = pyramidH; i >= 1; --i) {
		var row = [];
		for (var j = 0; j < pyramidH * 2; ++j) {
			row.push(new Piece(0));
		}
		this.pieces.push(row);
	}
	this.drop = function(block, x) {
		if (this.canDrop(x)) {
			var y = this.height(x);
			x -= (x%2 !== y%2);
			this.pieces[y][x] = block.left;
			this.pieces[y][x + 1] = block.right;
			this.pieces[y][x].placed = this.pieces[y][x+1].placed = true;
			for (var xx = -1; xx <= 2; ++xx) {
				for (var yy = -1; yy <= 1; ++yy) {
					this.bfs(x + xx, y + yy, function() {return "autocomplete"});
				}
			}
			if (crews.filter(a => a.stones.length > 0).length === 0) {
				gameEnd();
			}
			return true;
		}
		return false;
	}
	this.canDrop = function(x) {
		var y = this.height(x);
		x -= (x%2 !== y%2);
		return y%2 === x%2 && !this.pieces[y][x].placed;
	}
	this.height = function(x) {
		var y = 0;
		while (this.pieces[y][x].placed && this.pieces[y][x+(x%2 === y%2 ? -1 : 1)].placed) {
			++y;
		}
		return y;
	}
	this.handleClick = function(x, y) {
		if (y > pyramidH - 1) {
			y = pyramidH - 1;
		}
		if (this.pieces[y][x].placed) {
			this.score(x, y);
		}
		else {
			if (this.canDrop(x) && selectedCrew.dist === 0) {
				var newStone = selectedCrew.nextStone();
				this.drop(newStone, x);
			}
		}
		
	}
	this.bfs = function(x, y, f = function(p) {}) {
		var tiles = 0;
		var openEnd = false;
		if (y < 0 || y >= pyramidH) {
			return 0;
		}
		var tileType = this.pieces[y][x].type;
		if (tileType && !this.pieces[y][x].used) {
			var queue = [[x, y]];
			var visited = [];
			var curr;
			function str(x) {return "" + x[0] + x[1]};
			while (queue.length > 0) {
				curr = queue.splice(0, 1)[0];
				visited.push(str(curr));
				tiles += 1;
				f(this.pieces[curr[1]][curr[0]]);
				for (var next of [[-1, 0], [1, 0], [0, 1], [0, -1]]) {
					var nextSpace = [curr[0] + next[0], curr[1] + next[1]];
					if (visited.indexOf(str(nextSpace)) === -1 && 
						nextSpace[0] >= 0 && nextSpace[1] >= 0 && 
						nextSpace[0] < pyramidH * 2 && nextSpace[1] < pyramidH) {
						var nextPiece = this.pieces[nextSpace[1]][nextSpace[0]];
						if (nextPiece.type === 0 && (Math.abs(nextSpace[0] + 1/2 - pyramidH) <= pyramidH - nextSpace[1]))
							openEnd = true;
						if (nextPiece.type === tileType &&
							nextPiece.used === false &&
							nextPiece.placed) {
							
							queue.push(nextSpace);
						}
					}
					
				}
			}
			if (!openEnd && f(new Piece(0)) === "autocomplete") {
				this.score(x, y);
			}
			return tiles;ww
		}
		return 0;
	}
	this.handleHover = function(x, y) {
		if (y > pyramidH - 1) {
			y = pyramidH - 1;
		}
		for (var i = 0; i < pyramidH * 2; ++i) {
			for (var j = 0; j < pyramidH; ++j) {
				var p = this.pieces[j][i];
				p.highlit = false;
				if (!p.placed) {
					p.type = 0;
				}
			}
		}
		if (!this.pieces[y][x].placed) {
			y = this.height(x);
			if (!this.pieces[y][x].placed) {
				if (x%2 === y%2) {
					x += 1;
				}
				if (selectedCrew.stones[0]) {
					this.pieces[y][x].highlit = true;
					this.pieces[y][x].type = selectedCrew.stones[0].right.type;
					this.pieces[y][x - 1].highlit = true;
					this.pieces[y][x - 1].type = selectedCrew.stones[0].left.type;
				}
			}
		}
		else {
			this.bfs(x, y, function(a) {a.highlit = true});
		}
	}
	this.score = function(x, y) {
		var scoring = this.bfs(x, y, function(p) {p.used = true});
		var amt = scoring * (scoring + 1) / 2;
		score += amt;
		money += amt;
		makeButtons();
	}
	this.draw = function() {
		ctx.save();
		ctx.translate(-tilew, -tilew);
		for (var y = 0; y < this.pieces.length; ++y) {
			var row = this.pieces[y];
			
			for (var x = 0; x < row.length; ++x) {
				ctx.translate(tilew, 0);
				if (Math.abs(x + 1/2 - pyramidH) <= pyramidH - y) {
					row[x].draw();
					if (x % 2 == y % 2) {
						ctx.strokeStyle = "rgba(0, 0, 0, .1)";
						ctx.lineWidth = 1;
						ctx.strokeRect(0, 0, tilew * 2, tilew);
					}
				}
				
			}
			ctx.translate(-(row.length) * tilew, -tilew);
		}
		ctx.restore();
		ctx.fillStyle = "rgba(120, 120, 120, .5)";
		ctx.fillRect(tilew * (pyramidH-1), - tilew * pyramidH, tilew * 2, -10000);
	}
}

function Block(left, right) {
	this.left = new Piece(left);
	this.right = new Piece(right);
	this.left.onWay = true;
	this.right.onWay = true;
	this.draw = function() {
		this.left.draw();
		ctx.save();
		ctx.translate(tilew, 0);
		this.right.draw();
		ctx.restore();
	}
}
var pyramidColors = ["red", "green", "blue", "brown", "orange"]
function Piece(type) {
	this.type = type;
	this.highlit = false;
	this.used = false;
	this.placed = false;
	this.onWay = false;
	this.draw = function() {
		if (this.placed || this.onWay || this.highlit) {
			if (this.highlit && !this.placed) {
				ctx.globalAlpha = 0.5;
				if (selectedCrew.dist > 0) {
					ctx.globalAlpha = .2;
				}
				ctx.fillStyle = pyramidColors[this.type - 1];
			}
			else {
				ctx.fillStyle = pyramidColors[this.type - 1];
				if (this.used) {
					ctx.fillStyle = "#bb8823";
				}
			}
			
			ctx.fillRect(0, 0, tilew, tilew);
			if (!this.used) {
				ctx.drawImage(graphics["hier" + this.type], 0, 0);
				ctx.globalAlpha = 1;
				if (this.highlit && this.placed) {
					ctx.strokeStyle = "yellow";
					ctx.lineWidth = 4;
					ctx.strokeRect(0, 0, tilew, tilew);
				}
			}
		}
	}
}