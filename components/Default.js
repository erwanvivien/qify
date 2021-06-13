import Head from "next/head";
import styles from "../styles/Home.module.css";

import { Header } from "./Header";
import { Title } from "./Title";

import { Footer } from "./Footer";
import { Component } from "react";
import config from "../src/config";

export class Default extends Component {
  render() {
    const props = this.props;

    const displayHeader = props.header === undefined || props.header;
    const displayTitle = props.title === undefined || props.title;
    const displayFooter = props.footer === undefined || props.footer;

    const name = props.name || config.title;

    const more_styles = props.styles || {};
    const more_classnames = props.classname || "";

    return (
      <>
        <div className={styles.container}>
          <Head>
            <title>{name}</title>
            <link rel="icon" href="/partify/partify.svg" />
          </Head>

          {displayHeader && <Header />}

          <main
            className={`${styles.main} ${more_classnames}`}
            style={more_styles}
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
