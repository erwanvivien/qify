import styles from "../styles/Home.module.css";
import contact_style from "../styles/Contact.module.css";

import { Default } from "../components/Default";

import Image from "next/image";

// import imageIconGmail from "../public/other/gmail.svg";
// import imageIconDiscord from "../public/other/discord.svg";
// import imageIconTwitter from "../public/other/twitter.svg";
import { Component } from "react";
import Head from "next/head";

const contact = [];
// const contact = [
//   {
//     img: imageIconDiscord,
//     alt: "Discord svg icon (2020)",
//     url: "https://discordapp.com/users/289145021922279425",
//   },
//   {
//     img: imageIconTwitter,
//     alt: "Twitter svg icon (2020)",
//     url:
//       "https://twitter.com/messages/compose?recipient_id=1358769929571434498" +
//       "&text=⚠%20MESSAGE%20PRE-GENERE%20⚠%0AExpliquez%20votre%20problème%20en-dessous%3A%0A",
//   },
//   {
//     img: imageIconGmail,
//     alt: "Gmail svg icon (2020)",
//     url: "mailto:vivien.erwan@gmail.com",
//   },
// ];

class Contact extends Component {
  render() {
    return (
      <>
        <Head>
          <meta
            property="og:description"
            content="La musique en commun 📯 - Comment contacter le developpeur du site ?"
          />
        </Head>
        <Default title={false}>
          <h1 style={{ textAlign: "center", fontSize: "min(12vw, 3.2rem);" }}>
            Tu as un problème ? 😶
          </h1>
          <p className={styles.description} style={{ marginTop: "0" }}>
            Envoie moi un message directement pour une réponse rapide
            <br />
            Discord / Twitter seront les deux meilleurs moyens de communication
          </p>

          <div className={contact_style.grid}>
            {contact.map((item, index) => (
              <div className={contact_style.card} key={index}>
                <a href={item.url}>
                  <Image
                    alt={item.alt}
                    src={item.img}
                    quality={100}
                    height={128}
                    width={128}
                    layout="responsive"
                    objectFit="contain"
                  />
                </a>
              </div>
            ))}
          </div>
        </Default>
      </>
    );
  }
}

export default Contact;
