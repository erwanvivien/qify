import list_style from "../../styles/Room.module.css";

import { Component } from "react";

export class SpotifyItem extends Component {
  song;
  width;
  index;

  state = {
    full: false,
  };

  constructor(props) {
    super(props);
    this.song = props.song;

    this.width = props.width;
    this.index = props.index;
  }

  toggleImage = () => {
    this.setState({ full: !this.state.full });
  };

  render() {
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
          <div>
            <p className={list_style.listitem_counter} style={{ margin: "0" }}>
              {this.index}
            </p>
          </div>
        </div>
      </>
    );
  }
}

export default SpotifyItem;
