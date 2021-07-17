import { Component } from "react";
import styles from "../styles/Home.module.css";

import { title } from "../src/config";

export class Title extends Component {
  render() {
    const props = this.props;

    let h1Content = props.title || title;
    let description =
      props.description || "Une solution simple à beaucoup de problèmes.";

    return (
      <>
        <h1 className={styles.title}>{h1Content}</h1>
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
