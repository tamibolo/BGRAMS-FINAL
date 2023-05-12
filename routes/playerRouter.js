// /getBoard - get the board of any player
// pass in the player ID and the game ID
// return a list of tiles (tile_id, letter, x, y)

// /newPlayer - add a player to the DB, return the player ID
// pass in the player name
// return the player ID

const express = require('express');
const playerRouter = express.Router({ mergeParams: true });
const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient();


// /joinGame - add a player to a game
// pass in the player ID and the game ID
// return confirmation (status 200)

playerRouter.post('/joinGame', async function joinGame(req, res) {
    const { playerName, gameId } = req.body;
    // prisma query for games matching that id
    if (playerName && gameId) {
        let player = await prisma.player.create({
            data: {
                name: playerName,
                gameId
            }
        })
        if (player?.id) {
            res.status(200).json(player)
        } else {
            res.status(404).json({ error: "Unable to add player" })
        }
    }
    else {
        res.status(404).json({ error: "Missing player name or incorrect gameId" })
    }
})
module.exports = playerRouter
