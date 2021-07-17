import listStyle from "../../styles/Room.module.css";

import { Component } from "react";
import Image from "next/image";

class Item extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    let width = this.props.width;
    let index = this.props.index;
    let song = this.props.song;
    if (!song) return <></>;

    let single = song.album === song.title;

    return (
      <>
        <div className={listStyle.card}>
          <Image
            src={song.image}
            height={50}
            width={50}
            alt={`Image in the queue for song ${song.title}`}
          />

          <div
            style={{
              display: single ? "flex" : "",
            }}
            className={listStyle.textcontainer}
          >
            <p className={`${listStyle.title} ${listStyle.text}`} style={{}}>
              {song.title}
            </p>
            {!single && width > 400 && (
              <p className={`${listStyle.album} ${listStyle.text}`}>
                {song.album}
              </p>
            )}
          </div>
          {width > 300 && (
            <div>
              <p className={listStyle.listitem_counter} style={{ margin: "0" }}>
                {index}
              </p>
            </div>
          )}
        </div>
      </>
    );
  }
}

class SpotifyItems extends Component {
  render() {
    console.log(this.props);
    return (
      <ul className={listStyle.list}>
        {this.props.songs.map((song, index) => (
          <li
            className={listStyle.listitem}
            style={{
              width: "100%",
            }}
            key={index}
          >
            <Item song={song} width={this.props.width} index={index} />{" "}
          </li>
        ))}
      </ul>
    );
  }
}

export default SpotifyItems;
