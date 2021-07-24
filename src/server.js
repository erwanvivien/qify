const express = require("express")();
const server = require("http").Server(express);
const io = require("socket.io")(server);
const next = require("next");

const {
  currentUrl,
  spotifyCreatePlaylist,
  spotifyAddTracks,
} = require("./spotifyApi");

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
  getRooms,
  Room,
  prevSong,
  skipSong,
} = require("./Room");

const { spotifyRefresh } = require("./spotifyApi");

async function saveRooms(rooms) {
  console.log("TEST");

  for (const room of rooms) {
    console.log(room.adminSpotifyId);
    let refresh_token = room.spotify.refresh_token;
    let newTokens = await spotifyRefresh(refresh_token, null);
    let access_token = newTokens.access_token;

    let playlist = await spotifyCreatePlaylist(
      access_token,
      room.adminSpotifyId,
      room.createdAt,
      null
    );

    for (let i = 0; i < room.songQueue.length; i += 100) {
      let to =
        i + 100 > room.songQueue.length ? room.songQueue.length : i + 100;
      let songs = room.songQueue.slice(i, to);
      let songsUris = songs.map((song) => song.uri);
      let addedTracks = await spotifyAddTracks(
        access_token,
        playlist.id,
        songsUris,
        null
      );
    }

    console.log(
      `[${new Date().toLocaleString()}] ROOM TRACKS => ${
        room.songQueue.length
      } songs have been added.`
    );
  }
}

setInterval(async () => {
  let from = Room.ROOMS.length;

  let thresholdMax = new Date().addHours(-24);
  let thresholdSong = new Date().addHours(-2);

  let doneRooms = Room.ROOMS.filter((room) => {
    return !(
      room.createdAt > thresholdMax && room.lastPushedSongAt > thresholdSong
    );
  });

  Room.ROOMS = Room.ROOMS.filter((room) => {
    return (
      room.createdAt > thresholdMax && room.lastPushedSongAt > thresholdSong
    );
  });

  console.log(
    `[${new Date().toLocaleString()}] ROOM CLEAR  => from ${from} to ${
      Room.ROOMS.length
    }`
  );

  await saveRooms(doneRooms);
}, 60 * 60 * 1000); // Every hour

setInterval(() => {
  console.log(
    `[${new Date().toLocaleString()}] ROOM UPDATE => Updating access_tokens`
  );
  Room.ROOMS.forEach(async (room) => {
    let refresh_token = room.spotify.refresh_token;
    let newTokens = await spotifyRefresh(refresh_token, null);
    room.spotify.access_token = newTokens.access_token;

    io.to(room.pin).emit("RES_ACCESS_TOKEN_UPDATE", room.spotify.access_token);
  });
}, 40 * 60 * 1000); // Every 40 minutes

io.on("connect", (socket) => {
  socket.prependAny((eventName, ...args) => {
    console.info(`[EVENT] ${eventName} Fired`);
  });
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
  socket.on("ADD_SONG", ({ song, pin, deviceId, playing }) =>
    addSong(pin, song, deviceId, playing, io)
  );
  if (dev) socket.on("DEBUG", () => getRooms(socket));

  socket.on("NEXT", (pin) => skipSong(pin, io));
  socket.on("PREV", (pin) => prevSong(pin, io));
});

app.prepare().then(() => {
  express.all("*", (req, res) => {
    return handle(req, res);
  });

  server.listen(port, "0.0.0.0", (err) => {
    if (err) throw err;
    console.log(`> Ready on ${currentUrl}`);
  });
});

// catching signals and do something before exit
[
  "SIGHUP",
  "SIGINT",
  "SIGQUIT",
  "SIGILL",
  "SIGTRAP",
  "SIGABRT",
  "SIGBUS",
  "SIGFPE",
  "SIGUSR1",
  "SIGSEGV",
  "SIGUSR2",
  "SIGTERM",
].forEach((sig) => {
  process.on(sig, async () => {
    console.log(`\nGracefully shutting down from ${sig} (Ctrl-C)`);
    console.log(`${Room.ROOMS.length} were remaining`);

    await saveRooms(Room.ROOMS);

    io.emit("ROOM_CLOSED");
    process.exit(1);
  });
});
