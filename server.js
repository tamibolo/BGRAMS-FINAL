const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const port = 8080;
const path = require("path");

const gameRouter = require("./routes/gameRouter")
const playerRouter = require("./routes/playerRouter")
const tileRouter = require("./routes/tileRouter");
// this is for making the files accessible on localhost:8080
app.use(express.static("public"))
app.use(express.static("common"))
app.use(bodyParser.json());

app.use("/game", gameRouter)
app.use("/player", playerRouter)
app.use("/tile", tileRouter)

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "homepage.html"));
})

app.listen(port, () => {
    console.log("server started on port:", port);
})