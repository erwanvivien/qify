const { io } = require("socket.io-client");
const Room = require("./Room");

function createRoom(admin, spotify_cred, socket) {
  let room = Room.getRoomWithAdmin(admin.id);
  if (room) return socket.emit("RES_CREATE_ROOM", room.pin);

  let pin = Room.createRoom(admin, spotify_cred, socket.id);
  socket.emit("RES_CREATE_ROOM", pin);
}

function addSong(pin, song, io) {
  let room = Room.getRoomWithPin(pin);
  room.songQueue.push(song);
  io.to(pin).emit("RES_ADD_SONG", room.songQueue);
}

function getSongs(pin, socket) {
  let room = Room.getRoomWithPin(pin);
  if (!room) return socket.emit("RES_GET_SONGS", null);

  return socket.emit("RES_GET_SONGS", room.songQueue);
}

function checkRoom(pin, socket) {
  let room = Room.getRoomWithPin(pin);
  if (!room) return socket.emit("RES_CHECK_ROOM", null);

  let roomLessInfo = {
    pin: room.pin,
    adminSpotifyId: room.adminSpotifyId,
    access_token: room.spotify.access_token,
    country: room.country,
    songQueue: room.songQueue,
  };
  socket.emit("RES_CHECK_ROOM", roomLessInfo);
}

function joinRoom(pin, socket) {
  console.log("join: " + pin);
  socket.join(pin);
}
function leaveRoom(pin, socket) {
  console.log("leave: " + pin);
  socket.leave(pin);
}

module.exports = {
  createRoom,
  addSong,
  getSongs,
  checkRoom,
  joinRoom,
  leaveRoom,
};
