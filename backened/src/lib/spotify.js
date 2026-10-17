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
	if (res.status === 403) throw new Error("Spotify returned 403: the app owner's Spotify account needs Premium (dev-mode rule).");
	if (res.status === 429) throw new Error("Spotify rate limit reached (429). Try again in a minute.");
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
				spotifyUrl: hit.external_urls?.spotify ?? `https://open.spotify.com/track/${hit.id}`,
			};
		}
	}
	return null;
}
