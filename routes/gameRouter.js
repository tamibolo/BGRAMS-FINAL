

const express = require('express')
const gameController = require('../controllers/gameController')
const gameRouter = express.Router({ mergeParams: true })
const path = require("path");

gameRouter.post('/newGame', gameController.newGame)

gameRouter.get('/listGames', gameController.listGames)


gameRouter.post('/split', gameController.splitGame)

gameRouter.post('/getNewHand', gameController.getNewHand)



// gameRouter.post('/placeTiles', gameController.postTiles)

// gameRouter.get('/peel', gameController.peel)

// gameRouter.get('/dump', gameController.dump)

gameRouter.get('/getUpdate', gameController.getUpdate)

gameRouter.post('/bananas', gameController.bananas)



// : gameId / player /: playerId
gameRouter.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../Index.html"))
})



// /newGame - create a new game and set of tiles
// pass in the game name
// return the game ID

// /listGames - return a list of games
// no arguments to pass in
// return a list of game names and IDs


// /joinGame - add a player to a game
// pass in the player ID and the game ID
// return confirmation (status 200)
// /split - start a game (mark in the BD as in progress)
// pass in the game ID
// return confirmation (status 200)
// /getNewHand - return 21 random tiles from a game to a player (optional)
// pass in the player ID and the game ID
// return an array of 21 tiles (tile_id, letter)
// /getNewTiles - return N random tiles from a game to a player
// pass in the player ID, the game ID, and the number of tiles needed
// return a tile array
// [{id: 2003, letter: "A"}, {id: 2014, letter: "D"}, ...]

// /placeTile - set the x, y, and status of a tile in the DB
// pass in the tile ID, the x, the y, and the status
// return confirmation (status 200)

// /peel - return a random tile from a game to a player, signal to all players that a peel has happened
// pass in the player ID and the game ID
// return a tile (tile_id, letter)

// /dump - mark the given tile as back in the bunch and return 3 new random tiles to the player
// pass in the player ID, the game ID, and the tile ID
// return a list of 3 tiles (tile_id, letter)

// /getUpdate - return the current game state
// pass in the player ID, the game ID
// return the game state (peel count, bananas). If someone has called bananas, return the "winners" player ID so that the client can request the winners board.

// /bananas - end the game, show the "winners" board
// pass in the player ID and the game ID
// return confirmation (status 200)
module.exports = gameRouter
