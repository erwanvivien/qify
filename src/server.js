const express = require("express")();
const server = require("http").Server(express);
const io = require("socket.io")(server);
const next = require("next");
const { currentUrl } = require("./spotifyApi");

const port = process.env.PORT || 8888;
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

function addHours(h) {
  this.setTime(this.getTime() + h * 60 * 60 * 1000);
  return this;
}
function addMinutes(m) {
  this.setTime(this.getTime() + m * 60 * 1000);
  return this;
}

Date.prototype.addHours = addHours;
Date.prototype.addMinutes = addMinutes;

const {
  createRoom,
  addSong,
  checkRoom,
  getSongs,
  joinRoom,
  joinRoomAdmin,
  leaveRoom,
  nextSong,
  getRooms,
  Room,
} = require("./Room");

const { spotifyRefresh } = require("./spotifyApi");

setInterval(() => {
  let from = Room.ROOMS.length;

  let threshold = new Date().addHours(-24);
  Room.ROOMS = Room.ROOMS.filter((room) => {
    return room.createdAt > threshold;
  });

  console.log(
    `[${new Date().toLocaleString()}] ROOM CLEAR  => from ${from} to ${
      Room.ROOMS.length
    }`
  );
}, 60 * 60 * 1000); // Every hour

setInterval(() => {
  console.log(
    `[${new Date().toLocaleString()}] ROOM UPDATE => Updating access_tokens`
  );
  Room.ROOMS.forEach(async (room) => {
    let refresh_token = room.spotify.refresh_token;
    let newTokens = await spotifyRefresh(refresh_token, null);
    room.spotify.access_token = newTokens.access_token;
  });
}, 40 * 60 * 1000); // Every 40 minutes

io.on("connect", (socket) => {
  socket.on("CREATE_ROOM", ({ adminId, spotifyCreds }) =>
    createRoom(adminId, spotifyCreds, socket)
  );
  socket.on("CHECK_ROOM", (pin) => checkRoom(pin, socket));
  socket.on("JOIN_ROOM", (pin) => joinRoom(pin, socket));
  socket.on("JOIN_ROOM_ADMIN", ({ pin, pass }) =>
    joinRoomAdmin(pin, pass, socket)
  );
  socket.on("LEAVE_ROOM", (pin) => leaveRoom(pin, socket));
  socket.on("GET_SONGS", (pin) => getSongs(pin, socket));
  socket.on("ADD_SONG", ({ song, pin, deviceId }) =>
    addSong(pin, song, deviceId, io)
  );
  socket.on("SONG_POP", ({ pin, pass }) => nextSong(pin, pass, io));
  socket.on("DEBUG", () => getRooms(socket));
});

app.prepare().then(() => {
  express.all("*", (req, res) => {
    return handle(req, res);
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on ${currentUrl}`);
  });
});
