const Room = require("./Room");

function createRoom(admin, spotify_cred, socket) {
  let room = Room.getRoomWithAdmin(admin.id);
  if (room) return socket.emit("RES_CREATE_ROOM", room.pin);

  let pin = Room.createRoom(admin, spotify_cred);
  socket.emit("RES_CREATE_ROOM", pin);
}

function addSong(pin, song) {
  let room = Room.getRoomIndexWithPin(pin);
  room.addSong(song);
}

function getSongs(pin, socket) {
  let room = Room.getRoomWithPin(pin);
  if (!room) return socket.emit("RES_", null);
  return socket.emit("RES_ROOM_SONGS", room.getSongs());
}

function checkRoom(pin, socket) {
  console.log("bruh");
  let room = Room.getRoomWithPin(pin);
  socket.emit("RES_CHECK_ROOM", room !== null);
}

module.exports = {
  createRoom,
  addSong,
  getSongs,
  checkRoom,
};
