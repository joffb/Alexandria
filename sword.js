var SWORD = {
	verydarkblue: "#002",
	darkblue: "#113",
	midblue: "#44C",
	animate: null,
};

SWORD.splitCoord = function (coord) {
	var xy = coord.split(",");
	
	return {x: parseInt(xy[0]), y: parseInt(xy[1])};
}