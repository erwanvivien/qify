import styles from "../styles/Home.module.css";
import contact_style from "../styles/Contact.module.css";

import { Default } from "../components/Default";

const contact = [
  {
    imgPath: "/other/gmail.svg",
    alt: "Gmail svg icon (2020)",
    url: "mailto:vivien.erwan@gmail.com",
  },
  {
    imgPath: "/other/discord.svg",
    alt: "Discord svg icon (2020)",
    url: "https://discordapp.com/users/289145021922279425",
  },
  {
    imgPath: "/other/twitter.svg",
    alt: "Twitter svg icon (2020)",
    url:
      "https://twitter.com/messages/compose?recipient_id=1358769929571434498" +
      "&text=⚠%20MESSAGE%20PRE-GENERE%20⚠%0AExpliquez%20votre%20problème%20en-dessous%3A%0A",
  },
];

export default function Home() {
  return (
    <>
      <Default title={false}>
        <h2 style={{ paddingTop: "1em" }}>Tu as un problème ? 😶</h2>
        <p className={styles.description}>
          Envoie moi un message directement pour une réponse rapide
        </p>

        <div className={contact_style.grid}>
          {contact.map((item, index) => (
            <div className={contact_style.card} key={index}>
              <a href={item.url}>
                <img
                  alt={item.alt}
                  className={contact_style.img}
                  src={item.imgPath}
                />
              </a>
            </div>
          ))}
        </div>
      </Default>
    </>
  );
}

// https://twitter.com/messages/compose?recipient_id=1358769929571434498&text=Hello
