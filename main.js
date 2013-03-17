SWORD.nonsensecount = 30;

SWORD.nonsense = (function () {
	var i, j, size, str, ret = [];
	
	for (i = 0; i < SWORD.nonsensecount; i++) {
		
		str = "";
		size = 5 + Math.ceil(Math.random() * 3);
		
		for (j = 0; j < size; j++) {
			str += String.fromCharCode(48 + Math.ceil(Math.random() * 78));
		}
		
		ret.push(str);
	}
	
	return ret;
})();

SWORD.draw = function () {
	var i, j,
		lines,
		offset,
		m,
		messages,
		map = this.game.map,
		player = this.game.player,
		display = this.display;

	display.clear();
	
	// draw previously seen tiles
	for(j = 0; j < map.h; j++) {
		for(i = 0; i < map.w; i++) {
			offset = i + "," + j;
			
			if (map.seen[offset]) {
				display.draw(i, j, map.data[offset].symbol, "#225");
			}
		}
	}
	
	// draw what's visible
	map.fov.compute(player.x, player.y, 20, function(x, y, r) {
		var chr, fg, offset = x + "," + y;
		
		map.seen[offset] = true;
		
		// draw tiles
		chr = map.data[offset].symbol;
		fg = map.data[offset].color;
		
		// draw scrolls
		if(map.scrolls.hasOwnProperty(offset)) {
			chr = "?";
			fg = "green";
		}
		
		// draw creatures
		if(map.creatures.hasOwnProperty(offset)) {
			chr = map.creatures[offset].symbol;
			fg = "white";
		}
		
		display.draw(x, y, chr, fg, "black");
	});

	if (SWORD.animate !== null) {
		for (i = 0; i < SWORD.animate.coords.length; i++) {
			display.drawText(SWORD.animate.coords[i].x, SWORD.animate.coords[i].y, "%c{" + SWORD.animate.fg + "}%b{" + SWORD.animate.bg + "}" + SWORD.animate.character);
		}
	}

	display.drawText(67, 22 + SWORD.game.inventory.hotkeycursor, ">");
	
	display.drawText(68, 22, "q)" + SWORD.game.inventory.hotkeySpell("q"));
	display.drawText(68, 23, "w)" + SWORD.game.inventory.hotkeySpell("w"));
	display.drawText(68, 24, "e)" + SWORD.game.inventory.hotkeySpell("e"));

	i = SWORD.game.inventory.currentHotkey();
	
	if ((i !== "off") &&
		(SWORD.game.inventory.hotkeySpell(i) !== "")) {
		
		SWORD.inventoryScrollAoE(SWORD.game.inventory.hotkeys[i].scroll, SWORD.game.inventory.hotkeys[i].spellid);
	}
	
	// display short messages at the side
	lines = 0;
	messages = SWORD.game.message.latestMessages();
	
	for (i = 0; (i < messages.length) && (lines < 21); i++) {
		
		m = messages[i].shortText();
		
		for (j = 0; (j < m.length) && (lines < 21); j++) {
			display.drawText(68, lines, m[j]);
			lines++;
		}
	}
	
	switch (SWORD.game.state) {
		case "messagelog":
			SWORD.messageLogWindow();
			break;
		case "inventory":
			if ((SWORD.game.inventory.slots.length > 0) && player.canCast()) {
				SWORD.inventoryScrollAoE(SWORD.game.inventory.currentScroll(), SWORD.game.inventory.currentSpell());
			}
			SWORD.inventoryWindow();
			break;
		case "swap":
			display.draw(SWORD.game.swap.getCurrentX(), SWORD.game.swap.getCurrentY(), " ", "red", "red");
			display.drawText(0, 23, "%b{#113}%c{#fff}left/right/4/6/h/l: %c{#aaa}cycle enemies");
			display.drawText(0, 24, "%b{#113}%c{#fff}enter: %c{#aaa}swap");
			
			break;
			
		case "help":
			SWORD.helpWindow();
			break;
			
		case "death":
			SWORD.deathWindow();
			break;
		
		case "win":
			SWORD.winWindow();
			break;
		
		case "start":
			SWORD.startWindow();
			break;
			
		case "game":
		
			display.drawText(0, 22, "@ HP:" + player.healthColor() + player.hp + "%c{white}/" + player.maxhp);
			display.drawText(14, 22, "Depth: " + map.dlevel + " " +
				(player.illiterate > 0 ? "%c{f80}ILLITERATE " : "")
				+ (player.obsessed > 0 ? "%c{ff0}OBSESSED " : "") 
				+ (player.scrollbeacon > 0 ? "%c{f08}EMITTING " : "")
				+ (player.shield > 0 ? "%c{77f}SHIELD(" + player.shield + ")" : "")
			);
		
			// display long messages at the bottom
			lines = 0;
			for (i = 0; (i < 2) && (lines < 2); i++) {
				
				m = messages[i].longText();
				
				for (j = 0; (j < m.length) && (lines < 2); j++) {
					display.drawText(0, 23 + lines, m[j]);
					lines++;
				}
			}
			
			break;
		default:
			break;
	}
};


SWORD.inventoryScrollAoE = function (scroll, spell) {
	var i,
		c,
		xy,
		fg,
		chr,
		inv = SWORD.game.inventory,
		coords = SWORD.getScrollAoE(SWORD.game.player, scroll, spell);
		
	for (i = 0; i < coords.length; i++) {
		c = coords[i];
		xy = c.split(",");
		fg = "#a33";
		
		chr = SWORD.game.map.data[c].symbol;
		
		// draw scroll
		if(SWORD.game.map.scrolls.hasOwnProperty(c)) {
			chr = "?";
		}
		
		// draw creature
		if(SWORD.game.map.creatures.hasOwnProperty(c)) {
			chr = SWORD.game.map.creatures[c].symbol;
			fg = "white";
		}
		
		this.display.draw(parseInt(xy[0]), parseInt(xy[1]), chr, fg , "#400");
	}
};

SWORD.animateFlash = function (coords, character, fg, bg) {
	var i, t, clist = [];
	
	for (i = 0; i < coords.length; i++) {
		t = coords[i].split(",");
		
		clist.push({x: parseInt(t[0]), y: parseInt(t[1])});
	}
	
	
	SWORD.animate = {coords: clist, character: character, fg: fg, bg: bg};
	
	SWORD.game.engine.lock()
	
	setTimeout(SWORD.clearFlash, 300);
};

SWORD.clearFlash = function () {
	SWORD.animate = null;
	SWORD.game.engine.unlock();
	SWORD.draw();
};

// MAIN
SWORD.main = function () {
	// init display
	this.display = new ROT.Display( {width: 80, height: 25} );
	this.display.w = 80;
	this.display.h = 25;
	this.display.drawRect = function (x1, y1, x2, y2, bg) {
		for (j = y1; j < y2; j++) {
			for (i = x1; i < x2; i++) {
				this.draw(i, j, " ", bg, bg);
			}
		}
	};
	
	//this.display.setOptions({fontFamily: "Palatino"});
	
	document.body.appendChild(this.display.getContainer());

	// setup game's state
	this.game = new SWORD.Game();
	this.game.engine.start();
	
	// add some starting scrolls
	for (i = 0; i < 3; i++) {
		this.game.inventory.addScroll(SWORD.randomScroll(this.game.map.dlevel));
	}
	
	this.game.message.newMessage({type: "start"});
	
	this.draw();
};