import { spotifyMe } from "../../src/spotifyApi";

export default async function handler(req, res) {
  let { access_token } = req.query;

  if (access_token === undefined)
    return res.status(400).json({
      error: "Request does not contain the right fields\n",
    });
  if (req.method !== "GET")
    return res.status(400).json({ error: "Can not handle non-GET request" });

  return await spotifyMe(access_token, res);
}
