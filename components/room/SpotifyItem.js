import list_style from "../../styles/Room.module.css";

import { Component } from "react";
import Image from "next/image";

export class SpotifyItem extends Component {
  song;
  width;
  index;

  state = {
    full: false,
  };

  constructor(props) {
    super(props);
  }

  toggleImage = () => {
    this.setState({ full: !this.state.full });
  };

  render() {
    let width = this.props.width;
    let index = this.props.index;
    let song = this.props.song;
    if (!song) return <></>;

    var single = song.album === song.title;

    return (
      <>
        <div className={list_style.card}>
          <Image
            src={song.image}
            style={{ height: "50px" }}
            alt={`Image in the queue for song ${song.title}`}
          />

          <div
            style={{
              display: single ? "flex" : "",
            }}
            className={list_style.textcontainer}
          >
            <p className={`${list_style.title} ${list_style.text}`} style={{}}>
              {song.title}
            </p>
            {!single && width > 400 && (
              <p className={`${list_style.album} ${list_style.text}`}>
                {song.album}
              </p>
            )}
          </div>
          {width > 300 && (
            <div>
              <p
                className={list_style.listitem_counter}
                style={{ margin: "0" }}
              >
                {index}
              </p>
            </div>
          )}
        </div>
      </>
    );
  }
}

export default SpotifyItem;
