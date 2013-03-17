SWORD.MessageSystem = function () {
	this.max_messages = 40;
	this.messages = [];
};

SWORD.MessageSystem.prototype.newMessage = function (message) {
	this.messages.push(new SWORD.MessageContainer(message));
	
	if (this.messages.length > this.max_messages) {
		this.messages.splice(0, 1);
	}
};

SWORD.MessageSystem.prototype.latestMessages = function (num) {
	var i, ret = [], len = this.messages.length;
	
	// return if there are no messages
	if (len === 0) {
		return [];
	}
	
	// if the number of messages required isn't specified, give them all
	if (typeof num === "undefined") {
		num = len;
	}
	
	// if there are more messages asked for than there are actual messages
	// then set number of messages asked for to the total number of messages
	if (num > len) {
		num = len;
	}
	
	for (i = len - 1; i > len - num - 1; i--) {
		ret.push(this.messages[i]);
	}
	
	return ret;
};

SWORD.MessageContainer = function (message) {
	this.message = message;
}

//
//	SHORT MESSAGES
//



// returns an array of text messages
SWORD.MessageContainer.prototype.shortText = function () {
	var i, len, ret = [], message = this.message;
		
	switch (message.type) {
	
		case "scroll pickup":
			len = message.scroll.spells.length;

			ret.push("? %c{#55D}" + message.scroll.spells[0]);
			
			for (i = 1; i < len; i++) {				
				ret.push("%c{#000}++%c{#55D}" + message.scroll.spells[i]);
			}
	
			break;
		
		case "scroll use":
			ret.push(text = "%b{#44c}%c{#fff}* " + message.spell);
			break;
		
		case "attack":
			ret.push(message.attacker.healthColor() + message.attacker.symbol + "%c{#aaa} hits " + message.defender.healthColor() + message.defender.symbol + 
			" " + message.defender.damageSeverityColor(message.damage) + message.damage);
			break;
			
		case "heal":
			ret.push(message.creature.healthColor() + message.creature.symbol + " heal " + message.health);
			break;
		
		case "death":
			ret.push("%c{f11}%b{300} " + message.creature.symbol + " dies");
			break;
			
		case "illiterate":
			ret.push("%c{f80}@ CAN'T READ");
			break;
	
		case "not illiterate":
			ret.push("%c{0f0}@ CAN READ");
			break;
		
		case "cursed scroll":
			ret.push("%c{f80}? CURSED:");
			ret.push("%c{f80}- " + message.scroll.spells[0]);
			
			break;
			
		case "upgrade":
			text = "^ " + message.scroll.spells[0];
			
			ret.push(text);
			break;
			
		case "obsessed":
			ret.push("%c{f80}@ OBSESSED");
			break;
			
		default:
			break;
	}

	return ret;
}


//
//	LONG MESSAGES
//



// returns an array of text messages
SWORD.MessageContainer.prototype.longText = function () {
	var i, len, ret = [], message = this.message, text;
		
	switch (message.type) {
	
		case "scroll pickup":
			
			text = "%c{#66E}Got %c{fff}" + message.scroll.quality + " " + message.scroll.type + " of " + message.scroll.spells[0];
			
			len = message.scroll.spells.length;
			for (i = 1; i < len; i++) {				
				text += ", " + message.scroll.spells[i];
			}
			
			ret.push(text);
	
			break;
		
		case "scroll use":
			text = "%c{#66E}You read %c{fff}" + message.scroll.type + " of " + message.spell;
			
			if (message.scroll.uses === 0) {
				text += "%c{#66E}, it disintegrated";
			}
			
			ret.push(text);
			break;
		
		case "attack":
			ret.push(message.attacker.healthColor() + message.attacker.name + "%c{#fff} hits " + message.defender.healthColor() + message.defender.name + 
			"%c{fff} for " + message.defender.damageSeverityColor(message.damage) + message.damage);
			break;
			
		case "heal":
			ret.push(message.creature.healthColor() + message.creature.name + " healed for " + message.health);
			break;
		
		case "death":
			ret.push("%c{f11}" + message.creature.name + " dies");
			break;
			
		case "illiterate":
			ret.push("%c{f80}You can't read scrolls.");
			break;
	
		case "not illiterate":
			ret.push("%c{0f0}You can read again.");
			break;
		
		case "cursed scroll":
			text = "%c{f80}Your %c{fff}" + message.scroll.type + " of " + message.scroll.spells[0];
			
			len = message.scroll.spells.length;
			for (i = 1; i < len; i++) {				
				text += ", " + message.scroll.spells[i];
			}
			
			text += "%c{f80} was cursed by %c{fff}" + message.attacker.name;
			
			ret.push(text);
	
			break;
			
		case "curse fail":
			ret.push(message.attacker.name + "%c{f80} failed to curse your scrolls");
			break;
			
		case "unlocked":
			ret.push("%c{f33}Door unlocked");
			break;
			
		case "upgrade":
		
			text = "%c{f80}Your %c{fff}" + message.scroll.type + " of " + message.scroll.spells[0];
			
			len = message.scroll.spells.length;
			for (i = 1; i < len; i++) {				
				text += ", " + message.scroll.spells[i];
			}
			
			text += "%c{f80} was upgraded to %c{fff}" + message.scroll.quality;
			ret.push(text);
			break;
			
		case "scroll no effect":
			ret.push("%c{f80}Your %c{fff}" + message.scroll.quality + " " + message.scroll.type + " of " + message.scroll.spells[0] + "%c{f80} had no effect.");
			break;
		
		case "stairs down":
			ret.push("You follow the stairs down...");
			break;
		
		case "obsessed":
			ret.push("%c{f80}Player obsessed with casting " + message.scroll.spells[message.spell]);
			break;
			
		case "start":
			ret.push("Press ? for help")
			ret.push("You tumble down into the labyrinthine library...");
			break;
		
		default:
			break;
	}

	return ret;
}