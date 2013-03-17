SWORD.helpWindow = function () {
	var display = SWORD.display;
	
	display.drawRect(0, 0, 80, 25, "#000");	// main box
	
	display.drawText(1, 1, "%c{#ccc}AlexandriaRL%c{#66E}----%c{#999}by joff_b%c{#66E}--%c{#ccc}for 7DRL 2013");
	display.drawText(1, 2, "%c{#66E}----------------%c{#999}joejkennedy@gmail.com%c{#66E}---");
	display.drawText(1, 4, "Basics:");
	display.drawText(5, 5, "No bump to attack, all attacks done through scroll items");
	display.drawText(5, 6, "No levelling or player stat increases. No regen, fixed HP max");
	
	display.drawText(1, 7, "Keys:");
	display.drawText(5, 8, "Moving: %c{#66E}numpad, vi keys, cursor keys + home/end/pgup/pgdn");
	display.drawText(5, 9, "Waiting: %c{#66E}numpad 5 or .");
	display.drawText(5, 10, "Inventory: %c{#66E}i");
	display.drawText(5, 11, "Use stairs: %c{#66E}o");
	display.drawText(5, 12, "Hotkey casting: %c{#66E}q, w, e");
	display.drawText(5, 13, "Change which hotkey's AoE is currently displayed: %c{#66E}r");
	display.drawText(5, 14, "Message Log: %c{#66E}m");

	display.drawText(1, 15, "Scrolls:");
	display.drawText(5, 16, "- Scrolls can be ragged, plain or illuminated.");
	display.drawText(5, 17, "- Better scrolls do more damage and have more range.");
	display.drawText(5, 18, "- Folios have more than one spell but you can only use a folio once");
	display.drawText(5, 19, "- ILLITERATE status means you can't read scrolls");
	display.drawText(5, 20, "- OBSESSED status means you will randomly cast the last spell you used");
	display.drawText(7, 21, "and any scroll you read will result in that spell.");
	display.drawText(5, 22, "- Some enemies can curse scrolls, reducing their quality. Duplicate and");
	display.drawText(7, 23, "upgrade scrolls randomly upgrade or duplicate a scroll.");
}

SWORD.startWindow = function () {
	var display = SWORD.display;
	
	display.drawRect(19, 11, 61, 17, "#337");	// main box
	
	display.drawText(20, 12, "%b{#337}%c{#ccc}AlexandriaRL%c{#66E}----%c{#ccc}by joff_b%c{#66E}--%c{#ccc}for 7DRL 2013");
	display.drawText(20, 13, "%b{#337}%c{#66E}----------------%c{#ccc}joejkennedy@gmail.com%c{#66E}---");
	display.drawText(20, 15, "%b{#337}%c{#66E}-------------%c{#ccc}PRESS A KEY%c{#66E}----------------");
}


SWORD.deathWindow = function () {
	var display = SWORD.display;
	
	display.drawRect(23, 11, 52, 15, "#337");	// main box
	
	display.drawText(25, 12, "%b{#337}%c{#fff}You're dead, sorry buddy.");
	display.drawText(24, 13, "%b{#337}%c{#fff}Refresh the page to restart");
}

SWORD.winWindow = function () {
	var display = SWORD.display;
	
	display.drawRect(23, 11, 52, 15, "#337");	// main box
	
	display.drawText(24, 12, "%b{#337}%c{#fff}You escape, good job buddy.");
	display.drawText(24, 13, "%b{#337}%c{#fff}Refresh the page to restart");
}


SWORD.messageLogWindow = function () {
	var i, len, lines = 0,
		messages = [],
		display = this.display;

	// display messages
	lines = 0;
	messages = SWORD.game.message.latestMessages();
	
	for (i = 0; (i < messages.length) && (lines < 23); i++) {
		
		m = messages[i].longText();
		
		for (j = 0; (j < m.length) && (lines < 23); j++) {
			display.drawText(1, lines + 1, m[j]);
			lines++;
		}
	}	
};


