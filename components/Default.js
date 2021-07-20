import styles from "../styles/Home.module.css";

import { Header } from "./Header";
import { Title } from "./Title";

import { Footer } from "./Footer";
import { Component } from "react";

export class Default extends Component {
  render() {
    const props = this.props;

    const displayHeader = typeof props.header === "undefined" || props.header;
    const displayTitle = typeof props.title === "undefined" || props.title;
    const displayFooter = typeof props.footer === "undefined" || props.footer;

    const moreStyles = props.styles || {};
    const moreClassnames = props.classname || "";

    return (
      <>
        <div className={styles.container}>
          {displayHeader && <Header />}

          <main
            className={`${styles.main} ${moreClassnames}`}
            style={moreStyles}
          >
            {displayTitle && <Title />}
            {props.children}
          </main>

          {displayFooter && <Footer />}
        </div>
      </>
    );
  }
}
