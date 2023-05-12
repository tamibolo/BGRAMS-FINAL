-- CreateTable
CREATE TABLE "Tile" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "letter" TEXT NOT NULL,
    "rowIndex" INTEGER,
    "colIndex" INTEGER,
    "gameId" INTEGER NOT NULL,
    "playerId" INTEGER,
    "status" TEXT NOT NULL,
    CONSTRAINT "Tile_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Tile_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Player" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "gameId" INTEGER NOT NULL,
    CONSTRAINT "Player_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Game" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'created',
    "peels" INTEGER NOT NULL DEFAULT 0,
    "winnerId" INTEGER
);

-- CreateIndex
CREATE UNIQUE INDEX "Player_gameId_id_key" ON "Player"("gameId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "Game_name_key" ON "Game"("name");
