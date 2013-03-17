// SWORD.newgame
SWORD.Game = function () {
	var i;
	
	this.state = "start";
	
	this.engine = new ROT.Engine();
	this.message = new SWORD.MessageSystem();
	
	this.player = SWORD.newPlayer();
	this.inventory = new SWORD.Inventory();
	this.swap = null;
	
	this.dlevel = 1;
	this.changeToMap(this.dlevel);
};

SWORD.Game.prototype.changeToMap = function (dlevel) {
	var i, xy, creatures;

	this.engine.clear();
	
	// create map
	this.map = new SWORD.Map(68, 22, dlevel);

	this.engine.addActor(this.player);
	
	// add the creatures from the map to the engine
	creatures = this.map.creatures;
	for (i in creatures) {
		if (creatures.hasOwnProperty(i)) {
			this.engine.addActor(creatures[i]);
		}
	}
	
	// place player on upstairs to begin with
	for (i in this.map.data) {
		if (this.map.data.hasOwnProperty(i)) {
			if (this.map.data[i] === SWORD.terrains.upstairs) {
				xy = i.split(",");
				
				this.map.creatures[i] = this.player;
				this.player.x = parseInt(xy[0]);
				this.player.y = parseInt(xy[1]);
			}
		}
	}
	

}