SWORD.inventoryWindow = function () {
	var i, j,
		text,
		scroll,
		spell,
		indent,
		foliostart,
		printname,

		windowwidth = 36,
				
		inv = SWORD.game.inventory,
		len = inv.spellindex.length,
		display = this.display,
		
		viewstart,
		viewend,
		viewheight = 19;
		viewhalf = Math.ceil(viewheight/2);
		
	offset = (SWORD.game.player.x < 40) ? 44 : 0;
		
	display.drawRect(offset, 0, windowwidth + offset, 25, "#002");	// shadow
	display.drawRect(offset, 1, windowwidth + offset, 24, "#113");	// main box
	
	if (offset > 0) {
		display.drawText(0, 22, "q)" + SWORD.game.inventory.hotkeySpell("q"));
		display.drawText(0, 23, "w)" + SWORD.game.inventory.hotkeySpell("w"));
		display.drawText(0, 24, "e)" + SWORD.game.inventory.hotkeySpell("e"));
	}
	
	// key help info
	display.drawText(1 + offset, 21, "%b{#113}%c{#fff}esc/i: %c{#aaa}close inventory\n%c{#fff}enter/r: %c{#aaa}read scroll\n%c{#fff}q/w/e: %c{#aaa}set scroll to hotkey", 50);
	display.drawText(1 + offset, 0, "%b{#002}%c{#44C}Scroll");
	display.drawText(offset + windowwidth - 4, 0, "%b{#002}%c{#44C}Qty");
	
	// don't try to write out inventory w/ no scrolls
	if (inv.slots.length === 0) {
		return;
	}
	
	scroll = inv.slots[inv.spellindex[inv.menu.cursor].scrollid];
	spell = scroll.spells[inv.spellindex[inv.menu.cursor].spell];
	
	// write spell description of currently hilighted spell
	display.drawText(offset, 24, "%b{#002}%c{#44C}" + SWORD.spellinfo[spell].description);
	
	// get viewport location within the spell index
	if (inv.menu.cursor + viewhalf > len) {
		viewend = len;
	}
	else if (inv.menu.cursor + viewhalf < viewheight) {
		viewend = viewheight;
	}
	else {
		viewend = inv.menu.cursor + viewhalf;
	}
	
	viewstart = viewend - viewheight;
	
	if (viewend > len) {
		viewend = len;
	}
	
	if (viewstart < 0) {
		viewstart = 0;
	}
	
	indent = 0;
	foliostart = false;
	for (i = viewstart; i < viewend; i++) {
		scroll = inv.slots[inv.spellindex[i].scrollid];
		spell = scroll.spells[inv.spellindex[i].spell];
		
		// hilight currently selected
		if (i === inv.menu.cursor) {
			text = "%b{#fff}%c{#000}";
		}
		else {
			text = "%b{#113}%c{#fff}";
		}
		
		if ((scroll.type === "folio") && (indent === 0)) {
			indent = scroll.spells.length - inv.spellindex[i].spell;
			
			if (inv.spellindex[i].spell === 0) {
				foliostart = true;
			}
		}
		
		// give jibberish scroll name if illiterate
		if (SWORD.game.player.illiterate > 0) {
			printname = SWORD.nonsense[(i + SWORD.game.player.illiterate - (inv.menu.cursor * 2)).mod(SWORD.nonsensecount)];
		}
		else {
			printname = spell;
		}
		
	
		if ((indent > 0) && (foliostart === false)) {
			text += printname;
		}
		else {
			text += scroll.quality + " " + scroll.type + " of " + printname;
		}
		
		if ((indent > 0) && (foliostart === false)) {
			display.drawText(1 + 9 + offset + scroll.quality.length + 1, i - viewstart + 1, text, 76);
		}
		else {
			display.drawText(1 + offset, i - viewstart + 1, text, 76);
			display.drawText(windowwidth + offset - 4, i - viewstart + 1, "(" + scroll.uses + ")");
			foliostart = false;
		}
		
		if (indent > 0) {
			indent--;
		}
	}
};