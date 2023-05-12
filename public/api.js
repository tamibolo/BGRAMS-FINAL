const serverURL = "http://localhost:8080";
const Endpoint = {
    player: `${serverURL}/player`,
    game: `${serverURL}/game`,
    tile: `${serverURL}/tile`
}
async function postData(url, data) {
    const response = await fetch(url, {
        method: "POST",
        body: data ? JSON.stringify(data) : null,
        headers: {
            "Content-Type": "application/json",
        },
    })
    return response.json();
}

async function getData(url) {
    const response = await fetch(url)
    return response.json();
}

function addPlayerToGame({ gameId, playerName }) {
    return postData(`${Endpoint.player}/joinGame`, { gameId, playerName })
}
async function getOpenGames() {
    return getData(`${Endpoint.game}/listGames`)
}

async function addNewGame(name) {
    return postData(`${Endpoint.game}/newGame`, { name })
}

async function splitGame(gameId) {
    return postData(`${Endpoint.game}/split`, { gameId })
}

function getUpdate(gameId, playerId) {
    return getData(`${Endpoint.game}/getUpdate?gameId=${gameId}&playerId=${playerId}`);
}

function getNewHand(gameId, playerId) {
    return postData(`${Endpoint.game}/getNewHand`, { gameId, playerId });
}

function placeTile(tileInfo) {
    return postData(`${Endpoint.tile}/place`, tileInfo)
}

function peel({ playerId, gameId }) {
    return postData(`${Endpoint.tile}/peel`, { playerId, gameId })
}

function dump({ tileId, playerId, gameId }) {
    return postData(`${Endpoint.tile}/dump`, { playerId, tileId, gameId })
}

function getNewTile({ playerId, gameId, count }) {
    return postData(`${Endpoint.tile}/newTile`, { gameId, playerId, count })
}
function bananas({ playerId, gameId }) {
    return postData(`${Endpoint.game}/bananas`, { playerId, gameId })
}