import { Router } from "express";
import { spotifyConfigured, loginUrl, checkState, exchangeCode, refreshUserToken } from "../lib/spotify.js";

const router = Router();
const clientUrl = () => process.env.CLIENT_URL || "http://localhost:3000";

// Browser is sent here by the "Connect Spotify" button -> we forward it to Spotify's login page.
router.get("/login", (req, res) => {
	if (!spotifyConfigured()) return res.status(500).send("Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in backened/.env, then restart.");
	res.redirect(loginUrl());
});

// Spotify sends the browser back here after login. We swap the code for tokens and
// hand them to the website in the URL #fragment (a fragment is never sent to any server).
router.get("/callback", async (req, res) => {
	const { code, state, error } = req.query;
	const back = (hash) => res.redirect(`${clientUrl()}/spotify-callback#${new URLSearchParams(hash)}`);
	if (error) return back({ error: String(error) });
	if (!code || !checkState(String(state))) return back({ error: "invalid_state" });
	try {
		const t = await exchangeCode(String(code));
		back({ access_token: t.access_token, refresh_token: t.refresh_token, expires_in: String(t.expires_in) });
	} catch (e) {
		back({ error: e.message });
	}
});

// The website asks for a fresh access token (they last 1 hour).
router.post("/refresh", async (req, res) => {
	try {
		const { refresh_token } = req.body || {};
		if (!refresh_token) return res.status(400).json({ message: "refresh_token required" });
		const t = await refreshUserToken(refresh_token);
		res.json({ access_token: t.access_token, refresh_token: t.refresh_token || refresh_token, expires_in: t.expires_in });
	} catch (e) {
		res.status(401).json({ message: e.message });
	}
});

export default router;
