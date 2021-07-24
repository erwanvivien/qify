import Head from "next/head";
import { title } from "../src/config";
import "../styles/globals.css";

const MyApp = ({ Component, pageProps }) => {
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
