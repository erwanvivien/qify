import searchStyle from "../../styles/Search.module.css";
import resultStyle from "../../styles/Search.module.css";

import { Component } from "react";
import axios from "axios";

import Items from "./Items";
import { trimSongs } from "../../src/config";

class SearchSong extends Component {
  state;
  access_token;
  intervalId;

  latest;
  timeout = null;

  constructor(props) {
    super(props);

    this.access_token = props.access_token;
    this.country = props.country;
    this.addSong = props.addSong;
    this.state = { results: [] };

    this.latest = "";
    this.current = "";
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
        arists: song.artists[0].name,
        image: imageUrl,
        id: song.id,
        uri: song.uri,
        state: 1,
      };
    });

    return results;
  }

  search = (event) => {
    let value = event.target.value;

    if (value === this.latest) return;
    this.latest = value;
    if (value === "") {
      this.setState({
        results: [],
      });
      return;
    }

    if (this.timeout) clearTimeout(this.timeout);

    this.timeout = setTimeout(async () => {
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
              type="input"
              className={searchStyle.form__field}
              onChange={this.search}
              id="search_box"
              name="name"
              required
            />
            <label className={searchStyle.form__label}>Search</label>
          </div>
          <div className={resultStyle.list}>
            {tracks.map((item, index) => {
              return <Items item={item} addSong={this.addSong} key={index} />;
            })}
          </div>
        </div>
      </>
    );
  }
}

export default SearchSong;
