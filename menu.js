SWORD.Menu = function () {
	this.cursor = 0;
	this.elements = [];
};

SWORD.Menu.prototype.makeSelection = function () {
	var func = this.elements[this.cursor];
	
	if (typeof func !== "function") {
		return false;
	}
	
	ret = func();
	
	// on return of true, assume success
	if (ret) {
		this.cursor = 0;
	}
	
	return ret;
};

SWORD.Menu.prototype.moveCursor = function(move) {
	var cursor = this.cursor,
		len = this.elements.length;
		
	cursor += move;
	
	if (cursor < 0) {
		cursor = len - 1;
	}
	else if (cursor >= len) {
		cursor = 0;
	}
	
	this.cursor = cursor;
};

SWORD.Menu.prototype.addElement = function(func, pos) {
	var elements = this.elements;
	
	if (typeof func === "function") {
	
		if (typeof pos === "number") {
			elements.splice(pos, 0, func);
		}
		else {
			elements.push(func);
		}
		
	}
};

SWORD.Menu.prototype.clear = function () {
	this.cursor = 0;
	this.elements = [];
}