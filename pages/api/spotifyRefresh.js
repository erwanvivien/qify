import { spotifyRefresh } from "../../src/spotifyApi";

export default async function handler(req, res) {
  let { refresh_token } = req.body;

  if (refresh_token === undefined)
    return res
      .status(400)
      .json({ error: "Request does not contain the right fields" });
  if (req.method !== "POST")
    return res.status(400).json({ error: "Can not handle non-POST request" });

  return await spotifyRefresh(refresh_token, res);
}
