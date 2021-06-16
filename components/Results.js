import result_style from "../styles/Search.module.css";

import { Component } from "react";

import axios from "axios";

class Results extends Component {
  render() {
    let { results } = this.props;
    if (!results || !results.tracks) return <></>;

    let { tracks } = results;
    return (
      <>
        <div className={result_style.list}>
          {tracks.items.slice(0, 5).map((item, index) => {
            return <Items item={item} roomID={this.props.roomID} key={index} />;
          })}
        </div>
      </>
    );
  }
}

class Items extends Component {
  extractSong(data) {
    let album_name = data.album.name;
    let song_name = data.name;
    let imageUrl = "/no_image.svg";
    let id = data.id;

    let max = 0;
    data.album.images.forEach((image) => {
      if (image.width > max) {
        max = image.width;
        imageUrl = image.url;
      }
    });

    return [imageUrl, song_name, album_name, id];
  }

  async addSong(song, best_image) {
    // await axios.post("/api/addSong", {
    //   song,
    //   best_image,
    //   roomID: this.roomID,
    // });
  }

  render() {
    let item = this.props.item;
    let roomID = this.props.roomID;

    let [imageUrl, song_name, album_name, id] = this.extractSong(item);

    var slice = false;
    if (song_name.length > 35) slice = true;

    return (
      <>
        <a
          href="#"
          onClick={() => this.addSong(item, imageUrl)}
          className={result_style.items}
        >
          <div className={result_style.list_container}>
            <img
              src={imageUrl}
              style={{ height: "50px", paddingLeft: "1px" }}
            ></img>

            <div style={{ width: "100%" }}>
              <p style={{ margin: "0" }}>
                <span className={result_style.title}>
                  {slice ? song_name.slice(0, 35) + " ..." : song_name}
                </span>
                <span className={result_style.album}>
                  {song_name !== album_name && !slice ? ` - ${album_name}` : ""}
                </span>
              </p>
            </div>
          </div>
        </a>
      </>
    );
  }
}

export default Results;
