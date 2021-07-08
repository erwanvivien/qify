import player_style from "../../styles/Player.module.css";

import { Component } from "react";
import { title } from "../../src/config";

const THRESHOLD = 450;

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

    playButton: "/player/play1.svg",
    paused: false,

    title: "",
  };

  constructor(props) {
    super(props);

    this.player = props.player;
    this.timeout = null;

    this.volume = 0.1;

    this.roomSocket = props.socket;
    this.roomPass = props.roomPass;
    this.roomPin = props.roomPin;
  }

  updateAlbumCover(state) {
    if (state === null)
      /// Disconnected player
      return this.setState({
        image: "/no_image.svg",
        songUri: null,
        playButton: "/player/play1.svg",
        paused: true,
        title: `${title} is disconnected`,
      });

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
      playButton: state.paused ? "/player/play1.svg" : "/player/pause1.svg",
      paused: state.paused,
      title: currentSong.name.replace(/\s+\([^\)]*\)/i, ""),
    });

    if (
      this.props.songQueue.length > 0 &&
      currentSong.uri === this.props.songQueue[0].uri
    )
      this.roomSocket.emit("SONG_POP", {
        pin: this.roomPin,
        pass: this.roomPass,
      });
  }

  componentDidMount() {
    this.interval = setInterval(() => {
      this.player.getVolume().then((volume) => {
        this.updateVolumeImage(volume);
        let elem = document.getElementById("volume-range");
        if (elem) elem.value = volume.toString();
      });
    }, 1500);

    this.player.addListener("player_state_changed", (newState) =>
      this.updateAlbumCover(newState)
    );

    this.player.getCurrentState().then((state) => this.updateAlbumCover(state));
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
      return this.setState({
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

  prev() {
    this.player.previousTrack();
  }

  toggle() {
    this.player.togglePlay();
  }

  getVolumeImage() {
    if (this.volume <= 0.0) return "/player/volume_none.svg";
    if (this.volume <= 0.33) return "/player/volume_low.svg";
    if (this.volume <= 0.67) return "/player/volume_medium.svg";
    if (this.volume <= 1) return "/player/volume_full.svg";
  }

  render() {
    return (
      <>
        <div className={player_style.container}>
          <div className={player_style.song_container}>
            <img
              className={player_style.album_cover}
              src={this.state.image}
            ></img>
            <div className={player_style.title_container}>
              <p className={player_style.title}>{this.state.title}</p>
            </div>
          </div>

          <div className={player_style.buttons}>
            <img
              onClick={() => this.prev()}
              className={player_style.next_prev}
              src="/player/previous2.svg"
            ></img>

            <img
              onClick={() => this.toggle()}
              className={player_style.play_pause}
              src={this.state.playButton}
            ></img>

            <img
              onClick={() => this.next()}
              className={player_style.next_prev}
              src="/player/next2.svg"
            ></img>
          </div>

          <div className={player_style.volume_container}>
            <input
              className={player_style.volume}
              id="volume-range"
              type="range"
              min="0"
              max="1"
              defaultValue="0.1"
              step="any"
              onChange={(ctx) => this.changeVolume(ctx)}
            />

            {this.props.width <= THRESHOLD && (
              <img
                className={player_style.volume_image}
                src={this.getVolumeImage()}
              ></img>
            )}
          </div>
        </div>
      </>
    );
  }
}

export default RoomPlayer;
