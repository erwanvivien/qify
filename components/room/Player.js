import playerStyle from "../../styles/Player.module.css";

import { Component } from "react";
import { title, trimSongs } from "../../src/config";
import Image from "next/image";

const THRESHOLD = 450;

import imageVolumeNone from "../../public/player/volume_none.svg";
import imageVolumeLow from "../../public/player/volume_low.svg";
import imageVolumeMedium from "../../public/player/volume_medium.svg";
import imageVolumeFull from "../../public/player/volume_full.svg";
import imageNoImage from "../../public/no_image.svg";

import imagePlay from "../../public/player/play1.svg";
import imagePause from "../../public/player/pause1.svg";
import imageNext from "../../public/player/next2.svg";
// import imagePrev from "../../public/player/previous2.svg";

import Script from "next/script";
import axios from "axios";

class RoomPlayer extends Component {
  player;
  timeout;

  volume;

  interval;

  roomSocket;
  roomPass;
  roomPin;

  state = {
    image: "/no_image.svg",
    songUri: null,

    playButton: imagePlay,
    paused: false,

    title: "",
  };

  constructor(props) {
    super(props);

    this.timeout = null;

    this.volume = 0.5;

    this.roomSocket = props.socket;
    this.roomPass = props.roomPass;
    this.roomPin = props.roomPin;
  }

  updateAlbumCover(state) {
    if (state === null) {
      // Disconnected player
      this.setState({
        image: "/no_image.svg",
        songUri: null,
        playButton: imagePlay,
        paused: true,
        title: `${title} is disconnected`,
      });
      return;
    }

    let currentSong = state.track_window.current_track;
    if (
      currentSong.uri === this.state.songUri &&
      state.paused === this.state.paused
    )
      return;

    let imageUrl;
    let max = 0;

    currentSong.album.images.forEach((image) => {
      if (image.width > max) {
        max = image.width;
        imageUrl = image.url;
      }
    });

    this.setState({
      image: imageUrl,
      songUri: currentSong.uri,
      playButton: state.paused ? imagePlay : imagePause,
      paused: state.paused,
      title: trimSongs(currentSong.name),
    });
  }

  extractPlayerState(state) {
    if (state === null) return [null, true];

    let { track_window, paused, position, duration } = state;
    let { current_track, next_tracks, previous_tracks } = track_window;

    current_track = {
      title: current_track.name,
      album: current_track.album.name,
      uri: current_track.uri,
    };

    next_tracks = next_tracks.map((song) => {
      return {
        title: trimSongs(song.name),
        album: trimSongs(song.album.name),
        uri: song.uri,
      };
    });
    previous_tracks = previous_tracks.map((song) => {
      return {
        title: song.name,
        album: song.album.name,
        uri: song.uri,
      };
    });

    state = {
      paused,
      current_track,
      next_tracks,
      previous_tracks,
      duration,
      position,
    };

    const prev = this.previousState;

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

    // No need to check both sizes, check was before
    for (let i = 0; i < prev.next_tracks.length; i += 1)
      if (state.next_tracks[i].uri !== prev.next_tracks[i].uri)
        return [state, true];

    return [state, false];
  }

