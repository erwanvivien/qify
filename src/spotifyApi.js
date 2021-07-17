const qs = require("querystring");
const { default: axios } = require("axios");

const dev = process.env.NODE_ENV !== "production";
const port = process.env.PORT || 8888;

const authEndpoint = "https://accounts.spotify.com/authorize";
const authTokenEndpoint = "https://accounts.spotify.com/api/token";

// Replace with your app's client ID, redirect URI and desired scopes
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const currentUrl = dev ? `http://localhost:${port}` : "https://qify.app";
const redirectUri = `${currentUrl}/creating`;

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
  "streaming",
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

const create_url = `${authEndpoint}?client_id=${CLIENT_ID}&redirect_uri=${redirectUri}&scope=${scopes.join(
  "%20"
)}&response_type=code&show_dialog=false`;

const endpoints = {
  me: () => "https://api.spotify.com/v1/me",
  track: (id) => `https://api.spotify.com/v1/tracks/${id}`,
  tracks: (ids) => `https://api.spotify.com/v1/tracks?ids=${ids}&market=FR`,
  search: (query, country) => {
    query = query.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return `https://api.spotify.com/v1/search?q=${query}&type=track&limit=5&market=${country}`;
  },
  queue: (uri, deviceId) =>
    `https://api.spotify.com/v1/me/player/queue?uri=${uri}` +
    (deviceId ? `&device_id=${deviceId}` : ""),
  transfer: () => "https://api.spotify.com/v1/me/player",
};

const instance = axios.create(); // Hack because axios removes Authorization header

async function spotifyAuth(code, res) {
  let data_params = {
    grant_type: "authorization_code",
    code: code,
    redirect_uri: redirectUri,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  };

  let response = await axios
    .post(authTokenEndpoint, qs.stringify(data_params), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
    .catch(() => {});

  if (!response) return res.status(400).json({ error: "Data is too old" });

  return res.status(200).json(response.data);
}

async function spotifyMe(access_token, res) {
  instance.defaults.headers.common.Authorization = `Bearer ${access_token}`;

  let response = await instance.get(endpoints.me(), {});
  if (!response)
    return res.status(400).json({ error: "Could not use the access token" });

  return res.status(200).json(response.data);
}

async function spotifyRefresh(refresh_token, res) {
  let data_params = {
    grant_type: "refresh_token",
    refresh_token: refresh_token,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  };

  let response = await axios.post(
    authTokenEndpoint,
    qs.stringify(data_params),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  let responseData = !response ? { error: "Data is too old" } : response.data;
  let responseStatus = !response ? 400 : 200;

  return res !== null
    ? res.status(responseStatus).json(responseData)
    : responseData;
}

async function spotifySearch(access_token, query, country, res) {
  instance.defaults.headers.common.Authorization = `Bearer ${access_token}`;
  let response = await instance.get(endpoints.search(query, country), {});
  if (!response)
    return res.status(400).json({ error: "Could not use the access token" });

  return res.status(200).json(response.data);
}

async function spotifyQueue(access_token, uri, deviceId, res) {
  instance.defaults.headers.common.Authorization = `Bearer ${access_token}`;
  let response = await instance
    .post(endpoints.queue(uri, deviceId), {})
    .catch((...[]) => {});

  let responseData = !response
    ? { error: "Could not use the access token" }
    : response.data;
  let responseStatus = !response ? 400 : 200;

  return res !== null
    ? res.status(responseStatus).json(responseData)
    : responseData;
}

async function spotifyTransfer(access_token, device_id, res) {
  instance.defaults.headers.common.Authorization = `Bearer ${access_token}`;
  let data_params = {
    device_ids: [device_id],
  };

  let response = await instance.put(
    endpoints.transfer(),
    JSON.stringify(data_params)
  );

  let responseData = !response
    ? { error: "Could not use the access token" }
    : response.data;
  let responseStatus = !response ? 400 : 200;

  return res !== null
    ? res.status(responseStatus).json(responseData)
    : responseData;
}

module.exports = {
  spotifyAuth,
  spotifyMe,
  spotifyRefresh,
  spotifySearch,
  spotifyQueue,
  spotifyTransfer,
  currentUrl,
  create_url,
};
