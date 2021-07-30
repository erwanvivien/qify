import listStyle from "../../styles/Room.module.css";

import { Component } from "react";
import Image from "next/image";

import heartFull from "../../public/heart-full.svg";
import heartVoid from "../../public/heart-none.svg";

import { trimSongs } from "../../src/config";

class Item extends Component {
  constructor(props) {
    super(props);
  }

  state = {
    image: heartVoid,
  };

  handleClick = () => {
    this.setState({
      image: this.state.image.src === heartVoid.src ? heartFull : heartVoid,
    });
  };

  render() {
    let width = this.props.width;
    let song = this.props.song;
    if (!song) return <></>;

    let single = song.album === song.title;
    let title = trimSongs(song.title);
    if (title.length > 25) title = title.slice(0, 25 - 3) + "...";

    let album = trimSongs(song.album);
    if (album.length > 25) album = album.slice(0, 25 - 3) + "...";

    return (
      <>
        <div className={listStyle.card}>
          <Image
            src={song.image}
            height={50}
            width={50}
            alt={`Image in the queue for song ${title}`}
          />

          <div
            style={{
              display: single ? "flex" : "",
            }}
            className={listStyle.textcontainer}
          >
            <div className={listStyle.elipspis}>
              <p className={`${listStyle.title} ${listStyle.text}`} style={{}}>
                {title}
              </p>
            </div>
            {!single && width > 400 && (
              <div className={listStyle.elipspis}>
                <p className={`${listStyle.album} ${listStyle.text}`}>
                  {album}
                </p>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }
}

class SpotifyItems extends Component {
  render() {
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
            <Item song={song} width={this.props.width} />
          </li>
        ))}
      </ul>
    );
  }
}

export default SpotifyItems;
