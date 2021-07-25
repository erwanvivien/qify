import { spotifyTransfer } from "../../src/spotifyApi";

export default async function handler(req, res) {
  let { access_token, device_id } = req.body;

  if (
    [access_token, device_id].findIndex((e) => typeof e === "undefined") !== -1
  )
    // If one is undefined
    return res
      .status(400)
      .json({ error: "Request does not contain the right fields" });
  if (req.method !== "PUT")
    return res.status(400).json({ error: "Can not handle non-PUT request" });

  return await spotifyTransfer(access_token, device_id, res);
}
