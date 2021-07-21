import resultStyle from "../../styles/Search.module.css";

import { Component } from "react";
import Image from "next/image";

class Items extends Component {
  render() {
    let addSong = this.props.addSong;
    let item = this.props.item;
    let { image, title, album } = item;

    let sliceTitle = title.length > 30;
    let sliceAlbum = album.length > 30;

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
                  {sliceTitle ? title.slice(0, 35) : title}
                </span>
                {title !== album && this.props.width >= 400 && (
                  <span className={resultStyle.album}>
                    {!sliceAlbum
                      ? ` - ${album}`
                      : ` - ${album.slice(0, 15)}...`}
                  </span>
                )}
              </p>
            </div>
          </div>
        </a>
      </>
    );
  }
}

export default Items;
