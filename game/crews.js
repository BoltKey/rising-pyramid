var distChange = 40;
function Crew(initDist, stones, key) {
	this.nextDist = initDist + distChange;
	this.stones = stones;
	this.dist = initDist;
	this.speed = .3;
	this.active = false;
	this.key = key;
	this.update = function() {
		if (this.active) {
			this.dist -= this.speed;
			this.dist = Math.max(0, this.dist);
		}
	}
	this.upgradeCost = function() {
		if (this.active) {
			return Math.floor(this.speed * 15);
		}
		else {
			return 5;
		}
	}
	this.upgrade = function() {
		if (money >= this.upgradeCost()) {
			money -= this.upgradeCost();
			if (this.active)
				this.speed *= 1.5;
			else 
				this.active = true;
			makeButtons();
			return true;
		}
		
		return false;
	}
	this.draw = function(invert) {
		if (this.stones.length > 0) {
			ctx.textAlign = "center";
			ctx.font = "20px Arial";
			ctx.fillText(this.key, tilew * 1.5 * (invert ? 1 : -1), 27);
			
			ctx.save();
			
			var sw = this.stones.length % 2;
			ctx.translate((invert ? -1 : 1) * (this.nextDist) - tilew, tilew * .6 * (sw ? 1 : -1));
			for (var s = 1; s < this.stones.length; ++s) {
				this.stones[s].draw();
				ctx.translate((invert ? -1 : 1) * distChange,
				              tilew * 1.2 * ((sw = !sw) ? 1 : -1));
			}
			ctx.restore();
			ctx.save();
			ctx.translate(-tilew, 0);
			if (selectedCrew === this) {
				ctx.strokeStyle = "red";
				ctx.lineWidth = 5;
				ctx.strokeRect(0, 0, tilew * 2, tilew);
			}
			ctx.translate((invert ? -1 : 1) * (this.dist), 0);
			
			this.stones[0].draw();
			ctx.restore();
		}
	}
	this.nextStone = function() {
		this.dist = this.nextDist;
		this.nextDist += distChange;
		if (this.stones.length === 1)
			this.nextDist = 1000000000;
		var retStone = this.stones.splice(0, 1)[0];
		retStone.onWay = false;
		return retStone;
	}
}