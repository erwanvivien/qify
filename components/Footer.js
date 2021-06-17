import styles from "../styles/Home.module.css";

import { paths } from "../src/config";
import { Component } from "react";

export class Footer extends Component {
  render() {
    return (
      <>
        <footer className={styles.footer}>
          <a href={paths.root}>Retour au menu</a>
        </footer>
      </>
    );
  }
}
