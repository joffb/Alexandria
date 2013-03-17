SWORD.Inventory = function () {
	this.slots = [];
	this.menu = new SWORD.Menu();
	this.hotkeys = {};
	this.spellindex = [];
	
	this.hotkeycycle = ["q", "w", "e", "off"];
	this.hotkeycursor = 0;
};

SWORD.Inventory.prototype.currentHotkey = function () {
	return this.hotkeycycle[this.hotkeycursor];
};

SWORD.Inventory.prototype.currentScroll = function () {
	return this.slots[this.spellindex[this.menu.cursor].scrollid];
};

SWORD.Inventory.prototype.currentSpell = function () {
	return this.spellindex[this.menu.cursor].spell;
};

SWORD.Inventory.prototype.simplify = function () {
	var i, j, k,
		scroll,
		compare,
		unique, 
		remove = [],
		len = this.slots.length;
	
	for (i = 0; i < len; i++) {
		scroll = this.slots[i];
		
		for (j = i + 1; j < len; j++) {
		
			compare = this.slots[j];
			unique = true;
			
			// if the quality and type are the same
			if ((scroll.type === compare.type) &&
				(scroll.quality === compare.quality)) {
				
				unique = false;
				
				// check through the spells to see if they're unique
				// (assumes all scroll types have a fixed number of spells)
				for (k = 0; k < scroll.spells.length; k++) {
					if (scroll.spells[k] !== compare.spells[k]) {
						unique = true;
					}
				}
			}
			
			if (unique === false) {
				compare.uses += scroll.uses;
				remove.push(i);
				break;
			}
		}
	}
	
	for (i = 0; i < remove.length; i++) {
		this.slots.splice(remove[i], 1);
	}
};

SWORD.Inventory.prototype.update = function () {
	this.simplify();
	
	this.sortByScrollType();
	this.buildMenu();
}


SWORD.Inventory.prototype.addScroll = function (newscroll, silent) {
	var i, j,
		scroll,
		addnew = true;
		len = this.slots.length;

	this.slots.push(newscroll);
	this.update();
	
	if (silent !== true) {
		SWORD.game.message.newMessage({type: "scroll pickup", scroll: newscroll});
	}
};

SWORD.Inventory.prototype.useScroll = function (scrollid, spell) {
	var scroll, player = SWORD.game.player;
	
	if (spell === undefined) {
		spell = 0;
	}
	
	if ((SWORD.game.player.obsessed > 0) && (player.lastSpell !== null)) {
		SWORD.castFromScroll(player, player.lastSpell.scroll, player.lastSpell.spell);
		return;
	}

	scroll = this.slots[scrollid];
	scroll.uses--;
	
	// when it runs out of charge, get rid of it
	if (scroll.uses === 0) {
		this.slots.splice(scrollid, 1);
	}

	this.buildMenu();
	
	SWORD.castFromScroll(player, scroll, spell);
	
	this.buildMenu();
	
	// for obsessed status
	player.lastSpell = {scroll: scroll, spell: spell};
};

SWORD.Inventory.rankScrollType = function (scroll) {
	var rank = 0;
	
	// fallthrough shenanigans
	switch (scroll.type) {
		case "book":
			rank++;
		case "folio":
			rank++;
		case "scroll":
			rank++;
		default:
			break;
	}
	
	return rank;
};

SWORD.Inventory.rankScrollQuality = function (scroll) {
	var rank = 0;
	
	// fallthrough shenanigans
	switch (scroll.quality) {
		case "illuminated":
			rank++;
		case "plain":
			rank++;
		case "rare":
			rank++;
		default:
			break;
	}
	
	return rank;
};

SWORD.Inventory.prototype.typeSort = function (a, b) {
	return SWORD.Inventory.rankScrollType(a) - SWORD.Inventory.rankScrollType(b);
};

SWORD.Inventory.prototype.qualitySort = function (a, b) {
	return SWORD.Inventory.rankScrollQuality(a) - SWORD.Inventory.rankScrollQuality(b);
};

