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

const { createRoom, addSong, checkRoom, getSongs } = require("./controller");

const Room = require("./Room");

setInterval(() => {
  let threshold = new Date().addHours(0);

  console.log("from " + Room.ROOMS.length);
  Room.ROOMS = Room.ROOMS.filter((room) => {
    return room.members.length === 0 && room.createdAt > threshold;
  });
  console.log("to " + Room.ROOMS.length);
}, 3600 * 1000);

io.on("connect", (socket) => {
  socket.on("CREATE_ROOM", ({ adminId, spotifyCreds }) => {
    createRoom(adminId, spotifyCreds, socket);
  });
  socket.on("CHECK_ROOM", (pin) => {
    checkRoom(pin, socket);
  });

  socket.on("ROOM_SONGS", (pin) => {
    getSongs(pin, socket);
  });

  socket.on("ADD_SONG", ({ pin, song }) => {
    addSong(pin, song);
  });
  //   socket.on("REMOVE_SONG", ({ pin, songIdx }) => {
  //     removeSong(pin, songIdx);
  //   });

  socket.on("DEBUG", () =>
    Room.ROOMS.forEach((room) => {
      console.log(room.pin);
    })
  );
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
