import styles from "../styles/Home.module.css";
import list_style from "../styles/Room.module.css";

import Link from "next/link";
// import { BrowserRouter as Router, Link } from "react-router-dom";

import { Component, FunctionComponent } from "react";

export class SpotifyItem extends Component {
  song;
  width;

  state = {
    full: false,
  };

  constructor(props) {
    super(props);
    this.song = props.song;

    this.width = props.width;
  }

  toggleImage = () => {
    this.setState({ full: !this.state.full });
  };

  render() {
    // var heartUrl = this.state.full ? "/heart-full.svg" : "/heart-none.svg";
    var single = this.song.album === this.song.title;

    return (
      <>
        <div className={list_style.card}>
          <img src={this.song.image} style={{ height: "50px" }}></img>

          <div
            style={{
              display: single ? "flex" : "",
            }}
            className={list_style.textcontainer}
          >
            <p className={`${list_style.title} ${list_style.text}`} style={{}}>
              {this.song.title}
            </p>
            {!single && this.width > 400 && (
              <p className={`${list_style.album} ${list_style.text}`}>
                {this.song.album}
              </p>
            )}
          </div>

          {/* {this.width > 600 && (
            <p className={list_style.likes}>{this.song.like_number}</p>
          )} */}

          {/* <img
            onClick={this.toggleImage}
            src={heartUrl}
            className={list_style.heart}
          ></img> */}
        </div>
      </>
    );
  }
}

export default SpotifyItem;
