import search_style from "../styles/Search.module.css";
import result_style from "../styles/Search.module.css";

import { Component } from "react";
import axios from "axios";
import qs from "querystring";

import Items from "./Results";

const instance = axios.create(); /// Hack because axios removes Authorization header

class SearchSong extends Component {
  state;
  access_token;
  intervalId;

  latest;
  current;

  constructor(props) {
    super(props);

    this.access_token = props.access_token;
    this.addSong = props.addSong;
    this.state = { results: [] };

    this.latest = "";
    this.current = "";
  }

  componentDidMount() {
    this.intervalId = setInterval(this.timer.bind(this), 500);
  }

  componentWillUnmount() {
    clearInterval(this.intervalId);
  }

  async timer() {
    let value = this.current;

    if (value === this.latest) return;
    this.latest = value;
    if (value === "") return;

    let { data } = await axios.get("/api/spotifySearch", {
      params: {
        query: value,
        country: "FR",
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
        title: song.name,
        album: song.album.name,
        arists: song.artists[0].name,
        image: imageUrl,
        id: song.id,
        uri: song.uri,
      };
    });

    this.setState({
      results,
    });
  }

  handleChange = async (event) => {
    let text = event.target.value;
    if (text === "") this.setState({ results: null });

    this.current = text;
  };

  render() {
    let tracks = this.state.results;
    return (
      <>
        <div className={search_style.search_width}>
          <div className={search_style.form__group}>
            <input
              type="input"
              className={search_style.form__field}
              onChange={this.handleChange}
              id="search_box"
              name="name"
              required
            />
            <label className={search_style.form__label}>Search</label>
          </div>
          {/* <Results results={this.state.results} addSong={this.addSong} /> */}
          <div className={result_style.list}>
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
