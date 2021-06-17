import styles from "../styles/Home.module.css";

import { Default } from "../components/Default";

import axios from "axios";
// import qs from "querystring";

import { Component } from "react";
import { Router, withRouter } from "next/router";

import { io } from "socket.io-client";
let socket = io();

class App extends Component {
  code;
  state;
  router;

  constructor(props) {
    super(props);
    this.code = props.query["code"];
    this.router = props.router;

    this.state = {
      isLoaded: false,
      pin: null,
      error: null,
    };
  }

  getTitle() {
    let title = this.state.isLoaded
      ? "Merci d'avoir attendu"
      : "Veuillez patienter";

    if (this.state.error) {
      title = "Une erreur s'est produite";
    }

    return title;
  }

  getInfos() {
    let infos = this.state.isLoaded
      ? ["Vous allez être redirigé"]
      : ["Soyez patient"];

    if (this.state.error) {
      infos = [this.state.error, "Veuillez contacter l'administateur du site."];
    }

    return infos;
  }

  async componentDidMount() {
    this.router.replace("/creating", undefined, { shallow: true });

    let response = await axios.post("/api/spotifyAuth", { code: this.code });
    if (!response) {
      return this.setState({
        isLoaded: false,
        error: "Veuillez réessayer",
        pin: null,
      });
    }

    let spotifyCreds = response.data;

    let spotifyId = await axios.get("/api/spotifyMe", {
      params: {
        access_token: spotifyCreds.access_token,
      },
    });
    if (!spotifyId) {
      return this.setState({
        isLoaded: false,
        error: "Veuillez réessayer",
        pin: null,
      });
    }

    let adminId = spotifyId.data;

    socket.on("RES_CREATE_ROOM", ({ pin, adminPass }) => {
      this.router.push({
        pathname: "/room/[roomID]",
        query: {
          roomID: pin,
          pass: adminPass,
        },
      });
    });
    socket.emit("CREATE_ROOM", { adminId, spotifyCreds });
  }

  render() {
    return (
      <>
        <Default title={false}>
          <h1 className={styles.title}>{this.getTitle()}</h1>
          {this.getInfos().map((item, index) => (
            <p className={styles.description} key={index}>
              {item}
            </p>
          ))}
        </Default>
      </>
    );
  }
}

export async function getServerSideProps({ query }) {
  return {
    props: {
      query,
    }, // will be passed to the page component as props
  };
}

export default withRouter(App);
