SWORD.Scroll = function (type, quality, dlevel, spells) {
	var i,
		len = arguments.length;
		
	if (type === "book") {
		this.uses = dlevel + 1;
	}
	else {
		this.uses = 1;
	}
	
	this.type = type;
	this.quality = quality;
	this.spells = [];
	this.dlevel = dlevel;
	
	for (i = 0; i < spells.length; i++) {
		this.spells.push(spells[i]);
	}
};

SWORD.Scroll.prototype.dup = function () {
	return (new SWORD.Scroll(this.type, this.quality, this.dlevel, this.spells));
};


SWORD.Scroll.prototype.hasSpell = function (spell) {
	var i,
	has = false,
	len = this.spells.length;

	for (i = 0; i < len; i++) {
		if (this.spells[i] === spell) {
			has = true;
		}
	}
	
	return has;
};