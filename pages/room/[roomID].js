import { Component } from "react";

import styles from "../../styles/Home.module.css";
import listStyle from "../../styles/Room.module.css";

import SearchSong from "../../components/room/SearchSong";
import SpotifyItems from "../../components/room/SpotifyItems";

import RoomPlayer from "../../components/room/Player";

import { Default } from "../../components/Default";

import { currentUrl, paths, title } from "../../src/config";
import io from "socket.io-client";
import { withRouter } from "next/router";

import QRCode from "qrcode.react";
import { Header } from "../../components/Header";

// const date_to_string = (k, v) => {
//   if (v instanceof Date) return v.getMilliseconds();
//   return v;
// };
const string_to_date = (k, v) => {
  if (k === "creation_time") return Date.parse(v);
  return v;
};

const socket = io();

class App extends Component {
  roomID;
  intervalId;
  password;
  router;

  deviceId;

  player;
  previousState;

  timeout;

  playing = false;

  state = {
    room: null,
    loading: true,
    songs: [],
    width: 800,
    isAdmin: false,
  };

  static getInitialProps({ query }) {
    return {
      roomID: query.roomID,
      pass: typeof query.pass === "undefined" ? null : query.pass,
    };
  }

  constructor(props) {
    super(props);
    this.roomID = props.roomID;
    this.router = props.router;
    this.password = props.pass;

    if (props.room_str) this.room = JSON.parse(props.room_str, string_to_date);
  }

  handleResize = () => {
    if (Math.abs(window.innerWidth - this.state.width) < 10) return;

    this.setState({
      width: window.innerWidth,
    });
  };

  handlePlaying = (playing) => {
    this.playing = playing;
  };

  localStorageUpdate() {
    const TWO_HOUR = 2 * 60 * 60 * 1000; /* ms */

    const passwordKey = `${title}-password`;
    const timestampKey = `${title}-timestamp`;
    const roomPinKey = `${title}-room`;

    let password = localStorage.getItem(passwordKey);
    let timestamp = localStorage.getItem(timestampKey);
    let roomPin = localStorage.getItem(roomPinKey);

    if (!timestamp || roomPin !== this.roomID || this.password) {
      localStorage.setItem(passwordKey, this.password);
      localStorage.setItem(timestampKey, new Date().toString());
      localStorage.setItem(roomPinKey, this.roomID);
      return;
    }

    let timestampDate = Date.parse(timestamp);
    if (new Date() - timestampDate < TWO_HOUR) {
      // Less than two hours
      this.password = password || this.password;
    }
  }

  componentDidMount() {
    window.addEventListener("resize", this.handleResize);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden === false) {
        socket.emit("GET_SONGS", this.roomID);
      }
    });
    this.handleResize();

    this.router.push(
      {
        pathname: this.router.pathname,
        query: {
          roomID: this.roomID.toUpperCase(),
        },
      },
      null,
      { shallow: this.roomID.toUpperCase() === this.roomID }
    );

    socket.on("JOIN_ROOM_ADMIN", (isAdmin) => {
      this.setState({
        isAdmin: isAdmin,
      });
    });
    socket.on("RES_CHECK_ROOM", (room) => {
      this.setState({
        room,
        loading: false,
        songs: room ? room.songQueue : [],
      });
      if (!room) return;

      this.localStorageUpdate();

      socket.emit("JOIN_ROOM", this.roomID);
      socket.emit("JOIN_ROOM_ADMIN", {
        pin: this.roomID,
        pass: this.password,
      });
    });
    socket.on("RES_UPDATE_SONG", (songs) => {
      this.setState({
        songs,
      });
    });

    socket.on("RES_UPDATE_SONG_FAILED", () => {});

    socket.emit("CHECK_ROOM", this.roomID);
  }

  componentWillUnmount() {
    clearInterval(this.intervalId);
    if (this.state.room) socket.emit("LEAVE_ROOM", this.roomID);
  }

  addSong(song) {
    socket.emit("ADD_SONG", {
      song,
      pin: this.roomID,
      deviceId: this.deviceId,
      playing: this.playing,
    });
  }

  displayQR() {
    return this.state.width > 500 && this.state.isAdmin;
  }

  resetTitle(event) {
    let element = event.target;

    let divs = [listStyle.list, styles.container, listStyle.search_div];
    while (element !== null) {
      if (divs.includes(element.className)) break;
      element = element.parentElement;
    }

    if (!element) return;
    if (![listStyle.list, styles.container].includes(element.className)) {
      return;
    }

    let input = document.getElementById("roomSongSearchInput");
    if (!input) return;
    if (input.value === "") return;
    input.value = "";

    this.setState(this.state);
  }

  render() {
    if (this.state.loading) {
      return (
        <Default title={false}>
          <h1 className={styles.title}>Le salon est en cours de création</h1>
        </Default>
      );
    }

    if (!this.state.room) {
      return (
        <Default title={false}>
          <h1 className={styles.title}>Ce salon n&apos;existe pas</h1>
          <a href={paths.create} className={styles.description}>
            Veuillez en créer un ou rejoindre un salon existant
          </a>
        </Default>
      );
    }

    return (
      <>
        <div
          className={styles.container}
          onClick={(event) => this.resetTitle(event)}
        >
          <Header />

          <main className={`${styles.main} ${listStyle.main}`}>
            <div className={listStyle.search_div}>
              <SearchSong
                access_token={this.state.room.access_token}
                country={this.state.room.country}
                addSong={this.addSong.bind(this)}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "center" }}>
              <QRCode
                onClick={() =>
                  navigator.clipboard.writeText(
                    `${currentUrl}/room/${this.roomID}`
                  )
                }
                title="Cliquer pour copier le lien"
                style={{ cursor: "pointer" }}
                value={`${currentUrl}/room/${this.roomID}`}
                bgColor={"#ecedf1"}
                level="L"
              ></QRCode>
            </div>

            <SpotifyItems songs={this.state.songs} width={this.state.width} />

            <span
              style={{
                height: "90px",
              }}
            ></span>
          </main>
        </div>

        {this.state.isAdmin && (
          <RoomPlayer
            width={this.state.width}
            songQueue={this.state.songs}
            socket={socket}
            roomPass={this.password}
            roomPin={this.roomID}
            access_token={this.state.room.access_token}
            isPlaying={this.handlePlaying}
          />
        )}
      </>
    );
  }
}

export default withRouter(App);
