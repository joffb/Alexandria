SWORD.creatureDefs = {
	player: { name: "Player", team: "player", maxhp: 50, symbol: "@", speed: 100, description: "I me mine" },
	scarab: { name: "Scarab", team: "monster", maxhp: 12, symbol: "s", speed: 100, description: "Unsure in step but vicious with his bite.", act: SWORD.scarabAct },
	hieroglyph: { name: "Hieroglyph", team: "monster", maxhp: 5, symbol: "h", speed: 200, description: "A buzzing, formless shape cuts through the air.", act: SWORD.hieroAct },
	eye: { name: "Evil Eye", team: "monster", maxhp: 14, symbol: "e", speed: 50, description: "In ancient days he watched over the books.", act: SWORD.librarianAct },
	mummy: { name: "Mummy", team: "monster", maxhp: 20, symbol: "m", speed: 100, description: "Forsaken by the grave to rise again." },
	pharisee: { name: "Pharisee", team: "monster", maxhp: 40, symbol: "p", speed: 100, description: "Insane he wanders 'round the li'bry floor", act: SWORD.phariseeAct},
};

// takes an id string and looks it up in creatureDefs, returns a new creature object or null if the id's invalid
SWORD.Creature = function (id) {
	var def;
	
	if (SWORD.creatureDefs.hasOwnProperty(id)) {
		cdef = SWORD.creatureDefs[id];
		
		if (cdef.hasOwnProperty("act")) {
			this.act = cdef.act.bind(this);
		}
			
		this.name = cdef.name;
		this.symbol = cdef.symbol;
		this.description = cdef.description;
		this.team = cdef.team;

		this.x = 0;
		this.y = 0;			
		this.hp = cdef.maxhp;
		this.maxhp = cdef.maxhp;
		this.speed = cdef.speed;
		
		this.shield = 0;
		
		this.path = [];
	}
};

SWORD.Creature.prototype.getSpeed = function () {
	return this.speed;
};


SWORD.Creature.prototype.act = function () { 
	SWORD.game.map.tryMove(this, Math.floor(ROT.RNG.getUniform() * 3) - 1, Math.floor(ROT.RNG.getUniform() * 3) - 1);
	
	return;
};
		
SWORD.Creature.prototype.changeHP = function (amount) {
	this.hp += amount;
	
	if (this.hp > this.maxhp) {
		this.hp = this.maxhp;
	}
	else if (this.hp <= 0) {
		this.hp = 0;
		this.die();
	}
	
	return this;
};
		
SWORD.Creature.prototype.die = function () {
	var tile = SWORD.game.map.data[this.x + "," + this.y];
	
	if ((tile === SWORD.terrains.floor) || (tile === SWORD.terrains.sand)) {
		tile = SWORD.terrains.corpse;
	}
	
	SWORD.game.map.deleteCreature(this);
	SWORD.game.engine.removeActor(this);
	SWORD.game.message.newMessage({type: "death", creature: this});
};

SWORD.Creature.prototype.healthColor = function () {
	var damcolor = "%c{red}";
	
	if (this.hp > this.maxhp * 0.75) {
		damcolor = "%c{00ff00}";
	}
	else if (this.hp > this.maxhp * 0.50) {
		damcolor = "%c{yellow}";
	}
	else if (this.hp > this.maxhp * 0.25) {
		damcolor = "%c{orange}";
	}
	
	return damcolor;
};

SWORD.Creature.prototype.damageSeverityColor = function (damage) {
	var damcolor = "%c{yellow}";
	
	if (damage > this.maxhp * 0.5) {
		damcolor = "%c{orange}";
	}
	else if (damage > this.maxhp * 0.25) {
		damcolor = "%c{red}";
	}
	
	return damcolor;
};

SWORD.Creature.prototype.followPath = function () {
	var map = SWORD.game.map;
	
	coord = this.path.pop();
	
	map.tryMove(this, coord[0] - this.x, coord[1] - this.y);
};

SWORD.Creature.prototype.dijkstraToCreature = function (creature) {
	var dijsktra, map = SWORD.game.map;
	
	this.path = [];
	
	dijkstra = new ROT.Path.Dijkstra(this.x, this.y, map.passable.bind(map));
	dijkstra.compute(creature.x, creature.y, SWORD.buildPath.bind(this));
	
	this.path.pop();
};

SWORD.Creature.prototype.tryAttack = function (defender, dmg) {
	if (defender.shield > 0) {
		defender.shield--;
		
		SWORD.animateFlash([defender.x + "," + defender.y], "SHIELD", "#44f", "#004");
	}
	else {
		SWORD.game.message.newMessage({type: "attack", attacker: this, defender: defender, damage: dmg});
	
		defender.changeHP(-dmg);
	}
};

SWORD.Creature.prototype.randomWander = function () {
	SWORD.game.map.tryMove(this, Math.floor(ROT.RNG.getUniform() * 3) - 1, Math.floor(ROT.RNG.getUniform() * 3) - 1);
};