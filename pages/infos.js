import { Component } from "react";
import { Default } from "../components/Default";
import Title from "../components/Title";
import { paths } from "../src/config";

import styles from "../styles/Home.module.css";
import style_infos from "../styles/Infos.module.css";

class About extends Component {
  render() {
    return (
      <Default title={false}>
        <Title />
        <div className={style_infos.links}>
          <ul className={style_infos.check_list}>
            <li>
              <a href="#how_to_use">Comment utiliser Qify ?</a>
              <ul>
                <li>
                  <a href="#how_to_use_apple">Apple</a>
                </li>
                <li>
                  <a href="#how_to_use_android">Android</a>
                </li>
                <li>
                  <a href="#how_to_use_windows">Windows</a>
                </li>
                <li>
                  <a href="#how_to_use_television">Télévision</a>
                </li>
              </ul>
            </li>
            <li>
              <a href="#who">Qui est à l&apos;origine de Qify ?</a>
            </li>
            <li>
              <a href="#who_to_contact">Qui contacter en cas de problème ?</a>
            </li>
            <li>
              <a href="#error_report">Où faire remonter les bugs ?</a>
            </li>
          </ul>
        </div>

        <div style={{ maxWidth: "550px", textAlign: "justify" }}>
          <h2 id="how_to_use" className={style_infos.h2_decorator}>
            Comment utiliser Qify ?
          </h2>
          <p>
            Qify est un logiciel complètement gratuit d&apos;usage. Qify utilise
            votre compte Spotify en ajoutant des musiques dans la file
            d&apos;attente. Cela permet à tout le monde de pouvoir participer
            tout en s&apos;assurant que personne n&apos;ai accès à votre compte
            Spotify ou votre appareil
          </p>
          <p>
            <b>Rejoindre un salon</b>:
            <br />- Scanner le QR code, disponible sur la page de l&apos;admin
            <br />- Utiliser le lien que l&apos;admin peut fournir en cliquant
            sur le QR code
            <br />- Cliquer sur le{" "}
            <a className={style_infos.links} href={paths.join}>
              bouton rejoindre
            </a>{" "}
            sur la page d&apos;accueil et de rentrer le code du salon
          </p>
          <p>
            <b>Créer un salon / Déjà admin d&apos;un salon</b>
            <br />- Cliquer sur le{" "}
            <a className={style_infos.links} href={paths.create}>
              bouton créer
            </a>{" "}
            sur la page d&apos;accueil et de se connecter à Spotify. Tout le
            reste de la procédure est fait automatiquement.
          </p>
          <p>
            <b>Ajouter des musiques</b>
            <br />- Tapper dans la barre de recherche la musique désirée et
            cliquer dessus
          </p>

          <div style={{ paddingLeft: "1em" }}>
            <h3 id="how_to_use_apple">
              <u>Apple</u>
            </h3>
            <p>
              Pour le moment il n&apos;y a pas de moyen pour un appareil Apple
              d&apos;utiliser Qify en tant qu&apos;admin d&apos;un salon.
              <br />
              Cependant, il est possible de télécharger l&apos;application en
              allant dans les paramètres de la page et en cliquant sur Ajouter à
              la page d&apos;accueil
            </p>

            <h3 id="how_to_use_android">
              <u>Android</u>
            </h3>
            <p>
              Télécharger l&apos;application directement sur le playstore ou de
              rajouter l&apos;application à votre écran d&apos;accueil grâce au
              bouton sur la page d&apos;accueil.
            </p>

            <h3 id="how_to_use_windows">
              <u>Windows</u>
            </h3>
            <p>
              Télécharger l&apos;application grâce au bouton sur la page
              d&apos;accueil
            </p>

            <h3 id="how_to_use_television">
              <u>Télévision</u>
            </h3>
            <p>
              Pour le moment, il n&apos;y a pas de moyen pour un appareil télé
            </p>
          </div>

          <h2 id="who" className={style_infos.h2_decorator}>
            Qui est à l&apos;origine de Qify ?
          </h2>
          <p>
            Mon nom est <b>Erwan VIVIEN</b>, je suis un developpeur Français de{" "}
            {Math.floor(
              (Date.now() - new Date("2000-09-14").getTime()) /
                (1000 * 60 * 60 * 24 * 365.25)
            )}{" "}
            ans, à l&apos;origine de l&apos;idée et de la réalisation du projet.
            Vous pouvez me contacter sur différents médias (accessibles sur la{" "}
            <a className={style_infos.links} href={paths.contact}>
              page contact
            </a>
            ).
          </p>

          <h2 id="who_to_contact" className={style_infos.h2_decorator}>
            Qui contacter en cas de problème ?
          </h2>
          <p>
            Erwan VIVIEN est la personne a contacter, ses infos sont accessibles
            sur la{" "}
            <a className={style_infos.links} href={paths.contact}>
              page contact
            </a>
            .
          </p>

          <h2 id="error_report" className={style_infos.h2_decorator}>
            Où faire remonter les bugs ?
          </h2>
          <p>
            Tout d&apos;abord merci, venir reporter un bug est un immense
            privilège. Si vous avez quelconque idée de la manière pour le
            reproduire (appuyer rapidement sur un bouton, mettre 3 musiques
            d&apos;un coup avec des amis, etc...) je serai ravi d&apos;essayer
            de reproduire ce bug et donc de le corriger ensuite.
            <br />
            Vous pouvez donc faire remonter les bugs sur cette page :{" "}
            <a
              className={style_infos.links}
              href="https://github.com/erwanvivien/qify/issues/new/choose"
            >
              Faire remonter les bugs
            </a>
            .
          </p>
        </div>
      </Default>
    );
  }
}

export default About;
