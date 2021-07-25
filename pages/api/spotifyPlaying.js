import { spotifyPlaying } from "../../src/spotifyApi";

export default async function handler(req, res) {
  let { access_token } = req.query;

  if ([access_token].findIndex((e) => typeof e === "undefined") !== -1)
    return res.status(400).json({
      error: "Request does not contain the right fields",
    });
  if (req.method !== "GET")
    return res.status(400).json({ error: "Can not handle non-GET request" });

  return await spotifyPlaying(access_token, res);
}
