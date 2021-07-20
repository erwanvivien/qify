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

  songNextTimeout;

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
      return {
        title: trimSongs(song.name),
        album: trimSongs(song.album.name),
        arists: song.artists[0].name,
        id: song.id,
        uri: song.uri,
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

      // Playback status updates
      this.player.addListener("player_state_changed", (newState) => {
        let [state, refreshNeeded] = this.extractPlayerState(newState);
        if (refreshNeeded === false) return;

        if (
          this.props.songQueue.length >= 1 &&
          this.props.songQueue[0].uri !== state.current_track.uri
        ) {
          this.roomSocket.emit("NEXT", this.roomPin);
        }

        this.setState({
          image: this.state.image,
          songUri: this.state.songUri,
          playButton: this.state.playButton,
          paused: this.state.paused,
          title: this.state.title,
        });

        this.previousState = state;
      });

      // Ready
      this.player.addListener("ready", async ({ device_id }) => {
        this.deviceId = device_id;

        await axios.put("/api/spotifyTransfer", {
          access_token: this.props.access_token,
          //   uri: this.state.songUri,
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

      this.player.addListener("player_state_changed", (newState) => {
        this.updateAlbumCover(newState);

        this.props.isPlaying(newState ? this.state.paused === false : false);
        if (!newState) return;

        clearTimeout(this.songNextTimeout);
        if (newState.paused === true) {
          return;
        }

        this.songNextTimeout = setTimeout(() => {
          this.roomSocket.emit("NEXT", this.roomPin);
        }, newState.duration - newState.position);
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
      this.setState({
        image: this.state.image,
        songUri: this.state.songUri,
        playButton: this.state.playButton,
        paused: this.state.paused,
        title: this.state.title,
      });
    }
  }

  next() {
    this.player.nextTrack();
  }

  toggle() {
    this.player.togglePlay();
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
            <Image
              onClick={() => this.toggle()}
              className={playerStyle.play_pause}
              src={this.state.playButton}
              width={70}
              height={70}
              alt="Play/pause button"
            />

            <Image
              onClick={() => this.next()}
              className={playerStyle.next_prev}
              src={imageNext}
              width={30}
              height={30}
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
