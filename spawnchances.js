
// scroll type rarities for each dlevel
SWORD.scroll_rarity = [];
	SWORD.scroll_rarity[1] =
	SWORD.scroll_rarity[2] =
	SWORD.scroll_rarity[3] =
	SWORD.scroll_rarity[4] = { common: ["scroll"], uncommon: ["folio"], rare: ["book"] };

// scroll quality rarities for each dlevel
SWORD.scroll_quality = [];1
	SWORD.scroll_quality[1] =
	SWORD.scroll_quality[2] = {common: ["ragged"], rare: ["plain"] };
	SWORD.scroll_quality[3] = 
	SWORD.scroll_quality[4] = {common: ["plain"], uncommon: ["illuminated"], rare: ["ragged"]};

// spell type rarities for each dlevel
SWORD.spell_rarity = [];
	SWORD.spell_rarity[1] = {common: ["sandstorm", "putrefy", "swap"], uncommon: ["shield", "putrefy", "heal"], rare: ["duplicate", "upgrade"] };
	SWORD.spell_rarity[2] = {common: ["sandstorm", "putrefy", "swap", "heal"], uncommon: ["shield", "duplicate"], rare: ["upgrade"] };
	SWORD.spell_rarity[3] = {common: ["sandstorm", "putrefy", "swap", "heal", "shield"], uncommon: ["duplicate", "upgrade"] };
	SWORD.spell_rarity[4] = {common: ["sandstorm", "putrefy", "swap", "heal", "shield"], uncommon: ["duplicate", "upgrade"] };

//
SWORD.monster_rarity = [];
	SWORD.monster_rarity[1] =
	SWORD.monster_rarity[2] =	{common: ["scarab", "hieroglyph"], uncommon: ["hieroglyph"], rare: ["eye"] };
	SWORD.monster_rarity[3] =
	SWORD.monster_rarity[4] =	{common: ["pharisee"], uncommon: ["scarab", "hieroglyph", "eye"] };
	

// returns "common", "uncommon" or "rare"
SWORD.randomRarity = function () {
	var p,
		rarity = "rare";

	p = ROT.RNG.getUniform();
	
	if (p < 0.75) {
		rarity = "common";
	}
	else if ((p >= 0.75) && (p < 0.9)) {
		rarity = "uncommon";
	}
	
	return rarity;
}

// looks in a given object for common, uncommon and rare properties and the arrays with
// spell/scroll/monster names within
SWORD.randomFromRarity = function (rarityobject, rarity) {
	var i,
		len,
		r = rarityobject,
		element = null;
		
	if (r.hasOwnProperty(rarity) === false){
		return this.randomFromRarity(r, this.randomRarity());
	}
	
	element = Math.floor(ROT.RNG.getUniform() * r[rarity].length);
	
	return r[rarity][element];
};

SWORD.randomScrollType = function (dlevel) {
	return this.randomFromRarity(this.scroll_rarity[dlevel], this.randomRarity());
}

SWORD.randomSpellType = function (dlevel) {
	return this.randomFromRarity(this.spell_rarity[dlevel], this.randomRarity());
}

SWORD.randomScrollQuality = function (dlevel) {
	return this.randomFromRarity(this.scroll_quality[dlevel], this.randomRarity());
}

// returns a random scroll object
SWORD.randomScroll = function (dlevel) {	
	var scrolltype,
		scroll;

	if (this.spell_rarity[dlevel] === undefined || this.scroll_rarity[dlevel] === undefined) {
		return null;
	}
	
	scrolltype = this.randomScrollType(dlevel);

	switch (scrolltype) {
		case "folio":
			scroll = new SWORD.Scroll(scrolltype, this.randomScrollQuality(dlevel), dlevel, [this.randomSpellType(dlevel), this.randomSpellType(dlevel), this.randomSpellType(dlevel)]);
			break;
			
		default:
			scroll = new SWORD.Scroll(scrolltype, this.randomScrollQuality(dlevel), dlevel, [this.randomSpellType(dlevel)]);
			break;
	}
	
	return scroll;
};

SWORD.randomMonster = function (dlevel) {
	return this.randomFromRarity(this.monster_rarity[dlevel], this.randomRarity());
}
