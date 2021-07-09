// pages/404.js
import Error from "next/error";
import Head from "next/head";
import { Component } from "react";

import styles404 from "../styles/404.module.css";

class Custom404 extends Component {
  render() {
    // return <Error statusCode={404}></Error>;
    return (
      <>
        <Head>
          <title>Page non-existante</title>
          <link rel="icon" href="/partify/partify.svg" />
        </Head>

        <div className={styles404.container}>
          <div>
            <h1 className={styles404.error_code}>404</h1>
            <div className={styles404.error_status_container}>
              <h2 className={styles404.error_status}>
                La page n&apos;existe pas
              </h2>
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default Custom404;
