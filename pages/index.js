import styles from "../styles/Home.module.css";

import { Default } from "../components/Default";

import { paths } from "../src/config";

import spotifyToggle from "../public/spotify-toggle.png";
import Image from "next/image";
import { Component } from "react";

class Home extends Component {
  state = { canInstall: false };

  componentDidMount() {
    let promptEvent;

    function presentAddToHome() {
      promptEvent.prompt(); // Wait for the user to respond to the prompt
      promptEvent.userChoice.then((choice) => {
        if (choice.outcome === "accepted") {
          //   console.log("User accepted");
        } else {
          //   console.log("User dismissed");
        }
      });
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

    // present install prompt to user
  }

  render() {
    return (
      <>
        <Default footer={false}>
          <div className={styles.grid}>
            <a href={paths.create} className={styles.card}>
              <h2 style={{ textAlign: "center", margin: "0" }}>
                Créer un salon<br></br>Rejoindre en admin
              </h2>

              <Image
                src={spotifyToggle}
                alt="Spotify toggle to show that you're using your spotify account"
              />
            </a>

            <a href={paths.join} className={styles.card}>
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

            {this.state.canInstall && (
              <a href="#" className={`${styles.card} add-button`}>
                <h2
                  style={{
                    textAlign: "center",
                    margin: "0",
                  }}
                >
                  Installer
                </h2>
              </a>
            )}
          </div>
        </Default>
      </>
    );
  }
}

export default Home;
