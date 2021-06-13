import { Component } from "react";
import styles from "../styles/Home.module.css";

import config from "../src/config";

export class Title extends Component {
  render() {
    const props = this.props;

    let title = props.title || config.title;
    let description =
      props.description || "A simple solution to all your problems.";

    return (
      <>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.description}>{description}</p>
      </>
    );
  }
}

export default Title;
