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
import imagePrevious from "../../public/player/previous2.svg";
import imageNext from "../../public/player/next2.svg";

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

    this.player = props.player;
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

  prev() {
    this.player.previousTrack();
  }

  toggle() {
    this.player.togglePlay();
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
              onClick={() => this.prev()}
              className={playerStyle.next_prev}
              src={imagePrevious}
              width={30}
              height={30}
              alt="Previous button"
            />

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
