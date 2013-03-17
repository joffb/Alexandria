SWORD.terrains = {
	wall: {passable: false, symbol: "#", color: SWORD.midblue},
	floor: {passable: true, symbol: ".", color: SWORD.midblue},
	
	doorclosed: {passable: false, symbol: "+"},
	doorlocked: {passable: false, symbol: "+"},
	dooropen: {passable: true, symbol: "-"},
		
	upstairs: {passable: true, symbol: ".", color: "white"},
	downstairs: {passable: true, symbol: ">", color: "white"},
	
	corpse: {passable: true, symbol: "%", color: "#639"},
	
	sand: {passable: true, symbol: ",", color: "#cc4"},
};

SWORD.Map = function (w, h, dlevel) {
	var i, j, temp;
	
	this.w = w;
	this.h = h;
	this.dlevel = dlevel;
	this.data = {};
	this.seen = {};
	this.creatures = {};
	this.scrolls = {};
	this.fov = new ROT.FOV.DiscreteShadowcasting(this.passable.bind(this));
	this.noise = new ROT.Noise.Simplex();
	
	// make a basic map	
	this.gen = new ROT.Map.Digger(w, h);
	this.gen.create(this.setTile.bind(this));
	
	// initialize seen array
	for (j = 0; j < h; j++) {
		for (i = 0; i < w; i++) {
			this.seen[i + "," + j] = false;
		}
	}

	var coord,
		scrollcount = 7,
		creaturecount = 6 + dlevel,
		rooms = this.gen.getRooms(),
		assignments = [];
	
	assignments[0] = "entrance";
	assignments[rooms.length - 1] = "exit";
	
	for (i = 1; i < assignments.length - 1; i++) {
		assignments[i] = "normal";
	}
	

	
	// fill up the rooms depending on assignment
	// dungeon features
	for (i = 0; i < rooms.length; i++) {
		switch (assignments[i]) {

			case "entrance":
			
				// place entrance stairs
				coord = this.getRandomRoomCoord(rooms[i]);
				this.data[coord] = SWORD.terrains.upstairs;
				break;
		
			case "exit":

				// place exit stairs
				coord = this.getRandomRoomCoord(rooms[i]);
				this.data[coord] = SWORD.terrains.downstairs;
				break;
			
			default:
				break;
		}
	}

	// fill up the rooms with monsters
	for (i = 0; creaturecount > 0; i = (i + 1).mod(rooms.length)) {
		switch (assignments[i]) {
		
			case "normal":
				coord = this.getRandomRoomCoord(rooms[i]);
				this.addCreature(new SWORD.Creature(SWORD.randomMonster(dlevel)), coord);
					
				creaturecount--;
				break;
				
			case "exit":
				coord = this.getRandomRoomCoord(rooms[i]);
				if (this.data[coord] !== SWORD.terrains.downstairs) {
					this.addCreature(new SWORD.Creature(SWORD.randomMonster(dlevel)), coord);

					creaturecount--;
				}

				coord = this.getRandomRoomCoord(rooms[i]);
				if (this.data[coord] !== SWORD.terrains.downstairs) {
					this.addCreature(new SWORD.Creature(SWORD.randomMonster(dlevel)), coord);
					
					creaturecount--;
				}
				
				break;
			
			default:
				break;
		}
	}
	

	i = 8 + dlevel;
	while(i > 0) {
		this.placeScrollRandom(SWORD.randomScroll(dlevel));
		i--;
	}
};

SWORD.Map.prototype.setTile = function(x, y, wall) {
	var sand = (Math.abs(this.noise.get(x/18, y/18)) > 0.62),
		rnd = ROT.RNG.getUniform(),
		floor;

	if (rnd > 0.98) {
		floor = SWORD.terrains.corpse;
	}
	else if ((rnd > 0.96) || sand) {
		floor = SWORD.terrains.sand;
	}
	else {
		floor = SWORD.terrains.floor;
	}
	
	this.data[x + "," + y] = (wall === 1 ? SWORD.terrains.wall : floor);
};

// calling w/ one arg suggests string argument in "x,y" form
// callign w/ two args suggests two int arguments x and y
SWORD.Map.prototype.passable = function () {
	var offset;
	
	if (arguments.length === 2) {
		offset = arguments[0] + "," + arguments[1];
	}
	else if (arguments.length === 1) {
		offset = arguments[0];
	}
	else {
		return false;
	}
	
	if (this.data.hasOwnProperty(offset)) {
		return this.data[offset].passable;
	}
	else {
		return false;
	}
};


