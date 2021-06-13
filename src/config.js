const authEndpoint = "https://accounts.spotify.com/authorize";
const authTokenEndpoint = "https://accounts.spotify.com/api/token";

// Replace with your app's client ID, redirect URI and desired scopes
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const redirectUri = "http://localhost:8888/creating";

const scopes = [
  // Images
  //   "ugc-image-upload",
  // Listening History
  //   "user-read-recently-played",
  //   "user-top-read",
  //   "user-read-playback-position",
  // Spotify Connect
  "user-read-playback-state",
  "user-modify-playback-state",
  "user-read-currently-playing",
  // Playback
  //   "app-remote-control",
  //   "streaming",
  // Playlists
  "playlist-modify-public",
  //   "playlist-modify-private",
  //   "playlist-read-private",
  //   "playlist-read-collaborative",
  // Follow
  //   "user-follow-modify",
  //   "user-follow-read",
  // Library
  //   "user-library-modify",
  //   "user-library-read",
  // Users
  "user-read-email",
  "user-read-private",
];

var create_url = `${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join(
  "%20"
)}&response_type=code&show_dialog=false`;

const endpoints = {
  me: () => "https://api.spotify.com/v1/me",
  track: (id) => `https://api.spotify.com/v1/tracks/${id}`,
  tracks: (ids) => `https://api.spotify.com/v1/tracks?ids=${ids}&market=FR`,
  search: (query) => `https://api.spotify.com/v1/search?q=${query}&type=track`,
};

const maxPathLength = 16;

const paths = {
  root: "/",
  about: "/about",
  create: create_url,
  join: "/join",
  contact: "/contact",
};

const navbar = [
  { title: "Home", path: paths.root },
  { title: "About", path: paths.about },
  { title: "Contact", path: paths.contact },
];

export {
  authEndpoint,
  authTokenEndpoint,
  clientId,
  clientSecret,
  redirectUri,
  scopes,
  endpoints,
  maxPathLength,
  navbar,
  paths,
};

const config = {
  title: "Partify",
};

export default config;
