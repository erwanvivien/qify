import styles from "../styles/Home.module.css";
import headerStyle from "../styles/Header.module.css";

import { navbar } from "../src/config";
import { Component } from "react";

import Link from "next/link";

export class Header extends Component {
  render() {
    return (
      <>
        <header className={styles.header}>
          <nav className={headerStyle.navbar}>
            {/* To add more to the navbar change ./src/path.js */}
            {navbar.map((item, index) => (
              <Link href={item.path} key={`navbar-item-` + index}>
                <a className={styles.code}>{item.title}</a>
              </Link>
            ))}
          </nav>
        </header>
      </>
    );
  }
}
