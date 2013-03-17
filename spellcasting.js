
SWORD.spellinfo = {
	sandstorm: {damage: 10, range: 2, description: "sand tiles (,) in range add damage"},
	heal: {damage: 20, range: 0, description: "heal yourself"},
	unlock: {damage: 0, range: 1, description: "unlock locked doors in range"},
	duplicate: {damage: 0, range: 0, description: "duplicate random scroll(s)"},
	upgrade: {damage: 0, range: 0, description: "upgrade random scroll(s)"},
	putrefy: {damage: 30, range: 4, description: "explodes corpses (%) in range"},
	swap: {damage: 0, range: 2, description: "swap places with an enemy in range"},
	shield: {damage: 0, range: 0, description: "resist a number of attacks"},
};

SWORD.quality_mul = { ragged: 1, plain: 2, illuminated: 4 };

SWORD.getScrollAoE = function (creature, scroll, spell) {
	var coords = [];
	
	spellname = scroll.spells[spell];
	spellinfo = SWORD.spellinfo[spellname];
	quality = SWORD.quality_mul[scroll.quality];
	
	coords = SWORD.game.map.getCoordsInFov(creature, Math.ceil(spellinfo.range * quality));
	
	return coords;
};

SWORD.castDuplicate = function () {
	var scroll,
		validscrolls = [],
		inv = SWORD.game.inventory,
		len = inv.slots.length;
	
	// run through all the scrolls picking out ones that aren't duplicate scrolls
	for (i = 0; i < len; i++) {
		scroll = inv.slots[i];
		
		if (scroll.hasSpell("duplicate") === false) {
			validscrolls.push(scroll);
		}
	}
	
	// run through those scrolls and duplicate a random one
	if (validscrolls.length > 0) {
		scroll = validscrolls[Math.floor(ROT.RNG.getUniform() * validscrolls.length)];
		scroll.uses++;
		
		SWORD.game.message.newMessage({type: "scroll pickup", scroll: scroll});
	}
	else {
		SWORD.game.message.newMessage({type: "scroll no effect", scroll: scroll});
	}
};

SWORD.castUpgrade = function () {
	var scroll, newscroll,
		validscrolls = [],
		inv = SWORD.game.inventory;
	
	var upgradeQuality = function (quality) {
		var ret;
		
		switch (quality) {
			case "ragged":
				ret = "plain";
				break;
			case "plain":
				ret = "illuminated";
				break;
		}
		
		return ret;
	}
	
	// figure out which scrolls we can upgrade
	for (i = 0; i < inv.slots.length; i++) {
		scroll = inv.slots[i];
		
		if ((scroll.quality !== "illuminated") && (scroll.hasSpell("upgrade") == false)) {
			validscrolls.push(scroll);
		}
	}
	
	// upgrade a random one
	if (validscrolls.length > 0) {
		scroll = validscrolls[Math.floor(ROT.RNG.getUniform() * validscrolls.length)];
		
		if (scroll.uses === 1) {
			scroll.quality = upgradeQuality(validscrolls[0].quality);
			SWORD.game.message.newMessage({type: "upgrade", scroll: scroll});
		}
		else {
			scroll.uses--;
			
			newscroll = scroll.dup();
			newscroll.uses = 1;
			newscroll.quality = upgradeQuality(newscroll.quality);
			
			inv.addScroll(newscroll, true);
			
			SWORD.game.message.newMessage({type: "upgrade", scroll: newscroll});
		}
		
		inv.update();
	}
	else {
	}
	
};

