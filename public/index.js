// 1- board
// 2- the player tiles
// 3- the pool of tiles
// 4- current turn
// 5- player info

const searchParams = new URLSearchParams(location.search);
const gameId = Number(searchParams.get("gameId"));
const playerId = Number(searchParams.get("player"));

//const player1 = localStorage.getItem("name")
const gameMode = localStorage.getItem("mode")

//<span class="tile">A</span>
const letterTemplate = ({ letter, id, status, rowIndex, colIndex }) => {
    const game = JSON.parse(sessionStorage.getItem(StorageKey));
    const tileElement = document.createElement("span");
    tileElement.id = id;
    tileElement.setAttribute("class", "tile");
    tileElement.setAttribute("draggable", game?.status === GAME_STATUS.InProgress ? "true" : "false");
    tileElement.addEventListener("dragstart", dragTile)
    tileElement.addEventListener("dragend", onDragEnd)
    tileElement.innerHTML = letter
    tileElement.setAttribute("row", rowIndex)
    tileElement.setAttribute("col", colIndex)
    tileElement.setAttribute("status", status)
    tileElement.addEventListener("click", onTileClick)
    return tileElement;
}
function dragTile(event) {
    event.target.classList.add("selected");
    event.dataTransfer.setData("text", event.target.id);
}
function onDragEnd(event) {
    event.target.classList.toggle("selected");
}

function allowDrop(event) {
    event.preventDefault();
    event.target.classList.add("target");

}

function onTileClick(event) {
    const game = JSON.parse(sessionStorage.getItem(StorageKey));
    if (game?.status === GAME_STATUS.InProgress) {
        const tile = event.target;
        const existingSelection = document.querySelector(".tile.selected");
        if (existingSelection) {
            existingSelection.classList.toggle("selected");
        }
        tile.classList.add("selected");
        enableButton("btn-dump");
    }
}


async function drop(event, area = TILE_STATUS.Board) {
    event.preventDefault();
    let tileId = event.dataTransfer.getData("text");
    let container = event.target;
    container.appendChild(document.getElementById(tileId));
    const rowIndex = area === TILE_STATUS.Board ? Number(container.getAttribute("row")) : null;
    const colIndex = area === TILE_STATUS.Board ? Number(container.getAttribute("col")) : null;
    const status = area === TILE_STATUS.Board ? TILE_STATUS.Board : TILE_STATUS.Hand;
    await placeTile({ tileId: Number(tileId), status, rowIndex, colIndex })
    container.classList.remove("target");
    loadGameForPlayer();
}

function dragLeave(event) {
    event.target.classList.toggle("target");
}

function createTileContainers() {
    const board = document.querySelector(".board");
    board.innerHTML = "";
    let innerHtml = "";
    for (let rowIndex = 0; rowIndex < 12; rowIndex++) {
        for (let colIndex = 0; colIndex < 12; colIndex++) {
            innerHtml += `<span id="row_${rowIndex}_col_${colIndex}" ondrop="drop(event)" ondragover="allowDrop(event)" ondragleave="dragLeave(event)" class="tile-container" row="${rowIndex}" col="${colIndex}"></span>`
        }
    }
    board.innerHTML = innerHtml;
}

async function onSplitClick(event) {
    const updatedGame = await splitGame(gameId);
    console.log(updatedGame);
    if (updatedGame?.status === GAME_STATUS.InProgress) {
        disableButton(event.target.id);
        await getNewHand(gameId, playerId);
        loadGameForPlayer();
    }
}
async function checkForUpdateInPeels(updatedGame, existingGame) {
    if (updatedGame?.peels > existingGame?.peels) {
        await getNewTile({ playerId, gameId, count: updatedGame.peels - existingGame.peels });
        return true
    }
    return false;
}
async function checkForGameUpdates() {
    const game = await getUpdate(gameId, playerId);
    let changeDetected = false;
    const existingGame = JSON.parse(sessionStorage.getItem(StorageKey));
    if (game?.status === GAME_STATUS.InProgress) {
        let { players } = game;
        const player = players.find(player => player.id === playerId);
        // check whether split happened on another player's board
        if (player?.tiles?.length === 0) {
            // draw tiles for player
            console.log(await getNewHand(gameId, playerId));
            changeDetected = true;
        }
        changeDetected = await checkForUpdateInPeels(game, existingGame) || changeDetected;

    }
    if (game?._count.players !== existingGame?._count.players) {
        changeDetected = true;
    }
    if (game.status !== existingGame.status) {
        changeDetected = true;
    }
    if (changeDetected) {
        loadGameForPlayer();
    }
}
function createPlayerHand(tiles) {
    const playerHand = document.querySelector(".player-hand")
    playerHand.innerHTML = "";
    for (let tile of tiles) {
        let tileElement = letterTemplate(tile);
        playerHand.appendChild(tileElement)
    }
}
function placeTilesOnBoard(tiles) {
    if (tiles?.length) {
        for (let tile of tiles) {
            let tileElement = letterTemplate(tile);
            const container = document.querySelector(`#row_${tile.rowIndex}_col_${tile.colIndex}.tile-container`);
            container.appendChild(tileElement)
        }
    }
}
function disableButton(buttonId) {
    const button = document.getElementById(buttonId);
    button.setAttribute("disabled", "");
}
function enableButton(buttonId) {
    const button = document.getElementById(buttonId);
    button.removeAttribute("disabled");
}
const StorageKey = `game_${gameId}_player_${playerId}`;

