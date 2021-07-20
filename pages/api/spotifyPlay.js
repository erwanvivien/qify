import { spotifyPlay } from "../../src/spotifyApi";

export default async function handler(req, res) {
  let { access_token, uri, device_id } = req.body;

  if (
    [access_token, uri, device_id].filter((e) => typeof e === "undefined")
      .length > 0
  )
    // If one is undefined
    return res
      .status(400)
      .json({ error: "Request does not contain the right fields" });
  if (req.method !== "PUT")
    return res.status(400).json({ error: "Can not handle non-PUT request" });

  return await spotifyPlay(access_token, uri, device_id, res);
}
