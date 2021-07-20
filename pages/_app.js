import "../styles/globals.css";

const MyApp = ({ Component, pageProps }) => {
  return (
    <>
      <Head>
        <title>{title} - La musique en commun</title>
      </Head>
      <Component {...pageProps} />
    </>
  );
};

export default MyApp;
