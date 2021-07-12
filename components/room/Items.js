import resultStyle from "../../styles/Search.module.css";

import { Component } from "react";
import Image from "next/image";

class Items extends Component {
  render() {
    let addSong = this.props.addSong;
    let item = this.props.item;
    let { image, title, album } = item;

    let slice = false;
    if (title.length > 35) slice = true;

    return (
      <>
        <a href="#" onClick={() => addSong(item)} className={resultStyle.items}>
          <div className={resultStyle.list_container}>
            <Image
              src={image}
              width={50}
              height={50}
              //   layout="responsive"
              //   style={{ height: "50px", paddingLeft: "1px" }}
              alt={`Spotify song ${title}`}
            />

            <div style={{ width: "100%" }}>
              <p style={{ margin: "0" }}>
                <span className={resultStyle.title}>
                  {slice ? title.slice(0, 35) + " ..." : title}
                </span>
                <span className={resultStyle.album}>
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
