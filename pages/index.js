import styles from "../styles/Home.module.css";

import { Default } from "../components/Default";

import { paths } from "../src/config";

import spotifyToggle from "../public/spotify-toggle.png";
import Image from "next/image";
import { Component } from "react";
import Link from "next/link";

class Home extends Component {
  state = { canInstall: false };

  componentDidMount() {
    let promptEvent;

    function presentAddToHome() {
      promptEvent.prompt(); // Wait for the user to respond to the prompt
      //   promptEvent.userChoice.then((choice) => {
      //     if (choice.outcome === "accepted") {
      //     } else {
      //     }
      //   });
    }

    // listen to install button clic
    function listenToUserAction() {
      const installBtn = document.querySelector(".add-button");
      installBtn.addEventListener("click", presentAddToHome);
    }
    // Capture event and defer
    window.addEventListener("beforeinstallprompt", (e) => {
      this.setState({ canInstall: true });
      e.preventDefault();
      promptEvent = e;
      listenToUserAction();
    });
  }

  render() {
    return (
      <>
        <Default footer={false}>
          <div className={styles.grid}>
            <Link href={paths.create}>
              <a className={styles.card}>
                <h2 style={{ textAlign: "center", margin: "0" }}>
                  Créer un salon<br></br>Rejoindre en admin
                </h2>

                <Image
                  src={spotifyToggle}
                  alt="Spotify toggle to show that you're using your spotify account"
                />
              </a>
            </Link>

            <Link href={paths.join}>
              <a className={styles.card}>
                <h2 style={{ textAlign: "center", margin: "0" }}>
                  Rejoindre un salon
                </h2>
                <div
                  style={{
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <p>Rentrer le code ou utiliser le code QR</p>
                </div>
              </a>
            </Link>

            {this.state.canInstall && (
              <div
                className={`${styles.card} add-button`}
                style={{ cursor: "pointer" }}
              >
                <h2
                  style={{
                    textAlign: "center",
                    margin: "0",
                  }}
                >
                  Installer
                </h2>
              </div>
            )}
          </div>
        </Default>
      </>
    );
  }
}

export default Home;
