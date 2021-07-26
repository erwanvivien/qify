const { maxPathLength } = require("./config");
const { spotifyQueue, spotifyPlay } = require("./spotifyApi");

const possible = "ABCDEFGHIJKLMNPQRSTUVWXYZ0123456789";
const possibleLength = possible.length;

function randomPin(size) {
  let str = "";
  for (let i = 0; i < size; i += 1)
    str += possible[Math.floor(Math.random() * possibleLength)];

  return str;
}

class Room {
  static ROOMS = [];

  pinWithRoom;
  pin;
  adminSpotifyId;
  adminSocketsId;
  spotify;

  adminPass;

  createdAt;
  lastPushedSongAt;
  members;

  country;
  songQueue;
  songCursor;

  nextAtTimeout;

  /**
   * Creates a new room
   * @param pin A new room pin, it needs to be available
   * @param admin The room admin
   * @param country The country code
   * @param spotify_cred The spotify credentials
   */
  constructor(pin, admin, country, spotify_cred) {
    this.pin = pin;
    this.pinWithRoom = "/room/" + pin;
    this.adminSpotifyId = admin;
    this.adminSocketsId = [];
    this.spotify = spotify_cred;

    this.adminPass = randomPin(64);

    this.createdAt = Date.now();
    this.lastPushedSongAt = Date.now();
    this.members = [];
    this.songQueue = [];
    this.songCursor = 0;

    this.country = country;
  }

  /**
   * Tries to get a **room index** from it's room's ID
   * @param pin_id Room's unique ID
   * @returns Returns a **room** from it's unique ID
   */
  static getRoomIndexWithPin(pin_id) {
    return Room.ROOMS.findIndex(({ pin }) => pin === pin_id);
  }

  /**
   * Tries to get a **room** from it's room's ID
   * @param pin_id Room's unique ID
   * @returns Returns a **room** from it's unique ID
   */
  static getRoomWithPin(pin_id) {
    let room_idx = Room.getRoomIndexWithPin(pin_id);
    if (room_idx < 0) return null; // Room does not exist
    return Room.ROOMS[room_idx];
  }

  /**
   * Tries to get a **room index** from it's admin's ID
   * @param admin_id Admin's unique ID
   * @returns the index of the room, if it exists or `-1`
   */
  static getRoomIndexWithAdmin(admin_id) {
    return Room.ROOMS.findIndex(({ adminSpotifyId }) => {
      return adminSpotifyId === admin_id;
    });
  }

  /**
   * Tries to get a **room** from it's room's ID
   * @param admin_id Admin's unique ID
   * @returns Returns a **room** from it's unique ID
   */
  static getRoomWithAdmin(admin_id) {
    let room_idx = Room.getRoomIndexWithAdmin(admin_id);
    if (room_idx < 0) return null; // Room does not exist
    return Room.ROOMS[room_idx];
  }

  /**
   * Usefull to check if a room exists
   * @param pin_id Room pin
   * @returns a JSon containing at least `exist` and `error`
   *
   * Default behaviour :
   *
   * { `exist`: true,
   * `error`: null,
   * `pin`.pin,
   * `admin`.admin,
   * `createdAt`.created,
   * `members`.members }
   */
  static checkRoom(pin_id) {
    let room = Room.getRoomWithPin(pin_id);
    if (!room) return { exist: false, error: "Room does not exist" };

    return {
      exist: true,
      error: null,
      pin: room.pin,
      admin: room.admin,
      createdAt: room.created,
      members: room.members,
    };
  }

  /**
   * Creates a new room and appends it to the list of existing rooms
   * @param admin The room admin
   * @param spotify_cred The spotify credentials
   * @returns the pin of the newly created room
   */
  static createRoom(admin, spotify_cred) {
    let pin = randomPin(maxPathLength);
    while (Room.checkRoom(pin).exist === true) pin = randomPin(maxPathLength);

    let room = new Room(pin, admin.id, admin.country, spotify_cred);
    Room.ROOMS.push(room);
    return room;
  }
}

function getSongsRoom(room) {
  if (room.songCursor >= room.songQueue.length || room.songQueue.length === 0)
    return [];
  return room.songQueue.slice(room.songCursor);
}

function createRoom(admin, spotify_cred, socket) {
  if (admin.product !== "premium") {
    socket.emit("RES_CREATE_ROOM", {
      error: "Le compte que vous souhaitez utiliser n'est pas premium.",
    });
    return;
  }

  let room = Room.getRoomWithAdmin(admin.id);
  if (room) {
    socket.emit("RES_CREATE_ROOM", {
      pin: room.pin,
      adminPass: room.adminPass,
    });
    return;
  }

  let { pin, adminPass } = Room.createRoom(admin, spotify_cred);
  socket.emit("RES_CREATE_ROOM", { pin, adminPass });

  console.info(`\tROOM ${pin} ++`);
}

