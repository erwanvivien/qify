import styles from "../styles/Home.module.css";

import { Default } from "../components/Default";

import { paths } from "../src/config";

import spotifyToggle from "../public/spotify-toggle.png";
import Image from "next/image";

export default function Home() {
  return (
    <>
      <Default footer={false}>
        <div className={styles.grid}>
          <a href={paths.create} className={styles.card}>
            <h3 style={{ textAlign: "center" }}>
              Créer un salon<br></br>Rejoindre en admin
            </h3>

            <Image
              src={spotifyToggle}
              alt="Spotify toggle to show that you're using your spotify account"
            />
          </a>

          <a href={paths.join} className={styles.card}>
            <h3 style={{ textAlign: "center" }}>Rejoindre un salon</h3>
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
        </div>
      </Default>
    </>
  );
}
