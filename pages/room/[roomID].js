import { Component } from "react";

import styles from "../../styles/Home.module.css";
import list_style from "../../styles/Room.module.css";

import SearchSong from "../../components/SearchSong";
import SpotifyItem from "../../components/SpotifyItem";

import { Default } from "../../components/Default";

import { paths, title } from "../../src/config";
import io from "socket.io-client";
import { withRouter } from "next/router";

import QRCode from "qrcode.react";

const date_to_string = (k, v) => {
  if (v instanceof Date) return v.getMilliseconds();
  return v;
};
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

  state = {
    room: null,
    loading: true,
    songs: [],
    width: 800,
    isAdmin: false,
  };

  constructor(props) {
    super(props);
    this.roomID = props.roomID;
    this.router = props.router;

    this.password = this.props.pass;

    if (props.room_str) this.room = JSON.parse(props.room_str, string_to_date);
  }

  handleResize = (e) => {
    this.setState({
      room: this.state.room,
      loading: this.state.loading,
      songs: this.state.songs,
      isAdmin: this.state.isAdmin,
      width: window.innerWidth,
    });
  };

  localStorageUpdate() {
    const TWO_HOUR = 2 * 60 * 60 * 1000; /* ms */

    const passwordKey = `${title}-password`;
    const timestampKey = `${title}-timestamp`;
    const roomPinKey = `${title}-room`;

    let password = localStorage.getItem(passwordKey);
    let timestamp = localStorage.getItem(timestampKey);
    let roomPin = localStorage.getItem(roomPinKey);

    if (!timestamp || roomPin !== this.roomID) {
      localStorage.setItem(passwordKey, this.password);
      localStorage.setItem(timestampKey, new Date().toString());
      localStorage.setItem(roomPinKey, this.roomID);
      return;
    }

    let timestampDate = Date.parse(timestamp);
    if (new Date() - timestampDate < TWO_HOUR) {
      /// Less than two hours
      this.password = password || this.password;
    }
  }

  componentDidMount() {
    window.addEventListener("resize", this.handleResize);

    this.router.push(
      {
        pathname: this.router.pathname,
        query: {
          roomID: this.roomID,
        },
      },
      undefined,
      { shallow: true }
    );

    socket.on("JOIN_ROOM_ADMIN", (isAdmin) =>
      this.setState({
        room: this.state.room,
        loading: this.state.loading,
        songs: this.state.songs,
        isAdmin: isAdmin,
        width: this.state.width,
      })
    );
    socket.on("RES_CHECK_ROOM", (room) => {
      this.setState({
        room,
        loading: false,
        songs: room ? room.songQueue : null,
        width: this.state.width,
      });
      if (!room) return;

      this.localStorageUpdate();

      socket.emit("JOIN_ROOM", this.roomID);
      socket.emit("JOIN_ROOM_ADMIN", {
        pin: this.roomID,
        pass: this.password,
      });
    });
    socket.on("RES_ADD_SONG", (songs) => {
      console.log(songs);
      this.setState({
        room: this.state.room,
        loading: this.state.loading,
        songs,
        width: this.state.width,
      });
    });

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
    });
  }

  displayQR() {
    return this.state.width > 500 && this.state.isAdmin;
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
          <h1 className={styles.title}>Ce salon n'existe pas</h1>
          <a href={paths.create} className={styles.description}>
            Veuillez en créer un ou rejoindre un salon existant
          </a>
        </Default>
      );
    }

    return (
      <Default title={false} classname={list_style.main}>
        <div className={list_style.search_div}>
          <SearchSong
            access_token={this.state.room.access_token}
            country={this.state.room.country}
            addSong={this.addSong.bind(this)}
          />
        </div>

        {this.displayQR() && (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <QRCode
              onClick={() =>
                navigator.clipboard.writeText(
                  `http://localhost:8888/room/${this.roomID}`
                )
              }
              title="Cliquer pour copier le lien"
              style={{ cursor: "pointer" }}
              value={`http://localhost:8888/room/${this.roomID}`}
              bgColor={"#ecedf1"}
              level="L"
            ></QRCode>
          </div>
        )}

        <ul className={list_style.list}>
          {this.state.songs.map((song, index) => (
            <li className={list_style.listitem} key={index}>
              <SpotifyItem song={song} width={this.state.width} />
            </li>
          ))}
        </ul>
      </Default>
    );
  }
}

export default withRouter(App);

export async function getServerSideProps(props) {
  let pin = props.query.roomID;
  let pass = props.query.pass;

  return {
    props: {
      roomID: pin,
      pass: pass === undefined ? null : pass,
    },
  };
}
