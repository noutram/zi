var utils = require('utils');

//Tally of players and zombies
var numberOfHumans = 0;
var numberOfZombies = 0;

var zombieString = "Z";
var humanString = "H";

//Dictionary of players and their status
var players = {};

//All players currently on the server
function allPlayersOnServer() {
	return utils.players();
}

//Message all players
function messageAllPlayers(msg) {
	var pls = allPlayersOnServer();
	for (p in pls) {
		echo(p, msg);
	}
}

//Called after a refresh
function addAllOnlinePlayersAsHuman() {
	//Clear list
	players = {};

	//Reset number of humans and zombies
	numberOfHumans = 0;
	numberOfZombies = 0;

	//Get list of all online players
	var plist = allPlayersOnServer();
	
	//Make everyone human
	plist.forEach( function f(e) {
		makeHuman(e);
	});
}

//Make a player a human
function makeHuman( player ) {
	print("Making " + player.name + " human");
	echo(player, "You are currently human");
	players[player.name] = humanString;
	//Update count
	numberOfHumans++;
};

//Convert a human to a zombie
function makeZombie( player ) {
	//Validation check
	if ( players[player.name] != humanString ) {
		return;
	}

	//Update count
	numberOfZombies++;
	numberOfHumans--;
	
	//Change status
	print("Making " + player.name + " zombie");
	echo(player, "You are now a ZOMBIE");
	players[player.name] = zombieString;
};

//Query zombie status
function amIZombie( player ) {
	if (players[player.name] == zombieString) {
		return true;
	} else {
		return false;
	}
};
//Query human status
function amIHuman( player ) {
	if (players[player.name] == humanString) {
		return true;
	} else {
		return false;
	}
};

//Player exists
function playerExists( player ) {
	if (players[player.name]) {
		return true;
	} else {
		return false;
	} 
};

//Remove the player attribute
function deletePlayer( player ) {

	//Update the counts
	if (players[player.name] == zombieString) {
		numberOfZombies--;
		print("Number of zombies is now " + numberOfZombies);
	} else {
		numberOfHumans--;
		print("Number of humans is now " + numberOfHumans);			
	}

	//Console message
	print("player " + player.name + " is being removed from the game");

	//Remove from players object
	delete(players[player.name]);
};

function numberOfPlayers() {
	return Object.keys(players).length;
};

function playerStatus() {
	var NP = numberOfPlayers();
	print('Number of players: ' + NP);
	for (pl in players) {
		print(pl + " is " + players[pl]);
	}
};

exports.addAllOnlinePlayersAsHuman = addAllOnlinePlayersAsHuman;
exports.makeHuman = makeHuman;
exports.makeZombie = makeZombie;
exports.amIZombie = amIZombie;
exports.amIHuman = amIHuman;
exports.playerExists = playerExists;
exports.numberOfPlayers = numberOfPlayers;
exports.playerStatus = playerStatus;
exports.deletePlayer = deletePlayer;
exports.messageAllPlayers = messageAllPlayers;