import { withRouter } from "next/router";
import { Component } from "react";
import { io } from "socket.io-client";
import { Default } from "../components/Default";
import { title } from "../src/config";

import styles from "../styles/Home.module.css";
import searchStyle from "../styles/Search.module.css";

const socket = io();

class About extends Component {
  pin;

  router;

  constructor(props) {
    super(props);
    this.pin = "";
    this.router = props.router;

    socket.on("RES_CHECK_ROOM", (room) => {
      if (room !== null)
        this.router.push({
          pathname: "/room/[roomID]",
          query: {
            roomID: this.pin,
          },
        });
    });
  }

  search = (e) => {
    if (e.key === "Enter" || e.keyCode === 13) {
      socket.emit("CHECK_ROOM", this.pin);
    }
  };

  update = (e) => {
    this.pin = e.target.value ? e.target.value.toUpperCase() : "";
  };

  render() {
    return (
      <Default title={false}>
        <h1 className={styles.title} style={{ marginBottom: "0.75em" }}>
          {title}
        </h1>
        <div
          className={searchStyle.form__group}
          style={{ width: "50%", marginBottom: "0.75em" }}
        >
          <input
            type="input"
            className={searchStyle.form__field}
            onChange={this.update}
            onKeyUp={this.search}
            id="search_box"
            name="name"
            required
          />
          <label className={searchStyle.form__label}>ID salon</label>
        </div>
        <p className={styles.description} style={{ marginBottom: "0" }}>
          Vous pouvez aussi scanner le QR code disponible
          <br />
          sur la page admin
        </p>
      </Default>
    );
  }
}

export default withRouter(About);
