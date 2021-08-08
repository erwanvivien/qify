const authEndpoint = "https://accounts.spotify.com/authorize";

const dev = process.env.NODE_ENV !== "production";
const port = process.env.PORT || 8888;
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
  let newS = s.replace(/\s+\([^\)]*\)/i, "").replace(/\s+\-.*/, "");
  return newS;
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

const colors = ["dark", "light"];
function updateTheme() {
  const themeChoiceKey = `${websiteTitle}-theme`;
  let themeChoice = localStorage.getItem(themeChoiceKey);

  let root = document.documentElement;
  if (!root) return;

  if (themeChoice === "dark") {
    root.style.setProperty("--colorText", "#efefef");
    root.style.setProperty("--colorBackground", "#1e1e1e");
    root.style.setProperty("--colorBackgroundCode", "#111619");
    root.style.setProperty("--colorBackgroundPlayer", "#3a3d4e");
  } else if (themeChoice === "light") {
    root.style.setProperty("--colorText", "");
    root.style.setProperty("--colorBackground", "");
    root.style.setProperty("--colorBackgroundCode", "");
    root.style.setProperty("--colorBackgroundPlayer", "");
  } else {
    return "/theme/moon.svg";
  }

  return themeChoice === "dark" ? "/theme/sun.svg" : "/theme/moon.svg";
}

module.exports = {
  maxPathLength,
  navbar,
  paths,
  title: websiteTitle,
  trimSongs,
  currentUrl,
  updateTheme,
  colors,
};