SWORD.Map.prototype.getRandomRoomCoord = function (room) {
	var x = room.getLeft() + Math.floor((room.getRight() - room.getLeft() + 1) * ROT.RNG.getUniform()),
		y = room.getTop() +  Math.floor((room.getBottom() - room.getTop() + 1) * ROT.RNG.getUniform());
	
	return x + "," + y;
};

SWORD.Map.prototype.placeFeatureRandom = function (feature) {
	var room = this.getRandomRoom();
	
	this.data[this.getRandomRoomCoord(room)] = feature;
};

SWORD.Map.prototype.addCreature = function (creature, coord) {
	var loc = SWORD.splitCoord(coord);
	
	this.creatures[coord] = creature;
	creature.x = loc.x;
	creature.y = loc.y;
};

SWORD.Map.prototype.deleteCreature = function (creature) {
	delete this.creatures[creature.x + "," + creature.y];
};

// function to randomly place the given scroll on the map
SWORD.Map.prototype.placeScrollRandom = function(scroll) {
	var x, y, offset, attempts = 0, done = false;
	
	while(!done) {
		
		x = Math.floor(this.w * ROT.RNG.getUniform());
		y = Math.floor(this.h * ROT.RNG.getUniform());

		offset = x + "," + y;
		
		if ((this.scrolls.hasOwnProperty(offset) === false) && (this.passable(offset))) {
			this.scrolls[offset] = scroll;
			done = true;
		}
		
		// make sure there's no infinite looping
		attempts++;
		if (attempts > this.w * this.h) {
			done = true;
		}
	}
	
	return scroll;
};

SWORD.Map.prototype.swapCreatures = function (a, b) {
	var temp_a = a,
		temp_b = b,
		temp_x = a.x,
		temp_y = a.y,
		creatures = this.creatures;
	
	delete creatures[a.x + "," + a.y];
	delete creatures[b.x + "," + b.y];
	
	a.x = b.x;
	a.y = b.y;
	
	b.x = temp_x;
	b.y = temp_y;
	
	creatures[a.x + "," + a.y] = a;
	creatures[b.x + "," + b.y] = b;
};

SWORD.Map.prototype.tryMove = function (creature, x, y) {
	var destination,
		creatures = this.creatures,
		scroll;
	
	destination = (creature.x + x) + "," + (creature.y + y);
	
	// check for a wall
	if (this.passable(destination) === false) {
		return false;
	}

	// check for another creature
	if (creatures[destination]) {
		/*// attack if they're on different sides
		if ((creatures[destination].team === "player") && (creature.team === "monster")) {
			creature.tryAttack(creatures[destination]);
			return true;
		}
		else {
			return false;
		}*/
		
		return false;
	}
	
	// if you're the player, pick up the scroll here
	scroll = this.scrolls[destination];
	if (scroll && (creature === SWORD.game.player)) {
		SWORD.game.inventory.addScroll(scroll);
		delete this.scrolls[destination];
	}

	// if there's nothing in the way, move to the destination
	delete creatures[creature.x + "," + creature.y];
	creatures[destination] = creature;
	creature.x += x;
	creature.y += y;
	return true;
};

SWORD.Map.prototype.eachCreature = function (f) {
	var i;
	
	for (i in this.creatures) {
		if (this.creatures.hasOwnProperty(i)) {
			f(this.creatures[i]);
		}
	}
};

SWORD.Map.prototype.getCoordsInFov = function (creature, range) {
	var coords = [];
	
	this.fov.compute(creature.x, creature.y, range, function(x, y, r) {
		coords.push(x + "," + y);
	});
	
	return coords;
};


SWORD.Map.prototype.a_adjacent_b = function (a, b) {
	var i, j, found = false;
	
	for (i = b.x - 1; i < b.x + 2; i++) {
		for (j = b.y - 1; j < b.y + 2; j++) {
			if (this.creatures[i+","+j] === a) {
				found = true;
			}
		}
	}
	
	return found;
};

SWORD.Map.prototype.getCreaturesAdjacentTo = function () {
	var x, y, i, j, offset, found = [];
	
	if (arguments.length === 1) {
		offset = arguments[0].split(",");
		x = parseInt(offset[0]);
		y = parseInt(offset[1]);
	}
	else if (arguments.length === 2) {
		x = arguments[0];
		y = arguments[1];
	}
	else {
		return found;
	}
	
	
	for (i = x - 1; i < x + 2; i++) {
		for (j = y - 1; j < y + 2; j++) {
		
			offset = i + "," + j;
			
			if (this.creatures.hasOwnProperty(offset)) {
				found.push(this.creatures[offset]);
			}
		}
	}
	
	return found;
};