import Head from "next/head";
import { title } from "../src/config";
import "../styles/globals.css";

import * as ga from "../lib/ga";
import { useRouter } from "next/dist/client/router";
import { useEffect } from "react";

const MyApp = ({ Component, pageProps }) => {
  const router = useRouter();

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
      <Component {...pageProps} />
    </>
  );
};

export default MyApp;
