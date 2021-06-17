import styles from "../styles/Home.module.css";

import { Default } from "../components/Default";

import { paths } from "../src/config";

export default function Home() {
  return (
    <>
      <Default footer={false}>
        <div className={styles.grid}>
          <a href={paths.create} className={styles.card}>
            <h3 style={{ textAlign: "center" }}>Créer un salon</h3>
            <img
              style={{
                width: "min(346px, 100%)",
                minWidth: "200px",
                alignSelf: "center",
              }}
              src="/spotify-toggle.png"
            ></img>
          </a>

          <a href={paths.join} className={styles.card}>
            <h3 style={{ textAlign: "center" }}>Rejoindre un salon</h3>
            <div>
              <p>Rentrer le code ou utilser le code QR</p>
            </div>
          </a>
        </div>
      </Default>
    </>
  );
}
