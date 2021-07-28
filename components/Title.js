import { Component } from "react";
import styles from "../styles/Home.module.css";

import { title } from "../src/config";

import imageLogo from "../public/qify/qify.svg";
import Image from "next/image";

export class Title extends Component {
  render() {
    const props = this.props;

    let h1Content = props.title || title;

    return (
      <>
        <div className={styles.title_container}>
          <Image src={imageLogo} layout="intrinsic" alt="Qify's logo"></Image>
          <h1 className={styles.title}>{h1Content}</h1>
        </div>
        <h3 className={styles.description} style={{ margin: "0" }}>
          Votre playlist collaborative
        </h3>
      </>
    );
  }
}

export default Title;
