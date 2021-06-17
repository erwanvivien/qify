import axios from "axios";
import qs from "querystring";

import {
  redirectUri,
  clientId,
  clientSecret,
  authTokenEndpoint,
} from "../../src/config";

export default async function handler(req, res) {
  let { code } = req.body;

  if (code === undefined)
    return res
      .status(400)
      .json({ error: "Request does not contain the right fields" });
  if (req.method !== "POST")
    return res.status(400).json({ error: "Can not handle non-POST request" });

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
