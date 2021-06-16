import search_style from "../styles/Search.module.css";

import { Component } from "react";
import axios from "axios";
import qs from "querystring";

import Results from "./Results";

const instance = axios.create(); /// Hack because axios removes Authorization header

class SearchSong extends Component {
  state;
  access_token;
  roomID;
  intervalId;

  latest;
  current;
  lastInput;

  constructor(props) {
    super(props);

    this.access_token = props.access_token;
    this.roomID = props.roomID;
    this.state = { results: null };

    this.latest = "";
    this.current = "";
    this.lastInput = Date.now();
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

    this.setState({
      results: data,
    });
  }

  handleChange = async (event) => {
    let text = event.target.value;
    if (text === "") this.setState({ results: null });

    this.current = text;
  };

  render() {
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
          <Results results={this.state.results} roomID={this.roomID} />
        </div>
      </>
    );
  }
}

export default SearchSong;
