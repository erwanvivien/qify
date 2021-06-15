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

    instance.defaults.headers.common["access_token"] = this.access_token;
  }

  componentDidMount() {
    this.intervalId = setInterval(this.timer.bind(this), 500);
  }

  componentWillUnmount() {
    clearInterval(this.intervalId);
  }

  async timer() {
    const waitFor = 0.5 * 1000; /// 0.5s

    let value = this.current;
    let lastInput = this.lastInput;
    let now = Date.now();

    if (value === "") return;
    if (value === this.latest) return;
    if (lastInput === null) return;
    if (lastInput + waitFor < now) return;

    this.latest = value;

    instance.defaults.headers.common["query"] = value;
    let { data } = await instance.get("/api/spotifySearch");

    this.setState({
      results: data.data,
    });
  }

  handleChange = async (event) => {
    let text = event.target.value;
    if (text === "") this.setState({ results: null });

    this.current = text;
    this.lastInput = Date.now();
  };

  render() {
    let results = this.state.results;
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
          <Results results={results} roomID={this.roomID} />
        </div>
      </>
    );
  }
}

export default SearchSong;
