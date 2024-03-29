import { Component } from "react";

import styles from "../../styles/Home.module.css";
import listStyle from "../../styles/Room.module.css";
import headerStyle from "../../styles/Header.module.css";

import SearchSong from "../../components/room/SearchSong";
import SpotifyItems from "../../components/room/SpotifyItems";

import RoomPlayer from "../../components/room/Player";

import { Default } from "../../components/Default";

import { currentUrl, navbar, paths, title } from "../../src/config";
import io from "socket.io-client";
import { withRouter } from "next/router";

import QRCode from "qrcode.react";
import Link from "next/link";

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
      localStorage.setItem(timestampKey, Date.now());
      localStorage.setItem(roomPinKey, this.roomID);
      return;
    }

    if (Date.now() - timestamp < TWO_HOUR) {
      // Less than two hours
      this.password = password || this.password;
    }
  }

  componentDidMount() {
    window.addEventListener("resize", this.handleResize);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden === false) {
        socket.emit("GET_SONGS", this.roomID);
        socket.emit("ACCESS_TOKEN_UPDATE", this.roomID);
      }
    });
    document.addEventListener("pageload", () => {
      socket.emit("GET_SONGS", this.roomID);
      socket.emit("ACCESS_TOKEN_UPDATE", this.roomID);
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
    socket.on("RES_ACCESS_TOKEN_UPDATE", (access_token) => {
      let room = this.state.room;
      room.access_token = access_token;
      this.setState({ room });
    });

    socket.on("ROOM_CLOSED", () => {
      this.router.push("/");
    });

    socket.emit("CHECK_ROOM", this.roomID);
  }

  componentWillUnmount() {
    clearInterval(this.intervalId);
    if (this.state.room) socket.emit("LEAVE_ROOM", this.roomID);
  }

  addSong = (song) => {
    socket.emit("ADD_SONG", {
      song,
      pin: this.roomID,
      deviceId: this.deviceId,
      playing: this.playing,
    });
  };

  displayQR() {
    return this.state.isAdmin;
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
          <Link href={paths.create}>
            <a className={styles.description}>
              <u>Veuillez en créer un ou rejoindre un salon existant</u>
            </a>
          </Link>
        </Default>
      );
    }

    return (
      <>
        <div
          className={styles.container}
          onClick={(event) => this.resetTitle(event)}
        >
          <header className={styles.header}>
            <nav className={headerStyle.navbar}>
              {navbar
                .slice(0, this.state.width > 430 ? 3 : 2)
                .map((item, index) => (
                  <Link href={item.path} key={`navbar-item-` + index}>
                    <a className={styles.code}>{item.title}</a>
                  </Link>
                ))}
            </nav>
          </header>

          <main className={`${styles.main} ${listStyle.main}`}>
            <div className={listStyle.search_div}>
              <SearchSong
                access_token={this.state.room.access_token}
                country={this.state.room.country}
                addSong={this.addSong}
                width={this.state.width}
              />
            </div>

            {this.displayQR() && (
              <div style={{ display: "flex", justifyContent: "center" }}>
                <QRCode
                  onClick={() =>
                    navigator.clipboard.writeText(
                      `${currentUrl}/room/${this.roomID}`
                    )
                  }
                  title="Cliquer pour copier le lien"
                  alt="Cliquer pour copier le lien"
                  style={{ cursor: "pointer" }}
                  value={`${currentUrl}/room/${this.roomID}`}
                  bgColor={
                    document.documentElement.style.getPropertyValue(
                      "--colorBackground"
                    ) || "#d1ffe4"
                  }
                  fgColor={
                    document.documentElement.style.getPropertyValue(
                      "--colorText"
                    ) || "black"
                  }
                  size={this.state.width > 400 ? 200 : this.state.width / 2}
                  level="H"
                  renderAs={"svg"}
                  imageSettings={{
                    src: "/qify/qify.svg",
                    excavate: true,
                    height: this.state.width > 400 ? 50 : this.state.width / 8,
                    width: this.state.width > 400 ? 50 : this.state.width / 8,
                  }}
                ></QRCode>
              </div>
            )}

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
        {this.state.isAdmin && (
          <div
            className={`${listStyle.pin} ${styles.code}`}
            style={{ cursor: "pointer" }}
            onClick={() =>
              navigator.clipboard.writeText(`${currentUrl}/room/${this.roomID}`)
            }
          >
            <p style={{ margin: "0" }}>{this.roomID}</p>
          </div>
        )}
      </>
    );
  }
}

export default withRouter(App);
