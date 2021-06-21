import styles from "../styles/Home.module.css";
import header_style from "../styles/Header.module.css";

import Link from "next/link";

import { navbar } from "../src/config";
import { Component } from "react";

export class Header extends Component {
  render() {
    return (
      <>
        <header className={styles.header}>
          <nav
            className={header_style.navbar}
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {/* To add more to the navbar change ./src/path.js */}
            {navbar.map((item, index) => (
              <Link
                href={item.path}
                key={`navbar-item-` + index}
                className={`${header_style.items} ${styles.code}`}
              >
                <a className={`${header_style.items} ${styles.code}`}>
                  {item.title}
                </a>
              </Link>
            ))}
          </nav>
        </header>
      </>
    );
  }
}
