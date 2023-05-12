const baseUrl = "game"


async function joinGame(gameId) {
    const playerName = prompt("Enter your name");
    if (playerName) {
        const player = await addPlayerToGame({ playerName, gameId });
        if (player) {
            window.location.href = `${location.origin}/game?gameId=${gameId}&player=${player.id}`;
        }
    }
}
function gameStatusMapper(status) {
    const map = new Map([[GAME_STATUS.Created, "Created"], [GAME_STATUS.InProgress, "In Progress"], [GAME_STATUS.Finished, "Finished"]]);
    return map.get(status);
}
async function loadListOfGames() {
    const games = await getOpenGames();
    if (games?.length) {
        const container = document.createElement("ul");
        container.classList.add("games-list");
        for (let game of games) {
            const listItem = document.createElement("li");
            listItem.id = game.id;
            listItem.innerHTML = `
            <section class="game-info" status="${game.status}">
            <article> 
            <header >
                <h2>${game.name}</h2>
            </header>
            ${game.players?.length ? `<p>Players: <strong>${game.players.map(p => p.name).join(", ")}</strong></p>` : "<p>No players yet</p>"}
             <p class="status-text">${gameStatusMapper(game.status)}</p>
                ${game.status === GAME_STATUS.Created ? `<button class="join-game" onclick="joinGame(${game.id})">Join</button>` : ``}
                ${game.status === GAME_STATUS.Finished ? `<p>Winner: ${game.players.find(p => p.id === game.winnerId)?.name}</p>` : ""}
                </article>
          </section>`
            container.appendChild(listItem);
        }

        document.querySelector("#games").appendChild(container);

    }
}

async function createNewGame() {
    const name = prompt("Enter the name of the game");
    if (name) {
        const createdGameId = await addNewGame(name);
        if (createdGameId) {
            document.querySelector("#games .games-list")?.remove();
            loadListOfGames();
        }
    }
}
document.addEventListener("DOMContentLoaded", () => {
    loadListOfGames();
    document.getElementById("new-game").addEventListener("click", createNewGame)
})