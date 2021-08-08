import Head from "next/head";
import { title, updateTheme, colors } from "../src/config";
import "../styles/globals.css";

import styles from "../styles/Home.module.css";

import * as ga from "../lib/ga";
import { useRouter } from "next/dist/client/router";
import { useEffect, useState } from "react";
import Image from "next/image";

function changeTheme() {
  const colorKey = `${title}-theme`;
  let color = localStorage.getItem(colorKey);
  let idx = colors.indexOf(color);
  let newIdx = (idx + 1) % colors.length;

  localStorage.setItem(colorKey, colors[newIdx]);
  return updateTheme();
}

const MyApp = ({ Component, pageProps }) => {
  const router = useRouter();

  const [icon, setIcon] = useState("/theme/moon.svg");

  useEffect(() => {
    let newIcon = updateTheme();
    setIcon(newIcon);
  }, []);

  useEffect(() => {
    const handleRouteChange = (url) => {
      ga.pageview(url);
    };
    // When the component is mounted, subscribe to router changes
    // and log those page views
    router.events.on("routeChangeComplete", handleRouteChange);

    // If the component is unmounted, unsubscribe
    // from the event with the `off` method
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]);

  return (
    <>
      <Head>
        <title>{title} - La musique en commun</title>
        <meta
          name="description"
          content="Le site qui gère les files d'attente partagées sur Spotify."
        />
      </Head>
      <div
        className={`${styles.colorToggle} ${styles.code}`}
        style={{ width: "48px", padding: "8px" }}
        onClick={() => {
          let newIcon = changeTheme();
          setIcon(newIcon);
        }}
      >
        <Image
          src={icon}
          width={48}
          height={48}
          layout="responsive"
          alt={"Button to switch themes"}
        ></Image>
      </div>

      <Component {...pageProps} />
    </>
  );
};

export default MyApp;
