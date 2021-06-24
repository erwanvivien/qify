import result_style from "../../styles/Search.module.css";

import { Component } from "react";

class Items extends Component {
  render() {
    let addSong = this.props.addSong;
    let item = this.props.item;
    let { image, title, album } = item;

    var slice = false;
    if (title.length > 35) slice = true;

    return (
      <>
        <a
          href="#"
          onClick={() => addSong(item)}
          className={result_style.items}
        >
          <div className={result_style.list_container}>
            <img
              src={image}
              style={{ height: "50px", paddingLeft: "1px" }}
            ></img>

            <div style={{ width: "100%" }}>
              <p style={{ margin: "0" }}>
                <span className={result_style.title}>
                  {slice ? title.slice(0, 35) + " ..." : title}
                </span>
                <span className={result_style.album}>
                  {title !== album && !slice ? ` - ${album}` : ""}
                </span>
              </p>
            </div>
          </div>
        </a>
      </>
    );
  }
}

export default Items;
