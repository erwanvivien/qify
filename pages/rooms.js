import { Component } from "react";
import { io } from "socket.io-client";

const socket = io();

class Rooms extends Component {
  state = { text: "" };

  componentDidMount() {
    socket.on("RES_DEBUG", (rooms) => {
      let textRooms = rooms.map((room) => {
        let { createdAt, lastPushedSongAt } = room;

        room.createdAt = new Date(createdAt).toISOString();
        room.lastPushedSongAt = new Date(lastPushedSongAt).toISOString();

        return JSON.stringify(room);
      });

      this.setState({
        text: textRooms.join("\n"),
      });
    });

    socket.emit("DEBUG");
  }

  render() {
    return (
      <>
        <Head>
          <meta property="og:description" content="La musique en commun 📯" />{" "}
        </Head>
        {this.state.text}
      </>
    );
  }
}

export default Rooms;
