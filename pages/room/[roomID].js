import { Component } from "react";

import styles from "../../styles/Home.module.css";
import listStyle from "../../styles/Room.module.css";

import SearchSong from "../../components/room/SearchSong";
import SpotifyItems from "../../components/room/SpotifyItems";

import RoomPlayer from "../../components/room/Player";

import { Default } from "../../components/Default";

import Script from "next/script";

import { currentUrl, paths, title, trimSongs } from "../../src/config";
import io from "socket.io-client";
import { withRouter } from "next/router";

import QRCode from "qrcode.react";
import axios from "axios";

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

  extractPlayerState(state) {
    if (state === null) return [null, true];

    let { track_window, paused } = state;
    let { current_track, next_tracks, previous_tracks } = track_window;

    current_track = {
      title: current_track.name,
      album: current_track.album.name,
      arists: current_track.artists[0].name,
      id: current_track.id,
      uri: current_track.uri,
    };

    next_tracks = next_tracks.map((song) => {
      let imageUrl;
      let max = 0;

      song.album.images.forEach((image) => {
        if (image.width > max) {
          max = image.width;
          imageUrl = image.url;
        }
      });

      return {
        title: trimSongs(song.name),
        album: trimSongs(song.album.name),
        arists: song.artists[0].name,
        id: song.id,
        uri: song.uri,
        image: imageUrl,
        state: 2,
      };
    });
    previous_tracks = previous_tracks.map((song) => {
      return {
        title: song.name,
        album: song.album.name,
        arists: song.artists[0].name,
        id: song.id,
        uri: song.uri,
      };
    });

    state = { paused, current_track, next_tracks, previous_tracks };

    let prev = this.previousState;

    if (typeof prev === "undefined" || prev === null) return [state, true];

    if (state.paused !== prev.paused) {
      return [state, true];
    }
    if (state.current_track.uri !== prev.current_track.uri) {
      return [state, true];
    }

    if (state.next_tracks.length !== prev.next_tracks.length) {
      return [state, true];
    }

    if (
      state.next_tracks.length > 0 &&
      prev.next_tracks.length > 0 &&
      state.next_tracks[0].uri !== prev.next_tracks[0].uri
    ) {
      return [state, true];
    }

    if (
      state.next_tracks.length > 1 &&
      prev.next_tracks.length > 1 &&
      state.next_tracks[1].uri !== prev.next_tracks[1].uri
    ) {
      return [state, true];
    }

    // if (state.previous_tracks.length !== prev.previous_tracks.length) {
    //   return [state, true];
    // }

    // if (
    //   state.previous_tracks.length > 0 &&
    //   prev.previous_tracks.length > 0 &&
    //   state.previous_tracks[0].uri !== prev.previous_tracks[0].uri
    // ) {
    //   return [state, true];
    // }
    // if (
    //   state.previous_tracks.length > 1 &&
    //   prev.previous_tracks.length > 1 &&
    //   state.previous_tracks[1].uri !== prev.previous_tracks[1].uri
    // ) {
    //   return [state, true];
    // }

    return [state, false];
  }

  defineSDKBehaviour({ access_token }) {
    if (typeof window.onSpotifyWebPlaybackSDKReady !== "undefined") return;

    window.onSpotifyWebPlaybackSDKReady = () => {
      const token = access_token;
      this.player = new Spotify.Player({
        name: `${title} 📯`,
        getOAuthToken: (cb) => {
          cb(token);
        },
      });

      // Error handling
      //   this.player.addListener("initialization_error", ({ message }) => {
      //     console.error(message);
      //   });
      //   this.player.addListener("authentication_error", ({ message }) => {
      //     console.error(message);
      //   });
      //   this.player.addListener("account_error", ({ message }) => {
      //     console.error(message);
      //   });
      //   this.player.addListener("playback_error", ({ message }) => {
      //     console.error(message);
      //   });

      // Playback status updates
      this.player.addListener("player_state_changed", (newState) => {
        if (this.timeout) clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
          let [state, refreshNeeded] = this.extractPlayerState(newState);
          if (refreshNeeded === false) return;

          this.setState({
            room: this.state.room,
            loading: this.state.loading,
            songs: this.state.songs,
            width: this.state.width,
            isAdmin: this.state.isAdmin,
          });
          this.previousState = state;
        }, 150);
      });

      // Ready
      this.player.addListener("ready", ({ device_id }) => {
        // console.log("Ready with Device ID", device_id);

        this.deviceId = device_id;

        setTimeout(async () => {
          await axios.put("/api/spotifyTransfer", {
            access_token,
            device_id,
          });
          this.player.setVolume(0.1);
        }, 2000);
      });

      // Not Ready
      //   this.player.addListener("not_ready", ({ device_id }) => {
      //     console.log(device_id, " has gone offline");
      //   });

      // Connect to the player!
      this.player.connect();
    };
  }

  componentDidMount() {
    window.addEventListener("resize", this.handleResize);
    window.addEventListener("pageshow", () =>
      socket.emit("GET_SONGS", this.roomID)
    );
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
      this.defineSDKBehaviour(this.state.room);
      this.setState({
        room: this.state.room,
        loading: this.state.loading,
        songs: this.state.songs,
        isAdmin: isAdmin,
        width: this.state.width,
      });
    });
    socket.on("RES_CHECK_ROOM", (room) => {
      this.setState({
        room,
        loading: false,
        songs: room ? room.songQueue : [],
        isAdmin: this.state.isAdmin,
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
    socket.on("RES_UPDATE_SONG", (songs) => {
      this.setState({
        room: this.state.room,
        loading: this.state.loading,
        songs,
        isAdmin: this.state.isAdmin,
        width: this.state.width,
      });
    });

    socket.on("RES_UPDATE_SONG_FAILED", () => {
      //   console.log("FAILED");
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
      deviceId: this.deviceId,
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
          <h1 className={styles.title}>Ce salon n&apos;existe pas</h1>
          <a href={paths.create} className={styles.description}>
            Veuillez en créer un ou rejoindre un salon existant
          </a>
        </Default>
      );
    }

    return (
      <>
        <Default title={false} classname={listStyle.main} footer={false}>
          {this.state.isAdmin && (
            <Script
              src="https://sdk.scdn.co/spotify-player.js"
              strategy="afterInteractive"
            />
          )}
          <div className={listStyle.search_div}>
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
          )}

          <SpotifyItems songs={this.state.songs} width={this.state.width} />

          <span
            style={{
              height: "90px",
            }}
          ></span>
        </Default>
        {this.player && (
          <RoomPlayer
            player={this.player}
            width={this.state.width}
            songQueue={this.state.songs}
            socket={socket}
            roomPass={this.password}
            roomPin={this.roomID}
          />
        )}
      </>
    );
  }
}

export default withRouter(App);
