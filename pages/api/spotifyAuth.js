import { spotifyAuth } from "../../src/spotifyApi";

export default async function handler(req, res) {
  let { code } = req.body;

  if ([code].filter((e) => e === undefined).length > 0)
    return res
      .status(400)
      .json({ error: "Request does not contain the right fields" });
  if (req.method !== "POST")
    return res.status(400).json({ error: "Can not handle non-POST request" });

  return await spotifyAuth(code, res);
}
