// Tiny Spotify Web API helper (Client Credentials flow - no user login needed).
let cached = { token: null, expiresAt: 0 };

export const spotifyConfigured = () =>
	Boolean(process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET);

async function getToken() {
	if (cached.token && Date.now() < cached.expiresAt - 30_000) return cached.token;

	const basic = Buffer.from(
		`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
	).toString("base64");

	const res = await fetch("https://accounts.spotify.com/api/token", {
		method: "POST",
		headers: { Authorization: `Basic ${basic}`, "Content-Type": "application/x-www-form-urlencoded" },
		body: "grant_type=client_credentials",
	});
	if (!res.ok) throw new Error(`Spotify login failed (${res.status}). Check SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET.`);

	const data = await res.json();
	cached = { token: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
	return cached.token;
}

const normalize = (s = "") =>
	s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");

async function search(q) {
	const token = await getToken();
	// Spotify dev-mode apps allow at most 10 results per search.
	const url = `https://api.spotify.com/v1/search?type=track&limit=5&q=${encodeURIComponent(q)}`;
	const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
	if (res.status === 403) throw Object.assign(new Error("Spotify returned 403: the app owner's Spotify account needs Premium (dev-mode rule)."), { fatal: true });
	if (res.status === 429) {
		const err = new Error("Spotify rate limit reached (429). Try again in a minute.");
		err.retryAfter = Number(res.headers.get("retry-after")) || 30;
		throw err;
	}
	if (!res.ok) throw new Error(`Spotify search failed (${res.status}).`);
	return (await res.json()).tracks?.items ?? [];
}

// Returns { spotifyId, spotifyName, spotifyArtists, coverUrl, spotifyUrl } or null if Spotify has no match.
// Throws if Spotify itself could not be reached (so the caller does not cache a false "not found").
export async function findTrack(name, firstArtist) {
	const cleanName = name
		.replace(/\s*[(\[].*?[)\]]/g, "") // drop "(feat. X)", "(Remix)"
		.replace(/\s+-\s+.*$/, "") // drop " - Remix"
		.trim();
	const wanted = normalize(firstArtist);

	for (const q of [`track:${cleanName} artist:${firstArtist}`, `${cleanName} ${firstArtist}`]) {
		const items = await search(q);
		const hit = items.find((t) =>
			t.artists.some((a) => {
				const n = normalize(a.name);
				return n && wanted && (n.includes(wanted) || wanted.includes(n));
			})
		);
		if (hit) {
			return {
				spotifyId: hit.id,
				spotifyName: hit.name,
				spotifyArtists: hit.artists.map((a) => a.name).join(", "),
				coverUrl: hit.album?.images?.[1]?.url ?? hit.album?.images?.[0]?.url ?? null,
				durationMs: hit.duration_ms ?? null,
				spotifyUrl: hit.external_urls?.spotify ?? `https://open.spotify.com/track/${hit.id}`,
			};
		}
	}
	return null;
}

// ---------------------------------------------------------------------------
// "Connect Spotify" (Authorization Code flow). The listener logs in once so the
// browser can play full tracks through the Spotify Web Playback SDK (needs Premium).
// ---------------------------------------------------------------------------
import crypto from "crypto";

export const SPOTIFY_SCOPES = [
	"streaming",
	"user-read-email",
	"user-read-private",
	"user-read-playback-state",
	"user-modify-playback-state",
].join(" ");

// Spotify only allows http for 127.0.0.1 (not "localhost"), so the callback lives on 127.0.0.1.
export const redirectUri = () =>
	process.env.SPOTIFY_REDIRECT_URI || `http://127.0.0.1:${process.env.PORT || 5001}/api/spotify/callback`;

const hmac = (v) => crypto.createHmac("sha256", process.env.SPOTIFY_CLIENT_SECRET).update(v).digest("hex");

// Stateless "state" value: nonce.timestamp.signature (so no cookie is needed across localhost/127.0.0.1)
export const makeState = () => {
	const v = `${crypto.randomBytes(8).toString("hex")}.${Date.now()}`;
	return `${v}.${hmac(v)}`;
};
export const checkState = (state = "") => {
	const [nonce, ts, sig] = state.split(".");
	if (!nonce || !ts || !sig) return false;
	if (Date.now() - Number(ts) > 10 * 60_000) return false;
	const good = hmac(`${nonce}.${ts}`);
	return sig.length === good.length && crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(good));
};

export const loginUrl = () =>
	"https://accounts.spotify.com/authorize?" +
	new URLSearchParams({
		response_type: "code",
		client_id: process.env.SPOTIFY_CLIENT_ID,
		scope: SPOTIFY_SCOPES,
		redirect_uri: redirectUri(),
		state: makeState(),
	});

async function tokenRequest(params) {
	const basic = Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString("base64");
	const res = await fetch("https://accounts.spotify.com/api/token", {
		method: "POST",
		headers: { Authorization: `Basic ${basic}`, "Content-Type": "application/x-www-form-urlencoded" },
		body: new URLSearchParams(params),
	});
	const data = await res.json().catch(() => ({}));
	if (!res.ok) throw new Error(data.error_description || data.error || `Spotify token error (${res.status})`);
	return data; // { access_token, refresh_token?, expires_in }
}

export const exchangeCode = (code) =>
	tokenRequest({ grant_type: "authorization_code", code, redirect_uri: redirectUri() });

export const refreshUserToken = (refresh_token) =>
	tokenRequest({ grant_type: "refresh_token", refresh_token });
