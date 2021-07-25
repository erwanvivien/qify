import searchStyle from "../../styles/Search.module.css";
import resultStyle from "../../styles/Search.module.css";

import { Component } from "react";
import axios from "axios";

import { trimSongs } from "../../src/config";

import Image from "next/image";

class Items extends Component {
  render() {
    let addSong = this.props.addSong;
    let item = this.props.item;
    let { image, title, album } = item;

    return (
      <>
        <div onClick={() => addSong(item)} className={resultStyle.items}>
          <div className={resultStyle.list_container}>
            <Image
              src={image}
              width={50}
              height={50}
              alt={`Spotify song ${title}`}
            />

            <div
              style={{ width: "100%", maxwidth: "100%" }}
              className={resultStyle.elipsis}
            >
              <p style={{ margin: "0" }} className={resultStyle.elipsis}>
                <b>{title}</b>
              </p>
              {title !== album && this.props.width >= 400 && (
                <p style={{ margin: "0" }} className={resultStyle.album}>
                  {album}
                </p>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }
}

class SearchSong extends Component {
  state = { results: [] };
  access_token;
  intervalId;

  latest = "";
  current = "";
  timeout = null;

  constructor(props) {
    super(props);

    this.access_token = props.access_token;
    this.country = props.country;
    this.addSong = props.addSong;
  }

  async searchSpotify(query) {
    let { data } = await axios.get("/api/spotifySearch", {
      params: {
        query,
        country: this.country,
        access_token: this.access_token,
      },
    });

    let tracks = data.tracks.items;

    let results = tracks.map((song) => {
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
        image: imageUrl,
        uri: song.uri,
      };
    });

    return results;
  }

  componentDidUpdate() {
    let input = document.getElementById("roomSongSearchInput");
    if (!input) return;

    if (input.value !== this.latest)
      this.search({
        target: {
          value: input.value,
        },
      });
  }

  componentWillUnmount() {
    clearTimeout(this.timeout);
  }

  search = (event) => {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(async () => {
      let value = event.target.value;

      if (value === "") {
        this.setState({
          results: [],
        });
        this.latest = value;
        return;
      }
      if (value === this.latest) return;
      this.latest = value;
      let results = await this.searchSpotify(value);

      this.setState({
        results,
      });
    }, 400);
  };

  render() {
    let tracks = this.state.results;
    return (
      <>
        <div className={searchStyle.search_width}>
          <div className={searchStyle.form__group}>
            <input
              id="roomSongSearchInput"
              type="input"
              className={searchStyle.form__field}
              onChange={this.search}
              required
            />
            <label className={searchStyle.form__label}>Search</label>
          </div>
          {tracks && tracks.length !== 0 && (
            <div className={resultStyle.list}>
              {tracks.map((item, index) => {
                return (
                  <Items
                    item={item}
                    addSong={this.addSong}
                    key={index}
                    width={this.props.width}
                  />
                );
              })}
            </div>
          )}
        </div>
      </>
    );
  }
}

export default SearchSong;
