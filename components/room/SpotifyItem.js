import listStyle from "../../styles/Room.module.css";

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

    let single = song.album === song.title;

    return (
      <>
        <div className={listStyle.card}>
          <Image
            src={song.image}
            style={{ height: "50px" }}
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

export default SpotifyItem;