  componentDidMount() {
    window.onSpotifyWebPlaybackSDKReady = () => {
      const token = this.props.access_token;
      this.player = new Spotify.Player({
        name: `${title} 📯`,
        getOAuthToken: (cb) => {
          cb(token);
        },
      });

      this.player.addListener("player_state_changed", (newState) => {
        if (!this.deviceId) return;

        let [state, refreshNeeded] = this.extractPlayerState(newState);
        if (refreshNeeded) this.updateAlbumCover(newState);

        this.props.isPlaying(newState ? this.state.paused === false : false);

        if (
          (this.previousState &&
            state &&
            this.previousState.position === state.position) ||
          !state
        ) {
          this.previousState = state;
          return;
        }

        this.roomSocket.emit("UPDATE_STATE", {
          ...{
            pin: this.roomPin,
            timer: state.duration - state.position,
            paused: state.paused || !state,
            image: this.state.image,
            deviceId: this.deviceId,
          },
          ...state.current_track,
        });

        this.previousState = state;
      });

      // Ready
      this.player.addListener("ready", async ({ device_id }) => {
        this.deviceId = device_id;

        await axios.put("/api/spotifyTransfer", {
          access_token: this.props.access_token,
          device_id,
        });

        this.player.setVolume(0.1);
        this.player.resume();

        this.interval = setInterval(() => {
          this.player.getVolume().then((volume) => {
            this.updateVolumeImage(volume);
            let elem = document.getElementById("volume-range");
            if (elem) elem.value = volume.toString();
          });
        }, 1500);
      });

      // Connect to the player!
      this.player.connect();
    };
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  changeVolume(ctx) {
    if (this.timeout !== null) clearTimeout(this.timeout);

    this.timeout = setTimeout(() => {
      this.player.setVolume(ctx.target.value);
    }, 100);

    this.updateVolumeImage(ctx.target.value);
  }

  updateVolumeImage(volume) {
    let currentImage = this.getVolumeImage();
    this.volume = volume;
    if (currentImage !== this.getVolumeImage()) {
      this.setState(this.state);
    }
  }

  next() {
    this.roomSocket.emit("NEXT", {
      pin: this.roomPin,
      deviceId: this.deviceId,
    });
  }

  toggleTimeout;
  toggle() {
    clearTimeout(this.toggleTimeout);
    this.toggleTimeout = setTimeout(async () => {
      if (!this.player || this.state.title === `${title} is disconnected`) {
        await axios.put("/api/spotifyTransfer", {
          access_token: this.props.access_token,
          device_id: this.deviceId,
        });
      }
      this.player.togglePlay();
    }, 200);
    // roomSocket.emit("PAUSE");
  }

  getVolumeImage() {
    if (this.volume <= 0.0) return imageVolumeNone;
    if (this.volume <= 0.33) return imageVolumeLow;
    if (this.volume <= 0.67) return imageVolumeMedium;
    if (this.volume <= 1) return imageVolumeFull;
    return imageNoImage;
  }

  render() {
    return (
      <>
        <Script
          src="https://sdk.scdn.co/spotify-player.js"
          strategy="lazyOnload"
        />
        <div className={playerStyle.container}>
          <div className={playerStyle.song_container}>
            <Image
              className={playerStyle.album_cover}
              src={this.state.image}
              width={60}
              height={60}
              alt={`Album cover of the current song`}
            />
            <div className={playerStyle.title_container}>
              <p className={playerStyle.title}>{this.state.title}</p>
            </div>
          </div>

          <div className={playerStyle.buttons}>
            <span
              style={{
                height: "30px",
                width: "30px",
              }}
            ></span>

            <Image
              onClick={() => this.toggle()}
              className={playerStyle.play_pause}
              src={this.state.playButton}
              width={70}
              height={70}
              quality={100}
              alt="Play/pause button"
            />

            <Image
              onClick={() => this.next()}
              className={playerStyle.next_prev}
              src={imageNext}
              width={30}
              height={30}
              quality={100}
              alt="Next button"
            />
          </div>

          <div className={playerStyle.volume_container}>
            <input
              className={playerStyle.volume}
              id="volume-range"
              type="range"
              min="0"
              max="1"
              defaultValue="0.5"
              step="any"
              onChange={(ctx) => this.changeVolume(ctx)}
            />

            {this.props.width <= THRESHOLD && (
              <Image
                className={playerStyle.volume_image}
                height={50}
                width={50}
                layout="fixed"
                src={this.getVolumeImage()}
                alt="Song if device is too small"
              />
            )}
          </div>
        </div>
      </>
    );
  }
}

export default RoomPlayer;
