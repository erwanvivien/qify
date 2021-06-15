import { Component } from "react";

import styles from "../../styles/Home.module.css";
import list_style from "../../styles/Room.module.css";

import SearchSong from "../../components/SearchSong";
import SpotifyItem from "../../components/SpotifyItem";

import { Default } from "../../components/Default";

import { paths } from "../../src/config";
import axios from "axios";
import Room from "../../src/Room";
import { io } from "socket.io-client";

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
    error: false,
    songs: [],
    width: 800,
  };

  constructor(props) {
    super(props);
    this.roomID = props.roomID;

    this.state = {
      error: props.songs === null,
      songs: props.songs,
      width: 800,
    };

    if (props.room_str) this.room = JSON.parse(props.room_str, string_to_date);
  }

  handleResize = (e) => {
    this.setState({
      error: this.state.error,
      songs: this.state.songs,
      width: window.innerWidth,
    });
  };

  componentDidMount() {
    // this.intervalId = setInterval(this.loop.bind(this), 2000);
    window.addEventListener("resize", this.handleResize);

    socket.on("RES_CHECK_ROOM", (e) => {
      return {
        props: { roomID: e ? pin : null }, // will be passed to the page component as props
      };
    });
  }

  componentWillUnmount() {
    clearInterval(this.intervalId);
  }

  render() {
    if (this.error) {
      return (
        <Default title={false}>
          <>
            <h1 className={styles.title}>Ce salon n'existe pas</h1>
            <a href={paths.create} className={styles.description}>
              Veuillez en créer un ou rejoindre un salon existant
            </a>
          </>
        </Default>
      );
    }

    return (
      <Default title={false} classname={list_style.main}>
        {/* <div className={list_style.search_div}>
          <SearchSong
            access_token={this.room.access_token}
            roomID={this.roomID}
          />
        </div> */}

        <a
          href="#"
          onClick={() =>
            navigator.clipboard.writeText(
              "http://localhost:8888/room/" + this.roomID
            )
          }
          style={{ textAlign: "center" }}
        >
          <h2>Click to invite your friends</h2>
        </a>

        {/* <ul className={list_style.list}>
          {this.state.songs.map((song, index) => (
            <li className={list_style.listitem} key={index}>
              <SpotifyItem
                song={song}
                roomID={this.roomID}
                width={this.state.width}
              />
            </li>
          ))}
        </ul> */}
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