SWORD.castFromScroll = function (creature, scroll, spell) {
	var i, j, len,
		damage,
		coords,
		adjacent,
		creatures,
		animate,
		quality,
		spellinfo,
		spellname,
		map = SWORD.game.map;
	
	if (spell === undefined) {
		spell = 0;
	}
	
	spellname = scroll.spells[spell];
	spellinfo = SWORD.spellinfo[spellname];
	quality = SWORD.quality_mul[scroll.quality];
	
	SWORD.game.message.newMessage({type: "scroll use", scroll: scroll, spell: spellname});
	
	switch (spellname) {
	
	case "heal":
		var health = spellinfo.damage * quality;
		creature.changeHP(health);
		
		SWORD.game.message.newMessage({type: "heal", creature: creature, health: health});
		
		SWORD.animateFlash([creature.x + "," + creature.y], "*", "#44f", "#004");
		
		break;
	
	case "shield":
		creature.shield += quality + 1;
		
		SWORD.animateFlash([creature.x + "," + creature.y], "SHIELD", "#44f", "#004");
		break;
	
	case "duplicate":
		// better scrolls make more duplicates
		for (i = 0; i < quality; i++) {
			SWORD.castDuplicate();
		}

		SWORD.animateFlash([creature.x + "," + creature.y], "DUP" + quality, "#44f", "#004");
		
		break;
		
	case "upgrade":
		// better scrolls upgrade more scrolls
		for (i = 0; i < quality; i++) {
			SWORD.castUpgrade();
		}
		
		SWORD.animateFlash([creature.x + "," + creature.y], "UPG", "#44f", "#004");
		
		break;
		
	case "putrefy":
		animate = [];
		coords = SWORD.getScrollAoE(creature, scroll, spell);
		
		for (i = 0, len = coords.length; i < len; i++) {
			if (map.data[coords[i]] === SWORD.terrains.corpse) {
				
				animate.push(coords[i]);
				
				// full damage to creatures on top of corpse
				if (map.creatures.hasOwnProperty(coords[i])) {
					creature.tryAttack(map.creatures[coords[i]], spellinfo.damage * quality);
				}
				
				// half damage to those surrounding
				adjacent = map.getCreaturesAdjacentTo(coords[i]);
				
				for (j = 0; j < adjacent.length; j++) {
					animate.push(adjacent[j].x + "," + adjacent[j].y);
					creature.tryAttack(adjacent[j], (spellinfo.damage * quality) / 2);
				}
				
				map.data[coords[i]] = SWORD.terrains.floor;
			}
		}
		
		SWORD.animateFlash(animate, "*", "#96b", "#314");
		
		break;
		
	case "swap":
		creatures = [];
		coords = SWORD.getScrollAoE(creature, scroll, spell);
		
		for (i = 0; i < coords.length; i++) {
			if (map.creatures.hasOwnProperty(coords[i])) {
				if (map.creatures[coords[i]] !== creature) {
					creatures.push(coords[i]);
				}
			}
		}
		
		if (creatures.length > 0) {
			SWORD.game.swap = new SWORD.Swap(creatures);
			SWORD.game.state = "swap";
			SWORD.draw();
			
			creature.scrollbeacon = 5;
			return;
		}
		else {
			SWORD.game.message.newMessage({type: "scroll no effect", scroll: scroll});
		}
		
		break;
		
	case "unlock":
		coords = SWORD.getScrollAoE(creature, scroll, spell);
		
		for (i = 0, len = coords.length; i < len; i++) {
			if (SWORD.game.map.creatures.hasOwnProperty(coords[i])) {
				if (SWORD.game.map.data[coords[i]] === SWORD.terrains.doorlocked) {
					SWORD.game.map.data[coords[i]] = SWORD.terrains.doorclosed;
					
					SWORD.game.message.newMessage({type: "unlocked"});
				}
			}
		}
		break;
		
	case "sandstorm":
		
		coords = SWORD.getScrollAoE(creature, scroll, spell);
		creatures = [];
		damage = spellinfo.damage * quality;
		
		for (i = 0, len = coords.length; i < len; i++) {

			// add damage for every sand tile in range
			if (map.data[coords[i]] === SWORD.terrains.sand) {
				map.data[coords[i]] = SWORD.terrains.floor;
				damage += quality * 2;
			}

			if (map.creatures.hasOwnProperty(coords[i])) {
				defender = SWORD.game.map.creatures[coords[i]];
				
				// if it's not the player, add it to the list of things to attack
				if (defender !== creature) {
					creatures.push(defender);
				}
			}
		}
		
		for (i = 0; i < creatures.length; i++) {
			creature.tryAttack(creatures[i], damage);
		}
		
		SWORD.animateFlash(coords, "~", "#ff0", "#000");
		
		break;
		
	default:
		break;
	}
	
	// if a creature uses a scroll, it radiates a magical field for a number of turns
	creature.scrollbeacon = 5;
	
	creature.endTurn();
	SWORD.game.state = "game";
};