import { maxPathLength } from "./config";

const possible =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNPQRSTUVWXYZ0123456789-_";
const possibleLength = possible.length;

function randomPin(size) {
  let str = "";
  for (var i = 0; i < size; i++)
    str += possible[Math.floor(Math.random() * possibleLength)];

  return "room/" + str;
}

class Room {
  static ROOMS = [];

  pinWithRoom;
  pin;
  adminSpotifyId;
  spotify;

  created;
  members;

  songQueue;

  /**
   * Creates a new room
   * @param pin A new room pin, it needs to be available
   * @param admin The room admin
   * @param spotify_cred The spotify credentials
   */
  constructor(pin, admin, spotify_cred) {
    this.pin = pin;
    this.pinWithRoom = "room/" + pin;
    this.adminSpotifyId = admin;
    this.spotify = spotify_cred;

    this.created = Date.now();
    this.members = [admin];
    this.songQueue = [];
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
    return Room.ROOMS.findIndex(({ admin }) => admin === admin_id);
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
    while (Room.checkRoom(pin)["exist"] === true)
      pin = randomPin(maxPathLength);

    let room = new Room(pin, admin, spotify_cred);
    Room.ROOMS.push(room);
    return pin;
  }
}

module.exports = Room;
