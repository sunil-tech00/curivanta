import { allowPost, checkPasscode } from "../_lib/http.js";

export default function handler(req, res) {
  if (!allowPost(req, res) || !checkPasscode(req, res)) return;
  res.status(200).json({ ok: true });
}
