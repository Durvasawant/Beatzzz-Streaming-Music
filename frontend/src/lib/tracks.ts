import type { Song } from "@/types";

// A song from the "tracks" collection (Spotify dataset), as sent by /api/tracks
export interface TrackResult {
	_id: string;
	title: string;
	artists: string;
	releasedYear?: number;
	streams?: number | null;
	coverUrl: string | null;
	spotifyId: string | null;
	spotifyUrl: string | null;
	durationMs?: number | null;
}

export const PLACEHOLDER_COVER =
	"data:image/svg+xml;utf8," +
	encodeURIComponent(
		`<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><rect width='300' height='300' fill='#27272a'/><text x='150' y='185' font-size='110' text-anchor='middle' fill='#52525b'>♪</text></svg>`
	);

// Turn a track into the same Song shape the rest of the app (queue, bottom player) uses.
export const trackToSong = (t: TrackResult): Song => ({
	_id: t._id,
	title: t.title,
	artist: t.artists,
	albumId: null,
	imageUrl: t.coverUrl || PLACEHOLDER_COVER,
	audioUrl: "",
	duration: t.durationMs ? Math.round(t.durationMs / 1000) : 0,
	createdAt: "",
	updatedAt: "",
	source: "spotify",
	spotifyId: t.spotifyId,
});
