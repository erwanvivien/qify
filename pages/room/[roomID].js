import { Component } from "react";

import styles from "../../styles/Home.module.css";
import list_style from "../../styles/Room.module.css";

import SearchSong from "../../components/SearchSong";
import SpotifyItem from "../../components/SpotifyItem";

import { Default } from "../../components/Default";

import { paths } from "../../src/config";
import io from "socket.io-client";

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

  state = {
    room: null,
    loading: true,
    songs: [],
    width: 800,
  };

  constructor(props) {
    super(props);
    this.roomID = props.roomID;

    if (props.room_str) this.room = JSON.parse(props.room_str, string_to_date);
  }

  handleResize = (e) => {
    this.setState({
      room: this.state.room,
      loading: this.state.loading,
      songs: this.state.songs,
      width: window.innerWidth,
    });
  };

  componentDidMount() {
    // this.intervalId = setInterval(this.loop.bind(this), 2000);
    window.addEventListener("resize", this.handleResize);

    socket.on("RES_CHECK_ROOM", (room) => {
      this.setState({
        room,
        loading: false,
        songs: room ? room.songQueue : null,
        width: this.state.width,
      });
      if (room) socket.emit("JOIN_ROOM", this.roomID);
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

        <div style={{ display: "flex", justifyContent: "center" }}>
          <a
            href="#"
            onClick={() =>
              navigator.clipboard.writeText(
                "http://localhost:8888/room/" + this.roomID
              )
            }
          >
            <h2 style={{ width: "fit-content" }}>Inviter des amis</h2>
          </a>
        </div>

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

export default App;

export async function getStaticPaths(context) {
  return {
    paths: [], //indicates that no page needs be created at build time
    fallback: "blocking", //indicates the type of fallback
  };
}

export async function getStaticProps(props) {
  let pin = props.params.roomID;
  return {
    props: {
      roomID: pin,
    },
  };
}