SWORD.Inventory.prototype.sortByScrollType = function () {
	this.slots.sort(this.typeSort);
	this.slots.sort(this.qualitySort);
};

SWORD.Inventory.prototype.buildMenu = function () {
	var i,
		j,
		scroll,
		len = this.slots.length,
		scrollSelectFunction;
	
	this.menu.clear();
	this.spellindex = [];
	
	scrollSelectFunction = function (scrollid, spell, that) {
		return (function () {
		
			// check the player can actually use a scroll
			if (!SWORD.game.player.canCast()) {
				return false;
			}
		
			that.useScroll(scrollid, spell);
			
			return true;
		});
	}
	
	for (i = 0; i < len; i++) {
		scroll = this.slots[i];
		
		for (j = 0; j < scroll.spells.length; j++) {
			this.menu.addElement(scrollSelectFunction(i, j, this));
			
			this.spellindex.push({scrollid: i, spell: j});
		}
	}
};

SWORD.Inventory.prototype.putSelectedInHotkey = function (keyname) {
	var idx = this.spellindex[this.menu.cursor];
	
	this.hotkeys[keyname] = {scroll: this.slots[idx.scrollid], spellid: idx.spell};
};

// return name of hotkey spell
SWORD.Inventory.prototype.hotkeySpell = function (keyname) {
	var key;
	
	if (!this.hotkeys.hasOwnProperty(keyname)) {
		return "";
	}
	
	key = this.hotkeys[keyname];
	return key.scroll.spells[key.spellid];
};

SWORD.Inventory.prototype.scrollObjectToIndex = function (scroll) {
	var i, len = this.slots.length;
	
	for (i = 0; i < len; i++) {
		if (this.slots[i] === scroll) {
			return i;
		}
	}
	
	return len;
};

SWORD.Inventory.prototype.castHotkeySpell = function (keyname) {
	var i,
		key,
		scroll,
		hotkeys = this.hotkeys;
	
	if (!hotkeys.hasOwnProperty(keyname)) {
		return false;
	}
	
	// check the player can actually use a scroll
	if (!SWORD.game.player.canCast()) {
		return false;
	}
	
	key = hotkeys[keyname];
	
	i = this.scrollObjectToIndex(key.scroll);
	this.useScroll(i, key.spellid);

	// clear out hotkey if the scroll we just used up was in it
	if (key.scroll.uses === 0) {
		for (i in hotkeys) {
			if (hotkeys.hasOwnProperty(i)) {
				if (hotkeys[i].scroll === key.scroll) {
					delete hotkeys[i];
				}
			}
		}
	}
	
	return true;
};

SWORD.Inventory.prototype.curseRandomScroll = function (attacker) {
	var scroll,
		newscroll,
		validscrolls = [],
		inv = this,
		len = this.slots.length;

	var degradeQuality = function (quality) {
		var ret;
		
		switch (quality) {
			case "plain":
				ret = "ragged";
				break;
			case "illuminated":
				ret = "plain";
				break;
		}
		
		return ret;
	}
		
	// run through all the scrolls picking out ones that aren't ragged scrolls
	for (i = 0; i < len; i++) {
		scroll = inv.slots[i];
		
		if (scroll.quality !== "ragged") {
			validscrolls.push(scroll);
		}
	}
	
	// run through those scrolls and duplicate a random one
	if (validscrolls.length > 0) {
		scroll = validscrolls[Math.floor(ROT.RNG.getUniform() * validscrolls.length)];
		
		if (scroll.uses === 1) {
			scroll.quality = degradeQuality(scroll.quality);
			
			SWORD.game.message.newMessage({type: "cursed scroll", scroll: scroll, attacker: attacker});
		}
		else {
			scroll.uses--;
			
			newscroll = scroll.dup();
			newscroll.uses = 1;
			newscroll.quality = degradeQuality(newscroll.quality);
			
			this.addScroll(newscroll, true);
			
			SWORD.game.message.newMessage({type: "cursed scroll", scroll: newscroll, attacker: attacker});
		}
		
	}
	else {
		SWORD.game.message.newMessage({type: "curse fail", attacker: attacker});
	}

}