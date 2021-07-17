import { Component } from "react";
import { io } from "socket.io-client";

const socket = io();

class Rooms extends Component {
  state = { text: "" };

  componentDidMount() {
    socket.on("RES_DEBUG", (rooms) => {
      let textRooms = rooms.map((room) => {
        let { createdAt } = room;
        room.createdAt = new Date(createdAt).toISOString();
        let { pin } = room;
        room.pin = undefined;
        return pin + ": " + JSON.stringify(room);
      });

      this.setState({
        text: textRooms.join("\n"),
      });
    });

    socket.emit("DEBUG");
  }

  render() {
    return this.state.text;
  }
}

export default Rooms;
