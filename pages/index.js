import styles from "../styles/Home.module.css";

import { Default } from "../components/Default";

import { paths } from "../src/config";
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
              style={{
                width: "min(346px, 100%)",
                minWidth: "200px",
                alignSelf: "center",
              }}
              src="/spotify-toggle.png"
              alt="A spotify toggle image"
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
