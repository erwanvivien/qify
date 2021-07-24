import { Component } from "react";
import styles from "../styles/Home.module.css";

import { title } from "../src/config";

import imageLogo from "../public/qify/qify.svg";
import Image from "next/image";

export class Title extends Component {
  render() {
    const props = this.props;

    let h1Content = props.title || title;
    let description =
      props.description || "Une solution simple à beaucoup de problèmes.";

    return (
      <>
        <div style={{ width: "30%" }}>
          <Image src={imageLogo} layout="responsive" alt="Qify's logo"></Image>
          <h1 className={styles.title}>{h1Content}</h1>
        </div>
        <p className={styles.description}>
          {description}
          <br />
          Qify vous permet de mettre en commun vos musiques en attente.
        </p>
      </>
    );
  }
}

export default Title;
