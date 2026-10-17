import { Track } from "../models/track.model.js";
import { Song } from "../models/song.model.js";
import { findTrack, spotifyConfigured } from "../lib/spotify.js";

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Shape the website uses for every Spotify-dataset song
const toClient = (t) => ({
	_id: String(t._id),
	title: t.spotifyName || t.name,
	artists: t.spotifyArtists || t.artists,
	releasedYear: t.releasedYear,
	streams: t.streams,
	coverUrl: t.coverUrl || null,
	spotifyId: t.spotifyId || null,
	spotifyUrl: t.spotifyUrl || null,
	durationMs: t.durationMs || null,
});

// Ask Spotify about one track (once) and remember the answer in MongoDB.
async function enrich(t) {
	if (t.spotifyChecked) return;
	const found = await findTrack(t.name, t.firstArtist);
	if (found) Object.assign(t, found);
	t.spotifyChecked = true;
	await t.save();
}

// GET /api/tracks?page=1&limit=50  -> every imported song, most streamed first
export const listTracks = async (req, res, next) => {
	try {
		const page = Math.max(1, Number(req.query.page) || 1);
		const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
		const [tracks, total] = await Promise.all([
			Track.find().sort({ streams: -1, _id: 1 }).skip((page - 1) * limit).limit(limit),
			Track.countDocuments(),
		]);
		res.json({ tracks: tracks.map(toClient), total, page, pages: Math.ceil(total / limit) });
	} catch (error) {
		next(error);
	}
};

// GET /api/tracks/search?q=blinding  -> matches in the imported songs AND in your original songs
export const searchTracks = async (req, res, next) => {
	try {
		const q = String(req.query.q || "").trim();
		if (q.length < 2) return res.json({ tracks: [], songs: [], spotify: spotifyConfigured() });

		const rx = new RegExp(escapeRegExp(q), "i");
		const [tracks, songs] = await Promise.all([
			Track.find({ $or: [{ name: rx }, { artists: rx }] }).sort({ streams: -1 }).limit(10),
			Song.find({ $or: [{ title: rx }, { artist: rx }] }).limit(10),
		]);

		// look each new match up on Spotify (once) so it gets a cover and a playable id
		let spotifyError = null;
		if (spotifyConfigured()) {
			await Promise.all(
				tracks.map(async (t) => {
					if (t.spotifyChecked || spotifyError) return;
					try {
						await enrich(t);
					} catch (err) {
						spotifyError = err.message;
					}
				})
			);
			if (spotifyError) console.error("[spotify]", spotifyError);
		}

		res.json({
			tracks: tracks.map(toClient),
			songs,
			spotify: spotifyConfigured() && !spotifyError,
			spotifyError,
		});
	} catch (error) {
		next(error);
	}
};

// POST /api/tracks/:id/resolve  -> called when a song is played but not looked up yet
export const resolveTrack = async (req, res, next) => {
	try {
		const t = await Track.findById(req.params.id);
		if (!t) return res.status(404).json({ message: "Track not found" });
		if (!spotifyConfigured()) return res.status(503).json({ message: "Spotify keys are not set in backened/.env" });
		try {
			await enrich(t);
		} catch (err) {
			return res.status(502).json({ message: err.message });
		}
		res.json(toClient(t));
	} catch (error) {
		next(error);
	}
};
