import Document, { Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html lang="fr">
        <Head>
          <link rel="manifest" href="/manifest.json" />
          <link rel="apple-touch-icon" href="/icon.png"></link>
          <meta name="apple-mobile-web-app-status-bar" content="#181818" />

          <meta name="theme-color" content="#181818" />

          <link rel="icon" href="/qify/qify.svg" />

          <meta property="og:title" content="Qify" />
          <meta property="og:description" content="La musique en commun 📯" />
          <meta property="og:image" content="https://qify.app/qify/qify.svg" />
          <meta
            property="og:image:secure_url"
            content="https://qify.app/qify/qify.svg"
          />
          <meta
            property="og:image:alt"
            content="Logo de Qify, la musique en commun 📯"
          />
          <meta property="og:type" content="music" />

          <meta
            name="description"
            content="Le site qui gère les files d'attente partagées sur Spotify."
          />
          <meta name="author" content="Erwan VIVIEN (github: erwan_vivien)" />
          <meta
            name="keywords"
            content="Spotify, Queue, File d'attente, Musique, Song, Songs, Song queue"
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
