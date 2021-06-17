const express = require("express")();
const server = require("http").Server(express);
const io = require("socket.io")(server);
const next = require("next");

const port = process.env.PORT || 8888;
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

Date.prototype.addHours = function (h) {
  this.setHours(this.getHours() + h);
  return this;
};
Date.prototype.addMinutes = function (m) {
  this.setMinutes(this.getMinutes() + m);
  return this;
};

const {
  createRoom,
  addSong,
  checkRoom,
  getSongs,
  joinRoom,
  leaveRoom,
  Room,
} = require("./Room");

const { spotifyRefresh } = require("./spotifyApi");

setInterval(() => {
  console.log("ROOM FILTERING: " + new Date().toLocaleString());
  let threshold = new Date().addHours(-2);

  console.log("from " + Room.ROOMS.length);
  Room.ROOMS = Room.ROOMS.filter((room) => {
    return room.members.length === 0 && room.createdAt > threshold;
  });

  threshold = new Date().addHours(-24);
  Room.ROOMS = Room.ROOMS.filter((room) => {
    return room.createdAt > threshold;
  });

  console.log("to " + Room.ROOMS.length);
}, 3600 * 1000); /// Every hour

setInterval(() => {
  console.log("ROOM UPDATING: " + new Date().toLocaleString());
  Room.ROOMS.forEach(async (room) => {
    let refresh_token = room.spotify.refresh_token;
    let newTokens = await spotifyRefresh(refresh_token, null);
    console.log("INTERVAL: " + JSON.stringify(newTokens));
  });
}, 15 * 60 * 1000);

io.on("connect", (socket) => {
  socket.on("CREATE_ROOM", ({ adminId, spotifyCreds }) => {
    createRoom(adminId, spotifyCreds, socket);
  });
  socket.on("CHECK_ROOM", (pin) => {
    checkRoom(pin, socket);
  });

  socket.on("JOIN_ROOM", (pin) => {
    joinRoom(pin, socket);
  });
  socket.on("LEAVE_ROOM", (pin) => {
    leaveRoom(pin, socket);
  });

  socket.on("GET_SONGS", (pin) => {
    getSongs(pin, socket);
  });
  socket.on("ADD_SONG", ({ song, pin }) => {
    addSong(pin, song, io);
  });
  //   socket.on("REMOVE_SONG", ({ pin, songIdx }) => {
  //     removeSong(pin, songIdx);
  //   });

  if (process.env.PRODUCTION === "DEV")
    socket.on("DEBUG", () => {
      if (Room.ROOMS.length === 0) console.log("No rooms");
      Room.ROOMS.forEach((room) => {
        console.log(
          `pin: ${room.pin} - memb.count: ${room.members.length} - songQueue: ${room.songQueue.length}`
        );
      });
    });
});

app.prepare().then(() => {
  express.all("*", (req, res) => {
    return handle(req, res);
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});
