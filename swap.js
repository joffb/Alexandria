SWORD.Swap = function (coords) {
	this.coords = coords;
	this.cursor = 0;
};

SWORD.Swap.prototype.next = function () {
	this.cursor = (this.cursor + 1).mod(this.coords.length);
};


SWORD.Swap.prototype.prev = function () {
	this.cursor = (this.cursor - 1).mod(this.coords.length);
};

SWORD.Swap.prototype.getCurrentX = function () {
	var temp = this.coords[this.cursor].split(",");
	
	return parseInt(temp[0]);
};

SWORD.Swap.prototype.getCurrentY = function () {
	var temp = this.coords[this.cursor].split(",");
	
	return parseInt(temp[1]);
};

SWORD.Swap.prototype.doIt = function () {
	var map = SWORD.game.map;
	
	map.swapCreatures(SWORD.game.player, map.creatures[this.coords[this.cursor]]);
	
	SWORD.game.state = "game";
	SWORD.game.player.endTurn();
};