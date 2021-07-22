import styles from "../styles/Home.module.css";

import { paths } from "../src/config";
import { Component } from "react";

import Link from "next/link";

export class Footer extends Component {
  render() {
    return (
      <>
        <footer className={styles.footer}>
          <Link href={paths.root}>
            <a>Retour au menu</a>
          </Link>
        </footer>
      </>
    );
  }
}
