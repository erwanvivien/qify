const { create_url } = require("./spotifyApi");

function trimSongs(s) {
  return s.replace(/\s+\([^\)]*\)/i, "").replace(/\s+\-.*/, "");
}

const maxPathLength = 5;

const paths = {
  root: "/",
  about: "/about",
  create: create_url,
  join: "/join",
  contact: "/contact",
};

const websiteTitle = "Qify";

const navbar = [
  { title: websiteTitle, path: paths.root },
  { title: "Infos", path: paths.about },
  { title: "Contact", path: paths.contact },
];

module.exports = {
  maxPathLength,
  navbar,
  paths,
  title: websiteTitle,
  trimSongs,
};
