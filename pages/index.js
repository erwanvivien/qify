import styles from "../styles/Home.module.css";

import { Default } from "../components/Default";

import { paths } from "../src/config";

export default function Home() {
  return (
    <>
      <Default footer={false}>
        <div className={styles.grid}>
          <a href={paths.create} className={styles.card}>
            <h3 style={{ textAlign: "center" }}>Create a room</h3>
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
            <h3 style={{ textAlign: "center" }}>Join a room</h3>
            <p>Enter the room number and join your group</p>
            <p>You can also ask the room QR code code</p>
          </a>
        </div>
      </Default>
    </>
  );
}
