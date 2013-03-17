SWORD.buildPath = function (x, y) {
	this.path.push([x, y])
};

// hieroglyph seeks towards the player if they are emitting magic after using a scroll
// or towards their last known location
// if they reach the player after seeking, or while heading towards the last known location,
// they make the player illiterate
SWORD.hieroAct = function () {
	var map = SWORD.game.map;
	
	// if the player is emitting 
	if (SWORD.game.player.scrollbeacon > 0) {
		
		// make adjacent player illiterate
		if (map.a_adjacent_b(SWORD.game.player, this)) {
			SWORD.game.player.makeIlliterate(5);
			
			SWORD.animateFlash([SWORD.game.player.x + "," + SWORD.game.player.y], "NO READ", "#44f", "#004");
			
			this.path = [];
			return;
		}
	
		this.dijkstraToCreature(SWORD.game.player);
		this.followPath();
	}
	// if the player isn't emitting but we know where he last was
	else if (this.path.length > 0) {
	
		// make adjacent player illiterate
		if (map.a_adjacent_b(SWORD.game.player, this)) {
			SWORD.game.player.makeIlliterate(5);

			SWORD.animateFlash([SWORD.game.player.x + "," + SWORD.game.player.y], "NO READ", "#44f", "#004");
			
			
			this.path = [];
		}
		else {	
			this.followPath();
		}
	}
	else {
		this.randomWander();
	}
};

// scarab runs towards the player + attacks when adjacent
SWORD.scarabAct = function () {
	var i, coords, moved = false, map = SWORD.game.map;

	if (map.a_adjacent_b(SWORD.game.player, this)) {
	
		SWORD.animateFlash([SWORD.game.player.x + "," + SWORD.game.player.y], "@", "#f00", "#300");
		this.tryAttack(SWORD.game.player, 5);
		
		this.path = [];
	}
	else if (this.path.length === 0) {
		
		coords = map.getCoordsInFov(this, 10);
		
		for (i = 0; i < coords.length; i++) {
			if (map.creatures[coords[i]] === SWORD.game.player) {
				this.dijkstraToCreature(SWORD.game.player);
				this.followPath();
				moved = true;
			}
		}
		
		if (moved === false) {
			this.randomWander();
		}
	}
	else if (this.path.length > 0) {
		this.followPath();
	}
}

// pharisee runs towards the player + attacks or makes obsessed
SWORD.phariseeAct = function () {
	var i, coords, moved = false, map = SWORD.game.map;

	if (map.a_adjacent_b(SWORD.game.player, this)) {
	
		if ((SWORD.game.player.obsessed === 0) && (SWORD.game.player.lastSpell !== null)) {
			SWORD.game.player.makeObsessed(5);
		}
		else {
			SWORD.animateFlash([SWORD.game.player.x + "," + SWORD.game.player.y], "@", "#f00", "#300");
			this.tryAttack(SWORD.game.player, 10);
		}
		
		this.path = [];
	}
	else if (this.path.length === 0) {
		
		coords = map.getCoordsInFov(this, 10);
		
		for (i = 0; i < coords.length; i++) {
			if (map.creatures[coords[i]] === SWORD.game.player) {
				this.dijkstraToCreature(SWORD.game.player);
				this.followPath();
				moved = true;
			}
		}
		
		if (moved === false) {
			this.randomWander();
		}
	}
	else if (this.path.length > 0) {
		this.followPath();
	}
	
}

SWORD.librarianAct = function () {
	var i, coords, map = SWORD.game.map;
	
	coords = map.getCoordsInFov(this, 2);
	
	if (coords.length > 0) {
		for (i = 0; i < coords.length; i++) {
			if (map.creatures[coords[i]] === SWORD.game.player) {
				SWORD.game.inventory.curseRandomScroll(this);
				SWORD.animateFlash([SWORD.game.player.x + "," + SWORD.game.player.y], "CURSE", "#f00", "#300");
			}
		}
	}
}