const authEndpoint = "https://accounts.spotify.com/authorize";

const dev = process.env.NODE_ENV !== "production";
const currentUrl = dev ? `http://localhost:${port}` : "https://qify.app";
const redirectUri = `${currentUrl}/creating`;
const scopes = [
  "user-read-playback-state",
  "user-modify-playback-state",
  "user-read-currently-playing",
  "streaming",
  "playlist-modify-public",
  "user-read-email",
  "user-read-private",
];

const CLIENT_ID = "51a53fa310ec4fd99951b1c964a91a10";

const create_url = `${authEndpoint}?client_id=${CLIENT_ID}&redirect_uri=${redirectUri}&scope=${scopes.join(
  "%20"
)}&response_type=code&show_dialog=false`;

function trimSongs(s) {
  return s.replace(/\s+\([^\)]*\)/i, "").replace(/\s+\-.*/, "");
}

const maxPathLength = 5;

const paths = {
  root: "/",
  infos: "/infos",
  create: create_url,
  join: "/join",
  contact: "/contact",
};

const websiteTitle = "Qify";

const navbar = [
  { title: websiteTitle, path: paths.root },
  { title: "Infos", path: paths.infos },
  { title: "Contact", path: paths.contact },
];

module.exports = {
  maxPathLength,
  navbar,
  paths,
  title: websiteTitle,
  trimSongs,
};