async function addSong(pin, song, deviceId, playing, io) {
  let room = Room.getRoomWithPin(pin);
  if (!room) return;

  if (
    room.songQueue.length > 0 &&
    room.songQueue[room.songQueue.length - 1].uri === song.uri
  ) {
    io.to(pin).emit(
      "RES_UPDATE_SONG_FAILED",
      "Vous essayez de rajouter la chanson en doublon"
    );
    return;
  }

  let res = {};

  if (room.songCursor >= room.songQueue.length) {
    res = await spotifyPlay(
      room.spotify.access_token,
      song.uri,
      deviceId,
      null
    );
  }

  if (res.error) {
    io.to(pin).emit(
      "RES_UPDATE_SONG_FAILED",
      "Le lecteur est probablement déconnecté.\nVeuillez rafraichir."
    );
    return;
  }

  room.lastPushedSongAt = Date.now();
  room.songQueue.push(song);
  io.to(pin).emit("RES_UPDATE_SONG", getSongsRoom(room));
}

function getSongs(pin, io) {
  let room = Room.getRoomWithPin(pin);
  if (!room) return;

  io.to(pin).emit("RES_UPDATE_SONG", getSongsRoom(room));
}

function checkRoom(pin, socket) {
  let room = Room.getRoomWithPin(pin);
  if (!room) {
    socket.emit("RES_CHECK_ROOM", null);
    return;
  }

  let roomLessInfo = {
    pin: room.pin,
    adminSpotifyId: room.adminSpotifyId,
    access_token: room.spotify.access_token,
    country: room.country,
    songQueue: getSongsRoom(room),
  };
  socket.emit("RES_CHECK_ROOM", roomLessInfo);
}

function joinRoom(pin, socket) {
  let room = Room.getRoomWithPin(pin);
  if (!room) return;

  socket.join(pin);
  console.info(`\tROOM ${pin} <- ${socket.id}`);

  room.members.push(socket.id);
}

function joinRoomAdmin(pin, pass, socket) {
  let room = Room.getRoomWithPin(pin);
  if (!room) return;
  if (room.adminPass !== pass) return;

  room.adminSocketsId.push(socket.id);
  console.info(`\tROOM ${pin} <- ${socket.id} ADM`);

  socket.emit("JOIN_ROOM_ADMIN", true);
}

function leaveRoom(pin, socket) {
  let room = Room.getRoomWithPin(pin);
  if (!room) return;

  socket.leave(pin);

  let idx = room.members.indexOf(socket.id);
  if (idx >= 0) room.members.splice(idx, 1);

  console.info(`\tROOM ${pin} -> ${socket.id}`);
}

function getRooms(socket) {
  let rooms = Room.ROOMS.map((room) => {
    return {
      pin: room.pin,
      nbSongs: room.songQueue.length,
      nbMembers: room.members.length,
      admin: room.adminSpotifyId,
      createdAt: room.createdAt,
      lastPushedSongAt: room.lastPushedSongAt,
    };
  });

  socket.emit("RES_DEBUG", rooms);
}

async function spotifyNextSong(room, deviceId, io) {
  room.songCursor = Math.min(room.songQueue.length, room.songCursor + 1);

  let songs = getSongsRoom(room);
  if (songs[0])
    await spotifyPlay(room.spotify.access_token, songs[0].uri, deviceId, null);

  io.to(room.pin).emit("RES_UPDATE_SONG", songs);
}

async function skipSong(pin, deviceId, io) {
  let room = Room.getRoomWithPin(pin);
  if (!room) return;

  clearTimeout(room.nextAtTimeout);
  await spotifyNextSong(room, deviceId, io);
}

async function updateState(
  pin,
  deviceId,
  timer,
  atStart,
  paused,
  title,
  album,
  uri,
  image,
  io
) {
  let room = Room.getRoomWithPin(pin);
  if (!room) return;

  clearTimeout(room.nextAtTimeout);
  if (timer <= 0) return;

  if (paused === true && atStart === true) {
    await spotifyNextSong(room, deviceId, io);
    return;
  }

  const current_track = { title, album, image, uri };
  let songs = getSongsRoom(room);
  let index = songs.findIndex((song) => song.uri === uri);

  if (index === -1 && room.songQueue.length !== 0) {
    songs[0] = current_track;
    io.to(pin).emit("RES_UPDATE_SONG", songs);
  }
  if (index <= 2 && index >= 1) {
    room.songCursor = Math.min(room.songQueue.length, room.songCursor + index);
    io.to(pin).emit("RES_UPDATE_SONG", songs.slice(index));
  }

  room.nextAtTimeout = setTimeout(async () => {
    await spotifyNextSong(room, deviceId, io);
  }, timer);
}

module.exports = {
  createRoom,
  addSong,
  getSongs,
  checkRoom,
  joinRoom,
  joinRoomAdmin,
  leaveRoom,
  Room,
  getRooms,
  skipSong,
  updateState,
};
