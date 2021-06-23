import { spotifySearch } from "../../src/spotifyApi";

export default async function handler(req, res) {
  let { access_token, query, country } = req.query;

  if ([access_token, query, country].indexOf(undefined) != -1)
    /// If one is undefined
    return res.status(400).json({
      error: "Request does not contain the right fields\n",
    });
  if (req.method !== "GET")
    return res.status(400).json({ error: "Can not handle non-GET request" });

  return await spotifySearch(access_token, query, country, res);
}
