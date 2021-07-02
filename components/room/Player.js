import player_style from "../../styles/Player.module.css";

import { Component } from "react";
import { title } from "../../src/config";

class RoomPlayer extends Component {
  player;
  timeout;

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
    // this.changeVolume.bind(this);
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

    if (imageUrl === this.state.image && state.paused === this.state.paused)
      return;

    this.setState({
      image: imageUrl,
      songUri: currentSong.uri,
      playButton: state.paused ? "/player/play1.svg" : "/player/pause1.svg",
      paused: state.paused,
      title: currentSong.name.replace(/\s+\([^\)]*\)/i, ""),
    });
  }

  componentDidMount() {
    setTimeout(() => {
      this.player.getVolume().then((volume) => {
        console.log(volume);
        document.getElementById("volume-range").value = volume.toString();
      });
    }, 1000);

    this.player.addListener("player_state_changed", (newState) =>
      this.updateAlbumCover(newState)
    );

    this.player.getCurrentState().then((state) => this.updateAlbumCover(state));
  }

  changeVolume(ctx) {
    if (this.timeout !== null) clearTimeout(this.timeout);

    this.timeout = setTimeout(() => {
      this.player.setVolume(ctx.target.value);
    }, 100);
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
          </div>
        </div>
      </>
    );
  }
}

export default RoomPlayer;
