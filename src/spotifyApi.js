import axios from "axios";
import qs from "querystring";

import {
  redirectUri,
  clientId,
  clientSecret,
  authTokenEndpoint,
  endpoints,
} from "./config";

const instance = axios.create(); /// Hack because axios removes Authorization header

async function spotifyAuth(code, res) {
  let data_params = {
    grant_type: "authorization_code",
    code: code,
    redirect_uri: redirectUri,
    client_id: clientId,
    client_secret: clientSecret,
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
  instance.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;

  let response = await instance.get(endpoints.me(), {});
  if (!response)
    return res.status(400).json({ error: "Could not use the access token" });

  return res.status(200).json(response.data);
}

async function spotifyRefresh(refresh_token, res) {
  let data_params = {
    grant_type: "refresh_token",
    refresh_token,
  };
  instance.defaults.headers.common["Authorization"] = `Basic ${encodedClient}`;

  let response = await axios
    .post(authTokenEndpoint, qs.stringify(data_params), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
    .catch(() => {});

  console.log(response);
  if (!response) return res.status(400).json({ error: "Data is too old" });

  return res.status(200).json(response.data);
}

async function spotifySearch(access_token, query, country, res) {
  instance.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
  let response = await instance.get(endpoints.search(query, country), {});
  if (!response)
    return res.status(400).json({ error: "Could not use the access token" });

  return res.status(200).json(response.data);
}

export { spotifyAuth, spotifyMe, spotifyRefresh, spotifySearch };
