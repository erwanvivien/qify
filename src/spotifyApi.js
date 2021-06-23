const qs = require("querystring");
const { default: axios } = require("axios");
const {
  redirectUri,
  clientId,
  clientSecret,
  authTokenEndpoint,
  endpoints,
} = require("./config");

const { CLIENT_ID, CLIENT_SECRET } = require("../next.config").env;
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
  instance.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
  let response = await instance.get(endpoints.search(query, country), {});
  if (!response)
    return res.status(400).json({ error: "Could not use the access token" });

  return res.status(200).json(response.data);
}

async function spotifyQueue(access_token, uri, res) {
  instance.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
  let response = await instance.post(endpoints.queue(uri), {});

  let responseData = !response
    ? { error: "Could not use the access token" }
    : response.data;
  let responseStatus = !response ? 400 : 200;

  return res !== null
    ? res.status(responseStatus).json(responseData)
    : responseData;
}

async function spotifyTransfer(access_token, device_id, res) {
  instance.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
  let data_params = {
    device_ids: [device_id],
  };

  console.log(qs.stringify(data_params));
  let response = await instance.put(
    endpoints.transfer(),
    qs.stringify(data_params)
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
};
