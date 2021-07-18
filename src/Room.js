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
  members;

  country;
  songQueue;

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
    this.members = [];
    this.songQueue = [];

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

function getSongs(room) {
  return room.songQueue.filter((e) => e.state === 1) || [];
}

function createRoom(admin, spotify_cred, socket) {
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

  console.log(`ROOM ${pin} ++`);
}

async function addSong(pin, song, deviceId, io) {
  let room = Room.getRoomWithPin(pin);
  if (!room) return;

  let songs = getSongs(room);
  if (songs.length === 0) {
    console.log("playing instead of queueing");
    let res = await spotifyPlay(
      room.spotify.access_token,
      song.uri,
      deviceId,
      null
    );
    if (res.error) return;

    room.songQueue.push(song);
    io.to(pin).emit("RES_UPDATE_SONG", getSongs(room));
    return;
  }

  if (
    room.songQueue.length > 0 &&
    room.songQueue[room.songQueue.length - 1].uri === song.uri
  ) {
    io.to(pin).emit("RES_UPDATE_SONG_FAILED");
    return;
  }

  let res = await spotifyQueue(
    room.spotify.access_token,
    song.uri,
    deviceId,
    null
  );

  if (res.error) return;
  room.songQueue.push(song);

  io.to(pin).emit("RES_UPDATE_SONG", getSongs(room));
}

function getSongs(pin, io) {
  let room = Room.getRoomWithPin(pin);
  if (!room) return;

  io.to(pin).emit("RES_UPDATE_SONG", getSongs(room));
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
    songQueue: getSongs(room),
  };
  socket.emit("RES_CHECK_ROOM", roomLessInfo);
}

function joinRoom(pin, socket) {
  let room = Room.getRoomWithPin(pin);
  if (!room) return;

  socket.join(pin);
  console.log(`ROOM ${pin} <- ${socket.id}`);

  room.members.push(socket.id);
}

function joinRoomAdmin(pin, pass, socket) {
  let room = Room.getRoomWithPin(pin);
  if (!room) return;
  if (room.adminPass !== pass) return;

  room.adminSocketsId.push(socket.id);
  console.log(`ROOM ${pin} <- ${socket.id} ADM`);

  socket.emit("JOIN_ROOM_ADMIN", true);
}

function leaveRoom(pin, socket) {
  let room = Room.getRoomWithPin(pin);
  if (!room) return;

  socket.leave(pin);

  let idx = room.members.indexOf(socket.id);
  if (idx >= 0) room.members.splice(idx, 1);

  console.log(`ROOM ${pin} -> ${socket.id}`);
}

function nextSong(pin, pass, io) {
  let room = Room.getRoomWithPin(pin);
  if (!room) return;
  if (room.adminPass !== pass) return;

  let song = room.songQueue.find((s) => s.state === 1);
  if (!song) return;
  song.state = 0;

  io.to(pin).emit("RES_UPDATE_SONG", getSongs(room));
}

function getRooms(socket) {
  let rooms = Room.ROOMS.map((room) => {
    return {
      pin: room.pin,
      nbSongs: room.songQueue.length,
      nbMembers: room.members.length,
      admin: room.adminSpotifyId,
      createdAt: room.createdAt,
    };
  });

  socket.emit("RES_DEBUG", rooms);
}

module.exports = {
  createRoom,
  addSong,
  getSongs,
  checkRoom,
  joinRoom,
  joinRoomAdmin,
  leaveRoom,
  nextSong,
  Room,
  getRooms,
};
