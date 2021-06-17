import { Component } from "react";
import styles from "../styles/Home.module.css";

import { title } from "../src/config";

const websiteTitle = title;

export class Title extends Component {
  render() {
    const props = this.props;

    let title = props.title || websiteTitle;
    let description =
      props.description || "Une solution simple à beaucoup de problèmes.";

    return (
      <>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.description}>{description}</p>
      </>
    );
  }
}

export default Title;
