const express = require('express');
const tileRouter = express.Router({ mergeParams: true });
const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient();
const gameController = require("../controllers/gameController");
const { TILE_STATUS } = require('../server-common');

tileRouter.post("/place", async (req, res) => {
    const { tileId: id, rowIndex, colIndex, status } = req.body;
    const updatedTile = await prisma.tile.update({
        where: {
            id
        },
        data: {
            rowIndex,
            colIndex,
            status
        }
    })
    if (updatedTile) {
        res.status(201).json(updatedTile)
    } else {
        res.status(400).json({ error: "Unable to updated" })
    }

})

tileRouter.post("/peel", async (req, res) => {
    const { gameId, playerId, count = 1 } = req.body;
    const updatedTiles = await gameController.getNewTiles({ count, playerId, gameId });
    if (updatedTiles?.count) {
        const game = await gameController.updatePeelCount(gameId);
        if (game?.peels) {
            res.json(updatedTiles);
        } else {
            res.status(400).json({ error: "Unable to update peel count in game" });
        }
    } else {
        res.status(400).json({ error: "Unable to peel new tile" })
    }
})

tileRouter.post("/dump", async (req, res) => {
    const { playerId, tileId, gameId } = req.body;
    const dumpedTile = await prisma.tile.update({
        where: {
            id: tileId
        },
        data: {
            status: TILE_STATUS.Bunch,
            playerId: null
        }
    });
    if (dumpedTile?.status === TILE_STATUS.Bunch) {
        const newTiles = await gameController.getNewTiles({ count: 3, playerId, gameId });
        if (newTiles?.count === 3) {
            res.status(201).json(newTiles)
        } else {
            res.status(400).json({ error: "Unable to get new tiles from bunch" })
        }
    } else {
        res.status(400).json({ error: "Unable to dump tile" })
    }
})

tileRouter.post("/newTile", async (req, res) => {
    const { gameId, playerId, count = 1 } = req.body;
    const newTiles = await gameController.getNewTiles({ count, playerId, gameId });
    if (newTiles?.count) {
        res.status(201).json(newTiles)
    } else {
        res.status(400).json({ error: "Unable to get new tile" })
    }
})

module.exports = tileRouter;