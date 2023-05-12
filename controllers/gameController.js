
const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient();

const { GAME_STATUS, TILE_STATUS } = require("../server-common");


const letters = ["A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "A",
    "B", "B", "B",
    "C", "C", "C",
    "D", "D", "D", "D", "D", "D",
    "E", "E", "E", "E", "E", "E", "E", "E", "E", "E", "E", "E", "E", "E", "E", "E", "E", "E",
    "F", "F", "F",
    "G", "G", "G", "G",
    "H", "H", "H",
    "I", "I", "I", "I", "I", "I", "I", "I", "I", "I", "I", "I",
    "J", "J",
    "K", "K",
    "L", "L", "L", "L", "L",
    "M", "M", "M",
    "N", "N", "N", "N", "N", "N", "N", "N",
    "O", "O", "O", "O", "O", "O", "O", "O", "O", "O", "O",
    "P", "P", "P",
    "Q", "Q",
    "R", "R", "R", "R", "R", "R", "R", "R", "R",
    "S", "S", "S", "S", "S", "S",
    "T", "T", "T", "T", "T", "T", "T", "T", "T",
    "U", "U", "U", "U", "U", "U",
    "V", "V", "V",
    "W", "W", "W",
    "X", "X",
    "Y", "Y", "Y",
    "Z", "Z"]


// /newGame - create a new game and set of tiles
// pass in the game name
// return the game ID

// Tiles are in one of three states.
// ○ In the bunch (not visible to the players) ○ In a player’s “hand”
// ○ On the board
function getTileCount(playerCount) {
    if (playerCount <= 4) {
        return 21;
    } else if (playerCount <= 6) {
        return 15
    } else if (playerCount <= 8) {
        return 11;
    } else {
        return 21;
    }
}
const newGame = async (req, res) => {
    const { name } = req.body;
    console.log("inside new Game", req.body);

    const newGame = await prisma.game.create({
        data: {
            name,
        }
    })
    if (newGame?.id) {
        let valueString = "";
        for (let index = 0; index < letters.length; index++) {
            valueString += `(${newGame.id},'bunch','${letters[index]}')${index < letters.length - 1 ? "," : ";"}`;
        }
        const query = `Insert into Tile("gameId", "status", "letter") values${valueString}`;
        const updatedRows = await prisma.$executeRawUnsafe(`${query}`);
    }
    res.status(201).json(newGame.id)

}

async function listGames(req, res) {
    res.status(200).json(await prisma.game.findMany({
        include: {
            players: true
        }
    }))
}

async function splitGame(req, res) {
    const { gameId } = req.body;
    const updatedGame = await prisma.game.update({
        where: {
            id: gameId
        },
        data: {
            status: "in_progress"
        }
    })
    if (updatedGame?.status === GAME_STATUS.InProgress) {
        res.status(201).json(updatedGame);
    } else {
        res.status(500).json({ error: "Unable to start game" })
    }
}

async function getUpdate(req, res) {
    const { gameId, playerId } = req.query;
    const game = await prisma.game.findFirst({
        where: {
            id: Number(gameId)
        },
        include: {
            players: {
                select: {
                    id: true,
                    tiles: true,
                    name: true
                }
            },
            tiles: {
                where: {
                    status: TILE_STATUS.Bunch
                }
            },
            _count: {
                select: {
                    players: true
                }
            }
        }
    })
    res.status(200).json(game);
}
async function getPlayersCountInGame(gameId) {
    const game = await prisma.game.findFirst({
        where: {
            id: Number(gameId),
        },
        include: {
            _count: {
                select: {
                    players: true
                }
            }
        }
    })
    return game?._count?.players;
}
async function getNewTiles({ gameId, playerId, count }) {
    const tiles = await getRandomTiles(count, gameId);
    if (tiles?.length) {
        return updatePlayerTiles(tiles, playerId);
    }
    return null;
}

function updatePlayerTiles(tiles, playerId) {
    return prisma.tile.updateMany({
        where: {
            id: {
                in: Array.from(tiles, tile => tile.id)
            }
        },
        data: {
            playerId,
            status: "hand"
        }
    });
}

async function getNewHand(req, res) {
    const { gameId, playerId } = req.body;
    const playerCount = await getPlayersCountInGame(gameId);
    const tiles = await getRandomTiles(getTileCount(playerCount), gameId);
    if (tiles?.length) {
        const data = await updatePlayerTiles(tiles, playerId);
        if (data) {
            res.status(201).json(data);
        }
    }
}



function getRandomTiles(count, gameId) {
    return prisma.$queryRaw`SELECT id FROM tile WHERE gameId = ${gameId} AND status = 'bunch' ORDER BY RANDOM() LIMIT ${count};`
}
async function updatePeelCount(gameId) {

    return prisma.game.update({
        where: {
            id: gameId
        },
        data: {
            peels: {
                increment: 1
            }
        },
        select: {
            peels: true
        }
    })
}

async function bananas(req, res) {
    const { playerId, gameId } = req.body;
    const game = await prisma.game.update({
        where: {
            id: gameId
        },
        data: {
            winnerId: playerId,
            status: GAME_STATUS.Finished
        }
    });
    if (game?.status === GAME_STATUS.Finished) {
        res.status(201).json(game);
    } else {
        res.status(400).json({ error: "Error while setting winner" })
    }
}
// /listGames - return a list of games
// no arguments to pass in
// return a list of game names and IDs
// app.get("/listGames", async (req, res) => {
//     //prisma query for games matching unfinished
//     res.status(200);
//     res.json(await prisma.game.findMany({
//         include: {
//             players: true
//         }
//     }))
// })



// app.get("/joinGame", async (req, res) => {

// })

// // /split - start a game (mark in the BD as in progress)
// // pass in the game ID
// // return confirmation (status 200)
// app.get("/split", async (req, res) => {
//     const { id } = req.params

// })

// // /getNewHand - return 21 random tiles from a game to a player (optional)
// // pass in the player ID and the game ID
// // return an array of 21 tiles (tile_id, letter)
// app.get("/getNewHand", async (req, res) => {

// })

// // /getNewTiles - return N random tiles from a game to a player
// // pass in the player ID, the game ID, and the number of tiles needed
// // return a tile array
// // [{id: 2003, letter: "A"}, {id: 2014, letter: "D"}, ...]
// app.get("/getNewTiles", async (req, res) => {

// })

// // /placeTile - set the x, y, and status of a tile in the DB
// // pass in the tile ID, the x, the y, and the status
// // return confirmation (status 200)
// app.get("/placeTile", async (req, res) => {

// })

// // /peel - return a random tile from a game to a player, signal to all players that a peel has happened
// // pass in the player ID and the game ID
// // return a tile (tile_id, letter)
// app.get("/peel", async (req, res) => {

// })

// // /dump - mark the given tile as back in the bunch and return 3 new random tiles to the player
// // pass in the player ID, the game ID, and the tile ID
// // return a list of 3 tiles (tile_id, letter)
// app.get("/listGames", async (req, res) => {

// })

// // /getUpdate - return the current game state
// // pass in the player ID, the game ID
// // return the game state (peel count, bananas). If someone has called bananas, return the "winners" player ID so that the client can request the winners board.
// app.get("/dump", async (req, res) => {

// })

// // /bananas - end the game, show the "winners" board
// // pass in the player ID and the game ID
// // return confirmation (status 200)
// app.get("/bananas", async (req, res) => {

// })


module.exports = {
    listGames, newGame, splitGame, getUpdate, getNewHand, getNewTiles, updatePeelCount, bananas
}