async function loadGameForPlayer() {
    const game = await getUpdate(gameId, playerId);
    const player = game?.players.find(player => player.id === playerId);

    sessionStorage.setItem(StorageKey, JSON.stringify(game));
    const peelCount = document.querySelector("#peel-count");
    peelCount.textContent = game?.peels ?? 0;
    createTileContainers();
    disableButton("btn-peel");
    disableButton("btn-split");
    disableButton("btn-bananas")
    if (player?.name) {
        document.getElementById("player-name").textContent = `${player.name}'s hand`;
    }
    if (game?._count?.players) {
        document.getElementById("player-count").textContent = game?.players.map(p => p.name).join(", ")
    }
    if (game?.status === GAME_STATUS.Created) {
        enableButton("btn-split");
    }
    if (game?.status === GAME_STATUS.Finished) {
        document.querySelector(".winner")?.classList.toggle("winner")
        document.querySelector("#winner-name").textContent = game.players.find(p => p.id === game.winnerId)?.name ?? ""
        const tilesOnBoard = player.tiles.filter(t => t.status === TILE_STATUS.Board);
        const tilesInHand = player.tiles.filter(t => t.status === TILE_STATUS.Hand);
        createPlayerHand(tilesInHand);

        placeTilesOnBoard(tilesOnBoard);

    }
    if (game?.status === GAME_STATUS.InProgress) {

        disableButton("btn-dump");
        if (player?.tiles?.length) {
            const tilesInHand = player.tiles.filter(t => t.status === TILE_STATUS.Hand);
            const tilesOnBoard = player.tiles.filter(t => t.status === TILE_STATUS.Board);

            createPlayerHand(tilesInHand);
            placeTilesOnBoard(tilesOnBoard);
            if (tilesInHand?.length) {
                disableButton("btn-peel")

            } else if (tilesOnBoard?.length === player.tiles.length) {
                // validate the tiles for connection
                if (tilesConnected(tilesOnBoard)) {
                    //The game ends when there are fewer tiles in the bunch than the number of players AND
                    // a player has no more tiles in their hand.
                    if (game.tiles.length < game._count.players) {
                        // game.tiles = number of tiles in bunch
                        enableButton("btn-bananas")
                    } else {
                        enableButton("btn-peel")
                    }
                }
            }
        } else if (player && player.tiles.count === 0) {
            await getNewHand(gameId, playerId);
            loadGameForPlayer();
        }
    }
}
function hasNeighbour(rowIndex, colIndex, tiles, map) {
    if ((rowIndex === -1 || rowIndex > 11) || (colIndex < 0 || colIndex > 11)) {
        return false;
    }

    const tileFound = tiles.find(t => t.rowIndex === rowIndex && t.colIndex === colIndex);
    if (tileFound) {
        const existingCount = map.get(tileFound.id) ?? 0;
        if (existingCount > -1) {
            map.set(tileFound.id, existingCount + 1)
        }
        return true;
    } else {
        return false;
    }
}
// checking if each tile is connected with at least one other tile
function tilesConnected(tiles) {
    // moveLeft colIndex -1
    // moveRight colIndex + 1
    // moveUp RowIndex -1
    // moveDown RowIndex +1
    let map = new Map();
    for (let tile of tiles) {
        const { rowIndex, colIndex, id } = tile;
        const existingCount = map.get(id) ?? 0;
        if (!existingCount) {
            const leftNeighbour = hasNeighbour(rowIndex, colIndex - 1, tiles, map);
            const rightNeighbour = hasNeighbour(rowIndex, colIndex + 1, tiles, map);
            const topNeighbour = hasNeighbour(rowIndex - 1, colIndex, tiles, map);
            const bottomNeighbour = hasNeighbour(rowIndex + 1, colIndex, tiles, map);

            if (leftNeighbour || rightNeighbour || topNeighbour || bottomNeighbour) {
                map.set(id, existingCount + 1);
            }
        }
    }
    return map.size === tiles.length;
}

async function onPeelClick(event) {
    const peelCount = await peel({ playerId, gameId });
    if (peelCount) {
        loadGameForPlayer();
    }
}
async function onDumpClick(event) {
    const selectedTile = document.querySelector(".tile.selected");
    if (selectedTile) {
        const result = await dump({ tileId: Number(selectedTile.id), gameId, playerId });
        if (result) {
            loadGameForPlayer();
        }
    }
}
async function onBananas() {
    await bananas({ playerId, gameId })
    loadGameForPlayer();
}
document.addEventListener("DOMContentLoaded", (e) => {
    const split = document.getElementById("btn-split");
    const peel = document.getElementById("btn-peel");
    const dump = document.getElementById("btn-dump");
    const bananas = document.getElementById("btn-bananas");
    split.addEventListener("click", onSplitClick)
    peel.addEventListener("click", onPeelClick)
    dump.addEventListener("click", onDumpClick)
    bananas.addEventListener("click", onBananas)
    loadGameForPlayer()
    const playerHand = document.querySelector(".player-hand");
    playerHand.addEventListener("drop", (event) => {
        drop(event, TILE_STATUS.Hand);
    });
    playerHand.addEventListener("dragover", allowDrop);
    playerHand.addEventListener("dragleave", dragLeave);
    setInterval(() => {
        checkForGameUpdates();
    }, 10 * 1000);
})