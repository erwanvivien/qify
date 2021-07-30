import Document, { Html, Head, Main, NextScript } from "next/document";

const NEXT_PUBLIC_GOOGLE_ANALYTICS = "G-RS7KW9G4C5";

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
          <link
            rel="apple-touch-icon"
            href="/qify/icons/qify_1000.png"
            sizes="1000x1000"
          ></link>
          <meta name="apple-mobile-web-app-status-bar" content="#181818" />

          <meta name="theme-color" content="#181818" />

          <link rel="icon" href="/qify/qify.svg" />

          <meta property="og:title" content="Qify" />
          <meta property="og:description" content="La musique en commun 📯" />
          <meta
            property="og:image"
            content="https://qify.app/qify/icons/qify_1000.png"
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

          <script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${NEXT_PUBLIC_GOOGLE_ANALYTICS}`}
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${NEXT_PUBLIC_GOOGLE_ANALYTICS}', {
  page_path: window.location.pathname,
});
          `,
            }}
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
