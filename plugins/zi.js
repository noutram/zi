var utils = require('utils');
var ziPlayers = require('ZI/ZIPlayers');

// Game parameters
var playersNeeded = 2;
var zombiesPerGame = 1;

//Game state
var gameInState = {
	"WAITINGFORPLAYERS" : 0,		//waiting to get enough players
	"STARTING" : 1,					//Zombies are secretly allocated, countdown
	"STARTED" : 2,					//Game has stated
	"CELEBRATING" : 3				//Winner announced, countdown
};
var gameState = gameInState["WAITINGFORPLAYERS"];


//Countdown function
function countDown(count) {
	print("countdown: count = " + count);
	ziPlayers.messageAllPlayers("Game starting in " + count);
	
	if (count == 0) {
		//Time up
		if (ziPlayers.numberOfPlayers() >= 	playersNeeded) {
			gameState = gameInState["STARTED"];
		} else {
			gameState = gameInState["WAITINGFORPLAYERS"];
		}
		updateGameState();
		return;
	} 
	
	//Every second, call again
	setTimeout( function() {
		countDown(count-1);
	}, 1000);
		
}

//FSM State transitions
function updateGameState() {

	switch (gameState) {
	
		case gameInState["WAITINGFORPLAYERS"]:		
			if (ziPlayers.numberOfPlayers() >= 	playersNeeded) {
				gameState = gameInState["STARTING"];
			}
			break;
		case gameInState["STARTING"]:
			
			break;

		case gameInState["STARTED"]:
			
			break;

		case gameInState["CELEBRATING"]:
			break;		
		default:
			gameState = gameInState["WAITINGFORPLAYERS"];
			break;
	}
	
	//Now the Moore outputs
	gameStateOutputs();
	
};

//Moore outputs for the FSM
function gameStateOutputs() {
	switch (gameState) {
	
		case gameInState["WAITINGFORPLAYERS"]:
			print("Waiting for players to join");
			break;

		case gameInState["STARTING"]:
			print("Game starting soon");
			countDown(30);
			break;

		case gameInState["STARTED"]:
			print("Game on!");
			break;

		case gameInState["CELEBRATING"]:
			print("And the winner is?");
			break;
					
		default:
			print("Error - illegal state");
			break;

	}
};


//***************Called when the plugin is loaded or refreshed***************
function startup( plugin ) {
	print("********** event: startup **********");
	ziPlayers.messageAllPlayers("Welcome to infection!");
	
	print("initialising infection");
	//Reset game state
 	gameState = gameInState["WAITINGFORPLAYERS"];

	//Add any players already online as human
	ziPlayers.addAllOnlinePlayersAsHuman();
	gameStateOutputs();
	updateGameState();     
};

events.pluginEnable(startup);
//****************************************************************************




//***************Event handler for player joining***************
//Very much depends on game-state 
function playerJoined( event ) {
	print("********** event: playerJoined **********");
	print("GameState: " + gameState);
	
	var pl = event.player;
	echo(pl, "Welcome to infection");

	//Game state dictates type of player
	if (gameState == gameInState["STARTED"]) {
		print("A player " + pl.name + " has joined mid game");
		print("Current list: ", utils.players());
		
		//Is this a new player?
		if (!ziPlayers.playerExists(pl)) {
			print("Making joining player " + pl.name + " a zombie");
			ziPlayers.makeZombie(pl);
		} else {
			echo(pl, "Welcome back");
		}
				
	} else {
		ziPlayers.makeHuman(pl);
	}
		
	//Update state 
	updateGameState();

};

events.playerJoin(playerJoined);
//**************************************************************





//***************Event handler for player leaving***************
//Depends on state
function playerLeft( event, cancel ) {
	print("********** event: playerLeft **********");
	
	var pl = event.player;
	print("Player " + pl.name + " left");
	ziPlayers.deletePlayer(pl);	
	updateGameState();

};
events.on(Packages.org.bukkit.event.player.PlayerQuitEvent, playerLeft);

//*************************************************************************************

//When one entity kills another

function killEvent(event)
{
	print("********** event: killEvent **********");

	var entity = event.getEntity();
	var killer = entity.getKiller();
	var cause = entity.getLastDamageCause();
	
	print(entity + " was killed");	
	print("Killer is " + killer);

	var entityName = entity.name;
	var killerName = killer.name;
	
	//Has a player been killed?
	if (!zi.playerExists(entity)) {
		print("Non player killed");
		return;
	}
	
	if (gameState != gameInState["STARTED"]) {
		print("Killed out of game");
	}
	
	//GAME HAS STARTED
	
	//Scenario 1: Zombie Kills Human
	if (ziPlayers.amIZombie(killer) && ziPlayers.amIHuman(entity)) {
		print("Zombie " + killerName + " has zombified " + entityName);
		ziPlayer.makeZombie(entity);
	}
	//Scenario 2: Human Kills Human
	else if (ziPlayers.amIHuman(killer) && ziPlayers.amIHuman(entity)) {
		print("Human " + killerName + " has killed human" + entityName);
		ziPlayer.makeZombie(killer);
		echo(killer, "Killing another human is an unforgivable curse! You shall be forever zombie");
	}		
	//Scenario 3: Zombie killed a Zombie
	else if (ziPlayers.amIZombie(killer) && ziPlayers.amIZombie(entity)) {
		print("Zombie " + killerName + " has killed zombie" + entityName);
		echo(killer, "Killing another zombie is illogical");
	}	
	//Scenario 4: Human killed a Zombie
	else if (ziPlayers.amIHuman(killer) && ziPlayers.amIZombie(entity)) {
		print("Human " + killerName + " has killed zombie" + entityName);
		echo(killer, "Killing a zombie makes you a great warrior.. but it will be back");
	}	
	//Catchup
	else {
		print("Other cause of death");
		echo(entity, "Death during the game can only mean eternal zombyness");
		ziPlayer.makeZombie(killer);
	}
	
	updateGameState();
			
};

events.on(Packages.org.bukkit.event.entity.PlayerDeathEvent, killEvent);
//**************************************************************************************




//Function for monitoring at the console
function watchdog() {
	print("ping");
	ziPlayers.playerStatus();
	setTimeout(watchdog, 30000);		
}
//watchdog();



// ************************** ADMIN COMMANDS **************************
function ziStart() {
	gameState = gameInState["STARTED"];
	updateGameState();
}
function ziStop() {
	gameState = gameInState["WAITINGFORPLAYERS"];
	updateGameState();
}
function makeZombie( playerName ) {
	var player = utils.player(playerName);
	if (player) {
		ziPlayers.makeZombie(player);
	}
}
function makeHuman( playerName ) {
	var player = utils.player(playerName);
	if (player) {
		ziPlayers.makeHuman(player);
	}
}

exports.ziStart = ziStart;
exports.ziStop = ziStop;
exports.makeZombie = makeZombie;
exports.makeHuman = makeHuman;

// TODO - does playerLeft get called when killed? If so, that's a bug
