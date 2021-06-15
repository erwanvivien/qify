import axios from "axios";

import { endpoints } from "../../src/config";

const instance = axios.create(); /// Hack because axios removes Authorization header

export default async function handler(req, res) {
  let { access_token, query } = req.headers;

  if (access_token === undefined || query === undefined)
    return res.status(400).json({
      error: "Request does not contain the right fields\n",
    });
  if (req.method !== "GET")
    return res.status(400).json({ error: "Can not handle non-GET request" });

  instance.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;

  let response = await instance.get(endpoints.search(query), {});
  if (!response)
    return res.status(400).json({ error: "Could not use the access token" });

  return res.status(200).json({
    data: response.data,
  });
}
